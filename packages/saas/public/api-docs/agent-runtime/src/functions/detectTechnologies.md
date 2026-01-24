[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / detectTechnologies

# Function: detectTechnologies()

> **detectTechnologies**(`html`, `url`, `headers?`): `object`

Defined in: agent-runtime/src/audit/checks/tech-detection.ts:31

Detect technologies from HTML and headers

## Parameters

### html

`string`

### url

`string`

### headers?

`Record`\<`string`, `string`\>

## Returns

`object`

### data

> **data**: `TechDetectionData`

### issues

> **issues**: [`AuditIssue`](../interfaces/AuditIssue.md)[]
