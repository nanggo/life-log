---
title: 맥 독바 바로 숨기기
seoTitle: 'macOS Dock 숨김 딜레이 없애기'
description: '맥북 화면을 더 넓게 쓰기 위해 Dock 자동 숨김 딜레이를 줄이는 터미널 설정을 정리했다. 기본 애니메이션이 답답할 때 defaults 명령으로 바로 적용하고 되돌릴 수 있는 macOS 사용 팁과 설정 전후 체감 차이를 남겼다.'
date: 2024-03-27T11:04:38.000Z
tags:
  - tip
  - mac
draft: false
slug: hide-mac-dock-bar
category: 개발
image: ''
---

맥북을 쓰면서 화면을 더 넓게 이용하고자 평소에는 독바를 숨겨두고 이용중이다. 숨기고 나타내는 딜레이가 유려하긴 하지만 개인적으로는 답답하다 생각했다. 그러다가 클리앙[^1]에서 팁을 보고 정리해 둔다.

```bash
defaults write com.apple.dock autohide -bool true
&& defaults write com.apple.dock autohide-delay -float 0
&& defaults write com.apple.dock autohide-time-modifier -float 0
&& killall Dock
```

```bash
defaults delete com.apple.dock autohide
&& defaults delete com.apple.dock autohide-delay
&& defaults delete com.apple.dock autohide-time-modifier
&& killall Dock
```

[^1]: https://www.clien.net/service/board/cm_mac/18645747
