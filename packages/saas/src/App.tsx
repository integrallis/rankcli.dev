import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { FreeAuditPage } from './pages/FreeAuditPage';
import { PricingPage } from './pages/PricingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectPage } from './pages/ProjectPage';
import { AccountPage } from './pages/AccountPage';
import { BillingPage } from './pages/BillingPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/free-audit" element={<FreeAuditPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/projects/:id" element={<ProjectPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/account/billing" element={<BillingPage />} />
        <Route path="/account/api-keys" element={<AccountPage />} />
      </Route>
    </Routes>
  );
}

export default App;
