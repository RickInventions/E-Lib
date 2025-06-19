// lib/types.ts
export interface Book {
  id: number
  book_uuid: string
  title: string
  author: string
  publisher: string
  categories: string[]
  is_available: boolean
  pdf_file: string | null
  cover_image: string
  total_copies: number
  available_copies: number
  is_external: boolean
  summary: string
  external_source: string | null
  is_featured: boolean
  book_type: "EBOOK" | "PHYSICAL"
  download_permission: "AUTH" | "ALL" | "NONE"
  is_ebook: boolean
  description: string
  publication_date: string | null
}

export interface Video {
  id: number
  video_uuid: string
  instructor: string
  title: string
  description: string
  category: string
  is_featured: boolean
  video_file: string
  thumbnail: string
  upload_date: string
  duration: number
  category_display: string
}

export interface Category {
  id: number
  name: string
  description: string
}


export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "admin" | "user";
}

export interface LibraryStats {
  totalBooks: number
  totalUsers: number
  totalCategories: number
  totalEbooks: number
  totalVideos: number
}

export interface Inquiry {
  id: string
  name: string
  email: string
  subject: string
  message: string
  date: string
  status: "pending" | "resolved"
}

export interface BorrowedBook {
  id: number;
  book_uuid: string;
  borrowed_date: string;
  due_date: string;
  return_date: string | null;
  is_returned: boolean;
  book: Book;
  user: User;
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

