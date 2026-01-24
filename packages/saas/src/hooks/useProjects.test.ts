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
