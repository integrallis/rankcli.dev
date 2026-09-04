import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        port: 3000,
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
});
