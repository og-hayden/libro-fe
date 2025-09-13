'use client';

import { Skeleton, SkeletonText, SkeletonCard } from '@/components/ui/Skeleton';

export function AnalysisSidebarSkeleton() {
  return (
    <div className="h-full p-6 bg-white dark:bg-stone-950">
      <div className="mb-6">
        <Skeleton className="h-7 w-32 mb-4" />
        <SkeletonText lines={2} />
      </div>
      
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <SkeletonCard />
          </div>
        ))}
      </div>
    </div>
  );
}
