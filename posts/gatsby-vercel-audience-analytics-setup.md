---
title: gatsby에 vercel audience analytics 설정하기
date: 2023-04-12T01:05:11.000Z
tags:
  - frontend
draft: false
slug: gatsby-vercel-audience-analytics-setup
category: 개발
image: ''
---

최근 블로그 배포를 netlify에서 vercel로 변경하였다. 둘 다 비슷한 서비스고 장점과 단점이 있는데, google analytics처럼 audience를 보여주는게 좋아보여서 변경했다. Core web vital도 보여주는데 이건 netlify에서도 lighthouse 플러그인으로 확인할 수 있다.

vercel에서 audience를 붙이는 방법에 대해서 가이드를 제공하지만, gatsby에 대한 건 others에 있는 것을 참고해서 적용했다.

### Vercel Audience Analytics Setup

```js
// src/vercel-analytics.js

import { inject } from '@vercel/analytics'

export const initializeVercelAnalytics = () => {
  if (typeof window !== 'undefined') {
    inject()
  }
}
```

```js
// gatsby-browser.js

import { initializeVercelAnalytics } from './src/vercel-analytics'

exports.onClientEntry = () => {
  initializeVercelAnalytics()
}
```

블로그에 찾아오는 사람은 거의 없어서 방문자 수나 뷰 수는 적게 나오지만 정상적으로 확인 가능하다.
