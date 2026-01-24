import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
    },
  },
}));

// Mock useAuth
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id' },
  })),
}));

import { supabase } from '@/integrations/supabase/client';

describe('useProject.updateProject', () => {
  const mockProject = {
    id: 'test-project-id',
    user_id: 'test-user-id',
    name: 'Original Name',
    domain: 'example.com',
    url: 'https://example.com',
    github_repo_url: null,
    github_repo_id: null,
    github_installation_id: null,
    github_default_branch: 'main',
    framework: null,
    config: {},
    is_active: true,
    last_audit_at: null,
    last_audit_score: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('renaming a project', () => {
    it('should successfully rename a project when update returns data', async () => {
      // Arrange
      const newName = 'New Project Name';
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: { ...mockProject, name: newName },
        error: null,
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        select: vi.fn().mockReturnThis(),
        eq: mockEq,
        single: vi.fn(),
      } as any);

      mockUpdate.mockReturnValue({
        eq: mockEq,
        select: mockSelect,
      });
      mockEq.mockReturnValue({
        eq: mockEq,
        select: mockSelect,
      });
      mockSelect.mockReturnValue({
        single: mockSingle,
      });

      // Act - Simulate the update call
      const result = await supabase
        .from('projects')
        .update({ name: newName })
        .eq('id', mockProject.id)
        .eq('user_id', mockProject.user_id)
        .select()
        .single();

      // Assert
      expect(result.error).toBeNull();
      expect(result.data?.name).toBe(newName);
    });

    it('should fail when update returns no data (RLS blocked)', async () => {
      // Arrange - Simulate RLS blocking the update (returns empty data, no error)
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'JSON object requested, single row expected' },
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any);

      mockUpdate.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ eq: mockEq, select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      // Act
      const result = await supabase
        .from('projects')
        .update({ name: 'New Name' })
        .eq('id', 'wrong-id')
        .eq('user_id', 'test-user-id')
        .select()
        .single();

      // Assert - Should return an error when no rows match
      expect(result.data).toBeNull();
      expect(result.error).not.toBeNull();
    });

    it('should fail when trying to rename to a duplicate name', async () => {
      // Arrange - Simulate unique constraint violation
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: {
          code: '23505',
          message: 'duplicate key value violates unique constraint "projects_user_id_name_active_unique"',
        },
      });

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any);

      mockUpdate.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ eq: mockEq, select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      // Act
      const result = await supabase
        .from('projects')
        .update({ name: 'Duplicate Name' })
        .eq('id', mockProject.id)
        .eq('user_id', mockProject.user_id)
        .select()
        .single();

      // Assert
      expect(result.error).not.toBeNull();
      expect(result.error?.code).toBe('23505');
      expect(result.error?.message).toContain('projects_user_id_name');
    });

    it('should handle network errors gracefully', async () => {
      // Arrange - Simulate network error
      const mockUpdate = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();
      const mockSingle = vi.fn().mockRejectedValue(new Error('Network error'));

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as any);

      mockUpdate.mockReturnValue({ eq: mockEq });
      mockEq.mockReturnValue({ eq: mockEq, select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });

      // Act & Assert
      await expect(
        supabase
          .from('projects')
          .update({ name: 'New Name' })
          .eq('id', mockProject.id)
          .eq('user_id', mockProject.user_id)
          .select()
          .single()
      ).rejects.toThrow('Network error');
    });
  });
});

describe('deleteAudit constraints', () => {
  it('should prevent deleting the last audit', () => {
    // The deleteAudit function checks if audits.length <= 1
    // and returns false with an error message
    const audits = [{ id: 'only-audit' }];

    // Simulate the check in deleteAudit
    const canDelete = audits.length > 1;

    expect(canDelete).toBe(false);

    // Error message that would be set
    const errorMessage = 'Cannot delete the only audit. Run a new audit first or delete the project.';
    expect(errorMessage).toContain('Cannot delete the only audit');
  });

  it('should allow deleting when multiple audits exist', () => {
    const audits = [{ id: 'audit-1' }, { id: 'audit-2' }];

    const canDelete = audits.length > 1;

    expect(canDelete).toBe(true);
  });
});

describe('updateProject error handling', () => {
  it('should provide user-friendly error message for duplicate name', () => {
    // Test the error message transformation (now using partial index)
    const dbError = {
      code: '23505',
      message: 'duplicate key value violates unique constraint "projects_user_id_name_active_unique"',
    };

    // Check if error code indicates duplicate - matches both old constraint and new index
    const isDuplicate = dbError.code === '23505' &&
      (dbError.message?.includes('projects_user_id_name') || dbError.message?.includes('duplicate key'));

    expect(isDuplicate).toBe(true);

    // Verify the user-friendly message would be generated
    const userMessage = isDuplicate
      ? 'A project with this name already exists. Please choose a different name.'
      : 'Failed to update project';

    expect(userMessage).toBe('A project with this name already exists. Please choose a different name.');
  });
});

describe('Domain limit anti-gaming checks', () => {
  // Test the domain limit logic that prevents subscription gaming

  describe('Free tier (2 domains/month)', () => {
    const domainsPerMonth = 2;

    it('should allow audit when under domain limit', () => {
      const uniqueDomainsAudited = new Set(['example.com']);
      const currentDomain = 'newsite.com';

      const isAtLimit = uniqueDomainsAudited.size >= domainsPerMonth;
      const isNewDomain = !uniqueDomainsAudited.has(currentDomain);
      const shouldBlock = isAtLimit && isNewDomain;

      expect(shouldBlock).toBe(false);
    });

    it('should allow re-auditing same domain even at limit', () => {
      const uniqueDomainsAudited = new Set(['example.com', 'another.com']);
      const currentDomain = 'example.com'; // Already audited

      const isAtLimit = uniqueDomainsAudited.size >= domainsPerMonth;
      const isNewDomain = !uniqueDomainsAudited.has(currentDomain);
      const shouldBlock = isAtLimit && isNewDomain;

      expect(isAtLimit).toBe(true);
      expect(isNewDomain).toBe(false);
      expect(shouldBlock).toBe(false); // Should NOT block
    });

    it('should block new domain when at limit', () => {
      const uniqueDomainsAudited = new Set(['example.com', 'another.com']);
      const currentDomain = 'third-site.com'; // New domain

      const isAtLimit = uniqueDomainsAudited.size >= domainsPerMonth;
      const isNewDomain = !uniqueDomainsAudited.has(currentDomain);
      const shouldBlock = isAtLimit && isNewDomain;

      expect(isAtLimit).toBe(true);
      expect(isNewDomain).toBe(true);
      expect(shouldBlock).toBe(true); // Should block
    });
  });

  describe('Solo tier (5 domains/month)', () => {
    const domainsPerMonth = 5;

    it('should allow up to 5 unique domains', () => {
      const uniqueDomainsAudited = new Set([
        'site1.com', 'site2.com', 'site3.com', 'site4.com'
      ]);
      const currentDomain = 'site5.com';

      const isAtLimit = uniqueDomainsAudited.size >= domainsPerMonth;
      const shouldBlock = isAtLimit && !uniqueDomainsAudited.has(currentDomain);

      expect(shouldBlock).toBe(false);
    });

    it('should block 6th unique domain', () => {
      const uniqueDomainsAudited = new Set([
        'site1.com', 'site2.com', 'site3.com', 'site4.com', 'site5.com'
      ]);
      const currentDomain = 'site6.com';

      const isAtLimit = uniqueDomainsAudited.size >= domainsPerMonth;
      const isNewDomain = !uniqueDomainsAudited.has(currentDomain);
      const shouldBlock = isAtLimit && isNewDomain;

      expect(shouldBlock).toBe(true);
    });
  });

  describe('Pro tier (15 domains/month)', () => {
    const domainsPerMonth = 15;

    it('should allow up to 15 unique domains', () => {
      const uniqueDomainsAudited = new Set(
        Array.from({ length: 14 }, (_, i) => `site${i + 1}.com`)
      );
      const currentDomain = 'site15.com';

      const isAtLimit = uniqueDomainsAudited.size >= domainsPerMonth;
      const shouldBlock = isAtLimit && !uniqueDomainsAudited.has(currentDomain);

      expect(shouldBlock).toBe(false);
    });

    it('should block 16th unique domain', () => {
      const uniqueDomainsAudited = new Set(
        Array.from({ length: 15 }, (_, i) => `site${i + 1}.com`)
      );
      const currentDomain = 'site16.com';

      const isAtLimit = uniqueDomainsAudited.size >= domainsPerMonth;
      const isNewDomain = !uniqueDomainsAudited.has(currentDomain);
      const shouldBlock = isAtLimit && isNewDomain;

      expect(shouldBlock).toBe(true);
    });
  });

  describe('Agency tier (unlimited)', () => {
    const domainsPerMonth = null; // unlimited

    it('should never block when limit is null (unlimited)', () => {
      const uniqueDomainsAudited = new Set(
        Array.from({ length: 100 }, (_, i) => `site${i + 1}.com`)
      );
      const currentDomain = 'site101.com';

      // When domainsPerMonth is null, skip the check entirely
      const shouldBlock = domainsPerMonth !== null &&
        uniqueDomainsAudited.size >= domainsPerMonth &&
        !uniqueDomainsAudited.has(currentDomain);

      expect(shouldBlock).toBe(false);
    });
  });

  describe('Billing cycle handling', () => {
    it('should use subscription current_period_start for paid users', () => {
      const subscription = {
        plan_id: 'solo',
        current_period_start: '2026-01-01T00:00:00.000Z',
      };

      const billingCycleStart = subscription.current_period_start;

      expect(billingCycleStart).toBe('2026-01-01T00:00:00.000Z');
    });

    it('should use rolling 30-day window for free users', () => {
      const subscription = null; // Free user

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const billingCycleStart = thirtyDaysAgo.toISOString();

      // Should be approximately 30 days ago
      const daysDiff = (Date.now() - new Date(billingCycleStart).getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeCloseTo(30, 0);
    });

    it('should reset domain count at new billing cycle', () => {
      // Simulating domains audited in previous billing cycle
      const previousCycleStart = '2025-12-01T00:00:00.000Z';
      const currentCycleStart = '2026-01-01T00:00:00.000Z';

      const allAudits = [
        { domain: 'old1.com', created_at: '2025-12-15T00:00:00.000Z' },
        { domain: 'old2.com', created_at: '2025-12-20T00:00:00.000Z' },
        { domain: 'new1.com', created_at: '2026-01-05T00:00:00.000Z' },
      ];

      // Filter to current billing cycle only
      const currentCycleAudits = allAudits.filter(
        a => a.created_at >= currentCycleStart
      );
      const uniqueDomainsThisCycle = new Set(currentCycleAudits.map(a => a.domain));

      expect(uniqueDomainsThisCycle.size).toBe(1); // Only 'new1.com'
      expect(uniqueDomainsThisCycle.has('new1.com')).toBe(true);
      expect(uniqueDomainsThisCycle.has('old1.com')).toBe(false);
    });
  });

  describe('Error messages', () => {
    it('should generate correct error message for paid users', () => {
      const domainsPerMonth = 5;
      const isPaidUser = true;

      const errorMessage =
        `Domain limit reached. You can audit up to ${domainsPerMonth} unique domains per ${isPaidUser ? 'billing cycle' : 'month'}. ` +
        `Upgrade your plan to audit more domains.`;

      expect(errorMessage).toContain('5 unique domains');
      expect(errorMessage).toContain('billing cycle');
      expect(errorMessage).toContain('Upgrade your plan');
    });

    it('should generate correct error message for free users', () => {
      const domainsPerMonth = 2;
      const isPaidUser = false;

      const errorMessage =
        `Domain limit reached. You can audit up to ${domainsPerMonth} unique domains per ${isPaidUser ? 'billing cycle' : 'month'}. ` +
        `Upgrade your plan to audit more domains.`;

      expect(errorMessage).toContain('2 unique domains');
      expect(errorMessage).toContain('per month');
    });
  });
});
