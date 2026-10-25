#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_MJS="$SCRIPT_DIR/obsidian-mcp-server.mjs"

# If placed inside <Vault>/.obsidian/plugins/graph-magnetic-groups/mcp-server, auto-detect <Vault>!
CANDIDATE_VAULT="$(cd "$SCRIPT_DIR/../../../.." 2>/dev/null && pwd || true)"
if [ -n "${OBSIDIAN_VAULT_PATH:-}" ]; then
  VAULT_DIR="$OBSIDIAN_VAULT_PATH"
elif [ -n "$CANDIDATE_VAULT" ] && [ -d "$CANDIDATE_VAULT/.obsidian" ]; then
  VAULT_DIR="$CANDIDATE_VAULT"
else
  VAULT_DIR="$PWD"
fi

exec node "$SERVER_MJS" --vault "$VAULT_DIR" --tunnel "$@"
