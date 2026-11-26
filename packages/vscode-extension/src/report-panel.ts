import * as crypto from 'crypto';
import type { ExtensionAuditSummary } from './audit-runner';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function scoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  return '#ef4444';
}

export function renderReportHtml(summary: ExtensionAuditSummary, nonce = crypto.randomBytes(16).toString('hex')): string {
  const errors = summary.issues.filter((i) => i.severity === 'error').length;
  const warnings = summary.issues.filter((i) => i.severity === 'warning').length;
  const notices = summary.issues.length - errors - warnings;

  const categories: Array<{ label: string; score: number }> = [
    { label: 'Crawlability', score: summary.healthScore.crawlability },
    { label: 'Indexability', score: summary.healthScore.indexability },
    { label: 'On-Page', score: summary.healthScore.onPage },
    { label: 'Content', score: summary.healthScore.content },
    { label: 'Links', score: summary.healthScore.links },
    { label: 'Performance', score: summary.healthScore.performance },
    { label: 'Security', score: summary.healthScore.security },
    { label: 'AI Readiness', score: summary.healthScore.aiReadiness },
    { label: 'Social', score: summary.healthScore.social },
    { label: 'Accessibility', score: summary.healthScore.accessibility },
  ];

  const categoryCards = categories
    .map(
      (cat) => `
      <div class="cat-card">
        <div class="cat-top">
          <span>${escapeHtml(cat.label)}</span>
          <strong style="color:${scoreColor(cat.score)}">${cat.score}</strong>
        </div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${Math.max(0, Math.min(100, cat.score))}%;background:${scoreColor(cat.score)}"></div>
        </div>
      </div>`
    )
    .join('');

  const issueCards =
    summary.issues.length === 0
      ? `<div class="empty">No issues found in this audit.</div>`
      : summary.issues
          .map((issue) => {
            const sev = issue.severity === 'error' ? 'error' : issue.severity === 'warning' ? 'warning' : 'notice';
            const affected = (issue.affectedUrls ?? [])
              .slice(0, 8)
              .map((u) => {
                const mappedFile = summary.files?.[u];
                if (mappedFile) {
                  return `<button class="file-link" data-file="${escapeHtml(mappedFile)}">${escapeHtml(mappedFile)}</button>`;
                }
                return `<span class="url-chip">${escapeHtml(u)}</span>`;
              })
              .join('');

            return `
            <article class="issue" data-severity="${sev}" data-search="${escapeHtml(
              `${issue.code} ${issue.title} ${issue.category} ${issue.description}`.toLowerCase()
            )}">
              <div class="issue-header">
                <span class="pill pill-${sev}">${sev}</span>
                <code class="code">${escapeHtml(issue.code)}</code>
                <span class="cat-tag">${escapeHtml(issue.category)}</span>
              </div>
              <h3>${escapeHtml(issue.title)}</h3>
              ${issue.description ? `<p class="desc">${escapeHtml(issue.description)}</p>` : ''}
              ${
                issue.howToFix
                  ? `<div class="fix"><strong>How to fix:</strong> ${escapeHtml(issue.howToFix)}</div>`
                  : ''
              }
              ${affected ? `<div class="affected">${affected}</div>` : ''}
            </article>`;
          })
          .join('');

  const gateBanner = summary.gate
    ? `<div class="gate ${summary.gate.passed ? 'gate-pass' : 'gate-fail'}">
        <strong>CI Gate: ${summary.gate.passed ? 'PASSED' : 'FAILED'}</strong>
        ${
          summary.gate.failures.length > 0
            ? `<span> — ${escapeHtml(summary.gate.failures.join('; '))}</span>`
            : '<span> — All rules in rankcli.config.json passed.</span>'
        }
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>RankCLI Audit Report</title>
  <style>
    :root {
      color-scheme: light dark;
    }
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      margin: 0;
      padding: 20px 24px 40px;
      line-height: 1.5;
    }
    .header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      border-bottom: 1px solid var(--vscode-panel-border);
      padding-bottom: 16px;
      margin-bottom: 18px;
    }
    .title-block h1 {
      margin: 0 0 4px;
      font-size: 1.35rem;
    }
    .meta {
      font-size: 0.85rem;
      color: var(--vscode-descriptionForeground);
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .score-box {
      display: flex;
      align-items: baseline;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 8px;
      border: 1px solid var(--vscode-panel-border);
      background: var(--vscode-sideBar-background);
    }
    .score-num {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }
    button.action-btn {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      padding: 5px 10px;
      cursor: pointer;
      font-size: 0.85rem;
    }
    button.action-btn:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    button.action-btn.primary {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border-color: transparent;
    }
    .gate {
      padding: 10px 12px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 0.9rem;
    }
    .gate-pass {
      background: rgba(34, 197, 94, 0.12);
      border: 1px solid rgba(34, 197, 94, 0.4);
    }
    .gate-fail {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.4);
    }
    .cat-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
      margin-bottom: 14px;
    }
    .cat-card {
      padding: 8px 10px;
      border-radius: 6px;
      border: 1px solid var(--vscode-panel-border);
      background: var(--vscode-sideBar-background);
    }
    .cat-top {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      margin-bottom: 6px;
    }
    .bar-track {
      height: 5px;
      border-radius: 3px;
      background: var(--vscode-panel-border);
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      border-radius: 3px;
    }
    .note {
      font-size: 0.8rem;
      color: var(--vscode-descriptionForeground);
      margin: 0 0 20px;
      padding: 8px 12px;
      border-left: 3px solid var(--vscode-panel-border);
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      margin-bottom: 14px;
    }
    .filter-btn {
      background: transparent;
      color: var(--vscode-foreground);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 999px;
      padding: 4px 10px;
      cursor: pointer;
      font-size: 0.82rem;
    }
    .filter-btn.active {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border-color: transparent;
    }
    .search-input {
      margin-left: auto;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border, var(--vscode-panel-border));
      border-radius: 4px;
      padding: 4px 8px;
      min-width: 200px;
    }
    .issue {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 12px 14px;
      margin-bottom: 10px;
      background: var(--vscode-sideBar-background);
    }
    .issue.hidden {
      display: none;
    }
    .issue-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .pill {
      font-size: 0.72rem;
      text-transform: uppercase;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 999px;
    }
    .pill-error { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
    .pill-warning { background: rgba(234, 179, 8, 0.2); color: #eab308; }
    .pill-notice { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .code {
      font-family: var(--vscode-editor-font-family);
      font-size: 0.82rem;
      opacity: 0.9;
    }
    .cat-tag {
      font-size: 0.78rem;
      color: var(--vscode-descriptionForeground);
      margin-left: auto;
    }
    .issue h3 {
      margin: 0 0 6px;
      font-size: 0.98rem;
    }
    .desc {
      margin: 0 0 6px;
      color: var(--vscode-descriptionForeground);
      font-size: 0.88rem;
    }
    .fix {
      font-size: 0.86rem;
      padding: 6px 8px;
      border-radius: 4px;
      background: var(--vscode-editor-background);
      margin-top: 6px;
    }
    .affected {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }
    .url-chip, .file-link {
      font-family: var(--vscode-editor-font-family);
      font-size: 0.78rem;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid var(--vscode-panel-border);
      background: var(--vscode-editor-background);
      color: var(--vscode-textLink-foreground);
    }
    .file-link {
      cursor: pointer;
    }
    .empty {
      padding: 24px;
      text-align: center;
      border: 1px dashed var(--vscode-panel-border);
      border-radius: 6px;
      color: var(--vscode-descriptionForeground);
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="title-block">
      <h1>RankCLI ${summary.mode === 'geo' ? 'GEO &amp; AI Crawler' : 'SEO &amp; AI Search'} Report</h1>
      <div class="meta">
        <span><strong>Target:</strong> ${escapeHtml(summary.target)}</span>
        <span><strong>Pages:</strong> ${summary.pagesAudited}</span>
        <span><strong>Checks:</strong> ${summary.checksRun}</span>
        <span><strong>Time:</strong> ${(summary.auditMs / 1000).toFixed(1)}s</span>
        ${summary.framework ? `<span><strong>Framework:</strong> ${escapeHtml(summary.framework)}</span>` : ''}
        ${summary.ignoredCount > 0 ? `<span><strong>Ignored:</strong> ${summary.ignoredCount}</span>` : ''}
      </div>
    </div>
    <div class="score-box">
      <span class="score-num" style="color:${scoreColor(summary.score)}">${summary.score}</span>
      <span>/ 100</span>
    </div>
  </header>

  <div class="actions">
    <button class="action-btn primary" id="rerunBtn">Re-run Audit</button>
    <button class="action-btn" id="copyMdBtn">Copy Markdown</button>
    <button class="action-btn" id="exportJsonBtn">Export JSON</button>
  </div>

  ${gateBanner}

  <section class="cat-grid">${categoryCards}</section>
  <p class="note">${escapeHtml(summary.aiReadinessNote)}</p>

  <div class="toolbar">
    <button class="filter-btn active" data-filter="all">All (${summary.issues.length})</button>
    <button class="filter-btn" data-filter="error">Errors (${errors})</button>
    <button class="filter-btn" data-filter="warning">Warnings (${warnings})</button>
    <button class="filter-btn" data-filter="notice">Notices (${notices})</button>
    <input type="search" id="searchInput" class="search-input" placeholder="Filter by code, title, category..." />
  </div>

  <main id="issuesList">${issueCards}</main>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    let activeFilter = 'all';

    function applyFilters() {
      const q = (document.getElementById('searchInput').value || '').trim().toLowerCase();
      document.querySelectorAll('.issue').forEach((el) => {
        const sev = el.getAttribute('data-severity');
        const text = el.getAttribute('data-search') || '';
        const matchesSev = activeFilter === 'all' || sev === activeFilter;
        const matchesText = !q || text.includes(q);
        el.classList.toggle('hidden', !(matchesSev && matchesText));
      });
    }

    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter') || 'all';
        applyFilters();
      });
    });

    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('rerunBtn').addEventListener('click', () => vscode.postMessage({ type: 'rerun' }));
    document.getElementById('copyMdBtn').addEventListener('click', () => vscode.postMessage({ type: 'copyMarkdown' }));
    document.getElementById('exportJsonBtn').addEventListener('click', () => vscode.postMessage({ type: 'exportJson' }));

    document.querySelectorAll('.file-link').forEach((btn) => {
      btn.addEventListener('click', () => {
        vscode.postMessage({ type: 'openFile', file: btn.getAttribute('data-file') });
      });
    });
  </script>
</body>
</html>`;
}
