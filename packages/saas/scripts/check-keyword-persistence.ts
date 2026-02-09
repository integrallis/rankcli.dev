#!/usr/bin/env npx ts-node
/**
 * Diagnostic script to check keyword research persistence
 * 
 * Run with:
 *   SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npx ts-node scripts/check-keyword-persistence.ts
 * 
 * Or source your .env.local first:
 *   source .env.local && npx ts-node scripts/check-keyword-persistence.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function main() {
  console.log('=== Keyword Persistence Diagnostic ===\n');

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing env vars: VITE_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_KEY');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // 1. Check if table exists
  console.log('1. Checking table existence...');
  const { data: tableCheck, error: tableError } = await supabase
    .from('keyword_research_results')
    .select('id')
    .limit(1);

  if (tableError) {
    console.error('   ❌ Table error:', tableError.message);
    if (tableError.message.includes('does not exist')) {
      console.error('   → Table needs to be created. Run migrations.');
      process.exit(1);
    }
  } else {
    console.log('   ✅ Table exists');
  }

  // 2. Count existing records
  console.log('\n2. Counting existing records...');
  const { count, error: countError } = await supabase
    .from('keyword_research_results')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('   ❌ Count error:', countError.message);
  } else {
    console.log(`   ✅ Total records: ${count}`);
  }

  // 3. Get all records with details
  console.log('\n3. Recent keyword research results:');
  const { data: results, error: resultsError } = await supabase
    .from('keyword_research_results')
    .select('id, project_id, user_id, url, confidence, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (resultsError) {
    console.error('   ❌ Query error:', resultsError.message);
  } else if (!results?.length) {
    console.log('   ⚠️  No records found');
  } else {
    results.forEach((r, i) => {
      console.log(`   [${i + 1}] ${r.id}`);
      console.log(`       project_id: ${r.project_id}`);
      console.log(`       user_id: ${r.user_id || '(NULL)'}`);
      console.log(`       url: ${r.url}`);
      console.log(`       confidence: ${r.confidence}`);
      console.log(`       created_at: ${r.created_at}`);
    });
  }

  // 4. Check projects table for user_id
  console.log('\n4. Checking projects with user_id:');
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, name, user_id')
    .not('user_id', 'is', null)
    .limit(5);

  if (projectsError) {
    console.error('   ❌ Projects error:', projectsError.message);
  } else if (!projects?.length) {
    console.log('   ⚠️  No projects with user_id found');
  } else {
    projects.forEach((p) => {
      console.log(`   - ${p.name} (${p.id})`);
      console.log(`     user_id: ${p.user_id}`);
    });
  }

  // 5. Check RLS policies (requires exec_sql function or direct DB access)
  console.log('\n5. Checking RLS status...');
  try {
    // This may not work depending on DB setup
    const { data: policies, error: policiesError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT policyname, cmd 
        FROM pg_policies 
        WHERE tablename = 'keyword_research_results'
      `,
    });

    if (policiesError) {
      console.log('   ⚠️  Cannot query policies directly (normal if exec_sql not set up)');
    } else {
      console.log('   Policies:', policies);
    }
  } catch {
    console.log('   ⚠️  Cannot query policies (exec_sql RPC not available)');
  }

  // 6. Test INSERT
  console.log('\n6. Testing INSERT capability...');
  const testProjectId = projects?.[0]?.id;
  const testUserId = projects?.[0]?.user_id;

  if (!testProjectId || !testUserId) {
    console.log('   ⚠️  No project with user_id to test with');
  } else {
    const testRecord = {
      project_id: testProjectId,
      user_id: testUserId,
      url: 'https://diagnostic-test.local',
      site_summary: { productName: 'Diagnostic Test' },
      uncertainty: { overallConfidence: 0.5, factors: [], questionsToAsk: [], explanation: '' },
      recommendations: [],
      free_tool_ideas: [],
      confidence: 0.5,
    };

    const { data: inserted, error: insertError } = await supabase
      .from('keyword_research_results')
      .insert(testRecord)
      .select()
      .single();

    if (insertError) {
      console.error('   ❌ INSERT failed:', insertError.message);
    } else {
      console.log('   ✅ INSERT succeeded:', inserted.id);

      // Clean up
      await supabase
        .from('keyword_research_results')
        .delete()
        .eq('id', inserted.id);
      console.log('   ✅ Cleanup succeeded');
    }
  }

  // 7. Specific project check (Brian's project)
  const brianProjectId = 'af9a2e16-4cac-43b6-9cb6-6200f88db309';
  console.log(`\n7. Checking specific project (${brianProjectId})...`);

  const { data: brianProject, error: brianProjectError } = await supabase
    .from('projects')
    .select('id, name, user_id')
    .eq('id', brianProjectId)
    .single();

  if (brianProjectError) {
    console.error('   ❌ Project not found:', brianProjectError.message);
  } else {
    console.log(`   Project: ${brianProject.name}`);
    console.log(`   user_id: ${brianProject.user_id || '(NULL - THIS IS THE PROBLEM!)'}`);

    // Check for keyword results for this project
    const { data: projectResults, error: projectResultsError } = await supabase
      .from('keyword_research_results')
      .select('id, user_id, confidence, created_at')
      .eq('project_id', brianProjectId)
      .order('created_at', { ascending: false });

    if (projectResultsError) {
      console.error('   ❌ Results query error:', projectResultsError.message);
    } else {
      console.log(`   Keyword results: ${projectResults?.length || 0}`);
      projectResults?.forEach((r) => {
        console.log(`     - ${r.id} (user: ${r.user_id || 'NULL'}, conf: ${r.confidence})`);
      });
    }
  }

  console.log('\n=== Diagnostic Complete ===');
}

main().catch(console.error);
