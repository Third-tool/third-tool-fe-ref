import { motion } from 'framer-motion'
import { Book, Video, FileText, Code, AlertCircle, Camera } from 'lucide-react'
import { cn } from '@/lib/utils.js'

const sourceTypes = [
    { type: 'BOOK', label: '책', icon: Book },
    { type: 'LECTURE', label: '강의', icon: Video },
    { type: 'DOCUMENT', label: '문서', icon: FileText },
    { type: 'CODE', label: '코드', icon: Code },
    { type: 'ERROR', label: '에러', icon: AlertCircle },
    { type: 'CAPTURE', label: '캡처', icon: Camera },
]

export function SourceTypeSelector({ value, onChange, error }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
                소스 타입 <span className="text-destructive">*</span>
            </label>
            <div className={cn(
                'flex flex-wrap gap-2 p-1 rounded-lg',
                error && 'ring-2 ring-destructive'
            )}>
                {sourceTypes.map(({ type, label, icon: Icon }) => {
                    const isSelected = value === type
                    return (
                        <motion.button
                            key={type}
                            type="button"
                            onClick={() => onChange(type)}
                            className={cn(
                                'relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                                'border border-border',
                                isSelected
                                    ? 'bg-foreground text-background'
                                    : 'bg-card hover:bg-secondary text-foreground'
                            )}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </motion.button>
                    )
                })}
            </div>
            {error && (
                <p className="text-sm text-destructive">소스 타입을 선택해주세요</p>
            )}
        </div>
    )
}
