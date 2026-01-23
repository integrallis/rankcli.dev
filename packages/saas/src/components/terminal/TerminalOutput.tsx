import { useState, useEffect, useRef } from 'react';
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
  const terminalBodyRef = useRef<HTMLDivElement>(null);

  // Autoscroll to bottom when new lines appear
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [visibleLines]);

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
      <div ref={terminalBodyRef} className="terminal-body h-[176px] overflow-y-auto">
        {lines.slice(0, visibleLines).map((line, index) => (
          <div key={index} className="terminal-line mb-0.5">
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

// Pre-built demo for landing page - uses real CLI output format
export function LandingTerminalDemo() {
  const demoLines: TerminalLine[] = [
    { type: 'prompt', content: 'rankcli audit https://myapp.com', delay: 1200 },
    { type: 'output', content: '🔍 Running comprehensive SEO audit...', delay: 600 },
    { type: 'output', content: '📋 Phase 1: Crawlability checks', delay: 400 },
    { type: 'output', content: '📝 Phase 2: On-page analysis', delay: 400 },
    { type: 'output', content: '🔗 Phase 3: Link validation', delay: 400 },
    { type: 'success', content: '✅ Audit complete!', delay: 500 },
    { type: 'output', content: '', delay: 200 },
    { type: 'output', content: '📊 Score: 54/100 🟠 Needs Work', delay: 600 },
    { type: 'output', content: '❌ Errors: 2  ⚠️ Warnings: 36  ✅ Passed: 272', delay: 400 },
    { type: 'output', content: '', delay: 600 },
    { type: 'prompt', content: 'rankcli fix --auto', delay: 1200 },
    { type: 'output', content: 'Creating branch rankcli/seo-fixes...', delay: 500 },
    { type: 'success', content: '✓ PR #127 created with 14 fixes', delay: 400 },
  ];

  return <TerminalOutput lines={demoLines} className="w-full" />;
}
