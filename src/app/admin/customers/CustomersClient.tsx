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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import DeleteDialog from '@/components/admin/DeleteDialog'
import {
  DataTable,
  ColumnDef,
  SortableHeader,
  selectionColumn,
} from '@/components/admin/DataTable'
import { Eye, Users, Trash2 } from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  phone: string | null
  createdAt: string
  _count: { inquiries: number; reviews: number }
}

interface Props {
  initialUsers: User[]
}

export default function CustomersClient({ initialUsers }: Props) {
  const router = useRouter()
  const [users, setUsers] = useState(initialUsers)
  const [selected, setSelected] = useState<User[]>([])
  const [roleFilter, setRoleFilter] = useState('all')

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      setUsers((prev) => prev.filter((u) => u.id !== id))
      toast.success('User deleted')
      router.refresh()
    } else {
      toast.error(data.error)
    }
  }

  const filtered =
    roleFilter === 'all' ? users : users.filter((u) => u.role === roleFilter)

  const columns: ColumnDef<User>[] = [
    selectionColumn<User>(),
    {
      id: 'user',
      accessorFn: (row) => row.name || row.email,
      header: ({ column }) => (
        <SortableHeader column={column}>User</SortableHeader>
      ),
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <Avatar className='h-8 w-8 flex-shrink-0'>
            <AvatarImage src={row.original.image || ''} />
            <AvatarFallback className='text-xs bg-primary text-primary-foreground'>
              {row.original.name?.[0]?.toUpperCase() ||
                row.original.email[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0'>
            <p className='font-medium text-sm truncate'>
              {row.original.name || '—'}
            </p>
            <p className='text-xs text-muted-foreground truncate'>
              {row.original.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'role',
      accessorKey: 'role',
      header: ({ column }) => (
        <SortableHeader column={column}>Role</SortableHeader>
      ),
      cell: ({ getValue }) => (
        <Badge
          variant={(getValue() as string) === 'ADMIN' ? 'default' : 'secondary'}
          className='text-xs'
        >
          {getValue() as string}
        </Badge>
      ),
      size: 90,
    },
    {
      id: 'phone',
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ getValue }) => (
        <span className='text-sm text-muted-foreground'>
          {(getValue() as string | null) || '—'}
        </span>
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
        <SortableHeader column={column}>Joined</SortableHeader>
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
            <Link href={`/admin/customers/${row.original.id}`}>
              <Eye className='w-3.5 h-3.5' />
            </Link>
          </Button>
          <DeleteDialog
            title='Delete User'
            description={`Permanently delete ${row.original.name || row.original.email}? This will remove all their data.`}
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
      <Select value={roleFilter} onValueChange={setRoleFilter}>
        <SelectTrigger className='h-9 w-36 text-sm'>
          <SelectValue placeholder='All Roles' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Roles</SelectItem>
          <SelectItem value='ADMIN'>Admin</SelectItem>
          <SelectItem value='CUSTOMER'>Customer</SelectItem>
        </SelectContent>
      </Select>
      {selected.length > 0 && (
        <DeleteDialog
          title={`Delete ${selected.length} Users`}
          description={`Permanently delete ${selected.length} selected users and all their data?`}
          onConfirm={async () => {
            for (const u of selected) await handleDelete(u.id)
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
      searchColumn='user'
      searchPlaceholder='Search by name or email...'
      toolbar={toolbar}
      onSelectionChange={setSelected}
      emptyState={
        <div className='flex flex-col items-center gap-2 text-muted-foreground'>
          <Users className='w-10 h-10 opacity-20' />
          <p>No users found</p>
        </div>
      }
    />
  )
}
