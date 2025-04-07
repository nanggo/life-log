/**
 * 웹사이트 스키마 데이터 생성
 * @param {Object} params - 웹사이트 파라미터
 * @returns {Object} - JSON-LD 스키마 데이터
 */
export const generateWebsiteSchema = ({ name, url, description }) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name,
  url,
  description
})

/**
 * 블로그 포스트 스키마 데이터 생성
 * @param {Object} post - 포스트 데이터
 * @param {Object} author - 작성자 정보
 * @param {string} websiteUrl - 웹사이트 URL
 * @returns {Object} - JSON-LD 스키마 데이터
 */
export const generateBlogPostSchema = (post, author, websiteUrl) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: post.title,
  description: post.preview?.text || '',
  image: post.image || `${websiteUrl}/og-image.jpg`,
  datePublished: new Date(post.date).toISOString(),
  dateModified: post.updated
    ? new Date(post.updated).toISOString()
    : new Date(post.date).toISOString(),
  author: {
    '@type': 'Person',
    name: author.name,
    url: websiteUrl
  },
  publisher: {
    '@type': 'Organization',
    name: author.name,
    logo: {
      '@type': 'ImageObject',
      url: author.avatar || `${websiteUrl}/logo.png`
    }
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${websiteUrl}/post/${post.slug}`
  }
})

/**
 * 사람 스키마 데이터 생성
 * @param {Object} person - 개인 정보
 * @param {string} websiteUrl - 웹사이트 URL
 * @returns {Object} - JSON-LD 스키마 데이터
 */
export const generatePersonSchema = (person, websiteUrl) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: person.name,
  url: websiteUrl,
  image: person.avatar || `${websiteUrl}/avatar.jpg`,
  jobTitle: person.jobTitle || '',
  sameAs: [
    person.github ? `https://github.com/${person.github}` : '',
    person.twitter ? `https://twitter.com/${person.twitter}` : '',
    person.linkedin ? `https://linkedin.com/in/${person.linkedin}` : ''
  ].filter(Boolean)
})
