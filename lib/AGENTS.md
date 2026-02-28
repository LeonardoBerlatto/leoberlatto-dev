# AGENTS.md

## Scope
Applies to files in `lib/`.

## Purpose
- `commands.ts` is the command registry and help/unknown-command behavior.
- `parse-content.tsx` parses and renders inline syntax.
- `content.ts` assembles static and markdown-driven content.

## Playbook: Commands
1. Update `commands.ts` via `buildCommands(content)`.
2. Keep command names lowercase and descriptions concise.
3. Use `hidden: true` only for easter eggs or internal commands.
4. If a command opens URLs, use `openUrl` with optional `delay`.
5. Ensure the command appears correctly in `help` unless intentionally hidden.

## Playbook: Parser
1. Update `parse-content.tsx` first when syntax/rendering behavior changes.
2. Keep syntax backward-compatible unless explicitly changing the spec.
3. Prefer small, composable parsing steps and avoid expensive regex backtracking.

## Validation
- Run tests for behavior changes.
- For substantial command/parser changes, prioritize focused unit tests.
