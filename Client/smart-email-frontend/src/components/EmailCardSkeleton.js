"use client";

import Skeleton from "./Skeleton";

export default function EmailCardSkeleton() {
  return (
    <div className="glass p-4 rounded-xl space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>

      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}