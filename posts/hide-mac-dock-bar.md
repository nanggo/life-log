---
title: 맥 독바 바로 숨기기
seoTitle: 'macOS Dock 숨김 딜레이 없애기'
description: '맥북에서 Dock을 숨겨 두고 쓰는데 나타나고 사라지는 딜레이가 답답해서, 딜레이를 없애는 defaults 명령과 원래대로 되돌리는 명령을 정리해 뒀다.'
date: 2024-03-27T11:04:38.000Z
tags:
  - tip
  - mac
draft: false
slug: hide-mac-dock-bar
category: 개발
image: ./cover.webp
imageAlt: '화면 아래 공간이 비워진 미니멀한 노트북 일러스트'
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
