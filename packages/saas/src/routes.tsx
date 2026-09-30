import { matchRoutes } from 'react-router-dom';
import { lazyPage, type LazyPage } from '@/lib/lazy-page';

// Every page is its own chunk, so the landing page doesn't download the
// dashboard, the docs and the blog's syntax highlighter.
const page = {
  Landing: lazyPage(() => import('./pages/LandingPage'), 'LandingPage'),
  FreeAudit: lazyPage(() => import('./pages/FreeAuditPage'), 'FreeAuditPage'),
  Pricing: lazyPage(() => import('./pages/PricingPage'), 'PricingPage'),
  Docs: lazyPage(() => import('./pages/DocsPage'), 'DocsPage'),
  Blog: lazyPage(() => import('./pages/BlogPage'), 'BlogPage'),
  BlogPost: lazyPage(() => import('./pages/BlogPostPage'), 'BlogPostPage'),
  FrameworkGuides: lazyPage(() => import('./pages/FrameworkGuidesIndexPage'), 'FrameworkGuidesIndexPage'),
  FrameworkGuide: lazyPage(() => import('./pages/FrameworkGuidePage'), 'FrameworkGuidePage'),
  About: lazyPage(() => import('./pages/AboutPage'), 'AboutPage'),
  Bot: lazyPage(() => import('./pages/BotPage'), 'BotPage'),
  Contact: lazyPage(() => import('./pages/ContactPage'), 'ContactPage'),
  Changelog: lazyPage(() => import('./pages/ChangelogPage'), 'ChangelogPage'),
  Privacy: lazyPage(() => import('./pages/PrivacyPage'), 'PrivacyPage'),
  Terms: lazyPage(() => import('./pages/TermsPage'), 'TermsPage'),
  MetaTagAnalyzer: lazyPage(() => import('./pages/tools/MetaTagAnalyzerPage'), 'MetaTagAnalyzerPage'),
  OgImagePreview: lazyPage(() => import('./pages/tools/OgImagePreviewPage'), 'OgImagePreviewPage'),
  ChatGPTChecker: lazyPage(() => import('./pages/tools/ChatGPTCheckerPage'), 'ChatGPTCheckerPage'),
  AIVisibilityChecker: lazyPage(() => import('./pages/tools/AIVisibilityCheckerPage'), 'AIVisibilityCheckerPage'),
  CompetitorAnalyzer: lazyPage(() => import('./pages/tools/CompetitorAnalyzerPage'), 'CompetitorAnalyzerPage'),
  Widget: lazyPage(() => import('./pages/WidgetPage'), 'WidgetPage'),
  ClientReport: lazyPage(() => import('./pages/ClientReportPage'), 'ClientReportPage'),
  LTDCheckout: lazyPage(() => import('./pages/checkout/LTDCheckoutPage'), 'default'),
  Login: lazyPage(() => import('./pages/LoginPage'), 'LoginPage'),
  Signup: lazyPage(() => import('./pages/SignupPage'), 'SignupPage'),
  ForgotPassword: lazyPage(() => import('./pages/ForgotPasswordPage'), 'ForgotPasswordPage'),
  ResetPassword: lazyPage(() => import('./pages/ResetPasswordPage'), 'ResetPasswordPage'),
  AuthCallback: lazyPage(() => import('./pages/AuthCallbackPage'), 'AuthCallbackPage'),
  Dashboard: lazyPage(() => import('./pages/DashboardPage'), 'DashboardPage'),
  GitHubCallback: lazyPage(() => import('./pages/GitHubCallbackPage'), 'GitHubCallbackPage'),
  Project: lazyPage(() => import('./pages/ProjectPage'), 'ProjectPage'),
  Keywords: lazyPage(() => import('./pages/KeywordsPage'), 'KeywordsPage'),
  Agency: lazyPage(() => import('./pages/AgencyPage'), 'AgencyPage'),
  Account: lazyPage(() => import('./pages/AccountPage'), 'AccountPage'),
  Billing: lazyPage(() => import('./pages/BillingPage'), 'BillingPage'),
  Connect: lazyPage(() => import('./pages/ConnectPage'), 'ConnectPage'),
  NotFound: lazyPage(() => import('./pages/NotFoundPage'), 'NotFoundPage'),
};

export interface AppRoute {
  path: string;
  page: LazyPage;
  /**
   * App screens (sign-in, dashboard, share links) get their browser-tab
   * title and noindex here, in one place. Public content pages set their
   * own <SEO> instead.
   */
  appTitle?: string;
}

export const publicRoutes: AppRoute[] = [
  { path: '/', page: page.Landing },
  { path: '/free-audit', page: page.FreeAudit },
  { path: '/pricing', page: page.Pricing },
  { path: '/docs', page: page.Docs },
  { path: '/blog', page: page.Blog },
  { path: '/blog/:slug', page: page.BlogPost },
  { path: '/seo', page: page.FrameworkGuides },
  { path: '/seo/:framework', page: page.FrameworkGuide },
  { path: '/about', page: page.About },
  { path: '/bot', page: page.Bot },
  { path: '/contact', page: page.Contact },
  { path: '/changelog', page: page.Changelog },
  { path: '/privacy', page: page.Privacy },
  { path: '/terms', page: page.Terms },
  { path: '/tools/meta-tag-analyzer', page: page.MetaTagAnalyzer },
  { path: '/tools/og-image-preview', page: page.OgImagePreview },
  { path: '/tools/chatgpt-checker', page: page.ChatGPTChecker },
  { path: '/tools/ai-visibility', page: page.AIVisibilityChecker },
  { path: '/tools/compare', page: page.CompetitorAnalyzer },
  { path: '/widget', page: page.Widget, appTitle: 'SEO score widget' },
  { path: '/report/:token', page: page.ClientReport, appTitle: 'SEO report' },
  { path: '/checkout/ltd', page: page.LTDCheckout, appTitle: 'Lifetime deal checkout' },
  { path: '/login', page: page.Login, appTitle: 'Log in' },
  { path: '/signup', page: page.Signup, appTitle: 'Sign up' },
  { path: '/forgot-password', page: page.ForgotPassword, appTitle: 'Forgot password' },
  { path: '/reset-password', page: page.ResetPassword, appTitle: 'Reset password' },
  { path: '/auth/callback', page: page.AuthCallback, appTitle: 'Signing in' },
];

/** Rendered inside <ProtectedRoute>. */
export const protectedRoutes: AppRoute[] = [
  { path: '/dashboard', page: page.Dashboard, appTitle: 'Dashboard' },
  { path: '/dashboard/github-callback', page: page.GitHubCallback, appTitle: 'Connecting GitHub' },
  { path: '/dashboard/projects/:id', page: page.Project, appTitle: 'Project' },
  { path: '/dashboard/projects/:id/keywords', page: page.Keywords, appTitle: 'Keywords' },
  { path: '/dashboard/projects/:id/agency', page: page.Agency, appTitle: 'Agency tools' },
  { path: '/account', page: page.Account, appTitle: 'Account' },
  { path: '/account/billing', page: page.Billing, appTitle: 'Billing' },
  { path: '/account/api-keys', page: page.Account, appTitle: 'API keys' },
  { path: '/connect', page: page.Connect, appTitle: 'Connect an AI assistant' },
];

export const NotFoundPage = page.NotFound;

/** Loads the chunk for the page at `pathname`, so the first render doesn't suspend. */
export function preloadPage(pathname: string): Promise<unknown> {
  const routes = [...publicRoutes, ...protectedRoutes];
  const match = matchRoutes(routes, pathname)?.[0]?.route as AppRoute | undefined;
  return (match?.page ?? NotFoundPage).preload();
}
