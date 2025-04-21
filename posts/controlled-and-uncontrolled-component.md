---
title: '제어 컴포넌트와 비제어 컴포넌트'
date: 2023-08-28T20:08:56.000Z
tags:
  - frontend
thumbnail: ''
draft: false
slug: 'controlled-and-uncontrolled-component'
---

얼마 전 면접에서 질문을 받은 기억이 나서 리마인드 할 겸 정리한다. React에서 컴포넌트를 다룰 때, 이를 "Controlled" 및 "Uncontrolled"로 나누어 생각할 수 있다. 두 방식 간의 주요 차이점을 이해하는 것은 React와 상태 관리를 제대로 다루기 위해 중요하다.

### Controlled Components

Controlled Component는 React 상태(state)에 의해 제어되는 컴포넌트를 의미한다. 이러한 컴포넌트의 값(value)은 React의 state에 바인딩되어 있고, 변경될 때마다 콜백 함수(예: onChange)를 통해 상태를 업데이트한다.

```jsx
import React, { useState } from 'react'

function ControlledComponent() {
  const [inputValue, setInputValue] = useState('')

  const handleChange = (event) => {
    setInputValue(event.target.value)
  }

  return <input type="text" value={inputValue} onChange={handleChange} />
}
```

장점:

- 상태를 중앙에서 관리할 수 있어 일관성을 유지하기 쉽다.
- 상태의 변경을 감지하고 다른 UI 작업을 수행 가능하다.

단점:

- Overhead: 모든 입력 변경에 대해 상태를 업데이트하고 리렌더링해야 하므로, 불필요한 리렌더링이 발생할 수 있다. 특히 복잡한 form에는 성능 문제가 발생할 수 있다.
- 복잡성: 간단한 입력 필드의 경우에도 상태 관리 로직이 필요하므로 코드가 복잡해질 수 있다.
- Delay: 실시간으로 상태를 업데이트하는 것은 사용자 입력과의 사이에 약간의 지연이 생길 수 있다.

### Uncontrolled Components

Uncontrolled Component는 DOM 자체에 값을 유지하는 컴포넌트를 의미한다. ref를 사용하여 DOM에서 직접 값을 가져올 수 있다.

```jsx
import React, { useRef } from 'react'

function UncontrolledComponent() {
  const inputRef = useRef(null)

  const handleSubmit = () => {
    console.log(inputRef.current.value)
  }

  return (
    <>
      <input type="text" ref={inputRef} />
      <button onClick={handleSubmit}>Submit</button>
    </>
  )
}
```

장점:

- 코드가 간결, React의 상태 관리 없이 DOM의 원래 동작 방식에 가깝다.
- 특정 상황에서는 성능 최적화가 가능할 수 있다.

단점:

- DOM 직접 접근: React에서는 가상 DOM을 사용하여 최적화된 방식으로 실제 DOM과 상호 작용합니다. Uncontrolled Components에서는 ref를 통해 직접 DOM에 접근하기 때문에 React의 "Declarative" 접근 방식에서 벗어날 수 있다.
- 일관성 부족: 상태가 여러 곳에 분산될 수 있으므로 양식의 일관성을 유지하기가 더 어려울 수 있다.
- 통합 및 상호 작용 제한: 다른 컴포넌트나 상태와의 상호 작용이 필요한 경우 Uncontrolled Components 방식은 제한적일 수 있다.

### 언제 무엇을 사용해야 할까?

- 상태 관리의 필요성: 상태 관리의 필요성이 높은 경우나 다른 컴포넌트와의 상호 작용이 많은 경우 Controlled Component가 더 적합하다.
- 간결성: 간단한 form이나 한 번만 사용되는 컴포넌트에서는 Uncontrolled Component가 코드를 간결하게 유지하는 데 도움이 될 수 있다.

### 결론

Controlled와 Uncontrolled Component는 각각의 장점이 있다. 프로젝트의 요구사항과 개발자의 선호도에 따라 적절한 방법을 선택해야 한다.
