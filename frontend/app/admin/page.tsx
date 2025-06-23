"use client"
import { useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, TrendingUp, Plus, Edit, Trash2, BookMarked, AlertTriangle, Search, Video as VideoIcon, PlusSquareIcon } from "lucide-react"
import type { Book, Video, Category, Inquiry, BorrowedBook, LibraryStats, User } from "@/lib/types"
import { useRouter } from "next/navigation"
import { deleteBook, deleteVideo, deleteCategory, deleteUser, deleteInquiry, fetchBookCategoryReport } from "@/lib/api"
import Link from "next/link"
import { 
  fetchAdminLibraryStats, 
  fetchAdminUsers, 
  fetchBorrowedBooks, 
  fetchCategories, 
  fetchInquiries,
  fetchPublicBooks,
  fetchPublicVideos
} from "@/lib/api"
import { Input } from "@/components/ui/input"
import { useConfirm } from "@/hooks/use-confirm"
import { formatDuration } from "@/lib/utils"

type TabName = "books" | "videos" | "categories" | "users" | "inquiries" | "reports";

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<LibraryStats | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([]);
  const [currentTab, setCurrentTab] = useState<TabName>("books");
  const [bookCategories, setBookCategories] = useState<{
  category: string;
  total_books: number;
  available_books: number;
  ebooks: number;
  physical_books: number;
}[]>([]);
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [tabSearch, setTabSearch] = useState<Record<TabName, string>>({
    books: "",
    videos: "",
    categories: "",
    users: "",
    inquiries: "",
    reports: ""
  });
  const showConfirm = useConfirm()

  useEffect(() => {
    if (isAuthenticated === false || user?.role !== "admin") {
      router.push("/")
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, booksData, videosData, categoriesData, borrowedBooksData, inquiriesData, usersData, bookCategoriesData] = await Promise.all([
          fetchAdminLibraryStats(),
          fetchPublicBooks(),
          fetchPublicVideos(),
          fetchCategories(),
          fetchBorrowedBooks(),
          fetchInquiries(),
          fetchAdminUsers(),
          fetchBookCategoryReport()
        ])
        setUsers(usersData);
        setStats(statsData)
        setBooks(booksData)
        setVideos(videosData)
        setCategories(categoriesData)
        setBorrowedBooks(borrowedBooksData)
        setInquiries(inquiriesData)
        setBookCategories(bookCategoriesData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load admin data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (isAuthenticated && user?.role === "admin") {
      loadData()
    }
  }, [isAuthenticated, user])

  function getBorrowStatus(borrowed: BorrowedBook) {
    if (borrowed.is_returned) return "returned"
    const due = new Date(borrowed.due_date)
    const now = new Date()
    if (due < now) return "overdue"
    return "borrowed"
  }

  function handleTabSearchChange(tab: TabName, value: string) {
    setTabSearch(prev => ({ ...prev, [tab]: value }));
  }

  const overdueCount = borrowedBooks.filter(b => getBorrowStatus(b) === "overdue").length
  const getBooksByCategory = (category: string) => {
  return books.filter(book => book.categories.includes(category));
};
  
  const filteredUsers = users.filter(user =>
  user.first_name.toLowerCase().includes(tabSearch.users.toLowerCase()) ||
  user.last_name.toLowerCase().includes(tabSearch.users.toLowerCase()) ||
  user.email.toLowerCase().includes(tabSearch.users.toLowerCase()) ||
(user.username && user.username.toLowerCase().includes(tabSearch.users.toLowerCase()))
);

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(tabSearch.books.toLowerCase()) ||
    book.author.toLowerCase().includes(tabSearch.books.toLowerCase()) ||
    book.categories.some(cat => cat.toLowerCase().includes(tabSearch.books.toLowerCase())) ||
    book.book_uuid.toLowerCase().includes(tabSearch.books.toLowerCase()) 
  )

const filteredVideos = videos.filter(video =>
  video.title.toLowerCase().includes(tabSearch.videos.toLowerCase()) ||
  video.instructor.toLowerCase().includes(tabSearch.videos.toLowerCase()) ||
  (video.category_display?.toLowerCase().includes(tabSearch.videos.toLowerCase()) ?? false) ||
  video.video_uuid.toLowerCase().includes(tabSearch.videos.toLowerCase())
);
const filteredCategories = categories.filter(category =>
  category.name.toLowerCase().includes(tabSearch.categories.toLowerCase()) ||
  category.description.toLowerCase().includes(tabSearch.categories.toLowerCase())
);

const filteredInquiries = inquiries.filter(inquiry =>
  inquiry.subject.toLowerCase().includes(tabSearch.inquiries.toLowerCase()) ||
  inquiry.name.toLowerCase().includes(tabSearch.inquiries.toLowerCase()) ||
  inquiry.email.toLowerCase().includes(tabSearch.inquiries.toLowerCase()) ||
  inquiry.message.toLowerCase().includes(tabSearch.inquiries.toLowerCase())
);

const sortedBooks = [...filteredBooks].sort(
  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
);
const sortedUsers = [...filteredUsers].sort(
  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
);
const sortedVideos = [...filteredVideos].sort(
  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
);
const sortedInquiries = [...filteredInquiries].sort(
  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
);
const sortedCategories = [...filteredCategories].sort(
  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
);

const handleEditBook = (bookUuid: string) => {
  const book = books.find(b => b.book_uuid === bookUuid)
  if (book) {
    router.push(`/admin/books/edit?book=${encodeURIComponent(JSON.stringify(book))}`)
  }
}

  const handleEditVideo = (videoUuid: string) => {
  const video = videos.find(v => v.video_uuid === videoUuid)
  if (video) {
    router.push(`/admin/videos/edit?video=${encodeURIComponent(JSON.stringify(video))}
    `)
  }
  }

const handleEditCategory = (categoryId: number) => {
  const category = categories.find(c => c.id === categoryId)
  if (category) {
    router.push(`/admin/categories/edit?category=${encodeURIComponent(JSON.stringify(category))}
    `)
  }
  }
  
  const handleDeleteBook = async (bookUuid: string) => {
    const confirmed = await showConfirm(
      "Delete Book", 
      "Are you sure you want to delete this book? This action cannot be undone."
    )
    if (confirmed) {
      try {
        await deleteBook(bookUuid)
        setBooks(books.filter(b => b.book_uuid !== bookUuid))
        toast({ title: "Book deleted successfully", variant: "default" })
      } catch (error) {
        toast({ title: "Failed to delete book", variant: "destructive" })
      }
    }
  }

  const handleDeleteVideo = async (videoUuid: string) => {
    const confirmed = await showConfirm(
      "Delete Video", 
      "Are you sure you want to delete this video? This action cannot be undone."
    )
    if (confirmed) {
      try {
        await deleteVideo(videoUuid)
        setVideos(videos.filter(v => v.video_uuid !== videoUuid))
        toast({ title: "Video deleted successfully", variant: "default" })
      } catch (error) {
        toast({ title: "Failed to delete video", variant: "destructive" })
      }
    }
  }

  const handleDeleteCategory = async (categoryId: number) => {
    const confirmed = await showConfirm(
      "Delete Category", 
      "Are you sure you want to delete this category? All books in this category will be uncategorized."
    )
    if (confirmed) {
      try {
        await deleteCategory(categoryId)
        setCategories(categories.filter(c => c.id !== categoryId))
        toast({ title: "Category deleted successfully", variant: "default" })
      } catch (error) {
        toast({ title: "Failed to delete category", variant: "destructive" })
      }
    }
  }

  const handleDeleteUser = async (userId: number) => {
    const confirmed = await showConfirm(
      "Delete User", 
      "Are you sure you want to delete this user? This action cannot be undone."
    )
    if (confirmed) {
      try {
        await deleteUser(userId)
        setUsers(users.filter(u => u.id !== userId))
        toast({ title: "User deleted successfully", variant: "default" })
      } catch (error) {
        toast({ title: "Failed to delete user", variant: "destructive" })
      }
    }
  }

  const handleDeleteInquiry = async (inquiryId: number) => {
      try {
        await deleteInquiry(inquiryId)
        setInquiries(inquiries.filter(i => i.id !== inquiryId))
        toast({ title: "Inquiry marked as resolved", variant: "default" })
      } catch (error) {
        toast({ title: "Failed to resolve inquiry", variant: "destructive" })
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="text-lg">Loading admin dashboard...</span>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your library system</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Button asChild className="h-auto py-6 flex flex-col items-center justify-center">
          <Link href="/admin/books/add">
            <Plus className="h-6 w-6 mb-2" />
            <span>Add New Book</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
          <Link href="/admin/videos/add">
            <VideoIcon className="h-6 w-6 mb-2" />
            <span>Add New Video</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
          <Link href="/admin/categories/add">
            <PlusSquareIcon className="h-6 w-6 mb-2" />
            <span>Add New Category</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
          <Link href="/admin/books-to-return">
            <BookMarked className="h-6 w-6 mb-2" />
            <div className="flex flex-col items-center">
              <span>Books to Return</span>
              {overdueCount > 0 && (
                <Badge variant="destructive" className="mt-1">
                  {overdueCount} Overdue
                </Badge>
              )}
            </div>
          </Link>
        </Button>
        <Card className="h-auto py-6 flex flex-col items-center justify-center">
            <AlertTriangle className="h-6 w-6 mb-2" />
            <div className="flex flex-col items-center">
              <span>Pending Inquiries</span>
              <Badge variant="secondary" className="mt-1">
                {inquiries.filter(i => !i.is_resolved).length} New
              </Badge>
            </div>
        </Card>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_books}</div>
            <p className="text-xs text-muted-foreground">
              {stats.physical_books} physical, {stats.e_books} e-books
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
            <VideoIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_videos}</div>
            <p className="text-xs text-muted-foreground">{stats.video_external_sources} external</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_users}</div>
            <p className="text-xs text-muted-foreground">{stats.active_borrows} active borrows</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdue_books}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

     {/* Admin Tabs */}
      <Tabs
        defaultValue="books"
        className="space-y-4"
        value={currentTab}
        onValueChange={(value) => setCurrentTab(value as TabName)}
      >
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-6 min-w-[600px] lg:min-w-0">
            <TabsTrigger value="books" className="text-xs sm:text-sm">
              Books
            </TabsTrigger>
            <TabsTrigger value="videos" className="text-xs sm:text-sm">
              Videos
            </TabsTrigger>
            <TabsTrigger value="categories" className="text-xs sm:text-sm">
              Categories
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">
              Users
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="text-xs sm:text-sm">
              Inquiries
            </TabsTrigger>
            <TabsTrigger value="reports" className="text-xs sm:text-sm">
              Reports
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="books" className="space-y-4">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <CardTitle className="text-lg sm:text-xl">Manage Books</CardTitle>
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/admin/books/add">
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Add Book</span>
                    <span className="sm:hidden">Add</span>
                  </Link>
                </Button>
              </div>
              <Input
                placeholder="Search books by ID, title, author, categories..."
                value={tabSearch[currentTab] ?? ""}
                onChange={(e) => handleTabSearchChange(currentTab, e.target.value)}
                className="w-full"
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedBooks.slice(0, 5).map((book) => (
                  <div
                    key={book.book_uuid}
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border rounded-lg space-y-4 lg:space-y-0"
                  >
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-sm sm:text-base">{book.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">by {book.author}</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {book.categories.map((cat) => (
                          <Badge key={cat} variant="outline" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                        <Badge variant={book.book_type === "PHYSICAL" ? "destructive" : "default"} className="text-xs">
                          {book.book_type}
                        </Badge>
                        {book.book_type === "EBOOK" && (
                          <Badge variant="secondary" className="text-xs">
                            {book.download_permission === "ALL"
                              ? "Public Download"
                              : book.download_permission === "AUTH"
                                ? "Auth Download"
                                : "No Download"}
                          </Badge>
                        )}
                        {book.is_featured && (
                          <Badge variant="outline" className="text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {book.available_copies}/{book.total_copies} available • {book.book_uuid}
                      </p>
                    </div>
                    <div className="flex gap-2 lg:ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditBook(book.book_uuid)}
                        className="flex-1 lg:flex-none"
                      >
                        <Edit className="h-4 w-4 lg:mr-0" />
                        <span className="ml-2 lg:hidden">Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteBook(book.book_uuid)}
                        className="flex-1 lg:flex-none"
                      >
                        <Trash2 className="h-4 w-4 lg:mr-0" />
                        <span className="ml-2 lg:hidden">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <CardTitle className="text-lg sm:text-xl">Manage Videos</CardTitle>
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/admin/videos/add">
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Add Video</span>
                    <span className="sm:hidden">Add</span>
                  </Link>
                </Button>
              </div>
              <Input
                placeholder="Search videos..."
                value={tabSearch[currentTab] ?? ""}
                onChange={(e) => handleTabSearchChange(currentTab, e.target.value)}
                className="w-full"
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedVideos.slice(0, 5).map((video) => (
                  <div
                    key={video.video_uuid}
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border rounded-lg space-y-4 lg:space-y-0"
                  >
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-sm sm:text-base">{video.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">by {video.instructor}</p>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="text-xs">
                          {video.category_display}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {formatDuration(video.duration)}
                        </Badge>
                        {video.is_featured && (
                          <Badge variant="outline" className="text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 lg:ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditVideo(video.video_uuid)}
                        className="flex-1 lg:flex-none"
                      >
                        <Edit className="h-4 w-4 lg:mr-0" />
                        <span className="ml-2 lg:hidden">Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteVideo(video.video_uuid)}
                        className="flex-1 lg:flex-none"
                      >
                        <Trash2 className="h-4 w-4 lg:mr-0" />
                        <span className="ml-2 lg:hidden">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <CardTitle className="text-lg sm:text-xl">Manage Categories</CardTitle>
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/admin/categories/add">
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Add Category</span>
                    <span className="sm:hidden">Add</span>
                  </Link>
                </Button>
              </div>
              <Input
                placeholder="Search categories..."
                value={tabSearch[currentTab] ?? ""}
                onChange={(e) => handleTabSearchChange(currentTab, e.target.value)}
                className="w-full"
              />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {sortedCategories.map((category) => (
                  <div key={category.id} className="p-4 border rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm sm:text-base">{category.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">{category.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCategory(category.id)}
                          className="flex-1 sm:flex-none"
                        >
                          <Edit className="h-4 w-4 sm:mr-0" />
                          <span className="ml-2 sm:hidden">Edit</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="flex-1 sm:flex-none"
                        >
                          <Trash2 className="h-4 w-4 sm:mr-0" />
                          <span className="ml-2 sm:hidden">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <CardTitle className="text-lg sm:text-xl">Manage Users</CardTitle>
              </div>
              <Input
                placeholder="Search users..."
                value={tabSearch[currentTab] ?? ""}
                onChange={(e) => handleTabSearchChange(currentTab, e.target.value)}
                className="w-full"
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border rounded-lg space-y-4 lg:space-y-0"
                  >
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-sm sm:text-base">
                        {user.first_name} {user.last_name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">{user.email}</p>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs w-fit">
                        {user.role}
                      </Badge>
                      <p className="text-xs sm:text-sm text-gray-600">{new Date(user.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 lg:ml-4">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id)}
                        className="flex-1 lg:flex-none"
                      >
                        <Trash2 className="h-4 w-4 lg:mr-0" />
                        <span className="ml-2 lg:hidden">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

                  <TabsContent value="inquiries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Inquiries</CardTitle>
                <Input
    placeholder={`Search ${currentTab}...`}
    value={tabSearch[currentTab] ?? ""}
    onChange={e => handleTabSearchChange(currentTab, e.target.value)}
  />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedInquiries.map(inquiry => (
                  <div key={inquiry.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{inquiry.subject}</h3>
                        <p className="text-sm text-gray-600">
                          From: {inquiry.name} ({inquiry.email})
                        </p>
                        <p className="text-xs text-gray-500">{new Date(inquiry.created_at).toLocaleString()}</p>
                      </div>
                      <Badge variant={!inquiry.is_resolved ? "destructive" : "default"}>
                        {!inquiry.is_resolved ? "Pending" : "Resolved"}
                      </Badge>
                    </div>
                    <p className="text-sm mb-3">{inquiry.message}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleDeleteInquiry(inquiry.id)}>
                        Mark as Resolved
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 sm:space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:gap-8">
            {/* Book Categories Report */}
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-lg p-4 sm:p-6">
                <CardTitle className="text-white text-xl sm:text-2xl">Book Categories Report</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold mb-4">Categories Overview</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {bookCategories.map((cat) => (
                      <Button
                        key={cat.category}
                        variant={selectedCategory === cat.category ? "default" : "outline"}
                        className={`
                          h-auto flex flex-col items-center justify-center
                          px-4 py-4 rounded-xl transition-all duration-300
                          border-2 hover:border-primary
                          ${selectedCategory === cat.category ? "highlight-pulse" : ""}
                        `}
                        onClick={() => setSelectedCategory(cat.category === selectedCategory ? null : cat.category)}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className="font-bold text-sm sm:text-base text-center break-words">{cat.category}</div>
                          <div
                            className={`
                            text-xs sm:text-sm rounded-full px-2 sm:px-3 py-1
                            ${selectedCategory === cat.category ? "highlight-pulse" : ""}
                          `}
                          >
                            {cat.total_books} {cat.total_books === 1 ? "book" : "books"}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {selectedCategory && (
                  <div className="space-y-4 sm:space-y-6 animate-fade-in">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs sm:text-sm font-medium">Total Books</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg sm:text-2xl font-bold">
                            {bookCategories.find((c) => c.category === selectedCategory)?.total_books || 0}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs sm:text-sm font-medium">Available</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg sm:text-2xl font-bold">
                            {bookCategories.find((c) => c.category === selectedCategory)?.available_books || 0}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs sm:text-sm font-medium">E-Books</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg sm:text-2xl font-bold">
                            {bookCategories.find((c) => c.category === selectedCategory)?.ebooks || 0}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs sm:text-sm font-medium">Physical</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-lg sm:text-2xl font-bold">
                            {bookCategories.find((c) => c.category === selectedCategory)?.physical_books || 0}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-semibold mb-4">Books in {selectedCategory}</h3>
                      <div className="space-y-4">
                        {getBooksByCategory(selectedCategory).map((book) => (
                          <div
                            key={book.book_uuid}
                            className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border rounded-lg hover:bg-accent transition-colors space-y-4 lg:space-y-0"
                          >
                            <div className="flex-1 space-y-2">
                              <h3 className="font-semibold text-sm sm:text-base">{book.title}</h3>
                              <p className="text-xs sm:text-sm text-gray-600">by {book.author}</p>
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                <Badge
                                  variant={book.book_type === "PHYSICAL" ? "destructive" : "default"}
                                  className="text-xs"
                                >
                                  {book.book_type}
                                </Badge>
                                <Badge variant={book.is_available ? "default" : "destructive"} className="text-xs">
                                  {book.is_available ? "Available" : "Checked Out"}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditBook(book.book_uuid)}
                              className="w-full lg:w-auto"
                            >
                              <Edit className="h-4 w-4 lg:mr-0" />
                              <span className="ml-2 lg:hidden">Edit</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Video Categories Report */}
            <Card className="border-none shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-t-lg p-4 sm:p-6">
                <CardTitle className="text-white text-xl sm:text-2xl">Video Categories Report</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  {Object.entries(stats.video_by_category).map(([category, count]) => (
                    <div
                      key={category}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 hover:bg-accent rounded-lg transition-colors gap-2 sm:gap-0"
                    >
                      <span className="font-medium text-sm sm:text-base">{category}</span>
                      <Badge variant="secondary" className="text-xs w-fit">
                        {count} videos
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}