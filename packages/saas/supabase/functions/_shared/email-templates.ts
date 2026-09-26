/**
 * Email Templates for RankCLI
 * Clean, minimal HTML emails with rankcli branding.
 */

// Brand colors
const COLORS = {
  primary: '#6366f1', // Indigo
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  background: '#09090b',
  surface: '#18181b',
  text: '#fafafa',
  textMuted: '#a1a1aa',
  border: '#27272a',
};

/**
 * Base email layout wrapper
 */
function baseLayout(content: string, preheader?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>RankCLI</title>
  ${preheader ? `<span style="display:none;font-size:1px;color:${COLORS.background};max-height:0;overflow:hidden;">${preheader}</span>` : ''}
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: ${COLORS.background};
      color: ${COLORS.text};
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    .card {
      background: ${COLORS.surface};
      border: 1px solid ${COLORS.border};
      border-radius: 12px;
      padding: 32px;
      margin-bottom: 24px;
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: ${COLORS.text};
      text-decoration: none;
    }
    .logo-icon {
      color: ${COLORS.primary};
    }
    h1 {
      margin: 0 0 16px;
      font-size: 24px;
      font-weight: 600;
      color: ${COLORS.text};
    }
    h2 {
      margin: 24px 0 12px;
      font-size: 18px;
      font-weight: 600;
      color: ${COLORS.text};
    }
    p {
      margin: 0 0 16px;
      line-height: 1.6;
      color: ${COLORS.textMuted};
    }
    .score {
      font-size: 48px;
      font-weight: bold;
      text-align: center;
      margin: 24px 0;
    }
    .score-good { color: ${COLORS.success}; }
    .score-warning { color: ${COLORS.warning}; }
    .score-bad { color: ${COLORS.error}; }
    .stats {
      display: flex;
      justify-content: center;
      gap: 32px;
      margin: 24px 0;
      text-align: center;
    }
    .stat {
      flex: 1;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: ${COLORS.text};
    }
    .stat-label {
      font-size: 12px;
      color: ${COLORS.textMuted};
      text-transform: uppercase;
    }
    .stat-error .stat-value { color: ${COLORS.error}; }
    .stat-warning .stat-value { color: ${COLORS.warning}; }
    .issue {
      padding: 12px 16px;
      margin: 8px 0;
      border-radius: 8px;
      border-left: 4px solid;
    }
    .issue-error {
      background: rgba(239, 68, 68, 0.1);
      border-color: ${COLORS.error};
    }
    .issue-warning {
      background: rgba(234, 179, 8, 0.1);
      border-color: ${COLORS.warning};
    }
    .issue-title {
      font-weight: 500;
      color: ${COLORS.text};
      margin: 0;
    }
    .issue-category {
      font-size: 12px;
      color: ${COLORS.textMuted};
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background: ${COLORS.primary};
      color: white !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 500;
      text-align: center;
    }
    .button-outline {
      background: transparent;
      border: 1px solid ${COLORS.border};
      color: ${COLORS.text} !important;
    }
    .footer {
      text-align: center;
      padding-top: 32px;
      border-top: 1px solid ${COLORS.border};
      margin-top: 32px;
    }
    .footer p {
      font-size: 12px;
      color: ${COLORS.textMuted};
    }
    .footer a {
      color: ${COLORS.textMuted};
    }
    .site-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid ${COLORS.border};
    }
    .site-row:last-child {
      border-bottom: none;
    }
    .site-name {
      font-weight: 500;
      color: ${COLORS.text};
    }
    .site-domain {
      font-size: 14px;
      color: ${COLORS.textMuted};
    }
    @media only screen and (max-width: 600px) {
      .container { padding: 20px 16px; }
      .card { padding: 24px 20px; }
      .stats { flex-direction: column; gap: 16px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://rankcli.dev" class="logo">
        <span class="logo-icon">⚡</span> RankCLI
      </a>
    </div>
    ${content}
    <div class="footer">
      <p>
        You received this email because you have notifications enabled for your RankCLI account.
        <br>
        <a href="https://rankcli.dev/account?tab=notifications">Manage notification preferences</a>
      </p>
      <p>© ${new Date().getFullYear()} RankCLI. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
}

/**
 * Get score color class based on score value
 */
function getScoreClass(score: number): string {
  if (score >= 80) return 'score-good';
  if (score >= 60) return 'score-warning';
  return 'score-bad';
}

/**
 * Audit Complete Email
 */
export interface AuditCompleteData {
  siteName: string;
  siteUrl: string;
  score: number;
  previousScore?: number;
  errors: number;
  warnings: number;
  topIssues: Array<{
    title: string;
    category: string;
    severity: 'error' | 'warning';
  }>;
  auditUrl: string;
}

export function auditCompleteEmail(data: AuditCompleteData): { html: string; text: string; subject: string } {
  const scoreChange = data.previousScore !== undefined
    ? data.score - data.previousScore
    : null;

  const scoreChangeText = scoreChange !== null
    ? scoreChange > 0
      ? `<span style="color: ${COLORS.success}">↑ ${scoreChange}</span>`
      : scoreChange < 0
        ? `<span style="color: ${COLORS.error}">↓ ${Math.abs(scoreChange)}</span>`
        : `<span style="color: ${COLORS.textMuted}">no change</span>`
    : '';

  const issuesHtml = data.topIssues.slice(0, 5).map(issue => `
    <div class="issue issue-${issue.severity}">
      <p class="issue-title">${escapeHtml(issue.title)}</p>
      <span class="issue-category">${escapeHtml(issue.category)}</span>
    </div>
  `).join('');

  const html = baseLayout(`
    <div class="card">
      <h1>Audit Complete for ${escapeHtml(data.siteName)}</h1>
      <p>Your SEO audit has finished. Here's a summary of the results.</p>
      
      <div class="score ${getScoreClass(data.score)}">
        ${data.score}/100 ${scoreChangeText}
      </div>
      
      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 24px 0; text-align: center;">
        <tr>
          <td style="padding: 8px;">
            <div style="font-size: 24px; font-weight: bold; color: ${COLORS.error};">${data.errors}</div>
            <div style="font-size: 12px; color: ${COLORS.textMuted}; text-transform: uppercase;">Errors</div>
          </td>
          <td style="padding: 8px;">
            <div style="font-size: 24px; font-weight: bold; color: ${COLORS.warning};">${data.warnings}</div>
            <div style="font-size: 12px; color: ${COLORS.textMuted}; text-transform: uppercase;">Warnings</div>
          </td>
        </tr>
      </table>
      
      ${data.topIssues.length > 0 ? `
        <h2>Top Issues to Fix</h2>
        ${issuesHtml}
      ` : `
        <p style="text-align: center; color: ${COLORS.success};">✓ No critical issues found!</p>
      `}
      
      <div style="text-align: center; margin-top: 32px;">
        <a href="${data.auditUrl}" class="button">View Full Report</a>
      </div>
      <p style="text-align: center; margin-top: 12px; font-size: 14px;">
        <a href="${data.auditUrl}?fix=1" style="color: ${COLORS.primary};">Open a PR that fixes these →</a>
      </p>
    </div>
  `, `Your SEO score: ${data.score}/100 - ${data.errors} errors, ${data.warnings} warnings`);

  const text = `
Audit Complete for ${data.siteName}
${data.siteUrl}

Score: ${data.score}/100 ${scoreChange !== null ? (scoreChange > 0 ? `(+${scoreChange})` : scoreChange < 0 ? `(${scoreChange})` : '(no change)') : ''}
Errors: ${data.errors}
Warnings: ${data.warnings}

${data.topIssues.length > 0 ? `Top Issues:\n${data.topIssues.map(i => `- [${i.severity.toUpperCase()}] ${i.title}`).join('\n')}` : 'No critical issues found!'}

View full report: ${data.auditUrl}
Open a PR that fixes these: ${data.auditUrl}?fix=1

---
RankCLI - https://rankcli.dev
Manage notifications: https://rankcli.dev/account?tab=notifications
`;

  return {
    html,
    text,
    subject: `Audit Complete: ${data.siteName} scored ${data.score}/100`,
  };
}

/**
 * Critical Issues Found Email
 */
export interface CriticalIssuesData {
  siteName: string;
  siteUrl: string;
  criticalIssues: Array<{
    title: string;
    category: string;
    description: string;
  }>;
  auditUrl: string;
}

export function criticalIssuesEmail(data: CriticalIssuesData): { html: string; text: string; subject: string } {
  const issuesHtml = data.criticalIssues.slice(0, 5).map(issue => `
    <div class="issue issue-error">
      <p class="issue-title">${escapeHtml(issue.title)}</p>
      <span class="issue-category">${escapeHtml(issue.category)}</span>
    </div>
  `).join('');

  const html = baseLayout(`
    <div class="card" style="border-color: ${COLORS.error};">
      <h1 style="color: ${COLORS.error};">⚠️ Critical Issues Found</h1>
      <p>Your latest audit of <strong>${escapeHtml(data.siteName)}</strong> found ${data.criticalIssues.length} critical SEO issues that need immediate attention.</p>
      
      <h2>Critical Issues</h2>
      ${issuesHtml}
      
      <div style="text-align: center; margin-top: 32px;">
        <a href="${data.auditUrl}" class="button" style="background: ${COLORS.error};">Fix Issues Now</a>
      </div>
    </div>
  `, `⚠️ ${data.criticalIssues.length} critical SEO issues found on ${data.siteName}`);

  const text = `
⚠️ Critical Issues Found for ${data.siteName}
${data.siteUrl}

${data.criticalIssues.length} critical issues need immediate attention:

${data.criticalIssues.map(i => `- ${i.title}\n  ${i.category}`).join('\n\n')}

Fix issues now: ${data.auditUrl}

---
RankCLI - https://rankcli.dev
Manage notifications: https://rankcli.dev/account?tab=notifications
`;

  return {
    html,
    text,
    subject: `⚠️ Critical Issues: ${data.siteName} needs attention`,
  };
}

/**
 * Weekly Report Email
 */
export interface WeeklyReportData {
  userName: string;
  weekOf: string;
  sites: Array<{
    name: string;
    domain: string;
    score: number;
    previousScore?: number;
    errors: number;
    warnings: number;
    projectUrl: string;
  }>;
  totalIssuesFixed?: number;
  totalNewIssues?: number;
}

export function weeklyReportEmail(data: WeeklyReportData): { html: string; text: string; subject: string } {
  const avgScore = data.sites.length > 0
    ? Math.round(data.sites.reduce((sum, s) => sum + s.score, 0) / data.sites.length)
    : 0;

  const sitesHtml = data.sites.map(site => {
    const change = site.previousScore !== undefined ? site.score - site.previousScore : null;
    const changeIcon = change !== null
      ? change > 0 ? '↑' : change < 0 ? '↓' : '→'
      : '';
    const changeColor = change !== null
      ? change > 0 ? COLORS.success : change < 0 ? COLORS.error : COLORS.textMuted
      : COLORS.textMuted;

    return `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid ${COLORS.border};">
          <div style="font-weight: 500; color: ${COLORS.text};">${escapeHtml(site.name)}</div>
          <div style="font-size: 14px; color: ${COLORS.textMuted};">${escapeHtml(site.domain)}</div>
        </td>
        <td style="padding: 16px; border-bottom: 1px solid ${COLORS.border}; text-align: center;">
          <span style="font-weight: bold; color: ${getScoreColor(site.score)};">${site.score}</span>
          ${change !== null ? `<span style="color: ${changeColor}; font-size: 12px;"> ${changeIcon}${Math.abs(change)}</span>` : ''}
        </td>
        <td style="padding: 16px; border-bottom: 1px solid ${COLORS.border}; text-align: center;">
          <span style="color: ${COLORS.error};">${site.errors}</span> / 
          <span style="color: ${COLORS.warning};">${site.warnings}</span>
        </td>
        <td style="padding: 16px; border-bottom: 1px solid ${COLORS.border}; text-align: right;">
          <a href="${site.projectUrl}" style="color: ${COLORS.primary}; text-decoration: none;">View →</a>
        </td>
      </tr>
    `;
  }).join('');

  const html = baseLayout(`
    <div class="card">
      <h1>Weekly SEO Report</h1>
      <p>Hi ${escapeHtml(data.userName)}, here's your weekly summary for the week of ${data.weekOf}.</p>
      
      <div class="score ${getScoreClass(avgScore)}">
        ${avgScore}<span style="font-size: 24px;">/100</span>
        <div style="font-size: 14px; color: ${COLORS.textMuted}; font-weight: normal;">Average Score</div>
      </div>
      
      <h2>Your Sites</h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid ${COLORS.border}; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: ${COLORS.background};">
            <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: ${COLORS.textMuted}; text-transform: uppercase;">Site</th>
            <th style="padding: 12px 16px; text-align: center; font-size: 12px; color: ${COLORS.textMuted}; text-transform: uppercase;">Score</th>
            <th style="padding: 12px 16px; text-align: center; font-size: 12px; color: ${COLORS.textMuted}; text-transform: uppercase;">Issues</th>
            <th style="padding: 12px 16px; text-align: right; font-size: 12px; color: ${COLORS.textMuted}; text-transform: uppercase;"></th>
          </tr>
        </thead>
        <tbody>
          ${sitesHtml}
        </tbody>
      </table>
      
      <div style="text-align: center; margin-top: 32px;">
        <a href="https://rankcli.dev/dashboard" class="button">Go to Dashboard</a>
      </div>
    </div>
  `, `Weekly SEO Report: Average score ${avgScore}/100 across ${data.sites.length} sites`);

  const text = `
Weekly SEO Report
Week of ${data.weekOf}

Hi ${data.userName},

Average Score: ${avgScore}/100

Your Sites:
${data.sites.map(s => `- ${s.name} (${s.domain}): ${s.score}/100 - ${s.errors} errors, ${s.warnings} warnings`).join('\n')}

View dashboard: https://rankcli.dev/dashboard

---
RankCLI - https://rankcli.dev
Manage notifications: https://rankcli.dev/account?tab=notifications
`;

  return {
    html,
    text,
    subject: `Weekly SEO Report: ${avgScore}/100 average score`,
  };
}

/**
 * Product Updates Email
 */
export interface ProductUpdateData {
  title: string;
  excerpt: string;
  features: Array<{
    title: string;
    description: string;
  }>;
  ctaUrl: string;
  ctaText: string;
}

export function productUpdateEmail(data: ProductUpdateData): { html: string; text: string; subject: string } {
  const featuresHtml = data.features.map(feature => `
    <div style="margin-bottom: 16px;">
      <h3 style="margin: 0 0 4px; font-size: 16px; color: ${COLORS.text};">✨ ${escapeHtml(feature.title)}</h3>
      <p style="margin: 0; color: ${COLORS.textMuted};">${escapeHtml(feature.description)}</p>
    </div>
  `).join('');

  const html = baseLayout(`
    <div class="card">
      <h1>${escapeHtml(data.title)}</h1>
      <p>${escapeHtml(data.excerpt)}</p>
      
      <h2>What's New</h2>
      ${featuresHtml}
      
      <div style="text-align: center; margin-top: 32px;">
        <a href="${data.ctaUrl}" class="button">${escapeHtml(data.ctaText)}</a>
      </div>
    </div>
  `, data.excerpt);

  const text = `
${data.title}

${data.excerpt}

What's New:
${data.features.map(f => `- ${f.title}: ${f.description}`).join('\n')}

${data.ctaText}: ${data.ctaUrl}

---
RankCLI - https://rankcli.dev
Manage notifications: https://rankcli.dev/account?tab=notifications
`;

  return {
    html,
    text,
    subject: data.title,
  };
}

// Utility: Get score color
function getScoreColor(score: number): string {
  if (score >= 80) return COLORS.success;
  if (score >= 60) return COLORS.warning;
  return COLORS.error;
}

// Utility: Escape HTML
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
