import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Bold, Italic, Heading2, Code, List, Eye, EyeOff } from 'lucide-react'

export function MarkdownTextarea({
                                     value,
                                     onChange,
                                     placeholder,
                                     className,
                                     error,
                                     minHeight = 'min-h-[120px]',
                                 }) {
    const [showPreview, setShowPreview] = useState(false)
    const textareaRef = useRef(null)

    const insertMarkdown = (before, after = '') => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end) || 'text'
        const newValue =
            value.substring(0, start) +
            before +
            selectedText +
            after +
            value.substring(end)

        onChange({ target: { value: newValue } })

        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(
                start + before.length,
                start + before.length + selectedText.length
            )
        }, 0)
    }

    const parseMarkdown = (md) => {
        return md
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/### (.+)/g, '<h3 style="font-weight:600;font-size:0.875rem;margin-top:0.5rem">$1</h3>')
            .replace(/## (.+)/g, '<h2 style="font-weight:600;font-size:1rem;margin-top:0.5rem">$1</h2>')
            .replace(/# (.+)/g, '<h1 style="font-weight:700;font-size:1.125rem;margin-top:0.5rem">$1</h1>')
            .replace(/\n- (.+)/g, '<li style="margin-left:1.25rem">$1</li>')
            .replace(/(<li.+?<\/li>)/s, '<ul style="list-style-type:disc">$1</ul>')
            .replace(/\n/g, '<br/>')
    }

    return (
        <div className="space-y-2">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-muted rounded-lg border border-border flex-wrap">
                <button
                    type="button"
                    onClick={() => insertMarkdown('**', '**')}
                    className="p-1.5 hover:bg-accent rounded transition-colors"
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => insertMarkdown('*', '*')}
                    className="p-1.5 hover:bg-accent rounded transition-colors"
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => insertMarkdown('`', '`')}
                    className="p-1.5 hover:bg-accent rounded transition-colors"
                    title="Inline code"
                >
                    <Code className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => insertMarkdown('## ', '')}
                    className="p-1.5 hover:bg-accent rounded transition-colors"
                    title="Heading"
                >
                    <Heading2 className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => insertMarkdown('\n- ')}
                    className="p-1.5 hover:bg-accent rounded transition-colors"
                    title="List"
                >
                    <List className="w-4 h-4" />
                </button>
                <div className="flex-1" />
                <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="p-1.5 hover:bg-accent rounded transition-colors flex items-center gap-1 text-xs"
                >
                    {showPreview ? (
                        <><EyeOff className="w-4 h-4" /> Edit</>
                    ) : (
                        <><Eye className="w-4 h-4" /> Preview</>
                    )}
                </button>
            </div>

            {/* Editor / Preview */}
            {!showPreview ? (
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={cn(
                        'w-full px-4 py-3 bg-background border rounded-lg font-mono text-sm resize-none transition-colors',
                        minHeight,
                        error
                            ? 'border-destructive'
                            : 'border-border focus:border-foreground focus:outline-none',
                        className
                    )}
                />
            ) : (
                <div
                    className={cn(
                        'w-full px-4 py-3 bg-background border rounded-lg text-sm overflow-y-auto',
                        minHeight,
                        error ? 'border-destructive' : 'border-border'
                    )}
                    dangerouslySetInnerHTML={{
                        __html: parseMarkdown(value) || '<span style="opacity:.4">No content</span>',
                    }}
                />
            )}

            {/* Markdown hint */}
            <div className="text-xs text-muted-foreground flex items-center gap-2">
                <span>마크다운 지원: </span>
                <code className="bg-muted px-1.5 py-0.5 rounded">**bold**</code>
                <code className="bg-muted px-1.5 py-0.5 rounded">*italic*</code>
                <code className="bg-muted px-1.5 py-0.5 rounded">`code`</code>
            </div>
        </div>
    )
}