#!/usr/bin/env npx tsx
/**
 * Setup Stripe products and prices for Lifetime Deals
 *
 * Run from workspace root: npx tsx packages/saas/scripts/setup-ltd-stripe.ts
 * Or with env file: STRIPE_SECRET_KEY=sk_xxx npx tsx packages/saas/scripts/setup-ltd-stripe.ts
 *
 * This creates one-time payment products in Stripe for each LTD tier.
 * The products are linked to the ltd_tier enum in the database.
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

interface LTDTier {
  id: string;
  name: string;
  price_cents: number;
  description: string;
  features: string[];
}

const LTD_TIERS: LTDTier[] = [
  {
    id: 'ltd_starter',
    name: 'RankCLI LTD Starter',
    price_cents: 7900,
    description: 'Lifetime access to RankCLI Starter tier - 1 site, 4 audits/month',
    features: [
      '1 site monitored',
      '4 audits per month',
      '200+ SEO checks',
      'API access (50 req/day)',
      'Export PDF reports',
      'Lifetime updates',
    ],
  },
  {
    id: 'ltd_pro',
    name: 'RankCLI LTD Pro',
    price_cents: 14900,
    description: 'Lifetime access to RankCLI Pro tier - 3 sites, 12 audits/month',
    features: [
      '3 sites monitored',
      '12 audits per month',
      '200+ SEO checks',
      'API access (200 req/day)',
      'GitHub integration',
      'Slack alerts',
      'Lifetime updates',
    ],
  },
  {
    id: 'ltd_agency',
    name: 'RankCLI LTD Agency',
    price_cents: 29900,
    description: 'Lifetime access to RankCLI Agency tier - 10 sites, 30 audits/month',
    features: [
      '10 sites monitored',
      '30 audits per month',
      '200+ SEO checks',
      'API access (500 req/day)',
      'Auto-fix PRs',
      'White-label reports',
      'Priority support',
      'Lifetime updates',
    ],
  },
];

async function findOrCreateProduct(tier: LTDTier): Promise<Stripe.Product> {
  // Check if product already exists by metadata
  const existingProducts = await stripe.products.search({
    query: `metadata['ltd_tier']:'${tier.id}'`,
  });

  if (existingProducts.data.length > 0) {
    console.log(`  Found existing product: ${existingProducts.data[0].id}`);
    return existingProducts.data[0];
  }

  // Create new product (features added via dashboard, not API)
  const product = await stripe.products.create({
    name: tier.name,
    description: tier.description,
    metadata: {
      ltd_tier: tier.id,
      type: 'lifetime_deal',
      features: tier.features.join(', '),
    },
  });

  console.log(`  Created product: ${product.id}`);
  return product;
}

async function findOrCreatePrice(
  product: Stripe.Product,
  tier: LTDTier
): Promise<Stripe.Price> {
  // Check if price already exists
  const existingPrices = await stripe.prices.list({
    product: product.id,
    active: true,
  });

  // Find matching one-time price
  const matchingPrice = existingPrices.data.find(
    p => p.type === 'one_time' && p.unit_amount === tier.price_cents
  );

  if (matchingPrice) {
    console.log(`  Found existing price: ${matchingPrice.id}`);
    return matchingPrice;
  }

  // Create new price
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: tier.price_cents,
    currency: 'usd',
    metadata: {
      ltd_tier: tier.id,
      type: 'lifetime_deal',
    },
  });

  console.log(`  Created price: ${price.id} ($${tier.price_cents / 100})`);
  return price;
}

async function setupLTDProducts() {
  console.log('Setting up Stripe products for Lifetime Deals...\n');

  const results: { tier: string; productId: string; priceId: string }[] = [];

  for (const tier of LTD_TIERS) {
    console.log(`\nProcessing ${tier.name}...`);

    const product = await findOrCreateProduct(tier);
    const price = await findOrCreatePrice(product, tier);

    results.push({
      tier: tier.id,
      productId: product.id,
      priceId: price.id,
    });
  }

  console.log('\n\n=== Setup Complete ===\n');
  console.log('Add these to your environment variables:\n');

  for (const result of results) {
    const envKey = `STRIPE_LTD_${result.tier.toUpperCase().replace('LTD_', '')}_PRICE_ID`;
    console.log(`${envKey}=${result.priceId}`);
  }

  console.log('\n\nOr add to pricing-tiers.json:\n');
  console.log(JSON.stringify(
    results.reduce((acc, r) => ({ ...acc, [r.tier]: { product_id: r.productId, price_id: r.priceId } }), {}),
    null,
    2
  ));
}

// Run if called directly
setupLTDProducts().catch(console.error);
