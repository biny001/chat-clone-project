import { useState } from "react";
import { Search, Phone, Video, MoreHorizontal, Smile, Paperclip, Mic, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { conversations, messages, type Message } from "@/data/mockData";

interface ChatAreaProps {
  activeConversationId: string;
}

const ChecksIcon = ({ green }: { green?: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.3536 4.35355L6.35355 12.3536C6.30711 12.4 6.25196 12.4368 6.19129 12.4619C6.13062 12.4869 6.06562 12.4998 6 12.4998C5.93438 12.4998 5.86938 12.4869 5.80871 12.4619C5.74804 12.4368 5.69289 12.4 5.64645 12.3536L2.14645 8.85355C2.05268 8.75979 2 8.63261 2 8.5C2 8.36739 2.05268 8.24022 2.14645 8.14645C2.24022 8.05268 2.36739 8 2.5 8C2.63261 8 2.75979 8.05268 2.85355 8.14645L6 11.2929L13.6464 3.64645C13.7402 3.55268 13.8674 3.5 14 3.5C14.1326 3.5 14.2598 3.55268 14.3536 3.64645C14.4473 3.74022 14.5 3.86739 14.5 4C14.5 4.13261 14.4473 4.25979 14.3536 4.35355Z" fill={green ? "#1E9A80" : "#8B8B8B"}/>
    <path d="M10.3536 4.35355L6.35355 8.35355C6.25979 8.44732 6.13261 8.5 6 8.5C5.86739 8.5 5.74022 8.44732 5.64645 8.35355C5.55268 8.25979 5.5 8.13261 5.5 8C5.5 7.86739 5.55268 7.74022 5.64645 7.64645L9.64645 3.64645C9.74022 3.55268 9.86739 3.5 10 3.5C10.1326 3.5 10.2598 3.55268 10.3536 3.64645C10.4473 3.74022 10.5 3.86739 10.5 4C10.5 4.13261 10.4473 4.25979 10.3536 4.35355Z" fill={green ? "#1E9A80" : "#8B8B8B"}/>
  </svg>
);

const ChatArea = ({ activeConversationId }: ChatAreaProps) => {
  const [inputValue, setInputValue] = useState("");
  const conversation = conversations.find((c) => c.id === activeConversationId);
  const chatMessages = messages[activeConversationId] || [];

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-3xl bg-card">
        <p className="text-muted-foreground text-sm">Select a conversation to start messaging</p>
      </div>
    );
  }

  // Group consecutive messages by sender for timestamp display
  const groupedMessages = groupMessages(chatMessages);

  return (
    <div className="flex flex-1 flex-col rounded-3xl bg-card p-3 overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center px-3 pt-1 pb-4 gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-semibold">
            {conversation.avatar}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h3 className="text-sm font-medium leading-5 tracking-[-0.006em] text-foreground">
            {conversation.name}
          </h3>
          <p className="text-xs font-medium leading-4" style={{ color: "#38C793" }}>
            {conversation.online ? "Online" : "Offline"}
          </p>
        </div>
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

      {/* Messages Content Area */}
      <ScrollArea className="flex-1 rounded-2xl bg-secondary">
        <div className="flex flex-col justify-end min-h-full p-3 gap-3">
          {/* Today pill */}
          <div className="flex justify-center">
            <span className="px-3 py-1 rounded-full bg-card text-sm font-medium leading-5 tracking-[-0.006em]" style={{ color: "#596881" }}>
              Today
            </span>
          </div>

          {groupedMessages.map((group, gi) => (
            <div key={gi} className={cn("flex flex-col gap-1", group.sent ? "items-end" : "items-start")}>
              {group.messages.map((msg, mi) => {
                const isLast = mi === group.messages.length - 1;
                const isFirst = mi === 0;
                return (
                  <div key={msg.id} className="relative">
                    <div
                      className={cn(
                        "px-3 py-3 text-xs leading-4 inline-block",
                        msg.sent
                          ? "bg-accent text-foreground"
                          : "bg-card text-foreground",
                        // Border radius logic
                        msg.sent
                          ? isLast
                            ? "rounded-xl rounded-br-[4px]"
                            : "rounded-xl"
                          : isLast
                            ? "rounded-xl rounded-bl-[4px]"
                            : "rounded-xl"
                      )}
                    >
                      {msg.text}
                    </div>
                    {msg.reaction && (
                      <span className="absolute left-2 -bottom-2.5 bg-card rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {msg.reaction}
                      </span>
                    )}
                  </div>
                );
              })}
              {/* Timestamp after group */}
              <div className={cn("flex items-center gap-1.5 pt-1", group.sent ? "justify-end" : "justify-start")}>
                {group.sent && group.messages[group.messages.length - 1].read && (
                  <ChecksIcon green />
                )}
                <span className="text-xs leading-4 text-muted-foreground">
                  {group.messages[group.messages.length - 1].timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input Bar */}
      <div className="pt-2">
        <div className="flex items-center rounded-full border border-border px-4 py-3 gap-1">
          <input
            type="text"
            placeholder="Type any message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-transparent text-xs leading-4 text-foreground placeholder:text-muted-foreground outline-none"
          />
          <div className="flex items-center gap-2">
            <button className="w-6 h-6 flex items-center justify-center rounded-full">
              <Mic size={14} className="text-foreground" />
            </button>
            <button className="w-6 h-6 flex items-center justify-center rounded-full">
              <Smile size={14} className="text-foreground" />
            </button>
            <button className="w-6 h-6 flex items-center justify-center rounded-full">
              <Paperclip size={14} className="text-foreground" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-primary">
              <Send size={16} className="text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Group consecutive messages by sender
function groupMessages(msgs: Message[]) {
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

export default ChatArea;
