import { RefObject } from 'react';
import { Command } from '@/lib/commands';
import { parseContent } from '@/lib/parse-content';
import Prompt from './Prompt';
import SkipHint from './SkipHint';
import { HistoryEntry } from './types';

type TerminalOutputProps = {
  history: HistoryEntry[];
  isAnimating: boolean;
  displayedText: string;
  showSkipHint: boolean;
  commands: Record<string, Command>;
  outputRef: RefObject<HTMLDivElement | null>;
};

export default function TerminalOutput({
  history, isAnimating, displayedText, showSkipHint, commands, outputRef,
}: TerminalOutputProps) {
  return (
    <div ref={outputRef} className="output-area terminal-output"
      style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
      {history.map((entry, index) => (
        <div key={index} style={{ marginBottom: '4px' }}>
          {entry.type === 'command' ? (
            <div className="command-line" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Prompt />
              <span style={{
                color: commands[entry.content.trim().toLowerCase()]
                  ? 'var(--dracula-green)' : undefined
              }}>{entry.content}</span>
            </div>
          ) : (
            <div className="output terminal-output-text" style={{ whiteSpace: 'pre-wrap' }}>
              {parseContent(entry.content)}
            </div>
          )}
        </div>
      ))}
      {isAnimating && displayedText && (
        <div style={{ marginBottom: '4px' }}>
          <div className="output terminal-output-text" style={{ whiteSpace: 'pre-wrap' }}>
            {parseContent(displayedText)}
          </div>
          <SkipHint visible={showSkipHint} />
        </div>
      )}
    </div>
  );
}
