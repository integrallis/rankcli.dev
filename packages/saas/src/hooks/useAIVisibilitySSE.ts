import { useState, useEffect, useRef, useCallback } from 'react';

const WORKER_URL = import.meta.env.VITE_AUDIT_WORKER_URL || 'http://localhost:8080';

interface ProviderResult {
  provider: string;
  name: string;
  // not_checked: RankCLI has no key for this assistant. error: the call failed. Neither is
  // "not mentioned", and neither counts toward the score.
  status: 'checked' | 'not_checked' | 'error';
  mentioned: boolean;
  position: number | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  context: string | null;
  score: number;
  error?: string;
}

interface SseEvent {
  type: 'connected' | 'job_created' | 'job_started' | 'provider_result' | 'job_completed' | 'job_failed' | 'heartbeat';
  job_id?: string;
  provider?: string;
  provider_name?: string;
  status?: 'checked' | 'not_checked' | 'error';
  mentioned?: boolean;
  position?: number | null;
  sentiment?: string | null;
  context?: string | null;
  progress?: number;
  score?: number;
  error?: string;
}

interface AIVisibilityState {
  status: 'idle' | 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  providers: ProviderResult[];
  overallScore: number;
  error: string | null;
  brand: string | null;
}

interface UseAIVisibilitySSEOptions {
  onProviderResult?: (result: ProviderResult) => void;
  onCompleted?: (score: number, providers: ProviderResult[]) => void;
  onFailed?: (error: string) => void;
}

export function useAIVisibilitySSE(options: UseAIVisibilitySSEOptions = {}) {
  const { onProviderResult, onCompleted, onFailed } = options;

  const [state, setState] = useState<AIVisibilityState>({
    status: 'idle',
    progress: 0,
    providers: [],
    overallScore: 0,
    error: null,
    brand: null,
  });

  const eventSourceRef = useRef<EventSource | null>(null);
  const jobIdRef = useRef<string | null>(null);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    jobIdRef.current = null;
  }, []);

  const connectToStream = useCallback((jobId: string) => {
    // Close existing connection
    disconnect();

    jobIdRef.current = jobId;

    const url = `${WORKER_URL}/ai-visibility/stream/${jobId}`;
    console.log('Connecting to AI visibility SSE:', url);
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('AI visibility SSE connection established for job:', jobId);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SseEvent = JSON.parse(event.data);
        console.log('AI visibility SSE event:', data);

        switch (data.type) {
          case 'connected':
            // Connection confirmed
            break;

          case 'job_started':
            setState(prev => ({
              ...prev,
              status: 'running',
            }));
            break;

          case 'provider_result':
            if (data.provider && data.provider_name) {
              const result: ProviderResult = {
                provider: data.provider,
                name: data.provider_name,
                status: data.status ?? (data.error ? 'error' : 'checked'),
                mentioned: data.mentioned ?? false,
                position: data.position ?? null,
                sentiment: (data.sentiment as ProviderResult['sentiment']) ?? null,
                context: data.context ?? null,
                score: 0,
                error: data.error,
              };

              setState(prev => ({
                ...prev,
                progress: data.progress ?? prev.progress,
                providers: [...prev.providers, result],
              }));

              onProviderResult?.(result);
            }
            break;

          case 'job_completed':
            setState(prev => ({
              ...prev,
              status: 'completed',
              progress: 100,
              overallScore: data.score ?? 0,
            }));

            // Get final providers from state
            setState(prev => {
              onCompleted?.(data.score ?? 0, prev.providers);
              return prev;
            });

            // Disconnect after completion
            disconnect();
            break;

          case 'job_failed':
            setState(prev => ({
              ...prev,
              status: 'failed',
              error: data.error ?? 'Unknown error',
            }));

            onFailed?.(data.error ?? 'Unknown error');

            // Disconnect after failure
            disconnect();
            break;

          case 'heartbeat':
            // Keep-alive, no action needed
            break;
        }
      } catch (e) {
        console.error('Failed to parse AI visibility SSE event:', e);
      }
    };

    eventSource.onerror = (error) => {
      console.error('AI visibility SSE connection error:', error);
      eventSource.close();
      eventSourceRef.current = null;

      // Don't auto-reconnect for AI visibility (it's a one-shot check)
      // User can trigger a new check if needed
    };
  }, [disconnect, onProviderResult, onCompleted, onFailed]);

  const checkVisibility = useCallback(async (url: string, brand?: string) => {
    // Reset state
    setState({
      status: 'pending',
      progress: 0,
      providers: [],
      overallScore: 0,
      error: null,
      brand: null,
    });

    try {
      // Submit job to worker
      const response = await fetch(`${WORKER_URL}/ai-visibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, brand }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const { jobId, status, message } = await response.json();
      console.log('AI visibility job submitted:', { jobId, status, message });

      // Extract brand from response or URL
      let extractedBrand = brand;
      if (!extractedBrand) {
        try {
          const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
          extractedBrand = parsed.hostname.replace(/^www\./, '').split('.')[0];
          extractedBrand = extractedBrand.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        } catch {
          extractedBrand = url;
        }
      }

      setState(prev => ({
        ...prev,
        brand: extractedBrand || null,
      }));

      // Connect to SSE stream
      connectToStream(jobId);

    } catch (err) {
      console.error('Failed to submit AI visibility check:', err);
      setState(prev => ({
        ...prev,
        status: 'failed',
        error: err instanceof Error ? err.message : 'Failed to submit check',
      }));
      onFailed?.(err instanceof Error ? err.message : 'Failed to submit check');
    }
  }, [connectToStream, onFailed]);

  const reset = useCallback(() => {
    disconnect();
    setState({
      status: 'idle',
      progress: 0,
      providers: [],
      overallScore: 0,
      error: null,
      brand: null,
    });
  }, [disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    checkVisibility,
    reset,
    isConnected: !!eventSourceRef.current,
    isLoading: state.status === 'pending' || state.status === 'running',
  };
}
