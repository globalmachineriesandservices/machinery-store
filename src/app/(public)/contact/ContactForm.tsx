'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, type ContactInput } from '@/schemas'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Loader2, Send } from 'lucide-react'

export default function ContactForm() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactInput) => {
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      setSubmitted(true)
      reset()
    } catch (err) {
      import('sonner').then(({ toast }) =>
        toast.error(
          err instanceof Error ? err.message : 'Failed to send message',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className='text-center py-12'>
        <CheckCircle className='w-16 h-16 text-green-500 mx-auto mb-4' />
        <h3 className='text-xl font-bold mb-2'>Message Sent!</h3>
        <p className='text-muted-foreground mb-6'>
          Thank you for reaching out. We&apos;ll get back to you within 24
          hours.
        </p>
        <Button variant='outline' onClick={() => setSubmitted(false)}>
          Send Another Message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <Label>Full Name *</Label>
          <Input
            {...register('name')}
            placeholder='John Smith'
            className='mt-1'
          />
          {errors.name && (
            <p className='text-xs text-destructive mt-1'>
              {errors.name.message}
            </p>
          )}
        </div>
        <div>
          <Label>Email Address *</Label>
          <Input
            type='email'
            {...register('email')}
            placeholder='john@company.com'
            className='mt-1'
          />
          {errors.email && (
            <p className='text-xs text-destructive mt-1'>
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label>Phone Number</Label>
        <Input
          {...register('phone')}
          placeholder='+1 234 567 8900'
          className='mt-1'
        />
      </div>

      <div>
        <Label>Subject *</Label>
        <Input
          {...register('subject')}
          placeholder='e.g. Generator quote request'
          className='mt-1'
        />
        {errors.subject && (
          <p className='text-xs text-destructive mt-1'>
            {errors.subject.message}
          </p>
        )}
      </div>

      <div>
        <Label>Message *</Label>
        <Textarea
          {...register('message')}
          rows={6}
          placeholder='Tell us about your requirements, the equipment you need, quantity, etc.'
          className='mt-1'
        />
        {errors.message && (
          <p className='text-xs text-destructive mt-1'>
            {errors.message.message}
          </p>
        )}
      </div>

      <Button
        type='submit'
        size='lg'
        className='w-full font-semibold'
        disabled={loading}
      >
        {loading ? (
          <Loader2 className='w-5 h-5 mr-2 animate-spin' />
        ) : (
          <Send className='w-5 h-5 mr-2' />
        )}
        Send Message
      </Button>
    </form>
  )
}
