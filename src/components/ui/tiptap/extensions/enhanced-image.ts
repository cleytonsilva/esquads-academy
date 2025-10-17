import { Node, mergeAttributes } from '@tiptap/core'
// Removed custom NodeView to avoid dependency on a missing file

export interface EnhancedImageOptions {
  inline: boolean
  allowBase64: boolean
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    enhancedImage: {
      /**
       * Add an image
       */
      setImage: (options: { 
        src: string; 
        alt?: string; 
        title?: string;
        width?: number;
        height?: number;
        alignment?: 'left' | 'center' | 'right';
      }) => ReturnType
    }
  }
}

/**
 * Enhanced Image extension with resize and positioning controls
 */
export const EnhancedImage = Node.create<EnhancedImageOptions>({
  name: 'enhancedImage',

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      HTMLAttributes: {},
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
      alignment: {
        default: 'center',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64
          ? 'img[src]'
          : 'img[src]:not([src^="data:"])',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { alignment, ...imgAttributes } = HTMLAttributes
    
    const wrapperClass = `image-wrapper image-${alignment || 'center'}`
    
    return [
      'div',
      { class: wrapperClass },
      [
        'img',
        mergeAttributes(this.options.HTMLAttributes, imgAttributes, {
          draggable: false,
          contenteditable: false,
        }),
      ],
    ]
  },

  // Note: Custom NodeView removed; default HTML rendering will be used

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
    }
  },
})
