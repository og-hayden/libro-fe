import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Book, Pagination } from '../types';
import ChapterNavigation from '@/components/layout/ChapterNavigation';

interface BibleReaderFooterProps {
  book: Book;
  pagination: Pagination;
  isFocusMode: boolean;
  onChapterChange?: (chapterNumber: number) => void;
}

export function BibleReaderFooter({
  book,
  pagination,
  isFocusMode,
  onChapterChange,
}: BibleReaderFooterProps) {
  if (!onChapterChange) return null;

  return (
    <>
      {/* Chapter Navigation - vertical sidebar */}
      <div className={`transition-all duration-300 ${
        isFocusMode ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100 blur-none'
      }`}>
        <ChapterNavigation
          pagination={pagination}
          onChapterChange={onChapterChange}
        />
      </div>
    </>
  );
}
