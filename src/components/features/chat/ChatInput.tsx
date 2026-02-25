"use client";

import { useState, useRef, useCallback, useEffect, type FormEvent, type ClipboardEvent } from "react";
import { Mic, Smile, Paperclip, Send, Square, Trash2, Loader2, Play, Pause, X, Image, Video, FileText, MicIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import type { Message } from "@/types/chat";

export interface StagedFile {
  file: File;
  preview: string;
  isImage: boolean;
  isVideo: boolean;
}

interface ChatInputProps {
  onSend: (text: string) => void;
  onSendFile?: (data: { type: "image" | "file" | "audio"; fileUrl: string; fileName: string; fileSize: number }) => void;
  onTyping?: () => void;
  onStageFiles?: (files: StagedFile[]) => void;
  stagedFiles?: StagedFile[];
  onClearStaged?: () => void;
  /** Upload files with in-chat progress (bypasses preview overlay) */
  onDirectFileUpload?: (files: File[]) => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
}

export const ChatInput = ({
  onSend,
  onTyping,
  onStageFiles,
  stagedFiles = [],
  onDirectFileUpload,
  replyTo,
  onCancelReply,
}: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreRef = useRef<HTMLInputElement>(null);

  // Audio preview state
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [previewDuration, setPreviewDuration] = useState(0);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewAnimRef = useRef<number>(0);

  const { isRecording, recordingDuration, startRecording, stopRecording, cancelRecording } =
    useAudioRecorder();

  // Cleanup audio preview on unmount or when cleared
  useEffect(() => {
    return () => {
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.src = "";
      }
      cancelAnimationFrame(previewAnimRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearAudioPreview = useCallback(() => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.src = "";
      previewAudioRef.current = null;
    }
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    cancelAnimationFrame(previewAnimRef.current);
    setAudioBlob(null);
    setAudioPreviewUrl(null);
    setIsPreviewPlaying(false);
    setPreviewProgress(0);
    setPreviewDuration(0);
  }, [audioPreviewUrl]);

  // Preview playback progress loop
  const updatePreviewProgress = useCallback(() => {
    const audio = previewAudioRef.current;
    if (audio && audio.duration) {
      setPreviewProgress(audio.currentTime / audio.duration);
    }
    previewAnimRef.current = requestAnimationFrame(updatePreviewProgress);
  }, []);

  const togglePreviewPlay = useCallback(() => {
    const audio = previewAudioRef.current;
    if (!audio) return;
    if (isPreviewPlaying) {
      audio.pause();
      cancelAnimationFrame(previewAnimRef.current);
      setIsPreviewPlaying(false);
    } else {
      audio.play();
      previewAnimRef.current = requestAnimationFrame(updatePreviewProgress);
      setIsPreviewPlaying(true);
    }
  }, [isPreviewPlaying, updatePreviewProgress]);

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInputValue("");
  };

  const stageFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const newStaged: StagedFile[] = files.map((file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        return {
          file,
          preview: (isImage || isVideo) ? URL.createObjectURL(file) : "",
          isImage,
          isVideo,
        };
      });

      const hasVisual = newStaged.some((f) => f.isImage || f.isVideo);
      if (!hasVisual) {
        // Non-visual files: upload with in-chat progress
        onDirectFileUpload?.(files);
        return;
      }

      onStageFiles?.([...stagedFiles, ...newStaged]);
    },
    [onStageFiles, stagedFiles, onDirectFileUpload]
  );

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      stageFiles(files);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [stageFiles]
  );

  const handleAddMoreChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      stageFiles(files);
      if (addMoreRef.current) addMoreRef.current.value = "";
    },
    [stageFiles]
  );

  const handlePaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>) => {
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
        stageFiles(imageFiles);
      }
    },
    [stageFiles]
  );

  // Audio recording: stop → preview (don't send yet)
  const handleStopRecording = async () => {
    const blob = await stopRecording();
    if (blob) {
      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioPreviewUrl(url);

      // Create audio element for preview
      const audio = new Audio(url);
      previewAudioRef.current = audio;
      audio.addEventListener("loadedmetadata", () => {
        if (isFinite(audio.duration)) setPreviewDuration(audio.duration);
      });
      audio.addEventListener("ended", () => {
        setIsPreviewPlaying(false);
        setPreviewProgress(0);
        cancelAnimationFrame(previewAnimRef.current);
      });
    }
  };

  // Audio preview: confirm send → upload with in-chat progress
  const handleSendAudio = async () => {
    if (!audioBlob) return;
    clearAudioPreview();
    const file = new File([audioBlob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
    onDirectFileUpload?.([file]);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Waveform bars for audio preview
  const previewBars = 35;
  const previewWaveform = useRef(
    Array.from({ length: previewBars }, () => 0.2 + Math.random() * 0.8)
  ).current;

  // Hidden file inputs
  const fileInputs = (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
        onChange={handleFileChange}
      />
      <input
        ref={addMoreRef}
        type="file"
        className="hidden"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
        onChange={handleAddMoreChange}
      />
    </>
  );

  // === Recording UI ===
  if (isRecording) {
    return (
      <div className="pt-3">
        {fileInputs}
        <div className="flex items-center rounded-full border border-red-300 bg-red-50 pl-4 pr-1 py-1 gap-3 h-10">
          <div className="flex items-center gap-2 flex-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-medium text-red-600">
              Recording {formatDuration(recordingDuration)}
            </span>
          </div>
          <button
            type="button"
            onClick={cancelRecording}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-100 transition-colors"
          >
            <Trash2 size={14} className="text-red-500" />
          </button>
          <button
            type="button"
            onClick={handleStopRecording}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500"
          >
            <Square size={12} className="text-white" fill="white" />
          </button>
        </div>
      </div>
    );
  }

  // === Audio Preview UI (after recording, before sending) ===
  if (audioPreviewUrl) {
    return (
      <div className="pt-3">
        {fileInputs}
        <div className="flex items-center rounded-full border border-primary/30 bg-primary/5 pl-2 pr-1 py-1 gap-2 h-10">
          {/* Play/Pause */}
          <button
            type="button"
            onClick={togglePreviewPlay}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0"
          >
            {isPreviewPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
          </button>

          {/* Waveform */}
          <div className="flex items-end gap-[2px] h-5 flex-1">
            {previewWaveform.map((h, i) => {
              const filled = i / previewBars <= previewProgress;
              return (
                <div
                  key={i}
                  className={cn(
                    "w-[3px] rounded-full transition-colors duration-100",
                    filled ? "bg-primary" : "bg-primary/20"
                  )}
                  style={{ height: `${h * 100}%` }}
                />
              );
            })}
          </div>

          {/* Duration */}
          <span className="text-[10px] text-muted-foreground shrink-0 w-8 text-center">
            {previewDuration > 0 ? formatDuration(previewDuration) : formatDuration(recordingDuration)}
          </span>

          {/* Delete */}
          <button
            type="button"
            onClick={clearAudioPreview}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors shrink-0"
          >
            <Trash2 size={13} className="text-muted-foreground" />
          </button>

          {/* Send */}
          <button
            type="button"
            onClick={handleSendAudio}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary shrink-0"
          >
            <Send size={14} className="text-primary-foreground" />
          </button>
        </div>
      </div>
    );
  }

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when replying
  useEffect(() => {
    if (replyTo) inputRef.current?.focus();
  }, [replyTo]);

  function getReplyTypeIcon(type?: string) {
    switch (type) {
      case "image": return <Image size={12} className="shrink-0 text-primary" />;
      case "video": return <Video size={12} className="shrink-0 text-primary" />;
      case "audio": return <MicIcon size={12} className="shrink-0 text-primary" />;
      case "file": return <FileText size={12} className="shrink-0 text-primary" />;
      default: return null;
    }
  }

  function getReplyDisplayText(msg: Message) {
    switch (msg.type) {
      case "image": return "Photo";
      case "video": return "Video";
      case "audio": return "Voice message";
      case "file": return msg.fileName || "File";
      default: return msg.text;
    }
  }

  // === Default text input ===
  return (
    <form onSubmit={handleSubmit} className="pt-3">
      {fileInputs}
      {/* Reply bar */}
      {replyTo && (
        <div className="flex items-stretch mb-2 rounded-xl overflow-hidden bg-muted/60">
          <div className="w-1 shrink-0 bg-primary" />
          <div className="flex-1 flex flex-col gap-0.5 px-3 py-2 min-w-0">
            <span className="text-[11px] font-semibold text-primary truncate">
              {replyTo.sent ? "You" : "Reply"}
            </span>
            <div className="flex items-center gap-1">
              {replyTo.type && replyTo.type !== "text" && getReplyTypeIcon(replyTo.type)}
              <span className="text-[11px] text-muted-foreground truncate">
                {getReplyDisplayText(replyTo)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="px-3 flex items-center justify-center hover:bg-muted transition-colors"
          >
            <X size={14} className="text-muted-foreground" />
          </button>
        </div>
      )}
      <div className="flex items-center rounded-full border border-border pl-4 pr-1 py-1 gap-1 h-10">
        <input
          ref={inputRef}
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={startRecording}
            className="w-6 h-6 flex items-center justify-center rounded-full"
          >
            <Mic size={14} className="text-foreground" />
          </button>
          <button type="button" className="w-6 h-6 flex items-center justify-center rounded-full">
            <Smile size={14} className="text-foreground" />
          </button>
          <button
            type="button"
            onClick={handleFileSelect}
            className="w-6 h-6 flex items-center justify-center rounded-full"
          >
            <Paperclip size={14} className="text-foreground" />
          </button>
          <button
            type="submit"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary"
          >
            <Send size={16} className="text-primary-foreground" />
          </button>
        </div>
      </div>
    </form>
  );
};
