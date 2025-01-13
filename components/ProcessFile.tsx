'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Maximize2, ChevronDown, ChevronUp, Upload } from 'lucide-react'
import ImageCompareSlider from './ImageCompareSlider'
import ProcessingSteps from './ProcessingSteps'
import { processImage } from '@/lib/imageProcessor'
import { processPDF } from '@/lib/pdfProcessor'

interface ProcessFileProps {
  file: File
  targetSize: number
  setFile: (file: File | null) => void
  type: 'image' | 'pdf'
  onClose?: () => void
}

export default function ProcessFile({ file, targetSize, setFile, type, onClose }: ProcessFileProps) {
  const [processing, setProcessing] = useState(false)
  const [processedFile, setProcessedFile] = useState<Blob | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState<string | null>(null)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [lastProcessedTargetSize, setLastProcessedTargetSize] = useState(targetSize)
  const originalPreviewUrl = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateProgress = (current: number) => {
    setProgress(current)
    setProcessingStep(Math.floor(current / 34))
  }

  const handleNewFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files[0]) {
      cleanup()
      setFile(files[0])
    }
  }

  const processFile = async () => {
    setProcessing(true)
    setError(null)
    setProgress(0)
    setProcessingStep(0)

    try {
      if (type === 'image') {
        originalPreviewUrl.current = URL.createObjectURL(file)
        const result = await processImage(file, targetSize, updateProgress)
        if (result.success && result.blob) {
          setProcessedFile(result.blob)
          setPreview(URL.createObjectURL(result.blob))
          setShowPreview(true)
          setLastProcessedTargetSize(targetSize)
        } else {
          throw new Error(result.error || 'Failed to process image')
        }
      } else if (type === 'pdf') {
        const result = await processPDF(file, targetSize, updateProgress)
        if (result.success && result.blob) {
          setProcessedFile(result.blob)
          setShowPreview(false)
          setLastProcessedTargetSize(targetSize)
        } else {
          throw new Error(result.error || 'Failed to process PDF')
        }
      }
    } catch (error) {
      console.error(`Error processing ${type}:`, error)
      setError(error instanceof Error ? error.message : `An error occurred while processing the ${type}`)
    } finally {
      setProcessing(false)
    }
  }

  const cleanup = () => {
    if (preview) URL.revokeObjectURL(preview)
    if (originalPreviewUrl.current) URL.revokeObjectURL(originalPreviewUrl.current)
    setProcessedFile(null)
    setPreview(null)
    setError(null)
    setProgress(0)
    setProcessingStep(0)
  }

  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  return (
    <div className="space-y-4 w-full max-w-2xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={type === 'image' ? 'image/*' : '.pdf'}
        onChange={handleNewFile}
      />

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="font-medium">{file.name}</h3>
          <p className="text-sm text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="my-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {processing ? (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <ProcessingSteps currentStep={processingStep} />
          <Progress value={progress} />
        </div>
      ) : processedFile ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Processed Size</p>
              <p className="text-sm text-muted-foreground">
                {(processedFile.size / 1024 / 1024).toFixed(2)} MB
                {' '}
                ({Math.round((1 - processedFile.size / file.size) * 100)}% reduction)
              </p>
            </div>
            {preview && originalPreviewUrl.current && type === 'image' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? (
                  <>Hide Preview <ChevronUp className="ml-2 h-4 w-4" /></>
                ) : (
                  <>Show Preview <ChevronDown className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            )}
          </div>

          {showPreview && preview && originalPreviewUrl.current && type === 'image' && (
            <div className="relative rounded-lg border bg-background p-2">
              <ImageCompareSlider
                originalUrl={originalPreviewUrl.current}
                processedUrl={preview}
                originalSize={file.size}
                processedSize={processedFile.size}
                compact={true}
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4"
                onClick={() => setShowFullscreen(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => {
                const url = URL.createObjectURL(processedFile)
                const a = document.createElement('a')
                a.href = url
                a.download = `reduced_${file.name}`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
                onClose?.()
              }}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Download Reduced File
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Another File
            </Button>
          </div>

          {targetSize !== lastProcessedTargetSize && (
            <Button
              onClick={processFile}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Process with New Target Size
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={processFile}
            className="flex-1 bg-purple-600 hover:bg-purple-700"
          >
            Process File
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Another File
          </Button>
        </div>
      )}

      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <DialogContent className="max-w-7xl w-[95vw]">
          {preview && originalPreviewUrl.current && type === 'image' && (
            <ImageCompareSlider
              originalUrl={originalPreviewUrl.current}
              processedUrl={preview}
              originalSize={file.size}
              processedSize={processedFile?.size || 0}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

