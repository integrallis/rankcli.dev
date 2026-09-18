import { ChevronDown } from 'lucide-react';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { faqs } from '@/data/faqs';

// Native <details> rather than the Radix accordion: the accordion only
// renders an answer while it's open, so the prerendered page (and any
// crawler that doesn't run JS) would have the questions but none of the
// answers. <details> keeps every answer in the HTML, and name="faq" still
// lets only one be open at a time.
export function FAQ() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Got questions? We have answers.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.2} className="max-w-3xl mx-auto">
          <div className="w-full">
            {faqs.map((faq) => (
              <details key={faq.question} name="faq" className="group border-b">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-left font-medium transition-all hover:underline [&::-webkit-details-marker]:hidden">
                  <h3>{faq.question}</h3>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="pb-4 text-sm text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
