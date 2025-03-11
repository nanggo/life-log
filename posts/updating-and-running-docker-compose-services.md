---
title: docker-compose 서비스 업데이트 및 실행
date: 2024-07-19T17:00:00.000Z
tags:
  - docker
  - docker-compose
---

무료로 쓰고 있는 오라클 클라우드 인스턴스에서 도커 컴포즈로 개인적인 서비스들을 실행하고 있다. 가끔 생각날 때 이미지 업데이트를 해주는데, 명령어 치는 것도 귀찮아서 스크립트를 간단하게 만들었다. 사실 명령어를 치나, 스크립트를 실행하나 거기서 거기지만 심심해서 만들었다.

```bash
#!/bin/bash

# Docker Compose 서비스 업데이트 및 실행
echo "Updating and starting Docker Compose services..."
docker-compose pull && docker-compose up -d

# Docker 시스템 정리
echo "Cleaning up Docker system..."
docker system prune -f

echo "Done!"
```

`docker system prune -f`는 주의가 필요하지만, 내가 쓰는 서비스에서는 크게 문제가 없어서 넣어뒀다.
