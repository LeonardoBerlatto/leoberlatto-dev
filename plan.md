# Terminal.tsx Refactoring Plan

## Goal
Break the 352-line monolithic `components/Terminal.tsx` into focused hooks and sub-components **without changing any behavior**.

## New File Structure

```
components/
  Terminal.tsx                     → thin re-export (preserves import path)
  terminal/
    Terminal.tsx                   → orchestrator (wires hooks + renders sub-components)
    types.ts                      → shared HistoryEntry type
    constants.ts                  → TYPING_SPEED_MS, INSTANT_COMMANDS
    Prompt.tsx                    → Prompt sub-component
    TerminalOutput.tsx            → history + animated text rendering
    TerminalInput.tsx             → input line + cursor overlay
    hooks/
      useAudio.ts                 → Tone.js init + chime
      useTypingAnimation.ts       → animation loop + escape + focus
      useCommandHistory.ts        → arrow key navigation state
      useCommandExecution.ts      → handleSubmit logic
      useTerminalShortcuts.ts     → shortcuts + handleKeyDown + tab completion
      useAutoScroll.ts            → scroll-to-bottom effect
```

---

## Step 1 — Scaffold: `types.ts`, `constants.ts`, `Prompt.tsx`

**`components/terminal/types.ts`**
```ts
export type HistoryEntry = {
  type: 'command' | 'output';
  content: string;
};
```

**`components/terminal/constants.ts`**
```ts
export const TYPING_SPEED_MS = 12;
export const INSTANT_COMMANDS = new Set(['banner', 'clear']);
```

**`components/terminal/Prompt.tsx`**
```tsx
export default function Prompt() {
  return (
    <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
      <span style={{ color: 'var(--dracula-green)' }}>guest</span>
      <span style={{ color: 'var(--dracula-foreground)' }}>@</span>
      <span style={{ color: 'var(--dracula-purple)' }}>leoberlatto.dev</span>
      <span style={{ color: 'var(--dracula-foreground)' }}>:~$ </span>
    </span>
  );
}
```

---

## Step 2 — `useAudio` hook

**`components/terminal/hooks/useAudio.ts`**

Extracts: Tone.js lazy-loading (lines 13-20), `toneStarted` state (line 38), `initTone` (lines 60-65), `playChime` (lines 67-86).

```ts
import { useState, useCallback } from 'react';

type ToneModule = typeof import('tone');
let toneModule: ToneModule | null = null;
const loadTone = async (): Promise<ToneModule> => {
  if (!toneModule) {
    toneModule = await import('tone');
  }
  return toneModule;
};

export function useAudio() {
  const [toneStarted, setToneStarted] = useState(false);

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

  return { initTone, playChime };
}
```

**Interface:** `{ initTone: () => Promise<void>, playChime: () => Promise<void> }`

---

## Step 3 — `useAutoScroll` hook

**`components/terminal/hooks/useAutoScroll.ts`**

Extracts: lines 95-99.

```ts
import { useEffect, RefObject } from 'react';
import { HistoryEntry } from '../types';

export function useAutoScroll(
  outputRef: RefObject<HTMLDivElement | null>,
  history: HistoryEntry[],
  displayedText: string,
) {
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history, displayedText]);
}
```

---

## Step 4 — `useTypingAnimation` hook

**`components/terminal/hooks/useTypingAnimation.ts`**

Extracts: `isAnimating`/`displayedText` state (lines 36-37), `animatingTextRef` (line 40), focus-after-animation effect (lines 101-105), escape handler (lines 107-118), animation loop (lines 120-143).

```ts
import { useState, useRef, useEffect, RefObject } from 'react';
import { TYPING_SPEED_MS } from '../constants';

export function useTypingAnimation(
  onAnimationComplete: (fullText: string) => void,
  onChime: () => void,
  inputRef: RefObject<HTMLInputElement | null>,
) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const animatingTextRef = useRef('');

  // Refocus input after animation ends
  useEffect(() => {
    if (!isAnimating) {
      inputRef.current?.focus();
    }
  }, [isAnimating]);

  // Escape handler to skip animation
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAnimating) {
        e.preventDefault();
        setIsAnimating(false);
        setDisplayedText('');
        onAnimationComplete(animatingTextRef.current);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isAnimating, onAnimationComplete]);

  // Character-by-character animation loop
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
        onAnimationComplete(fullText);
        onChime();
      }
    }, TYPING_SPEED_MS);

    return () => clearInterval(interval);
  }, [isAnimating, onAnimationComplete, onChime]);

  const startAnimation = (text: string) => {
    animatingTextRef.current = text;
    setDisplayedText('');
    setIsAnimating(true);
  };

  return { isAnimating, displayedText, startAnimation };
}
```

**Interface:** `{ isAnimating: boolean, displayedText: string, startAnimation: (text: string) => void }`

**Note:** The orchestrator must wrap `onAnimationComplete` in `useCallback` to avoid re-triggering effects.

---

## Step 5 — `useCommandHistory` hook

**`components/terminal/hooks/useCommandHistory.ts`**

Extracts: `commandHistory`/`historyIndex` state (lines 34-35), arrow key navigation logic (lines 196-210).

```ts
import { useState, useCallback } from 'react';

export function useCommandHistory() {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const addToHistory = useCallback((command: string) => {
    setCommandHistory((prev) => {
      const next = [...prev, command];
      setHistoryIndex(next.length);
      return next;
    });
  }, []);

  const navigateUp = useCallback((): string | null => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      return commandHistory[newIndex];
    }
    return null;
  }, [historyIndex, commandHistory]);

  const navigateDown = useCallback((): string | null => {
    if (historyIndex < commandHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      return commandHistory[newIndex];
    } else {
      setHistoryIndex(commandHistory.length);
      return '';
    }
  }, [historyIndex, commandHistory]);

  return { addToHistory, navigateUp, navigateDown };
}
```

**Interface:**
- `addToHistory(command)` — adds command and resets index to end
- `navigateUp()` — returns previous command string, or `null` if at start
- `navigateDown()` — returns next command string, or `''` if past end

---

## Step 6 — `useCommandExecution` hook

**`components/terminal/hooks/useCommandExecution.ts`**

Extracts: `handleSubmit` (lines 145-181).

```ts
import { useCallback, RefObject, Dispatch, SetStateAction } from 'react';
import { executeCommand, Command } from '@/lib/commands';
import { INSTANT_COMMANDS } from '../constants';
import { HistoryEntry } from '../types';

export function useCommandExecution({
  commands,
  isAnimating,
  initTone,
  playChime,
  startAnimation,
  addToCommandHistory,
  setHistory,
  inputRef,
}: {
  commands: Record<string, Command>;
  isAnimating: boolean;
  initTone: () => Promise<void>;
  playChime: () => Promise<void>;
  startAnimation: (text: string) => void;
  addToCommandHistory: (command: string) => void;
  setHistory: Dispatch<SetStateAction<HistoryEntry[]>>;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const handleSubmit = useCallback(async (input: string) => {
    initTone();
    const trimmed = input.trim();
    if (!trimmed || isAnimating) return;

    const commandEntry: HistoryEntry = { type: 'command', content: trimmed };

    setHistory((prev) => [...prev, commandEntry]);
    addToCommandHistory(trimmed);

    const result = await executeCommand(trimmed, commands);
    const commandName = trimmed.toLowerCase();
    const shouldBeInstant = result.instant || INSTANT_COMMANDS.has(commandName);

    if (result.clear) {
      setHistory([]);
    } else if (shouldBeInstant) {
      setHistory((prev) => [...prev, { type: 'output', content: result.content }]);
      playChime();
    } else {
      startAnimation(result.content);
    }

    if (result.openUrl) {
      const { url, delay = 0 } = result.openUrl;
      setTimeout(() => window.open(url, '_blank'), delay);
    }

    setTimeout(() => inputRef.current?.focus(), 0);
  }, [isAnimating, initTone, playChime, commands, startAnimation, addToCommandHistory, setHistory, inputRef]);

  return { handleSubmit };
}
```

**Key change from original:** `handleSubmit` receives `input` as a parameter instead of closing over it. The orchestrator calls `handleSubmit(input)` then resets input via `setInput('')`.

---

## Step 7 — `useTerminalShortcuts` hook

**`components/terminal/hooks/useTerminalShortcuts.ts`**

Extracts: shortcuts definition (lines 46-58), `handleKeyDown` (lines 183-227), `updateCursorPos` (lines 229-231).

```ts
import { useMemo, useCallback, RefObject, Dispatch, SetStateAction } from 'react';
import { Command } from '@/lib/commands';
import { KeyboardShortcut, matchShortcut } from '@/lib/shortcuts';
import { HistoryEntry } from '../types';

export function useTerminalShortcuts({
  input,
  commands,
  inputRef,
  isAnimating,
  history,
  setInput,
  setHistory,
  setCursorPos,
  handleSubmit,
  navigateUp,
  navigateDown,
}: {
  input: string;
  commands: Record<string, Command>;
  inputRef: RefObject<HTMLInputElement | null>;
  isAnimating: boolean;
  history: HistoryEntry[];
  setInput: Dispatch<SetStateAction<string>>;
  setHistory: Dispatch<SetStateAction<HistoryEntry[]>>;
  setCursorPos: Dispatch<SetStateAction<number>>;
  handleSubmit: (input: string) => Promise<void>;
  navigateUp: () => string | null;
  navigateDown: () => string | null;
}) {
  const shortcuts: KeyboardShortcut[] = useMemo(() => [
    { key: 'l', ctrl: true, handler: () => setHistory([]) },
    { key: 'u', ctrl: true, handler: () => { setInput(''); setCursorPos(0); } },
    { key: 'a', ctrl: true, handler: () => {
      inputRef.current?.setSelectionRange(0, 0);
      setCursorPos(0);
    }},
    { key: 'e', ctrl: true, handler: () => {
      const len = input.length;
      inputRef.current?.setSelectionRange(len, len);
      setCursorPos(len);
    }},
  ], [input, setHistory, setInput, setCursorPos, inputRef]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const matched = matchShortcut(e, shortcuts);
    if (matched) {
      e.preventDefault();
      matched.handler();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const cmd = navigateUp();
      if (cmd !== null) setInput(cmd);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const cmd = navigateDown();
      if (cmd !== null) setInput(cmd);
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
  }, [input.length, setCursorPos, inputRef]);

  return { handleKeyDown, updateCursorPos };
}
```

**Key changes from original:**
- `handleSubmit(input)` + `setInput('')` on Enter (input passed explicitly)
- `navigateUp()`/`navigateDown()` return values used with `setInput` directly

---

## Step 8 — `TerminalOutput` and `TerminalInput` sub-components

**`components/terminal/TerminalOutput.tsx`** — Extracts lines 258-291:
```tsx
import { RefObject } from 'react';
import { Command } from '@/lib/commands';
import { parseContent } from '@/lib/parse-content';
import Prompt from './Prompt';
import { HistoryEntry } from './types';

type TerminalOutputProps = {
  history: HistoryEntry[];
  isAnimating: boolean;
  displayedText: string;
  commands: Record<string, Command>;
  outputRef: RefObject<HTMLDivElement | null>;
};

export default function TerminalOutput({
  history, isAnimating, displayedText, commands, outputRef,
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
        </div>
      )}
    </div>
  );
}
```

**`components/terminal/TerminalInput.tsx`** — Extracts lines 294-337:
```tsx
import { RefObject } from 'react';
import Prompt from './Prompt';

type TerminalInputProps = {
  input: string;
  inputColor: string;
  cursorPos: number;
  isAnimating: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSelect: () => void;
};

export default function TerminalInput({
  input, inputColor, cursorPos, isAnimating, inputRef,
  onInputChange, onKeyDown, onSelect,
}: TerminalInputProps) {
  return (
    <div className="input-line terminal-input-line"
      style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
      <Prompt />
      <div style={{ flex: 1, position: 'relative', opacity: isAnimating ? 0.5 : 1 }}>
        <input ref={inputRef} type="text" value={input}
          onChange={onInputChange} onKeyDown={onKeyDown} onSelect={onSelect}
          disabled={isAnimating} autoFocus spellCheck={false}
          autoComplete="off" autoCapitalize="off"
          className="terminal-input"
          style={{
            position: 'absolute', inset: 0, background: 'transparent',
            border: 'none', outline: 'none', color: 'transparent',
            caretColor: 'transparent', fontFamily: 'inherit', padding: 0, width: '100%',
          }}
        />
        <span style={{ color: inputColor, fontFamily: 'inherit', whiteSpace: 'pre' }} aria-hidden>
          {input.slice(0, cursorPos)}
          <span className="block-cursor">{input[cursorPos] ?? ' '}</span>
          {input.slice(cursorPos + 1)}
        </span>
      </div>
    </div>
  );
}
```

---

## Step 9 — Orchestrator + Re-export

**`components/terminal/Terminal.tsx`** — Composes everything:
```tsx
'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { buildCommands } from '@/lib/commands';
import { Content } from '@/lib/content';
import { HistoryEntry } from './types';
import { useAudio } from './hooks/useAudio';
import { useAutoScroll } from './hooks/useAutoScroll';
import { useTypingAnimation } from './hooks/useTypingAnimation';
import { useCommandHistory } from './hooks/useCommandHistory';
import { useCommandExecution } from './hooks/useCommandExecution';
import { useTerminalShortcuts } from './hooks/useTerminalShortcuts';
import TerminalOutput from './TerminalOutput';
import TerminalInput from './TerminalInput';

type TerminalProps = { content: Content };

export default function Terminal({ content }: TerminalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [input, setInput] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const commands = useMemo(() => buildCommands(content), [content]);

  const { initTone, playChime } = useAudio();

  const onAnimationComplete = useCallback((fullText: string) => {
    setHistory(prev => [...prev, { type: 'output', content: fullText }]);
  }, []);

  const { isAnimating, displayedText, startAnimation } = useTypingAnimation(
    onAnimationComplete, playChime, inputRef,
  );

  const { addToHistory: addToCommandHistory, navigateUp, navigateDown } = useCommandHistory();

  useAutoScroll(outputRef, history, displayedText);

  const { handleSubmit } = useCommandExecution({
    commands, isAnimating, initTone, playChime,
    startAnimation, addToCommandHistory, setHistory, inputRef,
  });

  const { handleKeyDown, updateCursorPos } = useTerminalShortcuts({
    input, commands, inputRef, isAnimating, history,
    setInput, setHistory, setCursorPos, handleSubmit, navigateUp, navigateDown,
  });

  // Initialize history with banner
  useEffect(() => {
    setHistory([
      { type: 'output', content: content.banner },
      { type: 'output', content: 'Type {{green:help}} to see available commands.' },
    ]);
  }, []);

  const handleContainerClick = () => {
    initTone();
    inputRef.current?.focus();
    setTimeout(updateCursorPos, 0);
  };

  const inputColor = useMemo(() =>
    input.trim() && commands[input.trim().toLowerCase()]
      ? 'var(--dracula-green)' : 'var(--dracula-foreground)',
    [input, commands]
  );

  return (
    <div className="terminal-container" onClick={handleContainerClick}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      <TerminalOutput history={history} isAnimating={isAnimating}
        displayedText={displayedText} commands={commands} outputRef={outputRef} />
      <TerminalInput input={input} inputColor={inputColor} cursorPos={cursorPos}
        isAnimating={isAnimating} inputRef={inputRef}
        onInputChange={(e) => { setInput(e.target.value); setTimeout(updateCursorPos, 0); }}
        onKeyDown={(e) => { handleKeyDown(e); setTimeout(updateCursorPos, 0); }}
        onSelect={updateCursorPos} />
    </div>
  );
}
```

**`components/Terminal.tsx`** — Becomes a one-line re-export:
```tsx
export { default } from './terminal/Terminal';
```

---

## Step 10 — Update `docs/project-structure.md`

Replace the `Terminal.tsx` entry under `components/` with:
```
- `components/`
  - `Terminal.tsx`: re-exports terminal component (preserves import path).
  - `terminal/`
    - `Terminal.tsx`: orchestrator — wires hooks and sub-components.
    - `types.ts`: shared `HistoryEntry` type.
    - `constants.ts`: `TYPING_SPEED_MS`, `INSTANT_COMMANDS`.
    - `Prompt.tsx`: prompt display sub-component.
    - `TerminalOutput.tsx`: history + animated text rendering.
    - `TerminalInput.tsx`: input line + cursor overlay.
    - `hooks/`
      - `useAudio.ts`: Tone.js init + chime.
      - `useTypingAnimation.ts`: character-by-character animation + escape.
      - `useCommandHistory.ts`: arrow key navigation state.
      - `useCommandExecution.ts`: command dispatch logic.
      - `useTerminalShortcuts.ts`: keyboard shortcuts + tab completion.
      - `useAutoScroll.ts`: scroll-to-bottom effect.
```

---

## Verification Checklist

1. `npm run build` — must pass
2. `npm run lint` — no new errors
3. Manual: type `about` — typing animation works, Escape skips it
4. Manual: `clear`, `banner` — instant commands work
5. Manual: ArrowUp/Down — history navigation works
6. Manual: Tab — autocomplete works
7. Manual: Ctrl+L/U/A/E — shortcuts work
8. Manual: chime plays on command completion
