import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePendingPlan } from '@/hooks/usePendingPlan';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { consumePendingPlan, consumePendingLTD } = usePendingPlan();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // A plan/LTD tier picked while logged out (Pricing -> Signup) survives
  // signup + email confirmation via localStorage (see usePendingPlan). This
  // runs once, at the layout level, so it fires no matter which protected
  // route the user lands on first (/dashboard by default) - not just /account.
  // Read-once consumption means it never re-fires on a later visit, and we
  // don't act on it while already inside the destination it would redirect
  // to, so a fresh checkout selection there isn't immediately overwritten.
  if (!location.pathname.startsWith('/account') && !location.pathname.startsWith('/checkout')) {
    const pendingPlan = consumePendingPlan();
    if (pendingPlan) {
      return <Navigate to={`/account/billing?plan=${pendingPlan}`} replace />;
    }

    const pendingLTD = consumePendingLTD();
    if (pendingLTD) {
      return <Navigate to={`/checkout/ltd?tier=${pendingLTD}`} replace />;
    }
  }

  return <Outlet />;
}
