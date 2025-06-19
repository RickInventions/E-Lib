// components/book-card.tsx
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
import { toast } from "@/hooks/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"

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

const handleDownload = async () => {
  if (!book) return;

  const token = localStorage.getItem('library-token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/books/${book.book_uuid}/download/`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(response.status === 401 ? 'Unauthorized' : 'Download failed');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${book.title}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: `${book.title} is being downloaded`,
    });
  } catch (error) {
    console.error('Download error:', error);
    toast({
      title: "Download failed",
      description: (error instanceof Error && error.message === 'Unauthorized') 
        ? 'Please login to download' 
        : 'Failed to download book',
      variant: "destructive",
    });
  }
};



const handleReadOnline = async () => {
  if (!book?.pdf_file) {
    toast({
      title: "Not available",
      description: "This book cannot be read online",
      variant: "destructive",
    });
    return;
  }

  try {
    // Open in new tab with PDF viewer
    const response = await fetch(
      `${API_BASE_URL}/books/${book.book_uuid}/read/`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('library-token')}`,
        },
      }
    );

    if (response.ok) {
      const blob = await response.blob();
      const pdfUrl = URL.createObjectURL(blob);
      window.open(pdfUrl, '_blank');
    } else {
      throw new Error('Failed to open PDF');
    }
  } catch (error) {
    toast({
      title: "Failed to open",
      description: "Could not open the book for reading",
      variant: "destructive",
    });
  }
};
  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
          <Image 
  src={
    book.cover_image
      ? book.cover_image.startsWith("http")
        ? book.cover_image
        : `http://localhost:8000${book.cover_image}`
      : "/placeholder.svg"
  }
            alt={book.title} 
            fill 
            className="object-fill"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant={book.book_type === "PHYSICAL" ? "destructive" : "default"}>
              {book.book_type}
            </Badge>
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
          {book.publisher && (
            <p className="text-sm text-muted-foreground mb-2">{book.publisher}</p>
          )}
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

  {book.is_ebook && isAuthenticated && (
    <Button 
      size="sm"
      variant={"outline"} 
      onClick={handleReadOnline}
      disabled={!book.pdf_file}>
              <BookOpen className="mr-2 h-4 w-4" />
              Read
            </Button>
          )}

  {(book.download_permission === "ALL" || 
    (book.download_permission === "AUTH" && isAuthenticated)) && 
    book.pdf_file && (
    <Button 
      variant="outline" 
      size="lg" 
      onClick={handleDownload}
    >
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