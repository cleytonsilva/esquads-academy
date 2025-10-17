import { supabase } from '@/integrations/supabase/client'

type ToastFunction = (options: {
  title: string;
  description: string;
  variant?: "destructive" | "default";
}) => void;

interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  thumbnailUrl?: string;
}

/**
 * Enhanced image upload using the new Edge Function
 * @param file - Image file to upload
 * @param courseId - Course ID for organization
 * @param moduleId - Optional module ID for further organization
 * @param toast - Toast function for notifications
 * @returns Promise with upload response
 */
export const uploadImageWithEdgeFunction = async (
  file: File,
  courseId: string,
  moduleId?: string,
  toast?: ToastFunction
): Promise<UploadResponse> => {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`)
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`)
    }

    // Convert file to base64
    const base64 = await fileToBase64(file)

    // Get current session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('User not authenticated')
    }

    // Call the Edge Function
    // Try Edge Function first; fallback to local API uploads
    try {
      const { data, error } = await supabase.functions.invoke('upload-course-image', {
        body: {
          file: base64,
          filename: file.name,
          mimeType: file.type,
          courseId,
          moduleId
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!error && data && (data as any).url) {
        toast?.({ title: 'Success', description: 'Image uploaded successfully!' })
        return data as UploadResponse
      }
    } catch (_e) {
      // proceed to fallback
    }

    // Fallback: Express API route /api/uploads (multipart)
    const form = new FormData()
    form.append('file', file)
    const resp = await fetch('/api/uploads', { method: 'POST', body: form })
    if (!resp.ok) throw new Error('Upload failed')
    const json = await resp.json()
    if (!json?.success || !json?.url) throw new Error('Invalid upload response')
    toast?.({ title: 'Success', description: 'Image uploaded successfully!' })
    return { url: json.url, filename: file.name, size: file.size, mimeType: file.type } as UploadResponse

  } catch (error: any) {
    console.error('Enhanced image upload error:', error)
    
    toast?.({
      title: "Upload Error",
      description: error.message || 'Failed to upload image',
      variant: "destructive",
    })
    
    throw error
  }
}

/**
 * Convert file to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}

/**
 * Validate image URL
 */
export const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname.toLowerCase()
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(pathname)
  } catch {
    return false
  }
}

/**
 * Get image dimensions from file
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    
    img.src = url
  })
}

/**
 * Resize image file to specified dimensions
 */
export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }
      
      // Set canvas dimensions
      canvas.width = width
      canvas.height = height
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(resizedFile)
          } else {
            reject(new Error('Failed to resize image'))
          }
        },
        file.type,
        quality
      )
    }
    
    img.onerror = () => reject(new Error('Failed to load image for resizing'))
    img.src = URL.createObjectURL(file)
  })
}
