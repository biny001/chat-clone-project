"use client";

import { Search, Phone, Video, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Conversation } from "@/types/chat";

interface ChatHeaderProps {
  conversation: Conversation;
  onOpenContactInfo?: () => void;
  isOtherUserTyping?: boolean;
}

export const ChatHeader = ({ conversation, onOpenContactInfo, isOtherUserTyping }: ChatHeaderProps) => {
  return (
    <div className="flex items-center px-3 pt-1 pb-4 gap-3">
      <button
        onClick={onOpenContactInfo}
        className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-semibold">
            {conversation.avatar}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1 text-left">
          <h3 className="text-sm font-medium leading-5 tracking-[-0.006em] text-foreground">
            {conversation.name}
          </h3>
          <p className="text-xs font-medium leading-4" style={{ color: "#38C793" }}>
            {isOtherUserTyping ? "typing..." : conversation.online ? "Online" : "Offline"}
          </p>
        </div>
      </button>
      <div className="flex items-center gap-3">
        {[Search, Phone, Video, MoreHorizontal].map((Icon, i) => (
          <button
            key={i}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card"
          >
            <Icon size={16} className="text-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
};
