[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / ExecOptions

# Interface: ExecOptions

Defined in: agent-runtime/src/git/pr-helper.ts:56

## Properties

### execAsync()?

> `optional` **execAsync**: \{(`command`): `PromiseWithChild`\<\{ \}\>; (`command`, `options`): `PromiseWithChild`\<\{ \}\>; (`command`, `options`): `PromiseWithChild`\<\{ \}\>; (`command`, `options`): `PromiseWithChild`\<\{ \}\>; \}

Defined in: agent-runtime/src/git/pr-helper.ts:57

#### Call Signature

> (`command`): `PromiseWithChild`\<\{ \}\>

##### Parameters

###### command

`string`

##### Returns

`PromiseWithChild`\<\{ \}\>

#### Call Signature

> (`command`, `options`): `PromiseWithChild`\<\{ \}\>

##### Parameters

###### command

`string`

###### options

`ExecOptionsWithBufferEncoding`

##### Returns

`PromiseWithChild`\<\{ \}\>

#### Call Signature

> (`command`, `options`): `PromiseWithChild`\<\{ \}\>

##### Parameters

###### command

`string`

###### options

`ExecOptionsWithStringEncoding`

##### Returns

`PromiseWithChild`\<\{ \}\>

#### Call Signature

> (`command`, `options`): `PromiseWithChild`\<\{ \}\>

##### Parameters

###### command

`string`

###### options

`ExecOptions`

##### Returns

`PromiseWithChild`\<\{ \}\>
