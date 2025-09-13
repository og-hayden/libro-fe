import React from 'react';
import { Verse, VerseRange, TextSize, ProphecyData } from '../types';
import { VerseItem } from './VerseItem';
import { useProphecyData } from '../hooks/useProphecyData';

interface VerseContainerProps {
  verses: Verse[];
  selectedVerseId: number | null;
  selectedVerseRange: VerseRange | null;
  hoveredVerseId: number | null;
  isSelecting: boolean;
  textSize: TextSize;
  selectedPerspectives: string[];
  isStrongsSidebarOpen: boolean;
  isSummarizing: boolean;
  isAsking: boolean;
  showAskField: boolean;
  prophecyData: ProphecyData | null;
  isFocusMode: boolean;
  onStartSelection: (verseId: number) => void;
  onEndSelection: (verseId: number) => void;
  onClearSelection: () => void;
  onVerseHover: (verseId: number) => void;
  onVerseLeave: () => void;
  onVerseClick: (verseId: number) => void;
  onStrongsClick: (strongsNumber: string) => void;
  onSummarize?: () => void;
  onAsk?: () => void;
  onProphecyClick: (prophecyId: number) => void;
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
  isFocusMode,
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
}: VerseContainerProps) {
  const { isProphecyVerse, isFulfillmentVerse, getFulfillmentGroupInfo } = useProphecyData({
    prophecyData,
    verses,
  });

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide px-12 py-8 relative" style={{
      maskImage: 'linear-gradient(to bottom, transparent 0px, black 32px, black 100%)',
      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 32px, black 100%)'
    }}>
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
                isStrongsSidebarOpen={isStrongsSidebarOpen}
                isSummarizing={isSummarizing}
                isAsking={isAsking}
                showAskField={showAskField}
                onStartSelection={onStartSelection}
                onEndSelection={onEndSelection}
                onClearSelection={onClearSelection}
                onVerseHover={onVerseHover}
                onVerseLeave={onVerseLeave}
                onVerseClick={onVerseClick}
                onStrongsClick={onStrongsClick}
                onSummarize={onSummarize}
                onAsk={onAsk}
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
  );
}
