/**
 * sync-threat-hashes Edge Function
 *
 * Syncs threat intelligence from URLhaus to the local threat_hashes table.
 * Implements a Google Safe Browsing-style architecture with hash prefixes.
 *
 * Usage:
 * - Call periodically via cron (e.g., every hour)
 * - Can be triggered manually via POST request
 *
 * Environment:
 * - SUPABASE_URL: Supabase project URL
 * - SUPABASE_SERVICE_ROLE_KEY: Service role key for admin access
 */

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// URLhaus CSV endpoint (recent URLs - last 30 days)
const URLHAUS_CSV_URL = 'https://urlhaus.abuse.ch/downloads/csv_recent/';

/**
 * FNV-1a hash function - must match the implementation in url-safety.ts
 */
function fnv1aHash(str: string): string {
  let hash = 0x811c9dc5; // FNV offset basis
  const FNV_PRIME = 0x01000193;

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Canonicalize URL for consistent hashing
 */
function canonicalizeUrl(urlString: string): string | null {
  try {
    const url = new URL(urlString);
    let canonical = url.protocol + '//' + url.hostname.toLowerCase();

    if (url.port && !((url.protocol === 'http:' && url.port === '80') ||
                      (url.protocol === 'https:' && url.port === '443'))) {
      canonical += ':' + url.port;
    }

    let path = url.pathname;
    if (path === '/') {
      canonical += '/';
    } else {
      path = path.replace(/\/+/g, '/');
      canonical += path;
    }

    if (url.search) {
      canonical += url.search;
    }

    return canonical;
  } catch {
    return null;
  }
}

/**
 * Parse URLhaus CSV line
 */
function parseUrlhausLine(line: string): {
  url: string;
  threatType: string;
  tags: string[];
} | null {
  // Skip comments and header
  if (line.startsWith('#') || line.startsWith('id,')) {
    return null;
  }

  // CSV format: id,dateadded,url,url_status,last_online,threat,tags,urlhaus_link,reporter
  // Handle quoted fields
  const parts: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      parts.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  parts.push(current);

  if (parts.length < 7) {
    return null;
  }

  const url = parts[2].trim();
  const threatType = parts[5].trim() || 'malware';
  const tagsStr = parts[6].trim();
  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : [];

  if (!url || url.length === 0) {
    return null;
  }

  return { url, threatType, tags };
}

/**
 * Fetch and parse URLhaus CSV
 */
async function fetchUrlhausData(): Promise<Array<{
  hashPrefix: string;
  hashType: 'url' | 'domain';
  threatType: string;
  tags: string[];
  originalUrl: string;
}>> {
  const response = await fetch(URLHAUS_CSV_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch URLhaus data: ${response.status}`);
  }

  const csvText = await response.text();
  const lines = csvText.split('\n');
  const results: Array<{
    hashPrefix: string;
    hashType: 'url' | 'domain';
    threatType: string;
    tags: string[];
    originalUrl: string;
  }> = [];

  const seenHashes = new Set<string>();

  for (const line of lines) {
    const parsed = parseUrlhausLine(line);
    if (!parsed) continue;

    const canonical = canonicalizeUrl(parsed.url);
    if (!canonical) continue;

    // Add URL hash
    const urlHash = fnv1aHash(canonical);
    if (!seenHashes.has(urlHash)) {
      seenHashes.add(urlHash);
      results.push({
        hashPrefix: urlHash,
        hashType: 'url',
        threatType: parsed.threatType,
        tags: parsed.tags,
        originalUrl: parsed.url,
      });
    }

    // Also add domain hash for broader matching
    try {
      const domain = new URL(parsed.url).hostname.toLowerCase();
      const domainHash = fnv1aHash(domain);
      const domainKey = `domain:${domainHash}`;
      if (!seenHashes.has(domainKey)) {
        seenHashes.add(domainKey);
        results.push({
          hashPrefix: domainHash,
          hashType: 'domain',
          threatType: parsed.threatType,
          tags: parsed.tags,
          originalUrl: domain,
        });
      }
    } catch {
      // Invalid URL, skip domain extraction
    }
  }

  return results;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting URLhaus sync...');

    // Create sync log entry
    const { data: syncLog, error: logError } = await supabase
      .from('threat_sync_log')
      .insert({
        source: 'urlhaus',
        status: 'running',
        metadata: { csv_url: URLHAUS_CSV_URL },
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to create sync log:', logError);
    }

    const syncId = syncLog?.id;

    // Fetch URLhaus data
    console.log('Fetching URLhaus CSV...');
    const threats = await fetchUrlhausData();
    console.log(`Parsed ${threats.length} threat entries`);

    // Mark existing URLhaus entries as inactive (we'll reactivate matches)
    await supabase
      .from('threat_hashes')
      .update({ is_active: false })
      .eq('source', 'urlhaus');

    // Upsert threat hashes in batches
    const BATCH_SIZE = 500;
    let recordsAdded = 0;
    let recordsUpdated = 0;

    for (let i = 0; i < threats.length; i += BATCH_SIZE) {
      const batch = threats.slice(i, i + BATCH_SIZE);

      const { error: upsertError, data: upsertData } = await supabase
        .from('threat_hashes')
        .upsert(
          batch.map(t => ({
            hash_prefix: t.hashPrefix,
            hash_type: t.hashType,
            threat_type: t.threatType,
            source: 'urlhaus',
            original_url: t.originalUrl.substring(0, 500), // Limit URL length
            tags: t.tags,
            last_updated: new Date().toISOString(),
            is_active: true,
          })),
          {
            onConflict: 'hash_prefix,hash_type,source',
            ignoreDuplicates: false,
          }
        )
        .select();

      if (upsertError) {
        console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, upsertError);
      } else {
        const batchCount = upsertData?.length || batch.length;
        recordsAdded += batchCount;
      }

      // Progress log every 5 batches
      if ((i / BATCH_SIZE) % 5 === 0) {
        console.log(`Progress: ${Math.min(i + BATCH_SIZE, threats.length)}/${threats.length}`);
      }
    }

    // Update sync log
    if (syncId) {
      await supabase
        .from('threat_sync_log')
        .update({
          completed_at: new Date().toISOString(),
          records_processed: threats.length,
          records_added: recordsAdded,
          records_updated: recordsUpdated,
          status: 'completed',
        })
        .eq('id', syncId);
    }

    // Get final stats
    const { data: stats } = await supabase
      .from('threat_hashes')
      .select('hash_type, source')
      .eq('is_active', true);

    const urlCount = stats?.filter(s => s.hash_type === 'url').length || 0;
    const domainCount = stats?.filter(s => s.hash_type === 'domain').length || 0;

    console.log('Sync completed successfully');
    console.log(`Active hashes: ${urlCount} URLs, ${domainCount} domains`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'URLhaus sync completed',
        stats: {
          processed: threats.length,
          added: recordsAdded,
          updated: recordsUpdated,
          activeUrlHashes: urlCount,
          activeDomainHashes: domainCount,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Sync failed:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
