import { Book, BorrowedBook, Category, Inquiry, LibraryStats, User, Video } from "./types";

export const API_BASE_URL = "http://localhost:8000/api";

// Helper function for auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('library-token');
  if (!token) throw new Error('Authentication required');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

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

export async function submitInquiry(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/contact/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Failed to submit inquiry');
  }
}

// Admin Book Endpoints
export async function createBook(bookData: FormData): Promise<Book> {
  const token = localStorage.getItem('library-token');
  const res = await fetch(`${API_BASE_URL}/admin/books/`, {
    method: 'POST',
    body: bookData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create book');
  }
  return res.json();
}


// Admin Video Endpoints
export async function createVideo(videoData: FormData): Promise<Video> {
  const token = localStorage.getItem('library-token');
  const res = await fetch(`${API_BASE_URL}/admin/videos/`, {
    method: 'POST',
    body: videoData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to create video');
  }
  return res.json();
}

export async function updateVideo(video_uuid: string, videoData: FormData): Promise<Video> {
  const token = localStorage.getItem('library-token');
  const res = await fetch(`${API_BASE_URL}/admin/videos/${video_uuid}/`, {
    method: 'PATCH',
    body: videoData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to update video');
  }
  return res.json();
}

// Admin Reports
export async function fetchAdminLibraryStats(): Promise<LibraryStats> {
const token = localStorage.getItem("library-token");
const res = await fetch(`${API_BASE_URL}/admin/reports/`, {
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  }
});
  if (!res.ok) throw new Error('Failed to fetch library stats');
  return res.json();
}

export async function fetchCategoryReport(): Promise<{name: string, book_count: number}[]> {
  const res = await fetch(`${API_BASE_URL}/admin/reports/categories/`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch category report');
  return res.json();
}

export async function fetchExternalSourcesReport(): Promise<{
  external_books: number,
  external_videos: number
}> {
  const res = await fetch(`${API_BASE_URL}/admin/reports/external-sources/`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch external sources report');
  return res.json();
}

// Borrow Management
export async function fetchBorrowedBooks(status?: 'overdue' | 'active'): Promise<BorrowedBook[]> {
  const url = status 
    ? `${API_BASE_URL}/admin/borrows/active/?status=${status}`
    : `${API_BASE_URL}/admin/borrows/active/`;
  
  const token = localStorage.getItem("library-token");
  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) throw new Error('Failed to fetch borrowed books');
  return res.json();
}

export async function fetchOverdueBooks(): Promise<BorrowedBook[]> {
  const res = await fetch(`${API_BASE_URL}/admin/overdue/`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch overdue books');
  return res.json();
}

export async function markBookReturned(borrowId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/borrows/return/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ borrow_id: borrowId })
  });
  if (!res.ok) throw new Error('Failed to mark book as returned');
}

// Category Management
export async function createCategory(name: string, description: string): Promise<Category> {
  const res = await fetch(`${API_BASE_URL}/admin/categories/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, description })
  });
  if (!res.ok) throw new Error('Failed to create category');
  return res.json();
}

// Inquiry Management
export async function fetchInquiries(): Promise<Inquiry[]> {
  const token = localStorage.getItem("library-token");
  const res = await fetch(`${API_BASE_URL}/admin/inquiries/`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) throw new Error('Failed to fetch inquiries');
  return res.json();
}

export async function markInquiryResolved(inquiryId: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/inquiries/${inquiryId}/resolve/`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to mark inquiry as resolved');
}

export async function fetchAdminUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE_URL}/admin/users/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  return Array.isArray(data) ? data : data.results; // <-- fix for paginated response
}

// Add UUID search
export async function searchByUUID(uuid: string): Promise<Book | Video | null> {
  const res = await fetch(`${API_BASE_URL}/search/uuid/?q=${uuid}`);
  if (!res.ok) return null;
  return res.json();
}

// Delete Book
export async function deleteBook(bookUuid: string): Promise<void> {
  const token = localStorage.getItem('library-token');
  const res = await fetch(`${API_BASE_URL}/admin/books/${bookUuid}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete book');
  }
}

// Delete Video
export async function deleteVideo(videoUuid: string): Promise<void> {
  const token = localStorage.getItem('library-token');
  const res = await fetch(`${API_BASE_URL}/admin/videos/${videoUuid}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete video');
  }
}

// Delete Category
export async function deleteCategory(categoryId: number): Promise<void> {
  const token = localStorage.getItem('library-token');
  const res = await fetch(`${API_BASE_URL}/admin/categories/${categoryId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete category');
  }
}

// Delete User
export async function deleteUser(userId: number): Promise<void> {
  const token = localStorage.getItem('library-token');
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete user');
  }
}

// Delete Inquiry
export async function deleteInquiry(inquiryId: number): Promise<void> {
  const token = localStorage.getItem('library-token');
  const res = await fetch(`${API_BASE_URL}/admin/inquiries/${inquiryId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to delete inquiry');
  }
}