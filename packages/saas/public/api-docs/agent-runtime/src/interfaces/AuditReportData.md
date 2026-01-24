[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / AuditReportData

# Interface: AuditReportData

Defined in: agent-runtime/src/reports/report-generator.ts:41

## Properties

### domain

> **domain**: `string`

Defined in: agent-runtime/src/reports/report-generator.ts:43

***

### healthScores

> **healthScores**: `object`

Defined in: agent-runtime/src/reports/report-generator.ts:46

#### aiReadiness

> **aiReadiness**: `number`

#### content

> **content**: `number`

#### crawlability

> **crawlability**: `number`

#### indexability

> **indexability**: `number`

#### links

> **links**: `number`

#### localSeo

> **localSeo**: `number`

#### onPage

> **onPage**: `number`

#### overall

> **overall**: `number`

#### performance

> **performance**: `number`

#### security

> **security**: `number`

#### social

> **social**: `number`

***

### issues

> **issues**: [`AuditIssueData`](AuditIssueData.md)[]

Defined in: agent-runtime/src/reports/report-generator.ts:65

***

### pages

> **pages**: [`ReportPageData`](ReportPageData.md)[]

Defined in: agent-runtime/src/reports/report-generator.ts:66

***

### score

> **score**: `number`

Defined in: agent-runtime/src/reports/report-generator.ts:45

***

### summary

> **summary**: `object`

Defined in: agent-runtime/src/reports/report-generator.ts:59

#### errors

> **errors**: `number`

#### notices

> **notices**: `number`

#### passed

> **passed**: `number`

#### warnings

> **warnings**: `number`

***

### timestamp

> **timestamp**: `string`

Defined in: agent-runtime/src/reports/report-generator.ts:44

***

### url

> **url**: `string`

Defined in: agent-runtime/src/reports/report-generator.ts:42
