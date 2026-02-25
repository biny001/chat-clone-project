import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(
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

  const messages = await prisma.message.findMany({
    where: { chatSessionId },
    orderBy: { createdAt: "asc" },
    include: {
      replyTo: {
        include: { sender: { select: { name: true } } },
      },
    },
  });

  const apiMessages = messages.map((m) => ({
    id: m.id,
    chatSessionId: m.chatSessionId,
    senderId: m.senderId,
    content: m.content,
    type: m.type,
    fileUrl: m.fileUrl,
    fileName: m.fileName,
    fileSize: m.fileSize,
    editedAt: m.editedAt?.toISOString() ?? null,
    replyToId: m.replyToId,
    replyTo: m.replyTo
      ? {
          id: m.replyTo.id,
          content: m.replyTo.content,
          senderId: m.replyTo.senderId,
          senderName: m.replyTo.sender.name,
          type: m.replyTo.type,
        }
      : null,
    createdAt: m.createdAt.toISOString(),
  }));

  return NextResponse.json(apiMessages);
}
