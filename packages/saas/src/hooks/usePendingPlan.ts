// Carries a plan/LTD-tier selection made while logged out (Pricing -> Signup)
// through email/OAuth signup to the first authenticated page load, where
// ProtectedRoute consumes it and redirects to the right checkout. Read-once:
// consuming a key removes it, so a later page refresh can't re-trigger it.

const PENDING_PLAN_KEY = 'rankcli_pending_plan';
const PENDING_LTD_KEY = 'rankcli_pending_ltd';

export function usePendingPlan() {
  const setPendingPlan = (planId: string) => {
    localStorage.setItem(PENDING_PLAN_KEY, planId);
  };

  const setPendingLTD = (tierId: string) => {
    localStorage.setItem(PENDING_LTD_KEY, tierId);
  };

  const consumePendingPlan = (): string | null => {
    const value = localStorage.getItem(PENDING_PLAN_KEY);
    if (value) localStorage.removeItem(PENDING_PLAN_KEY);
    return value;
  };

  const consumePendingLTD = (): string | null => {
    const value = localStorage.getItem(PENDING_LTD_KEY);
    if (value) localStorage.removeItem(PENDING_LTD_KEY);
    return value;
  };

  return { setPendingPlan, setPendingLTD, consumePendingPlan, consumePendingLTD };
}
