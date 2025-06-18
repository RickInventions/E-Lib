"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { books, categories, users, libraryStats, inquiries, borrowedBooks } from "@/lib/dummy-data"
import { BookOpen, Users, TrendingUp, Plus, Edit, Trash2, BookMarked, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/")
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "admin") {
    return null
  }

  const overdueCount = borrowedBooks.filter((b) => b.status === "overdue").length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your library system</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Button asChild className="h-auto py-6 flex flex-col items-center justify-center">
          <Link href="/admin/books/add">
            <Plus className="h-6 w-6 mb-2" />
            <span>Add New Book</span>
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
                {inquiries.filter((i) => i.status === "pending").length} New
              </Badge>
            </div>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
          <Link href="/admin?tab=reports">
            <TrendingUp className="h-6 w-6 mb-2" />
            <span>View Reports</span>
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{libraryStats.totalBooks}</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{libraryStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+45 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{libraryStats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">Active categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">E-books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{libraryStats.totalEbooks}</div>
            <p className="text-xs text-muted-foreground">+8 from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="books" className="space-y-4">
        <TabsList>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="space-y-4">
          <Card>
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
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {books.slice(0, 5).map((book) => (
                  <div key={book.book_uuid} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{book.title}</h3>
                      <p className="text-sm text-gray-600">by {book.author}</p>
                      <div className="flex gap-2 mt-2">
                        {book.categories.map((cat) => (
                          <Badge key={cat} variant="outline">
                            {cat}
                          </Badge>
                        ))}
                        <Badge variant={book.book_type === "PHYSICAL" ? "destructive" : "default"}>
                          {book.book_type}
                        </Badge>
                        <Badge variant="secondary">
                          {book.download_permission === "ALL"
                            ? "Public Download"
                            : book.download_permission === "AUTH"
                              ? "Auth Download"
                              : "No Download"}
                        </Badge>
                        {book.is_featured && <Badge variant="outline">Featured</Badge>}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {book.available_copies}/{book.total_copies} available • {book.book_uuid}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link href="/admin/books">View All Books</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Manage Categories</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{category.name}</h3>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    <Badge variant="secondary">{category.bookCount} books</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant={user.role === "admin" ? "destructive" : "default"}>{user.role}</Badge>
                        <Badge variant="outline">{user.booksRead} books read</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
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
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{inquiry.subject}</h3>
                        <p className="text-sm text-gray-600">
                          From: {inquiry.name} ({inquiry.email})
                        </p>
                        <p className="text-xs text-gray-500">{inquiry.date}</p>
                      </div>
                      <Badge variant={inquiry.status === "pending" ? "destructive" : "default"}>{inquiry.status}</Badge>
                    </div>
                    <p className="text-sm mb-3">{inquiry.message}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Reply
                      </Button>
                      <Button size="sm" variant="outline">
                        Mark as Resolved
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
                <CardTitle>Popular Books</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {books.slice(0, 5).map((book, index) => (
                    <div key={book.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{book.title}</p>
                        <p className="text-sm text-gray-600">{book.author}</p>
                      </div>
                      <Badge variant="outline">#{index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex justify-between items-center">
                      <span className="font-medium">{category.name}</span>
                      <Badge variant="secondary">{category.bookCount}</Badge>
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
