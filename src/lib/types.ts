// Post types and interfaces

export interface PostMetadata {
  title: string
  description: string
  date: string
  author?: string
  draft?: boolean
  tags: string[]
  thumbnail?: string
  preview?: {
    html: string
    text: string
  }
  slug: string
  readingTime: string
}

export interface PostHeading {
  depth: number
  value: string
}

export interface PostReference {
  slug: string
  title: string
}

export interface Post extends PostMetadata {
  slug: string
  isIndexFile: boolean
  date: string
  preview: {
    html: string
    text: string
  }
  readingTime: string
  tags: string[]
  next?: PostReference
  previous?: PostReference
  headings: PostHeading[]
}
