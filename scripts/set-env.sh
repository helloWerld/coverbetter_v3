#!/usr/bin/env bash
# Set one or more secrets for CoverBetter without printing them.
#
# Usage:
#   scripts/set-env.sh                       # asks for ANTHROPIC_API_KEY
#   scripts/set-env.sh OPENAI_API_KEY STRIPE_SECRET_KEY
#   scripts/set-env.sh --remote ANTHROPIC_API_KEY   # also runs `wrangler secret put`
#
# The value is read with hidden input. It is written to .dev.vars (local dev,
# git-ignored). With --remote, it is also sent to the deployed Worker.
set -euo pipefail

cd "$(dirname "$0")/.."
FILE=".dev.vars"

remote=false
names=()
for arg in "$@"; do
	case "$arg" in
		--remote) remote=true ;;
		-h|--help) sed -n '2,10p' "$0"; exit 0 ;;
		*) names+=("$arg") ;;
	esac
done
[ ${#names[@]} -eq 0 ] && names=("ANTHROPIC_API_KEY")

if ! git check-ignore -q "$FILE"; then
	echo "Stop: $FILE is not git-ignored. Fix .gitignore first." >&2
	exit 1
fi

[ -f "$FILE" ] || cp .dev.vars.example "$FILE"
chmod 600 "$FILE"

for name in "${names[@]}"; do
	if ! [[ "$name" =~ ^[A-Z][A-Z0-9_]*$ ]]; then
		echo "Skip: '$name' is not a valid variable name." >&2
		continue
	fi

	printf 'Paste the value for %s (input is hidden), then press Return: ' "$name"
	IFS= read -rs value
	echo
	# Remove terminal escape codes (for example an arrow key pressed while pasting)
	# and any other non-printable characters.
	value="$(printf '%s' "$value" | perl -pe 's/\e\[[0-9;?]*[A-Za-z~]//g; s/[^\x20-\x7E]//g')"
	value="${value#"${value%%[![:space:]]*}"}"   # trim leading spaces
	value="${value%"${value##*[![:space:]]}"}"   # trim trailing spaces
	if [ -z "$value" ]; then
		echo "Skip: no value for $name."
		continue
	fi

	# Replace the line for this name, or add it. The value never goes on a command line.
	tmp="$(mktemp)"
	grep -v -E "^${name}=" "$FILE" > "$tmp" || true
	printf '%s=%s\n' "$name" "$value" >> "$tmp"
	mv "$tmp" "$FILE"
	chmod 600 "$FILE"
	echo "Saved $name to $FILE (${#value} characters)."

	if $remote; then
		printf '%s' "$value" | npx wrangler secret put "$name"
	fi
	unset value
done

echo "Done. Restart the dev server so it reads the new values."
