import prisma from '@/lib/prisma'
import MessagesClient from './MessagesClient'

export const metadata = { title: 'Messages' }

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; read?: string }>
}) {
  const sp = await searchParams
  const page = parseInt(sp.page || '1')
  const limit = 20
  const readFilter = sp.read

  const where = readFilter !== undefined ? { read: readFilter === 'true' } : {}

  const [messages, total, unreadCount] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count({ where: { read: false } }),
  ])

  return (
    <div className='space-y-6'>
      <div>
        <h1
          className='text-2xl font-bold'
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          MESSAGES
        </h1>
        <p className='text-sm text-muted-foreground'>
          {unreadCount} unread · {total} total
        </p>
      </div>
      <MessagesClient
        initialMessages={JSON.parse(JSON.stringify(messages))}
        total={total}
        page={page}
        limit={limit}
        totalPages={Math.ceil(total / limit)}
      />
    </div>
  )
}
