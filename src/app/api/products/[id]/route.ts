import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { productSchema } from '@/schemas'
import { slugify } from '@/lib/utils'
import { deleteImagesByUrls } from '@/lib/cloudinary'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        category: true,
        reviews: {
          include: { user: { select: { name: true, image: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { reviews: true, inquiries: true } },
      },
    })
    if (!product)
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 },
      )
    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error('[PRODUCT_GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 },
    )
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )

    const { id } = await params
    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      )

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing)
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 },
      )

    const { name, brand, keyFeatures, ...rest } = parsed.data
    let slug = slugify(name)
    const slugConflict = await prisma.product.findFirst({
      where: { slug, NOT: { id } },
    })
    if (slugConflict) slug = `${slug}-${Date.now()}`

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        brand: brand || null,
        keyFeatures: keyFeatures ?? [],
        ...rest,
      },
      include: { category: true },
    })

    // Find images that were removed (in old list but not in new list)
    const oldImages: string[] = (existing.images as string[]) ?? []
    const newImages: string[] = parsed.data.images ?? []
    const removedImages = oldImages.filter((url) => !newImages.includes(url))

    if (removedImages.length > 0) {
      await deleteImagesByUrls(removedImages)
    }

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error('[PRODUCT_PUT]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 },
    )
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )

    const { id } = await params

    // Fetch images before deleting so we can clean up Cloudinary
    const product = await prisma.product.findUnique({
      where: { id },
      select: { images: true },
    })

    // Delete DB record first
    await prisma.product.delete({ where: { id } })

    // Then delete all images from Cloudinary
    const images = (product?.images as string[]) ?? []
    if (images.length > 0) {
      await deleteImagesByUrls(images)
    }

    return NextResponse.json({ success: true, message: 'Product deleted' })
  } catch (error) {
    console.error('[PRODUCT_DELETE]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 },
    )
  }
}
