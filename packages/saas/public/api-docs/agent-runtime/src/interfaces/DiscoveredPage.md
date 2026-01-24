[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / DiscoveredPage

# Interface: DiscoveredPage

Defined in: agent-runtime/src/audit/discovery/link-crawler.ts:8

Link Crawler Module

Discovers pages from a website by following internal links from the homepage.
Prioritizes important pages like /pricing, /about, /features, etc.

## Properties

### priority

> **priority**: `number`

Defined in: agent-runtime/src/audit/discovery/link-crawler.ts:11

***

### source

> **source**: `"homepage"` \| `"sitemap"` \| `"internal-link"`

Defined in: agent-runtime/src/audit/discovery/link-crawler.ts:10

***

### url

> **url**: `string`

Defined in: agent-runtime/src/audit/discovery/link-crawler.ts:9
