import { RefObject } from 'react';
import Prompt from './Prompt';

type TerminalInputProps = {
  input: string;
  inputColor: string;
  cursorPos: number;
  isAnimating: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSelect: () => void;
};

export default function TerminalInput({
  input, inputColor, cursorPos, isAnimating, inputRef,
  onInputChange, onKeyDown, onSelect,
}: TerminalInputProps) {
  return (
    <div className="input-line terminal-input-line"
      style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
      <Prompt />
      <div style={{ flex: 1, position: 'relative', opacity: isAnimating ? 0.5 : 1 }}>
        <input ref={inputRef} type="text" value={input}
          onChange={onInputChange} onKeyDown={onKeyDown} onSelect={onSelect}
          disabled={isAnimating} autoFocus spellCheck={false}
          autoComplete="off" autoCapitalize="off"
          className="terminal-input"
          style={{
            position: 'absolute', inset: 0, background: 'transparent',
            border: 'none', outline: 'none', color: 'transparent',
            caretColor: 'transparent', fontFamily: 'inherit', padding: 0, width: '100%',
          }}
        />
        <span style={{ color: inputColor, fontFamily: 'inherit', whiteSpace: 'pre' }} aria-hidden>
          {input.slice(0, cursorPos)}
          <span className="block-cursor">{input[cursorPos] ?? ' '}</span>
          {input.slice(cursorPos + 1)}
        </span>
      </div>
    </div>
  );
}
