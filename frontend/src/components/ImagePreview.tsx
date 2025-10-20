import { useState } from 'react'
import { X, ExternalLink, Download } from 'lucide-react'

interface ImagePreviewProps {
  src: string
  alt?: string
  onRemove?: () => void
  showControls?: boolean
  className?: string
  size?: 'thumbnail' | 'small' | 'medium' | 'large' | 'full'
}

export default function ImagePreview({ 
  src, 
  alt = 'Image', 
  onRemove, 
  showControls = true,
  className = '',
  size = 'medium'
}: ImagePreviewProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const getImageStyle = (size: string) => {
    switch (size) {
      case 'thumbnail':
        return { maxHeight: '80px', maxWidth: '120px', objectFit: 'cover' as const }
      case 'small':
        return { maxHeight: '120px', maxWidth: '200px', objectFit: 'cover' as const }
      case 'medium':
        return { maxHeight: '200px', maxWidth: '300px', objectFit: 'cover' as const }
      case 'large':
        return { maxHeight: '300px', maxWidth: '500px', objectFit: 'cover' as const }
      case 'full':
        return { width: '100%', height: 'auto' }
      default:
        return { maxHeight: '200px', maxWidth: '300px', objectFit: 'cover' as const }
    }
  }

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageLoading(false)
    setImageError(true)
  }

  const downloadImage = async () => {
    try {
      const response = await fetch(src)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = alt || 'image'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to download image:', error)
    }
  }

  const openInNewTab = () => {
    window.open(src, '_blank')
  }

  if (imageError) {
    return (
      <div className={`border-2 border-dashed border-red-300 rounded-lg p-4 bg-red-50 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-sm text-red-600 font-medium">Failed to load image</p>
          <p className="text-xs text-red-500 mt-1">Please check the image URL</p>
          {onRemove && (
            <button
              onClick={onRemove}
              className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
            >
              Remove image
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative group ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center" style={getImageStyle(size)}>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`w-full h-auto rounded-lg border border-gray-200 shadow-sm ${
          imageLoading ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-200 ${className}`}
        style={getImageStyle(size)}
      />

      {showControls && !imageLoading && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex space-x-1">
            <button
              onClick={openInNewTab}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-1.5 rounded-md shadow-sm transition-all duration-200"
              title="Open in new tab"
            >
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={downloadImage}
              className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-1.5 rounded-md shadow-sm transition-all duration-200"
              title="Download image"
            >
              <Download className="w-3 h-3" />
            </button>
            {onRemove && (
              <button
                onClick={onRemove}
                className="bg-red-500 bg-opacity-90 hover:bg-opacity-100 text-white p-1.5 rounded-md shadow-sm transition-all duration-200"
                title="Remove image"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}