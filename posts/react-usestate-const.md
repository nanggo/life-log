---
title: 'React의 useState, 어떻게 const 상수를 변경할까?'
slug: 'react-usestate-const'
date: '2025-07-23 20:08:41'
tags:
  - react
draft: false
---

**"const로 선언했는데 어떻게 값이 바뀌는 거죠?"**

React를 처음 배울 때 나도 이런 궁금증이 있었다. `useState`로 상태를 관리할 때마다 이상했다. 분명 `const [count, setCount] = useState(0)`로 선언했는데, `setCount(1)`을 호출하면 `count`가 바뀐다. `const`는 상수 아닌가?

사실 이 질문 자체가 `useState`의 동작 원리를 정확히 이해하지 못했다는 신호다. `setCount`는 `count`를 수정하는 게 아니라, 완전히 다른 일을 한다.

## setCount는 변수를 바꾸지 않는다

핵심은 이거다. **`setCount`는 `count` 변수를 수정하지 않는다.** 대신 React에게 "이 컴포넌트를 새로운 상태값으로 다시 그려달라"고 요청한다.

```javascript
function Counter() {
  const [count, setCount] = useState(0)

  console.log('렌더링됨:', count)

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>증가</button>
    </div>
  )
}
```

버튼을 클릭할 때마다 콘솔을 보면 흥미로운 걸 발견할 수 있다:

```
렌더링됨: 0
렌더링됨: 1
렌더링됨: 2
```

컴포넌트 함수가 계속 다시 실행되고 있다. 매번 새로운 `count` 상수가 만들어지는 셈이다.

## 매 렌더링마다 새로운 변수

이게 React의 핵심이다. `setCount(1)`을 호출하면:

1. React가 "아, 상태가 바뀌었구나" 하고 인지한다
2. 컴포넌트 함수를 처음부터 다시 실행한다
3. `useState(0)`이 다시 호출되지만, 이번엔 `1`을 반환한다
4. `const count = 1`이라는 새로운 상수가 생성된다

첫 번째 렌더링의 `count`와 두 번째 렌더링의 `count`는 완전히 다른 변수다. 같은 이름이지만 서로 다른 메모리 공간에 있는 별개의 상수들이다.

```javascript
// 첫 번째 렌더링
const count = 0 // 이 변수는 0을 가지고 있다

// setCount(1) 호출 후...

// 두 번째 렌더링
const count = 1 // 완전히 새로운 변수, 1을 가지고 있다
```

## 클로저로 상태 보관하기

그럼 React는 어떻게 `setCount(1)` 호출과 다음 렌더링 사이에 상태값을 기억할까? 바로 **클로저** 덕분이다.

React는 컴포넌트 밖 어딘가에 상태값들을 저장해둔다. 컴포넌트가 다시 렌더링될 때마다 React는 "아, 이 컴포넌트의 첫 번째 `useState`는 현재 이 값을 가지고 있구나" 하고 저장된 값을 꺼내서 반환한다.

```javascript
// React 내부 (의사코드)
const componentStates = new Map()

function useState(initialValue) {
  const componentId = getCurrentComponentId()
  const stateIndex = getCurrentStateIndex()

  if (!componentStates.has(componentId)) {
    componentStates.set(componentId, [])
  }

  const states = componentStates.get(componentId)

  if (states[stateIndex] === undefined) {
    states[stateIndex] = initialValue
  }

  const currentValue = states[stateIndex]

  const setter = (newValue) => {
    states[stateIndex] = newValue
    rerender() // 컴포넌트 다시 그리기
  }

  return [currentValue, setter]
}
```

실제 React 내부는 훨씬 복잡하지만, 핵심 아이디어는 이렇다.

## 왜 이렇게 설계했을까?

처음엔 이상하게 느껴질 수 있다. "그냥 변수를 수정하면 안 되나?" 하고 생각할 수도 있다. 하지만 이 방식에는 중요한 장점들이 있다.

**예측 가능성**: 각 렌더링에서 상태값이 고정되어 있다. 렌더링 중간에 다른 곳에서 상태를 바꿔버릴 걱정이 없다.

```javascript
function BadExample() {
  let count = 0 // 일반 변수라면

  return (
    <div>
      <p>{count}</p>
      <SomeChild onSomething={() => count++} />
      <p>{count}</p> {/* 위 아래가 다를 수 있다! */}
    </div>
  )
}
```

**시간 여행 디버깅**: 각 렌더링이 독립적이라서 이전 상태를 쉽게 추적할 수 있다. React DevTools에서 상태 변화를 되돌려가며 볼 수 있는 이유다.

**함수형 프로그래밍**: 상태를 직접 변경하지 않고 새로운 상태를 만들어내는 함수형 패러다임에 맞다.

## 실무에서 주의할 점

이 원리를 이해하면 흔한 실수를 피할 수 있다:

```javascript
function Timer() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(count + 1) // 🚨 문제: count는 항상 초기값
    }, 1000)

    return () => clearInterval(interval)
  }, []) // 빈 의존성 배열

  return <div>{count}</div>
}
```

`useEffect`의 콜백 함수는 컴포넌트의 첫 렌더링 때 생성된다. 그때의 `count`는 `0`이다. 나중에 컴포넌트가 재렌더링되어도 이미 생성된 콜백 함수 안의 `count`는 여전히 `0`이다.

해결법:

```javascript
setCount((prevCount) => prevCount + 1) // 현재 상태를 받아서 계산
```

## 마무리

`useState`에서 `const`로 선언된 상태가 "변경"되는 건 착각이다. 실제로는:

- `setState`가 컴포넌트 재렌더링을 요청한다
- 재렌더링 시 새로운 상태값으로 새로운 `const` 변수가 생성된다
- React는 클로저를 이용해 상태를 컴포넌트 외부에서 관리한다

이 원리를 이해하면 React의 동작 방식이 훨씬 명확해진다. 그리고 상태 관련 버그들도 쉽게 디버깅할 수 있게 된다.

다음에 누군가 "const인데 어떻게 바뀌어요?"라고 물으면, "바뀌는 게 아니라 새로 만들어지는 거예요"라고 답해보자.
