---
title: 'Git Bisect: 버그 추적의 비밀 무기'
date: 2025-07-10T15:30:00.000Z
tags:
  - git
  - debugging
slug: 'git-bisect-interview-debugging-tool'
draft: false
---

**"수백 개의 커밋 중에서 버그가 생긴 정확한 시점을 어떻게 찾을 건가요?"** 면접관의 이 질문에 당황했던 기억이 있다. 당시에는 `git log`로 하나씩 찾아보거나 최근 커밋부터 되돌아가며 확인하겠다고 답했지만, 다른 방법은 없는지 다시 물었다.

그때 놓친 답이 바로 **Git Bisect**다. 이진 탐색으로 버그 발생 시점을 찾는 강력한 도구인데, 알고 나면 "왜 진작 몰랐을까" 싶을 정도로 유용하다.

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

## 더 똑똑한 방법: 자동화

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

### 1. 범위 설정을 정확히 하자

```bash
# 태그 사용
git bisect good v1.2.0    # 1.2.0 버전은 정상
git bisect bad v1.3.0     # 1.3.0 버전은 문제

# 날짜 사용
git bisect good HEAD@{"2 weeks ago"}
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

Git Bisect로 7번의 테스트만으로 문제 커밋을 찾았다. 결과적으로 데이터베이스 인덱스를 잘못 삭제한 커밋이 원인이었다.

## 언제 사용하면 좋을까?

1. **회귀 버그**: 이전에는 잘 됐는데 지금은 안 되는 경우
2. **성능 저하**: 갑자기 느려진 기능
3. **테스트 실패**: 언제부터 특정 테스트가 실패했는지 모를 때
4. **배포 후 이슈**: 배포 후 문제가 생겼는데 원인 커밋을 찾을 때

## 주의사항

### 커밋 히스토리가 복잡한 경우

```bash
# merge 커밋만 확인하고 싶다면
git bisect start --first-parent
```

### 바이너리 파일 변경

이미지나 설정 파일 변경으로 인한 문제는 Git Bisect로 찾기 어려울 수 있다. 이런 경우는 커밋 메시지나 변경된 파일 목록을 먼저 확인해보자.

## 면접관이 원했던 답

면접에서 Git Bisect를 언급했다면 아마 이런 평가를 받았을 것이다:

- 효율적인 문제 해결 접근법을 안다
- Git의 고급 기능을 활용할 줄 안다
- 디버깅에 체계적으로 접근한다

Git Bisect는 단순한 Git 명령어가 아니라 **문제 해결 사고방식**을 보여주는 도구다. 무작정 커밋을 뒤지는 대신 이진 탐색으로 효율적으로 접근한다는 것 자체가 개발자의 사고 수준을 드러낸다.

## 마무리

Git Bisect는 알고 나면 정말 유용한 도구다. 버그 추적이 필요한 상황이 생기면 한 번씩 써보자. 시간도 절약되고, 동료들에게도 "Git 고수"라는 인상을 줄 수 있다.

다음 면접에서 비슷한 질문이 나온다면? "Git Bisect로 이진 탐색을 통해 효율적으로 찾겠습니다"라고 자신 있게 답할 수 있을 것이다.
