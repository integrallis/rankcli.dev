[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / groupKeywordsByTopic

# Function: groupKeywordsByTopic()

> **groupKeywordsByTopic**(`keywords`): [`TopicClusterResult`](../interfaces/TopicClusterResult.md)

Defined in: agent-runtime/src/keywords/topic-grouping.ts:35

Group keywords into topic clusters using multiple strategies:
1. Shared root words
2. Semantic similarity (common terms)
3. Intent matching (questions, how-to, etc.)
4. N-gram overlap

## Parameters

### keywords

[`KeywordData`](../interfaces/KeywordData.md)[]

## Returns

[`TopicClusterResult`](../interfaces/TopicClusterResult.md)
