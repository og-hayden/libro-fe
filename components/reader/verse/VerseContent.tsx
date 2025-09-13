import React from 'react';
import { Verse, TextSize } from '../types';
import { EnhancedStrongsText } from '../EnhancedStrongsText';

interface VerseContentProps {
  verse: Verse;
  textSize: TextSize;
  isSelected: boolean;
  isInRange: boolean;
  onStrongsClick: (strongsNumber: string) => void;
  hoveredVerseId: number | null;
}

export function VerseContent({
  verse,
  textSize,
  isSelected,
  isInRange,
  onStrongsClick,
  hoveredVerseId,
}: VerseContentProps) {
  const getTextSizeClasses = () => {
    switch (textSize) {
      case 'small': return 'text-base';
      case 'medium': return 'text-lg';
      case 'large': return 'text-xl';
      case 'xl': return 'text-2xl';
      default: return 'text-lg';
    }
  };

  return (
    <span className={`font-serif ${getTextSizeClasses()} leading-relaxed ${
      isSelected || isInRange ? 'text-blue-800 dark:text-blue-200' : 
      'text-stone-800 dark:text-stone-200'
    }`}>
      <sup className={`text-xs mr-2 font-sans ${
        isSelected || isInRange ? 'text-blue-600 dark:text-blue-400' : 
        'text-stone-500 dark:text-stone-400'
      }`}>
        {verse.verse_number}
      </sup>
      <EnhancedStrongsText
        text={verse.text}
        textWithStrongs={verse.text_with_strongs}
        isVerseHovered={hoveredVerseId === verse.id}
        textSize={textSize}
        onStrongsClick={onStrongsClick}
      />
    </span>
  );
}
