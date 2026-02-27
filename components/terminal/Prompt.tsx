export default function Prompt() {
  return (
    <span style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
      <span style={{ color: 'var(--dracula-green)' }}>guest</span>
      <span style={{ color: 'var(--dracula-foreground)' }}>@</span>
      <span style={{ color: 'var(--dracula-purple)' }}>leoberlatto.dev</span>
      <span style={{ color: 'var(--dracula-foreground)' }}>:~$ </span>
    </span>
  );
}
