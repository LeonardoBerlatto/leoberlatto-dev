'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { buildCommands } from '@/lib/commands';
import { Content } from '@/lib/content';
import { HistoryEntry } from './types';
import { useAudio } from './hooks/useAudio';
import { useAutoScroll } from './hooks/useAutoScroll';
import { useTypingAnimation } from './hooks/useTypingAnimation';
import { useCommandHistory } from './hooks/useCommandHistory';
import { useCommandExecution } from './hooks/useCommandExecution';
import { useTerminalShortcuts } from './hooks/useTerminalShortcuts';
import TerminalOutput from './TerminalOutput';
import TerminalInput from './TerminalInput';
import HistorySearchOverlay from './HistorySearchOverlay';

type TerminalProps = { content: Content };

export default function Terminal({ content }: TerminalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>(() => [
    { type: 'output', content: content.banner },
    { type: 'output', content: 'Type {{green:help}} to see available commands.' },
  ]);
  const [input, setInput] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const commands = useMemo(() => buildCommands(content), [content]);

  const { initTone, playChime } = useAudio();

  const onAnimationComplete = useCallback((fullText: string) => {
    setHistory(prev => [...prev, { type: 'output', content: fullText }]);
  }, []);

  const { isAnimating, displayedText, showSkipHint, startAnimation } = useTypingAnimation(
    onAnimationComplete, playChime, inputRef,
  );

  const { addToHistory: addToCommandHistory, navigateUp, navigateDown, historySearch } = useCommandHistory();

  useAutoScroll(outputRef, history, displayedText);

  const { handleSubmit } = useCommandExecution({
    commands, isAnimating, initTone, playChime,
    startAnimation, addToCommandHistory, setHistory, inputRef,
  });

  const { handleKeyDown, updateCursorPos } = useTerminalShortcuts({
    input, commands, inputRef, history,
    setInput, setHistory, setCursorPos, handleSubmit, navigateUp, navigateDown, historySearch,
  });

  const handleContainerClick = () => {
    initTone();
    inputRef.current?.focus();
    setTimeout(updateCursorPos, 0);
  };

  const inputColor = useMemo(() =>
    input.trim() && commands[input.trim().toLowerCase()]
      ? 'var(--dracula-green)' : 'var(--dracula-foreground)',
    [input, commands]
  );

  return (
    <div className="terminal-container" onClick={handleContainerClick}
      style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden' }}>
      <TerminalOutput history={history} isAnimating={isAnimating}
        displayedText={displayedText} showSkipHint={showSkipHint}
        commands={commands} outputRef={outputRef} />
      {historySearch.isSearchMode && (
        <HistorySearchOverlay
          query={historySearch.searchQuery}
          results={historySearch.searchResults}
          selectedIndex={historySearch.searchIndex}
        />
      )}
      <TerminalInput input={input} inputColor={inputColor} cursorPos={cursorPos}
        isAnimating={isAnimating} inputRef={inputRef}
        onInputChange={(e) => { setInput(e.target.value); setTimeout(updateCursorPos, 0); }}
        onKeyDown={(e) => { handleKeyDown(e); setTimeout(updateCursorPos, 0); }}
        onSelect={updateCursorPos} />
    </div>
  );
}
