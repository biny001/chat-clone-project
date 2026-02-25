"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiMessage, SendMessagePayload, SendMessageResponse } from "@/types/api";
import type { Message } from "@/types/chat";
import { toMessage } from "@/lib/adapters";
import { useAuth } from "./use-auth";

async function fetchMessages(chatSessionId: string): Promise<ApiMessage[]> {
  const res = await fetch(`/api/conversations/${chatSessionId}/messages`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
}

export function useMessages(chatSessionId: string | null) {
  const { user } = useAuth();
  const currentUserId = user?.id ?? "";

  return useQuery({
    queryKey: ["messages", chatSessionId],
    queryFn: () => fetchMessages(chatSessionId!),
    enabled: !!chatSessionId,
    select: (data: ApiMessage[]): Message[] =>
      data.map((m) => toMessage(m, currentUserId)),
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SendMessagePayload): Promise<SendMessageResponse> => {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.chatSessionId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export function useEditMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string; chatSessionId: string }) => {
      const res = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to edit message");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.chatSessionId] });
    },
  });
}
