"use client";

import { Skeleton } from "@/components/ui/skeleton";

export const ChatAreaSkeleton = () => {
  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col rounded-none md:rounded-3xl bg-card p-2 md:p-3 overflow-hidden">
        {/* Header skeleton */}
        <div className="flex items-center px-2 md:px-3 pt-1 pb-3 md:pb-4 gap-2 md:gap-3">
          <Skeleton className="h-9 w-9 md:h-10 md:w-10 rounded-full shrink-0" />
          <div className="flex flex-col gap-1.5 flex-1">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-14" />
          </div>
          <div className="flex items-center gap-1.5 md:gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className={`w-8 h-8 rounded-lg ${i > 0 ? "hidden md:block" : ""}`} />
            ))}
          </div>
        </div>

        {/* Messages area skeleton */}
        <div className="flex-1 rounded-xl md:rounded-2xl bg-secondary overflow-hidden p-2 md:p-3">
          <div className="flex flex-col justify-end min-h-full gap-3">
            {/* Date badge */}
            <div className="flex justify-center">
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            {/* Received messages */}
            <div className="flex flex-col gap-1 items-start">
              <Skeleton className="h-10 w-48 rounded-xl rounded-bl-[4px]" />
              <Skeleton className="h-3 w-14 mt-1" />
            </div>

            {/* Sent messages */}
            <div className="flex flex-col gap-1 items-end">
              <Skeleton className="h-10 w-56 rounded-xl rounded-br-[4px]" />
              <Skeleton className="h-3 w-14 mt-1" />
            </div>

            {/* Received messages */}
            <div className="flex flex-col gap-1 items-start">
              <Skeleton className="h-10 w-40 rounded-xl" />
              <Skeleton className="h-16 w-52 rounded-xl rounded-bl-[4px]" />
              <Skeleton className="h-3 w-14 mt-1" />
            </div>

            {/* Sent messages */}
            <div className="flex flex-col gap-1 items-end">
              <Skeleton className="h-10 w-44 rounded-xl" />
              <Skeleton className="h-10 w-60 rounded-xl rounded-br-[4px]" />
              <Skeleton className="h-3 w-14 mt-1" />
            </div>

            {/* Received */}
            <div className="flex flex-col gap-1 items-start">
              <Skeleton className="h-10 w-36 rounded-xl rounded-bl-[4px]" />
              <Skeleton className="h-3 w-14 mt-1" />
            </div>
          </div>
        </div>

        {/* Input skeleton */}
        <div className="pt-3">
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
};
