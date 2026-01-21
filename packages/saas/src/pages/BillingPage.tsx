import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Redirect to account page with billing tab
export function BillingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Preserve any query params (success, canceled) when redirecting
    const params = searchParams.toString();
    navigate(`/account${params ? `?${params}` : ''}`, { replace: true });
  }, [navigate, searchParams]);

  return null;
}
