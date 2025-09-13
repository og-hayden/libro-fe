'use client';

interface Book {
  id: number;
  name: string;
  testament: string;
}

interface Chapter {
  chapter_number: number;
}

interface BreadcrumbNavigationProps {
  book: Book | null;
  chapter: Chapter | null;
  onNavigateToBooks: () => void;
  onNavigateToChapters: (bookId: number) => void;
}

export function BreadcrumbNavigation({ 
  book, 
  chapter, 
  onNavigateToBooks, 
  onNavigateToChapters 
}: BreadcrumbNavigationProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-stone-600">
      <button
        onClick={onNavigateToBooks}
        className="hover:text-blue-600 transition-colors"
      >
        {book?.testament} Testament
      </button>
      
      {book && (
        <>
          <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <button
            onClick={() => onNavigateToChapters(book.id)}
            className="hover:text-blue-600 transition-colors"
          >
            {book.name}
          </button>
        </>
      )}
      
      {chapter && (
        <>
          <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-stone-900 font-medium">
            Chapter {chapter.chapter_number}
          </span>
        </>
      )}
    </nav>
  );
}
