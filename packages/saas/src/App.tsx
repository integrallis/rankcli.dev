import { Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DefaultSEO, SEO } from './components/SEO';
import { endFirstRender } from './lib/prerender';
import { publicRoutes, protectedRoutes, NotFoundPage, type AppRoute } from './routes';

// App screens are noindex. Everything behind sign-in is, even without a title.
function routeElement({ page: Page, appTitle }: AppRoute, isProtected: boolean) {
  if (!appTitle && !isProtected) return <Page />;
  return (
    <>
      <SEO title={appTitle} noindex />
      <Page />
    </>
  );
}

function App() {
  useEffect(() => {
    endFirstRender();
  }, []);

  return (
    <>
      <DefaultSEO />
      {/* Navigations run in a transition (see main.tsx), so this fallback
          only shows if a page chunk is still loading on the first render. */}
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Routes>
          {publicRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={routeElement(route, false)} />
          ))}

          <Route element={<ProtectedRoute />}>
            {protectedRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={routeElement(route, true)} />
            ))}
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
