# "Vibe coding a website? Make sure AI can find it."

Image ad, 2026-11-04. `ad.html` is the source; `render.mjs` renders it at 1200x628 (links, X),
1080x1080 (square) and 1080x1350 (4:5) at 2x with the Chromium Playwright installs:

```bash
PW_EXECUTABLE=$HOME/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome \
PLAYWRIGHT_PKG=$(pwd)/node_modules/.pnpm/playwright@1.58.2/node_modules/playwright \
node docs/launch/ad-assets/vibe-coding-2026-11-04/render.mjs
```

The terminal panel is an illustration of the crawler-access report, not a real site's result:
the bot names and the three outcomes (allowed, refused at the edge, disallowed in robots.txt,
training-only) are the ones the audit reports, applied to "yoursite.com". No score or count
is claimed. Copy and layout are the founder's to change in `ad.html`; the CSS variables per
size are at the bottom of the style block.
