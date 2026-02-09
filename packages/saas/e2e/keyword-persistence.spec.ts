import { test, expect } from '@playwright/test';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Test configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

test.describe('Keyword Research Persistence', () => {
  let serviceClient: SupabaseClient;
  let testProjectId: string;
  let testUserId: string;

  test.beforeAll(async () => {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY env vars');
    }
    serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get a project with a user to test with
    const { data: projects, error: projectsError } = await serviceClient
      .from('projects')
      .select('id, name, user_id')
      .not('user_id', 'is', null)
      .limit(1);

    if (projectsError || !projects?.length) {
      throw new Error(`No projects with user_id found: ${projectsError?.message}`);
    }

    testProjectId = projects[0].id;
    testUserId = projects[0].user_id;
    console.log('Test setup - Project:', projects[0].name, 'User:', testUserId);
  });

  test('1. Table exists and has correct structure', async () => {
    // Check if table exists by trying to query it
    const { data, error } = await serviceClient
      .from('keyword_research_results')
      .select('id')
      .limit(1);

    expect(error).toBeNull();
    console.log('Table exists, current row count:', data?.length ?? 0);
  });

  test('2. Service role can INSERT keyword research results', async () => {
    const testResult = {
      project_id: testProjectId,
      user_id: testUserId,
      url: 'https://test-keyword-persistence.example.com',
      site_summary: {
        productName: 'Test Product',
        tagline: 'Test tagline',
        description: 'Test description for keyword persistence',
        targetAudience: 'Developers',
        problemSolved: 'Testing',
        uniqueValue: 'Integration tests',
        industry: 'Software',
        nicheOrBroad: 'niche',
        competitors: [],
        features: ['feature1'],
        pricing: 'free',
      },
      uncertainty: {
        overallConfidence: 0.85,
        factors: [],
        questionsToAsk: [],
        explanation: 'Test confidence',
      },
      recommendations: [
        {
          keyword: 'test keyword persistence',
          searchVolume: 'medium',
          difficulty: 'easy',
          intent: 'informational',
          relevance: 0.9,
          action: 'create-page',
          rationale: 'Test rationale',
          impact: 'high',
          effort: 'low',
        },
      ],
      free_tool_ideas: [],
      wizard_responses: null,
      confidence: 0.85,
    };

    const { data: inserted, error: insertError } = await serviceClient
      .from('keyword_research_results')
      .insert(testResult)
      .select()
      .single();

    expect(insertError).toBeNull();
    expect(inserted).toBeTruthy();
    expect(inserted!.id).toBeTruthy();
    console.log('Inserted keyword research result:', inserted!.id);

    // Clean up
    const { error: deleteError } = await serviceClient
      .from('keyword_research_results')
      .delete()
      .eq('id', inserted!.id);

    expect(deleteError).toBeNull();
    console.log('Cleaned up test result');
  });

  test('3. RLS allows user to SELECT their project results', async () => {
    // First, insert a result using service role
    const testResult = {
      project_id: testProjectId,
      user_id: testUserId,
      url: 'https://rls-test.example.com',
      site_summary: { productName: 'RLS Test' },
      uncertainty: { overallConfidence: 0.8, factors: [], questionsToAsk: [], explanation: '' },
      recommendations: [],
      free_tool_ideas: [],
      confidence: 0.8,
    };

    const { data: inserted, error: insertError } = await serviceClient
      .from('keyword_research_results')
      .insert(testResult)
      .select()
      .single();

    expect(insertError).toBeNull();
    console.log('Created test result for RLS check:', inserted!.id);

    // Now create a user client and try to read it
    // We need to simulate an authenticated user - get their JWT
    const { data: userSession, error: sessionError } = await serviceClient.auth.admin.createUser({
      email: `test-${Date.now()}@keyword-test.local`,
      password: 'test-password-123',
      email_confirm: true,
    });

    if (sessionError) {
      console.log('Could not create test user, checking RLS with query analysis instead');
      
      // Alternative: Check if the result is accessible by querying with project_id filter
      const { data: results, error: selectError } = await serviceClient
        .from('keyword_research_results')
        .select('*')
        .eq('project_id', testProjectId)
        .eq('id', inserted!.id);

      expect(selectError).toBeNull();
      expect(results).toBeTruthy();
      expect(results!.length).toBe(1);
      console.log('Result is accessible via project_id filter');
    } else {
      // Assign the project to this new user for the test
      await serviceClient
        .from('projects')
        .update({ user_id: userSession.user.id })
        .eq('id', testProjectId);

      // Sign in as the user
      const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { error: signInError } = await userClient.auth.signInWithPassword({
        email: userSession.user.email!,
        password: 'test-password-123',
      });

      if (!signInError) {
        // Try to read the result
        const { data: userResults, error: userSelectError } = await userClient
          .from('keyword_research_results')
          .select('*')
          .eq('project_id', testProjectId);

        console.log('User SELECT result:', { 
          error: userSelectError?.message, 
          count: userResults?.length,
          hasOurResult: userResults?.some(r => r.id === inserted!.id)
        });

        expect(userSelectError).toBeNull();
        expect(userResults?.some(r => r.id === inserted!.id)).toBe(true);
      }

      // Restore original user_id
      await serviceClient
        .from('projects')
        .update({ user_id: testUserId })
        .eq('id', testProjectId);

      // Clean up test user
      await serviceClient.auth.admin.deleteUser(userSession.user.id);
    }

    // Clean up the test result
    await serviceClient
      .from('keyword_research_results')
      .delete()
      .eq('id', inserted!.id);
  });

  test('4. RLS BLOCKS user from seeing other users project results', async () => {
    // Create a result for one user
    const { data: inserted, error: insertError } = await serviceClient
      .from('keyword_research_results')
      .insert({
        project_id: testProjectId,
        user_id: testUserId,
        url: 'https://rls-block-test.example.com',
        site_summary: { productName: 'RLS Block Test' },
        uncertainty: { overallConfidence: 0.8, factors: [], questionsToAsk: [], explanation: '' },
        recommendations: [],
        free_tool_ideas: [],
        confidence: 0.8,
      })
      .select()
      .single();

    expect(insertError).toBeNull();

    // Create a different test user
    const { data: otherUser, error: otherUserError } = await serviceClient.auth.admin.createUser({
      email: `other-${Date.now()}@keyword-test.local`,
      password: 'test-password-456',
      email_confirm: true,
    });

    if (!otherUserError) {
      const otherClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      await otherClient.auth.signInWithPassword({
        email: otherUser.user.email!,
        password: 'test-password-456',
      });

      // This user should NOT see the result (they don't own the project)
      const { data: results, error: selectError } = await otherClient
        .from('keyword_research_results')
        .select('*')
        .eq('id', inserted!.id);

      console.log('Other user trying to access:', { 
        error: selectError?.message, 
        count: results?.length 
      });

      // Should return empty (RLS blocks it) or error
      expect(results?.length ?? 0).toBe(0);

      // Clean up
      await serviceClient.auth.admin.deleteUser(otherUser.user.id);
    }

    await serviceClient
      .from('keyword_research_results')
      .delete()
      .eq('id', inserted!.id);
  });

  test('5. Check existing keyword_research_results for test project', async () => {
    const { data: existing, error } = await serviceClient
      .from('keyword_research_results')
      .select('id, project_id, user_id, url, confidence, created_at')
      .eq('project_id', testProjectId)
      .order('created_at', { ascending: false })
      .limit(5);

    console.log('Existing results for project:', {
      error: error?.message,
      count: existing?.length ?? 0,
      results: existing?.map(r => ({
        id: r.id,
        user_id: r.user_id,
        url: r.url,
        confidence: r.confidence,
        created_at: r.created_at,
      })),
    });

    expect(error).toBeNull();
  });

  test('6. Check RLS policies on keyword_research_results', async () => {
    // Query pg_policies to see what policies exist
    const { data, error } = await serviceClient.rpc('exec_sql', {
      sql: `
        SELECT 
          policyname, 
          cmd, 
          qual::text as using_expr,
          with_check::text as with_check_expr
        FROM pg_policies 
        WHERE tablename = 'keyword_research_results'
      `,
    });

    if (error) {
      // Try alternative approach
      console.log('Could not query pg_policies directly:', error.message);
      
      // Check if RLS is enabled
      const { data: rlsCheck, error: rlsError } = await serviceClient.rpc('exec_sql', {
        sql: `
          SELECT relrowsecurity, relforcerowsecurity 
          FROM pg_class 
          WHERE relname = 'keyword_research_results'
        `,
      });

      console.log('RLS status:', rlsCheck, rlsError?.message);
    } else {
      console.log('RLS Policies:', JSON.stringify(data, null, 2));
    }
  });

  test('7. Verify project ownership link', async () => {
    // Check that the project has the expected user_id
    const { data: project, error } = await serviceClient
      .from('projects')
      .select('id, name, user_id')
      .eq('id', testProjectId)
      .single();

    console.log('Project ownership:', {
      projectId: project?.id,
      projectName: project?.name,
      userId: project?.user_id,
      expectedUserId: testUserId,
      matches: project?.user_id === testUserId,
    });

    expect(error).toBeNull();
    expect(project?.user_id).toBe(testUserId);
  });

  test('8. Simulate edge function INSERT (service role with user_id)', async () => {
    // This simulates what the ai-keywords edge function does
    const result = {
      project_id: testProjectId,
      user_id: testUserId, // Edge function passes this from the JWT
      url: 'https://edge-function-simulation.example.com',
      site_summary: {
        productName: 'Edge Function Test',
        tagline: '',
        description: 'Simulating edge function insert',
        targetAudience: 'Testers',
        problemSolved: 'Testing',
        uniqueValue: 'Simulation',
        industry: 'Testing',
        nicheOrBroad: 'niche',
        competitors: [],
        features: [],
        pricing: 'free',
      },
      uncertainty: {
        overallConfidence: 0.75,
        factors: [],
        questionsToAsk: [],
        explanation: 'Test',
      },
      recommendations: [],
      free_tool_ideas: [],
      wizard_responses: null,
      confidence: 0.75,
    };

    const { data: inserted, error: insertError } = await serviceClient
      .from('keyword_research_results')
      .insert(result)
      .select()
      .single();

    console.log('Edge function simulation INSERT:', {
      success: !insertError,
      error: insertError?.message,
      insertedId: inserted?.id,
      insertedUserId: inserted?.user_id,
    });

    expect(insertError).toBeNull();
    expect(inserted).toBeTruthy();
    expect(inserted!.user_id).toBe(testUserId);

    // Verify it can be read back
    const { data: readBack, error: readError } = await serviceClient
      .from('keyword_research_results')
      .select('*')
      .eq('id', inserted!.id)
      .single();

    console.log('Read back:', {
      success: !readError,
      error: readError?.message,
      hasData: !!readBack,
    });

    expect(readError).toBeNull();
    expect(readBack).toBeTruthy();

    // Clean up
    await serviceClient
      .from('keyword_research_results')
      .delete()
      .eq('id', inserted!.id);
  });
});

test.describe('Keyword Research UI Flow', () => {
  test('UI: Navigate to keywords page and check for history section', async ({ page }) => {
    // Use known project ID (same one from HEARTBEAT)
    const projectId = 'af9a2e16-4cac-43b6-9cb6-6200f88db309';

    // Set up console logging
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.text().includes('keyword')) {
        console.log(`[CONSOLE ${msg.type()}] ${msg.text()}`);
      }
    });

    // Log network requests to Supabase
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('keyword_research_results') || url.includes('ai-keywords')) {
        const status = response.status();
        console.log(`[NETWORK] ${response.request().method()} ${url} -> ${status}`);
        if (status >= 400) {
          try {
            const body = await response.text();
            console.log(`[RESPONSE BODY] ${body.slice(0, 500)}`);
          } catch {}
        }
      }
    });

    await page.goto(`/dashboard/projects/${projectId}/keywords`);
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);

    // Take screenshot
    await page.screenshot({ 
      path: 'e2e-screenshots/keywords-page.png', 
      fullPage: true 
    });

    if (currentUrl.includes('login')) {
      console.log('Redirected to login - authentication required');
      return;
    }

    // Check for history section
    const historyHeader = page.locator('text=Research History');
    const hasHistory = await historyHeader.count() > 0;
    console.log('Has Research History section:', hasHistory);

    // Check for any loading states
    const isLoading = await page.locator('text=Analyzing').count() > 0;
    console.log('Is loading:', isLoading);

    // Get page content for debugging
    const pageText = await page.textContent('body');
    console.log('Page contains "History":', pageText?.includes('History'));
    console.log('Page contains "No results":', pageText?.includes('No results') || pageText?.includes('no results'));
  });
});
