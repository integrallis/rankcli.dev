import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Types matching the edge function
export interface SiteSummary {
  productName: string;
  tagline: string;
  description: string;
  targetAudience: string;
  problemSolved: string;
  uniqueValue: string;
  industry: string;
  nicheOrBroad: 'niche' | 'broad' | 'unknown';
  competitors: string[];
  features: string[];
  pricing: string;
}

export interface UncertaintyAssessment {
  overallConfidence: number;
  factors: {
    factor: string;
    confidence: number;
    reason: string;
  }[];
  questionsToAsk: {
    question: string;
    importance: 'critical' | 'high' | 'medium';
    category: string;
  }[];
  explanation: string;
}

export interface KeywordRecommendation {
  keyword: string;
  searchVolume: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  intent: 'informational' | 'transactional' | 'navigational' | 'commercial';
  relevance: number;
  action: 'create-page' | 'optimize-existing' | 'build-tool' | 'needs-input' | 'skip';
  rationale: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
}

export interface FreeToolIdea {
  toolName: string;
  description: string;
  targetKeyword: string;
  searchVolume: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  buildComplexity: 'simple' | 'moderate' | 'complex';
  ctaToProduct: string;
  /** Enhanced fields for specificity */
  inputFormat?: string;
  outputFormat?: string;
  productTieIn?: string;
  deepLinkPattern?: string;
  competitorAnalysis?: {
    existingTools: string[];
    hasFreeAlternative: boolean;
    ourAdvantage: string;
  };
  implementationHints?: {
    suggestedLibraries: string[];
    estimatedHours: number;
    canUseExistingOSS: boolean;
  };
  feasibilityScore?: number; // 1-5
}

export interface WizardQuestion {
  id: string;
  question: string;
  type: 'text' | 'select' | 'multiselect';
  options?: string[];
  importance: 'critical' | 'high' | 'medium';
  category: string;
}

export interface AIKeywordResult {
  success: boolean;
  tier: 'free' | 'paid';
  siteSummary: SiteSummary;
  uncertainty: UncertaintyAssessment;
  recommendations: KeywordRecommendation[];
  freeToolIdeas: FreeToolIdea[];
  wizardQuestions: WizardQuestion[];
  needsWizard: boolean;
  teaser?: {
    totalKeywordsFound: number;
    topKeywords: string[];
    potentialTraffic: string;
    upgradeMessage: string;
  };
  ciMessage?: string;
}

export interface KeywordResearchRecord {
  id: string;
  project_id: string;
  url: string;
  site_summary: SiteSummary;
  uncertainty: UncertaintyAssessment;
  recommendations: KeywordRecommendation[];
  free_tool_ideas: FreeToolIdea[];
  wizard_responses: Record<string, string> | null;
  confidence: number;
  created_at: string;
}

export function useKeywords(projectId: string | undefined) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIKeywordResult | null>(null);
  const [history, setHistory] = useState<KeywordResearchRecord[]>([]);
  const [wizardResponses, setWizardResponses] = useState<Record<string, string>>({});

  // Fetch existing keyword research results
  const fetchHistory = useCallback(async () => {
    if (!projectId || !user) return;

    setIsLoadingHistory(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('keyword_research_results')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;
      setHistory(data || []);

      // Set the most recent result as current
      if (data && data.length > 0) {
        const latest = data[0];
        setResult({
          success: true,
          tier: 'paid', // Assume paid if we have stored results
          siteSummary: latest.site_summary,
          uncertainty: latest.uncertainty,
          recommendations: latest.recommendations || [],
          freeToolIdeas: latest.free_tool_ideas || [],
          wizardQuestions: [],
          needsWizard: latest.confidence < 0.7,
        });
      }
    } catch (err) {
      console.error('Failed to fetch keyword history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [projectId, user]);

  // Load history on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const runKeywordResearch = useCallback(async (url: string, options?: {
    mode?: 'analyze' | 'wizard' | 'ci';
    minConfidence?: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-keywords`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            url,
            projectId,
            wizardResponses: Object.keys(wizardResponses).length > 0 ? wizardResponses : undefined,
            mode: options?.mode || 'analyze',
            minConfidence: options?.minConfidence || 0.7,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to run keyword research');
      }

      const data = await response.json();
      setResult(data);
      // Refresh history to include the new result
      fetchHistory();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [projectId, wizardResponses, fetchHistory]);

  const submitWizardAnswer = useCallback((questionId: string, answer: string) => {
    setWizardResponses(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  }, []);

  const clearWizardResponses = useCallback(() => {
    setWizardResponses({});
  }, []);

  const rerunWithWizard = useCallback(async (url: string) => {
    return runKeywordResearch(url, { mode: 'wizard' });
  }, [runKeywordResearch]);

  const selectHistoryItem = useCallback((item: KeywordResearchRecord) => {
    setResult({
      success: true,
      tier: 'paid',
      siteSummary: item.site_summary,
      uncertainty: item.uncertainty,
      recommendations: item.recommendations || [],
      freeToolIdeas: item.free_tool_ideas || [],
      wizardQuestions: [],
      needsWizard: item.confidence < 0.7,
    });
  }, []);

  return {
    isLoading,
    isLoadingHistory,
    error,
    result,
    history,
    wizardResponses,
    runKeywordResearch,
    submitWizardAnswer,
    clearWizardResponses,
    rerunWithWizard,
    fetchHistory,
    selectHistoryItem,
  };
}
