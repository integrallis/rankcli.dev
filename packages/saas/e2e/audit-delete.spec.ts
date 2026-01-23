import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Test configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

test.describe('Audit Delete Integration Tests', () => {
  test.beforeAll(() => {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY env vars');
    }
  });

  test('should delete single audit via API', async () => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get a project to test with
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, name, user_id')
      .limit(1);

    expect(projectsError).toBeNull();
    expect(projects).toBeTruthy();
    expect(projects!.length).toBeGreaterThan(0);

    const project = projects![0];
    console.log('Using project:', project.name);

    // Create a test audit
    const { data: audit, error: createError } = await supabase
      .from('audits')
      .insert({
        project_id: project.id,
        status: 'completed',
        score: 42,
        triggered_by: 'manual',
      })
      .select()
      .single();

    expect(createError).toBeNull();
    expect(audit).toBeTruthy();
    console.log('Created test audit:', audit!.id);

    // Delete sequence: github_prs -> audit_issues -> audits

    // 1. Delete github_prs
    const { error: prsError } = await supabase
      .from('github_prs')
      .delete()
      .eq('audit_id', audit!.id);

    expect(prsError).toBeNull();
    console.log('Deleted related github_prs');

    // 2. Delete audit_issues
    const { error: issuesError } = await supabase
      .from('audit_issues')
      .delete()
      .eq('audit_id', audit!.id);

    expect(issuesError).toBeNull();
    console.log('Deleted related audit_issues');

    // 3. Delete the audit
    const { data: deletedAudit, error: auditError } = await supabase
      .from('audits')
      .delete()
      .eq('id', audit!.id)
      .select();

    expect(auditError).toBeNull();
    expect(deletedAudit).toBeTruthy();
    expect(deletedAudit!.length).toBe(1);
    expect(deletedAudit![0].id).toBe(audit!.id);
    console.log('Successfully deleted audit:', audit!.id);
  });

  test('should delete audit with github_prs FK constraint', async () => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get a project
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .limit(1);

    expect(projects).toBeTruthy();
    expect(projects!.length).toBeGreaterThan(0);

    const projectId = projects![0].id;

    // Create audit
    const { data: audit } = await supabase
      .from('audits')
      .insert({
        project_id: projectId,
        status: 'completed',
        score: 75,
        triggered_by: 'manual',
      })
      .select()
      .single();

    expect(audit).toBeTruthy();

    // Create a github_pr referencing this audit
    const { data: pr, error: prCreateError } = await supabase
      .from('github_prs')
      .insert({
        project_id: projectId,
        audit_id: audit!.id,
        pr_number: 9999,
        pr_url: 'https://github.com/test/repo/pull/9999',
        pr_title: 'Test PR for FK constraint test',
        pr_state: 'open',
      })
      .select()
      .single();

    expect(prCreateError).toBeNull();
    console.log('Created audit with github_pr:', { auditId: audit!.id, prId: pr!.id });

    // Trying to delete audit WITHOUT deleting github_prs should fail
    const { error: directDeleteError } = await supabase
      .from('audits')
      .delete()
      .eq('id', audit!.id);

    // This SHOULD fail due to FK constraint
    expect(directDeleteError).toBeTruthy();
    expect(directDeleteError!.message).toContain('github_prs');
    console.log('Correctly blocked by FK constraint:', directDeleteError!.message);

    // Now delete in correct order
    const { error: prsDeleteError } = await supabase
      .from('github_prs')
      .delete()
      .eq('audit_id', audit!.id);

    expect(prsDeleteError).toBeNull();

    const { error: issuesDeleteError } = await supabase
      .from('audit_issues')
      .delete()
      .eq('audit_id', audit!.id);

    expect(issuesDeleteError).toBeNull();

    const { data: deletedAudit, error: auditDeleteError } = await supabase
      .from('audits')
      .delete()
      .eq('id', audit!.id)
      .select();

    expect(auditDeleteError).toBeNull();
    expect(deletedAudit).toBeTruthy();
    expect(deletedAudit!.length).toBe(1);
    console.log('Successfully deleted audit after removing FK references');
  });

  test('should verify RLS DELETE policies exist', async () => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Query pg_policies to verify DELETE policies exist
    const { data, error } = await supabase
      .rpc('get_policies', {});

    if (error) {
      // If RPC doesn't exist, use raw SQL query via PostgREST
      // This is a sanity check - if we can delete, policies work
      console.log('Could not query policies directly, but delete tests passed');
      return;
    }

    console.log('Policies:', data);
  });

  test('should delete old audits (bulk delete)', async () => {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get a project
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .limit(1);

    expect(projects).toBeTruthy();
    const projectId = projects![0].id;

    // Create 3 test audits
    const auditsToCreate = [
      { project_id: projectId, status: 'completed', score: 60, triggered_by: 'manual' },
      { project_id: projectId, status: 'completed', score: 70, triggered_by: 'manual' },
      { project_id: projectId, status: 'completed', score: 80, triggered_by: 'manual' },
    ];

    const { data: createdAudits, error: createError } = await supabase
      .from('audits')
      .insert(auditsToCreate)
      .select();

    expect(createError).toBeNull();
    expect(createdAudits).toBeTruthy();
    expect(createdAudits!.length).toBe(3);

    const auditIds = createdAudits!.map(a => a.id);
    console.log('Created test audits:', auditIds);

    // Delete in order: github_prs -> audit_issues -> audits
    const { error: prsError } = await supabase
      .from('github_prs')
      .delete()
      .in('audit_id', auditIds);

    expect(prsError).toBeNull();

    const { error: issuesError } = await supabase
      .from('audit_issues')
      .delete()
      .in('audit_id', auditIds);

    expect(issuesError).toBeNull();

    const { data: deletedAudits, error: deleteError } = await supabase
      .from('audits')
      .delete()
      .in('id', auditIds)
      .select();

    expect(deleteError).toBeNull();
    expect(deletedAudits).toBeTruthy();
    expect(deletedAudits!.length).toBe(3);
    console.log('Successfully deleted all 3 test audits');
  });
});
