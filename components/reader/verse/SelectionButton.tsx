import React from 'react';
import { LuListPlus } from 'react-icons/lu';
import { Tooltip } from '../../ui/Tooltip';

interface SelectionButtonProps {
  isSelected: boolean;
  isInRange: boolean;
  isFirstInSelection: boolean;
  showEndSelection: boolean;
  onStartSelection: () => void;
  onEndSelection: () => void;
  onClearSelection: () => void;
}

export function SelectionButton({
  isSelected,
  isInRange,
  isFirstInSelection,
  showEndSelection,
  onStartSelection,
  onEndSelection,
  onClearSelection,
}: SelectionButtonProps) {
  const getTooltipContent = () => {
    if ((isSelected || isInRange) && isFirstInSelection) {
      return 'Cancel Selection';
    }
    if (showEndSelection) {
      return 'End Selection';
    }
    return 'Start Selection';
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if ((isSelected || isInRange) && isFirstInSelection) {
      onClearSelection();
    } else if (showEndSelection) {
      onEndSelection();
    } else {
      onStartSelection();
    }
  };

  const getButtonClasses = () => {
    if ((isSelected || isInRange) && isFirstInSelection) {
      return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700';
    }
    if ((isSelected || isInRange) && !isFirstInSelection) {
      return 'bg-blue-100 dark:bg-blue-900 opacity-0';
    }
    if (showEndSelection) {
      return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700';
    }
    return 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 opacity-0 group-hover:opacity-100 hover:bg-stone-200 dark:hover:bg-stone-700';
  };

  const getButtonContent = () => {
    if ((isSelected || isInRange) && isFirstInSelection) {
      return '×';
    }
    if ((isSelected || isInRange) && !isFirstInSelection) {
      return '';
    }
    return <LuListPlus className="w-3 h-3" />;
  };

  return (
    <Tooltip content={getTooltipContent()} delay={500} position="left">
      <button
        onClick={handleClick}
        className={`flex-shrink-0 w-6 h-6 rounded-full transition-all duration-200 flex items-center justify-center text-xs font-medium ${getButtonClasses()}`}
      >
        {getButtonContent()}
      </button>
    </Tooltip>
  );
}
