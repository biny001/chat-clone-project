"use client";

import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLinkPreview, extractFirstUrl } from "@/hooks/use-link-preview";

interface LinkPreviewProps {
  text: string;
  sent: boolean;
}

export const LinkPreview = ({ text, sent }: LinkPreviewProps) => {
  const url = extractFirstUrl(text);
  const { data, isLoading } = useLinkPreview(url);

  if (!url || isLoading || !data) return null;

  const hostname = (() => {
    try {
      return new URL(data.url).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  })();

  return (
    <a
      href={data.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "block mt-1.5 rounded-lg overflow-hidden border max-w-[320px] hover:opacity-90 transition-opacity",
        sent
          ? "border-foreground/10 bg-background/40"
          : "border-border bg-muted/50"
      )}
    >
      {data.image && (
        <div className="w-full h-[160px] overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={data.image}
            alt={data.title || ""}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
      <div className="px-2.5 py-2 space-y-0.5">
        <div className="flex items-center gap-1.5">
          {data.favicon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.favicon}
              alt=""
              className="w-3.5 h-3.5 rounded-sm shrink-0"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span className="text-[10px] text-muted-foreground truncate">
            {data.siteName || hostname}
          </span>
          <ExternalLink size={9} className="text-muted-foreground shrink-0 ml-auto" />
        </div>
        {data.title && (
          <p className="text-[11px] font-medium leading-[14px] text-foreground line-clamp-2">
            {data.title}
          </p>
        )}
        {data.description && (
          <p className="text-[10px] leading-[13px] text-muted-foreground line-clamp-2">
            {data.description}
          </p>
        )}
      </div>
    </a>
  );
};
