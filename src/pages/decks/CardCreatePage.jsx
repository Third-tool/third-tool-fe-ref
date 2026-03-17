import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button.jsx'
import { MainPanel } from './card-create/MainPanel'
import { KeywordsPanel } from './card-create/KeywordsPanel'
import { SummaryPanel } from './card-create/SummaryPanel'

const initialForm = {
    sourceType: null,
    origin: '',
    confusion: '',
    memo: '',
    images: [],
    keywords: [],
    summary: '',
}

export function CardCreatePage() {
    const navigate = useNavigate()
    const [form, setForm] = useState(initialForm)
    const [errors, setErrors] = useState({})
    const [isShaking, setIsShaking] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    const updateForm = useCallback((key, value) => {
        setForm(prev => ({ ...prev, [key]: value }))
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: false }))
        }
    }, [errors])

    const validate = () => {
        const newErrors = {}
        if (!form.sourceType) newErrors.sourceType = true
        if (!form.origin.trim()) newErrors.origin = true
        if (!form.confusion.trim()) newErrors.confusion = true
        if (form.keywords.length === 0) newErrors.keywords = true
        if (!form.summary.trim()) newErrors.summary = true
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (!validate()) {
            setIsShaking(true)
            setTimeout(() => setIsShaking(false), 500)
            return
        }
        console.log('카드 저장:', form)
        setShowSuccess(true)
        setTimeout(() => {
            setShowSuccess(false)
            setForm(initialForm)
        }, 2000)
    }

    const shakeVariants = {
        shake: {
            x: [0, -10, 10, -10, 10, 0],
            transition: { duration: 0.5 },
        },
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-semibold text-foreground">새 카드 만들기</h1>
                            <p className="text-xs text-muted-foreground">ThirdTool • 간격 반복 학습</p>
                        </div>
                    </div>

                    <motion.div animate={isShaking ? 'shake' : ''} variants={shakeVariants}>
                        <Button
                            onClick={handleSubmit}
                            className="gap-2 bg-foreground text-background hover:bg-foreground/90"
                        >
                            <Save className="w-4 h-4" />
                            저장하기
                        </Button>
                    </motion.div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7">
                        <MainPanel
                            sourceType={form.sourceType}
                            origin={form.origin}
                            confusion={form.confusion}
                            memo={form.memo}
                            images={form.images}
                            onSourceTypeChange={(v) => updateForm('sourceType', v)}
                            onOriginChange={(v) => updateForm('origin', v)}
                            onConfusionChange={(v) => updateForm('confusion', v)}
                            onMemoChange={(v) => updateForm('memo', v)}
                            onImagesChange={(v) => updateForm('images', v)}
                            errors={{
                                sourceType: errors.sourceType,
                                origin: errors.origin,
                                confusion: errors.confusion,
                            }}
                        />
                    </div>

                    <div className="lg:col-span-5 space-y-6">
                        <KeywordsPanel
                            keywords={form.keywords}
                            onKeywordsChange={(v) => updateForm('keywords', v)}
                            error={errors.keywords}
                        />
                        <SummaryPanel
                            summary={form.summary}
                            onSummaryChange={(v) => updateForm('summary', v)}
                            error={errors.summary}
                        />
                    </div>
                </div>
            </main>

            {/* Success Toast */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        카드가 성공적으로 저장되었습니다!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default CardCreatePage