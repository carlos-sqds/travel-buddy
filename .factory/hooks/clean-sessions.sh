#!/bin/bash
# Clean existing session files by removing progress events
# Usage: ./clean-sessions.sh [sessions_dir]

SESSIONS_DIR="${1:-.apex/sessions}"

if [ ! -d "$SESSIONS_DIR" ]; then
  echo "Directory not found: $SESSIONS_DIR"
  exit 1
fi

echo "Cleaning session files in $SESSIONS_DIR..."
echo ""

total_before=0
total_after=0
cleaned=0
failed=0

for file in "$SESSIONS_DIR"/*.json; do
  [ -f "$file" ] || continue

  filename=$(basename "$file")
  size_before=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
  total_before=$((total_before + size_before))

  # Filter out progress events to temp file
  temp_file="${file}.tmp"
  if jq -c 'select(.type == "progress" | not)' "$file" > "$temp_file" 2>/dev/null; then
    size_after=$(stat -f%z "$temp_file" 2>/dev/null || stat -c%s "$temp_file" 2>/dev/null)
    total_after=$((total_after + size_after))

    # Only replace if we actually reduced size
    if [ "$size_after" -lt "$size_before" ]; then
      mv "$temp_file" "$file"
      reduction=$((size_before - size_after))
      reduction_mb=$(echo "scale=2; $reduction / 1048576" | bc)
      size_before_mb=$(echo "scale=2; $size_before / 1048576" | bc)
      size_after_kb=$(echo "scale=2; $size_after / 1024" | bc)
      echo "✓ $filename: ${size_before_mb}MB → ${size_after_kb}KB"
      cleaned=$((cleaned + 1))
    else
      rm -f "$temp_file"
      echo "· $filename: already clean"
    fi
  else
    rm -f "$temp_file"
    echo "✗ $filename: failed to parse"
    failed=$((failed + 1))
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
total_before_gb=$(echo "scale=2; $total_before / 1073741824" | bc)
total_after_mb=$(echo "scale=2; $total_after / 1048576" | bc)
saved=$((total_before - total_after))
saved_gb=$(echo "scale=2; $saved / 1073741824" | bc)
echo "Before:  ${total_before_gb}GB"
echo "After:   ${total_after_mb}MB"
echo "Saved:   ${saved_gb}GB"
echo "Files:   $cleaned cleaned, $failed failed"
