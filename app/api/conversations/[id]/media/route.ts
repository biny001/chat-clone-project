import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { format } from "date-fns";

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

  // Fetch all messages with files/images
  const messages = await prisma.message.findMany({
    where: {
      chatSessionId,
      type: { in: ["image", "file", "audio"] },
    },
    orderBy: { createdAt: "desc" },
  });

  // Also fetch text messages to extract links
  const textMessages = await prisma.message.findMany({
    where: {
      chatSessionId,
      type: "text",
      content: { contains: "http" },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group media (images) by month
  const mediaMessages = messages.filter((m) => m.type === "image");
  const mediaByMonth = groupByMonth(mediaMessages, (m) => ({
    url: m.fileUrl!,
    name: m.fileName || "Image",
    createdAt: m.createdAt.toISOString(),
  }));

  // Group files by month
  const fileMessages = messages.filter((m) => m.type === "file" || m.type === "audio");
  const filesByMonth = groupByMonth(fileMessages, (m) => ({
    url: m.fileUrl!,
    name: m.fileName || "File",
    size: m.fileSize || 0,
    type: m.type,
    createdAt: m.createdAt.toISOString(),
  }));

  // Extract links from text messages and group by month
  const urlRegex = /https?:\/\/[^\s<>"']+/g;
  const linksWithMonths: { month: string; url: string; context: string }[] = [];
  for (const msg of textMessages) {
    const urls = msg.content.match(urlRegex);
    if (urls) {
      const month = format(msg.createdAt, "MMMM yyyy");
      for (const url of urls) {
        linksWithMonths.push({
          month,
          url,
          context: msg.content.slice(0, 100),
        });
      }
    }
  }

  const linksByMonth: Record<string, { url: string; context: string }[]> = {};
  for (const link of linksWithMonths) {
    if (!linksByMonth[link.month]) linksByMonth[link.month] = [];
    linksByMonth[link.month].push({ url: link.url, context: link.context });
  }

  const linksGrouped = Object.entries(linksByMonth).map(([month, links]) => ({
    month,
    links,
  }));

  return NextResponse.json({
    media: mediaByMonth,
    files: filesByMonth,
    links: linksGrouped,
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function groupByMonth<T>(items: any[], mapper: (item: any) => T): { month: string; items: T[] }[] {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const month = format(item.createdAt, "MMMM yyyy");
    if (!groups[month]) groups[month] = [];
    groups[month].push(mapper(item));
  }
  return Object.entries(groups).map(([month, groupItems]) => ({
    month,
    items: groupItems,
  }));
}
