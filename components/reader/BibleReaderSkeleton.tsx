'use client';

import { Skeleton } from '@/components/ui/Skeleton';

export function BibleReaderSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-stone-950">
      {/* Header */}
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-4">
              {/* Breadcrumb Navigation Skeleton */}
              <nav className="flex items-center space-x-2 text-sm">
                <Skeleton className="h-4 w-12" />
                <span className="text-stone-300 dark:text-stone-600">›</span>
                <Skeleton className="h-4 w-20" />
                <span className="text-stone-300 dark:text-stone-600">›</span>
                <Skeleton className="h-4 w-16" />
              </nav>
            </div>
            
            <div>
              {/* Book and Chapter Title */}
              <Skeleton className="h-8 w-48 mb-2" />
              {/* Verse count and testament info */}
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          
          <div className="flex flex-col space-y-3 items-end">
            {/* Text Size Control Skeleton */}
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-16" />
              <div className="flex items-center bg-stone-50 dark:bg-stone-900 rounded-full p-1 border border-stone-200 dark:border-stone-700">
                <Skeleton className="h-6 w-6 rounded-full mx-1" />
                <Skeleton className="h-6 w-6 rounded-full mx-1" />
                <Skeleton className="h-6 w-6 rounded-full mx-1" />
                <Skeleton className="h-6 w-6 rounded-full mx-1" />
              </div>
            </div>

            {/* Perspectives Dropdown Skeleton */}
            <Skeleton className="h-8 w-32 rounded-full" />
          </div>
        </div>
      </div>

      {/* Verses */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-12 py-8 relative">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-0 pb-32">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="group relative py-3 px-4 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors">
                <div className="flex items-start space-x-4">
                  {/* Verse number skeleton */}
                  <Skeleton className="h-6 w-6 rounded-full flex-shrink-0 mt-1" />
                  
                  {/* Verse text skeleton */}
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-5/6" />
                    <Skeleton className="h-5 w-4/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Next Chapter Button Skeleton */}
          <div className="flex justify-center mt-12 mb-8">
            <Skeleton className="h-8 w-32 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
