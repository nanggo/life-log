// Post types and interfaces
// Note: This file is maintained for backwards compatibility
// Main types are defined in $lib/types/blog.ts

// Re-export all types from blog.ts for backwards compatibility
export type { PostMetadata, Post, LinkedPost, Heading } from '$lib/types/blog'

// Import for type aliases
import type { Heading, LinkedPost } from '$lib/types/blog'

// Legacy type aliases for backwards compatibility
export type PostHeading = Heading
export type PostReference = LinkedPost
