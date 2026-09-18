# bitty-docs

`bitty-docs` is the canonical design and governance repository for the Bitty
terminal project. Project state at a glance (snapshot `2026-09-14`):

- Stage: **Pre-alpha / Engineering Milestones M1-M8** (`bitty` `bea338d`,
  baseline `de134ec`, previous `29772a3`, 19 crates).
- Latest release: `v0.0.20` (`d9f5b49`, 2026-09-11).
- Risks: `R-004` remains `Open` (not `Mitigated`/`Verified`);
  `R-005`/`R-006`/`R-007` are `Mitigated`.
- Full project state: [`docs/project/project-state.json`](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/project/project-state.json),
  the single machine fact source. This summary is derived from it and checked
  by `just state` (`bun .github/scripts/check-state.mjs`); generate the
  canonical wording with `bun .github/scripts/check-state.mjs --generate`.

These documents describe intent, accepted working directions (see the
[open-question register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/open-questions.md)
for the current `Accepted` count), normative requirements, and the
implementation lifecycle
`Draft -> Experimental Implementation -> Accepted -> Verified -> Compatible -> Release-ready`
(spec) and `Specified -> Accepted -> Implemented -> Verified -> Compatible -> Release-ready`
(crate maturity); experimental code is review evidence, not acceptance.
`Verified` requires security-auditor and P0-AC evidence per the
[risk evidence RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/risk-evidence-rfc.md).

## See the project workflow (CarryCtx)

CarryCtx is the local-first tool that records this project's tasks, decisions,
and checkpoints. Install it globally for local development (recommended):

```sh
cargo install carryctx      # Rust toolchain, or: npm i -g carryctx
```

CarryCtx engineering state (tasks, sessions, checkpoints) is not cloned. A
fresh clone restores it from the in-repo `refs/heads/carryctx-snapshots`
branch:

```sh
just workflow-import-dry   # fetch + validate the snapshot; no DB writes
just workflow-import       # initialize CarryCtx state if needed, then import
```

Then `carryctx stats` reports the restored tasks, sessions, and checkpoints.
Provenance, redaction, and `--force` behavior are covered under the
repository snapshot documentation below.

## Start here

- [Documentation map](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/README.md) — topic-oriented navigation and authority
  rules.
- [User guide](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/user-guide/README.md) — an honest Pre-alpha plan
  for future user tasks, without invented commands before verification.
- [Development](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/development/README.md) — contributor entry point and
  delivery expectations.
- [Reference](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/reference/README.md) — planned factual interface reference,
  clearly separated from design proposals.
- [Product vision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/product/vision.md) — the user problem, scope, and
  product principles.
- [Architecture overview](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/architecture/overview.md) — current system model
  and architectural status.
- [Security overview](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/security/overview.md) — normative security
  requirements for future implementation.
- [Decision register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/index.md) — accepted directions,
  normative contracts, and candidate decisions.
- [Open-question register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/open-questions.md) — unresolved work
  that must not be silently treated as decided.
- [Isolation Resource RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/isolation-resource-rfc.md) — accepted isolation boundaries, resource ceilings, and failure semantics with adversarial tests for OQ-014 (2026-08-28).
- [Package Follow-up RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/package-followup-rfc.md) — accepted resolver, yank, prerelease, registry, and key-management contracts for OQ-022 and OQ-026 through OQ-029 (2026-08-28).
- [Default Distribution RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/default-distribution-rfc.md) — accepted default plugin bundle, enabled-by-default set, and disable mechanisms for OQ-002 (2026-08-29).
- [ADR 0008 - Headless Daemon, Detach/Reattach and Remote UI Trust Boundary](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0008-headless.md) — accepted deferral to post-v1.0 with trust-boundary gate for OQ-020 (2026-08-28).
- [IPC and Agent RFC](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/specifications/ipc-agent-rfc.md) — accepted bounded framing, wire, auth, scopes, and Agent bounded messages, auth, consent, and streaming for OQ-018 (2026-08-29).
- [CLI Contract RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/cli-contract-rfc.md) — accepted top-level commands, dynamic `bitty x` namespace, action/output schemas, aliases, and exit codes 0-8 for OQ-017 (2026-08-28).
- [Governance RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/governance-rfc.md) — accepted licenses, branch protections, ownership, compatibility policy, and cross-repository release flow for OQ-024 (2026-08-29).
- [Website Delivery RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/website-delivery-rfc.md) — accepted loader, synchronization mechanism, release selector, multi-version URL scheme, route mapping, and redirect manifest for OQ-023 (2026-08-29).
- [Risk Evidence RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/risk-evidence-rfc.md) — accepted risk-to-P0-AC traceability, evidence taxonomy, artifact storage, and review gates for OQ-025 (2026-08-29).
- [Plugin Reuse and Provider Ecology RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-reuse-and-providers.md) — draft post-1.0 reuse principle Lua is glue with four layers and provider ecology for OQ-011, OQ-012, OQ-013 (Draft, not yet accepted).
- [Phase A TODO](https://github.com/bitty-terminal/bitty-docs/blob/main/TODO.md) — Pre-alpha status
  reconciliation and remaining hardening work (see `TODO.md` 2026-09-14).
- [Shared-conversation coverage](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/sources/chatgpt-share-coverage.md) —
  traceability from the 20-turn historical design conversation to canonical
  documents.
- Research-archive record-to-document mappings live in the `research`
  repository, not in this corpus, per the
  [self-containment rule](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/development/documentation-workflow.md#docs-self-containment).

## Repository structure

`bitty-docs` is the aggregator and shared-governance repository for the Bitty
ecosystem. Shared cross-project governance lives in the top-level directories;
project documentation lives in three project repositories mounted here as Git
submodules at the repository root:

| Submodule         | Repository                                                                   | Owns                                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `bitty-terminal/` | [bitty-terminal-docs](https://github.com/bitty-terminal/bitty-terminal-docs) | Terminal platform: architecture, specifications, interfaces, product, user guide, and the rest of the terminal corpus. |
| `bitty-ai/`       | [bitty-ai-docs](https://github.com/bitty-terminal/bitty-ai-docs)             | AI core: AI architecture, IPC and Agent RFC, Browser and Agent panel pre-study.                                        |
| `bitty-plugins/`  | [bitty-plugins-docs](https://github.com/bitty-terminal/bitty-plugins-docs)   | Plugin platform, SDK, lifecycle, package, isolation, and per-plugin content.                                           |

Shared governance stays in the top-level directories:

- `decisions/` (ADRs and the single global open-question register),
  `security/`, `development/`, `sources/`, `findings/`, `reviews/`,
  `handoff/`, `project/`, `roadmap/`, and `releases/`.

The [project documentation routing page](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/projects/README.md)
indexes the submodule mounts. Project content is mounted into the owning code
repositories at `<code-repo>/docs` (for example `bitty/docs`,
`bitty-ai/docs`, or `bitty-plugins/<plugin>/docs`), which consume the same
repository content at the pinned revision.

Routing rules:

- New project-specific documents go to the owning project documentation
  repository, not to this repository.
- Cross-project contracts, registers, policies, and the security corpus stay
  in the shared top-level directories; project pages link to them instead of
  copying them.
- Open-question and ADR/RFC numbering stay global; the single
  [open-question register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/open-questions.md)
  owns every OQ.
- Each submodule pointer pins an exact project-docs revision; update a pointer
  in a scoped review when the owning repository lands new content (see
  [submodule pointer updates](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/development/documentation-workflow.md#submodule-pointer-updates)).

Phases 1 and 2 added and populated the local `docs/projects/` partition. The
final model removed that duplicated content and replaced it with the three
root submodules pinned to each repository's merged `main`.

## Documentation system

English is the only canonical documentation language. Internationalization,
translations, locale directories, and multilingual routing are deferred until a
reviewed cross-repository decision defines their ownership and synchronization.

Every document under `docs/` uses a flat validated metadata schema. Metadata
controls audience, type, status, publication eligibility, and navigation order;
it never turns a proposal into implementation evidence. See the normative
[documentation workflow](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/development/documentation-workflow.md).

The `bitty-website` consumer now has an accepted loader (Website Delivery RFC
OQ-023, 2026-08-29) and Governance RFC (OQ-024, 2026-08-29) with pinned
`bitty-docs` revision consumption (`sync:docs --pin`). A future independent
integration must consume only eligible documents from an immutable pinned
revision and must present canonical content without copying specifications.
With project content in submodules, pinned-revision consumption must also
resolve the aggregator's recorded submodule pointers; the loader update is a
website follow-up, not yet implemented. The ownership, validation, link,
redirect, and cross-repository rules live in the
[website content contract](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/project/website-content-contract.md).

## CarryCtx snapshot publication

CarryCtx runtime state (`.git/carryctx/state.sqlite`) is never cloned. The
redacted engineering snapshot lives in this repository on branch
`refs/heads/carryctx-snapshots`, one commit per publication. The commander's
merge closeout publishes it with `just workflow-publish`; a fresh clone restores
its local CarryCtx DB from that branch:

```sh
just workflow-import-dry   # fetch + validate the snapshot; no DB writes
just workflow-import       # initialize CarryCtx state if needed, then import
```

The import fetches `refs/heads/carryctx-snapshots`, refuses to replace a
non-empty local DB without `--force` (`just workflow-import --force`), and
prints provenance (snapshot commit + source). Snapshots are redacted
publication artifacts produced by `carryctx export --publication`: CarryCtx
refuses them as merge sources, so restore always uses replace mode, and a
secret that leaked before rotation must still be rotated at the source.

## Status and authority

Each document should distinguish among these lifecycle states
(`Draft -> Experimental Implementation -> Accepted -> Verified -> Compatible -> Release-ready`
for specs, `Specified -> Accepted -> Implemented -> Verified -> Compatible -> Release-ready`
for crates):

- **Normative requirement**: a constraint future implementations must satisfy.
- **Accepted working direction**: current intent, still subject to an ADR or RFC
  where the mechanism or compatibility contract is not settled; see the
  [open-question register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/open-questions.md)
  for the current `Accepted` count (the register, not this list, owns OQ
  numbers).
- **Candidate** / **Draft**: a proposal retained for evaluation, not a decision;
  the
  [specifications index](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/README.md)
  table owns the current Draft list and prioritization.
- **Experimental Implementation**: code exists at `c0aadd2`/`7e3104d`/`a8735d0`
  as reviewable evidence (one window/PTY/view, `winit`/`wgpu`, bounded reply
  loop, dogfood plugins) but not yet `Accepted`/`Verified`; do not cite as
  stable. Distinct from `Draft` (no code) and `Accepted` (reviewed contract)
  and `Verified` (auditor + P0-AC evidence).
- **Open**: an unresolved question or risk; risk evidence matrix remains
  `pending` (implemented but not yet verified per
  [risk register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/security/risk-register.md));
  `R-004` remains `Open` at `7a4ee41`, `R-005`/`R-006`/`R-007` are `Mitigated`
  at `d4d75e9`, experimental slice not yet `Verified`.
- **Implemented**: requires evidence from a product repository (`bitty`
  `bea338d` 19 crates, including the `v0.0.20` plugin-runtime, Kitty-graphics,
  decoration, and config-matrix wave; IPC/rich/resolver plus compat-lab/perf
  hardening and experimental slice implemented but not
  yet verified) and must not be inferred from design prose.
- **Verified / Compatible / Release-ready**: requires independent review and
  P0-AC evidence before compatibility or release claims.

When statements conflict, normative security documents take precedence over
historical source notes. Accepted direction and decision status live in the
[decision register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/index.md); unresolved matters live in the
[open-question register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/open-questions.md). Source records are
provenance, not an alternative specification.

## Repository role

`bitty-docs` is one of the independent repositories under the
[`bitty-terminal`](https://github.com/bitty-terminal) organization. The local
umbrella directory only groups repositories; repository boundaries and current
remote state are documented in the
[repository map](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/project/repository-map.md).

Contributors should make documentation changes through the target repository's
CarryCtx task and scope, preserve provenance, and update affected navigation,
decision, open-question, and source records together. See the workspace
`AGENTS.md` and this repository's `AGENTS.md` before working.

The normal delivery lifecycle is Issue, CarryCtx task, branch/worktree, commit,
pull request, independent review plus CI, merge, and final task checkpoint.
Documentation synchronization is part of the definition of done for every
affected product or governance change. Current stage is **Pre-alpha /
Engineering Milestones M1-M8**; see the project-state summary at the top of
this file and the
[full project state](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/project/project-state.json) for the synchronized
revision, release, and risk state.
