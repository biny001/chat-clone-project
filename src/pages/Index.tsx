import { useState } from "react";
import IconSidebar from "@/components/chat/IconSidebar";
import ConversationList from "@/components/chat/ConversationList";
import ChatArea from "@/components/chat/ChatArea";

const Index = () => {
  const [activeConversationId, setActiveConversationId] = useState("1");

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <IconSidebar />
      <ConversationList
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
      />
      <ChatArea activeConversationId={activeConversationId} />
    </div>
  );
};

export default Index;
