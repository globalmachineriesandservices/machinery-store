import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { faqSchema } from '@/schemas'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const faq = await prisma.fAQ.findUnique({ where: { id } })
    if (!faq)
      return NextResponse.json(
        { success: false, error: 'FAQ not found' },
        { status: 404 },
      )
    return NextResponse.json({ success: true, data: faq })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQ' },
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
    const parsed = faqSchema.safeParse(body)
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      )

    const faq = await prisma.fAQ.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ success: true, data: faq })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update FAQ' },
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
    await prisma.fAQ.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'FAQ deleted' })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete FAQ' },
      { status: 500 },
    )
  }
}
