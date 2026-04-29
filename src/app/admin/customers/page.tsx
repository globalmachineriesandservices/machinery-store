import prisma from '@/lib/prisma'
import CustomersClient from './CustomersClient'

export const metadata = { title: 'Customers' }

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const sp = await searchParams
  const page = parseInt(sp.page || '1')
  const limit = 20
  const search = sp.search || ''

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        phone: true,
        createdAt: true,
        _count: { select: { inquiries: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return (
    <div className='space-y-6'>
      <div>
        <h1
          className='text-2xl font-bold'
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          CUSTOMERS
        </h1>
        <p className='text-sm text-muted-foreground'>
          {total} registered users
        </p>
      </div>
      <CustomersClient
        initialUsers={JSON.parse(JSON.stringify(users))}
      />
    </div>
  )
}
