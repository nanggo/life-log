import sharp from 'sharp'

export const GET = async ({ url }) => {
  const imageUrl = url.searchParams.get('url')
  const width = parseInt(url.searchParams.get('w') || '800', 10)

  if (!imageUrl) {
    return new Response('Image URL is required', { status: 400 })
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
    console.error('Error optimizing image:', error)
    return new Response('Error optimizing image', { status: 500 })
  }
}
