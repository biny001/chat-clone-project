"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChecksIcon } from "@/components/icons";
import { ImageMessage } from "./ImageMessage";
import { FileMessage } from "./FileMessage";
import { EditMessageInput } from "./EditMessageInput";
import { MessageContextMenu } from "./MessageContextMenu";
import type { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
  onEditMessage?: (id: string, content: string) => void;
}

export const MessageBubble = ({ message, isLast, onEditMessage }: MessageBubbleProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveEdit = (content: string) => {
    onEditMessage?.(message.id, content);
    setIsEditing(false);
  };

  // Image message
  if (message.type === "image" && message.fileUrl) {
    return <ImageMessage message={message} isLast={isLast} />;
  }

  // File message
  if (message.type === "file" && message.fileUrl) {
    return <FileMessage message={message} isLast={isLast} />;
  }

  // Text message (default)
  if (isEditing) {
    return (
      <div className="min-w-[200px] max-w-[80%]">
        <EditMessageInput
          initialContent={message.text}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <MessageContextMenu
      canEdit={message.sent && message.type !== "image" && message.type !== "file"}
      text={message.text}
      onEdit={() => setIsEditing(true)}
    >
      <div className="relative">
        <div
          className={cn(
            "px-3 py-3 text-xs leading-4 inline-block",
            message.sent
              ? "bg-accent text-foreground"
              : "bg-card text-foreground",
            message.sent
              ? isLast ? "rounded-xl rounded-br-[4px]" : "rounded-xl"
              : isLast ? "rounded-xl rounded-bl-[4px]" : "rounded-xl"
          )}
        >
          {message.text}
          {message.editedAt && (
            <span className="ml-1.5 text-[10px] text-muted-foreground italic">(edited)</span>
          )}
        </div>
        {message.reaction && (
          <span className="absolute left-2 -bottom-3 bg-card rounded-full w-5 h-5 flex items-center justify-center text-xs z-10">
            {message.reaction}
          </span>
        )}
      </div>
    </MessageContextMenu>
  );
};

interface MessageGroupProps {
  sent: boolean;
  messages: Message[];
  onEditMessage?: (id: string, content: string) => void;
}

export const MessageGroup = ({ sent, messages, onEditMessage }: MessageGroupProps) => {
  const lastMessage = messages[messages.length - 1];

  return (
    <div className={cn("flex flex-col gap-1", sent ? "items-end" : "items-start")}>
      {messages.map((msg, mi) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isLast={mi === messages.length - 1}
          onEditMessage={onEditMessage}
        />
      ))}
      <div className={cn("flex items-center gap-1.5 pt-1", sent ? "justify-end" : "justify-start")}>
        {sent && lastMessage.read && <ChecksIcon green />}
        <span className="text-xs leading-4 text-muted-foreground">
          {lastMessage.timestamp}
        </span>
      </div>
    </div>
  );
};

/** Group consecutive messages by sender */
export function groupMessages(msgs: Message[]) {
  const groups: { sent: boolean; messages: Message[] }[] = [];
  for (const msg of msgs) {
    const last = groups[groups.length - 1];
    if (last && last.sent === msg.sent) {
      last.messages.push(msg);
    } else {
      groups.push({ sent: msg.sent, messages: [msg] });
    }
  }
  return groups;
}
