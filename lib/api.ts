const BASE_URL = 'https://libro-be-761839557433.europe-west1.run.app/api';

// User interface for authentication
export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

// Authentication response interface
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Simple API client without authentication
class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Authentication methods
  setTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    
    return headers;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'Request failed' };
      }

      return { data };
    } catch {
      return { error: 'Network error occurred' };
    }
  }

  // Generic HTTP methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get(endpoint: string): Promise<any> {
    const response = await this.request(endpoint);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async post(endpoint: string, data: any): Promise<any> {
    const response = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async put(endpoint: string, data: any): Promise<any> {
    const response = await this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async delete(endpoint: string): Promise<any> {
    const response = await this.request(endpoint, {
      method: 'DELETE',
    });
    return response.data;
  }

  // Bible API methods
  async getBooks() {
    return this.get('/bible/books');
  }

  async getBook(bookId: number) {
    return this.get(`/bible/books/${bookId}`);
  }

  async getBookChapters(bookId: number) {
    return this.get(`/bible/books/${bookId}/chapters`);
  }

  async getBookChapter(bookId: number, chapterNumber: number) {
    return this.get(`/bible/books/${bookId}/chapters/${chapterNumber}`);
  }

  async getChapter(chapterId: number) {
    return this.get(`/bible/chapters/${chapterId}`);
  }

  async getChapterVerses(chapterId: number) {
    return this.get(`/bible/chapters/${chapterId}/verses`);
  }

  async getVerse(verseId: number) {
    return this.get(`/bible/verses/${verseId}`);
  }

  async getVerseRange(startVerseId: number, endVerseId?: number) {
    const params = new URLSearchParams({ start: startVerseId.toString() });
    if (endVerseId) {
      params.append('end', endVerseId.toString());
    }
    return this.get(`/bible/verses/range?${params}`);
  }

  async searchVerses(query: string, limit = 50, offset = 0, book?: string) {
    const params = new URLSearchParams({ 
      q: query, 
      limit: limit.toString(), 
      offset: offset.toString() 
    });
    if (book) {
      params.append('book', book);
    }
    return this.get(`/bible/search?${params}`);
  }

  async searchVersesGrouped(query: string) {
    const params = new URLSearchParams({ q: query });
    return this.get(`/bible/search/grouped?${params}`);
  }

  async getByReference(reference: string) {
    const params = new URLSearchParams({ ref: reference });
    return this.get(`/bible/reference?${params}`);
  }

  // Analysis API methods
  async generateSummary(verseRangeStart: number, verseRangeEnd?: number, perspectives?: string[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { verse_range_start: verseRangeStart };
    if (verseRangeEnd) {
      data.verse_range_end = verseRangeEnd;
    }
    if (perspectives) {
      data.perspectives = perspectives;
    }
    return this.post('/analysis/summary', data);
  }

  async askQuestion(verseRangeStart: number, question: string, verseRangeEnd?: number, perspectives?: string[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { 
      verse_range_start: verseRangeStart, 
      question 
    };
    if (verseRangeEnd) {
      data.verse_range_end = verseRangeEnd;
    }
    if (perspectives) {
      data.perspectives = perspectives;
    }
    return this.post('/analysis/question', data);
  }

  // Strong's API methods
  async lookupStrongsNumber(strongsNumber: string) {
    return this.get(`/strongs/lookup/${strongsNumber}`);
  }

  async searchStrongs(query: string, language = 'both', limit = 20) {
    const params = new URLSearchParams({ 
      q: query, 
      language, 
      limit: limit.toString() 
    });
    return this.get(`/strongs/search?${params}`);
  }

  async getConcordance(strongsNumber: string) {
    return this.get(`/strongs/concordance/${strongsNumber}`);
  }

  async getConcordanceByBook(strongsNumber: string, bookName: string) {
    return this.get(`/strongs/concordance/${strongsNumber}/book/${bookName}`);
  }

  async getVerseStrongs(verseId: number) {
    return this.get(`/strongs/verse/${verseId}/strongs`);
  }

  async getStrongsStats() {
    return this.get('/strongs/stats');
  }

  // Authentication API methods
  async login(credentials: { username: string; password: string }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: { username: string; email: string; password: string }): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/me', {
      headers: this.getAuthHeaders(),
    });
  }
}

export const api = new ApiClient(BASE_URL);
export const apiClient = new ApiClient(BASE_URL);
