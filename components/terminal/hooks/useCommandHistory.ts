import { useState, useCallback, useMemo } from 'react';

export type HistorySearch = {
  isSearchMode: boolean;
  searchQuery: string;
  searchResults: string[];
  searchIndex: number;
  openSearch: () => void;
  closeSearch: () => void;
  updateSearchQuery: (query: string) => void;
  selectSearchUp: () => void;
  selectSearchDown: () => void;
  acceptSearch: () => string | null;
};

export function useCommandHistory() {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState(0);

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

  const searchResults = useMemo(() => {
    const seen = new Set<string>();
    const unique = [...commandHistory].reverse().filter((cmd) => {
      if (seen.has(cmd)) return false;
      seen.add(cmd);
      return true;
    });
    if (!searchQuery) return unique;
    return unique.filter((cmd) =>
      cmd.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [commandHistory, searchQuery]);

  const openSearch = useCallback(() => {
    setIsSearchMode(true);
    setSearchQuery('');
    setSearchIndex(0);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchMode(false);
    setSearchQuery('');
    setSearchIndex(0);
  }, []);

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    setSearchIndex(0);
  }, []);

  const selectSearchUp = useCallback(() => {
    setSearchIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const selectSearchDown = useCallback(() => {
    setSearchIndex((prev) => Math.min(searchResults.length - 1, prev + 1));
  }, [searchResults.length]);

  const acceptSearch = useCallback((): string | null => {
    return searchResults[searchIndex] ?? null;
  }, [searchResults, searchIndex]);

  const historySearch: HistorySearch = {
    isSearchMode, searchQuery, searchResults, searchIndex,
    openSearch, closeSearch, updateSearchQuery, selectSearchUp, selectSearchDown, acceptSearch,
  };

  return { addToHistory, navigateUp, navigateDown, historySearch };
}
