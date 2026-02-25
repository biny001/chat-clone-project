"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChecksIcon, SingleCheckIcon } from "@/components/icons";
import { ImageMessage } from "./ImageMessage";
import { VideoMessage } from "./VideoMessage";
import { FileMessage } from "./FileMessage";
import { AudioMessage } from "./AudioMessage";
import { EditMessageInput } from "./EditMessageInput";
import { MessageContextMenu } from "./MessageContextMenu";
import { LinkPreview } from "./LinkPreview";
import { ReplyPreview } from "./ReplyPreview";
import type { Message } from "@/types/chat";

const URL_REGEX = /https?:\/\/[^\s<>"']+/;

// Parse URLs in text and return React elements with clickable links
function renderTextWithLinks(text: string) {
  const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
  const parts = text.split(urlRegex);

  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      // Reset lastIndex because of the global regex
      urlRegex.lastIndex = 0;
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:opacity-80 break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
  onEditMessage?: (id: string, content: string) => void;
  onCancelUpload?: (id: string) => void;
  onReply?: (message: Message) => void;
}

export const MessageBubble = ({ message, isLast, onEditMessage, onCancelUpload, onReply }: MessageBubbleProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveEdit = (content: string) => {
    onEditMessage?.(message.id, content);
    setIsEditing(false);
  };

  const handleCancelUpload = onCancelUpload ? () => onCancelUpload(message.id) : undefined;
  const handleReply = onReply ? () => onReply(message) : undefined;

  const replyBlock = message.replyToId && message.replyToSender ? (
    <ReplyPreview
      senderName={message.replyToSender}
      text={message.replyToText || ""}
      type={message.replyToType}
      sent={message.sent}
    />
  ) : null;

  // Image message
  if (message.type === "image" && message.fileUrl) {
    return (
      <MessageContextMenu canEdit={false} text="" onEdit={() => {}} onReply={handleReply}>
        <div>
          {replyBlock}
          <ImageMessage message={message} isLast={isLast} onCancelUpload={handleCancelUpload} />
        </div>
      </MessageContextMenu>
    );
  }

  // Video message
  if (message.type === "video" && message.fileUrl) {
    return (
      <MessageContextMenu canEdit={false} text="" onEdit={() => {}} onReply={handleReply}>
        <div>
          {replyBlock}
          <VideoMessage message={message} isLast={isLast} onCancelUpload={handleCancelUpload} />
        </div>
      </MessageContextMenu>
    );
  }

  // Audio message
  if (message.type === "audio" && message.fileUrl) {
    return (
      <MessageContextMenu canEdit={false} text="" onEdit={() => {}} onReply={handleReply}>
        <div>
          {replyBlock}
          <AudioMessage message={message} isLast={isLast} onCancelUpload={handleCancelUpload} />
        </div>
      </MessageContextMenu>
    );
  }

  // File message
  if (message.type === "file" && message.fileUrl) {
    return (
      <MessageContextMenu canEdit={false} text={message.fileName || ""} onEdit={() => {}} onReply={handleReply}>
        <div>
          {replyBlock}
          <FileMessage message={message} isLast={isLast} onCancelUpload={handleCancelUpload} />
        </div>
      </MessageContextMenu>
    );
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

  const hasUrl = URL_REGEX.test(message.text);

  return (
    <MessageContextMenu
      canEdit={message.sent && message.type !== "image" && message.type !== "video" && message.type !== "file" && message.type !== "audio"}
      text={message.text}
      onEdit={() => setIsEditing(true)}
      onReply={handleReply}
    >
      <div className="relative">
        {replyBlock}
        <div
          className={cn(
            "px-3 py-3 text-xs leading-4 inline-block max-w-[400px]",
            message.sent
              ? "bg-accent text-foreground"
              : "bg-card text-foreground",
            message.sent
              ? isLast ? "rounded-xl rounded-br-[4px]" : "rounded-xl"
              : isLast ? "rounded-xl rounded-bl-[4px]" : "rounded-xl"
          )}
        >
          {renderTextWithLinks(message.text)}
          {message.editedAt && (
            <span className="ml-1.5 text-[10px] text-muted-foreground italic">(edited)</span>
          )}
          {hasUrl && <LinkPreview text={message.text} sent={message.sent} />}
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
  onCancelUpload?: (id: string) => void;
  onReply?: (message: Message) => void;
}

export const MessageGroup = ({ sent, messages, onEditMessage, onCancelUpload, onReply }: MessageGroupProps) => {
  const lastMessage = messages[messages.length - 1];

  return (
    <div className={cn("flex flex-col gap-1", sent ? "items-end" : "items-start")}>
      {messages.map((msg, mi) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isLast={mi === messages.length - 1}
          onEditMessage={onEditMessage}
          onCancelUpload={onCancelUpload}
          onReply={onReply}
        />
      ))}
      <div className={cn("flex items-center gap-1.5 pt-1", sent ? "justify-end" : "justify-start")}>
        {/* Sent messages: single tick (sent), or double green ticks (read) */}
        {sent && (lastMessage.read ? <ChecksIcon green /> : <SingleCheckIcon />)}
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
