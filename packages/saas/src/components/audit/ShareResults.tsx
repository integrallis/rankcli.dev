import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Twitter, Linkedin, Link2, Check, Mail } from 'lucide-react';

interface ShareResultsProps {
  url: string;
  score: number;
  onEmailCapture?: (email: string) => Promise<boolean>;
}

export function ShareResults({ url, score, onEmailCapture }: ShareResultsProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  // Extract domain for cleaner sharing
  let domain = '';
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = url;
  }

  const shareText = `Just ran an SEO audit on ${domain} and scored ${score}/100! Check your site's SEO health:`;
  const shareUrl = 'https://rankcli.dev/free-audit';

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const shareOnLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank');
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${shareUrl}?url=${encodeURIComponent(url)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmailSubmit = async () => {
    if (email && email.includes('@') && onEmailCapture) {
      setEmailStatus('sending');
      try {
        const success = await onEmailCapture(email);
        setEmailStatus(success ? 'sent' : 'error');
      } catch {
        setEmailStatus('error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Share Buttons */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Share2 className="h-4 w-4" />
          <span className="text-sm font-medium">Share Your Results</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={shareOnTwitter}>
            <Twitter className="h-4 w-4 mr-2" />
            Share on X
          </Button>
          <Button variant="outline" size="sm" onClick={shareOnLinkedIn}>
            <Linkedin className="h-4 w-4 mr-2" />
            Share on LinkedIn
          </Button>
          <Button variant="outline" size="sm" onClick={copyLink}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Email Capture */}
      {emailStatus === 'sent' ? (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <span className="font-medium text-green-600">
              Report sent! Check your inbox.
            </span>
          </div>
        </div>
      ) : emailStatus === 'error' ? (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-red-500" />
            <span className="font-medium text-red-600">
              Failed to send report. Please try again.
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setEmailStatus('idle')}
          >
            Try Again
          </Button>
        </div>
      ) : (
        <div className="p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-4 w-4" />
            <span className="text-sm font-medium">Get Report via Email</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Enter your email to receive this audit report with detailed recommendations.
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              disabled={emailStatus === 'sending'}
            />
            <Button 
              onClick={handleEmailSubmit} 
              disabled={!email || !email.includes('@') || emailStatus === 'sending'}
            >
              {emailStatus === 'sending' ? 'Sending...' : 'Send Report'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
