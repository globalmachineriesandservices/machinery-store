import prisma from '@/lib/prisma'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import InquiriesClient from './InquiriesClient'

export const metadata = { title: 'Inquiries' }

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const sp = await searchParams
  const page = parseInt(sp.page || '1')
  const limit = 20
  const status = sp.status || ''

  const where = status ? { status } : {}

  const [inquiries, total, pendingCount, repliedCount, closedCount] =
    await Promise.all([
      prisma.inquiry.findMany({
        where,
        include: {
          product: { select: { name: true, slug: true } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inquiry.count({ where }),
      prisma.inquiry.count({ where: { status: 'PENDING' } }),
      prisma.inquiry.count({ where: { status: 'REPLIED' } }),
      prisma.inquiry.count({ where: { status: 'CLOSED' } }),
    ])

  return (
    <div className='space-y-6'>
      <div>
        <h1
          className='text-2xl font-bold'
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          INQUIRIES
        </h1>
        <p className='text-sm text-muted-foreground'>{total} total inquiries</p>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        {[
          {
            label: 'Pending',
            count: pendingCount,
            color: 'text-amber-600 bg-amber-50',
            status: 'PENDING',
          },
          {
            label: 'Replied',
            count: repliedCount,
            color: 'text-green-600 bg-green-50',
            status: 'REPLIED',
          },
          {
            label: 'Closed',
            count: closedCount,
            color: 'text-gray-600 bg-gray-50',
            status: 'CLOSED',
          },
        ].map((s) => (
          <Card
            key={s.status}
            className='cursor-pointer hover:shadow-md transition-shadow'
          >
            <CardContent className='p-4'>
              <p className='text-sm text-muted-foreground'>{s.label}</p>
              <p
                className='text-3xl font-bold mt-1'
                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                {s.count}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <InquiriesClient
        initialInquiries={JSON.parse(JSON.stringify(inquiries))}
        total={total}
        page={page}
        limit={limit}
        totalPages={Math.ceil(total / limit)}
      />
    </div>
  )
}
