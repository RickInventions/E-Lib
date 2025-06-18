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
import { Play, Eye, Clock, User, Globe } from "lucide-react"

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
    if (video.access_permission === "NONE") {
      alert("This video is not available for viewing")
      return
    }
    if (video.access_permission === "AUTH" && !isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    if (onWatch) {
      onWatch(video)
    }
  }

  const canWatch = video.access_permission === "ALL" || (video.access_permission === "AUTH" && isAuthenticated)

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
          <Image src={video.thumbnail || "/placeholder.svg"} alt={video.title} fill className="object-cover" />

          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="h-8 w-8 text-gray-800 ml-1" />
            </div>
          </div>

          <div className="absolute top-2 right-2 flex gap-1">
            {video.is_featured && <Badge variant="secondary">Featured</Badge>}
            {video.is_external && (
              <Badge variant="outline" className="bg-white/90">
                <Globe className="mr-1 h-3 w-3" />
                External
              </Badge>
            )}
          </div>

          <div className="absolute bottom-2 right-2">
            <Badge variant="outline" className="bg-black/70 text-white border-white/20">
              <Clock className="mr-1 h-3 w-3" />
              {video.duration}
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
            {video.categories.map((category) => (
              <Badge key={category} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Badge className={`text-xs ${getDifficultyColor(video.difficulty_level)}`}>{video.difficulty_level}</Badge>
            <span className="text-xs text-gray-500">{video.views.toLocaleString()} views</span>
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

          {canWatch && video.video_file && (
            <Button size="sm" onClick={() => handleAction(handleWatch)} variant="outline">
              <Play className="mr-2 h-4 w-4" />
              Watch
            </Button>
          )}

          {!video.is_available && (
            <Badge variant="destructive" className="ml-auto">
              Unavailable
            </Badge>
          )}
        </CardFooter>
      </Card>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
