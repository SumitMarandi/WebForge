// Image upload utilities

export interface UploadedImage {
  url: string
  name: string
  size: number
  type: string
}

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)'
    }
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image file size must be less than 10MB'
    }
  }

  return { valid: true }
}

export const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve(compressedFile)
          } else {
            resolve(file) // Fallback to original if compression fails
          }
        },
        file.type,
        quality
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

export const uploadToImgur = async (file: File): Promise<UploadedImage> => {
  const formData = new FormData()
  formData.append('image', file)

  try {
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID 546c25a59c58ad7' // Public Imgur client ID
      },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.success) {
      return {
        url: data.data.link,
        name: file.name,
        size: file.size,
        type: file.type
      }
    } else {
      throw new Error(data.data?.error || 'Upload failed')
    }
  } catch (error) {
    console.error('Imgur upload error:', error)
    // If it's a network error, throw a more specific message
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Please check your internet connection')
    }
    throw new Error('Imgur service unavailable. Using local storage instead.')
  }
}

export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Alternative upload service using imgbb (free tier)
export const uploadToImgBB = async (file: File): Promise<UploadedImage> => {
  const formData = new FormData()
  formData.append('image', file)

  try {
    // Using imgbb free API (no key required for basic usage)
    const response = await fetch('https://api.imgbb.com/1/upload?key=temp', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.success) {
      return {
        url: data.data.url,
        name: file.name,
        size: file.size,
        type: file.type
      }
    } else {
      throw new Error(data.error?.message || 'Upload failed')
    }
  } catch (error) {
    console.error('ImgBB upload error:', error)
    throw new Error('ImgBB service unavailable')
  }
}

// Simple local object URL (temporary, for development)
export const createLocalImageUrl = (file: File): UploadedImage => {
  const url = URL.createObjectURL(file)
  return {
    url,
    name: file.name,
    size: file.size,
    type: file.type
  }
}

export const uploadImageFile = async (
  file: File,
  method: 'imgur' | 'base64' = 'imgur',
  compress: boolean = true
): Promise<UploadedImage> => {
  // Validate file
  const validation = validateImageFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Compress if requested
  let processedFile = file
  if (compress && file.size > 500 * 1024) { // Compress files larger than 500KB
    processedFile = await compressImage(file)
  }

  // Try Imgur first, fallback to base64 if it fails
  if (method === 'imgur') {
    try {
      return await uploadToImgur(processedFile)
    } catch (error) {
      console.warn('Imgur upload failed, falling back to base64:', error)
      // Fallback to base64
      const base64 = await convertToBase64(processedFile)
      return {
        url: base64,
        name: file.name,
        size: file.size,
        type: file.type
      }
    }
  } else if (method === 'base64') {
    const base64 = await convertToBase64(processedFile)
    return {
      url: base64,
      name: file.name,
      size: file.size,
      type: file.type
    }
  } else {
    throw new Error('Unsupported upload method')
  }
}