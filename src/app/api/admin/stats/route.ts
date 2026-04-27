import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      )

    const [
      totalProducts,
      totalCategories,
      totalUsers,
      totalInquiries,
      pendingInquiries,
      recentInquiries,
      featuredProducts,
      unreadMessages,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.user.count(),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: 'PENDING' } }),
      prisma.inquiry.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { name: true, slug: true } } },
      }),
      prisma.product.count({ where: { featured: true } }),
      prisma.contactMessage.count({ where: { read: false } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        totalCategories,
        totalUsers,
        totalInquiries,
        pendingInquiries,
        recentInquiries,
        featuredProducts,
        unreadMessages,
      },
    })
  } catch (error) {
    console.error('[ADMIN_STATS]', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 },
    )
  }
}
