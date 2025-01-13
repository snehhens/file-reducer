'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface ImagePreviewProps {
  originalUrl: string
  processedUrl: string
  originalSize: number
  processedSize: number
}

export default function ImagePreview({
  originalUrl,
  processedUrl,
  originalSize,
  processedSize
}: ImagePreviewProps) {
  const [showProcessed, setShowProcessed] = useState(true)

  return (
    <div className="space-y-2">
      <p className="text-sm text-center text-muted-foreground">
        Toggle to compare original and processed images
      </p>
      
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={originalUrl}
          alt="Original"
          className="absolute inset-0 w-full h-full object-contain"
          style={{ opacity: showProcessed ? 0 : 1 }}
        />
        <img
          src={processedUrl}
          alt="Processed"
          className="absolute inset-0 w-full h-full object-contain"
          style={{ opacity: showProcessed ? 1 : 0 }}
        />
        
        <motion.button
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white rounded-full text-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => setShowProcessed(false)}
          onHoverEnd={() => setShowProcessed(true)}
        >
          Hold to see original
        </motion.button>
      </div>

      <div className="flex justify-between text-sm">
        <span>Original: {(originalSize / 1024 / 1024).toFixed(2)} MB</span>
        <span>Processed: {(processedSize / 1024 / 1024).toFixed(2)} MB</span>
        <span>Reduction: {((1 - processedSize / originalSize) * 100).toFixed(1)}%</span>
      </div>
    </div>
  )
}

