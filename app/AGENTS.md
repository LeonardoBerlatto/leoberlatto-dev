# AGENTS.md

## Scope
Applies to files in `app/`.

## Purpose
- `page.tsx` reads markdown files and builds the terminal `content` payload.
- Keep content loading and assembly predictable and server-friendly.

## Guardrails
- Preserve the contract expected by `buildContent(...)` and terminal command rendering.
- Avoid introducing client-only assumptions into server-side content loading.

## Validation
- If `app/page.tsx` changes behavior, run tests and verify rendered terminal content manually.
