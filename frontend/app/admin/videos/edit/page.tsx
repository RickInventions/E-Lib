"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import AddVideoPage from "../add/page"
import { Video } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

function EditVideoContent() {
  const searchParams = useSearchParams()
  const videoParam = searchParams.get('video')
  const video = videoParam ? JSON.parse(videoParam) as Video : undefined
  
  return <AddVideoPage video={video} />
}

export default function EditVideoPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-6" />
        <Skeleton className="h-10 w-32" />
      </div>
    }>
      <EditVideoContent />
    </Suspense>
  )
}