/**
 * 블로그 도메인 타입 정의
 *
 * 이 파일은 블로그 시스템의 핵심 타입들을 정의합니다.
 * Post, Author, Tag 등의 도메인 모델과 API 응답 타입들을 포함합니다.
 */

/**
 * 포스트 미리보기 정보
 */
export interface PostPreview {
  /** HTML 형태의 미리보기 */
  html: string
  /** 텍스트 형태의 미리보기 */
  text: string
}

/**
 * 포스트 메타데이터 (frontmatter)
 */
export interface PostMetadata {
  /** URL 슬러그 */
  slug: string
  /** 포스트 제목 */
  title: string
  /** 포스트 설명 */
  description: string
  /** 발행일 */
  date: string
  /** 업데이트일 (선택사항) */
  updated?: string
  /** 태그 목록 */
  tags: string[]
  /** 초안 여부 */
  draft?: boolean
  /** 미리보기 정보 */
  preview: PostPreview
  /** 커버 이미지 (선택사항) */
  image?: string
  /** 작성자 정보 (선택사항) */
  author?: string
  /** 읽기 시간 */
  readingTime: string
}

/**
 * 연결된 포스트 정보 (이전/다음 포스트용)
 */
export interface LinkedPost {
  /** URL 슬러그 */
  slug: string
  /** 포스트 제목 */
  title: string
}

/**
 * 포스트 요약 정보 (관련 포스트용)
 */
export interface PostSummary extends PostMetadata {
  /** URL 슬러그 */
  slug: string
}

/**
 * 완전한 포스트 정보
 */
export interface Post extends Omit<PostMetadata, 'preview'> {
  /** URL 슬러그 */
  slug: string
  /** 인덱스 파일 여부 */
  isIndexFile: boolean
  /** 미리보기 정보 */
  preview: PostPreview
  /** 읽기 시간 */
  readingTime: string
  /** 이전 포스트 */
  previous?: LinkedPost
  /** 다음 포스트 */
  next?: LinkedPost
}

/**
 * 작성자 정보
 */
export interface Author {
  /** 작성자 이름 */
  name: string
  /** 프로필 이미지 URL (선택사항) */
  avatar?: string
  /** 소개 (선택사항) */
  bio?: string
  /** 이메일 (선택사항) */
  email?: string
  /** 웹사이트 URL (선택사항) */
  website?: string
  /** 소셜 링크들 (선택사항) */
  social?: {
    github?: string
    twitter?: string
    linkedin?: string
    [key: string]: string | undefined
  }
}

/**
 * 태그 정보
 */
export interface Tag {
  /** 태그 이름 */
  name: string
  /** 태그가 사용된 포스트 수 */
  count: number
  /** 태그 설명 (선택사항) */
  description?: string
  /** 태그 색상 (선택사항) */
  color?: string
}

/**
 * 페이지네이션 정보
 */
export interface Pagination {
  /** 현재 페이지 번호 (1부터 시작) */
  page: number
  /** 전체 페이지 수 */
  totalPages: number
  /** 페이지당 항목 수 */
  perPage: number
  /** 전체 항목 수 */
  totalItems: number
  /** 이전 페이지 존재 여부 */
  hasPreviousPage: boolean
  /** 다음 페이지 존재 여부 */
  hasNextPage: boolean
  /** 이전 페이지 번호 (없으면 null) */
  previousPage: number | null
  /** 다음 페이지 번호 (없으면 null) */
  nextPage: number | null
}

/**
 * SEO 메타데이터
 */
export interface SEOMetadata {
  /** 페이지 제목 */
  title: string
  /** 페이지 설명 */
  description: string
  /** 정규 URL */
  canonical?: string
  /** Open Graph 이미지 */
  ogImage?: string
  /** Twitter 카드 타입 */
  twitterCard?: 'summary' | 'summary_large_image'
  /** 메타 키워드 */
  keywords?: string[]
  /** 로봇 메타태그 */
  robots?: string
}

/**
 * API 응답 타입들
 */

/**
 * 포스트 목록 API 응답
 */
export interface PostListResponse {
  /** 포스트 목록 */
  posts: Post[]
  /** 페이지네이션 정보 */
  pagination: Pagination
}

/**
 * 포스트 상세 API 응답
 */
export interface PostDetailResponse {
  /** 포스트 정보 */
  post: Post
  /** 관련 포스트들 (선택사항) */
  relatedPosts?: PostSummary[]
}

/**
 * 태그 목록 API 응답
 */
export interface TagListResponse {
  /** 태그 목록 */
  tags: Tag[]
  /** 총 태그 수 */
  total: number
}

/**
 * 검색 결과 API 응답
 */
export interface SearchResponse {
  /** 검색된 포스트들 */
  posts: Post[]
  /** 검색 쿼리 */
  query: string
  /** 페이지네이션 정보 */
  pagination: Pagination
}

/**
 * 아카이브 정보
 */
export interface ArchiveEntry {
  /** 년도 또는 월 */
  period: string
  /** 해당 기간의 포스트 수 */
  count: number
  /** 해당 기간의 포스트들 */
  posts: Post[]
}

/**
 * 아카이브 API 응답
 */
export interface ArchiveResponse {
  /** 아카이브 엔트리들 */
  archive: ArchiveEntry[]
  /** 총 아카이브 엔트리 수 */
  total: number
}

/**
 * 사이트 구성 정보
 */
export interface SiteConfig {
  /** 사이트 이름 */
  title: string
  /** 사이트 설명 */
  description: string
  /** 사이트 URL */
  url: string
  /** 기본 작성자 정보 */
  author: Author
  /** 사이트 언어 */
  language: string
  /** 사이트 로고 (선택사항) */
  logo?: string
  /** 파비콘 (선택사항) */
  favicon?: string
  /** 소셜 미디어 링크들 */
  social: {
    [platform: string]: string
  }
  /** 구글 애널리틱스 ID (선택사항) */
  googleAnalytics?: string
  /** 페이지당 포스트 수 */
  postsPerPage: number
}

/**
 * 읽기 시간 계산 결과
 */
export interface ReadingTimeResult {
  /** 읽기 시간 텍스트 (예: "5 min read") */
  text: string
  /** 예상 읽기 시간 (분) */
  minutes: number
  /** 총 단어 수 */
  words: number
}
