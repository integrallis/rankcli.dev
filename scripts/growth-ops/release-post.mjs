// Turns a release into per-channel announcement copy.
//
// growth-ops posts one thing on a schedule: the weekly dogfood score. There was no path for
// "we shipped something" - so v0.0.44 rebuilt framework detection, went out to npm, Homebrew
// and Scoop, and nothing anywhere said so. This is that path.
//
// It keeps growth-ops' rule that no post is free-form AI-generated copy. The judgment about
// what a release means stays human: `summary` is a sentence someone writes, and `highlights`
// are lines someone chose. This file only does the parts that are mechanical and easy to get
// wrong at 11pm - per-channel length limits, the right link, consistent install instructions.
//
// Pure and unit-tested (release-post.test.mjs), like scheduler.mjs, so the workflow around it
// stays a thin shell.

/** Bluesky counts graphemes, but its limit is 300 and we stay well under it. */
const BLUESKY_LIMIT = 300;

/**
 * The public release page. Releases are cut on the private repo and mirrored to the public one;
 * only the mirror can be opened by anyone who isn't in the org, so it is the only URL worth
 * putting in a post.
 */
export function releaseUrl(version, repo = 'integrallis/rankcli-cli') {
  return `https://github.com/${repo}/releases/tag/${version}`;
}

/**
 * Trim to a limit at a word boundary, with an ellipsis only if something was actually cut.
 */
function clamp(text, limit) {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

/**
 * @typedef {object} ReleaseInput
 * @property {string} version - tag, e.g. "v0.0.44"
 * @property {string} headline - a few words on what shipped, e.g. "framework-aware static paths"
 * @property {string} summary - one human-written sentence. The whole post on short channels.
 * @property {string[]} [highlights] - short human-written lines, for the channels with room.
 * @property {string} [url] - defaults to the public release page for this version.
 */

/**
 * Build the copy for every channel. Nothing here posts anything.
 *
 * @param {ReleaseInput} release
 * @returns {{bluesky: string, linkedin: string, discord: string, devto: {title: string, body: string}}}
 */
export function buildPosts(release) {
  const { version, headline, summary, highlights = [] } = release;
  if (!version || !headline || !summary) {
    throw new Error('release needs version, headline and summary');
  }

  const url = release.url ?? releaseUrl(version);
  const install = 'npm i -g @rankcli/cli';

  // Bluesky: the link and install line are fixed cost, so the summary absorbs the trimming.
  const bskyTail = `\n\n${install}\n${url}`;
  const bskyHead = `rankcli ${version} — ${headline}\n\n`;
  const bluesky =
    bskyHead + clamp(summary, BLUESKY_LIMIT - bskyHead.length - bskyTail.length) + bskyTail;

  const bulletBlock = highlights.length ? `\n\n${highlights.map((h) => `• ${h}`).join('\n')}` : '';

  const linkedin =
    `rankcli ${version} — ${headline}\n\n${summary}${bulletBlock}\n\n` +
    `RankCLI runs 280+ SEO and GEO checks from your terminal or your CI, and opens pull ` +
    `requests with the fixes. Free forever on the CLI.\n\n${install}\n${url}`;

  const discord = `**rankcli ${version} — ${headline}**\n\n${summary}${bulletBlock}\n\n<${url}>`;

  const devto = {
    title: `rankcli ${version}: ${headline}`,
    body:
      `${summary}${bulletBlock}\n\n` +
      `## Try it\n\n\`\`\`bash\n${install}\nrankcli audit -u https://your-site.dev\n\`\`\`\n\n` +
      `The CLI, the MCP server and the GitHub Action are free forever. ` +
      `[Full release notes](${url}) · [rankcli.dev](https://rankcli.dev)\n`,
  };

  return { bluesky, linkedin, discord, devto };
}

/**
 * Pull the headline out of a release title like "v0.0.44 — framework-aware static paths".
 * Falls back to the whole title when it carries no separator.
 */
export function headlineFromTitle(title, version) {
  const withoutVersion = title.replace(version, '').trim();
  return withoutVersion.replace(/^[—\-–:·]\s*/, '').trim() || title;
}

// CLI: reads TAG, TITLE, SUMMARY and HIGHLIGHTS (one per line) from the environment and prints
// the posts as JSON, so the workflow can pick channels out with jq. Environment rather than
// argv because a summary is a sentence, and sentences and shell quoting are a bad pair.
if (import.meta.url === `file://${process.argv[1]}`) {
  const version = process.env.TAG;
  const highlights = (process.env.HIGHLIGHTS ?? '')
    .split('\n')
    .map((line) => line.trim().replace(/^[-*•]\s*/, ''))
    .filter(Boolean);

  console.log(
    JSON.stringify(
      buildPosts({
        version,
        headline: headlineFromTitle(process.env.TITLE || version || '', version ?? ''),
        summary: process.env.SUMMARY,
        highlights,
      }),
      null,
      2
    )
  );
}
