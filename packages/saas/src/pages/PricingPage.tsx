import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Pricing } from '@/components/landing/Pricing';
import { SEO } from '@/components/SEO';
import pricingConfig from '@/config/pricing-tiers.json';

const paidPlans = pricingConfig.subscriptions
  .map((tier) => `${tier.name} $${tier.price_cents / 100}`)
  .join(', ');

export function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pricing: free CLI, hosted plans from $9 a month"
        description={`RankCLI pricing: the CLI, MCP server and Action are free. Hosted plans (${paidPlans} a month) add sites, schedules, auto-fix PRs and reports.`}
        path="/pricing"
        image="/og-pricing.png"
        imageAlt="RankCLI pricing"
      />
      <Navbar />
      <main className="py-16">
        <Pricing headingLevel="h1" />
      </main>
      <Footer />
    </div>
  );
}
