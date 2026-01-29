#!/bin/bash
# Save session transcript to .apex/sessions/
# Outputs JSON with suppressOutput to hide from transcript mode
mkdir -p .apex/sessions

# Get framework version from .apex/config.yaml
APEX_VERSION="unknown"
if [ -f ".apex/config.yaml" ]; then
  APEX_VERSION=$(grep -E "^  version:" .apex/config.yaml 2>/dev/null | head -1 | awk '{print $2}' | tr -d '"')
  [ -z "$APEX_VERSION" ] && APEX_VERSION="unknown"
fi

DEST_FILE=".apex/sessions/$(date +%Y%m%d-%H%M%S).json"

# Claude Code uses env var - check FIRST before reading stdin
if [ -n "$CLAUDE_CONVERSATION_PATH" ]; then
  # Prepend version metadata, then append transcript
  # Filter out "progress" events - they contain full subagent context (normalizedMessages)
  # which causes massive file bloat (can be 100MB+ per event). The subagent results
  # are already captured in tool_result messages.
  echo "{\"type\":\"apex_metadata\",\"framework_version\":\"$APEX_VERSION\",\"saved_at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > "$DEST_FILE"
  jq -c 'select(.type == "progress" | not)' "$CLAUDE_CONVERSATION_PATH" >> "$DEST_FILE" 2>/dev/null
  echo '{"suppressOutput": true}'
  exit 0
fi

# Factory Droid passes transcriptPath (camelCase) in JSON via stdin
# Claude Code docs use transcript_path (snake_case) - support both
# Read stdin only if data is available (prevents hanging on empty stdin)
if [ -t 0 ]; then
  HOOK_INPUT=""
else
  HOOK_INPUT=$(cat 2>/dev/null) || HOOK_INPUT=""
fi
TRANSCRIPT_PATH=$(echo "$HOOK_INPUT" | jq -r '.transcriptPath // .transcript_path // empty' 2>/dev/null)
if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
  # Prepend version metadata, then filter and append transcript
  echo "{\"type\":\"apex_metadata\",\"framework_version\":\"$APEX_VERSION\",\"saved_at\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}" > "$DEST_FILE"
  jq -c 'select(.type == "progress" | not)' "$TRANSCRIPT_PATH" >> "$DEST_FILE" 2>/dev/null
fi

# Output JSON to suppress hook output in transcript mode
echo '{"suppressOutput": true}'
