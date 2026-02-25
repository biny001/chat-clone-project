"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ConversationList from "@/components/features/conversations/ConversationList";
import ChatArea from "@/components/features/chat/ChatArea";
import { ChatAreaSkeleton } from "@/components/features/chat/ChatAreaSkeleton";
import ContactInfoPanel from "@/components/features/contact-info/ContactInfoPanel";
import { ConversationListSkeleton } from "@/components/features/conversations/ConversationListSkeleton";
import { useConversationList } from "@/hooks/use-conversations";
import { useMessages, useSendMessage, useEditMessage } from "@/hooks/use-messages";
import { useRealtimeMessages } from "@/hooks/use-realtime-messages";
import { useRealtimeConversations } from "@/hooks/use-realtime-conversations";
import { useTypingIndicator } from "@/hooks/use-typing-indicator";
import { useOnlineUsers } from "@/hooks/use-online-status";
import { useMarkAsRead } from "@/hooks/use-read-receipts";
import { useIsMobile } from "@/hooks/use-mobile";

const ChatPage = () => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const isMobile = useIsMobile();

  // Online status
  const onlineUserIds = useOnlineUsers();

  // Conversations
  const { data: conversations, rawData, isLoading: isConversationsLoading } = useConversationList(onlineUserIds);

  // Find the raw API conversation for otherUserLastReadAt
  const activeRawConversation = rawData.find((c) => c.id === activeConversationId);
  const otherUserLastReadAt = activeRawConversation?.otherUserLastReadAt ?? null;

  // Messages for active conversation — pass otherUserLastReadAt for read receipts
  const { data: messages = [], isLoading: isMessagesLoading } = useMessages(activeConversationId, otherUserLastReadAt);
  const sendMessage = useSendMessage();
  const editMessage = useEditMessage();

  // Real-time subscriptions
  useRealtimeMessages(activeConversationId);
  useRealtimeConversations();

  // Typing indicator
  const { isOtherUserTyping, handleTyping } = useTypingIndicator(activeConversationId);

  // Mark as read when switching conversations
  const { markAsRead } = useMarkAsRead(activeConversationId);

  // Also re-mark as read when new incoming messages arrive
  const lastIncomingIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!activeConversationId || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && !lastMsg.sent && lastMsg.id !== lastIncomingIdRef.current) {
      lastIncomingIdRef.current = lastMsg.id;
      markAsRead();
    }
  }, [messages, activeConversationId, markAsRead]);

  // Find active conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId) ?? null;

  const handleSendMessage = useCallback((text: string, replyToId?: string) => {
    if (!activeConversationId) return;
    sendMessage.mutate({ chatSessionId: activeConversationId, content: text, replyToId });
  }, [activeConversationId, sendMessage]);

  const handleSendFile = useCallback((data: { type: "image" | "video" | "file" | "audio"; fileUrl: string; fileName: string; fileSize: number }) => {
    if (!activeConversationId) return;
    sendMessage.mutate({
      chatSessionId: activeConversationId,
      content: data.type === "image" || data.type === "video" ? "" : data.type === "audio" ? "" : data.fileName,
      type: data.type,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
    });
  }, [activeConversationId, sendMessage]);

  const handleEditMessage = useCallback((id: string, content: string) => {
    if (!activeConversationId) return;
    editMessage.mutate({ id, content, chatSessionId: activeConversationId });
  }, [activeConversationId, editMessage]);

  const handleConversationCreated = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  const handleBack = useCallback(() => {
    setActiveConversationId(null);
    setShowContactInfo(false);
  }, []);

  // Mobile: toggle between conversation list and chat area
  if (isMobile) {
    return (
      <>
        {!activeConversationId ? (
          isConversationsLoading ? (
            <ConversationListSkeleton />
          ) : (
            <ConversationList
              activeId={activeConversationId}
              onSelect={setActiveConversationId}
              conversations={conversations}
              onConversationCreated={handleConversationCreated}
            />
          )
        ) : isMessagesLoading ? (
          <ChatAreaSkeleton />
        ) : (
          <ChatArea
            conversation={activeConversation}
            messages={messages}
            onSendMessage={handleSendMessage}
            onSendFile={handleSendFile}
            onEditMessage={handleEditMessage}
            onOpenContactInfo={() => setShowContactInfo(!showContactInfo)}
            isOtherUserTyping={isOtherUserTyping}
            onTyping={handleTyping}
            onBack={handleBack}
          />
        )}

        {showContactInfo && activeConversation && (
          <div className="fixed inset-0 z-40">
            <ContactInfoPanel
              name={activeConversation.name}
              avatar={activeConversation.avatar}
              email={activeRawConversation?.otherUser.email}
              chatSessionId={activeConversationId ?? undefined}
              onClose={() => setShowContactInfo(false)}
            />
          </div>
        )}
      </>
    );
  }

  // Desktop: side-by-side layout
  return (
    <>
      {isConversationsLoading ? (
        <ConversationListSkeleton />
      ) : (
        <ConversationList
          activeId={activeConversationId}
          onSelect={setActiveConversationId}
          conversations={conversations}
          onConversationCreated={handleConversationCreated}
        />
      )}
      {activeConversationId && isMessagesLoading ? (
        <ChatAreaSkeleton />
      ) : (
        <ChatArea
          conversation={activeConversation}
          messages={messages}
          onSendMessage={handleSendMessage}
          onSendFile={handleSendFile}
          onEditMessage={handleEditMessage}
          onOpenContactInfo={() => setShowContactInfo(!showContactInfo)}
          isOtherUserTyping={isOtherUserTyping}
          onTyping={handleTyping}
        />
      )}

      {showContactInfo && activeConversation && (
        <div className="absolute right-3 top-3 bottom-3 z-30">
          <ContactInfoPanel
            name={activeConversation.name}
            avatar={activeConversation.avatar}
            email={activeRawConversation?.otherUser.email}
            chatSessionId={activeConversationId ?? undefined}
            onClose={() => setShowContactInfo(false)}
          />
        </div>
      )}
    </>
  );
};

export default ChatPage;
