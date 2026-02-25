"use client";

import { useState } from "react";
import { Search, Filter, PenLine } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationItem } from "./ConversationItem";
import { NewMessagePopup } from "./NewMessagePopup";
import type { Conversation } from "@/types/chat";

interface ConversationListProps {
  activeId: string | null;
  onSelect: (id: string) => void;
  conversations: Conversation[];
  onConversationCreated: (id: string) => void;
}

export const ConversationList = ({ activeId, onSelect, conversations, onConversationCreated }: ConversationListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMessage, setShowNewMessage] = useState(false);

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full w-full md:w-[400px] flex-col rounded-none md:rounded-3xl bg-card p-4 pt-6 md:p-6 gap-4 md:gap-6">
      {/* Header */}
      <div className="relative flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-semibold text-foreground leading-[30px] tracking-[-0.006em]">All Message</h2>
        <button
          onClick={() => setShowNewMessage((v) => !v)}
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

        <NewMessagePopup
          open={showNewMessage}
          onClose={() => setShowNewMessage(false)}
          onConversationCreated={(id) => {
            onConversationCreated(id);
            setShowNewMessage(false);
          }}
        />
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 md:gap-4">
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

export default ConversationList;
