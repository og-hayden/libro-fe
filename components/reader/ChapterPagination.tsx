'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ChapterPaginationProps {
  pagination: {
    current_chapter: number;
    total_chapters: number;
    has_previous: boolean;
    has_next: boolean;
    previous_chapter: number | null;
    next_chapter: number | null;
    all_chapters: number[];
  };
  onChapterChange: (chapterNumber: number) => void;
}

export default function ChapterPagination({ pagination, onChapterChange }: ChapterPaginationProps) {
  const { current_chapter, total_chapters, has_previous, has_next, previous_chapter, next_chapter, all_chapters } = pagination;

  // Generate pagination items with ellipsis logic
  const generatePaginationItems = () => {
    const items: (number | 'ellipsis')[] = [];
    const currentIndex = all_chapters.indexOf(current_chapter);
    
    // Always show first chapter
    if (all_chapters.length > 0) {
      items.push(all_chapters[0]);
    }
    
    // For books with many chapters (>10), use ellipsis logic
    if (total_chapters > 10) {
      // Show ellipsis after first if current is far from start
      if (currentIndex > 3) {
        items.push('ellipsis');
      }
      
      // Show chapters around current (2 before, current, 2 after)
      const start = Math.max(1, currentIndex - 2);
      const end = Math.min(all_chapters.length - 2, currentIndex + 2);
      
      for (let i = start; i <= end; i++) {
        if (all_chapters[i] !== all_chapters[0] && all_chapters[i] !== all_chapters[all_chapters.length - 1]) {
          if (!items.includes(all_chapters[i])) {
            items.push(all_chapters[i]);
          }
        }
      }
      
      // Show ellipsis before last if current is far from end
      if (currentIndex < all_chapters.length - 4) {
        items.push('ellipsis');
      }
      
      // Always show last chapter if more than 1 chapter
      if (all_chapters.length > 1) {
        const lastChapter = all_chapters[all_chapters.length - 1];
        if (!items.includes(lastChapter)) {
          items.push(lastChapter);
        }
      }
    } else {
      // For books with few chapters, show all
      for (let i = 1; i < all_chapters.length; i++) {
        items.push(all_chapters[i]);
      }
    }
    
    return items;
  };

  const paginationItems = generatePaginationItems();

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center space-x-1 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-stone-200/50">
        {/* Previous Button */}
        <button
          onClick={() => previous_chapter && onChapterChange(previous_chapter)}
          disabled={!has_previous}
          className={`p-2 rounded-full text-sm transition-all ${
            has_previous
              ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Chapter Numbers */}
        <div className="flex items-center space-x-0.5">
          {paginationItems.map((item, index) => {
            if (item === 'ellipsis') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-stone-400 text-sm">
                  ···
                </span>
              );
            }

            const isActive = item === current_chapter;
            return (
              <button
                key={item}
                onClick={() => onChapterChange(item)}
                className={`min-w-[32px] h-8 rounded-full text-sm font-medium transition-all ${
                  isActive
                    ? 'text-stone-900 bg-stone-100'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => next_chapter && onChapterChange(next_chapter)}
          disabled={!has_next}
          className={`p-2 rounded-full text-sm transition-all ${
            has_next
              ? 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/50'
              : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
