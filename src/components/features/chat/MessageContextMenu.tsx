"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Pencil, Copy, Reply } from "lucide-react";

interface MessageContextMenuProps {
  children: React.ReactNode;
  canEdit: boolean;
  text: string;
  onEdit: () => void;
  onReply?: () => void;
}

export const MessageContextMenu = ({ children, canEdit, text, onEdit, onReply }: MessageContextMenuProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-[160px] rounded-xl p-1.5 border-border">
        {onReply && (
          <ContextMenuItem onClick={onReply} className="gap-2 rounded-lg px-2 py-1.5 text-xs">
            <Reply size={14} /> Reply
          </ContextMenuItem>
        )}
        {canEdit && (
          <ContextMenuItem onClick={onEdit} className="gap-2 rounded-lg px-2 py-1.5 text-xs">
            <Pencil size={14} /> Edit message
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={handleCopy} className="gap-2 rounded-lg px-2 py-1.5 text-xs">
          <Copy size={14} /> Copy text
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
