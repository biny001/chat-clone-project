import { useState } from "react";
import IconSidebar from "@/components/chat/IconSidebar";
import ConversationList from "@/components/chat/ConversationList";
import ChatArea from "@/components/chat/ChatArea";
import TopBar from "@/components/chat/TopBar";

const Index = () => {
  const [activeConversationId, setActiveConversationId] = useState("1");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-secondary">
      <IconSidebar />
      <div className="flex flex-1 flex-col p-3 pl-0 gap-3">
        <TopBar />
        <div className="flex flex-1 gap-3 overflow-hidden">
          <ConversationList
            activeId={activeConversationId}
            onSelect={setActiveConversationId}
          />
          <ChatArea activeConversationId={activeConversationId} />
        </div>
      </div>
    </div>
  );
};

export default Index;
