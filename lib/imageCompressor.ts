import sharp from 'sharp'

export async function compressImage(
  input: Buffer,
  quality: number
): Promise<Buffer> {
  return sharp(input)
    .jpeg({ quality: Math.round(quality * 100) })
    .toBuffer()
}

