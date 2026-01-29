---
name: apex:linear-pm
description: >
  Manage projects and issues in Linear.
  TRIGGER ON: linear (Linear, Linear issue, Linear project, track in Linear, create in Linear, sync to Linear).
  NOTE: Generic "issue" or "ticket" without "Linear" does NOT trigger this skill.
required_tool_calls:
  - tool: list_teams
    reason: "Fetch available Linear teams before creating resources"
  - tool: list_issue_statuses
    reason: "Get valid statuses for the team"
---

# Linear Project Management Skill

Create, track, and manage work in Linear. Keeps Linear in sync with local plans.

## When to Invoke

- User says "Linear" (REQUIRED for auto-invocation)
- User says "create in Linear", "track in Linear", "sync to Linear"
- User says "update Linear", "Linear status", "Linear project"
- Generic "issue", "ticket", "project" WITHOUT "Linear" does NOT trigger this skill
- Explicit invocation via `/linear-pm`

## When NOT to Use

- For generic "issue" or "ticket" tracking → clarify if user means Linear
- For GitHub Issues → use GitHub-specific tools instead
- For Jira tracking → use Jira-specific tools instead
- When Linear MCP is not connected → inform user to configure first

---

## Session Start Flow

Before creating or modifying Linear resources, always fetch current state:

1. **Get teams**: Call `list_teams` to identify available teams
2. **Get statuses**: Call `list_issue_statuses` for the relevant team
3. **Cache in memory**: Store team/status info for the session (do NOT persist to files)

## Information Storage Hierarchy

### Project Descriptions = Main Planning Info

Store the primary plan in the **project description**:

```markdown
## Overview
{1-2 sentence summary of what this project achieves}

## Goals
- Goal 1
- Goal 2

## Scope
- In scope: {what's included}
- Out of scope: {what's excluded}

## Success Criteria
- {How we know the project is complete}
```

### Issue Descriptions = Full Agent Context

**CRITICAL**: Issue descriptions must contain **complete context for an agent to autonomously complete the task**. A fresh agent with zero prior knowledge should be able to pick up any issue and complete it.

Required sections in **issue descriptions**:

```markdown
## Overview
{What this issue accomplishes and why it matters}

## Plan Reference
{Path to plan file if applicable: `.claude/plans/xxx.md` or `.apex/tasks/xxx.md`}

## Current State
{What exists today - working components, broken parts, gaps}

## Implementation Steps
1. {Specific step with file paths}
2. {Next step with commands to run}
3. {Continue with actionable instructions}

## Key Files
| File | Purpose |
|------|---------|
| `path/to/file.ts` | {What this file does, what needs changing} |

## Definition of Done
- [ ] {Specific, verifiable criterion}
- [ ] {Another criterion}

## Testing Strategy
{How to verify the implementation works:}
- Commands to run
- Expected outputs
- Edge cases to check

## Acceptance Criteria
- [ ] {Measurable condition that must be met}
```

**Why this matters**: Agents have limited context windows. Each issue must be self-contained with enough detail that an agent can:
1. Understand the goal without reading other issues
2. Know exactly which files to modify
3. Verify their work is complete
4. Test their implementation

### Documents = Research & Supplementary Info

Use Linear documents for:
- API research findings
- Architecture decision records (ADRs)
- Meeting notes
- Reference materials

**NOT** for the main plan (that goes in project description).

## Plan Creation Flow

1. **Query Linear state**
   - Call `list_teams` to get team options
   - Call `list_issue_statuses` for status options
   - Call `list_projects` to check for existing project

2. **Create Linear project** (if needed)
   - Use structured project description format (see above)
   - Set appropriate state (`planned` or `started`)

3. **Create local plan file**
   - Write to `.apex/tasks/{task-name}.md`
   - Embed Linear IDs as HTML comments:
     ```markdown
     # Project: Feature Name
     <!-- Linear Project: PROJECT-UUID -->

     ## Phase 1: Core Infrastructure
     <!-- Linear: ENG-123 -->
     ```

4. **Create Linear issues** (grouped by phase)
   - Use structured issue description format
   - Set proper relations (`blocks`, `blocked_by`)
   - Apply appropriate labels

## Issue Creation Guidelines

### Agent-Ready Context Checklist

Before marking an issue as "Ready for Development", verify it contains:

- [ ] **Overview**: Clear explanation of what and why
- [ ] **Current State**: What exists, what's broken, what's missing
- [ ] **Implementation Steps**: Numbered, actionable steps with file paths
- [ ] **Key Files**: Table of files to read/modify with purposes
- [ ] **Definition of Done**: Specific criteria (not vague "it works")
- [ ] **Testing Strategy**: Commands to run, expected outputs
- [ ] **Acceptance Criteria**: Checkboxes for verification

**Ask yourself**: Could a new agent with no context complete this task using only the issue description?

### Title Format

Use prefix to indicate type:
- `[feat] Description` - New feature
- `[fix] Description` - Bug fix
- `[refactor] Description` - Code refactoring
- `[docs] Description` - Documentation
- `[chore] Description` - Maintenance task

### Labels

Apply these labels for agent-friendly categorization:
- `type:feature`, `type:bugfix`, `type:refactor`, `type:docs`, `type:chore`
- `scope:{area}` - e.g., `scope:backend`, `scope:frontend`
- `agent:created` - Mark issues created by agents

### Relations

Set blocking relationships to show dependencies:
- `blocks`: Issues that cannot start until this completes
- `blocked_by`: Issues that must complete before this can start

## Starting Work on an Issue

When beginning implementation of a Linear issue:

1. **Fetch issue details**
   ```
   get_issue(id: "ENG-123")
   ```

2. **Update status to "In Progress"**
   ```
   update_issue(id: "ENG-123", state: "In Progress")
   ```

3. **Add start comment**
   ```
   create_comment(issueId: "ENG-123", body: "🤖 Agent started work on this issue")
   ```

4. **Create git branch with issue ID**
   ```bash
   git checkout -b eng-123-feature-name
   ```

## Completing Work (via Git, NOT Manual Status Update)

**IMPORTANT**: Do NOT manually update issue status to "Done". Let the merge process handle it automatically.

### In Commits

Include the Linear issue ID with a closing magic word:
```
feat: Add user authentication

Fixes ENG-123
```

### In PR Descriptions

Include closing statement:
```markdown
## Summary
Added user authentication with JWT tokens.

Closes ENG-123
```

### Magic Words (Auto-Close on Merge)

**Closing words** - Issue auto-closes when PR merges:
- `close`, `closes`, `closed`, `closing`
- `fix`, `fixes`, `fixed`, `fixing`
- `resolve`, `resolves`, `resolved`, `resolving`
- `complete`, `completes`, `completed`, `completing`

**Non-closing words** - Links PR without auto-closing:
- `ref`, `references`
- `part of`, `related to`
- `contributes to`, `towards`

### After Implementation

Add a progress comment (but don't change status):
```
create_comment(issueId: "ENG-123", body: "🤖 Implementation complete, awaiting merge")
```

## Progress Updates

When completing sub-tasks within an issue:

```
create_comment(
  issueId: "ENG-123",
  body: "🤖 Completed: Set up database schema\n\nDetails: Created migrations for users, sessions, and tokens tables."
)
```

## Syncing Local Plans with Linear

### Checking for Updates

1. Parse local plan file for `<!-- Linear: XXX-123 -->` comments
2. Fetch current state from Linear via `get_issue` / `get_project`
3. Compare content and status

### Conflict Resolution

If local differs from Linear:
1. Show diff to user
2. Ask which version to keep (AskUserQuestion)
3. Apply chosen version to both local and Linear

## Status Categories

### Issue Statuses (team-specific, query with `list_issue_statuses`)

- **Backlog** - Unstarted, not prioritized
- **Todo** - Ready to work on
- **In Progress** - Currently being worked on
- **In Review** - Awaiting code review
- **Done** - Completed (set via merge, not manually)
- **Canceled** - Abandoned

### Project Statuses

- `planned` - Not yet started
- `started` - Active work
- `paused` - On hold
- `completed` - Done
- `canceled` - Abandoned

## Output Format

<gate_context_header>
╔═══════════════════════════════════════════════════════════════╗
║  GATE: Context Header Required                                ║
║                                                               ║
║  Before presenting Linear operations, emit context header:    ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────   ║
║  │ TASK: {Linear operation: create/update/sync}               ║
║  │ GOAL: {what Linear resource is being managed}              ║
║  │ PHASE: apex:linear-pm → next: {confirm|created|synced}     ║
║  └─────────────────────────────────────────────────────────   ║
║                                                               ║
║  Include Linear context:                                      ║
║  - Project/Issue ID if known                                  ║
║  - Team name                                                  ║
║  - Current status                                             ║
║                                                               ║
║  This helps engineers returning to parallel sessions          ║
║  understand what this agent is working on and why.            ║
╚═══════════════════════════════════════════════════════════════╝
</gate_context_header>

---

## Example Workflows

### Creating a New Feature Project

```
User: "Create a Linear project for adding user authentication"

1. list_teams() → get team ID
2. list_issue_statuses(team: "Engineering") → get status IDs
3. create_project(
     name: "User Authentication",
     team: "Engineering",
     description: "## Overview\nAdd JWT-based authentication...",
     state: "planned"
   )
4. create_issue(
     title: "[feat] Phase 1: Database schema and models",
     team: "Engineering",
     project: "User Authentication",
     description: "## Context\n...",
     state: "Todo"
   )
5. Write local plan to .apex/tasks/user-auth.md with Linear IDs
```

### Starting Work on an Existing Issue

```
User: "Start working on ENG-123"

1. get_issue(id: "ENG-123") → fetch details
2. update_issue(id: "ENG-123", state: "In Progress")
3. create_comment(issueId: "ENG-123", body: "🤖 Agent started work...")
4. git checkout -b eng-123-feature-name
5. Begin implementation
```

### Completing an Issue

```
Agent finishes implementation:

1. git add . && git commit -m "feat: Add feature\n\nFixes ENG-123"
2. create_comment(issueId: "ENG-123", body: "🤖 Implementation complete...")
3. Create PR with "Closes ENG-123" in description
4. Status auto-updates to Done when PR merges
```

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
║  "Skill improvement: apex:linear-pm - [specific suggestion]"  ║
║                                                               ║
║  This creates a feedback loop for continuous skill refinement.║
╚═══════════════════════════════════════════════════════════════╝
</gate_skill_reflection>
