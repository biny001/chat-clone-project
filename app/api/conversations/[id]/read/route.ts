import { NextRequest, NextResponse } from "next/server";
import * as Ably from "ably";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import type { AblyMessageReadEvent } from "@/types/api";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: chatSessionId } = await params;
  const userId = session.user.id;

  // Verify user is a participant
  const chatSession = await prisma.chatSession.findFirst({
    where: {
      id: chatSessionId,
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
  });

  if (!chatSession) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date();

  // Update the appropriate lastReadAt field
  const isUser1 = chatSession.user1Id === userId;
  await prisma.chatSession.update({
    where: { id: chatSessionId },
    data: isUser1
      ? { user1LastReadAt: now }
      : { user2LastReadAt: now },
  });

  // Publish read receipt to Ably
  const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY! });
  const readEvent: AblyMessageReadEvent = {
    chatSessionId,
    userId,
    readAt: now.toISOString(),
  };

  const otherUserId = isUser1 ? chatSession.user2Id : chatSession.user1Id;

  await Promise.all([
    ably.channels.get(`chat:${chatSessionId}`).publish("message-read", readEvent),
    ably.channels.get(`user:${otherUserId}`).publish("message-read", readEvent),
  ]);

  return NextResponse.json({ success: true });
}
