/**
 * Growth Ops scheduler.
 *
 * Pure function of (config, today) -> which channels are due to post today,
 * and which curated content-calendar item is due for channels that use one
 * (e.g. Reddit, where posting the same generic blurb to every subreddit is
 * exactly the pattern that gets accounts flagged — those channels post from
 * a human-curated list, not a template).
 *
 * Supports phased cadence per channel (e.g. "3x/week for the first 4 weeks,
 * then 1x/week indefinitely") — the documented pattern for a launch push
 * that tapers into a sustained cadence, per SaaS-launch playbook research
 * (see docs/launch/automation-setup.md for sourcing).
 *
 * No external state, no persistence, no network calls. Given the same
 * config and the same date, this always returns the same answer — that's
 * deliberate: it means a failed/re-run workflow can never double-post, and
 * the whole schedule can be audited or unit-tested without touching any
 * live system.
 */

/**
 * Which weekdays to post on for a given cadence, anchored so that offset 0
 * always falls on campaign_start's own weekday — this guarantees launch
 * day itself is always a posting day for any enabled channel (cadence >=
 * 1x/week), regardless of which day of the week you launch on. Offsets are
 * spread evenly across the week rather than clustered.
 *
 * @param {number} postsPerWeek - 1-7
 * @param {number} anchorWeekday - campaign_start's day of week, 0=Sun..6=Sat
 * @returns {number[]} weekdays (0-6) this cadence posts on
 */
function weekdaysFor(postsPerWeek, anchorWeekday) {
  if (!Number.isInteger(postsPerWeek) || postsPerWeek < 1 || postsPerWeek > 7) {
    throw new Error(`posts_per_week must be 1-7, got: ${postsPerWeek}`);
  }
  const offsets = new Set();
  for (let i = 0; i < postsPerWeek; i++) {
    offsets.add(Math.floor((i * 7) / postsPerWeek));
  }
  return [...offsets].map((offset) => (anchorWeekday + offset) % 7);
}

/**
 * @param {string} dateStr - ISO date, e.g. "2026-09-08"
 * @returns {Date} UTC midnight of that date
 */
function parseUTCDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  return d;
}

function daysBetween(a, b) {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/** Which campaign week `today` falls in, 0-indexed from campaignStart. */
function campaignWeek(campaignStart, today) {
  return Math.floor(daysBetween(campaignStart, today) / 7);
}

/**
 * Normalize a channel's config to a `phases` array. Channels may either
 * declare `phases` directly (for a cadence that changes over time), or the
 * simpler `posts_per_week` (+ optional `active_weeks`) for a flat cadence —
 * treated as a single implicit phase.
 */
function normalizePhases(channel) {
  if (channel.phases) return channel.phases;
  if (channel.posts_per_week == null) {
    throw new Error('channel must declare either "phases" or "posts_per_week"');
  }
  return [{
    start_week: 0,
    end_week: channel.active_weeks ?? null,
    posts_per_week: channel.posts_per_week,
  }];
}

/** The phase active during `week` (0-indexed), or null if none matches. */
function phaseForWeek(phases, week) {
  if (week < 0) return null;
  return phases.find((p) => week >= p.start_week && (p.end_week == null || week < p.end_week)) || null;
}

/**
 * How many posting-day slots have occurred for this channel, strictly
 * before `today`, since campaignStart — walked day-by-day (not a closed
 * form) so it stays correct across phase transitions with different
 * cadences. Used to index into a content_calendar so each slot gets a
 * distinct, non-repeating item.
 */
function slotIndexBefore(phases, campaignStart, today, anchorWeekday) {
  let count = 0;
  const cursor = new Date(campaignStart);
  while (cursor < today) {
    const week = campaignWeek(campaignStart, cursor);
    const phase = phaseForWeek(phases, week);
    if (phase && weekdaysFor(phase.posts_per_week, anchorWeekday).includes(cursor.getUTCDay())) {
      count++;
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}

/**
 * @param {object} config - parsed campaign-config.json
 * @param {string} todayStr - ISO date to evaluate, e.g. "2026-09-08"
 * @returns {object} { [channelName]: { due: boolean, reason: string, contentItem?: object } }
 */
export function computeSchedule(config, todayStr) {
  const campaignStart = parseUTCDate(config.campaign_start);
  const today = parseUTCDate(todayStr);
  const anchorWeekday = campaignStart.getUTCDay();
  const result = {};

  for (const [name, channel] of Object.entries(config.channels)) {
    if (channel.enabled === false) {
      result[name] = { due: false, reason: 'disabled in config' };
      continue;
    }
    if (today < campaignStart) {
      result[name] = { due: false, reason: `campaign hasn't started (starts ${config.campaign_start})` };
      continue;
    }

    const phases = normalizePhases(channel);
    const week = campaignWeek(campaignStart, today);
    const phase = phaseForWeek(phases, week);

    if (!phase) {
      result[name] = { due: false, reason: `no active phase for campaign week ${week + 1} — offer/campaign has ended for this channel` };
      continue;
    }

    if (!weekdaysFor(phase.posts_per_week, anchorWeekday).includes(today.getUTCDay())) {
      result[name] = { due: false, reason: `not a scheduled day (week ${week + 1}, ${phase.posts_per_week}x/week phase)` };
      continue;
    }

    if (channel.content_calendar) {
      const slot = slotIndexBefore(phases, campaignStart, today, anchorWeekday);
      const item = channel.content_calendar[slot];
      if (!item) {
        result[name] = { due: false, reason: `content_calendar exhausted (slot ${slot}, only ${channel.content_calendar.length} items curated) — add more items or this channel stays silent` };
        continue;
      }
      result[name] = { due: true, reason: `week ${week + 1}, content_calendar[${slot}]`, contentItem: item };
      continue;
    }

    result[name] = { due: true, reason: `week ${week + 1}, ${phase.posts_per_week}x/week phase, generated status content` };
  }

  return result;
}

// CLI entry point: `node scheduler.mjs <config.json> [YYYY-MM-DD]`
// Prints the schedule as JSON to stdout. Defaults to today (UTC) if no
// date given — the GitHub Actions workflow always passes an explicit date
// so a workflow_dispatch dry run can simulate any day.
if (import.meta.url === `file://${process.argv[1]}`) {
  const { readFileSync } = await import('node:fs');
  const configPath = process.argv[2];
  const dateArg = process.argv[3] || new Date().toISOString().slice(0, 10);

  if (!configPath) {
    console.error('Usage: node scheduler.mjs <config.json> [YYYY-MM-DD]');
    process.exit(1);
  }

  const config = JSON.parse(readFileSync(configPath, 'utf-8'));
  const schedule = computeSchedule(config, dateArg);
  console.log(JSON.stringify(schedule, null, 2));
}
