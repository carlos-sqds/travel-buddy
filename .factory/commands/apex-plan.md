---
description: Run Apex planning loop (plan + mandatory readiness audit)
argument-hint: [topic]
---

Use the `/apex:plan` skill to produce a concrete implementation plan.

Planning target: `$ARGUMENTS` (if empty, plan for the current conversation task).

Constraints:
- Ask for completion criteria + verification method if not already provided.
- Spawn `apex:plan-readiness-auditor` and iterate until it returns **PASS**.
- Ensure the plan includes explicit validators and how they’ll be run.
