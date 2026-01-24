[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / checkDMARC

# Function: checkDMARC()

> **checkDMARC**(`domain`): `Promise`\<\{ `data`: `DMARCData`; `issues`: [`AuditIssue`](../interfaces/AuditIssue.md)[]; \}\>

Defined in: agent-runtime/src/audit/checks/additional-checks.ts:137

Check DMARC DNS record

## Parameters

### domain

`string`

## Returns

`Promise`\<\{ `data`: `DMARCData`; `issues`: [`AuditIssue`](../interfaces/AuditIssue.md)[]; \}\>
