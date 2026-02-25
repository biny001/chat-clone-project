"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";

interface AudioMessageProps {
  message: Message;
  isLast: boolean;
}

export const AudioMessage = ({ message, isLast }: AudioMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const audio = new Audio(message.fileUrl);
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      if (isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    });

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setProgress(0);
      cancelAnimationFrame(animationRef.current);
    });

    return () => {
      audio.pause();
      audio.src = "";
      cancelAnimationFrame(animationRef.current);
    };
  }, [message.fileUrl]);

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress(audio.currentTime / audio.duration);
    }
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(updateProgress);
    }
    return () => cancelAnimationFrame(animationRef.current);
  }, [isPlaying, updateProgress]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Generate fake waveform bars
  const bars = 28;
  const waveformHeights = useRef(
    Array.from({ length: bars }, () => 0.2 + Math.random() * 0.8)
  ).current;

  return (
    <div className="relative">
      <div
        className={cn(
          "px-3 py-2.5 inline-flex items-center gap-2.5 min-w-[220px]",
          message.sent
            ? "bg-accent text-foreground"
            : "bg-card text-foreground",
          message.sent
            ? isLast ? "rounded-xl rounded-br-[4px]" : "rounded-xl"
            : isLast ? "rounded-xl rounded-bl-[4px]" : "rounded-xl"
        )}
      >
        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>

        {/* Waveform */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-end gap-[2px] h-5">
            {waveformHeights.map((h, i) => {
              const filled = i / bars <= progress;
              return (
                <div
                  key={i}
                  className={cn(
                    "w-[3px] rounded-full transition-colors duration-100",
                    filled ? "bg-primary" : "bg-muted-foreground/30"
                  )}
                  style={{ height: `${h * 100}%` }}
                />
              );
            })}
          </div>
          <span className="text-[10px] text-muted-foreground">
            {isPlaying || progress > 0
              ? formatTime((audioRef.current?.currentTime ?? 0))
              : duration > 0
                ? formatTime(duration)
                : "0:00"}
          </span>
        </div>
      </div>
    </div>
  );
};
