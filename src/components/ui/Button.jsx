import { cn } from '@/lib/utils'

export function Button({
                           children,
                           className,
                           variant = 'default',
                           size = 'default',
                           ...props
                       }) {
    const variants = {
        default: 'bg-foreground text-background hover:bg-foreground/90',
        ghost: 'bg-transparent hover:bg-secondary',
        outline: 'border border-border bg-transparent hover:bg-secondary',
    }

    const sizes = {
        default: 'h-10 px-4 py-2',
        icon: 'h-10 w-10',
        sm: 'h-8 px-3 text-sm',
    }

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-border focus:ring-offset-2 disabled:opacity-50',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    )
}