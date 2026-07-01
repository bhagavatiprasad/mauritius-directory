/**
 * Compresses and validates an image file to ensure it is in JPEG format and under 200KB.
 * Iteratively scales down quality and/or dimensions if necessary.
 */
export interface CompressionResult {
  success: boolean;
  file?: File;
  error?: string;
  originalSizeKB: number;
  compressedSizeKB?: number;
  previewUrl?: string;
}

export async function compressAndValidateImage(file: File): Promise<CompressionResult> {
  const originalSizeKB = Math.round(file.size / 1024);

  // 1. Basic Type Validation
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      success: false,
      originalSizeKB,
      error: 'Invalid file format. Please upload a JPG, JPEG, PNG, or WebP image.'
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimension bounds (e.g., 1200px)
        const MAX_DIMENSION = 1200;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            success: false,
            originalSizeKB,
            error: 'Failed to access browser canvas context.'
          });
          return;
        }

        // Draw image on white background (ensures transperancy in PNG converts nicely to JPEG)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Quality tuning loop
        let quality = 0.85;
        let attempt = 0;
        
        const tryCompress = () => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve({
                  success: false,
                  originalSizeKB,
                  error: 'Canvas export failed.'
                });
                return;
              }

              const compressedSizeKB = blob.size / 1024;

              // If it's under 200KB, or we reached maximum compression attempts, return it
              if (compressedSizeKB <= 200 || quality <= 0.1 || attempt > 5) {
                const compressedName = file.name.replace(/\.[^/.]+$/, '') + '_compressed.jpg';
                const compressedFile = new File([blob], compressedName, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });

                resolve({
                  success: compressedSizeKB <= 200,
                  file: compressedFile,
                  originalSizeKB,
                  compressedSizeKB: Math.round(compressedSizeKB),
                  previewUrl: URL.createObjectURL(blob),
                  error: compressedSizeKB > 200 ? `Image is too complex to fit under 200KB. Try a smaller or simpler image.` : undefined
                });
              } else {
                // Reduce quality and/or scale down canvas dimensions if quality is already low
                attempt++;
                quality -= 0.15;
                if (quality < 0.4) {
                  // Scale down dimensions by 20%
                  width = Math.round(width * 0.8);
                  height = Math.round(height * 0.8);
                  canvas.width = width;
                  canvas.height = height;
                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillRect(0, 0, width, height);
                  ctx.drawImage(img, 0, 0, width, height);
                }
                tryCompress();
              }
            },
            'image/jpeg',
            quality
          );
        };

        tryCompress();
      };

      img.onerror = () => {
        resolve({
          success: false,
          originalSizeKB,
          error: 'Failed to parse image data.'
        });
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      resolve({
        success: false,
        originalSizeKB,
        error: 'Failed to read file.'
      });
    };

    reader.readAsDataURL(file);
  });
}
