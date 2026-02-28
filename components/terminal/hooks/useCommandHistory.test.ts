import { renderHook, act } from '@testing-library/react';
import { useCommandHistory } from './useCommandHistory';

function addCommands(hook: ReturnType<typeof renderHook<ReturnType<typeof useCommandHistory>, unknown>>, ...cmds: string[]) {
  cmds.forEach((cmd) => act(() => hook.result.current.addToHistory(cmd)));
}

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

describe('historySearch', () => {
  it('starts inactive with empty query and no results', () => {
    const { result } = renderHook(() => useCommandHistory());
    expect(result.current.historySearch.isSearchMode).toBe(false);
    expect(result.current.historySearch.searchQuery).toBe('');
    expect(result.current.historySearch.searchResults).toEqual([]);
  });

  it('openSearch activates search mode', () => {
    const { result } = renderHook(() => useCommandHistory());
    act(() => result.current.historySearch.openSearch());
    expect(result.current.historySearch.isSearchMode).toBe(true);
  });

  it('closeSearch deactivates and resets state', () => {
    const hook = renderHook(() => useCommandHistory());
    addCommands(hook, 'help');
    act(() => hook.result.current.historySearch.openSearch());
    act(() => hook.result.current.historySearch.updateSearchQuery('he'));
    act(() => hook.result.current.historySearch.closeSearch());
    expect(hook.result.current.historySearch.isSearchMode).toBe(false);
    expect(hook.result.current.historySearch.searchQuery).toBe('');
    expect(hook.result.current.historySearch.searchIndex).toBe(0);
  });

  it('returns all commands newest-first with empty query (deduped)', () => {
    const hook = renderHook(() => useCommandHistory());
    addCommands(hook, 'help', 'about', 'help');
    act(() => hook.result.current.historySearch.openSearch());
    // newest-first: last 'help' is at index 0, 'about' at 1; first 'help' deduped
    expect(hook.result.current.historySearch.searchResults).toEqual(['help', 'about']);
  });

  it('filters results case-insensitively and resets index on query change', () => {
    const hook = renderHook(() => useCommandHistory());
    addCommands(hook, 'help', 'about', 'history');
    act(() => hook.result.current.historySearch.openSearch());
    act(() => hook.result.current.historySearch.updateSearchQuery('H'));
    const { searchResults, searchIndex } = hook.result.current.historySearch;
    expect(searchResults).toEqual(['history', 'help']);
    expect(searchIndex).toBe(0);
  });

  it('selectSearchDown moves index forward and clamps at end', () => {
    const hook = renderHook(() => useCommandHistory());
    addCommands(hook, 'alpha', 'beta', 'gamma');
    act(() => hook.result.current.historySearch.openSearch());
    act(() => hook.result.current.historySearch.selectSearchDown());
    expect(hook.result.current.historySearch.searchIndex).toBe(1);
    act(() => hook.result.current.historySearch.selectSearchDown());
    act(() => hook.result.current.historySearch.selectSearchDown());
    // clamps at 2 (last index)
    expect(hook.result.current.historySearch.searchIndex).toBe(2);
  });

  it('selectSearchUp moves index backward and clamps at 0', () => {
    const hook = renderHook(() => useCommandHistory());
    addCommands(hook, 'alpha', 'beta');
    act(() => hook.result.current.historySearch.openSearch());
    act(() => hook.result.current.historySearch.selectSearchUp());
    expect(hook.result.current.historySearch.searchIndex).toBe(0);
  });

  it('acceptSearch returns currently selected result', () => {
    const hook = renderHook(() => useCommandHistory());
    addCommands(hook, 'help', 'about');
    act(() => hook.result.current.historySearch.openSearch());
    act(() => hook.result.current.historySearch.selectSearchDown());
    let accepted: string | null = null;
    act(() => { accepted = hook.result.current.historySearch.acceptSearch(); });
    expect(accepted).toBe('help');
  });

  it('acceptSearch returns null when there are no results', () => {
    const hook = renderHook(() => useCommandHistory());
    act(() => hook.result.current.historySearch.openSearch());
    act(() => hook.result.current.historySearch.updateSearchQuery('xyz'));
    let accepted: string | null = 'not-null';
    act(() => { accepted = hook.result.current.historySearch.acceptSearch(); });
    expect(accepted).toBeNull();
  });

  it('existing navigateUp/navigateDown are unaffected by search state', () => {
    const hook = renderHook(() => useCommandHistory());
    addCommands(hook, 'first', 'second');
    act(() => hook.result.current.historySearch.openSearch());
    let cmd: string | null;
    act(() => { cmd = hook.result.current.navigateUp(); });
    expect(cmd!).toBe('second');
  });
});
