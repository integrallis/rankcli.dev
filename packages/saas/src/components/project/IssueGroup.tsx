import { useState } from 'react';
import { ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { IssueItem } from './IssueItem';
import { cn } from '@/lib/utils';
import type { AuditIssue } from '@/integrations/supabase/types';

interface IssueGroupProps {
  title: string;
  severity?: 'error' | 'warning' | 'notice';
  issues: AuditIssue[];
  expandedIds: Set<string>;
  onToggleIssue: (id: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  projectUrl: string;
  defaultCollapsed?: boolean;
  selectedIds?: Set<string>;
  onSelectIssue?: (id: string, selected: boolean) => void;
  onSelectGroup?: (issueIds: string[], selected: boolean) => void;
  showCheckboxes?: boolean;
}

export function IssueGroup({
  title,
  severity,
  issues,
  expandedIds,
  onToggleIssue,
  onExpandAll,
  onCollapseAll,
  projectUrl,
  defaultCollapsed = false,
  selectedIds = new Set(),
  onSelectIssue,
  onSelectGroup,
  showCheckboxes = false,
}: IssueGroupProps) {
  const [isGroupCollapsed, setIsGroupCollapsed] = useState(defaultCollapsed);

  if (issues.length === 0) return null;

  const severityConfig = severity
    ? {
        error: {
          dotColor: 'bg-red-500',
          headerBg: 'border-border',
          textColor: 'text-red-500',
        },
        warning: {
          dotColor: 'bg-yellow-500',
          headerBg: 'border-border',
          textColor: 'text-yellow-500',
        },
        notice: {
          dotColor: 'bg-blue-500',
          headerBg: 'border-border',
          textColor: 'text-blue-500',
        },
      }[severity]
    : {
        dotColor: 'bg-muted-foreground',
        headerBg: 'border-border',
        textColor: 'text-foreground',
      };

  const allExpanded = issues.every((issue) => expandedIds.has(issue.id));
  const someExpanded = issues.some((issue) => expandedIds.has(issue.id));

  // Selection state for this group
  const issueIds = issues.map((i) => i.id);
  const selectedInGroup = issueIds.filter((id) => selectedIds.has(id));
  const allSelected = selectedInGroup.length === issues.length;
  const someSelected = selectedInGroup.length > 0 && !allSelected;

  const handleSelectAll = (checked: boolean) => {
    if (onSelectGroup) {
      onSelectGroup(issueIds, checked);
    }
  };

  const handleSelectAllClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Group Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 border-b',
          severityConfig.headerBg
        )}
      >
        <div className="flex items-center gap-2">
          {/* Select All Checkbox */}
          {showCheckboxes && (
            <div onClick={handleSelectAllClick}>
              <Checkbox
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={(checked) => handleSelectAll(checked === true)}
                className="shrink-0"
              />
            </div>
          )}

          <button
            onClick={() => setIsGroupCollapsed(!isGroupCollapsed)}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <span className={cn('h-2 w-2 rounded-full', severityConfig.dotColor)} />
            <h3 className={cn('font-medium', severityConfig.textColor)}>
              {title} ({issues.length})
            </h3>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform duration-200',
                isGroupCollapsed && '-rotate-90'
              )}
            />
          </button>
        </div>

        {!isGroupCollapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={allExpanded ? onCollapseAll : onExpandAll}
          >
            <ChevronsUpDown className="h-3.5 w-3.5 mr-1" />
            {allExpanded ? 'Collapse All' : someExpanded ? 'Expand All' : 'Expand All'}
          </Button>
        )}
      </div>

      {/* Group Content */}
      {!isGroupCollapsed && (
        <div className="p-3 space-y-2 bg-background">
          {issues.map((issue) => (
            <IssueItem
              key={issue.id}
              issue={issue}
              isExpanded={expandedIds.has(issue.id)}
              onToggle={() => onToggleIssue(issue.id)}
              projectUrl={projectUrl}
              isSelected={selectedIds.has(issue.id)}
              onSelectChange={(selected) => onSelectIssue?.(issue.id, selected)}
              showCheckbox={showCheckboxes}
            />
          ))}
        </div>
      )}
    </div>
  );
}
