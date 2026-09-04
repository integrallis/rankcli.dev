import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Loader2,
  ExternalLink,
  Twitter,
  Linkedin,
  Facebook,
  MessageCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface OGData {
  title: string;
  description: string;
  image: string;
  url: string;
  siteName?: string;
  type?: string;
}

export function OgImagePreviewPage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [ogData, setOgData] = useState<OGData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchOGData = async () => {
    if (!url) return;

    let normalizedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      normalizedUrl = `https://${url}`;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError(null);
    setOgData(null);

    try {
      // Simulate API call - in production, use a server-side function
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Mock OG data
      const mockData: OGData = {
        title: 'Example Page - Build Amazing Things',
        description: 'This is an example Open Graph description that will appear when the page is shared on social media platforms.',
        image: 'https://via.placeholder.com/1200x630/1a1a2e/ffffff?text=OG+Image+Preview',
        url: normalizedUrl,
        siteName: new URL(normalizedUrl).hostname,
        type: 'website',
      };

      setOgData(mockData);
    } catch (err) {
      setError('Failed to fetch OG data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'OG Image Preview Tool',
    description: 'Preview how your webpage looks when shared on social media. See Facebook, Twitter, LinkedIn, and Slack previews.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Free OG Image Preview - Social Media Card Checker | RankCLI</title>
        <meta
          name="description"
          content="Free tool to preview how your webpage looks when shared on social media. Check Facebook, Twitter, LinkedIn, and Slack previews."
        />
        <meta property="og:title" content="Free OG Image Preview Tool | RankCLI" />
        <meta
          property="og:description"
          content="Preview how your webpage looks when shared on social media. Check Facebook, Twitter, LinkedIn previews."
        />
        <link rel="canonical" href="https://rankcli.dev/tools/og-image-preview" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Navbar />

      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              Free Tool
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">OG Image Preview</h1>
            <p className="text-lg text-muted-foreground">
              See how your page looks when shared on social media.
              Preview Facebook, Twitter, LinkedIn, and Slack cards.
            </p>
          </div>

          {/* Input */}
          <div className="flex gap-2 mb-8">
            <Input
              type="url"
              placeholder="Enter URL to preview (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchOGData()}
              className="flex-1"
            />
            <Button onClick={fetchOGData} disabled={loading || !url}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Preview
                </>
              )}
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 mb-8">
              {error}
            </div>
          )}

          {/* Previews */}
          {ogData && (
            <div className="space-y-8">
              {/* OG Data Summary */}
              <div className="p-4 rounded-lg border bg-card">
                <h2 className="font-semibold mb-3">Open Graph Data Found</h2>
                <div className="grid gap-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-24 shrink-0">Title:</span>
                    <span className="flex items-center gap-2">
                      {ogData.title}
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-24 shrink-0">Description:</span>
                    <span className="flex items-center gap-2 line-clamp-1">
                      {ogData.description}
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-24 shrink-0">Image:</span>
                    <span className="flex items-center gap-2">
                      {ogData.image ? (
                        <>
                          <a
                            href={ogData.image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            View Image <ExternalLink className="h-3 w-3" />
                          </a>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </>
                      ) : (
                        <>
                          <span className="text-red-500">Missing</span>
                          <XCircle className="h-4 w-4 text-red-500" />
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview Tabs */}
              <Tabs defaultValue="facebook" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="facebook" className="flex items-center gap-2">
                    <Facebook className="h-4 w-4" />
                    <span className="hidden sm:inline">Facebook</span>
                  </TabsTrigger>
                  <TabsTrigger value="twitter" className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    <span className="hidden sm:inline">Twitter</span>
                  </TabsTrigger>
                  <TabsTrigger value="linkedin" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    <span className="hidden sm:inline">LinkedIn</span>
                  </TabsTrigger>
                  <TabsTrigger value="slack" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Slack</span>
                  </TabsTrigger>
                </TabsList>

                {/* Facebook Preview */}
                <TabsContent value="facebook" className="mt-6">
                  <div className="max-w-lg mx-auto">
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                      How your link appears on Facebook
                    </p>
                    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                      {ogData.image && (
                        <img
                          src={ogData.image}
                          alt="OG Preview"
                          className="w-full aspect-[1.91/1] object-cover"
                        />
                      )}
                      <div className="p-3 bg-[#f0f2f5]">
                        <p className="text-xs text-gray-500 uppercase">
                          {ogData.siteName || new URL(ogData.url).hostname}
                        </p>
                        <p className="text-[#1c1e21] font-semibold text-base leading-tight mt-1">
                          {ogData.title}
                        </p>
                        <p className="text-[#606770] text-sm mt-1 line-clamp-2">
                          {ogData.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Twitter Preview */}
                <TabsContent value="twitter" className="mt-6">
                  <div className="max-w-lg mx-auto">
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                      How your link appears on Twitter/X
                    </p>
                    <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
                      {ogData.image && (
                        <img
                          src={ogData.image}
                          alt="OG Preview"
                          className="w-full aspect-[2/1] object-cover"
                        />
                      )}
                      <div className="p-3 border-t">
                        <p className="text-[#536471] text-sm">
                          {new URL(ogData.url).hostname}
                        </p>
                        <p className="text-[#0f1419] font-medium text-[15px] leading-tight mt-0.5">
                          {ogData.title}
                        </p>
                        <p className="text-[#536471] text-sm mt-1 line-clamp-2">
                          {ogData.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* LinkedIn Preview */}
                <TabsContent value="linkedin" className="mt-6">
                  <div className="max-w-lg mx-auto">
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                      How your link appears on LinkedIn
                    </p>
                    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                      {ogData.image && (
                        <img
                          src={ogData.image}
                          alt="OG Preview"
                          className="w-full aspect-[1.91/1] object-cover"
                        />
                      )}
                      <div className="p-3 bg-[#f3f2ef]">
                        <p className="text-[rgba(0,0,0,0.9)] font-semibold text-sm leading-tight">
                          {ogData.title}
                        </p>
                        <p className="text-[rgba(0,0,0,0.6)] text-xs mt-1">
                          {new URL(ogData.url).hostname}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Slack Preview */}
                <TabsContent value="slack" className="mt-6">
                  <div className="max-w-lg mx-auto">
                    <p className="text-sm text-muted-foreground mb-4 text-center">
                      How your link appears in Slack
                    </p>
                    <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-l-[#4A154B]">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <p className="text-[#1264a3] font-bold text-sm hover:underline cursor-pointer">
                            {ogData.title}
                          </p>
                          <p className="text-[#1d1c1d] text-sm mt-1 line-clamp-2">
                            {ogData.description}
                          </p>
                          <p className="text-[#616061] text-xs mt-2">
                            {new URL(ogData.url).hostname}
                          </p>
                        </div>
                        {ogData.image && (
                          <img
                            src={ogData.image}
                            alt="OG Preview"
                            className="w-20 h-20 rounded object-cover shrink-0"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Recommendations */}
              <div className="p-6 rounded-xl border bg-card">
                <h2 className="font-semibold mb-4">Recommendations</h2>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Image Size</p>
                      <p className="text-sm text-muted-foreground">
                        Use 1200x630px for best results on all platforms.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Title Length</p>
                      <p className="text-sm text-muted-foreground">
                        Keep titles under 60 characters to avoid truncation.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Description Length</p>
                      <p className="text-sm text-muted-foreground">
                        Aim for 155-200 characters for optimal display.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 text-center">
                <h3 className="text-lg font-semibold mb-2">Generate Perfect OG Images</h3>
                <p className="text-muted-foreground mb-4">
                  RankCLI can automatically generate and optimize OG images for your site.
                  Plus 280+ other SEO checks.
                </p>
                <div className="flex justify-center gap-3">
                  <Link to="/free-audit">
                    <Button>Try Full Audit</Button>
                  </Link>
                  <Link to="/docs">
                    <Button variant="outline">Learn More</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* How It Works (when no result) */}
          {!ogData && !loading && (
            <div className="mt-12">
              <h2 className="text-xl font-semibold mb-6 text-center">Why OG Tags Matter</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-xl border bg-card">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <Facebook className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Higher Click Rates</h3>
                  <p className="text-sm text-muted-foreground">
                    Posts with images get 2.3x more engagement than those without.
                  </p>
                </div>
                <div className="text-center p-6 rounded-xl border bg-card">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Professional Look</h3>
                  <p className="text-sm text-muted-foreground">
                    Proper OG tags make your links look polished and trustworthy.
                  </p>
                </div>
                <div className="text-center p-6 rounded-xl border bg-card">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                    <ExternalLink className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Control Your Message</h3>
                  <p className="text-sm text-muted-foreground">
                    Define exactly what users see when they share your content.
                  </p>
                </div>
              </div>

              <div className="mt-8 p-6 rounded-xl bg-muted/50">
                <h3 className="font-semibold mb-4">Required OG Tags</h3>
                <div className="font-mono text-sm bg-background p-4 rounded-lg overflow-x-auto">
                  <pre className="text-muted-foreground">{`<meta property="og:title" content="Your Page Title" />
<meta property="og:description" content="Page description" />
<meta property="og:image" content="https://example.com/image.png" />
<meta property="og:url" content="https://example.com/page" />
<meta property="og:type" content="website" />`}</pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
