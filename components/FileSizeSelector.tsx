'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FileSizeSelectorProps {
  file: File
  targetSize: number
  setTargetSize: (size: number) => void
  customSize: number | null
  setCustomSize: (size: number | null) => void
}

export default function FileSizeSelector({
  file,
  targetSize,
  setTargetSize,
  customSize,
  setCustomSize
}: FileSizeSelectorProps) {
  const [isCustom, setIsCustom] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')

  // Reset state when file changes
  useEffect(() => {
    setError(null)
    setIsCustom(false)
    setInputValue('')
    setCustomSize(null)
    if (file.size < 1024 * 1024) {
      setTargetSize(Math.round(file.size * 0.75))
    } else {
      setTargetSize(1024 * 1024) // 1MB default for files larger than 1MB
    }
  }, [file, setTargetSize, setCustomSize])

  const calculateSizes = () => {
    const fileSize = file.size
    const sizes = [
      { label: '25%', value: Math.round(fileSize * 0.25) },
      { label: '50%', value: Math.round(fileSize * 0.5) },
      { label: '75%', value: Math.round(fileSize * 0.75) },
    ]
    
    // Add fixed sizes based on file size
    const fixedSizes = [
      { size: 1, label: '1 MB' },
      { size: 2, label: '2 MB' },
      { size: 5, label: '5 MB' },
      { size: 10, label: '10 MB' },
    ]

    for (const { size, label } of fixedSizes) {
      const bytes = size * 1024 * 1024
      if (bytes < fileSize) {
        sizes.push({ label, value: bytes })
      }
    }
    
    return sizes
  }

  const handleCustomSizeChange = (value: string) => {
    setInputValue(value)
    const size = parseFloat(value)
    
    if (value === '') {
      setError(null)
      setCustomSize(null)
      return
    }

    if (isNaN(size)) {
      setError('Please enter a valid number')
      return
    }

    if (size <= 0) {
      setError('Size must be greater than 0')
      return
    }

    const bytes = size * 1024 * 1024
    if (bytes >= file.size) {
      setError('Target size must be smaller than the original file size')
      return
    }

    if (bytes < 1024) { // 1KB minimum
      setError('Size must be at least 0.001 MB')
      return
    }

    setError(null)
    setCustomSize(bytes)
    setTargetSize(bytes)
  }

  const sizes = calculateSizes()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Select target file size:</h2>
        <p className="text-sm text-muted-foreground">
          Current file size: {(file.size / (1024 * 1024)).toFixed(2)} MB
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {sizes.map((size) => (
          <motion.button
            key={size.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setTargetSize(size.value)
              setCustomSize(null)
              setIsCustom(false)
              setError(null)
              setInputValue('')
            }}
            className={`px-4 py-2 rounded-full ${
              !isCustom && targetSize === size.value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {size.label}
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCustom(true)}
          className={`px-4 py-2 rounded-full ${
            isCustom
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          Custom
        </motion.button>
      </div>

      {isCustom && (
        <div className="space-y-2">
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-xs space-y-2">
              <Label htmlFor="customSize">Custom size (MB)</Label>
              <Input
                id="customSize"
                type="number"
                min="0.001"
                step="0.1"
                value={inputValue}
                onChange={(e) => handleCustomSizeChange(e.target.value)}
                placeholder={`Enter size (max ${(file.size / (1024 * 1024)).toFixed(2)})`}
              />
            </div>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}

