import { useState } from "react";
import { Search, Check, Filter, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { conversations, type Conversation } from "@/data/mockData";

const avatarColors: Record<string, string> = {
  FC: "bg-orange-400",
  YI: "bg-sky-400",
  BN: "bg-pink-400",
  ZL: "bg-violet-400",
  PD: "bg-rose-400",
  YT: "bg-blue-400",
};

interface ConversationListProps {
  activeId: string;
  onSelect: (id: string) => void;
}

const ConversationList = ({ activeId, onSelect }: ConversationListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full w-[400px] flex-col rounded-3xl bg-card p-6 gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground leading-[30px] tracking-[-0.006em]">All Message</h2>
        <button
          className="flex items-center justify-center gap-1.5 h-8 px-2 rounded-lg text-sm font-medium text-white"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%), #1E9A80",
            border: "1px solid #1E9A80",
            boxShadow: "inset 0px 1px 0px 1px rgba(255,255,255,0.12)",
          }}
        >
          <PenLine size={18} className="text-white" />
          <span className="text-sm font-medium leading-5 tracking-[-0.006em]">New Message</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="flex flex-1 items-center gap-2 rounded-[10px] border border-border px-2.5 h-10">
          <Search size={16} className="shrink-0 text-foreground" />
          <input
            placeholder="Search in message"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm font-normal leading-5 tracking-[-0.006em] text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>
        <button className="flex items-center justify-center w-10 h-10 rounded-[10px] border border-border bg-card shrink-0">
          <Filter size={18} className="text-foreground" />
        </button>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1 -mx-2">
        <div className="flex flex-col gap-2 px-2">
          {filtered.map((convo) => (
            <ConversationItem
              key={convo.id}
              conversation={convo}
              isActive={convo.id === activeId}
              onSelect={() => onSelect(convo.id)}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

const ChecksIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.3536 4.35355L6.35355 12.3536C6.30711 12.4 6.25196 12.4368 6.19129 12.4619C6.13062 12.4869 6.06562 12.4998 6 12.4998C5.93438 12.4998 5.86938 12.4869 5.80871 12.4619C5.74804 12.4368 5.69289 12.4 5.64645 12.3536L2.14645 8.85355C2.05268 8.75979 2 8.63261 2 8.5C2 8.36739 2.05268 8.24022 2.14645 8.14645C2.24022 8.05268 2.36739 8 2.5 8C2.63261 8 2.75979 8.05268 2.85355 8.14645L6 11.2929L13.6464 3.64645C13.7402 3.55268 13.8674 3.5 14 3.5C14.1326 3.5 14.2598 3.55268 14.3536 3.64645C14.4473 3.74022 14.5 3.86739 14.5 4C14.5 4.13261 14.4473 4.25979 14.3536 4.35355Z" fill="#8B8B8B"/>
    <path d="M10.3536 4.35355L6.35355 8.35355C6.25979 8.44732 6.13261 8.5 6 8.5C5.86739 8.5 5.74022 8.44732 5.64645 8.35355C5.55268 8.25979 5.5 8.13261 5.5 8C5.5 7.86739 5.55268 7.74022 5.64645 7.64645L9.64645 3.64645C9.74022 3.55268 9.86739 3.5 10 3.5C10.1326 3.5 10.2598 3.55268 10.3536 3.64645C10.4473 3.74022 10.5 3.86739 10.5 4C10.5 4.13261 10.4473 4.25979 10.3536 4.35355Z" fill="#8B8B8B"/>
  </svg>
);

const ConversationItem = ({
  conversation,
  isActive,
  onSelect,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
}) => {
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
      <ContextMenuContent className="w-48">
        <ContextMenuItem>Mark as unread</ContextMenuItem>
        <ContextMenuItem>Archive</ContextMenuItem>
        <ContextMenuItem>Mute</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Contact info</ContextMenuItem>
        <ContextMenuItem>Export chat</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Clear chat</ContextMenuItem>
        <ContextMenuItem className="text-destructive">Delete chat</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ConversationList;
