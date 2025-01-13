'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'

interface FileUploadProps {
  setFile: (file: File) => void
  type: 'image' | 'pdf'
}

export default function FileUpload({ setFile, type }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0])
    }
  }, [setFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: type === 'image' 
      ? { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] }
      : { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  })

  return (
    <div {...getRootProps()}> {/* Wrapper div handles getRootProps() */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors duration-300 ${
          isDragActive ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive
            ? `Drop the ${type} here...`
            : `Drag 'n' drop ${type === 'image' ? 'an image' : 'a PDF'}, or click to select`}
        </p>
      </motion.div>
    </div>
  )
}