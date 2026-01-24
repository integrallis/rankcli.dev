[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / SEOAnalysisResult

# Interface: SEOAnalysisResult

Defined in: agent-runtime/src/types.ts:31

## Properties

### core\_web\_vitals?

> `optional` **core\_web\_vitals**: `object`

Defined in: agent-runtime/src/types.ts:34

#### cls?

> `optional` **cls**: `object`

##### cls.status

> **status**: `"good"` \| `"needs-improvement"` \| `"poor"`

##### cls.value

> **value**: `string`

#### fid?

> `optional` **fid**: `object`

##### fid.status

> **status**: `"good"` \| `"needs-improvement"` \| `"poor"`

##### fid.value

> **value**: `string`

#### lcp?

> `optional` **lcp**: `object`

##### lcp.status

> **status**: `"good"` \| `"needs-improvement"` \| `"poor"`

##### lcp.value

> **value**: `string`

***

### issues

> **issues**: [`SEOIssue`](SEOIssue.md)[]

Defined in: agent-runtime/src/types.ts:39

***

### recommendations

> **recommendations**: [`SEORecommendation`](SEORecommendation.md)[]

Defined in: agent-runtime/src/types.ts:40

***

### score

> **score**: `number`

Defined in: agent-runtime/src/types.ts:33

***

### url

> **url**: `string`

Defined in: agent-runtime/src/types.ts:32
