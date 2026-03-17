import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { MarkdownTextarea } from '@/components/ui/MarkdownTextarea'
import { SentenceCounter } from './SentenceCounter'

export function SummaryPanel({ summary, onSummaryChange, error }) {
    const isComplete = summary.trim().length > 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative bg-card rounded-xl border border-border p-6 space-y-4"
        >
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-green-500 rounded-full" />
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Summary</h2>
                        <p className="text-xs text-muted-foreground">정답 복붙이 아니라 자기 언어로 압축한 1~3문장</p>
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

            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                    요약 <span className="text-destructive">*</span>
                </label>
                <MarkdownTextarea
                    value={summary}
                    onChange={(e) => onSummaryChange(e.target.value)}
                    placeholder="지금 이해한 것을 자신의 언어로 1~3문장으로 요약해보세요. 정답을 복붙하지 마세요."
                    error={error}
                    minHeight="min-h-[100px]"
                />
                {error && (
                    <p className="text-sm text-destructive">요약을 입력해주세요</p>
                )}
                <SentenceCounter text={summary} maxSentences={3} />
            </div>
        </motion.div>
    )
}