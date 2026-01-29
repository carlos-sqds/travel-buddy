## Session Start

At the beginning of every new session, say: **"Apex framework 0.5.2 loaded"**

This confirms AGENTS.md is loaded correctly.

---

## Interpretation (MANDATORY FIRST STEP)

<gate_1_interpretation>
╔═══════════════════════════════════════════════════════════════╗
║  GATE 1: Interpretation Required                              ║
║                                                               ║
║  Your FIRST action on ANY user message MUST be:               ║
║  → Spawn apex:interpreter with the user's message             ║
║                                                               ║
║  ⛔ BLOCKING: Do NOT read files, explore code, or respond     ║
║     until interpretation completes.                           ║
╚═══════════════════════════════════════════════════════════════╝
</gate_1_interpretation>

<only_skip_if>
- Pure greeting ("hi", "hello", "thanks", "bye")
- User explicitly says "skip interpretation" or "just do it"
- Continuation of existing task in same session (interpretation already done for this task)
</only_skip_if>

### Good First Response Example

User: "the calendar times are wrong"

```
Your first action MUST be:
[Task tool call to apex:interpreter with the user's message]

Then WAIT for the result before doing anything else.
```

### Bad First Response Example (NEVER DO THIS)

User: "the calendar times are wrong"

```
"Let me look at the calendar code..."
[Immediately reads files or starts exploring]
```

This skips interpretation. NEVER do this for task requests.

---

## Blocking Questions

<gate_2_blocking_questions>
╔═══════════════════════════════════════════════════════════════╗
║  GATE 2: Blocking Questions                                   ║
║                                                               ║
║  If interpretation returns `mode.blocking_questions`:         ║
║  → ASK each question                                          ║
║  → WAIT for user's answers                                    ║
║  → RECORD answers in task file                                ║
║                                                               ║
║  ⛔ BLOCKING: Cannot proceed until ALL questions answered     ║
╚═══════════════════════════════════════════════════════════════╝
</gate_2_blocking_questions>

Common blocking questions:
- "How will you verify this is complete?"
- "What does success look like?"

These answers go into the task file and guide verification.

---

## Oracle (Expert Advisor)

<oracle_guidance>
╔═══════════════════════════════════════════════════════════════╗
║  apex:oracle - Senior Engineering Advisor                     ║
║                                                               ║
║  Use the oracle for complex reasoning tasks:                  ║
║  • Architecture planning and design decisions                 ║
║  • Code review and improvement suggestions                    ║
║  • Debugging multi-file issues                                ║
║  • Expert guidance when stuck                                 ║
║                                                               ║
║  The oracle is READ-ONLY - it advises but does not edit.      ║
╚═══════════════════════════════════════════════════════════════╝
</oracle_guidance>

### When to Consult the Oracle

- **Planning complex features**: Before implementation, get architecture guidance
- **Debugging failures after 2+ attempts**: When you can't figure out why something fails
- **Reviewing your own work**: Before presenting to user, validate approach
- **Making technology choices**: When multiple approaches are viable

### How to Invoke

Announce your intent to the user:
- "I'm going to consult the oracle for architecture guidance"
- "I need to ask the oracle about this debugging issue"

Then spawn `apex:oracle` with:
- **task**: What you need help with
- **context**: What you've tried, relevant background
- **files**: Specific files to examine (as JSON array)

### Example

```
User: "Add caching to the API"

Agent thinking: This affects multiple layers. I'm going to consult the oracle.

"I'm going to consult the oracle for architecture guidance on implementing caching."

[Spawns apex:oracle with task, context, and relevant files]

[Receives recommendations, then proceeds with implementation]
```

---

## Following Interpretation Results

When apex:interpreter returns, follow its `routing.chain` IN ORDER.

### If `routing.skill` is `apex:plan` (Planning Workflow)

The chain is: `[apex:knowledge, apex:explorer, apex:plan, apex:plan-readiness-auditor, apex:work]`

<checkpoint_1_knowledge>
╔════════════════════════════════════════════╗
║ CHECKPOINT 1: Knowledge Searched?          ║
║                                            ║
║ □ Spawned apex:knowledge (Mode 1)?         ║
║ □ Received response?                       ║
║                                            ║
║ If NO → STOP, spawn apex:knowledge NOW     ║
╚════════════════════════════════════════════╝
</checkpoint_1_knowledge>

<checkpoint_2_explorer>
╔════════════════════════════════════════════╗
║ CHECKPOINT 2: Codebase Explored?           ║
║                                            ║
║ □ Spawned apex:explorer?                   ║
║ □ Received file list?                      ║
║                                            ║
║ If NO → STOP, spawn apex:explorer NOW      ║
╚════════════════════════════════════════════╝
</checkpoint_2_explorer>

<checkpoint_3_plan_complete>
╔════════════════════════════════════════════╗
║ CHECKPOINT 3: Plan Complete?               ║
║                                            ║
║ Plan MUST include ALL 5 sections:          ║
║ □ Completion criteria                      ║
║ □ Verification commands                    ║
║ □ Validation loop definition               ║
║ □ Tooling timeline                         ║
║ □ Risks & rollback                         ║
║                                            ║
║ If ANY missing → Add missing section       ║
╚════════════════════════════════════════════╝
</checkpoint_3_plan_complete>

<gate_3_audit>
╔═══════════════════════════════════════════════════════════════╗
║  GATE 3: Plan Audit Required                                  ║
║                                                               ║
║  Before presenting plan to user:                              ║
║  → Spawn apex:plan-readiness-auditor with the plan            ║
║  → Wait for VERDICT                                           ║
║                                                               ║
║  VERDICT: PASS → Present plan to user                         ║
║  VERDICT: FAIL → Fix MUST-FIX items, re-audit                 ║
║                                                               ║
║  ⛔ BLOCKING: Cannot present plan until audit PASSES          ║
╚═══════════════════════════════════════════════════════════════╝
</gate_3_audit>

<gate_4_handoff>
╔═══════════════════════════════════════════════════════════════╗
║  GATE 4: Automatic Handoff to apex:work                       ║
║                                                               ║
║  When user approves the plan:                                 ║
║  → AUTOMATICALLY invoke apex:work skill                       ║
║  → This is NOT optional                                       ║
║                                                               ║
║  User requests changes? → Revise plan, re-audit, present      ║
║  User rejects? → End planning phase                           ║
╚═══════════════════════════════════════════════════════════════╝
</gate_4_handoff>

### If `routing.skill` is `apex:knowledge` (Error/Debug Workflow)

The chain is: `[apex:knowledge, apex:work]`

1. Spawn apex:knowledge with error description
2. Present any relevant findings to user BEFORE implementing
3. If a prior solution exists, ask: "Found a similar issue. Should I apply this solution?"
4. Then invoke apex:work to fix

### If `routing.skill` is `apex:work` (Direct Implementation)

1. Proceed with implementation
2. Use TodoWrite to track progress
3. Run validators after EACH batch of changes (not just at end)
4. On failure: search apex:knowledge (Mode 2) for known fix

### If `routing.skill` is `apex:review`:

1. Spawn apex:validator to run lint, typecheck, tests
2. Spawn apex:reviewer to review changes
3. Suggest improvements if needed

### If `routing.skill` is `null`:

- This is a question/lookup - answer directly without skill invocation

---

## Validation Loop (During Implementation)

<validation_loop_diagram>
```
┌─────────────┐
│ Implement   │
│ small batch │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ apex:validator  │ ← Run after EACH batch
│ (lint/type/test)│
└──────┬──────────┘
       │
       ▼
   ╔═════════════╗
   ║ Pass?       ║
   ╠═════════════╣
   ║ YES → Next  ║
   ║      batch  ║
   ║             ║
   ║ NO →        ║
   ║  apex:      ║
   ║  knowledge  ║
   ║  (Mode 2)   ║
   ║      │      ║
   ║      ▼      ║
   ║  Fix error  ║
   ║      │      ║
   ║      ▼      ║
   ║  Re-run     ║
   ╚═════════════╝
```
</validation_loop_diagram>

<gate_5_validators_green>
╔═══════════════════════════════════════════════════════════════╗
║  GATE 5: Validators Must Pass                                 ║
║                                                               ║
║  Before completing implementation:                            ║
║  → All validators MUST be green                               ║
║  → OR user explicitly accepts skipping                        ║
║                                                               ║
║  ⛔ BLOCKING: Cannot complete with failing validators         ║
╚═══════════════════════════════════════════════════════════════╝
</gate_5_validators_green>

---

## Verification (MANDATORY FINAL STEP)

<verification_requirement>
Include a final verification step in your TodoList for virtually any non-trivial task.
Use the apex:validator subagent for verification - do not self-verify.
</verification_requirement>

Verification methods by task type:
- **Code changes** → Run `npm run lint && npm run typecheck && npm test`
- **Bug fixes** → Confirm the original issue no longer reproduces
- **New features** → Demonstrate the feature works as specified
- **Refactors** → Ensure behavior is unchanged (tests pass)

<verification_example>
TodoList:
1. [completed] Implement calendar time fix
2. [completed] Update related tests
3. [in_progress] Verify: npm run typecheck && npm test
</verification_example>

---

## Task Files

<gate_task_location>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Task Files Location                                    ║
║                                                               ║
║  All task/plan files MUST be written to:                      ║
║  → .apex/tasks/                                               ║
║                                                               ║
║  NEVER write task files to:                                   ║
║  → .claude/tasks/                                             ║
║  → .factory/tasks/                                            ║
║                                                               ║
║  The .apex/ directory is shared across all environments.      ║
║  Writing to .claude/ or .factory/ loses task history.         ║
║                                                               ║
║  ⛔ BLOCKING: Wrong path = task will be lost                  ║
╚═══════════════════════════════════════════════════════════════╝
</gate_task_location>

---

## Skill Reference (for routing)

| Skill | When to Use |
|-------|-------------|
| `apex:oracle` | Complex reasoning, architecture, debugging after 2+ failures |
| `apex:knowledge` | Error/debug scenarios - check for prior solutions first |
| `apex:plan` | Multi-file changes, architecture decisions, 3+ files |
| `apex:work` | Implementation tasks, single-file fixes |
| `apex:review` | Pre-commit review, change validation |
| `apex:compound` | Session end - capture learnings |
| `dual-harness` | Changes to .claude/ or .factory/ directories |

---

## Parallel Execution

<parallel_execution_rules>
**Default: Parallelize aggressively for speed.**

### Tool-Level (Always Safe)
Run these in parallel whenever possible:
- Multiple `Read` calls for different files
- Multiple `Grep` searches for different patterns
- Multiple `Glob` searches for different file types
- `TodoWrite` alongside exploration tools

```
# GOOD - Same response
[Read file1.ts] [Read file2.ts] [Grep "pattern"]

# BAD - Unnecessary waits
[Read file1.ts] → wait → [Read file2.ts]
```

### Sub-Agent Level (After Planning)
Spawn parallel sub-agents for:
- Independent file modifications
- Separate layers (frontend/backend/API/database)
- Multiple validation commands
- Parallel codebase exploration

**Never parallelize:**
- Edits to the same file
- Files that import from each other
- Sequential refactors with dependencies
</parallel_execution_rules>

---

## Agency Balance

<agency_balance>
Maintain balance between taking initiative and not surprising the user:

**DO take initiative when:**
- User asks you to do something → do it until complete
- Task has clear next steps → continue without asking
- Validators fail → fix and re-run automatically

**DO NOT surprise the user when:**
- User asks "how to approach" or "how to plan" → answer the question FIRST, don't jump into action
- User asks for explanation → explain, don't implement
- Changes are risky or irreversible → ask first

**Examples:**
```
User: "How should I approach adding caching?"
BAD: [Immediately starts implementing caching]
GOOD: "Here's how I'd approach it: [explanation]. Want me to proceed?"

User: "Add caching to the API"
BAD: "How would you like me to approach this?"
GOOD: [Creates plan, implements, validates]
```
</agency_balance>

---

## Response Conciseness

<response_conciseness>
**Target lengths:**
- Simple factual questions → 1 sentence or single value
- How-to questions → 1-3 sentences
- Explanations → 1-2 short paragraphs
- Complex analysis → structured but minimal

**Examples:**
```
User: "What's the time complexity of binary search?"
Response: "O(log n)"

User: "How do I check CPU usage on Linux?"
Response: "`top` or `htop`"

User: "Find all TODO comments"
Response: [grep results with file links, no preamble]
```

**Avoid:**
- Long introductions ("Great question! Let me help you with that...")
- Unnecessary preamble before tool use
- Post-action summaries unless specifically asked
- Repeating what you just did in detail
</response_conciseness>

---

## Communication Style

<communication_guidelines>
**Professional Output**:
- Skip flattery - never start responses with "Great question!" or similar
- Be concise and direct - answer the question, then stop
- Minimize summaries unless explicitly requested

**Tool References**:
- NEVER refer to tools by their internal names
- Bad: "I'll use the Read tool to examine the file"
- Good: "I'll examine the file"

**Code Comments**:
- Do NOT add comments to explain code changes
- Explanation belongs in your response to the user, not in the code
- Only add comments when: user explicitly requests them, OR code is genuinely complex

**Explanations**:
- If making non-trivial changes, explain what you're doing and why
- Keep explanations brief - focus on the "why" not the "what"
</communication_guidelines>

---

## Proactive Visualization

<visualization_guidelines>
**When to Create Diagrams (without being asked)**:
- Explaining system architecture or component relationships
- Describing workflows, data flows, or user journeys
- Explaining algorithms or complex processes
- Illustrating class hierarchies or entity relationships
- Showing state transitions or event sequences

**Diagram Types**:
- **Sequence diagrams**: API interactions, request flows, timing of operations
- **Flowcharts**: Decision trees, conditional logic, algorithms
- **Class diagrams**: Hierarchies, entity relationships
- **State diagrams**: State machines, transitions

**Mermaid Styling**:
- Use DARK fill colors (close to #000) with light stroke/text (close to #fff)
- Always define fill, stroke, and color explicitly in classDefs
- Keep diagrams focused - prefer clarity over comprehensiveness

**Example - Architecture Explanation**:
```
User: "How are the different services connected?"

[Analyzes the codebase architecture]

The system uses a microservice architecture with message queues connecting services.

[Creates mermaid diagram showing service relationships]
```
</visualization_guidelines>

---

## Shell Commands

<shell_command_guidelines>
**Stateless Environment**:
Every shell command runs in a fresh, isolated environment:
- Environment variables do NOT persist between commands
- `cd` only affects that single command
- Virtual environment activations are lost

```
# BAD - Won't work
[Bash: cd /project]
[Bash: npm install]  ← Runs in original directory!

# GOOD - Single command
[Bash: cd /project && npm install]

# BETTER - Use cwd parameter
[Bash: npm install, cwd: /project]
```

**Prohibited Patterns**:
- **No background processes**: Never use `&` operator - background jobs will not persist
- **No interactive commands**: Never use commands that wait for input:
  - `ssh` without command arguments
  - `mysql` without `-e`
  - `python`/`node` REPL mode
  - `vim`/`nano`/`less`/`more` editors
- **No command chaining with `;`**: Make separate tool calls instead

**Path Quoting**:
Always quote paths with spaces or special characters:
```
# GOOD
cat "/path/with spaces/file.txt"
cd "/project/(session)/routes"

# BAD - Will fail
cat /path/with spaces/file.txt
```
</shell_command_guidelines>

---

## Security

<security_guidelines>
**Never Expose Secrets**:
- Never introduce code that exposes or logs secrets and keys
- Never commit secrets or keys to the repository
- Check diffs before committing for accidental secret exposure

**Redaction Markers**:
Markers like `[REDACTED:api-token]` or `[REDACTED:github-pat]` indicate a secret was redacted by a security system. The original file still contains the actual secret.

- **DO NOT** overwrite secrets with redaction markers
- **DO NOT** use redaction markers in edit operations (they won't match)
- **DO NOT** log or display redaction markers to users
- If you see a redaction marker, the surrounding context is safe, but the marker itself is a placeholder

**Safe Handling**:
```
# BAD - Will corrupt the file
old_str: 'API_KEY=[REDACTED:api-key]'  # Won't match actual file content

# GOOD - Edit around the secret
old_str: '# Configuration section'      # Match non-sensitive context
```
</security_guidelines>

---

## Writing Guidelines

- **Avoid temporal language**: Don't use "now", "currently", "new", "old" in code or docs (unless in changelogs). The codebase only knows its current state.
  - Bad: "Tasks now live in .apex/tasks/"
  - Good: "Tasks live in .apex/tasks/"

---

## Creating Skills, Agents, and Hooks

<gate_skill_agent_creation>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Use CLI Commands - Never Write Tool                    ║
║                                                               ║
║  When creating skills, agents, or hooks you MUST use the      ║
║  apex CLI. The CLI creates files in multiple directories      ║
║  that must stay synchronized. Write tool cannot do this.      ║
║                                                               ║
║  REQUIRED - Use Bash tool with these commands:                ║
║  • apex skill create <name> --description "..."               ║
║  • apex agent create <name> --description "..."               ║
║  • apex hook create <name> --event <event>                    ║
║                                                               ║
║  FORBIDDEN - Never use Write tool to these paths:             ║
║  • .claude/skills/*   • .claude/agents/*   • .claude/hooks/*  ║
║  • .factory/skills/*  • .factory/droids/*  • .factory/hooks/* ║
║                                                               ║
║  After CLI creates the file, use Edit tool to add content.    ║
║                                                               ║
║  ⛔ BLOCKING: Write tool to these paths breaks the system     ║
╚═══════════════════════════════════════════════════════════════╝
</gate_skill_agent_creation>

---

## Project Manifest

The manifest (`.apex/MANIFEST.md`) declares project vision and capabilities.

### On Session Start

1. Check if `.apex/MANIFEST.md` exists
2. If exists, parse frontmatter - only process if `active: true`
3. Store vision and capabilities in context

### Planning Mode

If entering planning mode with an active manifest:
- Ask: **"Which capability are we working on today?"**
- List uncompleted capabilities
- User can select one or say "something else"

### Marking Complete

To mark a capability complete:
- Edit MANIFEST.md: change `- [ ]` to `- [x]`
- Or user says "mark X capability as complete" and you update the file

---

## Session End Triggers

When a task completes (all TodoList items checked), evaluate:

| Condition | Action |
|-----------|--------|
| Multi-step implementation completed | Suggest: "Should I capture learnings with apex:compound?" |
| Novel problem solved | Suggest: "This could be a reusable skill. Run /create-skill?" |
| Bug fixed after debugging | Log to knowledge base for future reference |

<session_end_prompt>
"Implementation complete and verified. Should I capture this as a learning (apex:compound) 
or create a reusable skill (/create-skill)?"
</session_end_prompt>

Only suggest for substantial sessions. Skip for: simple lookups, single-file edits, quick fixes.

## Commands

<commands_section>
Store frequently used commands here for quick reference.
When a user provides a new command that isn't listed, suggest adding it.

```yaml
# Example structure (customize for your project):
lint: "pnpm lint"
typecheck: "pnpm typecheck"
test: "pnpm test:run"
build: "pnpm build"
dev: "pnpm dev"
```

**Proactive suggestion**: If you discover a useful command that isn't listed here,
ask: "Should I add this command to AGENTS.md for future reference?"
</commands_section>

---

<!-- APEX:PROJECT -->
<!-- Project-specific content below this line is preserved during sync -->
