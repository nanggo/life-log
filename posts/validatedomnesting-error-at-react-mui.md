---
title: 'react mui에서 validateDOMNesting 에러'
date: 2023-03-25T14:03:27.000Z
tags:
  - frontend
draft: false
slug: 'validatedomnesting-error-at-react-mui'
---

# 현상

Material-UI의 TableCell 컴포넌트를 사용하고 component prop을 "th" 또는 "td"로 지정했을 때 "validateDOMNesting" 오류가 발생했다.

# 원인

TableCell 컴포넌트를 Table, TableHead, TableBody, TableRow를 포함한 올바른 테이블 구조 내에서 사용하지 않아 생기는 문제였다.

# 해결

TableCell 컴포넌트의 component prop을 "th" 또는 "td"로 설정하여 Material-UI의 테이블 컴포넌트를 올바르게 사용해야 한다.

```jsx
import React from 'react'
import { Table, TableHead, TableBody, TableRow, TableCell } from '@mui/material'

function MyTableComponent() {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell component="th">{/* 여기에 헤더 내용을 입력하세요 */}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell component="td">{/* 여기에 내용을 입력하세요 */}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export default MyTableComponent
```

component prop이 "th" 또는 "td"로 설정된 TableCell 컴포넌트를 올바른 테이블 구조 내에 배치함으로써 "validateDOMNesting" 오류를 해결할 수 있다.

# 참고

HTML 명세에 따르면, `<td>` 요소는 `<div>` 요소의 자식으로 허용되지 않는다. `<td>` 요소는 `<table>` 내의 `<tr>` 요소의 자식으로만 사용해야 한다.
이 오류를 해결하려면 `<td>` 요소를 올바른 `<table>`, `<tbody>`, `<tr>` 구조로 감싸거나, `<div>` 또는 `<span>`과 같은 적절한 요소로 `<td>`를 대체할 수 있다.
