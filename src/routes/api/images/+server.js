import sharp from 'sharp'

// Optimize for Node.js runtime - Sharp requires Node.js environment
export const config = {
  runtime: 'nodejs', // Version-agnostic, uses Vercel's default
  maxDuration: 10 // 10 seconds max for image optimization
}

export const GET = async ({ url }) => {
  const imageUrl = url.searchParams.get('url')
  const widthParam = url.searchParams.get('w') || '800'
  const width = parseInt(widthParam, 10)

  if (!imageUrl) {
    return new Response('Image URL is required', { status: 400 })
  }

  if (isNaN(width) || width <= 0) {
    return new Response('Width parameter "w" must be a positive integer', { status: 400 })
  }

  // Validate URL and check against allowed domains to prevent SSRF
  try {
    const { hostname } = new URL(imageUrl)
    const allowedDomains = [
      'github.com',
      'avatars.githubusercontent.com',
      'camo.githubusercontent.com',
      'private-user-images.githubusercontent.com',
      'user-images.githubusercontent.com'
    ]

    if (!allowedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))) {
      return new Response('Image URL from this domain is not allowed', { status: 403 })
    }
  } catch (_error) {
    return new Response('Invalid URL format', { status: 400 })
  }

  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      return new Response('Failed to fetch image', { status: response.status })
    }

    const imageBuffer = await response.arrayBuffer()

    const optimizedImageBuffer = await sharp(Buffer.from(imageBuffer))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer()

    return new Response(optimizedImageBuffer, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable' // Cache for 1 year
      }
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error optimizing image:', error)
    return new Response('Error optimizing image', { status: 500 })
  }
}
