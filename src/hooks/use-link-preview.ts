"use client";

import { useQuery } from "@tanstack/react-query";
import type { LinkPreviewData } from "../../app/api/link-preview/route";

export type { LinkPreviewData };

async function fetchLinkPreview(url: string): Promise<LinkPreviewData> {
  const res = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
  if (!res.ok) throw new Error("Failed to fetch preview");
  return res.json();
}

export function useLinkPreview(url: string | null) {
  return useQuery({
    queryKey: ["link-preview", url],
    queryFn: () => fetchLinkPreview(url!),
    enabled: !!url,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000,
    retry: false,
  });
}

/** Extract the first URL from a string, or null if none found */
export function extractFirstUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s<>"']+/);
  return match ? match[0] : null;
}
