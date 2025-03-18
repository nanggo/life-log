---
title: "맥 독바 바로 숨기기"
date: 2024-03-27T11:04:38.000Z
tags:
  - mac
  - dock
thumbnail: ''
draft: false
slug: "hide-mac-dock-bar"
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
