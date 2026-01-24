[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / ReportData

# Interface: ReportData

Defined in: agent-runtime/src/tracking/report-generator.ts:7

## Properties

### audit?

> `optional` **audit**: [`AuditReport`](AuditReport.md)

Defined in: agent-runtime/src/tracking/report-generator.ts:10

***

### comparison?

> `optional` **comparison**: `object`

Defined in: agent-runtime/src/tracking/report-generator.ts:16

#### declined

> **declined**: `any`[]

#### improved

> **improved**: `any`[]

#### lostKeywords

> **lostKeywords**: `any`[]

#### newKeywords

> **newKeywords**: `any`[]

#### summary

> **summary**: `object`

##### summary.avgPositionChange

> **avgPositionChange**: `number`

##### summary.clicksChange

> **clicksChange**: `number`

##### summary.impressionsChange

> **impressionsChange**: `number`

***

### generatedAt

> **generatedAt**: `string`

Defined in: agent-runtime/src/tracking/report-generator.ts:9

***

### siteUrl

> **siteUrl**: `string`

Defined in: agent-runtime/src/tracking/report-generator.ts:8

***

### tracking?

> `optional` **tracking**: `object`

Defined in: agent-runtime/src/tracking/report-generator.ts:11

#### current

> **current**: [`GSCPerformanceData`](GSCPerformanceData.md)

#### previous?

> `optional` **previous**: [`GSCPerformanceData`](GSCPerformanceData.md)

#### quickWins

> **quickWins**: [`QuickWin`](QuickWin.md)[]
