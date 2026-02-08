'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import * as Tone from 'tone';
import { executeCommand, COMMANDS } from '@/lib/commands';
import { parseContent } from '@/lib/parse-content';
import { CONTENT } from '@/lib/content';

const TYPING_SPEED_MS = 12;

const INSTANT_COMMANDS = new Set(['banner', 'clear']);

type HistoryEntry = {
  type: 'command' | 'output';
  content: string;
};

export default function Terminal() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [toneStarted, setToneStarted] = useState(false);
  const animatingTextRef = useRef('');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const initTone = useCallback(async () => {
    if (toneStarted) return;
    await Tone.start();
    setToneStarted(true);
  }, [toneStarted]);

  const playChime = useCallback(async () => {
    if (!toneStarted) return;
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.1 },
      volume: -18,
    }).toDestination();
    const now = Tone.now();
    synth.triggerAttackRelease('C5', '16n', now);
    setTimeout(() => {
      const synth2 = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.1 },
        volume: -18,
      }).toDestination();
      synth2.triggerAttackRelease('E5', '16n');
    }, 100);
  }, [toneStarted]);

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
  }, [history, displayedText]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isAnimating) return;

    const fullText = animatingTextRef.current;
    let index = 0;

    const interval = setInterval(() => {
      index++;
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
      } else {
        clearInterval(interval);
        setIsAnimating(false);
        setDisplayedText('');
        setHistory((prev) => [
          ...prev,
          { type: 'output', content: fullText },
        ]);
        playChime();
      }
    }, TYPING_SPEED_MS);

    return () => clearInterval(interval);
  }, [isAnimating, playChime]);

  const handleSubmit = useCallback(() => {
    initTone();
    const trimmed = input.trim();
    if (!trimmed || isAnimating) return;

    const newHistory: HistoryEntry[] = [
      ...history,
      { type: 'command', content: trimmed },
    ];

    const newCommandHistory = [...commandHistory, trimmed];
    const result = executeCommand(trimmed);
    const commandName = trimmed.toLowerCase();
    const shouldBeInstant = result.instant || INSTANT_COMMANDS.has(commandName);

    if (result.clear) {
      setHistory([]);
    } else if (shouldBeInstant) {
      setHistory([...newHistory, { type: 'output', content: result.content }]);
      playChime();
    } else {
      setHistory(newHistory);
      animatingTextRef.current = result.content;
      setDisplayedText('');
      setIsAnimating(true);
    }

    setCommandHistory(newCommandHistory);
    setInput('');
    setHistoryIndex(newCommandHistory.length);

    setTimeout(() => inputRef.current?.focus(), 0);
  }, [input, history, commandHistory, isAnimating, initTone, playChime]);

   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
     if (e.key === 'Enter') {
       e.preventDefault();
       handleSubmit();
     } else if (e.key === 'ArrowUp') {
       e.preventDefault();
       if (historyIndex > 0) {
         const newIndex = historyIndex - 1;
         setHistoryIndex(newIndex);
         setInput(commandHistory[newIndex]);
       }
     } else if (e.key === 'ArrowDown') {
       e.preventDefault();
       if (historyIndex < commandHistory.length - 1) {
         const newIndex = historyIndex + 1;
         setHistoryIndex(newIndex);
         setInput(commandHistory[newIndex]);
       } else {
         setHistoryIndex(commandHistory.length);
         setInput('');
       }
     } else if (e.key === 'Tab') {
       e.preventDefault();
       const commandNames = Object.keys(COMMANDS);
       const matches = commandNames.filter(cmd =>
         cmd.toLowerCase().startsWith(input.toLowerCase().trim())
       );

       if (matches.length === 1) {
         setInput(matches[0]);
       } else if (matches.length > 1) {
         setHistory([...history, {
           type: 'output',
           content: matches.join('  ')
         }]);
       }
     }
   };

  const handleContainerClick = () => {
    initTone();
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
        className="output-area terminal-output"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {history.map((entry, index) => (
          <div key={index} style={{ marginBottom: '4px' }}>
            {entry.type === 'command' ? (
              <div className="command-line" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Prompt />
                <span>{entry.content}</span>
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
          </div>
        )}
      </div>

      <div
        className="input-line terminal-input-line"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
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
          disabled={isAnimating}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          className="terminal-input"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--dracula-foreground)',
            fontFamily: 'inherit',
            caretColor: 'var(--dracula-green)',
            padding: 0,
            opacity: isAnimating ? 0.5 : 1,
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
