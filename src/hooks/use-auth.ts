"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut as authSignOut } from "@/lib/auth-client";

export function useAuth() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const user = session?.user ?? null;

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  const signOut = async () => {
    await authSignOut();
    router.replace("/auth");
  };

  return { user, isPending, userInitials, signOut };
}
