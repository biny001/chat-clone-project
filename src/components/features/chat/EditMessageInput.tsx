"use client";

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from "react";
import { Check, X } from "lucide-react";

interface EditMessageInputProps {
  initialContent: string;
  onSave: (content: string) => void;
  onCancel: () => void;
}

export const EditMessageInput = ({ initialContent, onSave, onCancel }: EditMessageInputProps) => {
  const [content, setContent] = useState(initialContent);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || trimmed === initialContent) {
      onCancel();
      return;
    }
    onSave(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
      <input
        ref={inputRef}
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent text-xs leading-4 text-foreground outline-none border border-border rounded-md px-2 py-1.5"
      />
      <button
        type="submit"
        className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground hover:opacity-80 transition-opacity"
      >
        <Check size={12} />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-foreground hover:opacity-80 transition-opacity"
      >
        <X size={12} />
      </button>
    </form>
  );
};
