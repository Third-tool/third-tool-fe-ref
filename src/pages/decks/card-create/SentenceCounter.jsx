import { cn } from '@/lib/utils.js'

export function SentenceCounter({ text, maxSentences = 3 }) {
    const countSentences = (text) => {
        if (!text.trim()) return 0
        const sentences = text.split(/[.!?。]/).filter(s => s.trim().length > 0)
        return sentences.length
    }

    const sentenceCount = countSentences(text)
    const isOverLimit = sentenceCount > maxSentences

    return (
        <div className="flex items-center justify-end gap-2 text-xs">
      <span className={cn(
          'transition-colors',
          isOverLimit ? 'text-amber-400' : 'text-muted-foreground'
      )}>
        {sentenceCount}문장 / {maxSentences}문장 권장
      </span>
            {isOverLimit && (
                <span className="text-amber-400">
          • 요약은 간결할수록 좋아요
        </span>
            )}
        </div>
    )
}
