---
title: 'Git Worktree로 Claude Code 병렬 개발하기'
slug: 'git-worktree-parallel-development'
date: '2025-07-10'
tags:
  - git
draft: false
---

Claude Code를 사용하다 보면 이런 상황을 맞닥뜨린다. 메인 기능 개발 중인데 갑자기 긴급 버그가 생겨서 핫픽스를 해야 하는 상황. 브랜치를 전환하면 Claude Code의 컨텍스트가 날아가고, 다시 돌아와서 작업 흐름을 복구하는 데 시간이 오래 걸린다.

**Git worktree를 사용하면 같은 저장소에서 여러 브랜치를 동시에 체크아웃할 수 있다.** 즉, Claude Code 세션을 여러 개 띄워서 병렬로 개발할 수 있다는 얘기다.

## 왜 Git Worktree가 필요한가?

기존 방식의 문제점은 명확하다:

1. **컨텍스트 손실**: 브랜치를 전환할 때마다 Claude Code가 현재 작업 상황을 잃는다
2. **비효율적인 전환**: `git stash` → `git checkout` → `git stash pop` 과정의 번거로움
3. **작업 흐름 단절**: 집중력이 끊기고 다시 몰입하는 데 시간이 걸린다

Git worktree는 이런 문제를 해결한다. 같은 저장소의 서로 다른 브랜치를 별도 디렉토리에서 동시에 작업할 수 있게 해준다.

## 기본 사용법

### 새로운 worktree 생성

```bash
# 새 브랜치와 함께 worktree 생성
git worktree add ../project-hotfix -b hotfix/urgent-bug main

# 기존 브랜치로 worktree 생성
git worktree add ../project-feature feature/new-ui
```

### worktree 목록 확인

```bash
git worktree list
```

### worktree 제거

```bash
# 작업 완료 후 정리
git worktree remove ../project-hotfix
```

## Claude Code와 함께 사용하기

실제 워크플로우는 이렇다:

1. **메인 작업 디렉토리**에서 Claude Code로 새 기능 개발 중
2. **긴급 버그 발견** → 새 worktree 생성
3. **별도 터미널**에서 핫픽스 디렉토리로 이동해 Claude Code 실행
4. **두 개의 Claude Code 세션**이 각각 독립적으로 작업

```bash
# 현재 디렉토리: /Users/dev/my-project (메인 기능 개발)
# Claude Code 세션 1에서 작업 중...

# 새 터미널에서
git worktree add ../my-project-hotfix -b hotfix/login-error main
cd ../my-project-hotfix
claude-code  # 새로운 Claude Code 세션 시작
```

이렇게 하면 각 세션이 독립적인 컨텍스트를 유지하면서 병렬 개발이 가능하다.

## 실용적인 예시

### 상황: 리액트 프로젝트에서 UI 개발 중 API 버그 발견

```bash
# 1. 현재 상황: feature/dashboard 브랜치에서 작업 중
pwd  # /Users/dev/my-react-app
git branch  # * feature/dashboard

# 2. 핫픽스용 worktree 생성
git worktree add ../my-react-app-hotfix -b hotfix/api-fix main

# 3. 핫픽스 디렉토리로 이동해서 Claude Code 실행
cd ../my-react-app-hotfix
claude-code

# 4. 핫픽스 완료 후 정리
git worktree remove ../my-react-app-hotfix
```

### 팀 리뷰 시나리오

```bash
# PR 리뷰를 위한 임시 worktree 생성
git worktree add ../review-pr-123 origin/feature/colleague-feature

# 리뷰 완료 후 정리
git worktree remove ../review-pr-123
```

## 주의사항

### 1. 같은 브랜치 중복 체크아웃 불가

```bash
# 이미 main 브랜치가 체크아웃된 상태에서
git worktree add ../another-main main
# fatal: 'main' is already checked out
```

### 2. 디스크 공간 사용량

각 worktree마다 작업 파일들이 복사되므로 용량을 차지한다. 다만 `.git` 디렉토리는 공유하므로 완전히 새로 클론하는 것보다는 효율적이다.

### 3. 너무 많은 worktree 생성 금지

5개 이상의 worktree를 동시에 관리하면 오히려 복잡해진다. 작업 완료 후 바로 정리하는 습관이 중요하다.

## 개인적인 경험

Claude Code를 사용하면서 git worktree의 진가를 알게 됐다. 프로젝트를 동시에 관리할 때 유용했다. 각 프로젝트의 컨텍스트를 유지하면서 빠르게 전환할 수 있어 생산성이 크게 향상됐다.

다만 모든 상황에서 필요한 건 아니다. 단순한 기능 개발이나 혼자 작업할 때는 기존 방식이 더 단순할 수 있다. 하지만 AI 도구를 활용한 병렬 개발에서는 게임 체인저다.

Git worktree는 단순한 Git 기능을 넘어서 AI 시대의 개발 워크플로우를 혁신하는 도구다. Claude Code와 함께 사용하면 진정한 멀티태스킹 개발 환경을 구축할 수 있다.
