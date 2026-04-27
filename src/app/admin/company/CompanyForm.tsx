'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { companySchema, type CompanyInput } from '@/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
// import { Badge } from '@/components/ui/badge'
import ImageUploader from '@/components/admin/ImageUploader'
import {
  Loader2,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Link2,
  Plus,
  Trash2,
  X,
} from 'lucide-react'

interface CompanyDetails {
  id: string
  name: string
  email: string
  phone: string
  address: string
  description: string | null
  logo: string | null
  website: string | null
  facebook: string | null
  instagram: string | null
  tiktok: string | null
  whatsApp: string | null
  twitter: string | null
}

const SOCIAL_PRESETS = [
  {
    key: 'facebook',
    label: 'Facebook',
    placeholder: 'https://facebook.com/yourpage',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    placeholder: 'https://instagram.com/yourhandle',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    placeholder: 'https://tiktok.com/@yourhandle',
  },
  {
    key: 'whatsApp',
    label: 'WhatsApp',
    placeholder: 'https://whatsapp.com/channel/yourchannel',
  },
  {
    key: 'twitter',
    label: 'Twitter / X',
    placeholder: 'https://twitter.com/yourhandle',
  },
] as const

type SocialKey = (typeof SOCIAL_PRESETS)[number]['key']

export default function CompanyForm({
  initialData,
}: {
  initialData: CompanyDetails | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string[]>(
    initialData?.logo ? [initialData.logo] : [],
  )

  // Track which social fields are active
  const initialActiveSocials = SOCIAL_PRESETS.filter(
    ({ key }) => !!initialData?.[key],
  ).map(({ key }) => key)
  const [activeSocials, setActiveSocials] = useState<SocialKey[]>(
    initialActiveSocials.length > 0 ? initialActiveSocials : [],
  )

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CompanyInput>({
    resolver: zodResolver(companySchema) as Resolver<CompanyInput>,
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      description: initialData?.description || '',
      logo: initialData?.logo || '',
      website: initialData?.website || '',
      facebook: initialData?.facebook || '',
      instagram: initialData?.instagram || '',
      twitter: initialData?.twitter || '',
      whatsApp: initialData?.whatsApp || '',
      tiktok: initialData?.tiktok || '',
    },
  })

  const addSocial = (key: SocialKey) => {
    if (!activeSocials.includes(key)) setActiveSocials((prev) => [...prev, key])
  }

  const removeSocial = (key: SocialKey) => {
    setActiveSocials((prev) => prev.filter((k) => k !== key))
    setValue(key, '')
  }

  const availableToAdd = SOCIAL_PRESETS.filter(
    ({ key }) => !activeSocials.includes(key),
  )

  const onSubmit = async (data: CompanyInput) => {
    setLoading(true)
    try {
      // Build payload — use empty string (not null) for inactive socials
      // The API route converts "" → null before writing to DB
      const payload: Record<string, unknown> = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        description: data.description || '',
        logo: logoUrl[0] || '',
      }

      // Only include social fields that are active; set inactive ones to "" so
      // Zod's urlField union (which accepts "") passes validation
      SOCIAL_PRESETS.forEach(({ key }) => {
        payload[key] = activeSocials.includes(key)
          ? (data[key as keyof typeof data] as string) || ''
          : ''
      })

      const res = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success('Company details saved!')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/company', { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      toast.success('Company details removed')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 max-w-3xl'>
      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base flex items-center gap-2'>
            <Building2 className='w-4 h-4' />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <Label>Company Name *</Label>
              <Input
                {...register('name')}
                placeholder='Acme Machinery Ltd.'
                className='mt-1'
              />
              {errors.name && (
                <p className='text-xs text-destructive mt-1'>
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label>Website</Label>
              <div className='relative mt-1'>
                <Globe className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <Input
                  {...register('website')}
                  placeholder='https://yoursite.com'
                  className='pl-9'
                />
              </div>
              {errors.website && (
                <p className='text-xs text-destructive mt-1'>
                  {errors.website.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              {...register('description')}
              placeholder='Brief description of your company...'
              rows={4}
              className='mt-1'
            />
          </div>

          <div>
            <Label>Company Logo</Label>
            <div className='mt-1'>
              <ImageUploader
                value={logoUrl}
                onChange={(urls) => {
                  setLogoUrl(urls)
                  setValue('logo', urls[0] || '')
                }}
                maxImages={1}
                folder='machinery-store/company'
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base flex items-center gap-2'>
            <Mail className='w-4 h-4' />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <Label>Email Address *</Label>
              <div className='relative mt-1'>
                <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <Input
                  {...register('email')}
                  type='email'
                  placeholder='info@company.com'
                  className='pl-9'
                />
              </div>
              {errors.email && (
                <p className='text-xs text-destructive mt-1'>
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label>Phone Number *</Label>
              <div className='relative mt-1'>
                <Phone className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                <Input
                  {...register('phone')}
                  placeholder='+1 234 567 8900'
                  className='pl-9'
                />
              </div>
              {errors.phone && (
                <p className='text-xs text-destructive mt-1'>
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label>Address *</Label>
            <div className='relative mt-1'>
              <MapPin className='absolute left-3 top-3 w-4 h-4 text-muted-foreground' />
              <Textarea
                {...register('address')}
                placeholder='123 Industrial Ave, City, Country'
                rows={2}
                className='pl-9'
              />
            </div>
            {errors.address && (
              <p className='text-xs text-destructive mt-1'>
                {errors.address.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Links — dynamic add/remove */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base flex items-center gap-2'>
              <Link2 className='w-4 h-4' />
              Social Media Links
            </CardTitle>
            <span className='text-xs text-muted-foreground'>
              {activeSocials.length} / {SOCIAL_PRESETS.length} added
            </span>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Active social fields */}
          {activeSocials.length > 0 ? (
            <div className='space-y-3'>
              {activeSocials.map((key) => {
                const preset = SOCIAL_PRESETS.find((p) => p.key === key)!
                const fieldError = errors[key as keyof CompanyInput]
                return (
                  <div key={key}>
                    <div className='flex items-center gap-2'>
                      <div className='flex-1 relative'>
                        <div className='absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5'>
                          <Link2 className='w-3.5 h-3.5 text-muted-foreground' />
                          <span className='text-xs font-medium text-muted-foreground border-r pr-2'>
                            {preset.label}
                          </span>
                        </div>
                        <Input
                          {...register(key as keyof CompanyInput)}
                          placeholder={preset.placeholder}
                          className='pl-28'
                        />
                      </div>
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='h-9 w-9 text-muted-foreground hover:text-destructive flex-shrink-0'
                        onClick={() => removeSocial(key)}
                      >
                        <X className='w-4 h-4' />
                      </Button>
                    </div>
                    {fieldError && (
                      <p className='text-xs text-destructive mt-1'>
                        {fieldError.message as string}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className='text-sm text-muted-foreground py-2'>
              No social links added yet. Use the buttons below to add your
              social profiles.
            </p>
          )}

          {/* Add more */}
          {availableToAdd.length > 0 && (
            <div>
              <Separator className='mb-3' />
              <p className='text-xs text-muted-foreground mb-2'>
                Add a platform:
              </p>
              <div className='flex flex-wrap gap-2'>
                {availableToAdd.map(({ key, label }) => (
                  <Button
                    key={key}
                    type='button'
                    variant='outline'
                    size='sm'
                    className='h-8 text-xs gap-1.5'
                    onClick={() => addSocial(key)}
                  >
                    <Plus className='w-3 h-3' />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className='flex items-center gap-3'>
        <Button type='submit' disabled={loading}>
          {loading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
          {initialData ? 'Update Details' : 'Save Details'}
        </Button>
        {initialData && (
          <Button
            type='button'
            variant='destructive'
            disabled={deleting}
            onClick={handleDelete}
          >
            {deleting ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <Trash2 className='w-4 h-4 mr-2' />
            )}
            Remove All Details
          </Button>
        )}
      </div>
    </form>
  )
}
