[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / NLPAnalysisResult

# Interface: NLPAnalysisResult

Defined in: agent-runtime/src/keywords/nlp-analysis.ts:66

## Properties

### clusters

> **clusters**: [`KeywordCluster`](KeywordCluster.md)[]

Defined in: agent-runtime/src/keywords/nlp-analysis.ts:73

***

### entityPhrases

> **entityPhrases**: `string`[]

Defined in: agent-runtime/src/keywords/nlp-analysis.ts:75

***

### ngrams

> **ngrams**: `object`

Defined in: agent-runtime/src/keywords/nlp-analysis.ts:68

#### bigrams

> **bigrams**: [`NGram`](NGram.md)[]

#### trigrams

> **trigrams**: [`NGram`](NGram.md)[]

#### unigrams

> **unigrams**: [`NGram`](NGram.md)[]

***

### semanticGroups

> **semanticGroups**: `object`[]

Defined in: agent-runtime/src/keywords/nlp-analysis.ts:76

#### keywords

> **keywords**: `string`[]

#### theme

> **theme**: `string`

***

### tfidfKeywords

> **tfidfKeywords**: [`TFIDFResult`](TFIDFResult.md)[]

Defined in: agent-runtime/src/keywords/nlp-analysis.ts:67

***

### topics

> **topics**: [`TopicModel`](TopicModel.md)

Defined in: agent-runtime/src/keywords/nlp-analysis.ts:74
