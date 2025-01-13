'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion'

interface ImageCompareSliderProps {
  originalUrl: string
  processedUrl: string
  originalSize: number
  processedSize: number
  compact?: boolean
}

export default function ImageCompareSlider({
  originalUrl,
  processedUrl,
  originalSize,
  processedSize,
  compact = false
}: ImageCompareSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragX = useMotionValue(0)
  const springConfig = { damping: 30, stiffness: 300 }
  const position = useSpring(50, springConfig)

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
        position.set(50)
        dragX.set(containerWidth / 2)
      }
    }
    
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [position, dragX])

  const calculatePosition = useCallback((x: number) => {
    if (!containerRef.current) return 50
    const rect = containerRef.current.getBoundingClientRect()
    const newPosition = ((x - rect.left) / rect.width) * 100
    return Math.min(100, Math.max(0, newPosition))
  }, [])

  const handleDrag = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDragging || !containerRef.current) return

    const x = 'touches' in event ? event.touches[0].clientX : event.clientX
    position.set(calculatePosition(x))
  }, [isDragging, calculatePosition, position])

  const handleDragStart = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const x = 'touches' in event ? event.touches[0].clientX : event.clientX
    position.set(calculatePosition(x))

    document.addEventListener('mousemove', handleDrag)
    document.addEventListener('touchmove', handleDrag)
    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('touchend', handleDragEnd)
  }, [calculatePosition, handleDrag, position])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
    document.removeEventListener('mousemove', handleDrag)
    document.removeEventListener('touchmove', handleDrag)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchend', handleDragEnd)
  }, [handleDrag])

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleDrag)
      document.removeEventListener('touchmove', handleDrag)
      document.removeEventListener('mouseup', handleDragEnd)
      document.removeEventListener('touchend', handleDragEnd)
    }
  }, [handleDrag, handleDragEnd])

  const formatSize = (size: number) => {
    const mb = size / (1024 * 1024)
    return mb < 0.01 ? '0.01' : mb.toFixed(2)
  }

  return (
    <div className="space-y-2">
      <div 
        ref={containerRef}
        className={`relative select-none bg-gray-50 ${
          compact ? 'h-48 sm:h-64' : 'h-[40vh] sm:h-[50vh] md:h-[60vh] max-h-[500px]'
        }`}
      >
        {/* Processed Image (Background) */}
        <img
          src={processedUrl}
          alt="Processed"
          className="absolute inset-0 h-full w-full object-contain"
        />
        
        {/* Original Image (Foreground with clip-path) */}
        <motion.div
          className="absolute inset-0"
          style={{
            clipPath: useTransform(position, value => `inset(0 ${100 - value}% 0 0)`),
            WebkitClipPath: useTransform(position, value => `inset(0 ${100 - value}% 0 0)`)
          }}
        >
          <img
            src={originalUrl}
            alt="Original"
            className="h-full w-full object-contain"
          />
        </motion.div>

        {/* Slider Handle */}
        <motion.div
          className="absolute inset-y-0 z-10 flex items-center touch-none cursor-grab active:cursor-grabbing"
          style={{ x: useTransform(position, [0, 100], [0, containerWidth]) }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <div className="relative h-full">
            {/* Vertical Line */}
            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white shadow-lg transform -translate-x-1/2" />
            
            {/* Handle */}
            <div className="absolute top-1/2 left-1/2 h-8 w-8 sm:h-12 sm:w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg flex items-center justify-center">
              <div className="w-0.5 h-6 sm:h-8 bg-gray-300" />
            </div>
          </div>
        </motion.div>

        {/* Size Labels */}
        <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 flex justify-between px-2 sm:px-4 text-[10px] sm:text-xs md:text-sm">
          <div className="bg-black/50 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            Original: {formatSize(originalSize)} MB
          </div>
          <div className="bg-black/50 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
            Processed: {formatSize(processedSize)} MB
          </div>
        </div>

        {/* Percentage Indicator */}
        <motion.div
          className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2 sm:px-4 py-0.5 sm:py-2 text-[10px] sm:text-xs md:text-sm text-white"
          style={{
            opacity: useTransform(position, value => value / 100)
          }}
        >
          {Math.round(position.get())}%
        </motion.div>
      </div>
    </div>
  )
}

