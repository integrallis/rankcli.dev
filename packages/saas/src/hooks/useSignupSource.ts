// Where a visitor came from, kept until they have an account. On the first page load the
// UTM parameters, the landing path and the referrer are stored; after the first sign-in the
// dashboard writes them once to profiles.signup_source, so the outcome report can count
// GitHub App installs by source (docs/OUTCOME_PLAN_2026-11.md, item 4.6). First touch wins:
// a later visit with other parameters does not replace what is stored. Nothing personal is
// kept: no IP, no user agent, and the referrer is reduced to its host.
const SIGNUP_SOURCE_KEY = 'rankcli_signup_source';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

export interface SignupSource {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_path: string;
  referrer?: string;
  /** A referral code from ?ref=, applied after the first sign-in (apply_referral). */
  referral_code?: string;
  captured_at: string;
}

const clean = (value: string | null): string | undefined => {
  const v = (value ?? '').trim().slice(0, 100);
  return v ? v : undefined;
};

/** The referral code in a query string, lowercased, or undefined when there is none. */
export function referralCodeIn(search: string): string | undefined {
  const ref = clean(new URLSearchParams(search).get('ref'));
  return ref && /^[a-z0-9]{4,16}$/i.test(ref) ? ref.toLowerCase() : undefined;
}

/**
 * First touch wins for where a visitor came from, but a referral is a promise to the person
 * who clicked: a stored source without a code takes the code from a later referral link.
 */
export function withReferral(stored: SignupSource, search: string): SignupSource {
  const code = referralCodeIn(search);
  return code && !stored.referral_code ? { ...stored, referral_code: code } : stored;
}

export function buildSignupSource(search: string, pathname: string, referrer: string, now = new Date()): SignupSource | null {
  const params = new URLSearchParams(search);
  const source: SignupSource = { landing_path: pathname.slice(0, 200) || '/', captured_at: now.toISOString() };
  for (const key of UTM_KEYS) {
    const v = clean(params.get(key));
    if (v) source[key] = v;
  }
  const ref = referralCodeIn(search);
  if (ref) source.referral_code = ref;
  try {
    if (referrer) {
      const host = new URL(referrer).hostname;
      if (host && host !== window.location.hostname) source.referrer = host;
    }
  } catch {
    // an unparsable referrer is left out
  }
  // A plain visit to the homepage with no referrer and no parameters says nothing worth storing.
  const hasSignal = UTM_KEYS.some((k) => source[k]) || source.referrer || source.referral_code || source.landing_path !== '/';
  return hasSignal ? source : null;
}

/** Called once on app load. Keeps the first stored source. */
export function captureSignupSource() {
  try {
    const stored = localStorage.getItem(SIGNUP_SOURCE_KEY);
    if (stored) {
      const merged = withReferral(JSON.parse(stored) as SignupSource, window.location.search);
      if (merged.referral_code !== (JSON.parse(stored) as SignupSource).referral_code) {
        localStorage.setItem(SIGNUP_SOURCE_KEY, JSON.stringify(merged));
      }
      return;
    }
    const source = buildSignupSource(window.location.search, window.location.pathname, document.referrer);
    if (source) localStorage.setItem(SIGNUP_SOURCE_KEY, JSON.stringify(source));
  } catch {
    // Storage blocked: the account simply has no recorded source.
  }
}

export function peekSignupSource(): SignupSource | null {
  try {
    const raw = localStorage.getItem(SIGNUP_SOURCE_KEY);
    return raw ? (JSON.parse(raw) as SignupSource) : null;
  } catch {
    return null;
  }
}

export function clearSignupSource() {
  try {
    localStorage.removeItem(SIGNUP_SOURCE_KEY);
  } catch {
    // nothing to clear
  }
}
