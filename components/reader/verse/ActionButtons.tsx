import React from 'react';
import { Loader2, Lightbulb, HelpCircle } from 'lucide-react';

interface ActionButtonsProps {
  selectedVerseIds: number[];
  selectedPerspectives: string[];
  isStrongsSidebarOpen: boolean;
  isSummarizing: boolean;
  isAsking: boolean;
  showAskField: boolean;
  onSummarize?: () => void;
  onAsk?: () => void;
}

export function ActionButtons({
  selectedVerseIds,
  selectedPerspectives,
  isStrongsSidebarOpen,
  isSummarizing,
  isAsking,
  showAskField,
  onSummarize,
  onAsk,
}: ActionButtonsProps) {
  if (selectedVerseIds.length === 0 || (!onSummarize && !onAsk)) {
    return null;
  }

  const isDisabled = isStrongsSidebarOpen || selectedPerspectives.length === 0;

  return (
    <div className="flex items-center justify-end space-x-2 mt-2 mb-4">
      {isStrongsSidebarOpen && (
        <span className="text-xs text-stone-500 dark:text-stone-400 mr-2">
          Close Strong&apos;s analysis to use AI features
        </span>
      )}
      {selectedPerspectives.length === 0 && !isStrongsSidebarOpen && (
        <span className="text-xs text-stone-500 dark:text-stone-400 mr-2">
          Select at least 1 perspective to use AI features
        </span>
      )}
      
      {onSummarize && (
        <button
          onClick={onSummarize}
          disabled={isSummarizing || isDisabled}
          className="px-3 py-1.5 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-sm border border-stone-200 dark:border-stone-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSummarizing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Lightbulb className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          )}
          <span className="text-stone-700 dark:text-stone-300 font-medium">
            {isSummarizing ? 'Explaining...' : 'Explain'}
          </span>
        </button>
      )}
      
      {onAsk && (
        <button
          onClick={onAsk}
          disabled={isAsking || isDisabled}
          className="px-3 py-1.5 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-sm border border-stone-200 dark:border-stone-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isAsking ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <HelpCircle className="w-4 h-4 text-stone-600 dark:text-stone-400" />
          )}
          <span className="text-stone-700 dark:text-stone-300 font-medium">
            {isAsking ? 'Asking...' : showAskField ? 'Submit' : 'Ask'}
          </span>
        </button>
      )}
    </div>
  );
}
