import { renderHook, act } from '@testing-library/react';
import { useCommandExecution } from './useCommandExecution';

jest.mock('@/lib/commands', () => ({
  executeCommand: jest.fn(),
}));

import { executeCommand } from '@/lib/commands';

const mockedExecuteCommand = executeCommand as jest.MockedFunction<
  typeof executeCommand
>;

describe('useCommandExecution', () => {
  const mockCommands = {
    help: {
      description: 'help',
      handler: jest.fn(() => ({ content: 'help text' })),
    },
    clear: {
      description: 'clear',
      handler: jest.fn(() => ({ content: '', clear: true })),
    },
    banner: {
      description: 'banner',
      handler: jest.fn(() => ({ content: 'banner', instant: true })),
    },
    blog: {
      description: 'blog',
      handler: jest.fn(() => ({
        content: 'opening...',
        openUrl: { url: 'https://example.com', delay: 1000 },
      })),
    },
  };

  const createDeps = () => ({
    commands: mockCommands,
    isAnimating: false,
    initTone: jest.fn(),
    playChime: jest.fn(),
    startAnimation: jest.fn(),
    addToCommandHistory: jest.fn(),
    setHistory: jest.fn(),
    inputRef: { current: { focus: jest.fn() } } as any,
  });

  let originalWindowOpen: typeof window.open;

  beforeAll(() => {
    jest.useFakeTimers();
    originalWindowOpen = window.open;
    window.open = jest.fn();
  });

  afterAll(() => {
    jest.useRealTimers();
    window.open = originalWindowOpen;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submitting a valid command adds it to history and produces output', async () => {
    const deps = createDeps();
    mockedExecuteCommand.mockResolvedValue({ content: 'help text' });

    const { result } = renderHook(() => useCommandExecution(deps));

    await act(async () => {
      await result.current.handleSubmit('help');
    });

    expect(deps.setHistory).toHaveBeenCalled();
    expect(deps.addToCommandHistory).toHaveBeenCalledWith('help');
    expect(deps.startAnimation).toHaveBeenCalledWith('help text');
  });

  it('empty input is ignored', async () => {
    const deps = createDeps();

    const { result } = renderHook(() => useCommandExecution(deps));

    await act(async () => {
      await result.current.handleSubmit('   ');
    });

    expect(deps.initTone).toHaveBeenCalled();
    expect(deps.addToCommandHistory).not.toHaveBeenCalled();
    expect(deps.setHistory).not.toHaveBeenCalled();
  });

  it('submission while animating is ignored', async () => {
    const deps = createDeps();
    deps.isAnimating = true;

    const { result } = renderHook(() => useCommandExecution(deps));

    await act(async () => {
      await result.current.handleSubmit('help');
    });

    expect(deps.initTone).toHaveBeenCalled();
    expect(deps.addToCommandHistory).not.toHaveBeenCalled();
  });

  it('clear command empties the history', async () => {
    const deps = createDeps();
    mockedExecuteCommand.mockResolvedValue({ content: '', clear: true });

    const { result } = renderHook(() => useCommandExecution(deps));

    await act(async () => {
      await result.current.handleSubmit('clear');
    });

    expect(deps.setHistory).toHaveBeenCalledWith([]);
  });

  it('instant commands add output directly to history and play chime', async () => {
    const deps = createDeps();
    mockedExecuteCommand.mockResolvedValue({
      content: 'banner',
      instant: true,
    });

    const { result } = renderHook(() => useCommandExecution(deps));

    await act(async () => {
      await result.current.handleSubmit('banner');
    });

    expect(deps.playChime).toHaveBeenCalled();
    expect(deps.startAnimation).not.toHaveBeenCalled();
    // setHistory is called: once for command entry, once for output
    const setHistoryCalls = deps.setHistory.mock.calls;
    expect(setHistoryCalls.length).toBeGreaterThanOrEqual(2);
  });

  it('non-instant commands start the typing animation', async () => {
    const deps = createDeps();
    mockedExecuteCommand.mockResolvedValue({ content: 'help text' });

    const { result } = renderHook(() => useCommandExecution(deps));

    await act(async () => {
      await result.current.handleSubmit('help');
    });

    expect(deps.startAnimation).toHaveBeenCalledWith('help text');
    expect(deps.playChime).not.toHaveBeenCalled();
  });

  it('commands with openUrl trigger window.open with correct delay', async () => {
    const deps = createDeps();
    mockedExecuteCommand.mockResolvedValue({
      content: 'opening...',
      openUrl: { url: 'https://example.com', delay: 1000 },
    });

    const { result } = renderHook(() => useCommandExecution(deps));

    await act(async () => {
      await result.current.handleSubmit('blog');
    });

    expect(window.open).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank');
  });

  it('initTone is called on every submission', async () => {
    const deps = createDeps();
    mockedExecuteCommand.mockResolvedValue({ content: 'output' });

    const { result } = renderHook(() => useCommandExecution(deps));

    await act(async () => {
      await result.current.handleSubmit('help');
    });

    expect(deps.initTone).toHaveBeenCalledTimes(1);

    // Even empty input calls initTone
    await act(async () => {
      await result.current.handleSubmit('');
    });

    expect(deps.initTone).toHaveBeenCalledTimes(2);
  });
});
