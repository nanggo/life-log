/**
 * 타입 정의 모듈 인덱스
 *
 * 모든 타입 정의를 중앙에서 export하여
 * 프로젝트 전체에서 일관되게 사용할 수 있도록 합니다.
 */

// 블로그 도메인 타입들
export type {
  Post,
  PostMetadata,
  PostPreview,
  LinkedPost,
  PostSummary,
  Author,
  Tag,
  CategoryInfo,
  Heading,
  Pagination,
  SEOMetadata,
  PostListResponse,
  PostDetailResponse,
  TagListResponse,
  SearchResponse,
  ArchiveEntry,
  ArchiveResponse,
  SiteConfig,
  ReadingTimeResult
} from './blog.js'

// enum 타입들 (값으로 사용하기 위해 별도 export)
export { Category } from './blog.js'
