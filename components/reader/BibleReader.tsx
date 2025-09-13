'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ArrowRight, Eye } from 'lucide-react';
import { LuListPlus } from 'react-icons/lu';
import { RiArrowGoBackFill } from 'react-icons/ri';
import { FloatingAskInput } from './FloatingAskInput';
import { PerspectivesDropdown } from './PerspectivesDropdown';
import { StrongsSidebar } from './StrongsSidebar';
import ChapterNavigation from './ChapterNavigation';
import { BibleReaderSkeleton } from './BibleReaderSkeleton';
import { chapterCache } from '@/lib/chapterCache';
import { EnhancedStrongsText } from './EnhancedStrongsText';
import { Toast } from '../ui/Toast';
import { Tooltip } from '../ui/Tooltip';

interface Book {
  id: number;
  name: string;
  abbreviation: string;
  testament: string;
}

interface Chapter {
  id: number;
  chapter_number: number;
  verse_count: number;
}

interface Verse {
  id: number;
  verse_number: number;
  text: string;
  text_with_strongs: string;
  strongs_numbers: string[];
  reference: string;
}

interface VerseRange {
  startVerseId: number;
  endVerseId: number;
}

interface ProphecyVerse {
  prophecy_id: number;
  verse_numbers: number[];
  category: string;
  claim: string;
}

interface FulfillmentVerse {
  prophecy_id: number;
  verse_numbers: number[];
  fulfillment_type: string;
  original_prophecy: string;
}

interface ProphecyData {
  prophecy_verses: ProphecyVerse[];
  fulfillment_verses: FulfillmentVerse[];
}

interface BibleReaderProps {
  bookId: number | null;
  chapterNumber: number | null;
  selectedVerseId: number | null;
  selectedVerseRange: VerseRange | null;
  onVerseSelect: (verseId: number) => void;
  onVerseRangeSelect: (range: VerseRange | null) => void;
  onStrongsConcordance?: (strongsNumber: string) => void;
  onStrongsClick?: (strongsNumber: string) => void;
  onChapterChange?: (chapterNumber: number) => void;
  onBackToBooks?: () => void;
  onSummarize?: (verseIds: number[], perspectives: string[], verseText?: string) => void;
  onAsk?: (verseIds: number[], question: string, perspectives: string[], verseText?: string) => void;
  isStrongsSidebarOpen?: boolean;
  bookmark?: {bookId: number, chapterNumber: number, bookName?: string} | null;
  onReturnToBookmark?: () => void;
  onBookDataLoad?: (bookName: string) => void;
  onShowMetadata?: () => void;
  onShowProphecy?: (prophecyId: number) => void;
}

export function BibleReader({
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
}: BibleReaderProps) {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [prophecyData, setProphecyData] = useState<ProphecyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showAskField, setShowAskField] = useState(false);
  const [askQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [hoveredVerseId, setHoveredVerseId] = useState<number | null>(null);
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large' | 'xl'>('large');
  const [selectedPerspectives, setSelectedPerspectives] = useState(['catholic', 'baptist']);
  const [selectedStrongsNumber, setSelectedStrongsNumber] = useState<string | null>(null);
  const [showStrongsSidebar, setShowStrongsSidebar] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showFocusToast, setShowFocusToast] = useState(false);
  const [pagination, setPagination] = useState({ 
    current_chapter: 1, 
    total_chapters: 1, 
    has_previous: false, 
    has_next: false, 
    previous_chapter: null as number | null, 
    next_chapter: null as number | null, 
    all_chapters: [] as number[] 
  });

  // Helper functions for prophecy highlighting
  const isProphecyVerse = (verseNumber: number): ProphecyVerse | null => {
    if (!prophecyData?.prophecy_verses) return null;
    return prophecyData.prophecy_verses.find(pv => 
      pv.verse_numbers.includes(verseNumber)
    ) || null;
  };

  const isFulfillmentVerse = (verseNumber: number): FulfillmentVerse | null => {
    if (!prophecyData?.fulfillment_verses) return null;
    return prophecyData.fulfillment_verses.find(fv => 
      fv.verse_numbers.includes(verseNumber)
    ) || null;
  };

  const handleProphecyClick = (prophecyId: number) => {
    if (onShowProphecy) {
      onShowProphecy(prophecyId);
    }
  };

  const handleStartSelection = (verseId: number) => {
    setIsSelecting(true);
    onVerseSelect(verseId);
    // Exit focus mode when selecting verses
    if (isFocusMode) {
      setIsFocusMode(false);
    }
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
    
    // Find the verse data to log its content
    const verse = verses.find(v => v.id === verseId);
    if (verse) {
      console.log('=== VERSE HOVER DEBUG ===');
      console.log('Verse ID:', verseId);
      console.log('Verse Number:', verse.verse_number);
      console.log('Raw text:', verse.text);
      console.log('Text with strongs:', verse.text_with_strongs);
      console.log('Strongs numbers array:', verse.strongs_numbers);
      console.log('========================');
    }
  };

  const handleVerseLeave = () => {
    if (!isSelecting) {
      setHoveredVerseId(null);
    }
  };


  // ESC key handler for focus mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

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

  // Separate effect for auto-scrolling to avoid triggering API calls
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

  const getTextSizeClasses = () => {
    switch (textSize) {
      case 'small': return 'text-base';
      case 'medium': return 'text-lg';
      case 'large': return 'text-xl';
      case 'xl': return 'text-2xl';
      default: return 'text-lg';
    }
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

  const getSelectedVerseText = (): string => {
    const selectedIds = getSelectedVerseIds();
    const selectedVerses = verses.filter(verse => selectedIds.includes(verse.id));
    return selectedVerses.map(verse => verse.text).join(' ');
  };

  const handleSummarize = () => {
    const verseIds = getSelectedVerseIds();
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
    const verseIds = getSelectedVerseIds();
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

  const handleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
    if (!isFocusMode) {
      setShowFocusToast(true);
    }
  };

  const handleStrongsClick = (strongsNumber: string) => {
    // Exit focus mode when clicking Strong's
    if (isFocusMode) {
      setIsFocusMode(false);
    }
    if (onStrongsClick) {
      onStrongsClick(strongsNumber);
    }
  };

  if (isLoading) {
    return <BibleReaderSkeleton />;
  }

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
          // Navigate to verse functionality would go here
          console.log('Navigate to verse:', { bookId, chapterNumber, verseId });
        }}
      />
    <div className={`h-full flex flex-col transition-all duration-300 ${showStrongsSidebar ? 'ml-96' : ''}`}>
      {/* Header */}
      <div className={`px-8 py-6 transition-all duration-300 ${
        isFocusMode ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100 blur-none'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-4">
              <nav className="flex items-center space-x-2 text-sm">
                <button 
                  onClick={onBackToBooks}
                  className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                >
                  Home
                </button>
                <span className="text-stone-300 dark:text-stone-600">›</span>
                <button 
                  onClick={() => onBackToBooks?.()}
                  className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                >
                  {book.name}
                </button>
                <span className="text-stone-300 dark:text-stone-600">›</span>
                <span className="text-stone-900 dark:text-stone-100 font-medium">
                  Chapter {chapter.chapter_number}
                </span>
              </nav>
              
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
            
            <div>
              <h1 className="text-2xl font-medium text-stone-900 dark:text-stone-100">
                {book.name} {chapter.chapter_number}
              </h1>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                {verses.length} verses • {book.testament} Testament
              </p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3 items-end">
            {/* About Chapter Button */}
            {book && chapter && onShowMetadata && (
              <button
                onClick={onShowMetadata}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm border transition-all bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25A8.966 8.966 0 0 1 18 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>
                </svg>
                <span className="font-medium">About {book.name} {chapter.chapter_number}</span>
              </button>
            )}
            
            {/* Focus Mode Button */}
            <button
              onClick={handleFocusMode}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm border transition-all ${
                isFocusMode
                  ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900'
                  : 'bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span className="font-medium">{isFocusMode ? 'Exit Focus' : 'Focus Mode'}</span>
            </button>

            {/* Text Size Control */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-stone-600 dark:text-stone-400 font-medium">Text Size</span>
              <div className="flex items-center bg-stone-50 dark:bg-stone-900 rounded-full p-1 border border-stone-200 dark:border-stone-700">
                {(['small', 'medium', 'large', 'xl'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setTextSize(size)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                      textSize === size
                        ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
                        : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                    }`}
                  >
                    {size === 'small' ? 'S' : size === 'medium' ? 'M' : size === 'large' ? 'L' : 'XL'}
                  </button>
                ))}
              </div>
            </div>

            {/* Perspectives Selector */}
            <PerspectivesDropdown 
              selectedPerspectives={selectedPerspectives}
              onSelectionChange={setSelectedPerspectives}
            />

          </div>
        </div>
      </div>

      {/* Verses */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-12 py-8 relative">
        <div className="max-w-4xl mx-auto">
          
          
          <div className="space-y-0 pb-8">
            {verses.map((verse, index) => {
              const isSelected = selectedVerseId === verse.id;
              const isInRange = selectedVerseRange && 
                verse.id >= selectedVerseRange.startVerseId && 
                verse.id <= selectedVerseRange.endVerseId;
              const isHovered = hoveredVerseId === verse.id;
              const showEndSelection = isSelecting && isHovered && verse.id !== selectedVerseId;
              
              // Determine if this verse should have continuous selection styling
              const prevVerse = index > 0 ? verses[index - 1] : null;
              const nextVerse = index < verses.length - 1 ? verses[index + 1] : null;
              const isPrevInRange = prevVerse && selectedVerseRange && 
                prevVerse.id >= selectedVerseRange.startVerseId && 
                prevVerse.id <= selectedVerseRange.endVerseId;
              const isNextInRange = nextVerse && selectedVerseRange && 
                nextVerse.id >= selectedVerseRange.startVerseId && 
                nextVerse.id <= selectedVerseRange.endVerseId;
              
              // Only show clear button on the first selected verse
              const isFirstInSelection = selectedVerseRange ? 
                verse.id === selectedVerseRange.startVerseId : 
                isSelected;

              // Show summarize button on the last verse of selection
              const isLastInSelection = selectedVerseRange ? 
                verse.id === selectedVerseRange.endVerseId : 
                isSelected;

              const selectionButtonTooltip = (isSelected || isInRange) && isFirstInSelection 
                ? 'Cancel Selection' 
                : showEndSelection 
                  ? 'End Selection' 
                  : 'Start Selection';
              
              // Show action buttons after the last selected verse
              const showActionButtons = (isSelected || isInRange) && isLastInSelection && (onSummarize || onAsk);
              
              return (
                <React.Fragment key={verse.id}>
                  <div
                    id={`verse-${verse.id}`}
                    onMouseEnter={() => handleVerseHover(verse.id)}
                    onMouseLeave={handleVerseLeave}
                    className={`group relative flex items-start space-x-3 transition-all duration-200 z-0 ${
                      isSelected || isInRange
                        ? `bg-blue-50 dark:bg-blue-950 px-3 ${!isPrevInRange ? 'pt-3 rounded-t-lg' : 'pt-3'} ${!isNextInRange ? 'pb-3 rounded-b-lg' : 'pb-3'}`
                        : 'hover:bg-stone-50 dark:hover:bg-stone-800/50 p-3 rounded-lg'
                    } ${!(isSelected || isInRange) ? 'mb-4' : ''}`}
                  >
                    {/* Selection Button - only show clear button on first verse */}
                    <Tooltip content={selectionButtonTooltip} delay={500} position="left">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isSelected || isInRange) {
                            // Clear selection
                            onVerseSelect(0);
                            onVerseRangeSelect(null);
                            setIsSelecting(false);
                            setShowAskField(false); // Close Ask input when selection is cleared
                          } else if (showEndSelection) {
                            handleEndSelection(verse.id);
                          } else {
                            // Always clear previous selection and start new one
                            onVerseRangeSelect(null);
                            handleStartSelection(verse.id);
                          }
                        }}
                        className={`flex-shrink-0 w-6 h-6 rounded-full transition-all duration-200 flex items-center justify-center text-xs font-medium ${
                          (isSelected || isInRange) && isFirstInSelection
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                            : (isSelected || isInRange) && !isFirstInSelection
                              ? 'bg-blue-100 dark:bg-blue-900 opacity-0'
                              : showEndSelection
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 opacity-0 group-hover:opacity-100 hover:bg-stone-200 dark:hover:bg-stone-700'
                        }`}
                      >
                        {(isSelected || isInRange) && isFirstInSelection ? (
                          '×'
                        ) : (isSelected || isInRange) && !isFirstInSelection ? (
                          ''
                        ) : (
                          <LuListPlus className="w-3 h-3" />
                        )}
                      </button>
                    </Tooltip>
                    
                    {/* Verse Content */}
                    <div className="flex-1 cursor-pointer" onClick={(e) => {
                      e.stopPropagation();
                      if (isSelected || isInRange) {
                        // Clear selection
                        onVerseSelect(0);
                        onVerseRangeSelect(null);
                        setIsSelecting(false);
                        setShowAskField(false); // Close Ask input when selection is cleared
                      } else if (showEndSelection) {
                        handleEndSelection(verse.id);
                      } else {
                        // Always clear previous selection and start new one
                        onVerseRangeSelect(null);
                        handleStartSelection(verse.id);
                      }
                    }}>
                      {(() => {
                        const prophecyVerse = isProphecyVerse(verse.verse_number);
                        const fulfillmentVerse = isFulfillmentVerse(verse.verse_number);
                        
                        // Check if this verse is part of a consecutive fulfillment group
                        const prevVerse = index > 0 ? verses[index - 1] : null;
                        const prevFulfillmentVerse = prevVerse ? isFulfillmentVerse(prevVerse.verse_number) : null;
                        
                        // For fulfillment verses, check if this is the first verse of a group
                        const isFirstInGroup = fulfillmentVerse && (
                          !prevFulfillmentVerse ||
                          prevFulfillmentVerse.prophecy_id !== fulfillmentVerse.prophecy_id ||
                          (prevVerse && prevVerse.verse_number !== verse.verse_number - 1)
                        );
                        
                        // Count consecutive verses in the same fulfillment group
                        let groupSize = 1;
                        if (fulfillmentVerse && isFirstInGroup) {
                          let checkIndex = index + 1;
                          while (checkIndex < verses.length) {
                            const checkVerse = verses[checkIndex];
                            const checkFulfillmentVerse = isFulfillmentVerse(checkVerse.verse_number);
                            if (checkFulfillmentVerse &&
                                checkFulfillmentVerse.prophecy_id === fulfillmentVerse.prophecy_id &&
                                checkVerse.verse_number === verses[checkIndex - 1].verse_number + 1) {
                              groupSize++;
                              checkIndex++;
                            } else {
                              break;
                            }
                          }
                        }
                        
                        // Determine if we should show bracket on this verse
                        const shouldShowBracket = prophecyVerse || (fulfillmentVerse && isFirstInGroup);
                        
                        return (
                          <div className="relative group">
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
                                onStrongsClick={handleStrongsClick}
                              />
                            </span>

                            {/* Subtle right border indicator for prophecy/fulfillment */}
                            {shouldShowBracket && (
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
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleProphecyClick(prophecyVerse?.prophecy_id || fulfillmentVerse?.prophecy_id || 0);
                                        }}
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
                            )}
                          </div>
                        );
                      })()}
                    </div>

                  </div>
                  
                  {/* Action Buttons - appears right after the last selected verse */}
                  {showActionButtons && (
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
                          onClick={handleSummarize}
                          disabled={isSummarizing || isStrongsSidebarOpen || selectedPerspectives.length === 0}
                          className="px-3 py-1.5 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 rounded-full text-sm border border-stone-200 dark:border-stone-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {isSummarizing ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-stone-600 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          )}
                          <span className="text-stone-700 dark:text-stone-300 font-medium">{isSummarizing ? 'Explaining...' : 'Explain'}</span>
                        </button>
                      )}
                      {onAsk && (
                        <button
                          onClick={handleAsk}
                          disabled={isAsking || isStrongsSidebarOpen || selectedPerspectives.length === 0 || (showAskField && !askQuestion.trim())}
                          className="px-3 py-1.5 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 rounded-full text-sm border border-stone-200 dark:border-stone-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {isAsking ? (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-stone-600 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <span className="text-stone-700 dark:text-stone-300 font-medium">{isAsking ? 'Asking...' : showAskField ? 'Submit' : 'Ask'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>


          {/* Next Chapter Button */}
          {pagination && pagination.has_next && pagination.next_chapter && onChapterChange && (
            <div className={`flex justify-start mt-8 mb-8 ml-9 transition-all duration-300 ${
              isFocusMode ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100 blur-none'
            }`}>
              <button
                onClick={() => onChapterChange(pagination.next_chapter!)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-sm border border-stone-200 dark:border-stone-700 transition-all"
              >
                <span className="text-stone-700 dark:text-stone-300 font-medium">Next Chapter</span>
                <ArrowRight className="w-4 h-4 text-stone-700 dark:text-stone-300" />
              </button>
            </div>
          )}
          
        {/* Chapter Navigation - vertical sidebar */}
        {pagination && onChapterChange && book && (
          <div className={`transition-all duration-300 ${
            isFocusMode ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100 blur-none'
          }`}>
            <ChapterNavigation
              pagination={pagination}
              onChapterChange={onChapterChange}
            />
          </div>
        )}
          
        </div>
      </div>
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
