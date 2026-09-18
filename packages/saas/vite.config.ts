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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react(), cloudflareWebAnalytics(env.VITE_CF_BEACON_TOKEN)],
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
