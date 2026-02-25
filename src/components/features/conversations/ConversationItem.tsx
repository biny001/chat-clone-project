import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChecksIcon } from "@/components/icons";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { MessageCircle, Archive, Volume2, User, Upload, X, Trash2, ChevronRight } from "lucide-react";
import type { Conversation } from "@/types/chat";

const avatarColors: Record<string, string> = {
  FC: "bg-orange-400",
  YI: "bg-sky-400",
  BN: "bg-pink-400",
  ZL: "bg-violet-400",
  PD: "bg-rose-400",
  YT: "bg-blue-400",
};

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
}

export const ConversationItem = ({ conversation, isActive, onSelect }: ConversationItemProps) => {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          onClick={onSelect}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
            isActive ? "bg-secondary" : "hover:bg-muted/50"
          )}
          style={{ height: 64 }}
        >
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback
              className={cn(
                "text-[11px] font-semibold text-white",
                avatarColors[conversation.avatar] || "bg-primary"
              )}
            >
              {conversation.avatar}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium leading-5 tracking-[-0.006em] text-foreground truncate">
                {conversation.name}
              </span>
              <span className="text-xs leading-4 text-muted-foreground whitespace-nowrap ml-1">
                {conversation.timestamp}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs leading-4 text-muted-foreground truncate flex-1">
                {conversation.lastMessage}
              </p>
              {conversation.read && <ChecksIcon />}
              {conversation.unread && (
                <span className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {conversation.unread}
                </span>
              )}
            </div>
          </div>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-[200px] rounded-2xl p-2 border-border shadow-[0px_0px_24px_rgba(0,0,0,0.06)]">
        <ContextMenuItem className="gap-2.5 rounded-lg px-2 py-[6px] text-sm focus:bg-[hsl(60,14%,94%)]">
          <MessageCircle size={16} /> Mark as unread
        </ContextMenuItem>
        <ContextMenuItem className="gap-2.5 rounded-lg px-2 py-[6px] text-sm focus:bg-[hsl(60,14%,94%)]">
          <Archive size={16} /> Archive
        </ContextMenuItem>
        <ContextMenuItem className="gap-2.5 rounded-lg px-2 py-[6px] text-sm justify-between focus:bg-[hsl(60,14%,94%)]">
          <span className="flex items-center gap-2.5"><Volume2 size={16} /> Mute</span>
          <ChevronRight size={14} className="text-muted-foreground" />
        </ContextMenuItem>
        <ContextMenuItem className="gap-2.5 rounded-lg px-2 py-[6px] text-sm focus:bg-[hsl(60,14%,94%)]">
          <User size={16} /> Contact info
        </ContextMenuItem>
        <ContextMenuItem className="gap-2.5 rounded-lg px-2 py-[6px] text-sm focus:bg-[hsl(60,14%,94%)]">
          <Upload size={16} /> Export chat
        </ContextMenuItem>
        <ContextMenuItem className="gap-2.5 rounded-lg px-2 py-[6px] text-sm focus:bg-[hsl(60,14%,94%)]">
          <X size={16} /> Clear chat
        </ContextMenuItem>
        <ContextMenuItem className="gap-2.5 rounded-lg px-2 py-[6px] text-sm text-destructive focus:bg-[hsl(60,14%,94%)]">
          <Trash2 size={16} /> Delete chat
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
