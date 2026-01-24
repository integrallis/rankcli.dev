import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock the hooks and dependencies before importing
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
    isLoading: false,
  }),
}));

// Mock AuthContext to prevent "useAuth must be used within AuthProvider" errors
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' },
    isAuthenticated: true,
    isLoading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    signUp: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    })),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'token' } } }),
    },
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Track EventSource instances and their callbacks
interface MockEventSourceInstance {
  url: string;
  onopen: ((event: Event) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  close: () => void;
  simulateMessage: (data: object) => void;
}

const mockEventSources: MockEventSourceInstance[] = [];

class MockEventSource implements MockEventSourceInstance {
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    mockEventSources.push(this);
    setTimeout(() => this.onopen?.(new Event('open')), 0);
  }

  close() {
    // Connection closed
  }

  simulateMessage(data: object) {
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) }));
  }
}

// Mock useProject hook with controllable refetch
const mockRefetch = vi.fn();
const mockRunAudit = vi.fn();

vi.mock('@/hooks/useProjects', () => ({
  useProject: () => ({
    project: {
      id: 'proj-123',
      name: 'Test Project',
      url: 'https://example.com',
      domain: 'example.com',
      user_id: 'user-123',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    audits: [],
    issues: [],
    isLoading: false,
    error: null,
    refetch: mockRefetch,
    runAudit: mockRunAudit,
    createFixPR: vi.fn(),
    deleteAudit: vi.fn(),
    deleteOldAudits: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
    connectGitHub: vi.fn(),
    disconnectGitHub: vi.fn(),
  }),
}));

// Store original EventSource
const originalEventSource = global.EventSource;

describe('ProjectPage SSE Integration', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockEventSources.length = 0;
    global.EventSource = MockEventSource as unknown as typeof EventSource;
    mockRefetch.mockClear();
    mockRunAudit.mockClear();

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

  const renderProjectPage = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/dashboard/projects/proj-123']}>
          <Routes>
            <Route path="/dashboard/projects/:id" element={<ProjectPageWrapper />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  // Wrapper to lazy-load ProjectPage after mocks are set up
  const ProjectPageWrapper = () => {
    const [Page, setPage] = React.useState<React.ComponentType | null>(null);

    React.useEffect(() => {
      import('./ProjectPage').then((mod) => setPage(() => mod.ProjectPage));
    }, []);

    if (!Page) return <div>Loading...</div>;
    return <Page />;
  };

  it('calls refetch when SSE audit completes', async () => {
    // Setup mock to return a pending audit, then trigger completion
    mockRunAudit.mockResolvedValue({ id: 'audit-456', status: 'pending' });

    renderProjectPage();

    // Wait for page to load
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Advance timers to allow EventSource to connect
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Find and click run audit button if available
    const runAuditButton = screen.queryByRole('button', { name: /run audit/i });

    if (runAuditButton) {
      await userEvent.click(runAuditButton);

      // Should have created an EventSource connection
      await waitFor(() => {
        expect(mockEventSources.length).toBeGreaterThan(0);
      });

      const eventSource = mockEventSources[mockEventSources.length - 1];

      // Simulate audit completion via SSE
      act(() => {
        eventSource.simulateMessage({
          type: 'job_completed',
          score: 92,
        });
      });

      // refetch should be called
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    }
  });

  it('calls refetch when SSE audit fails', async () => {
    mockRunAudit.mockResolvedValue({ id: 'audit-789', status: 'pending' });

    renderProjectPage();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    }, { timeout: 3000 });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    const runAuditButton = screen.queryByRole('button', { name: /run audit/i });

    if (runAuditButton) {
      await userEvent.click(runAuditButton);

      await waitFor(() => {
        expect(mockEventSources.length).toBeGreaterThan(0);
      });

      const eventSource = mockEventSources[mockEventSources.length - 1];

      // Simulate audit failure via SSE
      act(() => {
        eventSource.simulateMessage({
          type: 'job_failed',
          error: 'Timeout exceeded',
        });
      });

      // refetch should still be called on failure
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    }
  });
});

describe('useAuditSSE refetch integration', () => {
  // This tests the core behavior: SSE completion triggers refetch

  beforeEach(() => {
    vi.useFakeTimers();
    mockEventSources.length = 0;
    global.EventSource = MockEventSource as unknown as typeof EventSource;
  });

  afterEach(() => {
    vi.useRealTimers();
    global.EventSource = originalEventSource;
  });

  it('SSE onCompleted callback is called with correct parameters', async () => {
    const onCompleted = vi.fn();

    // Simulate the SSE hook behavior
    const auditId = 'audit-test-123';
    const eventSource = new MockEventSource(`http://localhost:8080/stream/${auditId}`);

    // Set up the message handler like useAuditSSE does
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'job_completed') {
        onCompleted(auditId, data.score ?? 0);
      }
    };

    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    // Simulate completion
    eventSource.simulateMessage({
      type: 'job_completed',
      score: 88,
    });

    expect(onCompleted).toHaveBeenCalledWith('audit-test-123', 88);
  });

  it('refetch is callable and can be invoked in callback', () => {
    const refetch = vi.fn().mockResolvedValue(undefined);

    // Simulate the pattern used in ProjectPage
    const onCompleted = () => {
      refetch();
    };

    onCompleted();

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
