/**
 * Send Free Audit Report Email
 * Emails the result of a free audit to the address the visitor gives.
 *
 * Public and unauthenticated, so it must not be an open relay: the report is
 * built from the free_audits row the free-audit function saved (found by the
 * auditRecordId it returned to the page), never from content in the request.
 * Each audit can be sent to one address, sends are rate-limited per address
 * and per IP, and everything interpolated into the HTML is escaped.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { sendEmail, isEmailConfigured } from '../_shared/resend.ts';
import { escapeHtml } from '../_shared/email-templates.ts';
import { clientIp, hashIP } from '../_shared/client-ip.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// A report can be requested up to a day after the audit ran.
const REPORT_WINDOW_MS = 24 * 60 * 60 * 1000;
// At most this many reports to one address per day, and from one IP per hour.
const MAX_PER_EMAIL_PER_DAY = 3;
const MAX_PER_IP_PER_HOUR = 5;

const EMAIL_PATTERN = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[A-Za-z]{2,}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CATEGORY_LABELS: Record<string, string> = {
  crawlability: 'Crawlability',
  onPage: 'On Page',
  content: 'Content',
  performance: 'Performance',
  security: 'Security',
  socialMeta: 'Social Meta',
  aiReadiness: 'AI Readiness',
};

interface AuditIssue {
  code: string;
  severity: 'error' | 'warning' | 'notice';
  title: string;
  category: string;
  description?: string;
}

// What the report is built from: the stored free_audits row.
interface ReportData {
  url: string;
  domain: string;
  score: number;
  errors: number;
  warnings: number;
  notices: number;
  totalIssues: number;
  categories: Record<string, number> | null;
  issues: AuditIssue[];
  checksRun: number | null;
}

interface FreeAuditRow {
  id: string;
  url: string;
  domain: string;
  score: number | null;
  issues_summary: Record<string, unknown> | null;
  top_issues: unknown;
  email: string | null;
  created_at: string;
}

function toScore(value: unknown): number {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
}

function toCount(value: unknown): number {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function reportDataFromRow(row: FreeAuditRow): ReportData {
  const summary = row.issues_summary || {};
  const issues: AuditIssue[] = (Array.isArray(row.top_issues) ? row.top_issues : [])
    .filter((i): i is Record<string, unknown> => !!i && typeof i === 'object')
    .map((i) => ({
      code: String(i.code ?? ''),
      severity: i.severity === 'error' || i.severity === 'warning' ? i.severity : 'notice',
      title: String(i.title ?? ''),
      category: String(i.category ?? ''),
      description: typeof i.description === 'string' ? i.description : undefined,
    }));

  // Rows saved before free-audit stored categories have none; the email
  // just leaves that section out.
  let categories: Record<string, number> | null = null;
  if (summary.categories && typeof summary.categories === 'object') {
    categories = {};
    for (const key of Object.keys(CATEGORY_LABELS)) {
      const value = (summary.categories as Record<string, unknown>)[key];
      if (value !== undefined) categories[key] = toScore(value);
    }
  }

  return {
    url: row.url,
    domain: row.domain,
    score: toScore(row.score),
    errors: toCount(summary.errors),
    warnings: toCount(summary.warnings),
    notices: toCount(summary.notices),
    totalIssues: toCount(summary.total) || issues.length,
    categories,
    issues,
    checksRun: summary.checksRun !== undefined ? toCount(summary.checksRun) || null : null,
  };
}

function generateReportHtml(data: ReportData): string {
  const { score, issues } = data;
  const domain = escapeHtml(data.domain);
  const url = escapeHtml(data.url);

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#22c55e'; // green
    if (s >= 60) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return '#ef4444';
      case 'warning': return '#eab308';
      default: return '#3b82f6';
    }
  };

  const issueRows = issues.map(issue => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; background: ${getSeverityColor(issue.severity)}20; color: ${getSeverityColor(issue.severity)};">
          ${issue.severity.toUpperCase()}
        </span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${escapeHtml(issue.title)}</strong>
        ${issue.description ? `<br><span style="color: #6b7280; font-size: 14px;">${escapeHtml(issue.description)}</span>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${escapeHtml(issue.category)}</td>
    </tr>
  `).join('');

  const categoryRows = Object.entries(data.categories || {}).map(([key, value]) => `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${CATEGORY_LABELS[key]}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          <span style="color: ${getScoreColor(value)}; font-weight: 600;">${value}%</span>
        </td>
      </tr>
    `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SEO Audit Report - ${domain}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 12px 12px 0 0; padding: 32px; text-align: center;">
      <h1 style="color: #22c55e; margin: 0 0 8px 0; font-size: 24px;">&gt; RankCLI</h1>
      <p style="color: #94a3b8; margin: 0; font-size: 14px;">SEO Audit Report</p>
    </div>

    <!-- Main Content -->
    <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

      <!-- Site Info -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h2 style="margin: 0 0 8px 0; color: #1f2937;">${domain}</h2>
        <p style="margin: 0; color: #6b7280; font-size: 14px;">${url}</p>
      </div>

      <!-- Score -->
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; width: 120px; height: 120px; border-radius: 50%; background: ${getScoreColor(score)}15; border: 4px solid ${getScoreColor(score)}; line-height: 112px;">
          <span style="font-size: 48px; font-weight: 700; color: ${getScoreColor(score)};">${score}</span>
        </div>
        <p style="margin: 12px 0 0 0; color: #6b7280;">SEO Health Score (out of 100)</p>
        ${data.checksRun ? `<p style="margin: 4px 0 0 0; color: #9ca3af; font-size: 14px;">Based on ${data.checksRun} checks</p>` : ''}
      </div>

      <!-- Summary -->
      <div style="display: flex; justify-content: center; gap: 24px; margin-bottom: 32px; text-align: center;">
        <div style="flex: 1; max-width: 100px;">
          <div style="font-size: 24px; font-weight: 700; color: #ef4444;">${data.errors}</div>
          <div style="font-size: 12px; color: #6b7280;">Errors</div>
        </div>
        <div style="flex: 1; max-width: 100px;">
          <div style="font-size: 24px; font-weight: 700; color: #eab308;">${data.warnings}</div>
          <div style="font-size: 12px; color: #6b7280;">Warnings</div>
        </div>
        <div style="flex: 1; max-width: 100px;">
          <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">${data.notices}</div>
          <div style="font-size: 12px; color: #6b7280;">Notices</div>
        </div>
      </div>

      ${categoryRows ? `<!-- Category Breakdown -->
      <div style="margin-bottom: 32px;">
        <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">Category Scores</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${categoryRows}
        </table>
      </div>` : ''}

      <!-- Issues -->
      <div style="margin-bottom: 32px;">
        <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">Issues Found (${data.totalIssues})</h3>
        ${data.totalIssues > issues.length ? `<p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">Showing the top ${issues.length}. Sign up to see all of them.</p>` : ''}
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f9fafb;">
              <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Severity</th>
              <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Issue</th>
              <th style="padding: 12px; text-align: left; font-size: 12px; color: #6b7280; text-transform: uppercase;">Category</th>
            </tr>
          </thead>
          <tbody>
            ${issueRows}
          </tbody>
        </table>
      </div>

      <!-- CTA -->
      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 24px; text-align: center;">
        <h3 style="margin: 0 0 8px 0; color: #166534;">Want to fix these issues automatically?</h3>
        <p style="margin: 0 0 16px 0; color: #15803d; font-size: 14px;">
          RankCLI can create pull requests to fix SEO issues in your codebase.
        </p>
        <a href="https://rankcli.dev/signup?utm_source=email&utm_medium=audit-report&utm_campaign=free-audit"
           style="display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
          Get started free →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px; color: #6b7280; font-size: 12px;">
      <p style="margin: 0 0 8px 0;">
        <a href="https://rankcli.dev" style="color: #22c55e; text-decoration: none;">rankcli.dev</a> —
        Ship code, get ranked.
      </p>
      <p style="margin: 0;">
        © ${new Date().getFullYear()} Integrallis Software, LLC. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

function generatePlainText(data: ReportData): string {
  const { domain, url, score, issues } = data;

  let text = `
RANKCLI SEO AUDIT REPORT
========================

Site: ${domain}
URL: ${url}

SCORE: ${score}/100${data.checksRun ? ` (based on ${data.checksRun} checks)` : ''}

SUMMARY
-------
Errors: ${data.errors}
Warnings: ${data.warnings}
Notices: ${data.notices}
`;

  if (data.categories) {
    text += `
CATEGORY SCORES
---------------
`;
    for (const [key, value] of Object.entries(data.categories)) {
      text += `${CATEGORY_LABELS[key]}: ${value}%\n`;
    }
  }

  text += `
ISSUES FOUND (${data.totalIssues})
---------------
`;

  for (const issue of issues) {
    text += `[${issue.severity.toUpperCase()}] ${issue.title}\n`;
    text += `  Category: ${issue.category}\n`;
    if (issue.description) {
      text += `  ${issue.description}\n`;
    }
    text += '\n';
  }

  text += `
---
Want to fix these issues automatically?
RankCLI can create pull requests to fix SEO issues in your codebase.
Get started free: https://rankcli.dev/signup

© ${new Date().getFullYear()} Integrallis Software, LLC
https://rankcli.dev
`;

  return text;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!isEmailConfigured()) {
    return jsonResponse({ success: false, error: 'Email not configured' }, 500);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const auditId = typeof body.auditId === 'string' ? body.auditId : '';

    if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
      return jsonResponse({ error: 'Valid email required' }, 400);
    }
    if (!UUID_PATTERN.test(auditId)) {
      return jsonResponse({ error: 'Run an audit first, then request the report.' }, 400);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: row } = await supabase
      .from('free_audits')
      .select('id, url, domain, score, issues_summary, top_issues, email, created_at')
      .eq('id', auditId)
      .maybeSingle();
    const audit = row as FreeAuditRow | null;

    if (!audit || Date.now() - new Date(audit.created_at).getTime() > REPORT_WINDOW_MS) {
      return jsonResponse({ error: 'This audit has expired. Run it again to get a report.' }, 404);
    }
    if (audit.email && audit.email.toLowerCase() !== email) {
      return jsonResponse({ error: 'This report was already sent to another address.' }, 409);
    }

    const ipHash = await hashIP(clientIp(req));
    const dayAgo = new Date(Date.now() - REPORT_WINDOW_MS).toISOString();
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const [{ count: sentToEmail }, { count: sentFromIp }] = await Promise.all([
      supabase.from('free_audits').select('id', { count: 'exact', head: true })
        .eq('email', email).gte('created_at', dayAgo),
      supabase.from('free_audits').select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash).not('email', 'is', null).gte('created_at', hourAgo),
    ]);
    if ((sentToEmail || 0) >= MAX_PER_EMAIL_PER_DAY || (sentFromIp || 0) >= MAX_PER_IP_PER_HOUR) {
      return jsonResponse({ error: 'Too many report requests. Please try again later.' }, 429);
    }

    // Claim the row for this address before sending, so two requests can't
    // send one audit to two different people. This also makes the lead
    // eligible for send-audit-followups.
    if (!audit.email) {
      const { data: claimed } = await supabase
        .from('free_audits')
        .update({ email })
        .eq('id', auditId)
        .is('email', null)
        .select('id');
      if (!claimed?.length) {
        const { data: current } = await supabase.from('free_audits').select('email').eq('id', auditId).maybeSingle();
        if (current?.email?.toLowerCase() !== email) {
          return jsonResponse({ error: 'This report was already sent to another address.' }, 409);
        }
      }
    }

    const data = reportDataFromRow(audit);

    const result = await sendEmail({
      to: email,
      subject: `RankCLI SEO Audit Report: ${data.domain.slice(0, 100)} scored ${data.score}/100`,
      html: generateReportHtml(data),
      text: generatePlainText(data),
      tags: [
        { name: 'type', value: 'free-audit-report' },
        // Resend tag values allow only letters, digits, _ and -.
        { name: 'domain', value: data.domain.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 256) },
      ],
    });

    if (!result.success) {
      console.error('Failed to send audit report:', result.error);
      return jsonResponse({ success: false, error: 'Failed to send email. Please try again.' }, 500);
    }

    console.log(`Audit report sent for free audit ${auditId} (${data.domain}), id: ${result.id}`);

    return jsonResponse({
      success: true,
      message: 'Report sent successfully',
      emailId: result.id,
    });
  } catch (error) {
    console.error('Error sending audit report:', error);
    return jsonResponse({ error: 'Failed to send report' }, 500);
  }
});
