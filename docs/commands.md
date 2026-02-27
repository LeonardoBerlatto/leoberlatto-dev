# Playbook: Commands

1. Update `lib/commands.ts` via `buildCommands(content)`.
2. Keep command names lowercase and descriptions concise.
3. Use `hidden: true` only for easter eggs/internal commands.
4. If a command opens URLs, use `openUrl` with optional `delay`.
5. Ensure the command appears correctly in `help` unless intentionally hidden.
