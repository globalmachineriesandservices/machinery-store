import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import DashboardCharts from './components/DashboardCharts'
import {
  Package,
  Tag,
  Users,
  MessageSquare,
  Mail,
  CheckCircle2,
  ArrowRight,
  Clock,
  Star,
} from 'lucide-react'
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns'

export const metadata = { title: 'Dashboard' }

async function getDashboardData() {
  const now = new Date()

  const [
    totalProducts,
    totalCategories,
    totalUsers,
    totalInquiries,
    pendingInquiries,
    repliedInquiries,
    featuredProducts,
    unreadMessages,
    recentInquiries,
    recentProducts,
    // For charts
    inquiriesByStatus,
    productsByCategory,
    topProducts,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.user.count(),
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: 'PENDING' } }),
    prisma.inquiry.count({ where: { status: 'REPLIED' } }),
    prisma.product.count({ where: { featured: true } }),
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.inquiry.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { name: true, slug: true } } },
    }),
    prisma.product.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { category: { select: { name: true } } },
    }),
    // Inquiries by status for pie chart
    prisma.inquiry.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    // Products per category for bar chart
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    }),
    // Top products by inquiry count
    prisma.product.findMany({
      take: 6,
      orderBy: { inquiries: { _count: 'desc' } },
      include: {
        _count: { select: { inquiries: true, reviews: true } },
      },
    }),
  ])

  // Monthly trend — last 6 months
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = subMonths(now, 5 - i)
    return { date: d, label: format(d, 'MMM') }
  })

  const inquiryTrend = await Promise.all(
    months.map(async ({ date, label }) => {
      const start = startOfMonth(date)
      const end = endOfMonth(date)
      const [inquiries, messages] = await Promise.all([
        prisma.inquiry.count({
          where: { createdAt: { gte: start, lte: end } },
        }),
        prisma.contactMessage.count({
          where: { createdAt: { gte: start, lte: end } },
        }),
      ])
      return { month: label, inquiries, messages }
    }),
  )

  return {
    totalProducts,
    totalCategories,
    totalUsers,
    totalInquiries,
    pendingInquiries,
    repliedInquiries,
    featuredProducts,
    unreadMessages,
    recentInquiries,
    recentProducts,
    // Chart data
    inquiriesByStatus: inquiriesByStatus.map(
      (s: { status: string; _count: { status: number } }) => ({
        status: s.status,
        count: s._count.status,
      }),
    ),
    productsByCategory: productsByCategory.map(
      (c: { name: string; _count: { products: number } }) => ({
        category: c.name,
        count: c._count.products,
      }),
    ),
    inquiryTrend,
    topProducts: topProducts.map(
      (p: {
        name: string
        _count: { inquiries: number; reviews: number }
      }) => ({
        name: p.name,
        inquiries: p._count.inquiries,
        reviews: p._count.reviews,
      }),
    ),
  }
}

const statusVariant = (s: string) =>
  s === 'PENDING' ? 'warning' : s === 'REPLIED' ? 'success' : 'secondary'

export default async function AdminDashboard() {
  const data = await getDashboardData()

  const stats = [
    {
      label: 'Total Products',
      value: data.totalProducts,
      icon: Package,
      sub: `${data.featuredProducts} featured`,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/admin/products',
    },
    {
      label: 'Categories',
      value: data.totalCategories,
      icon: Tag,
      sub: 'Product categories',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      href: '/admin/categories',
    },
    {
      label: 'Customers',
      value: data.totalUsers,
      icon: Users,
      sub: 'Registered users',
      color: 'text-green-600',
      bg: 'bg-green-50',
      href: '/admin/customers',
    },
    {
      label: 'Inquiries',
      value: data.totalInquiries,
      icon: MessageSquare,
      sub: `${data.pendingInquiries} pending`,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      href: '/admin/inquiries',
    },
    {
      label: 'Unread Messages',
      value: data.unreadMessages,
      icon: Mail,
      sub: 'Contact messages',
      color: 'text-red-600',
      bg: 'bg-red-50',
      href: '/admin/messages',
    },
    {
      label: 'Replied',
      value: data.repliedInquiries,
      icon: CheckCircle2,
      sub: 'Inquiries handled',
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      href: '/admin/inquiries',
    },
  ]

  return (
    <div className='space-y-6'>
      <div>
        <h1
          className='text-2xl font-bold'
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: '0.01em',
          }}
        >
          DASHBOARD
        </h1>
        <p className='text-muted-foreground text-sm mt-1'>
          Welcome back. Here's what's happening.
        </p>
      </div>

      {/* Stats grid */}
      <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className='hover:shadow-md transition-shadow cursor-pointer'>
              <CardContent className='p-5'>
                <div className='flex items-start justify-between'>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      {stat.label}
                    </p>
                    <p
                      className='text-3xl font-bold mt-1'
                      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                    >
                      {stat.value}
                    </p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {stat.sub}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}
                  >
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <DashboardCharts
        inquiriesByStatus={data.inquiriesByStatus}
        productsByCategory={data.productsByCategory}
        inquiryTrend={data.inquiryTrend}
        topProducts={data.topProducts}
      />

      {/* Recent activity */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base'>Recent Inquiries</CardTitle>
              <Button variant='ghost' size='sm' asChild>
                <Link href='/admin/inquiries'>
                  View all <ArrowRight className='ml-1 w-3 h-3' />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            {data.recentInquiries.length === 0 ? (
              <p className='text-sm text-muted-foreground px-6 pb-6'>
                No inquiries yet.
              </p>
            ) : (
              <div className='divide-y'>
                {data.recentInquiries.map(
                  (inq: (typeof data.recentInquiries)[0]) => (
                    <Link key={inq.id} href={`/admin/inquiries/${inq.id}`}>
                      <div className='px-6 py-3 hover:bg-muted/50 transition-colors'>
                        <div className='flex items-start justify-between gap-2'>
                          <div className='min-w-0'>
                            <p className='text-sm font-medium truncate'>
                              {inq.name}
                            </p>
                            <p className='text-xs text-muted-foreground truncate'>
                              {inq.product?.name || 'General inquiry'}
                            </p>
                          </div>
                          <div className='flex flex-col items-end gap-1 flex-shrink-0'>
                            <Badge
                              variant={
                                statusVariant(inq.status) as
                                  | 'warning'
                                  | 'success'
                                  | 'secondary'
                              }
                              className='text-xs'
                            >
                              {inq.status}
                            </Badge>
                            <span className='text-xs text-muted-foreground flex items-center gap-1'>
                              <Clock className='w-3 h-3' />
                              {formatDate(inq.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ),
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-base'>Recent Products</CardTitle>
              <Button variant='ghost' size='sm' asChild>
                <Link href='/admin/products'>
                  View all <ArrowRight className='ml-1 w-3 h-3' />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className='p-0'>
            {data.recentProducts.length === 0 ? (
              <p className='text-sm text-muted-foreground px-6 pb-6'>
                No products yet.
              </p>
            ) : (
              <div className='divide-y'>
                {data.recentProducts.map(
                  (product: (typeof data.recentProducts)[0]) => (
                    <Link
                      key={product.id}
                      href={`/admin/products/${product.id}`}
                    >
                      <div className='px-6 py-3 hover:bg-muted/50 transition-colors'>
                        <div className='flex items-center justify-between gap-2'>
                          <div className='min-w-0'>
                            <p className='text-sm font-medium truncate'>
                              {product.name}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {product.category.name}
                            </p>
                          </div>
                          <div className='flex items-center gap-2 flex-shrink-0'>
                            {product.featured && (
                              <Badge variant='warning' className='text-xs'>
                                <Star className='w-2.5 h-2.5 mr-1' />
                                Featured
                              </Badge>
                            )}
                            <Badge
                              variant={
                                product.inStock ? 'success' : 'destructive'
                              }
                              className='text-xs'
                            >
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ),
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap gap-3'>
            <Button asChild>
              <Link href='/admin/products/new'>
                <Package className='mr-2 w-4 h-4' />
                Add Product
              </Link>
            </Button>
            <Button variant='outline' asChild>
              <Link href='/admin/categories'>
                <Tag className='mr-2 w-4 h-4' />
                Manage Categories
              </Link>
            </Button>
            <Button variant='outline' asChild>
              <Link href='/admin/faqs/new'>
                <MessageSquare className='mr-2 w-4 h-4' />
                Add FAQ
              </Link>
            </Button>
            <Button variant='outline' asChild>
              <Link href='/admin/company'>
                <Star className='mr-2 w-4 h-4' />
                Company Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
