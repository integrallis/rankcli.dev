[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / ExecuteOptions

# Interface: ExecuteOptions

Defined in: agent-runtime/src/executor.ts:6

## Properties

### cwd?

> `optional` **cwd**: `string`

Defined in: agent-runtime/src/executor.ts:10

***

### onToolCall()?

> `optional` **onToolCall**: (`name`, `params`) => `void`

Defined in: agent-runtime/src/executor.ts:8

#### Parameters

##### name

`string`

##### params

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### onToolResult()?

> `optional` **onToolResult**: (`name`, `result`) => `void`

Defined in: agent-runtime/src/executor.ts:9

#### Parameters

##### name

`string`

##### result

[`ToolResult`](ToolResult.md)

#### Returns

`void`

***

### variables?

> `optional` **variables**: `Record`\<`string`, `string`\>

Defined in: agent-runtime/src/executor.ts:7
