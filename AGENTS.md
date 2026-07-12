# life-log Working Agreements

Markdown 기반 SvelteKit 개인 블로그다. 런타임 버전과 명령은 `package.json`을 현재 truth로 사용하고 `pnpm`을 쓴다.

## Content

- 새 글은 기존 구조를 확인하고 가능하면 `pnpm post`로 생성한다. 이 scaffold에는 필수 `description`이 없으므로 생성 후 보완한다.
- category 값은 `src/lib/types/blog.ts`를 truth로 사용한다.
- 최소 frontmatter는 `title`, `description`, `date`, `category`, `tags`다.
- frontmatter의 선택적 문자열 `preview`는 작성자 입력이다. Pipeline이 이 값이나 본문에서 최종 `{ html, text }` preview를 만들고 `readingTime`, `displayDate`를 계산하므로 이 출력 필드는 frontmatter에 수동으로 추가하지 않는다.
- 이미지 작성 규칙은 `docs/IMAGE_GUIDELINES.md`를 참고하되 실제 build 동작은 `package.json`과 `scripts/copy-images.js`를 truth로 사용한다. 현재 build는 `posts/`의 이미지를 `static/`에 복사한다.

## Changes and Verification

- `pnpm check`와 변경된 코드에 가장 가까운 `pnpm test:run -- <path>`부터 실행하고, 전체 회귀가 필요하면 `pnpm test:run`을 사용한다.
- metadata, route, RSS, sitemap 변경에는 `pnpm seo:validate`를 추가한다. 이 명령은 내부에서 `pnpm build`를 실행하고 `static/`, `.svelte-kit/`, `.seo-reports/`를 갱신하므로 실행 후 생성 diff를 확인한다.
- build pipeline이나 route 구조가 바뀌었지만 전체 SEO 검증이 필요하지 않으면 `pnpm build`를 실행하고 생성 diff를 확인한다.
- `npx vercel build`는 배포 호환성 확인용이며 일반 검증에는 사용하지 않는다. Vercel CLI가 project dependency가 아니므로 `npx`가 CLI를 다운로드할 수 있다.
