import {
  Search,
  GitPullRequest,
  Zap,
  Globe,
  Bot,
  Terminal,
  Shield,
  Smartphone,
  Cpu,
  Sparkles,
} from 'lucide-react';
import frameworks from '@/config/frameworks.json';

// The list comes from src/config/frameworks.json, which is generated from the recipe files and
// asserted against them by src/test/frameworks.test.ts. Three places used to hardcode it and
// they had already drifted apart.
const FRAMEWORK_NAMES = frameworks.with_recipes.map((f) => f.name);

function listFrameworks(): string {
  return FRAMEWORK_NAMES.length > 1
    ? `${FRAMEWORK_NAMES.slice(0, -1).join(', ')} and ${FRAMEWORK_NAMES[FRAMEWORK_NAMES.length - 1]}`
    : FRAMEWORK_NAMES[0];
}
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/components/ui/scroll-reveal';

const features = [
  {
    icon: Zap,
    title: 'Agentic Auto-Fix',
    description:
      'Run `rankcli fix --auto --commit --push`. Detect issues, apply fixes, commit with conventional messages, push to CI. Full automation.',
    highlight: true,
  },
  {
    icon: Sparkles,
    title: 'AI on Your Own Model',
    description:
      'On a Mac with Apple Intelligence, `--ai` runs on-device: free, private, no key. Or use a local model (Ollama, LM Studio) or your own OpenRouter or OpenAI key. Nothing goes through our servers.',
    highlight: true,
  },
  {
    icon: Bot,
    title: 'GEO (AI Search Optimization)',
    description:
      'Generative Engine Optimization built in: whether GPTBot, ClaudeBot and PerplexityBot can reach your site, and whether AI answers can quote it (answer structure, citations, llms.txt).',
    highlight: true,
  },
  {
    icon: Cpu,
    title: 'MCP Server for AI',
    description:
      'Free and local: run npx @rankcli/mcp-server and Claude, Cursor, or any MCP client can audit your site directly — no signup, nothing sent to our servers.',
    highlight: true,
  },
  {
    icon: Search,
    title: '7 Deep Analyzers',
    description:
      'GEO, Core Web Vitals, Security Headers, Structured Data, Images, Internal Linking, and Mobile SEO. Enterprise-grade depth.',
  },
  {
    icon: GitPullRequest,
    title: `${FRAMEWORK_NAMES.length} Framework Recipes`,
    description: `Auto-generate SEO fixes for ${listFrameworks()}. Copy-paste ready.`,
  },
  {
    icon: Terminal,
    title: 'CLI-First, CI/CD Native',
    description:
      'Run `rankcli audit` from terminal. JSON output, GitHub Actions, pre-commit hooks. Built for developer workflows.',
  },
  {
    icon: Shield,
    title: 'Security Header Grading',
    description:
      'HTTPS, HSTS, CSP, X-Frame-Options analysis with A+ through F grades. Security matters for SEO and AI trust.',
  },
  {
    icon: Smartphone,
    title: 'Mobile & PWA Ready',
    description:
      'Viewport, touch targets, font sizes, manifest detection. Complete mobile-first indexing audit.',
  },
  {
    icon: Zap,
    title: 'Core Web Vitals',
    description:
      'LCP, CLS, INP, TTFB estimation from HTML. Detect lazy-loaded heroes, missing dimensions, blocking resources.',
  },
  {
    icon: Globe,
    title: 'Open-Source GitHub Action',
    description:
      '`uses: integrallis/rankcli-action@v1` audits every deploy, comments on the pull request, and fails the build when SEO regresses.',
  },
];

export function Features() {
  return (
    <section className="py-24 border-t border-border">
      <div className="container">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tighter mb-4">
            The SEO tool that makes competitors look outdated
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            GEO, MCP, 11 frameworks, 280+ checks. Built for developers who ship fast.
          </p>
        </ScrollReveal>

        <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 max-w-5xl mx-auto items-stretch">
          {features.map((feature, index) => (
            <StaggerItem key={index} className="h-full">
              <div className={`flex gap-4 h-full ${feature.highlight ? 'p-4 -m-4 rounded-lg bg-primary/5 border border-primary/20' : ''}`}>
                <div className="flex-shrink-0">
                  <feature.icon className={`h-5 w-5 ${feature.highlight ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-medium mb-1 tracking-tight">
                    {feature.title}
                    {feature.highlight && (
                      <span className="ml-2 text-xs text-primary font-normal">New</span>
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed min-h-[5rem] sm:min-h-[5.5rem] lg:min-h-[6rem]">
                    {feature.description}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
