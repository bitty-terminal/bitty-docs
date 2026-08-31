# bitty-docs

`bitty-docs` is the canonical design and governance repository for the Bitty
terminal project. The project is currently in **Pre-alpha / M1 Hardening**
(2026-08-29, `bitty` `a8735d0`; `R-004` clipboard re-audited at `bitty`
`7a4ee41` baseline `de134ec` per
[`docs/security/audits/clipboard-2026-09.md`](https://github.com/bitty-terminal/bitty/blob/7a4ee41/docs/security/audits/clipboard-2026-09.md)
(2026-08-31, CTX-0097) and remains `Open`; `R-005`/`R-006`/`R-007` at `bitty`
`d4d75e9` (`5bdcdbd`/`0afc94d`/`d4d75e9`, Issues #137/#138/#139, baseline
`de134ec`, previous `7e3104d`) are `Mitigated` per RS-1..RS-7; experimental
implementations `c0aadd2` (vertical slice, CTX-0095 PR #148) + `7e3104d`
(plugin dogfood, CTX-0096 PR #149) + `a8735d0` (PTY reply fix, CTX-0098 PR #151)
are `Implemented` (experimental) not `Verified`/`Compatible`/`Release-ready`,
overall not `Verified`/`Compatible`/`Release-ready`): these documents describe
intent, accepted working directions (32 OQs Accepted: OQ-001..032), normative
requirements, and the implementation lifecycle
`Draft -> Experimental Implementation -> Accepted -> Verified -> Compatible -> Release-ready`
(spec) and `Specified -> Accepted -> Implemented -> Verified -> Compatible -> Release-ready`
(crate maturity); experimental code is review evidence, not acceptance. The
`bitty` workspace is now 16 crates (`vt`, `pty`, `platform`, `config`,
`package`, `lua`, `term-state`, `ui`, `render`, `plugin-host`, `rich`, `ipc`,
`agent`, `runtime`, `app`, `core`) with IPC/rich/resolver `Implemented`
(experimental at `a8735d0`, headless tests soak ~808) but not yet independently
verified; `Verified` requires security-auditor and P0-AC evidence per the
[risk evidence RFC](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/specifications/risk-evidence-rfc.md).
`R-004` at `7a4ee41` (`23` `suspicious_paste` + `13` `paste` unit + `4`
remediation, baseline `19`) remains `Open` with residual platform-backend,
real-window UX, and `8192`-byte bound-scope limits — not `Mitigated`/`Verified`;
`R-005` at `5bdcdbd`, `R-006` at `0afc94d`, `R-007` at `d4d75e9` are `Mitigated` with
residual UX and grant/budget soak gaps per independent review (see evidence
matrix). Experimental slice `c0aadd2` implements real single-window terminal
(`winit` 0.30/`wgpu` 25.0/`crossfont` 0.9, bounded PTY reply, Kitty `7727`) and
`a8735d0` closes reply loop via `Runtime::write_replies` (bounded `4`KiB); `7e3104d`
dogfoods public Plugin API with five bundled-disabled plugins. Canonical snapshot:
[`docs/project/project-state.json`](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/project/project-state.json)
(synchronized `a8735d0`, `2026-08-31`, `Pre-alpha / M1 Hardening`, `R-004`
`Open`, `R-005`/`R-006`/`R-007` `Mitigated`, experimental `c0aadd2`/`7e3104d`/`a8735d0`
`Implemented` not `Verified`) validated by `bun .github/scripts/check-state.mjs`.

## Start here

- [Documentation map](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/README.md) — topic-oriented navigation and authority
  rules.
- [User guide](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/user-guide/README.md) — an honest Pre-alpha / M1 Hardening plan
  for future user tasks, without invented commands before verification.
- [Development](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/development/README.md) — contributor entry point and
  delivery expectations.
- [Reference](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/reference/README.md) — planned factual interface reference,
  clearly separated from design proposals.
- [Product vision](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/product/vision.md) — the user problem, scope, and
  product principles.
- [Architecture overview](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/architecture/overview.md) — current system model
  and architectural status.
- [Security overview](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/security/overview.md) — normative security
  requirements for future implementation.
- [Decision register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/index.md) — accepted directions,
  normative contracts, and candidate decisions.
- [Open-question register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/open-questions.md) — unresolved work
  that must not be silently treated as decided.
- [Isolation Resource RFC](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/specifications/isolation-resource-rfc.md) — accepted isolation boundaries, resource ceilings, and failure semantics with adversarial tests for OQ-014 (2026-08-28).
- [Package Follow-up RFC](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/specifications/package-followup-rfc.md) — accepted resolver, yank, prerelease, registry, and key-management contracts for OQ-022 and OQ-026 through OQ-029 (2026-08-28).
- [Default Distribution RFC](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/specifications/default-distribution-rfc.md) — accepted default plugin bundle, enabled-by-default set, and disable mechanisms for OQ-002 (2026-08-29).
- [ADR 0008 - Headless Daemon, Detach/Reattach and Remote UI Trust Boundary](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0008-headless.md) — accepted deferral to post-v1.0 with trust-boundary gate for OQ-020 (2026-08-28).
- [IPC and Agent RFC](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/specifications/ipc-agent-rfc.md) — accepted bounded framing, wire, auth, scopes, and Agent bounded messages, auth, consent, and streaming for OQ-018 (2026-08-29).
- [CLI Contract RFC](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/specifications/cli-contract-rfc.md) — accepted top-level commands, dynamic `bitty x` namespace, action/output schemas, aliases, and exit codes 0-8 for OQ-017 (2026-08-28).
- [Governance RFC](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/specifications/governance-rfc.md) — accepted licenses, branch protections, ownership, compatibility policy, and cross-repository release flow for OQ-024 (2026-08-29).
- [Website Delivery RFC](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/specifications/website-delivery-rfc.md) — accepted loader, synchronization mechanism, release selector, multi-version URL scheme, route mapping, and redirect manifest for OQ-023 (2026-08-29).
- [Risk Evidence RFC](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/specifications/risk-evidence-rfc.md) — accepted risk-to-P0-AC traceability, evidence taxonomy, artifact storage, and review gates for OQ-025 (2026-08-29).
- [Plugin Reuse and Provider Ecology RFC](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/specifications/plugin-reuse-and-providers.md) — draft post-1.0 reuse principle Lua is glue with four layers and provider ecology for OQ-011, OQ-012, OQ-013 (Draft, not yet accepted).
- [Phase A TODO](https://github.com/bitty-terminal/bitty-docs/blob/main/TODO.md) — Pre-alpha / M1 Hardening status
  reconciliation and remaining hardening work (see `TODO.md` 2026-08-29).
- [Shared-conversation coverage](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/sources/chatgpt-share-coverage.md) —
  traceability from the 20-turn historical design conversation to canonical
  documents.

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
The ownership, validation, link, redirect, and cross-repository rules live in
the
[website content contract](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/project/website-content-contract.md).

## Status and authority

Each document should distinguish among these lifecycle states
(`Draft -> Experimental Implementation -> Accepted -> Verified -> Compatible -> Release-ready`
for specs, `Specified -> Accepted -> Implemented -> Verified -> Compatible -> Release-ready`
for crates):

- **Normative requirement**: a constraint future implementations must satisfy.
- **Accepted working direction**: current intent, still subject to an ADR or RFC
  where the mechanism or compatibility contract is not settled; all 32 OQs
  (OQ-001..032) are `Accepted` as of 2026-08-29.
- **Candidate** / **Draft**: a proposal retained for evaluation, not a decision;
  7 `Draft` specs remain (Workspace Compositor/Status/Input/Text/Registry vs
  AI Arch — see `docs/specifications/README.md` prioritization).
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
  `a8735d0` 16 crates; IPC/rich/resolver + experimental slice implemented but not
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
affected product or governance change. Current stage is **Pre-alpha / M1
Hardening** (2026-08-29, `bitty` `a8735d0`, 16 crates, soak ~808 headless tests
plus experimental `c0aadd2`/`7e3104d`/`a8735d0` `Implemented` (experimental) but not
yet `Verified`; `R-004` remains `Open` at `bitty` `7a4ee41` baseline `de134ec`
per 2026-08-31 clipboard audit with residual platform-backend, real-window UX,
and `8192`-byte bound-scope limits; `R-005`/`R-006`/`R-007` `Mitigated` at
`bitty` `d4d75e9` baseline `de134ec` previous `7e3104d` (Issues #137/#138/#139)
per RS-1..RS-7; `Draft` -> `Experimental Implementation` -> `Accepted` ->
`Verified` -> `Compatible`; overall product not
`Verified`/`Compatible`/`Release-ready`).
