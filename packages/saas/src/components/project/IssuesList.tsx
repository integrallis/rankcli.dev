import { useState, useMemo, useCallback } from 'react';
import {
  ChevronDown,
  Download,
  FileText,
  Printer,
  ChevronsUpDown,
  GitPullRequest,
  Loader2,
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
}

export function IssuesList({
  issues,
  projectName,
  projectUrl,
  onCreateFixPR,
  isCreatingPR = false,
  hasGitHub = false,
}: IssuesListProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>('severity');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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

  // Toggle single issue
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

  return (
    <Card>
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
            {/* Create Fix PR Button */}
            {hasGitHub && onCreateFixPR && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={onCreateFixPR}
                disabled={isCreatingPR}
              >
                {isCreatingPR ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating PR...
                  </>
                ) : (
                  <>
                    <GitPullRequest className="h-4 w-4" />
                    Create Fix PR
                  </>
                )}
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
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
