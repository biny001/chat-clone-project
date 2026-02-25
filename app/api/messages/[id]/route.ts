import { NextRequest, NextResponse } from "next/server";
import * as Ably from "ably";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import type { AblyMessageEditedEvent } from "@/types/api";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: messageId } = await params;
  const { content } = await request.json();

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  // Find message and verify sender
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  if (message.senderId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Update message
  const updatedMessage = await prisma.message.update({
    where: { id: messageId },
    data: {
      content: content.trim(),
      editedAt: new Date(),
    },
  });

  // Publish edit event to Ably
  const ably = new Ably.Rest({ key: process.env.ABLY_API_KEY! });
  const editEvent: AblyMessageEditedEvent = {
    id: updatedMessage.id,
    chatSessionId: updatedMessage.chatSessionId,
    content: updatedMessage.content,
    editedAt: updatedMessage.editedAt!.toISOString(),
  };

  await ably.channels
    .get(`chat:${updatedMessage.chatSessionId}`)
    .publish("message-edited", editEvent);

  return NextResponse.json({
    message: {
      id: updatedMessage.id,
      chatSessionId: updatedMessage.chatSessionId,
      senderId: updatedMessage.senderId,
      content: updatedMessage.content,
      type: updatedMessage.type,
      fileUrl: updatedMessage.fileUrl,
      fileName: updatedMessage.fileName,
      fileSize: updatedMessage.fileSize,
      editedAt: updatedMessage.editedAt?.toISOString() ?? null,
      createdAt: updatedMessage.createdAt.toISOString(),
    },
  });
}
