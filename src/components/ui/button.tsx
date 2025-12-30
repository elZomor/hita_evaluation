import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 dark:focus-visible:ring-gold-400 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-gold-600 text-white shadow-sm hover:bg-gold-500 dark:bg-gold-500 dark:hover:bg-gold-400',
        destructive:
          'bg-warning-600 text-white shadow-sm hover:bg-warning-500',
        outline:
          'border border-gold-600 bg-transparent text-gold-700 hover:bg-gold-50 hover:text-gold-800 dark:border-gold-400 dark:text-gold-100 dark:hover:bg-gold-900/30',
        secondary:
          'bg-gold-50 text-gold-800 hover:bg-gold-100 dark:bg-gold-900/40 dark:text-gold-100 dark:hover:bg-gold-900/30',
        ghost:
          'text-gold-700 hover:bg-gold-50 hover:text-gold-800 dark:text-gold-200 dark:hover:bg-gold-900/30',
        link: 'text-gold-600 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
