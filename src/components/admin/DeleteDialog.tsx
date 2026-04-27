'use client'

import { useState } from 'react'
import { Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface DeleteDialogProps {
  title?: string
  description?: string
  onConfirm: () => Promise<void>
  trigger?: React.ReactNode
}

export default function DeleteDialog({
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  onConfirm,
  trigger,
}: DeleteDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button
            variant='ghost'
            size='icon'
            className='h-7 w-7 text-muted-foreground hover:text-destructive'
          >
            <Trash2 className='w-3.5 h-3.5' />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <Button
            variant='destructive'
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            ) : (
              <Trash2 className='w-4 h-4 mr-2' />
            )}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
