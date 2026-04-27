'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  Mail,
  MailOpen,
  ChevronLeft,
  ChevronRight,
  Phone,
  Inbox,
} from 'lucide-react'

interface Message {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  read: boolean
  createdAt: string
}

interface Props {
  initialMessages: Message[]
  total: number
  page: number
  limit: number
  totalPages: number
}

type TabValue = 'all' | 'unread' | 'read'

export default function MessagesClient({
  initialMessages,
  total,
  page,
  limit,
  totalPages,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Local read-state overrides — keyed by message id.
  // When a user opens a message, we mark it read locally immediately
  // without needing to re-derive the whole list from props.
  const [readOverrides, setReadOverrides] = useState<Record<string, boolean>>(
    {},
  )
  const [selected, setSelected] = useState<Message | null>(null)

  // Merge server messages with local overrides
  const allMessages: Message[] = initialMessages.map((m) =>
    readOverrides[m.id] !== undefined ? { ...m, read: readOverrides[m.id] } : m,
  )

  // Active tab from URL
  const readParam = searchParams.get('read')
  const activeTab: TabValue =
    readParam === 'false' ? 'unread' : readParam === 'true' ? 'read' : 'all'

  // Client-side filter for instant tab feedback
  const visibleMessages = allMessages.filter((m) => {
    if (activeTab === 'unread') return !m.read
    if (activeTab === 'read') return m.read
    return true
  })

  const setTab = (tab: TabValue) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    if (tab === 'all') params.delete('read')
    else if (tab === 'unread') params.set('read', 'false')
    else params.set('read', 'true')
    router.push(`${pathname}?${params.toString()}`)
  }

  const markRead = async (msg: Message) => {
    const isAlreadyRead = readOverrides[msg.id] ?? msg.read
    if (!isAlreadyRead) {
      try {
        await fetch('/api/contact', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: msg.id, read: true }),
        })
        setReadOverrides((prev) => ({ ...prev, [msg.id]: true }))
      } catch {
        toast.error('Failed to mark as read')
      }
    }
    setSelected({ ...msg, read: true })
  }

  const unreadCount = allMessages.filter((m) => !m.read).length
  const readCount = allMessages.filter((m) => m.read).length

  return (
    <>
      {/* ── Tab bar ── */}
      <div className='flex items-center gap-1 p-1 bg-muted rounded-lg w-fit'>
        {(['all', 'unread', 'read'] as TabValue[]).map((tab) => {
          const label =
            tab === 'all'
              ? `All (${allMessages.length})`
              : tab === 'unread'
                ? `Unread (${unreadCount})`
                : `Read (${readCount})`
          return (
            <button
              key={tab}
              onClick={() => setTab(tab)}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                activeTab === tab
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* ── Message list ── */}
      <div className='space-y-2 mt-4'>
        {visibleMessages.length === 0 ? (
          <div className='flex flex-col items-center py-16 text-muted-foreground border-2 border-dashed rounded-xl'>
            <Inbox className='w-12 h-12 mb-3 opacity-20' />
            <p className='text-sm'>
              {activeTab === 'unread'
                ? 'No unread messages'
                : activeTab === 'read'
                  ? 'No read messages'
                  : 'No messages yet'}
            </p>
          </div>
        ) : (
          visibleMessages.map((msg) => (
            <Card
              key={msg.id}
              className={cn(
                'cursor-pointer hover:shadow-md transition-all',
                !msg.read && 'border-l-4 border-l-primary bg-primary/5',
              )}
              onClick={() => markRead(msg)}
            >
              <CardContent className='p-4'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='flex items-start gap-3 min-w-0'>
                    <div className='mt-0.5 flex-shrink-0'>
                      {msg.read ? (
                        <MailOpen className='w-4 h-4 text-muted-foreground' />
                      ) : (
                        <Mail className='w-4 h-4 text-primary' />
                      )}
                    </div>
                    <div className='min-w-0'>
                      <div className='flex items-center gap-2 flex-wrap'>
                        <p
                          className={cn(
                            'text-sm',
                            !msg.read && 'font-semibold',
                          )}
                        >
                          {msg.name}
                        </p>
                        <span className='text-xs text-muted-foreground hidden sm:block'>
                          ·
                        </span>
                        <p className='text-xs text-muted-foreground hidden sm:block truncate'>
                          {msg.email}
                        </p>
                      </div>
                      <p
                        className={cn(
                          'text-sm truncate',
                          !msg.read ? 'font-medium' : 'text-muted-foreground',
                        )}
                      >
                        {msg.subject}
                      </p>
                      <p className='text-xs text-muted-foreground line-clamp-1 mt-0.5'>
                        {msg.message}
                      </p>
                    </div>
                  </div>
                  <div className='flex flex-col items-end gap-1.5 flex-shrink-0'>
                    {!msg.read && <Badge className='text-xs'>New</Badge>}
                    <span className='text-xs text-muted-foreground whitespace-nowrap'>
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between mt-4'>
          <p className='text-sm text-muted-foreground'>
            {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => {
                const p = new URLSearchParams(searchParams.toString())
                p.set('page', String(page - 1))
                router.push(`${pathname}?${p.toString()}`)
              }}
            >
              <ChevronLeft className='w-4 h-4' />
            </Button>
            <span className='text-sm'>
              {page} / {totalPages}
            </span>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= totalPages}
              onClick={() => {
                const p = new URLSearchParams(searchParams.toString())
                p.set('page', String(page + 1))
                router.push(`${pathname}?${p.toString()}`)
              }}
            >
              <ChevronRight className='w-4 h-4' />
            </Button>
          </div>
        </div>
      )}

      {/* ── Message detail dialog ── */}
      <Dialog
        open={!!selected}
        onOpenChange={(v) => {
          if (!v) setSelected(null)
        }}
      >
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
            <DialogDescription className='sr-only'>
              Message from {selected?.name}
            </DialogDescription>
          </DialogHeader>
          {selected && (
            <div className='space-y-4'>
              <div className='flex items-start gap-3 text-sm'>
                <div className='flex-1 min-w-0'>
                  <p className='font-semibold'>{selected.name}</p>
                  <a
                    href={`mailto:${selected.email}`}
                    className='text-primary hover:underline text-xs break-all'
                  >
                    {selected.email}
                  </a>
                </div>
                {selected.phone && (
                  <div className='flex items-center gap-1 text-muted-foreground text-xs flex-shrink-0'>
                    <Phone className='w-3 h-3' />
                    {selected.phone}
                  </div>
                )}
                <span className='text-xs text-muted-foreground flex-shrink-0'>
                  {formatDate(selected.createdAt)}
                </span>
              </div>
              <Separator />
              <p className='text-sm leading-relaxed whitespace-pre-line'>
                {selected.message}
              </p>
              <Separator />
              <Button asChild className='w-full'>
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                >
                  Reply by Email
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
