import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Mock Supabase client
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockInvoke = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    }),
    functions: { invoke: (...args: unknown[]) => mockInvoke(...args) },
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      }),
    },
  },
}));

// Mock useAuth - one stable object, as the real context keeps `user` in state.
// A fresh object per render changes the hook's [user] deps every render and
// loops the fetch effect until the worker runs out of heap.
vi.mock('@/contexts/AuthContext', () => {
  const auth = { user: { id: 'test-user-id' } };
  return { useAuth: vi.fn(() => auth) };
});

// Import after mocks
import { useAlertConfigs, type AlertConfig } from './useAlertConfigs';

describe('useAlertConfigs', () => {
  const mockConfigs: AlertConfig[] = [
    {
      id: 'config-1',
      user_id: 'test-user-id',
      project_id: 'project-1',
      channel: 'slack',
      webhook_url: 'https://hooks.slack.com/test',
      on_error: true,
      on_score_drop: true,
      on_weekly_report: false,
      on_pr_created: true,
      score_drop_threshold: 10,
      enabled: true,
      created_at: '2026-02-26T00:00:00Z',
      updated_at: '2026-02-26T00:00:00Z',
    },
    {
      id: 'config-2',
      user_id: 'test-user-id',
      project_id: 'project-1',
      channel: 'discord',
      webhook_url: 'https://discord.com/api/webhooks/test',
      on_error: true,
      on_score_drop: false,
      on_weekly_report: true,
      on_pr_created: false,
      score_drop_threshold: 15,
      enabled: true,
      created_at: '2026-02-26T00:00:00Z',
      updated_at: '2026-02-26T00:00:00Z',
    },
  ];

  // select().eq(user_id).eq(project_id).order() - eq chains any number of times
  const selectChain = (result: { data: unknown; error: unknown }) => {
    const chain = { eq: vi.fn(), order: vi.fn().mockResolvedValue(result) };
    chain.eq.mockReturnValue(chain);
    return chain;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockSelect.mockReturnValue(selectChain({ data: mockConfigs, error: null }));
    
    mockInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: mockConfigs[0], error: null }),
      }),
    });
    
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: mockConfigs[0], error: null }),
    });
    
    mockDelete.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
  });

  describe('fetchConfigs', () => {
    it('should fetch alert configs for a project', async () => {
      const { result } = renderHook(() => useAlertConfigs('project-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.configs).toHaveLength(2);
      expect(result.current.configs[0].channel).toBe('slack');
      expect(result.current.configs[1].channel).toBe('discord');
    });

    it('should handle fetch errors gracefully', async () => {
      mockSelect.mockReturnValue(selectChain({ data: null, error: { message: 'Database error' } }));

      const { result } = renderHook(() => useAlertConfigs('project-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Database error');
      expect(result.current.configs).toHaveLength(0);
    });
  });

  describe('addConfig', () => {
    it('should add a new alert config', async () => {
      const { result } = renderHook(() => useAlertConfigs('project-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newConfig = {
        channel: 'slack' as const,
        webhook_url: 'https://hooks.slack.com/new',
        on_error: true,
        on_score_drop: true,
        on_weekly_report: false,
        on_pr_created: true,
        score_drop_threshold: 10,
      };

      await act(async () => {
        await result.current.addConfig(newConfig);
      });

      expect(mockInsert).toHaveBeenCalled();
    });

    it('should validate webhook URL format', async () => {
      const { result } = renderHook(() => useAlertConfigs('project-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const invalidConfig = {
        channel: 'slack' as const,
        webhook_url: 'not-a-valid-url',
        on_error: true,
        on_score_drop: false,
        on_weekly_report: false,
        on_pr_created: false,
        score_drop_threshold: 10,
      };

      await act(async () => {
        const success = await result.current.addConfig(invalidConfig);
        expect(success).toBe(false);
      });

      expect(result.current.error).toContain('Invalid webhook URL');
    });
  });

  describe('updateConfig', () => {
    it('should update an existing config', async () => {
      const { result } = renderHook(() => useAlertConfigs('project-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateConfig('config-1', { enabled: false });
      });

      expect(mockUpdate).toHaveBeenCalled();
    });
  });

  describe('deleteConfig', () => {
    it('should delete a config', async () => {
      const { result } = renderHook(() => useAlertConfigs('project-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteConfig('config-1');
      });

      expect(mockDelete).toHaveBeenCalled();
    });
  });

  describe('testWebhook', () => {
    // Tests go through the project-alerts edge function: a browser can't post to a Slack
    // webhook (no CORS headers), so the old direct fetch always failed for Slack.
    it('sends the test through project-alerts', async () => {
      mockInvoke.mockResolvedValue({ data: { sent: true, status: 200, alertsActive: true }, error: null });

      const { result } = renderHook(() => useAlertConfigs('project-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        const success = await result.current.testWebhook('slack', 'https://hooks.slack.com/services/T/B/X');
        expect(success).toBe(true);
      });

      expect(mockInvoke).toHaveBeenCalledWith('project-alerts', {
        body: { event: 'test', channel: 'slack', webhookUrl: 'https://hooks.slack.com/services/T/B/X' },
      });
      expect(result.current.alertsActive).toBe(true);
    });

    it('reports a webhook that rejected the test', async () => {
      mockInvoke.mockResolvedValue({ data: { sent: false, status: 404, alertsActive: true }, error: null });

      const { result } = renderHook(() => useAlertConfigs('project-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        const success = await result.current.testWebhook('slack', 'https://hooks.slack.com/services/T/B/X');
        expect(success).toBe(false);
      });
      expect(result.current.error).toBe('Webhook test failed with status 404');
    });

    it('says when the webhook works but the plan does not send alerts', async () => {
      mockInvoke.mockResolvedValue({ data: { sent: true, status: 200, alertsActive: false }, error: null });

      const { result } = renderHook(() => useAlertConfigs('project-1'));
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        expect(await result.current.testWebhook('discord', 'https://discord.com/api/webhooks/1/x')).toBe(true);
      });
      expect(result.current.alertsActive).toBe(false);
    });
  });
});
