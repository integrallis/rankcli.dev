// The tools the docs advertise must be the tools the server actually registers.
//
// The docs page hardcoded four: seo_audit, seo_geo_check, seo_robots_check and seo_compare.
// Only seo_geo_check exists. Anyone following the documentation would have asked their
// assistant to call three tools that were never registered, and the server ships fifteen -
// so the page was both wrong and undersold it by a factor of nearly four.
//
// The server is the published @rankcli/mcp-server, a devDependency pinned to the version the
// hosted free endpoint runs; its bundle is scanned for the tool names it registers.
import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import mcpTools from '@/config/mcp-tools.json';

// The package only exports ESM entry points, so resolve its bundle by path: pnpm links the
// devDependency into this package's own node_modules.
const MCP_DIST = join(__dirname, '../../node_modules/@rankcli/mcp-server/dist');

function registeredToolNames(): string[] {
  const names = new Set<string>();
  for (const file of readdirSync(MCP_DIST).filter((f) => f.endsWith('.js'))) {
    const src = readFileSync(join(MCP_DIST, file), 'utf8');
    for (const m of src.matchAll(/\bname: ["']((?:seo|rankcli)_[a-z_]+)["']/g)) names.add(m[1]);
  }
  return [...names];
}

describe('MCP tools the site advertises', () => {
  const registered = registeredToolNames();

  it('parses the tool definitions at all', () => {
    expect(registered.length, 'did the server bundle change shape?').toBeGreaterThan(10);
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
