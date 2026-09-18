import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { formatLocalDate, parseNextAllowedAt } from '@/lib/date-utils';

const WORKER_URL = import.meta.env.VITE_AUDIT_WORKER_URL || 'http://localhost:8080';

interface SseEvent {
  type: 'connected' | 'job_created' | 'job_started' | 'job_progress' | 'job_completed' | 'job_failed' | 'heartbeat';
  job_id?: string;
  audit_id?: string;
  progress?: number;
  pages_completed?: number;
  pages_total?: number;
  score?: number;
  error?: string;
}

interface UseAuditSSEOptions {
  auditId: string | null;
  // The worker machine running this audit (from start-deep-audit). The worker runs on
  // several machines with jobs in memory; this routes the stream to the right one.
  instance?: string | null;
  enabled?: boolean;
  onCompleted?: (auditId: string, score: number) => void;
  onFailed?: (auditId: string, error: string) => void;
  onProgress?: (auditId: string, progress: number, pagesCompleted: number, pagesTotal: number) => void;
}

export function useAuditSSE(options: UseAuditSSEOptions) {
  const { auditId, instance, enabled = true, onCompleted, onFailed, onProgress } = options;
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (!auditId) return;

    // Close existing connection
    disconnect();

    // Create SSE connection
    const url = `${WORKER_URL}/stream/${auditId}${instance ? `?instance=${encodeURIComponent(instance)}` : ''}`;
    console.log('Connecting to SSE:', url);
    const eventSource = new EventSource(url);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE connection established for audit:', auditId);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SseEvent = JSON.parse(event.data);
        console.log('SSE event:', data);

        switch (data.type) {
          case 'connected':
            // Connection confirmed
            break;

          case 'job_started':
            // Invalidate to show running status
            queryClient.invalidateQueries({ queryKey: ['project'] });
            break;

          case 'job_progress':
            if (data.progress !== undefined && data.pages_completed !== undefined && data.pages_total !== undefined) {
              onProgress?.(auditId, data.progress, data.pages_completed, data.pages_total);
            }
            break;

          case 'job_completed':
            // Invalidate queries to refresh the data
            queryClient.invalidateQueries({ queryKey: ['project'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });

            toast.success('Audit complete!', {
              description: `Score: ${data.score ?? 'N/A'}`,
            });

            onCompleted?.(auditId, data.score ?? 0);

            // Disconnect after completion
            disconnect();
            break;

          case 'job_failed':
            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['project'] });

            // Format schedule limit errors with human-readable dates
            let errorMessage = data.error ?? 'Unknown error';
            const nextAllowedAt = parseNextAllowedAt(data.error);
            if (nextAllowedAt && data.error?.includes('Schedule limit')) {
              errorMessage = `Schedule limit reached. Next audit available: ${formatLocalDate(nextAllowedAt)}`;
            }

            toast.error('Audit failed', {
              description: errorMessage,
            });

            onFailed?.(auditId, data.error ?? 'Unknown error');

            // Disconnect after failure
            disconnect();
            break;

          case 'heartbeat':
            // Keep-alive, no action needed
            break;
        }
      } catch (e) {
        console.error('Failed to parse SSE event:', e);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
      eventSourceRef.current = null;

      // Attempt to reconnect after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    };
  }, [auditId, instance, queryClient, onCompleted, onFailed, onProgress, disconnect]);

  useEffect(() => {
    if (enabled && auditId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, auditId, connect, disconnect]);

  return {
    isConnected: !!eventSourceRef.current,
    disconnect,
    reconnect: connect,
  };
}
