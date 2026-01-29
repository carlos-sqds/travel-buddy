#!/bin/bash
#
# dual-harness-check.sh - Verify parity between Claude Code and Factory Droid configs
#
# This hook runs on PreToolUse for Bash commands. It checks:
# 1. Is this a git commit command?
# 2. Are harness files (.claude/, .factory/, AGENTS.md, CLAUDE.md) staged?
# 3. If so, verify parity between the two harness configurations
#
# Exit codes:
#   0 - Allow (not a commit, no harness files, or parity OK)
#   2 - Block with feedback (parity issues detected)
#

# Read tool input from stdin
TOOL_INPUT=$(cat)

# Extract the command being run
COMMAND=$(echo "$TOOL_INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)

# Only act on git commit commands
if [[ ! "$COMMAND" =~ ^git[[:space:]]+commit ]]; then
  exit 0
fi

# Check for staged harness files
STAGED=$(git diff --cached --name-only 2>/dev/null || echo "")
if [ -z "$STAGED" ]; then
  exit 0
fi

# Check if any harness-related files are staged
HAS_HARNESS_FILES=false
while IFS= read -r file; do
  case "$file" in
    .claude/*|.factory/*|AGENTS.md|CLAUDE.md)
      HAS_HARNESS_FILES=true
      break
      ;;
  esac
done <<< "$STAGED"

if [ "$HAS_HARNESS_FILES" != "true" ]; then
  exit 0
fi

# Perform parity checks
ERRORS=""

# Check skill parity (if both directories exist)
if [ -d ".claude/skills" ] && [ -d ".factory/skills" ]; then
  SKILL_DIFF=$(diff -rq .claude/skills .factory/skills 2>/dev/null)
  if [ -n "$SKILL_DIFF" ]; then
    ERRORS="${ERRORS}- Skills differ between .claude/ and .factory/\n"
  fi
fi

# Check agent/droid parity (if both directories exist)
if [ -d ".claude/agents" ] && [ -d ".factory/droids" ]; then
  # Compare agent definitions (content may differ in naming)
  CLAUDE_AGENTS=$(ls -1 .claude/agents/*.md 2>/dev/null | wc -l | tr -d ' ')
  FACTORY_DROIDS=$(ls -1 .factory/droids/*.md 2>/dev/null | wc -l | tr -d ' ')
  if [ "$CLAUDE_AGENTS" != "$FACTORY_DROIDS" ]; then
    ERRORS="${ERRORS}- Agent count mismatch: .claude/agents/ has $CLAUDE_AGENTS, .factory/droids/ has $FACTORY_DROIDS\n"
  fi
fi

# Check that both settings files exist if either does
if [ -f ".claude/settings.json" ] && [ ! -f ".factory/settings.json" ]; then
  ERRORS="${ERRORS}- .claude/settings.json exists but .factory/settings.json is missing\n"
fi
if [ -f ".factory/settings.json" ] && [ ! -f ".claude/settings.json" ]; then
  ERRORS="${ERRORS}- .factory/settings.json exists but .claude/settings.json is missing\n"
fi

# Report errors if any
if [ -n "$ERRORS" ]; then
  echo "Dual-harness parity issues detected:"
  echo -e "$ERRORS"
  echo "Run /dual-harness to verify and fix parity issues before committing."
  exit 2
fi

exit 0
