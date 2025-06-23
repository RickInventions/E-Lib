// books-to-return/page.tsx
"use client"
import { toast } from "@/hooks/use-toast"
import { fetchBorrowedBooks, markBookReturned } from "@/lib/api"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, Filter, Calendar, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react"
import { BorrowedBook } from "@/lib/types"

export default function BooksToReturnPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/")
    }
  }, [isAuthenticated, user, router])

    useEffect(() => {
    const loadBorrowedBooks = async () => {
      try {
        const data = await fetchBorrowedBooks()
        setBorrowedBooks(data)
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadBorrowedBooks()
  }, [])

const handleReturnBook = async (borrowId: number, bookUuid: string) => {
  try {
    await markBookReturned(bookUuid, borrowId);
    setBorrowedBooks(prev => prev.map(b => 
      b.id === borrowId ? { ...b, is_returned: true, return_date: new Date().toISOString() } : b
    ));
    toast({
      title: "Success",
      description: "Book marked as returned",
      variant: "default",
    });
  } catch (error) {
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "An error occurred",
      variant: "destructive",
    });
  }
}
  const getDaysRemaining = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  function getBorrowStatus(borrowed: BorrowedBook) {
    console.log(borrowed);
  if (borrowed.is_returned) return "returned";
  const daysRemaining = getDaysRemaining(borrowed.due_date);
  if (daysRemaining < 0) return "overdue";
  return "borrowed";
}

  // Filter borrowed books
  const filteredBooks = borrowedBooks.filter((borrowed) => {
    const userFullName = `${borrowed.user.first_name} ${borrowed.user.last_name}`.toLowerCase();
    const matchesSearch =
      borrowed.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      borrowed.book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userFullName.includes(searchQuery.toLowerCase())

    const status = getBorrowStatus(borrowed);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "borrowed" && status === "borrowed") ||
      (statusFilter === "overdue" && status === "overdue") ||
      (statusFilter === "returned" && status === "returned")

    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    // Sort by borrowed date (newest first)
    return new Date(b.borrowed_date).getTime() - new Date(a.borrowed_date).getTime();
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/admin">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Books to Return</h1>
          <p className="text-gray-600">Manage borrowed books and track returns</p>
        </div>

        <div className="flex gap-2 mt-4 md:mt-0">
          <Badge variant="default" className="text-sm">
            {borrowedBooks.filter((b) => getBorrowStatus(b) === "borrowed").length} Borrowed
          </Badge>
          <Badge variant="destructive" className="text-sm">
            {borrowedBooks.filter((b) =>  getBorrowStatus(b) === "overdue").length} Overdue
          </Badge>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Input
                placeholder="Search by book title, author or borrower name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="borrowed">Borrowed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setStatusFilter("all")
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Borrowed Books List */}
      <Card>
        <CardHeader>
          <CardTitle>Borrowed Books ({filteredBooks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBooks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium">No books found</p>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBooks.map((borrowed) => {
  const daysRemaining = getDaysRemaining(borrowed.due_date);
  const isOverdue = getBorrowStatus(borrowed) === "overdue" || daysRemaining < 0;

                return (
                  <div key={borrowed.id} className="flex flex-col md:flex-row gap-4 border rounded-lg p-4">
                    <div className="relative w-24 h-32 flex-shrink-0">
<Image
src={
    borrowed.book.cover_image
      ? borrowed.book.cover_image.startsWith("http")
      ? borrowed.book.cover_image
      : `http://localhost:8000${borrowed.book.cover_image}`
        : "/placeholder.svg"
  }
  alt={borrowed.book.title}
  fill
  className="object-fill rounded"
/>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row justify-between">
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
<p className="text-sm mt-1">
  <span className="text-gray-500">Borrowed by:</span>{" "}
  <span className="font-medium">
    {borrowed.user
      ? `${borrowed.user.first_name ?? ""} ${borrowed.user.last_name ?? ""}`.trim() || borrowed.user.email || "Unknown"
      : "Unknown"}
  </span> <br />
  <span className="text-gray-500">E-mail:</span>{" "}
    <span className="font-medium">
      {borrowed.user.email}
    </span>
</p>
                        </div>
                        <div className="mt-2 md:mt-0">
<Badge
  variant={
    getBorrowStatus(borrowed) === "returned"
      ? "secondary"
      : getBorrowStatus(borrowed) === "overdue"
        ? "destructive"
        : "default"
  }
>
  {getBorrowStatus(borrowed) === "returned"
    ? "Returned"
    : getBorrowStatus(borrowed) === "overdue"
      ? "Overdue"
      : "Borrowed"}
</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
                              <Calendar className="h-3 w-3 mr-1" />
                            )}
                            {formatDate(borrowed.due_date)}
                          </p>
                        </div>
                        {borrowed.return_date && (
                          <div>
                            <p className="text-xs text-gray-500">Returned on</p>
                            <p className="text-sm font-medium flex items-center text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {formatDate(borrowed.return_date)}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
{getBorrowStatus(borrowed) !== "returned" && (
  <Button 
    size="sm" 
    variant="default"
    onClick={() => handleReturnBook(borrowed.id, borrowed.book.book_uuid)}
    disabled={getBorrowStatus(borrowed) === "returned"}
  >
    Mark as Returned
  </Button>
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
    </div>
  )
}
