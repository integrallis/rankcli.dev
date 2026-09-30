# Reddit Ads — exact settings to enter

This is the one-time setup. Ads run continuously afterwards, which is the point: unlike organic
posting, you do this once and it keeps working.

Account: **Integrallis Software**, [ads.reddit.com/account/jrtl7de1quoe](https://ads.reddit.com/account/jrtl7de1quoe/get-started).

---

## Step 1 — Create the conversion pixel (5 minutes, blocks everything else)

Reddit requires a `conversion_pixel_id` on **every ad group**. Without one you cannot create a
campaign at all.

1. ads.reddit.com → **Events Manager** → **Create pixel**
2. Choose **Reddit Pixel** (not Conversions API)
3. Copy the pixel ID — it looks like `a2_abc123def456`

Then hand it over and the site picks it up automatically:

```bash
gh variable set REDDIT_PIXEL_ID --body "<pixel id>" --repo integrallis/rankcli.dev
gh workflow run deploy-saas.yml
```

The code is already in place. Nothing ships until that variable exists; once it does, the pixel
goes into `<head>` on all 26 marketing pages and `SignUp` fires from the auth context. The
privacy policy already describes it.

Verify after deploy:

```bash
curl -s https://rankcli.dev | grep -o "rdt('init','[^']*')"
```

## Step 2 — Campaign

| Field | Value |
|---|---|
| Objective | **Conversions** |
| Conversion event | **Sign Up** |
| Campaign name | `rankcli-devs-2026-10` |
| Budget type | Daily |
| Daily budget | **$25** |
| Schedule | Start today, no end date |

Conversions rather than Traffic: Traffic optimises for clicks, and cheap clicks from people who
will use the free tier forever are not the goal. Conversions makes Reddit find people who sign
up, which is the number that matters.

## Step 3 — Ad group A: developers

| Field | Value |
|---|---|
| Ad group name | `tier1-frameworks` |
| Conversion pixel | the one from step 1 |
| Communities | `webdev` `nextjs` `reactjs` `sveltejs` `vuejs` `astrojs` `devops` |
| Locations | United States, Canada, United Kingdom, Australia, Germany, Netherlands |
| Devices | All |
| Placement | Feed **and** Conversation |
| Bid strategy | Maximize conversions (let Reddit bid) |
| Daily budget | $15 |

## Step 4 — Ad group B: agencies

Separate ad group, not a second ad in the same one. Developers want the free CLI; agency owners
want white-label reports at $99/mo. One creative cannot do both, and mixing them makes the
numbers unreadable.

| Field | Value |
|---|---|
| Ad group name | `tier3-agencies` |
| Communities | `bigseo` `SEO` `juststart` `agency` |
| Locations | same as A |
| Daily budget | $10 |

## Step 5 — The ads

Reddit ad copy is short. Headline is what people read.

### Ad A1 — in `tier1-frameworks`

- **Headline:** `Cloudflare's Sept 15 default may have blocked Googlebot too`
- **Destination:** `https://rankcli.dev/free-audit?utm_source=reddit&utm_medium=cpc&utm_campaign=devs&utm_content=cloudflare`
- **Call to action:** Learn More
- **Creative:** `ad-assets/hero-report-1x1.png`

### Ad A2 — in `tier1-frameworks`

- **Headline:** `SEO checks that run in CI. Free, no signup.`
- **Destination:** `https://rankcli.dev/free-audit?utm_source=reddit&utm_medium=cpc&utm_campaign=devs&utm_content=cicd`
- **Creative:** `ad-assets/tall-1x1.mp4`

### Ad B1 — in `tier3-agencies`

- **Headline:** `Stop hand-writing SEO audits for clients`
- **Destination:** `https://rankcli.dev/pricing?utm_source=reddit&utm_medium=cpc&utm_campaign=agency&utm_content=margin`
- **Creative:** `ad-assets/hero-report-1x1.png`

Reddit creative specs: image **1200x628** or **1:1**, video up to 15 minutes but keep it under
30 seconds.

Ready to upload, in `ad-assets/`. Every Reddit format is covered:

| File | Size | Format |
|---|---|---|
| `hero-report-1200x628.png` | 1200x628 | 1.91:1 link image. Right third left empty for a headline overlay |
| `hero-report-1x1.png` | 1080x1080 | Square feed image |
| `hero-report-4x5.png` | 1080x1350 | 4:5, the tallest ratio Reddit's feed allows and the best-performing |
| `hero-report-9x16.png` | 1080x1920 | Vertical, for stories-style placements |
| `tall-1x1.mp4` | 1080x1080 | Square video of the audit running |
| `tall-4x5.mp4` | 1080x1350 | 4:5 video |
| `tall-9x16.mp4` | 1080x1920 | Vertical video |
| `audit-16x9.mp4` | 1920x1080 | Landscape video |

All show the real numbers, measured 2026-09-28: **75/100, 0 errors, AI Readiness 67**, React
detected, on rankcli.dev. Re-record before running if the score moves; the two commands are in
`zeely-production-2026-09.md`.

## Step 6 — Judge it

After **$100 spent**, look at cost per sign-up in Events Manager.

- Under **$30/signup** — keep going, scale the winning ad group
- **$30–60** — narrow to the two best communities and retest
- Over **$60** — stop. At a $9–29/mo product that funnel cannot pay back, and the money belongs
  on organic instead

Cross-check against Cloudflare Web Analytics, which counts `/free-audit` views by UTM. If Reddit
reports conversions that Cloudflare does not see traffic for, the pixel is misfiring.

---

## What is not automated, and why

The Reddit Ads **API** could create all of this programmatically, but it needs an OAuth app with
`adsedit` scope **plus allow-list approval from Reddit's ads team**, which is a request with a
review, not a form. Worth starting if this channel works; not worth blocking the first $100 on.

The setup above is 15 minutes once. After that the campaign runs on its own — which is the
actual difference from organic posting, where every post is another hour.
