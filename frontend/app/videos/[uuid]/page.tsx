"use client"

import { useState, useEffect, useRef } from "react"
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
import { ArrowLeft, Play, Clock, User, Calendar, Eye, Globe, Share2, Heart, X } from "lucide-react"
import { fetchVideoByUuid, fetchPublicVideos } from "@/lib/api"
import type { Video } from "@/lib/types"
import { formatDate, formatDuration } from "@/lib/utils"

export default function VideoDetailsPage() {
  const { uuid } = useParams()
  const { user, isAuthenticated } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [video, setVideo] = useState<Video | null>(null)
  const [recommendations, setRecommendations] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        const videoData = await fetchVideoByUuid(uuid as string)
        setVideo(videoData)
        
        const videosData = await fetchPublicVideos()
        const sameCategoryVideos = videosData.filter(
          v => v.id !== videoData.id && v.category === videoData.category
        )
        setRecommendations(sameCategoryVideos.slice(0, 4))
        
      } catch (err) {
        setError("Failed to load video details")
        console.error("Video fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [uuid])

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current = null
      }
    }
  }, [])

  const handleAction = (action: () => void) => {
    if (!isAuthenticated) {
      setShowAuthModal(true)
      return
    }
    action()
  }


  const handleWatch = () => {
    setShowPlayer(true)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert("Link copied to clipboard!")
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Video</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button asChild>
            <Link href="/videos">Back to Videos</Link>
          </Button>
        </div>
      </div>
    )
  }

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
                  {showPlayer && video.video_file ? (
                    <>
                      <div className="absolute top-0 right-0 z-10 p-2">
                        <Button 
                          variant="secondary" 
                          size="icon"
                          onClick={() => setShowPlayer(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <video
                        ref={videoRef}
  src={
    video.video_file.startsWith("http")
      ? video.video_file
      : `http://localhost:8000${video.video_file}`
  }
                        controls
                        autoPlay
                        className="w-full h-full object-fill bg-black"
                      />
                    </>
                  ) : (
                    <>
                      {video.thumbnail ? (
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
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                        />
                      ) : (
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full flex items-center justify-center">
                          <span className="text-gray-500">No thumbnail</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-center">
                          <Button
                            size="icon"
                            className="w-20 h-20 rounded-full"
                            onClick={handleWatch}
                            disabled={!video.video_file}
                          >
                            <Play className="h-10 w-10 ml-1" />
                          </Button>
                          <p className="text-white text-lg font-medium mt-4">
                            {video.video_file ? "Click to play video" : "Video Not Available"}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                  
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
                          {video.instructor || "Unknown Instructor"}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {formatDuration(video.duration)}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          {formatDate(video.upload_date)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">
                      {video.category_display || video.category}
                    </Badge>
                  </div>

                  <div className="flex gap-2 mb-6">
                    <Button 
                      onClick={handleWatch} 
                      className="flex-1"
                      disabled={!video.video_file}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {video.video_file ? "Watch Video" : "Video Not Available"}
                    </Button>

                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Separator className="mb-6" />

                  <div>
                    <h3 className="text-lg font-semibold mb-3">About this video</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">{video.description}</p>
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
                    <span className="text-gray-600">Duration:</span>
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Upload Date:</span>
                    <span>{formatDate(video.upload_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span>{video.category_display || video.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant={video.is_featured ? "secondary" : "outline"}>
                      {video.is_featured ? "Featured" : "Regular"}
                    </Badge>
                  </div>
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
                    <p className="font-medium">{video.instructor || "Unknown Instructor"}</p>
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
                <VideoCard key={recommendedVideo.id} video={recommendedVideo} />
              ))}
            </div>
          </div>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}