"use client"

import { useSearchParams } from "next/navigation"
import AddBookPage from "@/app/admin/books/add/page"
import type { Book } from "@/lib/types"

export default function EditBookPage() {
  const searchParams = useSearchParams()
  const bookParam = searchParams.get('book')
  const book = bookParam ? JSON.parse(bookParam) as Book : undefined
  
  return <AddBookPage book={book} />
}