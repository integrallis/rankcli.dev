# SEO Autopilot for VS Code

Real-time SEO linting for HTML, React, Vue, and Astro files.

## Features

- **Real-time diagnostics** - See SEO issues as you type
- **Quick fixes** - One-click fixes for common SEO problems
- **Status bar indicator** - Always know your SEO score
- **Configurable** - Enable/disable specific checks

## Checks

| Check | Description |
|-------|-------------|
| `MISSING_TITLE` | Page missing `<title>` tag |
| `MISSING_META_DESCRIPTION` | Page missing meta description |
| `MISSING_OG_TAGS` | Missing Open Graph tags |
| `MISSING_TWITTER_CARD` | Missing Twitter Card tags |
| `MISSING_CANONICAL` | Missing canonical URL |
| `MISSING_H1` | Page missing H1 heading |
| `MULTIPLE_H1` | Page has multiple H1 headings |
| `IMG_MISSING_ALT` | Image missing alt text |
| `EMPTY_LINK` | Link has no text content |

## Supported Languages

- HTML
- JavaScript React (JSX)
- TypeScript React (TSX)
- Vue
- Astro
- Svelte

## Configuration

```json
{
  "seo-autopilot.enabled": true,
  "seo-autopilot.severity": "warning",
  "seo-autopilot.checks": {
    "title": true,
    "metaDescription": true,
    "openGraph": true,
    "twitterCard": true,
    "canonical": true,
    "headings": true,
    "images": true,
    "links": true
  }
}
```

## Commands

- `SEO Autopilot: Run SEO Audit` - Run a full audit on the current file
- `SEO Autopilot: Show SEO Report` - Show all SEO issues in the current file

## Installation

Search for "SEO Autopilot" in the VS Code marketplace.

Or install via command line:

```bash
code --install-extension seo-autopilot.seo-autopilot
```

## Development

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test

# Package for distribution
pnpm package
```

## License

MIT
