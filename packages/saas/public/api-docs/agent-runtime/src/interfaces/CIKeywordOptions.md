[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / CIKeywordOptions

# Interface: CIKeywordOptions

Defined in: agent-runtime/src/keywords/ci-mode.ts:19

## Properties

### branchName?

> `optional` **branchName**: `string`

Defined in: agent-runtime/src/keywords/ci-mode.ts:28

Branch name for context

***

### maxKeywords?

> `optional` **maxKeywords**: `number`

Defined in: agent-runtime/src/keywords/ci-mode.ts:26

Maximum keywords to include in PR

***

### minConfidence?

> `optional` **minConfidence**: `number`

Defined in: agent-runtime/src/keywords/ci-mode.ts:24

Minimum confidence to proceed (default: 0.7)

***

### openaiApiKey?

> `optional` **openaiApiKey**: `string`

Defined in: agent-runtime/src/keywords/ci-mode.ts:22

***

### prNumber?

> `optional` **prNumber**: `number`

Defined in: agent-runtime/src/keywords/ci-mode.ts:30

PR number if applicable

***

### siteId?

> `optional` **siteId**: `string`

Defined in: agent-runtime/src/keywords/ci-mode.ts:32

Site ID for dashboard link

***

### tier

> **tier**: [`PlanTier`](../type-aliases/PlanTier.md)

Defined in: agent-runtime/src/keywords/ci-mode.ts:21

***

### url

> **url**: `string`

Defined in: agent-runtime/src/keywords/ci-mode.ts:20
