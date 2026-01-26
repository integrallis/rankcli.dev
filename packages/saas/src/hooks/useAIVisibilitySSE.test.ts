import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAIVisibilitySSE } from './useAIVisibilitySSE';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

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

describe('useAIVisibilitySSE', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    MockEventSource.reset();
    mockFetch.mockReset();
    global.EventSource = MockEventSource as unknown as typeof EventSource;
  });

  afterEach(() => {
    vi.useRealTimers();
    global.EventSource = originalEventSource;
  });

  it('starts in idle state', () => {
    const { result } = renderHook(() => useAIVisibilitySSE());

    expect(result.current.status).toBe('idle');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.providers).toEqual([]);
    expect(result.current.overallScore).toBe(0);
  });

  it('submits job and connects to SSE stream', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        jobId: 'aiv_test_123',
        status: 'pending',
      }),
    });

    const { result } = renderHook(() => useAIVisibilitySSE());

    await act(async () => {
      result.current.checkVisibility('https://example.com');
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/ai-visibility'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ url: 'https://example.com', brand: undefined }),
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.status).toBe('pending');
    expect(MockEventSource.instances.length).toBe(1);
    expect(MockEventSource.getLastInstance().url).toContain('/ai-visibility/stream/aiv_test_123');
  });

  it('updates status to running on job_started event', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobId: 'aiv_test_123' }),
    });

    const { result } = renderHook(() => useAIVisibilitySSE());

    await act(async () => {
      result.current.checkVisibility('https://example.com');
    });

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const eventSource = MockEventSource.getLastInstance();

    act(() => {
      eventSource.simulateMessage({ type: 'job_started', job_id: 'aiv_test_123' });
    });

    expect(result.current.status).toBe('running');
  });

  it('accumulates provider results as they stream in', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobId: 'aiv_test_123' }),
    });

    const onProviderResult = vi.fn();
    const { result } = renderHook(() => useAIVisibilitySSE({ onProviderResult }));

    await act(async () => {
      result.current.checkVisibility('https://example.com');
    });

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const eventSource = MockEventSource.getLastInstance();

    // Simulate first provider result
    act(() => {
      eventSource.simulateMessage({
        type: 'provider_result',
        job_id: 'aiv_test_123',
        provider: 'openai',
        provider_name: 'ChatGPT',
        mentioned: true,
        position: 2,
        sentiment: 'positive',
        context: 'Great tool for payments',
        progress: 25,
      });
    });

    expect(result.current.providers.length).toBe(1);
    expect(result.current.providers[0].provider).toBe('openai');
    expect(result.current.providers[0].mentioned).toBe(true);
    expect(result.current.providers[0].position).toBe(2);
    expect(result.current.progress).toBe(25);
    expect(onProviderResult).toHaveBeenCalledWith(expect.objectContaining({
      provider: 'openai',
      mentioned: true,
    }));

    // Simulate second provider result
    act(() => {
      eventSource.simulateMessage({
        type: 'provider_result',
        job_id: 'aiv_test_123',
        provider: 'anthropic',
        provider_name: 'Claude',
        mentioned: false,
        position: null,
        sentiment: null,
        context: null,
        progress: 50,
      });
    });

    expect(result.current.providers.length).toBe(2);
    expect(result.current.providers[1].provider).toBe('anthropic');
    expect(result.current.providers[1].mentioned).toBe(false);
    expect(result.current.progress).toBe(50);
  });

  it('calls onCompleted and updates state when job completes', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobId: 'aiv_test_123' }),
    });

    const onCompleted = vi.fn();
    const { result } = renderHook(() => useAIVisibilitySSE({ onCompleted }));

    await act(async () => {
      result.current.checkVisibility('https://example.com');
    });

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const eventSource = MockEventSource.getLastInstance();

    // Add some provider results first
    act(() => {
      eventSource.simulateMessage({
        type: 'provider_result',
        provider: 'openai',
        provider_name: 'ChatGPT',
        mentioned: true,
        position: 1,
        progress: 25,
      });
    });

    // Complete the job
    act(() => {
      eventSource.simulateMessage({
        type: 'job_completed',
        job_id: 'aiv_test_123',
        score: 75,
        progress: 100,
      });
    });

    expect(result.current.status).toBe('completed');
    expect(result.current.overallScore).toBe(75);
    expect(result.current.progress).toBe(100);
    expect(eventSource.readyState).toBe(2); // Closed
  });

  it('calls onFailed when job fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobId: 'aiv_test_123' }),
    });

    const onFailed = vi.fn();
    const { result } = renderHook(() => useAIVisibilitySSE({ onFailed }));

    await act(async () => {
      result.current.checkVisibility('https://example.com');
    });

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const eventSource = MockEventSource.getLastInstance();

    act(() => {
      eventSource.simulateMessage({
        type: 'job_failed',
        job_id: 'aiv_test_123',
        error: 'API rate limit exceeded',
      });
    });

    expect(result.current.status).toBe('failed');
    expect(result.current.error).toBe('API rate limit exceeded');
    expect(onFailed).toHaveBeenCalledWith('API rate limit exceeded');
    expect(eventSource.readyState).toBe(2); // Closed
  });

  it('handles fetch error gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Server error' }),
    });

    const onFailed = vi.fn();
    const { result } = renderHook(() => useAIVisibilitySSE({ onFailed }));

    await act(async () => {
      await result.current.checkVisibility('https://example.com');
      // Allow microtasks to complete
      await vi.advanceTimersByTimeAsync(10);
    });

    expect(result.current.status).toBe('failed');
    expect(result.current.error).toBe('Server error');
    expect(onFailed).toHaveBeenCalled();
    expect(MockEventSource.instances.length).toBe(0); // No SSE connection attempted
  });

  it('handles network error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const onFailed = vi.fn();
    const { result } = renderHook(() => useAIVisibilitySSE({ onFailed }));

    await act(async () => {
      await result.current.checkVisibility('https://example.com');
      // Allow microtasks to complete
      await vi.advanceTimersByTimeAsync(10);
    });

    expect(result.current.status).toBe('failed');
    expect(result.current.error).toBe('Network error');
    expect(onFailed).toHaveBeenCalledWith('Network error');
  });

  it('extracts brand from URL if not provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobId: 'aiv_test_123' }),
    });

    const { result } = renderHook(() => useAIVisibilitySSE());

    await act(async () => {
      result.current.checkVisibility('https://stripe.com');
    });

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    expect(result.current.brand).toBe('Stripe');
  });

  it('uses custom brand when provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobId: 'aiv_test_123' }),
    });

    const { result } = renderHook(() => useAIVisibilitySSE());

    await act(async () => {
      result.current.checkVisibility('https://example.com', 'My Custom Brand');
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ url: 'https://example.com', brand: 'My Custom Brand' }),
      })
    );
  });

  it('resets state when reset is called', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobId: 'aiv_test_123' }),
    });

    const { result } = renderHook(() => useAIVisibilitySSE());

    await act(async () => {
      result.current.checkVisibility('https://example.com');
    });

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const eventSource = MockEventSource.getLastInstance();

    act(() => {
      eventSource.simulateMessage({
        type: 'provider_result',
        provider: 'openai',
        provider_name: 'ChatGPT',
        mentioned: true,
        progress: 25,
      });
    });

    expect(result.current.providers.length).toBe(1);

    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.providers).toEqual([]);
    expect(result.current.progress).toBe(0);
    expect(eventSource.readyState).toBe(2); // Closed
  });

  it('handles heartbeat events without error', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobId: 'aiv_test_123' }),
    });

    const { result } = renderHook(() => useAIVisibilitySSE());

    await act(async () => {
      result.current.checkVisibility('https://example.com');
    });

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const eventSource = MockEventSource.getLastInstance();

    // Should not throw
    act(() => {
      eventSource.simulateMessage({ type: 'heartbeat' });
      eventSource.simulateMessage({ type: 'connected', job_id: 'aiv_test_123' });
    });

    expect(result.current.status).toBe('pending');
  });

  it('handles provider errors gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobId: 'aiv_test_123' }),
    });

    const { result } = renderHook(() => useAIVisibilitySSE());

    await act(async () => {
      result.current.checkVisibility('https://example.com');
    });

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const eventSource = MockEventSource.getLastInstance();

    // Simulate provider with error
    act(() => {
      eventSource.simulateMessage({
        type: 'provider_result',
        provider: 'anthropic',
        provider_name: 'Claude',
        mentioned: false,
        error: 'API key not configured',
        progress: 50,
      });
    });

    expect(result.current.providers.length).toBe(1);
    expect(result.current.providers[0].error).toBe('API key not configured');
  });

  it('sends late-connection results when connecting to existing job', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobId: 'aiv_test_123' }),
    });

    const { result } = renderHook(() => useAIVisibilitySSE());

    await act(async () => {
      result.current.checkVisibility('https://example.com');
    });

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const eventSource = MockEventSource.getLastInstance();

    // Simulate getting previous results on late connection (server-side catch-up)
    act(() => {
      eventSource.simulateMessage({
        type: 'provider_result',
        provider: 'openai',
        provider_name: 'ChatGPT',
        mentioned: true,
        position: 1,
        progress: 25,
      });
      eventSource.simulateMessage({
        type: 'provider_result',
        provider: 'anthropic',
        provider_name: 'Claude',
        mentioned: false,
        progress: 50,
      });
    });

    expect(result.current.providers.length).toBe(2);
    expect(result.current.progress).toBe(50);
  });

  it('handles malformed JSON gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobId: 'aiv_test_123' }),
    });

    const { result } = renderHook(() => useAIVisibilitySSE());

    await act(async () => {
      result.current.checkVisibility('https://example.com');
    });

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const eventSource = MockEventSource.getLastInstance();

    // Send malformed data
    act(() => {
      const event = new MessageEvent('message', { data: 'not valid json' });
      eventSource.onmessage?.(event);
    });

    expect(consoleSpy).toHaveBeenCalled();
    expect(result.current.status).toBe('pending'); // Still in pending state
    consoleSpy.mockRestore();
  });

  it('disconnects on unmount', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobId: 'aiv_test_123' }),
    });

    const { result, unmount } = renderHook(() => useAIVisibilitySSE());

    await act(async () => {
      result.current.checkVisibility('https://example.com');
    });

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const eventSource = MockEventSource.getLastInstance();
    expect(eventSource.readyState).toBe(1); // Open

    unmount();

    expect(eventSource.readyState).toBe(2); // Closed
  });

  it('reports isLoading correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jobId: 'aiv_test_123' }),
    });

    const { result } = renderHook(() => useAIVisibilitySSE());

    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      result.current.checkVisibility('https://example.com');
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    const eventSource = MockEventSource.getLastInstance();

    act(() => {
      eventSource.simulateMessage({ type: 'job_started' });
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      eventSource.simulateMessage({ type: 'job_completed', score: 50 });
    });

    expect(result.current.isLoading).toBe(false);
  });
});
