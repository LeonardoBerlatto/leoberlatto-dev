# Playbook: Parsing and Rendering

1. Update `lib/parse-content.tsx` first.
2. Ensure existing syntax remains backward-compatible unless explicitly changing the spec.
3. Prefer small, composable parsing steps; avoid expensive regex backtracking.
