import frameworks from '@/config/frameworks.json';

// Generated from the recipe files; src/test/frameworks.test.ts holds the two together.
const RECIPE_COUNT = `${frameworks.with_recipes.length} frameworks`;
const FRAMEWORK_LIST = frameworks.with_recipes.map((f) => f.name).join(', ');

// The detected set is the larger claim and was previously a hand-typed list in the answer
// below, which is exactly the kind of sentence that goes stale the week someone adds a signal.
const DETECTED_COUNT = frameworks.detected.length;
const RECIPE_IDS = new Set(frameworks.with_recipes.map((f) => f.id));
const DETECT_ONLY_LIST = frameworks.detected
  .filter((f) => !RECIPE_IDS.has(f.id))
  .map((f) => f.name)
  .join(', ');

// The landing page FAQ. The FAQPage structured data is generated from this
// same list, so it can't drift from what visitors actually see.
export const faqs = [
  {
    question: 'What SEO checks does it run?',
    answer:
      "We run 280+ checks covering technical SEO (meta tags, schema, canonicals), content quality (headings, word count, readability), performance (Core Web Vitals, page speed), security (HTTPS, headers), and more. The same checks you'd get from Ahrefs or Screaming Frog.",
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
      `Every audit detects your framework from the live page and tells you which one it found - ` +
      `${DETECTED_COUNT} of them. Detection weighs the evidence and says "unknown" rather than ` +
      `guessing, so when it names a framework it is right. ` +
      `${RECIPE_COUNT} also have framework-specific fix recipes, so their fixes follow that ` +
      `framework's own conventions: ${FRAMEWORK_LIST}. ` +
      `The rest are detected and reported - ${DETECT_ONLY_LIST} - but their fixes are generic.`,
  },
  {
    question: 'Is there a free tier?',
    answer:
      'Yes! Run a free audit on any URL with no signup at all, or create a free account to monitor one site with audit history. Paid plans add more sites, scheduled audits, GitHub auto-fix PRs and more - upgrade or cancel anytime, no long-term commitment.',
  },
  {
    question: 'How do I cancel my subscription?',
    answer:
      'You can cancel anytime from your account settings. Your access continues until the end of your billing period. No questions asked, no cancellation fees.',
  },
];

export function faqPageJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}
