import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, Terminal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

type ClaimState = 'claiming' | 'success' | 'error';

export function ConnectPage() {
  const [searchParams] = useSearchParams();
  const connectId = searchParams.get('id');
  const { session } = useAuth();
  const [state, setState] = useState<ClaimState>('claiming');
  const [error, setError] = useState('');
  const claimed = useRef(false);

  useEffect(() => {
    if (claimed.current) return;
    if (!connectId) {
      setState('error');
      setError('Missing connection id. Run the connect command again in your AI assistant.');
      return;
    }
    if (!session) return;
    claimed.current = true;

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mcp-connect-claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ connectId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || 'Failed to connect');
        setState('success');
      })
      .catch((err) => {
        setState('error');
        setError(err instanceof Error ? err.message : 'Failed to connect');
      });
  }, [connectId, session]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <Terminal className="h-8 w-8 text-primary" />
            <span className="font-semibold text-xl">RankCLI</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            {state === 'claiming' && (
              <>
                <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2 text-primary" />
                <CardTitle>Connecting...</CardTitle>
                <CardDescription>Linking your AI assistant to your RankCLI account.</CardDescription>
              </>
            )}
            {state === 'success' && (
              <>
                <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-500" />
                <CardTitle>Connected as {session?.user.email}</CardTitle>
                <CardDescription>
                  You can close this window and return to your AI assistant - it now has access to your
                  dashboard, GitHub auto-fix PRs, and audit history.
                </CardDescription>
              </>
            )}
            {state === 'error' && (
              <>
                <XCircle className="h-10 w-10 mx-auto mb-2 text-destructive" />
                <CardTitle>Couldn't connect</CardTitle>
                <CardDescription>{error}</CardDescription>
              </>
            )}
          </CardHeader>
          {state === 'success' && (
            <CardContent className="text-center">
              <Link to="/dashboard" className="text-sm text-primary hover:underline">
                Or go to your dashboard now →
              </Link>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
