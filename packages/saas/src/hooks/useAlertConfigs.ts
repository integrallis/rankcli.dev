import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AlertChannel = 'slack' | 'discord';

export interface AlertConfig {
  id: string;
  user_id: string;
  project_id: string | null;
  channel: AlertChannel;
  webhook_url: string;
  on_error: boolean;
  on_score_drop: boolean;
  on_weekly_report: boolean;
  on_pr_created: boolean;
  score_drop_threshold: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface NewAlertConfig {
  channel: AlertChannel;
  webhook_url: string;
  on_error: boolean;
  on_score_drop: boolean;
  on_weekly_report: boolean;
  on_pr_created: boolean;
  score_drop_threshold: number;
}

interface UseAlertConfigsReturn {
  configs: AlertConfig[];
  isLoading: boolean;
  error: string | null;
  addConfig: (config: NewAlertConfig) => Promise<boolean>;
  updateConfig: (id: string, updates: Partial<AlertConfig>) => Promise<boolean>;
  deleteConfig: (id: string) => Promise<boolean>;
  testWebhook: (channel: AlertChannel, webhookUrl: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

/**
 * Validates a webhook URL
 */
function isValidWebhookUrl(url: string): boolean {
  if (!url.startsWith('https://')) {
    return false;
  }
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Formats a Slack test message
 */
function formatSlackTestMessage(): object {
  return {
    text: '🔔 RankCLI Alert Test',
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🔔 RankCLI Alert Test',
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'This is a test message from RankCLI. If you see this, your webhook is configured correctly!',
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '🤖 Sent by RankCLI',
          },
        ],
      },
    ],
  };
}

/**
 * Formats a Discord test message
 */
function formatDiscordTestMessage(): object {
  return {
    embeds: [
      {
        title: '🔔 RankCLI Alert Test',
        description: 'This is a test message from RankCLI. If you see this, your webhook is configured correctly!',
        color: 0x2563eb,
        footer: {
          text: '🤖 Sent by RankCLI',
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };
}

/**
 * Hook for managing alert configurations
 */
export function useAlertConfigs(projectId?: string): UseAlertConfigsReturn {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<AlertConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch alert configs from database
   */
  const fetchConfigs = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('alert_configs')
        .select('*')
        .eq('user_id', user.id);

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setConfigs([]);
      } else {
        setConfigs(data || []);
      }
    } catch (err) {
      setError((err as Error).message);
      setConfigs([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, projectId]);

  /**
   * Add a new alert config
   */
  const addConfig = useCallback(async (config: NewAlertConfig): Promise<boolean> => {
    if (!user) {
      setError('Not authenticated');
      return false;
    }

    // Validate webhook URL
    if (!isValidWebhookUrl(config.webhook_url)) {
      setError('Invalid webhook URL. Must start with https://');
      return false;
    }

    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('alert_configs')
        .insert({
          user_id: user.id,
          project_id: projectId || null,
          channel: config.channel,
          webhook_url: config.webhook_url,
          on_error: config.on_error,
          on_score_drop: config.on_score_drop,
          on_weekly_report: config.on_weekly_report,
          on_pr_created: config.on_pr_created,
          score_drop_threshold: config.score_drop_threshold,
          enabled: true,
        })
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        return false;
      }

      // Add to local state
      if (data) {
        setConfigs((prev) => [data, ...prev]);
      }

      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }, [user, projectId]);

  /**
   * Update an existing config
   */
  const updateConfig = useCallback(async (
    id: string,
    updates: Partial<AlertConfig>
  ): Promise<boolean> => {
    if (!user) {
      setError('Not authenticated');
      return false;
    }

    // Validate webhook URL if provided
    if (updates.webhook_url && !isValidWebhookUrl(updates.webhook_url)) {
      setError('Invalid webhook URL. Must start with https://');
      return false;
    }

    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('alert_configs')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        setError(updateError.message);
        return false;
      }

      // Update local state
      setConfigs((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
      );

      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }, [user]);

  /**
   * Delete a config
   */
  const deleteConfig = useCallback(async (id: string): Promise<boolean> => {
    if (!user) {
      setError('Not authenticated');
      return false;
    }

    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('alert_configs')
        .delete()
        .eq('id', id);

      if (deleteError) {
        setError(deleteError.message);
        return false;
      }

      // Remove from local state
      setConfigs((prev) => prev.filter((c) => c.id !== id));

      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }, [user]);

  /**
   * Test a webhook by sending a test message
   */
  const testWebhook = useCallback(async (
    channel: AlertChannel,
    webhookUrl: string
  ): Promise<boolean> => {
    if (!isValidWebhookUrl(webhookUrl)) {
      setError('Invalid webhook URL');
      return false;
    }

    const payload = channel === 'slack'
      ? formatSlackTestMessage()
      : formatDiscordTestMessage();

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError(`Webhook test failed with status ${response.status}`);
        return false;
      }

      return true;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }, []);

  // Fetch configs on mount and when dependencies change
  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return {
    configs,
    isLoading,
    error,
    addConfig,
    updateConfig,
    deleteConfig,
    testWebhook,
    refetch: fetchConfigs,
  };
}
