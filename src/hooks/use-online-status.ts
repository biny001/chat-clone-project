"use client";

import { useEffect, useMemo, useState } from "react";
import { useAbly } from "ably/react";
import type { RealtimeChannel, PresenceMessage } from "ably";
import { useAuth } from "./use-auth";

export function useOnlineUsers() {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const ably = useAbly();
  const [presenceMembers, setPresenceMembers] = useState<PresenceMessage[]>([]);

  useEffect(() => {
    if (!currentUserId) return;

    const channel: RealtimeChannel = ably.channels.get("presence:lobby");

    const syncPresence = async () => {
      const members = await channel.presence.get();
      setPresenceMembers(members);
    };

    const onPresenceChange = () => {
      syncPresence();
    };

    channel.presence.enter({ status: "online" });
    channel.presence.subscribe("enter", onPresenceChange);
    channel.presence.subscribe("leave", onPresenceChange);
    channel.presence.subscribe("update", onPresenceChange);
    syncPresence();

    return () => {
      channel.presence.unsubscribe("enter", onPresenceChange);
      channel.presence.unsubscribe("leave", onPresenceChange);
      channel.presence.unsubscribe("update", onPresenceChange);
      channel.presence.leave();
    };
  }, [ably, currentUserId]);

  const onlineUserIds = useMemo(() => {
    const ids = new Set<string>();
    for (const member of presenceMembers) {
      if (member.clientId !== currentUserId) {
        ids.add(member.clientId);
      }
    }
    return ids;
  }, [presenceMembers, currentUserId]);

  return onlineUserIds;
}
