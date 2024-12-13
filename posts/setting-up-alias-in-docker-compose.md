---
title: docker-compose 별칭 설정하기
date: 2023-05-21 19:05:50
category: tip
thumbnail: ''
draft: false
---

Oracle Cloud Infrastructure(OCI)에서 Docker를 다룰 때, 매번 `docker-compose`를 길게 입력하는 게 은근 귀찮을 때가 있다. 이럴 때 `dc`라는 alias를 설정해두면 훨씬 편하게 쓸 수 있다.

우선 `~/.zshrc` 파일을 열고 아래 내용을 추가한다.

```sh
alias dc="docker-compose"
```

내용을 저장한 뒤(`:wq`), 설정을 반영하기 위해 다음 명령어를 실행한다.

```sh
source ~/.zshrc
```

이제 `docker-compose` 대신 `dc`로 간단하게 명령어를 입력할 수 있다. 예를 들어 컨테이너를 백그라운드로 올리려면 다음과 같이 하면 된다.

```sh
dc up -d
```

이렇게 설정해두면 매번 긴 명령어를 입력할 필요가 없어져 작업 흐름이 조금 더 깔끔해진다.
