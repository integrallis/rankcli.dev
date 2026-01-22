import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * AuthCallbackPage handles OAuth provider redirects and email confirmations.
 * When an OAuth provider (Google, GitHub) redirects back to our app,
 * or when a user clicks an email confirmation link,
 * the tokens are in the URL hash. The Supabase client automatically
 * processes these tokens, but we need to wait for that to complete
 * before redirecting to the final destination.
 */
export function AuthCallbackPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [provider, setProvider] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const [resendEmail, setResendEmail] = useState<string | null>(null);

  // Get the redirect destination from query params (defaults to /dashboard)
  const next = searchParams.get('next') || '/dashboard';
  const callbackType = searchParams.get('type'); // "email_confirm" for email verification

  const handleResendVerification = async () => {
    if (!resendEmail) {
      navigate('/signup');
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: resendEmail,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback?type=email_confirm',
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Verification email sent!', {
          description: 'Check your inbox for a new confirmation link.',
        });
      }
    } catch {
      toast.error('Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  useEffect(() => {
    // Check for error in URL (e.g., user denied access, OTP expired)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorParam = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');
    const errorCodeParam = hashParams.get('error_code');

    if (errorParam) {
      setStatus('error');
      setError(errorDescription || errorParam);
      setErrorCode(errorCodeParam);
      return;
    }

    // Wait for auth state to resolve
    if (isLoading) {
      return; // Still loading, wait for auth state change
    }

    if (isAuthenticated) {
      // Check if this is a new user by looking at created_at
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          const createdAt = new Date(user.created_at);
          const now = new Date();
          const diffSeconds = (now.getTime() - createdAt.getTime()) / 1000;

          // If account was created within the last 60 seconds, it's a new user
          const newUser = diffSeconds < 60;
          setIsNewUser(newUser);

          // Get the OAuth provider from app_metadata
          const oauthProvider = user.app_metadata?.provider || '';
          setProvider(oauthProvider.charAt(0).toUpperCase() + oauthProvider.slice(1));

          // Store email for potential resend
          setResendEmail(user.email || null);

          setStatus('success');

          // Longer delay for new users or email confirmation to read the message
          const delay = (newUser || callbackType === 'email_confirm') ? 2500 : 800;
          setTimeout(() => {
            navigate(next, { replace: true });
          }, delay);
        } else {
          setStatus('success');
          setTimeout(() => {
            navigate(next, { replace: true });
          }, 500);
        }
      });
    } else {
      // Auth completed but no session - something went wrong
      // This can happen if the tokens expired or were invalid
      setStatus('error');
      setError('Authentication failed. Please try again.');
    }
  }, [isLoading, isAuthenticated, navigate, next, callbackType]);

  const isEmailConfirmation = callbackType === 'email_confirm';
  const isOtpExpired = errorCode === 'otp_expired';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      {status === 'loading' && (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">
            {isEmailConfirmation ? 'Verifying your email...' : 'Completing sign in...'}
          </p>
        </>
      )}

      {status === 'success' && (
        <div className="text-center">
          <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center mb-4 mx-auto">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {isEmailConfirmation ? (
            <>
              <p className="text-foreground text-lg font-medium mb-1">Email verified!</p>
              <p className="text-muted-foreground text-sm mb-2">
                Your account is now active. Welcome to RankCLI!
              </p>
            </>
          ) : isNewUser ? (
            <>
              <p className="text-foreground text-lg font-medium mb-1">Account created!</p>
              <p className="text-muted-foreground text-sm mb-2">
                Welcome to RankCLI! You can now sign in with {provider}.
              </p>
            </>
          ) : (
            <p className="text-foreground font-medium">Welcome back!</p>
          )}
          <p className="text-muted-foreground text-sm mt-2">Redirecting to dashboard...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="text-center max-w-md">
          <div className="h-12 w-12 rounded-full bg-destructive flex items-center justify-center mb-4 mx-auto">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          {isOtpExpired ? (
            <>
              <p className="text-foreground font-medium mb-2">Verification link expired</p>
              <p className="text-muted-foreground text-sm mb-4">
                The email confirmation link has expired. Please request a new one.
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend verification email'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/login', { replace: true })}
                  className="w-full"
                >
                  Return to login
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-foreground font-medium mb-2">Sign in failed</p>
              <p className="text-muted-foreground text-sm mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => navigate('/login', { replace: true })}
              >
                Return to login
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
