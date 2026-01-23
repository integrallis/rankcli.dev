/**
 * Direct API test for audit deletion
 * Run with: npx tsx e2e/api-delete.test.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

async function testDeleteWithServiceRole() {
  console.log('=== Testing delete with SERVICE ROLE key ===');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Get audits
  const { data: audits, error: listError } = await supabase
    .from('audits')
    .select('id, status, project_id')
    .limit(5);

  if (listError) {
    console.error('List error:', listError);
    return;
  }

  console.log('Audits found:', audits?.length);
  console.log('Audits:', JSON.stringify(audits, null, 2));

  if (!audits || audits.length === 0) {
    console.log('No audits to delete');
    return;
  }

  // Try to delete the oldest/first audit
  const auditToDelete = audits[audits.length - 1]; // Last one (oldest if sorted desc)
  console.log('\nDeleting audit:', auditToDelete.id);

  // Delete issues first
  const { data: deletedIssues, error: issuesError } = await supabase
    .from('audit_issues')
    .delete()
    .eq('audit_id', auditToDelete.id)
    .select();

  if (issuesError) {
    console.error('Issues delete error:', issuesError);
  } else {
    console.log('Deleted issues:', deletedIssues?.length || 0);
  }

  // Delete audit
  const { data: deletedAudit, error: auditError } = await supabase
    .from('audits')
    .delete()
    .eq('id', auditToDelete.id)
    .select();

  if (auditError) {
    console.error('Audit delete error:', auditError);
  } else {
    console.log('Deleted audit:', deletedAudit);
    console.log('✅ Delete with service role SUCCEEDED');
  }
}

async function testDeleteWithAnonKey() {
  console.log('\n=== Testing delete with ANON key (no auth) ===');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Try to list audits (should fail or return empty due to RLS)
  const { data: audits, error: listError } = await supabase
    .from('audits')
    .select('id')
    .limit(5);

  console.log('List result (anon, no auth):');
  console.log('  Error:', listError);
  console.log('  Data:', audits);
  console.log('  (Empty is expected - RLS requires authenticated user)');
}

async function testRLSPolicies() {
  console.log('\n=== Checking RLS Policies ===');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data: policies, error } = await supabase.rpc('get_policies_for_table', { table_name: 'audits' }).single();

  // Alternative: direct query
  const { data: policyData, error: policyError } = await supabase
    .from('pg_policies')
    .select('*');

  if (policyError) {
    // Try raw SQL
    const result = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });
  }

  // Just list the policies via a different method
  console.log('Checking if DELETE policy exists...');

  // Try to delete with anon key to see the error
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { error: deleteError } = await anonClient
    .from('audits')
    .delete()
    .eq('id', '00000000-0000-0000-0000-000000000000'); // Fake ID

  console.log('Delete attempt (anon, fake ID):');
  console.log('  Error:', deleteError);
  console.log('  (Error message will indicate if RLS is blocking)');
}

async function main() {
  console.log('Supabase URL:', SUPABASE_URL);
  console.log('Service key:', SUPABASE_SERVICE_KEY ? '✓ Set' : '✗ Missing');
  console.log('Anon key:', SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing');
  console.log('');

  if (!SUPABASE_SERVICE_KEY) {
    console.error('SUPABASE_SERVICE_KEY is required');
    process.exit(1);
  }

  await testDeleteWithServiceRole();
  await testDeleteWithAnonKey();
  await testRLSPolicies();
}

main().catch(console.error);
