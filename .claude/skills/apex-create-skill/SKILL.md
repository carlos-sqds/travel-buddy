---
name: apex:create-skill
description: >
  Create reusable skills via apex CLI (enforces harness parity).
  TRIGGER ON: create_skill (create skill, make skill, add skill, new skill, make reusable, save this workflow).
required_tool_calls:
  - tool: apex skill create
    reason: "Create skills via CLI to ensure harness parity"
  - tool: apex skill list
    reason: "Verify harness parity after creation"
---

# Create Skill

Create skills using the apex CLI to enforce harness parity.

## When to Invoke

- User says "create skill", "make this a skill", "add skill"
- User says "make reusable", "save this workflow", "skill for [topic]"
- Explicit invocation via `/apex:create-skill`

## When NOT to Use

- For creating agents/droids → use apex:create-agent instead
- For creating hooks → use apex:create-hook instead
- For analyzing session learnings → use apex:reflect first
- When skill already exists → edit existing skill instead

---

<gate_cli_create>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Use CLI for Skill Creation                             ║
║                                                               ║
║  To create a skill:                                           ║
║  → MUST use: apex skill create <name> --description "..."     ║
║  → Do NOT use Write/Create tool to .claude/skills/            ║
║  → Do NOT use Write/Create tool to .factory/skills/           ║
║  → CLI ensures dual-harness parity automatically              ║
║                                                               ║
║  ⛔ BLOCKING: Write tool breaks harness parity                ║
╚═══════════════════════════════════════════════════════════════╝
</gate_cli_create>

## Workflow

### Step 1: Gather Information

Collect from user:
- **name**: lowercase with hyphens (e.g., `db-migrate`, `test-runner`)
- **description**: Must follow taxonomy format (see below)

### Step 2: Create via CLI

```bash
apex skill create <name> --description "<description>"
```

Example:
```bash
apex skill create db-migrate --description "Run database migrations safely. TRIGGER ON: db_keywords (migrate, migration, schema), implementation_keywords (run, apply)."
```

### Step 3: Edit Generated Content

The CLI creates `SKILL.md` in both harnesses. Edit to add full content:

```bash
# Edit the skill content (edits apply to both via sync)
# Edit in framework/skills/<name>/SKILL.md if this is a framework skill
# Or edit in .claude/skills/<name>/SKILL.md for project-specific skills
```

### Step 4: Verify Parity

<gate_verify_parity>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Verify Harness Parity After Creation                   ║
║                                                               ║
║  After creating skill:                                        ║
║  → MUST run: apex skill list                                  ║
║  → Verify output shows [claude: ✓] [factory: ✓]               ║
║  → If missing checkmark, creation failed - investigate        ║
║                                                               ║
║  ⛔ BLOCKING: Unverified creation may break one harness       ║
╚═══════════════════════════════════════════════════════════════╝
</gate_verify_parity>

```bash
apex skill list
```

Confirm skill shows `[claude: ✓] [factory: ✓]`.

---

## Observable Signal Taxonomy

All skill descriptions MUST use triggers from this taxonomy. Triggers are **detectable tokens/patterns** in user input.

> **Canonical reference**: `framework/taxonomy.yaml` is the source of truth for all signals.

### Keyword Signals

```yaml
planning_keywords:
  - "plan", "approach", "design", "architecture", "spec"
  - "how should I", "what's the best way"
  
implementation_keywords:
  - "implement", "build", "create", "add", "write"
  - "fix", "refactor", "migrate", "update"

modification_keywords:
  - "delete", "remove", "rename", "move", "clean", "cleanup"

error_keywords:
  - "error", "exception", "failed", "broken", "crash"
  - "not working", "doesn't work", "bug"

debug_keywords:
  - "debug", "debugging", "investigate", "diagnose"

review_keywords:
  - "review", "check", "look at", "before commit"

harness_content:
  - ".claude/", ".factory/", "AGENTS.md", "settings.json"
  - "skill", "hook", "agent", "droid"
```

### Required Description Format

```yaml
description: >
  {One sentence: what it does}.
  TRIGGER ON: {signal_name} ({keyword1}, {keyword2}, ...).
```

**Good**:
```yaml
description: >
  Run database migrations safely.
  TRIGGER ON: db (migrate, migration, schema, run migrations, apply migrations).
```

**Bad** (no observable signals):
```yaml
description: Helps with database stuff.
```

---

## Skill Template

After CLI creates the file, update with this structure:

```markdown
---
name: {skill-name}
description: >
  {One sentence: what it does}.
  TRIGGER ON: {signals from taxonomy}.
---

# {Skill Title}

{1-2 sentence overview.}

## When to Invoke

- User says "{keyword from taxonomy}"
- User message contains {content signal}
- Explicit invocation via `/{skill-name}`

## Workflow

### Step 1: {First Step}
{Details}

## Common Pitfalls

- {Pitfall}
```

---

## Output Format

<gate_context_header>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Context Header Required                                ║
║                                                               ║
║  Before presenting creation result, emit context header:      ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────   ║
║  │ TASK: Create skill: {skill-name}                           ║
║  │ GOAL: {what the skill will automate}                       ║
║  │ PHASE: apex:create-skill → next: {edit content|verify}     ║
║  └─────────────────────────────────────────────────────────   ║
║                                                               ║
║  This helps engineers returning to parallel sessions          ║
║  understand what this agent is working on and why.            ║
╚═══════════════════════════════════════════════════════════════╝
</gate_context_header>

---

## Common Pitfalls

- **Missing taxonomy signals** - Description must have "TRIGGER ON:" with observable tokens

(CLI usage and parity verification are enforced by gates above)

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
║  "Skill improvement: apex:create-skill - [specific suggestion]"║
║                                                               ║
║  This creates a feedback loop for continuous skill refinement.║
╚═══════════════════════════════════════════════════════════════╝
</gate_skill_reflection>
