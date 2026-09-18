import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { Differentiators } from '@/components/landing/Differentiators';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';
import { SEO, SITE_URL } from '@/components/SEO';
import { faqPageJsonLd } from '@/data/faqs';
import pricingConfig from '@/config/pricing-tiers.json';

const description =
  'RankCLI is a developer-first SEO and GEO tool. Run 280+ checks from your terminal or CI, get framework-aware fixes and GitHub auto-fix PRs, and see whether AI search cites you. Free to start.';

// Offers come from pricing-tiers.json, the same source as the pricing cards.
const offers = [
  { name: 'Free', price_cents: 0 },
  ...pricingConfig.subscriptions.map((tier) => ({ name: tier.name, price_cents: tier.price_cents })),
].map((tier) => ({
  '@type': 'Offer',
  name: tier.name,
  price: String(tier.price_cents / 100),
  priceCurrency: 'USD',
  url: `${SITE_URL}/pricing`,
}));

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'RankCLI',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'macOS, Linux, Windows',
    description,
    url: `${SITE_URL}/`,
    offers,
    featureList: [
      '280+ SEO and GEO checks',
      'Auto-fix pull requests via the RankCLI GitHub App',
      'CLI and CI/CD integration',
      'Scheduled audits',
      'Keyword tracking',
      'AI search visibility checks',
      'MCP server for AI coding assistants',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RankCLI',
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/logo.png`,
    sameAs: ['https://github.com/apps/rankcli'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@rankcli.dev',
    },
  },
  faqPageJsonLd(),
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        fullTitle="RankCLI - Ship code, get ranked: SEO for developers"
        description={description}
        path="/"
        imageAlt="RankCLI - terminal showing SEO audit results"
        jsonLd={structuredData}
      />
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Differentiators />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
