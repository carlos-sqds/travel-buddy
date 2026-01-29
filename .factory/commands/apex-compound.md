---
description: Capture learnings from the task (failure signals, fix, prevention)
argument-hint: [topic]
---

Use the `/apex:compound` skill to capture what was learned.

Topic: `$ARGUMENTS` (if empty, infer from the task context).

Constraints:
- Spawn `apex:compound-scribe`.
- Produce a compact artifact: signal → fix → repro → prevention.
- Persist into the task file or `.apex/knowledge/`.
