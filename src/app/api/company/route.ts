import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { companySchema } from '@/schemas'

export async function GET() {
  try {
    const company = await prisma.companyDetails.findFirst()
    return NextResponse.json({ success: true, data: company })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch company details' },
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
    const parsed = companySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      )
    }

    const data = {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address: parsed.data.address,
      description: parsed.data.description ?? null,
      logo: parsed.data.logo ?? null,
      website: parsed.data.website ?? null,
      facebook: parsed.data.facebook ?? null,
      instagram: parsed.data.instagram ?? null,
      tiktok: parsed.data.tiktok ?? null,
      whatsApp: parsed.data.whatsApp ?? null,
      twitter: parsed.data.twitter ?? null,
    }

    const existing = await prisma.companyDetails.findFirst()
    const company = existing
      ? await prisma.companyDetails.update({ where: { id: existing.id }, data })
      : await prisma.companyDetails.create({ data })

    return NextResponse.json({ success: true, data: company })
  } catch (error) {
    console.error('[COMPANY_POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save company details' },
      { status: 500 },
    )
  }
}

export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )

    const existing = await prisma.companyDetails.findFirst()
    if (existing)
      await prisma.companyDetails.delete({ where: { id: existing.id } })

    return NextResponse.json({
      success: true,
      message: 'Company details removed',
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete company details' },
      { status: 500 },
    )
  }
}
