"use client";

import { cn } from "@/lib/utils";
import { Image, Video, FileText, Mic } from "lucide-react";

interface ReplyPreviewProps {
  senderName: string;
  text: string;
  type?: "text" | "image" | "video" | "file" | "audio";
  sent: boolean;
}

function getTypeLabel(type: string) {
  switch (type) {
    case "image": return "Photo";
    case "video": return "Video";
    case "audio": return "Voice message";
    case "file": return "File";
    default: return null;
  }
}

function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case "image": return <Image size={12} className="shrink-0 text-primary" />;
    case "video": return <Video size={12} className="shrink-0 text-primary" />;
    case "audio": return <Mic size={12} className="shrink-0 text-primary" />;
    case "file": return <FileText size={12} className="shrink-0 text-primary" />;
    default: return null;
  }
}

export const ReplyPreview = ({ senderName, text, type = "text", sent }: ReplyPreviewProps) => {
  const typeLabel = getTypeLabel(type);
  const displayText = typeLabel || text;

  return (
    <div
      className={cn(
        "flex items-stretch gap-0 rounded-lg overflow-hidden mb-1 max-w-[400px] cursor-pointer",
        sent ? "bg-primary/10" : "bg-muted/80"
      )}
    >
      <div className="w-1 shrink-0 bg-primary" />
      <div className="flex flex-col gap-0.5 px-2.5 py-1.5 min-w-0">
        <span className="text-[11px] font-semibold text-primary truncate">
          {senderName}
        </span>
        <div className="flex items-center gap-1">
          {type !== "text" && <TypeIcon type={type} />}
          <span className="text-[11px] text-muted-foreground truncate">
            {displayText}
          </span>
        </div>
      </div>
    </div>
  );
};
