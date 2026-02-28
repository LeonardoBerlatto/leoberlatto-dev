import { render, screen } from '@testing-library/react';
import SkipHint from './SkipHint';

describe('SkipHint', () => {
  it('returns null when visible is false', () => {
    const { container } = render(<SkipHint visible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders "press Esc to skip" when visible is true', () => {
    render(<SkipHint visible={true} />);
    expect(screen.getByText('press Esc to skip')).toBeInTheDocument();
  });

  it('applies comment color styling', () => {
    render(<SkipHint visible={true} />);
    const hint = screen.getByText('press Esc to skip');
    expect(hint).toHaveStyle({ color: 'var(--dracula-comment)' });
  });

  it('applies small font size', () => {
    render(<SkipHint visible={true} />);
    const hint = screen.getByText('press Esc to skip');
    expect(hint).toHaveStyle({ fontSize: '0.8em' });
  });

  it('has the skip-hint class', () => {
    render(<SkipHint visible={true} />);
    const hint = screen.getByText('press Esc to skip');
    expect(hint).toHaveClass('skip-hint');
  });
});
