import { useState, useCallback } from "react";
import ConversationList from "@/components/features/conversations/ConversationList";
import ChatArea from "@/components/features/chat/ChatArea";
import ContactInfoPanel from "@/components/features/contact-info/ContactInfoPanel";
import { conversations, messages as initialMessages } from "@/data/mock";
import type { Message } from "@/types/chat";

const ChatPage = () => {
  const [activeConversationId, setActiveConversationId] = useState("1");
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [allMessages, setAllMessages] = useState<Record<string, Message[]>>(initialMessages);

  const conversation = conversations.find((c) => c.id === activeConversationId);

  const handleSendMessage = useCallback((text: string) => {
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      conversationId: activeConversationId,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sent: true,
      read: false,
    };
    setAllMessages((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMsg],
    }));
  }, [activeConversationId]);

  return (
    <>
      <ConversationList
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
      />
      <ChatArea
        activeConversationId={activeConversationId}
        messages={allMessages[activeConversationId] || []}
        onSendMessage={handleSendMessage}
        onOpenContactInfo={() => setShowContactInfo(!showContactInfo)}
      />

      {showContactInfo && conversation && (
        <div className="absolute right-3 top-3 bottom-3 z-30">
          <ContactInfoPanel
            name={conversation.name}
            avatar={conversation.avatar}
            onClose={() => setShowContactInfo(false)}
          />
        </div>
      )}
    </>
  );
};

export default ChatPage;
