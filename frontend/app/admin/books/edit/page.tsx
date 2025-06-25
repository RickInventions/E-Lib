"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import AddBookPage from "@/app/admin/books/add/page"
import type { Book } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

function EditBookContent() {
  const searchParams = useSearchParams()
  const bookParam = searchParams.get('book')
  const book = bookParam ? JSON.parse(bookParam) as Book : undefined
  
  return <AddBookPage book={book} />
}

export default function EditBookPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-6" />
        <Skeleton className="h-10 w-32" />
      </div>
    }>
      <EditBookContent />
    </Suspense>
  )
}