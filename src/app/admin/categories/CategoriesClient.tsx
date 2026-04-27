'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { categorySchema, type CategoryInput } from '@/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { Switch } from '@/components/ui/switch'
import DeleteDialog from '@/components/admin/DeleteDialog'
import ImageUploader, {
  deleteUploadedImages,
  type UploadedImage,
} from '@/components/admin/ImageUploader'
import { Plus, Pencil, Tag, Loader2, Package } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  active: boolean
  createdAt: string
  _count: { products: number }
}

export default function CategoriesClient({
  initialCategories,
}: {
  initialCategories: Category[]
}) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [createOpen, setCreateOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string[]>([])
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Track images uploaded in the create dialog.
  // Stored in state (not a ref) so the cancel callback always sees the latest list
  // without reading .current during render — avoids the "Cannot access refs during render" warning.
  const [createUploadedImages, setCreateUploadedImages] = useState<
    UploadedImage[]
  >([])

  // ── Create form ──────────────────────────────────────────────────────────────
  const createForm = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
  })

  // Named cancel handler — stable reference via useCallback
  const handleCreateCancel = useCallback(async () => {
    await deleteUploadedImages(createUploadedImages)
    setCreateUploadedImages([])
    createForm.reset()
    setImageUrl([])
  }, [createUploadedImages, createForm])

  const onCreateSubmit = useCallback(
    async (data: CategoryInput) => {
      setLoading(true)
      try {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, image: imageUrl[0] || null }),
        })
        const json = await res.json()
        if (!json.success) throw new Error(json.error)
        setCategories((prev) => [
          ...prev,
          { ...json.data, active: true, _count: { products: 0 } },
        ])
        toast.success('Category created!')
        // Clear tracked images — they were saved successfully
        setCreateUploadedImages([])
        setCreateOpen(false)
        createForm.reset()
        setImageUrl([])
        router.refresh()
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    },
    [imageUrl, createForm, router],
  )

  // ── Edit form ────────────────────────────────────────────────────────────────
  const editForm = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
  })

  const openEdit = (cat: Category) => {
    setEditingCat(cat)
    editForm.reset({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || '',
    })
    setImageUrl(cat.image ? [cat.image] : [])
  }

  const onEditSubmit = async (data: CategoryInput) => {
    if (!editingCat) return
    setLoading(true)
    try {
      const res = await fetch(`/api/categories/${editingCat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, image: imageUrl[0] || null }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setCategories((prev) =>
        prev.map((c) => (c.id === editingCat.id ? { ...c, ...json.data } : c)),
      )
      toast.success('Category updated!')
      setEditingCat(null)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      toast.success('Category deleted')
    } else {
      toast.error(data.error)
    }
  }

  // ── Active toggle ────────────────────────────────────────────────────────────
  const handleToggleActive = async (cat: Category) => {
    setTogglingId(cat.id)
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !cat.active }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, active: !cat.active } : c)),
      )
      toast.success(`Category ${!cat.active ? 'activated' : 'deactivated'}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update')
    } finally {
      setTogglingId(null)
    }
  }

  const activeCount = categories.filter((c) => c.active).length
  const hiddenCount = categories.filter((c) => !c.active).length

  return (
    <div className='space-y-6'>
      {/* ── Toolbar ── */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3 text-sm text-muted-foreground'>
          <span className='flex items-center gap-1.5'>
            <span className='w-2 h-2 rounded-full bg-green-500 inline-block' />
            {activeCount} active
          </span>
          <span className='text-border'>·</span>
          <span className='flex items-center gap-1.5'>
            <span className='w-2 h-2 rounded-full bg-muted-foreground inline-block' />
            {hiddenCount} hidden
          </span>
        </div>

        <Dialog
          open={createOpen}
          onOpenChange={(v) => {
            // When the dialog closes without submitting (X, Escape, outside click)
            // run the same cancel logic to clean up any uploads
            if (!v) handleCreateCancel()
            setCreateOpen(v)
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 w-4 h-4' />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>New Category</DialogTitle>
              <DialogDescription>
                Add a new product category to the store.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={createForm.handleSubmit(onCreateSubmit)}
              className='space-y-4 mt-2'
            >
              <div className='space-y-1.5'>
                <Label htmlFor='create-name'>Name *</Label>
                <Input
                  id='create-name'
                  {...createForm.register('name')}
                  placeholder='e.g. Generators'
                />
                {createForm.formState.errors.name && (
                  <p className='text-xs text-destructive'>
                    {createForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className='space-y-1.5'>
                <Label htmlFor='create-desc'>Description</Label>
                <Textarea
                  id='create-desc'
                  {...createForm.register('description')}
                  placeholder='Short description...'
                  rows={3}
                />
              </div>
              <div className='space-y-1.5'>
                <Label>Image</Label>
                <ImageUploader
                  value={imageUrl}
                  onChange={(urls) => {
                    setImageUrl(urls)
                    createForm.setValue('image', urls[0] || '')
                  }}
                  onUploadedImagesChange={setCreateUploadedImages}
                  maxImages={1}
                  folder='machinery-store/categories'
                />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={handleCreateCancel}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button type='submit' disabled={loading}>
                  {loading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
                  Create Category
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Edit dialog ── */}
      <Dialog
        open={!!editingCat}
        onOpenChange={(v) => {
          if (!v) {
            setEditingCat(null)
            setImageUrl([])
          }
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the details for &quot;{editingCat?.name}&quot;.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit(onEditSubmit)}
            className='space-y-4 mt-2'
          >
            <div className='space-y-1.5'>
              <Label htmlFor='edit-name'>Name *</Label>
              <Input id='edit-name' {...editForm.register('name')} />
              {editForm.formState.errors.name && (
                <p className='text-xs text-destructive'>
                  {editForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className='space-y-1.5'>
              <Label htmlFor='edit-desc'>Description</Label>
              <Textarea
                id='edit-desc'
                {...editForm.register('description')}
                rows={3}
              />
            </div>
            <div className='space-y-1.5'>
              <Label>Image</Label>
              <ImageUploader
                value={imageUrl}
                onChange={(urls) => {
                  setImageUrl(urls)
                  editForm.setValue('image', urls[0] || '')
                }}
                maxImages={1}
                folder='machinery-store/categories'
              />
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setEditingCat(null)
                  setImageUrl([])
                }}
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

      {/* ── Flat grid — all categories together ── */}
      {categories.length === 0 ? (
        <div className='flex flex-col items-center py-16 text-muted-foreground border-2 border-dashed rounded-xl'>
          <Tag className='w-12 h-12 mb-3 opacity-20' />
          <p className='mb-4'>No categories yet.</p>
          <Button variant='outline' onClick={() => setCreateOpen(true)}>
            <Plus className='mr-2 w-4 h-4' />
            Add your first category
          </Button>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {[...categories]
            .sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0))
            .map((cat) => (
              <Card
                key={cat.id}
                className={`overflow-hidden transition-all hover:shadow-md ${!cat.active ? 'opacity-60 border-dashed' : ''}`}
              >
                <div className='h-28 bg-muted relative'>
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <Tag className='w-10 h-10 text-muted-foreground/30' />
                    </div>
                  )}
                  <div className='absolute top-2 left-2'>
                    <Badge
                      variant={cat.active ? 'success' : 'secondary'}
                      className='text-xs shadow-sm'
                    >
                      {cat.active ? 'Active' : 'Hidden'}
                    </Badge>
                  </div>
                </div>

                <CardContent className='p-4'>
                  <div className='flex items-start justify-between gap-2 mb-3'>
                    <div className='min-w-0'>
                      <h3 className='font-semibold text-sm truncate'>
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className='text-xs text-muted-foreground line-clamp-2 mt-0.5'>
                          {cat.description}
                        </p>
                      )}
                      <div className='flex items-center gap-1.5 mt-1.5'>
                        <Package className='w-3.5 h-3.5 text-muted-foreground' />
                        <span className='text-xs text-muted-foreground'>
                          {cat._count.products} products
                        </span>
                      </div>
                    </div>
                    <div className='flex items-center gap-1 shrink-0'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7'
                        onClick={() => openEdit(cat)}
                      >
                        <Pencil className='w-3.5 h-3.5' />
                      </Button>
                      <DeleteDialog
                        title='Delete Category'
                        description={
                          cat._count.products > 0
                            ? `Cannot delete "${cat.name}" — it has ${cat._count.products} product(s). Reassign them first.`
                            : `Permanently delete "${cat.name}"? This cannot be undone.`
                        }
                        onConfirm={() => handleDelete(cat.id)}
                      />
                    </div>
                  </div>

                  <div className='flex items-center justify-between pt-3 border-t'>
                    <div>
                      <p className='text-xs font-medium leading-none'>
                        {cat.active ? 'Visible on site' : 'Hidden from site'}
                      </p>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        {cat.active
                          ? 'Customers can browse this category'
                          : 'Not visible to customers'}
                      </p>
                    </div>
                    <Switch
                      checked={cat.active}
                      disabled={togglingId === cat.id}
                      onCheckedChange={() => handleToggleActive(cat)}
                      aria-label={
                        cat.active ? 'Deactivate category' : 'Activate category'
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
