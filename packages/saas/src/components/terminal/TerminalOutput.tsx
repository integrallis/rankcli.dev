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
    { type: 'prompt', content: 'rankcli audit https://myapp.com --geo', delay: 1200 },
    { type: 'output', content: '🔍 Running comprehensive SEO audit...', delay: 600 },
    { type: 'output', content: '📋 Phase 1: Crawlability + GEO checks', delay: 400 },
    { type: 'output', content: '🤖 Phase 2: AI crawler access (GPTBot, ClaudeBot)', delay: 400 },
    { type: 'output', content: '📝 Phase 3: On-page + structured data', delay: 400 },
    { type: 'success', content: '✅ Audit complete!', delay: 500 },
    { type: 'output', content: '', delay: 200 },
    { type: 'output', content: '📊 Score: 78/100  GEO: 85/100  CWV: A', delay: 600 },
    { type: 'output', content: '✅ GPTBot allowed  ✅ ClaudeBot allowed', delay: 400 },
    { type: 'warning', content: '⚠️ 2 issues: FAQ schema missing, no citations', delay: 400 },
    { type: 'output', content: '', delay: 600 },
    { type: 'prompt', content: 'rankcli apply --auto', delay: 1200 },
    { type: 'output', content: 'Generating Next.js fixes...', delay: 500 },
    { type: 'success', content: '✓ PR #127 created with 8 fixes', delay: 400 },
  ];

  return <TerminalOutput lines={demoLines} className="w-full" />;
}
