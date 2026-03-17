import { motion } from 'framer-motion'
import { FileText, Image, Layers } from 'lucide-react'

export function ContentTypeBadge({ hasText, hasImage }) {
    const getContentType = () => {
        if (hasText && hasImage) return 'MIXED'
        if (hasImage) return 'IMAGE_ONLY'
        return 'TEXT_ONLY'
    }

    const contentType = getContentType()

    const badgeConfig = {
        TEXT_ONLY: {
            label: '텍스트',
            icon: FileText,
            color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        },
        IMAGE_ONLY: {
            label: '이미지',
            icon: Image,
            color: 'bg-green-500/20 text-green-400 border-green-500/30',
        },
        MIXED: {
            label: '복합',
            icon: Layers,
            color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        },
    }

    const { label, icon: Icon, color } = badgeConfig[contentType]

    return (
        <motion.div
            key={contentType}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${color}`}
        >
            <Icon className="w-3 h-3" />
            {label}
        </motion.div>
    )
}
