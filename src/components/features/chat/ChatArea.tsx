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

type MediaType = "image" | "video" | "file" | "audio";

interface UploadingMessage {
  id: string;
  type: MediaType;
  localUrl: string;
  fileName: string;
  fileSize: number;
  progress: number;
}

function detectFileType(file: File): MediaType {
  if (file.type.startsWith("image/")) return "image";
  // audio/ must be checked before video/ because audio/webm starts with audio/
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("video/")) return "video";
  // Fallback by extension
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["mp3", "ogg", "wav", "m4a", "flac"].includes(ext)) return "audio";
  if (["mp4", "mov", "avi", "mkv", "m4v"].includes(ext)) return "video";
  // webm can be audio or video — voice recordings use "voice-" prefix
  if (ext === "webm") return file.name.startsWith("voice-") ? "audio" : "video";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext)) return "image";
  return "file";
}

interface ChatAreaProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSendFile?: (data: { type: MediaType; fileUrl: string; fileName: string; fileSize: number }) => void;
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
  const [uploadingMessages, setUploadingMessages] = useState<UploadingMessage[]>([]);

  // Ref to store pending file metadata for correlating with upload results
  const pendingFilesRef = useRef<{ id: string; file: File; type: MediaType; localUrl: string }[]>([]);

  const { results: displayMessages, matchCount } = useChatSearch(chatMessages, searchQuery);

  const { startUpload, isUploading: isUploadThingActive } = useUploadThing("chatAttachment", {
    onUploadProgress: (progress) => {
      // UploadThing gives a single aggregate progress — apply to all pending
      setUploadingMessages((prev) =>
        prev.map((m) => ({ ...m, progress }))
      );
    },
    onClientUploadComplete: (res) => {
      if (res && res.length > 0) {
        for (const file of res) {
          // Match type from our pending files ref (most reliable)
          const pending = pendingFilesRef.current.find((p) => p.file.name === file.name);
          let type: MediaType = pending?.type ?? "file";
          if (!pending) {
            // Fallback detection — check audio before video (webm ambiguity)
            if (file.type?.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)) {
              type = "image";
            } else if (file.type?.startsWith("audio/") || /\.(mp3|ogg|wav|m4a|flac)$/i.test(file.name) || /^voice-.*\.webm$/i.test(file.name)) {
              type = "audio";
            } else if (file.type?.startsWith("video/") || /\.(mp4|webm|mov|avi|mkv|m4v)$/i.test(file.name)) {
              type = "video";
            }
          }
          onSendFile?.({
            type,
            fileUrl: file.ufsUrl,
            fileName: file.name,
            fileSize: file.size,
          });
        }
      }
      // Clean up uploading messages and revoke blob URLs
      for (const um of pendingFilesRef.current) {
        URL.revokeObjectURL(um.localUrl);
      }
      pendingFilesRef.current = [];
      setUploadingMessages([]);
    },
    onUploadError: () => {
      // Clean up on error
      for (const um of pendingFilesRef.current) {
        URL.revokeObjectURL(um.localUrl);
      }
      pendingFilesRef.current = [];
      setUploadingMessages([]);
    },
  });

  // Merge uploading messages into display list
  const mergedMessages: Message[] = [
    ...displayMessages,
    ...uploadingMessages.map((um): Message => ({
      id: um.id,
      conversationId: conversation?.id || "",
      text: um.type === "image" || um.type === "video" ? "" : um.type === "audio" ? "" : um.fileName,
      timestamp: "Sending...",
      sent: true,
      type: um.type,
      fileUrl: um.localUrl,
      fileName: um.fileName,
      fileSize: um.fileSize,
      uploadProgress: um.progress,
    })),
  ];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length, uploadingMessages.length, isOtherUserTyping]);

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

      // Create uploading messages with local blob URLs for instant preview
      const pending: typeof pendingFilesRef.current = [];
      const newUploadingMsgs: UploadingMessage[] = [];

      for (const staged of stagedFiles) {
        const type = detectFileType(staged.file);
        const localUrl = staged.preview || URL.createObjectURL(staged.file);
        const id = `uploading-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        pending.push({ id, file: staged.file, type, localUrl });
        newUploadingMsgs.push({
          id,
          type,
          localUrl,
          fileName: staged.file.name,
          fileSize: staged.file.size,
          progress: 0,
        });
      }

      pendingFilesRef.current = pending;
      setUploadingMessages(newUploadingMsgs);
      setStagedFiles([]);

      // Start the actual upload
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
      const newStaged: StagedFile[] = Array.from(files).map((file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        return {
          file,
          preview: (isImage || isVideo) ? URL.createObjectURL(file) : "",
          isImage,
          isVideo,
        };
      });
      setStagedFiles((prev) => [...prev, ...newStaged]);
      if (addMoreRef.current) addMoreRef.current.value = "";
    },
    []
  );

  // Handle cancel of an in-progress upload
  const handleCancelUpload = useCallback((id: string) => {
    // Remove the specific uploading message from UI
    setUploadingMessages((prev) => prev.filter((m) => m.id !== id));
    const pending = pendingFilesRef.current.find((p) => p.id === id);
    if (pending) {
      URL.revokeObjectURL(pending.localUrl);
      pendingFilesRef.current = pendingFilesRef.current.filter((p) => p.id !== id);
    }
  }, []);

  // Handle file uploads from ChatInput (non-image files that skip the preview overlay)
  const handleSendFileFromInput = useCallback(
    (data: { type: MediaType; fileUrl: string; fileName: string; fileSize: number }) => {
      onSendFile?.(data);
    },
    [onSendFile]
  );

  // Handle non-image file upload with progress (from ChatInput paperclip)
  const handleDirectFileUpload = useCallback(
    async (files: File[]) => {
      const pending: typeof pendingFilesRef.current = [];
      const newUploadingMsgs: UploadingMessage[] = [];

      for (const file of files) {
        const type = detectFileType(file);
        const localUrl = URL.createObjectURL(file);
        const id = `uploading-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        pending.push({ id, file, type, localUrl });
        newUploadingMsgs.push({
          id,
          type,
          localUrl,
          fileName: file.name,
          fileSize: file.size,
          progress: 0,
        });
      }

      pendingFilesRef.current = [...pendingFilesRef.current, ...pending];
      setUploadingMessages((prev) => [...prev, ...newUploadingMsgs]);

      await startUpload(files);
    },
    [startUpload]
  );

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-3xl bg-card">
        <p className="text-muted-foreground text-sm">Select a conversation to start messaging</p>
      </div>
    );
  }

  const groupedMessages = groupMessages(mergedMessages);
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
              isUploading={isUploadThingActive}
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
                  onCancelUpload={handleCancelUpload}
                />
              ))}
              {isOtherUserTyping && <TypingBubble />}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        </div>

        <ChatInput
          onSend={onSendMessage}
          onSendFile={handleSendFileFromInput}
          onTyping={onTyping}
          onStageFiles={handleStageFiles}
          stagedFiles={stagedFiles}
          onClearStaged={handleCancelStaged}
          onDirectFileUpload={handleDirectFileUpload}
        />
      </div>
    </div>
  );
};

export default ChatArea;
