"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { categories } from "@/lib/dummy-data"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Trash, Upload } from "lucide-react"

export default function AddBookPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    publisher: "",
    description: "",
    summary: "",
    book_type: "EBOOK",
    is_ebook: true,
    total_copies: 1,
    available_copies: 1,
    is_featured: false,
    download_permission: "AUTH",
    publication_date: "",
    is_external: false,
    external_source: "",
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/")
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || user?.role !== "admin") {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    alert("Book added successfully!")
    setIsSubmitting(false)
    // Optionally redirect to books list
    // router.push('/admin')
  }

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/admin">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Add New Book</h1>
        <p className="text-gray-600">Enter the details for the new book</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Book Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Book Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={bookData.title}
                    onChange={(e) => setBookData({ ...bookData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">Author *</Label>
                    <Input
                      id="author"
                      value={bookData.author}
                      onChange={(e) => setBookData({ ...bookData, author: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="publisher">Publisher</Label>
                    <Input
                      id="publisher"
                      value={bookData.publisher}
                      onChange={(e) => setBookData({ ...bookData, publisher: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={bookData.description}
                    onChange={(e) => setBookData({ ...bookData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    rows={2}
                    value={bookData.summary}
                    onChange={(e) => setBookData({ ...bookData, summary: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publication_date">Publication Date</Label>
                  <Input
                    id="publication_date"
                    type="date"
                    value={bookData.publication_date}
                    onChange={(e) => setBookData({ ...bookData, publication_date: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.name)}
                        onCheckedChange={() => handleCategoryToggle(category.name)}
                      />
                      <Label htmlFor={`category-${category.id}`} className="text-sm">
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Files & Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Cover Image *</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Drag and drop or click to upload</p>
                    <p className="text-xs text-gray-500">Recommended size: 600 x 900 pixels</p>
                    <Button type="button" variant="outline" size="sm" className="mt-4">
                      Choose File
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>PDF File</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Upload PDF file (for e-books)</p>
                    <p className="text-xs text-gray-500">Maximum file size: 50MB</p>
                    <Button type="button" variant="outline" size="sm" className="mt-4">
                      Choose File
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Book Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Book Type & Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Book Type *</Label>
                  <RadioGroup
                    value={bookData.book_type}
                    onValueChange={(value) =>
                      setBookData({
                        ...bookData,
                        book_type: value as "EBOOK" | "PHYSICAL",
                        is_ebook: value === "EBOOK",
                      })
                    }
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="EBOOK" id="book-type-ebook" />
                      <Label htmlFor="book-type-ebook">E-Book</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="PHYSICAL" id="book-type-physical" />
                      <Label htmlFor="book-type-physical">Physical Book</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Download Permission *</Label>
                  <Select
                    value={bookData.download_permission}
                    onValueChange={(value) =>
                      setBookData({ ...bookData, download_permission: value as "AUTH" | "ALL" | "NONE" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select permission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AUTH">Authenticated Users Only</SelectItem>
                      <SelectItem value="ALL">All Users</SelectItem>
                      <SelectItem value="NONE">No Downloads Allowed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="total_copies">Total Copies *</Label>
                    <Input
                      id="total_copies"
                      type="number"
                      min="1"
                      value={bookData.total_copies}
                      onChange={(e) => setBookData({ ...bookData, total_copies: Number.parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="available_copies">Available Copies *</Label>
                    <Input
                      id="available_copies"
                      type="number"
                      min="0"
                      max={bookData.total_copies}
                      value={bookData.available_copies}
                      onChange={(e) => setBookData({ ...bookData, available_copies: Number.parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={bookData.is_featured}
                    onCheckedChange={(checked) => setBookData({ ...bookData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured Book</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_external"
                    checked={bookData.is_external}
                    onCheckedChange={(checked) => setBookData({ ...bookData, is_external: checked })}
                  />
                  <Label htmlFor="is_external">External Source</Label>
                </div>

                {bookData.is_external && (
                  <div className="space-y-2">
                    <Label htmlFor="external_source">External Source URL</Label>
                    <Input
                      id="external_source"
                      type="url"
                      placeholder="https://"
                      value={bookData.external_source}
                      onChange={(e) => setBookData({ ...bookData, external_source: e.target.value })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save Book"}
              </Button>
              <Button type="button" variant="outline" className="flex-1">
                <Trash className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
