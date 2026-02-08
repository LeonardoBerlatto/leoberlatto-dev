# TDD - Terminal Portfolio Site (MVP)

## Overview

Single-page React `.jsx` artifact simulating a terminal interface. Visitors type commands to explore your portfolio. Content stored as JS string constants (placeholder data), structured to later migrate to `.md` file imports via a bundler. No backend needed — fully static.

---

## Architecture

**Single `.jsx` file** with:

- `CONTENT` object — all placeholder text as JS strings (keyed by command name)
- `COMMANDS` config — maps command names to descriptions + handlers
- `Terminal` component — handles rendering, input, history, animation
- Dracula theme via Tailwind classes + inline styles where needed

### Content Structure (in code)

```js
const CONTENT = {
  about: `Howdy hey! I'm **[Your Name]**, a **[Title]** who loves building things...`,
  stack: `Currently I'm Frontend heavy, working with **React**, **NextJS**...`,
  projects: `...`,
  resume: `...`,
  social: `...`,
  email: `...`,
  blog: `...`,
};
```

### Migration Path (post-MVP)

Replace `CONTENT` object with actual `.md` file imports when moving to a bundler setup:

```js
import about from "./content/about.md";
import stack from "./content/stack.md";
```

Target folder structure:

```
/
├── index.jsx
├── content/
│   ├── about.md
│   ├── stack.md
│   ├── projects.md
│   ├── resume.md
│   ├── social.md
│   ├── email.md
│   ├── blog.md
│   └── banner.md
```

---

## Commands

| Command   | Type    | Source        | Behavior                                |
| --------- | ------- | ------------- | --------------------------------------- |
| `about`   | content | `about.md`    | Bio and background                      |
| `stack`   | content | `stack.md`    | Current + past tech                     |
| `projects`| content | `projects.md` | Project showcase with links             |
| `resume`  | content | `resume.md`   | External PDF link                       |
| `social`  | content | `social.md`   | Social media links                      |
| `email`   | content | `email.md`    | Email address display                   |
| `blog`    | content | `blog.md`     | Blog link(s)                            |
| `help`    | builtin | hardcoded     | List all commands with descriptions     |
| `clear`   | builtin | —             | Clear terminal output                   |
| `banner`  | builtin | `banner.md`   | Re-display ASCII art (instant, no anim) |
| `history` | builtin | —             | Show command history list               |

---

## Dracula Color Palette

| Role            | Hex       |
| --------------- | --------- |
| Background      | `#282a36` |
| Current line    | `#44475a` |
| Foreground      | `#f8f8f2` |
| Comment/muted   | `#6272a4` |
| Green           | `#50fa7b` |
| Yellow          | `#f1fa8c` |
| Pink            | `#ff79c6` |
| Purple          | `#bd93f9` |
| Orange          | `#ffb86c` |
| Cyan            | `#8be9fd` |

---

## Custom Markdown Parser

A lightweight parser built for terminal aesthetics. No external dependencies.

### Supported Syntax

| Syntax             | Renders as                  | Example                          |
| ------------------ | --------------------------- | -------------------------------- |
| `**text**`         | Bold + foreground color     | `**React**` → bold white         |
| `[text](url)`      | Clickable pink link         | `[GitHub](https://...)`          |
| `` `code` ``       | Monospace + subtle bg       | `` `npm install` ``              |
| `{{green:text}}`   | Colored text                | `{{green:stack}}` → green text   |
| `\n`               | Line break                  | Preserved as-is                  |

### Available Colors for `{{color:text}}`

`green`, `yellow`, `pink`, `purple`, `orange`, `cyan` — maps directly to Dracula palette.

### What It Won't Support

No headers (`#`), no tables, no images, no blockquotes, no nested formatting. This is intentional — terminal output should be flat text with highlights.

### Implementation

A single `parseContent(text)` function that returns an array of React elements using regex replacements, processed in order:

1. `{{color:text}}` → colored `<span>`
2. `**text**` → bold `<span>`
3. `[text](url)` → `<a>` with `target="_blank"`
4. `` `code` `` → styled `<span>`
5. Remaining text → plain `<span>`

---

## UX Behavior

### Banner

- Big ASCII art name + tagline
- Displayed **instantly** on page load (no typing animation)
- Re-displayed via `banner` command (also instant)

### Typing Animation

- Speed: **~20ms per character**
- Applies to all command outputs **except** banner
- Input is disabled while animation is running

### Arrow Key History

- **Up arrow:** Previous command in history
- **Down arrow:** Next command in history (empty if at end)
- Full session history stored in state

### Tab Autocomplete

- Single match → auto-fills the command
- Multiple matches → shows matching options in output
- Case-insensitive matching

### Terminal Input

- Prompt format: `guest@yourname.dev:~$`
- Always visible at bottom of terminal
- Auto-focused on page load and after command execution
- Mobile: full-width, scrollable output area above

### Links

- Clickable, styled pink (`#ff79c6`)
- Open in new tab (`target="_blank"`)

### Error Handling

- Invalid command → "Command not found: [input]. Type {{green:help}} to see available commands."

### Auto-scroll

- Terminal output scrolls to bottom on new content

---

## Sound

- **Library:** Tone.js
- **Trigger:** Every command completion (including banner on page load)
- **Sound:** Two-tone chime — a quick ascending pair of soft synth notes (gentle, not jarring)
- **Implementation:** Initialize Tone.js on first user interaction; play chime when typing animation completes, or immediately for instant-display commands (`banner`, `clear`, `history`)

---

## Tech Stack (for the site itself)

- **React** (single `.jsx` artifact)
- **Tailwind CSS** (utility classes)
- **Tone.js** (completion sound)
- No backend, no build step for MVP

---

## Mobile Responsiveness

- Full-width terminal window
- Input stays visible at bottom
- Scrollable output area
- Touch-friendly input field
- Readable font size (monospace)

---

## Out of Scope (V2)

- `gui` command (Windows 95 style desktop)
- `sudo` command
- `videos` / `podcasts` commands
- Theme switcher
- Sound effects beyond completion chime
- Actual `.md` file fetching (runtime)
- Backend / API integration
