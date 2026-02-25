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

  const { chatSessionId, content, type, fileUrl, fileName, fileSize } = await request.json();
  const senderId = session.user.id;

  // For text messages, content is required. For file/image, fileUrl is required.
  const msgType = type || "text";
  if (!chatSessionId) {
    return NextResponse.json({ error: "Missing chatSessionId" }, { status: 400 });
  }
  if (msgType === "text" && !content?.trim()) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }
  if ((msgType === "image" || msgType === "file") && !fileUrl) {
    return NextResponse.json({ error: "Missing fileUrl" }, { status: 400 });
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
      data: {
        chatSessionId,
        senderId,
        content: content?.trim() || "",
        type: msgType,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
      },
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
    type: message.type,
    fileUrl: message.fileUrl,
    fileName: message.fileName,
    fileSize: message.fileSize,
    createdAt: message.createdAt.toISOString(),
  };

  const displayContent =
    msgType === "image" ? "Sent an image" : msgType === "file" ? `Sent a file: ${fileName || "file"}` : message.content;

  const conversationUpdateEvent: AblyConversationUpdateEvent = {
    chatSessionId: message.chatSessionId,
    lastMessage: {
      content: displayContent,
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
      type: message.type,
      fileUrl: message.fileUrl,
      fileName: message.fileName,
      fileSize: message.fileSize,
      editedAt: null,
      createdAt: message.createdAt.toISOString(),
    },
  });
}
