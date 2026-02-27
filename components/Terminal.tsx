'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { executeCommand, buildCommands, Command } from '@/lib/commands';
import { parseContent } from '@/lib/parse-content';
import { Content } from '@/lib/content';

const TYPING_SPEED_MS = 12;

const INSTANT_COMMANDS = new Set(['banner', 'clear']);

type ToneModule = typeof import('tone');
let toneModule: ToneModule | null = null;
const loadTone = async (): Promise<ToneModule> => {
  if (!toneModule) {
    toneModule = await import('tone');
  }
  return toneModule;
};

type HistoryEntry = {
  type: 'command' | 'output';
  content: string;
};

type TerminalProps = {
  content: Content;
};

export default function Terminal({ content }: TerminalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [toneStarted, setToneStarted] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);
  const animatingTextRef = useRef('');
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const commands = useMemo(() => buildCommands(content), [content]);

  const initTone = useCallback(async () => {
    if (toneStarted) return;
    const Tone = await loadTone();
    await Tone.start();
    setToneStarted(true);
  }, [toneStarted]);

  const playChime = useCallback(async () => {
    if (!toneStarted) return;
    const Tone = await loadTone();
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.1 },
      volume: -18,
    }).toDestination();
    const now = Tone.now();
    synth.triggerAttackRelease('C5', '16n', now);
    setTimeout(async () => {
      const Tone = await loadTone();
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
      { type: 'output', content: content.banner },
      { type: 'output', content: 'Type {{green:help}} to see available commands.' },
    ]);
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history, displayedText]);

  useEffect(() => {
    if (!isAnimating) {
      inputRef.current?.focus();
    }
  }, [isAnimating]);

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

  const handleSubmit = useCallback(async () => {
    initTone();
    const trimmed = input.trim();
    if (!trimmed || isAnimating) return;

    const commandEntry: HistoryEntry = { type: 'command', content: trimmed };

    setHistory((prev) => [...prev, commandEntry]);
    setCommandHistory((prev) => {
      const next = [...prev, trimmed];
      setHistoryIndex(next.length);
      return next;
    });
    setInput('');

    const result = await executeCommand(trimmed, commands);
    const commandName = trimmed.toLowerCase();
    const shouldBeInstant = result.instant || INSTANT_COMMANDS.has(commandName);

    if (result.clear) {
      setHistory([]);
    } else if (shouldBeInstant) {
      setHistory((prev) => [...prev, { type: 'output', content: result.content }]);
      playChime();
    } else {
      animatingTextRef.current = result.content;
      setDisplayedText('');
      setIsAnimating(true);
    }

    if (result.openUrl) {
      const { url, delay = 0 } = result.openUrl;
      setTimeout(() => window.open(url, '_blank'), delay);
    }

    setTimeout(() => inputRef.current?.focus(), 0);
  }, [input, isAnimating, initTone, playChime, commands]);

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
       const commandNames = Object.keys(commands);
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

  const updateCursorPos = useCallback(() => {
    setCursorPos(inputRef.current?.selectionStart ?? input.length);
  }, [input.length]);

  const handleContainerClick = () => {
    initTone();
    inputRef.current?.focus();
    setTimeout(updateCursorPos, 0);
  };

  const inputColor = useMemo(() =>
    input.trim() && commands[input.trim().toLowerCase()]
      ? 'var(--dracula-green)'
      : 'var(--dracula-foreground)',
    [input, commands]
  );

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
                <span style={{
                  color: commands[entry.content.trim().toLowerCase()]
                    ? 'var(--dracula-green)'
                    : undefined
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
        <div style={{ flex: 1, position: 'relative', opacity: isAnimating ? 0.5 : 1 }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => { setInput(e.target.value); setTimeout(updateCursorPos, 0); }}
            onKeyDown={(e) => { handleKeyDown(e); setTimeout(updateCursorPos, 0); }}
            onSelect={updateCursorPos}
            disabled={isAnimating}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            className="terminal-input"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'transparent',
              caretColor: 'transparent',
              fontFamily: 'inherit',
              padding: 0,
              width: '100%',
            }}
          />
          <span style={{ color: inputColor, fontFamily: 'inherit', whiteSpace: 'pre' }} aria-hidden>
            {input.slice(0, cursorPos)}
            <span className="block-cursor">{input[cursorPos] ?? ' '}</span>
            {input.slice(cursorPos + 1)}
          </span>
        </div>
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
