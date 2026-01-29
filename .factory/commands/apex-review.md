---
description: Run Apex review loop (review → fix → re-validate)
argument-hint: [scope]
---

Use the `/apex:review` skill to review and refine changes.

Review scope: `$ARGUMENTS` (if empty, review the current changes/task).

Constraints:
- Ensure validators are green (invoke `/apex:work` first if needed).
- Spawn `apex:reviewer` for a focused review.
- Apply fixes and re-run validators before finishing.
