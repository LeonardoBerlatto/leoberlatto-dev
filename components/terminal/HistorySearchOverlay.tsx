type Props = {
  query: string;
  results: string[];
  selectedIndex: number;
};

export default function HistorySearchOverlay({ query, results, selectedIndex }: Props) {
  return (
    <div style={{
      borderTop: '1px solid var(--dracula-comment)',
      padding: '6px 8px',
      maxHeight: '200px',
      overflowY: 'auto',
      flexShrink: 0,
    }}>
      <div style={{ color: 'var(--dracula-comment)', marginBottom: '4px', fontSize: '0.85em' }}>
        {'(ctrl+r) search: '}
        <span style={{ color: 'var(--dracula-foreground)' }}>{query}</span>
        <span style={{ color: 'var(--dracula-cyan)' }}>_</span>
      </div>
      {results.length === 0 ? (
        <div style={{ color: 'var(--dracula-comment)', fontSize: '0.85em' }}>no matches</div>
      ) : (
        results.map((cmd, i) => (
          <div key={`${cmd}-${i}`} style={{
            color: i === selectedIndex ? 'var(--dracula-cyan)' : 'var(--dracula-foreground)',
            padding: '1px 0',
            fontSize: '0.9em',
            whiteSpace: 'pre',
          }}>
            {i === selectedIndex ? '> ' : '  '}{cmd}
          </div>
        ))
      )}
    </div>
  );
}
