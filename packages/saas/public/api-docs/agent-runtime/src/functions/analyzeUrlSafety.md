[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / analyzeUrlSafety

# Function: analyzeUrlSafety()

> **analyzeUrlSafety**(`url`, `externalLinks`): `object`

Defined in: agent-runtime/src/audit/checks/url-safety.ts:513

Analyze URL safety using local hash database and pattern matching

This function performs two types of checks:
1. Hash-based lookup against the local threat database
2. Pattern-based detection for suspicious URL characteristics

No external API calls are made - all checks are local.

## Parameters

### url

`string`

### externalLinks

`string`[] = `[]`

## Returns

`object`

### data

> **data**: `UrlSafetyData`

### issues

> **issues**: [`AuditIssue`](../interfaces/AuditIssue.md)[]
