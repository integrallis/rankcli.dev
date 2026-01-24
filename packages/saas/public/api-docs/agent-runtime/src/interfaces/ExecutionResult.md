[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / ExecutionResult

# Interface: ExecutionResult

Defined in: agent-runtime/src/executor.ts:13

## Properties

### data?

> `optional` **data**: `unknown`

Defined in: agent-runtime/src/executor.ts:15

***

### error?

> `optional` **error**: `string`

Defined in: agent-runtime/src/executor.ts:16

***

### success

> **success**: `boolean`

Defined in: agent-runtime/src/executor.ts:14

***

### toolCalls?

> `optional` **toolCalls**: `object`[]

Defined in: agent-runtime/src/executor.ts:17

#### name

> **name**: `string`

#### params

> **params**: `unknown`

#### result

> **result**: [`ToolResult`](ToolResult.md)
