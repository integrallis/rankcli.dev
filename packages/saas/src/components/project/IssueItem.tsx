import { useState } from 'react';
import { ChevronDown, Copy, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
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

interface IssueItemProps {
  issue: AuditIssue;
  isExpanded: boolean;
  onToggle: () => void;
  projectUrl: string;
  isSelected?: boolean;
  onSelectChange?: (selected: boolean) => void;
  showCheckbox?: boolean;
}

export function IssueItem({
  issue,
  isExpanded,
  onToggle,
  projectUrl,
  isSelected = false,
  onSelectChange,
  showCheckbox = false,
}: IssueItemProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [showAllUrls, setShowAllUrls] = useState(false);

  const severityColor = {
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    notice: 'bg-blue-500',
  }[issue.severity];

  const categoryLabel = CATEGORY_LABELS[issue.category] || issue.category;

  // Build full URLs from affected_urls
  const getFullUrl = (url: string): string => {
    try {
      // If it's already a full URL, return it
      new URL(url);
      return url;
    } catch {
      // It's a path, combine with project URL
      try {
        const base = new URL(projectUrl);
        return new URL(url, base).href;
      } catch {
        return url;
      }
    }
  };

  const handleCopyUrl = async (url: string) => {
    const fullUrl = getFullUrl(url);
    await navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const affectedUrls = issue.affected_urls || [];
  const displayedUrls = showAllUrls ? affectedUrls : affectedUrls.slice(0, 5);
  const hasMoreUrls = affectedUrls.length > 5;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Collapsed Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
      >
        {/* Checkbox */}
        {showCheckbox && (
          <div onClick={handleCheckboxClick}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelectChange?.(checked === true)}
              className="shrink-0"
            />
          </div>
        )}

        {/* Severity Dot */}
        <span
          className={cn('h-2.5 w-2.5 rounded-full shrink-0', severityColor)}
          aria-label={issue.severity}
        />

        {/* Title */}
        <span className="flex-1 font-medium truncate">{issue.title}</span>

        {/* Category Badge */}
        <Badge variant="secondary" className="shrink-0">
          {categoryLabel}
        </Badge>

        {/* Affected Count */}
        {affectedUrls.length > 0 && (
          <span className="text-xs text-muted-foreground shrink-0">
            {affectedUrls.length} page{affectedUrls.length !== 1 ? 's' : ''}
          </span>
        )}

        {/* Expand/Collapse Icon */}
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border px-4 py-4 space-y-4 bg-muted/30">
          {/* Description */}
          {issue.description && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Description
              </h4>
              <p className="text-sm">{issue.description}</p>
            </div>
          )}

          {/* Impact */}
          {issue.impact && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Impact
              </h4>
              <p className="text-sm">{issue.impact}</p>
            </div>
          )}

          {/* How to Fix */}
          {issue.how_to_fix && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                How to Fix
              </h4>
              <p className="text-sm">{issue.how_to_fix}</p>
            </div>
          )}

          {/* Affected URLs */}
          {affectedUrls.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Affected Pages ({affectedUrls.length})
              </h4>
              <div className="space-y-1">
                {displayedUrls.map((url) => {
                  const fullUrl = getFullUrl(url);
                  return (
                    <div
                      key={url}
                      className="flex items-center gap-2 group"
                    >
                      <code className="text-xs bg-background px-2 py-1 rounded flex-1 truncate">
                        {fullUrl}
                      </code>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUrl(url);
                        }}
                        className="p-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copy URL"
                      >
                        {copiedUrl === url ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  );
                })}
                {hasMoreUrls && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllUrls(!showAllUrls);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    {showAllUrls
                      ? 'Show less'
                      : `+${affectedUrls.length - 5} more`}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Issue Code (for debugging/reference) */}
          <div className="pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Issue code: <code className="bg-background px-1.5 py-0.5 rounded">{issue.code}</code>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
