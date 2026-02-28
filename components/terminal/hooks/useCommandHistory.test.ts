import { renderHook, act } from '@testing-library/react';
import { useCommandHistory } from './useCommandHistory';

describe('useCommandHistory', () => {
  it('stores commands sequentially via addToHistory', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => result.current.addToHistory('help'));
    act(() => result.current.addToHistory('about'));

    // Navigate up twice to verify both are stored in order
    let cmd: string | null;
    act(() => {
      cmd = result.current.navigateUp();
    });
    expect(cmd!).toBe('about');

    act(() => {
      cmd = result.current.navigateUp();
    });
    expect(cmd!).toBe('help');
  });

  it('navigateUp returns previous command', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => result.current.addToHistory('first'));
    act(() => result.current.addToHistory('second'));

    let cmd: string | null;
    act(() => {
      cmd = result.current.navigateUp();
    });
    expect(cmd!).toBe('second');
  });

  it('navigateUp returns null when at beginning', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => result.current.addToHistory('only'));

    // Go to beginning
    act(() => {
      result.current.navigateUp();
    });

    let cmd: string | null;
    act(() => {
      cmd = result.current.navigateUp();
    });
    expect(cmd!).toBeNull();
  });

  it('navigateDown returns next command', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => result.current.addToHistory('first'));
    act(() => result.current.addToHistory('second'));

    // Navigate up twice, then down once
    act(() => {
      result.current.navigateUp();
    });
    act(() => {
      result.current.navigateUp();
    });

    let cmd: string | null;
    act(() => {
      cmd = result.current.navigateDown();
    });
    expect(cmd!).toBe('second');
  });

  it('navigateDown returns empty string when past the end', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => result.current.addToHistory('first'));

    // Navigate up then back down past end
    act(() => {
      result.current.navigateUp();
    });

    let cmd: string | null;
    act(() => {
      cmd = result.current.navigateDown();
    });
    expect(cmd!).toBe('');
  });

  it('full cycle: add commands, navigate up through all, navigate down back', () => {
    const { result } = renderHook(() => useCommandHistory());

    act(() => result.current.addToHistory('alpha'));
    act(() => result.current.addToHistory('beta'));
    act(() => result.current.addToHistory('gamma'));

    // Navigate up through all
    const upResults: (string | null)[] = [];
    act(() => {
      upResults.push(result.current.navigateUp());
    });
    act(() => {
      upResults.push(result.current.navigateUp());
    });
    act(() => {
      upResults.push(result.current.navigateUp());
    });
    expect(upResults).toEqual(['gamma', 'beta', 'alpha']);

    // Attempting to go further up returns null
    let boundary: string | null;
    act(() => {
      boundary = result.current.navigateUp();
    });
    expect(boundary!).toBeNull();

    // Navigate down through all
    const downResults: (string | null)[] = [];
    act(() => {
      downResults.push(result.current.navigateDown());
    });
    act(() => {
      downResults.push(result.current.navigateDown());
    });
    act(() => {
      downResults.push(result.current.navigateDown());
    });
    expect(downResults).toEqual(['beta', 'gamma', '']);
  });
});
