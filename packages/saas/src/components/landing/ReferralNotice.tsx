import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { peekSignupSource, referralCodeIn } from '@/hooks/useSignupSource';

// What a visitor who arrived through a referral link is promised (migration 20261104220000:
// apply_referral extends the 14-day trial to 30). Reads the link's own ?ref= first, then the
// stored first touch, so the promise survives navigation to the signup page.
export function ReferralNotice({ className = '' }: { className?: string }) {
  const code = useMemo(() => referralCodeIn(window.location.search) ?? peekSignupSource()?.referral_code, []);
  if (!code) return null;
  return (
    <div className={`border-b border-primary/30 bg-primary/5 text-sm ${className}`}>
      <div className="container py-2">
        You were invited. An account created from this link starts with <strong>30 days of Pro</strong> instead of 14, no card.{' '}
        <Link to="/signup" className="underline">Create the account</Link>
      </div>
    </div>
  );
}
