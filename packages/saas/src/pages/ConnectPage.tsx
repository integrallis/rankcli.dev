import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, Terminal, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

type ConnectState = 'loading' | 'confirm' | 'approving' | 'success' | 'denied' | 'error';

// Anyone can start a connect session and send its link to someone else, so
// opening this page grants nothing. It shows the session's code - the same one
// `rankcli login` or the rankcli_connect tool printed - and only the Approve
// button creates the API key the waiting CLI/MCP process picks up.
export function ConnectPage() {
  const [searchParams] = useSearchParams();
  const connectId = searchParams.get('id');
  const { session } = useAuth();
  const [state, setState] = useState<ConnectState>('loading');
  const [error, setError] = useState('');
  const [userCode, setUserCode] = useState('');
  const described = useRef(false);

  const callClaim = async (body: Record<string, unknown>) => {
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mcp-connect-claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ connectId, ...body }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || 'Failed to connect');
    return data;
  };

  useEffect(() => {
    if (described.current) return;
    if (!connectId) {
      setState('error');
      setError('Missing connection id. Run the connect command again in your AI assistant.');
      return;
    }
    if (!session) return;
    described.current = true;

    callClaim({ action: 'describe' })
      .then((data) => {
        setUserCode(data.userCode);
        setState('confirm');
      })
      .catch((err) => {
        setState('error');
        setError(err instanceof Error ? err.message : 'Failed to connect');
      });
  }, [connectId, session]);

  const approve = async () => {
    setState('approving');
    try {
      await callClaim({ action: 'approve', userCode });
      setState('success');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Failed to connect');
    }
  };

  const deny = async () => {
    try {
      await callClaim({ action: 'deny' });
    } catch {
      // Nothing was granted either way; the session expires on its own.
    }
    setState('denied');
  };

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
            {(state === 'loading' || state === 'approving') && (
              <>
                <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2 text-primary" />
                <CardTitle>{state === 'loading' ? 'Loading...' : 'Connecting...'}</CardTitle>
                <CardDescription>Linking your AI assistant to your RankCLI account.</CardDescription>
              </>
            )}
            {state === 'confirm' && (
              <>
                <ShieldAlert className="h-10 w-10 mx-auto mb-2 text-primary" />
                <CardTitle>Approve this connection?</CardTitle>
                <CardDescription>
                  A RankCLI command or AI assistant is asking for an API key for {session?.user.email}.
                  Approve only if you started it and it shows this code:
                </CardDescription>
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
            {state === 'denied' && (
              <>
                <XCircle className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <CardTitle>Connection denied</CardTitle>
                <CardDescription>No API key was created. You can close this window.</CardDescription>
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
          {state === 'confirm' && (
            <CardContent className="text-center space-y-6">
              <p className="font-mono text-3xl font-semibold tracking-widest">{userCode}</p>
              <p className="text-sm text-muted-foreground">
                If someone sent you this link, or your terminal shows a different code, deny it.
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={deny}>
                  Deny
                </Button>
                <Button onClick={approve}>Approve</Button>
              </div>
            </CardContent>
          )}
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
