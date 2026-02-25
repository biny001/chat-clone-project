import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const chatSessions = await prisma.chatSession.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: { select: { id: true, name: true, email: true, image: true } },
      user2: { select: { id: true, name: true, email: true, image: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Compute unread counts
  const unreadCounts = await Promise.all(
    chatSessions.map(async (cs) => {
      const isUser1 = cs.user1Id === userId;
      const lastReadAt = isUser1 ? cs.user1LastReadAt : cs.user2LastReadAt;

      const count = await prisma.message.count({
        where: {
          chatSessionId: cs.id,
          senderId: { not: userId },
          ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
        },
      });

      return { id: cs.id, count };
    })
  );

  const unreadMap = new Map(unreadCounts.map((u) => [u.id, u.count]));

  const conversations = chatSessions.map((cs) => {
    const otherUser = cs.user1Id === userId ? cs.user2 : cs.user1;
    const lastMessage = cs.messages[0] ?? null;
    return {
      id: cs.id,
      user1Id: cs.user1Id,
      user2Id: cs.user2Id,
      createdAt: cs.createdAt.toISOString(),
      updatedAt: cs.updatedAt.toISOString(),
      otherUser,
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            chatSessionId: lastMessage.chatSessionId,
            senderId: lastMessage.senderId,
            content: lastMessage.content,
            type: lastMessage.type,
            fileUrl: lastMessage.fileUrl,
            fileName: lastMessage.fileName,
            fileSize: lastMessage.fileSize,
            editedAt: lastMessage.editedAt?.toISOString() ?? null,
            createdAt: lastMessage.createdAt.toISOString(),
          }
        : null,
      unreadCount: unreadMap.get(cs.id) ?? 0,
    };
  });

  return NextResponse.json(conversations);
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId: otherUserId } = await request.json();
  const currentUserId = session.user.id;

  if (!otherUserId || otherUserId === currentUserId) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  // Canonical ordering for the unique constraint
  const [user1Id, user2Id] =
    currentUserId < otherUserId
      ? [currentUserId, otherUserId]
      : [otherUserId, currentUserId];

  // Upsert: find existing or create new
  const chatSession = await prisma.chatSession.upsert({
    where: { user1Id_user2Id: { user1Id, user2Id } },
    update: {}, // no update needed, just return existing
    create: { user1Id, user2Id },
    include: {
      user1: { select: { id: true, name: true, email: true, image: true } },
      user2: { select: { id: true, name: true, email: true, image: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const otherUser =
    chatSession.user1Id === currentUserId
      ? chatSession.user2
      : chatSession.user1;
  const lastMessage = chatSession.messages[0] ?? null;

  return NextResponse.json({
    chatSession: {
      id: chatSession.id,
      user1Id: chatSession.user1Id,
      user2Id: chatSession.user2Id,
      createdAt: chatSession.createdAt.toISOString(),
      updatedAt: chatSession.updatedAt.toISOString(),
      otherUser,
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            chatSessionId: lastMessage.chatSessionId,
            senderId: lastMessage.senderId,
            content: lastMessage.content,
            type: lastMessage.type,
            fileUrl: lastMessage.fileUrl,
            fileName: lastMessage.fileName,
            fileSize: lastMessage.fileSize,
            editedAt: lastMessage.editedAt?.toISOString() ?? null,
            createdAt: lastMessage.createdAt.toISOString(),
          }
        : null,
      unreadCount: 0,
    },
  });
}
