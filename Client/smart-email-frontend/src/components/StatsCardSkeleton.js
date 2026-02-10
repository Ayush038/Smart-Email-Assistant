"use client";

export default function StatsCardSkeleton() {
  return (
    <div className="glass rounded-xl p-4 animate-pulse">
      <div className="h-4 w-24 bg-white/10 rounded mb-2" />
      <div className="h-8 w-12 bg-white/10 rounded" />
    </div>
  );
}