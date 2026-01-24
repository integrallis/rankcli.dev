[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / analyzeRedirects

# Function: analyzeRedirects()

> **analyzeRedirects**(`url`, `maxHops`): `Promise`\<\{ `data`: `RedirectData`; `issues`: [`AuditIssue`](../interfaces/AuditIssue.md)[]; \}\>

Defined in: agent-runtime/src/audit/checks/redirect-analysis.ts:19

## Parameters

### url

`string`

### maxHops

`number` = `10`

## Returns

`Promise`\<\{ `data`: `RedirectData`; `issues`: [`AuditIssue`](../interfaces/AuditIssue.md)[]; \}\>
