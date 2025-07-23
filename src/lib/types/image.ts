/**
 * Image processing types for vite-imagetools and related functionality
 */

/**
 * Attributes for image elements processed by vite-imagetools
 */
export interface ImgAttributes {
  src: string
  width?: number
  height?: number
  [key: string]: unknown
}

/**
 * Image source data structure returned by vite-imagetools
 * Contains both the processed image sources and img attributes
 */
export interface ImageSource {
  sources: Record<string, string>
  img: ImgAttributes
}
