/**
 * SEO Autopilot VS Code Extension
 *
 * Provides real-time SEO linting for HTML, React, Vue, and Astro files.
 */

import * as vscode from 'vscode';

// SEO Issue types
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

// Diagnostic collection
let diagnosticCollection: vscode.DiagnosticCollection;
let statusBarItem: vscode.StatusBarItem;

/**
 * Extension activation
 */
export function activate(context: vscode.ExtensionContext): void {
  // Create diagnostic collection
  diagnosticCollection = vscode.languages.createDiagnosticCollection('seo-autopilot');
  context.subscriptions.push(diagnosticCollection);

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'seo-autopilot.showReport';
  context.subscriptions.push(statusBarItem);

  // Register diagnostic provider
  const diagnosticProvider = new SEODiagnosticProvider();

  // Listen for document changes
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(doc => diagnosticProvider.provideDiagnostics(doc)),
    vscode.workspace.onDidChangeTextDocument(e => diagnosticProvider.provideDiagnostics(e.document)),
    vscode.workspace.onDidSaveTextDocument(doc => diagnosticProvider.provideDiagnostics(doc))
  );

  // Register code action provider
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      [
        { language: 'html' },
        { language: 'typescriptreact' },
        { language: 'javascriptreact' },
        { language: 'vue' },
        { language: 'astro' },
        { language: 'svelte' },
      ],
      new SEOCodeActionProvider(),
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }
    )
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('seo-autopilot.runAudit', () => runAudit()),
    vscode.commands.registerCommand('seo-autopilot.showReport', () => showReport())
  );

  // Initial scan of open documents
  vscode.workspace.textDocuments.forEach(doc => diagnosticProvider.provideDiagnostics(doc));
}

/**
 * Extension deactivation
 */
export function deactivate(): void {
  diagnosticCollection?.dispose();
  statusBarItem?.dispose();
}

/**
 * SEO Diagnostic Provider
 */
class SEODiagnosticProvider {
  provideDiagnostics(document: vscode.TextDocument): void {
    if (!isSupported(document)) {
      return;
    }

    const config = vscode.workspace.getConfiguration('seo-autopilot');
    if (!config.get('enabled', true)) {
      diagnosticCollection.delete(document.uri);
      updateStatusBar(0);
      return;
    }

    const text = document.getText();
    const issues = analyzeDocument(text, document, config);
    const diagnostics = issues.map(issue => createDiagnostic(issue));

    diagnosticCollection.set(document.uri, diagnostics);
    updateStatusBar(issues.length);
  }
}

/**
 * SEO Code Action Provider
 */
class SEOCodeActionProvider implements vscode.CodeActionProvider {
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source !== 'seo-autopilot') continue;

      const fix = getQuickFix(diagnostic.code as string, document, diagnostic.range);
      if (fix) {
        const action = new vscode.CodeAction(fix.title, vscode.CodeActionKind.QuickFix);
        action.diagnostics = [diagnostic];
        action.edit = new vscode.WorkspaceEdit();
        action.edit.replace(document.uri, fix.range, fix.newText);
        action.isPreferred = true;
        actions.push(action);
      }
    }

    return actions;
  }
}

/**
 * Check if document is supported
 */
function isSupported(document: vscode.TextDocument): boolean {
  const supportedLanguages = ['html', 'typescriptreact', 'javascriptreact', 'vue', 'astro', 'svelte'];
  return supportedLanguages.includes(document.languageId);
}

/**
 * Analyze document for SEO issues
 */
export function analyzeDocument(
  text: string,
  document: vscode.TextDocument,
  config: vscode.WorkspaceConfiguration
): SEOIssue[] {
  const issues: SEOIssue[] = [];
  const checks = config.get<Record<string, boolean>>('checks', {});
  const severityLevel = getSeverityLevel(config.get('severity', 'warning'));

  // Check for title tag
  if (checks.title !== false && !hasTitle(text)) {
    const headPos = findHeadPosition(text, document);
    issues.push({
      code: 'MISSING_TITLE',
      message: 'Missing <title> tag. Every page should have a unique title.',
      severity: severityLevel,
      range: headPos || new vscode.Range(0, 0, 0, 1),
      fix: {
        title: 'Add title tag',
        newText: '  <title>Page Title</title>\n',
        range: headPos ? new vscode.Range(headPos.end, headPos.end) : new vscode.Range(0, 0, 0, 0),
      },
    });
  }

  // Check for meta description
  if (checks.metaDescription !== false && !hasMetaDescription(text)) {
    const headPos = findHeadPosition(text, document);
    issues.push({
      code: 'MISSING_META_DESCRIPTION',
      message: 'Missing meta description. Add a description for search engines.',
      severity: severityLevel,
      range: headPos || new vscode.Range(0, 0, 0, 1),
      fix: {
        title: 'Add meta description',
        newText: '  <meta name="description" content="Page description goes here" />\n',
        range: headPos ? new vscode.Range(headPos.end, headPos.end) : new vscode.Range(0, 0, 0, 0),
      },
    });
  }

  // Check for Open Graph tags
  if (checks.openGraph !== false && !hasOpenGraph(text)) {
    const headPos = findHeadPosition(text, document);
    issues.push({
      code: 'MISSING_OG_TAGS',
      message: 'Missing Open Graph tags. Add og:title, og:description, og:image for social sharing.',
      severity: severityLevel,
      range: headPos || new vscode.Range(0, 0, 0, 1),
    });
  }

  // Check for Twitter Card
  if (checks.twitterCard !== false && !hasTwitterCard(text)) {
    const headPos = findHeadPosition(text, document);
    issues.push({
      code: 'MISSING_TWITTER_CARD',
      message: 'Missing Twitter Card tags. Add twitter:card, twitter:title, twitter:description.',
      severity: severityLevel,
      range: headPos || new vscode.Range(0, 0, 0, 1),
    });
  }

  // Check for canonical URL
  if (checks.canonical !== false && !hasCanonical(text)) {
    const headPos = findHeadPosition(text, document);
    issues.push({
      code: 'MISSING_CANONICAL',
      message: 'Missing canonical URL. Add rel="canonical" to prevent duplicate content issues.',
      severity: severityLevel,
      range: headPos || new vscode.Range(0, 0, 0, 1),
      fix: {
        title: 'Add canonical link',
        newText: '  <link rel="canonical" href="https://example.com/page" />\n',
        range: headPos ? new vscode.Range(headPos.end, headPos.end) : new vscode.Range(0, 0, 0, 0),
      },
    });
  }

  // Check for H1 heading
  if (checks.headings !== false && !hasH1(text)) {
    issues.push({
      code: 'MISSING_H1',
      message: 'Missing H1 heading. Each page should have exactly one H1.',
      severity: severityLevel,
      range: new vscode.Range(0, 0, 0, 1),
    });
  }

  // Check for multiple H1s
  if (checks.headings !== false) {
    const h1Count = countH1s(text);
    if (h1Count > 1) {
      issues.push({
        code: 'MULTIPLE_H1',
        message: `Found ${h1Count} H1 headings. Each page should have exactly one H1.`,
        severity: severityLevel,
        range: new vscode.Range(0, 0, 0, 1),
      });
    }
  }

  // Check for images without alt text
  if (checks.images !== false) {
    const imgIssues = findImagesWithoutAlt(text, document);
    issues.push(...imgIssues.map(issue => ({
      ...issue,
      severity: severityLevel,
    })));
  }

  // Check for links without text
  if (checks.links !== false) {
    const linkIssues = findEmptyLinks(text, document);
    issues.push(...linkIssues.map(issue => ({
      ...issue,
      severity: severityLevel,
    })));
  }

  return issues;
}

/**
 * Check if text has a title tag
 */
function hasTitle(text: string): boolean {
  return /<title[^>]*>[\s\S]*?<\/title>/i.test(text);
}

/**
 * Check if text has a meta description
 */
function hasMetaDescription(text: string): boolean {
  return /<meta[^>]*name=["']description["'][^>]*>/i.test(text);
}

/**
 * Check if text has Open Graph tags
 */
function hasOpenGraph(text: string): boolean {
  return /<meta[^>]*property=["']og:(title|description)["'][^>]*>/i.test(text);
}

/**
 * Check if text has Twitter Card tags
 */
function hasTwitterCard(text: string): boolean {
  return /<meta[^>]*name=["']twitter:(card|title)["'][^>]*>/i.test(text);
}

/**
 * Check if text has a canonical URL
 */
function hasCanonical(text: string): boolean {
  return /<link[^>]*rel=["']canonical["'][^>]*>/i.test(text);
}

/**
 * Check if text has an H1 heading
 */
function hasH1(text: string): boolean {
  return /<h1[^>]*>/i.test(text);
}

/**
 * Count H1 headings
 */
function countH1s(text: string): number {
  const matches = text.match(/<h1[^>]*>/gi);
  return matches ? matches.length : 0;
}

/**
 * Find position of <head> tag
 */
function findHeadPosition(text: string, document: vscode.TextDocument): vscode.Range | null {
  const match = text.match(/<head[^>]*>/i);
  if (match && match.index !== undefined) {
    const startPos = document.positionAt(match.index);
    const endPos = document.positionAt(match.index + match[0].length);
    return new vscode.Range(startPos, endPos);
  }
  return null;
}

/**
 * Find images without alt text
 */
function findImagesWithoutAlt(text: string, document: vscode.TextDocument): SEOIssue[] {
  const issues: SEOIssue[] = [];
  const imgRegex = /<img[^>]*>/gi;
  let match;

  while ((match = imgRegex.exec(text)) !== null) {
    const imgTag = match[0];
    // Check if alt attribute exists and has content
    if (!imgTag.match(/alt=["'][^"']+["']/i)) {
      const startPos = document.positionAt(match.index);
      const endPos = document.positionAt(match.index + imgTag.length);
      issues.push({
        code: 'IMG_MISSING_ALT',
        message: 'Image missing alt text. Add descriptive alt text for accessibility and SEO.',
        severity: vscode.DiagnosticSeverity.Warning,
        range: new vscode.Range(startPos, endPos),
        fix: {
          title: 'Add alt attribute',
          newText: imgTag.replace(/<img/, '<img alt="Image description"'),
          range: new vscode.Range(startPos, endPos),
        },
      });
    }
  }

  return issues;
}

/**
 * Find empty links
 */
function findEmptyLinks(text: string, document: vscode.TextDocument): SEOIssue[] {
  const issues: SEOIssue[] = [];
  const linkRegex = /<a[^>]*>[\s]*<\/a>/gi;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    const startPos = document.positionAt(match.index);
    const endPos = document.positionAt(match.index + match[0].length);
    issues.push({
      code: 'EMPTY_LINK',
      message: 'Link has no text content. Add descriptive text for accessibility and SEO.',
      severity: vscode.DiagnosticSeverity.Warning,
      range: new vscode.Range(startPos, endPos),
    });
  }

  return issues;
}

/**
 * Get severity level from config string
 */
function getSeverityLevel(severity: string): vscode.DiagnosticSeverity {
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

/**
 * Create diagnostic from SEO issue
 */
function createDiagnostic(issue: SEOIssue): vscode.Diagnostic {
  const diagnostic = new vscode.Diagnostic(issue.range, issue.message, issue.severity);
  diagnostic.code = issue.code;
  diagnostic.source = 'seo-autopilot';
  return diagnostic;
}

/**
 * Get quick fix for issue
 */
function getQuickFix(code: string, document: vscode.TextDocument, range: vscode.Range): SEOFix | null {
  const text = document.getText();
  const headPos = findHeadPosition(text, document);
  const insertPos = headPos ? headPos.end : new vscode.Position(0, 0);

  switch (code) {
    case 'MISSING_TITLE':
      return {
        title: 'Add title tag',
        newText: '\n  <title>Page Title</title>',
        range: new vscode.Range(insertPos, insertPos),
      };
    case 'MISSING_META_DESCRIPTION':
      return {
        title: 'Add meta description',
        newText: '\n  <meta name="description" content="Page description goes here" />',
        range: new vscode.Range(insertPos, insertPos),
      };
    case 'MISSING_CANONICAL':
      return {
        title: 'Add canonical link',
        newText: '\n  <link rel="canonical" href="https://example.com/page" />',
        range: new vscode.Range(insertPos, insertPos),
      };
    case 'MISSING_OG_TAGS':
      return {
        title: 'Add Open Graph tags',
        newText: `\n  <meta property="og:title" content="Page Title" />
  <meta property="og:description" content="Page description" />
  <meta property="og:image" content="https://example.com/image.png" />
  <meta property="og:url" content="https://example.com/page" />`,
        range: new vscode.Range(insertPos, insertPos),
      };
    case 'MISSING_TWITTER_CARD':
      return {
        title: 'Add Twitter Card tags',
        newText: `\n  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Page Title" />
  <meta name="twitter:description" content="Page description" />
  <meta name="twitter:image" content="https://example.com/image.png" />`,
        range: new vscode.Range(insertPos, insertPos),
      };
    default:
      return null;
  }
}

/**
 * Update status bar with issue count
 */
function updateStatusBar(issueCount: number): void {
  if (issueCount === 0) {
    statusBarItem.text = '$(check) SEO: OK';
    statusBarItem.backgroundColor = undefined;
    statusBarItem.tooltip = 'No SEO issues found';
  } else {
    statusBarItem.text = `$(warning) SEO: ${issueCount} issue${issueCount > 1 ? 's' : ''}`;
    statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    statusBarItem.tooltip = `${issueCount} SEO issue${issueCount > 1 ? 's' : ''} found`;
  }
  statusBarItem.show();
}

/**
 * Run full SEO audit command
 */
function runAudit(): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  const config = vscode.workspace.getConfiguration('seo-autopilot');
  const issues = analyzeDocument(editor.document.getText(), editor.document, config);

  if (issues.length === 0) {
    vscode.window.showInformationMessage('No SEO issues found!');
  } else {
    vscode.window.showWarningMessage(`Found ${issues.length} SEO issue${issues.length > 1 ? 's' : ''}`);
  }
}

/**
 * Show SEO report command
 */
function showReport(): void {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor');
    return;
  }

  const diagnostics = diagnosticCollection.get(editor.document.uri) || [];

  if (diagnostics.length === 0) {
    vscode.window.showInformationMessage('No SEO issues in current file');
    return;
  }

  // Show quick pick with all issues
  const items = diagnostics.map(d => ({
    label: `$(warning) ${d.code}`,
    description: d.message,
    diagnostic: d,
  }));

  vscode.window.showQuickPick(items, { placeHolder: 'SEO Issues' }).then(selected => {
    if (selected) {
      const range = selected.diagnostic.range;
      editor.selection = new vscode.Selection(range.start, range.end);
      editor.revealRange(range);
    }
  });
}
