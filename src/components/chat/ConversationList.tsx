import { useState } from "react";
import { Search, SlidersHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
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
  A: "bg-orange-400",
  M: "bg-pink-400",
  T: "bg-violet-400",
  R: "bg-blue-400",
  J: "bg-emerald-400",
  H: "bg-amber-400",
  AL: "bg-cyan-400",
  C: "bg-rose-400",
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
    <div className="flex h-full w-[320px] flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <h2 className="text-lg font-semibold text-foreground">All Message</h2>
        <Button
          size="sm"
          className="h-8 gap-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90"
        >
          <Plus size={14} />
          New Message
        </Button>
      </div>

      {/* Search */}
      <div className="relative px-5 pb-3">
        <Search size={16} className="absolute left-8 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search chat"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 rounded-lg border-none bg-muted pl-9 pr-10 text-sm placeholder:text-muted-foreground"
        />
        <button className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1">
        <div className="px-2">
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
            "flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors",
            isActive ? "bg-accent" : "hover:bg-muted/50"
          )}
        >
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback
              className={cn(
                "text-xs font-semibold text-white",
                avatarColors[conversation.avatar] || "bg-primary"
              )}
            >
              {conversation.avatar}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground truncate">
                {conversation.name}
              </span>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap ml-2">
                {conversation.timestamp}
              </span>
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <p className={cn(
                "text-xs truncate",
                conversation.typing ? "text-primary italic" : "text-muted-foreground"
              )}>
                {conversation.lastMessage}
              </p>
              {conversation.unread && (
                <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
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
