[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / comparePeriods

# Function: comparePeriods()

> **comparePeriods**(`current`, `previous`): `object`

Defined in: agent-runtime/src/tracking/search-console.ts:250

Compare two periods to identify trends

## Parameters

### current

[`GSCPerformanceData`](../interfaces/GSCPerformanceData.md)

### previous

[`GSCPerformanceData`](../interfaces/GSCPerformanceData.md)

## Returns

`object`

### declined

> **declined**: [`GSCQueryResult`](../interfaces/GSCQueryResult.md)[]

### improved

> **improved**: [`GSCQueryResult`](../interfaces/GSCQueryResult.md)[]

### lostKeywords

> **lostKeywords**: [`GSCQueryResult`](../interfaces/GSCQueryResult.md)[]

### newKeywords

> **newKeywords**: [`GSCQueryResult`](../interfaces/GSCQueryResult.md)[]

### summary

> **summary**: `object`

#### summary.avgPositionChange

> **avgPositionChange**: `number`

#### summary.clicksChange

> **clicksChange**: `number`

#### summary.impressionsChange

> **impressionsChange**: `number`
