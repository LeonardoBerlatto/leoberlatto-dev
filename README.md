# leoberlatto.dev

A terminal-style personal portfolio — type commands and get to know me.

## What it is

Single-page web app that emulates a terminal experience. Content is markdown-driven, commands are keyboard-navigable, and the whole thing is a thin layer of React over static content.

**Live:** [https://leonardoberlatto.github.io/leoberlatto-dev](https://leonardoberlatto.github.io/leoberlatto-dev/)

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** (strict mode)
- **Tailwind v4**
- **Jest** + Testing Library

## Architecture

```
app/page.tsx          → loads content server-side, bootstraps terminal
components/terminal/  → Terminal UI, input, output, hooks
lib/commands.ts       → command name → handler + output behavior
lib/parse-content.tsx → custom inline syntax: colors, links, bold, code
content/*.md          → all user-facing text (about, stack, projects, etc.)
```

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm run lint         # eslint
npm run test         # jest
npm run test:watch   # jest watch mode
npm run test:coverage
```

## Content

Content is stored as markdown files in `content/`. Supports custom inline syntax:

```
{{pink:text}}    → colored text
{{bold:text}}    → bold
[label](url)     → links
`code`           → inline code
```

Commands are defined in `lib/commands.ts`.
