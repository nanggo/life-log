---
title: 'Git Bisect: 버그가 생긴 커밋 찾기'
seoTitle: 'Git Bisect 사용법과 버그 추적 자동화'
description: '면접에서 답하지 못한 질문을 계기로 Git Bisect 사용법을 정리했다. 이진 탐색으로 버그가 생긴 커밋을 좁히는 흐름과 스크립트로 자동화하는 방법, 주의할 점을 적었다.'
date: 2025-07-10T15:30:00.000Z
updated: '2026-09-29T14:13:13+09:00'
tags:
  - git
  - debugging
slug: git-bisect-interview-debugging-tool
draft: false
category: 개발
image: ./cover.webp
imageAlt: '커밋 경로를 반으로 나누며 버그 지점을 찾는 일러스트'
---

면접에서 "수백 개의 커밋 중에서 버그가 생긴 정확한 시점을 어떻게 찾을 건가요?"라는 질문을 받고 당황한 적이 있다. 당시에는 `git log`로 하나씩 찾아보거나 최근 커밋부터 되돌아가며 확인하겠다고 답했지만, 다른 방법은 없는지 다시 물었다.

그때 놓친 답이 Git Bisect다. 이진 탐색으로 버그가 생긴 커밋을 좁혀 가는 기능인데, 써 보고 나니 왜 진작 몰랐나 싶었다.

## Git Bisect가 뭔가?

Git Bisect는 이진 탐색 알고리즘을 사용해서 문제가 있는 커밋을 찾아내는 Git의 내장 기능이다. 수백 개의 커밋을 하나씩 확인하는 대신, 범위를 절반씩 줄여가며 효율적으로 원인을 찾을 수 있다.

예를 들어 100개의 커밋이 있다면:

- 일반적인 방법: 최대 100개 커밋 확인 (평균 50개)
- Git Bisect: 최대 7개 커밋만 확인 (log₂100 ≈ 7)

## 실제 사용 시나리오

### 상황: 로그인 기능이 갑자기 작동하지 않는다

어제까지는 잘 됐는데 오늘 배포 후 로그인이 안 된다. 지난주부터 지금까지 총 50개의 커밋이 있었고, 이 중 어느 것이 문제인지 모른다.

```bash
# 1. bisect 시작
git bisect start

# 2. 현재 상태는 문제가 있음
git bisect bad

# 3. 일주일 전 커밋은 정상이었음
git bisect good HEAD~50
```

Git이 중간 지점 (HEAD~25) 으로 자동 이동한다.

```bash
# 4. 현재 커밋에서 테스트
npm start
# 브라우저에서 로그인 테스트

# 문제없으면
git bisect good

# 문제있으면
git bisect bad
```

이 과정을 반복하면 Git이 문제가 있는 정확한 커밋을 찾아준다.

```bash
# 5. 완료 후 원래 상태로 돌아가기
git bisect reset
```

## 스크립트로 자동화하기

매번 수동으로 테스트하기 귀찮다면 스크립트로 자동화할 수 있다.

```bash
# 테스트 스크립트 작성 (test-login.sh)
#!/bin/bash
npm test -- --testNamePattern="login"
exit $?
```

```bash
# 자동으로 bisect 실행
git bisect start
git bisect bad HEAD
git bisect good HEAD~50
git bisect run ./test-login.sh
```

Git이 알아서 스크립트를 실행하며 문제 커밋을 찾아준다.

## 실전 팁

### 1. 범위 설정을 정확히 하기

```bash
# 태그 사용
git bisect good v1.2.0    # 1.2.0 버전은 정상
git bisect bad v1.3.0     # 1.3.0 버전은 문제

# 날짜 사용 (2주 전 시점의 마지막 커밋)
git bisect good $(git rev-list -1 --before="2 weeks ago" HEAD)
```

### 2. 스킵 기능 활용

컴파일이 안 되는 등 테스트할 수 없는 커밋이 있다면:

```bash
git bisect skip
```

### 3. 시각화로 진행 상황 확인

```bash
git bisect visualize
# 또는
git bisect view
```

## 실제 경험담

최근 프로젝트에서 성능 이슈가 생겼을 때 Git Bisect로 해결했다. API 응답 시간이 갑자기 2초에서 10초로 늘어났는데, 200개가 넘는 커밋 중에서 원인을 찾아야 했다.

```bash
# 성능 테스트 스크립트
#!/bin/bash
response_time=$(curl -w "%{time_total}" -s -o /dev/null localhost:3000/api/data)
if (( $(echo "$response_time > 5.0" | bc -l) )); then
    exit 1  # 5초 이상이면 문제
else
    exit 0  # 정상
fi
```

Git Bisect로 일곱 번 테스트해서 문제 커밋을 찾았다. 결과적으로 데이터베이스 인덱스를 잘못 삭제한 커밋이 원인이었다.

## 언제 사용하면 좋을까?

1. **회귀 버그**: 이전에는 잘 됐는데 지금은 안 되는 경우
2. **성능 저하**: 갑자기 느려진 기능
3. **테스트 실패**: 언제부터 특정 테스트가 실패했는지 모를 때
4. **배포 후 이슈**: 배포 후 문제가 생겼는데 원인 커밋을 찾을 때

## 주의사항

### 커밋 히스토리가 복잡한 경우

```bash
# 메인 브랜치에 들어온 커밋(first parent)만 따라가며 확인 (Git 2.29+)
git bisect start --first-parent
```

### 원인이 저장소 밖에 있는 경우

환경 변수, 외부 API, 저장소에 들어 있지 않은 DB 데이터처럼 원인이 저장소 밖에 있으면 어느 커밋으로 돌아가도 결과가 같아서 bisect로는 찾을 수 없다. 좁혀 가는 도중에 모든 커밋이 bad로 나오면 이쪽을 먼저 의심해 볼 만하다.

## 마무리

200개가 넘는 커밋을 일곱 번 만에 좁혀 본 경험은 꽤 통쾌했고, 다음에 회귀 버그를 만나면 또 쓰게 될 것 같다.

다음 면접에서 비슷한 질문을 받으면 이렇게 답하려 한다. "정상이던 커밋과 문제가 있는 커밋을 잡고, Git Bisect로 절반씩 좁혀 가겠습니다. 테스트를 스크립트로 만들 수 있으면 `git bisect run`으로 자동화하겠습니다."
