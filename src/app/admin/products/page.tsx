import prisma from '@/lib/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus} from 'lucide-react'
import ProductsTableClient from './ProductsTableClient'

export const metadata = { title: 'Products' }

export default async function AdminProductsPage() {
  const [products, categories, brandRows] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        _count: { select: { reviews: true, inquiries: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.product.findMany({
      where: { brand: { not: null } },
      select: { brand: true },
      distinct: ['brand'],
      orderBy: { brand: 'asc' },
    }),
  ])

  const brands = brandRows.flatMap((b: { brand: string | null }) =>
    b.brand ? [b.brand] : [],
  )

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1
            className='text-2xl font-bold'
            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            PRODUCTS
          </h1>
          <p className='text-sm text-muted-foreground'>
            {products.length} total products
          </p>
        </div>
        <Button asChild>
          <Link href='/admin/products/new'>
            <Plus className='mr-2 w-4 h-4' />
            Add Product
          </Link>
        </Button>
      </div>
      <ProductsTableClient
        initialProducts={JSON.parse(JSON.stringify(products))}
        categories={categories}
        brands={brands}
        total={products.length}
      />
    </div>
  )
}