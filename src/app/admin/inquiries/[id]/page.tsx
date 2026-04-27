import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Package,
  User,
  Calendar,
} from 'lucide-react'
import InquiryStatusUpdate from './InquiryStatusUpdate'

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: {
      product: { select: { name: true, slug: true, images: true } },
      user: { select: { name: true, email: true, image: true } },
    },
  })

  if (!inquiry) notFound()

  const statusVariant = (s: string) =>
    s === 'PENDING' ? 'warning' : s === 'REPLIED' ? 'success' : 'secondary'

  return (
    <div className='space-y-6 max-w-3xl'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='ghost' size='sm' asChild>
            <Link href='/admin/inquiries'>
              <ArrowLeft className='w-4 h-4 mr-1' />
              Back
            </Link>
          </Button>
          <div>
            <h1
              className='text-2xl font-bold'
              style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
            >
              INQUIRY DETAIL
            </h1>
            <p className='text-sm text-muted-foreground'>
              {formatDate(inquiry.createdAt)}
            </p>
          </div>
        </div>
        <Badge
          variant={
            statusVariant(inquiry.status) as 'warning' | 'success' | 'secondary'
          }
          className='text-sm px-3 py-1'
        >
          {inquiry.status}
        </Badge>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='md:col-span-2 space-y-4'>
          {/* Message */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Message</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm leading-relaxed whitespace-pre-line'>
                {inquiry.message}
              </p>
            </CardContent>
          </Card>

          {/* Product info */}
          {inquiry.product && (
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Product Requested</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center gap-3'>
                  {inquiry.product.images[0] && (
                    <img
                      src={inquiry.product.images[0]}
                      alt={inquiry.product.name}
                      className='w-14 h-14 rounded-lg object-cover border'
                    />
                  )}
                  <div>
                    <p className='font-medium'>{inquiry.product.name}</p>
                    <Button
                      variant='link'
                      size='sm'
                      className='p-0 h-auto'
                      asChild
                    >
                      <Link
                        href={`/products/${inquiry.product.slug}`}
                        target='_blank'
                      >
                        View product →
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className='space-y-4'>
          {/* Contact info */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Contact Info</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-sm'>
              <div className='flex items-center gap-2'>
                <User className='w-4 h-4 text-muted-foreground shrink-0' />
                <span className='font-medium'>{inquiry.name}</span>
              </div>
              <div className='flex items-center gap-2'>
                <Mail className='w-4 h-4 text-muted-foreground shrink-0' />
                <a
                  href={`mailto:${inquiry.email}`}
                  className='text-primary hover:underline'
                >
                  {inquiry.email}
                </a>
              </div>
              {inquiry.phone && (
                <div className='flex items-center gap-2'>
                  <Phone className='w-4 h-4 text-muted-foreground shrink-0' />
                  <span>{inquiry.phone}</span>
                </div>
              )}
              {inquiry.company && (
                <div className='flex items-center gap-2'>
                  <Building className='w-4 h-4 text-muted-foreground shrink-0' />
                  <span>{inquiry.company}</span>
                </div>
              )}
              <Separator />
              <div className='flex items-center gap-2'>
                <Calendar className='w-4 h-4 text-muted-foreground shrink-0' />
                <span className='text-muted-foreground'>
                  {formatDate(inquiry.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Status update */}
          <InquiryStatusUpdate
            inquiryId={inquiry.id}
            currentStatus={inquiry.status}
          />

          {/* Reply by email */}
          <Button className='w-full' asChild>
            <a
              href={`mailto:${inquiry.email}?subject=Re: Your inquiry about ${inquiry.product?.name || 'our products'}`}
            >
              <Mail className='w-4 h-4 mr-2' />
              Reply by Email
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
