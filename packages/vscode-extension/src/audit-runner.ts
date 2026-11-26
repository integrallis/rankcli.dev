import * as fs from 'fs';
import * as path from 'path';
import {
  AI_READINESS_NOTE,
  applyIgnores,
  auditSite,
  evaluateGate,
  frameworks,
  isGated,
  loadProjectConfig,
  mergeGateSpecs,
  parseBudgets,
  parseFailOn,
  PROJECT_CONFIG_FILE,
  type AuditIssue,
  type GateResult,
  type GateSpec,
  type HealthScore,
  type ProjectConfig,
  type SiteAuditProgress,
  type SiteAuditResult,
} from '@rankcli/agent-runtime';

export interface ExtensionAuditSummary {
  mode: 'url' | 'dir' | 'geo';
  target: string;
  dir?: string;
  timestamp: string;
  score: number;
  healthScore: HealthScore;
  framework: string | null;
  pagesAudited: number;
  pagesDiscovered: number;
  checksRun: number;
  auditMs: number;
  issues: AuditIssue[];
  ignoredCount: number;
  gate?: GateResult;
  files?: Record<string, string>;
  aiReadinessNote: string;
  configPath?: string;
  rawResult: SiteAuditResult;
}

export interface RunAuditParams {
  mode: 'url' | 'dir' | 'geo';
  url: string;
  dir?: string;
  workspaceRoot?: string;
  maxPages?: number;
  checkLinks?: boolean;
  onProgress?: (event: SiteAuditProgress) => void;
}

const DEFAULT_BUILD_DIRS = ['dist', '.output/public', 'out', 'build', '_site', 'public'];

export function resolveWorkspaceConfig(workspaceRoot?: string): {
  config: ProjectConfig | null;
  configPath?: string;
  error?: string;
} {
  if (!workspaceRoot) return { config: null };
  const result = loadProjectConfig(workspaceRoot);
  if (result.error) {
    return { config: null, error: result.error };
  }
  if (!result.loaded) return { config: null };
  return { config: result.loaded.config, configPath: result.loaded.path };
}

export function detectBuildDirectory(workspaceRoot: string, preferred?: string): string | null {
  const candidates = [
    ...(preferred ? [preferred] : []),
    ...DEFAULT_BUILD_DIRS,
  ];

  for (const candidate of candidates) {
    const abs = path.isAbsolute(candidate) ? candidate : path.join(workspaceRoot, candidate);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) continue;

    // Avoid mistaking a static-assets-only public/ directory for a built site.
    if (candidate === 'public' && !fs.existsSync(path.join(abs, 'index.html'))) {
      continue;
    }

    const entries = fs.readdirSync(abs);
    if (entries.some((e) => e.endsWith('.html')) || fs.existsSync(path.join(abs, 'index.html'))) {
      return abs;
    }
  }

  return null;
}

export function buildConfigTemplate(workspaceRoot: string, siteUrl?: string): ProjectConfig {
  let framework: string | null = null;
  const pkgPath = path.join(workspaceRoot, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const detected = frameworks.detectFromPackageJson(pkg);
      framework = detected?.framework ?? null;
    } catch {
      // ignore malformed package.json
    }
  }

  const detectedDir = detectBuildDirectory(workspaceRoot);
  const relDir = detectedDir ? path.relative(workspaceRoot, detectedDir).replace(/\\/g, '/') : undefined;

  return {
    url: siteUrl || 'https://example.com',
    ...(framework ? { framework } : {}),
    ...(relDir ? { dir: relDir } : {}),
    maxPages: 10,
    failOn: ['error', 'score<80'],
    budgets: {
      aiReadiness: 70,
    },
    ignore: [],
  };
}

export function writeConfigFile(workspaceRoot: string, config: ProjectConfig): string {
  const configPath = path.join(workspaceRoot, PROJECT_CONFIG_FILE);
  fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
  return configPath;
}

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function buildGateSpecFromConfig(config: ProjectConfig | null): GateSpec {
  if (!config) return { budgets: [] };
  const specs: GateSpec[] = [];

  if (config.failOn) {
    const parsed = parseFailOn(config.failOn);
    if (!parsed.error) specs.push(parsed.spec);
  }
  if (typeof config.minScore === 'number') {
    specs.push({ budgets: [{ category: 'overall', min: config.minScore }] });
  }
  if (config.budgets) {
    const parsed = parseBudgets(config.budgets);
    if (!parsed.error) specs.push(parsed.spec);
  }

  return specs.length > 0 ? mergeGateSpecs(...specs) : { budgets: [] };
}

export async function runWorkspaceAudit(params: RunAuditParams): Promise<ExtensionAuditSummary> {
  const { config, configPath } = resolveWorkspaceConfig(params.workspaceRoot);

  const maxPages = params.mode === 'geo'
    ? 1
    : params.maxPages ?? config?.maxPages ?? 10;
  const checkLinks = params.checkLinks ?? config?.checkLinks ?? false;
  const headers = config?.headers;

  const result = await auditSite({
    url: normalizeUrl(params.url),
    dir: params.dir,
    maxPages,
    checkLinks,
    checksLimit: 280,
    headers,
    relativeTo: params.workspaceRoot,
    onProgress: params.onProgress,
  });

  if (!result) {
    throw new Error(`Could not audit ${params.dir ?? params.url}`);
  }

  const ignoreResult = applyIgnores(result.issues, config?.ignore);
  let issues = ignoreResult.issues;

  if (params.mode === 'geo') {
    issues = issues.filter(
      (i) =>
        i.category === 'ai-readiness' ||
        i.code.startsWith('AI_') ||
        i.code.startsWith('GEO_') ||
        i.code.includes('BOT') ||
        i.code.includes('ROBOTS') ||
        i.code.includes('LLMS') ||
        i.code.includes('CRAWLER')
    );
  }

  const gateSpec = buildGateSpecFromConfig(config);
  const gate = isGated(gateSpec)
    ? evaluateGate(gateSpec, issues, result.primaryReport.healthScore)
    : undefined;

  return {
    mode: params.mode,
    target: params.dir ? `${params.dir} (${normalizeUrl(params.url)})` : normalizeUrl(params.url),
    dir: params.dir,
    timestamp: result.primaryReport.timestamp || new Date().toISOString(),
    score: result.score,
    healthScore: result.primaryReport.healthScore,
    framework: result.framework,
    pagesAudited: result.pagesAudited,
    pagesDiscovered: result.pagesDiscovered,
    checksRun: result.checksRun,
    auditMs: result.auditMs,
    issues,
    ignoredCount: ignoreResult.ignored.length,
    gate,
    files: result.files,
    aiReadinessNote: AI_READINESS_NOTE,
    configPath,
    rawResult: result,
  };
}

export function formatAuditMarkdown(summary: ExtensionAuditSummary): string {
  const errors = summary.issues.filter((i) => i.severity === 'error');
  const warnings = summary.issues.filter((i) => i.severity === 'warning');
  const notices = summary.issues.filter((i) => i.severity !== 'error' && i.severity !== 'warning');

  const lines: string[] = [
    `# RankCLI Audit Report`,
    '',
    `- **Target:** ${summary.target}`,
    `- **Overall Score:** ${summary.score}/100`,
    `- **AI Readiness:** ${summary.healthScore.aiReadiness}/100`,
    `- **Pages Audited:** ${summary.pagesAudited} (${summary.checksRun} checks in ${(summary.auditMs / 1000).toFixed(1)}s)`,
    ...(summary.framework ? [`- **Framework:** ${summary.framework}`] : []),
    ...(summary.gate
      ? [`- **Gate:** ${summary.gate.passed ? 'PASSED' : `FAILED (${summary.gate.failures.join('; ')})`}`]
      : []),
    `- **Timestamp:** ${summary.timestamp}`,
    '',
    `> ${summary.aiReadinessNote}`,
    '',
    `## Category Scores`,
    '',
    `| Category | Score |`,
    `| --- | --- |`,
    `| Crawlability | ${summary.healthScore.crawlability}/100 |`,
    `| Indexability | ${summary.healthScore.indexability}/100 |`,
    `| On-Page | ${summary.healthScore.onPage}/100 |`,
    `| Content | ${summary.healthScore.content}/100 |`,
    `| Links | ${summary.healthScore.links}/100 |`,
    `| Performance | ${summary.healthScore.performance}/100 |`,
    `| Security | ${summary.healthScore.security}/100 |`,
    `| AI Readiness | ${summary.healthScore.aiReadiness}/100 |`,
    `| Social | ${summary.healthScore.social}/100 |`,
    `| Accessibility | ${summary.healthScore.accessibility}/100 |`,
    '',
    `## Findings (${errors.length} errors, ${warnings.length} warnings, ${notices.length} notices)`,
    '',
  ];

  const appendGroup = (title: string, items: AuditIssue[]) => {
    if (items.length === 0) return;
    lines.push(`### ${title} (${items.length})`, '');
    for (const issue of items) {
      lines.push(`- **\`${issue.code}\`** — ${issue.title}`);
      if (issue.howToFix) {
        lines.push(`  - Fix: ${issue.howToFix}`);
      }
      if (issue.affectedUrls && issue.affectedUrls.length > 0) {
        const preview = issue.affectedUrls.slice(0, 5).join(', ');
        lines.push(`  - Affected: ${preview}${issue.affectedUrls.length > 5 ? ` (+${issue.affectedUrls.length - 5} more)` : ''}`);
      }
    }
    lines.push('');
  };

  appendGroup('Errors', errors);
  appendGroup('Warnings', warnings);
  appendGroup('Notices', notices);

  return lines.join('\n');
}
