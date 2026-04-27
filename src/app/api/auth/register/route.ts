import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { registerSchema } from '@/schemas'
import bcrypt from 'bcryptjs'
const Role = { ADMIN: 'ADMIN' as const, CUSTOMER: 'CUSTOMER' as const }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      )

    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing)
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 },
      )

    const hashed = await bcrypt.hash(password, 12)

    // First registered user becomes admin
    const userCount = await prisma.user.count()
    const role = userCount === 0 ? Role.ADMIN : Role.CUSTOMER

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json(
      { success: true, data: user, message: 'Account created successfully' },
      { status: 201 },
    )
  } catch (error) {
    console.error('[REGISTER_POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 },
    )
  }
}
