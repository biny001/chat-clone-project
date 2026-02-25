"use client";

import { Search, Phone, Video, MoreHorizontal, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Conversation } from "@/types/chat";

interface ChatHeaderProps {
  conversation: Conversation;
  onOpenContactInfo?: () => void;
  isOtherUserTyping?: boolean;
  searchOpen?: boolean;
  onToggleSearch?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchMatchCount?: number;
}

export const ChatHeader = ({
  conversation,
  onOpenContactInfo,
  isOtherUserTyping,
  searchOpen,
  onToggleSearch,
  searchQuery,
  onSearchChange,
  searchMatchCount,
}: ChatHeaderProps) => {
  return (
    <div>
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
            <p
              className="text-xs font-medium leading-4 transition-opacity duration-200"
              style={{ color: isOtherUserTyping ? "#38C793" : conversation.online ? "#38C793" : "#8B8B8B" }}
            >
              {isOtherUserTyping ? "typing..." : conversation.online ? "Online" : "Offline"}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSearch}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card"
          >
            <Search size={16} className="text-foreground" />
          </button>
          {[Phone, Video, MoreHorizontal].map((Icon, i) => (
            <button
              key={i}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card"
            >
              <Icon size={16} className="text-foreground" />
            </button>
          ))}
        </div>
      </div>

      {searchOpen && (
        <div className="flex items-center gap-2 px-3 pb-3">
          <div className="flex-1 flex items-center gap-2 h-8 rounded-lg border border-border px-2.5 bg-secondary">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery || ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
            />
            {searchQuery && searchMatchCount !== undefined && (
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {searchMatchCount} found
              </span>
            )}
          </div>
          <button
            onClick={onToggleSearch}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card shrink-0"
          >
            <X size={14} className="text-foreground" />
          </button>
        </div>
      )}
    </div>
  );
};
