---
description: Analyze repository to learn patterns and propose configuration
argument-hint: [focus area]
---

Use the `/apex:learn` skill to analyze this repository and propose configuration.

Focus area: `$ARGUMENTS` (if empty, perform full repository analysis).

Two-phase workflow:

**Phase 1: Discovery**
1. Read existing `framework/taxonomy.yaml` for context
2. Spawn `apex:repo-analyzer` to analyze codebase
3. Present clarifying questions about domain, workflows, conventions

**Phase 2: Proposals** (after user answers)
1. Spawn `apex:taxonomy-verifier` to validate suggestions
2. Propose AGENTS.md context, taxonomy additions, and skills
3. On approval, apply via `apex learn apply` or CLI commands

Constraints:
- At least ONE suggested skill must cover testing/monitoring (observability-first)
- Use CLI commands (`apex skill create`, `apex agent create`) for creation
- Verify harness parity after creating skills/agents
