[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / urlSafetyDatabase

# Variable: urlSafetyDatabase

> `const` **urlSafetyDatabase**: `object`

Defined in: agent-runtime/src/audit/checks/url-safety.ts:645

Export the threat database for external updates

## Type Declaration

### addDomains()

> **addDomains**: (`domains`) => `number`

Add domains to the blocklist

#### Parameters

##### domains

`string`[]

#### Returns

`number`

### addUrls()

> **addUrls**: (`urls`) => `number`

Add URLs to the blocklist

#### Parameters

##### urls

`string`[]

#### Returns

`number`

### clear()

> **clear**: () => `void`

Clear all hashes (useful before reloading from fresh data)

#### Returns

`void`

### getStats()

> **getStats**: () => `object`

Get database statistics

#### Returns

`object`

##### lastUpdated

> **lastUpdated**: `string`

##### prefixCount

> **prefixCount**: `number`

##### sources

> **sources**: `string`[]

### isPopulated()

> **isPopulated**: () => `boolean`

Check if database has been populated with threat data

#### Returns

`boolean`

### loadFromUrlhausCsv()

> **loadFromUrlhausCsv**: (`csv`) => `number`

Load URLs from URLhaus CSV format

#### Parameters

##### csv

`string`

#### Returns

`number`

### loadHashPrefixes()

> **loadHashPrefixes**: (`hashes`) => `number`

Bulk load hash prefixes (for Supabase integration)
Call this with data from: SELECT hash_prefix, hash_type FROM threat_hashes WHERE is_active = TRUE

#### Parameters

##### hashes

`object`[]

#### Returns

`number`
