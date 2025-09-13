'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Chapter {
  id: number;
  chapter_number: number;
  verse_count: number;
}

interface ChapterThumbnailsProps {
  bookId: number;
  selectedChapter: number | null;
  onChapterSelect: (chapterNumber: number) => void;
}

export function ChapterThumbnails({ bookId, selectedChapter, onChapterSelect }: ChapterThumbnailsProps) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChapters = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/bible/books/${bookId}/chapters`);
        setChapters(response.chapters);
      } catch (error) {
        console.error('Failed to load chapters:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (bookId) {
      loadChapters();
    }
  }, [bookId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-stone-500 font-normal text-sm">Loading chapters...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h3 className="text-lg font-normal text-stone-900 mb-4">Chapters</h3>
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-6">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => onChapterSelect(chapter.chapter_number)}
            className={`aspect-square rounded-2xl transition-all hover:scale-105 ${
              selectedChapter === chapter.chapter_number
                ? 'bg-blue-100 text-blue-700'
                : 'bg-stone-50 text-stone-700 hover:bg-blue-50'
            }`}
          >
            <div className="flex flex-col items-center justify-center h-full p-2">
              <span className="text-sm font-medium">{chapter.chapter_number}</span>
              <span className="text-xs text-stone-500 mt-1">{chapter.verse_count}v</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
