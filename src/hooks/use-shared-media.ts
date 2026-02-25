"use client";

import { useQuery } from "@tanstack/react-query";

interface SharedMediaItem {
  url: string;
  name: string;
  createdAt: string;
}

interface SharedFileItem {
  url: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
}

interface SharedLinkItem {
  url: string;
  context: string;
}

interface SharedMediaResponse {
  media: { month: string; items: SharedMediaItem[] }[];
  files: { month: string; items: SharedFileItem[] }[];
  links: { month: string; links: SharedLinkItem[] }[];
}

async function fetchSharedMedia(chatSessionId: string): Promise<SharedMediaResponse> {
  const res = await fetch(`/api/conversations/${chatSessionId}/media`);
  if (!res.ok) throw new Error("Failed to fetch shared media");
  return res.json();
}

export function useSharedMedia(chatSessionId: string | null) {
  return useQuery({
    queryKey: ["shared-media", chatSessionId],
    queryFn: () => fetchSharedMedia(chatSessionId!),
    enabled: !!chatSessionId,
  });
}

export type { SharedMediaItem, SharedFileItem, SharedLinkItem, SharedMediaResponse };
