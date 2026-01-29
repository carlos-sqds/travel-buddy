---
name: apex:learn
description: >
  Analyze repository to learn patterns, conventions, and intent. Proposes taxonomy, skills, and AGENTS.md context.
  TRIGGER ON: learn (learn, onboard, analyze repo, understand codebase, new to this repo, new to this project).
required_tool_calls:
  - tool: apex:taxonomy-verifier
    reason: "Validate proposed taxonomy and skills before presenting"
  - tool: apex:repo-analyzer
    reason: "Deep analysis of repository patterns"
---

# Apex Learn

Perform deep repository analysis to understand code patterns AND project intent, then propose configuration.

## When to Invoke

- User says "learn", "onboard", "analyze this repo"
- User says "understand this codebase", "new to this repo"
- Running `apex learn` from CLI
- After `apex init` on a fresh repo

## When NOT to Use

- For implementing features → use apex:work instead
- For planning specific tasks → use apex:plan instead
- When repo already analyzed → findings are in .apex/
- For quick questions about code → just read the relevant files

---

## Two-Phase Workflow

<gate_read_taxonomy_first>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Read Existing Taxonomy First                           ║
║                                                               ║
║  Before spawning repo-analyzer:                               ║
║  → Read framework/taxonomy.yaml (if exists)                   ║
║  → Parse existing signals and routing                         ║
║  → Pass to repo-analyzer as context                           ║
║                                                               ║
║  This prevents suggesting signals that already exist.         ║
║                                                               ║
║  ⛔ BLOCKING: Cannot analyze without taxonomy context         ║
╚═══════════════════════════════════════════════════════════════╝
</gate_read_taxonomy_first>

### Phase 1: Discovery + Clarification

1. **Read existing taxonomy** (if present):
   - Parse `framework/taxonomy.yaml` for existing signals
   - Note existing routing rules to avoid conflicts

2. **Spawn `apex:repo-analyzer`** (Opus model) to analyze:
   - Tech stack and dependencies
   - Testing patterns and coverage
   - Error handling and logging
   - Code organization and conventions
   - Domain model and business entities
   - CI/CD and deployment patterns
   - Documentation and onboarding gaps

3. **Present findings** with clarifying questions:

```
ANALYSIS COMPLETE

Stack: [discovered stack]
Testing: [discovered patterns]
Patterns: [discovered conventions]

CLARIFYING QUESTIONS:

1. Domain: [questions about business entities found]
2. Workflows: [questions about processes]
3. Team conventions: [questions about unwritten rules]
4. Pain points: [questions about repetitive/error-prone tasks]
```

4. **Wait for user answers** before proceeding to Phase 2.

### Phase 2: Proposals

<gate_verify_taxonomy>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Verify Taxonomy Before Presenting                      ║
║                                                               ║
║  After repo-analyzer returns:                                 ║
║  → Spawn apex:taxonomy-verifier with suggestions              ║
║  → Wait for PASS verdict                                      ║
║                                                               ║
║  FAIL → Fix suggestions, re-verify                            ║
║                                                               ║
║  ⛔ BLOCKING: Cannot present unverified taxonomy              ║
╚═══════════════════════════════════════════════════════════════╝
</gate_verify_taxonomy>

<gate_observability_first>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Observability-First Skill Suggestions                  ║
║                                                               ║
║  Suggested skills MUST be prioritized by coverage:            ║
║  1. Testing (unit, integration, e2e)                          ║
║  2. Monitoring (error tracking, logging)                      ║
║  3. Validation (lint, typecheck, build)                       ║
║  4. Error detection (crash handling)                          ║
║                                                               ║
║  At least ONE suggested skill must cover testing/monitoring.  ║
║                                                               ║
║  ⛔ BLOCKING: Cannot suggest skills without observability     ║
╚═══════════════════════════════════════════════════════════════╝
</gate_observability_first>

After user clarifies intent, propose:

1. **AGENTS.md Context** - Short summary for `<!-- APEX:PROJECT -->` section:
   - Stack overview
   - Key commands (lint, typecheck, test)
   - Domain terms with definitions
   - Important patterns to follow

2. **Taxonomy Additions** - Project-specific routing signals:
   ```yaml
   project:
     taxonomy:
       deployment: [deploy, ship, release]
       [domain_entity]: [related, terms]
   ```

3. **Suggested Skills** - Each with rationale:
   ```
   1. skill-name
      Reason: [why this skill would help, based on analysis + user answers]
   ```

4. **Present for approval**:
   ```
   Apply all? (y) | Select individually? (s) | Revise? (r)
   ```

## Critical Rules

<gate_cli_required>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Use CLI Commands - Never Write Tool                    ║
║                                                               ║
║  When creating skills or agents you MUST use the apex CLI.    ║
║  The CLI creates files in multiple directories that must      ║
║  stay synchronized. Write tool cannot do this.                ║
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

## Execution

On approval, use **Bash tool** for all creation commands:

1. **Inject context** into AGENTS.md `<!-- APEX:PROJECT -->` section (Edit tool OK)
2. **Update** `.apex/config.yaml` with taxonomy additions (Edit tool OK)
3. **Create skills** - MUST use Bash:
   ```bash
   apex skill create <name> --description "Description. TRIGGER ON: signals."
   ```
4. **Create agents** - MUST use Bash:
   ```bash
   apex agent create <name> --description "Description" --model <model>
   ```

<gate_verify_parity>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Verify Harness Parity After Creation                   ║
║                                                               ║
║  After creating skills/agents:                                ║
║  → MUST run: apex skill list AND apex agent list              ║
║  → Verify all created items show [claude: ✓] [factory: ✓]     ║
║  → If any missing checkmark, creation failed - investigate    ║
║                                                               ║
║  ⛔ BLOCKING: Unverified creation may break one harness       ║
╚═══════════════════════════════════════════════════════════════╝
</gate_verify_parity>

## Output Format

<gate_context_header>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Context Header Required                                ║
║                                                               ║
║  Before presenting analysis or proposals, emit context header:║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────   ║
║  │ TASK: Learn repository: {repo name}                        ║
║  │ GOAL: {understand patterns | propose config | create X}    ║
║  │ PHASE: apex:learn ({phase 1|2}) → next: {clarify|propose}  ║
║  └─────────────────────────────────────────────────────────   ║
║                                                               ║
║  Phase context:                                               ║
║  - Phase 1: "Analyzing: {repo} - awaiting clarification"      ║
║  - Phase 2: "Proposing config for: {repo}"                    ║
║                                                               ║
║  This helps engineers returning to parallel sessions          ║
║  understand what this agent is working on and why.            ║
╚═══════════════════════════════════════════════════════════════╝
</gate_context_header>

Phase 1 output from analyzer (JSON):
```json
{
  "stack": {
    "languages": ["TypeScript"],
    "frameworks": ["React", "Express"],
    "databases": ["PostgreSQL"],
    "package_manager": "pnpm"
  },
  "testing": {
    "framework": "vitest",
    "patterns": ["unit", "integration"],
    "coverage_config": true
  },
  "patterns": {
    "structure": "feature-based",
    "error_handling": "custom Error classes",
    "logging": "pino"
  },
  "domain_entities": [
    {"name": "Brief", "files": ["src/models/brief.ts"], "unclear": true},
    {"name": "Workspace", "files": ["src/models/workspace.ts"], "unclear": true}
  ],
  "workflows": [
    {"name": "deploy", "trigger": "manual", "unclear": true}
  ],
  "validation_commands": {
    "lint": "pnpm lint",
    "typecheck": "pnpm typecheck",
    "test": "pnpm test"
  },
  "clarifying_questions": [
    {
      "category": "domain",
      "question": "What does a Brief represent in your product?",
      "context": "Found Brief entity but purpose unclear from code"
    }
  ]
}
```

## CLI Integration

```bash
apex learn              # Interactive two-phase flow
apex learn --dry-run    # Phase 1 only, show analysis + questions
apex learn --apply      # Skip questions, auto-propose based on analysis
apex learn --refresh    # Re-analyze, update existing config
```

## Common Pitfalls

- **Proposing without clarification** - Always ask questions first
- **Generic skills** - Skills should be specific to discovered patterns
- **Ignoring user context** - Answers override analysis assumptions

---

## Skill Writing Guide

When proposing skills, include this guide in output so the user (or agent) knows how to write proper skills:

### Every Skill MUST Have:

#### 1. Gate Blocks (Non-negotiable)

Use ASCII box format with BLOCKING marker:

```markdown
<gate_example_name>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Description of what this gate enforces                 ║
║                                                               ║
║  Before proceeding:                                           ║
║  → Check condition 1                                          ║
║  → Check condition 2                                          ║
║                                                               ║
║  ⛔ BLOCKING: What happens if conditions not met              ║
╚═══════════════════════════════════════════════════════════════╝
</gate_example_name>
```

#### 2. Verification Commands

Every skill needs explicit verification:

```yaml
verification:
  command: "pnpm test"
  success: "All tests pass"
  failure: "Re-run after fix"
```

#### 3. Required Tool Calls (frontmatter)

Specify which tools/agents MUST be called:

```yaml
required_tool_calls:
  - tool: apex:validator
    reason: "Verify changes don't break"
```

#### 4. TRIGGER ON Clause

Reference signals from `framework/taxonomy.yaml`:

```
TRIGGER ON: signal_name (keyword1, keyword2, keyword3)
```

### Observability Priority

When suggesting skills, prioritize those that cover:

1. **Testing** - Unit, integration, e2e, coverage enforcement
2. **Monitoring** - Error tracking, logging, alerting
3. **Validation** - Lint, typecheck, build checks
4. **Error Detection** - Crash handling, exception tracking

At least ONE suggested skill should cover testing or monitoring.

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
║  "Skill improvement: apex:learn - [specific suggestion]"      ║
║                                                               ║
║  This creates a feedback loop for continuous skill refinement.║
╚═══════════════════════════════════════════════════════════════╝
</gate_skill_reflection>
