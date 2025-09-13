'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Book {
  id: number;
  name: string;
  abbreviation: string;
  testament: string;
  chapter_count: number;
}

interface BibleNavMenuProps {
  onNavigate: (bookName: string, chapterNumber: number, verseId?: number) => void;
}


export function BibleNavMenu({ onNavigate }: BibleNavMenuProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBook, setExpandedBook] = useState<number | null>(null);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const response = await api.get('/bible/books');
        setBooks(response.books);
      } catch (error) {
        console.error('Failed to load books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, []);

  const oldTestamentBooks = books.filter(book => book.testament === 'Old');
  const newTestamentBooks = books.filter(book => book.testament === 'New');

  const handleBookClick = (book: Book) => {
    if (expandedBook === book.id) {
      setExpandedBook(null);
      return;
    }

    setExpandedBook(book.id);
  };

  const handleChapterSelect = (bookId: number, chapterNumber: number) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      onNavigate(book.name, chapterNumber);
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-stone-500 dark:text-stone-400 font-normal">Loading Bible...</div>
      </div>
    );
  }


  return (
    <div className="h-full overflow-y-auto flex bg-stone-50 dark:bg-stone-900">
      {/* Main Content */}
      <div className="flex flex-col items-center py-12 w-full">
        {/* Two Section Layout with Separator */}
        <div className="flex gap-24 mb-24 max-w-none mx-auto px-8">
          {/* Old Testament Section */}
          <div className="flex-1">
            <h2 className="text-xl font-normal text-stone-900 dark:text-stone-100 mb-6 text-left">Old Testament</h2>
            <div className="grid gap-4 grid-cols-3">
              {/* Old Testament - Column 1 */}
              <div>
                <div className="space-y-1">
                  {oldTestamentBooks.slice(0, Math.ceil(oldTestamentBooks.length / 3)).map((book) => (
                    <div key={book.id} className="space-y-1">
                      <button
                        onClick={() => handleBookClick(book)}
                        className="w-full min-w-[240px] px-4 py-3 text-left bg-stone-100 dark:bg-stone-800 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-xl transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between min-w-0 w-full">
                          <span className="text-sm font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 flex-shrink-0">
                            {book.name}
                          </span>
                          <span className="text-xs text-stone-600 dark:text-stone-400 bg-stone-200 dark:bg-stone-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 group-hover:text-blue-700 dark:group-hover:text-blue-300 px-2 py-1 rounded-full flex-shrink-0 ml-4">
                            {book.chapter_count}
                          </span>
                        </div>
                      </button>
                      
                      {expandedBook === book.id && (
                        <div className="pb-4">
                          <div className="text-xs text-stone-500 dark:text-stone-400 mb-2 text-left">Chapters</div>
                          <div className="grid gap-1 grid-cols-8">
                            {Array.from({ length: book.chapter_count }, (_, index) => (
                              <button
                                key={index + 1}
                                onClick={() => handleChapterSelect(book.id, index + 1)}
                                className="w-6 h-6 flex items-center justify-center bg-stone-200/50 dark:bg-stone-700 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors group"
                              >
                                <div className="text-xs font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                  {index + 1}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Old Testament - Column 2 */}
              <div>
                <div className="space-y-1">
                  {oldTestamentBooks.slice(Math.ceil(oldTestamentBooks.length / 3), Math.ceil(oldTestamentBooks.length * 2 / 3)).map((book) => (
                    <div key={book.id} className="space-y-1">
                      <button
                        onClick={() => handleBookClick(book)}
                        className="w-full min-w-[240px] px-4 py-3 text-left bg-stone-100 dark:bg-stone-800 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-xl transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between min-w-0 w-full">
                          <span className="text-sm font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 flex-shrink-0">
                            {book.name}
                          </span>
                          <span className="text-xs text-stone-600 dark:text-stone-400 bg-stone-200 dark:bg-stone-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 group-hover:text-blue-700 dark:group-hover:text-blue-300 px-2 py-1 rounded-full flex-shrink-0 ml-4">
                            {book.chapter_count}
                          </span>
                        </div>
                      </button>
                      
                      {expandedBook === book.id && (
                        <div className="pb-4">
                          <div className="text-xs text-stone-500 dark:text-stone-400 mb-2 text-left">Chapters</div>
                          <div className="grid gap-1 grid-cols-8">
                            {Array.from({ length: book.chapter_count }, (_, index) => (
                              <button
                                key={index + 1}
                                onClick={() => handleChapterSelect(book.id, index + 1)}
                                className="w-6 h-6 flex items-center justify-center bg-stone-200/50 dark:bg-stone-700 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors group"
                              >
                                <div className="text-xs font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                  {index + 1}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Old Testament - Column 3 */}
              <div>
                <div className="space-y-1">
                  {oldTestamentBooks.slice(Math.ceil(oldTestamentBooks.length * 2 / 3)).map((book) => (
                    <div key={book.id} className="space-y-1">
                      <button
                        onClick={() => handleBookClick(book)}
                        className="w-full min-w-[240px] px-4 py-3 text-left bg-stone-100 dark:bg-stone-800 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-xl transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between min-w-0 w-full">
                          <span className="text-sm font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 flex-shrink-0">
                            {book.name}
                          </span>
                          <span className="text-xs text-stone-600 dark:text-stone-400 bg-stone-200 dark:bg-stone-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 group-hover:text-blue-700 dark:group-hover:text-blue-300 px-2 py-1 rounded-full flex-shrink-0 ml-4">
                            {book.chapter_count}
                          </span>
                        </div>
                      </button>
                      
                      {expandedBook === book.id && (
                        <div className="pb-4">
                          <div className="text-xs text-stone-500 dark:text-stone-400 mb-2 text-left">Chapters</div>
                          <div className="grid gap-1 grid-cols-8">
                            {Array.from({ length: book.chapter_count }, (_, index) => (
                              <button
                                key={index + 1}
                                onClick={() => handleChapterSelect(book.id, index + 1)}
                                className="w-6 h-6 flex items-center justify-center bg-stone-200/50 dark:bg-stone-700 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors group"
                              >
                                <div className="text-xs font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                  {index + 1}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* New Testament Section */}
          <div className="flex-1">
            <h2 className="text-xl font-normal text-stone-900 dark:text-stone-100 mb-6 text-left">New Testament</h2>
            <div className="grid gap-4 grid-cols-3">
              {/* New Testament - Column 1 */}
              <div>
                <div className="space-y-1">
                  {newTestamentBooks.slice(0, Math.ceil(newTestamentBooks.length / 3)).map((book) => (
                    <div key={book.id} className="space-y-1">
                      <button
                        onClick={() => handleBookClick(book)}
                        className="w-full min-w-[240px] px-4 py-3 text-left bg-stone-100 dark:bg-stone-800 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-xl transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between min-w-0 w-full">
                          <span className="text-sm font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 flex-shrink-0">
                            {book.name}
                          </span>
                          <span className="text-xs text-stone-600 dark:text-stone-400 bg-stone-200 dark:bg-stone-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 group-hover:text-blue-700 dark:group-hover:text-blue-300 px-2 py-1 rounded-full flex-shrink-0 ml-4">
                            {book.chapter_count}
                          </span>
                        </div>
                      </button>
                      
                      {expandedBook === book.id && (
                        <div className="pb-4">
                          <div className="text-xs text-stone-500 dark:text-stone-400 mb-2 text-left">Chapters</div>
                          <div className="grid gap-1 grid-cols-8">
                            {Array.from({ length: book.chapter_count }, (_, index) => (
                              <button
                                key={index + 1}
                                onClick={() => handleChapterSelect(book.id, index + 1)}
                                className="w-6 h-6 flex items-center justify-center bg-stone-200/50 dark:bg-stone-700 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors group"
                              >
                                <div className="text-xs font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                  {index + 1}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* New Testament - Column 2 */}
              <div>
                <div className="space-y-1">
                  {newTestamentBooks.slice(Math.ceil(newTestamentBooks.length / 3), Math.ceil(newTestamentBooks.length * 2 / 3)).map((book) => (
                    <div key={book.id} className="space-y-1">
                      <button
                        onClick={() => handleBookClick(book)}
                        className="w-full min-w-[240px] px-4 py-3 text-left bg-stone-100 dark:bg-stone-800 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-xl transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between min-w-0 w-full">
                          <span className="text-sm font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 flex-shrink-0">
                            {book.name}
                          </span>
                          <span className="text-xs text-stone-600 dark:text-stone-400 bg-stone-200 dark:bg-stone-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 group-hover:text-blue-700 dark:group-hover:text-blue-300 px-2 py-1 rounded-full flex-shrink-0 ml-4">
                            {book.chapter_count}
                          </span>
                        </div>
                      </button>
                      
                      {expandedBook === book.id && (
                        <div className="pb-4">
                          <div className="text-xs text-stone-500 dark:text-stone-400 mb-2 text-left">Chapters</div>
                          <div className="grid gap-1 grid-cols-8">
                            {Array.from({ length: book.chapter_count }, (_, index) => (
                              <button
                                key={index + 1}
                                onClick={() => handleChapterSelect(book.id, index + 1)}
                                className="w-6 h-6 flex items-center justify-center bg-stone-200/50 dark:bg-stone-700 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors group"
                              >
                                <div className="text-xs font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                  {index + 1}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* New Testament - Column 3 */}
              <div>
                <div className="space-y-1">
                  {newTestamentBooks.slice(Math.ceil(newTestamentBooks.length * 2 / 3)).map((book) => (
                    <div key={book.id} className="space-y-1">
                      <button
                        onClick={() => handleBookClick(book)}
                        className="w-full min-w-[240px] px-4 py-3 text-left bg-stone-100 dark:bg-stone-800 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-xl transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between min-w-0 w-full">
                          <span className="text-sm font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-700 dark:group-hover:text-blue-300 flex-shrink-0">
                            {book.name}
                          </span>
                          <span className="text-xs text-stone-600 dark:text-stone-400 bg-stone-200 dark:bg-stone-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 group-hover:text-blue-700 dark:group-hover:text-blue-300 px-2 py-1 rounded-full flex-shrink-0 ml-4">
                            {book.chapter_count}
                          </span>
                        </div>
                      </button>
                      
                      {expandedBook === book.id && (
                        <div className="pb-4">
                          <div className="text-xs text-stone-500 dark:text-stone-400 mb-2 text-left">Chapters</div>
                          <div className="grid gap-1 grid-cols-8">
                            {Array.from({ length: book.chapter_count }, (_, index) => (
                              <button
                                key={index + 1}
                                onClick={() => handleChapterSelect(book.id, index + 1)}
                                className="w-6 h-6 flex items-center justify-center bg-stone-200/50 dark:bg-stone-700 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors group"
                              >
                                <div className="text-xs font-medium text-stone-900 dark:text-stone-100 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                  {index + 1}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>



      </div>
      
    </div>
  );
}
