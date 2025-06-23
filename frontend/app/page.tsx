"use client"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookCard } from "@/components/book-card"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/lib/auth-context"
import { libraryInfo } from "@/lib/dummy-data"
import { Search, BookOpen, Users, Video, Clock, MapPin, Phone, Mail } from "lucide-react"
import { fetchPublicBooks, fetchCategories, fetchLibraryStats } from "@/lib/api"
import type { Book, Category } from "@/lib/types"

export default function HomePage() {
  const { isAuthenticated } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([])
  const router = useRouter()
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalVideos: 0,
    totalUsers: 0,
    totalCategories: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [booksData, categoriesData, statsData] = await Promise.all([
          fetchPublicBooks(),
          fetchCategories(),
          fetchLibraryStats()
        ])
        
        setBooks(booksData)
setCategories(categoriesData.map(cat => ({
  id: cat.id,
  created_at: cat.created_at,
  name: cat.name,
  description: cat.description,
  bookCount: booksData.filter(b => 
    b.categories.includes(cat.name)
  ).length
})));
        const res = await fetch("http://127.0.0.1:8000/api/featured/")
const data = await res.json()
setFeaturedBooks((data.books || []).slice(0, 4))


        setStats({
          totalBooks: statsData.total_books || 0,
          totalVideos: statsData.total_videos || 0,
          totalUsers: statsData.total_users || 0,
          totalCategories: statsData.total_categories || 0
        });
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])




  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.categories.join(" ").toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSearchAction = () => {
    if (searchQuery.trim()) {
    router.push(`/books?search=${encodeURIComponent(searchQuery.trim())}`) 
    } else {
      router.push("/books")
    }
  }

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchAction()
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
            {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to {libraryInfo.name}</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">{libraryInfo.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <div className="relative flex-1 w-full">
              <Input
                placeholder="Search books, authors, categories, publishers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="pl-10 bg-white text-black"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button onClick={handleSearchAction} size="lg" variant="secondary">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section - Updated with real data */}
      {loading ? (
  <div className="animate-pulse">Loading stats...</div>
) : (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-3xl font-bold mb-2">{stats.totalBooks}+</h3>
              <p className="text-gray-600">Books Available</p>
            </div>
            <div className="text-center">
              <Video className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h3 className="text-3xl font-bold mb-2">{stats.totalVideos}+</h3>
              <p className="text-gray-600">Video Tutorials</p>
            </div>
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-3xl font-bold mb-2">{stats.totalUsers}+</h3>
              <p className="text-gray-600">Active Members</p>
            </div>
            <div className="text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-orange-600" />
              <h3 className="text-3xl font-bold mb-2">24/7</h3>
              <p className="text-gray-600">Online Access</p>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Featured Books - Updated with real data */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Books</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most popular books and latest additions to the library
            </p>
          </div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {featuredBooks.map((book) => (
    <BookCard key={book.book_uuid} book={book} />
  ))}
</div>

          <div className="text-center">
            <Button asChild size="lg">
              <Link href="/books">View All Books</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Browse Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Explore our extensive collection organized by categories</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{categories.map((category) => {
  const bookCount = books.filter(b => b.categories.includes(category.name)).length;
  return (
    <Link href={`/books?category=${category.name}`} key={category.id}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            {category.name}
            <span className="text-sm font-normal text-gray-500">
              {bookCount} books
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">{category.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
})}
          </div>
        </div>
      </section>
<section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Visit Our Library</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Come visit us in person or access our resources online</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{libraryInfo.address}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Opening Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Weekdays:</strong> {libraryInfo.timings.weekdays}
                </p>
                <p>
                  <strong>Weekends:</strong> {libraryInfo.timings.weekends}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5" />
                  Contact Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="flex items-center mb-2">
                  <Phone className="mr-2 h-4 w-4" />
                  {libraryInfo.phone}
                </p>
                <p className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  {libraryInfo.email}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}