"use client";

import { X } from "lucide-react";

interface UploadProgressOverlayProps {
  /** 0–100 */
  progress: number;
  onCancel?: () => void;
}

export const UploadProgressOverlay = ({ progress, onCancel }: UploadProgressOverlayProps) => {
  const radius = 18;
  const stroke = 3;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-[inherit]">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onCancel?.();
        }}
        className="relative flex items-center justify-center w-12 h-12"
      >
        {/* Background circle */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox={`0 0 ${(radius + stroke) * 2} ${(radius + stroke) * 2}`}
        >
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={stroke}
          />
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke="white"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-200"
          />
        </svg>
        <X size={14} className="text-white relative z-10" />
      </button>
    </div>
  );
};
