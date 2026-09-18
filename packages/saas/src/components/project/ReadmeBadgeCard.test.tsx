import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockEq = vi.fn().mockResolvedValue({ error: null });
const mockUpdate = vi.fn(() => ({ eq: mockEq }));
vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: () => ({ update: mockUpdate }) },
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

import { ReadmeBadgeCard, badgeMarkdown } from './ReadmeBadgeCard';

describe('ReadmeBadgeCard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('is off until the owner opts in, then shows the badge and its Markdown', async () => {
    render(<ReadmeBadgeCard projectId="p-1" initiallyEnabled={false} />);
    expect(screen.queryByAltText('RankCLI SEO score badge')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('switch', { name: 'Publish the README badge' }));
    await waitFor(() => expect(screen.getByAltText('RankCLI SEO score badge')).toBeInTheDocument());
    expect(mockUpdate).toHaveBeenCalledWith({ badge_enabled: true });
    expect(mockEq).toHaveBeenCalledWith('id', 'p-1');
    expect(screen.getByText(badgeMarkdown('p-1'))).toBeInTheDocument();
  });

  it('builds a README link to rankcli.dev around the badge image', () => {
    expect(badgeMarkdown('p-1')).toMatch(/^\[!\[RankCLI SEO score\]\(.*\/functions\/v1\/badge\?project=p-1\)\]\(https:\/\/rankcli\.dev\)$/);
  });
});
