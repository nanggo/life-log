// Post types and interfaces
// Note: This file is maintained for backwards compatibility
// Main types are defined in $lib/types/blog.ts

import type {
  PostMetadata as BlogPostMetadata,
  Post as BlogPost,
  LinkedPost,
  Heading
} from '$lib/types/blog'

// Re-export types from blog.ts for backwards compatibility
export interface PostMetadata extends BlogPostMetadata {
  // TechArticle properties (optional, for technical posts)
  proficiencyLevel?: string
  dependencies?: string
}

// Re-export compatible types
export type PostHeading = Heading
export type PostReference = LinkedPost

export interface Post extends BlogPost {
  // TechArticle properties (optional, for technical posts)
  proficiencyLevel?: string
  dependencies?: string
}
