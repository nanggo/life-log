---
title: '깊은 복사'
date: 2023-06-15T10:07:04.000Z
tags:
  - frontend
thumbnail: ''
draft: false
slug: 'deep-copy'
---

깊은 복사는 항상 라이브러리를 이용해서 썼었다. 최근에 면접에서 깊은 복사에 대한 질문을 받고 직접 구현해보는 라이브 코딩 시간을 가졌었는데 나는 recursion을 이용해서 구현했었다. Recursion 외에도 방법이 존재하기에 생각나는 김에 정리해본다.

### JSON 이용

```js
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}
```

객체를 JSON 문자열로 변환하고 그 문자열을 다시 새 객체로 파싱하는 방식으로 동작한다. 하지만 아래와 같은 한계가 존재한다.

- JSON으로 serialize 할 수 있는 경우만 이용 가능
  - 함수, 정규 표현식 객체, 날짜 등의 serialize 할 수 없는 데이터 유형을 포함하는 객체는 복사 불가능
- 순환 참조를 처리 불가
  - 객체가 자신을 직접 또는 간접적으로 참조하는 경우 오류 발생

### Recursion 이용

```js
function deepClone(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj // obj가 객체가 아니면 값을 반환
  }

  // 값을 저장할 배열 또는 객체 생성
  let copy = Array.isArray(obj) ? [] : {}

  for (let i in obj) {
    if (obj.hasOwnProperty(i)) {
      copy[i] = deepClone(obj[i])
    }
  }

  return copy
}
```

이 함수는 객체의 모든 속성을 재귀적으로 복사하는 방식으로 작동한다. 더 많은 데이터 타입과 순환 참조를 처리할 수 있는 깊은 복사이다. 하지만 JSON 방식보다 느리고 리소스를 더 많이 소모하는 단점이 있다.

주의할 점은 두 방법 모두 특수한 JavaScript 객체인 Map, Set, WeakMap, WeakSet 등을 처리하지 못한다. 이러한 경우에는 lodash의 \_.cloneDeep 메소드와 같은 라이브러리를 사용하거나 이러한 유형을 처리할 수 있는 사용자 정의 함수를 구현해야 한다.

```js
const obj = { a: 1, b: 2, c: 3, d: { e: 4 } }
const obj2 = { ...obj }
const obj3 = JSON.parse(JSON.stringify(obj))
const obj4 = deepClone(obj) // Recursion 이용한 딥카피 함수

obj.d.e = 5
console.log(obj) // { a: 1, b: 2, c: 3, d: { e: 5 }}
console.log(obj2) // { a: 1, b: 2, c: 3, d: { e: 5 }}
console.log(obj3) // { a: 1, b: 2, c: 3, d: { e: 4 }}
console.log(obj4) // { a: 1, b: 2, c: 3, d: { e: 4 }}
```

### [structuredClone()](https://developer.mozilla.org/en-US/docs/Web/API/structuredClone) 이용

```js
const clone = structuredClone(obj)
```

structuredClone은 위 두 가지 방법과 다르게 Map, Set도 지원한다. (WeakMap, WeakSet은 안함)

아래는 지원하는 타입들이다.

- Array
- ArrayBuffer
- Boolean
- DataView
- Date
- Error types (Error 타입들, 자세한 것은 링크 참조)
- Map
- Object: 단순 오브젝트만 지원 (예: 오브젝트 리터럴로 생성된 것들).
- Primitive types: symbol 제외
- RegExp: 단, lastIndex는 보존되지 않음
- Set
- String
- TypedArray

[MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types)에서 보다 자세한 내용을 확인할 수 있다.

---

### Reference

- https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy
- https://developer.mozilla.org/en-US/docs/Web/API/structuredClone
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm#supported_types
