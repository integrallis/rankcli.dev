# RankCLI for VS Code

280+ technical SEO and AI-search readiness (GEO) checks inside VS Code, Cursor, Windsurf, and any Open VSX-compatible editor — powered locally by `@rankcli/agent-runtime` with **no account and no API key required**.

## Features

- **Audit Site URL (280+ checks)** — Run the full RankCLI audit against any live or preview URL directly from the Command Palette.
- **Audit Local Build Directory** — Audit `dist/`, `out/`, `.output/public/`, or any static build folder before deploying (or right-click any folder in the Explorer → **RankCLI: Audit Local Build Directory**). Findings map straight to local HTML files in the Problems panel.
- **AI Crawler Access & `robots.txt` Linting** — Open any `robots.txt` to see real-time diagnostics split by crawler class:
  - **Search crawlers** (`Googlebot`, `bingbot`) — error if blocked
  - **AI search crawlers** (`OAI-SearchBot`, `Claude-SearchBot`, `PerplexityBot`) — error if blocked (removes the site from AI answers)
  - **User-triggered fetchers** (`ChatGPT-User`, `Claude-User`, `Perplexity-User`) — warning if blocked
  - **Training crawlers** (`GPTBot`, `ClaudeBot`, `CCBot`) — informational policy note (blocking training bots costs no search visibility)
  - Includes a one-click Quick Fix to insert AI-search-friendly crawler rules and a `Sitemap:` directive.
- **Smart Real-Time Markup Linting** — Lints HTML, JSX, TSX, Vue, Astro, and Svelte files as you type with quick fixes for `<title>`, meta description, Open Graph, Twitter Card, canonical, `alt` attributes, and stray `noindex` tags. Automatically distinguishes full page/layout files from UI components so components don't get false positives.
- **Interactive Audit Report** — Side-by-side report panel with overall and category scores, CI gate pass/fail banner, severity/text filters, click-to-open local files, and Markdown/JSON export.
- **`rankcli.config.json` Support** — Reads `url`, `dir`, `maxPages`, `checkLinks`, `headers`, `ignore`, `failOn`, `minScore`, and `budgets` from your workspace config, or scaffolds one with **RankCLI: Create rankcli.config.json**.

## Installation

### VS Code Marketplace

Search for **RankCLI** (`integrallis.rankcli-vscode`) in the Extensions view, or install via CLI:

```bash
code --install-extension integrallis.rankcli-vscode
```

### Open VSX (Cursor, Windsurf, VSCodium, Antigravity)

Search for **RankCLI** (`integrallis.rankcli-vscode`) in your editor's Extensions view, or install from [Open VSX](https://open-vsx.org/extension/integrallis/rankcli-vscode).

## Commands

| Command | Description |
| --- | --- |
| `RankCLI: Audit Site URL (280+ checks)` | Run a full multi-page audit on a live or preview URL |
| `RankCLI: Audit Local Build Directory` | Serve and audit a local build folder (`dist`, `out`, `.output/public`, etc.) |
| `RankCLI: Check AI Crawler Access (GEO)` | Check AI crawler access and GEO signals on a URL or `robots.txt` |
| `RankCLI: Lint Current File` | Run instant SEO linting on the active file |
| `RankCLI: Show Audit Report` | Open the interactive report panel for the last audit |
| `RankCLI: Create rankcli.config.json` | Generate a project config with detected framework and build directory |

## Settings

```json
{
  "rankcli.enabled": true,
  "rankcli.severity": "warning",
  "rankcli.defaultUrl": "https://yoursite.com",
  "rankcli.buildDir": "dist",
  "rankcli.maxPages": 10,
  "rankcli.checkLinks": false,
  "rankcli.checks": {
    "title": true,
    "metaDescription": true,
    "openGraph": true,
    "twitterCard": true,
    "canonical": true,
    "headings": true,
    "images": true,
    "links": true,
    "noindex": true,
    "robotsTxt": true
  }
}
```

## Documentation & Ecosystem

- **Docs**: [rankcli.dev/docs#vscode-extension](https://rankcli.dev/docs#vscode-extension)
- **CLI & GitHub Action**: [github.com/integrallis/rankcli](https://github.com/integrallis/rankcli)
- **MCP Server**: `npx @rankcli/mcp-server`

## License

MIT
