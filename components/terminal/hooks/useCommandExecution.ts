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
