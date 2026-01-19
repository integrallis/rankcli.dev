import { Terminal, GitPullRequest, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Terminal,
    title: 'Install the CLI',
    description: 'One command to install. Works with any framework.',
    code: 'npm install -g @rankcli/cli',
  },
  {
    icon: GitPullRequest,
    title: 'Connect your repo',
    description: 'Link GitHub for automated audits and auto-fix PRs.',
    code: 'rankcli connect github',
  },
  {
    icon: CheckCircle,
    title: 'Merge the fixes',
    description: 'Review and merge PRs. SEO improves automatically.',
    code: 'git merge rankcli/auto-fix',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 border-t border-border/40">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three steps to automated SEO. No dashboards to check. No meetings to schedule.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-px bg-border/60 -translate-y-1/2 z-0" />
              )}

              <div className="relative z-10 flex flex-col items-center text-center">
                {/* Step number */}
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground mb-4">{step.description}</p>

                {/* Code */}
                <code className="text-sm px-3 py-1.5 bg-muted rounded-md font-mono">
                  {step.code}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
