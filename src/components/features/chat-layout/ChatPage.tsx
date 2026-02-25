"use client";

import { useState, useCallback } from "react";
import ConversationList from "@/components/features/conversations/ConversationList";
import ChatArea from "@/components/features/chat/ChatArea";
import ContactInfoPanel from "@/components/features/contact-info/ContactInfoPanel";
import { useConversationList } from "@/hooks/use-conversations";
import { useMessages, useSendMessage } from "@/hooks/use-messages";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import { useRealtimeConversations } from "@/hooks/use-realtime-conversations";
import { useTypingIndicator } from "@/hooks/use-typing-indicator";
import { useOnlineUsers } from "@/hooks/use-online-status";

const ChatPage = () => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showContactInfo, setShowContactInfo] = useState(false);

  // Online status
  const onlineUserIds = useOnlineUsers();

  // Conversations
  const { data: conversations, rawData } = useConversationList(onlineUserIds);

  // Messages for active conversation
  const { data: messages = [] } = useMessages(activeConversationId);
  const sendMessage = useSendMessage();

  // Real-time subscriptions
  useRealtimeMessages(activeConversationId);
  useRealtimeConversations();

  // Typing indicator
  const { isOtherUserTyping, handleTyping } = useTypingIndicator(activeConversationId);

  // Find active conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;

  // Find the raw API conversation for email in ContactInfoPanel
  const activeRawConversation = rawData.find((c) => c.id === activeConversationId);

  const handleSendMessage = useCallback((text: string) => {
    if (!activeConversationId) return;
    sendMessage.mutate({ chatSessionId: activeConversationId, content: text });
  }, [activeConversationId, sendMessage]);

  const handleConversationCreated = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  return (
    <>
      <ConversationList
        activeId={activeConversationId}
        onSelect={setActiveConversationId}
        conversations={conversations}
        onConversationCreated={handleConversationCreated}
      />
      <ChatArea
        conversation={activeConversation}
        messages={messages}
        onSendMessage={handleSendMessage}
        onOpenContactInfo={() => setShowContactInfo(!showContactInfo)}
        isOtherUserTyping={isOtherUserTyping}
        onTyping={handleTyping}
      />

      {showContactInfo && activeConversation && (
        <div className="absolute right-3 top-3 bottom-3 z-30">
          <ContactInfoPanel
            name={activeConversation.name}
            avatar={activeConversation.avatar}
            email={activeRawConversation?.otherUser.email}
            onClose={() => setShowContactInfo(false)}
          />
        </div>
      )}
    </>
  );
};

export default ChatPage;
