"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { UploadProgressOverlay } from "./UploadProgressOverlay";
import type { Message } from "@/types/chat";

interface ImageMessageProps {
  message: Message;
  isLast: boolean;
  onCancelUpload?: () => void;
}

export const ImageMessage = ({ message, isLast, onCancelUpload }: ImageMessageProps) => {
  const [open, setOpen] = useState(false);
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={message.fileUrl}
            alt={message.fileName || "Image"}
            className={cn(
              "max-w-[280px] max-h-[280px] object-cover",
              isUploading && "opacity-70"
            )}
          />
          {isUploading && (
            <UploadProgressOverlay
              progress={message.uploadProgress!}
              onCancel={onCancelUpload}
            />
          )}
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none [&>button]:text-white [&>button]:opacity-100">
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={message.fileUrl}
            alt={message.fileName || "Image"}
            className="max-w-full max-h-[85vh] object-contain rounded-lg mx-auto"
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
