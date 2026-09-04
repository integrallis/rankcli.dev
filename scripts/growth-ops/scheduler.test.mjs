import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeSchedule } from './scheduler.mjs';

// 2026-09-07 is a Monday. Cadence weekdays are anchored to campaign_start's
// own weekday (see scheduler.mjs), so with a Monday anchor, offsets land on
// the same days a reader would intuitively expect: 1x=Mon, 2x=Mon/Thu,
// 3x=Mon/Wed/Fri, 7x=every day.
const baseConfig = {
  campaign_start: '2026-09-07',
  channels: {
    weekly: { posts_per_week: 1 },
    threeXWeek: { posts_per_week: 3 },
    daily: { posts_per_week: 7 },
    disabled: { posts_per_week: 1, enabled: false },
    windowed: { posts_per_week: 1, active_weeks: 4 },
  },
};

test('1x/week posts only on the campaign_start weekday (Monday here)', () => {
  const mon = computeSchedule(baseConfig, '2026-09-14'); // Monday
  const tue = computeSchedule(baseConfig, '2026-09-15'); // Tuesday
  assert.equal(mon.weekly.due, true);
  assert.equal(tue.weekly.due, false);
});

test('3x/week posts Mon, Wed, Fri when anchored to a Monday launch', () => {
  const days = {
    '2026-09-14': true,  // Mon
    '2026-09-15': false, // Tue
    '2026-09-16': true,  // Wed
    '2026-09-17': false, // Thu
    '2026-09-18': true,  // Fri
    '2026-09-19': false, // Sat
    '2026-09-20': false, // Sun
  };
  for (const [date, expected] of Object.entries(days)) {
    const s = computeSchedule(baseConfig, date);
    assert.equal(s.threeXWeek.due, expected, `${date} expected due=${expected}`);
  }
});

test('7x/week posts every day, any anchor', () => {
  for (const date of ['2026-09-14', '2026-09-19', '2026-09-20']) {
    assert.equal(computeSchedule(baseConfig, date).daily.due, true);
  }
});

test('launch day itself is always a posting day, regardless of which weekday it falls on', () => {
  // This is the bug the anchoring design fixes: before it, a Tuesday launch
  // with Monday-hardcoded cadence days would post nothing on launch day —
  // exactly the day a real campaign most needs the push.
  const tuesdayLaunch = { campaign_start: '2026-09-08', channels: { social: { posts_per_week: 3 } } };
  const fridayLaunch = { campaign_start: '2026-09-11', channels: { social: { posts_per_week: 3 } } };
  const sundayLaunch = { campaign_start: '2026-09-13', channels: { social: { posts_per_week: 1 } } };

  assert.equal(computeSchedule(tuesdayLaunch, '2026-09-08').social.due, true);
  assert.equal(computeSchedule(fridayLaunch, '2026-09-11').social.due, true);
  assert.equal(computeSchedule(sundayLaunch, '2026-09-13').social.due, true);
});

test('disabled channel is never due', () => {
  const s = computeSchedule(baseConfig, '2026-09-14');
  assert.equal(s.disabled.due, false);
  assert.equal(s.disabled.reason, 'disabled in config');
});

test('channel is not due before campaign_start', () => {
  const beforeStart = computeSchedule(baseConfig, '2026-08-31'); // a Monday, before campaign_start
  assert.equal(beforeStart.weekly.due, false);
  assert.match(beforeStart.weekly.reason, /hasn't started/);
});

test('active_weeks-windowed channel stops after the window elapses', () => {
  const withinWindow = computeSchedule(baseConfig, '2026-09-28'); // Monday, campaign week 2 (0-indexed)
  const afterWindow = computeSchedule(baseConfig, '2026-10-12'); // Monday, campaign week 4 — window is active_weeks:4 (weeks 0-3)
  assert.equal(withinWindow.windowed.due, true);
  assert.equal(afterWindow.windowed.due, false);
  assert.match(afterWindow.windowed.reason, /no active phase/);
});

test('content_calendar channel indexes a distinct item per slot, in order', () => {
  const config = {
    campaign_start: '2026-09-07', // Monday
    channels: {
      reddit: {
        posts_per_week: 3, // Mon, Wed, Fri
        content_calendar: [
          { subreddit: 'SideProject' },
          { subreddit: 'SaaS' },
          { subreddit: 'webdev' },
        ],
      },
    },
  };
  const mon1 = computeSchedule(config, '2026-09-07'); // 1st Mon = slot 0
  const wed1 = computeSchedule(config, '2026-09-09'); // 1st Wed = slot 1
  const fri1 = computeSchedule(config, '2026-09-11'); // 1st Fri = slot 2

  assert.equal(mon1.reddit.contentItem.subreddit, 'SideProject');
  assert.equal(wed1.reddit.contentItem.subreddit, 'SaaS');
  assert.equal(fri1.reddit.contentItem.subreddit, 'webdev');
});

test('content_calendar channel goes not-due once the list is exhausted', () => {
  const config = {
    campaign_start: '2026-09-07',
    channels: {
      reddit: {
        posts_per_week: 1, // Monday only
        content_calendar: [{ subreddit: 'SideProject' }],
      },
    },
  };
  const firstMonday = computeSchedule(config, '2026-09-07');
  const secondMonday = computeSchedule(config, '2026-09-14');

  assert.equal(firstMonday.reddit.due, true);
  assert.equal(secondMonday.reddit.due, false);
  assert.match(secondMonday.reddit.reason, /exhausted/);
});

test('rejects an invalid posts_per_week', () => {
  const config = { campaign_start: '2026-09-07', channels: { bad: { posts_per_week: 8 } } };
  assert.throws(() => computeSchedule(config, '2026-09-14'));
});

test('scheduling is deterministic — same input always gives same output', () => {
  const a = computeSchedule(baseConfig, '2026-09-16');
  const b = computeSchedule(baseConfig, '2026-09-16');
  assert.deepEqual(a, b);
});

// --- Phased cadence: launch push tapering to a sustained rate ---
// The pattern the launch-playbook research actually supports: aggressive
// cadence for the first few weeks, then taper to something sustainable
// indefinitely — rather than either burning out at launch pace forever or
// only ever posting once a week from day one.

test('phased channel uses the launch-phase cadence during weeks 0-3', () => {
  const config = {
    campaign_start: '2026-09-07', // Monday
    channels: {
      social: {
        phases: [
          { start_week: 0, end_week: 4, posts_per_week: 3 }, // Mon/Wed/Fri, weeks 1-4
          { start_week: 4, end_week: null, posts_per_week: 1 }, // Monday only, forever after
        ],
      },
    },
  };
  // Week 1 (campaign week 0): Wed should be due under the 3x phase
  const week1Wed = computeSchedule(config, '2026-09-09');
  assert.equal(week1Wed.social.due, true);
  assert.match(week1Wed.social.reason, /week 1/);
});

test('phased channel switches to the sustain-phase cadence after the launch window', () => {
  const config = {
    campaign_start: '2026-09-07', // Monday
    channels: {
      social: {
        phases: [
          { start_week: 0, end_week: 4, posts_per_week: 3 },
          { start_week: 4, end_week: null, posts_per_week: 1 },
        ],
      },
    },
  };
  // Campaign week 5 (0-indexed week 4): Wednesday should NO LONGER be due —
  // only Monday, since the sustain phase is 1x/week.
  const week5Wed = computeSchedule(config, '2026-10-07'); // Wednesday, week 4 (0-indexed)
  const week5Mon = computeSchedule(config, '2026-10-05'); // Monday, week 4 (0-indexed)
  assert.equal(week5Wed.social.due, false);
  assert.equal(week5Mon.social.due, true);
  assert.match(week5Mon.social.reason, /week 5/);
});

test('phased content_calendar assigns slots correctly across a cadence change', () => {
  const config = {
    campaign_start: '2026-09-07', // Monday
    channels: {
      reddit: {
        phases: [
          { start_week: 0, end_week: 1, posts_per_week: 3 }, // week 0 only: Mon/Wed/Fri (3 slots)
          { start_week: 1, end_week: null, posts_per_week: 1 }, // week 1+: Monday only
        ],
        content_calendar: [
          { subreddit: 'SideProject' }, // week0 Mon
          { subreddit: 'SaaS' },        // week0 Wed
          { subreddit: 'webdev' },      // week0 Fri
          { subreddit: 'programming' }, // week1 Mon
        ],
      },
    },
  };
  const week0Mon = computeSchedule(config, '2026-09-07');
  const week0Wed = computeSchedule(config, '2026-09-09');
  const week0Fri = computeSchedule(config, '2026-09-11');
  const week1Mon = computeSchedule(config, '2026-09-14');
  const week1Wed = computeSchedule(config, '2026-09-16'); // no longer a posting day at all

  assert.equal(week0Mon.reddit.contentItem.subreddit, 'SideProject');
  assert.equal(week0Wed.reddit.contentItem.subreddit, 'SaaS');
  assert.equal(week0Fri.reddit.contentItem.subreddit, 'webdev');
  assert.equal(week1Mon.reddit.contentItem.subreddit, 'programming');
  assert.equal(week1Wed.reddit.due, false);
});

test('channel with a gap between phases is not due during the gap', () => {
  const config = {
    campaign_start: '2026-09-07', // Monday
    channels: {
      social: {
        phases: [
          { start_week: 0, end_week: 1, posts_per_week: 1 },
          { start_week: 3, end_week: null, posts_per_week: 1 }, // gap: weeks 1-2 have no phase
        ],
      },
    },
  };
  const week0 = computeSchedule(config, '2026-09-07'); // week 0, covered
  const week1 = computeSchedule(config, '2026-09-14'); // week 1, gap
  const week3 = computeSchedule(config, '2026-09-28'); // week 3, covered again
  assert.equal(week0.social.due, true);
  assert.equal(week1.social.due, false);
  assert.match(week1.social.reason, /no active phase/);
  assert.equal(week3.social.due, true);
});
