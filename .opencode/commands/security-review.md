---
description: Run a mandatory security review of the current changes
agent: reviewer
---

Review the current worktree for security vulnerabilities. Inspect the complete
diff and relevant surrounding code. Report findings first, ordered by severity,
with file and line references. Do not modify files.

Check authentication, authorization, input validation, SSRF, XSS, CSRF, rate
limiting, secrets, race conditions, database migrations, security headers,
dependency risk, and production configuration. Confirm whether tests and build
verification are sufficient. Do not approve the work if serious findings
remain.
