// Customer Slack/Discord alerts: which of a project's alert_configs fire for an event, and
// the message each channel gets. Pure (no Deno or network APIs) so the saas vitest suite
// can test it directly; project-alerts/index.ts does the I/O.
//
// Pro has advertised "Slack/Discord alerts" since launch, and AlertConfigForm has saved
// these configs since 20260906000000 - but nothing read the table, so no alert was ever sent.

export type AlertChannel = 'slack' | 'discord';

export interface AlertConfigRow {
  id: string;
  user_id: string;
  project_id: string | null;
  channel: AlertChannel;
  webhook_url: string;
  on_error: boolean;
  on_score_drop: boolean;
  on_weekly_report: boolean;
  on_pr_created: boolean;
  score_drop_threshold: number;
  enabled: boolean;
}

export type AlertEvent =
  | { kind: 'error'; project: string; error: string; link: string }
  | { kind: 'score_drop'; project: string; from: number; to: number; link: string }
  | { kind: 'pr_created'; project: string; prUrl: string; issuesFixed: number }
  | { kind: 'weekly_report'; project: string; score: number | null; change: number | null; openIssues: number; link: string }
  | { kind: 'test'; link: string };

// Only real Slack/Discord incoming-webhook URLs: the URL comes from the user, and the
// server posts to it, so anything else would make this an SSRF relay.
export function isAllowedWebhook(channel: AlertChannel, url: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== 'https:' || parsed.port) return false;
  if (channel === 'slack') {
    return parsed.hostname === 'hooks.slack.com' && parsed.pathname.startsWith('/services/');
  }
  return (parsed.hostname === 'discord.com' || parsed.hostname === 'discordapp.com')
    && parsed.pathname.startsWith('/api/webhooks/');
}

// Configs that fire for this event: enabled, scoped to this project or user-wide (project_id
// null) for the project's owner, subscribed to the event, and - for a score drop - only when
// the drop meets that config's threshold.
export function configsFor(
  configs: AlertConfigRow[],
  event: AlertEvent,
  target: { projectId: string; ownerId: string },
): AlertConfigRow[] {
  return configs.filter((c) => {
    if (!c.enabled) return false;
    if (c.project_id ? c.project_id !== target.projectId : c.user_id !== target.ownerId) return false;
    if (!isAllowedWebhook(c.channel, c.webhook_url)) return false;
    switch (event.kind) {
      case 'error':
        return c.on_error;
      case 'score_drop':
        return c.on_score_drop && event.from - event.to >= Math.max(1, c.score_drop_threshold);
      case 'pr_created':
        return c.on_pr_created;
      case 'weekly_report':
        return c.on_weekly_report;
      case 'test':
        return false; // a test goes to the URL being tested, never to saved configs
    }
  });
}

function summary(event: AlertEvent): { title: string; body: string; link: string; linkLabel: string; color: number } {
  switch (event.kind) {
    case 'error':
      return {
        title: `Audit failed: ${event.project}`,
        body: event.error.slice(0, 300),
        link: event.link,
        linkLabel: 'Open in RankCLI',
        color: 0xc62828,
      };
    case 'score_drop':
      return {
        title: `SEO score dropped: ${event.project}`,
        body: `${event.from} → ${event.to} (−${event.from - event.to})`,
        link: event.link,
        linkLabel: 'Open in RankCLI',
        color: 0xe0a92e,
      };
    case 'pr_created':
      return {
        title: `Auto-fix PR opened: ${event.project}`,
        body: `${event.issuesFixed} issue${event.issuesFixed === 1 ? '' : 's'} fixed`,
        link: event.prUrl,
        linkLabel: 'Review the pull request',
        color: 0x2e7d32,
      };
    case 'test':
      return {
        title: 'RankCLI alert test',
        body: 'Alerts for this channel are set up correctly.',
        link: event.link,
        linkLabel: 'Open in RankCLI',
        color: 0x2e7d32,
      };
    case 'weekly_report': {
      const change = event.change === null || event.change === 0 ? '' : ` (${event.change > 0 ? '+' : ''}${event.change})`;
      return {
        title: `Weekly SEO report: ${event.project}`,
        body: `Score ${event.score ?? 'n/a'}${change}, ${event.openIssues} open issue${event.openIssues === 1 ? '' : 's'}`,
        link: event.link,
        linkLabel: 'Open in RankCLI',
        color: 0x1c1c1a,
      };
    }
  }
}

// Project names and error text come from audited sites. Slack treats <...> as links and
// mentions, so escape it; Discord would ping on @everyone, so no mentions are allowed.
function slackEscape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function formatAlert(channel: AlertChannel, event: AlertEvent): Record<string, unknown> {
  const s = summary(event);
  if (channel === 'slack') {
    const title = slackEscape(s.title);
    const body = slackEscape(s.body);
    return {
      text: `${title} - ${body}`,
      blocks: [
        { type: 'section', text: { type: 'mrkdwn', text: `*${title}*\n${body}` } },
        { type: 'context', elements: [{ type: 'mrkdwn', text: `<${s.link}|${s.linkLabel}>` }] },
      ],
    };
  }
  return {
    username: 'RankCLI',
    allowed_mentions: { parse: [] },
    embeds: [{ title: s.title, description: s.body, url: s.link, color: s.color }],
  };
}
