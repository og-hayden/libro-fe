interface CachedChapter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  book: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chapter: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verses: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pagination: any;
  timestamp: number;
}

class ChapterCache {
  private cache = new Map<string, CachedChapter>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  private getKey(bookId: number, chapterNumber: number): string {
    return `${bookId}:${chapterNumber}`;
  }

  set(bookId: number, chapterNumber: number, data: Omit<CachedChapter, 'timestamp'>): void {
    const key = this.getKey(bookId, chapterNumber);
    this.cache.set(key, {
      ...data,
      timestamp: Date.now()
    });
  }

  get(bookId: number, chapterNumber: number): CachedChapter | null {
    const key = this.getKey(bookId, chapterNumber);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached;
  }

  has(bookId: number, chapterNumber: number): boolean {
    return this.get(bookId, chapterNumber) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.TTL) {
        this.cache.delete(key);
      }
    }
  }
}

export const chapterCache = new ChapterCache();

// Cleanup expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    chapterCache.cleanup();
  }, 5 * 60 * 1000);
}
