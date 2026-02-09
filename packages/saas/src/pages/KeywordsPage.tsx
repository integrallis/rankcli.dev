import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Wrench,
  AlertTriangle,
  HelpCircle,
  Loader2,
  Lock,
  ArrowUpRight,
  Lightbulb,
  History,
  Clock,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProject } from '@/hooks/useProjects';
import {
  useKeywords,
  type KeywordRecommendation,
  type FreeToolIdea,
} from '@/hooks/useKeywords';
import { cn } from '@/lib/utils';

export function KeywordsPage() {
  const { id: projectId } = useParams();
  const { project, isLoading: projectLoading } = useProject(projectId);
  const {
    isLoading,
    isLoadingHistory,
    error,
    result,
    history,
    runKeywordResearch,
    submitWizardAnswer,
    rerunWithWizard,
    selectHistoryItem,
  } = useKeywords(projectId);

  // Debug logging
  console.log('[KeywordsPage] render:', {
    projectId,
    projectLoading,
    hasProject: !!project,
    projectName: project?.name,
    isLoadingHistory,
    historyLength: history?.length ?? 0,
    hasResult: !!result,
    error,
  });

  const [showWizard, setShowWizard] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const handleRunAnalysis = () => {
    if (project?.url) {
      runKeywordResearch(project.url);
    }
  };

  const handleSubmitWizardAnswer = () => {
    const question = result?.wizardQuestions[currentQuestionIndex];
    if (question && currentAnswer.trim()) {
      submitWizardAnswer(question.question, currentAnswer.trim());
      setCurrentAnswer('');

      if (currentQuestionIndex < (result?.wizardQuestions.length || 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // All questions answered, re-run with wizard responses
        setShowWizard(false);
        if (project?.url) {
          rerunWithWizard(project.url);
        }
      }
    }
  };

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <p className="text-red-500">Project not found</p>
          <Link to="/dashboard">
            <Button variant="outline" className="mt-4">Return to Dashboard</Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            to={`/dashboard/projects/${projectId}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {project.name}
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              AI Keyword Research
            </h1>
            <p className="text-muted-foreground mt-1">
              Engineering as Marketing - Find keywords and build tools that drive traffic
            </p>
          </div>

          <Button
            onClick={handleRunAnalysis}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Run Analysis
              </>
            )}
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-red-500/50">
            <CardContent className="py-6">
              <p className="text-red-500">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="mb-8">
            <CardContent className="py-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">Analyzing your site...</p>
              <p className="text-muted-foreground">
                Crawling pages, understanding your business, and generating keyword recommendations.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && !isLoading && (
          <>
            {/* Site Summary */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Site Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg">{result.siteSummary.productName}</h3>
                    {result.siteSummary.tagline && (
                      <p className="text-muted-foreground italic mt-1">{result.siteSummary.tagline}</p>
                    )}
                    <p className="mt-3">{result.siteSummary.description}</p>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground text-sm w-28 shrink-0">Target:</span>
                        <span className="text-sm">{result.siteSummary.targetAudience}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground text-sm w-28 shrink-0">Industry:</span>
                        <span className="text-sm">{result.siteSummary.industry}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-muted-foreground text-sm w-28 shrink-0">Focus:</span>
                        <Badge variant="outline" className="capitalize">
                          {result.siteSummary.nicheOrBroad}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Features Detected</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.siteSummary.features.slice(0, 6).map((feature, i) => (
                        <Badge key={i} variant="secondary">{feature}</Badge>
                      ))}
                    </div>

                    {result.siteSummary.competitors.length > 0 && (
                      <>
                        <h4 className="font-medium mb-2">Detected Competitors</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.siteSummary.competitors.map((comp, i) => (
                            <Badge key={i} variant="outline">{comp}</Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Confidence Score */}
            <Card className="mb-8">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold',
                      result.uncertainty.overallConfidence >= 0.7 ? 'bg-green-500/10 text-green-600' :
                      result.uncertainty.overallConfidence >= 0.5 ? 'bg-yellow-500/10 text-yellow-600' :
                      'bg-red-500/10 text-red-600'
                    )}>
                      {Math.round(result.uncertainty.overallConfidence * 100)}%
                    </div>
                    <div>
                      <h3 className="font-semibold">Analysis Confidence</h3>
                      <p className="text-sm text-muted-foreground">{result.uncertainty.explanation}</p>
                    </div>
                  </div>

                  {result.needsWizard && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setShowWizard(true)}
                    >
                      <HelpCircle className="h-4 w-4" />
                      Improve Accuracy
                    </Button>
                  )}
                </div>

                {result.uncertainty.factors.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                    {result.uncertainty.factors.map((factor, i) => (
                      <div key={i} className="text-center">
                        <div className={cn(
                          'text-lg font-semibold',
                          factor.confidence >= 0.7 ? 'text-green-500' :
                          factor.confidence >= 0.5 ? 'text-yellow-500' :
                          'text-red-500'
                        )}>
                          {Math.round(factor.confidence * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">{factor.factor}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Wizard Modal */}
            {showWizard && result.wizardQuestions.length > 0 && (
              <Card className="mb-8 border-primary/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Keyword Wizard
                  </CardTitle>
                  <CardDescription>
                    Answer these questions to improve recommendation accuracy
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Question {currentQuestionIndex + 1} of {result.wizardQuestions.length}</span>
                      <Badge variant={
                        result.wizardQuestions[currentQuestionIndex]?.importance === 'critical' ? 'destructive' :
                        result.wizardQuestions[currentQuestionIndex]?.importance === 'high' ? 'default' :
                        'secondary'
                      }>
                        {result.wizardQuestions[currentQuestionIndex]?.importance}
                      </Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${((currentQuestionIndex + 1) / result.wizardQuestions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-lg">
                      {result.wizardQuestions[currentQuestionIndex]?.question}
                    </Label>
                    <Input
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Your answer..."
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitWizardAnswer()}
                    />
                    <div className="flex justify-between">
                      <Button
                        variant="ghost"
                        onClick={() => setShowWizard(false)}
                      >
                        Skip Wizard
                      </Button>
                      <Button
                        onClick={handleSubmitWizardAnswer}
                        disabled={!currentAnswer.trim()}
                      >
                        {currentQuestionIndex < result.wizardQuestions.length - 1 ? 'Next' : 'Finish & Reanalyze'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Free Tier Teaser */}
            {result.tier === 'free' && result.teaser && (
              <Card className="mb-8 border-primary/50 bg-gradient-to-r from-primary/5 to-transparent">
                <CardContent className="py-8">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {result.teaser.totalKeywordsFound} Keywords Found
                      </h3>
                      <p className="text-muted-foreground mb-4">{result.teaser.upgradeMessage}</p>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {result.teaser.topKeywords.map((kw, i) => (
                          <Badge key={i} variant="outline" className="text-base py-1 px-3">
                            {kw}
                          </Badge>
                        ))}
                        <Badge variant="secondary" className="text-base py-1 px-3">
                          +{result.teaser.totalKeywordsFound - 3} more
                        </Badge>
                      </div>

                      <Button asChild>
                        <Link to="/pricing">
                          Upgrade to Solo - $9/mo
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Keyword Recommendations */}
            {result.recommendations.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Keyword Recommendations
                  </CardTitle>
                  <CardDescription>
                    Keywords prioritized by impact vs effort. Focus on high-impact, low-effort first.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.recommendations.map((keyword, i) => (
                      <KeywordCard key={i} keyword={keyword} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Free Tool Ideas */}
            {result.freeToolIdeas.length > 0 && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Free Tool Ideas
                  </CardTitle>
                  <CardDescription>
                    Build these tools to capture search traffic and convert to paid users.
                    This is "Engineering as Marketing" - the developer's secret SEO weapon.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {result.freeToolIdeas.map((tool, i) => (
                      <ToolIdeaCard key={i} tool={tool} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Results (for paid with no keywords) */}
            {result.tier === 'paid' && result.recommendations.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">More context needed</h3>
                  <p className="text-muted-foreground mb-4">
                    We couldn't generate confident recommendations. Try the wizard to provide more context.
                  </p>
                  <Button onClick={() => setShowWizard(true)} className="gap-2">
                    <HelpCircle className="h-4 w-4" />
                    Start Wizard
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Initial State - No Results Yet */}
        {!result && !isLoading && !error && (
          <Card className="mb-8">
            <CardContent className="py-12 text-center">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI Keyword Research</h3>
              <p className="text-muted-foreground mb-4">
                Analyze your site to discover keyword opportunities and free tool ideas.
              </p>
              <Button onClick={handleRunAnalysis} className="gap-2">
                <Search className="h-4 w-4" />
                Run Keyword Research
              </Button>
            </CardContent>
          </Card>
        )}

        {/* History */}
        {history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Research History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/80 cursor-pointer transition-colors"
                    onClick={() => selectHistoryItem(item)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'text-lg font-bold',
                          item.confidence >= 0.7 ? 'text-green-500' :
                          item.confidence >= 0.5 ? 'text-yellow-500' :
                          'text-red-500'
                        )}
                      >
                        {Math.round(item.confidence * 100)}%
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {item.site_summary?.productName || 'Analysis'}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(item.created_at).toLocaleDateString()} at{' '}
                          {new Date(item.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {item.recommendations?.length || 0} keywords
                      </Badge>
                      <Badge variant="outline">
                        {item.free_tool_ideas?.length || 0} tools
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading History */}
        {isLoadingHistory && history.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-components

function KeywordCard({ keyword }: { keyword: KeywordRecommendation }) {
  const getVolumeColor = (volume: string) => {
    switch (volume) {
      case 'high': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create-page':
        return <Badge variant="outline" className="border-blue-500/50 text-blue-600">Create New Page</Badge>;
      case 'optimize-existing':
        return <Badge variant="outline" className="border-green-500/50 text-green-600">Optimize Existing</Badge>;
      case 'build-tool':
        return <Badge variant="outline" className="border-purple-500/50 text-purple-600">Build Free Tool</Badge>;
      case 'needs-input':
        return <Badge variant="outline" className="border-yellow-500/50 text-yellow-600">Needs More Info</Badge>;
      default:
        return <Badge variant="secondary">Skip</Badge>;
    }
  };

  // Parse rationale for "create-page" to extract suggested URL if present
  const parseCreatePageDetails = (rationale: string) => {
    const urlMatch = rationale.match(/(?:URL|path|suggested path)[:\s]+([\/\w-]+)/i);
    const wordCountMatch = rationale.match(/(\d+[-–]\d+)\s*words?/i);
    return {
      suggestedUrl: urlMatch?.[1],
      wordCount: wordCountMatch?.[1],
    };
  };

  const createPageDetails = keyword.action === 'create-page' ? parseCreatePageDetails(keyword.rationale) : null;

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-medium text-lg">{keyword.keyword}</h4>
          {getActionBadge(keyword.action)}
        </div>

        {/* Action-specific details */}
        {keyword.action === 'create-page' && (
          <div className="mb-3 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
            <p className="text-sm font-medium text-blue-600 mb-1">Create a new page targeting this keyword:</p>
            {createPageDetails?.suggestedUrl && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Suggested URL:</span>{' '}
                <code className="bg-muted px-1 rounded">{createPageDetails.suggestedUrl}</code>
              </p>
            )}
            {createPageDetails?.wordCount && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Target length:</span> {createPageDetails.wordCount} words
              </p>
            )}
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-3">{keyword.rationale}</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span className={getVolumeColor(keyword.searchVolume)}>
              {keyword.searchVolume} volume
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span className={getDifficultyColor(keyword.difficulty)}>
              {keyword.difficulty} difficulty
            </span>
          </span>
          <span className="text-muted-foreground">
            Intent: {keyword.intent}
          </span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <Badge className={cn(
          'mb-1',
          keyword.impact === 'high' ? 'bg-green-500/10 text-green-600' :
          keyword.impact === 'medium' ? 'bg-yellow-500/10 text-yellow-600' :
          'bg-muted text-muted-foreground'
        )}>
          {keyword.impact} impact
        </Badge>
        <div className="text-xs text-muted-foreground">
          {keyword.effort} effort
        </div>
      </div>
    </div>
  );
}

function ToolIdeaCard({ tool }: { tool: FreeToolIdea }) {
  // Check if tool has enhanced fields (new format)
  const hasEnhancedFields = 'inputFormat' in tool && 'outputFormat' in tool;

  return (
    <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Lightbulb className="h-5 w-5 text-purple-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{tool.toolName}</h4>
            {hasEnhancedFields && tool.feasibilityScore && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  tool.feasibilityScore >= 4 ? 'border-green-500/50 text-green-600' :
                  tool.feasibilityScore >= 3 ? 'border-yellow-500/50 text-yellow-600' :
                  'border-red-500/50 text-red-600'
                )}
              >
                Score: {tool.feasibilityScore}/5
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
        </div>
      </div>

      {/* Enhanced: Input/Output Formats */}
      {hasEnhancedFields && (
        <div className="mb-3 p-3 bg-muted/50 rounded-lg space-y-2 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Input: </span>
            <code className="bg-background px-1 rounded text-xs">{tool.inputFormat}</code>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Output: </span>
            <code className="bg-background px-1 rounded text-xs">{tool.outputFormat}</code>
          </div>
          {tool.productTieIn && (
            <div>
              <span className="font-medium text-muted-foreground">Product Tie-in: </span>
              <span className="text-xs">{tool.productTieIn}</span>
            </div>
          )}
          {tool.deepLinkPattern && (
            <div>
              <span className="font-medium text-muted-foreground">Deep Link: </span>
              <code className="bg-background px-1 rounded text-xs">{tool.deepLinkPattern}</code>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Target Keyword:</span>
          <Badge variant="outline">{tool.targetKeyword}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Search Volume:</span>
          <span className={
            tool.searchVolume === 'high' ? 'text-green-500' :
            tool.searchVolume === 'medium' ? 'text-yellow-500' :
            'text-muted-foreground'
          }>{tool.searchVolume}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Build Complexity:</span>
          <Badge variant="secondary" className="capitalize">{tool.buildComplexity}</Badge>
        </div>
      </div>

      {/* Enhanced: Competitor Analysis */}
      {hasEnhancedFields && tool.competitorAnalysis && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-1">Competitive Landscape:</p>
          {tool.competitorAnalysis.existingTools?.length > 0 && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Existing:</span> {tool.competitorAnalysis.existingTools.join(', ')}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Free alternatives:</span>{' '}
            {tool.competitorAnalysis.hasFreeAlternative ? 'Yes' : 'No'}
          </p>
          {tool.competitorAnalysis.ourAdvantage && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Our advantage:</span> {tool.competitorAnalysis.ourAdvantage}
            </p>
          )}
        </div>
      )}

      {/* Enhanced: Implementation Hints */}
      {hasEnhancedFields && tool.implementationHints && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs font-medium text-muted-foreground mb-1">Implementation:</p>
          {tool.implementationHints.suggestedLibraries?.length > 0 && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Libraries:</span>{' '}
              {tool.implementationHints.suggestedLibraries.map((lib, i) => (
                <code key={i} className="bg-background px-1 rounded mr-1">{lib}</code>
              ))}
            </p>
          )}
          {tool.implementationHints.estimatedHours && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Est. time:</span> {tool.implementationHints.estimatedHours} hours
            </p>
          )}
          {tool.implementationHints.canUseExistingOSS && (
            <Badge variant="outline" className="text-xs mt-1 border-green-500/50 text-green-600">
              Can wrap existing OSS
            </Badge>
          )}
        </div>
      )}

      <div className="mt-4 pt-3 border-t">
        <p className="text-xs text-muted-foreground">
          <strong>CTA:</strong> {tool.ctaToProduct}
        </p>
      </div>
    </div>
  );
}
