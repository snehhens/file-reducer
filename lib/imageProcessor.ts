interface ProcessImageResult {
  success: boolean
  blob?: Blob
  error?: string
}

export async function processImage(
  file: File,
  targetSize: number,
  onProgress?: (progress: number) => void
): Promise<ProcessImageResult> {
  try {
    // Validation
    if (!file) return { success: false, error: 'No file provided' }
    if (!file.type.startsWith('image/')) return { success: false, error: 'File is not an image' }
    if (targetSize <= 0) return { success: false, error: 'Invalid target size' }
    if (targetSize >= file.size) {
      return { success: true, blob: new Blob([await file.arrayBuffer()], { type: file.type }) }
    }

    // Load image
    const img = new Image()
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })

    // Helper function to create blob with precise control
    const createBlob = async (width: number, height: number, quality: number): Promise<Blob> => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Could not get canvas context')

      canvas.width = width
      canvas.height = height
      
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      return new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
          file.type,
          quality
        )
      })
    }

    // Determine if this is a percentage-based target
    const isPercentageTarget = targetSize === Math.round(file.size * 0.25) ||
                              targetSize === Math.round(file.size * 0.5) ||
                              targetSize === Math.round(file.size * 0.75)

    // Initialize parameters
    const maxAttempts = 50 // Increased for more precise results
    const tolerance = isPercentageTarget ? 0.05 : 0.01 // 1% tolerance for MB targets
    let attempts = 0
    let bestResult: { blob: Blob; difference: number } | null = null

    // Binary search parameters
    let minQuality = 0.1
    let maxQuality = 1.0
    let minScale = 0.1
    let maxScale = 1.0

    // Initial values based on target type
    let currentQuality = 0.75 // Start with reasonable quality
    let currentScale = 1.0 // Start with full size

    // For MB targets, calculate initial scale more precisely
    if (!isPercentageTarget) {
      const targetRatio = targetSize / file.size
      currentScale = Math.pow(targetRatio, 0.5) // Square root for 2D scaling
      currentQuality = Math.min(0.9, Math.max(0.1, targetRatio))
    }

    // Track the last few results to detect oscillation
    const recentResults: number[] = []
    const maxRecentResults = 5
    let oscillationCount = 0
    const maxOscillations = 3

    while (attempts < maxAttempts) {
      onProgress?.(((attempts + 1) / maxAttempts) * 100)

      try {
        // Calculate dimensions
        const width = Math.max(1, Math.round(img.width * currentScale))
        const height = Math.max(1, Math.round(img.height * currentScale))
        
        // Create blob with current parameters
        const blob = await createBlob(width, height, currentQuality)
        const difference = Math.abs(blob.size - targetSize)
        const ratio = blob.size / targetSize

        // Update best result if this is better
        if (!bestResult || difference < bestResult.difference) {
          bestResult = { blob, difference }
          
          // If we're within tolerance, we're done
          if (Math.abs(ratio - 1) <= tolerance) {
            return { success: true, blob }
          }
        }

        // Track recent results to detect oscillation
        recentResults.push(blob.size)
        if (recentResults.length > maxRecentResults) {
          recentResults.shift()
        }

        // Check for oscillation
        if (recentResults.length === maxRecentResults) {
          const isOscillating = recentResults.every((size, i) => 
            i === 0 || Math.abs(size - recentResults[i - 1]) < targetSize * 0.01
          )
          if (isOscillating) {
            oscillationCount++
            if (oscillationCount >= maxOscillations) {
              // If oscillating too much, return best result
              if (bestResult && bestResult.blob.size <= file.size) {
                return { success: true, blob: bestResult.blob }
              }
            }
          }
        }

        // Adjust parameters based on result
        if (blob.size > targetSize) {
          // Too big - try reducing both quality and scale
          if (ratio > 1.5) {
            // Way too big - aggressive reduction
            currentScale = (currentScale + minScale) / 2
            currentQuality = (currentQuality + minQuality) / 2
          } else {
            // Slightly too big - fine-tune
            if (currentQuality > minQuality) {
              const reduction = Math.min(0.1, (ratio - 1) / 4)
              currentQuality = Math.max(minQuality, currentQuality - reduction)
            } else {
              currentScale *= 0.95
            }
          }
        } else {
          // Too small - try increasing quality or scale
          if (ratio < 0.75) {
            // Way too small - aggressive increase
            currentScale = Math.min(maxScale, currentScale * 1.2)
            currentQuality = Math.min(maxQuality, currentQuality * 1.2)
          } else {
            // Slightly too small - fine-tune
            if (currentQuality < maxQuality) {
              const increase = Math.min(0.1, (1 - ratio) / 4)
              currentQuality = Math.min(maxQuality, currentQuality + increase)
            } else {
              currentScale = Math.min(maxScale, currentScale * 1.05)
            }
          }
        }

        // Ensure values stay within bounds
        currentQuality = Math.min(maxQuality, Math.max(minQuality, currentQuality))
        currentScale = Math.min(maxScale, Math.max(minScale, currentScale))

        attempts++
      } catch (error) {
        console.error('Attempt failed:', error)
        attempts++
      }
    }

    // If we couldn't get within tolerance but have a better result, return it
    if (bestResult && bestResult.blob.size <= file.size) {
      return { success: true, blob: bestResult.blob }
    }

    throw new Error('Could not achieve target size')

  } catch (error) {
    console.error('Image processing error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process image'
    }
  }
}

