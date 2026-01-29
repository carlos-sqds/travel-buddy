---
description: Run Apex work loop (implement → validate → fix → repeat)
argument-hint: [scope]
---

Use the `/apex:work` skill to execute the task in tight validation loops.

Work scope: `$ARGUMENTS` (if empty, use the current task context).

Constraints:
- Make small changes.
- After each batch, run deterministic validators (prefer project-documented commands; use `pnpm validate` if present).
- Fix the first failing signal and repeat until validators pass.
