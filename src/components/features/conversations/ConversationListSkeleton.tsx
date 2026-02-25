"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const ConversationListSkeleton = () => {
  return (
    <div className="flex h-full w-full md:w-[400px] flex-col rounded-none md:rounded-3xl bg-card p-4 pt-6 md:p-6 gap-4 md:gap-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      {/* Search skeleton */}
      <div className="flex items-center gap-2 md:gap-4">
        <Skeleton className="flex-1 h-10 rounded-[10px]" />
        <Skeleton className="w-10 h-10 rounded-[10px]" />
      </div>

      {/* Conversation items skeleton */}
      <div className="flex flex-col gap-2 flex-1">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-3" style={{ height: 64 }}>
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
