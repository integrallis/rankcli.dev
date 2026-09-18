// The question the AI-visibility check puts to each assistant.
//
// It used to name the brand ("What are some good alternatives to Vercel?"), so every answer
// repeated the name in its first line and scored as a #1 mention - every site looked visible.
// A real measurement asks what a buyer would ask, about the category, and checks whether the
// assistant brings the brand up on its own. The category comes from the site's own title and
// description, turned into a buyer's question by a cheap model; without a model, the
// description itself is the question.
//
// Node copy: packages/audit-worker/src/visibility-question.ts - keep in step.

import { callChatCompletion, type AIProviderConfig } from './ai-provider.ts';

export interface VisibilityQuestion {
  question: string;
  category: string | null;
  // True only for the last-resort fallback, when the site gave us nothing to go on. Results
  // from a brand-naming question overstate visibility, so callers can say so.
  namesBrand: boolean;
}

const PRIVATE_HOST = /^(localhost|.*\.local|.*\.internal|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1\]?$|\[?f[cd][0-9a-f]{2}:)/i;

function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
}

export function pageSignals(html: string): { title: string; description: string } {
  const title = /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1] ?? '';
  // content="..." may contain the other quote character (content="Vercel's ..."), so match
  // the closing quote to the opening one.
  const meta = (name: string) =>
    new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=(["'])(.*?)\\1`, 'i').exec(html)?.[2] ??
    new RegExp(`<meta[^>]+content=(["'])(.*?)\\1[^>]*(?:name|property)=["']${name}["']`, 'i').exec(html)?.[2] ?? '';
  return { title: decode(title), description: decode(meta('description') || meta('og:description')) };
}

// Homepage title and description, or blanks. Hosted: never follows redirects and refuses
// private hosts - the text only ever feeds the question, but the fetch itself must not
// reach internal services.
async function fetchSignals(url: string, fetchFn: typeof fetch): Promise<{ title: string; description: string }> {
  try {
    const parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol) || PRIVATE_HOST.test(parsed.hostname)) return { title: '', description: '' };
    const response = await fetchFn(parsed.toString(), {
      redirect: 'manual',
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'RankCLI-VisibilityCheck/1.0 (+https://rankcli.dev)' },
    });
    if (!response.ok) return { title: '', description: '' };
    return pageSignals((await response.text()).slice(0, 300_000));
  } catch {
    return { title: '', description: '' };
  }
}

function withoutBrand(text: string, brand: string, domain: string): string {
  const names = [brand, domain, domain.split('.')[0]].filter((n) => n.length > 1);
  let out = text;
  for (const name of names) out = out.replace(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '');
  return out.replace(/\s*[|:–—-]\s*$/g, '').replace(/^\s*[|:–—-]\s*/g, '').replace(/\s+/g, ' ').trim();
}

export function namesBrand(text: string, brand: string, domain: string): boolean {
  const t = text.toLowerCase();
  return [brand, domain, domain.split('.')[0]]
    .filter((n) => n.length > 2)
    .some((n) => t.includes(n.toLowerCase()));
}

export async function buildVisibilityQuestion(opts: {
  url: string;
  brand: string;
  domain: string;
  ai?: AIProviderConfig;
  fetchFn?: typeof fetch;
}): Promise<VisibilityQuestion> {
  const { url, brand, domain, ai, fetchFn = fetch } = opts;
  const { title, description } = await fetchSignals(url, fetchFn);

  if (ai && (title || description)) {
    try {
      const raw = await callChatCompletion(
        ai,
        'You name the product category of a website and write the question a buyer in that category would ask an AI assistant. Reply with JSON only.',
        `Website: ${domain}\nTitle: ${title}\nDescription: ${description}\n\n` +
          `Return {"category": "<2-6 word category a buyer would search for, lowercase, no brand or product names>", ` +
          `"question": "<one natural question asking an AI assistant to recommend options in that category; it must not mention ${brand}, ${domain}, or any other brand>"}`,
        { jsonMode: true, maxTokens: 300, temperature: 0 },
      );
      const json = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, '').match(/\{[\s\S]*\}/)?.[0] ?? '{}');
      const category = typeof json.category === 'string' ? json.category.trim() : '';
      const question = typeof json.question === 'string' ? json.question.trim() : '';
      if (question && !namesBrand(question, brand, domain)) {
        return { question, category: category && !namesBrand(category, brand, domain) ? category : null, namesBrand: false };
      }
      if (category && !namesBrand(category, brand, domain)) {
        return { question: `What are the best ${category} options? List your top recommendations.`, category, namesBrand: false };
      }
    } catch {
      // Fall through to the description-based question.
    }
  }

  const usable = (text: string) => withoutBrand(text, brand, domain).replace(/^'s\b\s*/i, '').replace(/[.!]+$/, '').slice(0, 160);
  const about = [usable(description), usable(title)].find((t) => t.split(' ').length >= 3) ?? '';
  if (about) {
    return {
      question: `I'm looking for a tool for this: "${about}". What would you recommend? List your top options.`,
      category: null,
      namesBrand: false,
    };
  }

  return {
    question: `What are some good alternatives to ${brand}? Can you recommend similar tools or services to ${domain}?`,
    category: null,
    namesBrand: true,
  };
}
