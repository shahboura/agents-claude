#!/usr/bin/env bash
set -euo pipefail

INPUT="$(cat)"
FILE_PATH="$(printf '%s' "$INPUT" | python -c "import json,sys; d=json.load(sys.stdin); ti=d.get('tool_input') or {}; print(ti.get('file_path') or '')")"

if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

case "$FILE_PATH" in
  *".env"|*".env."*|*"secrets/"*|*"credentials.json"|*".pem")
    echo "Blocked: sensitive path cannot be modified: $FILE_PATH" >&2
    exit 2
    ;;
esac

exit 0
