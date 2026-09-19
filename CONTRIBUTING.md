# Contributing

Thank you for contributing to `bitty-docs`, the canonical design and governance
repository for the Bitty terminal project. The project is in its pre-alpha
phase: documents are the contract source, an experimental implementation exists
in the `bitty` repository, and nothing here should be described as stable,
supported, `Verified`, `Compatible`, or `Release-ready` product behavior.

## Prerequisites

- `just` — command runner; every quality gate runs through the justfile
- Bun 1.4.0 — JavaScript execution and package management (`bun` / `bunx --bun`)
- `actionlint` 1.7.12 — GitHub Actions workflow validation (pinned in the
  justfile)

Never use `npm`, `npx`, or `yarn` in this repository. Tool versions are pinned
in exactly one place: the justfile and lockfiles.

## Setup

Clone the repository and confirm the gates run:

```bash
just check
```

`just check` is read-only: it verifies Prettier formatting, markdownlint,
repository-local links, offline cross-repository links, frontmatter metadata,
English-only content, agent-file line budgets, hygiene, and Actions syntax.

## Development loop

```bash
just fmt-check           # verify formatting without changing files
just fmt                 # format every supported file type
just links               # validate repository-local Markdown links
just docs-check-cross-repo --offline  # validate cross-repo links without network
just docs-status         # submodule pins vs sibling docs-repo mains
just metadata            # validate the flat docs/ frontmatter schema
just language            # keep repository-owned Markdown English-only
just check               # full local gate pipeline (same logical gates as CI)
```

## Documentation rules

- Read `AGENTS.md` before working. It defines scope, authority, the CarryCtx
  workflow, and workspace hygiene for this repository.
- Every document under `docs/` uses the exact flat frontmatter schema defined
  in `docs/development/documentation-workflow.md`; its `title` must match the
  H1.
- English is the only canonical documentation language.
- Label statements as normative, accepted, proposed, experimental,
  implemented, or unverified. Never turn a design intention into a
  shipped-behavior claim.
- Keep one authoritative definition per concept and link to it instead of
  copying divergent wording.
- Absolute links into a sibling repository (`github.com/bitty-terminal/*`
  `blob`/`tree`) must point at a path that exists on that repository's current
  `main`; `just docs-check-cross-repo` validates them.

## Delivery lifecycle

The primary lifecycle is:

```text
Issue -> Branch -> Commit -> Pull Request -> Review + CI -> Merge
```

- Link each change to a GitHub Issue and a CarryCtx task with a declared,
  non-overlapping scope.
- Keep commits coherent, scoped, reviewable, and written as Conventional
  Commits.
- Review is independent from implementation. Merge only after required review
  findings and CI failures are resolved.
- Documentation synchronization is part of the definition of done: affected
  navigation, decision registers, open questions, risks, redirects, and release
  notes must be updated together with the underlying change.

### Branch and worktree naming

Task branches follow `ctx-XXXX/<type>-<short-slug>`: `XXXX` is the owning
CarryCtx task number, `<type>` is one of `feat|fix|chore|docs`, and
`<short-slug>` is kebab-case (for example `ctx-0031/feat-isolation-rfc`).
Worktrees live at `.worktrees/ctx-XXXX-<type>-<short-slug>`, mapping `/` to
`-`. Use one branch per task; commander housekeeping may use `cmd/<slug>`.

## Committing

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```text
docs(security): add incident response expectations
chore(ci): pin actionlint to 1.7.12
fix(links): correct broken cross-reference in architecture overview
```

Commit messages are validated against the conventional-commit configuration in
`commitlint.config.ts`.

## Questions

Open a GitHub Issue in this repository, or consult `AGENTS.md` and
`README.md` for repository-specific guidance.
