[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / checkCertificate

# Function: checkCertificate()

> **checkCertificate**(`url`): `Promise`\<\{ `daysUntilExpiry?`: `number`; `expiresAt?`: `Date`; `issuer?`: `string`; `issues`: [`AuditIssue`](../interfaces/AuditIssue.md)[]; `valid`: `boolean`; \}\>

Defined in: agent-runtime/src/audit/checks/security.ts:111

## Parameters

### url

`string`

## Returns

`Promise`\<\{ `daysUntilExpiry?`: `number`; `expiresAt?`: `Date`; `issuer?`: `string`; `issues`: [`AuditIssue`](../interfaces/AuditIssue.md)[]; `valid`: `boolean`; \}\>
