'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { BookOpen } from 'lucide-react';

interface ChapterMetadata {
  chapter_id: number;
  summary: string;
  art_s3_url: string | null;
  created_at: string;
  updated_at: string;
}

interface ChapterArtProps {
  bookId: number;
  chapterNumber: number;
  bookName?: string;
  onShowMetadata?: () => void;
}

export function ChapterArt({ bookId, chapterNumber, bookName, onShowMetadata }: ChapterArtProps) {
  const [artUrl, setArtUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChapterArt = async () => {
      if (!bookId || !chapterNumber) return;

      setLoading(true);
      setError(null);

      try {
        // Find the chapter ID first
        const chaptersResponse = await fetch(`http://localhost:5000/api/bible/books/${bookId}/chapters`);
        if (!chaptersResponse.ok) {
          throw new Error('Failed to fetch chapters');
        }

        const chaptersData = await chaptersResponse.json();
        const chapter = chaptersData.chapters.find((ch: { chapter_number: number }) => ch.chapter_number === chapterNumber);
        
        if (!chapter) {
          throw new Error('Chapter not found');
        }

        // Fetch chapter metadata
        const metadataResponse = await fetch(`http://localhost:5000/api/metadata/chapter/${chapter.id}`);
        if (!metadataResponse.ok) {
          // If metadata endpoint fails, silently handle (no art available)
          setArtUrl(null);
          setLoading(false);
          return;
        }

        const metadataData = await metadataResponse.json();
        const chapterMetadata: ChapterMetadata = metadataData.chapter?.metadata;
        
        if (chapterMetadata?.art_s3_url) {
          setArtUrl(chapterMetadata.art_s3_url);
        } else {
          setArtUrl(null);
        }
      } catch (err) {
        console.error('Error fetching chapter art:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chapter art');
        setArtUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChapterArt();
  }, [bookId, chapterNumber]);

  // Don't render anything if there's no art URL
  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-100 dark:bg-stone-800 rounded-2xl animate-pulse flex items-center justify-center">
        <div className="text-sm text-gray-500 dark:text-stone-400">Loading chapter artwork...</div>
      </div>
    );
  }

  if (error || !artUrl) {
    return null; // Silently don't render if no artwork available
  }

  return (
    <div className="w-full">
      <div className="relative aspect-[3/1] rounded-b-2xl overflow-hidden">
        <Image
          src={artUrl}
          alt={`Artwork for ${bookName || 'Chapter'} ${chapterNumber}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
          priority={true}
          onError={() => {
            console.error('Failed to load chapter art image');
            setArtUrl(null);
          }}
        />
        
        {/* Bottom gradient overlay - from black at bottom to transparent at middle */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Bottom overlay content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
          {/* Book Chapter title - bottom left */}
          <div>
            <h2 className="text-4xl font-medium text-white drop-shadow-lg">
              {bookName} {chapterNumber}
            </h2>
          </div>
          
          {/* About Chapter button - bottom right */}
          {onShowMetadata && (
            <button
              onClick={onShowMetadata}
              className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm border transition-all bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
            >
              <BookOpen className="w-4 h-4" />
              <span className="font-medium">About {bookName} {chapterNumber}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
