import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { contactSchema } from '@/schemas'
import { sendEmail, getContactEmailTemplate } from '@/lib/email'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const read = searchParams.get('read')

    const where = read !== null ? { read: read === 'true' } : {}

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contactMessage.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: messages,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = contactSchema.safeParse(body)
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      )

    const message = await prisma.contactMessage.create({ data: parsed.data })

    // Send email to company (non-blocking — won't fail the request)
    const company = await prisma.companyDetails.findFirst()
    if (company?.email) {
      sendEmail({
        to: company.email,
        subject: `New Contact Message: ${parsed.data.subject}`,
        html: getContactEmailTemplate(parsed.data),
      }).catch(console.error)
    }

    return NextResponse.json(
      { success: true, data: message, message: 'Message sent successfully' },
      { status: 201 },
    )
  } catch (error) {
    console.error('[CONTACT_POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send message' },
      { status: 500 },
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )

    const { id, read } = await req.json()
    const message = await prisma.contactMessage.update({
      where: { id },
      data: { read },
    })
    return NextResponse.json({ success: true, data: message })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update message' },
      { status: 500 },
    )
  }
}
