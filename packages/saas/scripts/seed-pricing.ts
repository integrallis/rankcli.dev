#!/usr/bin/env npx tsx
/**
 * Seed Pricing Script
 *
 * Creates/updates Stripe products and prices, then syncs price IDs to Supabase.
 * Single source of truth: src/config/pricing-tiers.json
 *
 * Usage:
 *   npm run seed:pricing         # Supabase only (no Stripe)
 *   npm run seed:pricing:stripe  # Stripe + Supabase sync
 *
 * Required environment variables:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   STRIPE_SECRET_KEY (only for --stripe mode)
 */

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import pricingConfig from '../src/config/pricing-tiers.json';

// Parse CLI args
const syncStripe = process.argv.includes('--stripe');

// Validate environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (syncStripe && !stripeSecretKey) {
  console.error('❌ Missing STRIPE_SECRET_KEY (required for --stripe mode)');
  process.exit(1);
}

// Initialize clients
const supabase = createClient(supabaseUrl, supabaseServiceKey);
const stripe = syncStripe
  ? new Stripe(stripeSecretKey!, { apiVersion: '2023-10-16' })
  : null;

interface SubscriptionTier {
  id: string;
  name: string;
  price_cents: number;
  billing_period: 'month' | 'year' | 'lifetime';
  tagline: string;
  popular: boolean;
  limits: {
    sites: number;
    team_members: number | null;
    keywords: number;
    api_requests_day: number;
    historical_days: number;
  };
  features: Record<string, boolean | number>;
  highlights: string[];
}

async function findOrCreateStripeProduct(
  tier: SubscriptionTier
): Promise<{ productId: string; priceId: string }> {
  if (!stripe) throw new Error('Stripe not initialized');

  const productMetadataKey = 'seo_autopilot_plan_id';

  // Search for existing product
  const existingProducts = await stripe.products.search({
    query: `metadata['${productMetadataKey}']:'${tier.id}'`,
  });

  let product: Stripe.Product;

  if (existingProducts.data.length > 0) {
    // Update existing product
    product = await stripe.products.update(existingProducts.data[0].id, {
      name: `SEO Autopilot ${tier.name}`,
      description: tier.tagline,
      metadata: {
        [productMetadataKey]: tier.id,
        sites_limit: String(tier.limits.sites),
        keywords_limit: String(tier.limits.keywords),
      },
    });
    console.log(`  📦 Updated product: ${product.name} (${product.id})`);
  } else {
    // Create new product
    product = await stripe.products.create({
      id: `seo_autopilot_${tier.id}`,
      name: `SEO Autopilot ${tier.name}`,
      description: tier.tagline,
      metadata: {
        [productMetadataKey]: tier.id,
        sites_limit: String(tier.limits.sites),
        keywords_limit: String(tier.limits.keywords),
      },
    });
    console.log(`  📦 Created product: ${product.name} (${product.id})`);
  }

  // Find or create price
  const isRecurring = tier.billing_period !== 'lifetime';
  const existingPrices = await stripe.prices.list({
    product: product.id,
    active: true,
  });

  // Check if a matching price exists
  const matchingPrice = existingPrices.data.find((price) => {
    if (isRecurring) {
      return (
        price.unit_amount === tier.price_cents &&
        price.recurring?.interval === tier.billing_period
      );
    } else {
      return price.unit_amount === tier.price_cents && !price.recurring;
    }
  });

  if (matchingPrice) {
    console.log(`  💰 Using existing price: $${tier.price_cents / 100}/${tier.billing_period} (${matchingPrice.id})`);
    return { productId: product.id, priceId: matchingPrice.id };
  }

  // Deactivate old prices
  for (const oldPrice of existingPrices.data) {
    await stripe.prices.update(oldPrice.id, { active: false });
    console.log(`  🔄 Deactivated old price: ${oldPrice.id}`);
  }

  // Create new price
  const priceParams: Stripe.PriceCreateParams = {
    product: product.id,
    unit_amount: tier.price_cents,
    currency: 'usd',
    metadata: {
      [productMetadataKey]: tier.id,
    },
  };

  if (isRecurring) {
    priceParams.recurring = {
      interval: tier.billing_period as 'month' | 'year',
    };
  }

  const price = await stripe.prices.create(priceParams);
  console.log(`  💰 Created price: $${tier.price_cents / 100}/${tier.billing_period} (${price.id})`);

  return { productId: product.id, priceId: price.id };
}

async function syncToSupabase(
  tier: SubscriptionTier,
  stripePriceId: string | null
) {
  const { error } = await supabase.from('subscription_plans').upsert(
    {
      plan_id: tier.id,
      name: tier.name,
      description: tier.tagline,
      price_cents: tier.price_cents,
      billing_period: tier.billing_period,
      sites_limit: tier.limits.sites,
      team_members_limit: tier.limits.team_members,
      keywords_limit: tier.limits.keywords,
      api_requests_per_day: tier.limits.api_requests_day,
      historical_days: tier.limits.historical_days,
      features: tier.features,
      stripe_price_id: stripePriceId,
      is_active: true,
      sort_order: tier.id === 'solo' ? 1 : tier.id === 'pro' ? 2 : 3,
    },
    {
      onConflict: 'plan_id',
      ignoreDuplicates: false,
    }
  );

  if (error) {
    console.error(`  ❌ Failed to sync ${tier.name} to Supabase:`, error.message);
    return false;
  }

  console.log(`  ✅ Synced ${tier.name} to Supabase${stripePriceId ? ` (price: ${stripePriceId})` : ''}`);
  return true;
}

async function main() {
  console.log('🚀 SEO Autopilot Pricing Sync');
  console.log(`   Mode: ${syncStripe ? 'Stripe + Supabase' : 'Supabase only'}`);
  console.log('');

  const subscriptions = pricingConfig.subscriptions as SubscriptionTier[];
  let success = true;

  for (const tier of subscriptions) {
    console.log(`\n📋 Processing: ${tier.name} ($${tier.price_cents / 100}/${tier.billing_period})`);

    let stripePriceId: string | null = null;

    if (syncStripe) {
      try {
        const { priceId } = await findOrCreateStripeProduct(tier);
        stripePriceId = priceId;
      } catch (error) {
        console.error(`  ❌ Stripe error:`, (error as Error).message);
        success = false;
        continue;
      }
    }

    const synced = await syncToSupabase(tier, stripePriceId);
    if (!synced) success = false;
  }

  // Sync free tier config (no Stripe product needed)
  if (pricingConfig.free_tier?.enabled) {
    console.log('\n📋 Free tier is enabled (no Stripe product needed)');
  }

  console.log('\n' + (success ? '✅ Pricing sync complete!' : '⚠️ Completed with errors'));
  process.exit(success ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
