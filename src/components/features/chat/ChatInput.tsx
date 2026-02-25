"use client";

import { useState, useRef, useCallback, type FormEvent, type ClipboardEvent } from "react";
import { Mic, Smile, Paperclip, Send, X, Loader2 } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";

interface ChatInputProps {
  onSend: (text: string) => void;
  onSendFile?: (data: { type: "image" | "file"; fileUrl: string; fileName: string; fileSize: number }) => void;
  onTyping?: () => void;
}

export const ChatInput = ({ onSend, onSendFile, onTyping }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("chatAttachment", {
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      setUploadProgress(0);
      if (res && res.length > 0) {
        for (const file of res) {
          const isImage = file.type?.startsWith("image/") ||
            /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
          onSendFile?.({
            type: isImage ? "image" : "file",
            fileUrl: file.ufsUrl,
            fileName: file.name,
            fileSize: file.size,
          });
        }
      }
    },
    onUploadError: () => {
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInputValue("");
  };

  const handleFileSelect = useCallback(async () => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    await startUpload(Array.from(files));

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [startUpload]);

  const handlePaste = useCallback(async (e: ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      setIsUploading(true);
      await startUpload(imageFiles);
    }
  }, [startUpload]);

  return (
    <form onSubmit={handleSubmit} className="pt-3">
      {isUploading && (
        <div className="flex items-center gap-2 px-4 pb-2">
          <Loader2 size={14} className="animate-spin text-primary" />
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{uploadProgress}%</span>
          <button
            type="button"
            onClick={() => setIsUploading(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={12} />
          </button>
        </div>
      )}
      <div className="flex items-center rounded-full border border-border pl-4 pr-1 py-1 gap-1 h-10">
        <input
          type="text"
          placeholder="Type any message..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onTyping?.();
          }}
          onPaste={handlePaste}
          className="flex-1 bg-transparent text-xs leading-4 text-foreground placeholder:text-muted-foreground outline-none"
        />
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
          onChange={handleFileChange}
        />
        <div className="flex items-center gap-2">
          <button type="button" className="w-6 h-6 flex items-center justify-center rounded-full">
            <Mic size={14} className="text-foreground" />
          </button>
          <button type="button" className="w-6 h-6 flex items-center justify-center rounded-full">
            <Smile size={14} className="text-foreground" />
          </button>
          <button
            type="button"
            onClick={handleFileSelect}
            disabled={isUploading}
            className="w-6 h-6 flex items-center justify-center rounded-full disabled:opacity-50"
          >
            <Paperclip size={14} className="text-foreground" />
          </button>
          <button type="submit" className="w-8 h-8 flex items-center justify-center rounded-full bg-primary">
            <Send size={16} className="text-primary-foreground" />
          </button>
        </div>
      </div>
    </form>
  );
};
