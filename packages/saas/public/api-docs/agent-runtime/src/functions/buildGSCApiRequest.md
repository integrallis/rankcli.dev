[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / buildGSCApiRequest

# Function: buildGSCApiRequest()

> **buildGSCApiRequest**(`siteUrl`, `startDate`, `endDate`, `options`): `object`

Defined in: agent-runtime/src/tracking/search-console.ts:117

Build GSC API request (for use with Google APIs client)
User needs to set up OAuth or service account credentials

## Parameters

### siteUrl

`string`

### startDate

`string`

### endDate

`string`

### options

#### dimensions?

(`"query"` \| `"page"` \| `"country"` \| `"device"` \| `"date"`)[]

#### rowLimit?

`number`

#### startRow?

`number`

## Returns

`object`
