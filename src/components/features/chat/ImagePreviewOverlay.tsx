"use client";

import { useState, useMemo } from "react";
import { X, Send, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StagedFile {
  file: File;
  preview: string;
  isImage: boolean;
}

interface ImagePreviewOverlayProps {
  files: StagedFile[];
  onRemoveFile: (index: number) => void;
  onAddMore: () => void;
  onSend: (caption: string) => void;
  onCancel: () => void;
  isUploading: boolean;
}

export const ImagePreviewOverlay = ({
  files,
  onRemoveFile,
  onAddMore,
  onSend,
  onCancel,
  isUploading,
}: ImagePreviewOverlayProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [caption, setCaption] = useState("");

  const activeFile = files[activeIndex];

  // Clamp active index if files are removed
  const safeIndex = useMemo(() => {
    return Math.min(activeIndex, files.length - 1);
  }, [activeIndex, files.length]);

  if (safeIndex !== activeIndex) {
    setActiveIndex(safeIndex);
  }

  if (files.length === 0) return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-secondary rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onCancel}
          disabled={isUploading}
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors"
        >
          <X size={18} className="text-foreground" />
        </button>
        <span className="text-sm font-medium text-foreground">
          {files.length} {files.length === 1 ? "item" : "items"} selected
        </span>
        <div className="w-8" />
      </div>

      {/* Main preview area */}
      <div className="flex-1 flex items-center justify-center px-8 py-4 min-h-0">
        {activeFile?.isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeFile.preview}
            alt={activeFile.file.name}
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 p-8 rounded-2xl bg-card">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {activeFile?.file.name.split(".").pop()?.toUpperCase() || "FILE"}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground truncate max-w-[250px]">
              {activeFile?.file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {activeFile && formatBytes(activeFile.file.size)}
            </p>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {files.length > 1 && (
        <div className="flex items-center gap-2 px-4 pb-2 overflow-x-auto">
          {files.map((f, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all",
                i === activeIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              {f.isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.preview} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-[8px] font-bold text-muted-foreground">
                    {f.file.name.split(".").pop()?.toUpperCase()}
                  </span>
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFile(i);
                }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              >
                <X size={8} />
              </button>
            </button>
          ))}
          <button
            onClick={onAddMore}
            className="shrink-0 w-14 h-14 rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:border-primary transition-colors"
          >
            <Plus size={18} className="text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Caption input + send */}
      <div className="flex items-center gap-2 px-4 py-3">
        <input
          type="text"
          placeholder="Add a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isUploading) onSend(caption);
          }}
          disabled={isUploading}
          className="flex-1 h-10 rounded-full border border-border px-4 text-xs bg-card text-foreground placeholder:text-muted-foreground outline-none"
        />
        <button
          onClick={() => onSend(caption)}
          disabled={isUploading}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-primary disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 size={18} className="animate-spin text-primary-foreground" />
          ) : (
            <Send size={18} className="text-primary-foreground" />
          )}
        </button>
      </div>
    </div>
  );
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
