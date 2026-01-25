import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAuditSSE } from './useAuditSSE';

// Mock EventSource
class MockEventSource {
  static instances: MockEventSource[] = [];

  url: string;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  readyState: number = 0;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
    // Simulate connection opening
    setTimeout(() => {
      this.readyState = 1;
      this.onopen?.(new Event('open'));
    }, 0);
  }

  close() {
    this.readyState = 2;
  }

  // Helper to simulate receiving a message
  simulateMessage(data: object) {
    const event = new MessageEvent('message', {
      data: JSON.stringify(data),
    });
    this.onmessage?.(event);
  }

  // Helper to simulate an error
  simulateError() {
    this.onerror?.(new Event('error'));
  }

  static reset() {
    MockEventSource.instances = [];
  }

  static getLastInstance() {
    return MockEventSource.instances[MockEventSource.instances.length - 1];
  }
}

// Replace global EventSource
const originalEventSource = global.EventSource;

describe('useAuditSSE', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.useFakeTimers();
    MockEventSource.reset();
    global.EventSource = MockEventSource as unknown as typeof EventSource;
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    global.EventSource = originalEventSource;
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  it('does not connect when disabled', () => {
    renderHook(
      () => useAuditSSE({ auditId: 'test-123', enabled: false }),
      { wrapper }
    );

    expect(MockEventSource.instances.length).toBe(0);
  });

  it('does not connect when auditId is null', () => {
    renderHook(
      () => useAuditSSE({ auditId: null, enabled: true }),
      { wrapper }
    );

    expect(MockEventSource.instances.length).toBe(0);
  });

  it('connects to SSE when enabled with auditId', async () => {
    renderHook(
      () => useAuditSSE({ auditId: 'audit-123', enabled: true }),
      { wrapper }
    );

    expect(MockEventSource.instances.length).toBe(1);
    expect(MockEventSource.getLastInstance().url).toContain('/stream/audit-123');
  });

  it('calls onProgress when receiving progress event', async () => {
    const onProgress = vi.fn();

    renderHook(
      () => useAuditSSE({
        auditId: 'audit-123',
        enabled: true,
        onProgress,
      }),
      { wrapper }
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const eventSource = MockEventSource.getLastInstance();

    act(() => {
      eventSource.simulateMessage({
        type: 'job_progress',
        progress: 50,
        pages_completed: 2,
        pages_total: 4,
      });
    });

    expect(onProgress).toHaveBeenCalledWith('audit-123', 50, 2, 4);
  });

  it('calls onCompleted and disconnects when audit completes', async () => {
    const onCompleted = vi.fn();

    renderHook(
      () => useAuditSSE({
        auditId: 'audit-123',
        enabled: true,
        onCompleted,
      }),
      { wrapper }
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const eventSource = MockEventSource.getLastInstance();

    act(() => {
      eventSource.simulateMessage({
        type: 'job_completed',
        score: 85,
      });
    });

    expect(onCompleted).toHaveBeenCalledWith('audit-123', 85);
    expect(eventSource.readyState).toBe(2); // Closed
  });

  it('calls onFailed and disconnects when audit fails', async () => {
    const onFailed = vi.fn();

    renderHook(
      () => useAuditSSE({
        auditId: 'audit-123',
        enabled: true,
        onFailed,
      }),
      { wrapper }
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const eventSource = MockEventSource.getLastInstance();

    act(() => {
      eventSource.simulateMessage({
        type: 'job_failed',
        error: 'Network timeout',
      });
    });

    expect(onFailed).toHaveBeenCalledWith('audit-123', 'Network timeout');
    expect(eventSource.readyState).toBe(2); // Closed
  });

  it('attempts to reconnect on connection error', async () => {
    renderHook(
      () => useAuditSSE({ auditId: 'audit-123', enabled: true }),
      { wrapper }
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    expect(MockEventSource.instances.length).toBe(1);

    const eventSource = MockEventSource.getLastInstance();

    act(() => {
      eventSource.simulateError();
    });

    // Should attempt reconnect after 5 seconds
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    expect(MockEventSource.instances.length).toBe(2);
  });

  it('disconnects when auditId changes to null', async () => {
    const { rerender } = renderHook(
      ({ auditId }) => useAuditSSE({ auditId, enabled: true }),
      {
        wrapper,
        initialProps: { auditId: 'audit-123' as string | null },
      }
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const eventSource = MockEventSource.getLastInstance();
    expect(eventSource.readyState).toBe(1); // Open

    rerender({ auditId: null });

    expect(eventSource.readyState).toBe(2); // Closed
  });

  it('handles heartbeat events without error', async () => {
    const onCompleted = vi.fn();
    const onFailed = vi.fn();

    renderHook(
      () => useAuditSSE({
        auditId: 'audit-123',
        enabled: true,
        onCompleted,
        onFailed,
      }),
      { wrapper }
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const eventSource = MockEventSource.getLastInstance();

    // Should not throw or call callbacks
    act(() => {
      eventSource.simulateMessage({ type: 'heartbeat' });
      eventSource.simulateMessage({ type: 'connected' });
    });

    expect(onCompleted).not.toHaveBeenCalled();
    expect(onFailed).not.toHaveBeenCalled();
  });

  it('handles malformed JSON gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHook(
      () => useAuditSSE({ auditId: 'audit-123', enabled: true }),
      { wrapper }
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const eventSource = MockEventSource.getLastInstance();

    // Send malformed data directly
    act(() => {
      const event = new MessageEvent('message', { data: 'not valid json' });
      eventSource.onmessage?.(event);
    });

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
