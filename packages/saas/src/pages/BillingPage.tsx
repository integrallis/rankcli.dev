import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Redirect to account page with billing tab
export function BillingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Preserve any query params (success, canceled) when redirecting
    // Add tab=billing to open the billing tab
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', 'billing');
    navigate(`/account?${newParams.toString()}`, { replace: true });
  }, [navigate, searchParams]);

  return null;
}
