"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Book } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "./auth-modal"
import { Download, BookOpen, Eye } from "lucide-react"

interface BookCardProps {
  book: Book
  onRead?: (book: Book) => void
}

export function BookCard({ book, onRead }: BookCardProps) {
  const { isAuthenticated } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

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
    // Simulate download
    console.log(`Downloading ${book.title}`)
  }

  const handleRead = () => {
    if (onRead) {
      onRead(book)
    }
  }

  const canDownload = book.download_permission === "ALL" || (book.download_permission === "AUTH" && isAuthenticated)

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
          <Image src={book.cover_image || "/placeholder.svg"} alt={book.title} fill className="object-cover" />
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant={book.book_type === "PHYSICAL" ? "destructive" : "default"}>{book.book_type}</Badge>
            {book.is_featured && <Badge variant="secondary">Featured</Badge>}
          </div>
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="bg-white/90">
              {book.available_copies}/{book.total_copies}
            </Badge>
          </div>
        </div>

        <CardContent className="flex-1 p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{book.title}</h3>
          <p className="text-sm text-muted-foreground mb-1">by {book.author}</p>
          {book.publisher && <p className="text-sm text-muted-foreground mb-2">{book.publisher}</p>}
          <div className="flex flex-wrap gap-1 mb-2">
            {book.categories.map((category) => (
              <Badge key={category} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>
          <p className="text-sm line-clamp-3">{book.description}</p>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/books/${book.book_uuid}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </Button>

          {book.is_ebook && (
            <Button size="sm" onClick={() => handleAction(handleRead)} variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              Read
            </Button>
          )}

          {canDownload && book.pdf_file && (
            <Button size="sm" variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}

          {!book.is_available && (
            <Badge variant="destructive" className="ml-auto">
              Unavailable
            </Badge>
          )}
        </CardFooter>
      </Card>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
