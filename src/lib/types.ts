// Post types and interfaces

export interface PostMetadata {
  title: string
  description: string
  date: string
  author?: string
  draft?: boolean
  tags: string[]
  thumbnail?: string
  preview: {
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
  isIndexFile: boolean
  next?: PostReference
  previous?: PostReference
  headings: PostHeading[]
}
