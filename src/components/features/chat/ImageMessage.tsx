"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Message } from "@/types/chat";

interface ImageMessageProps {
  message: Message;
  isLast: boolean;
}

export const ImageMessage = ({ message, isLast }: ImageMessageProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "block overflow-hidden cursor-pointer",
            message.sent
              ? isLast ? "rounded-xl rounded-br-[4px]" : "rounded-xl"
              : isLast ? "rounded-xl rounded-bl-[4px]" : "rounded-xl"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={message.fileUrl}
            alt={message.fileName || "Image"}
            className="max-w-[280px] max-h-[280px] object-cover"
          />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none">
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
