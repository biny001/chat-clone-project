"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { SharedMediaItem, SharedFileItem, SharedLinkItem } from "@/hooks/use-shared-media";

/** Reusable month header pill */
function MonthHeader({ month, variant = "primary" }: { month: string; variant?: "primary" | "secondary" }) {
  return (
    <div className="flex items-center px-3 py-2 h-8 rounded-lg bg-[#F8F8F5]">
      <span
        className="text-xs font-medium leading-4"
        style={{ color: variant === "secondary" ? "#596881" : "#8B8B8B" }}
      >
        {month}
      </span>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-2">
      <p className="text-sm text-muted-foreground">No {label} shared yet</p>
    </div>
  );
}

// --- Media Tab ---
interface MediaTabProps {
  mediaByMonth: { month: string; items: SharedMediaItem[] }[];
}

export const MediaTab = ({ mediaByMonth }: MediaTabProps) => {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  if (mediaByMonth.length === 0) return <EmptyState label="media" />;

  return (
    <>
      <div className="flex flex-col gap-3">
        {mediaByMonth.map((group) => (
          <div key={group.month} className="flex flex-col gap-1">
            <MonthHeader month={group.month} />
            <div className="grid grid-cols-4 gap-1">
              {group.items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxUrl(item.url)}
                  className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!lightboxUrl} onOpenChange={() => setLightboxUrl(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none [&>button]:text-white [&>button]:opacity-100">
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          {lightboxUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lightboxUrl}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg mx-auto"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// --- Links Tab ---
interface LinksTabProps {
  linksByMonth: { month: string; links: SharedLinkItem[] }[];
}

export const LinksTab = ({ linksByMonth }: LinksTabProps) => {
  if (linksByMonth.length === 0) return <EmptyState label="links" />;

  const getHostnameColor = (url: string) => {
    const colors = ["#3B82F6", "#EF4444", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899"];
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = url.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {linksByMonth.map((group) => (
        <div key={group.month} className="flex flex-col gap-3">
          <MonthHeader month={group.month} variant="secondary" />
          <div className="flex flex-col gap-4">
            {group.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div
                  className="w-[60px] h-[60px] shrink-0 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: getHostnameColor(link.url) }}
                >
                  {getHostname(link.url).charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <span className="text-sm font-medium leading-5 tracking-[-0.006em] truncate" style={{ color: "#111625" }}>
                    {link.url}
                  </span>
                  <span className="text-xs font-normal leading-4 line-clamp-2" style={{ color: "#8B8B8B" }}>
                    {link.context}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Docs Tab ---
interface DocsTabProps {
  filesByMonth: { month: string; items: SharedFileItem[] }[];
}

const fileTypeColors: Record<string, string> = {
  pdf: "#EF4444",
  doc: "#3B82F6",
  docx: "#3B82F6",
  xls: "#10B981",
  xlsx: "#10B981",
  ppt: "#F59E0B",
  pptx: "#F59E0B",
  txt: "#6B7280",
  zip: "#8B5CF6",
  rar: "#8B5CF6",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FileIcon = ({ type, tagColor }: { type: string; tagColor: string }) => (
  <svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip-file)">
      <path d="M8.09961 0.674805H19.9697L30.8252 11.5303V32.4004C30.825 34.0155 29.5155 35.325 27.9004 35.3252H8.09961C6.48449 35.325 5.17502 34.0155 5.1748 32.4004V3.59961C5.17502 1.98449 6.48449 0.675016 8.09961 0.674805Z" fill="white" stroke="#E8E5DF" strokeWidth="1.35"/>
      <path d="M19.7998 0.900002V9C19.7998 10.4912 21.0086 11.7 22.4998 11.7H30.5998" stroke="#E8E5DF" strokeWidth="1.35" strokeLinecap="round"/>
    </g>
    <rect y="16.9" width="22.5" height="14.6" rx="1.8" fill={tagColor}/>
    <text x="11.25" y="26.5" fill="white" fontFamily="Inter" fontWeight="700" fontSize="9" letterSpacing="-0.02em" textAnchor="middle" dominantBaseline="central" style={{ textTransform: "uppercase" as const }}>
      {type}
    </text>
    <defs>
      <clipPath id="clip-file">
        <rect width="27" height="36" fill="white" transform="translate(4.5)"/>
      </clipPath>
    </defs>
  </svg>
);

export const DocsTab = ({ filesByMonth }: DocsTabProps) => {
  if (filesByMonth.length === 0) return <EmptyState label="files" />;

  return (
    <div className="flex flex-col gap-3">
      {filesByMonth.map((group) => (
        <div key={group.month} className="flex flex-col gap-3">
          <MonthHeader month={group.month} variant="secondary" />
          <div className="flex flex-col gap-3">
            {group.items.map((file, i) => {
              const ext = file.name.split(".").pop()?.toLowerCase() || "";
              const tagColor = fileTypeColors[ext] || "#6B7280";

              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-[60px] h-[60px] shrink-0 rounded-xl bg-[#F3F3EE] flex items-center justify-center">
                    <FileIcon type={ext} tagColor={tagColor} />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <span className="text-sm font-medium leading-5 tracking-[-0.006em] truncate" style={{ color: "#1C1C1C" }}>
                      {file.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-normal leading-4" style={{ color: "#8B8B8B" }}>
                        {formatFileSize(file.size)}
                      </span>
                      <span className="text-xs font-normal leading-4" style={{ color: "#8B8B8B" }}>•</span>
                      <span className="text-xs font-normal leading-4 uppercase" style={{ color: "#8B8B8B" }}>
                        {ext}
                      </span>
                    </div>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={file.name}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-muted transition-colors"
                  >
                    <Download size={14} style={{ color: "#596881" }} />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
