import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { FreeAuditPage } from './pages/FreeAuditPage';
import { PricingPage } from './pages/PricingPage';
import { DocsPage } from './pages/DocsPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { MetaTagAnalyzerPage } from './pages/tools/MetaTagAnalyzerPage';
import { OgImagePreviewPage } from './pages/tools/OgImagePreviewPage';
import { ChatGPTCheckerPage } from './pages/tools/ChatGPTCheckerPage';
import { AIVisibilityCheckerPage } from './pages/tools/AIVisibilityCheckerPage';
import { CompetitorAnalyzerPage } from './pages/tools/CompetitorAnalyzerPage';
import { WidgetPage } from './pages/WidgetPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectPage } from './pages/ProjectPage';
import { KeywordsPage } from './pages/KeywordsPage';
import { AgencyPage } from './pages/AgencyPage';
import { ClientReportPage } from './pages/ClientReportPage';
import { AccountPage } from './pages/AccountPage';
import { BillingPage } from './pages/BillingPage';
import { GitHubCallbackPage } from './pages/GitHubCallbackPage';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy-loaded checkout pages
const LTDCheckoutPage = lazy(() => import('./pages/checkout/LTDCheckoutPage'));

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/free-audit" element={<FreeAuditPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/tools/meta-tag-analyzer" element={<MetaTagAnalyzerPage />} />
      <Route path="/tools/og-image-preview" element={<OgImagePreviewPage />} />
      <Route path="/tools/chatgpt-checker" element={<ChatGPTCheckerPage />} />
      <Route path="/tools/ai-visibility" element={<AIVisibilityCheckerPage />} />
      <Route path="/tools/compare" element={<CompetitorAnalyzerPage />} />
      <Route path="/widget" element={<WidgetPage />} />
      <Route path="/report/:token" element={<ClientReportPage />} />
      <Route path="/checkout/ltd" element={
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
          <LTDCheckoutPage />
        </Suspense>
      } />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/github-callback" element={<GitHubCallbackPage />} />
        <Route path="/dashboard/projects/:id" element={<ProjectPage />} />
        <Route path="/dashboard/projects/:id/keywords" element={<KeywordsPage />} />
        <Route path="/dashboard/projects/:id/agency" element={<AgencyPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/billing" element={<BillingPage />} />
        <Route path="/account/api-keys" element={<AccountPage />} />
      </Route>
    </Routes>
  );
}

export default App;
