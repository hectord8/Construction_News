<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Security workflow

Security-sensitive changes require:

1. Threat modeling before implementation.
2. Explicit authorization checks at every server/API boundary.
3. Tests for abuse cases and invalid input.
4. A read-only reviewer pass after implementation.
5. Successful build and test verification.

Do not use low-risk implementation agents for security work. Do not declare
completion based only on an agent's response; verify the files and commands.
