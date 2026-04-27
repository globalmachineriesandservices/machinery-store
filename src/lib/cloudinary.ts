import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export default cloudinary

export async function uploadImage(
  file: string,
  folder: string = 'machinery-store',
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    resource_type: 'auto',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  })
  return { url: result.secure_url, publicId: result.public_id }
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

/**
 * Extract the Cloudinary public_id from a secure_url.
 * e.g. "https://res.cloudinary.com/demo/image/upload/v1234/machinery-store/products/abc.jpg"
 * → "machinery-store/products/abc"
 * Returns null if the URL is not a Cloudinary URL or can't be parsed.
 */
export function publicIdFromUrl(url: string): string | null {
  if (!url.includes('cloudinary.com')) return null
  try {
    // Strip everything up to and including "/upload/"
    const afterUpload = url.split('/upload/')[1]
    if (!afterUpload) return null
    // Remove optional version segment (v1234567/)
    const withoutVersion = afterUpload.replace(/^v\d+\//, '')
    // Remove file extension
    const withoutExt = withoutVersion.replace(/\.[^/.]+$/, '')
    return withoutExt
  } catch {
    return null
  }
}

/**
 * Delete multiple Cloudinary images by URL in parallel.
 * Errors are swallowed individually so one failure doesn't block the rest.
 */
export async function deleteImagesByUrls(urls: string[]): Promise<void> {
  await Promise.allSettled(
    urls.map(async (url) => {
      const publicId = publicIdFromUrl(url)
      if (publicId) await cloudinary.uploader.destroy(publicId)
    }),
  )
}

export function getOptimizedImageUrl(
  url: string,
  width?: number,
  height?: number,
): string {
  if (!url.includes('cloudinary')) return url
  const parts = url.split('/upload/')
  if (parts.length !== 2) return url
  const transforms = ['f_auto', 'q_auto']
  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  transforms.push('c_fill')
  return `${parts[0]}/upload/${transforms.join(',')}/${parts[1]}`
}
