[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / SEOIssue

# Interface: SEOIssue

Defined in: agent-runtime/src/types.ts:17

## Properties

### category

> **category**: `"meta"` \| `"schema"` \| `"content"` \| `"technical"` \| `"performance"` \| `"social"` \| `"accessibility"`

Defined in: agent-runtime/src/types.ts:19

***

### code

> **code**: `string`

Defined in: agent-runtime/src/types.ts:20

***

### element?

> `optional` **element**: `string`

Defined in: agent-runtime/src/types.ts:23

***

### fix?

> `optional` **fix**: `object`

Defined in: agent-runtime/src/types.ts:24

#### after

> **after**: `string`

#### before

> **before**: `string`

#### file

> **file**: `string`

***

### impact

> **impact**: `string`

Defined in: agent-runtime/src/types.ts:22

***

### message

> **message**: `string`

Defined in: agent-runtime/src/types.ts:21

***

### severity

> **severity**: `"critical"` \| `"warning"` \| `"info"`

Defined in: agent-runtime/src/types.ts:18
