import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminProfileClient from './AdminProfileClient'

export const metadata = { title: 'Profile' }

export default async function AdminProfilePage() {
  const session = await auth()
  if (!session?.user) redirect('/auth/login')

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
    },
  })

  if (!user) redirect('/auth/login')

  const safeUser = {
    ...user,
    hasPassword: !!user.password,
    providers: user.accounts.map((a: { provider: string }) => a.provider),
    password: undefined,
    accounts: undefined,
  }

  return (
    <div className='space-y-6 max-w-2xl'>
      <div>
        <h1
          className='text-2xl font-bold'
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          MY PROFILE
        </h1>
        <p className='text-sm text-muted-foreground'>
          Manage your account information and security.
        </p>
      </div>
      <AdminProfileClient user={JSON.parse(JSON.stringify(safeUser))} />
    </div>
  )
}
