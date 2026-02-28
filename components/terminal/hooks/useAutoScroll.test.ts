import { renderHook } from '@testing-library/react';
import { useAutoScroll } from './useAutoScroll';
import { HistoryEntry } from '../types';

describe('useAutoScroll', () => {
  const createOutputRef = (scrollHeight = 500) => ({
    current: {
      scrollTop: 0,
      scrollHeight,
    } as unknown as HTMLDivElement,
  });

  it('scrolls outputRef to bottom on mount', () => {
    const outputRef = createOutputRef(500);

    renderHook(() => useAutoScroll(outputRef, [], ''));

    expect(outputRef.current!.scrollTop).toBe(500);
  });

  it('scrolls when history changes', () => {
    const outputRef = createOutputRef(500);
    const history: HistoryEntry[] = [];

    const { rerender } = renderHook(
      ({ history }) => useAutoScroll(outputRef, history, ''),
      { initialProps: { history } },
    );

    outputRef.current!.scrollTop = 0;
    Object.defineProperty(outputRef.current!, 'scrollHeight', { value: 800, writable: true });

    const newHistory: HistoryEntry[] = [
      { type: 'command', content: 'help' },
    ];
    rerender({ history: newHistory });

    expect(outputRef.current!.scrollTop).toBe(800);
  });

  it('scrolls when displayedText changes', () => {
    const outputRef = createOutputRef(600);

    const { rerender } = renderHook(
      ({ text }) => useAutoScroll(outputRef, [], text),
      { initialProps: { text: '' } },
    );

    outputRef.current!.scrollTop = 0;
    Object.defineProperty(outputRef.current!, 'scrollHeight', { value: 900, writable: true });

    rerender({ text: 'new output line' });

    expect(outputRef.current!.scrollTop).toBe(900);
  });

  it('handles null ref without throwing', () => {
    const outputRef = { current: null };

    expect(() => {
      renderHook(() => useAutoScroll(outputRef, [], ''));
    }).not.toThrow();
  });
});
