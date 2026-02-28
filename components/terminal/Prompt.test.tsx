import { render, screen } from '@testing-library/react';
import Prompt from './Prompt';

describe('Prompt', () => {
  it('renders all prompt segments', () => {
    render(<Prompt />);

    expect(screen.getByText('guest')).toBeInTheDocument();
    expect(screen.getByText('@')).toBeInTheDocument();
    expect(screen.getByText('leoberlatto.dev')).toBeInTheDocument();
    expect(screen.getByText(':~$', { exact: false })).toBeInTheDocument();
  });

  it('applies green color to "guest"', () => {
    render(<Prompt />);
    expect(screen.getByText('guest')).toHaveStyle({
      color: 'var(--dracula-green)',
    });
  });

  it('applies purple color to "leoberlatto.dev"', () => {
    render(<Prompt />);
    expect(screen.getByText('leoberlatto.dev')).toHaveStyle({
      color: 'var(--dracula-purple)',
    });
  });

  it('applies foreground color to "@" and ":~$ "', () => {
    render(<Prompt />);
    expect(screen.getByText('@')).toHaveStyle({
      color: 'var(--dracula-foreground)',
    });
    expect(screen.getByText(':~$', { exact: false })).toHaveStyle({
      color: 'var(--dracula-foreground)',
    });
  });

  it('wraps everything in a nowrap span', () => {
    render(<Prompt />);
    const guest = screen.getByText('guest');
    expect(guest.parentElement).toHaveStyle({ whiteSpace: 'nowrap' });
  });
});
