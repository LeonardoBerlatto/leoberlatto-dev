export type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  handler: () => void;
};

export function matchShortcut(
  e: React.KeyboardEvent,
  shortcuts: KeyboardShortcut[],
): KeyboardShortcut | null {
  return (
    shortcuts.find(
      (s) =>
        e.key.toLowerCase() === s.key.toLowerCase() &&
        !!s.ctrl === e.ctrlKey &&
        !!s.alt === e.altKey &&
        !!s.shift === e.shiftKey &&
        !!s.meta === e.metaKey,
    ) ?? null
  );
}
