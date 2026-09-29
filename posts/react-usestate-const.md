---
title: 'React의 useState, 어떻게 const 상수를 변경할까?'
seoTitle: 'React useState와 const 동작 원리'
description: 'const로 선언한 useState 값이 바뀌는 것처럼 보이는 이유를 정리했다. setState는 변수를 고치지 않고 다시 렌더링을 요청하며, 렌더링마다 새 상수가 만들어진다는 점을 코드로 따라가 봤다.'
slug: react-usestate-const
date: '2025-07-23 20:08:41'
updated: '2026-09-29T14:13:13+09:00'
tags:
  - react
draft: false
category: 개발
image: ./cover.webp
imageAlt: '렌더링마다 새 상태가 이어지는 React 상태 흐름 일러스트'
---

React를 처음 배울 때 `useState`가 이상했다. 분명 `const [count, setCount] = useState(0)`로 선언했는데, `setCount(1)`을 호출하면 `count`가 바뀐다. `const`는 상수 아닌가?

알고 보면 `setCount`는 `count`를 고치는 함수가 아니다.

## setCount는 변수를 바꾸지 않는다

`setCount`는 `count` 변수를 수정하지 않는다. 대신 React에게 "이 컴포넌트를 새로운 상태값으로 다시 그려달라"고 요청한다.

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

버튼을 누를 때마다 콘솔에 이렇게 찍힌다.

```
렌더링됨: 0
렌더링됨: 1
렌더링됨: 2
```

컴포넌트 함수가 계속 다시 실행되고 있다. 매번 새로운 `count` 상수가 만들어지는 셈이다.

## 매 렌더링마다 새로운 변수

`setCount(1)`을 호출하면 이런 순서로 진행된다.

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

## 상태는 React가 따로 들고 있다

그럼 React는 `setCount(1)` 호출과 다음 렌더링 사이에 상태값을 어디에 기억해 둘까? 컴포넌트 함수 안의 변수는 다음 렌더링에서 새로 만들어지니, 값은 React 쪽에 따로 저장된다.

React는 화면에 올라간 컴포넌트마다 상태 저장 공간을 두고, `useState`가 호출된 순서대로 값을 보관한다. 다시 렌더링할 때는 "이 컴포넌트의 첫 번째 `useState`는 지금 이 값이구나" 하고 저장된 값을 꺼내서 돌려준다. hook을 조건문 안에서 호출하면 안 되는 것도 이 순서에 기대고 있기 때문이다.

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

실제 React는 이 값을 컴포넌트마다 붙는 내부 객체(Fiber)에 저장하고 업데이트도 모아서 처리하지만, 큰 흐름은 이렇다.

## 왜 이렇게 설계했을까?

나도 처음엔 "그냥 변수를 수정하면 안 되나?" 하고 생각했다. 이 방식에는 몇 가지 장점이 있다.

**렌더링마다 값이 고정된다**: 한 번의 렌더링 안에서는 `count`가 바뀌지 않는다. 그래서 이벤트 핸들러나 effect가 어떤 값을 보고 있는지 따라가기 쉽다. 일반 변수로 상태를 흉내 내면 이렇게 된다.

```javascript
function BadExample() {
  let count = 0 // 일반 변수라면

  return (
    <div>
      <p>{count}</p>
      <SomeChild onSomething={() => count++} />
      {/* count++를 해도 다시 렌더링되지 않고, 렌더링되더라도 0부터 다시 시작한다 */}
    </div>
  )
}
```

**바뀌었는지 판단하기 쉽다**: 값을 직접 고치지 않고 새 값을 넘기니, React는 이전 값과 새 값을 비교(`Object.is`)해서 같으면 다시 그리지 않을 수 있다. 객체나 배열 상태를 직접 수정하면 화면이 안 바뀌는 것도 같은 이유다.

## 실무에서 주의할 점

이 구조를 알면 흔한 실수를 피할 수 있다.

```javascript
function Timer() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(count + 1) // 문제: count는 항상 초기값
    }, 1000)

    return () => clearInterval(interval)
  }, []) // 빈 의존성 배열

  return <div>{count}</div>
}
```

`useEffect`의 콜백 함수는 컴포넌트의 첫 렌더링 때 생성된다. 그때의 `count`는 `0`이다. 나중에 컴포넌트가 재렌더링되어도 이미 생성된 콜백 함수는 첫 렌더링의 `count`를 클로저로 붙잡고 있어서 여전히 `0`을 본다. 그래서 화면은 1에서 멈춘다.

해결법:

```javascript
setCount((prevCount) => prevCount + 1) // 현재 상태를 받아서 계산
```

## 마무리

`const`로 선언한 상태는 바뀐 적이 없다. `setState`가 다시 렌더링을 요청하고, React가 들고 있던 새 값으로 새 `const`가 만들어질 뿐이다. 이걸 알면 오래된 값을 보는 effect 같은 버그도 원인을 찾기 쉽다.

다음에 누군가 "const인데 어떻게 바뀌어요?"라고 물으면 이렇게 답하려 한다. "바뀌는 게 아니라 새로 만들어지는 거예요."
