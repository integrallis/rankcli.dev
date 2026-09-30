import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

/**
 * Cloudflare Web Analytics: cookieless page views, SPA navigations included.
 * Only added when VITE_CF_BEACON_TOKEN is set at build time (deploy.yml passes
 * the CF_BEACON_TOKEN repository variable); local and CI builds get no beacon.
 */
function cloudflareWebAnalytics(token: string | undefined): Plugin {
  return {
    name: 'cloudflare-web-analytics',
    apply: 'build',
    transformIndexHtml(html) {
      if (!token) return html;
      // The token is inlined into HTML: refuse anything but the hex/word
      // characters Cloudflare issues.
      if (!/^[A-Za-z0-9_-]+$/.test(token)) {
        throw new Error('VITE_CF_BEACON_TOKEN contains unexpected characters');
      }
      const snippet =
        `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" ` +
        `data-cf-beacon='{"token": "${token}"}'></script>`;
      return html.replace('</body>', `    ${snippet}\n  </body>`);
    },
  };
}

/**
 * Reddit Pixel: conversion tracking for Reddit Ads.
 *
 * Not optional if we advertise there - Reddit requires a `conversion_pixel_id` on every ad
 * group, so without this no campaign can be created at all. That is why this exists while the
 * Meta pixel deliberately does not: one is the price of entry to a channel we are using, the
 * other was a nice-to-have that would have cost the same privacy trade for nothing yet.
 *
 * Only added when VITE_REDDIT_PIXEL_ID is set, so local and CI builds ship nothing and the
 * site carries no advertising tracker until someone deliberately turns it on. When it is on,
 * PrivacyPage must say so - see the "Advertising and conversion tracking" section there.
 *
 * Goes in <head>, as high as possible, per Reddit's own install documentation.
 */
function redditPixel(pixelId: string | undefined): Plugin {
  return {
    name: 'reddit-pixel',
    apply: 'build',
    transformIndexHtml(html) {
      if (!pixelId) return html;
      // Inlined into HTML, so accept only the characters Reddit issues for a pixel id.
      if (!/^[A-Za-z0-9_-]+$/.test(pixelId)) {
        throw new Error('VITE_REDDIT_PIXEL_ID contains unexpected characters');
      }
      const snippet = `<script>!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js";t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);rdt('init','${pixelId}');rdt('track','PageVisit');</script>`;
      return html.replace('</head>', `    ${snippet}\n  </head>`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [
      react(),
      cloudflareWebAnalytics(env.VITE_CF_BEACON_TOKEN),
      redditPixel(env.VITE_REDDIT_PIXEL_ID),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3005,
      host: true,
    },
    build: {
      // Explicit modulepreload for ES modules (improves parallel loading)
      modulePreload: {
        polyfill: true,
      },
      // Generate source maps for debugging (optional, disable in prod if desired)
      sourcemap: false,
      // Optimize chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks for better caching
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['lucide-react', 'clsx', 'tailwind-merge'],
          },
        },
      },
    },
  };
});
