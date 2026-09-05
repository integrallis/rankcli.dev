import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollReveal } from '@/components/ui/scroll-reveal';

const faqs = [
  {
    question: 'What SEO checks does it run?',
    answer:
      'We run 280+ checks covering technical SEO (meta tags, schema, canonicals), content quality (headings, word count, readability), performance (Core Web Vitals, page speed), security (HTTPS, headers), and more. The same checks you\'d get from Ahrefs or Screaming Frog.',
  },
  {
    question: 'How does the GitHub integration work?',
    answer:
      'You install our GitHub App on your repositories. When enabled, we automatically create branches and pull requests with SEO fixes. You review the changes and merge when ready. No manual code changes needed.',
  },
  {
    question: 'Can I use it without GitHub?',
    answer:
      'Yes! The CLI works standalone. You can run audits locally, and the dashboard shows all issues. GitHub integration is optional for automated fixes.',
  },
  {
    question: 'What frameworks do you support?',
    answer:
      'We support 11 frameworks: Next.js, React, Vue, Nuxt, Astro, SvelteKit, Angular, Rails, Django, Laravel, and WordPress. The CLI auto-detects your framework and generates appropriate fixes.',
  },
  {
    question: 'Is there a free tier?',
    answer:
      'Yes! Run a free audit on any URL with no signup at all. Create a free account for more checks and audit history. Paid plans unlock GitHub auto-fix PRs, full checks, and more - upgrade or cancel anytime, no long-term commitment.',
  },
  {
    question: 'How do I cancel my subscription?',
    answer:
      'You can cancel anytime from your account settings. Your access continues until the end of your billing period. No questions asked, no cancellation fees.',
  },
];

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
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
}
