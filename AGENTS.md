# AGENTS.md

## Purpose
This repository is a terminal-style personal portfolio web app for an software engineer built with Next.js and React. It renders markdown-driven content as interactive terminal commands, with custom inline formatting and keyboard-first UX.

This document defines how coding agents should work here: fast, safe, and consistent with that architecture.

## Project
- Stack: Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind v4, Jest + Testing Library.
- UI model: single-page terminal experience rendered by `components/Terminal.tsx`.
- Content source: markdown files in `content/`, loaded server-side in `app/page.tsx`.
- Command system: `lib/commands.ts` maps command names to handlers and output behavior.
- Output parser: `lib/parse-content.tsx` renders custom inline syntax (colors, links, bold, code).

## Project Structure
See `.cursor/rules/project-structure.mdc` (always applied).

## Safe Change Playbooks
Domain-specific playbooks in `.cursor/rules/` (auto-applied when matching files are in context):
- Commands: `commands.mdc` → `lib/commands.ts`
- Parsing: `parser.mdc` → `lib/parse-content.tsx`
- Terminal: `terminal.mdc` → `components/terminal/**`
- Testing: `testing.mdc` → test files, app, components

## Guardrails
- Do not remove existing command behavior unless requested.
- Keep import paths using the `@/` alias where applicable.

## Agent Output Expectations
- Explain what changed and why, briefly and technically.
- Reference modified paths explicitly.
- Suggest next verification steps (`lint`, `test`, manual check) when relevant.
