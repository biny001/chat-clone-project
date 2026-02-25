import { NextRequest, NextResponse } from "next/server";
import * as Ably from "ably";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import type { AblyNewMessageEvent, AblyConversationUpdateEvent } from "@/types/api";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatSessionId, content } = await request.json();
  const senderId = session.user.id;

  if (!chatSessionId || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify user is a participant
  const chatSession = await prisma.chatSession.findFirst({
    where: {
      id: chatSessionId,
      OR: [{ user1Id: senderId }, { user2Id: senderId }],
    },
  });

  if (!chatSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Persist message and update ChatSession timestamp
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { chatSessionId, senderId, content: content.trim() },
    }),
    prisma.chatSession.update({
      where: { id: chatSessionId },
      data: { updatedAt: new Date() },
    }),
  ]);

  // Publish to Ably
  const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY! });

  const newMessageEvent: AblyNewMessageEvent = {
    id: message.id,
    chatSessionId: message.chatSessionId,
    senderId: message.senderId,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };

  const conversationUpdateEvent: AblyConversationUpdateEvent = {
    chatSessionId: message.chatSessionId,
    lastMessage: {
      content: message.content,
      createdAt: message.createdAt.toISOString(),
      senderId: message.senderId,
    },
  };

  const otherUserId =
    chatSession.user1Id === senderId
      ? chatSession.user2Id
      : chatSession.user1Id;

  // Publish to chat channel and both users' personal channels
  await Promise.all([
    ably.channels.get(`chat:${chatSessionId}`).publish("new-message", newMessageEvent),
    ably.channels.get(`user:${otherUserId}`).publish("conversation-update", conversationUpdateEvent),
    ably.channels.get(`user:${senderId}`).publish("conversation-update", conversationUpdateEvent),
  ]);

  return NextResponse.json({
    message: {
      id: message.id,
      chatSessionId: message.chatSessionId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    },
  });
}
