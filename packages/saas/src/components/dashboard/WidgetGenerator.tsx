import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectItem } from '@/components/ui/select';
import { Copy, Check, RefreshCw, Loader2, Code } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WidgetGeneratorProps {
  projects: { id: string; name: string; url: string }[];
}

interface WidgetToken {
  id: string;
  token: string;
  project_id: string;
  created_at: string;
}

export function WidgetGenerator({ projects }: WidgetGeneratorProps) {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showBranding, setShowBranding] = useState(true);
  const [tokens, setTokens] = useState<WidgetToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('widget_tokens')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTokens(data || []);
    } catch (err) {
      console.error('Failed to load widget tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateToken = async () => {
    if (!selectedProject) return;

    setGenerating(true);
    try {
      // Generate a secure random token
      const tokenBytes = new Uint8Array(24);
      crypto.getRandomValues(tokenBytes);
      const token = `widget_${Array.from(tokenBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')}`;

      const { data, error } = await supabase
        .from('widget_tokens')
        .insert({
          project_id: selectedProject,
          token,
        })
        .select()
        .single();

      if (error) throw error;
      setTokens([data, ...tokens]);
    } catch (err) {
      console.error('Failed to generate token:', err);
    } finally {
      setGenerating(false);
    }
  };

  const revokeToken = async (tokenId: string) => {
    try {
      const { error } = await supabase
        .from('widget_tokens')
        .delete()
        .eq('id', tokenId);

      if (error) throw error;
      setTokens(tokens.filter((t) => t.id !== tokenId));
    } catch (err) {
      console.error('Failed to revoke token:', err);
    }
  };

  const getEmbedCode = (token: string) => {
    const params = new URLSearchParams({
      token,
      theme,
      branding: showBranding.toString(),
    });
    return `<div id="rankcli-widget"></div>
<script src="https://rankcli.dev/widget.js?${params.toString()}"></script>`;
  };

  const getIframeCode = (token: string) => {
    const params = new URLSearchParams({
      token,
      theme,
      branding: showBranding.toString(),
    });
    return `<iframe
  src="https://rankcli.dev/widget?${params.toString()}"
  width="340"
  height="180"
  frameborder="0"
  style="border-radius: 12px;"
></iframe>`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedToken = tokens.find((t) => t.project_id === selectedProject);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Embeddable Widget
          </CardTitle>
          <Badge variant="secondary">Agency Feature</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Embed SEO score widgets on your clients' dashboards or your agency website.
          White-label option available to remove RankCLI branding.
        </p>

        {/* Project Selection */}
        <div className="space-y-2">
          <Label>Select Project</Label>
          <Select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Theme Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            >
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Show Branding</Label>
            <div className="flex items-center gap-2 h-10">
              <Switch
                checked={showBranding}
                onCheckedChange={setShowBranding}
              />
              <span className="text-sm text-muted-foreground">
                {showBranding ? 'Visible' : 'Hidden (white-label)'}
              </span>
            </div>
          </div>
        </div>

        {/* Token Management */}
        {selectedProject && (
          <div className="space-y-4">
            {!selectedToken ? (
              <Button
                onClick={generateToken}
                disabled={generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Widget Token
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Token Display */}
                <div className="p-3 rounded-lg bg-muted">
                  <Label className="text-xs">Widget Token</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={selectedToken.token}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => revokeToken(selectedToken.id)}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>

                {/* Embed Code */}
                <div className="space-y-2">
                  <Label>Embed Code (JavaScript)</Label>
                  <div className="relative">
                    <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto">
                      {getEmbedCode(selectedToken.token)}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(getEmbedCode(selectedToken.token))}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* iFrame Alternative */}
                <div className="space-y-2">
                  <Label>Or use iFrame</Label>
                  <div className="relative">
                    <pre className="p-3 rounded-lg bg-muted text-xs overflow-x-auto">
                      {getIframeCode(selectedToken.token)}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(getIframeCode(selectedToken.token))}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div
                    className={`p-4 rounded-lg border ${
                      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
                    }`}
                  >
                    <iframe
                      src={`/widget?token=${selectedToken.token}&theme=${theme}&branding=${showBranding}`}
                      width="340"
                      height="180"
                      frameBorder="0"
                      style={{ borderRadius: '12px' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
