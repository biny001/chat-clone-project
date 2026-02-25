"use client";

import { useEffect } from "react";
import { useAbly } from "ably/react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import type { ApiMessage } from "@/types/api";
import type { AblyNewMessageEvent } from "@/types/api";
import type { InboundMessage } from "ably";

export function useRealtimeMessages(chatSessionId: string | null) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const currentUserId = user?.id;
  const ably = useAbly();

  useEffect(() => {
    if (!chatSessionId || !currentUserId) return;

    const channel = ably.channels.get(`chat:${chatSessionId}`);

    const onNewMessage = (message: InboundMessage) => {
      const event = message.data as AblyNewMessageEvent;

      // Skip messages sent by current user (already in cache via mutation)
      if (event.senderId === currentUserId) return;

      // Inject into React Query cache
      queryClient.setQueryData<ApiMessage[]>(
        ["messages", chatSessionId],
        (old) => {
          if (!old) return [event];
          // Avoid duplicates
          if (old.some((m) => m.id === event.id)) return old;
          return [...old, event];
        }
      );
    };

    channel.subscribe("new-message", onNewMessage);

    return () => {
      channel.unsubscribe("new-message", onNewMessage);
    };
  }, [ably, chatSessionId, currentUserId, queryClient]);
}
