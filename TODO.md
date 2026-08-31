# Pre-alpha / M1 Hardening TODO

This list sequences project-definition and hardening work at the **Pre-alpha /
M1 Hardening** stage (2026-08-29, `bitty` `be3bdb4`, 16 crates, 32 OQs
Accepted, soak ~808 headless tests; IPC/rich/resolver `Implemented` but not yet
`Verified`; `R-004` clipboard re-audited at `bitty` `7a4ee41` baseline
`de134ec` per
[`docs/security/audits/clipboard-2026-09.md`](https://github.com/bitty-terminal/bitty/blob/7a4ee41/docs/security/audits/clipboard-2026-09.md)
(2026-08-31, CTX-0097) with `23` `suspicious_paste` + `13` `paste` unit + `4`
remediation (baseline `19`) and remains `Open` with residual platform-backend,
real-window UX, and `8192`-byte bound-scope limits; `R-005`/`R-006`/`R-007`
`Mitigated` at `bitty` `d4d75e9` baseline `de134ec` previous `be3bdb4`
(`5bdcdbd`/`0afc94d`/`d4d75e9`, Issues #137/#138/#139) per RS-1..RS-7, overall not
`Verified`/`Compatible`/`Release-ready`). Canonical choices live in the
[open-question register](docs/decisions/open-questions.md) (OQ-001..032 all
`Accepted` per CTX-0083); lifecycle is
`Specified -> Accepted -> Implemented -> Verified -> Compatible -> Release-ready`.
Canonical snapshot: [`docs/project/project-state.json`](docs/project/project-state.json)
(synchronized `d4d75e9`, `2026-08-31`, `Pre-alpha / M1 Hardening`, `R-004`
`Open`, `R-005`/`R-006`/`R-007` `Mitigated`) validated by
`bun .github/scripts/check-state.mjs`.
This file groups the work into delivery stages and records reconciliation at
Phase A.

## Documentation foundation

- [x] Establish product, architecture, repository, and technology overviews.
- [x] Establish configuration, plugin, package, CLI, and rich-content design
      documents with explicit candidate status.
- [x] Establish normative security overview and threat model plus an
      evidence-based risk register.
- [x] Map both historical shared ChatGPT conversations to maintained documents
      without copying the raw transcripts: all 20 turns of the first source,
      and every recorded route item of the second source, whose phase plan,
      version ladder, and daemon staging remain unaccepted draft deposits
      ([coverage matrix](docs/sources/chatgpt-share-coverage.md),
      [draft proposals](docs/product/proposed-delivery-sequence.md)).
- [x] Add corpus navigation, decision status, and open-question registers.
- [x] Define user, contributor, reference, and website-consumption entry points
      without inventing pre-release product behavior.
- [x] Define English-only language, flat frontmatter metadata, publication, and
      documentation synchronization policies.
- [x] Add repository and CI gates for metadata and canonical-language checks.
- [x] Add empty-state-aware indexes for requirements, specifications, ADRs,
      RFCs, findings, roadmap, releases, migrations, troubleshooting, tutorials,
      how-to guides, and examples.
- [x] Require portable root README/AGENTS links and cap `TODO.md` at 300 lines.
- [x] Accept and document the zero-functionality Core and website repository
      bootstrap baseline in ADR 0001.
- [ ] Perform a final cross-repository documentation review after all initial
      repositories have their first commits and stable links.

## Required before product implementation — now Accepted (M1 Hardening)

- [x] Review and accept measurable product/performance budgets (OQ-001;
      accepted: specifications/performance-budget-rfc.md, 2026-08-28).
- [x] Review and accept platform support tiers and first compatibility
      milestone (OQ-003/OQ-004; accepted: ADR-0002, 2026-08-28,
      specifications/compatibility-milestone-rfc.md, M1).
- [x] Review and accept core topology and dependency ADRs (OQ-005/OQ-006;
      accepted: ADR-0003, 2026-08-27, ADR-0004, 2026-08-27; 16 crates
      `be3bdb4`).
- [x] Review and accept the terminal state/action invariant RFC (OQ-007;
      accepted: specifications/terminal-state-rfc.md, 2026-08-28).
- [x] Security-auditor review of the P0 acceptance criteria conversion
      (accepted: security/p0-acceptance-criteria.md, 34 criteria, normative
      2026-08-26).
- [x] Decide the first compatibility milestone and platform support/CI policy
      (OQ-003, OQ-004; accepted M1 per ADR-0002).
- [x] Record ADRs for the core topology, Rust toolchain/MSRV, and adopted
      dependencies (OQ-005, OQ-006; ADR-0003/MSRV 1.85/1.97.1, ADR-0004).
- [x] Specify terminal state/action invariants and the Plugin API v1 boundary
      (OQ-007, OQ-011, OQ-013; accepted 2026-08-27/28).
- [x] Specify the Lua runtime, capability/manifest model, configuration model,
      and isolation/resource mechanisms (OQ-009 through OQ-014; all accepted
      2026-08-27/28, plus OQ-030..032 ADR-0005/0006/0007, 2026-08-29).
- [x] Convert every normative P0 security control into testable acceptance
      criteria; retain all risks as open until cited evidence satisfies them
      (Risk Evidence RFC OQ-025 accepted 2026-08-29, matrix pending).
- [x] Specify package integrity, validation, transactional activation, rollback,
      and recovery before enabling third-party installation (OQ-021, OQ-022;
      accepted: package-lifecycle-rfc.md, package-followup-rfc.md 2026-08-28).
- [x] Obtain security review for any IPC, MCP, DevTools, rich transport, image,
      or headless interface before implementation begins (IPC Agent RFC
      OQ-018, Rich RFC OQ-008/015/016, DevTools OQ-019, Headless ADR 0008
      OQ-020 all accepted 2026-08-28/29).

## Initialization allowed in the current phase — M1 Hardening

- [x] Implement the ADR 0001 Core bootstrap with Rust 2024, resolver 3, the two
      non-publishable dependency-free packages, pinned stable tooling, `just`,
      and read-only format/Clippy/test/`actionlint` CI.
- [x] Implement the ADR 0001 Astro/Bun static website shell and Workers Static
      Assets deployment configuration; keep the docs consumer, adapter, loader,
      theme, search, and routes out of that scaffold.
- [x] Implement accepted 16-crate workspace (ADR 0003, `bitty` `be3bdb4`):
      `vt`, `pty`, `platform`, `config`, `package`, `lua` (`piccolo` 0.3.3),
      `term-state`, `ui`, `render`, `plugin-host`, `rich`, `ipc`, `agent`,
      `runtime`, `app`, `core`; `publish = true` for 9 leaves, soak ~808
      headless tests (`Implemented`, not yet `Verified`).
- [ ] Restore full Astro language-server diagnostics with TypeScript 7 after
      upstream support satisfies FIND-0001 acceptance criteria.
- [x] Add formatting, linting, documentation-link, and security-policy checks to
      CI without introducing product behavior (`just check` 93 files 0 issues,
      `actionlint` 1.7.12, `act -n` DRYRUN success).
- [x] Define release, compatibility, branch-protection, ownership, and docs-site
      publishing policies (OQ-023 Website Delivery RFC, OQ-024 Governance RFC
      both accepted 2026-08-29).
- [x] Establish linked GitHub Issue and pull request conventions once the first
      commit makes branch/worktree delivery available (labels `feat,area:xxx`
      and milestone `v0.0.1` per AGENTS.md).
- [x] Initialize per-repository CarryCtx state, rules, and personas with scopes
      matching repository ownership.
- [x] After a repository has its first commit, use isolated worktrees for
      parallel implementation tasks unless a task explicitly documents otherwise
      (`.worktrees/ctx-XXXX-...` per ADR 0003).

## Deferred until Verified — Implemented but not yet Verified (M1 Hardening)

- [x] Build the terminal core and renderer (`Implemented` at `be3bdb4`: `vt`
      parser `vte` 0.15, `term-state` grid/damage/image-store, `render`
      `wgpu` 25.0 `crossfont` 0.9, `pty` `portable-pty` 0.9, `platform`
      `winit` 0.30, `ui` layout, `runtime` orchestration; pending `Verified`).
- [x] Build configuration and plugin runtimes (`Implemented`: `config`
      `ConfigPlan`, `lua` `piccolo` 0.3.3 per ADR 0005/0006/0007,
      `plugin-host` capability/event queue; pending `Verified` and P0-AC).
- [x] Build rich-content, CLI/IPC, DevTools, MCP, or headless services
      (`Implemented`: `rich` ImageStore/scene, `ipc` framing/scopes/auth
      `be3bdb4`, `agent` bounded messages, `cli` contract, `devtools`
      instrumentation; pending `Verified`, headless deferred per ADR 0008).
- [x] Build package distribution and registry workflows (`Implemented`:
      `package` resolver side-by-side deterministic, lifecycle/integrity
      accepted OQ-021/022/026-029; signatures draft, pending `Verified`).
- [ ] Publish first-party plugins, SDK examples, or compatibility releases
      (still deferred: `Compatible`/`Release-ready` requires `Verified` plus
      semver and compatibility matrix).
- [ ] Add installation, getting-started, daily-use, troubleshooting, and factual
      reference pages only after verified product behavior exists
      (`Verified` gate per risk-evidence RFC).
- [ ] Decide internationalization ownership, locale structure, translation
      synchronization, and multilingual routing before adding localized files
      (English-only remains normative).

## Candidate vertical slice acceptance — documentation-only (CTX-0109 draft)

- [x] Draft single-window vertical slice acceptance plan
      ([Single-Window Vertical Slice Acceptance Plan](docs/product/vertical-slice-acceptance.md),
      CTX-0109, draft, depends on CTX-0107 Input/Pointer and CTX-0108
      Text/Rendering): one process/window/workspace/terminal, end-to-end
      `shell -> PTY -> VT -> state -> text/atlas -> GPU/window -> input -> PTY`,
      cursor/scrollback/resize-to-PTY/selection/copy-paste/shell/nvim+tmux smoke,
      visible/headless consistency with replay/diagnostics, Tier 1/2 per ADR-0002,
      PB-1..PB-7, explicit exclusions (Panel/Browser/Agent/marketplace/daemon);
      reconciled with 32 OQs `Accepted` and P0 gates, no code authorized until
      independent architecture/security/performance review and
      `just check` + `actionlint` + `act -n` pass.
- [ ] Obtain independent review and acceptance decision for the vertical slice
      plan before opening any implementation slice task; CTX-0110/0111 block on
      this decision, not on drafting.

## Candidate registry and view lifecycle — documentation-only (CTX-0110 draft)

- [x] Draft TerminalRegistry and View lifecycle contract
      ([TerminalRegistry and View Lifecycle Contract](docs/specifications/terminal-registry-view-lifecycle-rfc.md),
      CTX-0110, draft, depends on CTX-0109, reconciles with ADR 0003, Terminal
      State, Workspace Compositor, Input/Pointer, Text/Rendering, and Vertical
      Slice): `TerminalId` vs `ViewId` strict separation, `RuntimeId` vs
      `PersistentId`, registry creation/disposal, generation, view attachment
      and detachment, focus, layout, visibility, persistence, reattachment vs
      recreation, bounded resources, failure semantics, and explicit exclusions
      for multi-window, daemon, remote UI, and Panel Runtime/Event Bus; no
      implementation claims, no code authorized until independent
      architecture/security review and `just check` + `actionlint` + `act -n`
      pass.
- [ ] Obtain independent architecture/security review and acceptance decision
      for the registry and view lifecycle draft before opening any
      implementation task that would create or wire a registry; candidate
      remains draft until that review records `Accepted`.

Progress in those sections must cite the owning task and decision artifact;
design prose alone is never evidence that an implementation checkbox is done.
