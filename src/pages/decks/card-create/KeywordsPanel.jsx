import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { TagInput } from './TagInput'

export function KeywordsPanel({ keywords, onKeywordsChange, error }) {
    const isComplete = keywords.length > 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative bg-card rounded-xl border border-border p-6 space-y-4"
        >
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-amber-500 rounded-full" />
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Keywords / Cues</h2>
                        <p className="text-xs text-muted-foreground">인출 단서 — 이 키워드만 보고 Main 내용을 떠올릴 수 있어야 한다</p>
                    </div>
                </div>
                {isComplete && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center"
                    >
                        <Check className="w-4 h-4 text-green-400" />
                    </motion.div>
                )}
            </div>

            <TagInput tags={keywords} onTagsChange={onKeywordsChange} error={error} />

            <p className="text-xs text-muted-foreground">
                Enter 또는 쉼표(,)로 키워드 추가 • Backspace로 마지막 키워드 삭제
            </p>
        </motion.div>
    )
}