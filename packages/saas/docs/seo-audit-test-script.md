# SEO Audit Tool Testing Script

Use this script to manually collect competitor scores for the 50 test websites.

## Quick Links to Competitor Tools

Open these in browser tabs for testing:

1. **Seobility**: https://www.seobility.net/en/seocheck/
2. **SEOptimer**: https://www.seoptimer.com/
3. **Website Grader**: https://website.grader.com/
4. **Backlinko/Semrush**: https://backlinko.com/tools/seo-checker
5. **PageSpeed Insights**: https://pagespeed.web.dev/
6. **Rank Math**: https://rankmath.com/tools/seo-analyzer/
7. **AIOSEO**: https://aioseo.com/seo-analyzer/

## Test Websites (Copy-Paste Ready)

### Batch 1: Major Tech (10 sites)
```
https://github.com
https://stripe.com
https://shopify.com
https://vercel.com
https://netlify.com
https://cloudflare.com
https://digitalocean.com
https://twilio.com
https://figma.com
https://notion.so
```

### Batch 2: SaaS Startups (10 sites)
```
https://linear.app
https://raycast.com
https://posthog.com
https://cal.com
https://resend.com
https://clerk.com
https://supabase.com
https://planetscale.com
https://railway.app
https://render.com
```

### Batch 3: E-commerce (10 sites)
```
https://allbirds.com
https://warbyparker.com
https://glossier.com
https://casper.com
https://away.com
https://everlane.com
https://bombas.com
https://brooklinen.com
https://mejuri.com
https://outdoor-voices.com
```

### Batch 4: Media & Content (10 sites)
```
https://theverge.com
https://arstechnica.com
https://techcrunch.com
https://producthunt.com
https://indiehackers.com
https://dev.to
https://hashnode.com
https://smashingmagazine.com
https://css-tricks.com
https://web.dev
```

### Batch 5: Dev Tools & Small (10 sites)
```
https://basecamp.com
https://hey.com
https://deno.land
https://bun.sh
https://htmx.org
https://astro.build
https://svelte.dev
https://solidjs.com
https://qwik.builder.io
https://remix.run
```

---

## Data Collection Template

Copy this CSV template and fill in scores:

```csv
Website,Seobility,SEOptimer,WebsiteGrader,PageSpeed_Perf,PageSpeed_SEO,RankMath,Notes
github.com,,,,,,
stripe.com,,,,,,
shopify.com,,,,,,
vercel.com,,,,,,
netlify.com,,,,,,
cloudflare.com,,,,,,
digitalocean.com,,,,,,
twilio.com,,,,,,
figma.com,,,,,,
notion.so,,,,,,
linear.app,,,,,,
raycast.com,,,,,,
posthog.com,,,,,,
cal.com,,,,,,
resend.com,,,,,,
clerk.com,,,,,,
supabase.com,,,,,,
planetscale.com,,,,,,
railway.app,,,,,,
render.com,,,,,,
allbirds.com,,,,,,
warbyparker.com,,,,,,
glossier.com,,,,,,
casper.com,,,,,,
away.com,,,,,,
everlane.com,,,,,,
bombas.com,,,,,,
brooklinen.com,,,,,,
mejuri.com,,,,,,
outdoor-voices.com,,,,,,
theverge.com,,,,,,
arstechnica.com,,,,,,
techcrunch.com,,,,,,
producthunt.com,,,,,,
indiehackers.com,,,,,,
dev.to,,,,,,
hashnode.com,,,,,,
smashingmagazine.com,,,,,,
css-tricks.com,,,,,,
web.dev,,,,,,
basecamp.com,,,,,,
hey.com,,,,,,
deno.land,,,,,,
bun.sh,,,,,,
htmx.org,,,,,,
astro.build,,,,,,
svelte.dev,,,,,,
solidjs.com,,,,,,
qwik.builder.io,,,,,,
remix.run,,,,,,
```

---

## Key Findings to Record

For each tool, note:

### 1. Score Breakdown
- Overall score (0-100 or letter grade)
- Performance score
- SEO score
- Mobile score
- Security score

### 2. Top Issues Found
Record the top 5 issues each tool reports:
1. Issue name
2. Severity (Critical/Warning/Info)
3. Affected elements count

### 3. Unique Recommendations
Note any recommendations unique to each tool that others don't catch.

---

## Automation Options

### Using Playwright (Recommended)
```bash
npm install playwright
npx playwright codegen https://www.seobility.net/en/seocheck/
```

### Using Puppeteer
```javascript
const puppeteer = require('puppeteer');

async function testSite(url, tool) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Example for Seobility
  await page.goto('https://www.seobility.net/en/seocheck/');
  await page.type('#url', url);
  await page.click('button[type="submit"]');
  await page.waitForSelector('.score', { timeout: 60000 });

  const score = await page.$eval('.score', el => el.textContent);
  console.log(`${url}: ${score}`);

  await browser.close();
}
```

### Using PageSpeed API (with key)
```bash
# Get API key from: https://developers.google.com/speed/docs/insights/v5/get-started
API_KEY="your-api-key"

curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://example.com&key=$API_KEY&category=seo&category=performance" | jq '.lighthouseResult.categories'
```

---

## Notes

- **Rate Limits**: Most tools limit 1-3 checks per day per IP
- **VPN Option**: Use VPN to reset rate limits between batches
- **Best Time**: Test early morning when servers are less loaded
- **Caching**: Some tools cache results for 24h - retest later for fresh data
