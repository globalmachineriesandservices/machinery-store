import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { inquirySchema } from '@/schemas'
import { sendEmail, getInquiryEmailTemplate } from '@/lib/email'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where = { ...(status && { status }) }

    const [inquiries, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          product: { select: { name: true, slug: true } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inquiry.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: inquiries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[INQUIRIES_GET]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inquiries' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = inquirySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      )
    }

    const session = await auth()
    const { productId, ...data } = parsed.data

    const inquiry = await prisma.inquiry.create({
      data: {
        ...data,
        productId: productId || null,
        userId: session?.user?.id || null,
      },
      include: { product: { select: { name: true, slug: true } } },
    })

    // Send email notification (non-blocking)
    const company = await prisma.companyDetails.findFirst()
    if (company?.email && inquiry.product) {
      sendEmail({
        to: company.email,
        subject: `New Product Inquiry: ${inquiry.product.name}`,
        html: getInquiryEmailTemplate({
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          company: data.company || undefined,
          message: data.message,
          productName: inquiry.product.name,
        }),
      }).catch(console.error)
    }

    return NextResponse.json({ success: true, data: inquiry }, { status: 201 })
  } catch (error) {
    console.error('[INQUIRIES_POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit inquiry' },
      { status: 500 },
    )
  }
}
