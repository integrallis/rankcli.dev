// Build-time prerendering (scripts/prerender.ts) loads each public route in
// headless Chromium and saves the rendered HTML. These flags let components
// render their final, visible state in two situations where an entrance
// animation would hide real content:
//
// - while the prerenderer is taking its snapshot (the saved HTML must not
//   contain opacity:0 content), and
// - during the browser's first render over that saved HTML (the content is
//   already on screen, so hiding it to fade it back in would flash).

declare global {
  interface Window {
    /** Set by scripts/prerender.ts before the app boots. */
    __RANKCLI_PRERENDER__?: boolean;
  }
}

export const isPrerendering =
  typeof window !== 'undefined' && window.__RANKCLI_PRERENDER__ === true;

let firstRenderOverPrerender = false;

/** Called by main.tsx before the first render. */
export function setBootedOverPrerender(value: boolean) {
  firstRenderOverPrerender = value;
}

/** Called once the first render has committed. */
export function endFirstRender() {
  firstRenderOverPrerender = false;
}

/** True only for components mounting in the first render over prerendered HTML. */
export function isFirstRenderOverPrerender() {
  return firstRenderOverPrerender;
}
