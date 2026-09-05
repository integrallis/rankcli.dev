import { Terminal, Scan, Wrench, GitPullRequest, Upload } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: Terminal,
    title: 'Install & Login',
    description: 'One command to install, one to authenticate.',
    code: 'npm install -g @rankcli/cli && rankcli login',
  },
  {
    icon: Scan,
    title: 'Run the Audit',
    description: '280+ SEO checks in seconds. Works with any framework.',
    code: 'rankcli audit --url yoursite.com',
  },
  {
    icon: Wrench,
    title: 'Apply Fixes',
    description: 'Auto-apply fixes locally. Review and commit when ready.',
    code: 'rankcli apply --auto',
  },
];

const approaches = [
  {
    title: 'Keep Full Control',
    description: 'No repo access needed. Run locally, push when ready.',
    icon: Upload,
    commands: [
      { cmd: 'rankcli audit', desc: 'Run 280+ checks' },
      { cmd: 'rankcli apply --auto', desc: 'Apply fixes locally' },
      { cmd: 'git push', desc: 'Push when ready' },
    ],
    highlight: 'Every plan',
  },
  {
    title: 'Full Automation',
    description: 'Set up GitHub Actions for hands-free SEO maintenance.',
    icon: GitPullRequest,
    commands: [
      { cmd: 'rankcli setup --github-action', desc: 'Add CI workflow' },
      { cmd: '✓ Auto-audit on push', desc: 'Runs on every deploy' },
      { cmd: '✓ Get issues in PRs', desc: 'Review and fix' },
    ],
    highlight: 'Every plan',
  },
];

export function HowItWorks() {
  return (
    <section className="py-28 border-t border-border/40">
      <div className="container">
        <ScrollReveal className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-5">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three commands to better SEO and GEO. No dashboards to check. No meetings to schedule.
          </p>
        </ScrollReveal>

        {/* Main 3-step flow */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20">
          {steps.map((step, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground mb-4 text-sm">{step.description}</p>
                <div className="w-full max-w-full overflow-x-auto">
                  <code className="inline-block text-xs px-3 py-1.5 bg-muted rounded-md font-mono whitespace-nowrap">
                    {step.code}
                  </code>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Two approaches */}
        <ScrollReveal className="text-center mb-10">
          <h3 className="text-xl font-semibold mb-3">Choose your workflow</h3>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Full control or full automation — you decide how much access to grant.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {approaches.map((approach, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <div className={cn(
                'rounded-lg border p-6 h-full',
                index === 1 ? 'border-primary bg-primary/5' : 'border-border'
              )}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    index === 1 ? 'bg-primary/20' : 'bg-muted'
                  )}>
                    <approach.icon className={cn(
                      'h-5 w-5',
                      index === 1 ? 'text-primary' : 'text-muted-foreground'
                    )} />
                  </div>
                  <div>
                    <h4 className="font-semibold">{approach.title}</h4>
                    <span className="text-xs text-muted-foreground">{approach.highlight}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{approach.description}</p>
                <div className="space-y-2">
                  {approach.commands.map((cmd, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <code className="px-2 py-1 bg-muted rounded text-xs font-mono flex-shrink-0 whitespace-nowrap">
                        {cmd.cmd}
                      </code>
                      <span className="text-muted-foreground text-xs">{cmd.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
