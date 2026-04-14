/**
 * Resizes an image File to at most MAX_PIXELS (0.5 megapixels) while
 * maintaining the aspect ratio. Returns a JPEG base64 data URL.
 */
export function useImageResize() {
  const MAX_PIXELS = 500_000

  function resizeImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('Failed to read image file.'))
      reader.onload = (e) => {
        const img = new Image()
        img.onerror = () => reject(new Error('Failed to decode image.'))
        img.onload = () => {
          const pixels = img.width * img.height
          let width = img.width
          let height = img.height
          if (pixels > MAX_PIXELS) {
            const ratio = Math.sqrt(MAX_PIXELS / pixels)
            width = Math.floor(img.width * ratio)
            height = Math.floor(img.height * ratio)
          }
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.85))
        }
        img.src = e.target!.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  return { resizeImage }
}

