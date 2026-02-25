import { ScrollArea } from "@/components/ui/scroll-area";
import { conversations } from "@/data/mock";
import { messages } from "@/data/mock";
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { MessageGroup, groupMessages } from "./MessageBubble";

interface ChatAreaProps {
  activeConversationId: string;
  onOpenContactInfo?: () => void;
}

export const ChatArea = ({ activeConversationId, onOpenContactInfo }: ChatAreaProps) => {
  const conversation = conversations.find((c) => c.id === activeConversationId);
  const chatMessages = messages[activeConversationId] || [];

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-3xl bg-card">
        <p className="text-muted-foreground text-sm">Select a conversation to start messaging</p>
      </div>
    );
  }

  const groupedMessages = groupMessages(chatMessages);

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col rounded-3xl bg-card p-3 overflow-hidden">
        <ChatHeader conversation={conversation} onOpenContactInfo={onOpenContactInfo} />

        <ScrollArea className="flex-1 rounded-2xl bg-secondary">
          <div className="flex flex-col justify-end min-h-full p-3 gap-3">
            <div className="flex justify-center">
              <span className="px-3 py-1 rounded-full bg-card text-sm font-medium leading-5 tracking-[-0.006em]" style={{ color: "#596881" }}>
                Today
              </span>
            </div>

            {groupedMessages.map((group, gi) => (
              <MessageGroup key={gi} sent={group.sent} messages={group.messages} />
            ))}
          </div>
        </ScrollArea>

        <ChatInput />
      </div>
    </div>
  );
};

export default ChatArea;
