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

interface FoundingOffer {
  enabled: boolean;
  key: string;
  plan_id: string;
  base_plan_id: string;
  name: string;
  tagline: string;
  discounted_price_cents: number;
  original_price_cents: number;
  discount_percent: number;
  total_seats: number;
  duration_days: number;
}

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

  const productMetadataKey = 'rankcli_plan_id';

  // Search for existing product
  const existingProducts = await stripe.products.search({
    query: `metadata['${productMetadataKey}']:'${tier.id}'`,
  });

  let product: Stripe.Product;

  if (existingProducts.data.length > 0) {
    // Update existing product
    product = await stripe.products.update(existingProducts.data[0].id, {
      name: `RankCLI ${tier.name}`,
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
      id: `rankcli_${tier.id}`,
      name: `RankCLI ${tier.name}`,
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

/**
 * Founding-member pricing is a second, coexisting Price on the base tier's
 * EXISTING product (e.g. rankcli_pro) - not a new product, and critically
 * not run through findOrCreateStripeProduct, which deactivates every other
 * active price on the product when it creates a new one. That's correct
 * for a tier's *regular* price (only one should ever be active), but would
 * wrongly kill the base tier's real price the moment a founding price is
 * added alongside it. Both need to stay active at once.
 */
async function syncFoundingOffer(offer: FoundingOffer): Promise<void> {
  if (!stripe) throw new Error('Stripe not initialized');

  const productId = `rankcli_${offer.base_plan_id}`;

  try {
    await stripe.products.retrieve(productId);
  } catch (error) {
    throw new Error(`Base product ${productId} not found - run the base tier sync first: ${(error as Error).message}`);
  }

  const existingPrices = await stripe.prices.list({ product: productId, active: true });
  const matchingPrice = existingPrices.data.find(
    (price) =>
      price.unit_amount === offer.discounted_price_cents &&
      price.recurring?.interval === 'month' &&
      price.metadata?.rankcli_offer === offer.key
  );

  let priceId: string;
  if (matchingPrice) {
    console.log(`  💰 Using existing founding price: $${offer.discounted_price_cents / 100}/month (${matchingPrice.id})`);
    priceId = matchingPrice.id;
  } else {
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: offer.discounted_price_cents,
      currency: 'usd',
      recurring: { interval: 'month' },
      nickname: offer.name,
      metadata: {
        rankcli_offer: offer.key,
        rankcli_plan_id: offer.plan_id,
        seats: String(offer.total_seats),
      },
    });
    console.log(`  💰 Created founding price: $${offer.discounted_price_cents / 100}/month (${price.id})`);
    priceId = price.id;
  }

  // Targeted update, not upsert - the pro_founding row (limits, features,
  // sort_order) already exists from the founding-member migration, copied
  // from the base tier. Only the Stripe linkage is missing here.
  const { error } = await supabase
    .from('subscription_plans')
    .update({ stripe_price_id: priceId })
    .eq('plan_id', offer.plan_id);

  if (error) {
    throw new Error(`Failed to set stripe_price_id for ${offer.plan_id}: ${error.message}`);
  }
  console.log(`  ✅ Synced ${offer.name} to Supabase (price: ${priceId})`);
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
  console.log('🚀 RankCLI Pricing Sync');
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

  // Founding-member offer: a second price on an existing product, only in
  // --stripe mode (there's no meaningful Supabase-only sync for it, since
  // its row already exists from the founding-member migration).
  const foundingOffer = pricingConfig.founding_offer as FoundingOffer | undefined;
  if (syncStripe && foundingOffer?.enabled) {
    console.log(`\n📋 Processing founding offer: ${foundingOffer.name} ($${foundingOffer.discounted_price_cents / 100}/month, was $${foundingOffer.original_price_cents / 100})`);
    try {
      await syncFoundingOffer(foundingOffer);
    } catch (error) {
      console.error(`  ❌ Founding offer error:`, (error as Error).message);
      success = false;
    }
  }

  console.log('\n' + (success ? '✅ Pricing sync complete!' : '⚠️ Completed with errors'));
  process.exit(success ? 0 : 1);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
