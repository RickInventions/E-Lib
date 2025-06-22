"use client"

import { useSearchParams } from "next/navigation"
import AddVideoPage from "../add/page"
import { Video } from "@/lib/types"

export default function EditvideoPage() {
  const searchParams = useSearchParams()
  const videoParam = searchParams.get('video')
  const video = videoParam ? JSON.parse(videoParam) as Video : undefined
  
  return <AddVideoPage video={video} />
}