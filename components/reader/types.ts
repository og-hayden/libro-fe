export interface Book {
  id: number;
  name: string;
  abbreviation: string;
  testament: string;
}

export interface Chapter {
  id: number;
  chapter_number: number;
  verse_count: number;
}

export interface Verse {
  id: number;
  verse_number: number;
  text: string;
  text_with_strongs: string;
  strongs_numbers: string[];
  reference: string;
}

export interface VerseRange {
  startVerseId: number;
  endVerseId: number;
}

export interface ProphecyVerse {
  prophecy_id: number;
  verse_numbers: number[];
  category: string;
  claim: string;
}

export interface FulfillmentVerse {
  prophecy_id: number;
  verse_numbers: number[];
  fulfillment_type: string;
  original_prophecy: string;
  verse: Verse;
}

export interface ProphecyData {
  prophecy_verses: ProphecyVerse[];
  fulfillment_verses: FulfillmentVerse[];
}

export interface Pagination {
  current_chapter: number;
  total_chapters: number;
  has_previous: boolean;
  has_next: boolean;
  previous_chapter: number | null;
  next_chapter: number | null;
  all_chapters: number[];
}

export type TextSize = 'small' | 'medium' | 'large' | 'xl';

export interface BibleReaderProps {
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
