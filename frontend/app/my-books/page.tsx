"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { borrowedBooks, readingProgress } from "@/lib/dummy-data"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { BookOpen, Clock, AlertTriangle, CheckCircle, Calendar } from "lucide-react"

export default function MyBooksPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  // Get user's borrowed books
  const userBorrowedBooks = borrowedBooks.filter(
    (item) => item.user_id === user.id && (item.status === "borrowed" || item.status === "overdue"),
  )

  // Get user's reading progress
  const userReadingProgress = readingProgress.filter((item) => item.user_id === user.id)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
          <TabsTrigger value="reading" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Reading Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="borrowed">
          <Card>
            <CardHeader>
              <CardTitle>Books to Return</CardTitle>
            </CardHeader>
            <CardContent>
              {userBorrowedBooks.length === 0 ? (
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
                  {userBorrowedBooks.map((borrowed) => {
                    const daysRemaining = getDaysRemaining(borrowed.due_date)
                    const isOverdue = daysRemaining < 0

                    return (
                      <div key={borrowed.id} className="flex flex-col md:flex-row gap-4 border rounded-lg p-4">
                        <div className="relative w-24 h-32 flex-shrink-0">
                          <Image
                            src={borrowed.book.cover_image || "/placeholder.svg"}
                            alt={borrowed.book.title}
                            fill
                            className="object-cover rounded"
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
                                {formatDate(borrowed.borrow_date)}
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
                                <strong>{Math.abs(daysRemaining)} days overdue</strong> - Please return as soon as
                                possible
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

        <TabsContent value="reading">
          <Card>
            <CardHeader>
              <CardTitle>E-Books I'm Reading</CardTitle>
            </CardHeader>
            <CardContent>
              {userReadingProgress.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-lg font-medium">You haven't started reading any e-books yet</p>
                  <p className="text-gray-500 mb-4">Explore our collection and start reading today.</p>
                  <Button asChild>
                    <Link href="/books">Browse E-Books</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {userReadingProgress.map((progress) => (
                    <div key={progress.id} className="flex flex-col md:flex-row gap-4 border rounded-lg p-4">
                      <div className="relative w-24 h-32 flex-shrink-0">
                        <Image
                          src={progress.book.cover_image || "/placeholder.svg"}
                          alt={progress.book.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">
                              <Link
                                href={`/books/${progress.book.book_uuid}`}
                                className="hover:text-primary transition-colors"
                              >
                                {progress.book.title}
                              </Link>
                            </h3>
                            <p className="text-sm text-gray-600">by {progress.book.author}</p>
                          </div>
                          <Badge variant="secondary">{progress.progress}% Complete</Badge>
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Reading Progress</span>
                            <span>{progress.progress}%</span>
                          </div>
                          <Progress value={progress.progress} className="h-2" />
                        </div>

                        <div className="mt-4 flex justify-between items-center">
                          <p className="text-xs text-gray-500">
                            Last read on {new Date(progress.last_read).toLocaleDateString()}
                          </p>
                          <Button size="sm">Continue Reading</Button>
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
