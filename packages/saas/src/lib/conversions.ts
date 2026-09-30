/**
 * Conversion events for ad platforms.
 *
 * Only Reddit today, and only because Reddit requires a conversion pixel on every ad group -
 * without one, no campaign can be created at all. The pixel itself is injected at build time
 * by vite.config.ts and only when VITE_REDDIT_PIXEL_ID is set, so on a build without that
 * variable `window.rdt` never exists and every call here is a no-op.
 *
 * That "no-op when absent" property is the point. A tracking call that throws on a build with
 * no pixel would break signup for everyone to serve advertising, which is the wrong way round.
 */

type Rdt = (action: string, event?: string, payload?: Record<string, unknown>) => void;

function rdt(): Rdt | null {
  const fn = (window as unknown as { rdt?: Rdt }).rdt;
  return typeof fn === 'function' ? fn : null;
}

/**
 * Someone finished signing up. This is the event Reddit optimises delivery against, so it is
 * the difference between paying for clicks and paying for accounts.
 */
export function trackSignup(): void {
  try {
    rdt()?.('track', 'SignUp');
  } catch {
    // Never let an ad pixel break the signup it is measuring.
  }
}

/** Someone ran a free audit - the top-of-funnel action the ad creative actually asks for. */
export function trackFreeAudit(): void {
  try {
    rdt()?.('track', 'Search');
  } catch {
    /* as above */
  }
}
