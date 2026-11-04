// Renders ad.html at the three sizes with Playwright's Chromium: node render.mjs
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const dir = dirname(fileURLToPath(import.meta.url));
// playwright is a dependency of the repo root, resolved from there
const { chromium } = createRequire(join(dir, '../../../../package.json'))(process.env.PLAYWRIGHT_PKG || 'playwright');
const sizes = { wide: [1200, 628], square: [1080, 1080], tall: [1080, 1350] };
// PW_EXECUTABLE points at an installed Chromium when the package's own build is missing
const browser = await chromium.launch(process.env.PW_EXECUTABLE ? { executablePath: process.env.PW_EXECUTABLE } : {});
for (const [name, [w, h]] of Object.entries(sizes)) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
  await page.goto('file://' + join(dir, 'ad.html'));
  await page.evaluate((cls) => document.body.classList.add(cls), name);
  await page.waitForTimeout(300);
  const out = join(dir, `vibe-coding-${w}x${h}.png`);
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width: w, height: h } });
  console.log('wrote', out);
  await page.close();
}
await browser.close();
