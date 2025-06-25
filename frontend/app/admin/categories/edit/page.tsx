"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import AddCategoryPage from "../add/page"
import { Category } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

function EditCategoryContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  const category = categoryParam ? JSON.parse(categoryParam) as Category : undefined
  
  return <AddCategoryPage category={category} />
}

export default function EditCategoryPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-6" />
        <Skeleton className="h-10 w-32" />
      </div>
    }>
      <EditCategoryContent />
    </Suspense>
  )
}