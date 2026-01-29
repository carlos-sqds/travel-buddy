---
name: apex:create-hook
description: >
  Create hooks via apex CLI (enforces harness parity).
  TRIGGER ON: create_hook (create hook, add hook, new hook).
required_tool_calls:
  - tool: apex hooks create
    reason: "Create hooks via CLI to ensure harness parity"
  - tool: apex hooks list
    reason: "Verify harness parity after creation"
---

# Create Hook

Create hooks using the apex CLI to enforce harness parity.

## When to Invoke

- User says "create hook", "add hook", "new hook"
- User wants to add PreToolUse, PostToolUse, Stop, or other hook events
- Explicit invocation via `/apex:create-hook`

## When NOT to Use

- For creating skills → use apex:create-skill instead
- For creating agents/droids → use apex:create-agent instead
- For editing existing hooks → edit the hook file directly
- For disabling hooks → use `apex hooks disable <id>`

---

<gate_cli_create>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Use CLI for Hook Creation                              ║
║                                                               ║
║  To create a hook:                                            ║
║  → MUST use: apex hooks create <name> --event <event> ...     ║
║  → Do NOT edit .claude/settings.json directly                 ║
║  → Do NOT edit .factory/settings.json directly                ║
║  → CLI ensures dual-harness parity automatically              ║
║                                                               ║
║  ⛔ BLOCKING: Direct settings.json edits break parity         ║
╚═══════════════════════════════════════════════════════════════╝
</gate_cli_create>

This ensures:
- Hook is created in BOTH harnesses automatically
- Harness parity is enforced
- Proper hook structure

## Hook Architecture

### Hook Events

| Event | When It Runs | Matcher Required | Prompt Type Supported |
|-------|--------------|------------------|----------------------|
| **PreToolUse** | Before tool calls (can block) | Yes | Yes |
| **PostToolUse** | After tool calls complete | Yes | Yes |
| **PermissionRequest** | When permission dialogs shown | Yes | Yes |
| **UserPromptSubmit** | When user submits prompt | No | Yes |
| **Stop** | When main agent finishes | No | Yes |
| **SubagentStop** | When subagent tasks complete | No | Yes |
| **Notification** | When notifications sent | Yes | No |
| **PreCompact** | Before context compacting | Yes | No |
| **SessionStart** | When session starts/resumes | Yes | No |
| **SessionEnd** | When session ends | No | No |

### Hook Types

- **`command`** - Execute bash commands (exit code 0 = success, 2 = block)
- **`prompt`** - LLM evaluation via Haiku (returns JSON `{"ok": true|false, "reason": "..."}`)

## Critical: Avoiding Verbose Output

**Problem**: `suppressOutput: true` only suppresses stdout from successful hooks. Prompt hooks returning `{"ok": false}` are treated as "decision feedback" and ALWAYS displayed.

**Solution**: Design prompt hooks to **always return `{"ok": true}`** when you want silent operation:

```json
{
  "type": "prompt",
  "prompt": "Evaluate X. IMPORTANT: Always return {\"ok\": true} to avoid verbose output.\n\nIf condition met: Return {\"ok\": true, \"reason\": \"Action to take...\"}\nIf condition NOT met: Return {\"ok\": true} with no reason (silent pass).",
  "suppressOutput": true
}
```

**Anti-pattern** (causes verbose output):
```json
{
  "prompt": "Check if X. If not X, return {\"ok\": false, \"reason\": \"why\"}..."
}
```

## Hook File Schema

Hook definitions live in `framework/hooks/` (required) or `framework/hooks/optional/` (optional).

```json
{
  "id": "my-hook",
  "description": "What this hook does",
  "category": "debug",
  "optional": true,
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolName",
        "hooks": [
          {
            "type": "prompt",
            "prompt": "Your instructions...",
            "suppressOutput": true,
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

### Hook Categories

| Category | Purpose |
|----------|---------|
| **debug** | Debugging, logging, session capture |
| **quality** | Code quality, linting, verification |
| **workflow** | Automation, skill evaluation, process enforcement |
| **general** | Default category for uncategorized hooks |

### Required vs Optional Hooks

- **Required hooks** (`framework/hooks/*.json`): Always synced to projects
- **Optional hooks** (`framework/hooks/optional/*.json`): Enabled by default, can be disabled

Users configure optional hooks via:
- `apex init` - Interactive selection during project setup
- `apex hooks disable <id>` - Disable specific hook
- `apex hooks enable <id>` - Re-enable disabled hook
- `.apex/config.yaml` - Manual configuration under `hooks.disabled: []`

### Response Schema for Prompt Hooks

```json
{
  "ok": true,                    // true = allow, false = block (and show reason!)
  "reason": "Optional message",  // Shown when ok: false OR when you want feedback
  "continue": true,              // Whether agent continues (default: true)
  "stopReason": "string",        // Message when continue: false
  "systemMessage": "string"      // Warning shown to user
}
```

### PreToolUse-Specific Response

```json
{
  "hookSpecificOutput": {
    "permissionDecision": "allow" | "deny" | "ask",
    "permissionDecisionReason": "string",
    "updatedInput": { /* modified tool input */ }
  }
}
```

## Examples

### Silent Evaluation Hook (Stop)

```json
{
  "Stop": [
    {
      "matcher": "",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Evaluate work for X. IMPORTANT: Always return {\"ok\": true}.\n\nIf worthy: Return {\"ok\": true, \"reason\": \"Consider doing Y\"}\nIf not worthy: Return {\"ok\": true} with no reason.",
          "suppressOutput": true
        }
      ]
    }
  ]
}
```

### Conditional PreToolUse Hook

```json
{
  "PreToolUse": [
    {
      "matcher": "Bash",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "If this is a git commit, verify X. IMPORTANT: Always return {\"ok\": true}.\n\nIf verification needed and fails: Return {\"ok\": true, \"reason\": \"Fix X before committing\"}\nIf not a git commit or verification passes: Return {\"ok\": true} with no reason.",
          "suppressOutput": true
        }
      ]
    }
  ]
}
```

### Command Hook (Alternative to Prompt)

For deterministic checks, use command hooks which are fully silent with `suppressOutput`:

```json
{
  "PreToolUse": [
    {
      "matcher": "Write",
      "hooks": [
        {
          "type": "command",
          "command": "echo 'validated'",
          "suppressOutput": true
        }
      ]
    }
  ]
}
```

## Dual-Harness Parity

When creating hooks, always update BOTH:
- `.claude/settings.json` (Claude Code)
- `.factory/settings.json` (Factory Droid)

The hook configuration schema is identical between both harnesses.

## Workflow

1. **Identify the event** - What lifecycle point needs the hook?
2. **Choose hook type** - `prompt` for context-aware, `command` for deterministic
3. **Design for silence** - Always return `{"ok": true}` unless blocking is required
4. **Create via CLI** - Use `apex hooks create` to maintain parity
5. **Verify parity** - Run `apex hooks list` to confirm both harnesses updated

<gate_verify_parity>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Verify Harness Parity After Creation                   ║
║                                                               ║
║  After creating hook:                                         ║
║  → MUST run: apex hooks list                                  ║
║  → Verify hook appears in both [claude] and [factory]         ║
║  → If missing from one, creation failed - investigate         ║
║                                                               ║
║  ⛔ BLOCKING: Unverified creation may break one harness       ║
╚═══════════════════════════════════════════════════════════════╝
</gate_verify_parity>

6. **Test the hook** - Verify no verbose output in normal operation

---

## Output Format

<gate_context_header>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Context Header Required                                ║
║                                                               ║
║  Before presenting creation result, emit context header:      ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────   ║
║  │ TASK: Create hook: {hook-name}                             ║
║  │ GOAL: {what event/behavior the hook manages}               ║
║  │ PHASE: apex:create-hook → next: {configure|verify}         ║
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
║  "Skill improvement: apex:create-hook - [specific suggestion]"║
║                                                               ║
║  This creates a feedback loop for continuous skill refinement.║
╚═══════════════════════════════════════════════════════════════╝
</gate_skill_reflection>
