// components/video-player.tsx
import { Video } from '@/lib/types'
import ReactPlayer from 'react-player'

interface VideoPlayerProps {
  video: Video
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  return (
    <div className="aspect-video">
      <ReactPlayer
        url={`http://localhost:8000${video.video_file}`}
        width="100%"
        height="100%"
        controls
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload'
            }
          }
        }}
      />
    </div>
  )
}