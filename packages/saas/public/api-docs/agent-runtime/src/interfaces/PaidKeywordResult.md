[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / PaidKeywordResult

# Interface: PaidKeywordResult

Defined in: agent-runtime/src/keywords/ai-keyword-engine.ts:69

## Properties

### clusters

> **clusters**: `object`[]

Defined in: agent-runtime/src/keywords/ai-keyword-engine.ts:78

Keyword clusters

#### avgDifficulty

> **avgDifficulty**: `number`

#### keywords

> **keywords**: `string`[]

#### name

> **name**: `string`

#### totalVolume

> **totalVolume**: `number`

***

### competitiveInsights?

> `optional` **competitiveInsights**: [`CompetitiveInsight`](CompetitiveInsight.md)[]

Defined in: agent-runtime/src/keywords/ai-keyword-engine.ts:87

Competitive positioning

***

### freeToolIdeas

> **freeToolIdeas**: [`FreeToolIdea`](FreeToolIdea.md)[]

Defined in: agent-runtime/src/keywords/ai-keyword-engine.ts:85

Recommended free tools to build

***

### nlpAnalysis

> **nlpAnalysis**: [`NLPAnalysisResult`](NLPAnalysisResult.md)

Defined in: agent-runtime/src/keywords/ai-keyword-engine.ts:76

NLP analysis results

***

### opportunities

> **opportunities**: [`KeywordOpportunity`](KeywordOpportunity.md)[]

Defined in: agent-runtime/src/keywords/ai-keyword-engine.ts:74

Full keyword opportunities

***

### recommendations

> **recommendations**: [`KeywordRecommendation`](KeywordRecommendation.md)[]

Defined in: agent-runtime/src/keywords/ai-keyword-engine.ts:91

Prioritized recommendations

***

### siteSummary

> **siteSummary**: [`SiteSummary`](SiteSummary.md)

Defined in: agent-runtime/src/keywords/ai-keyword-engine.ts:72

Site summary from AI

***

### tier

> **tier**: [`PlanTier`](../type-aliases/PlanTier.md)

Defined in: agent-runtime/src/keywords/ai-keyword-engine.ts:70

***

### uncertainty

> **uncertainty**: [`UncertaintyAssessment`](UncertaintyAssessment.md)

Defined in: agent-runtime/src/keywords/ai-keyword-engine.ts:89

Uncertainty assessment
