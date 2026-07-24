/**
 * 포스트 이미지의 반응형 변형본(srcset) 관련 공용 헬퍼.
 * scripts/copy-images.js가 생성하는 image-manifest.json과 함께 사용합니다.
 */

/** 본문 컬럼 폭(672px)의 1x와 최대 2x 후보 */
export const VARIANT_WIDTHS = [672, 1344]

/** 본문/히어로 이미지의 실제 표시 폭 */
export const POST_IMAGE_SIZES = '(min-width: 704px) 672px, 100vw'

/** @param {Record<string, unknown>} manifest */
export const sortImageManifest = (manifest) =>
  Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))

/**
 * 원본보다 큰 이미지를 만들지 않으면서 작은 화면용과 최적화된 최대폭 후보를 반환합니다.
 *
 * @param {number} sourceWidth
 * @returns {number[]}
 */
export function getVariantWidths(sourceWidth) {
  if (!Number.isFinite(sourceWidth) || sourceWidth <= 0) return []

  const maxVariantWidth = Math.min(
    VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1],
    Math.floor(sourceWidth)
  )
  return [...new Set([VARIANT_WIDTHS[0], maxVariantWidth])]
    .filter((width) => width > 0 && width <= sourceWidth)
    .sort((a, b) => a - b)
}

/**
 * @param {string} src
 * @param {number} width
 * @returns {string}
 */
export const variantPath = (src, width) => `${src.replace(/\.[^./]+$/, '')}-${width}w.webp`

/**
 * @typedef {Object} ImageManifestEntry
 * @property {number} width
 * @property {number} height
 * @property {number[]} variants
 */

/**
 * @param {string} src
 * @param {ImageManifestEntry | undefined} entry
 * @returns {string | undefined}
 */
export function buildSrcset(src, entry) {
  if (!entry || !Array.isArray(entry.variants) || entry.variants.length === 0) {
    return undefined
  }

  const variants = [...new Set(entry.variants)]
    .filter((width) => Number.isFinite(width) && width > 0 && width <= entry.width)
    .sort((a, b) => a - b)
    .map((width) => `${variantPath(src, width)} ${width}w`)

  return variants.length > 0 ? variants.join(', ') : undefined
}
