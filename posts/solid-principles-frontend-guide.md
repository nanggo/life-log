---
title: 프론트엔드 개발자를 위한 SOLID 원칙 길라잡이
slug: solid-principles-frontend-guide
date: '2025-07-30 10:28:51'
tags:
  - frontend
description: 더 견고하고 유연한 UI 코드를 만드는 5가지 설계 원칙을 예시와 함께 알아본다
draft: false
category: 리뷰
---

**"이 컴포넌트 좀 수정해주세요."**

간단한 요청이었지만, 코드를 열어보니 머리가 지끈거렸다. UserProfile 컴포넌트 하나가 API 호출, 로딩 상태 관리, 에러 처리, 화면 렌더링까지 모든 걸 다 하고 있었다. 작은 수정을 위해 500줄짜리 컴포넌트를 뜯어고쳐야 했고, 한 부분을 건드리면 다른 부분이 깨지는 악순환이 반복됐다.

그때 깨달았다. 코드가 '일단 돌아가게' 만드는 것과 '좋은 코드'를 만드는 것은 전혀 다른 이야기라는 걸.

SOLID는 객체지향 프로그래밍의 5가지 설계 원칙이다. 하지만 이 원칙들은 React나 Vue 같은 컴포넌트 기반 개발에서도 놀라울 정도로 잘 들어맞는다. 복잡해지는 프론트엔드 코드를 어떻게 깔끔하게 정리할지 고민이라면, 이 원칙들이 좋은 나침반이 될 것이다.

## S: 단일 책임 원칙 - "한 가지만 잘하자"

첫 번째 원칙부터 뼈아픈 이야기다. 내가 겪었던 그 UserProfile 컴포넌트가 바로 단일 책임 원칙을 위반한 대표적인 사례였다.

단일 책임 원칙은 간단하다. 하나의 컴포넌트나 함수는 **한 가지 일만** 해야 한다는 것이다. 하지만 실무에서는 이게 생각보다 어렵다. 일정에 쫓기다 보면 "어차피 비슷한 기능이니까 여기다 추가하자"는 생각이 들기 마련이다.

다음 코드를 보자.

```jsx
// 나쁜 예: 모든 걸 다 하는 컴포넌트
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // API 호출도 하고
  useEffect(() => {
    setLoading(true)
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUser(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [userId])

  // UI 렌더링도 하고
  if (loading) return <div>로딩 중...</div>
  if (error) return <div>오류: {error}</div>
  if (!user) return null

  // 비즈니스 로직도 처리한다
  const formatBirthDate = (date) => {
    return new Date(date).toLocaleDateString('ko-KR')
  }

  return (
    <div className="user-profile">
      <img src={user.avatar} alt={user.name} />
      <h2>{user.name}</h2>
      <p>생년월일: {formatBirthDate(user.birthDate)}</p>
      <p>이메일: {user.email}</p>
    </div>
  )
}
```

이 컴포넌트의 문제점은? **너무 많은 일을 한다는 것**이다. API 호출, 상태 관리, 데이터 포맷팅, UI 렌더링까지 모든 걸 혼자 처리한다. 생년월일 포맷을 바꾸려면 이 컴포넌트를 수정해야 하고, API 엔드포인트가 바뀌어도 이 컴포넌트를 건드려야 한다.

이제 단일 책임 원칙을 적용해보자.

```jsx
// 좋은 예: 각자의 책임만 맡는 구조

// 1. API 호출만 담당하는 훅
function useUserData(userId) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetchUser(userId)
      .then(setUser)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [userId])

  return { user, loading, error }
}

// 2. 유틸리티 함수는 별도 파일로
export const formatBirthDate = (date) => {
  return new Date(date).toLocaleDateString('ko-KR')
}

// 3. 순수한 UI 컴포넌트들
function Avatar({ src, alt }) {
  return <img src={src} alt={alt} className="avatar" />
}

function UserInfo({ user }) {
  return (
    <div>
      <h2>{user.name}</h2>
      <p>생년월일: {formatBirthDate(user.birthDate)}</p>
      <p>이메일: {user.email}</p>
    </div>
  )
}

// 4. 조합하는 메인 컴포넌트
function UserProfile({ userId }) {
  const { user, loading, error } = useUserData(userId)

  if (loading) return <div>로딩 중...</div>
  if (error) return <div>오류: {error}</div>
  if (!user) return null

  return (
    <div className="user-profile">
      <Avatar src={user.avatar} alt={user.name} />
      <UserInfo user={user} />
    </div>
  )
}
```

이렇게 나누니까 훨씬 깔끔해졌다. 날짜 포맷을 바꾸고 싶으면 `formatBirthDate` 함수만 수정하면 되고, API가 바뀌면 `useUserData` 훅만 건드리면 된다. 각 부분이 독립적이어서 테스트하기도 쉽다.

## O: 개방-폐쇄 원칙 - "확장엔 열려있고, 수정엔 닫혀있게"

두 번째 원칙도 실무에서 자주 마주치는 상황이다. 모달 컴포넌트를 만들었는데, 기획에서 "확인 모달 말고 입력받는 모달도 필요해요"라고 하면? 그리고 또 "경고 모달도 추가해주세요"라고 하면?

처음에 나는 이런 식으로 해결했다.

```jsx
// 나쁜 예: 새 기능마다 기존 코드 수정
function Modal({ type, title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{title}</h2>
        <p>{message}</p>

        {type === 'alert' && <button onClick={onCancel}>확인</button>}

        {type === 'confirm' && (
          <div>
            <button onClick={onCancel}>취소</button>
            <button onClick={onConfirm}>확인</button>
          </div>
        )}

        {type === 'form' && (
          <div>
            <input type="text" />
            <button onClick={onCancel}>취소</button>
            <button onClick={onConfirm}>저장</button>
          </div>
        )}
      </div>
    </div>
  )
}
```

새로운 모달 타입이 추가될 때마다 Modal 컴포넌트를 직접 수정해야 했다. 경고 모달이 필요하면 또 `type === 'warning'` 조건을 추가해야 하고, 결제 모달이 필요하면 또 수정해야 한다.

개방-폐쇄 원칙을 적용하면 이렇게 바뀐다.

```jsx
// 좋은 예: 확장에는 열려있고 수정에는 닫힌 구조
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  )
}

// 각각의 모달 콘텐츠는 별도 컴포넌트로
function AlertModal({ message, onConfirm }) {
  return (
    <div>
      <p>{message}</p>
      <button onClick={onConfirm}>확인</button>
    </div>
  )
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div>
      <p>{message}</p>
      <div>
        <button onClick={onCancel}>취소</button>
        <button onClick={onConfirm}>확인</button>
      </div>
    </div>
  )
}

// 사용할 때
function App() {
  const [showAlert, setShowAlert] = useState(false)

  return (
    <div>
      <Modal isOpen={showAlert} onClose={() => setShowAlert(false)}>
        <AlertModal message="저장되었습니다!" onConfirm={() => setShowAlert(false)} />
      </Modal>
    </div>
  )
}
```

이제 새로운 종류의 모달이 필요하면 Modal 컴포넌트는 건드리지 않고 새로운 콘텐츠 컴포넌트만 만들면 된다. Modal은 뼈대만 제공하고, 실제 내용은 외부에서 주입받는 구조다.

## L: 리스코프 치환 원칙 - "같은 역할, 같은 사용법"

세 번째 원칙은 "일관성"에 관한 이야기다. 같은 역할을 하는 컴포넌트들은 같은 방식으로 사용할 수 있어야 한다는 것이다.

예전에 버튼 컴포넌트들을 만들면서 실수했던 경험이 있다.

```jsx
// 나쁜 예: 비슷한 컴포넌트인데 사용법이 다름
function PrimaryButton({ onClick, children }) {
  return (
    <button className="btn-primary" onClick={onClick}>
      {children}
    </button>
  )
}

function SecondaryButton({ onPress, label }) {
  // 속성명이 다름!
  return (
    <button className="btn-secondary" onClick={onPress}>
      {label}
    </button>
  )
}

function IconButton({ handleClick, icon, text }) {
  // 또 다른 속성명!
  return (
    <button className="btn-icon" onClick={handleClick}>
      <span>{icon}</span> {text}
    </button>
  )
}
```

이렇게 만들어놓고 나중에 버튼을 바꾸려면 속성명까지 다 바꿔야 했다. 정말 불편했다.

리스코프 치환 원칙을 적용하면 이렇게 된다.

```jsx
// 좋은 예: 일관된 인터페이스
function PrimaryButton({ onClick, children, disabled = false }) {
  return (
    <button className="btn-primary" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

function SecondaryButton({ onClick, children, disabled = false }) {
  return (
    <button className="btn-secondary" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

function IconButton({ onClick, children, disabled = false, icon }) {
  return (
    <button className="btn-icon" onClick={onClick} disabled={disabled}>
      <span>{icon}</span> {children}
    </button>
  )
}
```

이제 어떤 버튼을 써도 `onClick`으로 클릭 이벤트를 처리하고, `disabled`로 비활성화할 수 있다. 버튼 종류를 바꾸고 싶으면 컴포넌트 이름만 바꾸면 된다.

```jsx
// 이런 식으로 쉽게 교체 가능
const SubmitButton = isImportant ? PrimaryButton : SecondaryButton

return (
  <SubmitButton onClick={handleSubmit} disabled={isLoading}>
    저장하기
  </SubmitButton>
)
```

## I: 인터페이스 분리 원칙 - "필요한 것만 넘겨주기"

네 번째 원칙은 "과도한 의존성 줄이기"다. 컴포넌트에 필요한 것만 넘겨주라는 뜻이다.

예전에 이런 실수를 했었다.

```jsx
// 나쁜 예: 거대한 객체를 통째로 넘김
function Avatar({ user }) {
  // user 객체 전체를 받음
  return (
    <img
      src={user.profile.avatar.url} // 이것만 필요한데
      alt={user.personalInfo.name} // 이것도 필요하고
      className="avatar"
    />
  )
}

function UserCard({ user }) {
  return (
    <div>
      <Avatar user={user} /> {/* 거대한 user 객체 전달 */}
      <span>{user.personalInfo.name}</span>
    </div>
  )
}
```

이렇게 하면 Avatar 컴포넌트가 user 객체의 구조에 완전히 종속된다. user 객체가 바뀌면 Avatar도 영향을 받는다. 게다가 Avatar가 실제로 뭘 사용하는지 한눈에 보이지 않는다.

인터페이스 분리 원칙을 적용하면 이렇게 바뀐다.

```jsx
// 좋은 예: 필요한 것만 명시적으로 전달
function Avatar({ imageUrl, alt, size = 'medium' }) {
  return <img src={imageUrl} alt={alt} className={`avatar avatar--${size}`} />
}

function UserCard({ user }) {
  return (
    <div>
      <Avatar imageUrl={user.profile.avatar.url} alt={user.personalInfo.name} size="large" />
      <span>{user.personalInfo.name}</span>
    </div>
  )
}
```

이제 Avatar 컴포넌트는 user 객체의 구조를 전혀 알 필요가 없다. 단지 이미지 URL과 alt 텍스트만 있으면 된다. 나중에 user 객체 구조가 바뀌어도 Avatar는 영향받지 않는다.

더 중요한 건, Avatar를 다른 곳에서도 쉽게 재사용할 수 있다는 점이다.

```jsx
// 이런 식으로 다양하게 활용 가능
<Avatar imageUrl="/default-avatar.png" alt="기본 아바타" />
<Avatar imageUrl={product.thumbnail} alt={product.name} />
<Avatar imageUrl={company.logo} alt={company.name} size="small" />
```

## D: 의존성 역전 원칙 - "구체적인 것에 의존하지 말고 추상적인 것에 의존하라"

마지막 원칙이 가장 어렵다. 하지만 제대로 이해하면 정말 유용하다.

예전에 이런식으로 API를 호출하는 컴포넌트를 만들었다.

```jsx
// 나쁜 예: 특정 API 클라이언트에 의존
import { apiClient } from './api-client' // 구체적인 구현에 의존

function ProductList() {
  const [products, setProducts] = useState([])

  useEffect(() => {
    // apiClient에 직접 의존
    apiClient.get('/products').then((response) => setProducts(response.data))
  }, [])

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}
```

이렇게 하면 테스트할 때 문제가 생긴다. 실제 API를 호출해야 테스트할 수 있고, API 서버가 바뀌면 컴포넌트도 수정해야 한다.

의존성 역전 원칙을 적용하면 이렇게 바뀐다.

```jsx
// 좋은 예: 추상화된 인터페이스에 의존
function ProductList({ productService }) {
  // 서비스를 주입받음
  const [products, setProducts] = useState([])

  useEffect(() => {
    // 구체적인 구현이 아닌 인터페이스에 의존
    productService.getProducts().then(setProducts)
  }, [productService])

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  )
}

// 실제 운영 환경에서 사용
const realProductService = {
  getProducts: () => apiClient.get('/products').then((res) => res.data)
}

function App() {
  return <ProductList productService={realProductService} />
}

// 테스트 환경에서 사용
const mockProductService = {
  getProducts: () => Promise.resolve([{ id: 1, name: '테스트 상품' }])
}

// 테스트 코드에서
render(<ProductList productService={mockProductService} />)
```

이제 ProductList 컴포넌트는 "상품을 가져오는 기능"이 있다는 것만 알면 된다. 그 기능이 실제 API를 호출하든, 로컬 스토리지에서 가져오든, 목 데이터를 반환하든 상관없다.

## 지금 당장 적용해볼 수 있는 것들

SOLID 원칙을 처음 배웠을 때는 "이론은 좋은데 실제로 어떻게 써야 하지?"라는 생각이 들었다. 그래서 아주 작은 것부터 시작했다.

**오늘부터 해볼 수 있는 것들:**

1. **컴포넌트 하나 분리하기**: 지금 작업 중인 컴포넌트가 너무 크다고 느끼면, 그 안에서 독립적으로 동작할 수 있는 부분 하나만 빼내보자. Avatar나 Button 같이 단순한 것부터 시작하면 된다.

2. **props 이름 통일하기**: 같은 역할을 하는 컴포넌트들의 props 이름을 확인해보자. onClick, onPress, handleClick이 섞여 있다면 하나로 통일해보자.

3. **거대한 객체 넘기기 그만두기**: user 객체 전체를 넘기는 대신, user.name이나 user.email처럼 필요한 값만 넘겨보자.

완벽하게 적용하려고 하지 말자. 나도 아직 모든 코드에 SOLID를 적용하지는 못한다. 하지만 이 원칙들을 머릿속에 두고 코드를 작성하면, 조금씩 나아지는 게 느껴진다.

며칠 전에 3개월 전에 작성한 코드를 다시 봤는데, "아, 이때는 정말 못 짰구나"라는 생각이 들었다. 그런데 동시에 "그래도 지금은 좀 나아졌네"라는 뿌듯함도 있었다.

좋은 코드는 하루아침에 만들어지지 않는다. 하지만 SOLID 원칙을 나침반 삼아 조금씩 개선해나가다 보면, 어느새 과거의 나보다 훨씬 나은 코드를 쓰고 있는 자신을 발견할 것이다.

다음에 "이 컴포넌트 좀 수정해주세요"라는 요청이 들어왔을 때, 당황하지 말고 "어, 이 부분은 깔끔하게 분리되어 있네"라고 생각할 수 있기를. 그런 날이 분명 올 것이다.

---

_프론트엔드 개발을 하면서 코드 설계에 대한 고민이 있다면, 작은 컴포넌트 하나부터 이 원칙들을 적용해보자. 완벽하지 않아도 괜찮다. 조금씩 나아지는 것도 충분히 의미 있는 발전이다._
