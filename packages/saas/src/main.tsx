import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { preloadPage } from './routes';
import { setBootedOverPrerender } from './lib/prerender';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

// Pages are separate chunks. If a deploy replaced the chunks this tab was
// loaded with, the next page load fails: reload once to pick up the new build.
window.addEventListener('vite:preloadError', (event) => {
  const key = 'rankcli:chunk-reload-at';
  const last = Number(sessionStorage.getItem(key) || 0);
  if (Date.now() - last > 10_000) {
    sessionStorage.setItem(key, String(Date.now()));
    event.preventDefault();
    window.location.reload();
  }
});

const rootElement = document.getElementById('root')!;

// Public pages arrive prerendered (scripts/prerender.ts). createRoot replaces
// that HTML on its first commit, so load the page's chunk first: rendering
// straight to the finished page means nothing blanks out or flashes.
setBootedOverPrerender(rootElement.firstElementChild !== null);

preloadPage(window.location.pathname)
  .catch(() => {
    // Rendering will retry the import and surface the error.
  })
  .then(() => {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <HelmetProvider>
          {/* v7_startTransition: a navigation keeps the current page on screen
              while the next page's chunk loads, instead of blanking. */}
          <BrowserRouter future={{ v7_startTransition: true }}>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <App />
                <Toaster
                  position="bottom-right"
                  theme="dark"
                  toastOptions={{
                    style: {
                      background: 'hsl(224 71% 6%)',
                      border: '1px solid hsl(215 28% 17%)',
                      color: 'hsl(213 31% 91%)',
                    },
                  }}
                />
              </AuthProvider>
            </QueryClientProvider>
          </BrowserRouter>
        </HelmetProvider>
      </React.StrictMode>
    );
  });
