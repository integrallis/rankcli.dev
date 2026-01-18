#!/usr/bin/env npx tsx
/**
 * OG Image Generator using Satori
 *
 * Uses satori (Vercel's OG image library) for production-quality OG images.
 * Satori renders React-like JSX to SVG, then converts to PNG.
 *
 * Usage:
 *   pnpm generate:og              # Generate all OG images
 *   pnpm generate:og landing      # Generate specific image
 *
 * Output:
 *   public/og-image.png           # Default/landing page
 *   public/og-pricing.png         # Pricing page
 *   public/og-audit.png           # Free audit page
 */

import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.join(__dirname, '../public');

// Load fonts - using system fonts or download from Google Fonts
async function loadFonts() {
  // Try to use local Inter font, fallback to fetching from CDN
  const fontPath = path.join(__dirname, '../fonts/Inter-Bold.ttf');

  if (fs.existsSync(fontPath)) {
    return [
      {
        name: 'Inter',
        data: fs.readFileSync(fontPath),
        weight: 700 as const,
        style: 'normal' as const,
      },
    ];
  }

  // Fetch Inter Bold (TTF format required by satori)
  // Using fontsource which provides TTF
  console.log('  📥 Downloading Inter font...');

  try {
    const fontResponse = await fetch(
      'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf'
    );

    if (!fontResponse.ok) {
      throw new Error(`Font fetch failed: ${fontResponse.status}`);
    }

    const fontBuffer = await fontResponse.arrayBuffer();

    return [
      {
        name: 'Inter',
        data: Buffer.from(fontBuffer),
        weight: 700 as const,
        style: 'normal' as const,
      },
    ];
  } catch (error) {
    console.log('  ⚠️  Could not download font:', (error as Error).message);
    console.log('  Using Noto Sans from Google as fallback...');

    // Fallback: return empty array, satori will use system fonts
    return [];
  }
}

interface OGImageConfig {
  name: string;
  title: string;
  subtitle: string;
  badge?: string;
  showTerminal?: boolean;
}

const images: OGImageConfig[] = [
  {
    name: 'og-image',
    title: 'SEO Autopilot',
    subtitle: 'Engineering as Marketing',
    badge: 'CLI-First SEO Tool',
    showTerminal: true,
  },
  {
    name: 'og-pricing',
    title: 'Simple Pricing',
    subtitle: 'Start free, upgrade when you need more',
    badge: 'From $9/mo',
  },
  {
    name: 'og-audit',
    title: 'Free SEO Audit',
    subtitle: '200+ automated checks. No signup required.',
    badge: 'Try Now',
  },
  {
    name: 'og-dashboard',
    title: 'SEO Dashboard',
    subtitle: 'Monitor all your sites in one place',
    badge: 'Pro Feature',
  },
];

function createOGImage(config: OGImageConfig) {
  // Satori uses React-like JSX syntax via objects
  // This mimics JSX: <div style={{...}}>...</div>

  const terminalContent = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1e1e2e',
        borderRadius: 12,
        border: '2px solid #313244',
        width: 480,
        height: 280,
        overflow: 'hidden',
      },
      children: [
        // Terminal header
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 16px',
              backgroundColor: '#313244',
            },
            children: [
              { type: 'div', props: { style: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#f38ba8' } } },
              { type: 'div', props: { style: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#f9e2af' } } },
              { type: 'div', props: { style: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#a6e3a1' } } },
            ],
          },
        },
        // Terminal body
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              padding: 16,
              gap: 8,
              fontFamily: 'monospace',
              fontSize: 14,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', gap: 8 },
                  children: [
                    { type: 'span', props: { style: { color: '#89b4fa' }, children: '$' } },
                    { type: 'span', props: { style: { color: '#cdd6f4' }, children: 'seo audit https://myapp.com' } },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', gap: 8 },
                  children: [
                    { type: 'span', props: { style: { color: '#a6e3a1' }, children: '✓' } },
                    { type: 'span', props: { style: { color: '#cdd6f4' }, children: 'Score: 92/100' } },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', gap: 8 },
                  children: [
                    { type: 'span', props: { style: { color: '#a6e3a1' }, children: '✓' } },
                    { type: 'span', props: { style: { color: '#cdd6f4' }, children: 'All meta tags valid' } },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', gap: 8, marginTop: 8 },
                  children: [
                    { type: 'span', props: { style: { color: '#89b4fa' }, children: '$' } },
                    { type: 'span', props: { style: { color: '#cdd6f4' }, children: 'seo apply --auto' } },
                  ],
                },
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', gap: 8 },
                  children: [
                    { type: 'span', props: { style: { color: '#f9e2af' }, children: '→' } },
                    { type: 'span', props: { style: { color: '#cdd6f4' }, children: 'PR #47 created with 3 fixes' } },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };

  const badge = config.badge
    ? {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            padding: '8px 20px',
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))',
            border: '1px solid rgba(139,92,246,0.5)',
            fontSize: 16,
            color: '#a5b4fc',
          },
          children: config.badge,
        },
      }
    : null;

  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
        padding: 60,
        position: 'relative',
      },
      children: [
        // Gradient accent bar at top
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
            },
          },
        },
        // Main content
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              height: '100%',
            },
            children: [
              // Left side - Terminal (if shown)
              config.showTerminal ? terminalContent : null,
              // Right side - Text content
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                    marginLeft: config.showTerminal ? 60 : 0,
                    flex: 1,
                  },
                  children: [
                    badge,
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: 64,
                          fontWeight: 700,
                          color: '#ffffff',
                          lineHeight: 1.1,
                        },
                        children: config.title,
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: 28,
                          color: '#94a3b8',
                        },
                        children: config.subtitle,
                      },
                    },
                  ].filter(Boolean),
                },
              },
            ].filter(Boolean),
          },
        },
        // Logo at bottom
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              bottom: 40,
              left: 60,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: 48,
                    height: 48,
                    borderRadius: 10,
                    backgroundColor: '#1e1e2e',
                    border: '1px solid #313244',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#3b82f6',
                  },
                  children: 'S',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: { fontSize: 20, fontWeight: 700, color: '#ffffff' },
                        children: 'SEO Autopilot',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: { fontSize: 16, color: '#64748b' },
                        children: 'seo-autopilot.dev',
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function generateImage(config: OGImageConfig, fonts: Awaited<ReturnType<typeof loadFonts>>) {
  const element = createOGImage(config);

  // Generate SVG using satori
  const svg = await satori(element as React.ReactNode, {
    width: 1200,
    height: 630,
    fonts,
  });

  // Convert SVG to PNG using resvg
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1200,
    },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  // Write files
  const pngPath = path.join(OUTPUT_DIR, `${config.name}.png`);
  fs.writeFileSync(pngPath, pngBuffer);
  console.log(`  🖼️  Generated: ${config.name}.png`);
}

async function main() {
  console.log('🎨 Generating OG Images with Satori\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Load fonts
  const fonts = await loadFonts();

  // Filter images if specific one requested
  const targetName = process.argv[2];
  const imagesToGenerate = targetName
    ? images.filter((img) => img.name === targetName || img.name === `og-${targetName}`)
    : images;

  if (targetName && imagesToGenerate.length === 0) {
    console.error(`❌ Unknown image: ${targetName}`);
    console.log('   Available: ' + images.map((i) => i.name).join(', '));
    process.exit(1);
  }

  for (const config of imagesToGenerate) {
    console.log(`📋 ${config.title}`);
    await generateImage(config, fonts);
  }

  console.log('\n✅ OG image generation complete!');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
