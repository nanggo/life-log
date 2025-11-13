---
title: 'Next.js에서 MFE 환경의 경로 이슈를 우회하는 법'
slug: 'nextjs-mfe-internal-path-workaround'
date: '2025-11-11 23:58:43'
category: '개발'
tags:
  - nextjs
  - micro-frontend
  - frontend
draft: false
description: 'Next.js 14.2 Pages Router 기반 단일 앱을 MFE로 전환하는 과정에서 /_next/data, /_next/image 등의 내부 경로가 게이트웨이 정책과 충돌해 404가 발생하는 문제를 basePath/assetPrefix/rewrites/번들 치환으로 우회한 사례.'
---

> **환경**: 본 글은 **Next.js 14.2 · Pages Router 기준**으로 재현/검증했습니다.<br />
> **주의**: 본문에서 `/app`은 basePath를 뜻하며, App Router의 `app/` 디렉터리와 무관합니다.

원래는 `/app` 아래에서 하나의 Next.js 애플리케이션(단일 프런트엔드)로 서비스가 동작하고 있었다. 이때는 게이트웨이가 `/app/*` 전체를 허용해서 `/_next/data` 요청도 문제 없이 통과했다.

이후 개발 편의성과 유지보수성을 높이기 위해 기능 단위로 쪼개는 MFE(Micro Frontend) 전환 작업을 진행했고, 새로 분리된 기능은 `/app/feature` 하위에 두었다. 게이트웨이 정책도 이 기능만 스코프링하기 위해 `/app/feature/*`만 허용하도록 변경했다.

문제는 Next.js가 여전히 예전처럼 `/app/_next/data`, `/app/_next/image`와 같은 메인 앱 기준 내부 경로를 사용하고 있었다는 점이다. 결과적으로 게이트웨이가 허용하는 `/app/feature/*` 안에서는 `/_next` 자원을 찾을 수 없어 404 오류가 발생하기 시작했다. 이 글에서는 이 문제를 어떻게 분석하고 우회했는지 정리한다.

### 문제 상황

요약하면, MFE 구조상 모든 제품은 `/app`라는 공통 basePath 아래 위치하며, 이번 기능은 `/app/feature` 하위에 추가되었다. Next.js는 페이지 라우팅 시 내부적으로 자원을 `/_next/*` 경로에서 가져오는데, 서버 정책이 오직 `/app/feature/*` 경로만 허용해서 문제가 발생했다.

- CSR 페이지 전환 시 `/_next/data`의 JSON 프리패치가 404 발생 (Pages Router 기준)
- `next/image` 컴포넌트를 사용하는 이미지 일부가 404 발생
- 개발/운영 환경에서 재현 빈도가 달라 디버깅이 어려웠다

### 원인 분석

정리하면, 단일 앱일 때는 게이트웨이 스코프(`/app/*`)와 Next.js 내부 경로(`/app/_next/*`)가 일치해서 문제가 없었다. 하지만 MFE 전환 이후에는 게이트웨이 스코프가 `/app/feature/*`로 줄어든 반면, Next.js는 여전히 `/app/_next/data` 같은 루트 기준 내부 경로를 사용했고, 이 둘 사이에 틈이 생긴 것이 핵심 원인이었다.

Next.js는 기본적으로 내부 데이터 요청(`/_next/data`)에 `assetPrefix`를 적용하지 않고 `basePath`만 적용한다. 따라서 클라이언트는 `/app/_next/data/...`로 요청하지만, 서버 정책은 `/app/feature/*`로 제한되어 있어 요청이 허용되지 않았다.

기존 리라이트 규칙도 `/feature/_next/:path* → /_next/:path*`로 설정되어 있었지만, 클라이언트 요청 자체에 `/feature` 접두사가 없었기에 리라이트도 동작하지 않았다.

결과적으로 Next.js의 CSR과 SSR 처리 방식의 차이가 겹치면서 특정 경로 전환에서만 404 오류가 발생하는 현상이 나타났다.

### 해결 전략

인프라의 nginx 설정을 수정하면 근본적인 해결이 가능했지만, 여건상 어려워서 Next.js 구성에서 우회적으로 해결했다.

핵심 아이디어는 클라이언트 요청의 "겉" 경로를 기능 스코프 아래(`/app/feature/_next/*`)로 만들고, 서버에서 리라이트를 이용해 Next.js 표준 핸들러가 처리하도록 했다.

적용한 주요 변경 사항은 다음과 같다.

#### 1) basePath와 assetPrefix 관리

- 앱 전체는 `basePath = '/app'`로 동작.
- 프로덕션에서만 `assetPrefix`를 `'/app/feature'`로 설정해 **정적 자산** 요청을 기능 스코프 아래로 유도.

#### 2) next/image 경로 조정

- 내장 이미지 최적화 경로 프리픽스를 `${basePath}/${featureName}/_next/image`로 명시해 게이트웨이 정책과 일치시킴.

#### 3) 클라이언트 요청 경로 치환

- Webpack의 `string-replace-loader`로 번들 내 `/_next/data`를 `/feature/_next/data`로 치환(클라이언트 전용).

#### 4) 서버 리라이트 유지 (+@ 팁)

- 기본 리라이트(배열 반환) 규칙으로 `/feature/_next/:path*` → `/_next/:path*`를 유지.
- **+@ 팁**: 동일 규칙을 `beforeFiles` 단계로 올리면 파일시스템/정적 자원 검사 전에 선제적으로 매칭되므로, 내부 경로 우선순위를 더 확실히 보장할 수 있다.

---

### 최종 `next.config.mjs` (ESM, Next 14.2 · Pages Router)

```js
// next.config.mjs
const basePath = '/app'
const featureName = 'feature'

/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath,
  assetPrefix: process.env.NODE_ENV === 'production' ? `${basePath}/${featureName}` : '',
  images: {
    deviceSizes: [768, 1024, 1920],
    path: `${basePath}/${featureName}/_next/image`
  },
  async rewrites() {
    // 기본: 배열 반환(파일시스템 확인 이후, 동적 라우트 이전에 평가)
    return [{ source: '/feature/_next/:path*', destination: '/_next/:path*' }]

    // +@ 팁: 우선순위를 더 높이고 싶다면 beforeFiles로 변경
    // return {
    //   beforeFiles: [
    //     { source: '/feature/_next/:path*', destination: '/_next/:path*' },
    //   ],
    // };
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.module.rules.push({
        test: /\.[cm]?js$/, // 클라이언트 번들 대상
        loader: 'string-replace-loader',
        options: {
          search: '/_next/data',
          replace: `/${featureName}/_next/data`
        }
      })
    }
    return config
  }
}

export default nextConfig
```

### 검증

Dev와 Prod 환경 모두에서 다음 사항을 확인했다.

- `/app/feature/_next/data` 요청이 정상 처리됨
- 이미지 요청이 `/app/feature/_next/image`로 정상 응답됨
- CSR 페이지 전환 시 404가 발생하지 않음

### 트레이드오프 및 주의점

- `string-replace-loader`는 Next.js의 내부 구현에 의존하는 임시 패치로, Next.js 업그레이드시 영향 범위를 반드시 검토해야 한다.
- 이상적인 해결책은 인프라(nginx 등) 레벨에서 허용 경로를 확장하거나 앱의 basePath 자체를 조정하는 것이다.

### 교훈

- Next.js의 `basePath`와 `assetPrefix`의 적용 범위는 명확히 다르며, `/_next/data` 등 특정 경로에서는 `assetPrefix`가 적용되지 않는다.
- MFE와 같이 기능별로 스코프가 제한된 환경에서는, Next.js 내부 경로를 어떻게 관리할지 전략적으로 접근해야 한다.
- 임시적인 코드 변경보다는 장기적으로 인프라와의 계약을 개선하는 방향을 추구하는 것이 바람직하다.
