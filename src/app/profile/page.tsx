import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ProfileClient from './ProfileClient'

export const metadata = { title: 'My Profile' }

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login?callbackUrl=/profile')

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
      password: true,
      accounts: { select: { provider: true } },
      inquiries: {
        include: {
          product: { select: { name: true, slug: true, images: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      reviews: {
        include: { product: { select: { name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!user) redirect('/auth/login')

  const safeUser = {
    ...user,
    hasPassword: !!user.password,
    providers: user.accounts.map((a) => a.provider),
    password: undefined,
    accounts: undefined,
  }

  return <ProfileClient user={JSON.parse(JSON.stringify(safeUser))} />
}
