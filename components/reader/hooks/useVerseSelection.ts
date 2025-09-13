import { useState } from 'react';
import { VerseRange } from '../types';

interface UseVerseSelectionProps {
  selectedVerseId: number | null;
  selectedVerseRange: VerseRange | null;
  onVerseSelect: (verseId: number) => void;
  onVerseRangeSelect: (range: VerseRange | null) => void;
}

export function useVerseSelection({
  selectedVerseId,
  selectedVerseRange,
  onVerseSelect,
  onVerseRangeSelect,
}: UseVerseSelectionProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [hoveredVerseId, setHoveredVerseId] = useState<number | null>(null);

  const handleStartSelection = (verseId: number) => {
    setIsSelecting(true);
    onVerseSelect(verseId);
  };

  const handleEndSelection = (verseId: number) => {
    if (selectedVerseId && verseId !== selectedVerseId) {
      const startId = Math.min(selectedVerseId, verseId);
      const endId = Math.max(selectedVerseId, verseId);
      onVerseRangeSelect({ startVerseId: startId, endVerseId: endId });
    }
    setIsSelecting(false);
    setHoveredVerseId(null);
  };

  const handleVerseHover = (verseId: number) => {
    setHoveredVerseId(verseId);
  };

  const handleVerseLeave = () => {
    if (!isSelecting) {
      setHoveredVerseId(null);
    }
  };

  const clearSelection = () => {
    onVerseSelect(0);
    onVerseRangeSelect(null);
    setIsSelecting(false);
    setHoveredVerseId(null);
  };

  const getSelectedVerseIds = (): number[] => {
    if (selectedVerseRange) {
      const ids = [];
      for (let i = selectedVerseRange.startVerseId; i <= selectedVerseRange.endVerseId; i++) {
        ids.push(i);
      }
      return ids;
    }
    return selectedVerseId ? [selectedVerseId] : [];
  };

  return {
    isSelecting,
    hoveredVerseId,
    handleStartSelection,
    handleEndSelection,
    handleVerseHover,
    handleVerseLeave,
    clearSelection,
    getSelectedVerseIds,
  };
}
