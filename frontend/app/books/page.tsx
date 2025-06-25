"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookCard } from "@/components/book-card"
import { Search, Filter } from "lucide-react"
import { fetchPublicBooks, fetchCategories, searchBooks, getSearchSuggestions } from "@/lib/api"
import type { Book, Category } from "@/lib/types"
import { useDebounce } from "@/hooks/use-debounce"
import { useSearchParams } from "next/navigation"
import { toast } from "@/hooks/use-toast"

type Suggestion = {
  type: string;
  value: string;
};

export default function BooksPage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') || "all"
  const initialSearch = searchParams.get('search') || ""
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedType, setSelectedType] = useState("all")
  const [books, setBooks] = useState<Book[]>([])
  const [allBooks, setAllBooks] = useState<Book[]>([])  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchSuggestions, setSearchSuggestions] = useState<Suggestion[]>([])
  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    async function loadData() {
      try {
        const [booksData, categoriesData] = await Promise.all([
          fetchPublicBooks(),
          fetchCategories()
        ])

        const filteredBooks = initialCategory === "all" 
        ? booksData 
        : booksData.filter(book => book.categories.includes(initialCategory))

        setBooks(filteredBooks)
        setAllBooks(booksData) 
        setCategories(categoriesData)

        if (initialCategory !== "all") {
        setSelectedCategory(initialCategory)
      }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load books and categories",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [toast, initialCategory])

  useEffect(() => {
    if (debouncedSearch.trim() === "") {
    setBooks(allBooks)
    setSearchSuggestions([])
    return
  }

  if (debouncedSearch.length > 1) {
    getSearchSuggestions(debouncedSearch)
      .then(suggestions => {
        const formatted = suggestions.map(s => 
          typeof s === 'string' ? { type: 'query', value: s } : s
        )
        setSearchSuggestions(formatted)
      })
      .catch(() => setSearchSuggestions([]))

    // Perform real-time search
    searchBooks(debouncedSearch)
      .then(results => {
        setBooks(results)
        console.log("Search results:", results) 
      })
      .catch(() => toast({
        title: "Search error",
        description: "Failed to perform search",
        variant: "destructive"
      }))
  } else {
    setBooks(allBooks)
    setSearchSuggestions([])
  }
}, [debouncedSearch, allBooks, toast])

useEffect(() => {
  if (searchQuery.trim()) {
    searchBooks(searchQuery).then(setBooks);
  } else {
    fetchPublicBooks().then(setBooks);
  }
}, [searchQuery]);

useEffect(() => {
  setSearchQuery(initialSearch);
}, [initialSearch]);

  const filteredBooks = books.filter((book) => {
    const matchesCategory = selectedCategory === "all" || book.categories.includes(selectedCategory)
    const matchesType =
      selectedType === "all" ||
      (selectedType === "ebook" && book.book_type === "EBOOK") ||
      (selectedType === "physical" && book.book_type === "PHYSICAL")

    return matchesCategory && matchesType
  })

const handleClearFilters = async () => {
  setSearchQuery("")
  setSelectedCategory("all")
  setSelectedType("all")
  setLoading(true)
  
  const params = new URLSearchParams(searchParams)
  params.delete('category')
  window.history.pushState({}, '', `${window.location.pathname}?${params}`)
  
  try {
    const booksData = await fetchPublicBooks()
    setBooks(booksData)
    setAllBooks(booksData)
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to reset filters",
      variant: "destructive",
    })
  } finally {
    setLoading(false)
  }
}

  if (loading && books.length === 0) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Books Page</h2>
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
                80%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
            <div 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 animate-pulse"
              style={{ width: '80%' }}
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Library Collection</h1>
        <p className="text-gray-600 mb-6">Browse our extensive collection of books and videos</p>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="relative">
              <Input
                placeholder="Search by title, author, or publisher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {searchSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
                    <div className="flex justify-end p-1">
      <button
        className="text-gray-400 hover:text-gray-700 text-xs px-2 py-1 w-1"
        onClick={() => setSearchSuggestions([])}
        aria-label="Close suggestions"
        type="button"
      >
        ×
      </button>
    </div>
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={`${suggestion.type}-${index}`}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-start"
                    onClick={() => {
                      setSearchQuery(suggestion.value)
                      setSearchSuggestions([])
                    }}
                  >
                    <span className="text-xs text-gray-500 mr-2 capitalize">
                      {suggestion.type}:
                    </span>
                    <span>{suggestion.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

<Select 
  value={selectedCategory} 
  onValueChange={(value) => {
    setSelectedCategory(value)
    // Optional: Update URL without page reload
    const params = new URLSearchParams(searchParams)
    if (value === "all") {
      params.delete('category')
    } else {
      params.set('category', value)
    }
    window.history.pushState({}, '', `${window.location.pathname}?${params}`)
  }}
>
  <SelectTrigger className="w-full md:w-48">
    <SelectValue placeholder="Category" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Categories</SelectItem>
    {categories.map((category) => (
      <SelectItem key={category.id} value={category.name}>
        {category.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ebook">E-books</SelectItem>
              <SelectItem value="physical">Physical Books</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={handleClearFilters}
          >
            <Filter className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </div>

       
        {/* Results Count */}
        <p className="text-sm text-gray-600 mb-6">
          Showing {filteredBooks.length} of {allBooks.length} items
        </p>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => (
          <BookCard key={book.book_uuid} book={book} />
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No books found matching your criteria.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}