'use client'

import * as React from 'react'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

// iOS-style switch — uses inline styles for track/thumb so Tailwind 4
// data-attribute variant resolution issues don't affect the visual output.
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, checked, defaultChecked, onCheckedChange, ...props }, ref) => {
  // Track internal checked state so we can style inline without relying on
  // Tailwind data-attribute variants (which Tailwind 4 resolves inconsistently).
  const [isChecked, setIsChecked] = React.useState(
    checked !== undefined ? checked : (defaultChecked ?? false),
  )

  // Keep in sync when controlled
  React.useEffect(() => {
    if (checked !== undefined) setIsChecked(checked)
  }, [checked])

  const handleChange = (val: boolean) => {
    if (checked === undefined) setIsChecked(val) // uncontrolled
    onCheckedChange?.(val)
  }

  return (
    <SwitchPrimitives.Root
      ref={ref}
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={handleChange}
      className={cn(
        'peer inline-flex h-6 w-12 shrink-0 cursor-pointer items-center rounded-full',
        'border-2 border-transparent outline-none transition-all duration-200',
        'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      style={{
        backgroundColor: isChecked ? 'hsl(var(--primary))' : '#3f3f46',
      }}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className='pointer-events-none block rounded-full shadow-lg ring-0 transition-transform duration-200'
        style={{
          width: '1.25rem', // 20px
          height: '1.25rem', // 20px
          backgroundColor: '#ffffff',
          transform: isChecked ? 'translateX(1.5rem)' : 'translateX(0.125rem)',
        }}
      />
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
