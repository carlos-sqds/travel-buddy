---
name: apex:create-agent
description: >
  Create sub-agents or droids via apex CLI (enforces harness parity).
  TRIGGER ON: create_agent (create agent, add agent, make agent, create droid, add droid, new agent).
required_tool_calls:
  - tool: apex agent create
    reason: "Create agents via CLI to ensure harness parity"
  - tool: apex agent list
    reason: "Verify harness parity after creation"
---

# Create Agent

Create sub-agents (Claude Code) or droids (Factory Droid) using the apex CLI.

## When to Invoke

- User says "create agent", "add agent", "make sub-agent"
- User says "create droid", "add droid"
- Explicit invocation via `/apex:create-agent`

## When NOT to Use

- For creating skills → use apex:create-skill instead
- For creating hooks → use apex:create-hook instead
- For one-off tasks → just do them directly, no need for an agent
- When agent already exists → edit existing agent instead

---

<gate_cli_create>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Use CLI for Agent Creation                             ║
║                                                               ║
║  To create an agent:                                          ║
║  → MUST use: apex agent create <name> --description "..."     ║
║  → Do NOT use Write/Create tool to .claude/agents/            ║
║  → Do NOT use Write/Create tool to .factory/droids/           ║
║  → CLI ensures dual-harness parity automatically              ║
║                                                               ║
║  ⛔ BLOCKING: Write tool breaks harness parity                ║
╚═══════════════════════════════════════════════════════════════╝
</gate_cli_create>

This ensures:
- Agent is created in BOTH harnesses automatically
- Harness parity is enforced
- Consistent file structure

## Agent Design Principles

### When to Create an Agent

Good candidates for agents:
- **Specialized expertise**: Deep knowledge in one area (e.g., database migrations)
- **Isolated tasks**: Work that benefits from focused context
- **Parallel execution**: Tasks that can run independently
- **Reusable patterns**: Common workflows across projects

Not good candidates:
- One-off tasks (just do them directly)
- Tasks requiring conversation with user
- Tasks that need full session context

### Agent Components

1. **Model**: Choose based on task complexity
   - `haiku` - Fast, cheap, good for simple tasks
   - `sonnet` - Balanced, most common choice
   - `opus` - Complex reasoning, expensive

2. **Tools**: Only include what's needed
   - `Execute` - Run commands
   - `Read` - Read files
   - `Grep` / `Glob` - Search codebase
   - `Edit` / `Create` - Modify files
   - `WebSearch` / `FetchUrl` - Web access

3. **Instructions**: Clear, specific guidance on behavior

## Agent Creation Flow

### 1. Gather Information

Collect:
- **name**: lowercase with hyphens (e.g., `db-migrator`, `test-runner`)
- **description**: what this agent does
- **model**: haiku, sonnet, or opus
- **tools**: comma-separated list of required tools

### 2. Spawn Apex CLI Agent

Use the Task tool to spawn a sub-agent that executes the apex CLI:

```
Spawn sub-agent with prompt:

"Execute this apex CLI command:

apex agent create {name} \
  --description \"{description}\" \
  --model {model} \
  --tools \"{tools}\"

Return the paths of created files and any errors."
```

The CLI creates in BOTH harnesses:
- `.claude/agents/{name}.md`
- `.factory/droids/{name}.md`

### 3. Update Content

After creation, update the generated files with full instructions:

```markdown
# {Agent Title}

{Description}

## Model

{model}

## Tools

- {tool1}
- {tool2}

## Instructions

{Detailed instructions on how the agent should behave}

## Response Format

{Expected output format}
```

## Agent Template

```markdown
# {Agent Name}

{One-sentence description of what this agent does.}

## Model

haiku

## Tools

- Execute
- Read
- Grep

## Instructions

You are a specialized agent for {purpose}.

Your job is to:
1. {First responsibility}
2. {Second responsibility}
3. {Third responsibility}

When executing:
- {Guideline 1}
- {Guideline 2}

## Response Format

Always respond with:
```
STATUS: success | error
RESULT: {description of what was done}
FILES: {list of affected files if any}
```
```

## Examples

### Example: Database Migration Agent

```markdown
# Database Migrator

Run and manage database migrations safely.

## Model

sonnet

## Tools

- Execute
- Read
- Grep

## Instructions

You are a database migration specialist. Your job is to:

1. Check current migration status
2. Run pending migrations
3. Verify migration success
4. Rollback if errors occur

Always run migrations in a transaction when possible.
Never run migrations on production without explicit confirmation.

## Response Format

```
STATUS: success | error
MIGRATIONS_RUN: 3
CURRENT_VERSION: 2024_01_15_001
```
```

## After Creating

<gate_verify_parity>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Verify Harness Parity After Creation                   ║
║                                                               ║
║  After creating agent:                                        ║
║  → MUST run: apex agent list                                  ║
║  → Verify output shows [claude: ✓] [factory: ✓]               ║
║  → If missing checkmark, creation failed - investigate        ║
║                                                               ║
║  ⛔ BLOCKING: Unverified creation may break one harness       ║
╚═══════════════════════════════════════════════════════════════╝
</gate_verify_parity>

1. **Verify parity**: Run `apex agent list` to confirm agent exists in all harnesses
2. **Test the agent**: Spawn it with a simple task to verify behavior
3. **Iterate**: Refine instructions based on actual usage

---

## Output Format

<gate_context_header>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Context Header Required                                ║
║                                                               ║
║  Before presenting creation result, emit context header:      ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────   ║
║  │ TASK: Create agent: {agent-name}                           ║
║  │ GOAL: {what the agent will handle}                         ║
║  │ PHASE: apex:create-agent → next: {edit content|verify}     ║
║  └─────────────────────────────────────────────────────────   ║
║                                                               ║
║  This helps engineers returning to parallel sessions          ║
║  understand what this agent is working on and why.            ║
╚═══════════════════════════════════════════════════════════════╝
</gate_context_header>

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
║  "Skill improvement: apex:create-agent - [specific suggestion]"║
║                                                               ║
║  This creates a feedback loop for continuous skill refinement.║
╚═══════════════════════════════════════════════════════════════╝
</gate_skill_reflection>
