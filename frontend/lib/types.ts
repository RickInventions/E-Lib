// lib/types.ts
export interface Book {
  id: number
  book_uuid: string
  title: string
  author: string
  publisher: string
  categories: string[]
  is_available: boolean | true
  pdf_file: string | null
  cover_image: string
  total_copies: number
  available_copies: number
  is_featured: boolean
  book_type: "EBOOK" | "PHYSICAL"
  download_permission: "AUTH" | "ALL" | "NONE"
  description: string
  publication_date: string | null
  summary: string
  is_external: boolean
  external_source: string | null
  is_ebook: boolean
  created_at: string | number | Date
}

export interface Video {
  created_at: string | number | Date
  id: number
  video_uuid: string
  title: string
  instructor: string
  description: string
  category: string
  video_file: string
  thumbnail: string
  upload_date: string
  duration: number
  is_featured: boolean
  category_display: string
  is_external: boolean
  external_source: string | null
}

export interface Category {
  created_at: string | number | Date
  id: number
  name: string
  description: string
}

export interface User {
  created_at: string | number | Date
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "user";
}

export interface LibraryStats {
  total_books: number
  available_books: number
  total_users: number
  active_borrows: number
  categories: number
  videos: number
  video_external_sources: number
  physical_books: number
  e_books: number
  external_sources: number
  total_videos: number
  video_by_category: Record<string, number>
  overdue_books: number
}

export interface Inquiry {
  id: number
  name: string
  email: string
  subject: string
  message: string
  created_at: string
  is_resolved: boolean
}

export interface BorrowedBook {
  id: number;
  book: Book;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  borrowed_date: string;
  due_date: string;
  return_date: string | null;
  is_returned: boolean;
}

export interface BorrowResponse {
  message: string;
  due_date: string;
}
export interface ReadingProgress {
  id: string
  book_uuid: string
  user_id: string
  progress: number // 0-100 percentage
  last_read: string
  book: Book
}

export interface VideoProgress {
  id: string
  video_uuid: string
  user_id: string
  progress: number // 0-100 percentage
  last_watched: string
  video: Video
}

