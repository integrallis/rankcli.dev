[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / generatePDFReport

# Function: generatePDFReport()

> **generatePDFReport**(`data`, `config`): `Promise`\<`Buffer`\<`ArrayBufferLike`\>\>

Defined in: agent-runtime/src/reports/report-generator.ts:698

Generates a PDF report from audit data
Uses the HTML report as a base and converts to PDF

## Parameters

### data

[`AuditReportData`](../interfaces/AuditReportData.md)

### config

[`ReportConfig`](../interfaces/ReportConfig.md) = `{}`

## Returns

`Promise`\<`Buffer`\<`ArrayBufferLike`\>\>
