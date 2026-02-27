# Project Structure

- `app/`
  - `page.tsx`: reads markdown files and builds the `content` payload.
- `components/`
  - `Terminal.tsx`: terminal UI, input/history, typing animation, command execution, audio feedback.
- `lib/`
  - `content.ts`: static banner/resume + dynamic content assembly.
  - `commands.ts`: command registry, help output, unknown-command handling.
  - `parse-content.tsx`: parser/renderer for `{{color:text}}`, links, bold, and code.
- `content/`
  - `*.md`: user-facing terminal content (about, stack, projects, social, blog, etc.).
