[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / checkJSRenderingRatio

# Function: checkJSRenderingRatio()

> **checkJSRenderingRatio**(`html`, `url`): `object`

Defined in: agent-runtime/src/audit/checks/ai-readiness.ts:258

Check JavaScript rendering ratio
Compares static HTML content size vs rendered content

## Parameters

### html

`string`

### url

`string`

## Returns

`object`

### data

> **data**: `object`

#### data.ratio

> **ratio**: `number`

#### data.staticWordCount

> **staticWordCount**: `number`

### issues

> **issues**: [`AuditIssue`](../interfaces/AuditIssue.md)[]
