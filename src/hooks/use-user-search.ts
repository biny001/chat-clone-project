"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiUser } from "@/types/api";
import type { Contact } from "@/types/chat";
import { toContact } from "@/lib/adapters";

async function searchUsers(query: string): Promise<ApiUser[]> {
  const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Failed to search users");
  return res.json();
}

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ["users", "search", query],
    queryFn: () => searchUsers(query),
    enabled: query.length > 0,
    select: (data: ApiUser[]): Contact[] => data.map(toContact),
  });
}
