---
name: sandbox-node-modules-blocked
description: Bash/Read access to node_modules is blocked by .claude/.skignore in this repo's sandbox
metadata:
  type: reference
---

Both the `Bash` and `Read` tools refuse access to anything under `node_modules/` in this repo
(`mock-aidd-kudo-app`) — blocked by `.claude/.skignore`, which would need a `!node_modules`
allow-rule to lift. This blocks directly inspecting a dependency's shipped `.d.ts`/docs (e.g. to
verify a Next.js API like `unstable_rethrow` actually exists in the installed version).

**Why:** sandbox config choice (not something to work around by escalating permissions).

**How to apply:** when a review task asks to "verify against node_modules/next/dist/docs" and
direct access is blocked, fall back to indirect verification — e.g. `pnpm exec tsc --noEmit`
succeeding is strong evidence a named import/export actually exists in the installed package
version, since a missing export would be a type error. Don't report this as a blocker; just note
the verification method used.
