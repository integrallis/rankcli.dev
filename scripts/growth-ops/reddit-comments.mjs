#!/usr/bin/env node
// Build a page of genuine answers to look for, for building Reddit standing.
//
// r/webdev's removal on 2026-09-30 told us to comment on other posts first, and the
// r/SideProject post was silently filtered. Reddit expects roughly 90% participation to 10%
// self-promotion and we are at 0/100, so the account cannot carry a post yet regardless of how
// good the post is.
//
// This is not a list of comments to paste. Each entry is a question we can genuinely answer,
// a Reddit search that surfaces threads asking it, and a draft to adapt to whatever the person
// actually said. Pasting any of these verbatim across several threads would be the exact
// pattern we are trying to escape - identical repeated comments read as spam to both automod
// and humans, and would set the account back rather than forward.
//
// Every draft is free of links and of any mention of the product. That is the point: standing
// comes from being useful without an ask attached.
//
//   node scripts/growth-ops/reddit-comments.mjs

import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', '..', 'docs/launch/reddit-comments.html');

/**
 * Topics we can answer from what the product actually checks, so the expertise is real rather
 * than researched for the occasion.
 */
const TOPICS = [
  {
    tag: 'Cloudflare / Googlebot',
    subs: ['webdev', 'SEO', 'TechSEO', 'bigseo', 'sysadmin'],
    query: 'cloudflare googlebot blocked 403',
    looksLike: 'Someone reporting an impressions or crawl drop, 403s in Search Console, or asking what Cloudflare’s AI crawler setting actually did.',
    draft: `Worth checking whether the block is at the CDN rather than in robots.txt — they fail in completely different places and robots.txt won't show you this one.

Since Sept 15 Cloudflare disallows AI Training and Agent crawlers by default on ad-supported pages. The catch is that Googlebot is classed as *mixed-use*: it crawls for Search and for AI training in the same bot, and the most restrictive rule wins. So if Training is blocked — including via the older "Block AI Bots" toggle — Googlebot can get 403s on pages and sitemap fetches while robots.txt still says Allow.

Quickest way to tell them apart: curl your own URL with Googlebot's user-agent and compare the status to a normal browser request. If the browser gets 200 and Googlebot gets 403, it's an edge rule, not robots.txt. Then confirm with Search Console's URL Inspection, which fetches as the verified Googlebot — a spoofed UA isn't verified, so it's indicative rather than conclusive.

Fix is in zone Security → Bots, not in your repo.`,
  },
  {
    tag: 'SPA not indexed',
    subs: ['reactjs', 'webdev', 'nextjs', 'vuejs'],
    query: 'react site not showing in google search index',
    looksLike: 'A client-rendered site that renders fine in a browser but does not rank, or shows a blank page in Search Console’s rendered HTML.',
    draft: `Check what the server actually returns before JavaScript runs — \`curl -s yoursite.com | head -50\`. If all you see is \`<div id="root"></div>\`, that's what a crawler without a rendering budget sees too.

Google will render JS, but it's a second pass on a queue, and it isn't guaranteed. Everything else in the ecosystem — most AI crawlers, link previews, Bing — is far less forgiving and often takes the raw HTML at face value.

The fix isn't necessarily a rewrite. Prerendering the marketing routes at build time gets you most of the benefit for a fraction of the work: the dashboard can stay a pure SPA, it's the pages you want indexed that need real HTML. If you're already on a meta-framework, that's usually a config flag rather than a migration.`,
  },
  {
    tag: 'Canonical tags in SPAs',
    subs: ['nextjs', 'reactjs', 'webdev', 'sveltejs'],
    query: 'canonical tag single page app duplicate content',
    looksLike: 'Someone adding canonical tags to a single-page app, or wondering why every page is being treated as a duplicate.',
    draft: `One thing that bites people here: if you put the canonical in the shared \`index.html\` shell, every route inherits it, and you've just told Google that your whole site is a duplicate of one URL.

Helmet-style libraries can add tags but cannot remove a static one that's already in the shell, so a "default" canonical there is permanent on every page. It has to be set per route, or prerendered per page.

Fast way to check: \`curl -s yoursite.com/some-deep-page | grep canonical\`. If it comes back pointing at \`/\`, that's the bug.`,
  },
  {
    tag: 'AI crawlers / robots.txt',
    subs: ['webdev', 'SEO', 'TechSEO', 'selfhosted'],
    query: 'robots.txt GPTBot ClaudeBot allow block AI crawlers',
    looksLike: 'Someone deciding whether to allow or block AI crawlers, or writing robots.txt rules for them.',
    draft: `Worth knowing the RFC 9309 detail before you write those rules: a crawler obeys only the **most specific group that names it**, and ignores the \`*\` group entirely once there's a group with its own name.

So this does not do what it looks like:

    User-agent: *
    Disallow: /admin

    User-agent: GPTBot
    Allow: /

GPTBot now has a group of its own, so it never reads the \`*\` rules — including the \`/admin\` Disallow. Every per-bot group needs its own copy of the shared rules. It's a very easy way to accidentally open something you thought was closed.

Also: robots.txt is a request, not enforcement, and it's a separate layer from whatever your CDN does. A bot can be allowed in robots.txt and still get a 403 at the edge.`,
  },
  {
    tag: 'CLS / layout shift',
    subs: ['webdev', 'Frontend', 'reactjs'],
    query: 'cumulative layout shift images CLS fix',
    looksLike: 'Someone chasing a CLS score, or images jumping as the page loads.',
    draft: `If it's images, set \`width\` and \`height\` attributes even when CSS is doing the sizing. Browsers use them to compute an aspect ratio and reserve the space before the image arrives, which is what stops the jump — \`max-width: 100%; height: auto\` in CSS then keeps it responsive.

Worth being proportionate about it though: missing dimensions is a real CLS cost, not a broken site. Plenty of well-built sites ship without them. If your CLS is bad, fonts and late-injected banners are usually the bigger contributors — a font swap that reflows a heading moves far more pixels than one image.`,
  },
  {
    tag: 'Sitemaps',
    subs: ['webdev', 'SEO', 'TechSEO', 'nextjs'],
    query: 'sitemap.xml not being read google search console',
    looksLike: 'A sitemap that is not being picked up, or questions about lastmod and what belongs in it.',
    draft: `Two things that catch people:

\`lastmod\` has to be honest. If every URL claims today's date on every build, it stops being a signal and gets ignored — it should be the date the *content* changed, not the date you deployed.

And the sitemap should only contain URLs you actually want indexed, returning 200, canonical to themselves. Including noindex pages, redirects or 404s doesn't break anything outright but it degrades trust in the whole file.

If Search Console says "couldn't fetch", try fetching it with a Googlebot user-agent rather than a browser — a CDN bot rule refusing the sitemap looks identical to a broken sitemap from the dashboard, and they have completely different fixes.`,
  },
  {
    tag: 'Structured data',
    subs: ['webdev', 'SEO', 'TechSEO'],
    query: 'json-ld schema markup organization rich results',
    looksLike: 'Someone adding JSON-LD, or asking which schema types are worth the effort.',
    draft: `Keep the structured data to things that are true and checkable. It's tempting to fill in every field the spec offers, but a phone number or address that doesn't correspond to anything real is a liability rather than a win — it's a machine-readable claim about your business, and it's the format search engines trust most.

Practically: Organization and WebSite on the homepage, Article on posts, Product where there's a real product, and stop there unless you have a specific rich result in mind. Validate with Google's Rich Results Test, and make sure the JSON-LD agrees with what's visible on the page — disagreement between the two is worse than having neither.`,
  },
  {
    tag: 'Framework SEO',
    subs: ['nextjs', 'sveltejs', 'vuejs', 'django', 'rails', 'laravel', 'astrojs'],
    query: 'seo best practices framework meta tags',
    looksLike: 'A framework-specific SEO question — where meta tags belong, why a page is not indexing, how to handle per-route metadata.',
    draft: `The generic SEO advice mostly doesn't transfer, because the same fix has a different shape in every framework — a canonical is the Metadata API in Next.js, a load function in SvelteKit, a layout helper in Rails.

The bit that is universal: check what the server sends before JS runs, and make sure each route's metadata is actually per-route rather than inherited from a shared shell. Those two catch most of it.

Happy to go into specifics if you say which framework and what you're seeing in the raw HTML.`,
  },
  {
    tag: 'AI search visibility',
    subs: ['SEO', 'TechSEO', 'bigseo', 'webdev'],
    query: 'chatgpt perplexity citing my website AI search traffic',
    looksLike: 'Someone asking how to show up in ChatGPT or Perplexity answers, or whether AI search is worth caring about.',
    draft: `Two separate problems that get conflated: whether the assistant can *fetch* your page, and whether what it fetches is *quotable*.

The first is mechanical — can GPTBot, ClaudeBot and PerplexityBot actually reach the URL. robots.txt is only half of it; a CDN bot rule can refuse them regardless of what robots.txt says, and most checks stop at robots.txt.

The second is content shape. Answer-shaped content gets quoted: a clear claim, then the support, with specifics and numbers rather than hedging. Long preambles get skipped. It's close to what makes a good Stack Overflow answer.

Worth saying the honest caveat — Seer Interactive's data shows brands cited in AI Overviews get ~35% more organic clicks, but they're explicit that it's correlation. Sites with more authority get cited more, so the lift may be partly the cause rather than the effect.`,
  },
  {
    tag: 'noindex and staging',
    subs: ['webdev', 'SEO', 'TechSEO'],
    query: 'staging site indexed google noindex accidentally',
    looksLike: 'A staging or preview environment that got indexed, or a noindex left on production after launch.',
    draft: `Check both places it can come from — the meta tag and the \`X-Robots-Tag\` response header. They behave identically to a crawler, but they live in completely different systems, and people usually only check the one they know about.

\`curl -sI yoursite.com | grep -i x-robots\` for the header, and grep the HTML for the meta tag. Vercel, Netlify and Cloudflare Pages all add that header automatically on preview deployments, which is usually what's happening when a preview URL shows up in search — and also why the same check on production comes back clean and confuses everyone.`,
  },
];

const escape = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const cards = TOPICS.map((t) => {
  const searches = t.subs
    .map((sub) => {
      const url = `https://www.reddit.com/r/${sub}/search/?q=${encodeURIComponent(t.query)}&restrict_sr=1&sort=new&t=month`;
      return `<a class="sub" href="${escape(url)}" target="_blank" rel="noopener">r/${escape(sub)}</a>`;
    })
    .join(' ');
  return `  <article>
    <div class="tag">${escape(t.tag)}</div>
    <p class="looks"><strong>Look for:</strong> ${escape(t.looksLike)}</p>
    <div class="subs">${searches}</div>
    <pre>${escape(t.draft)}</pre>
  </article>`;
}).join('\n');

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>RankCLI — Reddit comment drafts</title>
<style>
  :root { color-scheme: dark; }
  body { background:#0a0a0a; color:#e4e4e7; font:15px/1.65 ui-sans-serif,system-ui,sans-serif; max-width:860px; margin:0 auto; padding:40px 20px; }
  h1 { color:#22c55e; font-size:1.5rem; margin-bottom:6px; }
  .note { color:#a1a1aa; border-left:3px solid #27272a; padding-left:14px; margin:18px 0 34px; }
  .note strong { color:#e4e4e7; }
  article { border:1px solid #27272a; border-radius:10px; padding:20px; margin:0 0 24px; }
  .tag { color:#22c55e; font-size:12px; text-transform:uppercase; letter-spacing:.07em; font-weight:600; }
  .looks { color:#a1a1aa; font-size:14px; margin:8px 0 12px; }
  .subs { margin-bottom:14px; }
  .sub { display:inline-block; background:#18181b; border:1px solid #27272a; color:#e4e4e7; text-decoration:none; padding:4px 10px; border-radius:99px; font-size:13px; margin:0 6px 6px 0; }
  .sub:hover { border-color:#22c55e; color:#22c55e; }
  pre { background:#111113; border-radius:7px; padding:16px; overflow-x:auto; white-space:pre-wrap; color:#d4d4d8; font-size:13.5px; margin:0; }
</style></head><body>
<h1>Comment drafts — for building standing, not traffic</h1>
<p class="note">
  <strong>These are not for pasting.</strong> Each one is a question we can genuinely answer.
  Click a subreddit to see threads asking it, read what the person actually said, and adapt the
  draft to them. Posting any of these verbatim in several threads is the exact spam pattern
  we're trying to escape &mdash; identical repeated comments read as spam to automod and to
  humans, and would set the account back.<br><br>
  <strong>No links. No mention of the product.</strong> That is the point: standing comes from
  being useful with no ask attached. Reddit expects about 90% participation to 10%
  self-promotion, and we are at 0/100.<br><br>
  Ten to fifteen of these, over several days, gets the account past the karma gates
  (100+ for r/webdev, 200+ for r/SaaS) and past the silent filter that ate the r/SideProject
  post. Skip anything where the honest answer is "I don't know" &mdash; being wrong in public
  costs more than staying quiet.
</p>
${cards}
</body></html>
`;

writeFileSync(OUT, html);
console.log(`wrote ${OUT}`);
console.log(`  ${TOPICS.length} topics across ${new Set(TOPICS.flatMap((t) => t.subs)).size} subreddits`);

if (!process.argv.includes('--no-open')) {
  try {
    execFileSync('open', [OUT]);
    console.log('opened in your browser');
  } catch {
    console.log(`open it with:  open ${OUT}`);
  }
}
