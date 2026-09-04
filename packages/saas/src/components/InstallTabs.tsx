import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface InstallMethod {
  id: string;
  label: string;
  lines: string[];
}

const METHODS: InstallMethod[] = [
  {
    id: 'npm',
    label: 'npm',
    lines: ['npm install -g @rankcli/cli'],
  },
  {
    id: 'brew',
    label: 'Homebrew',
    lines: ['brew install integrallis/tap/rankcli'],
  },
  {
    id: 'scoop',
    label: 'Scoop',
    lines: [
      'scoop bucket add integrallis https://github.com/integrallis/scoop-bucket',
      'scoop install rankcli',
    ],
  },
];

/**
 * Tabbed install-command strip (npm / Homebrew / Scoop), each with its own
 * copy button. Ordered by expected popularity: npm is the universal,
 * already-installed-for-most-devs default; Homebrew has a large macOS/Linux
 * install base; Scoop is real but comparatively niche even among Windows
 * developers.
 */
export function InstallTabs({ className }: { className?: string }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Tabs defaultValue="npm" className={cn('w-full max-w-2xl', className)}>
      <TabsList>
        {METHODS.map((method) => (
          <TabsTrigger key={method.id} value={method.id}>
            {method.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {METHODS.map((method) => {
        const text = method.lines.join('\n');
        return (
          <TabsContent key={method.id} value={method.id} className="w-full">
            {/* w-full at every level (not just the Tabs root) - a flex
                parent with items-center lets children shrink-wrap to their
                own content even under width:100%, so each level needs it
                explicitly or the strip resizes per tab. min-h reserves
                space for the tallest tab (Scoop, 2 lines) so switching
                tabs doesn't change height either. whitespace-pre keeps the
                longest line (the Scoop bucket URL) from wrapping, and
                text-left overrides the text-center inherited from Hero's
                ancestor container. */}
            <div className="w-full flex items-start gap-2 min-h-[4.5rem]">
              <pre className="flex-1 min-w-0 px-3 py-2 bg-card border border-border rounded-md font-mono text-sm text-foreground text-left overflow-x-auto whitespace-pre">
                <code>{method.lines.join('\n')}</code>
              </pre>
              <button
                className="p-2 hover:bg-card rounded-md transition-colors border border-transparent hover:border-border shrink-0"
                onClick={() => copy(method.id, text)}
                title="Copy to clipboard"
              >
                {copiedId === method.id ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
