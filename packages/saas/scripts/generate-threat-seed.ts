#!/usr/bin/env npx tsx
/**
 * Generate threat hash seed data from URLhaus
 *
 * This script downloads the URLhaus CSV, computes hash prefixes,
 * and generates a SQL file with INSERT statements.
 *
 * Usage:
 *   npx tsx scripts/generate-threat-seed.ts
 *
 * Output:
 *   supabase/migrations/015_threat_hashes_seed.sql
 */

import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const URLHAUS_CSV_URL = 'https://urlhaus.abuse.ch/downloads/csv_recent/';
const OUTPUT_FILE = join(__dirname, '../supabase/migrations/015_threat_hashes_seed.sql');

/**
 * FNV-1a hash function - must match the implementation in url-safety.ts
 */
function fnv1aHash(str: string): string {
  let hash = 0x811c9dc5;
  const FNV_PRIME = 0x01000193;

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, FNV_PRIME);
  }

  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Canonicalize URL
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
  if (line.startsWith('#') || line.startsWith('id,')) {
    return null;
  }

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

async function main() {
  console.log('Fetching URLhaus CSV...');

  const response = await fetch(URLHAUS_CSV_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }

  const csvText = await response.text();
  const lines = csvText.split('\n');

  console.log(`Processing ${lines.length} lines...`);

  const hashes = new Map<string, {
    hashPrefix: string;
    hashType: 'url' | 'domain';
    threatType: string;
    tags: string[];
  }>();

  for (const line of lines) {
    const parsed = parseUrlhausLine(line);
    if (!parsed) continue;

    const canonical = canonicalizeUrl(parsed.url);
    if (!canonical) continue;

    // URL hash
    const urlHash = fnv1aHash(canonical);
    const urlKey = `url:${urlHash}`;
    if (!hashes.has(urlKey)) {
      hashes.set(urlKey, {
        hashPrefix: urlHash,
        hashType: 'url',
        threatType: parsed.threatType,
        tags: parsed.tags.slice(0, 5), // Limit tags
      });
    }

    // Domain hash
    try {
      const domain = new URL(parsed.url).hostname.toLowerCase();
      const domainHash = fnv1aHash(domain);
      const domainKey = `domain:${domainHash}`;
      if (!hashes.has(domainKey)) {
        hashes.set(domainKey, {
          hashPrefix: domainHash,
          hashType: 'domain',
          threatType: parsed.threatType,
          tags: parsed.tags.slice(0, 5),
        });
      }
    } catch {
      // Skip
    }
  }

  console.log(`Generated ${hashes.size} unique hashes`);

  // Generate SQL
  const sqlLines: string[] = [
    '-- Auto-generated threat hash seed data from URLhaus',
    `-- Generated: ${new Date().toISOString()}`,
    `-- Source: ${URLHAUS_CSV_URL}`,
    `-- Total hashes: ${hashes.size}`,
    '',
    '-- Insert threat hashes (batch)',
    'INSERT INTO public.threat_hashes (hash_prefix, hash_type, threat_type, source, tags, is_active)',
    'VALUES',
  ];

  const values: string[] = [];
  for (const hash of hashes.values()) {
    const tagsArray = hash.tags.length > 0
      ? `ARRAY[${hash.tags.map(t => `'${t.replace(/'/g, "''")}'`).join(', ')}]`
      : 'ARRAY[]::TEXT[]';
    values.push(`  ('${hash.hashPrefix}', '${hash.hashType}', '${hash.threatType}', 'urlhaus', ${tagsArray}, TRUE)`);
  }

  sqlLines.push(values.join(',\n'));
  sqlLines.push('ON CONFLICT (hash_prefix, hash_type, source) DO UPDATE SET');
  sqlLines.push('  last_updated = NOW(),');
  sqlLines.push('  is_active = TRUE;');
  sqlLines.push('');
  sqlLines.push('-- Log the seed operation');
  sqlLines.push("INSERT INTO public.threat_sync_log (source, status, records_processed, records_added, completed_at, metadata)");
  sqlLines.push(`VALUES ('urlhaus', 'completed', ${hashes.size}, ${hashes.size}, NOW(), '{"type": "seed", "generated": "${new Date().toISOString()}"}'::jsonb);`);

  const sql = sqlLines.join('\n');

  writeFileSync(OUTPUT_FILE, sql);
  console.log(`\nSeed file written to: ${OUTPUT_FILE}`);
  console.log(`File size: ${(sql.length / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
