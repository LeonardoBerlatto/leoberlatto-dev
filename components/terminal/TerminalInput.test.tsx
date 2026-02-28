import { render, screen, fireEvent } from '@testing-library/react';
import TerminalInput from './TerminalInput';

jest.mock('./Prompt', () => {
  return function MockPrompt() {
    return <span data-testid="prompt">prompt</span>;
  };
});

const defaultProps = {
  input: 'hello',
  inputColor: 'var(--dracula-green)',
  cursorPos: 2,
  isAnimating: false,
  inputRef: { current: null } as React.RefObject<HTMLInputElement | null>,
  onInputChange: jest.fn(),
  onKeyDown: jest.fn(),
  onSelect: jest.fn(),
};

describe('TerminalInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Prompt component', () => {
    render(<TerminalInput {...defaultProps} />);
    expect(screen.getByTestId('prompt')).toBeInTheDocument();
  });

  it('renders an input with the correct value', () => {
    render(<TerminalInput {...defaultProps} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('hello');
  });

  it('disables input and reduces opacity when isAnimating', () => {
    render(<TerminalInput {...defaultProps} isAnimating={true} />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();

    const wrapper = input.parentElement;
    expect(wrapper).toHaveStyle({ opacity: 0.5 });
  });

  it('enables input with full opacity when not animating', () => {
    render(<TerminalInput {...defaultProps} isAnimating={false} />);
    const input = screen.getByRole('textbox');
    expect(input).not.toBeDisabled();

    const wrapper = input.parentElement;
    expect(wrapper).toHaveStyle({ opacity: 1 });
  });

  it('displays cursor character at cursorPos', () => {
    render(<TerminalInput {...defaultProps} input="hello" cursorPos={2} />);
    const cursor = document.querySelector('.block-cursor');
    expect(cursor).toHaveTextContent('l');
  });

  it('displays space as cursor when cursorPos is at end of input', () => {
    render(<TerminalInput {...defaultProps} input="hello" cursorPos={5} />);
    const cursor = document.querySelector('.block-cursor');
    // input[5] is undefined, so fallback to ' '
    expect(cursor!.textContent).toBe(' ');
  });

  it('splits text correctly around cursor position', () => {
    render(<TerminalInput {...defaultProps} input="abcde" cursorPos={2} />);
    const visual = document.querySelector('[aria-hidden]');
    // Before cursor: "ab", cursor: "c", after cursor: "de"
    expect(visual).toHaveTextContent('abcde');
  });

  it('forwards onInputChange callback', () => {
    const onInputChange = jest.fn();
    render(<TerminalInput {...defaultProps} onInputChange={onInputChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new' } });
    expect(onInputChange).toHaveBeenCalled();
  });

  it('forwards onKeyDown callback', () => {
    const onKeyDown = jest.fn();
    render(<TerminalInput {...defaultProps} onKeyDown={onKeyDown} />);
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('forwards onSelect callback', () => {
    const onSelect = jest.fn();
    render(<TerminalInput {...defaultProps} onSelect={onSelect} />);
    const input = screen.getByRole('textbox');
    fireEvent.select(input);
    expect(onSelect).toHaveBeenCalled();
  });

  it('handles empty input', () => {
    render(<TerminalInput {...defaultProps} input="" cursorPos={0} />);
    const cursor = document.querySelector('.block-cursor');
    expect(cursor!.textContent).toBe(' ');
  });
});
