"use client";

import { useEffect } from "react";
import { useAbly } from "ably/react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import type { ApiMessage } from "@/types/api";
import type { AblyNewMessageEvent, AblyMessageEditedEvent } from "@/types/api";
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

      if (event.senderId === currentUserId) {
        // Own message arrived from server — replace any optimistic entry
        queryClient.setQueryData<ApiMessage[]>(
          ["messages", chatSessionId],
          (old) => {
            if (!old) return [event as ApiMessage];
            // Remove optimistic entries and add the real one (if not already present)
            const withoutOptimistic = old.filter(
              (m) => !m.id.startsWith("optimistic-")
            );
            if (withoutOptimistic.some((m) => m.id === event.id)) return withoutOptimistic;
            return [...withoutOptimistic, event as ApiMessage];
          }
        );
        return;
      }

      // Other user's message — inject into cache
      queryClient.setQueryData<ApiMessage[]>(
        ["messages", chatSessionId],
        (old) => {
          if (!old) return [event as ApiMessage];
          // Avoid duplicates
          if (old.some((m) => m.id === event.id)) return old;
          return [...old, event as ApiMessage];
        }
      );
    };

    const onMessageEdited = (message: InboundMessage) => {
      const event = message.data as AblyMessageEditedEvent;

      queryClient.setQueryData<ApiMessage[]>(
        ["messages", chatSessionId],
        (old) => {
          if (!old) return old;
          return old.map((m) =>
            m.id === event.id
              ? { ...m, content: event.content, editedAt: event.editedAt }
              : m
          );
        }
      );
    };

    const onMessageRead = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    channel.subscribe("new-message", onNewMessage);
    channel.subscribe("message-edited", onMessageEdited);
    channel.subscribe("message-read", onMessageRead);

    return () => {
      channel.unsubscribe("new-message", onNewMessage);
      channel.unsubscribe("message-edited", onMessageEdited);
      channel.unsubscribe("message-read", onMessageRead);
    };
  }, [ably, chatSessionId, currentUserId, queryClient]);
}
