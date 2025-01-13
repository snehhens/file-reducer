'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import FileUpload from './FileUpload'
import FileSizeSelector from './FileSizeSelector'
import ProcessFile from './ProcessFile'

interface FileReducerProps {
  type: 'image' | 'pdf'
  onClose?: () => void
}

export default function FileReducer({ type, onClose }: FileReducerProps) {
  const [file, setFile] = useState<File | null>(null)
  const [targetSize, setTargetSize] = useState<number>(1024 * 1024) // 1MB default
  const [customSize, setCustomSize] = useState<number | null>(null)

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile)
    // Reset target size when a new file is uploaded
    setTargetSize(1024 * 1024)
    setCustomSize(null)
  }

  const getTitle = () => {
    switch (type) {
      case 'image':
        return 'Image Reducer'
      case 'pdf':
        return 'PDF Reducer'
      default:
        return 'File Reducer'
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 p-4">
      <h2 className="text-2xl font-bold mb-6">{getTitle()}</h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {!file ? (
          <FileUpload setFile={handleFileChange} type={type} />
        ) : (
          <>
            <FileSizeSelector
              file={file}
              targetSize={customSize || targetSize}
              setTargetSize={setTargetSize}
              customSize={customSize}
              setCustomSize={setCustomSize}
            />
            <ProcessFile
              file={file}
              targetSize={customSize || targetSize}
              setFile={handleFileChange}
              type={type}
              onClose={onClose}
            />
          </>
        )}
      </motion.div>
    </div>
  )
}

