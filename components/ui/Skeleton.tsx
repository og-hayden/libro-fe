'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-stone-200 dark:bg-stone-700 rounded ${className}`}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonVerse({ className = '' }: { className?: string }) {
  return (
    <div className={`p-3 rounded-lg ${className}`}>
      <div className="flex items-start space-x-3">
        <Skeleton className="w-6 h-4 flex-shrink-0 mt-1" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonButton({ className = '' }: { className?: string }) {
  return <Skeleton className={`h-10 rounded-lg ${className}`} />;
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 border border-stone-200 dark:border-stone-700 rounded-lg ${className}`}>
      <Skeleton className="h-6 w-3/4 mb-3" />
      <SkeletonText lines={2} />
    </div>
  );
}
