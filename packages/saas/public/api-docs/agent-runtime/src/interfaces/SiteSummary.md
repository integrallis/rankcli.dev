[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / SiteSummary

# Interface: SiteSummary

Defined in: agent-runtime/src/keywords/ai-summarizer.ts:11

## Properties

### businessModel

> **businessModel**: `"other"` \| `"agency"` \| `"saas"` \| `"ecommerce"` \| `"marketplace"` \| `"media"`

Defined in: agent-runtime/src/keywords/ai-summarizer.ts:23

Business model

***

### confidence

> **confidence**: `number`

Defined in: agent-runtime/src/keywords/ai-summarizer.ts:39

Confidence score (0-1)

***

### geographicFocus?

> `optional` **geographicFocus**: `string`

Defined in: agent-runtime/src/keywords/ai-summarizer.ts:31

Geographic focus

***

### industry

> **industry**: `string`

Defined in: agent-runtime/src/keywords/ai-summarizer.ts:21

Industry/category

***

### keyFeatures

> **keyFeatures**: `string`[]

Defined in: agent-runtime/src/keywords/ai-summarizer.ts:19

Key features/benefits (3-7 items)

***

### nicheFocus?

> `optional` **nicheFocus**: `string`

Defined in: agent-runtime/src/keywords/ai-summarizer.ts:27

Niche focus (if specific segment)

***

### pricingTier?

> `optional` **pricingTier**: `"unknown"` \| `"free"` \| `"freemium"` \| `"paid"` \| `"enterprise"`

Defined in: agent-runtime/src/keywords/ai-summarizer.ts:29

Pricing tier detected

***

### problemsSolved

> **problemsSolved**: `string`[]

Defined in: agent-runtime/src/keywords/ai-summarizer.ts:35

Problems solved

***

### productDescription

> **productDescription**: `string`

Defined in: agent-runtime/src/keywords/ai-summarizer.ts:15

What the product does (1-2 sentences)

***

### productName

> **productName**: `string`

Defined in: agent-runtime/src/keywords/ai-summarizer.ts:13

Primary product/service name

***

### suggestedSeedKeywords

> **suggestedSeedKeywords**: `string`[]

Defined in: agent-runtime/src/keywords/ai-summarizer.ts:37

Seed keyword suggestions

***

### targetAudience

> **targetAudience**: `string`

Defined in: agent-runtime/src/keywords/ai-summarizer.ts:17

Target audience description

***

### uncertainties

> **uncertainties**: `string`[]

Defined in: agent-runtime/src/keywords/ai-summarizer.ts:41

What we're uncertain about

***

### useCases

> **useCases**: `string`[]

Defined in: agent-runtime/src/keywords/ai-summarizer.ts:33

Primary use cases

***

### valueProposition

> **valueProposition**: `string`

Defined in: agent-runtime/src/keywords/ai-summarizer.ts:25

Unique value proposition
