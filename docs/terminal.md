# Playbook: Terminal Interaction and Shortcuts

1. Update `components/Terminal.tsx`.
2. Keep keyboard behavior stable (`Enter`, `ArrowUp/Down`, `Tab` autocomplete).
3. Avoid re-creating objects/functions in render paths when memoization is suitable.
4. Keep accessibility basics intact (`autoFocus`, readable output, keyboard-first usage).
