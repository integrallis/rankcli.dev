[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / sendSlackAlert

# Function: sendSlackAlert()

> **sendSlackAlert**(`webhookUrl`, `type`, `payload`): `Promise`\<[`AlertResult`](../interfaces/AlertResult.md)\>

Defined in: agent-runtime/src/scheduler/alerts.ts:228

Sends an alert to Slack webhook

## Parameters

### webhookUrl

`string`

### type

[`AlertType`](../type-aliases/AlertType.md)

### payload

[`AuditAlertPayload`](../interfaces/AuditAlertPayload.md)

## Returns

`Promise`\<[`AlertResult`](../interfaces/AlertResult.md)\>
