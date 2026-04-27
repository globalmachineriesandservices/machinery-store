import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { productSchema } from '@/schemas'
import { slugify } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const categoryId = searchParams.get('categoryId') || undefined
    const search = searchParams.get('search') || undefined
    const brand = searchParams.get('brand') || undefined
    const featured = searchParams.get('featured') === 'true' ? true : undefined
    const inStock = searchParams.get('inStock') === 'true' ? true : undefined

    const where = {
      ...(categoryId && { categoryId }),
      ...(brand && { brand: { equals: brand, mode: 'insensitive' as const } }),
      ...(featured !== undefined && { featured }),
      ...(inStock !== undefined && { inStock }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
          { brand: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          _count: { select: { reviews: true, inquiries: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[PRODUCTS_GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )

    const body = await req.json()
    const parsed = productSchema.safeParse(body)
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      )

    const { name, brand, keyFeatures, ...rest } = parsed.data
    let slug = slugify(name)
    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        brand: brand || null,
        keyFeatures: keyFeatures ?? [],
        ...rest,
      },
      include: { category: true },
    })

    return NextResponse.json({ success: true, data: product }, { status: 201 })
  } catch (error) {
    console.error('[PRODUCTS_POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 },
    )
  }
}
