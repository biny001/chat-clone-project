"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiConversation, CreateConversationResponse } from "@/types/api";
import type { Conversation } from "@/types/chat";
import { toConversation } from "@/lib/adapters";

async function fetchConversations(): Promise<ApiConversation[]> {
  const res = await fetch("/api/conversations");
  if (!res.ok) throw new Error("Failed to fetch conversations");
  return res.json();
}

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });
}

export function useConversationList(onlineUserIds?: Set<string>) {
  const query = useConversations();

  const conversations: Conversation[] =
    query.data?.map((api) => toConversation(api, onlineUserIds)) ?? [];

  return {
    ...query,
    data: conversations,
    rawData: query.data ?? [],
  };
}

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string): Promise<CreateConversationResponse> => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}
