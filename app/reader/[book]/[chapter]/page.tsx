'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BibleReader } from '@/components/reader/BibleReader';
import { AnalysisSidebar } from '@/components/sidebars/AnalysisSidebar';
import { ChapterThumbnails } from '@/components/layout/ChapterThumbnails';
import { StrongsConcordance } from '@/components/analysis/StrongsConcordance';
import { BibleReaderSkeleton } from '@/components/reader/BibleReaderSkeleton';
import { StrongsSidebar } from '@/components/sidebars/StrongsSidebar';
import { ScholarlyAnalysisView } from '@/components/analysis/ScholarlyAnalysisView';
import { MetadataSidebar } from '@/components/sidebars/MetadataSidebar';
import { ProphecySidebar } from '@/components/sidebars/ProphecySidebar';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { api } from '@/lib/api';
import { useUrlState, parseVerseSelection } from '@/hooks/useUrlState';

// Define types for better TypeScript support
interface Book {
  id: number;
  name: string;
}


export default function ReaderPage() {
  const router = useRouter();
  const params = useParams();
  const { state: urlState, updateState } = useUrlState();

  // Extract route parameters
  const bookSlug = params?.book as string;
  const chapterParam = params?.chapter as string;

  // Parse verse selection from URL
  const { selectedVerseId: initialVerseId, selectedVerseRange: initialVerseRange } = 
    parseVerseSelection(urlState.verse, urlState.verses);

  // Convert parameters
  const selectedChapter = chapterParam ? parseInt(chapterParam) : null;
  
  // State to hold the actual book ID once we resolve the book name
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [bookName, setBookName] = useState<string | null>(null);

  // State management - initialize from URL state
  const [selectedVerseId, setSelectedVerseId] = useState<number | null>(initialVerseId);
  const [selectedVerseRange, setSelectedVerseRange] = useState<{startVerseId: number, endVerseId: number} | null>(initialVerseRange);
  const [showChapterThumbnails, setShowChapterThumbnails] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [strongsConcordance, setStrongsConcordance] = useState<string | null>(null);
  const [showStrongsSidebar, setShowStrongsSidebar] = useState(false);
  const [selectedStrongsNumber, setSelectedStrongsNumber] = useState<string | null>(null);
  const [showMetadataSidebar, setShowMetadataSidebar] = useState(false);
  const [showProphecySidebar, setShowProphecySidebar] = useState(false);
  const [selectedProphecyId, setSelectedProphecyId] = useState<number | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [triggerSummary, setTriggerSummary] = useState(false);
  const [selectedPerspective, setSelectedPerspective] = useState('catholic');
  const [selectedPerspectives, setSelectedPerspectives] = useState<string[]>(['catholic', 'baptist']);
  const [bookmark, setBookmark] = useState<{bookId: number, chapterNumber: number, bookName?: string} | null>(null);
  const [userQuestion, setUserQuestion] = useState<string | null>(null);
  const [currentBookName, setCurrentBookName] = useState<string | null>(null);
  const [selectedVerseText, setSelectedVerseText] = useState<string | null>(null);
  const [showScholarlyAnalysis, setShowScholarlyAnalysis] = useState(false);
  const [scholarlyAnalysisData, setScholarlyAnalysisData] = useState<unknown>(null);

  // Helper function to convert book name to URL slug
  const bookNameToSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  // Helper function to convert book slug back to book name
  const bookSlugToName = (slug: string) => {
    return slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Navigation handlers
  const handleNavigateToVerse = (bookId: number, chapterNumber: number, verseId?: number) => {
    // We need to get the book name for the URL
    if (bookName) {
      const bookSlug = bookNameToSlug(bookName);
      const url = `/reader/${bookSlug}/${chapterNumber}${verseId ? `?verse=${verseId}` : ''}`;
      router.push(url);
    }
  };

  const handleCrossReferenceNavigation = async (bookId: number, chapterNumber: number, verseId?: number) => {
    // Save current location as bookmark if we're currently reading a chapter
    if (selectedBook && selectedChapter && bookName) {
      setBookmark({
        bookId: selectedBook,
        chapterNumber: selectedChapter,
        bookName: bookName
      });
    }
    
    // Get book name for the target book
    try {
      const response = await api.get('/bible/books');
      const books = response.books;
      const targetBook = books.find((b: Book) => b.id === bookId);
      
      if (targetBook) {
        const bookSlug = bookNameToSlug(targetBook.name);
        const url = `/reader/${bookSlug}/${chapterNumber}${verseId ? `?verse=${verseId}` : ''}`;
        router.push(url);
      }
    } catch (error) {
      console.error('Failed to navigate to cross reference:', error);
    }
  };

  // Handler to return to bookmarked location
  const handleReturnToBookmark = async () => {
    if (bookmark) {
      if (bookmark.bookName) {
        const bookSlug = bookNameToSlug(bookmark.bookName);
        const url = `/reader/${bookSlug}/${bookmark.chapterNumber}`;
        router.push(url);
      } else {
        // Fallback: get book name from API
        try {
          const response = await api.get('/bible/books');
          const books = response.books;
          const targetBook = books.find((b: Book) => b.id === bookmark.bookId);
          
          if (targetBook) {
            const bookSlug = bookNameToSlug(targetBook.name);
            const url = `/reader/${bookSlug}/${bookmark.chapterNumber}`;
            router.push(url);
          }
        } catch (error) {
          console.error('Failed to return to bookmark:', error);
        }
      }
      setBookmark(null); // Clear bookmark after returning
    }
  };

  const handleNavigateToBooks = () => {
    router.push('/');
  };

  const handleShowProphecy = (prophecyId: number) => {
    setSelectedProphecyId(prophecyId);
    setShowProphecySidebar(true);
    setShowSidebar(false);
    setShowStrongsSidebar(false);
    setShowMetadataSidebar(false);
    
    // Update URL state
    updateState({
      sidebar: 'prophecy',
      prophecyId: prophecyId.toString(),
      strongsNumber: undefined
    });
  };

  // Initialize on mount and resolve book slug to ID
  useEffect(() => {
    const initializePage = async () => {
      if (bookSlug) {
        try {
          // Convert slug back to book name
          const guessedBookName = bookSlugToName(bookSlug);
          
          // Fetch books to find the correct book ID
          const response = await api.get('/bible/books');
          const books = response.books;
          
          // Find book by exact name match first, then try case-insensitive
          let book = books.find((b: Book) => b.name === guessedBookName);
          if (!book) {
            book = books.find((b: Book) => b.name.toLowerCase() === guessedBookName.toLowerCase());
          }
          
          if (book) {
            setSelectedBook(book.id);
            setBookName(book.name);
          } else {
            // Book not found, redirect to home
            router.push('/');
            return;
          }
        } catch (error) {
          console.error('Failed to load books:', error);
          router.push('/');
          return;
        }
      }
      setIsInitialLoading(false);
    };

    initializePage();
  }, [bookSlug, router]);

  // Initialize sidebar states from URL
  useEffect(() => {
    // Set sidebar states based on URL parameters
    if (urlState.sidebar === 'prophecy' && urlState.prophecyId) {
      setSelectedProphecyId(parseInt(urlState.prophecyId));
      setShowProphecySidebar(true);
      setShowSidebar(false);
      setShowStrongsSidebar(false);
      setShowMetadataSidebar(false);
    } else if (urlState.sidebar === 'strongs' && urlState.strongsNumber) {
      setSelectedStrongsNumber(urlState.strongsNumber);
      setShowStrongsSidebar(true);
      setShowSidebar(false);
      setShowProphecySidebar(false);
      setShowMetadataSidebar(false);
    } else if (urlState.sidebar === 'metadata') {
      setShowMetadataSidebar(true);
      setShowSidebar(false);
      setShowStrongsSidebar(false);
      setShowProphecySidebar(false);
    }
  }, [urlState.sidebar, urlState.prophecyId, urlState.strongsNumber]);

  if (isInitialLoading) {
    return (
      <div className="h-screen flex">
        {/* Main Content Skeleton */}
        <div className="w-full bg-white dark:bg-stone-900">
          <BibleReaderSkeleton />
        </div>
      </div>
    );
  }

  if (!selectedBook || !selectedChapter) {
    // Invalid URL parameters - redirect to home
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Main Layout */}
      <div className="flex h-screen">
        {/* Main Content - Dynamic Width */}
        <div className={`bg-white dark:bg-stone-900 transition-all duration-300 ${(showSidebar || showStrongsSidebar || showMetadataSidebar || showProphecySidebar) ? 'w-2/3' : 'w-full'}`}>
          {strongsConcordance ? (
            <StrongsConcordance
              strongsNumber={strongsConcordance}
              onNavigateToVerse={handleNavigateToVerse}
              onClose={() => setStrongsConcordance(null)}
            />
          ) : showChapterThumbnails ? (
            <ChapterThumbnails
              bookId={selectedBook}
              selectedChapter={selectedChapter}
              onChapterSelect={(chapterNumber) => {
                handleNavigateToVerse(selectedBook, chapterNumber);
                setShowChapterThumbnails(false);
              }}
            />
          ) : showScholarlyAnalysis ? (
            <ScholarlyAnalysisView
              verseRangeStart={selectedVerseRange?.startVerseId || selectedVerseId || 0}
              verseRangeEnd={selectedVerseRange?.endVerseId || selectedVerseId || 0}
              reference={`${currentBookName} ${selectedChapter}:${selectedVerseId}`}
              verseText={selectedVerseText || ''}
              perspectives={selectedPerspectives}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              scholarlyData={scholarlyAnalysisData as any}
              onBackToReading={() => setShowScholarlyAnalysis(false)}
            />
          ) : (
            <BibleReader
              bookId={selectedBook}
              chapterNumber={selectedChapter}
              selectedVerseId={selectedVerseId}
              selectedVerseRange={selectedVerseRange}
              onVerseSelect={(verseId) => {
                setSelectedVerseId(verseId);
                // Update URL state
                updateState({
                  verse: verseId ? verseId.toString() : undefined,
                  verses: undefined
                });
              }}
              onVerseRangeSelect={setSelectedVerseRange}
              onStrongsConcordance={setStrongsConcordance}
              onStrongsClick={(strongsNumber: string) => {
                setSelectedStrongsNumber(strongsNumber);
                setShowStrongsSidebar(true);
                setShowSidebar(false);
                setShowMetadataSidebar(false);
                setShowProphecySidebar(false);
                
                // Update URL state
                updateState({
                  sidebar: 'strongs',
                  strongsNumber: strongsNumber,
                  prophecyId: undefined
                });
              }}
              onChapterChange={(chapterNumber) => {
                handleNavigateToVerse(selectedBook, chapterNumber);
              }}
              onBackToBooks={handleNavigateToBooks}
              onSummarize={(verseIds: number[], perspectives: string[], verseText?: string) => {
                setShowSidebar(true);
                setShowStrongsSidebar(false);
                setTriggerSummary(true);
                setSelectedVerseText(verseText || null);
                setUserQuestion(null); // Clear any previous question when explaining
                // Store selected perspectives for the sidebar
                setSelectedPerspectives(perspectives);
                setSelectedPerspective(perspectives[0] || 'catholic');
                // Reset trigger after a brief delay to allow the effect to fire
                setTimeout(() => setTriggerSummary(false), 100);
              }}
              onAsk={(verseIds: number[], question: string, perspectives: string[], verseText?: string) => {
                setShowSidebar(true);
                setShowStrongsSidebar(false);
                setTriggerSummary(true);
                setUserQuestion(question);
                setSelectedVerseText(verseText || null);
                // Store selected perspectives and question for the sidebar
                setSelectedPerspectives(perspectives);
                setSelectedPerspective(perspectives[0] || 'catholic');
                // Reset trigger after a brief delay to allow the effect to fire
                setTimeout(() => setTriggerSummary(false), 100);
              }}
              isStrongsSidebarOpen={showStrongsSidebar}
              bookmark={bookmark}
              onReturnToBookmark={handleReturnToBookmark}
              onBookDataLoad={(bookName: string) => setCurrentBookName(bookName)}
              onShowMetadata={() => {
                setShowMetadataSidebar(true);
                setShowSidebar(false);
                setShowStrongsSidebar(false);
                setShowProphecySidebar(false);
                
                // Update URL state
                updateState({
                  sidebar: 'metadata',
                  strongsNumber: undefined,
                  prophecyId: undefined
                });
              }}
              onShowProphecy={handleShowProphecy}
            />
          )}
        </div>

        {/* Analysis Sidebar */}
        {showSidebar && (
          <div className="w-1/3 h-full">
            <AnalysisSidebar
            selectedVerseId={selectedVerseId}
            selectedVerseRange={selectedVerseRange}
            chapterNumber={selectedChapter}
            onNavigateToVerse={handleCrossReferenceNavigation}
            triggerSummary={triggerSummary}
            selectedPerspective={selectedPerspective}
            selectedPerspectives={selectedPerspectives}
            isVisible={showSidebar}
            onClose={() => {
              setShowSidebar(false);
              setUserQuestion(null);
            }}
            onSummaryComplete={() => {
              // Summary completed
            }}
            userQuestion={userQuestion}
            bookName={currentBookName || undefined}
            verseText={selectedVerseText || undefined}
            onViewScholarlyAnalysis={(scholarlyData: unknown) => {
              setScholarlyAnalysisData(scholarlyData);
              setShowScholarlyAnalysis(true);
            }}
            />
          </div>
        )}

        {/* Strong's Sidebar */}
        {showStrongsSidebar && selectedStrongsNumber && (
          <div className="w-1/3 h-full">
            <StrongsSidebar
              strongsNumber={selectedStrongsNumber}
              isVisible={showStrongsSidebar}
              onClose={() => {
                setShowStrongsSidebar(false);
                setSelectedStrongsNumber(null);
                // Clear URL state
                updateState({
                  sidebar: undefined,
                  strongsNumber: undefined
                });
              }}
              onNavigateToVerse={handleNavigateToVerse}
            />
          </div>
        )}

        {/* Metadata Sidebar */}
        {showMetadataSidebar && selectedBook && selectedChapter && (
          <div className="w-1/3 h-full">
            <MetadataSidebar
              bookId={selectedBook}
              chapterNumber={selectedChapter}
              bookName={currentBookName}
              isVisible={showMetadataSidebar}
              onClose={() => {
                setShowMetadataSidebar(false);
                // Clear URL state
                updateState({
                  sidebar: undefined
                });
              }}
            />
          </div>
        )}

        {/* Prophecy Sidebar */}
        {showProphecySidebar && selectedProphecyId && (
          <div className="w-1/3 h-full">
            <ProphecySidebar
              prophecyId={selectedProphecyId}
              isVisible={showProphecySidebar}
              onClose={() => {
                setShowProphecySidebar(false);
                setSelectedProphecyId(null);
                // Clear URL state
                updateState({
                  sidebar: undefined,
                  prophecyId: undefined
                });
              }}
              onNavigateToVerse={handleCrossReferenceNavigation}
            />
          </div>
        )}

      </div>

      {/* Theme Toggle - Fixed Position */}
      <div className="fixed bottom-4 left-4 z-50">
        <ThemeToggle />
      </div>
    </div>
  );
}
