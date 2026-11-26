/**
 * RankCLI VS Code Extension
 *
 * 280+ SEO & AI-search readiness checks in VS Code:
 * - Real-time linting for HTML, JSX/TSX, Vue, Astro, Svelte, and robots.txt
 * - Full site URL & local build-directory audits powered by @rankcli/agent-runtime
 * - Interactive Webview report, Problems panel integration, and rankcli.config.json support
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import {
  buildConfigTemplate,
  detectBuildDirectory,
  formatAuditMarkdown,
  normalizeUrl,
  resolveWorkspaceConfig,
  runWorkspaceAudit,
  writeConfigFile,
  type ExtensionAuditSummary,
  type RunAuditParams,
} from './audit-runner';
import {
  isRobotsFile,
  isSupportedDocument,
  lintDocumentText,
  type LintChecksConfig,
  type LintFinding,
  type LintSeverity,
} from './lint-document';
import { renderReportHtml } from './report-panel';

export interface SEOIssue {
  code: string;
  message: string;
  severity: vscode.DiagnosticSeverity;
  range: vscode.Range;
  fix?: SEOFix;
}

export interface SEOFix {
  title: string;
  newText: string;
  range: vscode.Range;
}

let lintDiagnostics: vscode.DiagnosticCollection;
let auditDiagnostics: vscode.DiagnosticCollection;
let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;
let reportPanel: vscode.WebviewPanel | undefined;
let lastAuditSummary: ExtensionAuditSummary | undefined;
let lastAuditParams: RunAuditParams | undefined;

const fixesByUri = new Map<string, Map<string, SEOFix>>();

export function activate(context: vscode.ExtensionContext): void {
  lintDiagnostics = vscode.languages.createDiagnosticCollection('rankcli');
  auditDiagnostics = vscode.languages.createDiagnosticCollection('rankcli-audit');
  outputChannel = vscode.window.createOutputChannel('RankCLI');
  context.subscriptions.push(lintDiagnostics, auditDiagnostics, outputChannel);

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'rankcli.showReport';
  statusBarItem.text = '$(search) RankCLI';
  statusBarItem.tooltip = 'Click to show RankCLI SEO report';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  const diagnosticProvider = new SEODiagnosticProvider();

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => diagnosticProvider.provideDiagnostics(doc)),
    vscode.workspace.onDidChangeTextDocument((e) => diagnosticProvider.provideDiagnostics(e.document)),
    vscode.workspace.onDidSaveTextDocument((doc) => diagnosticProvider.provideDiagnostics(doc)),
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor) diagnosticProvider.provideDiagnostics(editor.document);
    }),
    vscode.workspace.onDidCloseTextDocument((doc) => {
      lintDiagnostics.delete(doc.uri);
      fixesByUri.delete(doc.uri.toString());
    })
  );

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      [
        { language: 'html' },
        { language: 'typescriptreact' },
        { language: 'javascriptreact' },
        { language: 'vue' },
        { language: 'astro' },
        { language: 'svelte' },
        { pattern: '**/robots.txt' },
      ],
      new SEOCodeActionProvider(),
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('rankcli.auditUrl', () => runUrlAuditCommand('url')),
    vscode.commands.registerCommand('rankcli.auditBuildDir', (folderUri?: vscode.Uri) =>
      runBuildDirAuditCommand(folderUri)
    ),
    vscode.commands.registerCommand('rankcli.checkGeo', () => runUrlAuditCommand('geo')),
    vscode.commands.registerCommand('rankcli.runAudit', () => runFileLintCommand()),
    vscode.commands.registerCommand('rankcli.showReport', () => showReportCommand()),
    vscode.commands.registerCommand('rankcli.initConfig', () => initConfigCommand())
  );

  vscode.workspace.textDocuments.forEach((doc) => diagnosticProvider.provideDiagnostics(doc));
}

export function deactivate(): void {
  lintDiagnostics?.dispose();
  auditDiagnostics?.dispose();
  statusBarItem?.dispose();
  outputChannel?.dispose();
  reportPanel?.dispose();
  fixesByUri.clear();
}

function getWorkspaceRoot(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

function mapSeverity(severity: LintSeverity): vscode.DiagnosticSeverity {
  switch (severity) {
    case 'error':
      return vscode.DiagnosticSeverity.Error;
    case 'warning':
      return vscode.DiagnosticSeverity.Warning;
    case 'information':
      return vscode.DiagnosticSeverity.Information;
    case 'hint':
      return vscode.DiagnosticSeverity.Hint;
    default:
      return vscode.DiagnosticSeverity.Warning;
  }
}

function toVSCodeIssue(finding: LintFinding, document: vscode.TextDocument): SEOIssue {
  const start = document.positionAt(finding.startOffset);
  const end = document.positionAt(finding.endOffset);
  const issue: SEOIssue = {
    code: finding.code,
    message: finding.message,
    severity: mapSeverity(finding.severity),
    range: new vscode.Range(start, end),
  };

  if (finding.fix) {
    issue.fix = {
      title: finding.fix.title,
      newText: finding.fix.newText,
      range: new vscode.Range(
        document.positionAt(finding.fix.startOffset),
        document.positionAt(finding.fix.endOffset)
      ),
    };
  }

  return issue;
}

export function analyzeDocument(
  text: string,
  document: vscode.TextDocument,
  config: vscode.WorkspaceConfiguration
): SEOIssue[] {
  const checks = config.get<LintChecksConfig>('checks', {});
  const defaultSeverity = config.get<LintSeverity>('severity', 'warning');
  const defaultUrl = config.get<string>('defaultUrl', '');

  const findings = lintDocumentText(text, {
    languageId: document.languageId,
    filePath: document.uri?.fsPath,
    defaultSeverity,
    checks,
    siteUrl: defaultUrl || 'https://example.com',
  });

  return findings.map((f) => toVSCodeIssue(f, document));
}

class SEODiagnosticProvider {
  provideDiagnostics(document: vscode.TextDocument): void {
    const filePath = document.uri?.fsPath;
    if (!isSupportedDocument(document.languageId, filePath)) {
      return;
    }

    const config = vscode.workspace.getConfiguration('rankcli');
    if (!config.get('enabled', true)) {
      lintDiagnostics.delete(document.uri);
      fixesByUri.delete(document.uri.toString());
      updateStatusBarForFile(0);
      return;
    }

    const issues = analyzeDocument(document.getText(), document, config);
    const fixMap = new Map<string, SEOFix>();
    const diagnostics = issues.map((issue) => {
      const diag = new vscode.Diagnostic(issue.range, issue.message, issue.severity);
      diag.code = issue.code;
      diag.source = 'rankcli';
      if (issue.fix) {
        fixMap.set(`${issue.code}:${issue.range.start.line}:${issue.range.start.character}`, issue.fix);
      }
      return diag;
    });

    fixesByUri.set(document.uri.toString(), fixMap);
    lintDiagnostics.set(document.uri, diagnostics);

    if (vscode.window.activeTextEditor?.document.uri.toString() === document.uri.toString()) {
      updateStatusBarForFile(issues.length);
    }
  }
}

class SEOCodeActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    _range: vscode.Range,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];
    const fixMap = fixesByUri.get(document.uri.toString());

    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source !== 'rankcli') continue;
      const key = `${String(diagnostic.code)}:${diagnostic.range.start.line}:${diagnostic.range.start.character}`;
      const fix = fixMap?.get(key);
      if (!fix) continue;

      const action = new vscode.CodeAction(fix.title, vscode.CodeActionKind.QuickFix);
      action.diagnostics = [diagnostic];
      action.edit = new vscode.WorkspaceEdit();
      action.edit.replace(document.uri, fix.range, fix.newText);
      action.isPreferred = true;
      actions.push(action);
    }

    return actions;
  }
}

function updateStatusBarForFile(issueCount: number): void {
  if (lastAuditSummary) {
    updateStatusBarForAudit(lastAuditSummary);
    return;
  }

  if (issueCount === 0) {
    statusBarItem.text = '$(check) RankCLI: OK';
    statusBarItem.backgroundColor = undefined;
    statusBarItem.tooltip = 'No SEO issues in current file. Click to view report.';
  } else {
    statusBarItem.text = `$(warning) RankCLI: ${issueCount} issue${issueCount === 1 ? '' : 's'}`;
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    statusBarItem.tooltip = `${issueCount} SEO issue${issueCount === 1 ? '' : 's'} in current file`;
  }
  statusBarItem.show();
}

function updateStatusBarForAudit(summary: ExtensionAuditSummary): void {
  const icon = summary.gate
    ? summary.gate.passed
      ? '$(pass)'
      : '$(error)'
    : summary.score >= 80
      ? '$(check)'
      : '$(warning)';

  statusBarItem.text = `${icon} RankCLI: ${summary.score}/100`;
  statusBarItem.backgroundColor =
    summary.gate && !summary.gate.passed
      ? new vscode.ThemeColor('statusBarItem.errorBackground')
      : summary.score < 60
        ? new vscode.ThemeColor('statusBarItem.warningBackground')
        : undefined;
  statusBarItem.tooltip = `Last audit: ${summary.target} — Overall ${summary.score}/100, AI Readiness ${summary.healthScore.aiReadiness}/100. Click to open report.`;
  statusBarItem.show();
}

async function resolveTargetUrl(promptTitle: string, workspaceRoot?: string): Promise<string | undefined> {
  const { config } = resolveWorkspaceConfig(workspaceRoot);
  const vsConfig = vscode.workspace.getConfiguration('rankcli');
  const suggested = config?.url || vsConfig.get<string>('defaultUrl', '') || '';

  const entered = await vscode.window.showInputBox({
    title: promptTitle,
    prompt: 'Enter the site URL to audit (runs locally with 280+ checks, no account required)',
    placeHolder: 'https://yoursite.com',
    value: suggested,
    validateInput: (val) => {
      if (!val.trim()) return 'Enter a URL to audit';
      try {
        new URL(normalizeUrl(val));
        return null;
      } catch {
        return 'Enter a valid URL (e.g. https://yoursite.com)';
      }
    },
  });

  return entered ? normalizeUrl(entered) : undefined;
}

async function executeAuditAndDisplay(params: RunAuditParams): Promise<void> {
  lastAuditParams = params;
  const label = params.dir
    ? `Auditing ${path.basename(params.dir)}...`
    : params.mode === 'geo'
      ? `Checking AI crawler access for ${params.url}...`
      : `Auditing ${params.url}...`;

  try {
    const summary = await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `RankCLI: ${label}`,
        cancellable: false,
      },
      async (progress) => {
        progress.report({ message: 'Starting 280+ checks locally...' });
        return runWorkspaceAudit({
          ...params,
          onProgress: (event) => {
            if (event.phase === 'discovery' && event.status === 'done') {
              progress.report({
                message: `Discovered ${event.pages} page${event.pages === 1 ? '' : 's'}...`,
              });
            }
          },
        });
      }
    );

    lastAuditSummary = summary;
    updateStatusBarForAudit(summary);
    publishAuditDiagnostics(summary, params.workspaceRoot);

    outputChannel.clear();
    outputChannel.appendLine(formatAuditMarkdown(summary));

    openReportWebview(summary, params.workspaceRoot);

    const errors = summary.issues.filter((i) => i.severity === 'error').length;
    const warnings = summary.issues.filter((i) => i.severity === 'warning').length;
    if (summary.gate && !summary.gate.passed) {
      vscode.window.showErrorMessage(
        `RankCLI gate failed (${summary.score}/100): ${summary.gate.failures.join('; ')}`
      );
    } else {
      vscode.window.showInformationMessage(
        `RankCLI audit complete: ${summary.score}/100 (${errors} errors, ${warnings} warnings across ${summary.pagesAudited} page${summary.pagesAudited === 1 ? '' : 's'})`
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    outputChannel.appendLine(`[RankCLI Error] ${message}`);
    vscode.window.showErrorMessage(`RankCLI audit failed: ${message}`);
  }
}

function publishAuditDiagnostics(summary: ExtensionAuditSummary, workspaceRoot?: string): void {
  auditDiagnostics.clear();
  if (!summary.files || !workspaceRoot) return;

  const byFile = new Map<string, vscode.Diagnostic[]>();
  for (const issue of summary.issues) {
    const urls = issue.affectedUrls ?? [];
    for (const url of urls) {
      const relFile = summary.files[url];
      if (!relFile) continue;
      const absFile = path.isAbsolute(relFile) ? relFile : path.join(workspaceRoot, relFile);
      if (!fs.existsSync(absFile)) continue;

      const list = byFile.get(absFile) ?? [];
      const sev =
        issue.severity === 'error'
          ? vscode.DiagnosticSeverity.Error
          : issue.severity === 'warning'
            ? vscode.DiagnosticSeverity.Warning
            : vscode.DiagnosticSeverity.Information;
      const diag = new vscode.Diagnostic(
        new vscode.Range(0, 0, 0, 1),
        `${issue.title}${issue.howToFix ? ` — ${issue.howToFix}` : ''}`,
        sev
      );
      diag.code = issue.code;
      diag.source = 'rankcli-audit';
      list.push(diag);
      byFile.set(absFile, list);
    }
  }

  for (const [absFile, diagnostics] of byFile.entries()) {
    auditDiagnostics.set(vscode.Uri.file(absFile), diagnostics);
  }
}

function openReportWebview(summary: ExtensionAuditSummary, workspaceRoot?: string): void {
  if (!reportPanel) {
    reportPanel = vscode.window.createWebviewPanel(
      'rankcliReport',
      'RankCLI Audit Report',
      vscode.ViewColumn.Beside,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    reportPanel.onDidDispose(() => {
      reportPanel = undefined;
    });
    reportPanel.webview.onDidReceiveMessage(async (msg) => {
      if (!lastAuditSummary) return;
      if (msg.type === 'rerun' && lastAuditParams) {
        await executeAuditAndDisplay(lastAuditParams);
      } else if (msg.type === 'copyMarkdown') {
        await vscode.env.clipboard.writeText(formatAuditMarkdown(lastAuditSummary));
        vscode.window.showInformationMessage('Copied Markdown audit report to clipboard.');
      } else if (msg.type === 'exportJson') {
        const uri = await vscode.window.showSaveDialog({
          defaultUri: workspaceRoot
            ? vscode.Uri.file(path.join(workspaceRoot, 'rankcli-report.json'))
            : undefined,
          filters: { JSON: ['json'] },
        });
        if (uri) {
          fs.writeFileSync(uri.fsPath, JSON.stringify(lastAuditSummary.rawResult, null, 2), 'utf8');
          vscode.window.showInformationMessage(`Saved RankCLI report to ${uri.fsPath}`);
        }
      } else if (msg.type === 'openFile' && typeof msg.file === 'string' && workspaceRoot) {
        const target = path.isAbsolute(msg.file) ? msg.file : path.join(workspaceRoot, msg.file);
        if (fs.existsSync(target)) {
          const doc = await vscode.workspace.openTextDocument(target);
          await vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
        }
      }
    });
  } else {
    reportPanel.reveal(vscode.ViewColumn.Beside);
  }

  reportPanel.title = `RankCLI: ${summary.score}/100`;
  reportPanel.webview.html = renderReportHtml(summary);
}

async function runUrlAuditCommand(mode: 'url' | 'geo'): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  const activeDoc = vscode.window.activeTextEditor?.document;

  if (mode === 'geo' && activeDoc && isRobotsFile(activeDoc.uri.fsPath)) {
    const choice = await vscode.window.showQuickPick(
      [
        { label: 'Audit a live URL for AI crawler access & GEO', value: 'url' },
        { label: 'Lint this robots.txt file', value: 'file' },
      ],
      { placeHolder: 'How would you like to check AI crawler access?' }
    );
    if (!choice) return;
    if (choice.value === 'file') {
      runFileLintCommand();
      return;
    }
  }

  const url = await resolveTargetUrl(
    mode === 'geo' ? 'RankCLI: Check AI Crawler Access (GEO)' : 'RankCLI: Audit Site URL',
    workspaceRoot
  );
  if (!url) return;

  const vsConfig = vscode.workspace.getConfiguration('rankcli');
  await executeAuditAndDisplay({
    mode,
    url,
    workspaceRoot,
    maxPages: vsConfig.get<number>('maxPages', 10),
    checkLinks: vsConfig.get<boolean>('checkLinks', false),
  });
}

async function runBuildDirAuditCommand(folderUri?: vscode.Uri): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot && !folderUri) {
    vscode.window.showWarningMessage('Open a workspace folder to audit a local build directory.');
    return;
  }

  const { config } = resolveWorkspaceConfig(workspaceRoot);
  const vsConfig = vscode.workspace.getConfiguration('rankcli');
  let targetDir = folderUri?.fsPath;

  if (!targetDir && workspaceRoot) {
    const preferred = config?.dir || vsConfig.get<string>('buildDir', '');
    targetDir = detectBuildDirectory(workspaceRoot, preferred) ?? undefined;
  }

  if (!targetDir) {
    const picked = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: 'Audit Build Folder',
      defaultUri: workspaceRoot ? vscode.Uri.file(workspaceRoot) : undefined,
    });
    if (!picked?.[0]) return;
    targetDir = picked[0].fsPath;
  }

  const siteUrl =
    config?.url ||
    vsConfig.get<string>('defaultUrl', '') ||
    'https://example.com';

  await executeAuditAndDisplay({
    mode: 'dir',
    url: normalizeUrl(siteUrl),
    dir: targetDir,
    workspaceRoot: workspaceRoot ?? path.dirname(targetDir),
    maxPages: vsConfig.get<number>('maxPages', 10),
    checkLinks: false,
  });
}

function runFileLintCommand(): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  const config = vscode.workspace.getConfiguration('rankcli');
  const issues = analyzeDocument(editor.document.getText(), editor.document, config);

  if (issues.length === 0) {
    vscode.window.showInformationMessage('RankCLI: No SEO issues found in current file.');
  } else {
    vscode.window.showWarningMessage(
      `RankCLI: Found ${issues.length} SEO issue${issues.length === 1 ? '' : 's'} in current file.`
    );
  }
}

function showReportCommand(): void {
  if (lastAuditSummary) {
    openReportWebview(lastAuditSummary, getWorkspaceRoot());
    return;
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage(
      'Run "RankCLI: Audit Site URL" or "RankCLI: Audit Local Build Directory" to generate a full report.'
    );
    return;
  }

  const diagnostics = lintDiagnostics.get(editor.document.uri) || [];
  if (diagnostics.length === 0) {
    vscode.window.showInformationMessage(
      'No SEO issues in current file. Run "RankCLI: Audit Site URL" for a full 280+ check audit.'
    );
    return;
  }

  const items = diagnostics.map((d) => ({
    label: `$(warning) ${String(d.code)}`,
    description: d.message,
    diagnostic: d,
  }));

  vscode.window.showQuickPick(items, { placeHolder: 'RankCLI File Issues' }).then((selected) => {
    if (selected) {
      const range = selected.diagnostic.range;
      editor.selection = new vscode.Selection(range.start, range.end);
      editor.revealRange(range);
    }
  });
}

async function initConfigCommand(): Promise<void> {
  const workspaceRoot = getWorkspaceRoot();
  if (!workspaceRoot) {
    vscode.window.showWarningMessage('Open a workspace folder to create rankcli.config.json.');
    return;
  }

  const url = await vscode.window.showInputBox({
    title: 'RankCLI: Create rankcli.config.json',
    prompt: 'Production site URL for this project',
    placeHolder: 'https://yoursite.com',
    value: 'https://example.com',
  });
  if (!url) return;

  const template = buildConfigTemplate(workspaceRoot, normalizeUrl(url));
  const configPath = writeConfigFile(workspaceRoot, template);
  const doc = await vscode.workspace.openTextDocument(configPath);
  await vscode.window.showTextDocument(doc);
  vscode.window.showInformationMessage(`Created ${path.basename(configPath)}.`);
}
