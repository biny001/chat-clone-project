"use client";

import { useState, useRef } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadProgressOverlay } from "./UploadProgressOverlay";
import type { Message } from "@/types/chat";

interface VideoMessageProps {
  message: Message;
  isLast: boolean;
  onCancelUpload?: () => void;
}

export const VideoMessage = ({ message, isLast, onCancelUpload }: VideoMessageProps) => {
  const [open, setOpen] = useState(false);
  const previewRef = useRef<HTMLVideoElement>(null);
  const isUploading = message.uploadProgress !== undefined;

  return (
    <>
      <div className="relative">
        <button
          onClick={() => !isUploading && setOpen(true)}
          className={cn(
            "block overflow-hidden relative",
            isUploading ? "cursor-default" : "cursor-pointer",
            message.sent
              ? isLast ? "rounded-xl rounded-br-[4px]" : "rounded-xl"
              : isLast ? "rounded-xl rounded-bl-[4px]" : "rounded-xl"
          )}
        >
          <video
            ref={previewRef}
            src={message.fileUrl}
            className={cn(
              "max-w-[280px] max-h-[280px] object-cover",
              isUploading && "opacity-70"
            )}
            muted
            autoPlay={isUploading}
            loop={isUploading}
            playsInline
            preload="metadata"
          />

          {/* Play icon overlay (when not uploading) */}
          {!isUploading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                <Play size={18} className="text-white ml-0.5" fill="white" />
              </div>
            </div>
          )}

          {/* Upload progress overlay */}
          {isUploading && (
            <UploadProgressOverlay
              progress={message.uploadProgress!}
              onCancel={onCancelUpload}
            />
          )}
        </button>
      </div>

      {/* Fullscreen video player dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-black/95 shadow-none">
          <DialogTitle className="sr-only">Video player</DialogTitle>
          <video
            src={message.fileUrl}
            className="max-w-full max-h-[85vh] rounded-lg mx-auto"
            controls
            autoPlay
            playsInline
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
