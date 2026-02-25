import { useState } from "react";
import IconSidebar from "@/components/chat/IconSidebar";
import ConversationList from "@/components/chat/ConversationList";
import ChatArea from "@/components/chat/ChatArea";
import TopBar from "@/components/chat/TopBar";
import ContactInfoPanel from "@/components/chat/ContactInfoPanel";
import { conversations } from "@/data/mockData";

const Index = () => {
  const [activeConversationId, setActiveConversationId] = useState("1");
  const [showContactInfo, setShowContactInfo] = useState(false);

  const conversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-secondary">
      <IconSidebar />
      <div className="flex flex-1 flex-col p-3 pl-0 gap-3">
        <TopBar />
        <div className="flex flex-1 gap-3 overflow-hidden">
          <ConversationList
            activeId={activeConversationId}
            onSelect={setActiveConversationId}
          />
          <ChatArea
            activeConversationId={activeConversationId}
            onOpenContactInfo={() => setShowContactInfo(!showContactInfo)}
          />
        </div>
      </div>

      {/* Contact Info Panel - overlays from top, aligned with top bar */}
      {showContactInfo && conversation && (
        <div className="absolute right-3 top-3 bottom-3 z-30">
          <ContactInfoPanel
            name={conversation.name}
            avatar={conversation.avatar}
            onClose={() => setShowContactInfo(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Index;
