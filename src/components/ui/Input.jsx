import { cn } from '@/lib/utils'

export function Input({ className, ...props }) {
    return (
        <input
            className={cn(
                'w-full h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-border transition-colors',
                className
            )}
            {...props}
        />
    )
}