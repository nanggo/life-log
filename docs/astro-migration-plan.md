# SvelteKit → Astro 마이그레이션 계획

## 현재 프로젝트 요약

| 항목 | 현재 상태 |
|------|----------|
| 프레임워크 | SvelteKit 2.5 + Svelte 4 |
| 콘텐츠 | Markdown 40개 (mdsvex) |
| 스타일 | Tailwind CSS 3.x |
| 컴포넌트 | Svelte 26개 (인터랙티브 7개) |
| 배포 | Vercel (Node.js 22.x) |
| SEO | RSS, Sitemap, JSON-LD, OG Image |
| 테스트 | Vitest + Testing Library |

## 난이도 평가: 중간 (Medium)

Astro는 콘텐츠 중심 정적 사이트에 최적화된 프레임워크라 이 블로그와 궁합이 좋다. 대부분의 페이지가 정적이고, 인터랙티브 요소가 적기 때문에 Astro의 Islands Architecture가 잘 맞는다. 다만 26개 컴포넌트 변환과 데이터 레이어 재작성에 공수가 필요하다.

### 왜 Astro가 좋은 선택인가

- **Zero JS by default**: 블로그 특성상 대부분 정적 콘텐츠 → JS 번들 크기 대폭 감소
- **Content Collections**: 마크다운 포스트 관리에 타입 안전한 빌트인 지원
- **기존 remark/rehype 플러그인 재사용 가능**: mdsvex에서 쓰던 플러그인 거의 그대로 사용
- **Svelte 컴포넌트 계속 사용 가능**: 인터랙티브 부분만 `client:` directive로 island 처리

---

## Phase 1: 프로젝트 초기 설정

### 1-1. Astro 프로젝트 초기화
```bash
# 새 Astro 프로젝트 생성 (기존 프로젝트 내 또는 별도 디렉토리)
pnpm create astro@latest
```

### 1-2. 필수 통합(Integration) 설치
```bash
pnpm add @astrojs/tailwind @astrojs/svelte @astrojs/sitemap @astrojs/rss @astrojs/vercel
```

### 1-3. `astro.config.mjs` 설정
```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://blog.nanggo.net',
  output: 'static',           // 정적 빌드 (SSG)
  adapter: vercel(),
  integrations: [
    tailwind(),
    svelte(),                  // 인터랙티브 컴포넌트용
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [...],      // 기존 remark 플러그인 재사용
    rehypePlugins: [...],      // 기존 rehype 플러그인 재사용
    shikiConfig: {
      theme: 'one-dark-pro',   // Prism → Shiki (Astro 빌트인)
    },
  },
});
```

### 1-4. 기존 설정 파일 정리
- `svelte.config.js` → 삭제 (더 이상 SvelteKit 사용 안 함)
- `mdsvex.config.js` → 플러그인을 `astro.config.mjs`로 이전 후 삭제
- `vite.config.ts` → Astro가 내부적으로 Vite 사용, 필요한 설정만 astro config에 병합
- `tailwind.config.cjs`, `postcss.config.cjs` → 그대로 유지

---

## Phase 2: Content Collections 설정

### 2-1. 콘텐츠 스키마 정의

```
src/
  content/
    config.ts          # 콘텐츠 스키마 정의
    posts/
      *.md             # 기존 /posts/*.md 이동
```

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string().optional(),
    category: z.enum(['일상', '개발', '생각', '리뷰']).default('개발'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    image: z.string().optional(),
    updated: z.string().optional(),
  }),
});

export const collections = { posts };
```

### 2-2. 마크다운 파일 이전
- `/posts/*.md` → `/src/content/posts/*.md`
- frontmatter 형식은 거의 동일하므로 큰 수정 불필요
- `tags` 필드가 `#` 구분자 문자열인 파일이 있으면 배열로 통일

### 2-3. 데이터 유틸리티 재작성

기존 `src/lib/data/posts.ts`의 역할을 Astro Content Collections API로 대체:

```ts
// src/lib/data/posts.ts (Astro 버전)
import { getCollection } from 'astro:content';

export async function getAllPosts() {
  const posts = await getCollection('posts', ({ data }) => {
    return import.meta.env.DEV || !data.draft;
  });
  return posts.sort((a, b) =>
    new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );
}

export async function getPostsByCategory(category: string) { ... }
export async function getPostsByTag(tag: string) { ... }
export async function getAllTags() { ... }
```

**주의**: 기존 `posts.ts`에 있던 reading time 계산, preview 추출, 이미지 최적화 로직은 remark 플러그인이나 별도 유틸로 분리해야 한다.

---

## Phase 3: 라우팅 및 페이지 변환

### SvelteKit → Astro 라우트 매핑

| SvelteKit | Astro | 비고 |
|-----------|-------|------|
| `src/routes/+page.svelte` | `src/pages/index.astro` | 홈페이지 |
| `src/routes/about/+page.svelte` | `src/pages/about.astro` | 소개 |
| `src/routes/post/[slug]/+page.svelte` | `src/pages/post/[slug].astro` | 포스트 상세 |
| `src/routes/posts/[[page]]/+page.svelte` | `src/pages/posts/[...page].astro` | 포스트 목록 + 페이지네이션 |
| `src/routes/posts/category/[name]/+page.svelte` | `src/pages/posts/category/[name].astro` | 카테고리 필터 |
| `src/routes/tags/+page.svelte` | `src/pages/tags/index.astro` | 태그 목록 |
| `src/routes/tags/[tag]/+page.svelte` | `src/pages/tags/[tag].astro` | 태그별 포스트 |
| `src/routes/rss.xml/+server.js` | `src/pages/rss.xml.ts` | `@astrojs/rss` 사용 |
| `src/routes/sitemap.xml/+server.js` | 자동 생성 | `@astrojs/sitemap` 통합 |
| `src/routes/api/posts-metadata/+server.ts` | `src/pages/api/posts-metadata.ts` | API 엔드포인트 |

### 페이지 변환 패턴

SvelteKit의 `+page.svelte` + `+page.server.ts` 조합이 Astro에서는 하나의 `.astro` 파일로 통합된다:

```astro
---
// 프론트매터 스크립트 (서버 사이드, +page.server.ts 역할)
import { getCollection } from 'astro:content';
import Layout from '../layouts/Base.astro';
import PostsList from '../components/PostsList.astro';

const posts = await getCollection('posts');
---

<!-- 템플릿 (+page.svelte 역할) -->
<Layout title="Posts">
  <PostsList posts={posts} />
</Layout>
```

### 레이아웃 변환

- `src/routes/+layout.svelte` → `src/layouts/Base.astro`
- `<slot />` → `<slot />` (동일한 문법)
- SEO 메타 태그, JSON-LD 스키마 → Astro `<head>` 안에 직접 삽입
- `+layout.ts`의 데이터 로딩 → 각 페이지의 프론트매터 스크립트에서 처리

---

## Phase 4: 컴포넌트 변환

### 정적 컴포넌트 (Svelte → Astro 변환)

인터랙티브 기능이 없는 컴포넌트는 `.astro` 파일로 변환한다. Astro 컴포넌트는 JS를 클라이언트에 보내지 않으므로 성능이 좋다.

| 컴포넌트 | 유형 | 변환 전략 |
|----------|------|----------|
| `PostPreview.svelte` | 정적 | → `PostPreview.astro` |
| `PostsList.svelte` | 정적 | → `PostsList.astro` |
| `PostDate.svelte` | 정적 | → `PostDate.astro` |
| `PostMeta.svelte` | 정적 (링크만) | → `PostMeta.astro` |
| `Breadcrumb.svelte` | 정적 | → `Breadcrumb.astro` |
| `Pagination.svelte` | 정적 | → `Pagination.astro` |
| `SocialLinks.svelte` | 정적 | → `SocialLinks.astro` |
| `CategoryFilter.svelte` | 정적 (링크 기반) | → `CategoryFilter.astro` |
| `TagList.svelte` | 정적 (링크 기반) | → `TagList.astro` |
| `TagCloud.svelte` | 정적 | → `TagCloud.astro` |
| `Image.svelte` | 정적 | → `Image.astro` (Astro `<Image />` 활용) |
| `Button/`, `Card/`, `Icon/` | 정적 UI | → `.astro` 파일들 |

### 인터랙티브 컴포넌트 (Svelte Island으로 유지)

클라이언트 JS가 필요한 컴포넌트는 Svelte로 유지하고 `client:` directive로 hydration:

| 컴포넌트 | 인터랙션 | Astro 사용법 |
|----------|---------|-------------|
| 다크모드 토글 | 클릭 → class 전환 | `<ThemeToggle client:load />` 또는 인라인 `<script>` |
| `ToC.svelte` | 스크롤 감지, 클릭 | `<ToC client:visible />` |
| `LazyImage.svelte` | IntersectionObserver | `<LazyImage client:visible />` |
| `VirtualList.svelte` | 가상 스크롤 | `<VirtualList client:visible />` |
| 이미지 모달 | 클릭 → 모달 열기 | 인라인 `<script>` (vanilla JS) |

**참고**: 다크모드 토글과 이미지 모달은 Svelte 없이 인라인 `<script>` + vanilla JS로 구현하면 번들 크기를 더 줄일 수 있다.

---

## Phase 5: 마크다운 처리 파이프라인

### 기존 remark/rehype 플러그인 호환성

| 플러그인 | 호환성 | 조치 |
|---------|--------|------|
| `rehype-slug` | 호환 | 그대로 사용 |
| `rehype-autolink-headings` | 호환 | 그대로 사용 |
| `remark-reading-time` | 호환 | 그대로 사용 |
| `@vcarl/remark-headings` | 호환 | 그대로 사용 |
| `remark-optimized-images` (커스텀) | 호환 | 그대로 사용 |
| `optimizeExternalImages` (커스텀 rehype) | 호환 | 그대로 사용 |
| `videos` (커스텀 remark) | 호환 | 그대로 사용 |
| `headings` (커스텀 remark) | 부분 호환 | `vfile.data.fm` 대신 `vfile.data.astro.frontmatter` 사용으로 수정 |

### Prism → Shiki 전환

Astro는 Shiki를 빌트인으로 지원한다. `prism.css`를 제거하고 Shiki 테마를 설정하면 된다.
기존 Prism 스타일과 최대한 비슷한 테마를 선택하면 된다.

---

## Phase 6: SEO 및 부가 기능

### RSS 피드
```ts
// src/pages/rss.xml.ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts');
  return rss({
    title: '낭고넷',
    description: '...',
    site: context.site,
    items: posts.map(post => ({ ... })),
  });
}
```

### Sitemap
- `@astrojs/sitemap` 통합 추가만 하면 자동 생성 → 기존 서버 라우트 삭제

### JSON-LD 구조화 데이터
- `$lib/utils/json-ld.ts` → 그대로 사용 가능
- 레이아웃의 `<head>`에서 `<script type="application/ld+json">` 직접 출력

### OG Image
- 기존 `og-image-korean.vercel.app` 외부 서비스 방식 → 그대로 유지
- 또는 `@vercel/og` 사용으로 전환 가능 (선택)

### Vercel Analytics
- `@vercel/analytics` → Astro에서도 `<script>` 태그로 주입 가능
- `@vercel/speed-insights` → 동일

---

## Phase 7: 테스트 및 QA

### 테스트 전략
- **기존 Vitest 테스트**: 순수 유틸리티 함수 테스트(`date.ts`, `cache.ts` 등)는 그대로 유지
- **컴포넌트 테스트**: `@testing-library/svelte` → Astro 컴포넌트는 별도 테스트 도구 필요 (또는 E2E로 전환)
- **E2E 테스트 추가 권장**: Playwright로 주요 플로우 검증

### QA 체크리스트
- [ ] 모든 40개 포스트 정상 렌더링
- [ ] 페이지네이션 동작
- [ ] 카테고리/태그 필터링
- [ ] 다크모드 토글
- [ ] 이미지 모달
- [ ] ToC (목차) 스크롤 동작
- [ ] RSS 피드 유효성
- [ ] Sitemap 유효성
- [ ] OG 메타 태그 확인
- [ ] JSON-LD 구조화 데이터
- [ ] 모바일 반응형
- [ ] Lighthouse 성능 점수

---

## Phase 8: 배포 및 전환

### 배포 설정
```json
// vercel.json (최소한의 변경)
{
  "framework": "astro"
}
```

### 전환 절차
1. 별도 브랜치에서 Astro 버전 완성
2. Vercel Preview 배포로 검증
3. 기존 SvelteKit 코드 아카이브 (태그 생성)
4. main 브랜치에 Astro 버전 머지
5. Production 배포

---

## 삭제 가능한 의존성

마이그레이션 후 제거 가능한 패키지들:

| 패키지 | 이유 |
|--------|------|
| `@sveltejs/kit` | Astro로 대체 |
| `@sveltejs/adapter-vercel` | `@astrojs/vercel`로 대체 |
| `@sveltejs/vite-plugin-svelte` | Astro Svelte 통합이 처리 |
| `mdsvex`, `mdsvex-relative-images` | Astro 빌트인 마크다운으로 대체 |
| `svelte-preprocess` | 불필요 |
| `svelte-check` | `astro check`로 대체 |
| `prettier-plugin-svelte` | `.astro` 파일용 플러그인으로 교체 |
| `eslint-plugin-svelte` | `.astro` 파일용으로 교체 |
| `node-html-parser` | Content Collections가 처리 |
| `gray-matter` | Content Collections가 처리 |

**유지**: `svelte` (인터랙티브 island 컴포넌트용으로 계속 필요)

---

## 추가할 의존성

| 패키지 | 용도 |
|--------|------|
| `astro` | 코어 프레임워크 |
| `@astrojs/tailwind` | Tailwind 통합 |
| `@astrojs/svelte` | Svelte island 통합 |
| `@astrojs/sitemap` | Sitemap 자동 생성 |
| `@astrojs/rss` | RSS 피드 생성 |
| `@astrojs/vercel` | Vercel 배포 어댑터 |
| `@astrojs/check` | 타입 체크 |
| `prettier-plugin-astro` | Astro 파일 포매팅 |

---

## 작업량 추정

| Phase | 작업 항목 수 | 난이도 |
|-------|------------|--------|
| 1. 프로젝트 설정 | 4개 파일 | 낮음 |
| 2. Content Collections | 스키마 + 40개 MD 이전 + 유틸 재작성 | 중간 |
| 3. 라우팅/페이지 | 10개 라우트 변환 | 중간 |
| 4. 컴포넌트 | 12개 정적 변환 + 5개 인터랙티브 조정 | 중간~높음 |
| 5. 마크다운 처리 | 플러그인 이전 + 1개 수정 | 낮음 |
| 6. SEO/부가기능 | RSS, Sitemap, JSON-LD, Analytics | 낮음 |
| 7. 테스트/QA | 테스트 수정 + 전체 QA | 중간 |
| 8. 배포 | 설정 + 전환 | 낮음 |

### 핵심 리스크
1. **커스텀 remark 플러그인의 `headings`**: `vfile.data.fm` → `vfile.data.astro.frontmatter` 변경 필요
2. **이미지 처리 파이프라인**: `posts.ts`의 preview 추출/최적화 로직 재구성 필요
3. **컴포넌트 테스트**: Testing Library 기반 테스트를 Astro에 맞게 수정 필요
