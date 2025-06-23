"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { createCategory, updateCategory } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { ArrowLeft, Save, Trash } from "lucide-react"
import { Category } from "@/lib/types"

interface AddCategoryPageProps {
  category?: Category
}

export default function AddCategoryPage({ category }: AddCategoryPageProps) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoryData, setCategoryData] = useState({
    name: category?.name || "",
    description: category?.description || "",
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
  e.preventDefault();
  setIsSubmitting(true);
  try {
    if (category) {
      // Update existing category
      await updateCategory(category.id, categoryData.name, categoryData.description);
      toast({
        title: "Success",
        description: "Category updated successfully!",
        variant: "default",
      });
    } else {
      // Create new category
      await createCategory(categoryData.name, categoryData.description);
      toast({
        title: "Success",
        description: "Category added successfully!",
        variant: "default",
      });
    }
    router.push("/admin");
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message || "Failed to save category",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/admin">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {category ? "Edit Category" : "Add New Category"}
        </h1>
        <p className="text-gray-600">
          {category ? "Update the category details" : "Create a new category for organizing books"}
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={categoryData.name}
                  onChange={(e) => setCategoryData({ ...categoryData, name: e.target.value })}
                  placeholder="Enter category name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={categoryData.description}
                  onChange={(e) => setCategoryData({ ...categoryData, description: e.target.value })}
                  placeholder="Enter category description"
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : category ? "Update Category" : "Save Category"}
                </Button>
                <Button type="button" variant="outline" className="flex-1" asChild>
                  <Link href="/admin">
                    <Trash className="mr-2 h-4 w-4" />
                    Cancel
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}