import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

// Mock Supabase client
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      }),
    },
  },
}));

// Mock useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id' },
  })),
}));

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

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    mockSelect.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: mockConfigs, error: null }),
      }),
    });
    
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
      mockSelect.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
        }),
      });

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
    it('should send a test message to webhook', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      const { result } = renderHook(() => useAlertConfigs('project-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const success = await result.current.testWebhook('slack', 'https://hooks.slack.com/test');
        expect(success).toBe(true);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/test',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should handle webhook test failure', async () => {
      global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });

      const { result } = renderHook(() => useAlertConfigs('project-1'));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const success = await result.current.testWebhook('slack', 'https://hooks.slack.com/test');
        expect(success).toBe(false);
      });
    });
  });
});
