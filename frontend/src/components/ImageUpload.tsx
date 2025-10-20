import { useState, useRef } from 'react'
import { Upload, Image as ImageIcon, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import { uploadImageFile } from '@/utils/imageUpload'
import ImagePreview from './ImagePreview'

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void
  currentImageUrl?: string
  className?: string
}

export default function ImageUpload({ onImageUploaded, currentImageUrl, className = '' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setUploading(true)
    setError(null)

    try {
      // Try multiple upload methods
      let uploadedImage
      try {
        // First try Imgur
        uploadedImage = await uploadImageFile(file, 'imgur', true)
      } catch (imgurError) {
        console.warn('Imgur failed, trying base64:', imgurError)
        // Fallback to base64 for local storage
        uploadedImage = await uploadImageFile(file, 'base64', true)
      }
      
      onImageUploaded(uploadedImage.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file)
    } else {
      setError('Please drop a valid image file')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const removeImage = () => {
    onImageUploaded('')
    setError(null)
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
      />

      {currentImageUrl ? (
        // Show current image with option to change
        <div className="space-y-3">
          <div className="flex justify-center">
            <ImagePreview
              src={currentImageUrl}
              alt="Uploaded image"
              onRemove={removeImage}
              showControls={true}
              size="thumbnail"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={openFileDialog}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
              disabled={uploading}
            >
              <Upload className="w-4 h-4 mr-1" />
              Change Image
            </button>
          </div>
        </div>
      ) : (
        // Show upload area
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : uploading
              ? 'border-gray-300 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={!uploading ? openFileDialog : undefined}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader className="w-8 h-8 text-blue-600 animate-spin mb-2" />
              <p className="text-sm text-gray-600 font-medium">Uploading image...</p>
              <p className="text-xs text-gray-500 mt-1">Please wait</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <ImageIcon className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 font-medium mb-1">
                Drop an image here or click to browse
              </p>
              <p className="text-xs text-gray-500">
                Supports JPEG, PNG, GIF, WebP (max 10MB)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-700 font-medium">Upload Error</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={openFileDialog}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => setError(null)}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {currentImageUrl && !error && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
          <div>
            <p className="text-sm text-green-700 font-medium">Image uploaded successfully!</p>
            <p className="text-xs text-green-600 mt-1">
              {currentImageUrl.startsWith('data:') ? 'Stored locally (base64)' : 'Hosted externally'}
            </p>
          </div>
        </div>
      )}

      {/* Upload Tips */}
      {!currentImageUrl && !uploading && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 font-medium mb-1">💡 Upload Tips:</p>
          <ul className="text-xs text-blue-600 space-y-1">
            <li>• Images are automatically compressed for faster loading</li>
            <li>• Tries cloud hosting first, falls back to local storage</li>
            <li>• Use high-quality images for best results</li>
            <li>• Drag & drop or click to browse files</li>
            <li>• Supports JPEG, PNG, GIF, WebP (max 10MB)</li>
          </ul>
        </div>
      )}
    </div>
  )
}