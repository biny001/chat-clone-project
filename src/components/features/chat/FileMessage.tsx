"use client";

import { cn } from "@/lib/utils";
import { FileText, Download } from "lucide-react";
import { formatFileSize } from "@/lib/adapters";
import type { Message } from "@/types/chat";

interface FileMessageProps {
  message: Message;
  isLast: boolean;
}

export const FileMessage = ({ message, isLast }: FileMessageProps) => {
  return (
    <div className="relative">
      <div
        className={cn(
          "px-3 py-3 inline-block min-w-[200px]",
          message.sent
            ? "bg-accent text-foreground"
            : "bg-card text-foreground",
          message.sent
            ? isLast ? "rounded-xl rounded-br-[4px]" : "rounded-xl"
            : isLast ? "rounded-xl rounded-bl-[4px]" : "rounded-xl"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <FileText size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">
              {message.fileName || "File"}
            </p>
            {message.fileSize && (
              <p className="text-[10px] text-muted-foreground">
                {formatFileSize(message.fileSize)}
              </p>
            )}
          </div>
          <a
            href={message.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download={message.fileName}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <Download size={14} className="text-foreground" />
          </a>
        </div>
      </div>
    </div>
  );
};
