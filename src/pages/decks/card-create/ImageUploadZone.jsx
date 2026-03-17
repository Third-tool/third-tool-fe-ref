import { useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils.js'

export function ImageUploadZone({ images, onImagesChange }) {
    const [isDragOver, setIsDragOver] = useState(false)

    const handleDragOver = useCallback((e) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e) => {
        e.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setIsDragOver(false)
        const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
        handleFiles(files)
    }, [images, onImagesChange])

    const handleFileInput = useCallback((e) => {
        const files = Array.from(e.target.files || [])
        handleFiles(files)
    }, [images, onImagesChange])

    const handleFiles = (files) => {
        files.forEach(file => {
            const reader = new FileReader()
            reader.onloadend = () => {
                onImagesChange([...images, reader.result])
            }
            reader.readAsDataURL(file)
        })
    }

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index)
        onImagesChange(newImages)
    }

    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground">
                이미지 첨부 (선택)
            </label>

            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer',
                    'flex flex-col items-center justify-center gap-2',
                    isDragOver
                        ? 'border-foreground bg-secondary'
                        : 'border-border hover:border-muted-foreground'
                )}
            >
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileInput}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                    이미지를 드래그하거나 클릭해서 업로드
                </p>
            </div>

            <AnimatePresence>
                {images.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-3"
                    >
                        {images.map((image, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="relative group"
                            >
                                <div className="w-20 h-20 rounded-lg overflow-hidden border border-border bg-card">
                                    <img
                                        src={image}
                                        alt={`업로드 이미지 ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
