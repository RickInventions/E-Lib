// books/videos/add/page.tsx
"use client"
import { useAuth } from "@/lib/auth-context"
import { createVideo, updateVideo } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, Trash, Upload } from "lucide-react"
import { Video } from "@/lib/types"

const VIDEO_CATEGORIES = [
  { value: "TUTORIAL", label: "Tutorial" },
  { value: "LECTURE", label: "Lecture" },
  { value: "DOCUMENTARY", label: "Documentary" },
  { value: "OTHER", label: "Other" },
]

interface AddVideoPageProps {
  video?: Video
}

export default function AddVideoPage({ video }: AddVideoPageProps) {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [videoData, setVideoData] = useState({
    title: video?.title || "",
    instructor: video?.instructor || "",
    description: video?.description || "",
    category: video?.category || "OTHER",
    duration: video?.duration || 0,
    is_featured: video?.is_featured || false,
    is_external: video?.is_external || false,
    external_source: video?.external_source || "",
  })

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/")
    }
  }, [isAuthenticated, user, router])

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0])
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Only require video file for new videos
    if (!video && !videoFile) {
      toast({
        title: "Error",
        description: "Video file is required for new videos",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('title', videoData.title)
      formData.append('instructor', videoData.instructor)
      formData.append('description', videoData.description)
      formData.append('category', videoData.category)
      formData.append('duration', videoData.duration.toString())
      formData.append('is_featured', videoData.is_featured.toString())
      formData.append('is_external', videoData.is_external.toString())
      
      if (videoData.is_external && videoData.external_source) {
        formData.append('external_source', videoData.external_source)
      }
      
      // Only append files if they exist (for edit) or are required (for create)
      if (videoFile) formData.append('video_file', videoFile)
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile)

      if (video) {
        // Update existing video
        await updateVideo(video.video_uuid, formData)
        toast({
          title: "Success",
          description: "Video updated successfully!",
          variant: "default",
        })
      } else {
        // Create new video
        const newVideo = await createVideo(formData)
        toast({
          title: "Success",
          description: "Video added successfully!",
          variant: "default",
        })
        router.push(`/videos/${newVideo.video_uuid}`)
      }
      router.push("/admin")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/admin">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Link>
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {video ? "Edit Video" : "Add New Video"}
        </h1>
        <p className="text-gray-600">
          {video ? "Update the video details" : "Upload a new video to the library"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={videoData.title}
                    onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
                    placeholder="Enter video title"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instructor *</Label>
                    <Input
                      id="instructor"
                      value={videoData.instructor}
                      onChange={(e) => setVideoData({ ...videoData, instructor: e.target.value })}
                      placeholder="Enter instructor name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (seconds) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={videoData.duration}
                      onChange={(e) => setVideoData({ ...videoData, duration: parseInt(e.target.value) || 0 })}
                      placeholder="Enter duration in seconds"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={videoData.description}
                    onChange={(e) => setVideoData({ ...videoData, description: e.target.value })}
                    placeholder="Enter video description"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={videoData.category}
                      onValueChange={(value) => setVideoData({ ...videoData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {VIDEO_CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Files & Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Video File {!video && '*'}</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    {video?.video_file && !videoFile && (
                      <div className="mb-2">
                        <p className="text-sm text-muted-foreground">Current video:</p>
                        <video 
                          src={video.video_file} 
                          className="h-40 object-contain border rounded"
                          controls
                        />
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mb-2">
                      {video ? "Upload new video to replace current" : "Drag and drop or click to upload video"}
                    </p>
                    <p className="text-xs text-gray-500">Supported formats: MP4, AVI, MOV (Max: 500MB)</p>
                    <input
                      type="file"
                      id="video-upload"
                      className="hidden"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      required={!video} // Only required for new videos
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => document.getElementById('video-upload')?.click()}
                    >
                      Choose Video File
                    </Button>
                    {videoFile && (
                      <p className="mt-2 text-sm text-green-600">{videoFile.name}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Thumbnail Image</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    {video?.thumbnail && !thumbnailFile && (
                      <div className="mb-2">
                        <p className="text-sm text-muted-foreground">Current thumbnail:</p>
                        <img 
src={`http://localhost:8000${video.thumbnail}`}

                          alt="Current thumbnail" 
                          className="h-40 object-contain border rounded"
                        />
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mb-2">
                      {video ? "Upload new thumbnail to replace current" : "Upload video thumbnail"}
                    </p>
                    <p className="text-xs text-gray-500">Recommended size: 1280 x 720 pixels</p>
                    <input
                      type="file"
                      id="thumbnail-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => document.getElementById('thumbnail-upload')?.click()}
                    >
                      Choose Thumbnail
                    </Button>
                    {thumbnailFile && (
                      <p className="mt-2 text-sm text-green-600">{thumbnailFile.name}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Video Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={videoData.is_featured}
                    onCheckedChange={(checked) => setVideoData({ ...videoData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured Video</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_external"
                    checked={videoData.is_external}
                    onCheckedChange={(checked) => setVideoData({ ...videoData, is_external: checked })}
                  />
                  <Label htmlFor="is_external">External Source</Label>
                </div>

                {videoData.is_external && (
                  <div className="space-y-2">
                    <Label htmlFor="external_source">External Source URL</Label>
                    <Input
                      id="external_source"
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={videoData.external_source}
                      onChange={(e) => setVideoData({ ...videoData, external_source: e.target.value })}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Saving..." : video ? "Update Video" : "Save Video"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => router.push('/admin')}
              >
                <Trash className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}