---
name: apex:reflect
description: >
  Analyze session and propose skills from learnings.
  TRIGGER ON: reflection (reflect, create skill, save this, capture this, 
  make reusable, what did we learn, done, finished, completed).
required_tool_calls:
  - tool: apex skill create
    reason: "Create skills via CLI to ensure harness parity"
---

# Apex Reflect

Analyze the session and propose skills from patterns and solutions discovered.

## When to Invoke

### Manual Triggers
- User says "reflect", "create skill from this", "save this pattern"
- User says "what did we learn", "capture this", "make reusable"

### Automatic Triggers (after task completion)

## When NOT to Use

- For implementing features → use apex:work instead
- For planning complex tasks → use apex:plan instead
- For one-off fixes that won't recur → just fix it directly
- When session had no notable friction or patterns → skip reflection

---
After task completion, if **2+ validator failures** occurred during implementation:

```
┌─────────────────────────────────────────────────────────────┐
│  Task complete. {N} validator failures during this task.    │
│                                                             │
│  "This session had friction. Want me to reflect and        │
│   propose a skill to prevent this next time?"              │
│                                                             │
│  [yes] [no] [show what happened]                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Workflow

### Step 1: Analyze Full Session

Review the entire session to extract:
- **Problems solved**: What errors/issues were fixed?
- **Patterns used**: What code patterns emerged?
- **Friction points**: Where did validator failures occur?
- **Solutions discovered**: What would have helped at session start?

### Step 2: Propose Skill(s)

For each reusable pattern discovered, propose a skill:

```
┌────────────────────────────────────────────────────────────┐
│ Proposed skill: fix-prisma-migration-conflicts             │
│                                                            │
│ Description: Fix Prisma migration conflicts when multiple  │
│ developers modify schema simultaneously.                   │
│ Triggers on: migration failed, pending migrations,         │
│ schema drift.                                              │
│                                                            │
│ [create] [edit first] [skip]                              │
└────────────────────────────────────────────────────────────┘
```

### Step 3: Create Skill on Confirmation

<gate_cli_required>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Use CLI for Skill Creation                             ║
║                                                               ║
║  When user confirms skill creation:                           ║
║  → MUST use: apex skill create <name> --description "..."     ║
║  → After CLI creates the file, use Edit tool to add content   ║
║                                                               ║
║  ⛔ BLOCKING: Write tool to skill directories breaks system   ║
╚═══════════════════════════════════════════════════════════════╝
</gate_cli_required>

```bash
apex skill create fix-prisma-migration-conflicts \
  --description "Fix Prisma migration conflicts. TRIGGER ON: error (migration failed, pending migrations, schema drift)."
```

Then edit the skill file to add content following the template below.

---

## Skill Content Template

Skills created through reflection should follow this structure:

```markdown
---
name: {slug}
description: >
  {One sentence: what it does}.
  TRIGGER ON: {signal} ({keyword1}, {keyword2}, {keyword3}).
---

## When to Use
- {Condition 1}
- {Condition 2}
- Error patterns: {if applicable}

## Workflow
1. {Step}
2. {Step}

## Example
<example>
User: "{input}"
Assistant: {action}
</example>

## Common Pitfalls
| Mistake | Fix |
|---------|-----|
| {X} | {Y} |
```

---

## Output Format

<gate_context_header>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Context Header Required                                ║
║                                                               ║
║  Before presenting proposed skills, emit context header:      ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────   ║
║  │ TASK: Reflect on session learnings                         ║
║  │ GOAL: Propose skills from patterns discovered              ║
║  │ PHASE: apex:reflect → proposing {N} skill(s)               ║
║  └─────────────────────────────────────────────────────────   ║
║                                                               ║
║  Include summary of analysis:                                 ║
║  - Session overview (tasks, errors, fixes)                    ║
║  - Patterns identified                                        ║
║  - Skills proposed                                            ║
╚═══════════════════════════════════════════════════════════════╝
</gate_context_header>

After skill creation:
- Confirm: "Created skill: .claude/skills/{name}/SKILL.md"
- Show skill summary
- Remind: "Run `apex sync` to sync to all harnesses"

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
║  If improvements identified → Recursively improve this skill  ║
║  by proposing a skill update as one of the suggestions.       ║
║                                                               ║
║  This creates a feedback loop for continuous skill refinement.║
╚═══════════════════════════════════════════════════════════════╝
</gate_skill_reflection>
