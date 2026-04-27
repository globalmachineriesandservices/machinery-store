import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Star,
  Calendar,
} from 'lucide-react'

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      inquiries: {
        include: { product: { select: { name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      reviews: {
        include: { product: { select: { name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { inquiries: true, reviews: true } },
    },
  })

  if (!user) notFound()

  return (
    <div className='space-y-6 max-w-4xl'>
      <div className='flex items-center gap-3'>
        <Button variant='ghost' size='sm' asChild>
          <Link href='/admin/customers'>
            <ArrowLeft className='w-4 h-4 mr-1' />
            Back
          </Link>
        </Button>
        <h1
          className='text-2xl font-bold'
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          CUSTOMER PROFILE
        </h1>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* Profile card */}
        <div className='space-y-4'>
          <Card>
            <CardContent className='p-6 text-center'>
              <Avatar className='h-20 w-20 mx-auto mb-3'>
                <AvatarImage src={user.image || ''} />
                <AvatarFallback className='text-2xl bg-primary text-primary-foreground'>
                  {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className='font-semibold'>{user.name || '—'}</p>
              <p className='text-sm text-muted-foreground'>{user.email}</p>
              <Badge
                variant={user.role === 'ADMIN' ? 'default' : 'secondary'}
                className='mt-2'
              >
                {user.role}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-sm'>Contact</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Mail className='w-3.5 h-3.5' />
                <span className='truncate'>{user.email}</span>
              </div>
              {user.phone && (
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <Phone className='w-3.5 h-3.5' />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.address && (
                <div className='flex items-center gap-2 text-muted-foreground'>
                  <MapPin className='w-3.5 h-3.5' />
                  <span>{user.address}</span>
                </div>
              )}
              <div className='flex items-center gap-2 text-muted-foreground'>
                <Calendar className='w-3.5 h-3.5' />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          <div className='grid grid-cols-2 gap-3'>
            <Card>
              <CardContent className='p-4 text-center'>
                <p
                  className='text-2xl font-bold'
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {user._count.inquiries}
                </p>
                <p className='text-xs text-muted-foreground'>Inquiries</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-4 text-center'>
                <p
                  className='text-2xl font-bold'
                  style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                >
                  {user._count.reviews}
                </p>
                <p className='text-xs text-muted-foreground'>Reviews</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Activity */}
        <div className='md:col-span-2 space-y-4'>
          {/* Inquiries */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <MessageSquare className='w-4 h-4' />
                Inquiries
              </CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              {user.inquiries.length === 0 ? (
                <p className='text-sm text-muted-foreground p-6'>
                  No inquiries yet.
                </p>
              ) : (
                <div className='divide-y'>
                  {user.inquiries.map((inq: (typeof user.inquiries)[0]) => (
                    <Link key={inq.id} href={`/admin/inquiries/${inq.id}`}>
                      <div className='px-6 py-3 hover:bg-muted/50 transition-colors flex items-center justify-between'>
                        <div>
                          <p className='text-sm font-medium'>
                            {inq.product?.name || 'General inquiry'}
                          </p>
                          <p className='text-xs text-muted-foreground line-clamp-1'>
                            {inq.message}
                          </p>
                        </div>
                        <div className='text-right flex-shrink-0 ml-3'>
                          <Badge
                            variant={
                              inq.status === 'PENDING'
                                ? 'warning'
                                : inq.status === 'REPLIED'
                                  ? 'success'
                                  : 'secondary'
                            }
                            className='text-xs'
                          >
                            {inq.status}
                          </Badge>
                          <p className='text-xs text-muted-foreground mt-1'>
                            {formatDate(inq.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader className='pb-3'>
              <CardTitle className='text-base flex items-center gap-2'>
                <Star className='w-4 h-4' />
                Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className='p-0'>
              {user.reviews.length === 0 ? (
                <p className='text-sm text-muted-foreground p-6'>
                  No reviews yet.
                </p>
              ) : (
                <div className='divide-y'>
                  {user.reviews.map((rev: (typeof user.reviews)[0]) => (
                    <div key={rev.id} className='px-6 py-3'>
                      <div className='flex items-start justify-between gap-3'>
                        <div>
                          <Link
                            href={`/products/${rev.product.slug}`}
                            className='text-sm font-medium hover:underline text-primary'
                          >
                            {rev.product.name}
                          </Link>
                          <div className='flex items-center gap-1 mt-0.5'>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`}
                              />
                            ))}
                          </div>
                          <p className='text-xs text-muted-foreground mt-1 line-clamp-2'>
                            {rev.comment}
                          </p>
                        </div>
                        <span className='text-xs text-muted-foreground flex-shrink-0'>
                          {formatDate(rev.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
