#!/usr/bin/env bash
#
# Apex Interpreter Routing Hook
#
# Runs on UserPromptSubmit (Factory Droid only) to classify user input
# and inject routing context before the model processes the prompt.
#
# This ensures deterministic skill routing - the model sees the classification
# result and follows the prescribed workflow instead of improvising.
#

set -euo pipefail

# Read hook input from stdin
INPUT=$(cat)

# Extract the user prompt
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty')
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

# Skip interpretation for trivial inputs
if [[ -z "$PROMPT" ]] || [[ ${#PROMPT} -lt 3 ]]; then
  exit 0
fi

# Skip for greetings and simple responses
LOWER_PROMPT=$(echo "$PROMPT" | tr '[:upper:]' '[:lower:]')
if [[ "$LOWER_PROMPT" =~ ^(hi|hello|hey|thanks|thank you|bye|ok|yes|no|y|n)$ ]]; then
  exit 0
fi

# Check if this is a continuation (user said "yes", "continue", "go ahead", etc.)
if [[ "$LOWER_PROMPT" =~ ^(yes|continue|go ahead|proceed|do it|approved|lgtm|looks good)$ ]]; then
  exit 0
fi

# Load taxonomy for signal matching
TAXONOMY_FILE="$CWD/framework/taxonomy.yaml"
if [[ ! -f "$TAXONOMY_FILE" ]]; then
  TAXONOMY_FILE="$CWD/.apex/taxonomy.yaml"
fi

# Classify the prompt using pattern matching against taxonomy signals
# This is a lightweight classification - for complex cases, the model can refine
classify_prompt() {
  local prompt="$1"
  local lower=$(echo "$prompt" | tr '[:upper:]' '[:lower:]')
  
  # Error/debug signals - highest priority
  if [[ "$lower" =~ (error|exception|failed|broken|crash|bug|not\ working|weird|strange|unexpected) ]]; then
    echo "apex:knowledge"
    return
  fi
  
  # Planning signals
  if [[ "$lower" =~ (plan|approach|design|architecture|spec|how\ should) ]]; then
    echo "apex:plan"
    return
  fi
  
  # Review signals
  if [[ "$lower" =~ (review|check|before\ commit|ready\ to\ merge|before\ push) ]]; then
    echo "apex:review"
    return
  fi
  
  # Learn signals
  if [[ "$lower" =~ (learn|onboard|analyze\ repo|understand|new\ to\ this) ]]; then
    echo "apex:learn"
    return
  fi
  
  # Compound/capture signals
  if [[ "$lower" =~ (capture|document|save\ what|learnings) ]]; then
    echo "apex:compound"
    return
  fi
  
  # Implementation signals (default for action-oriented prompts)
  if [[ "$lower" =~ (implement|build|create|add|write|fix|refactor|update|delete|remove|rename) ]]; then
    echo "apex:work"
    return
  fi
  
  # No clear signal - let model decide (no routing injection)
  echo ""
}

SKILL=$(classify_prompt "$PROMPT")

# If no skill matched, don't inject routing (let model decide)
if [[ -z "$SKILL" ]]; then
  exit 0
fi

# Build routing context to inject
# This appears as additional context the model sees before processing
ROUTING_CONTEXT="[APEX ROUTING]
Interpreter classification: $SKILL
User prompt classified as requiring the $SKILL workflow.

Follow the $SKILL skill instructions. Do not skip interpretation - routing has been determined."

# Output JSON with additionalContext
# This injects the routing decision into the conversation
cat << EOF
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "$ROUTING_CONTEXT"
  }
}
EOF

exit 0
