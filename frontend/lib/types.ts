export interface Book {
  id: string
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
  is_featured: boolean
  book_type: "EBOOK" | "PHYSICAL"
  download_permission: "AUTH" | "ALL" | "NONE"
  is_ebook: boolean
  available_status: string
  external_source: string | null
  is_external: boolean
  description: string
  publication_date: string | null
  summary: string
}

export interface Video {
  video_uuid: string
  title: string
  instructor: string
  duration: string // in format "1h 30m"
  categories: string[]
  is_available: boolean
  video_file: string | null
  thumbnail: string
  is_featured: boolean
  access_permission: "AUTH" | "ALL" | "NONE"
  external_source: string | null
  is_external: boolean
  description: string
  upload_date: string
  summary: string
  views: number
  difficulty_level: "Beginner" | "Intermediate" | "Advanced"
  language: string
}

export interface Category {
  id: string
  name: string
  description: string
  bookCount: number
  videoCount: number
}

export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "guest"
  registrationDate: string
  booksRead: number
  videosWatched: number
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
  id: string
  book_uuid: string
  user_id: string
  borrow_date: string
  due_date: string
  return_date: string | null
  status: "borrowed" | "returned" | "overdue"
  book: Book
  user: User
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
