import prisma from '@/lib/prisma'
import CategoriesClient from './CategoriesClient'

export const metadata = { title: 'Categories' }

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: [{ active: 'desc' }, { name: 'asc' }],
  })

  return (
    <div className='space-y-6'>
      <div>
        <h1
          className='text-2xl font-bold'
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          CATEGORIES
        </h1>
        <p className='text-sm text-muted-foreground'>
          {categories.filter((c: { active: boolean }) => c.active).length}{' '}
          active ·{' '}
          {categories.filter((c: { active: boolean }) => !c.active).length}{' '}
          hidden
        </p>
      </div>
      <CategoriesClient
        initialCategories={JSON.parse(JSON.stringify(categories))}
      />
    </div>
  )
}
