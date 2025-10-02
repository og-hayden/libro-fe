import React from 'react';
import { Verse, TextSize, ProphecyData } from '../types';
import { VerseItem } from './VerseItem';
import { ChapterArt } from '../ChapterArt';
import { useProphecyData } from '../hooks/useProphecyData';

interface VerseContainerProps {
  verses: Verse[];
  selectedVerseId: number | null;
  selectedVerseRange: { startVerseId: number; endVerseId: number } | null;
  hoveredVerseId: number | null;
  isSelecting: boolean;
  textSize: TextSize;
  selectedPerspectives: string[];
  bookId?: number;
  chapterNumber?: number;
  bookName?: string;
  prophecyData?: ProphecyData | null;
  isStrongsSidebarOpen?: boolean;
  isSummarizing?: boolean;
  isAsking?: boolean;
  showAskField?: boolean;
  isFocusMode?: boolean;
  onVerseSelect?: (verseId: number | null) => void;
  onVerseRangeSelect?: (range: { startVerseId: number; endVerseId: number } | null) => void;
  onVerseHover: (verseId: number | null) => void;
  onSelectionStart?: (verseId: number) => void;
  onAnalyze?: (verseId?: number) => void;
  onStartSelection?: (verseId: number) => void;
  onEndSelection?: (verseId: number) => void;
  onClearSelection?: () => void;
  onVerseLeave?: () => void;
  onVerseClick?: (verseId: number) => void;
  onStrongsClick: (strongsNumber: string) => void;
  onSummarize: (startVerseId: number, endVerseId: number) => void;
  onAsk: (verseIds: number[], question: string) => void;
  onProphecyClick: (prophecyId: number) => void;
  onShowMetadata?: () => void;
}

export function VerseContainer({
  verses,
  selectedVerseId,
  selectedVerseRange,
  hoveredVerseId,
  isSelecting,
  textSize,
  selectedPerspectives,
  isStrongsSidebarOpen,
  isSummarizing,
  isAsking,
  showAskField,
  prophecyData,
  bookId,
  chapterNumber,
  bookName,
  onStartSelection,
  onEndSelection,
  onClearSelection,
  onVerseHover,
  onVerseLeave,
  onVerseClick,
  onStrongsClick,
  onSummarize,
  onAsk,
  onProphecyClick,
  onShowMetadata,
}: VerseContainerProps) {
  const { isProphecyVerse, isFulfillmentVerse, getFulfillmentGroupInfo } = useProphecyData({
    prophecyData: prophecyData || null,
    verses,
  });

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide relative">
      {/* Chapter Artwork - Wider than verses but not full screen */}
      {bookId && chapterNumber && (
        <div className="mb-8 px-6 -mt-2">
          <div className="max-w-7xl mx-auto">
            <ChapterArt 
              bookId={bookId}
              chapterNumber={chapterNumber}
              bookName={bookName}
              onShowMetadata={onShowMetadata}
            />
          </div>
        </div>
      )}
      
      {/* Verses Container - Constrained Width */}
      <div className="px-12 py-2">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-0 pb-8">
          {verses.map((verse, index) => {
            const prophecyVerse = isProphecyVerse(verse.verse_number);
            const fulfillmentVerse = isFulfillmentVerse(verse.verse_number);
            const { isFirstInGroup, groupSize } = getFulfillmentGroupInfo(verse, index);

            return (
              <VerseItem
                key={verse.id}
                verse={verse}
                verseIndex={index}
                verses={verses}
                selectedVerseId={selectedVerseId}
                selectedVerseRange={selectedVerseRange}
                hoveredVerseId={hoveredVerseId}
                isSelecting={isSelecting}
                textSize={textSize}
                selectedPerspectives={selectedPerspectives}
                isStrongsSidebarOpen={isStrongsSidebarOpen || false}
                isSummarizing={isSummarizing || false}
                isAsking={isAsking || false}
                showAskField={showAskField || false}
                onStartSelection={onStartSelection || (() => {})}
                onEndSelection={onEndSelection || (() => {})}
                onClearSelection={onClearSelection || (() => {})}
                onVerseHover={onVerseHover}
                onVerseLeave={() => onVerseLeave?.()}
                onVerseClick={onVerseClick || (() => {})}
                onStrongsClick={onStrongsClick}
                onSummarize={() => onSummarize?.(verse.id, verse.id)}
                onAsk={() => onAsk?.([verse.id], '')}
                onProphecyClick={onProphecyClick}
                prophecyVerse={prophecyVerse}
                fulfillmentVerse={fulfillmentVerse}
                isFirstInGroup={isFirstInGroup || false}
                groupSize={groupSize}
              />
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
