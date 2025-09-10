"use client";

export default function Skeleton({ className = "h-4 w-24" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-700/50 dark:bg-gray-700/50 ${className}`}
      role="status"
      aria-busy="true"
      aria-label="Loading"
    />
  );
}
