'use client';

import { useRouter } from 'next/navigation';
import { BibleNavMenu } from '@/components/layout/BibleNavMenu';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export default function Home() {
  const router = useRouter();

  const handleNavigateToChapter = (bookName: string, chapterNumber: number, verseId?: number) => {
    // Convert book name to URL-friendly slug
    const bookSlug = bookName.toLowerCase().replace(/\s+/g, '-');
    router.push(`/reader/${bookSlug}/${chapterNumber}${verseId ? `?verse=${verseId}` : ''}`);
  };

  return (
    <div className="min-h-screen">
      <div className="flex h-screen items-center justify-center">
        <div className="w-full bg-white dark:bg-stone-900">
          <BibleNavMenu onNavigate={handleNavigateToChapter} />
        </div>
      </div>

      {/* Theme Toggle - Fixed Position */}
      <div className="fixed bottom-4 left-4 z-50">
        <ThemeToggle />
      </div>
    </div>
  );
}
