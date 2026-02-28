import { render, screen } from '@testing-library/react';
import TerminalOutput from './TerminalOutput';
import { Command } from '@/lib/commands';
import { HistoryEntry } from './types';

jest.mock('@/lib/parse-content', () => ({
  parseContent: jest.fn((text: string) => <span data-testid="parsed">{text}</span>),
}));

jest.mock('./Prompt', () => {
  return function MockPrompt() {
    return <span data-testid="prompt">prompt</span>;
  };
});

jest.mock('./SkipHint', () => {
  return function MockSkipHint({ visible }: { visible: boolean }) {
    return visible ? <div data-testid="skip-hint">skip</div> : null;
  };
});

import { parseContent } from '@/lib/parse-content';

const commands: Record<string, Command> = {
  help: { description: 'help', handler: () => ({ content: 'help text' }) },
  about: { description: 'about', handler: () => ({ content: 'about text' }) },
};

const defaultProps = {
  history: [] as HistoryEntry[],
  isAnimating: false,
  displayedText: '',
  showSkipHint: false,
  commands,
  outputRef: { current: null } as React.RefObject<HTMLDivElement | null>,
};

describe('TerminalOutput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders command entries with Prompt and text', () => {
    const history: HistoryEntry[] = [{ type: 'command', content: 'help' }];
    render(<TerminalOutput {...defaultProps} history={history} />);

    expect(screen.getByTestId('prompt')).toBeInTheDocument();
    expect(screen.getByText('help')).toBeInTheDocument();
  });

  it('applies green color to valid command text', () => {
    const history: HistoryEntry[] = [{ type: 'command', content: 'help' }];
    render(<TerminalOutput {...defaultProps} history={history} />);

    const commandText = screen.getByText('help');
    expect(commandText).toHaveStyle({ color: 'var(--dracula-green)' });
  });

  it('does not apply green color to unknown commands', () => {
    const history: HistoryEntry[] = [{ type: 'command', content: 'unknown' }];
    render(<TerminalOutput {...defaultProps} history={history} />);

    const commandText = screen.getByText('unknown');
    expect(commandText).not.toHaveStyle({ color: 'var(--dracula-green)' });
  });

  it('renders output entries with parsed content', () => {
    const history: HistoryEntry[] = [{ type: 'output', content: 'some output' }];
    render(<TerminalOutput {...defaultProps} history={history} />);

    expect(parseContent).toHaveBeenCalledWith('some output');
    expect(screen.getByTestId('parsed')).toHaveTextContent('some output');
  });

  it('shows animation block when isAnimating and displayedText is present', () => {
    render(
      <TerminalOutput
        {...defaultProps}
        isAnimating={true}
        displayedText="typing..."
      />,
    );

    expect(parseContent).toHaveBeenCalledWith('typing...');
    expect(screen.getByTestId('parsed')).toHaveTextContent('typing...');
  });

  it('does not show animation block when not animating', () => {
    render(
      <TerminalOutput {...defaultProps} isAnimating={false} displayedText="text" />,
    );

    expect(parseContent).not.toHaveBeenCalled();
  });

  it('does not show animation block when displayedText is empty', () => {
    render(
      <TerminalOutput {...defaultProps} isAnimating={true} displayedText="" />,
    );

    expect(screen.queryByTestId('skip-hint')).not.toBeInTheDocument();
  });

  it('shows SkipHint when showSkipHint is true and animating', () => {
    render(
      <TerminalOutput
        {...defaultProps}
        isAnimating={true}
        displayedText="typing..."
        showSkipHint={true}
      />,
    );

    expect(screen.getByTestId('skip-hint')).toBeInTheDocument();
  });

  it('hides SkipHint when showSkipHint is false', () => {
    render(
      <TerminalOutput
        {...defaultProps}
        isAnimating={true}
        displayedText="typing..."
        showSkipHint={false}
      />,
    );

    expect(screen.queryByTestId('skip-hint')).not.toBeInTheDocument();
  });

  it('recognizes commands with whitespace padding', () => {
    const history: HistoryEntry[] = [{ type: 'command', content: '  help  ' }];
    render(<TerminalOutput {...defaultProps} history={history} />);

    const commandText = screen.getByText('help', { exact: false });
    expect(commandText).toHaveStyle({ color: 'var(--dracula-green)' });
  });

  it('recognizes commands in mixed case', () => {
    const history: HistoryEntry[] = [{ type: 'command', content: 'HELP' }];
    render(<TerminalOutput {...defaultProps} history={history} />);

    const commandText = screen.getByText('HELP');
    expect(commandText).toHaveStyle({ color: 'var(--dracula-green)' });
  });

  it('renders multiple history entries', () => {
    const history: HistoryEntry[] = [
      { type: 'command', content: 'help' },
      { type: 'output', content: 'help text' },
      { type: 'command', content: 'about' },
      { type: 'output', content: 'about text' },
    ];
    render(<TerminalOutput {...defaultProps} history={history} />);

    const prompts = screen.getAllByTestId('prompt');
    expect(prompts).toHaveLength(2);

    const parsed = screen.getAllByTestId('parsed');
    expect(parsed).toHaveLength(2);
  });
});
