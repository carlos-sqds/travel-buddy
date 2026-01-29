---
name: apex:work
description: >
  Execute implementation in tight validation loops until validators pass.
  TRIGGER ON: implementation (implement, build, create, add, write, fix, refactor, migrate, update),
  modification (delete, remove, rename, move, clean, cleanup).
required_tool_calls:
  - tool: apex:validator
    reason: "Run validators after each batch of changes"
---

# Apex Work

## When to Invoke

- User says "implement", "build", "create", "add", "write"
- User says "fix", "refactor", "migrate", "update"
- User says "delete", "remove", "rename", "move", "clean", "cleanup"
- User says "optimize", "improve", "enhance", "speed up"
- User says "test", "add test", "write test"
- User does NOT say "plan", "approach", "design" (use apex:plan instead)
- Validators are failing and need to converge to green
- **After user approves an apex:plan** (automatic handoff)

## When NOT to Use

- For planning multi-file changes → use apex:plan first
- For questions about architecture → use apex:plan instead
- For reviewing existing changes → use apex:review instead
- For learning codebase patterns → use apex:learn instead

---

## Validation Loop (CORE PATTERN)

<validation_loop_diagram>
```
┌─────────────────────────────────────────────────────────────────┐
│                    VALIDATION LOOP                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│         ┌─────────────┐                                        │
│         │ Implement   │                                        │
│         │ small batch │ ← 3-5 files max                        │
│         └──────┬──────┘                                        │
│                │                                                │
│                ▼                                                │
│         ┌─────────────────┐                                    │
│         │ apex:validator  │ ← Spawn after EACH batch           │
│         │ (lint/type/test)│                                    │
│         └──────┬──────────┘                                    │
│                │                                                │
│                ▼                                                │
│         ╔═════════════════════════════════════╗                │
│         ║ Validators Pass?                    ║                │
│         ║                                     ║                │
│         ║  ✓ PASS → Next batch or complete   ║                │
│         ║                                     ║                │
│         ║  ✗ FAIL → Debug error             ║                │
│         ║              │                     ║                │
│         ║              ▼                     ║                │
│         ║          Fix the issue             ║                │
│         ║              │                     ║                │
│         ║              ▼                     ║                │
│         ║          Re-run validators ────────╣                │
│         ╚═════════════════════════════════════╝                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
</validation_loop_diagram>

---

## Core Loop Steps

### Step 1: Check for Domain Skills
- Review `tool_hints.domain` from interpreter
- If a matching third-party skill is installed, **invoke it** as part of implementation
- Example: `tool_hints.domain: ["security", "vulnerability"]` → use `building-secure-contracts` if installed
- Third-party skills run **within** this workflow, not instead of it

### Step 2: Choose Validators
- Prefer project-documented commands (AGENTS.md / package scripts)
- If `pnpm validate` exists, use it
- If unsure, ask the user rather than guessing

### Step 3: Implement in Small Batches
- Keep diffs tight (3-5 files max per batch)
- After EACH batch, run validators (Step 4)

### Step 3b: Parallel Execution (AGGRESSIVE)

<parallel_execution_guidance>
**Default stance: Parallelize aggressively for speed.**

### Tool-Level Parallelism (Always)
Run read-only tools in parallel whenever possible:
- Multiple `Grep` searches for different patterns
- Multiple `Read` calls for different files  
- Multiple `Glob` searches for different file types
- Exploration + TodoWrite in the same response

```
# GOOD - Parallel reads
[Read file1.ts] [Read file2.ts] [Read file3.ts]  ← Same response

# BAD - Sequential reads
[Read file1.ts] → wait → [Read file2.ts] → wait → [Read file3.ts]
```

### Sub-Agent Parallelism (After Planning)

**When to spawn parallel sub-agents:**
- Modifying **independent files** with no cross-dependencies
- Implementing across **separate layers** (frontend, backend, API, database)
- Running **multiple validation commands** independently
- Searching/exploring multiple areas of codebase simultaneously

**When NOT to parallelize:**
- Files that import from each other
- Sequential refactors where changes depend on earlier ones
- Edits to the **same file** (never parallel)

**Example - Parallel File Edits:**
```
User: "Unskip tests in a.test.ts, b.test.ts, c.test.ts"

→ Spawn 3 parallel sub-agents in SAME response
→ Each agent: Read → Edit → Return result
→ Combine results, run validators once
```

**Example - Layer-Based (Post-Plan):**
```
Plan approved: "Add user preferences feature"

→ Spawn parallel sub-agents:
  - Agent 1: Backend API (src/api/preferences.ts)
  - Agent 2: Database migration (prisma/schema.prisma)  
  - Agent 3: Frontend UI (src/components/Preferences.tsx)

→ Wait for all
→ Run integration validators
```

**Example - Parallel Exploration:**
```
Task: "Understand auth system"

→ Spawn parallel searches:
  - Agent 1: "Find JWT validation logic"
  - Agent 2: "Find session management"
  - Agent 3: "Find permission checks"

→ Combine findings into unified understanding
```
</parallel_execution_guidance>

### Step 4: Run Validators
- **Spawn `apex:validator`** to run the commands and summarize failures
- Do NOT skip this step
- Do NOT run validators only at the end

<gate_validators_required>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Validators Must Run After Each Batch                   ║
║                                                               ║
║  After implementing 3-5 files:                                ║
║  → Spawn apex:validator                                       ║
║  → Wait for results                                           ║
║                                                               ║
║  ⛔ Do NOT continue to next batch without validation          ║
╚═══════════════════════════════════════════════════════════════╝
</gate_validators_required>

### Step 5: Handle Failures

<failure_handling>
When validators fail:

1. **Debug based on failure output:**
   - Read the error message carefully
   - Fix the issue
   - Re-run validators
   
2. **Track repeated failures:**
   - If 2+ failures on same issue, note for reflection (apex:reflect)
</failure_handling>

### Step 6: Completion Gate

<gate_validators_green>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: All Validators Must Pass                               ║
║                                                               ║
║  Before completing implementation:                            ║
║  → All validators MUST be green                               ║
║  → OR user explicitly accepts skipping                        ║
║                                                               ║
║  ⛔ BLOCKING: Cannot complete with failing validators         ║
╚═══════════════════════════════════════════════════════════════╝
</gate_validators_green>

---

## Failure Handling Rules

- Always address the **first failing command** first
- Keep failure context minimal: first error + a short tail
- If a failure requires broad refactor, pause and ask for confirmation
- Avoid unrelated refactors during fix attempts

---

## Self-Audit Before Completion

<self_audit_checklist>
Before marking implementation complete, verify:

1. [ ] Did I run validators after EACH batch? (not just at end)
2. [ ] Are all validators currently green?
3. [ ] Did I avoid unrelated changes?
4. [ ] Did I use CLI for any skill/agent creation? (see gate below)

If ANY answer is NO → Go back and complete the missing step
</self_audit_checklist>

---

## Creating Skills or Agents During Implementation

<gate_cli_required>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Use CLI Commands - Never Write Tool                    ║
║                                                               ║
║  If this task involves creating skills or agents:             ║
║  → MUST use apex CLI via Bash tool                            ║
║  → NEVER use Write tool to these directories                  ║
║                                                               ║
║  REQUIRED - Use Bash tool:                                    ║
║  • apex skill create <name> --description "..."               ║
║  • apex agent create <name> --description "..."               ║
║                                                               ║
║  FORBIDDEN - Never use Write tool to:                         ║
║  • .claude/skills/*   • .factory/skills/*                     ║
║  • .claude/agents/*   • .factory/droids/*                     ║
║                                                               ║
║  After CLI creates the file, use Edit tool to add content.    ║
║                                                               ║
║  ⛔ BLOCKING: Write tool to these paths breaks the system     ║
╚═══════════════════════════════════════════════════════════════╝
</gate_cli_required>

---

## Output Format

<gate_context_header>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Context Header Required                                ║
║                                                               ║
║  Before EVERY batch result, emit context header:              ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────   ║
║  │ TASK: {task title from .apex/tasks/ or first TodoWrite}   ║
║  │ GOAL: {why - from completion criteria or user request}    ║
║  │ PHASE: apex:work (batch N/M) → next: {validator|done}     ║
║  └─────────────────────────────────────────────────────────   ║
║                                                               ║
║  Source priority for TASK/GOAL:                               ║
║  1. .apex/tasks/{current-task}.md title + completion_criteria ║
║  2. TodoWrite first pending/in_progress item                  ║
║  3. User's original request (first sentence)                  ║
║                                                               ║
║  This helps engineers returning to parallel sessions          ║
║  understand what this agent is working on and why.            ║
╚═══════════════════════════════════════════════════════════════╝
</gate_context_header>

After each batch, output:

- **Context header** (see gate above)
- **Validation status**: PASS/FAIL
- **Validators run**: list of commands
- **What changed**: 1-5 bullets
- **If FAIL**: first failing command + next step

At completion, add state summary:

```
## State Summary
**Completed:** {list completed items}
**To Resume:** {what to do if continuing this work}
```

---

## Session End Trigger

<checkpoint_substantial_session>
After completing a substantial implementation:

- [ ] Multi-step implementation? [Y/N]
- [ ] Novel problem solved? [Y/N]
- [ ] Bug fixed after debugging? [Y/N]

If ANY YES → Suggest: "Should I capture learnings with apex:reflect?"
</checkpoint_substantial_session>

---

## Skill Reflection (End of Skill)

<gate_skill_reflection>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Skill Self-Improvement Reflection                      ║
║                                                               ║
║  After completing this skill's workflow, reflect:             ║
║                                                               ║
║  1. Did the skill instructions lead to the goal efficiently?  ║
║  2. Were there unnecessary steps or missing guidance?         ║
║  3. Could better wording have reduced confusion or tokens?    ║
║  4. What patterns emerged that should be captured?            ║
║                                                               ║
║  If improvements identified → Call apex:reflect with:         ║
║  "Skill improvement: apex:work - [specific suggestion]"       ║
║                                                               ║
║  This creates a feedback loop for continuous skill refinement.║
╚═══════════════════════════════════════════════════════════════╝
</gate_skill_reflection>
