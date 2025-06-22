"use client"

import { useSearchParams } from "next/navigation"
import AddCategoryPage from "../add/page"
import { Category } from "@/lib/types"

export default function EditcategoryPage() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  const category = categoryParam ? JSON.parse(categoryParam) as Category : undefined
  
  return <AddCategoryPage category={category} />
}