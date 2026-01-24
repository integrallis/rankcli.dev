[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / BlogPostConfig

# Interface: BlogPostConfig

Defined in: agent-runtime/src/content/generator.ts:9

Content Generator Module

Generates SEO-optimized content including blog posts, changelogs,
and README files. Supports GEO (Generative Engine Optimization)
for AI-friendly content.

## Properties

### geoOptimize?

> `optional` **geoOptimize**: `boolean`

Defined in: agent-runtime/src/content/generator.ts:15

***

### includeFAQ?

> `optional` **includeFAQ**: `boolean`

Defined in: agent-runtime/src/content/generator.ts:14

***

### keywords?

> `optional` **keywords**: `string`[]

Defined in: agent-runtime/src/content/generator.ts:11

***

### tone?

> `optional` **tone**: `"technical"` \| `"educational"` \| `"casual"` \| `"professional"`

Defined in: agent-runtime/src/content/generator.ts:12

***

### topic

> **topic**: `string`

Defined in: agent-runtime/src/content/generator.ts:10

***

### wordCount?

> `optional` **wordCount**: `object`

Defined in: agent-runtime/src/content/generator.ts:13

#### max

> **max**: `number`

#### min

> **min**: `number`
