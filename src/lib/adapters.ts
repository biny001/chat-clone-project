import { formatDistanceToNow, format, isToday } from "date-fns";
import type { Conversation, Message, Contact } from "@/types/chat";
import type { ApiConversation, ApiMessage, ApiUser } from "@/types/api";

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatConversationTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatMessageTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return format(date, "h:mm a");
  }
  return format(date, "MMM d, h:mm a");
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function toConversation(
  api: ApiConversation,
  onlineUserIds?: Set<string>
): Conversation {
  return {
    id: api.id,
    name: api.otherUser.name,
    avatar: getInitials(api.otherUser.name),
    lastMessage: api.lastMessage?.content ?? "",
    timestamp: api.lastMessage
      ? formatConversationTimestamp(api.lastMessage.createdAt)
      : formatConversationTimestamp(api.createdAt),
    online: onlineUserIds ? onlineUserIds.has(api.otherUser.id) : false,
    unread: api.unreadCount > 0 ? api.unreadCount : undefined,
  };
}

export function toMessage(api: ApiMessage, currentUserId: string): Message {
  return {
    id: api.id,
    conversationId: api.chatSessionId,
    text: api.content,
    timestamp: formatMessageTimestamp(api.createdAt),
    sent: api.senderId === currentUserId,
    type: (api.type as "text" | "image" | "file") || "text",
    fileUrl: api.fileUrl ?? undefined,
    fileName: api.fileName ?? undefined,
    fileSize: api.fileSize ?? undefined,
    editedAt: api.editedAt ?? undefined,
  };
}

export function toContact(api: ApiUser): Contact {
  return {
    id: api.id,
    name: api.name,
    avatar: getInitials(api.name),
  };
}
