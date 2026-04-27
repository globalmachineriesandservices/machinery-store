import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { reviewSchema } from '@/schemas'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user)
      return NextResponse.json(
        { success: false, error: 'Must be logged in to leave a review' },
        { status: 401 },
      )

    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      )

    const existing = await prisma.review.findFirst({
      where: { userId: session.user.id, productId: parsed.data.productId },
    })
    if (existing)
      return NextResponse.json(
        { success: false, error: 'You have already reviewed this product' },
        { status: 409 },
      )

    const review = await prisma.review.create({
      data: { ...parsed.data, userId: session.user.id },
      include: { user: { select: { name: true, image: true } } },
    })

    return NextResponse.json({ success: true, data: review }, { status: 201 })
  } catch (error) {
    console.error('[REVIEWS_POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 },
    )
  }
}
