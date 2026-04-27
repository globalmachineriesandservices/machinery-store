'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

/** An uploaded image — url for display, publicId for Cloudinary deletion */
export interface UploadedImage {
  url: string
  publicId: string
}

/** Delete a list of Cloudinary images by their publicIds (fire-and-forget) */
export async function deleteUploadedImages(images: UploadedImage[]) {
  if (!images.length) return
  await Promise.allSettled(
    images.map((img) =>
      fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: img.publicId }),
      }),
    ),
  )
}

interface ImageUploaderProps {
  /** Current image URLs (display only — publicIds are tracked internally) */
  value: string[]
  onChange: (urls: string[]) => void
  /**
   * Called whenever the internal list of UploadedImage objects changes.
   * Use this to keep a ref of publicIds so you can delete them on cancel.
   */
  onUploadedImagesChange?: (images: UploadedImage[]) => void
  maxImages?: number
  folder?: string
  className?: string
}

export default function ImageUploader({
  value = [],
  onChange,
  onUploadedImagesChange,
  maxImages = 5,
  folder = 'machinery-store/products',
  className,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  // Track publicIds in parallel with value URLs
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])

  const uploadFile = async (file: File): Promise<UploadedImage> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    return {
      url: data.data.url as string,
      publicId: data.data.publicId as string,
    }
  }

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      if (value.length >= maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`)
        return
      }
      const remaining = maxImages - value.length
      const toUpload = Array.from(files).slice(0, remaining)
      setUploading(true)
      try {
        const results = await Promise.all(toUpload.map(uploadFile))
        const nextImages = [...uploadedImages, ...results]
        setUploadedImages(nextImages)
        onUploadedImagesChange?.(nextImages)
        onChange([...value, ...results.map((r) => r.url)])
        toast.success(
          `${results.length} image${results.length > 1 ? 's' : ''} uploaded`,
        )
      } catch {
        toast.error('Failed to upload image')
      } finally {
        setUploading(false)
      }
    },
    [value, maxImages, onChange, onUploadedImagesChange, uploadedImages],
  )

  const removeImage = async (index: number) => {
    // Delete from Cloudinary if we have the publicId
    const img = uploadedImages.find((u) => u.url === value[index])
    if (img) {
      fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: img.publicId }),
      }).catch(() => {})
      const nextImages = uploadedImages.filter((u) => u.url !== value[index])
      setUploadedImages(nextImages)
      onUploadedImagesChange?.(nextImages)
    }
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className={cn('space-y-3', className)}>
      <label
        className={cn(
          'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50',
          uploading && 'pointer-events-none opacity-60',
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
      >
        <input
          type='file'
          accept='image/*'
          multiple
          className='hidden'
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading || value.length >= maxImages}
        />
        {uploading ? (
          <Loader2 className='w-8 h-8 text-muted-foreground animate-spin' />
        ) : (
          <>
            <Upload className='w-8 h-8 text-muted-foreground mb-2' />
            <p className='text-sm text-muted-foreground'>
              Drop images here or{' '}
              <span className='text-primary font-medium'>browse</span>
            </p>
            <p className='text-xs text-muted-foreground mt-1'>
              PNG, JPG, WEBP up to 5MB · {value.length}/{maxImages} uploaded
            </p>
          </>
        )}
      </label>

      {value.length > 0 && (
        <div className='grid grid-cols-4 gap-2'>
          {value.map((url, i) => (
            <div
              key={i}
              className='relative group aspect-square rounded-md overflow-hidden border bg-muted'
            >
              <Image
                src={url}
                alt={`Image ${i + 1}`}
                fill
                className='object-cover'
                sizes='120px'
              />
              <button
                type='button'
                onClick={() => removeImage(i)}
                className='absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600'
              >
                <X className='w-3 h-3 text-white' />
              </button>
              {i === 0 && (
                <span className='absolute bottom-1 left-1 text-xs bg-primary text-white px-1 rounded'>
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
