"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { VideoCard } from "@/components/video-card"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/lib/auth-context"
import { videos } from "@/lib/dummy-data"
import { ArrowLeft, Play, Clock, User, Calendar, Eye, Globe, Share2, Heart } from "lucide-react"

export default function VideoDetailsPage() {
  const params = useParams()
  const { isAuthenticated } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

  const video = videos.find((v) => v.video_uuid === params.uuid)

  if (!video) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Video Not Found</h1>
          <p className="text-gray-600 mb-4">The video you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/videos">Back to Videos</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Get recommendations (videos from same categories, excluding current video)
  const recommendations = videos
    .filter((v) => v.video_uuid !== video.video_uuid && v.categories.some((cat) => video.categories.includes(cat)))
    .slice(0, 4)

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
    console.log(`Watching ${video.title}`)
    // Future: Open video player
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert("Link copied to clipboard!")
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
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/videos">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Videos
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                  <Image src={video.thumbnail || "/placeholder.svg"} alt={video.title} fill className="object-cover" />
                  {/* Video Player Placeholder */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <Play className="h-10 w-10 text-white ml-1" />
                      </div>
                      <p className="text-white text-lg font-medium">Video Player</p>
                      <p className="text-white/80 text-sm">Will be integrated later</p>
                    </div>
                  </div>
                  {video.is_featured && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        Featured
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                      <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          {video.instructor}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {video.duration}
                        </div>
                        <div className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          {video.views.toLocaleString()} views
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          {new Date(video.upload_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {video.categories.map((category) => (
                      <Badge key={category} variant="outline">
                        {category}
                      </Badge>
                    ))}
                    <Badge className={getDifficultyColor(video.difficulty_level)}>{video.difficulty_level}</Badge>
                    <Badge variant="outline">{video.language}</Badge>
                  </div>

                  <div className="flex gap-2 mb-6">
                    {canWatch && video.video_file && (
                      <Button onClick={() => handleAction(handleWatch)} className="flex-1">
                        <Play className="mr-2 h-4 w-4" />
                        Watch Video
                      </Button>
                    )}

                    <Button variant="outline" onClick={() => handleAction(() => setIsFavorited(!isFavorited))}>
                      <Heart className={`mr-2 h-4 w-4 ${isFavorited ? "fill-current text-red-500" : ""}`} />
                      {isFavorited ? "Favorited" : "Favorite"}
                    </Button>

                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Separator className="mb-6" />

                  <div>
                    <h3 className="text-lg font-semibold mb-3">About this video</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">{video.description}</p>
                    {video.summary && (
                      <div>
                        <h4 className="font-semibold mb-2">Summary</h4>
                        <p className="text-gray-600">{video.summary}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Video Information Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Video ID:</span>
                    <span className="font-mono text-xs">{video.video_uuid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span>{video.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty:</span>
                    <Badge className={getDifficultyColor(video.difficulty_level)} variant="outline">
                      {video.difficulty_level}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span>{video.language}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views:</span>
                    <span>{video.views.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Access:</span>
                    <Badge variant="outline">
                      {video.access_permission === "ALL"
                        ? "Public"
                        : video.access_permission === "AUTH"
                          ? "Members Only"
                          : "Restricted"}
                    </Badge>
                  </div>
                  {video.is_external && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Source:</span>
                      <Badge variant="outline">
                        <Globe className="mr-1 h-3 w-3" />
                        External
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">{video.instructor}</p>
                    <p className="text-sm text-gray-600">Video Instructor</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((recommendedVideo) => (
                <VideoCard key={recommendedVideo.video_uuid} video={recommendedVideo} />
              ))}
            </div>
          </div>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}
