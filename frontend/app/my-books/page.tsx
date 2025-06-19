"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { BookOpen, Clock, AlertTriangle, CheckCircle, Calendar } from "lucide-react"
import { fetchUserBorrowedBooks, fetchUserBorrowHistory } from "@/lib/api"
import type { BorrowedBook } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

export default function MyBooksPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeBorrows, setActiveBorrows] = useState<BorrowedBook[]>([])
  const [borrowHistory, setBorrowHistory] = useState<BorrowedBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    } else {
      fetchData()
    }
  }, [isAuthenticated, router])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch both active borrows and history in parallel
      const [borrowed, history] = await Promise.all([
        fetchUserBorrowedBooks(),
        fetchUserBorrowHistory()
      ])
      
      setActiveBorrows(borrowed)
      setBorrowHistory(history)
    } catch (error: any) {
      toast({
        title: "Failed to load data",
        description: error.message || "Error fetching your book information",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    try {
      const today = new Date();
      const due = new Date(dueDate);
      const diffTime = due.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (e) {
      return 0;
    }
  };

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Books</h1>

      <Tabs defaultValue="borrowed" className="space-y-6">
        <TabsList>
          <TabsTrigger value="borrowed" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Borrowed Books
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Borrow History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="borrowed">
          <Card>
            <CardHeader>
              <CardTitle>Books to Return</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-lg font-medium">Loading your books...</p>
                </div>
              ) : activeBorrows.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">You don't have any books to return</p>
                  <p className="text-gray-500 mb-4">All your books have been returned.</p>
                  <Button asChild>
                    <Link href="/books">Browse Books</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {activeBorrows.map((borrowed) => {
                    const daysRemaining = getDaysRemaining(borrowed.due_date)
                    const isOverdue = daysRemaining < 0

                    return (
                      <div key={borrowed.id} className="flex flex-col md:flex-row gap-4 border rounded-lg p-4">
                        <div className="relative w-24 h-32 flex-shrink-0">
                          <Image
                            src={
                              borrowed.book.cover_image 
                                ? borrowed.book.cover_image.startsWith("http")
                                  ? borrowed.book.cover_image
                                  : `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}${borrowed.book.cover_image}`
                                : "/placeholder.svg"
                            }
                            alt={borrowed.book.title}
                            fill
                            className="object-fill rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">
                                <Link
                                  href={`/books/${borrowed.book.book_uuid}`}
                                  className="hover:text-primary transition-colors"
                                >
                                  {borrowed.book.title}
                                </Link>
                              </h3>
                              <p className="text-sm text-gray-600">by {borrowed.book.author}</p>
                            </div>
                            <Badge variant={isOverdue ? "destructive" : "default"}>
                              {isOverdue ? "Overdue" : "Borrowed"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-500">Borrowed on</p>
                              <p className="text-sm font-medium flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {formatDate(borrowed.borrowed_date)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Due date</p>
                              <p
                                className={`text-sm font-medium flex items-center ${
                                  isOverdue ? "text-red-600" : "text-amber-600"
                                }`}
                              >
                                {isOverdue ? (
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                ) : (
                                  <Clock className="h-3 w-3 mr-1" />
                                )}
                                {formatDate(borrowed.due_date)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            {isOverdue ? (
                              <p className="text-sm text-red-600">
                                <strong>{Math.abs(daysRemaining)} days overdue</strong> - Please contact the library
                              </p>
                            ) : (
                              <p className="text-sm">
                                <strong>{daysRemaining} days remaining</strong> to return this book
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Borrow History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-lg font-medium">Loading your history...</p>
                </div>
              ) : borrowHistory.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">No borrow history found</p>
                  <p className="text-gray-500 mb-4">You haven't borrowed any books yet.</p>
                  <Button asChild>
                    <Link href="/books">Browse Books</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {borrowHistory.map((borrowed) => (
                    <div key={borrowed.id} className="flex flex-col md:flex-row gap-4 border rounded-lg p-4">
                      <div className="relative w-24 h-32 flex-shrink-0">
                        <Image
                          src={
                            borrowed.book.cover_image 
                              ? borrowed.book.cover_image.startsWith("http")
                                ? borrowed.book.cover_image
                                : `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}${borrowed.book.cover_image}`
                              : "/placeholder.svg"
                          }
                          alt={borrowed.book.title}
                          fill
                          className="object-fill rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">
                              <Link
                                href={`/books/${borrowed.book.book_uuid}`}
                                className="hover:text-primary transition-colors"
                              >
                                {borrowed.book.title}
                              </Link>
                            </h3>
                            <p className="text-sm text-gray-600">by {borrowed.book.author}</p>
                          </div>
                          <Badge variant="secondary">Returned</Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-gray-500">Borrowed on</p>
                            <p className="text-sm font-medium">
                              {formatDate(borrowed.borrowed_date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Due date</p>
                            <p className="text-sm font-medium">
                              {formatDate(borrowed.due_date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Returned on</p>
                            <p className="text-sm font-medium">
                              {borrowed.return_date ? formatDate(borrowed.return_date) : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}