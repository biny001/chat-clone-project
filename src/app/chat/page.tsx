import { useState } from "react";
import ConversationList from "@/components/features/conversations/ConversationList";
import ChatArea from "@/components/features/chat/ChatArea";
import ContactInfoPanel from "@/components/features/contact-info/ContactInfoPanel";
import { conversations } from "@/data/mock";

/**
 * Chat page — mirrors Next.js `app/(chat)/page.tsx`.
 * Handles active conversation state and contact info panel visibility.
 */
const ChatPage = () => {
  const [activeConversationId, setActiveConversationId] = useState("1");
  const [showContactInfo, setShowContactInfo] = useState(false);

  const conversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <>
      <ConversationList
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
      />
      <ChatArea
        activeConversationId={activeConversationId}
        onOpenContactInfo={() => setShowContactInfo(!showContactInfo)}
      />

      {/* Contact Info Panel overlay */}
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
