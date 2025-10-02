'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface SearchResult {
  id: number;
  text: string;
  verse_number: number;
  reference: string;
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

interface StrongsDefinition {
  strongs_number: string;
  definition: string;
  transliteration: string;
  pronunciation: string;
  language: string;
  part_of_speech: string;
}

interface StrongsConcordanceProps {
  strongsNumber: string;
  onNavigateToVerse: (bookId: number, chapterNumber: number, verseId: number) => void;
  onClose: () => void;
}

export function StrongsConcordance({ strongsNumber, onNavigateToVerse, onClose }: StrongsConcordanceProps) {
  const [bookGroups, setBookGroups] = useState<BookGroup[]>([]);
  const [expandedBooks, setExpandedBooks] = useState<Set<number>>(new Set());
  const [bookVerses, setBookVerses] = useState<{ [bookId: number]: SearchResult[] }>({});
  const [loadingBooks, setLoadingBooks] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalVerses, setTotalVerses] = useState(0);
  const [strongsDefinition, setStrongsDefinition] = useState<StrongsDefinition | null>(null);

  useEffect(() => {
    const loadConcordanceGroups = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/strongs/concordance/${strongsNumber}`);
        
        if (response.book_groups) {
          setBookGroups(response.book_groups);
          setTotalBooks(response.total_books);
          setTotalVerses(response.total_verses);
          setStrongsDefinition(response.strongs_entry);
        }
      } catch (error) {
        console.error('Failed to load concordance:', error);
        setBookGroups([]);
      } finally {
        setLoading(false);
      }
    };

    loadConcordanceGroups();
  }, [strongsNumber]);

  const loadBookVerses = async (bookId: number) => {
    if (bookVerses[bookId]) return; // Already loaded
    
    setLoadingBooks(prev => new Set([...prev, bookId]));
    try {
      const bookName = bookGroups.find(g => g.book.id === bookId)?.book.name;
      const response = await api.get(`/strongs/concordance/${strongsNumber}/book/${bookName}`);
      
      if (response.results) {
        setBookVerses(prev => ({
          ...prev,
          [bookId]: response.results
        }));
      }
    } catch (error) {
      console.error('Failed to load book verses:', error);
    } finally {
      setLoadingBooks(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookId);
        return newSet;
      });
    }
  };

  const toggleBook = (bookId: number) => {
    const newExpanded = new Set(expandedBooks);
    if (newExpanded.has(bookId)) {
      newExpanded.delete(bookId);
    } else {
      newExpanded.add(bookId);
      loadBookVerses(bookId);
    }
    setExpandedBooks(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <Loader2 className="animate-spin h-5 w-5 text-stone-500" />
          <div className="text-stone-500">Loading concordance for {strongsNumber}...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-12 py-8">
      {/* Header */}
      <div className="mb-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm mb-4">
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-900 transition-colors"
          >
            Home
          </button>
          <span className="text-gray-300">›</span>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-900 transition-colors"
          >
            Reader
          </button>
          <span className="text-gray-300">›</span>
          <span className="text-stone-900 font-medium">
            Strong&apos;s {strongsNumber}
          </span>
        </nav>
        
        {/* Title and Info */}
        <div>
          <h2 className="text-xl font-normal text-stone-900">Strong&apos;s Concordance</h2>
          <p className="text-stone-500 mt-1 text-sm">
            {totalVerses} {totalVerses === 1 ? 'verse' : 'verses'} across {totalBooks} {totalBooks === 1 ? 'book' : 'books'} for {strongsNumber}
          </p>
        </div>
        
        {/* Word Definition */}
        {strongsDefinition && (
          <div className="mt-10 mb-12 space-y-4">
            <div className="flex items-center space-x-4">
              <span className="text-base font-mono text-stone-600 bg-stone-100 px-4 py-2 rounded-full">
                {strongsDefinition.strongs_number}
              </span>
              <span className="text-sm text-stone-500 uppercase tracking-wide">
                {strongsDefinition.language}
              </span>
              {strongsDefinition.part_of_speech && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-sm text-stone-500 uppercase tracking-wide">
                    {strongsDefinition.part_of_speech}
                  </span>
                </>
              )}
            </div>
            
            <div className="space-y-3">
              <h3 className="text-3xl font-serif text-stone-900 font-medium">
                {strongsDefinition.transliteration}
              </h3>
              {strongsDefinition.pronunciation && (
                <p className="text-xl font-serif text-stone-600 italic">
                  /{strongsDefinition.pronunciation}/
                </p>
              )}
              <p className="text-xl font-serif text-gray-800 leading-relaxed">
                {strongsDefinition.definition}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Book Groups */}
      <div className="space-y-6">
        {bookGroups.map((group) => (
          <div key={group.book.id}>
            {/* Book Header */}
            <button
              onClick={() => toggleBook(group.book.id)}
              className="w-full text-left hover:text-stone-600 transition-colors flex items-center justify-between mb-3"
            >
              <div className="flex items-center space-x-2">
                <div className={`transform transition-transform text-xs text-stone-400 ${expandedBooks.has(group.book.id) ? 'rotate-90' : ''}`}>
                  ▶
                </div>
                <h3 className="font-normal text-stone-900">{group.book.name}</h3>
                <span className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full">{group.verse_count}</span>
              </div>
              {loadingBooks.has(group.book.id) && (
                <div className="text-xs text-stone-400">Loading...</div>
              )}
            </button>

            {/* Expanded Verses */}
            {expandedBooks.has(group.book.id) && bookVerses[group.book.id] && (
              <div className="ml-4 space-y-3">
                {bookVerses[group.book.id].map((verse, index) => (
                  <div 
                    key={`${group.book.id}-${verse.id}-${index}`} 
                    onClick={() => onNavigateToVerse(verse.book.id, verse.chapter_info.chapter_number, verse.id)}
                    className="cursor-pointer hover:bg-stone-50 p-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-xs bg-stone-200 text-stone-700 px-2 py-1 rounded-full mt-0.5 flex-shrink-0">
                        {verse.chapter_info.chapter_number}:{verse.verse_number}
                      </span>
                      <div className="font-serif text-gray-800 leading-relaxed flex-1">
                        {verse.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {bookGroups.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="text-stone-500">No verses found for {strongsNumber}</div>
          <p className="text-stone-400 mt-1 text-sm">This Strong&apos;s number may not exist in the database.</p>
        </div>
      )}
    </div>
  );
}
