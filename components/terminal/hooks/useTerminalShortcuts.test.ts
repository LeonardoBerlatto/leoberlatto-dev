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
});
