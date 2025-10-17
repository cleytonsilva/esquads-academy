import React, { useState, useEffect } from 'react'
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react'
import { Play, ExternalLink, Trash2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface YouTubeNodeViewProps extends NodeViewProps {
  node: {
    attrs: {
      src: string
      width?: number
      height?: number
    }
  }
}

/**
 * React component for YouTube video node view with thumbnail preview
 */
const YouTubeNodeView: React.FC<YouTubeNodeViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
  selected,
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [videoTitle, setVideoTitle] = useState<string>('')
  const [showPlayer, setShowPlayer] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [tempWidth, setTempWidth] = useState<number>(560)
  const [tempHeight, setTempHeight] = useState<number>(315)

  const { src, width = 560, height = 315 } = node.attrs

  // Update temp values when node attributes change
  useEffect(() => {
    setTempWidth(width)
    setTempHeight(height)
  }, [width, height])

  // Extract video ID from YouTube URL
  const getVideoId = (url: string): string | null => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    )
    return match ? match[1] : null
  }

  // Get embed URL
  const getEmbedUrl = (url: string): string => {
    const videoId = getVideoId(url)
    if (!videoId) return url
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
  }

  // Get thumbnail URL
  const getThumbnailUrl = (url: string): string | null => {
    const videoId = getVideoId(url)
    if (!videoId) return null
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
  }

  // Fetch video metadata
  useEffect(() => {
    const videoId = getVideoId(src)
    if (videoId) {
      setThumbnailUrl(getThumbnailUrl(src))
      
      // Try to get video title from YouTube oEmbed API
      fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
        .then(response => response.json())
        .then(data => {
          if (data.title) {
            setVideoTitle(data.title)
          }
        })
        .catch(() => {
          // Fallback to generic title
          setVideoTitle('YouTube Video')
        })
        .finally(() => {
          setIsLoaded(true)
        })
    }
  }, [src])

  const handlePlayClick = () => {
    setShowPlayer(true)
  }

  const handleOpenInYouTube = () => {
    const videoId = getVideoId(src)
    if (videoId) {
      window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank')
    }
  }

  const handleSizeUpdate = () => {
    updateAttributes({
      width: tempWidth,
      height: tempHeight,
    })
    setShowSettings(false)
  }

  const handleResetSize = () => {
    setTempWidth(560)
    setTempHeight(315)
    updateAttributes({
      width: 560,
      height: 315,
    })
  }

  if (!isLoaded) {
    return (
      <NodeViewWrapper className="youtube-node-view">
        <div 
          className={`relative bg-gray-100 rounded-lg overflow-hidden ${
            selected ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{ width: Math.min(width, 800), height: Math.min(height, 450) }}
        >
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </NodeViewWrapper>
    )
  }

  if (showPlayer) {
    return (
      <NodeViewWrapper className="youtube-node-view">
        <div 
          className={`relative rounded-lg overflow-hidden ${
            selected ? 'ring-2 ring-blue-500' : ''
          }`}
          style={{ width: Math.min(width, 800), height: Math.min(height, 450) }}
        >
          <iframe
            src={getEmbedUrl(src)}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0"
          />
          
          {selected && (
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={deleteNode}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </NodeViewWrapper>
    )
  }

  return (
    <NodeViewWrapper className="youtube-node-view">
      <div 
        className={`relative bg-black rounded-lg overflow-hidden cursor-pointer group ${
          selected ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{ width: Math.min(width, 800), height: Math.min(height, 450) }}
        onClick={handlePlayClick}
      >
        {/* Thumbnail */}
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={videoTitle || 'YouTube Video'}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to a different thumbnail quality if the default fails
              const target = e.target as HTMLImageElement
              const videoId = getVideoId(src)
              if (videoId && target.src.includes('mqdefault')) {
                target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
              }
            }}
          />
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all duration-200">
          <div className="bg-red-600 rounded-full p-4 group-hover:scale-110 transition-transform duration-200">
            <Play className="h-8 w-8 text-white fill-current ml-1" />
          </div>
        </div>
        
        {/* Video title overlay */}
        {videoTitle && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <h3 className="text-white text-sm font-medium line-clamp-2">
              {videoTitle}
            </h3>
          </div>
        )}
        
        {/* Controls when selected */}
        {selected && (
          <div className="absolute top-2 right-2 flex gap-2">
            <Popover open={showSettings} onOpenChange={setShowSettings}>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  className="h-8 w-8 p-0 bg-white bg-opacity-90 hover:bg-opacity-100"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" onClick={(e) => e.stopPropagation()}>
                <div className="space-y-4">
                  <h4 className="font-medium">Video Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="width">Width</Label>
                      <Input
                        id="width"
                        type="number"
                        value={tempWidth}
                        onChange={(e) => setTempWidth(Number(e.target.value))}
                        min={200}
                        max={1200}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height</Label>
                      <Input
                        id="height"
                        type="number"
                        value={tempHeight}
                        onChange={(e) => setTempHeight(Number(e.target.value))}
                        min={150}
                        max={800}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSizeUpdate}>
                      Apply
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleResetSize}>
                      Reset
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenInYouTube()
              }}
              className="h-8 w-8 p-0 bg-white bg-opacity-90 hover:bg-opacity-100"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation()
                deleteNode()
              }}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* YouTube logo */}
        <div className="absolute top-2 left-2">
          <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
            YouTube
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export default YouTubeNodeView
