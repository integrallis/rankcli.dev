import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

// One key per provider: the list shows every connected key, and removing one sends that
// provider to delete-ai-key.
const storedKeys = [
  { provider: 'openrouter', base_url: null, model: null, verified_at: '2026-09-18T00:00:00Z' },
  { provider: 'anthropic', base_url: null, model: 'claude-haiku-4.5', verified_at: null },
];

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: () => ({
      select: () => ({ eq: () => Promise.resolve({ data: storedKeys, error: null }) }),
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: 'test-token' } } }),
    },
  },
}));

vi.mock('@/contexts/AuthContext', () => {
  const auth = { user: { id: 'user-1' } };
  return { useAuth: vi.fn(() => auth) };
});

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { toast } from 'sonner';
import { AIProviderSettings } from './AIProviderSettings';

describe('AIProviderSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) });
  });

  it('lists every connected provider key', async () => {
    render(<AIProviderSettings />);
    await waitFor(() => expect(screen.getByLabelText('Disconnect openrouter')).toBeInTheDocument());
    expect(screen.getByLabelText('Disconnect anthropic')).toBeInTheDocument();
    expect(screen.getByText('Model: claude-haiku-4.5')).toBeInTheDocument();
  });

  it('disconnects only the provider clicked', async () => {
    render(<AIProviderSettings />);
    const remove = await screen.findByLabelText('Disconnect anthropic');
    fireEvent.click(remove);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const [url, init] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toContain('/functions/v1/delete-ai-key');
    expect(JSON.parse(init.body)).toEqual({ provider: 'anthropic' });
    await waitFor(() => expect(screen.queryByLabelText('Disconnect anthropic')).not.toBeInTheDocument());
    expect(screen.getByLabelText('Disconnect openrouter')).toBeInTheDocument();
  });

  it('requires a model for providers without a stable default', async () => {
    render(<AIProviderSettings />);
    await screen.findByLabelText('Disconnect openrouter');
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'together' } });
    fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'tg-key' } });
    fireEvent.click(screen.getByRole('button', { name: /connect & verify/i }));
    expect(toast.error).toHaveBeenCalledWith('Together AI needs a model name');
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
