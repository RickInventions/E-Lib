"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BookCard } from "@/components/book-card"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/lib/auth-context"
import { books } from "@/lib/dummy-data"
import { ArrowLeft, Download, BookOpen, Calendar, User, Building, Tag, Star, Heart, Share2 } from "lucide-react"

export default function BookDetailsPage() {
  const params = useParams()
  const { isAuthenticated } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const book = books.find((b) => b.book_uuid === params.uuid)

  if (!book) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Book Not Found</h1>
          <p className="text-gray-600 mb-4">The book you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/books">Back to Books</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Get recommendations (books from same categories, excluding current book)
  const recommendations = books
    .filter((b) => b.book_uuid !== book.book_uuid && b.categories.some((cat) => book.categories.includes(cat)))
    .slice(0, 4)

  const handleAction = (action: () => void) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    action()
  }

  const handleDownload = () => {
    if (book.download_permission === "NONE") {
      alert("Download not allowed for this book")
      return
    }
    if (book.download_permission === "AUTH" && !isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    console.log(`Downloading ${book.title}`)
  }

  const handleRead = () => {
    console.log(`Reading ${book.title}`)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert("Link copied to clipboard!")
  }

  const canDownload = book.download_permission === "ALL" || (book.download_permission === "AUTH" && isAuthenticated)

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/books">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Books
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Cover and Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="relative aspect-[3/4] mb-6">
                  <Image
                    src={book.cover_image || "/placeholder.svg"}
                    alt={book.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                  {book.is_featured && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Star className="mr-1 h-3 w-3" />
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {book.is_ebook && (
                    <Button className="w-full" onClick={() => handleAction(handleRead)}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Read Online
                    </Button>
                  )}

                  {canDownload && book.pdf_file && (
                    <Button variant="outline" className="w-full" onClick={handleDownload}>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAction(() => setIsFavorited(!isFavorited))}
                    >
                      <Heart className={`mr-2 h-4 w-4 ${isFavorited ? "fill-current text-red-500" : ""}`} />
                      {isFavorited ? "Favorited" : "Favorite"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Book Stats */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Availability:</span>
                    <Badge variant={book.is_available ? "default" : "destructive"}>{book.available_status}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Copies:</span>
                    <span>
                      {book.available_copies}/{book.total_copies}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <Badge variant={book.book_type === "PHYSICAL" ? "destructive" : "default"}>{book.book_type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Download:</span>
                    <Badge variant="outline">
                      {book.download_permission === "ALL"
                        ? "Everyone"
                        : book.download_permission === "AUTH"
                          ? "Members Only"
                          : "Not Allowed"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Book Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
              <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  {book.author}
                </div>
                {book.publisher && (
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    {book.publisher}
                  </div>
                )}
                {book.publication_date && (
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    {new Date(book.publication_date).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {book.categories.map((category) => (
                  <Badge key={category} variant="outline">
                    <Tag className="mr-1 h-3 w-3" />
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{book.description}</p>
                {book.summary && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Summary</h4>
                    <p className="text-gray-600">{book.summary}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Book Information */}
            <Card>
              <CardHeader>
                <CardTitle>Book Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Book ID:</span>
                        <span className="font-mono">{book.book_uuid}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Format:</span>
                        <span>{book.is_ebook ? "Digital" : "Physical"}</span>
                      </div>
                      {book.publication_date && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Published:</span>
                          <span>{new Date(book.publication_date).getFullYear()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Availability</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className={book.is_available ? "text-green-600" : "text-red-600"}>
                          {book.available_status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available:</span>
                        <span>
                          {book.available_copies} of {book.total_copies}
                        </span>
                      </div>
                      {book.is_external && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Source:</span>
                          <span>External</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((recommendedBook) => (
                <BookCard key={recommendedBook.book_uuid} book={recommendedBook} />
              ))}
            </div>
          </div>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
