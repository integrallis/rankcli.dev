# RankCLI GitHub Actions Deployment Setup

**Ship code, get ranked. SEO meets CI/CD.**

Website: https://rankcli.dev

This file documents the GitHub repository secrets and variables needed for automated deployments.

## Repository Secrets

Go to: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Description | Required |
|--------|-------------|----------|
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID | Yes |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with Pages edit permission | Yes |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI access token ([generate here](https://supabase.com/dashboard/account/tokens)) | Yes |
| `SUPABASE_ANON_KEY` | Supabase anon/public key | Yes |
| `SUPABASE_SERVICE_KEY` | Supabase service_role key | Yes |
| `SUPABASE_DB_PASSWORD` | Supabase database password | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key (sk_live_* or sk_test_*) | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (whsec_*) | Yes |
| `OPENAI_API_KEY` | OpenAI API key (for AI features) | Optional |

## Repository Variables

Go to: **Settings → Secrets and variables → Actions → Variables → New repository variable**

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_PROJECT_REF` | Supabase project reference ID | `bspljbxwbjiqueeyzyat` |

## Getting the Values

### Supabase
1. Go to [supabase.com](https://supabase.com) → Your project
2. **Project ref**: First part of URL (e.g., `bspljbxwbjiqueeyzyat` from `https://bspljbxwbjiqueeyzyat.supabase.co`)
3. **Anon key**: Settings → API → `anon` `public` key
4. **Service key**: Settings → API → `service_role` key
5. **DB password**: Settings → Database → Connection string → Password
6. **Access token**: [Account → Access Tokens](https://supabase.com/dashboard/account/tokens)

### Cloudflare
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Account ID**: Right sidebar on overview page
3. **API Token**: My Profile → API Tokens → Create Token → Edit Cloudflare Pages

### Stripe
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Secret key**: Developers → API keys → Secret key
3. **Webhook secret**: Developers → Webhooks → Your endpoint → Signing secret

## First-time Setup

1. Create a Cloudflare Pages project:
   - Go to Cloudflare Pages → Create project
   - Name: `rankcli`
   - Build command: (leave empty, we deploy pre-built)
   - Build output: (leave empty)

2. Create Stripe webhook:
   - Developers → Webhooks → Add endpoint
   - URL: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`

3. Configure Supabase OAuth:
   - Authentication → Providers → Enable Google and GitHub
   - Add callback URLs for your domain
