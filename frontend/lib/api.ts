import { Book, BorrowedBook, Category, Video } from "./types";

export const API_BASE_URL = "http://localhost:8000/api";

export async function fetchPublicBooks(category?: string): Promise<Book[]> {
  const url = category 
    ? `${API_BASE_URL}/books/?category=${encodeURIComponent(category)}`
    : `${API_BASE_URL}/books/`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch books');
  return res.json();
}

export async function fetchPublicVideos(category?: string, page = 1, pageSize = 12): Promise<Video[]> {
  const url = category
    ? `${API_BASE_URL}/videos/?category=${encodeURIComponent(category)}`
    : `${API_BASE_URL}/videos/`;
      `${API_BASE_URL}/videos/?page=${page}&page_size=${pageSize}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch videos');
  return res.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/categories/`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchLibraryStats(): Promise<{
  total_books: number;
  total_videos: number;
  total_users: number;
  total_categories: number;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/stats/`);
    if (!res.ok) {
      console.error('Stats fetch failed with status:', res.status);
      return {
        total_books: 0,
        total_videos: 0,
        total_users: 0,
        total_categories: 0
      };
    }
    return res.json();
  } catch (error) {
    console.error('Failed to fetch library stats:', error);
    return {
      total_books: 0,
      total_videos: 0,
      total_users: 0,
      total_categories: 0
    };
  }
}

export async function fetchBookDetails(book_uuid: string): Promise<Book> {
  const res = await fetch(`${API_BASE_URL}/books/${book_uuid}/`);
  if (!res.ok) throw new Error('Failed to fetch book details');
  return res.json();
}


export async function searchBooks(query: string): Promise<Book[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/search/?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      throw new Error(`Search failed with status ${res.status}`);
    }
    const data = await res.json();
    return data.results || data; // Handle both {results: [...]} and direct array responses
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
}

export async function getSearchSuggestions(query: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/search/suggestions/?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      throw new Error(`Suggestions failed with status ${res.status}`);
    }
    const data = await res.json();
    return data.suggestions || data; // Handle both {suggestions: [...]} and direct array responses
  } catch (error) {
    console.error("Suggestions error:", error);
    return []; // Return empty array on error
  }
}

export async function fetchBookRecommendations(bookUuid: string): Promise<Book[]> {
  const res = await fetch(`${API_BASE_URL}/books/${bookUuid}/recommendations/`);
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function fetchVideoByUuid(video_uuid: string): Promise<Video> {
  const res = await fetch(`${API_BASE_URL}/videos/${video_uuid}/`);
  if (!res.ok) throw new Error('Failed to fetch video');
  return res.json();
}

export async function borrowBook(bookUuid: string, days: number): Promise<{ message: string; due_date: string }> {
  const token = localStorage.getItem('library-token');
  if (!token) throw new Error('Authentication required');
  
  const res = await fetch(`${API_BASE_URL}/books/${bookUuid}/borrow/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ days })
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to borrow book');
  }
  
  return res.json();
}

export async function fetchUserBorrowedBooks(): Promise<BorrowedBook[]> {
  const token = localStorage.getItem('library-token');
  if (!token) throw new Error('Authentication required');
  
  const res = await fetch(`${API_BASE_URL}/user/borrowed/`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!res.ok) throw new Error('Failed to fetch borrowed books');
  return res.json();
}

export async function fetchUserBorrowHistory(): Promise<BorrowedBook[]> {
  const token = localStorage.getItem('library-token');
  if (!token) throw new Error('Authentication required');

  const res = await fetch(`${API_BASE_URL}/user/borrow-history/`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error('Failed to fetch borrow history');
  return res.json();
}

export async function returnBook(borrowId: number): Promise<void> {
  const token = localStorage.getItem('library-token');
  if (!token) throw new Error('Authentication required');
  
  const res = await fetch(`${API_BASE_URL}/admin/borrows/return/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ borrow_id: borrowId })
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to return book');
  }
}