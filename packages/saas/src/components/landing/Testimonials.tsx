import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote:
      "RankCLI caught 47 SEO issues our agency missed. The auto-fix PRs saved us hours of manual work.",
    author: "Sarah Chen",
    title: "Senior Developer",
    company: "TechFlow",
  },
  {
    quote:
      "Finally, an SEO tool that speaks developer. No marketing fluff, just actionable fixes I can merge.",
    author: "Marcus Rodriguez",
    title: "Engineering Lead",
    company: "StartupX",
  },
  {
    quote:
      "We integrated RankCLI into our CI pipeline. Now SEO issues get caught before they hit production.",
    author: "Emily Park",
    title: "DevOps Engineer",
    company: "ScaleUp Inc",
  },
];

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="container">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Trusted by developers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what engineers are saying about RankCLI.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={index} delay={index * 0.1}>
              <div className="bg-card border border-border rounded-lg p-6 h-full flex flex-col">
                <Quote className="h-8 w-8 text-primary/40 mb-4" strokeWidth={1.5} />
                <blockquote className="text-foreground mb-6 flex-1">
                  "{testimonial.quote}"
                </blockquote>
                <div className="border-t border-border pt-4">
                  <p className="font-medium text-sm">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.title}, {testimonial.company}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
