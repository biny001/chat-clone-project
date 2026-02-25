"use client";

import { useEffect } from "react";
import { useAbly } from "ably/react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export function useRealtimeConversations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;
  const ably = useAbly();

  useEffect(() => {
    if (!userId) return;

    const channel = ably.channels.get(`user:${userId}`);

    const onUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    channel.subscribe("conversation-update", onUpdate);
    channel.subscribe("message-read", onUpdate);

    return () => {
      channel.unsubscribe("conversation-update", onUpdate);
      channel.unsubscribe("message-read", onUpdate);
    };
  }, [ably, userId, queryClient]);
}
