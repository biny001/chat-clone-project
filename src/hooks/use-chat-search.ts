"use client";

import { useMemo } from "react";
import type { Message } from "@/types/chat";

export function useChatSearch(messages: Message[], query: string) {
  const results = useMemo(() => {
    if (!query.trim()) return messages;
    const lower = query.toLowerCase();
    return messages.filter((m) => m.text.toLowerCase().includes(lower));
  }, [messages, query]);

  const matchCount = query.trim() ? results.length : 0;

  return { results, matchCount };
}
