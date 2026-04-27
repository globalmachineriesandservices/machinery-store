import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { faqSchema } from '@/schemas'

export async function GET() {
  try {
    const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } })
    return NextResponse.json({ success: true, data: faqs })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQs' },
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
    const parsed = faqSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      )
    }

    const faq = await prisma.fAQ.create({ data: parsed.data })
    return NextResponse.json({ success: true, data: faq }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create FAQ' },
      { status: 500 },
    )
  }
}
