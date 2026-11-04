import { describe, it, expect } from 'vitest';
import { AGENT_INSTALLS } from './AgentInstall';

describe('the agent install paths on the landing page', () => {
  it('names the three agents with the commands that actually install RankCLI', () => {
    const byAgent = Object.fromEntries(AGENT_INSTALLS.map((e) => [e.agent, [...e.commands]]));
    expect(byAgent['Claude Code']).toEqual([
      'claude plugin marketplace add integrallis/rankcli-mcp-server',
      'claude plugin install rankcli@rankcli',
    ]);
    expect(byAgent['Codex']).toEqual([
      'codex mcp add rankcli -- npx -y @rankcli/mcp-server',
      'npx skills add integrallis/rankcli-mcp-server',
    ]);
    expect(byAgent['ChatGPT']).toEqual(['https://mcp.rankcli.dev/mcp/free']);
  });

  it('names every shipped skill for Claude Code', () => {
    const claude = AGENT_INSTALLS.find((e) => e.agent === 'Claude Code')!;
    for (const skill of ['seo-audit', 'check-site-before-deploy', 'is-my-site-blocked-from-ai-search', 'fix-seo-regressions', 'seo-ci-gate']) {
      expect(claude.then).toContain(`/rankcli:${skill}`);
    }
  });
});
