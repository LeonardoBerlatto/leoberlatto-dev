# AGENTS.md

## Scope
Applies to files in `components/terminal/` and `components/terminal/hooks/`.

## Purpose
- `Terminal.tsx` orchestrates hooks and terminal sub-components.
- Hooks and child components define keyboard-first terminal behavior.

## Playbook: Terminal Interaction
1. Keep keyboard behavior stable (`Enter`, `ArrowUp/Down`, `Tab` autocomplete).
2. Avoid re-creating objects/functions in render paths when memoization is suitable.
3. Preserve accessibility basics (`autoFocus`, readable output, keyboard-first usage).

## Validation
- Run tests for behavior changes.
- If terminal UI logic changes, add or update tests for shortcuts, history, and output behavior.
