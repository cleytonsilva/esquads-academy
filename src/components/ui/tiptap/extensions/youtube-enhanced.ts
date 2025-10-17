import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import YouTubeNodeView from './youtube-node-view'

export interface YouTubeOptions {
  addPasteHandler: boolean
  allowFullscreen: boolean
  autoplay: boolean
  ccLanguage?: string
  ccLoadPolicy?: boolean
  controls: boolean
  disableKBcontrols: boolean
  enableIFrameApi: boolean
  endTime: number
  height: number
  interfaceLanguage?: string
  ivLoadPolicy: number
  loop: boolean
  modestBranding: boolean
  nocookie: boolean
  origin?: string
  playlist?: string
  progressBarColor?: string
  rel: boolean
  showinfo: boolean
  startAt: number
  width: number
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    youtubeEnhanced: {
      /**
       * Insert a YouTube video
       */
      setYouTubeVideo: (options: { src: string; width?: number; height?: number }) => ReturnType
    }
  }
}

// Helper functions for YouTube URL processing
const getVideoIdFromYouTubeUrl = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

const isValidYouTubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  return youtubeRegex.test(url)
}

const getEmbedUrlFromYouTubeUrl = (url: string, options: YouTubeOptions): string => {
  const videoId = getVideoIdFromYouTubeUrl(url)
  if (!videoId) {
    return url
  }

  const embedUrl = options.nocookie
    ? `https://www.youtube-nocookie.com/embed/${videoId}`
    : `https://www.youtube.com/embed/${videoId}`

  const params = new URLSearchParams()

  if (options.autoplay) {
    params.set('autoplay', '1')
  }

  if (!options.controls) {
    params.set('controls', '0')
  }

  if (options.disableKBcontrols) {
    params.set('disablekb', '1')
  }

  if (options.loop) {
    params.set('loop', '1')
    params.set('playlist', videoId)
  }

  if (options.modestBranding) {
    params.set('modestbranding', '1')
  }

  if (!options.rel) {
    params.set('rel', '0')
  }

  if (!options.showinfo) {
    params.set('showinfo', '0')
  }

  if (options.startAt) {
    params.set('start', options.startAt.toString())
  }

  if (options.endTime) {
    params.set('end', options.endTime.toString())
  }

  if (options.ccLanguage) {
    params.set('cc_lang_pref', options.ccLanguage)
  }

  if (options.ccLoadPolicy !== undefined) {
    params.set('cc_load_policy', options.ccLoadPolicy ? '1' : '0')
  }

  if (options.interfaceLanguage) {
    params.set('hl', options.interfaceLanguage)
  }

  if (options.ivLoadPolicy !== undefined) {
    params.set('iv_load_policy', options.ivLoadPolicy.toString())
  }

  if (options.origin) {
    params.set('origin', options.origin)
  }

  if (options.playlist) {
    params.set('playlist', options.playlist)
  }

  if (options.progressBarColor) {
    params.set('color', options.progressBarColor)
  }

  const queryString = params.toString()
  return queryString ? `${embedUrl}?${queryString}` : embedUrl
}

const getThumbnailUrl = (url: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium'): string | null => {
  const videoId = getVideoIdFromYouTubeUrl(url)
  if (!videoId) {
    return null
  }

  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    standard: 'sddefault',
    maxres: 'maxresdefault',
  }

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
}

/**
 * Enhanced YouTube extension with URL validation and thumbnail preview
 */
export const YouTubeEnhanced = Node.create<YouTubeOptions>({
  name: 'youtubeEnhanced',

  addOptions() {
    return {
      addPasteHandler: true,
      allowFullscreen: true,
      autoplay: false,
      ccLanguage: undefined,
      ccLoadPolicy: undefined,
      controls: true,
      disableKBcontrols: false,
      enableIFrameApi: false,
      endTime: 0,
      height: 315,
      interfaceLanguage: undefined,
      ivLoadPolicy: 0,
      loop: false,
      modestBranding: true,
      nocookie: true,
      origin: undefined,
      playlist: undefined,
      progressBarColor: undefined,
      rel: false,
      showinfo: false,
      startAt: 0,
      width: 560,
      HTMLAttributes: {},
    }
  },

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      start: {
        default: 0,
      },
      width: {
        default: this.options.width,
      },
      height: {
        default: this.options.height,
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-youtube-video] iframe',
      },
      {
        tag: 'iframe[src*="youtube.com"]',
      },
      {
        tag: 'iframe[src*="youtu.be"]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const embedUrl = getEmbedUrlFromYouTubeUrl(HTMLAttributes.src, this.options)

    const youTubeAttributes = {
      src: embedUrl,
      width: this.options.width,
      height: this.options.height,
      allowfullscreen: this.options.allowFullscreen,
      autoplay: this.options.autoplay,
      ccLanguage: this.options.ccLanguage,
      ccLoadPolicy: this.options.ccLoadPolicy,
      disableKBcontrols: this.options.disableKBcontrols,
      enableIFrameApi: this.options.enableIFrameApi,
      endTime: this.options.endTime,
      ivLoadPolicy: this.options.ivLoadPolicy,
      loop: this.options.loop,
      modestBranding: this.options.modestBranding,
      origin: this.options.origin,
      playlist: this.options.playlist,
      rel: this.options.rel,
      showinfo: this.options.showinfo,
      startAt: this.options.startAt,
    }

    const embedIframe = [
      'iframe',
      mergeAttributes(
        this.options.HTMLAttributes,
        {
          width: youTubeAttributes.width,
          height: youTubeAttributes.height,
          src: youTubeAttributes.src,
          frameBorder: 0,
          allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
          allowFullScreen: youTubeAttributes.allowfullscreen,
        }
      ),
    ]

    return [
      'div',
      {
        'data-youtube-video': '',
        class: 'youtube-video-wrapper aspect-video max-w-full mx-auto my-4',
      },
      embedIframe,
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(YouTubeNodeView)
  },

  addCommands() {
    return {
      setYouTubeVideo:
        (options: { src: string; width?: number; height?: number }) =>
        ({ commands }) => {
          if (!isValidYouTubeUrl(options.src)) {
            return false
          }

          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },

  addPasteRules() {
    if (!this.options.addPasteHandler) {
      return []
    }

    return [
      {
        find: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g,
        handler: ({ state, range, match }) => {
          const [url] = match
          const { tr } = state
          const start = range.from
          const end = range.to

          if (!isValidYouTubeUrl(url)) {
            return null
          }

          tr.replaceWith(start, end, this.type.create({ src: url }))

          return tr
        },
      },
    ]
  },
})

// Export helper functions for use in other components
export { getVideoIdFromYouTubeUrl, isValidYouTubeUrl, getEmbedUrlFromYouTubeUrl, getThumbnailUrl }
