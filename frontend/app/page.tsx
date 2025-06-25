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
        const res = await fetch("https://e-lib-rrx7.onrender.com/api/featured/")
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Library Content</h2>
        <p className="text-gray-600 mb-6">
          We're gathering the latest books and resources for you...
        </p>
        
        <div className="relative pt-1 mb-8">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                Loading
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                75%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
            <div 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 animate-pulse"
              style={{ width: '75%' }}
            ></div>
          </div>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-6 text-left">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Taking longer than usual? Our servers might be busy. You can try reloading the page.
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105"
        >
          <svg className="animate-pulse -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reload Page
        </button>
      </div>
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