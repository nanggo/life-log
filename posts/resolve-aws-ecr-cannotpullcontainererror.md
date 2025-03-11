---
title: AWS ECR CannotPullContainerError 해결
date: 2023-03-16T16:03:34.000Z
tags:
  - aws
  - ecr
  - docker
  - troubleshooting
  - devops
draft: false
---

# 문제 발생 및 원인

예전에 발생하고 해결한 문제인데, 블로그 정리하면서 생각이 나서 정리해본다.

오래된 프로젝트가 있는데, 배포 스크립트 중에서 AWS ECR에 이미지를 배포하는 함수에서 에러가 발생해서 원인을 찾아보았다.

```bash
STOPPED (CannotPullContainerError: "Error response from daemon:
```

aws cli가 v1 -> v2로 업그레이드 되면서 기존 로그인 방식이 deprecated 되서 위와 같은 에러가 발생했다.

# 해결 방법

1. `get-login` -> `get-login-password` 로 변경
2. `--password-stdin` 옵션으로 패스워드를 입력받음

```bash
aws ecr get-login-password --region us-west-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-west-1.amazonaws.com
```

# 참고

- [44bits](https://www.44bits.io/ko/post/amazon-ecr-login-by-awscliv2)
- [aws document - get-login-password](https://docs.aws.amazon.com/cli/latest/reference/ecr/get-login-password.html)
