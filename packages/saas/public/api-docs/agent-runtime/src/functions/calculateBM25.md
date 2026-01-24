[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / calculateBM25

# Function: calculateBM25()

> **calculateBM25**(`documents`, `query`, `k1`, `b`): `object`[]

Defined in: agent-runtime/src/keywords/nlp-analysis.ts:207

BM25 scoring for keyword relevance
BM25 is a bag-of-words retrieval function that ranks documents by relevance

## Parameters

### documents

`string`[]

### query

`string`

### k1

`number` = `1.5`

### b

`number` = `0.75`

## Returns

`object`[]
