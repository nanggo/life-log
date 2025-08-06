# 이미지 사용 가이드라인

## 로컬 이미지

로컬 이미지는 빌드 시점에 자동으로 최적화되고 메타데이터가 생성됩니다.

- ✅ WebP/AVIF 포맷 자동 생성
- ✅ 크기 정보 자동 추출
- ✅ CLS 완전 방지

```markdown
![이미지 설명](./local-image.png)
```

## 외부 이미지 (점진적 개선 적용 🚀)

### 자동 최적화 기능

1. **도메인별 기본 비율**: GitHub 이미지에 적절한 기본 aspect-ratio 적용
   - `github.com/user-attachments/assets`: 16:9 (스크린샷)
   - `avatars.githubusercontent.com`: 1:1 (프로필)
   - `user-images.githubusercontent.com`: 4:3 (업로드 이미지)

2. **스마트 캐싱**: 이미지 로드 후 실제 비율을 localStorage에 캐싱
   - 첫 방문: 도메인 기본값으로 CLS 최소화
   - 재방문: 정확한 비율로 CLS 완전 방지

3. **점진적 개선**: 사용할수록 더 나은 경험

### 사용 방법

```markdown
![GitHub 이미지](https://github.com/user-attachments/assets/example.png)
```

**그냥 사용하세요!** 자동으로 최적화됩니다.

### 고급 사용법 (선택적)

더 정확한 초기 렌더링을 위해 크기 정보를 제공할 수 있습니다:

```html
<img
  src="https://github.com/user-attachments/assets/..."
  alt="이미지 설명"
  width="800"
  height="600"
/>
```

## 성능 특징

- 🚀 **로컬 이미지**: 빌드 타임 최적화 + 0 CLS
- ⚡ **외부 이미지**: 런타임 최적화 + 점진적 CLS 개선
- 💾 **캐싱**: 최대 200개 이미지 비율 저장
- 🎯 **도메인 최적화**: GitHub 이미지 타입별 최적 비율

## 마이그레이션 가이드

기존 코드는 **변경 불필요**합니다. 모든 이미지가 자동으로 새 시스템을 사용합니다.
