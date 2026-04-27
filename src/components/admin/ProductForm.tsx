'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  productSchema,
  type ProductInput,
  type KeyFeatureInput,
} from '@/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import ImageUploader, {
  deleteUploadedImages,
  type UploadedImage,
} from '@/components/admin/ImageUploader'
import { Loader2, Plus, Trash2, ArrowLeft, GripVertical } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
}

interface ProductFormProps {
  categories: Category[]
  product?: ProductInput & { id: string }
}

// Key feature with mutable points array
interface KeyFeature {
  title: string
  points: string[]
}

export default function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!product
  const [loading, setLoading] = useState(false)
  // Track uploaded images so we can delete them from Cloudinary on cancel
  const uploadedImagesRef = useRef<UploadedImage[]>([])

  // Technical specs rows
  const [specs, setSpecs] = useState<[string, string][]>(
    product?.specifications
      ? (Object.entries(product.specifications) as [string, string][])
      : [],
  )

  // Key features
  const [features, setFeatures] = useState<KeyFeature[]>(
    product?.keyFeatures ? (product.keyFeatures as KeyFeature[]) : [],
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema) as Resolver<ProductInput>,
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      brand: product?.brand || '',
      images: product?.images || [],
      featured: product?.featured || false,
      inStock: product?.inStock ?? true,
      categoryId: product?.categoryId || '',
      specifications: product?.specifications || {},
      keyFeatures: (product?.keyFeatures as KeyFeatureInput[]) || [],
    },
  })

  const images = watch('images')
  const featured = watch('featured')
  const inStock = watch('inStock')

  // ── Technical Specs helpers ──────────────────────────────────────────────────
  const addSpec = () => setSpecs([...specs, ['', '']])
  const removeSpec = (i: number) => {
    const next = specs.filter((_, idx) => idx !== i)
    setSpecs(next)
    setValue('specifications', Object.fromEntries(next.filter(([k]) => k)))
  }
  const updateSpec = (i: number, field: 0 | 1, value: string) => {
    const next = specs.map((s, idx) =>
      idx === i
        ? ((field === 0 ? [value, s[1]] : [s[0], value]) as [string, string])
        : s,
    )
    setSpecs(next)
    setValue('specifications', Object.fromEntries(next.filter(([k]) => k)))
  }

  // ── Key Features helpers ─────────────────────────────────────────────────────
  const addFeature = () => {
    const next = [...features, { title: '', points: [''] }]
    setFeatures(next)
    setValue('keyFeatures', next)
  }
  const removeFeature = (i: number) => {
    const next = features.filter((_, idx) => idx !== i)
    setFeatures(next)
    setValue('keyFeatures', next)
  }
  const updateFeatureTitle = (i: number, title: string) => {
    const next = features.map((f, idx) => (idx === i ? { ...f, title } : f))
    setFeatures(next)
    setValue('keyFeatures', next)
  }
  const addPoint = (i: number) => {
    const next = features.map((f, idx) =>
      idx === i ? { ...f, points: [...f.points, ''] } : f,
    )
    setFeatures(next)
    setValue('keyFeatures', next)
  }
  const removePoint = (fi: number, pi: number) => {
    const next = features.map((f, idx) =>
      idx === fi
        ? { ...f, points: f.points.filter((_, pIdx) => pIdx !== pi) }
        : f,
    )
    setFeatures(next)
    setValue('keyFeatures', next)
  }
  const updatePoint = (fi: number, pi: number, value: string) => {
    const next = features.map((f, idx) =>
      idx === fi
        ? { ...f, points: f.points.map((p, pIdx) => (pIdx === pi ? value : p)) }
        : f,
    )
    setFeatures(next)
    setValue('keyFeatures', next)
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  const onSubmit = async (data: ProductInput) => {
    setLoading(true)
    try {
      const body = {
        ...data,
        brand: data.brand || null,
        specifications: Object.fromEntries(specs.filter(([k]) => k)),
        keyFeatures: features.filter((f) => f.title.trim()),
      }
      const url = isEdit ? `/api/products/${product.id}` : '/api/products'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)

      toast.success(isEdit ? 'Product updated!' : 'Product created!')
      router.push('/admin/products')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {/* Header */}
      <div className='flex items-center gap-4'>
        <Button variant='ghost' size='sm' asChild>
          <Link href='/admin/products'>
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back
          </Link>
        </Button>
        <h1
          className='text-2xl font-bold'
          style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          {isEdit ? 'EDIT PRODUCT' : 'NEW PRODUCT'}
        </h1>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* ── Main ────────────────────────────────────────────────────── */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Basic info */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Product Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='name'>Product Name *</Label>
                <Input
                  id='name'
                  {...register('name')}
                  placeholder='e.g. Cummins 20kVA Silent Generator'
                  className='mt-1'
                />
                {errors.name && (
                  <p className='text-xs text-destructive mt-1'>
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='categoryId'>Category *</Label>
                  <Select
                    defaultValue={product?.categoryId}
                    onValueChange={(v) => setValue('categoryId', v)}
                  >
                    <SelectTrigger className='mt-1'>
                      <SelectValue placeholder='Select a category' />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className='text-xs text-destructive mt-1'>
                      {errors.categoryId.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor='brand'>Brand</Label>
                  <Input
                    id='brand'
                    {...register('brand')}
                    placeholder='e.g. Cummins, Perkins, Honda'
                    className='mt-1'
                  />
                  <p className='text-xs text-muted-foreground mt-1'>
                    Used for filtering on the storefront
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor='description'>Description *</Label>
                <Textarea
                  id='description'
                  {...register('description')}
                  placeholder='Detailed product description...'
                  rows={5}
                  className='mt-1'
                />
                {errors.description && (
                  <p className='text-xs text-destructive mt-1'>
                    {errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-base'>Key Features</CardTitle>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={addFeature}
                >
                  <Plus className='w-4 h-4 mr-1' />
                  Add Feature
                </Button>
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                Each feature has a title and one or more bullet points.
              </p>
            </CardHeader>
            <CardContent className='space-y-5'>
              {features.length === 0 && (
                <p className='text-sm text-muted-foreground py-2'>
                  No key features added. Click &quot;Add Feature&quot; to highlight
                  key selling points.
                </p>
              )}
              {features.map((feat, fi) => (
                <div
                  key={fi}
                  className='border rounded-xl p-4 space-y-3 bg-muted/30'
                >
                  {/* Feature title */}
                  <div className='flex items-center gap-2'>
                    <GripVertical className='w-4 h-4 text-muted-foreground shrink-0' />
                    <Input
                      placeholder='Feature title (e.g. Ease of Maintenance)'
                      value={feat.title}
                      onChange={(e) => updateFeatureTitle(fi, e.target.value)}
                      className='flex-1 font-medium'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-destructive hover:text-destructive shrink-0'
                      onClick={() => removeFeature(fi)}
                    >
                      <Trash2 className='w-4 h-4' />
                    </Button>
                  </div>

                  {/* Points */}
                  <div className='space-y-2 pl-6'>
                    {feat.points.map((point, pi) => (
                      <div key={pi} className='flex items-start gap-2'>
                        <span className='mt-2.5 w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0' />
                        <Textarea
                          placeholder='Bullet point description...'
                          value={point}
                          onChange={(e) => updatePoint(fi, pi, e.target.value)}
                          rows={2}
                          className='flex-1 text-sm resize-none'
                        />
                        {feat.points.length > 1 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 mt-0.5'
                            onClick={() => removePoint(fi, pi)}
                          >
                            <Trash2 className='w-3.5 h-3.5' />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='text-xs text-muted-foreground hover:text-foreground ml-3'
                      onClick={() => addPoint(fi)}
                    >
                      <Plus className='w-3 h-3 mr-1' />
                      Add point
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Technical Specifications */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-base'>
                  Technical Specifications
                </CardTitle>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={addSpec}
                >
                  <Plus className='w-4 h-4 mr-1' />
                  Add Row
                </Button>
              </div>
            </CardHeader>
            <CardContent className='space-y-3'>
              {specs.length === 0 && (
                <p className='text-sm text-muted-foreground py-2'>
                  No specs added. Click &quot;Add Row&quot; to add key-value specification
                  pairs.
                </p>
              )}
              {specs.map(([key, val], i) => (
                <div key={i} className='flex items-center gap-2'>
                  <Input
                    placeholder='Spec name (e.g. Rated Power)'
                    value={key}
                    onChange={(e) => updateSpec(i, 0, e.target.value)}
                    className='flex-1'
                  />
                  <Input
                    placeholder='Value (e.g. 20 kVA)'
                    value={val}
                    onChange={(e) => updateSpec(i, 1, e.target.value)}
                    className='flex-1'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='h-9 w-9 text-muted-foreground hover:text-destructive shrink-0'
                    onClick={() => removeSpec(i)}
                  >
                    <Trash2 className='w-4 h-4' />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Product Images *</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUploader
                value={images}
                onChange={(urls) => setValue('images', urls)}
                onUploadedImagesChange={(imgs) => {
                  uploadedImagesRef.current = imgs
                }}
                folder='machinery-store/products'
                maxImages={8}
              />
              {errors.images && (
                <p className='text-xs text-destructive mt-2'>
                  {errors.images.message}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <div className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Status</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <Label>In Stock</Label>
                  <p className='text-xs text-muted-foreground'>
                    Show as available
                  </p>
                </div>
                <Switch
                  checked={inStock}
                  onCheckedChange={(v) => setValue('inStock', v)}
                />
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <div>
                  <Label>Featured</Label>
                  <p className='text-xs text-muted-foreground'>
                    Show on homepage
                  </p>
                </div>
                <Switch
                  checked={featured}
                  onCheckedChange={(v) => setValue('featured', v)}
                />
              </div>
            </CardContent>
          </Card>

          <Button type='submit' className='w-full' disabled={loading} size='lg'>
            {loading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
            {isEdit ? 'Update Product' : 'Create Product'}
          </Button>
          <Button
            type='button'
            variant='outline'
            className='w-full'
            onClick={async () => {
              // Delete any images uploaded during this session that won't be saved
              if (!isEdit) await deleteUploadedImages(uploadedImagesRef.current)
              router.back()
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}
