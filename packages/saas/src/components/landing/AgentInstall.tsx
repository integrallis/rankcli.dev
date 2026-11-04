import { Bot, Terminal, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

// The audit as a coding agent uses it. Each entry is a real install path, verified 2026-11-04:
// the Claude Code plugin at integrallis/rankcli-mcp-server (five skills plus the MCP server),
// Codex's `codex mcp add` and the Agent Skills install, and ChatGPT's custom MCP server
// connection to the free hosted endpoint, which needs no account.
export const AGENT_INSTALLS = [
  {
    agent: 'Claude Code',
    icon: Terminal,
    summary: 'A plugin: five skills and the MCP server, two commands.',
    commands: [
      'claude plugin marketplace add integrallis/rankcli-mcp-server',
      'claude plugin install rankcli@rankcli',
    ],
    then: 'Then /rankcli:seo-audit, /rankcli:check-site-before-deploy, /rankcli:is-my-site-blocked-from-ai-search, /rankcli:fix-seo-regressions and /rankcli:seo-ci-gate.',
  },
  {
    agent: 'Codex',
    icon: Bot,
    summary: 'The MCP server and the same five skills, in the open Agent Skills format.',
    commands: [
      'codex mcp add rankcli -- npx -y @rankcli/mcp-server',
      'npx skills add integrallis/rankcli-mcp-server',
    ],
    then: 'The skills land in .agents/skills, where Codex reads them; the same command installs them for Cursor and the other agents skills.sh supports.',
  },
  {
    agent: 'ChatGPT',
    icon: MessageSquare,
    summary: 'A custom MCP server, no sign-in: the free hosted endpoint.',
    commands: ['https://mcp.rankcli.dev/mcp/free'],
    then: 'In ChatGPT: Plugins, the plus button, "Add custom MCP server", paste the URL, no authentication. The free tools audit one page at a time.',
  },
] as const;

export function AgentInstall() {
  return (
    <section id="agents" className="py-28 border-t border-border/40">
      <div className="container px-6 md:px-8">
        <ScrollReveal className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Use it from your coding agent</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The same 280+ checks, run by the agent that is already in your codebase. Free, local
            where the agent is local, no account.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {AGENT_INSTALLS.map((entry, index) => (
            <ScrollReveal key={entry.agent} delay={index * 0.1}>
              <div className="rounded-lg border border-border p-6 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <entry.icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold">{entry.agent}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{entry.summary}</p>
                <div className="space-y-2 mb-4">
                  {entry.commands.map((cmd) => (
                    <div key={cmd} className="overflow-x-auto">
                      <code className="inline-block px-2 py-1 bg-muted rounded text-xs font-mono whitespace-nowrap">
                        {cmd}
                      </code>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-auto">{entry.then}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="text-center mt-10">
          <p className="text-sm text-muted-foreground">
            Cursor, VS Code and Claude Desktop install in one click from{' '}
            <Link to="/docs#one-click-install" className="underline">
              the docs
            </Link>
            ; any other MCP client runs <code className="bg-muted px-1 rounded text-xs">npx @rankcli/mcp-server</code>.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
