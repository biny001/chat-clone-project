"use client";

import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { MessageGroup, groupMessages } from "./MessageBubble";
import { TypingBubble } from "./TypingBubble";
import { useChatSearch } from "@/hooks/use-chat-search";
import type { Conversation, Message } from "@/types/chat";

interface ChatAreaProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSendFile?: (data: { type: "image" | "file"; fileUrl: string; fileName: string; fileSize: number }) => void;
  onEditMessage?: (id: string, content: string) => void;
  onOpenContactInfo?: () => void;
  isOtherUserTyping?: boolean;
  onTyping?: () => void;
}

export const ChatArea = ({
  conversation,
  messages: chatMessages,
  onSendMessage,
  onSendFile,
  onEditMessage,
  onOpenContactInfo,
  isOtherUserTyping,
  onTyping,
}: ChatAreaProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { results: displayMessages, matchCount } = useChatSearch(chatMessages, searchQuery);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length, isOtherUserTyping]);

  // Reset search when conversation changes
  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, [conversation?.id]);

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-3xl bg-card">
        <p className="text-muted-foreground text-sm">Select a conversation to start messaging</p>
      </div>
    );
  }

  const groupedMessages = groupMessages(displayMessages);

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col rounded-3xl bg-card p-3 overflow-hidden">
        <ChatHeader
          conversation={conversation}
          onOpenContactInfo={onOpenContactInfo}
          isOtherUserTyping={isOtherUserTyping}
          searchOpen={searchOpen}
          onToggleSearch={() => {
            setSearchOpen(!searchOpen);
            if (searchOpen) setSearchQuery("");
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchMatchCount={matchCount}
        />

        <ScrollArea className="flex-1 rounded-2xl bg-secondary">
          <div className="flex flex-col justify-end min-h-full p-3 gap-3">
            <div className="flex justify-center">
              <span className="px-3 py-1 rounded-full bg-card text-sm font-medium leading-5 tracking-[-0.006em]" style={{ color: "#596881" }}>
                Today
              </span>
            </div>

            {groupedMessages.map((group, gi) => (
              <MessageGroup
                key={gi}
                sent={group.sent}
                messages={group.messages}
                onEditMessage={onEditMessage}
              />
            ))}
            {isOtherUserTyping && <TypingBubble />}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <ChatInput onSend={onSendMessage} onSendFile={onSendFile} onTyping={onTyping} />
      </div>
    </div>
  );
};

export default ChatArea;
