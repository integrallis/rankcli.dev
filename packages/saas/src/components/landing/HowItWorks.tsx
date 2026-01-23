import { Terminal, GitPullRequest, CheckCircle } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

const steps = [
  {
    icon: Terminal,
    title: 'Install the CLI',
    description: 'One command to install. Works with any framework.',
    code: 'npm i -g @rankcli/cli',
  },
  {
    icon: GitPullRequest,
    title: 'Connect your repo',
    description: 'Link GitHub for automated audits and PRs.',
    code: 'rankcli connect',
  },
  {
    icon: CheckCircle,
    title: 'Merge the fixes',
    description: 'Review and merge. SEO improves automatically.',
    code: 'git merge fix/seo',
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
            Three steps to automated SEO. No dashboards to check. No meetings to schedule.
          </p>
        </ScrollReveal>

        {/* Mobile: stack vertically */}
        <div className="md:hidden flex flex-col gap-10 max-w-sm mx-auto">
          {steps.map((step, index) => (
            <Step key={index} step={step} />
          ))}
        </div>

        {/* Desktop: 20% - 50% - 20% with gaps */}
        <div className="hidden md:flex justify-center items-start gap-8 max-w-5xl mx-auto">
          <div style={{ width: '20%' }}>
            <Step step={steps[0]} />
          </div>
          <div style={{ width: '50%' }}>
            <Step step={steps[1]} />
          </div>
          <div style={{ width: '20%' }}>
            <Step step={steps[2]} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({ step }: { step: typeof steps[0] }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-7">
        <step.icon className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
      <p className="text-muted-foreground mb-5 min-h-[48px]">{step.description}</p>
      <code className="text-sm px-3 py-1.5 bg-muted rounded-md font-mono whitespace-nowrap">
        {step.code}
      </code>
    </div>
  );
}
