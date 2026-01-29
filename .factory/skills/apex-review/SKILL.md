---
name: apex:review
description: >
  Review changes, ensure validators pass, apply fixes.
  TRIGGER ON: review (review, check, look at, before commit, before merge, ready to commit, ready to merge, ready for PR).
required_tool_calls:
  - tool: apex:validator
    reason: "Ensure validators pass before review"
  - tool: apex:reviewer
    reason: "Review code changes for correctness"
---

# Apex Review

## When to Invoke

- User says "review", "check", "look at" the changes
- User says "before commit", "before merge", "before PR"
- User says "ready to commit", "ready to merge", "ready for PR"

## When NOT to Use

- For implementing new features → use apex:work instead
- For planning changes → use apex:plan instead
- For learning codebase patterns → use apex:learn instead
- When there are no uncommitted changes → nothing to review

---

## Workflow

1. **Ensure validators are green**.
   - If not, invoke `/apex:work` first.
2. **Spawn `apex:reviewer`** to review the diff for:
   - correctness
   - simplicity
   - security footguns
   - consistency with existing patterns
   - (if harness/config touched) dual-harness parity risks
3. **Apply fixes** (keep scope tight).
4. **Re-run validators**.

## Output Format

<gate_context_header>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Context Header Required                                ║
║                                                               ║
║  Before presenting review findings, emit context header:      ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────   ║
║  │ TASK: Review changes on {branch} for {purpose}             ║
║  │ GOAL: {what prompted the review - commit/merge/PR}         ║
║  │ PHASE: apex:review → next: {commit|fixes needed}           ║
║  └─────────────────────────────────────────────────────────   ║
║                                                               ║
║  Include git context: branch name, last commit message.       ║
║  This helps engineers returning to parallel sessions          ║
║  understand what this agent is working on and why.            ║
╚═══════════════════════════════════════════════════════════════╝
</gate_context_header>

- **Context header** (see gate above)
- **Review findings** (bullets)
- **Fixes applied** (bullets)
- **Validation status**: PASS/FAIL

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
║  "Skill improvement: apex:review - [specific suggestion]"     ║
║                                                               ║
║  This creates a feedback loop for continuous skill refinement.║
╚═══════════════════════════════════════════════════════════════╝
</gate_skill_reflection>
