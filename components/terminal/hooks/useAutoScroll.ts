import { useEffect, RefObject } from 'react';
import { HistoryEntry } from '../types';

export function useAutoScroll(
  outputRef: RefObject<HTMLDivElement | null>,
  history: HistoryEntry[],
  displayedText: string,
) {
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputRef, history, displayedText]);
}
