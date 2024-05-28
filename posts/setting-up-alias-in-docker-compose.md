---
title: docker-compose 별칭 설정하기
date: 2023-05-21 19:05:50
category: tip
thumbnail: ''
draft: false
---

Oracle Cloud Infrastructure(OCI)에서 Docker를 사용하다보면 `docker-compose` 명령어를 매번 입력해야하는 불편함이 있습니다. 이를 해결하기 위해 `dc`라는 alias를 설정해보겠습니다.

.zshrc 파일을 열어 다음을 추가합니다.

```sh
alias dc="docker-compose"
```

`:wq`로 저장하고 다음 명령어를 입력합니다.

```sh
$ source ~/.zshrc
```

```sh
$ dc up -d
```

위와 같이 `docker-compose`를 `dc`로 대체하여 사용할 수 있습니다.
