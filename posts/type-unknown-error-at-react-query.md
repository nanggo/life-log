---
title: react-query에서 Type "unknown" is not assignable to type 에러
date: 2023-03-25T14:03:40.000Z
tags:
  - frontend
draft: false
slug: type-unknown-error-at-react-query
category: 리뷰
---

`Type 'unknown' is not assignable to type` 오류는 TypeScript에서 'unknown' 타입의 값을 다른, 더 구체적인 타입의 변수나 속성에 할당하려고 할 때 일반적으로 발생한다. react-query 컨텍스트에서 이 오류는 쿼리에서 반환되는 데이터를 처리할 때 발생하며, TypeScript가 데이터의 타입을 올바르게 추론할 수 없는 경우에 발생한다.

이 문제를 해결하려면 데이터에 대한 타입을 제공하거나 useQuery 훅에 제네릭 타입을 지정할 수 있다. 다음과 같이 수행할 수 있음:

1. 타입 단언

> 쿼리에서 데이터를 받을 때 TypeScript에 데이터의 타입을 명시적으로 알려주려면 타입 단언을 사용할 수 있다. 예를 들어 데이터 타입이 MyDataType 인 경우 다음과 같이 할 수 있다.

```typescript
import { useQuery } from 'react-query'

const { data } = useQuery('myQueryKey', fetchMyData)
const typedData = data as MyDataType // 타입 단언
```

2. useQuery에 제네릭 타입 지정

> useQuery를 호출할 때 제네릭 타입을 제공할 수도 있다. 이 경우 TypeScript는 쿼리에서 반환되는 데이터의 타입을 알게 된다. MyDataType 예제를 계속 사용하면 다음과 같이 작성할 수 있다.

```typescript
import { useQuery } from 'react-query'

const { data } = useQuery<MyDataType>('myQueryKey', fetchMyData)
```

쿼리에서 반환되는 데이터의 실제 형태와 일치하는 타입을 단언하거나 제네릭 타입으로 지정해야 한다. 그렇지 않으면 런타임 오류나 올바르지 않은 타입 검사가 발생할 수 있다.
