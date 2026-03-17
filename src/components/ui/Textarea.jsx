import { cn } from '@/lib/utils'

export function Textarea({ className, ...props }) {
    return (
        <textarea
            className={cn(
                'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-border transition-colors',
                className
            )}
            {...props}
        />
    )
}