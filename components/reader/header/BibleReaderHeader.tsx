import React from 'react';
import { Home } from 'lucide-react';
import { RiArrowGoBackFill } from 'react-icons/ri';
import { TextSize } from '../types';
import { SettingsDropdown } from './SettingsDropdown';

interface BibleReaderHeaderProps {
  textSize: TextSize;
  isFocusMode: boolean;
  selectedPerspectives: string[];
  bookmark?: {bookId: number, chapterNumber: number, bookName?: string} | null;
  onBackToBooks?: () => void;
  onReturnToBookmark?: () => void;
  onTextSizeChange: (size: TextSize) => void;
  onPerspectivesChange: (perspectives: string[]) => void;
}

export function BibleReaderHeader({
  textSize,
  isFocusMode,
  selectedPerspectives,
  bookmark,
  onBackToBooks,
  onReturnToBookmark,
  onTextSizeChange,
  onPerspectivesChange,
}: BibleReaderHeaderProps) {
  return (
    <div className={`px-8 py-6 transition-all duration-300 bg-transparent ${
      isFocusMode ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100 blur-none'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBackToBooks}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm border transition-all bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <Home className="w-4 h-4" />
            </button>
            
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
        </div>
        
        <div className="flex flex-col space-y-3 items-end">
          {/* Settings Dropdown */}
          <SettingsDropdown
            textSize={textSize}
            selectedPerspectives={selectedPerspectives}
            onTextSizeChange={onTextSizeChange}
            onPerspectivesChange={onPerspectivesChange}
          />
        </div>
      </div>
    </div>
  );
}
