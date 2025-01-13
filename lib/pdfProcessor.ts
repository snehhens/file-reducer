import { PDFDocument } from 'pdf-lib';

interface ProcessPDFResult {
  success: boolean;
  blob?: Blob;
  error?: string;
}

export async function processPDF(
  file: File,
  targetSize: number,
  onProgress?: (progress: number, message?: string) => void
): Promise<ProcessPDFResult> {
  try {
    // Load the PDF
    const arrayBuffer = await file.arrayBuffer();
    onProgress?.(10, 'Loading PDF');

    // Create source document
    const srcDoc = await PDFDocument.load(arrayBuffer);
    const pages = srcDoc.getPages();

    // Calculate initial scale based on target ratio
    const currentScale = Math.sqrt(targetSize / file.size);

    // Try different compression levels until we reach target size
    const attempts = [
      { scale: currentScale, quality: 0.9 },
      { scale: currentScale * 0.8, quality: 0.8 },
      { scale: currentScale * 0.7, quality: 0.7 },
      { scale: currentScale * 0.6, quality: 0.6 },
      { scale: currentScale * 0.5, quality: 0.5 },
      { scale: currentScale * 0.4, quality: 0.4 },
      { scale: currentScale * 0.3, quality: 0.3 },
    ];

    for (const { scale, quality } of attempts) {
      onProgress?.(20, `Trying compression level: ${quality}`);

      // Create new document for this attempt
      const newDoc = await PDFDocument.create();

      // Copy and scale pages
      for (let i = 0; i < pages.length; i++) {
        onProgress?.(
          30 + (i / pages.length) * 40,
          `Processing page ${i + 1}/${pages.length}`
        );

        // Copy the page
        const [page] = await newDoc.copyPages(srcDoc, [i]);
        newDoc.addPage(page);

        // Scale the page
        const { width, height } = page.getSize();
        page.setSize(width * scale, height * scale);
        page.scale(scale, scale);
      }

      // Remove metadata to reduce size
      newDoc.setTitle('');
      newDoc.setAuthor('');
      newDoc.setSubject('');
      newDoc.setKeywords([]);
      newDoc.setProducer('');
      newDoc.setCreator('');

      onProgress?.(80, 'Compressing document');

      // Save with compression
      const compressedBytes = await newDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const compressedBlob = new Blob([compressedBytes], { type: 'application/pdf' });

      // If we've reached target size or close enough, return result
      if (compressedBlob.size <= targetSize * 1.1) {
        onProgress?.(100, 'Compression complete');
        console.log(`Original size: ${file.size}, Compressed size: ${compressedBlob.size}`);
        return { success: true, blob: compressedBlob };
      }

      // If this is our last attempt and we've reduced the size, return it
      if (scale === attempts[attempts.length - 1].scale && compressedBlob.size < file.size) {
        onProgress?.(100, 'Compression complete');
        console.log(`Original size: ${file.size}, Compressed size: ${compressedBlob.size}`);
        return { success: true, blob: compressedBlob };
      }
    }

    // If we get here, try one final extreme compression
    const finalDoc = await PDFDocument.create();

    // Copy pages with minimum scale
    for (let i = 0; i < pages.length; i++) {
      const [page] = await finalDoc.copyPages(srcDoc, [i]);
      finalDoc.addPage(page);

      const { width, height } = page.getSize();
      const finalScale = 0.2; // 20% of original size
      page.setSize(width * finalScale, height * finalScale);
      page.scale(finalScale, finalScale);
    }

    onProgress?.(90, 'Applying final compression');

    const compressedBytes = await finalDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    const finalBlob = new Blob([compressedBytes], { type: 'application/pdf' });

    onProgress?.(100, 'Compression complete');
    console.log(`Original size: ${file.size}, Final size: ${finalBlob.size}`);
    return { success: true, blob: finalBlob };
  } catch (error) {
    console.error('Detailed PDF processing error:', error);
    return {
      success: false,
      error: `PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}