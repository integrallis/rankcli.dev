import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { from: vi.fn() },
}));

// A stable user object: useProjects refetches whenever `user` changes identity.
const auth = { user: { id: 'test-user-id' } };
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => auth,
}));

import { supabase } from '@/integrations/supabase/client';
import { useProjects } from './useProjects';

// What PostgREST returns when enforce_project_site_limit (migration 20260919113000) refuses
// the insert.
const SITE_LIMIT_ERROR = {
  code: 'P0001',
  details: null,
  hint: 'site_limit_reached',
  message: 'Site limit reached: your Free plan includes 1 active site. Remove a site or upgrade your plan to add another.',
};

function mockProjectsTable(insertError: unknown) {
  const list = { eq: () => list, order: () => Promise.resolve({ data: [], error: null }) };
  vi.mocked(supabase.from).mockReturnValue({
    select: () => list,
    insert: () => ({
      select: () => ({ single: () => Promise.resolve({ data: null, error: insertError }) }),
    }),
  } as never);
}

describe('useProjects.createProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the database's site-limit message", async () => {
    mockProjectsTable(SITE_LIMIT_ERROR);
    const { result } = renderHook(() => useProjects());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let thrown: unknown;
    await act(async () => {
      await result.current.createProject({ name: 'Second', url: 'https://second.example' }).catch((e) => {
        thrown = e;
      });
    });

    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as Error).message).toBe(SITE_LIMIT_ERROR.message);
    expect(result.current.error).toBe(SITE_LIMIT_ERROR.message);
  });
});
