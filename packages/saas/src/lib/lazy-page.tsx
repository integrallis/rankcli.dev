import { lazy, type ComponentType } from 'react';

/**
 * A route component that loads on demand, like React.lazy, but can also be
 * loaded ahead of rendering with `preload()`.
 *
 * main.tsx preloads the page for the URL being opened before the first
 * render, so the first render never suspends. That matters for prerendered
 * pages: createRoot replaces the prerendered HTML on its first commit, and
 * if that commit were a Suspense fallback the visitor would see the page
 * vanish and come back.
 */
export interface LazyPage {
  (props: object): JSX.Element;
  preload: () => Promise<unknown>;
}

export function lazyPage<M extends Record<string, unknown>>(
  load: () => Promise<M>,
  exportName: keyof M & string
): LazyPage {
  let Loaded: ComponentType | undefined;
  let pending: Promise<unknown> | undefined;

  const preload = () => {
    pending ??= load().then(
      (module) => {
        Loaded = module[exportName] as ComponentType;
      },
      (error) => {
        // Let the next attempt (e.g. after a deploy replaced the chunk) retry.
        pending = undefined;
        throw error;
      }
    );
    return pending;
  };

  const Lazy = lazy(() => preload().then(() => ({ default: Loaded! })));

  const Page = ((props: object) => (Loaded ? <Loaded {...props} /> : <Lazy {...props} />)) as LazyPage;
  Page.preload = preload;
  return Page;
}
