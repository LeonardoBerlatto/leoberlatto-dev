# Testing and Validation

- Run `npm test` for behavior changes; add/update tests when command/UI logic changes.
- For substantial parser/command changes, prefer focused unit tests over brittle component tests.
- If a change touches `app/page.tsx` or `components/Terminal.tsx`, verify current tests still match real UI behavior.
