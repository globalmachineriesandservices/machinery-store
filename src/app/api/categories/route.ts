import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { categorySchema } from '@/schemas'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('[CATEGORIES_GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )
    }

    const body = await req.json()
    const parsed = categorySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      )
    }

    const { name, ...rest } = parsed.data
    let slug = slugify(name)
    const existing = await prisma.category.findUnique({ where: { slug } })
    if (existing) slug = `${slug}-${Date.now()}`

    const category = await prisma.category.create({
      data: { name, slug, ...rest },
      include: { _count: { select: { products: true } } },
    })

    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (error) {
    console.error('[CATEGORIES_POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 },
    )
  }
}
