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
  };
}

export function toMessage(api: ApiMessage, currentUserId: string): Message {
  return {
    id: api.id,
    conversationId: api.chatSessionId,
    text: api.content,
    timestamp: formatMessageTimestamp(api.createdAt),
    sent: api.senderId === currentUserId,
  };
}

export function toContact(api: ApiUser): Contact {
  return {
    id: api.id,
    name: api.name,
    avatar: getInitials(api.name),
  };
}
