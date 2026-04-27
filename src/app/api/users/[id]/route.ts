import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { profileUpdateSchema } from '@/schemas'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user)
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )

    const { id } = await params
    if (session.user.role !== 'ADMIN' && session.user.id !== id)
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      )

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
        _count: { select: { inquiries: true, reviews: true } },
      },
    })

    if (!user)
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      )
    return NextResponse.json({ success: true, data: user })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 },
    )
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await auth()
    if (!session?.user)
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )

    const { id } = await params
    if (session.user.role !== 'ADMIN' && session.user.id !== id)
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      )

    const body = await req.json()

    // Admins can also change roles
    if (session.user.role === 'ADMIN' && body.role) {
      const user = await prisma.user.update({
        where: { id },
        data: { role: body.role },
        select: { id: true, name: true, email: true, role: true },
      })
      return NextResponse.json({ success: true, data: user })
    }

    const parsed = profileUpdateSchema.safeParse(body)
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      )

    const user = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, data: user })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
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
    if (session.user.id === id)
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 },
      )

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true, message: 'User deleted' })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 },
    )
  }
}
