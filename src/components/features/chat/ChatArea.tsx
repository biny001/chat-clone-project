"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatHeader } from "./ChatHeader";
import { ChatInput, type StagedFile } from "./ChatInput";
import { ImagePreviewOverlay } from "./ImagePreviewOverlay";
import { MessageGroup, groupMessages } from "./MessageBubble";
import { TypingBubble } from "./TypingBubble";
import { useChatSearch } from "@/hooks/use-chat-search";
import { useUploadThing } from "@/lib/uploadthing";
import type { Conversation, Message } from "@/types/chat";

interface ChatAreaProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSendFile?: (data: { type: "image" | "file" | "audio"; fileUrl: string; fileName: string; fileSize: number }) => void;
  onEditMessage?: (id: string, content: string) => void;
  onOpenContactInfo?: () => void;
  isOtherUserTyping?: boolean;
  onTyping?: () => void;
}

export const ChatArea = ({
  conversation,
  messages: chatMessages,
  onSendMessage,
  onSendFile,
  onEditMessage,
  onOpenContactInfo,
  isOtherUserTyping,
  onTyping,
}: ChatAreaProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const addMoreRef = useRef<HTMLInputElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isUploadingStagedFiles, setIsUploadingStagedFiles] = useState(false);

  const { results: displayMessages, matchCount } = useChatSearch(chatMessages, searchQuery);

  const { startUpload } = useUploadThing("chatAttachment", {
    onClientUploadComplete: (res) => {
      setIsUploadingStagedFiles(false);
      if (res && res.length > 0) {
        for (const file of res) {
          const isImage =
            file.type?.startsWith("image/") ||
            /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
          onSendFile?.({
            type: isImage ? "image" : "file",
            fileUrl: file.ufsUrl,
            fileName: file.name,
            fileSize: file.size,
          });
        }
      }
      // Clean up previews
      for (const f of stagedFiles) {
        if (f.preview) URL.revokeObjectURL(f.preview);
      }
      setStagedFiles([]);
    },
    onUploadError: () => {
      setIsUploadingStagedFiles(false);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length, isOtherUserTyping]);

  // Reset search + staged files when conversation changes
  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setStagedFiles([]);
  }, [conversation?.id]);

  const handleStageFiles = useCallback((files: StagedFile[]) => {
    setStagedFiles(files);
  }, []);

  const handleRemoveStagedFile = useCallback(
    (index: number) => {
      const file = stagedFiles[index];
      if (file.preview) URL.revokeObjectURL(file.preview);
      setStagedFiles((prev) => prev.filter((_, i) => i !== index));
    },
    [stagedFiles]
  );

  const handleSendStaged = useCallback(
    async (caption: string) => {
      if (stagedFiles.length === 0) return;

      // Send caption as a separate text message if provided
      if (caption.trim()) {
        onSendMessage(caption.trim());
      }

      setIsUploadingStagedFiles(true);
      const files = stagedFiles.map((s) => s.file);
      await startUpload(files);
    },
    [stagedFiles, onSendMessage, startUpload]
  );

  const handleCancelStaged = useCallback(() => {
    for (const f of stagedFiles) {
      if (f.preview) URL.revokeObjectURL(f.preview);
    }
    setStagedFiles([]);
  }, [stagedFiles]);

  const handleAddMore = useCallback(() => {
    addMoreRef.current?.click();
  }, []);

  const handleAddMoreChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const newStaged: StagedFile[] = Array.from(files).map((file) => ({
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
        isImage: file.type.startsWith("image/"),
      }));
      setStagedFiles((prev) => [...prev, ...newStaged]);
      if (addMoreRef.current) addMoreRef.current.value = "";
    },
    []
  );

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-3xl bg-card">
        <p className="text-muted-foreground text-sm">Select a conversation to start messaging</p>
      </div>
    );
  }

  const groupedMessages = groupMessages(displayMessages);
  const hasStaged = stagedFiles.length > 0;

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col rounded-3xl bg-card p-3 overflow-hidden">
        <ChatHeader
          conversation={conversation}
          onOpenContactInfo={onOpenContactInfo}
          isOtherUserTyping={isOtherUserTyping}
          searchOpen={searchOpen}
          onToggleSearch={() => {
            setSearchOpen(!searchOpen);
            if (searchOpen) setSearchQuery("");
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchMatchCount={matchCount}
        />

        <div className="flex-1 relative rounded-2xl bg-secondary overflow-hidden">
          {/* Hidden file input for "add more" in preview */}
          <input
            ref={addMoreRef}
            type="file"
            className="hidden"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
            onChange={handleAddMoreChange}
          />

          {/* Image preview overlay */}
          {hasStaged && (
            <ImagePreviewOverlay
              files={stagedFiles}
              onRemoveFile={handleRemoveStagedFile}
              onAddMore={handleAddMore}
              onSend={handleSendStaged}
              onCancel={handleCancelStaged}
              isUploading={isUploadingStagedFiles}
            />
          )}

          {/* Messages area */}
          <ScrollArea className="h-full">
            <div className="flex flex-col justify-end min-h-full p-3 gap-3">
              <div className="flex justify-center">
                <span
                  className="px-3 py-1 rounded-full bg-card text-sm font-medium leading-5 tracking-[-0.006em]"
                  style={{ color: "#596881" }}
                >
                  Today
                </span>
              </div>

              {groupedMessages.map((group, gi) => (
                <MessageGroup
                  key={gi}
                  sent={group.sent}
                  messages={group.messages}
                  onEditMessage={onEditMessage}
                />
              ))}
              {isOtherUserTyping && <TypingBubble />}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        </div>

        <ChatInput
          onSend={onSendMessage}
          onSendFile={onSendFile}
          onTyping={onTyping}
          onStageFiles={handleStageFiles}
          stagedFiles={stagedFiles}
          onClearStaged={handleCancelStaged}
        />
      </div>
    </div>
  );
};

export default ChatArea;
