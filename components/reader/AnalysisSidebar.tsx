'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Sidebar, SidebarContent, SidebarSection } from '../ui/Sidebar';

// Simple markdown parser for bold and italics
const parseMarkdown = (text: string) => {
  const parts = [];
  let currentIndex = 0;
  
  // Regex to match **text** (bold), *text* (italics), and _text_ (italics)
  const markdownRegex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_)/g;
  let match;
  
  while ((match = markdownRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      parts.push(text.slice(currentIndex, match.index));
    }
    
    // Add the formatted text
    if (match[2]) {
      // Bold text (**text**)
      parts.push(<strong key={match.index} className="font-semibold">{match[2]}</strong>);
    } else if (match[3]) {
      // Italic text (*text*)
      parts.push(<em key={match.index} className="italic">{match[3]}</em>);
    } else if (match[4]) {
      // Italic text (_text_)
      parts.push(<em key={match.index} className="italic">{match[4]}</em>);
    }
    
    currentIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (currentIndex < text.length) {
    parts.push(text.slice(currentIndex));
  }
  
  return parts.length > 0 ? parts : [text];
};

interface CrossReference {
  book: string;
  chapter: number;
  verse_start: number;
  verse_end: number | null;
  reference_display: string;
  relevance_note: string;
}

interface Summary {
  verse_range_start: number;
  verse_range_end: number;
  reference: string;
  verse_text: string;
  perspectives: Record<string, {
    response_text: string;
    cross_references: CrossReference[];
  }>;
  cross_references: CrossReference[];
  cached: boolean;
}

interface VerseRange {
  startVerseId: number;
  endVerseId: number;
}

interface AnalysisSidebarProps {
  selectedVerseId: number | null;
  selectedVerseRange: VerseRange | null;
  bookId: number | null;
  chapterNumber: number | null;
  onNavigateToVerse: (bookId: number, chapterNumber: number, verseId?: number) => void;
  triggerSummary: boolean;
  selectedPerspective: string;
  selectedPerspectives: string[];
  isVisible: boolean;
  onClose: () => void;
  onSummaryComplete: () => void;
  userQuestion?: string | null;
  bookName?: string;
  verseText?: string;
  onViewScholarlyAnalysis?: (scholarlyData: unknown, denominationalData: unknown) => void;
}

const PERSPECTIVES = [
  // Catholic
  { key: 'catholic', label: 'Catholic' },
  
  // Orthodox
  { key: 'eastern_orthodox', label: 'Eastern Orthodox' },
  { key: 'oriental_orthodox', label: 'Oriental Orthodox' },
  
  // Protestant
  { key: 'baptist', label: 'Baptist' },
  { key: 'anglican', label: 'Anglican' },
  { key: 'methodist', label: 'Methodist' },
  { key: 'pentecostal', label: 'Pentecostal' },
  { key: 'lutheran', label: 'Lutheran' },
  { key: 'presbyterian', label: 'Presbyterian' },
  { key: 'puritan', label: 'Puritan' },
  { key: 'dutch_reformed', label: 'Dutch Reformed' },
  { key: 'moravian', label: 'Moravian' },
];

export function AnalysisSidebar({ selectedVerseId, selectedVerseRange, chapterNumber, onNavigateToVerse, triggerSummary, selectedPerspective, selectedPerspectives, isVisible, onClose, onSummaryComplete, userQuestion, bookName, verseText, onViewScholarlyAnalysis }: Omit<AnalysisSidebarProps, 'bookId'>) {
  const [activePerspective, setActivePerspective] = useState(selectedPerspective);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [scholarlyButtonState, setScholarlyButtonState] = useState<'generate' | 'view' | 'loading'>('generate');
  const [scholarlyAnalysisData, setScholarlyAnalysisData] = useState<unknown>(null);
  const [denominationalAnalysisData, setDenominationalAnalysisData] = useState<unknown>(null);

  // Update active perspective when selectedPerspective prop changes
  useEffect(() => {
    setActivePerspective(selectedPerspective);
  }, [selectedPerspective]);

  // Auto-generate summary when triggerSummary changes to true
  const generateSummary = useCallback(async () => {
    const startVerseId = selectedVerseRange?.startVerseId || selectedVerseId;
    const endVerseId = selectedVerseRange?.endVerseId || selectedVerseId;
    
    if (!startVerseId) return;

    setIsLoadingSummary(true);

    try {
      const payload: { verse_range_start: number; verse_range_end?: number; perspectives: string[]; question?: string } = {
        verse_range_start: startVerseId,
        perspectives: selectedPerspectives,
      };
      
      if (endVerseId && endVerseId !== startVerseId) {
        payload.verse_range_end = endVerseId;
      }
      
      // Use question endpoint if userQuestion is provided, otherwise use summary endpoint
      if (userQuestion) {
        payload.question = userQuestion;
        const response = await api.post('/analysis/question', payload);
        setSummary(response);
      } else {
        const response = await api.post('/analysis/summary', payload);
        setSummary(response);
      }
      
      onSummaryComplete?.();
      // Enable scholarly analysis button after regular analysis completes
      setScholarlyButtonState('generate');
    } catch (error) {
      console.error('Failed to generate analysis:', error);
    } finally {
      setIsLoadingSummary(false);
    }
  }, [selectedVerseRange, selectedVerseId, selectedPerspectives, userQuestion, onSummaryComplete]);

  useEffect(() => {
    if (triggerSummary && (selectedVerseId || selectedVerseRange)) {
      generateSummary();
    }
  }, [triggerSummary, selectedVerseId, selectedVerseRange, selectedPerspectives, userQuestion, onSummaryComplete, generateSummary]);

  // Reset summary when sidebar becomes invisible
  useEffect(() => {
    if (!isVisible) {
      setSummary(null);
      setScholarlyButtonState('generate');
      setScholarlyAnalysisData(null);
    }
  }, [isVisible]);

  // Get current verse info for loading state
  const getCurrentVerseInfo = () => {
    const startVerseId = selectedVerseRange?.startVerseId || selectedVerseId;
    const endVerseId = selectedVerseRange?.endVerseId || selectedVerseId;
    
    if (!startVerseId || !bookName || !chapterNumber) return null;
    
    // Create proper reference string like "2 Chronicles 3:10"
    const reference = selectedVerseRange 
      ? `${bookName} ${chapterNumber}:${startVerseId}-${endVerseId}`
      : `${bookName} ${chapterNumber}:${startVerseId}`;
    
    return {
      reference,
      startVerseId,
      endVerseId,
      verseText
    };
  };


  const handleCrossReferenceClick = (ref: CrossReference) => {
    if (onNavigateToVerse && ref.book && ref.chapter && ref.verse_start) {
      const bookNameToId: Record<string, number> = {
        'Genesis': 5, 'Exodus': 6, 'Leviticus': 7, 'Numbers': 8, 'Deuteronomy': 9,
        'Joshua': 10, 'Judges': 11, 'Ruth': 12, '1 Samuel': 13, '2 Samuel': 14,
        '1 Kings': 15, '2 Kings': 16, '1 Chronicles': 17, '2 Chronicles': 18,
        'Ezra': 19, 'Nehemiah': 20, 'Esther': 21, 'Job': 22, 'Psalms': 23,
        'Proverbs': 24, 'Ecclesiastes': 25, 'Song of Solomon': 26, 'Isaiah': 27,
        'Jeremiah': 28, 'Lamentations': 29, 'Ezekiel': 30, 'Daniel': 31,
        'Hosea': 32, 'Joel': 33, 'Amos': 34, 'Obadiah': 35, 'Jonah': 36,
        'Micah': 37, 'Nahum': 38, 'Habakkuk': 39, 'Zephaniah': 40, 'Haggai': 41,
        'Zechariah': 42, 'Malachi': 43, 'Matthew': 44, 'Mark': 45, 'Luke': 46,
        'John': 47, 'Acts': 48, 'Romans': 49, '1 Corinthians': 50, '2 Corinthians': 51,
        'Galatians': 52, 'Ephesians': 53, 'Philippians': 54, 'Colossians': 55,
        '1 Thessalonians': 56, '2 Thessalonians': 57, '1 Timothy': 58, '2 Timothy': 59,
        'Titus': 60, 'Philemon': 61, 'Hebrews': 62, 'James': 63, '1 Peter': 64,
        '2 Peter': 65, '1 John': 66, '2 John': 67, '3 John': 68, 'Jude': 69, 'Revelation': 70
      };
      
      const bookId = bookNameToId[ref.book];
      if (bookId) {
        onNavigateToVerse(bookId, ref.chapter, ref.verse_start);
      }
    }
  };

  const generateScholarlyAnalysis = async () => {
    if (!summary) return;
    
    setScholarlyButtonState('loading');
    
    try {
      const payload = {
        verse_range_start: summary.verse_range_start,
        verse_range_end: summary.verse_range_end,
        perspectives: selectedPerspectives,
        existing_analyses: Object.entries(summary.perspectives).map(([perspective, data]) => ({
          perspective,
          response_text: data.response_text,
          cross_references: data.cross_references
        }))
      };
      
      const response = await api.post('/analysis/scholarly-consensus', payload);
      console.log('AnalysisSidebar - Full response object:', response);
      
      // Handle both response.data and direct response formats
      const responseData = response.data || response;
      
      if (responseData && responseData.scholarly_analysis) {
        setScholarlyAnalysisData(responseData.scholarly_analysis);
        setDenominationalAnalysisData(responseData.denominational_analyses || {});
        setScholarlyButtonState('view');
      } else {
        console.error('No scholarly_analysis in response:', responseData);
        setScholarlyButtonState('generate');
      }
    } catch (error) {
      console.error('Failed to generate scholarly analysis:', error);
      setScholarlyButtonState('generate');
    }
  };

  return (
    <Sidebar
      isVisible={isVisible}
      title={
        <div className="flex items-center justify-between w-full">
          <span>AI Analysis</span>
          {summary && selectedPerspectives.length > 1 && (scholarlyButtonState === 'view' || scholarlyButtonState === 'generate' || scholarlyButtonState === 'loading') && (
            <button
              onClick={() => {
                if (scholarlyButtonState === 'view') {
                  onViewScholarlyAnalysis?.(scholarlyAnalysisData, denominationalAnalysisData);
                } else if (scholarlyButtonState === 'generate') {
                  generateScholarlyAnalysis();
                }
              }}
              disabled={scholarlyButtonState === 'loading'}
              className="px-3 py-1.5 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full text-sm border border-stone-200 dark:border-stone-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {scholarlyButtonState === 'loading' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-stone-700 dark:text-stone-300 font-medium">Generating...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-stone-600 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-stone-700 dark:text-stone-300 font-medium">
                    {scholarlyButtonState === 'view' ? 'View Deep Analysis' : 'Deep Analysis'}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      }
      onClose={scholarlyButtonState === 'loading' ? () => {} : onClose}
    >
      <SidebarContent>
        {!summary && !isLoadingSummary ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-stone-600 dark:text-stone-400 text-sm">
              Click &quot;Explain&quot; to generate analysis
            </div>
          </div>
        ) : isLoadingSummary ? (
          <>
            {/* Show user question if present - at the very top */}
            {userQuestion && (
              <SidebarSection>
                <div className="mb-6">
                  <p className="text-xl text-stone-900 dark:text-stone-100 leading-relaxed font-medium">
                    &quot;{userQuestion}&quot;
                  </p>
                </div>
              </SidebarSection>
            )}

            {/* Show passage info while loading */}
            <SidebarSection>
              <div className="space-y-3 pb-4">
                <div className="text-sm text-stone-600 dark:text-stone-400 uppercase tracking-wide">
                  {getCurrentVerseInfo()?.reference || 'Selected Passage'}
                </div>
                {getCurrentVerseInfo()?.verseText && (
                  <blockquote className="text-lg text-stone-900 dark:text-stone-100 leading-relaxed font-serif border-l-2 border-stone-200/50 dark:border-stone-700/50 pl-4">
                    &quot;{getCurrentVerseInfo()?.verseText}&quot;
                  </blockquote>
                )}
              </div>
            </SidebarSection>

            {/* Show perspectives that will be analyzed */}
            <SidebarSection>
              <div className="border-t border-stone-200/50 dark:border-stone-700/50 pt-8">
                <div className="text-xs text-stone-600 dark:text-stone-400 uppercase tracking-wide mb-3">
                  Theological Perspectives
                </div>
                <div className="flex flex-wrap gap-2">
                  {PERSPECTIVES.filter(p => selectedPerspectives.includes(p.key)).map((perspective) => (
                    <div
                      key={perspective.key}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
                    >
                      {perspective.label}
                    </div>
                  ))}
                </div>
              </div>
            </SidebarSection>

            {/* Analysis skeleton loader */}
            <SidebarSection>
              <div className="border-t border-stone-200/50 dark:border-stone-700/50 pt-8">
                <div className="space-y-4">
                  {/* Analysis text skeleton */}
                  <div className="space-y-3">
                    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse"></div>
                    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-4/5"></div>
                    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-5/6"></div>
                    <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-2/3"></div>
                  </div>
                  
                  {/* Cross references skeleton */}
                  <div className="border-t border-stone-200/50 dark:border-stone-700/50 pt-8 space-y-3">
                    <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-32"></div>
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-24"></div>
                        <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-full"></div>
                        <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-4/5"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-28"></div>
                        <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-full"></div>
                        <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-3/4"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-32"></div>
                        <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-full"></div>
                        <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded animate-pulse w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SidebarSection>
          </>
        ) : summary ? (
          <>
            {/* User Question Display - at the very top */}
            {userQuestion && (
              <SidebarSection>
                <div className="mb-6">
                  <p className="text-xl text-stone-900 dark:text-stone-100 leading-relaxed font-medium">
                    &quot;{userQuestion}&quot;
                  </p>
                </div>
              </SidebarSection>
            )}

            {/* Verse Display */}
            <SidebarSection>
              <div className="space-y-3 pb-4">
                <div className="text-sm text-stone-600 dark:text-stone-400 uppercase tracking-wide">
                  {summary.reference}
                </div>
                <blockquote className="text-lg text-stone-900 dark:text-stone-100 leading-relaxed font-serif border-l-2 border-stone-200/50 dark:border-stone-700/50 pl-4">
                  &quot;{summary.verse_text}&quot;
                </blockquote>
              </div>
            </SidebarSection>

            {/* Perspective Tabs */}
            <SidebarSection>
              <div className="border-t border-stone-200/50 dark:border-stone-700/50 pt-8">
                <div className="flex overflow-x-auto scrollbar-hide space-x-1">
                  {PERSPECTIVES.filter(p => selectedPerspectives.includes(p.key)).map((perspective) => (
                    <button
                      key={perspective.key}
                      onClick={() => setActivePerspective(perspective.key)}
                      className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                        activePerspective === perspective.key
                          ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/50'
                      }`}
                    >
                      {perspective.label}
                    </button>
                  ))}
                </div>
              </div>
            </SidebarSection>


            {/* Active Perspective Content */}
            <SidebarSection>
              {summary.perspectives[activePerspective] && (
                <div className="space-y-6">
                  
                  <div>
                    <p className="text-lg text-stone-900 dark:text-stone-100 leading-relaxed">
                      {parseMarkdown(summary.perspectives[activePerspective].response_text)}
                    </p>
                  </div>
                  
                  {summary.perspectives[activePerspective].cross_references?.length > 0 && (
                    <div className="border-t border-stone-200/50 dark:border-stone-700/50 pt-8">
                      <h4 className="text-sm font-medium text-stone-900 dark:text-stone-100 mb-4 uppercase tracking-wide">Cross References</h4>
                      <div className="space-y-2">
                        {summary.perspectives[activePerspective].cross_references.map((ref, index) => (
                          <div 
                            key={index} 
                            className="hover:bg-stone-200/30 dark:hover:bg-stone-800/30 cursor-pointer transition-colors rounded-lg p-3"
                            onClick={() => handleCrossReferenceClick(ref)}
                          >
                            <div className="mb-2">
                              <span className="text-md font-medium text-stone-600 dark:text-stone-400">
                                {ref.reference_display}
                              </span>
                            </div>
                            <p className="text-md text-stone-900 dark:text-stone-100 leading-relaxed">
                              {ref.relevance_note}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </SidebarSection>
          </>
        ) : null}
      </SidebarContent>
      
      
      {/* Toast Notification */}
    </Sidebar>
  );
}
