import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user)
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )

    const { id } = await params
    const review = await prisma.review.findUnique({ where: { id } })

    if (!review)
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 },
      )

    if (session.user.role !== 'ADMIN' && review.userId !== session.user.id)
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      )

    await prisma.review.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Review deleted' })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 },
    )
  }
}
