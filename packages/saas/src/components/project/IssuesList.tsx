import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  Download,
  FileText,
  Printer,
  ChevronsUpDown,
  GitPullRequest,
  Loader2,
  EyeOff,
  XCircle,
  X,
  CheckSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { IssueGroup } from './IssueGroup';
import { exportToMarkdown, exportToPDF } from '@/lib/export-utils';
import { supabase } from '@/integrations/supabase/client';
import type { AuditIssue } from '@/integrations/supabase/types';

// Category display labels
const CATEGORY_LABELS: Record<string, string> = {
  crawlability: 'Crawlability',
  indexability: 'Indexability',
  'on-page': 'On-Page',
  content: 'Content',
  links: 'Links',
  images: 'Images',
  'structured-data': 'Structured Data',
  performance: 'Performance',
  security: 'Security',
  mobile: 'Mobile',
  international: 'International',
  'ai-readiness': 'AI Readiness',
  social: 'Social',
  'local-seo': 'Local SEO',
  accessibility: 'Accessibility',
};

type GroupBy = 'severity' | 'category';

interface IssuesListProps {
  issues: AuditIssue[];
  projectName: string;
  projectUrl: string;
  onCreateFixPR?: () => void;
  isCreatingPR?: boolean;
  hasGitHub?: boolean;
  /** Opens the connect-repository dialog, so the button is useful before a repo is linked. */
  onConnectGitHub?: () => void;
  /** Auto-fix PRs are BYOK: no key, no PR. null while still unknown. */
  hasAIKey?: boolean | null;
  /** Arrived from the audit email's fix link - ring the button so it's findable. */
  highlightFixPR?: boolean;
  /** PRs this report has opened / may open. create-seo-pr is what enforces the cap. */
  prsUsedForReport?: number;
  prsAllowedForReport?: number;
  /** The plan's monthly allowance and usage. allowance null/undefined = unlimited. */
  prsUsedThisMonth?: number;
  prsAllowedThisMonth?: number | null;
  planName?: string;
  onIssuesUpdated?: () => void;
}

export function IssuesList({
  issues,
  projectName,
  projectUrl,
  onCreateFixPR,
  isCreatingPR = false,
  hasGitHub = false,
  onConnectGitHub,
  hasAIKey,
  highlightFixPR = false,
  prsUsedForReport,
  prsAllowedForReport,
  prsUsedThisMonth,
  prsAllowedThisMonth,
  planName,
  onIssuesUpdated,
}: IssuesListProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>('severity');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isUpdating, setIsUpdating] = useState(false);

  // Group issues based on current grouping mode
  const groupedIssues = useMemo(() => {
    if (groupBy === 'severity') {
      return {
        error: issues.filter((i) => i.severity === 'error'),
        warning: issues.filter((i) => i.severity === 'warning'),
        notice: issues.filter((i) => i.severity === 'notice'),
      };
    } else {
      // Group by category
      const categories: Record<string, AuditIssue[]> = {};
      for (const issue of issues) {
        if (!categories[issue.category]) {
          categories[issue.category] = [];
        }
        categories[issue.category].push(issue);
      }
      // Sort categories by issue count (descending)
      const sorted = Object.entries(categories).sort(
        ([, a], [, b]) => b.length - a.length
      );
      return Object.fromEntries(sorted);
    }
  }, [issues, groupBy]);

  // Toggle single issue expansion
  const handleToggleIssue = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Expand all issues in a group
  const handleExpandGroup = useCallback((groupIssues: AuditIssue[]) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      for (const issue of groupIssues) {
        next.add(issue.id);
      }
      return next;
    });
  }, []);

  // Collapse all issues in a group
  const handleCollapseGroup = useCallback((groupIssues: AuditIssue[]) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      for (const issue of groupIssues) {
        next.delete(issue.id);
      }
      return next;
    });
  }, []);

  // Global expand/collapse
  const handleExpandAll = useCallback(() => {
    setExpandedIds(new Set(issues.map((i) => i.id)));
  }, [issues]);

  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  // Selection handlers
  const handleSelectIssue = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleSelectGroup = useCallback((ids: string[], selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (selected) {
          next.add(id);
        } else {
          next.delete(id);
        }
      }
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Bulk status update
  const handleBulkStatusUpdate = useCallback(
    async (status: 'ignored' | 'wont_fix') => {
      if (selectedIds.size === 0) return;

      setIsUpdating(true);
      try {
        const { error } = await supabase
          .from('audit_issues')
          .update({ status })
          .in('id', Array.from(selectedIds));

        if (error) throw error;

        // Clear selection and notify parent
        setSelectedIds(new Set());
        onIssuesUpdated?.();
      } catch (err) {
        console.error('Failed to update issues:', err);
      } finally {
        setIsUpdating(false);
      }
    },
    [selectedIds, onIssuesUpdated]
  );

  // Export handlers
  const handleExportMarkdown = () => {
    exportToMarkdown(issues, projectName, projectUrl);
  };

  const handleExportPDF = () => {
    exportToPDF(issues, projectName, projectUrl);
  };

  const allExpanded = expandedIds.size === issues.length;
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  // Two limits apply: this report's allowance and the plan's month. Show whichever bites
  // first - a "2 left" that ignores an exhausted monthly quota is a lie the user only finds
  // out about after clicking.
  const reportRemaining =
    prsAllowedForReport !== undefined && prsUsedForReport !== undefined
      ? Math.max(0, prsAllowedForReport - prsUsedForReport)
      : null;
  const monthRemaining =
    prsAllowedThisMonth != null && prsUsedThisMonth !== undefined
      ? Math.max(0, prsAllowedThisMonth - prsUsedThisMonth)
      : null;
  const prsRemaining =
    reportRemaining === null
      ? monthRemaining
      : monthRemaining === null
        ? reportRemaining
        : Math.min(reportRemaining, monthRemaining);
  const prsExhausted = prsRemaining === 0;
  const monthIsTheLimit = monthRemaining !== null && monthRemaining <= (reportRemaining ?? Infinity);

  // Auto-fix PRs need a connected repo AND the user's own AI key. hasAIKey === null means
  // we don't know yet, so nothing is claimed missing.
  const needsAIKey = hasAIKey === false;
  const prBlocker = !hasGitHub
    ? 'Connect a GitHub repository to open fix PRs'
    : needsAIKey
      ? 'Auto-fix PRs run on your own AI provider key - add one to enable them'
      : prsExhausted
        ? monthIsTheLimit
          ? `Your ${planName ?? 'current'} plan includes ${prsAllowedThisMonth} auto-fix PRs a month, and this month's are used. Upgrade for unlimited.`
          : `This report has opened its ${prsAllowedForReport} PRs. Run a new audit to open more.`
        : monthIsTheLimit && monthRemaining !== null
          ? `${monthRemaining} of ${prsAllowedThisMonth} auto-fix PRs left this month on ${planName ?? 'your plan'}`
          : null;

  const showCheckboxes = issues.length > 0;
  const hasSelection = selectedIds.size > 0;

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CardTitle>Issues Found</CardTitle>
            <div className="flex gap-2">
              <Badge variant="destructive">{errorCount} errors</Badge>
              <Badge variant="warning">{warningCount} warnings</Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Fix this report in a PR. Shown even without a repo connected - it is the
                whole point of the product, and hiding it made it undiscoverable; with no
                repo it opens the connect dialog instead. */}
            {(onCreateFixPR || onConnectGitHub) && (
              <Button
                variant="outline"
                size="sm"
                className={cn('gap-2', highlightFixPR && 'ring-2 ring-primary ring-offset-2')}
                onClick={!hasGitHub ? onConnectGitHub : needsAIKey ? undefined : onCreateFixPR}
                asChild={needsAIKey && hasGitHub}
                disabled={isCreatingPR || (hasGitHub && !needsAIKey && prsExhausted)}
                title={prBlocker ?? 'Open a PR that fixes the issues in this report'}
              >
                {isCreatingPR ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating PR...
                  </>
                ) : needsAIKey && hasGitHub ? (
                  // The only prerequisite that lives on another page.
                  <Link to="/account?tab=ai-provider">
                    <GitPullRequest className="h-4 w-4" />
                    Add an AI key to fix
                  </Link>
                ) : (
                  <>
                    <GitPullRequest className="h-4 w-4" />
                    {hasGitHub ? 'Fix in a PR' : 'Connect repo to fix'}
                    {hasGitHub && prsRemaining !== null && (
                      <span className="text-xs text-muted-foreground">
                        {prsRemaining} left
                      </span>
                    )}
                  </>
                )}
              </Button>
            )}

            {/* Bulk Select Toggle */}
            {showCheckboxes && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={() =>
                  hasSelection
                    ? handleClearSelection()
                    : setSelectedIds(new Set(issues.map((i) => i.id)))
                }
              >
                <CheckSquare className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {hasSelection ? 'Deselect' : 'Select'}
                </span>
              </Button>
            )}

            {/* Global Expand/Collapse */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
              onClick={allExpanded ? handleCollapseAll : handleExpandAll}
            >
              <ChevronsUpDown className="h-4 w-4" />
              <span className="hidden sm:inline">
                {allExpanded ? 'Collapse All' : 'Expand All'}
              </span>
            </Button>

            {/* Group By Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  Group by
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Group issues by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={groupBy}
                  onValueChange={(v) => setGroupBy(v as GroupBy)}
                >
                  <DropdownMenuRadioItem value="severity">
                    Severity
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="category">
                    Category
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportMarkdown}>
                  <FileText className="h-4 w-4 mr-2" />
                  Download Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <Printer className="h-4 w-4 mr-2" />
                  Export to PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {groupBy === 'severity' ? (
            <>
              <IssueGroup
                title="Errors"
                severity="error"
                issues={groupedIssues.error || []}
                expandedIds={expandedIds}
                onToggleIssue={handleToggleIssue}
                onExpandAll={() => handleExpandGroup(groupedIssues.error || [])}
                onCollapseAll={() => handleCollapseGroup(groupedIssues.error || [])}
                projectUrl={projectUrl}
                selectedIds={selectedIds}
                onSelectIssue={handleSelectIssue}
                onSelectGroup={handleSelectGroup}
                showCheckboxes={showCheckboxes}
              />
              <IssueGroup
                title="Warnings"
                severity="warning"
                issues={groupedIssues.warning || []}
                expandedIds={expandedIds}
                onToggleIssue={handleToggleIssue}
                onExpandAll={() => handleExpandGroup(groupedIssues.warning || [])}
                onCollapseAll={() => handleCollapseGroup(groupedIssues.warning || [])}
                projectUrl={projectUrl}
                selectedIds={selectedIds}
                onSelectIssue={handleSelectIssue}
                onSelectGroup={handleSelectGroup}
                showCheckboxes={showCheckboxes}
              />
              <IssueGroup
                title="Notices"
                severity="notice"
                issues={groupedIssues.notice || []}
                expandedIds={expandedIds}
                onToggleIssue={handleToggleIssue}
                onExpandAll={() => handleExpandGroup(groupedIssues.notice || [])}
                onCollapseAll={() => handleCollapseGroup(groupedIssues.notice || [])}
                projectUrl={projectUrl}
                defaultCollapsed={true}
                selectedIds={selectedIds}
                onSelectIssue={handleSelectIssue}
                onSelectGroup={handleSelectGroup}
                showCheckboxes={showCheckboxes}
              />
            </>
          ) : (
            Object.entries(groupedIssues).map(([category, categoryIssues]) => (
              <IssueGroup
                key={category}
                title={CATEGORY_LABELS[category] || category}
                issues={categoryIssues as AuditIssue[]}
                expandedIds={expandedIds}
                onToggleIssue={handleToggleIssue}
                onExpandAll={() => handleExpandGroup(categoryIssues as AuditIssue[])}
                onCollapseAll={() => handleCollapseGroup(categoryIssues as AuditIssue[])}
                projectUrl={projectUrl}
                selectedIds={selectedIds}
                onSelectIssue={handleSelectIssue}
                onSelectGroup={handleSelectGroup}
                showCheckboxes={showCheckboxes}
              />
            ))
          )}
        </div>
      </CardContent>

      {/* Floating Action Bar */}
      {hasSelection && (
        <div className="sticky bottom-4 mx-4 mb-4 flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-3 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedIds.size} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleClearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => handleBulkStatusUpdate('ignored')}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              Mark as Ignored
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => handleBulkStatusUpdate('wont_fix')}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Won't Fix
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
