"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useMarkAsRead(chatSessionId: string | null) {
  const queryClient = useQueryClient();
  const chatSessionIdRef = useRef(chatSessionId);
  const pendingRef = useRef(false);

  // Keep ref in sync
  chatSessionIdRef.current = chatSessionId;

  const markAsRead = useCallback(async () => {
    const id = chatSessionIdRef.current;
    if (!id || pendingRef.current) return;

    pendingRef.current = true;
    try {
      const res = await fetch(`/api/conversations/${id}/read`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch {
      // silently fail
    } finally {
      pendingRef.current = false;
    }
  }, [queryClient]);

  // Mark on conversation switch
  useEffect(() => {
    if (!chatSessionId) return;
    markAsRead();
  }, [chatSessionId, markAsRead]);

  return { markAsRead };
}
