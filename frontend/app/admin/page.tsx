// app/admin/page.tsx
"use client"
import { useEffect, useState } from "react"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, TrendingUp, Plus, Edit, Trash2, BookMarked, AlertTriangle, Search, Video as VideoIcon, PlusSquareIcon } from "lucide-react"
import type { Book, Video, Category, Inquiry, BorrowedBook, LibraryStats, User } from "@/lib/types"
import { useRouter } from "next/navigation"
import { deleteBook, deleteVideo, deleteCategory, deleteUser, deleteInquiry } from "@/lib/api"
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
        const [statsData, booksData, videosData, categoriesData, borrowedBooksData, inquiriesData, usersData] = await Promise.all([
          fetchAdminLibraryStats(),
          fetchPublicBooks(),
          fetchPublicVideos(),
          fetchCategories(),
          fetchBorrowedBooks(),
          fetchInquiries(),
          fetchAdminUsers()
        ])
        setUsers(usersData);
        setStats(statsData)
        setBooks(booksData)
        setVideos(videosData)
        setCategories(categoriesData)
        setBorrowedBooks(borrowedBooksData)
        setInquiries(inquiriesData)
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

  // Helper to determine overdue status
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
  
  // Filter data based on search query
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
    book.book_uuid.toLowerCase().includes(tabSearch.books.toLowerCase()) // Add UUID search
  )

const filteredVideos = videos.filter(video =>
  video.title.toLowerCase().includes(tabSearch.videos.toLowerCase()) ||
  video.instructor.toLowerCase().includes(tabSearch.videos.toLowerCase()) ||
  (video.category_display?.toLowerCase().includes(tabSearch.videos.toLowerCase()) ?? false)
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

// Update the handleEditBook function in your admin page
const handleEditBook = (bookUuid: string) => {
  const book = books.find(b => b.book_uuid === bookUuid)
  if (book) {
    router.push(`/admin/books/edit?book=${encodeURIComponent(JSON.stringify(book))}`)
  }
}

  const handleEditVideo = (videoUuid: string) => {
    router.push(`/admin/videos/edit/${videoUuid}`)
  }

const handleEditCategory = (categoryId: number) => {
  const category = categories.find(c => c.id === categoryId)
  if (category) {
    router.push(`/admin/categories/edit?category=${encodeURIComponent(JSON.stringify(category))}
    `)
  }
  }

  const handleEditUser = (userId: number) => {
    router.push(`/admin/users/edit/${userId}`)
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
    const confirmed = await showConfirm(
      "Delete Inquiry", 
      "Are you sure you want to delete this inquiry? This action cannot be undone."
    )
    if (confirmed) {
      try {
        await deleteInquiry(inquiryId)
        setInquiries(inquiries.filter(i => i.id !== inquiryId))
        toast({ title: "Inquiry deleted successfully", variant: "default" })
      } catch (error) {
        toast({ title: "Failed to delete inquiry", variant: "destructive" })
      }
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
        <Button asChild variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
          <Link href="/admin?tab=inquiries">
            <AlertTriangle className="h-6 w-6 mb-2" />
            <div className="flex flex-col items-center">
              <span>Pending Inquiries</span>
              <Badge variant="secondary" className="mt-1">
                {inquiries.filter(i => !i.is_resolved).length} New
              </Badge>
            </div>
          </Link>
        </Button>
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
        onValueChange={value => setCurrentTab(value as TabName)}
      >
        <TabsList>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

<TabsContent value="books" className="space-y-4">
  <Card>
            <div className="mb-4">
            </div>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manage Books</CardTitle>
                <Button asChild>
                  <Link href="/admin/books/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Book
                  </Link>
                </Button>
              </div>
  <Input
    placeholder={`Search ${currentTab} by book uid, title, author, categories...`}
    value={tabSearch[currentTab] ?? ""}
    onChange={e => handleTabSearchChange(currentTab, e.target.value)}
  />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedBooks.slice(0, 5).map(book => (
                  <div key={book.book_uuid} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{book.title}</h3>
                      <p className="text-sm text-gray-600">by {book.author}</p>
                      <div className="flex gap-2 mt-2">
                        {book.categories.map(cat => (
                          <Badge key={cat} variant="outline">
                            {cat}
                          </Badge>
                        ))}
                        <Badge variant={book.book_type === "PHYSICAL" ? "destructive" : "default"}>
                          {book.book_type}
                        </Badge>
                        {book.book_type === "EBOOK" && (
                          <Badge variant="secondary">
                            {book.download_permission === "ALL"
                              ? "Public Download"
                              : book.download_permission === "AUTH"
                                ? "Auth Download"
                                : "No Download"}
                          </Badge>
                        )}
                        {book.is_featured && <Badge variant="outline">Featured</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {book.available_copies}/{book.total_copies} available • {book.book_uuid}
                      </p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditBook(book.book_uuid)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteBook(book.book_uuid)}
                    >
                      <Trash2 className="h-4 w-4" />
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
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manage Videos</CardTitle>
                <Button asChild>
                  <Link href="/admin/videos/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Video
                  </Link>
                </Button>
              </div>
                <Input
    placeholder={`Search ${currentTab}...`}
    value={tabSearch[currentTab] ?? ""}
    onChange={e => handleTabSearchChange(currentTab, e.target.value)}
  />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedVideos.slice(0, 5).map(video => (
                  <div key={video.video_uuid} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{video.title}</h3>
                      <p className="text-sm text-gray-600">by {video.instructor}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">
                          {video.category_display}
                        </Badge>
                        <Badge variant="outline">{video.duration} mins</Badge>
                        {video.is_featured && <Badge variant="outline">Featured</Badge>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditVideo(video.video_uuid)}
                      >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteVideo(video.video_uuid)}
                    >
                      <Trash2 className="h-4 w-4" />
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
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manage Categories</CardTitle>
                <Button asChild>
                  <Link href="/admin/categories/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </Link>
                </Button>
              </div>
                <Input
    placeholder={`Search ${currentTab}...`}
    value={tabSearch[currentTab] ?? ""}
    onChange={e => handleTabSearchChange(currentTab, e.target.value)}
  />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sortedCategories.map(category => (
                  <div key={category.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{category.name}</h3>
                      <div className="flex gap-2">
                        <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditCategory(category.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteCategory(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
<TabsContent value="users" className="space-y-4">
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle>Manage Users</CardTitle>
        <Button asChild>
          <Link href="/admin/users/add">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Link>
        </Button>
      </div>
        <Input
    placeholder={`Search ${currentTab}...`}
    value={tabSearch[currentTab] ?? ""}
    onChange={e => handleTabSearchChange(currentTab, e.target.value)}
  />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {sortedUsers.map(user => (
          <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold">{user.first_name} {user.last_name}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role}
              </Badge>
              <br />
              <br />
             <p className="text-sm text-gray-600">{new Date(user.created_at).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
  <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditUser(user.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
                      <Button size="sm" variant="outline">
                        Reply
                      </Button>
                      <Button size="sm" variant="outline">
                        {!inquiry.is_resolved ? "Mark as Resolved" : "Reopen"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.video_by_category).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="font-medium">{category}</span>
                      <Badge variant="secondary">{count} videos</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>External Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Books from External</span>
                    <Badge variant="secondary">{stats.external_sources}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Videos from External</span>
                    <Badge variant="secondary">{stats.video_external_sources}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total External Resources</span>
                    <Badge variant="destructive">
                      {stats.external_sources + stats.video_external_sources}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}