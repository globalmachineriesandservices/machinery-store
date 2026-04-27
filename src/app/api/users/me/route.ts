import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { changePasswordSchema } from '@/schemas'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user)
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        phone: true,
        address: true,
        createdAt: true,
        password: true, // expose only to check if credentials user
        accounts: { select: { provider: true } },
      },
    })

    if (!user)
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      )

    const { password, accounts, ...safeUser } = user
    return NextResponse.json({
      success: true,
      data: {
        ...safeUser,
        hasPassword: !!password,
        providers: accounts.map((a: { provider: string }) => a.provider),
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user)
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )

    const body = await req.json()
    const { action } = body

    if (action === 'change-password') {
      const parsed = changePasswordSchema.safeParse(body)
      if (!parsed.success)
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0].message },
          { status: 400 },
        )

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      })
      if (!user?.password)
        return NextResponse.json(
          { success: false, error: 'No password set for this account' },
          { status: 400 },
        )

      const isValid = await bcrypt.compare(
        parsed.data.currentPassword,
        user.password,
      )
      if (!isValid)
        return NextResponse.json(
          { success: false, error: 'Current password is incorrect' },
          { status: 400 },
        )

      const hashed = await bcrypt.hash(parsed.data.newPassword, 12)
      await prisma.user.update({
        where: { id: session.user.id },
        data: { password: hashed },
      })

      return NextResponse.json({
        success: true,
        message: 'Password changed successfully',
      })
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 },
    )
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 },
    )
  }
}
