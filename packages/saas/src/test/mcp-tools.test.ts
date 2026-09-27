// The tools the docs advertise must be the tools the server actually registers.
//
// The docs page hardcoded four: seo_audit, seo_geo_check, seo_robots_check and seo_compare.
// Only seo_geo_check exists. Anyone following the documentation would have asked their
// assistant to call three tools that were never registered, and the server ships fifteen -
// so the page was both wrong and undersold it by a factor of nearly four.
//
// Read from source rather than importing, for the same reason frameworks.test.ts does: this
// package has no dependency on @rankcli/mcp-server, and its dist/ is gitignored.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import mcpTools from '@/config/mcp-tools.json';

const MCP_SRC = join(__dirname, '../../../mcp-server/src');

function registeredToolNames(): string[] {
  const names: string[] = [];
  for (const file of ['server.ts', 'index.ts']) {
    const src = readFileSync(join(MCP_SRC, file), 'utf8');
    for (const m of src.matchAll(/^\s*name: '((?:seo|rankcli)_[a-z_]+)',$/gm)) names.push(m[1]);
  }
  return names;
}

describe('MCP tools the site advertises', () => {
  const registered = registeredToolNames();

  it('parses the tool definitions at all', () => {
    expect(registered.length, 'did server.ts change shape?').toBeGreaterThan(10);
  });

  it('lists exactly the tools the server registers', () => {
    expect(mcpTools.tools.map((t) => t.name).sort()).toEqual([...registered].sort());
  });

  it('describes every tool', () => {
    for (const tool of mcpTools.tools) {
      expect(tool.desc.length, `${tool.name} description`).toBeGreaterThan(10);
      expect(tool.name).toMatch(/^(seo|rankcli)_[a-z_]+$/);
    }
  });
});
