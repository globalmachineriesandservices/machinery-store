import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )
    }
    const { id } = await params
    const inquiry = await prisma.inquiry.findUnique({
      where: { id },
      include: {
        product: { select: { name: true, slug: true, images: true } },
        user: { select: { name: true, email: true, image: true } },
      },
    })
    if (!inquiry) {
      return NextResponse.json(
        { success: false, error: 'Inquiry not found' },
        { status: 404 },
      )
    }
    return NextResponse.json({ success: true, data: inquiry })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inquiry' },
      { status: 500 },
    )
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )
    }
    const { id } = await params
    const { status } = await req.json()

    if (!['PENDING', 'REPLIED', 'CLOSED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 },
      )
    }

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { status },
    })
    return NextResponse.json({ success: true, data: inquiry })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update inquiry' },
      { status: 500 },
    )
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )
    }
    const { id } = await params
    await prisma.inquiry.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'Inquiry deleted' })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete inquiry' },
      { status: 500 },
    )
  }
}
