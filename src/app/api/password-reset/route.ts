import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { forgotPasswordSchema, resetPasswordSchema } from '@/schemas'
import { sendEmail, getPasswordResetTemplate } from '@/lib/email'
import { generateToken } from '@/lib/utils'
import bcrypt from 'bcryptjs'

// POST /api/password-reset — request reset link
// PATCH /api/password-reset — confirm reset with token + new password
// GET /api/password-reset?token=xxx — validate token

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = forgotPasswordSchema.safeParse(body)
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      )

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If that email exists, a reset link has been sent.',
      })
    }

    // Invalidate any existing tokens for this user
    await prisma.passwordReset.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    })

    const token = generateToken()
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordReset.create({
      data: { token, userId: user.id, expires },
    })

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

    await sendEmail({
      to: user.email!,
      subject: 'Reset your password — MachineryStore',
      html: getPasswordResetTemplate({
        name: user.name || 'User',
        resetUrl,
      }),
    })

    return NextResponse.json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    })
  } catch (error) {
    console.error('[PASSWORD_RESET_POST]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token)
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 },
      )

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: { user: { select: { email: true, name: true } } },
    })

    if (!resetRecord || resetRecord.used || resetRecord.expires < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Token is invalid or has expired' },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      data: { email: resetRecord.user.email, valid: true },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to validate token' },
      { status: 500 },
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, ...passwordData } = body

    if (!token)
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 },
      )

    const parsed = resetPasswordSchema.safeParse(passwordData)
    if (!parsed.success)
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      )

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
    })

    if (!resetRecord || resetRecord.used || resetRecord.expires < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Token is invalid or has expired' },
        { status: 400 },
      )
    }

    const hashed = await bcrypt.hash(parsed.data.password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { password: hashed },
      }),
      prisma.passwordReset.update({
        where: { token },
        data: { used: true },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
    })
  } catch (error) {
    console.error('[PASSWORD_RESET_PATCH]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 },
    )
  }
}
