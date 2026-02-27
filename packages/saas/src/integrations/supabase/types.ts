// Database types for RankCLI

export interface SubscriptionPlan {
  id: string;
  plan_id: 'solo' | 'pro' | 'agency';
  name: string;
  description: string | null;
  price_cents: number;
  billing_period: 'month' | 'year' | 'lifetime';
  sites_limit: number;
  team_members_limit: number | null;
  audits_per_month: number | null;
  api_requests_per_day: number | null;
  keywords_limit: number;
  historical_days: number;
  features: {
    github_connect: boolean;
    github_auto_fix: boolean;
    slack_alerts: boolean;
    api_access: boolean;
    competitor_tracking: number;
    white_label: boolean;
    priority_support: boolean;
  };
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string | null;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired';
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  plan?: SubscriptionPlan;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  domain: string;
  url: string;
  github_repo_url: string | null;
  github_repo_id: number | null;
  github_installation_id: number | null;
  github_default_branch: string;
  framework: string | null;
  config: Record<string, unknown>;
  is_active: boolean;
  last_audit_at: string | null;
  last_audit_score: number | null;
  created_at: string;
  updated_at: string;
  // Joined data
  latest_audit?: Audit;
  issues_count?: {
    errors: number;
    warnings: number;
    notices: number;
  };
}

export interface Audit {
  id: string;
  project_id: string;
  triggered_by: 'manual' | 'scheduled' | 'github_push' | 'api';
  triggered_by_user: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed';
  score: number | null;
  pages_crawled: number;
  issues_found: number;
  checks_run: number;
  health_scores: {
    crawlability?: number;
    indexability?: number;
    onPage?: number;
    content?: number;
    performance?: number;
    security?: number;
    socialMeta?: number;
    structuredData?: number;
  } | null;
  summary: Record<string, unknown> | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  created_at: string;
}

export interface AuditIssue {
  id: string;
  audit_id: string;
  project_id: string;
  code: string;
  severity: 'error' | 'warning' | 'notice';
  category: string;
  title: string;
  description: string | null;
  impact: string | null;
  how_to_fix: string | null;
  affected_urls: string[];
  details: Record<string, unknown> | null;
  status: 'open' | 'fixing' | 'fixed' | 'ignored' | 'wont_fix';
  fixed_at: string | null;
  fixed_by: string | null;
  fix_pr_url: string | null;
  created_at: string;
}

export interface AuditPage {
  id: string;
  audit_id: string;
  url: string;
  status_code: number | null;
  title: string | null;
  description: string | null;
  h1: string[] | null;
  canonical: string | null;
  word_count: number | null;
  load_time_ms: number | null;
  issue_codes: string[] | null;
  created_at: string;
}

export interface Keyword {
  id: string;
  project_id: string;
  keyword: string;
  search_volume: number | null;
  difficulty: number | null;
  current_position: number | null;
  previous_position: number | null;
  best_position: number | null;
  target_url: string | null;
  last_checked: string | null;
  created_at: string;
}

export interface GitHubInstallation {
  id: string;
  user_id: string;
  installation_id: number;
  account_login: string;
  account_type: 'User' | 'Organization';
  permissions: Record<string, unknown>;
  status: 'active' | 'suspended' | 'deleted';
  installed_at: string;
  updated_at: string;
}

export interface GitHubPR {
  id: string;
  project_id: string;
  audit_id: string | null;
  pr_number: number;
  pr_url: string;
  pr_title: string;
  pr_state: 'open' | 'closed' | 'merged';
  issue_ids: string[] | null;
  created_at: string;
  merged_at: string | null;
  closed_at: string | null;
}

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_hash: string;
  key_prefix: string;
  scopes: string[];
  rate_limit_per_minute: number;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface FreeAudit {
  id: string;
  url: string;
  domain: string;
  score: number | null;
  issues_summary: Record<string, unknown> | null;
  top_issues: Array<{
    code: string;
    severity: 'error' | 'warning' | 'notice';
    title: string;
    category: string;
  }> | null;
  email: string | null;
  subscribed_to_newsletter: boolean;
  converted_to_signup: boolean;
  converted_at: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  referrer: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

// Input types for creating/updating
export interface CreateProjectInput {
  name: string;
  url: string;
  github_repo_url?: string;
}

export interface UpdateProjectInput {
  name?: string;
  url?: string;
  github_repo_url?: string;
  github_default_branch?: string;
  is_active?: boolean;
}
