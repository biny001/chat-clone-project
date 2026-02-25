"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMarkAsRead(chatSessionId: string | null) {
  const queryClient = useQueryClient();
  const lastMarkedRef = useRef<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/conversations/${id}/read`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  useEffect(() => {
    if (!chatSessionId || chatSessionId === lastMarkedRef.current) return;
    lastMarkedRef.current = chatSessionId;
    mutation.mutate(chatSessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatSessionId]);

  return mutation;
}
