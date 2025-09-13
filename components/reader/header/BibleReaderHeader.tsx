import React from 'react';
import { Eye, BookOpen } from 'lucide-react';
import { RiArrowGoBackFill } from 'react-icons/ri';
import { Book, Chapter, Verse, TextSize } from '../types';
import { PerspectivesDropdown } from '@/components/analysis/PerspectivesDropdown';

interface BibleReaderHeaderProps {
  book: Book;
  chapter: Chapter;
  verses: Verse[];
  textSize: TextSize;
  isFocusMode: boolean;
  selectedPerspectives: string[];
  bookmark?: {bookId: number, chapterNumber: number, bookName?: string} | null;
  onBackToBooks?: () => void;
  onReturnToBookmark?: () => void;
  onShowMetadata?: () => void;
  onFocusMode: () => void;
  onTextSizeChange: (size: TextSize) => void;
  onPerspectivesChange: (perspectives: string[]) => void;
}

export function BibleReaderHeader({
  book,
  chapter,
  verses,
  textSize,
  isFocusMode,
  selectedPerspectives,
  bookmark,
  onBackToBooks,
  onReturnToBookmark,
  onShowMetadata,
  onFocusMode,
  onTextSizeChange,
  onPerspectivesChange,
}: BibleReaderHeaderProps) {
  return (
    <div className={`px-8 py-6 transition-all duration-300 ${
      isFocusMode ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100 blur-none'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-4">
            <nav className="flex items-center space-x-2 text-sm">
              <button 
                onClick={onBackToBooks}
                className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              >
                Home
              </button>
              <span className="text-stone-300 dark:text-stone-600">›</span>
              <button 
                onClick={() => onBackToBooks?.()}
                className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              >
                {book.name}
              </button>
              <span className="text-stone-300 dark:text-stone-600">›</span>
              <span className="text-stone-900 dark:text-stone-100 font-medium">
                Chapter {chapter.chapter_number}
              </span>
            </nav>
            
            {/* Bookmark Button */}
            {bookmark && onReturnToBookmark && (
              <button
                onClick={onReturnToBookmark}
                className="px-2 py-1 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-xs border border-stone-200 dark:border-stone-700 transition-all flex items-center space-x-1.5"
                title={`Return to ${bookmark.bookName || 'Book'} ${bookmark.chapterNumber}`}
              >
                <RiArrowGoBackFill className="w-3 h-3 text-stone-700 dark:text-stone-300" />
                <span className="text-stone-700 dark:text-stone-300 font-medium">Return to Reading</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-medium text-stone-900 dark:text-stone-100">
              {book.name} {chapter.chapter_number}
            </h1>
            
            {/* About Chapter Button */}
            {onShowMetadata && (
              <button
                onClick={onShowMetadata}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm border transition-all bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">About {book.name} {chapter.chapter_number}</span>
              </button>
            )}
          </div>
        </div>
        
        <div className="flex flex-col space-y-3 items-end">
          {/* Focus Mode Button */}
          <button
            onClick={onFocusMode}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm border transition-all ${
              isFocusMode
                ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900'
                : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span className="font-medium">{isFocusMode ? 'Exit Focus' : 'Focus Mode'}</span>
          </button>

          {/* Text Size Control */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-stone-600 dark:text-stone-400 font-medium">Text Size</span>
            <div className="flex items-center bg-stone-50 dark:bg-stone-900 rounded-full p-1 border border-stone-200 dark:border-stone-700">
              {(['small', 'medium', 'large', 'xl'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => onTextSizeChange(size)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                    textSize === size
                      ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                  }`}
                >
                  {size === 'small' ? 'S' : size === 'medium' ? 'M' : size === 'large' ? 'L' : 'XL'}
                </button>
              ))}
            </div>
          </div>

          {/* Perspectives Selector */}
          <PerspectivesDropdown 
            selectedPerspectives={selectedPerspectives}
            onSelectionChange={onPerspectivesChange}
          />
        </div>
      </div>
    </div>
  );
}
