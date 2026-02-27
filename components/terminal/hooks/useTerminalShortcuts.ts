import { useMemo, useCallback, RefObject, Dispatch, SetStateAction } from 'react';
import { Command } from '@/lib/commands';
import { KeyboardShortcut, matchShortcut } from '@/lib/shortcuts';
import { HistoryEntry } from '../types';

export function useTerminalShortcuts({
  input,
  commands,
  inputRef,
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
