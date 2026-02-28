type SkipHintProps = {
  visible: boolean;
};

export default function SkipHint({ visible }: SkipHintProps) {
  if (!visible) return null;

  return (
    <div
      className="skip-hint"
      style={{
        color: 'var(--dracula-comment)',
        fontSize: '0.8em',
        padding: '4px 0',
      }}
    >
      press Esc to skip
    </div>
  );
}
