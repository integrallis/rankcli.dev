[**RankCLI API Documentation v0.0.1**](../../../README.md)

***

[RankCLI API Documentation](../../../README.md) / [agent-runtime/src](../README.md) / discoverPagesFromLinks

# Function: discoverPagesFromLinks()

> **discoverPagesFromLinks**(`baseUrl`, `html`, `maxPages`): [`DiscoveredPage`](../interfaces/DiscoveredPage.md)[]

Defined in: agent-runtime/src/audit/discovery/link-crawler.ts:155

Discover pages from HTML content

## Parameters

### baseUrl

`string`

The base URL of the site

### html

`string`

The HTML content of the homepage

### maxPages

`number` = `5`

Maximum number of pages to return

## Returns

[`DiscoveredPage`](../interfaces/DiscoveredPage.md)[]

Array of discovered pages sorted by priority
