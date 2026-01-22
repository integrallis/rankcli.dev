# RankCLI Agentic SEO Architecture

## Vision

Transform RankCLI from a rule-based SEO checker into an **AI-native SEO automation platform** that uses LLMs throughout the entire audit, analysis, and fix pipeline.

**Core Principle**: Every check that can benefit from contextual understanding should use AI. Pattern matching alone is insufficient for modern SEO.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          RankCLI Agentic Architecture                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │   Crawl &    │ ──► │   AI Audit   │ ──► │  AI Fix Gen  │                │
│  │   Fetch      │     │   Engine     │     │   Engine     │                │
│  └──────────────┘     └──────────────┘     └──────────────┘                │
│         │                    │                    │                         │
│         ▼                    ▼                    ▼                         │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │ Static HTML  │     │ LLM Analysis │     │ Code Gen AI  │                │
│  │ DOM Parser   │     │ - GPT-4o     │     │ - GPT-4o     │                │
│  │ Headers      │     │ - Claude     │     │ - Claude     │                │
│  └──────────────┘     └──────────────┘     └──────────────┘                │
│                              │                    │                         │
│                              ▼                    ▼                         │
│                       ┌──────────────┐     ┌──────────────┐                │
│                       │  Contextual  │     │  GitHub PR   │                │
│                       │  Scoring     │     │  Generator   │                │
│                       └──────────────┘     └──────────────┘                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. AI-Powered Audit Modules

### 2.1 Content Quality Analysis (AI-Native)

**Current State**: Word count threshold checks, text-to-HTML ratio

**Agentic Approach**:
```typescript
interface AIContentAnalysis {
  // LLM analyzes actual content quality
  readabilityScore: number;        // AI-assessed readability
  topicRelevance: number;          // How well content matches title/H1
  contentDepth: 'shallow' | 'moderate' | 'comprehensive';
  keywordNaturalness: number;      // Natural vs keyword-stuffed
  uniqueValueAssessment: string;   // What unique value does this page provide?
  competitorGapAnalysis: string;   // What's missing vs top-ranking pages?
  suggestedImprovements: string[]; // AI-generated content recommendations

  // E-E-A-T Signals (Experience, Expertise, Authority, Trust)
  expertiseSignals: string[];      // Author credentials, citations, etc.
  trustSignals: string[];          // Contact info, privacy policy, etc.
  experienceSignals: string[];     // First-hand experience indicators
}
```

**LLM Prompt Strategy**:
```
Analyze this webpage content for SEO quality:

URL: {url}
Title: {title}
H1: {h1}
Content: {textContent}

Evaluate:
1. Does the content comprehensively answer the likely search intent?
2. Is the writing natural or does it feel keyword-stuffed?
3. What unique value does this page provide vs generic content?
4. What topics are missing that top-ranking pages would cover?
5. Rate the E-E-A-T signals present.

Return JSON with scores and specific recommendations.
```

### 2.2 Meta Tag Intelligence (AI-Enhanced)

**Current State**: Character/pixel length checks

**Agentic Approach**:
```typescript
interface AIMetaAnalysis {
  // Beyond length - analyze effectiveness
  titleEffectiveness: {
    clickPotential: number;        // AI-predicted CTR improvement potential
    keywordPlacement: 'optimal' | 'suboptimal' | 'missing';
    emotionalTriggers: string[];   // Power words, urgency, etc.
    brandingBalance: number;       // Brand vs keyword balance
    suggestedVariations: string[]; // AI-generated better titles
  };

  descriptionEffectiveness: {
    callToAction: boolean;
    uniqueSellingProposition: boolean;
    keywordNaturalness: number;
    suggestedVariations: string[];
  };

  serpPreview: {
    predictedCTR: number;          // AI-predicted click-through rate
    competitiveAnalysis: string;   // How it compares to typical SERP
  };
}
```

### 2.3 AI/LLM Visibility Analysis (New Category)

**Purpose**: Understand how AI systems perceive and use your content

```typescript
interface AIVisibilityAnalysis {
  // How AI sees your content
  llmReadability: {
    score: number;                 // How easily can LLMs parse this?
    structureQuality: number;      // Clear headings, lists, sections
    contextClarity: number;        // Is the topic/purpose clear?
    citationPotential: number;     // Likelihood of being cited by AI
  };

  // AI bot access
  botAccessStatus: {
    gptbot: 'allowed' | 'blocked' | 'partial';
    claudebot: 'allowed' | 'blocked' | 'partial';
    perplexitybot: 'allowed' | 'blocked' | 'partial';
    googleExtended: 'allowed' | 'blocked' | 'partial';
    recommendation: string;        // AI-generated recommendation
  };

  // llms.txt analysis
  llmsTxtAnalysis: {
    exists: boolean;
    quality: number;               // How well-structured is it?
    suggestions: string[];         // AI-generated improvements
    generatedContent?: string;     // AI can generate optimal llms.txt
  };

  // AI citation tracking (requires external API)
  aiMentions?: {
    chatgptMentions: number;
    claudeMentions: number;
    perplexityMentions: number;
    sentimentScore: number;
  };
}
```

### 2.4 Structured Data Intelligence

**Current State**: JSON-LD validation, basic schema detection

**Agentic Approach**:
```typescript
interface AIStructuredDataAnalysis {
  // AI understands context and suggests optimal schema
  currentSchema: object[];

  contextualRecommendations: {
    pageType: string;              // AI-detected: product, article, FAQ, etc.
    recommendedSchemas: string[];  // What schemas should be added
    missingProperties: Record<string, string[]>;  // Per-schema gaps
    richSnippetPotential: string[]; // What rich results could be earned
  };

  // AI generates optimized schema
  generatedSchema: {
    type: string;
    jsonLd: object;
    explanation: string;
  }[];

  // Competitive analysis
  competitorSchemaGaps: string[];  // What schema are competitors using?
}
```

### 2.5 Link Quality Analysis (AI-Enhanced)

**Current State**: Broken link detection, anchor text patterns

**Agentic Approach**:
```typescript
interface AILinkAnalysis {
  internalLinks: {
    topicalRelevance: number;      // Do linked pages relate to this content?
    anchorQuality: 'descriptive' | 'generic' | 'over-optimized';
    linkEquityFlow: string;        // AI analysis of PageRank distribution
    suggestedInternalLinks: {      // AI suggests links to add
      targetUrl: string;
      suggestedAnchor: string;
      reason: string;
    }[];
  };

  externalLinks: {
    authorityAssessment: number;   // Quality of external sources
    relevanceScore: number;
    trustSignals: string[];
    concerningLinks: {             // Links that might hurt
      url: string;
      concern: string;
    }[];
  };
}
```

---

## 3. AI Fix Generation Pipeline

### 3.1 Intelligent Fix Prioritization

```typescript
interface AIFixPrioritization {
  // AI analyzes all issues and prioritizes by impact
  prioritizedIssues: {
    issue: AuditIssue;
    impactScore: number;           // 1-100, AI-estimated
    effortScore: number;           // 1-100, AI-estimated
    roiScore: number;              // impact / effort
    rationale: string;             // Why this priority
  }[];

  // Group into actionable batches
  fixBatches: {
    batch: number;
    theme: string;                 // "Meta Tags", "Schema", etc.
    estimatedImpact: string;
    issues: AuditIssue[];
  }[];
}
```

### 3.2 Framework-Aware Code Generation

The AI fix generator understands different frameworks:

```typescript
const FRAMEWORK_CONTEXT = {
  'next.js': {
    metaTagApproach: 'Metadata API in layout.tsx or generateMetadata()',
    sitemapApproach: 'app/sitemap.ts with generateSitemaps()',
    robotsApproach: 'app/robots.ts export function',
    schemaApproach: 'JSON-LD in layout with script tag',
  },
  'react-vite': {
    metaTagApproach: 'react-helmet-async or vite-plugin-html',
    sitemapApproach: 'vite-plugin-sitemap or build script',
    robotsApproach: 'public/robots.txt static file',
    schemaApproach: 'Inline script in index.html or component',
  },
  'astro': {
    metaTagApproach: 'Layout component with <head> slot',
    sitemapApproach: '@astrojs/sitemap integration',
    robotsApproach: 'src/pages/robots.txt.ts endpoint',
    schemaApproach: 'astro-seo component or inline JSON-LD',
  },
  // ... more frameworks
};
```

### 3.3 Multi-File Fix Orchestration

```typescript
interface AIGeneratedPR {
  // AI generates a coherent set of changes
  files: {
    path: string;
    action: 'create' | 'modify' | 'delete';
    content: string;
    explanation: string;
  }[];

  // PR metadata
  title: string;
  description: string;
  impactSummary: string;
  testingInstructions: string;

  // Rollback plan
  rollbackSteps: string[];
}
```

---

## 4. Competitive Intelligence Module

### 4.1 AI-Powered Competitor Analysis

```typescript
interface CompetitorAnalysis {
  // For a given keyword, analyze top-ranking pages
  async analyzeCompetitors(keyword: string, targetUrl: string): Promise<{
    topResults: {
      url: string;
      title: string;
      description: string;
      wordCount: number;
      headingStructure: string[];
      schemaTypes: string[];
      contentTopics: string[];      // AI-extracted topics
    }[];

    gaps: {
      missingTopics: string[];      // Topics competitors cover that you don't
      missingSchema: string[];
      contentDepthGap: string;
      authorityGap: string;
    };

    recommendations: string[];       // AI-generated action items
  }>;
}
```

### 4.2 SERP Feature Opportunity Detection

```typescript
interface SERPOpportunities {
  // AI analyzes what SERP features are available
  featuredSnippetPotential: {
    eligible: boolean;
    currentHolder?: string;
    requiredChanges: string[];
  };

  faqSchemaOpportunity: {
    eligible: boolean;
    suggestedQuestions: string[];   // AI generates FAQs
  };

  videoOpportunity: boolean;
  imagePackOpportunity: boolean;
  localPackOpportunity: boolean;
}
```

---

## 5. Implementation Phases

### Phase 1: AI Content Analysis (Week 1-2)

**Goal**: Replace rule-based content checks with AI analysis

**Tasks**:
1. Create `AIContentAnalyzer` service
2. Integrate OpenAI GPT-4o API calls
3. Implement content quality scoring
4. Add E-E-A-T signal detection
5. Generate content improvement suggestions

**Key Files**:
```
packages/agent-runtime/src/audit/ai/
├── content-analyzer.ts     # AI content quality analysis
├── meta-optimizer.ts       # AI meta tag optimization
├── prompts/
│   ├── content-analysis.ts
│   ├── meta-optimization.ts
│   └── schema-generation.ts
└── types.ts
```

### Phase 2: AI Meta & Schema Intelligence (Week 2-3)

**Goal**: AI-powered meta tag and structured data generation

**Tasks**:
1. Implement SERP CTR prediction
2. AI-powered title/description generation
3. Context-aware schema suggestions
4. Automatic schema generation
5. Rich snippet opportunity detection

### Phase 3: AI Link Intelligence (Week 3-4)

**Goal**: Understand link quality contextually

**Tasks**:
1. Topical relevance scoring for internal links
2. Authority assessment for external links
3. Internal linking suggestions
4. Anchor text optimization recommendations

### Phase 4: AI Visibility & Bot Analysis (Week 4-5)

**Goal**: Understand how AI systems perceive content

**Tasks**:
1. LLM readability scoring
2. AI bot access optimization
3. llms.txt generation and optimization
4. AI citation potential scoring

### Phase 5: AI Fix Generation Enhancement (Week 5-6)

**Goal**: Make fix generation truly intelligent

**Tasks**:
1. Multi-file fix orchestration
2. Framework-specific code generation
3. Impact-based prioritization
4. Rollback plan generation

### Phase 6: Competitive Intelligence (Week 6-8)

**Goal**: AI-powered competitor analysis

**Tasks**:
1. SERP scraping integration
2. Competitor content analysis
3. Content gap detection
4. SERP feature opportunity detection

---

## 6. AI Model Strategy

### 6.1 Model Selection by Task

| Task | Model | Rationale |
|------|-------|-----------|
| Content Analysis | GPT-4o | Best at nuanced content understanding |
| Meta Generation | GPT-4o-mini | Fast, cost-effective for short text |
| Schema Generation | GPT-4o | Needs structured output accuracy |
| Code Generation | Claude 3.5 Sonnet / GPT-4o | Best at code generation |
| Batch Processing | GPT-4o-mini | Cost-effective for high volume |

### 6.2 Cost Management

```typescript
interface AIUsageConfig {
  // Per-audit limits
  maxTokensPerAudit: number;
  maxApiCallsPerAudit: number;

  // Caching strategy
  cacheContentAnalysis: boolean;   // Cache for same URL
  cacheDuration: number;           // Hours

  // Fallback to rules
  aiFailureFallback: 'rules' | 'skip' | 'error';
}

// Tier-based AI usage
const AI_LIMITS = {
  free: { aiChecks: 5, cacheOnly: true },
  solo: { aiChecks: 20, realtime: true },
  pro: { aiChecks: 50, realtime: true, competitorAnalysis: true },
  agency: { aiChecks: 200, realtime: true, competitorAnalysis: true, whiteLabel: true },
};
```

### 6.3 Prompt Engineering Best Practices

```typescript
// Structured output format
const CONTENT_ANALYSIS_PROMPT = `
You are an expert SEO analyst. Analyze this webpage and return a JSON response.

<webpage>
URL: {url}
Title: {title}
H1: {h1}
Meta Description: {metaDescription}
Content: {textContent}
</webpage>

<task>
Evaluate the content quality for SEO. Consider:
1. Search intent alignment
2. Content comprehensiveness
3. E-E-A-T signals
4. Keyword optimization (natural vs stuffed)
5. Unique value proposition
</task>

<output_format>
{
  "overallScore": 0-100,
  "searchIntentMatch": 0-100,
  "contentDepth": "shallow" | "moderate" | "comprehensive",
  "keywordNaturalness": 0-100,
  "eeatSignals": {
    "experience": [...],
    "expertise": [...],
    "authority": [...],
    "trust": [...]
  },
  "improvements": [
    { "priority": 1-5, "suggestion": "...", "impact": "..." }
  ],
  "uniqueValue": "...",
  "missingTopics": [...]
}
</output_format>
`;
```

---

## 7. Integration Points

### 7.1 Edge Function Integration

```typescript
// Supabase Edge Function: run-audit with AI
async function runAuditWithAI(url: string, options: AuditOptions) {
  // 1. Crawl & parse (existing)
  const pageData = await fetchPage(url);

  // 2. Run rule-based checks (fast, cheap)
  const ruleBasedIssues = await runRuleBasedChecks(pageData);

  // 3. Run AI-powered analysis (slower, costs money)
  if (options.enableAI) {
    const aiAnalysis = await runAIAnalysis(pageData, {
      contentAnalysis: true,
      metaOptimization: true,
      schemaGeneration: options.tier !== 'free',
      competitorAnalysis: options.tier === 'pro' || options.tier === 'agency',
    });

    // Merge AI insights into issues
    issues = mergeAIInsights(ruleBasedIssues, aiAnalysis);
  }

  // 4. Generate AI-powered fixes
  if (options.generateFixes) {
    const fixes = await generateAIFixes(issues, pageData.framework);
    return { issues, fixes };
  }

  return { issues };
}
```

### 7.2 Streaming Results

For real-time feedback in the UI:

```typescript
// Stream AI analysis results as they complete
async function* streamAuditResults(url: string) {
  yield { type: 'status', message: 'Fetching page...' };
  const pageData = await fetchPage(url);

  yield { type: 'status', message: 'Running technical checks...' };
  const technicalIssues = await runTechnicalChecks(pageData);
  yield { type: 'issues', category: 'technical', issues: technicalIssues };

  yield { type: 'status', message: 'AI analyzing content...' };
  const contentAnalysis = await analyzeContentWithAI(pageData);
  yield { type: 'ai_analysis', category: 'content', analysis: contentAnalysis };

  // ... continue streaming
}
```

---

## 8. Success Metrics

### 8.1 Quality Metrics

- **Fix Acceptance Rate**: % of AI-generated fixes merged without modification
- **Issue Relevance Score**: User ratings of issue importance
- **False Positive Rate**: Issues that turn out to be non-issues
- **Competitive Parity**: Match/exceed Seobility, SEOptimer feature set

### 8.2 Performance Metrics

- **Audit Time**: Target <60 seconds including AI analysis
- **API Cost Per Audit**: Target <$0.10 for Pro tier
- **Cache Hit Rate**: >60% for repeat audits

### 8.3 Business Metrics

- **Conversion Rate**: Free audit → Paid signup
- **GitHub PR Merge Rate**: % of generated PRs merged
- **User Retention**: Monthly active audit rate

---

## 9. Differentiation from Competitors

| Feature | RankCLI (Agentic) | Traditional Tools |
|---------|-------------------|-------------------|
| Content Analysis | AI understands context | Word count thresholds |
| Meta Suggestions | AI generates options | "Too long/short" |
| Schema | AI generates JSON-LD | "Missing schema" |
| Fixes | Framework-aware code | Generic advice |
| AI Visibility | First-class support | None |
| Delivery | CLI + GitHub PRs | PDF reports |

---

## 10. Risk Mitigation

### 10.1 AI Reliability

- **Fallback Strategy**: Rule-based checks always run; AI enhances
- **Output Validation**: Schema validation on all AI responses
- **Rate Limiting**: Graceful degradation when API limits hit

### 10.2 Cost Control

- **Tiered AI Usage**: Free tier gets cached/limited AI
- **Caching**: Cache AI results for identical content
- **Batch Processing**: Group API calls for efficiency

### 10.3 Quality Assurance

- **Human Review**: Sample AI outputs for quality
- **Feedback Loop**: User ratings improve prompts
- **A/B Testing**: Compare AI vs rule-based accuracy

---

## Appendix: Competitor Feature Matrix

Based on `/workspace/packages/saas/docs/results/competitor-analysis.md`:

| Feature | Seobility | SEOptimer | Semrush | RankCLI Target |
|---------|-----------|-----------|---------|----------------|
| Checks Count | 200+ | 100+ | 140+ | **250+** |
| AI Analysis | No | Basic | Basic | **Full AI** |
| Auto-Fix | No | No | No | **Yes** |
| GitHub Integration | No | No | No | **Yes** |
| CLI | No | No | No | **Yes** |
| llms.txt | No | Yes | Yes | **Yes + Gen** |
| AI Visibility | No | No | Yes | **Yes** |
| Pixel-based Meta | Yes | No | No | **Yes** |
| Schema Generation | No | No | No | **Yes** |

---

*Document Version: 1.0*
*Last Updated: January 2026*
