'use client';

import { ChevronUp, ChevronDown } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

interface ChapterNavigationProps {
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
  bookName: string;
}

export default function ChapterNavigation({ pagination, onChapterChange }: Omit<ChapterNavigationProps, 'bookName'>) {
  const { current_chapter, total_chapters, has_previous, has_next, previous_chapter, next_chapter, all_chapters } = pagination;

  // Generate minimal chapter items with ellipsis logic (adapted from original)
  const generateChapterItems = () => {
    const items: (number | 'ellipsis')[] = [];
    const currentIndex = all_chapters.indexOf(current_chapter);
    
    // Always show first chapter
    if (all_chapters.length > 0) {
      items.push(all_chapters[0]);
    }
    
    // For books with many chapters (>8), use ellipsis logic
    if (total_chapters > 8) {
      // Show ellipsis after first if current is far from start
      if (currentIndex > 2) {
        items.push('ellipsis');
      }
      
      // Show chapters around current (1 before, current, 1 after)
      const start = Math.max(1, currentIndex - 1);
      const end = Math.min(all_chapters.length - 2, currentIndex + 1);
      
      for (let i = start; i <= end; i++) {
        if (all_chapters[i] !== all_chapters[0] && all_chapters[i] !== all_chapters[all_chapters.length - 1]) {
          if (!items.includes(all_chapters[i])) {
            items.push(all_chapters[i]);
          }
        }
      }
      
      // Show ellipsis before last if current is far from end
      if (currentIndex < all_chapters.length - 3) {
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

  const chapterItems = generateChapterItems();

  return (
    <div className="fixed left-6 top-1/2 transform -translate-y-1/2 z-40">
      <div className="flex flex-col items-center space-y-3">
        {/* Previous chapter button */}
        <Tooltip content="Previous Chapter" delay={500} position="right">
          <button
            onClick={() => previous_chapter && onChapterChange(previous_chapter)}
            disabled={!has_previous}
            className={`p-1 transition-all ${
              has_previous
                ? 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                : 'text-stone-200 dark:text-stone-700 cursor-not-allowed'
            }`}
          >
            <ChevronUp className="w-3 h-3" />
          </button>
        </Tooltip>

        {/* Chapter numbers with ellipsis */}
        <div className="flex flex-col items-center space-y-2">
          {chapterItems.map((item, index) => {
            if (item === 'ellipsis') {
              return (
                <span key={`ellipsis-${index}`} className="text-stone-300 dark:text-stone-600 text-xs">
                  ⋯
                </span>
              );
            }

            const isActive = item === current_chapter;
            return (
              <Tooltip key={item} content={`Go to Chapter ${item}`} delay={500} position="right">
                <button
                  onClick={() => onChapterChange(item)}
                  className={`w-6 h-6 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800'
                      : 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  {item}
                </button>
              </Tooltip>
            );
          })}
        </div>

        {/* Next chapter button */}
        <Tooltip content="Next Chapter" delay={500} position="right">
          <button
            onClick={() => next_chapter && onChapterChange(next_chapter)}
            disabled={!has_next}
            className={`p-1 transition-all ${
              has_next
                ? 'text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
                : 'text-stone-200 dark:text-stone-700 cursor-not-allowed'
            }`}
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
