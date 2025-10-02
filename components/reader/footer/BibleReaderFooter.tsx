import React from 'react';
import { Pagination } from '../types';
import ChapterNavigation from '@/components/layout/ChapterNavigation';

interface BibleReaderFooterProps {
  pagination: Pagination;
  isFocusMode: boolean;
  onChapterChange?: (chapterNumber: number) => void;
}

export function BibleReaderFooter({
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
