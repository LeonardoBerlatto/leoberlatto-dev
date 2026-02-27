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
