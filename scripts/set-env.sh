#!/usr/bin/env bash
# Set one or more secrets for CoverBetter without printing them.
#
# Usage:
#   scripts/set-env.sh                       # asks for ANTHROPIC_API_KEY
#   scripts/set-env.sh OPENAI_API_KEY STRIPE_SECRET_KEY
#   scripts/set-env.sh --remote NAME         # .dev.vars and the deployed Worker
#   scripts/set-env.sh --remote-only NAME    # only the deployed Worker
#   scripts/set-env.sh --file .env.production.local NAME   # another git-ignored file
#   scripts/set-env.sh --prod-clerk          # production Clerk keys (see below)
#
# --prod-clerk asks for the two production Clerk keys. It sends both to the
# Worker and writes the publishable key to .env.production.local, because
# `next build` puts that key into the page code. Your local .dev.vars and
# .env.local keep the development keys.
set -euo pipefail

cd "$(dirname "$0")/.."
FILE=".dev.vars"

remote=false
local_write=true
prod_clerk=false
names=()
while [ $# -gt 0 ]; do
	case "$1" in
		--remote) remote=true ;;
		--remote-only) remote=true; local_write=false ;;
		--file) FILE="${2:?--file needs a path}"; shift ;;
		--prod-clerk) prod_clerk=true ;;
		-h|--help) sed -n '2,15p' "$0"; exit 0 ;;
		*) names+=("$1") ;;
	esac
	shift
done

read_value() {
	# Reads a hidden value into $value, cleaned of escape codes and spaces.
	printf 'Paste the value for %s (input is hidden), then press Return: ' "$1"
	IFS= read -rs value
	echo
	# Remove terminal escape codes (for example an arrow key pressed while pasting)
	# and any other non-printable characters.
	value="$(printf '%s' "$value" | perl -pe 's/\e\[[0-9;?]*[A-Za-z~]//g; s/[^\x20-\x7E]//g')"
	value="${value#"${value%%[![:space:]]*}"}"   # trim leading spaces
	value="${value%"${value##*[![:space:]]}"}"   # trim trailing spaces
}

write_file() {
	# write_file <file> <name> <value>: replace or add the line. No value on a command line.
	local file="$1" name="$2" val="$3" tmp
	if ! git check-ignore -q "$file"; then
		echo "Stop: $file is not git-ignored. Fix .gitignore first." >&2
		exit 1
	fi
	[ -f "$file" ] || { if [ "$file" = ".dev.vars" ]; then cp .dev.vars.example "$file"; else : > "$file"; fi; }
	tmp="$(mktemp)"
	grep -v -E "^${name}=" "$file" > "$tmp" || true
	printf '%s=%s\n' "$name" "$val" >> "$tmp"
	mv "$tmp" "$file"
	chmod 600 "$file"
	echo "Saved $name to $file (${#val} characters)."
}

put_remote() {
	printf '%s' "$2" | npx wrangler secret put "$1"
}

if $prod_clerk; then
	read_value NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
	[[ "$value" == pk_live_* ]] || { echo "Stop: the production publishable key starts with pk_live_." >&2; exit 1; }
	write_file .env.production.local NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY "$value"
	put_remote NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY "$value"
	read_value CLERK_SECRET_KEY
	[[ "$value" == sk_live_* ]] || { echo "Stop: the production secret key starts with sk_live_." >&2; exit 1; }
	put_remote CLERK_SECRET_KEY "$value"
	unset value
	echo "Done. Production Clerk keys are on the Worker. Redeploy with: npm run deploy"
	exit 0
fi

[ ${#names[@]} -eq 0 ] && names=("ANTHROPIC_API_KEY")

for name in "${names[@]}"; do
	if ! [[ "$name" =~ ^[A-Z][A-Z0-9_]*$ ]]; then
		echo "Skip: '$name' is not a valid variable name." >&2
		continue
	fi
	read_value "$name"
	if [ -z "$value" ]; then
		echo "Skip: no value for $name."
		continue
	fi
	$local_write && write_file "$FILE" "$name" "$value"
	$remote && put_remote "$name" "$value"
	unset value
done

echo "Done. Restart the dev server so it reads the new values."
