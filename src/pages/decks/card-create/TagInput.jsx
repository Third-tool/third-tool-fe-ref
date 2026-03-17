import { useState, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TagInput({ tags, onTagsChange, error }) {
    const [input, setInput] = useState('')
    const inputRef = useRef(null)

    const addTag = (value) => {
        const trimmed = value.trim()
        if (trimmed && !tags.includes(trimmed)) {
            onTagsChange([...tags, trimmed])
        }
        setInput('')
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addTag(input)
        } else if (e.key === 'Backspace' && !input && tags.length > 0) {
            onTagsChange(tags.slice(0, -1))
        }
    }

    const handleChange = (e) => {
        const value = e.target.value
        if (value.includes(',')) {
            const parts = value.split(',')
            parts.slice(0, -1).forEach(part => addTag(part))
            setInput(parts[parts.length - 1])
        } else {
            setInput(value)
        }
    }

    const removeTag = (index) => {
        onTagsChange(tags.filter((_, i) => i !== index))
    }

    return (
        <div
            className={cn(
                'min-h-[44px] w-full flex flex-wrap gap-2 px-3 py-2 rounded-lg border bg-background cursor-text transition-colors',
                error
                    ? 'border-destructive'
                    : 'border-border focus-within:border-foreground'
            )}
            onClick={() => inputRef.current?.focus()}
        >
            {tags.map((tag, index) => (
                <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary text-foreground text-sm rounded-md"
                >
                    {tag}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            removeTag(index)
                        }}
                        className="hover:text-destructive transition-colors"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </span>
            ))}
            <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="flex-1 min-w-[120px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                placeholder={tags.length === 0 ? '키워드를 입력하세요' : ''}
            />
        </div>
    )
}