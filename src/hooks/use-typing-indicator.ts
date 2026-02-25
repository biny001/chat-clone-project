"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAbly } from "ably/react";
import type { RealtimeChannel, PresenceMessage } from "ably";
import { useAuth } from "./use-auth";

export function useTypingIndicator(chatSessionId: string | null) {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const ably = useAbly();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [presenceMembers, setPresenceMembers] = useState<PresenceMessage[]>([]);

  useEffect(() => {
    if (!chatSessionId || !currentUserId) {
      channelRef.current = null;
      setPresenceMembers([]);
      return;
    }

    const channel = ably.channels.get(`chat:${chatSessionId}`);
    channelRef.current = channel;

    const syncPresence = async () => {
      try {
        const members = await channel.presence.get();
        setPresenceMembers(members);
      } catch {
        // Channel may not be attached yet
      }
    };

    const onPresenceChange = () => {
      syncPresence();
    };

    channel.presence.enter({ typing: false });
    channel.presence.subscribe("enter", onPresenceChange);
    channel.presence.subscribe("leave", onPresenceChange);
    channel.presence.subscribe("update", onPresenceChange);
    syncPresence();

    return () => {
      channel.presence.unsubscribe("enter", onPresenceChange);
      channel.presence.unsubscribe("leave", onPresenceChange);
      channel.presence.unsubscribe("update", onPresenceChange);
      channel.presence.leave();
      channelRef.current = null;
      setPresenceMembers([]);
    };
  }, [ably, chatSessionId, currentUserId]);

  const isOtherUserTyping = presenceMembers.some(
    (member) =>
      member.clientId !== currentUserId &&
      (member.data as { typing?: boolean })?.typing === true
  );

  const handleTyping = useCallback(() => {
    if (!channelRef.current) return;

    channelRef.current.presence.update({ typing: true });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      channelRef.current?.presence.update({ typing: false });
      timeoutRef.current = null;
    }, 1500);
  }, []);

  return { isOtherUserTyping, handleTyping };
}
