---
name: apex:plan
description: >
  Create implementation plans with completion criteria and verification method.
  TRIGGER ON: planning (plan, approach, design, architecture, spec, how should I, what's the best way),
  OR implementation + 3+ files mentioned.
required_tool_calls:
  - tool: apex:explorer
    reason: "Map relevant code paths before planning"
  - tool: apex:plan-readiness-auditor
    reason: "Audit plan before presenting to user"
---

# Apex Plan

## When to Invoke

- User says "plan", "approach", "design", "architecture", "spec"
- User asks "how should I" or "what's the best way"
- User mentions implementation affecting 3+ files
- User references: skills, agents, hooks, settings, harness config

## When NOT to Use

- For simple single-file fixes → use apex:work directly
- For implementing an already-approved plan → use apex:work instead
- For reviewing changes → use apex:review instead
- For learning about codebase → use apex:learn instead

---

## Required Questions (ask before planning)

1. **"How do I test whether the task is completed or not?"**
2. **"What does completed look like?"**

If the user gives defaults, record those verbatim.

## Workflow (STRICT ORDER)

<checkpoint_verify_knowledge>
### Step 1: Search Knowledge
- **Spawn `apex:knowledge`** (Mode 1) with task keywords
- VERIFY: Did you receive a response?
  - If YES → Proceed to Step 2
  - If NO → STOP, something is wrong
</checkpoint_verify_knowledge>

<checkpoint_verify_explorer>
### Step 2: Explore Codebase
- **Spawn `apex:explorer`** to map relevant code paths
- VERIFY: Did you receive a file list?
  - If YES → Proceed to Step 3
  - If NO → STOP, something is wrong
</checkpoint_verify_explorer>

### Step 3: Create Task File
- Create/Update task file in `.apex/tasks/` early
- Include: task description, completion criteria, verification method
- Reference any relevant knowledge docs found

### Step 4: Draft Plan
- Draft the plan with ALL 5 REQUIRED SECTIONS (see Output Format below)
- VERIFY: Are all 5 sections present?
  - If ANY missing → Add the missing section before proceeding

<gate_audit_required>
### Step 5: Plan Audit (MANDATORY)
- **Spawn `apex:plan-readiness-auditor`** with the plan
- VERIFY: What is the VERDICT?
  - If PASS → Proceed to Step 6
  - If FAIL → Fix all MUST-FIX items, then re-audit
  - ⛔ BLOCKING: Cannot proceed until PASS
</gate_audit_required>

### Step 6: Present Plan
- Present the final plan to user
- Confirm you will follow the verification method

<gate_handoff_to_work>
### Step 7: Handoff (After User Approval)
- When user approves the plan:
  - **AUTOMATICALLY invoke apex:work skill**
  - This is NOT optional
- If user requests changes:
  - Revise plan
  - Re-run audit (Step 5)
  - Present again (Step 6)
</gate_handoff_to_work>

---

## Output Format (ALL 5 SECTIONS MANDATORY)

<gate_context_header>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Context Header Required                                ║
║                                                               ║
║  Before presenting plan, emit context header:                 ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────   ║
║  │ TASK: {task title - what user asked for}                   ║
║  │ GOAL: {why - the problem being solved}                     ║
║  │ PHASE: apex:plan → next: user approval → apex:work         ║
║  └─────────────────────────────────────────────────────────   ║
║                                                               ║
║  This helps engineers returning to parallel sessions          ║
║  understand what this agent is working on and why.            ║
╚═══════════════════════════════════════════════════════════════╝
</gate_context_header>

<output_guardrail>
⛔ OUTPUT GUARDRAIL: If ANY section is missing, the plan is INVALID.
Re-draft with all 5 sections before presenting to user.
</output_guardrail>

### 1. Completion Criteria
What defines "done"? Each criterion must be checkable.

```yaml
completion_criteria:
  - "[ ] Feature X works as specified"
  - "[ ] All existing tests pass"
  - "[ ] New tests cover edge cases"
  - "[ ] No TypeScript errors"
```

### 2. Verification Commands
Exact commands to validate completion.

```yaml
verification_commands:
  lint: "pnpm lint"
  typecheck: "pnpm typecheck"
  test: "pnpm test:run"
  manual: "Demonstrate feature X"
```

### 3. Validation Loop
When and how to run validators during implementation.

```yaml
validation_loop:
  trigger: "After each file batch (3-5 files)"
  on_success: "Proceed to next batch"
  on_failure:
    - "Search apex:knowledge for known fix"
    - "If not found, debug manually"
    - "Re-run validators"
    - "Loop until green"
```

### 4. Tooling Timeline
Which apex agents to use and when.

```yaml
tooling_timeline:
  - phase: "Exploration"
    agent: "apex:explorer"
    purpose: "Map relevant files"
  - phase: "Implementation"
    agent: "apex:validator"
    trigger: "After each batch"
  - phase: "On failure"
    agent: "apex:knowledge (Mode 2)"
    purpose: "Search for known fixes"
```

### 5. Risks & Rollback
What could go wrong and how to recover.

```yaml
risks:
  - risk: "Breaking existing functionality"
    mitigation: "Run full test suite after each batch"
    rollback: "git checkout -- <files>"
  - risk: "Performance regression"
    mitigation: "Benchmark before and after"
    rollback: "Revert commit"
```

---

## Implementation Plan Section

After the 5 mandatory sections, include:

- **Overview** (1 paragraph)
- **Implementation steps** (numbered)
- **Files expected to change** (list)

### Consider Diagrams

For architecture or complex workflows, proactively create a mermaid diagram:
- System architecture → Component relationships
- Data flows → Sequence diagrams
- State machines → State diagrams
- Decision logic → Flowcharts

Diagrams clarify plans better than prose alone.

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
║  "Skill improvement: apex:plan - [specific suggestion]"       ║
║                                                               ║
║  This creates a feedback loop for continuous skill refinement.║
╚═══════════════════════════════════════════════════════════════╝
</gate_skill_reflection>
