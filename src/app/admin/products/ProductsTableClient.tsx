'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DeleteDialog from '@/components/admin/DeleteDialog'
import {
  DataTable,
  ColumnDef,
  SortableHeader,
  selectionColumn,
} from '@/components/admin/DataTable'
import { Pencil, Eye, Star, ImageIcon, Package, Trash2 } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  images: string[]
  featured: boolean
  inStock: boolean
  brand: string | null
  category: { name: string }
  createdAt: string
  _count: { reviews: number; inquiries: number }
}

interface Category {
  id: string
  name: string
}

interface Props {
  initialProducts: Product[]
  categories: Category[]
  brands: string[]
  total: number
}

export default function ProductsTableClient({
  initialProducts,
  categories,
  brands,
}: Props) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [selected, setSelected] = useState<Product[]>([])
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
      toast.success('Product deleted')
      router.refresh()
    } else {
      toast.error(data.error)
    }
  }

  const handleBulkDelete = async () => {
    for (const p of selected) await handleDelete(p.id)
    setSelected([])
  }

  // Client-side multi-filter
  const filtered = products.filter((p) => {
    if (categoryFilter !== 'all' && p.category.name !== categoryFilter)
      return false
    if (brandFilter !== 'all' && p.brand !== brandFilter) return false
    if (stockFilter === 'instock' && !p.inStock) return false
    if (stockFilter === 'outofstock' && p.inStock) return false
    return true
  })

  const columns: ColumnDef<Product>[] = [
    selectionColumn<Product>(),
    {
      id: 'product',
      accessorKey: 'name',
      header: ({ column }) => (
        <SortableHeader column={column}>Product</SortableHeader>
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-md overflow-hidden bg-muted flex items-center justify-center border flex-shrink-0'>
            {row.original.images[0] ? (
              <Image
                src={row.original.images[0]}
                alt={row.original.name}
                width={40}
                height={40}
                className='object-cover w-full h-full'
              />
            ) : (
              <ImageIcon className='w-4 h-4 text-muted-foreground' />
            )}
          </div>
          <div className='min-w-0'>
            <p className='font-medium text-sm truncate max-w-[180px]'>
              {row.original.name}
            </p>
            {row.original.featured && (
              <span className='text-xs text-amber-500 flex items-center gap-0.5'>
                <Star className='w-3 h-3 fill-current' /> Featured
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'category',
      accessorFn: (row) => row.category.name,
      header: ({ column }) => (
        <SortableHeader column={column}>Category</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <span className='text-sm text-muted-foreground'>
          {getValue() as string}
        </span>
      ),
    },
    {
      id: 'brand',
      accessorKey: 'brand',
      header: ({ column }) => (
        <SortableHeader column={column}>Brand</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <span className='text-sm text-muted-foreground'>
          {(getValue() as string | null) || '—'}
        </span>
      ),
    },
    {
      id: 'status',
      accessorKey: 'inStock',
      header: ({ column }) => (
        <SortableHeader column={column}>Stock</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <Badge
          variant={(getValue() as boolean) ? 'success' : 'destructive'}
          className='text-xs'
        >
          {(getValue() as boolean) ? 'In Stock' : 'Out of Stock'}
        </Badge>
      ),
    },
    {
      id: 'inquiries',
      accessorFn: (row) => row._count.inquiries,
      header: ({ column }) => (
        <SortableHeader column={column}>Inquiries</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <span className='text-sm'>{getValue() as number}</span>
      ),
      size: 90,
    },
    {
      id: 'reviews',
      accessorFn: (row) => row._count.reviews,
      header: ({ column }) => (
        <SortableHeader column={column}>Reviews</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <span className='text-sm'>{getValue() as number}</span>
      ),
      size: 80,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <SortableHeader column={column}>Added</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <span className='text-xs text-muted-foreground'>
          {formatDate(getValue() as string)}
        </span>
      ),
      size: 100,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className='flex items-center gap-1'>
          <Button variant='ghost' size='icon' className='h-7 w-7' asChild>
            <Link
              href={`/products/${row.original.slug}`}
              target='_blank'
              title='View on site'
            >
              <Eye className='w-3.5 h-3.5' />
            </Link>
          </Button>
          <Button variant='ghost' size='icon' className='h-7 w-7' asChild>
            <Link href={`/admin/products/${row.original.id}/edit`} title='Edit'>
              <Pencil className='w-3.5 h-3.5' />
            </Link>
          </Button>
          <DeleteDialog
            title='Delete Product'
            description={`Permanently delete "${row.original.name}"? This will also remove all inquiries and reviews.`}
            onConfirm={() => handleDelete(row.original.id)}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 100,
    },
  ]

  const toolbar = (
    <>
      {/* Category filter */}
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className='h-9 w-44 text-sm'>
          <SelectValue placeholder='All Categories' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.name}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Brand filter */}
      {brands.length > 0 && (
        <Select value={brandFilter} onValueChange={setBrandFilter}>
          <SelectTrigger className='h-9 w-36 text-sm'>
            <SelectValue placeholder='All Brands' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Brands</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Stock filter */}
      <Select value={stockFilter} onValueChange={setStockFilter}>
        <SelectTrigger className='h-9 w-36 text-sm'>
          <SelectValue placeholder='All Stock' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Stock</SelectItem>
          <SelectItem value='instock'>In Stock</SelectItem>
          <SelectItem value='outofstock'>Out of Stock</SelectItem>
        </SelectContent>
      </Select>

      {/* Bulk delete */}
      {selected.length > 0 && (
        <DeleteDialog
          title={`Delete ${selected.length} Products`}
          description={`Permanently delete ${selected.length} selected products and all their data?`}
          onConfirm={handleBulkDelete}
          trigger={
            <Button variant='destructive' size='sm' className='h-9 gap-1.5'>
              <Trash2 className='w-3.5 h-3.5' />
              Delete {selected.length}
            </Button>
          }
        />
      )}
    </>
  )

  return (
    <DataTable
      columns={columns}
      data={filtered}
      searchColumn='product'
      searchPlaceholder='Search products...'
      toolbar={toolbar}
      onSelectionChange={setSelected}
      emptyState={
        <div className='flex flex-col items-center gap-2 text-muted-foreground'>
          <Package className='w-10 h-10 opacity-20' />
          <p>No products found</p>
        </div>
      }
    />
  )
}
