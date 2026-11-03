import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { heroRun } from '@/data/hero-run/lines';

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
  bodyClassName?: string;
}

export function TerminalOutput({
  lines,
  className,
  autoPlay = true,
  loop = true,
  bodyClassName = 'h-[176px]',
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
      <div ref={terminalBodyRef} className={cn('terminal-body overflow-y-auto', bodyClassName)}>
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
                  'terminal-output whitespace-pre',
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

// The landing-page terminal replays a real recorded audit of rankcli.dev. Its lines come from
// src/data/hero-run/raw.txt (stdout of the published CLI, see scripts/record-hero-run.ts),
// selected verbatim at build time, so the demo cannot drift from what the CLI prints.
export function LandingTerminalDemo() {
  return (
    <figure className="w-full">
      <TerminalOutput lines={heroRun.lines} className="w-full" bodyClassName="h-[372px]" />
      <figcaption className="mt-2 text-xs text-muted-foreground text-center">
        A recorded run of @rankcli/cli {heroRun.cliVersion} against {heroRun.url.replace('https://', '')},{' '}
        {new Date(`${heroRun.recordedAt}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
      </figcaption>
    </figure>
  );
}
