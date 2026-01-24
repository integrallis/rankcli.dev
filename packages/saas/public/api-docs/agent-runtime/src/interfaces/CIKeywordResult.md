[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / CIKeywordResult

# Interface: CIKeywordResult

Defined in: agent-runtime/src/keywords/ci-mode.ts:35

## Properties

### canAddToPR

> **canAddToPR**: `boolean`

Defined in: agent-runtime/src/keywords/ci-mode.ts:37

Whether keywords can be added to the PR

***

### errors

> **errors**: `string`[]

Defined in: agent-runtime/src/keywords/ci-mode.ts:43

Error messages (if any)

***

### exitCode

> **exitCode**: `0` \| `1` \| `2`

Defined in: agent-runtime/src/keywords/ci-mode.ts:51

Exit code (0 = success, 1 = needs action, 2 = error)

***

### explanation

> **explanation**: `string`

Defined in: agent-runtime/src/keywords/ci-mode.ts:53

Detailed explanation

***

### info

> **info**: `string`[]

Defined in: agent-runtime/src/keywords/ci-mode.ts:45

Info messages

***

### keywords

> **keywords**: [`KeywordRecommendation`](KeywordRecommendation.md)[]

Defined in: agent-runtime/src/keywords/ci-mode.ts:39

Keywords to add (if canAddToPR is true)

***

### prCommentBody

> **prCommentBody**: `string`

Defined in: agent-runtime/src/keywords/ci-mode.ts:49

PR comment body

***

### rawResult?

> `optional` **rawResult**: [`FreeKeywordResult`](FreeKeywordResult.md) \| [`PaidKeywordResult`](PaidKeywordResult.md)

Defined in: agent-runtime/src/keywords/ci-mode.ts:55

Raw result for debugging

***

### requiredActions

> **requiredActions**: [`CIAction`](CIAction.md)[]

Defined in: agent-runtime/src/keywords/ci-mode.ts:47

Actions user needs to take

***

### warnings

> **warnings**: `string`[]

Defined in: agent-runtime/src/keywords/ci-mode.ts:41

Warning messages to display
