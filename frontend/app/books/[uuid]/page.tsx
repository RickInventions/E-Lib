"use client"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-context"
import { fetchBookDetails, fetchBookRecommendations } from "@/lib/api"
import type { Book } from "@/lib/types"
import { Download, BookOpen, ArrowLeft, Info, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api"


export default function BookDetailPage() {
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const [recommendations, setRecommendations] = useState<Book[]>([])
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    async function loadBook() {
      try {
        const bookData = await fetchBookDetails(params.uuid as string)
        setBook(bookData)
      } catch (error) {
        toast({
          title: "Error loading book",
          description: "Could not fetch book details",
          variant: "destructive"
        })
        router.push("/books")
      } finally {
        setLoading(false)
      }
    }
      async function loadRecommendations() {
    try {
      const recs = await fetchBookRecommendations(params.uuid as string)
      setRecommendations(recs)
    } catch (error) {
      console.error("Failed to load recommendations:", error)
    }
  }
  loadRecommendations()
    loadBook()
  }, [params.uuid, router, toast])

const handleDownload = async () => {
  if (!book) return;

  const token = localStorage.getItem('access_token');
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
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Book not found</h2>
        <Button asChild>
          <Link href="/books">Back to Books</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="outline" 
        onClick={() => router.back()} 
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Book Cover */}
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
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
            className="object-cover"
            priority
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge variant={book.book_type === "PHYSICAL" ? "destructive" : "default"}>
              {book.book_type}
            </Badge>
            {book.is_featured && <Badge variant="secondary">Featured</Badge>}
          </div>
        </div>

        {/* Book Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{book.title}</h1>
            <p className="text-xl text-muted-foreground">by {book.author}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {book.categories.map((category) => (
              <Badge key={category} variant="outline">
                {category}
              </Badge>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Description</h3>
              <p className="text-muted-foreground">{book.description}</p>
            </div>


            {book.publisher && (
              <div>
                <h3 className="font-semibold">Publisher</h3>
                <p className="text-muted-foreground">{book.publisher}</p>
              </div>
            )}

          {/* Publication Date */}
          {book.publication_date && (
            <div>
              <h3 className="font-semibold">Publication Date</h3>
              <p className="text-muted-foreground">
                {new Date(book.publication_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}

  <div>
    <h3 className="font-semibold">Availability</h3>
    <p className="text-muted-foreground">
      {book.is_available ? (
        <span className="text-green-600">Available</span>
      ) : (
        <span className="text-red-600">Unavailable</span>
      )}
      {book.book_type === "PHYSICAL" && (
        <span> ({book.available_copies} of {book.total_copies} copies available)</span>
      )}
    </p>
  </div>
</div>
    {/* Show message if no copies available */}
  {book.book_type === "PHYSICAL" && book.available_copies <= 0 && (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Info className="h-4 w-4" />
      <span>All copies are currently checked out</span>
    </div>
  )}
  {/* Action Buttons */}
<div className="flex flex-wrap gap-4 pt-4">
  {book.is_ebook && (
    <Button 
      size="lg" 
      onClick={handleReadOnline}
      disabled={!book.pdf_file}
    >
      <BookOpen className="mr-2 h-4 w-4" />
      Read Online
    </Button>
  )}

  {/* Download Button */}
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

  {/* Borrow Button - Only show if physical book AND available */}
  {book.book_type === "PHYSICAL" && book.is_available && book.available_copies > 0 && (
    <Button 
      size="lg" 
      asChild
      disabled={book.available_copies <= 0}
    >
      <Link href={`/borrow/${book.book_uuid}`}>
        Borrow This Book
      </Link>
    </Button>
  )}
            {/* External Source */}
          {book.is_external && book.external_source && (
            <div>
              <h3 className="font-semibold">Source</h3>
              <a 
                href={book.external_source} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                <ExternalLink className="h-4 w-4" />
                External Resource
              </a>
            </div>
          )}

          </div>
                  <div className="space-y-4">
                  {/* Summary Section */}
                  <div>
                    <h3 className="font-semibold">Summary</h3>
                    <p className="text-muted-foreground whitespace-pre-line">
                      {book.summary}
                    </p>
                  </div>
                    </div>

        </div>
      </div>
      {/* Recommendations Section */}
{recommendations.length > 0 && (
  <div className="mt-16">
    <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
    <Carousel
      opts={{
        align: "start",
        slidesToScroll: "auto",
      }}
      className="w-full"
    >
      <CarouselContent>
        {recommendations.map((book) => (
          <CarouselItem key={book.book_uuid} className="basis-1/2 md:basis-1/3 lg:basis-1/4">
            <Link href={`/books/${book.book_uuid}`}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="flex flex-col aspect-[3/4] p-0">
                  <div className="relative flex-1">
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
                      className="object-cover rounded-t-lg"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium line-clamp-1">{book.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{book.author}</p>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {(book.categories || []).slice(0, 2).map((category) => (
                        <Badge key={category} variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2" />
      <CarouselNext className="right-2" />
    </Carousel>
  </div>
)}
    </div>
  )
}