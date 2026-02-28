import { render, screen } from '@testing-library/react';
import { parseContent } from '@/lib/parse-content';

function renderContent(text: string) {
  return render(<div data-testid="container">{parseContent(text)}</div>);
}

describe('parseContent', () => {
  describe('empty and plain text', () => {
    it('returns empty array for empty string', () => {
      const result = parseContent('');
      expect(result).toEqual([]);
    });

    it('renders plain text in a span', () => {
      renderContent('hello world');
      expect(screen.getByText('hello world')).toBeInTheDocument();
      expect(screen.getByText('hello world').tagName).toBe('SPAN');
    });
  });

  describe('color syntax {{color:text}}', () => {
    it('renders colored text with dracula CSS variable', () => {
      renderContent('{{green:success}}');
      const el = screen.getByText('success');
      expect(el.parentElement).toHaveStyle({ color: 'var(--dracula-green)' });
    });

    it('renders multiple colors in one line', () => {
      renderContent('{{red:error}} and {{blue:info}}');
      const errorEl = screen.getByText('error');
      const infoEl = screen.getByText('info');
      expect(errorEl.parentElement).toHaveStyle({ color: 'var(--dracula-red)' });
      expect(infoEl.parentElement).toHaveStyle({ color: 'var(--dracula-blue)' });
    });
  });

  describe('bold syntax **text**', () => {
    it('renders bold text', () => {
      renderContent('**important**');
      const el = screen.getByText('important');
      expect(el).toHaveStyle({ fontWeight: 'bold' });
    });
  });

  describe('link syntax [text](url)', () => {
    it('renders a link with correct attributes', () => {
      renderContent('[click me](https://example.com)');
      const link = screen.getByRole('link', { name: 'click me' });
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('code syntax `code`', () => {
    it('renders inline code with monospace styling', () => {
      renderContent('`npm install`');
      const el = screen.getByText('npm install');
      expect(el).toHaveStyle({
        fontFamily: 'monospace',
        background: 'var(--dracula-current-line)',
        padding: '2px 4px',
      });
    });
  });

  describe('multiline text', () => {
    it('inserts br elements between lines', () => {
      const { container } = renderContent('line one\nline two');
      const brs = container.querySelectorAll('br');
      expect(brs).toHaveLength(1);
      expect(screen.getByText('line one')).toBeInTheDocument();
      expect(screen.getByText('line two')).toBeInTheDocument();
    });

    it('inserts multiple br elements for multiple lines', () => {
      const { container } = renderContent('a\nb\nc');
      const brs = container.querySelectorAll('br');
      expect(brs).toHaveLength(2);
    });
  });

  describe('nested syntax', () => {
    it('renders colored bold text with {{green:**bold text**}}', () => {
      renderContent('{{green:**bold text**}}');
      const boldEl = screen.getByText('bold text');
      expect(boldEl).toHaveStyle({ fontWeight: 'bold' });
      const colorEl = boldEl.closest('span[style*="--dracula-green"]');
      expect(colorEl).not.toBeNull();
    });

    it('renders colored link inside color syntax', () => {
      renderContent('{{purple:[link](https://example.com)}}');
      const link = screen.getByRole('link', { name: 'link' });
      expect(link).toHaveAttribute('href', 'https://example.com');
      const colorParent = link.closest('span[style*="--dracula-purple"]');
      expect(colorParent).not.toBeNull();
    });
  });

  describe('lone special characters as plain text', () => {
    it('treats a lone { as plain text', () => {
      renderContent('{');
      expect(screen.getByText('{')).toBeInTheDocument();
    });

    it('treats a lone [ as plain text', () => {
      renderContent('[');
      expect(screen.getByText('[')).toBeInTheDocument();
    });

    it('treats a lone ` as plain text', () => {
      renderContent('`');
      expect(screen.getByText('`')).toBeInTheDocument();
    });

    it('treats a lone * as plain text', () => {
      renderContent('*');
      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('treats incomplete bold ** as plain text', () => {
      renderContent('**incomplete');
      const { container } = renderContent('**incomplete');
      expect(container.textContent).toContain('**incomplete');
    });
  });

  describe('mixed content', () => {
    it('renders plain text alongside formatted segments', () => {
      renderContent('Hello **world** and {{green:earth}}');
      expect(screen.getByText('world')).toHaveStyle({ fontWeight: 'bold' });
      expect(screen.getByText('earth').parentElement).toHaveStyle({
        color: 'var(--dracula-green)',
      });
      expect(screen.getByText(/Hello/)).toBeInTheDocument();
    });

    it('renders code next to plain text', () => {
      renderContent('Run `yarn test` now');
      expect(screen.getByText('yarn test')).toHaveStyle({
        fontFamily: 'monospace',
      });
    });
  });
});
