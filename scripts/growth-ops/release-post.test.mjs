import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPosts, releaseUrl, headlineFromTitle } from './release-post.mjs';

const release = {
  version: 'v0.0.44',
  headline: 'framework-aware static paths',
  summary:
    'Framework detection is rebuilt on scored evidence: 57% to 94% accuracy on a 51-site corpus, and it answers "unknown" instead of guessing.',
  highlights: ['Docusaurus and Sphinx detection', 'Auto-fix PRs write to static/, wwwroot/, priv/static/'],
};

test('every channel gets the version and the release link', () => {
  const posts = buildPosts(release);
  for (const [channel, post] of Object.entries(posts)) {
    const text = typeof post === 'string' ? post : `${post.title}\n${post.body}`;
    assert.match(text, /v0\.0\.44/, `${channel} should name the version`);
  }
  assert.match(posts.bluesky, /rankcli-cli\/releases\/tag\/v0\.0\.44/);
  assert.match(posts.devto.body, /rankcli-cli\/releases\/tag\/v0\.0\.44/);
});

test('the link points at the public repo, because the private one 404s for readers', () => {
  assert.equal(
    releaseUrl('v0.0.44'),
    'https://github.com/integrallis/rankcli-cli/releases/tag/v0.0.44'
  );
  assert.doesNotMatch(buildPosts(release).linkedin, /rankcli\.dev\/releases/);
});

test('the Bluesky post fits in 300 characters', () => {
  assert.ok(buildPosts(release).bluesky.length <= 300, 'within the limit');
});

test('a long summary is trimmed rather than overflowing Bluesky', () => {
  const posts = buildPosts({ ...release, summary: 'word '.repeat(200).trim() });
  assert.ok(posts.bluesky.length <= 300, `was ${posts.bluesky.length}`);
  assert.match(posts.bluesky, /…/, 'shows that it was cut');
  // The link survives the trim - a truncated announcement with no link is useless.
  assert.match(posts.bluesky, /releases\/tag\/v0\.0\.44$/);
});

test('a short summary is left alone, with no stray ellipsis', () => {
  assert.doesNotMatch(buildPosts(release).bluesky, /…/);
});

test('highlights appear on the channels with room, not on Bluesky', () => {
  const posts = buildPosts(release);
  assert.match(posts.linkedin, /• Docusaurus and Sphinx detection/);
  assert.match(posts.discord, /• Docusaurus and Sphinx detection/);
  assert.match(posts.devto.body, /• Docusaurus and Sphinx detection/);
  assert.doesNotMatch(posts.bluesky, /Docusaurus/);
});

test('no highlights means no empty bullet block', () => {
  const posts = buildPosts({ ...release, highlights: [] });
  assert.doesNotMatch(posts.linkedin, /•/);
  assert.doesNotMatch(posts.discord, /•/);
});

test('every channel tells the reader how to install it', () => {
  const posts = buildPosts(release);
  assert.match(posts.bluesky, /npm i -g @rankcli\/cli/);
  assert.match(posts.linkedin, /npm i -g @rankcli\/cli/);
  assert.match(posts.devto.body, /npm i -g @rankcli\/cli/);
});

test('a release with nothing written about it is refused, not posted empty', () => {
  assert.throws(() => buildPosts({ version: 'v0.0.44' }), /version, headline and summary/);
  assert.throws(() => buildPosts({ ...release, summary: '' }), /version, headline and summary/);
});

test('the headline is read off a release title', () => {
  assert.equal(
    headlineFromTitle('v0.0.44 — framework-aware static paths', 'v0.0.44'),
    'framework-aware static paths'
  );
  // A bare tag as the title has no headline in it; using the tag beats using nothing.
  assert.equal(headlineFromTitle('v0.0.44', 'v0.0.44'), 'v0.0.44');
});
