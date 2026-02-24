import { useState } from "react";
import { Search, Phone, Video, MoreVertical, Smile, Paperclip, Mic, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { conversations, messages, type Message } from "@/data/mockData";

interface ChatAreaProps {
  activeConversationId: string;
}

const ChatArea = ({ activeConversationId }: ChatAreaProps) => {
  const [inputValue, setInputValue] = useState("");
  const conversation = conversations.find((c) => c.id === activeConversationId);
  const chatMessages = messages[activeConversationId] || [];

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center bg-chat-bg">
        <p className="text-muted-foreground">Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-chat-bg rounded-3xl overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {conversation.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{conversation.name}</h3>
            <p className="text-xs text-primary">
              {conversation.online ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[Search, Phone, Video, MoreVertical].map((Icon, i) => (
            <Button key={i} variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
              <Icon size={18} />
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="flex flex-col gap-4">
          {chatMessages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
      </ScrollArea>

      {/* Input Bar */}
      <div className="border-t border-border bg-card px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
              <Smile size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
              <Paperclip size={20} />
            </Button>
          </div>
          <input
            type="text"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
              <Mic size={20} />
            </Button>
            <Button size="icon" className="h-9 w-9 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90">
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message }: { message: Message }) => {
  return (
    <div className={cn("flex", message.sent ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[65%] rounded-2xl px-4 py-2.5",
          message.sent
            ? "bg-chat-sent text-chat-sent-foreground rounded-br-md"
            : "bg-chat-received text-chat-received-foreground rounded-bl-md shadow-sm"
        )}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
        <div className={cn(
          "mt-1 flex items-center gap-1",
          message.sent ? "justify-end" : "justify-start"
        )}>
          <span className={cn(
            "text-[10px]",
            message.sent ? "text-chat-sent-foreground/70" : "text-muted-foreground"
          )}>
            {message.timestamp}
          </span>
          {message.sent && message.read && (
            <span className="text-[10px] text-chat-sent-foreground/70">✓✓</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
