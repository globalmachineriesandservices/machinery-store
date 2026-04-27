import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { categorySchema } from '@/schemas'
import { slugify } from '@/lib/utils'
import { deleteImagesByUrls } from '@/lib/cloudinary'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const category = await prisma.category.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        products: {
          include: { _count: { select: { reviews: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { products: true } },
      },
    })
    if (!category)
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 },
      )
    return NextResponse.json({ success: true, data: category })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
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

    // Toggle active only — no image changes involved
    if (typeof body.active === 'boolean') {
      const category = await prisma.category.update({
        where: { id },
        data: { active: body.active },
        include: { _count: { select: { products: true } } },
      })
      return NextResponse.json({ success: true, data: category })
    }

    const parsed = categorySchema.safeParse(body)
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      )

    // Fetch old image before updating so we can delete it if it changed
    const existing = await prisma.category.findUnique({ where: { id } })
    const oldImage = existing?.image ?? null
    const newImage = parsed.data.image ?? null

    const { name, ...rest } = parsed.data
    let slug = slugify(name)
    const slugConflict = await prisma.category.findFirst({
      where: { slug, NOT: { id } },
    })
    if (slugConflict) slug = `${slug}-${Date.now()}`

    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, ...rest },
      include: { _count: { select: { products: true } } },
    })

    // Delete old image from Cloudinary if it was replaced or removed
    if (oldImage && oldImage !== newImage) {
      await deleteImagesByUrls([oldImage])
    }

    return NextResponse.json({ success: true, data: category })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
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
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    })

    if (category?._count?.products && category._count.products > 0)
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete category with existing products',
        },
        { status: 400 },
      )

    // Delete DB record first so even if Cloudinary fails the data is gone
    await prisma.category.delete({ where: { id } })

    // Clean up image from Cloudinary
    if (category?.image) {
      await deleteImagesByUrls([category.image])
    }

    return NextResponse.json({ success: true, message: 'Category deleted' })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 },
    )
  }
}
