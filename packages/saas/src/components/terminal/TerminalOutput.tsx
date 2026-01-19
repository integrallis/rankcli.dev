import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TerminalLine {
  type: 'prompt' | 'output' | 'success' | 'error' | 'warning';
  content: string;
  delay?: number;
}

interface TerminalOutputProps {
  lines: TerminalLine[];
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
}

export function TerminalOutput({
  lines,
  className,
  autoPlay = true,
  loop = true,
}: TerminalOutputProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!autoPlay) {
      setVisibleLines(lines.length);
      return;
    }

    let currentLine = 0;
    const showNextLine = () => {
      if (currentLine < lines.length) {
        setVisibleLines(currentLine + 1);
        setIsTyping(lines[currentLine].type === 'prompt');
        currentLine++;
        const delay = lines[currentLine - 1]?.delay || 500;
        setTimeout(showNextLine, delay);
      } else {
        setIsTyping(false);
        if (loop) {
          setTimeout(() => {
            setVisibleLines(0);
            currentLine = 0;
            setTimeout(showNextLine, 1000);
          }, 3000);
        }
      }
    };

    const timer = setTimeout(showNextLine, 500);
    return () => clearTimeout(timer);
  }, [lines, autoPlay, loop]);

  return (
    <div className={cn('terminal', className)}>
      <div className="terminal-header">
        <div className="terminal-dot terminal-dot-red" />
        <div className="terminal-dot terminal-dot-yellow" />
        <div className="terminal-dot terminal-dot-green" />
        <span className="ml-2 text-xs text-muted-foreground">Terminal</span>
      </div>
      <div className="terminal-body min-h-[200px]">
        {lines.slice(0, visibleLines).map((line, index) => (
          <div key={index} className="terminal-line mb-1">
            {line.type === 'prompt' ? (
              <>
                <span className="terminal-prompt">$</span>
                <span className="terminal-command">{line.content}</span>
                {index === visibleLines - 1 && isTyping && (
                  <span className="terminal-cursor" />
                )}
              </>
            ) : (
              <span
                className={cn(
                  'terminal-output',
                  line.type === 'success' && 'terminal-success',
                  line.type === 'error' && 'terminal-error',
                  line.type === 'warning' && 'terminal-warning'
                )}
              >
                {line.content}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Pre-built demo for landing page
export function LandingTerminalDemo() {
  const demoLines: TerminalLine[] = [
    { type: 'prompt', content: 'rankcli audit https://myapp.com', delay: 1500 },
    { type: 'output', content: '', delay: 300 },
    { type: 'output', content: 'Scanning... 47 pages crawled in 12s', delay: 800 },
    { type: 'output', content: '', delay: 200 },
    { type: 'output', content: 'Score: 72/100', delay: 500 },
    { type: 'output', content: '', delay: 200 },
    { type: 'error', content: 'Critical (3):', delay: 400 },
    { type: 'error', content: '  ❌ Missing meta descriptions (8 pages)', delay: 300 },
    { type: 'error', content: '  ❌ No sitemap.xml', delay: 300 },
    { type: 'error', content: '  ❌ Images missing alt text (24 images)', delay: 300 },
    { type: 'output', content: '', delay: 800 },
    { type: 'prompt', content: 'rankcli fix --auto', delay: 1500 },
    { type: 'output', content: '', delay: 300 },
    { type: 'output', content: 'Generating fixes...', delay: 1000 },
    { type: 'output', content: 'Creating branch: rankcli/auto-fix-2024', delay: 500 },
    { type: 'success', content: '✓ PR #47 created with 12 fixes', delay: 500 },
    { type: 'success', content: '  https://github.com/you/app/pull/47', delay: 500 },
  ];

  return <TerminalOutput lines={demoLines} className="w-full max-w-2xl" />;
}
