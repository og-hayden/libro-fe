import React from 'react';
import { Verse, VerseRange, TextSize, ProphecyVerse, FulfillmentVerse } from '../types';
import { SelectionButton } from './SelectionButton';
import { VerseContent } from './VerseContent';
import { ActionButtons } from './ActionButtons';
import { ProphecyIndicator } from '../prophecy/ProphecyIndicator';

interface VerseItemProps {
  verse: Verse;
  verseIndex: number;
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
  prophecyVerse: ProphecyVerse | null;
  fulfillmentVerse: FulfillmentVerse | null;
  isFirstInGroup: boolean;
  groupSize: number;
  verses: Verse[];
}

export function VerseItem({
  verse,
  verseIndex,
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
  prophecyVerse,
  fulfillmentVerse,
  isFirstInGroup,
  groupSize,
  verses,
}: VerseItemProps) {
  const isSelected = selectedVerseId === verse.id;
  const isInRange = !!(selectedVerseRange && 
    verse.id >= selectedVerseRange.startVerseId && 
    verse.id <= selectedVerseRange.endVerseId);
  const isHovered = hoveredVerseId === verse.id;
  const showEndSelection = isSelecting && isHovered && verse.id !== selectedVerseId;
  
  // Determine if this verse should have continuous selection styling
  const prevVerse = verseIndex > 0 ? verses[verseIndex - 1] : null;
  const nextVerse = verseIndex < verses.length - 1 ? verses[verseIndex + 1] : null;
  const isPrevInRange = !!(prevVerse && selectedVerseRange && 
    prevVerse.id >= selectedVerseRange.startVerseId && 
    prevVerse.id <= selectedVerseRange.endVerseId);
  const isNextInRange = !!(nextVerse && selectedVerseRange && 
    nextVerse.id >= selectedVerseRange.startVerseId && 
    nextVerse.id <= selectedVerseRange.endVerseId);
  
  // Only show clear button on the first selected verse
  const isFirstInSelection = selectedVerseRange ? 
    verse.id === selectedVerseRange.startVerseId : 
    isSelected;

  // Show action buttons on the last verse of selection
  const isLastInSelection = selectedVerseRange ? 
    verse.id === selectedVerseRange.endVerseId : 
    isSelected;
  
  const showActionButtons = (isSelected || isInRange) && isLastInSelection && (onSummarize || onAsk);
  
  // Determine if we should show prophecy bracket on this verse
  const shouldShowBracket = prophecyVerse || (fulfillmentVerse && isFirstInGroup);

  return (
    <React.Fragment key={verse.id}>
      <div
        id={`verse-${verse.id}`}
        onMouseEnter={() => onVerseHover(verse.id)}
        onMouseLeave={onVerseLeave}
        className={`group relative flex items-start space-x-3 transition-all duration-200 z-0 ${
          isSelected || isInRange
            ? `bg-blue-50 dark:bg-blue-950 px-3 ${!isPrevInRange ? 'pt-3 rounded-t-lg' : 'pt-3'} ${!isNextInRange ? 'pb-3 rounded-b-lg' : 'pb-3'}`
            : 'hover:bg-stone-50 dark:hover:bg-stone-800/50 p-3 rounded-lg'
        } ${!(isSelected || isInRange) ? 'mb-4' : ''}`}
      >
        {/* Selection Button */}
        <SelectionButton
          isSelected={isSelected}
          isInRange={isInRange}
          isFirstInSelection={isFirstInSelection}
          showEndSelection={showEndSelection}
          onStartSelection={() => onStartSelection(verse.id)}
          onEndSelection={() => onEndSelection(verse.id)}
          onClearSelection={onClearSelection}
        />
        
        {/* Verse Content */}
        <div 
          className="flex-1 cursor-pointer" 
          onClick={() => onVerseClick(verse.id)}
        >
          <div className="relative group">
            <VerseContent
              verse={verse}
              textSize={textSize}
              isSelected={isSelected}
              isInRange={isInRange}
              onStrongsClick={onStrongsClick}
              hoveredVerseId={hoveredVerseId}
            />

            {/* Prophecy Indicator */}
            {shouldShowBracket && (
              <ProphecyIndicator
                prophecyVerse={prophecyVerse}
                fulfillmentVerse={fulfillmentVerse}
                isHovered={isHovered}
                groupSize={groupSize}
                onProphecyClick={onProphecyClick}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Action Buttons - appears right after the last selected verse */}
      {showActionButtons && (
        <ActionButtons
          selectedVerseIds={selectedVerseRange ? 
            Array.from({ length: selectedVerseRange.endVerseId - selectedVerseRange.startVerseId + 1 }, 
              (_, i) => selectedVerseRange.startVerseId + i) : 
            (selectedVerseId ? [selectedVerseId] : [])
          }
          selectedPerspectives={selectedPerspectives}
          isStrongsSidebarOpen={isStrongsSidebarOpen}
          isSummarizing={isSummarizing}
          isAsking={isAsking}
          showAskField={showAskField}
          onSummarize={onSummarize}
          onAsk={onAsk}
        />
      )}
    </React.Fragment>
  );
}
