'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { executeCommand } from '@/lib/commands';
import { parseContent } from '@/lib/parse-content';
import { CONTENT } from '@/lib/content';

type HistoryEntry = {
  type: 'command' | 'output';
  content: string;
};

export default function Terminal() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory([
      { type: 'output', content: CONTENT.banner },
      { type: 'output', content: 'Type {{green:help}} to see available commands.' },
    ]);
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const newHistory: HistoryEntry[] = [
      ...history,
      { type: 'command', content: trimmed },
    ];

    const newCommandHistory = [...commandHistory, trimmed];
    const result = executeCommand(trimmed, newCommandHistory);

    if (result.clear) {
      setHistory([]);
    } else {
      setHistory([...newHistory, { type: 'output', content: result.content }]);
    }

    setCommandHistory(newCommandHistory);
    setInput('');

    setTimeout(() => inputRef.current?.focus(), 0);
  }, [input, history, commandHistory]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className="terminal-container"
      onClick={handleContainerClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        ref={outputRef}
        className="output-area"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          paddingBottom: '8px',
        }}
      >
        {history.map((entry, index) => (
          <div key={index} style={{ marginBottom: '4px' }}>
            {entry.type === 'command' ? (
              <div className="command-line" style={{ display: 'flex', gap: '8px' }}>
                <Prompt />
                <span>{entry.content}</span>
              </div>
            ) : (
              <div className="output" style={{ whiteSpace: 'pre-wrap' }}>
                {parseContent(entry.content)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        className="input-line"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px 16px',
          flexShrink: 0,
        }}
      >
        <Prompt />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--dracula-foreground)',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            caretColor: 'var(--dracula-green)',
            padding: 0,
          }}
        />
      </div>
    </div>
  );
}

function Prompt() {
  return (
    <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
      <span style={{ color: 'var(--dracula-green)' }}>guest</span>
      <span style={{ color: 'var(--dracula-foreground)' }}>@</span>
      <span style={{ color: 'var(--dracula-purple)' }}>leoberlatto.dev</span>
      <span style={{ color: 'var(--dracula-foreground)' }}>:~$ </span>
    </span>
  );
}
