"use client";

import { cn } from "@/lib/utils";
import { FileText, Download } from "lucide-react";
import { formatFileSize } from "@/lib/adapters";
import { UploadProgressOverlay } from "./UploadProgressOverlay";
import type { Message } from "@/types/chat";

interface FileMessageProps {
  message: Message;
  isLast: boolean;
  onCancelUpload?: () => void;
}

export const FileMessage = ({ message, isLast, onCancelUpload }: FileMessageProps) => {
  const isUploading = message.uploadProgress !== undefined;

  return (
    <div className="relative">
      <div
        className={cn(
          "px-3 py-3 inline-block min-w-[200px] relative overflow-hidden",
          message.sent
            ? "bg-accent text-foreground"
            : "bg-card text-foreground",
          message.sent
            ? isLast ? "rounded-xl rounded-br-[4px]" : "rounded-xl"
            : isLast ? "rounded-xl rounded-bl-[4px]" : "rounded-xl"
        )}
      >
        <div className={cn("flex items-center gap-3", isUploading && "opacity-60")}>
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
          {isUploading ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center">
              <UploadProgressRing progress={message.uploadProgress!} onCancel={onCancelUpload} />
            </div>
          ) : (
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={message.fileName}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <Download size={14} className="text-foreground" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

/** Small inline circular progress for file cards */
const UploadProgressRing = ({ progress, onCancel }: { progress: number; onCancel?: () => void }) => {
  const radius = 12;
  const stroke = 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onCancel?.();
      }}
      className="relative flex items-center justify-center w-8 h-8"
    >
      <svg
        className="w-7 h-7 -rotate-90"
        viewBox={`0 0 ${(radius + stroke) * 2} ${(radius + stroke) * 2}`}
      >
        <circle
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-muted-foreground/20"
          strokeWidth={stroke}
        />
        <circle
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-primary"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 200ms" }}
        />
      </svg>
      <span className="absolute text-[8px] font-medium text-muted-foreground">
        {Math.round(progress)}%
      </span>
    </button>
  );
};
