'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { ChevronRight } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarSection } from './shared/Sidebar';
import { ShareButton } from '../features/sharing/ShareButton';

interface StrongsDefinition {
  strongs_number: string;
  definition: string;
  transliteration: string;
  pronunciation: string;
  language: string;
  part_of_speech: string;
}

interface SearchResult {
  id: number;
  text: string;
  verse_number: number;
  reference: string;
  word_positions?: number[];
  book: {
    id: number;
    name: string;
    abbreviation: string;
  };
  chapter_info: {
    id: number;
    chapter_number: number;
  };
}

interface BookGroup {
  book: {
    id: number;
    name: string;
    abbreviation: string;
  };
  verse_count: number;
  sample_verses: SearchResult[];
}

interface StrongsSidebarProps {
  strongsNumber: string | null;
  isVisible: boolean;
  onClose: () => void;
  onNavigateToVerse: (bookId: number, chapterNumber: number, verseId: number) => void;
}

export function StrongsSidebar({ strongsNumber, isVisible, onClose, onNavigateToVerse }: StrongsSidebarProps) {
  const [currentDefinition, setCurrentDefinition] = useState<StrongsDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllVerses, setShowAllVerses] = useState(false);
  const [allVerses, setAllVerses] = useState<SearchResult[]>([]);
  const [versesLoading, setVersesLoading] = useState(false);
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set());
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (isVisible && strongsNumber) {
      // Always load the new definition (no history)
      setIsLoading(true);
      setShowAllVerses(false); // Reset verses view
      api.get(`/strongs/lookup/${strongsNumber}`)
        .then(response => {
          const newDefinition = response.strongs_entry;
          setCurrentDefinition(newDefinition);
        })
        .catch(error => {
          console.error('Failed to load Strong\'s definition:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isVisible, strongsNumber]);

  // Reset state when sidebar closes
  useEffect(() => {
    if (!isVisible) {
      setShowAllVerses(false);
      setAllVerses([]);
      setExpandedBooks(new Set());
    }
  }, [isVisible]);

  // Load all verses for the current Strong's number
  const loadAllVerses = async (strongsNum: string) => {
    setVersesLoading(true);
    setLoadingProgress(0);
    
    // Start progress animation
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / 300); // 30 seconds = 30000ms, update every 100ms
      });
    }, 100);
    
    try {
      const response = await api.get(`/strongs/concordance/${strongsNum}`);
      // Flatten all verses from all book groups
      const allVersesFlat: SearchResult[] = [];
      if (response.book_groups) {
        response.book_groups.forEach((group: BookGroup) => {
          if (group.sample_verses) {
            allVersesFlat.push(...group.sample_verses);
          }
        });
      }
      setAllVerses(allVersesFlat);
      setShowAllVerses(true);
      
      // Complete progress immediately when done
      clearInterval(progressInterval);
      setLoadingProgress(100);
    } catch (error) {
      console.error('Failed to load all verses:', error);
      clearInterval(progressInterval);
    } finally {
      setVersesLoading(false);
      // Reset progress after a short delay
      setTimeout(() => setLoadingProgress(0), 500);
    }
  };

  // Group verses by book
  const groupVersesByBook = (verses: SearchResult[]) => {
    const grouped: { [bookName: string]: { book: SearchResult['book'], verses: SearchResult[] } } = {};
    
    verses.forEach(verse => {
      const bookName = verse.book.name;
      if (!grouped[bookName]) {
        grouped[bookName] = {
          book: verse.book,
          verses: []
        };
      }
      grouped[bookName].verses.push(verse);
    });
    
    return Object.values(grouped);
  };

  // Toggle book expansion
  const toggleBook = (bookName: string) => {
    const newExpanded = new Set(expandedBooks);
    if (expandedBooks.has(bookName)) {
      newExpanded.delete(bookName);
    } else {
      newExpanded.add(bookName);
    }
    setExpandedBooks(newExpanded);
  };

  // Highlight words at specific positions in verse text
  const highlightStrongsWords = (text: string, wordPositions: number[] = []) => {
    if (!wordPositions || wordPositions.length === 0) return text;
    
    // Split text into words, removing punctuation for position counting
    const words = text.split(/\s+/);
    const result = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordPosition = i + 1; // Word positions are 1-indexed
      
      if (wordPositions.includes(wordPosition)) {
        result.push(
          <mark key={i} className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-300 px-1 rounded">
            {word}
          </mark>
        );
      } else {
        result.push(word);
      }
      
      // Add space after each word except the last
      if (i < words.length - 1) {
        result.push(' ');
      }
    }
    
    return result;
  };

  return (
    <Sidebar
      isVisible={isVisible}
      title="Strong's Concordance"
      onClose={onClose}
      headerAction={<ShareButton size="sm" />}
      loadingOverlay={versesLoading ? {
        isLoading: true,
        progress: loadingProgress,
        text: loadingProgress >= 100 ? 'Wrapping up...' : (
          <>Finding all instances of <span className="font-mono">{strongsNumber}</span></>
        )
      } : undefined}
    >
      <SidebarContent>
        {isLoading ? (
          <SidebarSection>
            {/* Skeleton for Strong's code and language */}
            <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-24 mb-4 animate-pulse"></div>
            
            {/* Skeleton for transliterated word */}
            <div className="h-8 bg-stone-200 dark:bg-stone-700 rounded w-32 mb-3 animate-pulse"></div>
            
            {/* Skeleton for pronunciation */}
            <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-20 mb-3 animate-pulse"></div>
            
            {/* Skeleton for definition - multiple lines */}
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-4/5 animate-pulse"></div>
            </div>
            
            {/* Skeleton for part of speech */}
            <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-16 animate-pulse"></div>
          </SidebarSection>
        ) : !currentDefinition ? (
          <div className="text-sm text-stone-600 dark:text-stone-400 py-8 text-center">
            Click on a Strong&apos;s number to see its definition
          </div>
        ) : (
          <SidebarSection>
            <div>
              <div className="space-y-3">
                <div className="text-sm text-stone-600 dark:text-stone-400 uppercase tracking-wide">
                  {currentDefinition.strongs_number} • {currentDefinition.language}
                </div>
                <h4 className="text-3xl font-bold text-stone-900 dark:text-stone-100 font-serif">
                  {currentDefinition.transliteration}
                </h4>
                {currentDefinition.pronunciation && (
                  <p className="text-base text-stone-600 dark:text-stone-400 font-serif">
                    /{currentDefinition.pronunciation}/
                  </p>
                )}
                <p className="text-lg text-stone-900 dark:text-stone-100 leading-relaxed">
                  {currentDefinition.definition}
                </p>
              </div>

              {currentDefinition.part_of_speech && (
                <div className="pt-4 mt-4">
                  <span className="text-sm text-stone-600 dark:text-stone-400 uppercase tracking-wide">
                    {currentDefinition.part_of_speech}
                  </span>
                </div>
              )}
            </div>

            {/* View All Verses Button - only show when verses aren't displayed */}
            {!showAllVerses && !versesLoading && (
              <div className="py-4">
                <button
                  onClick={() => strongsNumber && loadAllVerses(strongsNumber)}
                  className="px-3 py-1.5 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-sm border border-stone-200 dark:border-stone-700 transition-all"
                >
                  <span className="text-stone-700 dark:text-stone-300 font-medium">View All Verses</span>
                </button>
              </div>
            )}

            {/* All Verses Display - grouped by book */}
            {showAllVerses && allVerses.length > 0 && (
              <div className="pb-6 space-y-4 mt-6">
                {/* Horizontal line separator */}
                <div className="border-t border-stone-200/50 dark:border-stone-700/50 pt-8">
                  <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-3">
                    All Verses ({allVerses.length})
                  </h4>
                </div>
                {groupVersesByBook(allVerses).map((bookGroup) => (
                  <div key={bookGroup.book.id} className="space-y-2">
                    <button
                      onClick={() => toggleBook(bookGroup.book.name)}
                      className="w-full flex items-center"
                    >
                      <motion.div
                        animate={{ rotate: expandedBooks.has(bookGroup.book.name) ? 90 : 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <ChevronRight className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                      </motion.div>
                      <h5 className="text-md font-medium text-stone-900 dark:text-stone-100 ml-2">
                        {bookGroup.book.name}
                      </h5>
                      <span className="text-sm text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-full ml-2">
                        {bookGroup.verses.length}
                      </span>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{
                        height: expandedBooks.has(bookGroup.book.name) ? "auto" : 0,
                        opacity: expandedBooks.has(bookGroup.book.name) ? 1 : 0
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="space-y-2 pt-2">
                        {bookGroup.verses.map((verse, index) => (
                          <motion.div
                            key={`${verse.id}-${index}`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.2 }}
                            onClick={() => onNavigateToVerse(verse.book.id, verse.chapter_info.chapter_number, verse.id)}
                            className="hover:bg-stone-200/30 dark:hover:bg-stone-800/30 cursor-pointer transition-colors rounded-lg p-3"
                          >
                            <div className="mb-2">
                              <span className="text-md font-medium text-stone-600 dark:text-stone-400">
                                {verse.reference}
                              </span>
                            </div>
                            <p className="text-md text-stone-900 dark:text-stone-100 leading-relaxed font-serif">
                              {highlightStrongsWords(verse.text, verse.word_positions)}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            )}
          </SidebarSection>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
