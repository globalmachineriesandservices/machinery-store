'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { faqSchema, type FAQInput } from '@/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import DeleteDialog from '@/components/admin/DeleteDialog'
import { Plus, Pencil, HelpCircle, GripVertical, Loader2 } from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  order: number
  createdAt: string
}

export default function FAQsClient({ initialFaqs }: { initialFaqs: FAQ[] }) {
  const router = useRouter()
  const [faqs, setFaqs] = useState(initialFaqs)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [loading, setLoading] = useState(false)

  // ── Create form ──────────────────────────────────────────────────────────────
  const createForm = useForm<FAQInput>({
    resolver: zodResolver(faqSchema) as Resolver<FAQInput>,
    defaultValues: { question: '', answer: '', order: 0 },
  })

  const onCreateSubmit = async (data: FAQInput) => {
    setLoading(true)
    try {
      const res = await fetch('/api/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, order: faqs.length }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setFaqs((prev) => [...prev, json.data])
      toast.success('FAQ created!')
      setCreateOpen(false)
      createForm.reset()
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ── Edit form ────────────────────────────────────────────────────────────────
  const editForm = useForm<FAQInput>({
    resolver: zodResolver(faqSchema) as Resolver<FAQInput>,
    defaultValues: { question: '', answer: '', order: 0 },
  })

  const openEdit = (faq: FAQ) => {
    setEditingFaq(faq)
    editForm.reset({
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
    })
  }

  const onEditSubmit = async (data: FAQInput) => {
    if (!editingFaq) return
    setLoading(true)
    try {
      const res = await fetch(`/api/faqs/${editingFaq.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setFaqs((prev) =>
        prev.map((f) => (f.id === editingFaq.id ? json.data : f)),
      )
      toast.success('FAQ updated!')
      setEditingFaq(null)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/faqs/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      setFaqs((prev) => prev.filter((f) => f.id !== id))
      toast.success('FAQ deleted')
    } else {
      toast.error(data.error)
    }
  }

  return (
    <div className='space-y-4'>
      {/* ── Toolbar ── */}
      <div className='flex justify-end'>
        <Dialog
          open={createOpen}
          onOpenChange={(v) => {
            setCreateOpen(v)
            if (!v) createForm.reset()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 w-4 h-4' />
              New FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-lg'>
            <DialogHeader>
              <DialogTitle>New FAQ</DialogTitle>
              <DialogDescription>
                Add a frequently asked question to your site.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className='space-y-4 mt-2'
            >
              <div className='space-y-1.5'>
                <Label htmlFor='create-q'>Question *</Label>
                <Input
                  id='create-q'
                  {...createForm.register('question')}
                  placeholder='What is...?'
                />
                {createForm.formState.errors.question && (
                  <p className='text-xs text-destructive'>
                    {createForm.formState.errors.question.message}
                  </p>
                )}
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='create-a'>Answer *</Label>
                <Textarea
                  id='create-a'
                  {...createForm.register('answer')}
                  placeholder='The answer is...'
                  rows={5}
                />
                {createForm.formState.errors.answer && (
                  <p className='text-xs text-destructive'>
                    {createForm.formState.errors.answer.message}
                  </p>
                )}
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='create-order'>Display Order</Label>
                <Input
                  id='create-order'
                  type='number'
                  {...createForm.register('order', { valueAsNumber: true })}
                  className='w-24'
                  min={0}
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type='button' variant='outline'>
                    Cancel
                  </Button>
                </DialogClose>
                <Button type='submit' disabled={loading}>
                  {loading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
                  Create FAQ
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Edit dialog ── */}
      <Dialog
        open={!!editingFaq}
        onOpenChange={(v) => {
          if (!v) setEditingFaq(null)
        }}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>
              Update this frequently asked question.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(onEditSubmit)}
            className='space-y-4 mt-2'
          >
            <div className='space-y-1.5'>
              <Label htmlFor='edit-q'>Question *</Label>
              <Input id='edit-q' {...editForm.register('question')} />
              {editForm.formState.errors.question && (
                <p className='text-xs text-destructive'>
                  {editForm.formState.errors.question.message}
                </p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='edit-a'>Answer *</Label>
              <Textarea id='edit-a' {...editForm.register('answer')} rows={5} />
              {editForm.formState.errors.answer && (
                <p className='text-xs text-destructive'>
                  {editForm.formState.errors.answer.message}
                </p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='edit-order'>Display Order</Label>
              <Input
                id='edit-order'
                type='number'
                {...editForm.register('order', { valueAsNumber: true })}
                className='w-24'
                min={0}
              />
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setEditingFaq(null)}
              >
                Cancel
              </Button>
              <Button type='submit' disabled={loading}>
                {loading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── FAQ list ── */}
      {faqs.length === 0 ? (
        <div className='flex flex-col items-center py-16 text-muted-foreground border-2 border-dashed rounded-xl'>
          <HelpCircle className='w-12 h-12 mb-3 opacity-20' />
          <p className='mb-4'>No FAQs yet.</p>
          <Button variant='outline' onClick={() => setCreateOpen(true)}>
            <Plus className='mr-2 w-4 h-4' />
            Add your first FAQ
          </Button>
        </div>
      ) : (
        <div className='space-y-2'>
          {faqs.map((faq) => (
            <Card
              key={faq.id}
              className='group hover:shadow-sm transition-shadow'
            >
              <CardContent className='p-4'>
                <div className='flex items-start gap-3'>
                  <GripVertical className='w-4 h-4 text-muted-foreground mt-0.5 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity shrink-0' />
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <p className='font-semibold text-sm'>{faq.question}</p>
                        <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                          {faq.answer}
                        </p>
                      </div>
                      <div className='flex items-center gap-1 shrink-0'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7'
                          onClick={() => openEdit(faq)}
                        >
                          <Pencil className='w-3.5 h-3.5' />
                        </Button>
                        <DeleteDialog
                          title='Delete FAQ'
                          description={`This will permanently delete the question: "${faq.question}"`}
                          onConfirm={() => handleDelete(faq.id)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
