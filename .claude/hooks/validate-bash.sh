#!/usr/bin/env bash
set -euo pipefail

INPUT="$(cat)"
COMMAND="$(printf '%s' "$INPUT" | python -c "import json,sys; d=json.load(sys.stdin); print((d.get('tool_input') or {}).get('command',''))")"

if [[ -z "$COMMAND" ]]; then
  exit 0
fi

# Hard blocks for destructive/risky operations
if [[ "$COMMAND" =~ (^|[[:space:]])rm[[:space:]]+-rf[[:space:]]+ ]]; then
  echo "Blocked: destructive rm -rf command is not allowed" >&2
  exit 2
fi

if [[ "$COMMAND" =~ git[[:space:]]+push[[:space:]].*--force ]]; then
  echo "Blocked: force push is not allowed" >&2
  exit 2
fi

if [[ "$COMMAND" =~ (^|[[:space:]])curl[[:space:]] ]] || [[ "$COMMAND" =~ (^|[[:space:]])wget[[:space:]] ]]; then
  echo "Blocked: use WebFetch/domain-allowlisted flows instead of raw curl/wget" >&2
  exit 2
fi

exit 0
