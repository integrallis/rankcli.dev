/**
 * Send Free Audit Report Email
 * Generates and sends a beautiful HTML email with the full audit results.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { sendEmail, isEmailConfigured } from '../_shared/resend.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AuditIssue {
  code: string;
  severity: 'error' | 'warning' | 'notice';
  title: string;
  category: string;
  description?: string;
}

interface FreeAuditReportRequest {
  email: string;
  url: string;
  domain: string;
  score: number;
  categories: {
    crawlability: number;
    onPage: number;
    content: number;
    performance: number;
    security: number;
    socialMeta: number;
    aiReadiness: number;
  };
  issues: AuditIssue[];
  checksRun: number;
}

function generateReportHtml(data: FreeAuditReportRequest): string {
  const { domain, url, score, categories, issues, checksRun } = data;
  
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
  
  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'error': return '🔴 Error';
      case 'warning': return '🟡 Warning';
      default: return '🔵 Notice';
    }
  };

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const notices = issues.filter(i => i.severity === 'notice');

  const issueRows = issues.map(issue => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; background: ${getSeverityColor(issue.severity)}20; color: ${getSeverityColor(issue.severity)};">
          ${issue.severity.toUpperCase()}
        </span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <strong>${issue.title}</strong>
        ${issue.description ? `<br><span style="color: #6b7280; font-size: 14px;">${issue.description}</span>` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${issue.category}</td>
    </tr>
  `).join('');

  const categoryRows = Object.entries(categories).map(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    return `
      <tr>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${label}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          <span style="color: ${getScoreColor(value)}; font-weight: 600;">${value}%</span>
        </td>
      </tr>
    `;
  }).join('');

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
        <p style="margin: 4px 0 0 0; color: #9ca3af; font-size: 14px;">Based on ${checksRun} checks</p>
      </div>

      <!-- Summary -->
      <div style="display: flex; justify-content: center; gap: 24px; margin-bottom: 32px; text-align: center;">
        <div style="flex: 1; max-width: 100px;">
          <div style="font-size: 24px; font-weight: 700; color: #ef4444;">${errors.length}</div>
          <div style="font-size: 12px; color: #6b7280;">Errors</div>
        </div>
        <div style="flex: 1; max-width: 100px;">
          <div style="font-size: 24px; font-weight: 700; color: #eab308;">${warnings.length}</div>
          <div style="font-size: 12px; color: #6b7280;">Warnings</div>
        </div>
        <div style="flex: 1; max-width: 100px;">
          <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">${notices.length}</div>
          <div style="font-size: 12px; color: #6b7280;">Notices</div>
        </div>
      </div>

      <!-- Category Breakdown -->
      <div style="margin-bottom: 32px;">
        <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">Category Scores</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${categoryRows}
        </table>
      </div>

      <!-- Issues -->
      <div style="margin-bottom: 32px;">
        <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px;">Issues Found (${issues.length})</h3>
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
          Start Free Trial →
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

function generatePlainText(data: FreeAuditReportRequest): string {
  const { domain, url, score, categories, issues, checksRun } = data;
  
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const notices = issues.filter(i => i.severity === 'notice');

  let text = `
RANKCLI SEO AUDIT REPORT
========================

Site: ${domain}
URL: ${url}

SCORE: ${score}/100 (based on ${checksRun} checks)

SUMMARY
-------
Errors: ${errors.length}
Warnings: ${warnings.length}
Notices: ${notices.length}

CATEGORY SCORES
---------------
`;

  for (const [key, value] of Object.entries(categories)) {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    text += `${label}: ${value}%\n`;
  }

  text += `
ISSUES FOUND (${issues.length})
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
Start your free trial: https://rankcli.dev/signup

© ${new Date().getFullYear()} Integrallis Software, LLC
https://rankcli.dev
`;

  return text;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!isEmailConfigured()) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Email not configured' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const data: FreeAuditReportRequest = await req.json();

    // Validate required fields
    if (!data.email || !data.email.includes('@')) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!data.url || !data.score === undefined) {
      return new Response(JSON.stringify({ error: 'Audit data required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate email content
    const html = generateReportHtml(data);
    const text = generatePlainText(data);

    // Send email
    const result = await sendEmail({
      to: data.email,
      subject: `SEO Audit Report: ${data.domain} scored ${data.score}/100`,
      html,
      text,
      tags: [
        { name: 'type', value: 'free-audit-report' },
        { name: 'domain', value: data.domain },
      ],
    });

    if (!result.success) {
      console.error('Failed to send audit report:', result.error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Failed to send email: ${result.error}` 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Audit report sent to ${data.email} for ${data.domain}, id: ${result.id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Report sent successfully',
      emailId: result.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending audit report:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
