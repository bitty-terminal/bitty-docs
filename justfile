# bitty-docs quality commands

prettier_version := "3.9.6"
markdownlint_version := "0.23.1"
actionlint_version := "1.7.12"

# Format every file type supported by Prettier inside this repository.
fmt:
    bunx --bun prettier@{{prettier_version}} --write . --ignore-unknown

# Check formatting without changing files.
fmt-check:
    bunx --bun prettier@{{prettier_version}} --check . --ignore-unknown

# Lint every Markdown file selected by .markdownlint-cli2.jsonc.
markdownlint:
    bunx --bun markdownlint-cli2@{{markdownlint_version}}

# Check repository-local Markdown links and fragments without network access.
links:
    bun .github/scripts/check-docs.mjs links

# Validate the exact flat frontmatter schema for every document under docs/.
metadata:
    bun .github/scripts/check-docs.mjs metadata

# Keep every repository-owned Markdown file English-only.
language:
    bun .github/scripts/check-docs.mjs language

# Enforce line budgets for every repository-owned AGENTS.md and TODO.md.
agents:
    bun .github/scripts/check-docs.mjs agents

# Reject generated, temporary, database, and editor artifacts.
hygiene:
    bun .github/scripts/check-docs.mjs hygiene

# Validate GitHub Actions syntax using the locally installed actionlint.
actionlint:
    @installed="$(actionlint --version | head -n 1)"; test "$installed" = "{{actionlint_version}}" || { echo "actionlint {{actionlint_version}} required; found $installed" >&2; exit 1; }
    actionlint -color -shellcheck=

# Run the same logical gates as CI. All recipes are read-only.
check:
    just fmt-check
    just markdownlint
    just links
    just metadata
    just language
    just agents
    just hygiene
    just actionlint
