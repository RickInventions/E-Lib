"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Video } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "./auth-modal"
import { Play, Eye, Clock, User } from "lucide-react"
import { formatDuration } from "@/lib/utils"

interface VideoCardProps {
  video: Video
  onWatch?: (video: Video) => void
}

export function VideoCard({ video, onWatch }: VideoCardProps) {
  const { isAuthenticated } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleAction = (action: () => void) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    action()
  }

  const handleWatch = () => {
    if (onWatch) {
      onWatch(video)
    }
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow group">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <Image 
  src={
    video.thumbnail
      ? video.thumbnail.startsWith("http")
        ? video.thumbnail
        : `http://localhost:8000${video.thumbnail}`
      : "/placeholder.svg"
  }
            alt={video.title} 
            fill 
            className="object-fill" 
          />

          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="h-8 w-8 text-gray-800 ml-1" />
            </div>
          </div>

          <div className="absolute top-2 right-2">
            {video.is_featured && <Badge variant="secondary">Featured</Badge>}
          </div>

          <div className="absolute bottom-2 right-2">
            <Badge variant="outline" className="bg-black/70 text-white border-white/20">
              <Clock className="mr-1 h-3 w-3" />
              {formatDuration(video.duration)}
            </Badge>
          </div>
        </div>

        <CardContent className="flex-1 p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
          <p className="text-sm text-muted-foreground mb-1 flex items-center">
            <User className="mr-1 h-3 w-3" />
            {video.instructor}
          </p>

          <div className="flex flex-wrap gap-1 mb-2">
            <Badge variant="outline" className="text-xs">
              {video.category}
            </Badge>
          </div>

          <p className="text-sm line-clamp-3">{video.description}</p>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/videos/${video.video_uuid}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </Button>
        </CardFooter>
      </Card>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}