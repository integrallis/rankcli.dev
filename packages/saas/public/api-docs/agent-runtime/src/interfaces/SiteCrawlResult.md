[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / SiteCrawlResult

# Interface: SiteCrawlResult

Defined in: agent-runtime/src/keywords/site-crawler.ts:26

## Properties

### aggregatedContent

> **aggregatedContent**: `string`

Defined in: agent-runtime/src/keywords/site-crawler.ts:29

***

### crawlStats

> **crawlStats**: `object`

Defined in: agent-runtime/src/keywords/site-crawler.ts:39

#### attempted

> **attempted**: `number`

#### duration

> **duration**: `number`

#### failed

> **failed**: `number`

#### succeeded

> **succeeded**: `number`

***

### detectedPageTypes

> **detectedPageTypes**: `object`

Defined in: agent-runtime/src/keywords/site-crawler.ts:32

#### blog

> **blog**: `number`

#### feature

> **feature**: `number`

#### other

> **other**: `number`

#### pricing

> **pricing**: `number`

#### product

> **product**: `number`

***

### domain

> **domain**: `string`

Defined in: agent-runtime/src/keywords/site-crawler.ts:27

***

### pages

> **pages**: [`CrawledPage`](CrawledPage.md)[]

Defined in: agent-runtime/src/keywords/site-crawler.ts:28

***

### totalWordCount

> **totalWordCount**: `number`

Defined in: agent-runtime/src/keywords/site-crawler.ts:30

***

### uniqueHeadings

> **uniqueHeadings**: `string`[]

Defined in: agent-runtime/src/keywords/site-crawler.ts:31
