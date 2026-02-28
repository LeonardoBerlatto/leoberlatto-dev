import { renderHook, act } from '@testing-library/react';
import { RefObject } from 'react';
import { useTerminalShortcuts } from './useTerminalShortcuts';

const createKeyEvent = (
  key: string,
  options: Partial<React.KeyboardEvent> = {},
) =>
  ({
    key,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    preventDefault: jest.fn(),
    ...options,
  }) as unknown as React.KeyboardEvent<HTMLInputElement>;

function createMockInputRef() {
  return {
    current: { setSelectionRange: jest.fn(), selectionStart: 0 },
  } as unknown as RefObject<HTMLInputElement>;
}

function createMockHistorySearch(overrides: Record<string, unknown> = {}) {
  return {
    isSearchMode: false,
    searchQuery: '',
    searchResults: [] as string[],
    searchIndex: 0,
    openSearch: jest.fn(),
    closeSearch: jest.fn(),
    updateSearchQuery: jest.fn(),
    selectSearchUp: jest.fn(),
    selectSearchDown: jest.fn(),
    acceptSearch: jest.fn().mockReturnValue(null),
    ...overrides,
  };
}

function setup(overrides: Record<string, unknown> = {}) {
  const commands = {
    help: { description: '', handler: jest.fn() },
    history: { description: '', handler: jest.fn() },
    clear: { description: '', handler: jest.fn() },
  };

  const inputRef = createMockInputRef();

  const params = {
    input: '',
    commands,
    inputRef,
    history: [] as { type: 'command' | 'output'; content: string }[],
    setInput: jest.fn(),
    setHistory: jest.fn(),
    setCursorPos: jest.fn(),
    handleSubmit: jest.fn().mockResolvedValue(undefined),
    navigateUp: jest.fn(),
    navigateDown: jest.fn(),
    historySearch: createMockHistorySearch(),
    ...overrides,
  };

  return { params, inputRef, result: renderHook(() => useTerminalShortcuts(params)) };
}

describe('useTerminalShortcuts', () => {
  describe('Ctrl+L', () => {
    it('clears history', () => {
      const { params, result } = setup();

      act(() => {
        result.result.current.handleKeyDown(
          createKeyEvent('l', { ctrlKey: true }),
        );
      });

      expect(params.setHistory).toHaveBeenCalledWith([]);
    });
  });

  describe('Ctrl+U', () => {
    it('clears input and resets cursor to 0', () => {
      const { params, result } = setup({ input: 'some text' });

      act(() => {
        result.result.current.handleKeyDown(
          createKeyEvent('u', { ctrlKey: true }),
        );
      });

      expect(params.setInput).toHaveBeenCalledWith('');
      expect(params.setCursorPos).toHaveBeenCalledWith(0);
    });
  });

  describe('Ctrl+A', () => {
    it('moves cursor to start', () => {
      const { params, inputRef, result } = setup({ input: 'hello' });

      act(() => {
        result.result.current.handleKeyDown(
          createKeyEvent('a', { ctrlKey: true }),
        );
      });

      expect(
        (inputRef.current as unknown as { setSelectionRange: jest.Mock })
          .setSelectionRange,
      ).toHaveBeenCalledWith(0, 0);
      expect(params.setCursorPos).toHaveBeenCalledWith(0);
    });
  });

  describe('Ctrl+E', () => {
    it('moves cursor to end', () => {
      const input = 'hello';
      const { params, inputRef, result } = setup({ input });

      act(() => {
        result.result.current.handleKeyDown(
          createKeyEvent('e', { ctrlKey: true }),
        );
      });

      expect(
        (inputRef.current as unknown as { setSelectionRange: jest.Mock })
          .setSelectionRange,
      ).toHaveBeenCalledWith(input.length, input.length);
      expect(params.setCursorPos).toHaveBeenCalledWith(input.length);
    });
  });

  describe('Enter', () => {
    it('calls handleSubmit with current input and clears input', () => {
      const { params, result } = setup({ input: 'help' });

      act(() => {
        result.result.current.handleKeyDown(createKeyEvent('Enter'));
      });

      expect(params.handleSubmit).toHaveBeenCalledWith('help');
      expect(params.setInput).toHaveBeenCalledWith('');
    });
  });

  describe('ArrowUp', () => {
    it('sets input to previous command from history', () => {
      const navigateUp = jest.fn().mockReturnValue('previous-cmd');
      const { params, result } = setup({ navigateUp });

      act(() => {
        result.result.current.handleKeyDown(createKeyEvent('ArrowUp'));
      });

      expect(navigateUp).toHaveBeenCalled();
      expect(params.setInput).toHaveBeenCalledWith('previous-cmd');
    });

    it('does not set input when navigateUp returns null', () => {
      const navigateUp = jest.fn().mockReturnValue(null);
      const { params, result } = setup({ navigateUp });

      act(() => {
        result.result.current.handleKeyDown(createKeyEvent('ArrowUp'));
      });

      expect(params.setInput).not.toHaveBeenCalled();
    });
  });

  describe('ArrowDown', () => {
    it('sets input to next command from history', () => {
      const navigateDown = jest.fn().mockReturnValue('next-cmd');
      const { params, result } = setup({ navigateDown });

      act(() => {
        result.result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });

      expect(navigateDown).toHaveBeenCalled();
      expect(params.setInput).toHaveBeenCalledWith('next-cmd');
    });

    it('does not set input when navigateDown returns null', () => {
      const navigateDown = jest.fn().mockReturnValue(null);
      const { params, result } = setup({ navigateDown });

      act(() => {
        result.result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });

      expect(params.setInput).not.toHaveBeenCalled();
    });
  });

  describe('Tab completion', () => {
    it('autocompletes when there is a single match', () => {
      const { params, result } = setup({ input: 'cl' });

      act(() => {
        result.result.current.handleKeyDown(createKeyEvent('Tab'));
      });

      expect(params.setInput).toHaveBeenCalledWith('clear');
    });

    it('lists all matches when there are multiple matches', () => {
      const history = [{ type: 'command' as const, content: 'help' }];
      const { params, result } = setup({ input: 'h', history });

      act(() => {
        result.result.current.handleKeyDown(createKeyEvent('Tab'));
      });

      expect(params.setHistory).toHaveBeenCalledWith([
        ...history,
        { type: 'output', content: 'help  history' },
      ]);
    });

    it('does nothing when there are no matches', () => {
      const { params, result } = setup({ input: 'zzz' });

      act(() => {
        result.result.current.handleKeyDown(createKeyEvent('Tab'));
      });

      expect(params.setInput).not.toHaveBeenCalled();
      expect(params.setHistory).not.toHaveBeenCalled();
    });
  });

  describe('regular keys', () => {
    it('does not intercept regular key presses', () => {
      const { params, result } = setup();
      const event = createKeyEvent('a');

      act(() => {
        result.result.current.handleKeyDown(event);
      });

      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(params.setInput).not.toHaveBeenCalled();
      expect(params.handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Ctrl+R', () => {
    it('opens search mode', () => {
      const historySearch = createMockHistorySearch();
      const { result } = setup({ historySearch });

      act(() => {
        result.result.current.handleKeyDown(createKeyEvent('r', { ctrlKey: true }));
      });

      expect(historySearch.openSearch).toHaveBeenCalled();
    });
  });

  describe('search mode key handling', () => {
    it('Escape closes search mode', () => {
      const historySearch = createMockHistorySearch({ isSearchMode: true });
      const { result } = setup({ historySearch });

      act(() => {
        result.result.current.handleKeyDown(createKeyEvent('Escape'));
      });

      expect(historySearch.closeSearch).toHaveBeenCalled();
    });

    it('Enter accepts selected command, closes search, and sets input', () => {
      const historySearch = createMockHistorySearch({
        isSearchMode: true,
        acceptSearch: jest.fn().mockReturnValue('help'),
      });
      const { params, result } = setup({ historySearch });

      act(() => {
        result.result.current.handleKeyDown(createKeyEvent('Enter'));
      });

      expect(historySearch.acceptSearch).toHaveBeenCalled();
      expect(historySearch.closeSearch).toHaveBeenCalled();
      expect(params.setInput).toHaveBeenCalledWith('help');
    });

    it('Enter with no match closes search without setting input', () => {
      const historySearch = createMockHistorySearch({
        isSearchMode: true,
        acceptSearch: jest.fn().mockReturnValue(null),
      });
      const { params, result } = setup({ historySearch });

      act(() => {
        result.result.current.handleKeyDown(createKeyEvent('Enter'));
      });

      expect(historySearch.closeSearch).toHaveBeenCalled();
      expect(params.setInput).not.toHaveBeenCalled();
    });

    it('ArrowUp moves selection up', () => {
      const historySearch = createMockHistorySearch({ isSearchMode: true });
      const { result } = setup({ historySearch });

      act(() => {
        result.result.current.handleKeyDown(createKeyEvent('ArrowUp'));
      });

      expect(historySearch.selectSearchUp).toHaveBeenCalled();
    });

    it('ArrowDown moves selection down', () => {
      const historySearch = createMockHistorySearch({ isSearchMode: true });
      const { result } = setup({ historySearch });

      act(() => {
        result.result.current.handleKeyDown(createKeyEvent('ArrowDown'));
      });

      expect(historySearch.selectSearchDown).toHaveBeenCalled();
    });

    it('Backspace trims last char from query', () => {
      const historySearch = createMockHistorySearch({
        isSearchMode: true,
        searchQuery: 'hel',
      });
      const { result } = setup({ historySearch });

      act(() => {
        result.result.current.handleKeyDown(createKeyEvent('Backspace'));
      });

      expect(historySearch.updateSearchQuery).toHaveBeenCalledWith('he');
    });

    it('printable key appends to query', () => {
      const historySearch = createMockHistorySearch({
        isSearchMode: true,
        searchQuery: 'hel',
      });
      const { result } = setup({ historySearch });

      act(() => {
        result.result.current.handleKeyDown(createKeyEvent('p'));
      });

      expect(historySearch.updateSearchQuery).toHaveBeenCalledWith('help');
    });

    it('ctrl+key does not append to query while in search mode', () => {
      const historySearch = createMockHistorySearch({
        isSearchMode: true,
        searchQuery: '',
      });
      const { result } = setup({ historySearch });

      act(() => {
        result.result.current.handleKeyDown(createKeyEvent('c', { ctrlKey: true }));
      });

      expect(historySearch.updateSearchQuery).not.toHaveBeenCalled();
    });

    it('search mode intercepts all keys before normal shortcut logic', () => {
      const historySearch = createMockHistorySearch({ isSearchMode: true });
      const { params, result } = setup({ historySearch });

      act(() => {
        result.result.current.handleKeyDown(createKeyEvent('l', { ctrlKey: true }));
      });

      // Ctrl+L clears history in normal mode; in search mode it should be swallowed
      expect(params.setHistory).not.toHaveBeenCalled();
    });
  });
});
