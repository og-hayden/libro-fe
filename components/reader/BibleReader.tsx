'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { chapterCache } from '@/lib/chapterCache';
import { StrongsSidebar } from '@/components/sidebars/StrongsSidebar';
import { BibleReaderSkeleton } from './BibleReaderSkeleton';
import { FloatingAskInput } from './FloatingAskInput';
import { Toast } from '../ui/Toast';
import { BibleReaderHeader } from './header/BibleReaderHeader';
import { VerseContainer } from './verse/VerseContainer';
import { BibleReaderFooter } from './footer/BibleReaderFooter';
import { useVerseSelection } from './hooks/useVerseSelection';
import { useFocusMode } from './hooks/useFocusMode';
import { Book, Chapter, Verse, VerseRange, ProphecyData, Pagination, TextSize, BibleReaderProps } from './types';

export function BibleReader(props: BibleReaderProps) {
  const {
    bookId,
    chapterNumber,
    selectedVerseId,
    selectedVerseRange,
    onVerseSelect,
    onVerseRangeSelect,
    onStrongsClick,
    onChapterChange,
    onBackToBooks,
    onSummarize,
    onAsk,
    isStrongsSidebarOpen,
    bookmark,
    onReturnToBookmark,
    onBookDataLoad,
    onShowMetadata,
    onShowProphecy,
  } = props;

  // Main data states
  const [verses, setVerses] = useState<Verse[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [prophecyData, setProphecyData] = useState<ProphecyData | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ 
    current_chapter: 1, 
    total_chapters: 1, 
    has_previous: false, 
    has_next: false, 
    previous_chapter: null, 
    next_chapter: null, 
    all_chapters: []
  });

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [showAskField, setShowAskField] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>('large');
  const [selectedPerspectives, setSelectedPerspectives] = useState(['catholic', 'baptist']);
  const [selectedStrongsNumber, setSelectedStrongsNumber] = useState<string | null>(null);
  const [showStrongsSidebar, setShowStrongsSidebar] = useState(false);

  // Custom hooks for business logic
  const verseSelection = useVerseSelection({
    selectedVerseId,
    selectedVerseRange,
    onVerseSelect,
    onVerseRangeSelect,
  });

  const { isFocusMode, showFocusToast, setShowFocusToast, toggleFocusMode, exitFocusMode } = useFocusMode();

  // Data loading effect
  useEffect(() => {
    if (!bookId || !chapterNumber) return;

    const loadChapter = async () => {
      // Check cache first
      const cached = chapterCache.get(bookId, chapterNumber);
      if (cached) {
        setBook(cached.book);
        setChapter(cached.chapter);
        setVerses(cached.verses);
        setPagination(cached.pagination);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await api.get(`/bible/books/${bookId}/chapters/${chapterNumber}`);
        
        // Cache the response
        chapterCache.set(bookId, chapterNumber, {
          book: response.book,
          chapter: response.chapter,
          verses: response.verses,
          pagination: response.pagination
        });

        setBook(response.book);
        setChapter(response.chapter);
        setVerses(response.verses);
        setPagination(response.pagination);
        setProphecyData(response.prophecies || null);
        
        // Notify parent of book data load
        if (onBookDataLoad && response.book?.name) {
          onBookDataLoad(response.book.name);
        }

        // Prefetch next chapter if available
        if (response.pagination?.has_next && response.pagination?.next_chapter) {
          const nextChapter = response.pagination.next_chapter;
          if (!chapterCache.has(bookId, nextChapter)) {
            api.get(`/bible/books/${bookId}/chapters/${nextChapter}`)
              .then(nextResponse => {
                chapterCache.set(bookId, nextChapter, {
                  book: nextResponse.book,
                  chapter: nextResponse.chapter,
                  verses: nextResponse.verses,
                  pagination: nextResponse.pagination
                });
              })
              .catch(() => {}); // Silent fail for prefetch
          }
        }
      } catch (error) {
        console.error('Failed to load chapter:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChapter();
  }, [bookId, chapterNumber, onBookDataLoad]);

  // Auto-scroll to selected verse
  useEffect(() => {
    if (selectedVerseId && verses.length > 0) {
      setTimeout(() => {
        const verseElement = document.getElementById(`verse-${selectedVerseId}`);
        if (verseElement) {
          verseElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }
  }, [selectedVerseId, verses.length]);

  // Helper functions
  const getSelectedVerseText = (): string => {
    const selectedIds = verseSelection.getSelectedVerseIds();
    const selectedVerses = verses.filter(verse => selectedIds.includes(verse.id));
    return selectedVerses.map(verse => verse.text).join(' ');
  };

  const handleSummarize = () => {
    const verseIds = verseSelection.getSelectedVerseIds();
    if (verseIds.length > 0 && onSummarize) {
      setIsSummarizing(true);
      const selectedVerseText = getSelectedVerseText();
      onSummarize(verseIds, selectedPerspectives, selectedVerseText);
      setTimeout(() => setIsSummarizing(false), 2000);
    }
  };

  const handleAsk = () => {
    if (!showAskField) {
      setShowAskField(true);
      return;
    }
  };

  const handleAskSubmit = (question: string) => {
    const verseIds = verseSelection.getSelectedVerseIds();
    if (verseIds.length > 0 && onAsk) {
      setIsAsking(true);
      const selectedVerseText = getSelectedVerseText();
      onAsk(verseIds, question, ['catholic', 'baptist'], selectedVerseText);
      setShowAskField(false);
      setTimeout(() => setIsAsking(false), 2000);
    }
  };

  const handleCancelAsk = () => {
    setShowAskField(false);
  };

  const handleStrongsClick = (strongsNumber: string) => {
    // Exit focus mode when clicking Strong's
    if (isFocusMode) {
      exitFocusMode();
    }
    if (onStrongsClick) {
      onStrongsClick(strongsNumber);
    }
  };

  const handleVerseClick = (verseId: number) => {
    const isSelected = selectedVerseId === verseId;
    const isInRange = selectedVerseRange && 
      verseId >= selectedVerseRange.startVerseId && 
      verseId <= selectedVerseRange.endVerseId;
    const showEndSelection = verseSelection.isSelecting && verseSelection.hoveredVerseId === verseId && verseId !== selectedVerseId;
    
    if (isSelected || isInRange) {
      verseSelection.clearSelection();
      setShowAskField(false);
    } else if (showEndSelection) {
      verseSelection.handleEndSelection(verseId);
    } else {
      onVerseRangeSelect(null);
      verseSelection.handleStartSelection(verseId);
    }
  };

  const handleFocusModeToggle = () => {
    toggleFocusMode();
  };

  const handleProphecyClick = (prophecyId: number) => {
    if (onShowProphecy) {
      onShowProphecy(prophecyId);
    }
  };

  // Loading state
  if (isLoading) {
    return <BibleReaderSkeleton />;
  }

  // Empty state
  if (!book || !chapter || verses.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-normal text-stone-900 dark:text-stone-100 mb-2">Welcome to Libro</h2>
          <p className="text-stone-600 dark:text-stone-400 font-normal">Select a book and chapter to begin reading</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <StrongsSidebar
        strongsNumber={selectedStrongsNumber}
        isVisible={showStrongsSidebar}
        onClose={() => {
          setShowStrongsSidebar(false);
          setSelectedStrongsNumber(null);
        }}
        onNavigateToVerse={(bookId: number, chapterNumber: number, verseId: number) => {
          console.log('Navigate to verse:', { bookId, chapterNumber, verseId });
        }}
      />
      
      <div className={`h-full flex flex-col transition-all duration-300 ${showStrongsSidebar ? 'ml-96' : ''}`}>
        {/* Header */}
        <BibleReaderHeader
          book={book}
          chapter={chapter}
          verses={verses}
          textSize={textSize}
          isFocusMode={isFocusMode}
          selectedPerspectives={selectedPerspectives}
          bookmark={bookmark}
          onBackToBooks={onBackToBooks}
          onReturnToBookmark={onReturnToBookmark}
          onShowMetadata={onShowMetadata}
          onFocusMode={handleFocusModeToggle}
          onTextSizeChange={setTextSize}
          onPerspectivesChange={setSelectedPerspectives}
        />

        {/* Verses */}
        <VerseContainer
          verses={verses}
          selectedVerseId={selectedVerseId}
          selectedVerseRange={selectedVerseRange}
          hoveredVerseId={verseSelection.hoveredVerseId}
          isSelecting={verseSelection.isSelecting}
          textSize={textSize}
          selectedPerspectives={selectedPerspectives}
          isStrongsSidebarOpen={isStrongsSidebarOpen || false}
          isSummarizing={isSummarizing}
          isAsking={isAsking}
          showAskField={showAskField}
          prophecyData={prophecyData}
          isFocusMode={isFocusMode}
          onStartSelection={verseSelection.handleStartSelection}
          onEndSelection={verseSelection.handleEndSelection}
          onClearSelection={() => {
            verseSelection.clearSelection();
            setShowAskField(false);
          }}
          onVerseHover={verseSelection.handleVerseHover}
          onVerseLeave={verseSelection.handleVerseLeave}
          onVerseClick={handleVerseClick}
          onStrongsClick={handleStrongsClick}
          onSummarize={handleSummarize}
          onAsk={handleAsk}
          onProphecyClick={handleProphecyClick}
        />

        {/* Footer */}
        <BibleReaderFooter
          book={book}
          pagination={pagination}
          isFocusMode={isFocusMode}
          onChapterChange={onChapterChange}
        />
      </div>
      
      {/* Floating Ask Input */}
      <FloatingAskInput
        isVisible={showAskField}
        onSubmit={handleAskSubmit}
        onCancel={handleCancelAsk}
        isLoading={isAsking}
        placeholder="Ask a question about the selected verses..."
      />
      
      {/* Toast Notification */}
      <Toast
        message="Press ESC to exit Focus Mode"
        isVisible={showFocusToast}
        onClose={() => setShowFocusToast(false)}
        duration={3000}
      />
    </>
  );
}
