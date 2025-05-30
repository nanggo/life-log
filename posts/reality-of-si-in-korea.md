---
title: '대한민국 SI의 현실'
slug: 'reality-of-si-in-korea'
date: '2025-05-20 16:15:36'
tags:
  - 생각
draft: false
---

내 커리어의 절반 이상은 프리랜서로 채워졌다. 대부분 SI 프로젝트였던 내 경험을 바탕으로 대한민국 SI 업계의 현실을 이야기해보고자 한다. 물론 내가 경험한 것이 전부는 아닐 것이다. 하지만 국내 여러 기업의 크고 작은 프로젝트에 참여하면서 대부분 비슷한 문제점을 안고 있다는 것을 알게 됐다.

## 1. 언제나 촉박한 일정

프로젝트 일정은 항상 빠듯하다. 일정이 부족하면 일부 기능만 우선 개발하여 단계적으로 오픈하는 방향으로 조율해야 한다. 하지만 실제로는 프로젝트 중간에 다양한 기능이 무분별하게 추가되는 경우가 많다. 그러면서도 정해진 일정은 맞추라며 야근을 요청하지만, 나는 야근을 하지 않는 편이다.

## 2. 항상 부족한 예산과 인력

예산이 부족하니 투입되는 인력도 부족할 수밖에 없다. 세 명이 해야 할 일을 혼자 감당해야 하는 경우도 비일비재하다. 심지어 인건비를 아끼기 위해 풀스택 개발자를 선호하지만, 프론트엔드나 백엔드 중 하나라도 제대로 하는 사람을 찾기 어려운 경우도 있다. 일부 프리랜서 개발자 중에는 'Ctrl+C, Ctrl+V 하면 되는 것 아니냐'는 안일한 생각을 가진 사람도 있다.

## 3. 본인들이 무엇을 원하는지 모르는 클라이언트

클라이언트는 자신이 무엇을 원하는지 정확히 모르는 경우가 많다. 기존 시스템의 기능을 '그대로' 새로운 기술 스택으로 옮겨달라고 요청하는 식이다. 예를 들어, 윈도우 데스크톱 전용 프로그램을 웹 애플리케이션으로 단순히 똑같이 구현해달라는 요구가 그렇다. 이 과정에서 두 환경의 근본적인 차이를 이해하려 하지 않고, '무조건 해줘!'라고 고집하는 경우가 대부분이다. 결국 기괴한 UI가 탄생하고 일반적인 UX는 무시되는 결과로 이어진다.

## 4. 부실한 기획과 소통 부재

제대로 된 기획서를 기대하기 어렵다. '기획서대로 화면과 기능을 구현하면 되겠지'라고 생각한다면 큰 오산이다. 화면 명세와 기능 설명이라도 제대로 갖춰져 있다면 다행인 수준이다. 이전 프로젝트에서는 피그마(Figma)와 피그잼(FigJam)을 사용했음에도, 설명이 거의 없어 개발자가 일일이 내용을 확인하고 수정하며 사실상 기획까지 관여해야 했다. 심지어 변경 사항이 생겨도 누가, 어디를, 왜 수정했는지 제대로 공유되지 않아, 최종 결과물은 마치 개발자가 임의로 만든 것처럼 보이는 경우도 허다하다.

## 5. 개발 외적인 업무 과다로 인한 효율 저하

개발 외적인 업무가 과도하게 많아 정작 개발에 집중하기 어렵고, 이로 인해 개발 효율성이 떨어지는 경우가 많다.

## 6. 열악한 개발 환경

개발 환경 또한 열악한 경우가 많다. 특히 VDI(가상 데스크톱 환경)에서의 개발은 최악의 경험을 선사하기도 한다. 바로 이전 프로젝트의 경우, 문서 작업용 VDI조차 16GB RAM(이마저도 부족했지만)이었고, 정작 개발용 VDI는 12GB RAM에 불과했다. 자바(Java) 기반의 백엔드 서버와 프론트엔드 개발 서버를 동시에 실행하면 RAM 부족으로 개발이 불가능할 정도로 시스템이 느려졌다. 프론트엔드에는 불필요하게 모듈 페더레이션(Module Federation)이 적용되어 있어, 공통 모듈과 개발 도메인 전체를 로컬에서 실행해야 했고, 이는 물리적인 한계를 절감하게 했다.

## 7. 기술 스택 및 아키텍처 선정의 문제

기술 스택 선정이나 프로젝트 아키텍처 설계에 문제가 있는 경우도 빈번하다. 해당 기술이 등장한 배경이나 철학에 대한 이해 없이, 단순히 유행하거나 특정인의 이력서에 한 줄 추가하기 위한 목적으로 기술을 선택하고 시스템 구조를 잡는 경우가 많다. 이로 인해 프로젝트 중간에 투입되는 개발자는 이미 잘못된 구조 위에서 작업해야 하는 고통을 겪게 된다. 개선을 위한 조언을 해도 이미 너무 늦었거나, 담당자들이 귀를 기울이지 않는 경우가 대부분이다.

## 8. 비효율 개선을 위한 조언 묵살

보다 효율적인 업무 방식을 제안해도 수용되지 않는 경우가 많다. 예를 들어, 앞서 언급한 6번 사례의 열악한 개발 환경에서 백엔드 코드를 푸시할 때마다 개발 서버에 자동 배포되도록 CI/CD 파이프라인 구축을 제안했지만, 간단히 묵살당했다.

프리랜서 초창기에는 이런 현실이 이해되지 않아 개선을 위해 부단히 노력했다. 하지만 경력이 쌓이면서 어느 정도 체념하게 되었고, 주어진 시간에 내 역할만 다하고 퇴근하는 것을 목표로 삼으니 마음이 한결 편안해졌다. 어차피 나는 프로젝트가 끝나면 떠날 사람이고, 소통은 쌍방향으로 이루어져야 하는데 일방적으로 무시당한다고 해서 낙담하거나 분노할 필요는 없다는 것을 깨달았기 때문이다.

결국, 빠듯한 일정, 터무니없는 예산, 그리고 극도로 비효율적인 개발 환경의 삼박자가 어우러져, 대한민국의 SI 업계는 끊임없이 새로운 '차세대'라는 이름의 문제투성이 시스템을 양산하고 있는지도 모른다.
