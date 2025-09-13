import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

interface UrlState {
  verse?: string;
  verses?: string;
  sidebar?: 'prophecy' | 'strongs' | 'metadata' | 'search';
  prophecyId?: string;
  strongsNumber?: string;
  searchQuery?: string;
}

interface UrlStateManager {
  state: UrlState;
  updateState: (updates: Partial<UrlState>) => void;
  generateShareUrl: () => string;
  clearState: () => void;
}

export function useUrlState(): UrlStateManager {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse current URL state
  const state = useMemo((): UrlState => {
    const verse = searchParams?.get('verse');
    const verses = searchParams?.get('verses');
    const sidebar = searchParams?.get('sidebar') as UrlState['sidebar'];
    const prophecyId = searchParams?.get('prophecy_id');
    const strongsNumber = searchParams?.get('strongs');
    const searchQuery = searchParams?.get('q');

    return {
      verse: verse || undefined,
      verses: verses || undefined,
      sidebar: sidebar || undefined,
      prophecyId: prophecyId || undefined,
      strongsNumber: strongsNumber || undefined,
      searchQuery: searchQuery || undefined,
    };
  }, [searchParams]);

  // Update URL state
  const updateState = useCallback((updates: Partial<UrlState>) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    
    // Handle verse selection
    if (updates.verse !== undefined) {
      if (updates.verse) {
        params.set('verse', updates.verse);
        params.delete('verses'); // Clear verses when setting single verse
      } else {
        params.delete('verse');
      }
    }
    
    if (updates.verses !== undefined) {
      if (updates.verses) {
        params.set('verses', updates.verses);
        params.delete('verse'); // Clear verse when setting verses
      } else {
        params.delete('verses');
      }
    }

    // Handle sidebar state
    if (updates.sidebar !== undefined) {
      if (updates.sidebar) {
        params.set('sidebar', updates.sidebar);
      } else {
        params.delete('sidebar');
      }
    }

    // Handle prophecy ID
    if (updates.prophecyId !== undefined) {
      if (updates.prophecyId) {
        params.set('prophecy_id', updates.prophecyId);
      } else {
        params.delete('prophecy_id');
      }
    }

    // Handle Strong's number
    if (updates.strongsNumber !== undefined) {
      if (updates.strongsNumber) {
        params.set('strongs', updates.strongsNumber);
      } else {
        params.delete('strongs');
      }
    }

    // Handle search query
    if (updates.searchQuery !== undefined) {
      if (updates.searchQuery) {
        params.set('q', updates.searchQuery);
      } else {
        params.delete('q');
      }
    }

    // Update the URL
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl);
  }, [searchParams, router]);

  // Generate shareable URL
  const generateShareUrl = useCallback((): string => {
    return `${window.location.origin}${window.location.pathname}${window.location.search}`;
  }, []);

  // Clear all state
  const clearState = useCallback(() => {
    router.replace(window.location.pathname);
  }, [router]);

  return {
    state,
    updateState,
    generateShareUrl,
    clearState,
  };
}

// Utility functions for verse handling
export function parseVerseSelection(verse?: string, verses?: string): {
  selectedVerseId: number | null;
  selectedVerseRange: { startVerseId: number; endVerseId: number } | null;
} {
  if (verses) {
    // Handle verse ranges like "5-8" or "5,7,9-12"
    if (verses.includes('-') && !verses.includes(',')) {
      const [start, end] = verses.split('-').map(Number);
      return {
        selectedVerseId: null,
        selectedVerseRange: { startVerseId: start, endVerseId: end }
      };
    }
  }
  
  if (verse) {
    return {
      selectedVerseId: parseInt(verse),
      selectedVerseRange: null
    };
  }

  return {
    selectedVerseId: null,
    selectedVerseRange: null
  };
}

export function formatVerseSelection(
  selectedVerseId: number | null, 
  selectedVerseRange: { startVerseId: number; endVerseId: number } | null
): { verse?: string; verses?: string } {
  if (selectedVerseRange) {
    if (selectedVerseRange.startVerseId === selectedVerseRange.endVerseId) {
      return { verse: selectedVerseRange.startVerseId.toString() };
    }
    return { verses: `${selectedVerseRange.startVerseId}-${selectedVerseRange.endVerseId}` };
  }
  
  if (selectedVerseId) {
    return { verse: selectedVerseId.toString() };
  }
  
  return {};
}
