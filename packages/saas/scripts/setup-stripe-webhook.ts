#!/usr/bin/env npx tsx
/**
 * Setup Stripe Webhook Script
 *
 * Creates/updates Stripe webhook endpoint for the Supabase edge function.
 * Outputs the webhook secret for configuring edge function secrets.
 *
 * Usage:
 *   npm run setup:stripe
 *
 * Required environment variables:
 *   STRIPE_SECRET_KEY
 *   SUPABASE_PROJECT_REF (e.g., "abcdefghijklmnop")
 *
 * Or provide the full webhook URL:
 *   WEBHOOK_URL (e.g., "https://your-project.supabase.co/functions/v1/stripe-webhook")
 */

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const supabaseProjectRef = process.env.SUPABASE_PROJECT_REF;
const customWebhookUrl = process.env.WEBHOOK_URL;

if (!stripeSecretKey) {
  console.error('❌ Missing STRIPE_SECRET_KEY');
  process.exit(1);
}

if (!supabaseProjectRef && !customWebhookUrl) {
  console.error('❌ Missing SUPABASE_PROJECT_REF or WEBHOOK_URL');
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

const webhookUrl =
  customWebhookUrl ||
  `https://${supabaseProjectRef}.supabase.co/functions/v1/stripe-webhook`;

const enabledEvents: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.paid',
  'invoice.payment_failed',
];

async function main() {
  console.log('🔗 Setting up Stripe Webhook');
  console.log(`   URL: ${webhookUrl}`);
  console.log(`   Events: ${enabledEvents.length}`);
  console.log('');

  // Check for existing webhook
  const existingWebhooks = await stripe.webhookEndpoints.list({ limit: 100 });
  const existingWebhook = existingWebhooks.data.find(
    (wh) => wh.url === webhookUrl
  );

  let webhook: Stripe.WebhookEndpoint;

  if (existingWebhook) {
    // Update existing webhook
    webhook = await stripe.webhookEndpoints.update(existingWebhook.id, {
      enabled_events: enabledEvents,
      description: 'SEO Autopilot SaaS - Supabase Edge Function',
    });
    console.log(`📝 Updated existing webhook: ${webhook.id}`);
  } else {
    // Create new webhook
    webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: enabledEvents,
      description: 'SEO Autopilot SaaS - Supabase Edge Function',
    });
    console.log(`✅ Created new webhook: ${webhook.id}`);
  }

  // Get webhook secret (only available on creation, not on update)
  if (webhook.secret) {
    console.log('\n🔑 Webhook Secret (save this!):\n');
    console.log(`   ${webhook.secret}`);
    console.log('\n📋 To set in Supabase Edge Functions:\n');
    console.log(
      `   supabase secrets set STRIPE_WEBHOOK_SECRET="${webhook.secret}" --project-ref ${supabaseProjectRef || '<your-project-ref>'}`
    );
  } else {
    console.log('\n⚠️  Webhook secret not available (webhook was updated, not created)');
    console.log('   To get a new secret, delete and recreate the webhook:');
    console.log(`   1. Delete webhook ${webhook.id} in Stripe Dashboard`);
    console.log('   2. Re-run this script');
  }

  console.log('\n📊 Webhook Configuration:');
  console.log(`   ID: ${webhook.id}`);
  console.log(`   URL: ${webhook.url}`);
  console.log(`   Status: ${webhook.status}`);
  console.log(`   Events:`);
  for (const event of enabledEvents) {
    console.log(`     - ${event}`);
  }

  console.log('\n✅ Stripe webhook setup complete!');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
