import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Code,
  FileText,
  Link2,
  Loader2,
  Copy,
  Check,
  Download,
  ExternalLink,
  Building2,
  Palette,
  Eye,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProject } from '@/hooks/useProjects';
import { useEntitlement } from '@/hooks/useEntitlement';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface WidgetToken {
  id: string;
  token: string;
  project_id: string;
  created_at: string;
}

interface ClientLink {
  id: string;
  token: string;
  project_id: string;
  expires_at: string | null;
  created_at: string;
}

export function AgencyPage() {
  const { id: projectId } = useParams();
  const { project, audits, issues, isLoading, error } = useProject(projectId);
  // White-label reports, widgets and client links are Agency features
  // (pricing-tiers.json: white_label is agency-only). The tier is the
  // server's (get_my_entitlement), so annual, founding and lifetime Agency
  // plans all count.
  const { data: entitlement, isLoading: entitlementLoading } = useEntitlement();
  const isAgency = entitlement?.tier === 'agency';

  // Widget state
  const [widgetTokens, setWidgetTokens] = useState<WidgetToken[]>([]);
  const [widgetTheme, setWidgetTheme] = useState<'light' | 'dark'>('light');
  const [generatingWidget, setGeneratingWidget] = useState(false);

  // Client link state
  const [clientLinks, setClientLinks] = useState<ClientLink[]>([]);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [linkExpiry, setLinkExpiry] = useState<'7d' | '30d' | 'never'>('30d');

  // PDF state
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [pdfBranding, setPdfBranding] = useState(true);
  const [agencyName, setAgencyName] = useState('');
  const [agencyLogo, setAgencyLogo] = useState('');

  // UI state
  const [copied, setCopied] = useState<string | null>(null);
  const [loadingTokens, setLoadingTokens] = useState(true);

  const latestAudit = audits.find((a) => a.status === 'completed');

  useEffect(() => {
    if (projectId) {
      loadWidgetTokens();
      loadClientLinks();
    }
  }, [projectId]);

  const loadWidgetTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('widget_tokens')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setWidgetTokens(data);
      }
    } catch (err) {
      console.error('Failed to load widget tokens:', err);
    } finally {
      setLoadingTokens(false);
    }
  };

  const loadClientLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('client_links')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setClientLinks(data);
      }
    } catch (err) {
      console.error('Failed to load client links:', err);
    }
  };

  const generateWidgetToken = async () => {
    if (!projectId) return;
    setGeneratingWidget(true);

    try {
      const tokenBytes = new Uint8Array(24);
      crypto.getRandomValues(tokenBytes);
      const token = `widget_${Array.from(tokenBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')}`;

      const { data, error } = await supabase
        .from('widget_tokens')
        .insert({ project_id: projectId, token })
        .select()
        .single();

      if (error) throw error;
      setWidgetTokens([data, ...widgetTokens]);
    } catch (err) {
      console.error('Failed to generate widget token:', err);
    } finally {
      setGeneratingWidget(false);
    }
  };

  const revokeWidgetToken = async (tokenId: string) => {
    try {
      await supabase.from('widget_tokens').delete().eq('id', tokenId);
      setWidgetTokens(widgetTokens.filter((t) => t.id !== tokenId));
    } catch (err) {
      console.error('Failed to revoke token:', err);
    }
  };

  const generateClientLink = async () => {
    if (!projectId) return;
    setGeneratingLink(true);

    try {
      const tokenBytes = new Uint8Array(16);
      crypto.getRandomValues(tokenBytes);
      const token = Array.from(tokenBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const expiresAt =
        linkExpiry === 'never'
          ? null
          : new Date(
              Date.now() + (linkExpiry === '7d' ? 7 : 30) * 24 * 60 * 60 * 1000
            ).toISOString();

      const { data, error } = await supabase
        .from('client_links')
        .insert({
          project_id: projectId,
          token,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) throw error;
      setClientLinks([data, ...clientLinks]);
    } catch (err) {
      console.error('Failed to generate client link:', err);
    } finally {
      setGeneratingLink(false);
    }
  };

  const revokeClientLink = async (linkId: string) => {
    try {
      await supabase.from('client_links').delete().eq('id', linkId);
      setClientLinks(clientLinks.filter((l) => l.id !== linkId));
    } catch (err) {
      console.error('Failed to revoke link:', err);
    }
  };

  const generatePDFReport = async () => {
    if (!latestAudit || !project) return;
    setGeneratingPDF(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/generate-pdf-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          auditId: latestAudit.id,
          projectId: project.id,
          whiteLabel: !pdfBranding,
          agencyName: agencyName || undefined,
          agencyLogo: agencyLogo || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate the report');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/[^\w.-]+/g, '-')}-seo-report.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate the report:', err);
      alert('Failed to generate the report. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // No branding parameter: whether a widget is white-labelled is decided by
  // the server from the owner's plan, never by the embed code.
  const getEmbedCode = (token: string) => {
    const params = new URLSearchParams({
      token,
      theme: widgetTheme,
    });
    return `<div id="rankcli-widget"></div>
<script src="https://rankcli.dev/widget.js?${params.toString()}"></script>`;
  };

  const getIframeCode = (token: string) => {
    const params = new URLSearchParams({
      token,
      theme: widgetTheme,
    });
    return `<iframe
  src="https://rankcli.dev/widget?${params.toString()}"
  width="340"
  height="180"
  frameborder="0"
  style="border-radius: 12px;"
></iframe>`;
  };

  const getClientLinkUrl = (token: string) => {
    return `https://rankcli.dev/report/${token}`;
  };

  if (isLoading || loadingTokens || entitlementLoading) {
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

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <div className="mb-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
          <Card className="border-red-500/50">
            <CardContent className="py-12 text-center">
              <p className="text-red-500">{error || 'Project not found'}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!isAgency) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-8">
          <div className="mb-6">
            <Link
              to={`/dashboard/projects/${projectId}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {project.name}
            </Link>
          </div>
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Agency tools are part of the Agency plan
              </CardTitle>
              <CardDescription>
                White-label client reports, embeddable score widgets and shareable client report
                links come with the Agency plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/account/billing?plan=agency">Upgrade to Agency</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/pricing">Compare plans</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const activeWidgetToken = widgetTokens[0];

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
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Agency Tools</h1>
              <Badge variant="secondary">Agency plan</Badge>
            </div>
            <p className="text-muted-foreground">
              White-label reports, embeddable widgets, and client sharing for{' '}
              <span className="font-medium text-foreground">{project.name}</span>
            </p>
          </div>
        </div>

        <Tabs defaultValue="widgets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="widgets" className="gap-2">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Embeddable</span> Widgets
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="sharing" className="gap-2">
              <Link2 className="h-4 w-4" />
              Client Sharing
            </TabsTrigger>
          </TabsList>

          {/* Widgets Tab */}
          <TabsContent value="widgets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Embeddable Score Widget
                </CardTitle>
                <CardDescription>
                  Embed SEO score widgets on your clients' dashboards or your agency website.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Widget Options */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={widgetTheme === 'light' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setWidgetTheme('light')}
                      >
                        Light
                      </Button>
                      <Button
                        variant={widgetTheme === 'dark' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setWidgetTheme('dark')}
                      >
                        Dark
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Generate Token */}
                {!activeWidgetToken ? (
                  <Button
                    onClick={generateWidgetToken}
                    disabled={generatingWidget}
                    className="w-full sm:w-auto"
                  >
                    {generatingWidget ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Widget Token'
                    )}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    {/* Token Display */}
                    <div className="p-3 rounded-lg bg-muted">
                      <Label className="text-xs text-muted-foreground">Widget Token</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={activeWidgetToken.token}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => revokeWidgetToken(activeWidgetToken.id)}
                        >
                          Revoke
                        </Button>
                      </div>
                    </div>

                    {/* Embed Code */}
                    <div className="space-y-2">
                      <Label>JavaScript Embed</Label>
                      <div className="relative">
                        <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto font-mono">
                          {getEmbedCode(activeWidgetToken.token)}
                        </pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() =>
                            copyToClipboard(
                              getEmbedCode(activeWidgetToken.token),
                              'embed'
                            )
                          }
                        >
                          {copied === 'embed' ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* iFrame Code */}
                    <div className="space-y-2">
                      <Label>iFrame Embed</Label>
                      <div className="relative">
                        <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto font-mono">
                          {getIframeCode(activeWidgetToken.token)}
                        </pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() =>
                            copyToClipboard(
                              getIframeCode(activeWidgetToken.token),
                              'iframe'
                            )
                          }
                        >
                          {copied === 'iframe' ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Live Preview
                      </Label>
                      <div
                        className={cn(
                          'p-6 rounded-lg border inline-block',
                          widgetTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
                        )}
                      >
                        <iframe
                          src={`/widget?token=${activeWidgetToken.token}&theme=${widgetTheme}`}
                          width="340"
                          height="180"
                          frameBorder="0"
                          style={{ borderRadius: '12px' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* PDF Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Client Report
                </CardTitle>
                <CardDescription>
                  Download a printable report to share with clients: open it in a browser
                  and print or save it as a PDF. Optionally add your agency branding for
                  white-label delivery.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!latestAudit ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No audit data available. Run an audit first to generate reports.
                    </p>
                    <Button asChild>
                      <Link to={`/dashboard/projects/${projectId}`}>Go to Project</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Branding Options */}
                    <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Palette className="h-4 w-4" />
                        <Label className="font-medium">White-Label Options</Label>
                      </div>

                      <div className="flex items-center gap-3">
                        <Switch
                          checked={!pdfBranding}
                          onCheckedChange={(v) => setPdfBranding(!v)}
                        />
                        <span className="text-sm">
                          {pdfBranding
                            ? 'Include RankCLI branding'
                            : 'White-label (no RankCLI branding)'}
                        </span>
                      </div>

                      {!pdfBranding && (
                        <div className="grid sm:grid-cols-2 gap-4 pt-2">
                          <div className="space-y-2">
                            <Label htmlFor="agencyName">Your Agency Name</Label>
                            <Input
                              id="agencyName"
                              placeholder="Acme SEO Agency"
                              value={agencyName}
                              onChange={(e) => setAgencyName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="agencyLogo">Logo URL (optional)</Label>
                            <Input
                              id="agencyLogo"
                              placeholder="https://example.com/logo.png"
                              value={agencyLogo}
                              onChange={(e) => setAgencyLogo(e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Report Preview Info */}
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-2">Report Contents</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Overall SEO health score with category breakdown</li>
                        <li>• {issues.filter((i) => i.severity === 'error').length} errors, {issues.filter((i) => i.severity === 'warning').length} warnings, {issues.filter((i) => i.severity === 'notice').length} notices</li>
                        <li>• Detailed issue descriptions and fix recommendations</li>
                        <li>• Performance metrics and benchmarks</li>
                        <li>• AI visibility analysis</li>
                      </ul>
                    </div>

                    <Button
                      onClick={generatePDFReport}
                      disabled={generatingPDF}
                      className="gap-2"
                    >
                      {generatingPDF ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Download Report
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Client Sharing Tab */}
          <TabsContent value="sharing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  Shareable Client Links
                </CardTitle>
                <CardDescription>
                  Generate secure, read-only links to share audit results with clients.
                  Links can be set to expire automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Generate New Link */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="space-y-2 flex-1">
                    <Label>Link Expiration</Label>
                    <div className="flex gap-2">
                      {(['7d', '30d', 'never'] as const).map((exp) => (
                        <Button
                          key={exp}
                          variant={linkExpiry === exp ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setLinkExpiry(exp)}
                        >
                          {exp === '7d' ? '7 days' : exp === '30d' ? '30 days' : 'Never'}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={generateClientLink}
                      disabled={generatingLink}
                    >
                      {generatingLink ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Link'
                      )}
                    </Button>
                  </div>
                </div>

                {/* Active Links */}
                {clientLinks.length > 0 && (
                  <div className="space-y-3">
                    <Label>Active Links</Label>
                    {clientLinks.map((link) => {
                      const isExpired =
                        link.expires_at && new Date(link.expires_at) < new Date();
                      return (
                        <div
                          key={link.id}
                          className={cn(
                            'p-3 rounded-lg border',
                            isExpired ? 'bg-muted/30 opacity-60' : 'bg-muted/50'
                          )}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Input
                              value={getClientLinkUrl(link.token)}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(getClientLinkUrl(link.token), link.id)
                              }
                              disabled={!!isExpired}
                            >
                              {copied === link.id ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              disabled={!!isExpired}
                            >
                              <a
                                href={getClientLinkUrl(link.token)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => revokeClientLink(link.id)}
                            >
                              Revoke
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              Created {new Date(link.created_at).toLocaleDateString()}
                            </span>
                            {link.expires_at && (
                              <>
                                <span>•</span>
                                <span className={isExpired ? 'text-destructive' : ''}>
                                  {isExpired
                                    ? 'Expired'
                                    : `Expires ${new Date(link.expires_at).toLocaleDateString()}`}
                                </span>
                              </>
                            )}
                            {!link.expires_at && (
                              <>
                                <span>•</span>
                                <span>Never expires</span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {clientLinks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No client links generated yet.</p>
                    <p className="text-sm">Create a link to share audit results with clients.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
