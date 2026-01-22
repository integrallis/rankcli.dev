// FREE/OPEN SEO Data Sources
// No paid APIs - uses Google's free endpoints, Wikipedia, and AI estimation
// Sources: Google Suggest, Google Trends (with fallbacks), Wikipedia, SERP scraping
//
// Google Trends Fallbacks (when rate limited):
// 1. PyTrends endpoint patterns (same as Google Trends but different paths)
// 2. Wikipedia page views (correlates with search interest)
// 3. Google Suggest result count (more suggestions = higher interest)
// 4. Exploding Topics free tier (manual fallback)
// 5. AI estimation based on topic characteristics

export interface KeywordSuggestion {
  keyword: string;
  source: 'google_suggest' | 'google_trends' | 'paa' | 'related_searches' | 'wikipedia' | 'ai';
}

export interface KeywordMetrics {
  keyword: string;
  searchVolume: number; // Estimated
  volumeCategory: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  difficulty: number; // 0-100, estimated
  difficultyCategory: 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard';
  cpc: number; // Estimated
  intent: 'informational' | 'transactional' | 'navigational' | 'commercial';
  trend: 'rising' | 'stable' | 'declining' | 'breakout' | 'unknown';
  allintitleEstimate: number;
  kgr: number | null;
  isGoldenKeyword: boolean;
  confidence: number; // 0-100 confidence in our estimates
}

export interface TrendData {
  keyword: string;
  interestOverTime: { date: string; value: number }[];
  relatedQueries: { keyword: string; value: number }[];
  relatedTopics: { topic: string; value: number }[];
  isRising: boolean;
  averageInterest: number;
}

export interface SERPFeatures {
  peopleAlsoAsk: string[];
  relatedSearches: string[];
  featuredSnippet: boolean;
  localPack: boolean;
  knowledgePanel: boolean;
  imageCarousel: boolean;
  videoCarousel: boolean;
  topStories: boolean;
}

// ========== GOOGLE SUGGEST API ==========
// Free, no auth, returns autocomplete suggestions
// Endpoint: suggestqueries.google.com/complete/search

export async function getGoogleSuggestions(params: {
  query: string;
  language?: string;
  country?: string;
  source?: 'web' | 'youtube' | 'shopping' | 'news';
}): Promise<KeywordSuggestion[]> {
  const { query, language = 'en', country = 'us', source = 'web' } = params;

  // Map source to ds parameter
  const dsMap: Record<string, string> = {
    web: '',
    youtube: 'yt',
    shopping: 'sh',
    news: 'n',
  };

  const url = new URL('https://suggestqueries.google.com/complete/search');
  url.searchParams.set('client', 'firefox'); // Returns JSON
  url.searchParams.set('q', query);
  url.searchParams.set('hl', language);
  url.searchParams.set('gl', country);
  if (dsMap[source]) {
    url.searchParams.set('ds', dsMap[source]);
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Google Suggest error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    // Response format: ["query", ["suggestion1", "suggestion2", ...]]
    const suggestions = data[1] || [];

    return suggestions.map((s: string) => ({
      keyword: s,
      source: 'google_suggest' as const,
    }));
  } catch (error) {
    console.error('Google Suggest error:', error);
    return [];
  }
}

// Expand keywords using alphabet soup technique
export async function expandKeywordsAlphabet(seedKeyword: string): Promise<KeywordSuggestion[]> {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const prefixes = ['', 'how to ', 'what is ', 'best ', 'free ', 'top '];
  const suffixes = ['', ' for', ' vs', ' online', ' free', ' tool', ' software'];

  const allSuggestions: KeywordSuggestion[] = [];
  const seen = new Set<string>();

  // Batch requests to avoid rate limiting
  const queries: string[] = [];

  // Add prefix variations
  for (const prefix of prefixes) {
    queries.push(`${prefix}${seedKeyword}`);
  }

  // Add suffix variations
  for (const suffix of suffixes) {
    queries.push(`${seedKeyword}${suffix}`);
  }

  // Add alphabet variations (a-z after keyword)
  for (const letter of alphabet.slice(0, 10)) { // First 10 letters to be nice
    queries.push(`${seedKeyword} ${letter}`);
  }

  // Execute with delays to respect rate limits
  for (const query of queries) {
    const suggestions = await getGoogleSuggestions({ query });
    for (const s of suggestions) {
      if (!seen.has(s.keyword.toLowerCase())) {
        seen.add(s.keyword.toLowerCase());
        allSuggestions.push(s);
      }
    }
    // Small delay between requests
    await new Promise(r => setTimeout(r, 100));
  }

  return allSuggestions;
}

// ========== GOOGLE TRENDS (with multiple fallbacks) ==========
// Primary: Google Trends unofficial API
// Fallbacks: Wikipedia pageviews, Google Suggest depth, heuristic estimation
//
// Free alternatives researched:
// - PyTrends (Python) / google-trends-api (Node) - same endpoints
// - Glimpse API - 10 free/month, then $99/mo
// - Wikipedia pageviews API - strong correlation with search interest
// - Google Suggest result count - more suggestions = higher interest

export async function getGoogleTrends(params: {
  keyword: string;
  geo?: string;
  timeRange?: 'now 1-H' | 'now 4-H' | 'now 1-d' | 'now 7-d' | 'today 1-m' | 'today 3-m' | 'today 12-m' | 'today 5-y';
}): Promise<TrendData | null> {
  const { keyword, geo = 'US', timeRange = 'today 12-m' } = params;

  // Try primary Google Trends endpoint
  const trendsData = await tryGoogleTrendsPrimary(keyword, geo, timeRange);
  if (trendsData) return trendsData;

  // Fallback 1: Try alternative Google Trends endpoint
  const altTrendsData = await tryGoogleTrendsAlternative(keyword, geo);
  if (altTrendsData) return altTrendsData;

  // Fallback 2: Use Wikipedia + Google Suggest to estimate trends
  const estimatedTrends = await estimateTrendsFromAlternativeSources(keyword);
  if (estimatedTrends) return estimatedTrends;

  return null;
}

async function tryGoogleTrendsPrimary(
  keyword: string,
  geo: string,
  timeRange: string
): Promise<TrendData | null> {
  try {
    // Google Trends explore page data
    const exploreUrl = `https://trends.google.com/trends/api/explore?hl=en-US&tz=-420&req=${encodeURIComponent(JSON.stringify({
      comparisonItem: [{ keyword, geo, time: timeRange }],
      category: 0,
      property: '',
    }))}&tz=420`;

    const response = await fetch(exploreUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) return null;

    const text = await response.text();
    // Google prepends ")]}'" to prevent JSON hijacking
    const jsonStr = text.replace(/^\)\]\}',?\n/, '');
    const data = JSON.parse(jsonStr);

    // Parse interest over time
    const timelineData = data?.default?.timelineData || [];
    const relatedQueries = data?.default?.relatedQueries?.[0]?.rankedList?.[0]?.rankedKeyword || [];
    const relatedTopics = data?.default?.relatedTopics?.[0]?.rankedList?.[0]?.rankedKeyword || [];

    if (timelineData.length === 0 && relatedQueries.length === 0) {
      return null; // No data, try fallback
    }

    const interestValues = timelineData.map((d: any) => d.value?.[0] || 0);
    const averageInterest = interestValues.length > 0
      ? interestValues.reduce((a: number, b: number) => a + b, 0) / interestValues.length
      : 50;

    // Determine trend direction
    const recentInterest = interestValues.slice(-4);
    const olderInterest = interestValues.slice(0, 4);
    const recentAvg = recentInterest.length > 0
      ? recentInterest.reduce((a: number, b: number) => a + b, 0) / recentInterest.length
      : 0;
    const olderAvg = olderInterest.length > 0
      ? olderInterest.reduce((a: number, b: number) => a + b, 0) / olderInterest.length
      : 0;

    let isRising = false;
    if (olderAvg > 0 && recentAvg > olderAvg * 1.2) isRising = true;

    return {
      keyword,
      interestOverTime: timelineData.map((d: any) => ({
        date: d.formattedTime,
        value: d.value?.[0] || 0,
      })),
      relatedQueries: relatedQueries.map((q: any) => ({
        keyword: q.query,
        value: q.value,
      })),
      relatedTopics: relatedTopics.map((t: any) => ({
        topic: t.topic?.title || t.topic,
        value: t.value,
      })),
      isRising,
      averageInterest,
    };
  } catch (error) {
    console.log('Google Trends primary failed, trying fallback...');
    return null;
  }
}

async function tryGoogleTrendsAlternative(keyword: string, geo: string): Promise<TrendData | null> {
  try {
    // Alternative endpoint: Google Trends daily trends / realtime
    // This is the endpoint used by pytrends for related queries
    const url = `https://trends.google.com/trends/api/autocomplete/${encodeURIComponent(keyword)}?hl=en-US`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) return null;

    const text = await response.text();
    const jsonStr = text.replace(/^\)\]\}',?\n/, '');
    const data = JSON.parse(jsonStr);

    // Extract topic suggestions as related queries
    const topics = data?.default?.topics || [];

    if (topics.length === 0) return null;

    return {
      keyword,
      interestOverTime: [], // Not available from this endpoint
      relatedQueries: topics.slice(0, 10).map((t: any, i: number) => ({
        keyword: t.title || t.mid || keyword,
        value: 100 - (i * 10), // Estimated relevance
      })),
      relatedTopics: topics.slice(0, 10).map((t: any, i: number) => ({
        topic: t.title || t.type || 'Topic',
        value: 100 - (i * 10),
      })),
      isRising: false, // Unknown from this endpoint
      averageInterest: 50, // Default
    };
  } catch (error) {
    return null;
  }
}

async function estimateTrendsFromAlternativeSources(keyword: string): Promise<TrendData | null> {
  try {
    // Fallback: Use Wikipedia pageviews + Google Suggest to estimate interest

    // 1. Check Wikipedia pageviews (strong correlation with search interest)
    let wikiInterest = 0;
    try {
      const wikiTopic = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('_');
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const formatDate = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');

      const viewsUrl = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/${encodeURIComponent(wikiTopic)}/daily/${formatDate(thirtyDaysAgo)}/${formatDate(today)}`;
      const viewsResponse = await fetch(viewsUrl, {
        headers: { 'User-Agent': 'RankCLI/1.0 (https://rankcli.dev)' },
      });

      if (viewsResponse.ok) {
        const viewsData = await viewsResponse.json();
        const totalViews = viewsData?.items?.reduce((sum: number, item: any) => sum + (item.views || 0), 0) || 0;
        // Normalize: 10k views/month ≈ 50 interest, 100k ≈ 80, 1M ≈ 100
        wikiInterest = Math.min(100, Math.log10(Math.max(totalViews, 1)) * 20);
      }
    } catch (e) {
      // Wikipedia fallback failed
    }

    // 2. Check Google Suggest depth (more suggestions = higher interest)
    let suggestInterest = 0;
    try {
      const suggestions = await getGoogleSuggestions({ query: keyword });
      // 10 suggestions = high interest, 0 = low
      suggestInterest = suggestions.length * 10;
    } catch (e) {
      // Suggest fallback failed
    }

    // Combine signals
    const averageInterest = Math.max(wikiInterest, suggestInterest, 30); // Minimum 30

    // Estimate trend direction based on keyword characteristics
    const isRising = /ai|gpt|chatgpt|llm|machine learning|2024|2025|2026|new|latest/i.test(keyword);

    return {
      keyword,
      interestOverTime: [], // Not available from fallbacks
      relatedQueries: [], // Would need separate lookup
      relatedTopics: [],
      isRising,
      averageInterest,
    };
  } catch (error) {
    return null;
  }
}

// ========== WIKIPEDIA API ==========
// Free, well-documented, great for topic research

export async function getWikipediaData(topic: string): Promise<{
  title: string;
  extract: string;
  categories: string[];
  relatedTopics: string[];
  pageViews: number;
} | null> {
  try {
    // Get page info and extract
    const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'RankCLI/1.0 (https://rankcli.dev)' },
    });

    if (!response.ok) return null;

    const data = await response.json();

    // Get categories
    const categoriesUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(topic)}&prop=categories&format=json&origin=*`;
    const catResponse = await fetch(categoriesUrl);
    const catData = await catResponse.json();
    const pages = catData?.query?.pages || {};
    const pageId = Object.keys(pages)[0];
    const categories = pages[pageId]?.categories?.map((c: any) => c.title.replace('Category:', '')) || [];

    // Get page views (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const formatDate = (d: Date) => d.toISOString().split('T')[0].replace(/-/g, '');

    const viewsUrl = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/all-agents/${encodeURIComponent(topic)}/daily/${formatDate(thirtyDaysAgo)}/${formatDate(today)}`;
    let pageViews = 0;
    try {
      const viewsResponse = await fetch(viewsUrl);
      const viewsData = await viewsResponse.json();
      pageViews = viewsData?.items?.reduce((sum: number, item: any) => sum + (item.views || 0), 0) || 0;
    } catch (e) {
      // Page views API can fail for new/obscure topics
    }

    // Get related topics (links)
    const linksUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(topic)}&prop=links&pllimit=50&format=json&origin=*`;
    const linksResponse = await fetch(linksUrl);
    const linksData = await linksResponse.json();
    const linksPages = linksData?.query?.pages || {};
    const linksPageId = Object.keys(linksPages)[0];
    const relatedTopics = linksPages[linksPageId]?.links?.map((l: any) => l.title).slice(0, 20) || [];

    return {
      title: data.title,
      extract: data.extract,
      categories,
      relatedTopics,
      pageViews,
    };
  } catch (error) {
    console.error('Wikipedia API error:', error);
    return null;
  }
}

// ========== SERP SCRAPING ==========
// Scrape Google SERP for PAA, related searches, and competition data

export async function scrapeSERP(keyword: string): Promise<{
  features: SERPFeatures;
  organicResults: { position: number; url: string; title: string; domain: string }[];
  allintitleEstimate: number;
} | null> {
  try {
    // Encode for Google search
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&hl=en&gl=us`;

    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Parse SERP features (basic regex parsing)
    const features: SERPFeatures = {
      peopleAlsoAsk: extractPAA(html),
      relatedSearches: extractRelatedSearches(html),
      featuredSnippet: html.includes('featured-snippet') || html.includes('data-tts="answers"'),
      localPack: html.includes('local-pack') || html.includes('VkpGBb'),
      knowledgePanel: html.includes('knowledge-panel') || html.includes('kp-wholepage'),
      imageCarousel: html.includes('image-carousel') || html.includes('islrc'),
      videoCarousel: html.includes('video-carousel') || html.includes('video-voyager'),
      topStories: html.includes('top-stories') || html.includes('kp-blk'),
    };

    // Extract organic results (simplified)
    const organicResults = extractOrganicResults(html);

    // Estimate allintitle (we'd need another request for this)
    // For now, estimate based on keyword characteristics
    const allintitleEstimate = estimateAllintitle(keyword);

    return {
      features,
      organicResults,
      allintitleEstimate,
    };
  } catch (error) {
    console.error('SERP scraping error:', error);
    return null;
  }
}

// Extract People Also Ask questions from HTML
function extractPAA(html: string): string[] {
  const paaQuestions: string[] = [];

  // Look for PAA patterns in HTML
  // Pattern 1: data-q attribute
  const dataQMatches = html.matchAll(/data-q="([^"]+)"/g);
  for (const match of dataQMatches) {
    if (match[1] && match[1].includes('?')) {
      paaQuestions.push(decodeHTMLEntities(match[1]));
    }
  }

  // Pattern 2: jsname patterns for PAA
  const jsMatches = html.matchAll(/<div[^>]*class="[^"]*related-question-pair[^"]*"[^>]*>([^<]+)/g);
  for (const match of jsMatches) {
    if (match[1]) {
      paaQuestions.push(decodeHTMLEntities(match[1].trim()));
    }
  }

  // Pattern 3: aria-label for questions
  const ariaMatches = html.matchAll(/aria-label="([^"]+\?)"/g);
  for (const match of ariaMatches) {
    if (match[1] && match[1].length > 10 && match[1].length < 200) {
      paaQuestions.push(decodeHTMLEntities(match[1]));
    }
  }

  return [...new Set(paaQuestions)].slice(0, 10);
}

// Extract related searches from HTML
function extractRelatedSearches(html: string): string[] {
  const relatedSearches: string[] = [];

  // Look for related searches patterns
  // Pattern 1: Related searches section
  const relatedMatches = html.matchAll(/<a[^>]*href="\/search\?[^"]*q=([^&"]+)[^"]*"[^>]*>([^<]+)<\/a>/g);
  for (const match of relatedMatches) {
    const query = decodeURIComponent(match[1]).replace(/\+/g, ' ');
    if (query && query.length > 2 && query.length < 100) {
      relatedSearches.push(query);
    }
  }

  return [...new Set(relatedSearches)].slice(0, 8);
}

// Extract organic results from HTML
function extractOrganicResults(html: string): { position: number; url: string; title: string; domain: string }[] {
  const results: { position: number; url: string; title: string; domain: string }[] = [];

  // Pattern for organic result links
  const linkMatches = html.matchAll(/<a[^>]*href="(https?:\/\/[^"]+)"[^>]*><h3[^>]*>([^<]+)<\/h3>/g);
  let position = 1;

  for (const match of linkMatches) {
    if (position <= 10) {
      const url = match[1];
      const title = decodeHTMLEntities(match[2]);
      const domain = new URL(url).hostname;

      results.push({ position, url, title, domain });
      position++;
    }
  }

  return results;
}

function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

// ========== ALLINTITLE ESTIMATION ==========
// Estimate allintitle results based on keyword characteristics
// This is a heuristic since we can't query allintitle without detection

function estimateAllintitle(keyword: string): number {
  const wordCount = keyword.split(/\s+/).length;
  const hasModifier = /free|best|top|how|what|why|review|vs|versus|alternative|cheap|online|near me/i.test(keyword);
  const hasYear = /202[0-9]|2030/i.test(keyword);
  const hasLocation = /\b(in|near|for)\s+[A-Z][a-z]+/i.test(keyword);
  const isQuestion = /^(how|what|why|when|where|who|which|can|does|is|are)\s/i.test(keyword);
  const hasNumbers = /\d+/.test(keyword);

  // Base estimate: starts high for 1-word keywords
  let estimate = 10000000;

  // Each additional word dramatically reduces competition
  // 1 word: 10M, 2 words: 1M, 3 words: 100K, 4 words: 10K, 5+ words: 1K
  for (let i = 1; i < wordCount; i++) {
    estimate *= 0.1;
  }

  // Modifiers indicate more specific intent = less competition
  if (hasModifier) estimate *= 0.3;
  if (hasYear) estimate *= 0.2;
  if (hasLocation) estimate *= 0.15;
  if (isQuestion) estimate *= 0.4;
  if (hasNumbers) estimate *= 0.5;

  // Long-tail keywords have even less competition
  if (keyword.length > 40) estimate *= 0.3;

  return Math.max(10, Math.round(estimate));
}

// ========== KGR CALCULATION ==========
// Keyword Golden Ratio = allintitle / search volume
// KGR < 0.25 = golden keyword (easy to rank)

export function calculateKGR(allintitle: number, searchVolume: number): number | null {
  // KGR only meaningful for keywords with volume < 250
  if (searchVolume === 0) return null;
  if (searchVolume > 250) return null;
  return allintitle / searchVolume;
}

export function isGoldenKeyword(kgr: number | null): boolean {
  return kgr !== null && kgr < 0.25;
}

// ========== SEARCH VOLUME ESTIMATION ==========
// Estimate search volume based on multiple signals

export async function estimateSearchVolume(params: {
  keyword: string;
  trends?: TrendData | null;
  wikipediaViews?: number;
}): Promise<{
  volume: number;
  category: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  confidence: number;
}> {
  const { keyword, trends, wikipediaViews } = params;

  let volumeEstimate = 0;
  let confidence = 0;

  // Factor 1: Google Trends interest (if available)
  if (trends && trends.averageInterest > 0) {
    // Google Trends scores are 0-100, normalize to volume
    // A score of 100 for a general topic might mean millions of searches
    // A score of 100 for a niche topic might mean thousands
    volumeEstimate += trends.averageInterest * 50;
    confidence += 30;
  }

  // Factor 2: Wikipedia page views (strong correlation with search interest)
  if (wikipediaViews && wikipediaViews > 0) {
    // Wikipedia views correlate roughly with search volume
    // 1000 wiki views/month ≈ 500-2000 searches/month for that topic
    volumeEstimate += wikipediaViews * 0.5;
    confidence += 20;
  }

  // Factor 3: Keyword characteristics heuristics
  const wordCount = keyword.split(/\s+/).length;
  const isGeneric = wordCount <= 2 && !/\d/.test(keyword);
  const isLongTail = wordCount >= 4;
  const hasCommercialIntent = /buy|price|cost|cheap|deal|discount|review|best|top|vs/i.test(keyword);
  const hasInformationalIntent = /how|what|why|guide|tutorial|learn|tips/i.test(keyword);

  // Generic 1-2 word keywords tend to have high volume
  if (isGeneric) volumeEstimate += 5000;
  // Long-tail keywords have lower volume
  if (isLongTail) volumeEstimate = Math.max(100, volumeEstimate * 0.3);
  // Commercial intent keywords tend to have moderate-high volume
  if (hasCommercialIntent) volumeEstimate *= 1.5;
  // Informational keywords can vary widely
  if (hasInformationalIntent) volumeEstimate *= 1.2;

  confidence += 20; // Base confidence from heuristics

  // Determine category
  let category: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  if (volumeEstimate < 100) category = 'very_low';
  else if (volumeEstimate < 500) category = 'low';
  else if (volumeEstimate < 2000) category = 'medium';
  else if (volumeEstimate < 10000) category = 'high';
  else category = 'very_high';

  return {
    volume: Math.round(volumeEstimate),
    category,
    confidence: Math.min(80, confidence), // Cap at 80% since we're estimating
  };
}

// ========== KEYWORD DIFFICULTY ESTIMATION ==========
// Estimate difficulty based on SERP analysis

export function estimateKeywordDifficulty(params: {
  keyword: string;
  organicResults?: { domain: string }[];
  featuredSnippet?: boolean;
  hasPAA?: boolean;
}): {
  difficulty: number;
  category: 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard';
  confidence: number;
} {
  const { keyword, organicResults = [], featuredSnippet = false, hasPAA = false } = params;

  let difficulty = 30; // Base difficulty
  let confidence = 30;

  // Factor 1: Keyword length (longer = easier)
  const wordCount = keyword.split(/\s+/).length;
  if (wordCount >= 5) difficulty -= 20;
  else if (wordCount >= 4) difficulty -= 10;
  else if (wordCount <= 2) difficulty += 20;

  // Factor 2: Question keywords tend to be easier
  if (/^(how|what|why|when|where|who|which)\s/i.test(keyword)) {
    difficulty -= 15;
  }

  // Factor 3: Modifiers often indicate less competition
  if (/free|best|top|review|vs|alternative|cheap|2024|2025|2026/i.test(keyword)) {
    difficulty -= 10;
  }

  // Factor 4: Domain authority of top results (if available)
  const highAuthorityDomains = [
    'wikipedia.org', 'amazon.com', 'ebay.com', 'facebook.com',
    'twitter.com', 'linkedin.com', 'youtube.com', 'reddit.com',
    'quora.com', 'medium.com', 'forbes.com', 'nytimes.com',
    'bbc.com', 'cnn.com', 'gov', '.edu',
  ];

  if (organicResults.length > 0) {
    const top5 = organicResults.slice(0, 5);
    const highAuthorityCount = top5.filter(r =>
      highAuthorityDomains.some(d => r.domain.includes(d))
    ).length;

    difficulty += highAuthorityCount * 10;
    confidence += 20;
  }

  // Factor 5: SERP features
  if (featuredSnippet) {
    // Featured snippet present can be opportunity (you can win it)
    // or competition (Google already answering)
    difficulty += 5;
  }
  if (hasPAA) {
    // PAA indicates Google sees this as informational - opportunity
    difficulty -= 5;
  }

  // Clamp difficulty to 0-100
  difficulty = Math.max(0, Math.min(100, difficulty));

  // Determine category
  let category: 'very_easy' | 'easy' | 'medium' | 'hard' | 'very_hard';
  if (difficulty < 20) category = 'very_easy';
  else if (difficulty < 40) category = 'easy';
  else if (difficulty < 60) category = 'medium';
  else if (difficulty < 80) category = 'hard';
  else category = 'very_hard';

  return {
    difficulty: Math.round(difficulty),
    category,
    confidence: Math.min(70, confidence),
  };
}

// ========== INTENT CLASSIFICATION ==========

export function classifyIntent(keyword: string): 'informational' | 'transactional' | 'navigational' | 'commercial' {
  const kw = keyword.toLowerCase();

  // Transactional - intent to purchase
  if (/buy|purchase|order|price|pricing|cheap|deal|discount|coupon|shop|store|checkout|cart/i.test(kw)) {
    return 'transactional';
  }

  // Commercial investigation - comparing options
  if (/best|top|review|compare|vs|versus|alternative|comparison|rated|recommended/i.test(kw)) {
    return 'commercial';
  }

  // Navigational - looking for specific site/brand
  if (/login|sign in|sign up|download|official|website|\.(com|io|org|net|app)$/i.test(kw)) {
    return 'navigational';
  }

  // Default to informational
  return 'informational';
}

// ========== UNIFIED KEYWORD RESEARCH ==========
// Combines all free sources for comprehensive keyword data

export async function researchKeyword(keyword: string): Promise<KeywordMetrics> {
  // Get Google Trends data
  const trends = await getGoogleTrends({ keyword });

  // Get Wikipedia data for topic relevance
  const wikiData = await getWikipediaData(keyword);

  // Get SERP data (PAA, related, competition signals)
  const serpData = await scrapeSERP(keyword);

  // Estimate search volume
  const volumeData = await estimateSearchVolume({
    keyword,
    trends,
    wikipediaViews: wikiData?.pageViews,
  });

  // Estimate difficulty
  const difficultyData = estimateKeywordDifficulty({
    keyword,
    organicResults: serpData?.organicResults,
    featuredSnippet: serpData?.features.featuredSnippet,
    hasPAA: (serpData?.features.peopleAlsoAsk.length || 0) > 0,
  });

  // Calculate allintitle and KGR
  const allintitleEstimate = serpData?.allintitleEstimate || estimateAllintitle(keyword);
  const kgr = calculateKGR(allintitleEstimate, volumeData.volume);

  // Determine trend
  let trendDirection: 'rising' | 'stable' | 'declining' | 'breakout' | 'unknown' = 'unknown';
  if (trends) {
    if (trends.isRising && trends.averageInterest > 70) trendDirection = 'breakout';
    else if (trends.isRising) trendDirection = 'rising';
    else if (trends.averageInterest < 30) trendDirection = 'declining';
    else trendDirection = 'stable';
  }

  // Estimate CPC based on intent
  const intent = classifyIntent(keyword);
  let cpc = 0.50; // Base CPC
  if (intent === 'transactional') cpc = 2.50;
  else if (intent === 'commercial') cpc = 1.50;
  else if (intent === 'navigational') cpc = 0.75;

  return {
    keyword,
    searchVolume: volumeData.volume,
    volumeCategory: volumeData.category,
    difficulty: difficultyData.difficulty,
    difficultyCategory: difficultyData.category,
    cpc,
    intent,
    trend: trendDirection,
    allintitleEstimate,
    kgr,
    isGoldenKeyword: isGoldenKeyword(kgr),
    confidence: Math.round((volumeData.confidence + difficultyData.confidence) / 2),
  };
}

// ========== BATCH KEYWORD RESEARCH ==========
// Research multiple keywords efficiently

export async function researchKeywords(keywords: string[]): Promise<KeywordMetrics[]> {
  const results: KeywordMetrics[] = [];

  for (const keyword of keywords) {
    const metrics = await researchKeyword(keyword);
    results.push(metrics);

    // Rate limit to be nice to Google
    await new Promise(r => setTimeout(r, 500));
  }

  return results;
}

// ========== KEYWORD DISCOVERY ==========
// Discover new keywords from a seed using free sources

export async function discoverKeywords(params: {
  seedKeyword: string;
  includeFilters?: string[];
  excludeFilters?: string[];
  maxKeywords?: number;
}): Promise<KeywordSuggestion[]> {
  const { seedKeyword, includeFilters = [], excludeFilters = [], maxKeywords = 100 } = params;

  const allKeywords: KeywordSuggestion[] = [];
  const seen = new Set<string>();

  // Source 1: Google Suggest (alphabet expansion)
  console.log('Getting Google Suggest keywords...');
  const suggestKeywords = await expandKeywordsAlphabet(seedKeyword);
  for (const kw of suggestKeywords) {
    if (!seen.has(kw.keyword.toLowerCase())) {
      seen.add(kw.keyword.toLowerCase());
      allKeywords.push(kw);
    }
  }

  // Source 2: Google Trends related queries
  console.log('Getting Google Trends related queries...');
  const trends = await getGoogleTrends({ keyword: seedKeyword });
  if (trends?.relatedQueries) {
    for (const rq of trends.relatedQueries) {
      if (!seen.has(rq.keyword.toLowerCase())) {
        seen.add(rq.keyword.toLowerCase());
        allKeywords.push({ keyword: rq.keyword, source: 'google_trends' });
      }
    }
  }

  // Source 3: SERP PAA and Related Searches
  console.log('Getting SERP data (PAA, Related Searches)...');
  const serp = await scrapeSERP(seedKeyword);
  if (serp) {
    for (const paa of serp.features.peopleAlsoAsk) {
      if (!seen.has(paa.toLowerCase())) {
        seen.add(paa.toLowerCase());
        allKeywords.push({ keyword: paa, source: 'paa' });
      }
    }
    for (const rs of serp.features.relatedSearches) {
      if (!seen.has(rs.toLowerCase())) {
        seen.add(rs.toLowerCase());
        allKeywords.push({ keyword: rs, source: 'related_searches' });
      }
    }
  }

  // Source 4: Wikipedia related topics
  console.log('Getting Wikipedia related topics...');
  const wiki = await getWikipediaData(seedKeyword);
  if (wiki?.relatedTopics) {
    for (const topic of wiki.relatedTopics.slice(0, 10)) {
      if (!seen.has(topic.toLowerCase())) {
        seen.add(topic.toLowerCase());
        allKeywords.push({ keyword: topic, source: 'wikipedia' });
      }
    }
  }

  // Apply include filters
  let filtered = allKeywords;
  if (includeFilters.length > 0) {
    filtered = filtered.filter(kw =>
      includeFilters.some(f => kw.keyword.toLowerCase().includes(f.toLowerCase()))
    );
  }

  // Apply exclude filters
  if (excludeFilters.length > 0) {
    filtered = filtered.filter(kw =>
      !excludeFilters.some(f => kw.keyword.toLowerCase().includes(f.toLowerCase()))
    );
  }

  return filtered.slice(0, maxKeywords);
}
