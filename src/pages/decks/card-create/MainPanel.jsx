import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SourceTypeSelector } from './SourceTypeSelector'
import { ImageUploadZone } from './ImageUploadZone'
import { ContentTypeBadge } from './ContentTypeBadge'
import { MarkdownTextarea } from '@/components/ui/MarkdownTextarea'
import { Input } from '@/components/ui/Input'

export function MainPanel({
                              sourceType,
                              origin,
                              confusion,
                              memo,
                              images,
                              onSourceTypeChange,
                              onOriginChange,
                              onConfusionChange,
                              onMemoChange,
                              onImagesChange,
                              errors,
                          }) {
    const isComplete = sourceType && origin.trim() && confusion.trim()

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative bg-card rounded-xl border border-border p-6 space-y-6"
        >
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-blue-500 rounded-full" />
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Main</h2>
                        <p className="text-xs text-muted-foreground">카드가 태어난 장면을 복원하는 영역</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <ContentTypeBadge
                        hasText={!!origin.trim()}
                        hasImage={images.length > 0}
                    />
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
            </div>

            <SourceTypeSelector
                value={sourceType}
                onChange={onSourceTypeChange}
                error={errors.sourceType}
            />

            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                    원본 맥락 <span className="text-destructive">*</span>
                </label>
                <MarkdownTextarea
                    value={origin}
                    onChange={(e) => onOriginChange(e.target.value)}
                    placeholder="어떤 내용을 보다가 막혔나요? 책의 문장, 코드 스니펫, 강의 내용 등을 붙여넣으세요."
                    error={errors.origin}
                    minHeight="min-h-[120px]"
                />
                {errors.origin && (
                    <p className="text-sm text-destructive">원본 맥락을 입력해주세요</p>
                )}
            </div>

            <ImageUploadZone images={images} onImagesChange={onImagesChange} />

            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                    막힌 지점 <span className="text-destructive">*</span>
                </label>
                <MarkdownTextarea
                    value={confusion}
                    onChange={(e) => onConfusionChange(e.target.value)}
                    placeholder="무엇을 몰랐나요? 어디서 멈췄나요? 구체적으로 적을수록 좋아요."
                    error={errors.confusion}
                    minHeight="min-h-[100px]"
                />
                {errors.confusion && (
                    <p className="text-sm text-destructive">막힌 지점을 입력해주세요</p>
                )}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                    추가 메모 (선택)
                </label>
                <Input
                    value={memo}
                    onChange={(e) => onMemoChange(e.target.value)}
                    placeholder="기타 메모 사항"
                    className="bg-background border border-border focus:border-foreground"
                />
            </div>
        </motion.div>
    )
}