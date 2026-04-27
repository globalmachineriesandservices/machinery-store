'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import { Eye, MessageSquare, Trash2 } from 'lucide-react'

interface Inquiry {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  message: string
  status: string
  product: { name: string; slug: string } | null
  createdAt: string
}

const statusVariant = (s: string) =>
  s === 'PENDING' ? 'warning' : s === 'REPLIED' ? 'success' : 'secondary'

interface Props {
  initialInquiries: Inquiry[]
}

export default function InquiriesClient({ initialInquiries }: Props) {
  const router = useRouter()
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [selected, setSelected] = useState<Inquiry[]>([])
  const [statusFilter, setStatusFilter] = useState('all')

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/inquiries/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      setInquiries((prev) => prev.filter((i) => i.id !== id))
      toast.success('Inquiry deleted')
      router.refresh()
    } else toast.error(data.error)
  }

  const filtered =
    statusFilter === 'all'
      ? inquiries
      : inquiries.filter((i) => i.status === statusFilter)

  const columns: ColumnDef<Inquiry>[] = [
    selectionColumn<Inquiry>(),
    {
      id: 'from',
      accessorKey: 'name',
      header: ({ column }) => (
        <SortableHeader column={column}>From</SortableHeader>
      ),
      cell: ({ row }) => (
        <div>
          <p className='font-medium text-sm'>{row.original.name}</p>
          <p className='text-xs text-muted-foreground'>{row.original.email}</p>
          {row.original.company && (
            <p className='text-xs text-muted-foreground'>
              {row.original.company}
            </p>
          )}
        </div>
      ),
    },
    {
      id: 'product',
      accessorFn: (row) => row.product?.name || 'General',
      header: ({ column }) => (
        <SortableHeader column={column}>Product</SortableHeader>
      ),
      cell: ({ row }) =>
        row.original.product ? (
          <Link
            href={`/products/${row.original.product.slug}`}
            target='_blank'
            className='text-sm text-primary hover:underline truncate max-w-[160px] block'
          >
            {row.original.product.name}
          </Link>
        ) : (
          <span className='text-sm text-muted-foreground'>General</span>
        ),
    },
    {
      id: 'message',
      accessorKey: 'message',
      header: 'Message',
      cell: ({ getValue }) => (
        <p className='text-sm text-muted-foreground line-clamp-2 max-w-[200px]'>
          {getValue() as string}
        </p>
      ),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: ({ column }) => (
        <SortableHeader column={column}>Status</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <Badge
          variant={
            statusVariant(getValue() as string) as
              | 'warning'
              | 'success'
              | 'secondary'
          }
          className='text-xs'
        >
          {getValue() as string}
        </Badge>
      ),
      size: 100,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <SortableHeader column={column}>Date</SortableHeader>
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
            <Link href={`/admin/inquiries/${row.original.id}`}>
              <Eye className='w-3.5 h-3.5' />
            </Link>
          </Button>
          <DeleteDialog
            title='Delete Inquiry'
            description={`Delete inquiry from "${row.original.name}"?`}
            onConfirm={() => handleDelete(row.original.id)}
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 80,
    },
  ]

  const toolbar = (
    <>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className='h-9 w-36 text-sm'>
          <SelectValue placeholder='All Status' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Status</SelectItem>
          <SelectItem value='PENDING'>Pending</SelectItem>
          <SelectItem value='REPLIED'>Replied</SelectItem>
          <SelectItem value='CLOSED'>Closed</SelectItem>
        </SelectContent>
      </Select>
      {selected.length > 0 && (
        <DeleteDialog
          title={`Delete ${selected.length} Inquiries`}
          description={`Permanently delete ${selected.length} selected inquiries?`}
          onConfirm={async () => {
            for (const i of selected) await handleDelete(i.id)
            setSelected([])
          }}
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
      searchColumn='from'
      searchPlaceholder='Search by name or email...'
      toolbar={toolbar}
      onSelectionChange={setSelected}
      emptyState={
        <div className='flex flex-col items-center gap-2 text-muted-foreground'>
          <MessageSquare className='w-10 h-10 opacity-20' />
          <p>No inquiries found</p>
        </div>
      }
    />
  )
}
