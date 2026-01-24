[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / FreeKeywordResult

# Interface: FreeKeywordResult

Defined in: agent-runtime/src/keywords/ai-keyword-engine.ts:48

## Properties

### keywords

> **keywords**: `object`[]

Defined in: agent-runtime/src/keywords/ai-keyword-engine.ts:51

Basic keyword suggestions (limited)

#### estimatedDifficulty

> **estimatedDifficulty**: `"high"` \| `"medium"` \| `"low"`

#### estimatedVolume

> **estimatedVolume**: `"high"` \| `"medium"` \| `"low"`

#### keyword

> **keyword**: `string`

#### relevance

> **relevance**: `number`

***

### opportunityScore

> **opportunityScore**: `number`

Defined in: agent-runtime/src/keywords/ai-keyword-engine.ts:58

Overall keyword opportunity score (teaser)

***

### siteCategory

> **siteCategory**: `string`

Defined in: agent-runtime/src/keywords/ai-keyword-engine.ts:64

Basic site understanding

***

### teaserMessage

> **teaserMessage**: `string`

Defined in: agent-runtime/src/keywords/ai-keyword-engine.ts:60

Teaser message

***

### tier

> **tier**: `"free"`

Defined in: agent-runtime/src/keywords/ai-keyword-engine.ts:49

***

### totalKeywordsFound

> **totalKeywordsFound**: `number`

Defined in: agent-runtime/src/keywords/ai-keyword-engine.ts:66

Detected keywords count

***

### upgradeFeatures

> **upgradeFeatures**: `string`[]

Defined in: agent-runtime/src/keywords/ai-keyword-engine.ts:62

What they'd get with upgrade
