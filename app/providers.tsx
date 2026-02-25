"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AblyProvider } from "ably/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useState, useEffect } from "react";
import { createAblyClient } from "@/lib/ably-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [ablyClient] = useState(() => createAblyClient());

  // Connect only on the client — avoids SSR auth errors from relative fetch URL
  useEffect(() => {
    ablyClient.connect();
    return () => {
      ablyClient.close();
    };
  }, [ablyClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <AblyProvider client={ablyClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {children}
        </TooltipProvider>
      </AblyProvider>
    </QueryClientProvider>
  );
}
