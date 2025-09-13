import React from 'react';
import { ProphecyVerse, FulfillmentVerse } from '../types';

interface ProphecyIndicatorProps {
  prophecyVerse: ProphecyVerse | null;
  fulfillmentVerse: FulfillmentVerse | null;
  isHovered: boolean;
  groupSize: number;
  onProphecyClick: (prophecyId: number) => void;
}

export function ProphecyIndicator({
  prophecyVerse,
  fulfillmentVerse,
  isHovered,
  groupSize,
  onProphecyClick,
}: ProphecyIndicatorProps) {
  if (!prophecyVerse && !fulfillmentVerse) {
    return null;
  }

  const handleProphecyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onProphecyClick(prophecyVerse?.prophecy_id || fulfillmentVerse?.prophecy_id || 0);
  };

  return (
    <div 
      className="absolute -right-4 top-0 w-2 group" 
      style={{
        height: fulfillmentVerse && groupSize > 1 ? 
          `${groupSize * 100}%` : 
          '100%',
        zIndex: 10
      }}>
      
      {/* Top bracket corner */}
      <div className="absolute top-0 right-0 w-2 h-2">
        {/* Horizontal line */}
        <div className="absolute top-0 right-0 w-2 h-0.5 bg-stone-200/50 dark:bg-stone-700/50 group-hover:bg-stone-300 dark:group-hover:bg-stone-600 transition-colors"></div>
        {/* Vertical corner line */}
        <div className="absolute top-0 right-0 w-0.5 h-2 bg-stone-200/50 dark:bg-stone-700/50 group-hover:bg-stone-300 dark:group-hover:bg-stone-600 transition-colors"></div>
      </div>
      
      {/* Main vertical line */}
      <div className="absolute top-2 bottom-2 right-0 w-0.5 bg-stone-200/50 dark:bg-stone-700/50 group-hover:bg-stone-300 dark:group-hover:bg-stone-600 transition-colors">
        {/* Prophecy info - always visible, replaced with button on verse hover */}
        <div className="absolute top-1/2 -translate-y-1/2 left-6 transition-all duration-200">
          {!isHovered ? (
            /* Prophecy type label - always visible when not hovering verse */
            <div className="text-md font-medium text-stone-700 dark:text-stone-300 leading-tight">
              {prophecyVerse ? (
                <>
                  <div>Messianic</div>
                  <div>Prophecy</div>
                </>
              ) : (
                <>
                  <div>Prophecy</div>
                  <div>Fulfilled</div>
                </>
              )}
            </div>
          ) : (
            /* View Prophecy button - shows when hovering verse */
            <button
              onClick={handleProphecyClick}
              className="px-3 py-1.5 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-sm border border-stone-200 dark:border-stone-700 transition-all text-stone-700 dark:text-stone-300 font-medium whitespace-nowrap"
            >
              View Prophecy
            </button>
          )}
        </div>
      </div>
      
      {/* Bottom bracket corner */}
      <div className="absolute bottom-0 right-0 w-2 h-2">
        {/* Horizontal line */}
        <div className="absolute bottom-0 right-0 w-2 h-0.5 bg-stone-200/50 dark:bg-stone-700/50 group-hover:bg-stone-300 dark:group-hover:bg-stone-600 transition-colors"></div>
        {/* Vertical corner line */}
        <div className="absolute bottom-0 right-0 w-0.5 h-2 bg-stone-200/50 dark:bg-stone-700/50 group-hover:bg-stone-300 dark:group-hover:bg-stone-600 transition-colors"></div>
      </div>
    </div>
  );
}
