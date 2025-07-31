---
title: playwright
date: '2025-01-07 14:14:33'
tags:
  - frontend
  - testing
draft: false
slug: playwright
category: 리뷰
---

요즘 [playwright](https://playwright.dev/)를 가지고 놀고 있다. 원래는 E2E 테스트용 도구인데, 반복적인 작업을 자동화하기에도 꽤 괜찮아 보였다. 기존에 셀레니움을 써서 자동화한 서비스를 플레이라이트로 바꾸면서, 훨씬 쉽고 직관적이고 VSCode나 GitHub Actions 환경과도 궁합이 잘 맞는다는 느낌을 받았다.

주기적이고 정형화된 작업을 자동화해두면 개인적으로나 업무적으로나 이득이 크다. 사실 자동화를 안 해도 큰 시간이나 노력이 필요한 건 아니지만, 한 번 자동화해두면 그 뒤로는 손쓸 일이 거의 없으니 훨씬 편하다. 게다가 E2E 테스트 환경을 간접적으로 체험할 수 있다는 점도 개발적인 측면에서 도움이 된다.

주로 세팅해둔 환경은 다음과 같다.

- **언어**: JavaScript 혹은 TypeScript
- **알림**: Telegram Bot
- **CI/CD**: GitHub Actions

솔직히 간단한 프로젝트라 JavaScript만 써도 되지만, TypeScript로 만들어보고 배포까지 해보는 과정을 경험하고 싶어서 TS로 작업해봤다.

큰 문제는 없었지만, 작업하면서 나를 괴롭힌 이슈가 두 가지 있었다.

1. **Telegram Bot 메시지 Fetch 실패 (로컬만 실패, GitHub Actions에서는 성공)**
   - 로컬은 Node LTS(현재 v20.18.1)를 사용 중이었고, GitHub Actions 환경은 v18을 썼다.
   - [이 GitHub 이슈](https://github.com/nodejs/undici/issues/1248)에서 18.16.0에서 해결됐다는 댓글을 보고 수정했다.
   - 정상 동작하는 걸 확인한 뒤 `.nvmrc`에 버전을 명시했다.

2. **로컬에서는 playwright 테스트가 잘 되는데, GitHub Actions에서는 타임아웃 발생**
   - 기본적으로 플레이라이트는 헤드리스 모드로 동작한다.
   - 새 탭을 띄운 뒤에 다이얼로그를 처리해야 하는 경우가 있는데, Actions 환경에선 다이얼로그가 제대로 뜨지 않아 타임아웃이 났다.
   - [waitForLoadState](https://playwright.dev/docs/api/class-page#page-wait-for-load-state) 같은 함수를 다이얼로그가 뜨는 컨텍스트에 추가해서 해결했다.

현재 만들어둔 자동화 서비스는 다음 세 가지다.

- 매주 로또 자동 구입 & 결과 알림
- 맥미니 기본형(학생 복지 스토어) 품절 풀림 알림 (OCI에서 Docker로 실행 중)
- 매일 잡코리아 프로필 업데이트

이렇게 간단한 작업들을 자동화해놓으니 확실히 편하다. 개발 경험도 쌓이고, 자잘한 일도 줄어드니까 일석이조라는 생각이다.
