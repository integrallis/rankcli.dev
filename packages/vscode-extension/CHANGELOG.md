# Changelog

All notable changes to the RankCLI VS Code extension will be documented in this file.

## [0.1.0] - 2026-11-25

### Added
- **Full 280+ check audit engine** powered by `@rankcli/agent-runtime` — runs locally with no account or API key required.
- **Audit Site URL** (`RankCLI: Audit Site URL`) and **Audit Local Build Directory** (`RankCLI: Audit Local Build Directory`, also available from the Explorer right-click menu on folders like `dist/`, `out/`, or `.output/public/`).
- **Check AI Crawler Access (GEO)** (`RankCLI: Check AI Crawler Access (GEO)`) to inspect live site or `robots.txt` crawler rules by bot class.
- **Real-time `robots.txt` linting** by crawler class (search, AI search, user-triggered fetchers, training crawlers) using the engine's unified bot table, plus a Quick Fix to insert AI-search-friendly rules.
- **Interactive Audit Report webview** with overall and category scores, CI gate pass/fail status, severity/text filters, click-to-open-file for build-directory findings, and Markdown/JSON export.
- **`rankcli.config.json` support** (reads `url`, `dir`, `maxPages`, `checkLinks`, `headers`, `ignore`, `failOn`, `minScore`, `budgets`) plus `RankCLI: Create rankcli.config.json` with automatic framework detection.
- **Stray `noindex` detection**, `<title>` and meta description length warnings, and cleaner diagnostics.

### Fixed
- **Component false positives**: `.jsx`, `.tsx`, `.vue`, `.astro`, and `.svelte` UI components are no longer flagged for missing `<title>`, `<meta description>`, Open Graph, Twitter Card, canonical, or `<h1>` tags unless the file is a page/document shell or defines page metadata.
- **Framework metadata awareness**: Recognizes Next.js App Router `metadata`/`generateMetadata`, Nuxt `useSeoMeta`/`useHead`, `<Head>`, `<Helmet>`, `<svelte:head>`, JSX `alt={...}`, and icon links with `aria-label` or `<svg>`/`<img>`.
- Published under the `Integrallis` publisher (`Integrallis.rankcli-vscode`) with Marketplace and Open VSX support.
