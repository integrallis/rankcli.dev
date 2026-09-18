// Customer Slack/Discord alerts (supabase/functions/_shared/alerts.ts): which configs fire,
// which webhook URLs the server will post to, and what each channel receives.
import { describe, it, expect } from 'vitest';
import { configsFor, formatAlert, isAllowedWebhook, type AlertConfigRow } from '../../supabase/functions/_shared/alerts.ts';

const slack = 'https://hooks.slack.com/services/T000/B000/XXXX';
const discord = 'https://discord.com/api/webhooks/123/abc';

const config = (over: Partial<AlertConfigRow> = {}): AlertConfigRow => ({
  id: 'c1', user_id: 'owner', project_id: 'p1', channel: 'slack', webhook_url: slack,
  on_error: true, on_score_drop: true, on_weekly_report: false, on_pr_created: true,
  score_drop_threshold: 10, enabled: true, ...over,
});
const target = { projectId: 'p1', ownerId: 'owner' };
const drop = (from: number, to: number) => ({ kind: 'score_drop' as const, project: 'shop.example', from, to, link: 'https://rankcli.dev/dashboard/projects/p1' });

describe('isAllowedWebhook', () => {
  it('accepts real Slack and Discord incoming webhooks', () => {
    expect(isAllowedWebhook('slack', slack)).toBe(true);
    expect(isAllowedWebhook('discord', discord)).toBe(true);
    expect(isAllowedWebhook('discord', 'https://discordapp.com/api/webhooks/1/x')).toBe(true);
  });
  it('refuses anything the server should not post to', () => {
    expect(isAllowedWebhook('slack', 'http://hooks.slack.com/services/x')).toBe(false);
    expect(isAllowedWebhook('slack', 'https://hooks.slack.com.evil.example/services/x')).toBe(false);
    expect(isAllowedWebhook('slack', 'https://169.254.169.254/latest')).toBe(false);
    expect(isAllowedWebhook('slack', discord)).toBe(false);
    expect(isAllowedWebhook('discord', 'https://discord.com:8443/api/webhooks/1/x')).toBe(false);
    expect(isAllowedWebhook('slack', 'not a url')).toBe(false);
  });
});

describe('configsFor', () => {
  it('fires a score drop only at or past the config threshold', () => {
    expect(configsFor([config()], drop(80, 71), target)).toHaveLength(0);
    expect(configsFor([config()], drop(80, 70), target)).toHaveLength(1);
    expect(configsFor([config({ score_drop_threshold: 0 })], drop(80, 80), target)).toHaveLength(0);
  });
  it('respects the event flags and the enabled switch', () => {
    const err = { kind: 'error' as const, project: 'p', error: 'boom', link: 'l' };
    expect(configsFor([config({ on_error: false })], err, target)).toHaveLength(0);
    expect(configsFor([config({ enabled: false })], err, target)).toHaveLength(0);
    expect(configsFor([config()], { kind: 'weekly_report', project: 'p', score: 70, change: -2, openIssues: 3, link: 'l' }, target)).toHaveLength(0);
  });
  it('matches project-scoped configs and the owner\'s user-wide ones only', () => {
    const err = { kind: 'error' as const, project: 'p', error: 'boom', link: 'l' };
    const configs = [
      config({ id: 'this-project' }),
      config({ id: 'other-project', project_id: 'p2' }),
      config({ id: 'owner-wide', project_id: null }),
      config({ id: 'someone-else-wide', project_id: null, user_id: 'intruder' }),
      config({ id: 'bad-url', webhook_url: 'https://example.com/hook' }),
    ];
    expect(configsFor(configs, err, target).map((c) => c.id)).toEqual(['this-project', 'owner-wide']);
  });
});

describe('formatAlert', () => {
  it('builds a Slack message with a fallback text and a link', () => {
    const msg = formatAlert('slack', drop(80, 62)) as { text: string; blocks: { elements?: { text: string }[] }[] };
    expect(msg.text).toContain('SEO score dropped: shop.example');
    expect(msg.text).toContain('80 → 62 (−18)');
    expect(msg.blocks[1].elements?.[0].text).toBe('<https://rankcli.dev/dashboard/projects/p1|Open in RankCLI>');
  });
  it('escapes site-controlled text for Slack and never pings in Discord', () => {
    const err = { kind: 'error' as const, project: 'x', error: 'boom <https://evil.example|click> @everyone', link: 'https://rankcli.dev/p' };
    const s = formatAlert('slack', err) as { text: string };
    expect(s.text).toContain('&lt;https://evil.example|click&gt;');
    expect(s.text).not.toContain('<https://evil.example');
    const d = formatAlert('discord', err) as { allowed_mentions: { parse: string[] } };
    expect(d.allowed_mentions).toEqual({ parse: [] });
  });
  it('builds a Discord embed and links a PR to the PR itself', () => {
    const msg = formatAlert('discord', { kind: 'pr_created', project: 'shop.example', prUrl: 'https://github.com/o/r/pull/7', issuesFixed: 1 }) as { embeds: { title: string; description: string; url: string }[] };
    expect(msg.embeds[0]).toMatchObject({ title: 'Auto-fix PR opened: shop.example', description: '1 issue fixed', url: 'https://github.com/o/r/pull/7' });
  });
});
