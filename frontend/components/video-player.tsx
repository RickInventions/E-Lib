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
        url={`https://e-lib-rrx7.onrender.com${video.video_file}`}
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