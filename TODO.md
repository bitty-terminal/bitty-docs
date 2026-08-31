# Pre-alpha / M1 Hardening TODO

This list sequences project-definition and hardening work at the **Pre-alpha /
M1 Hardening** stage (2026-08-29, `bitty` `a8735d0`, 16 crates, 32 OQs
Accepted, soak ~808 headless tests; IPC/rich/resolver `Implemented`
(experimental) at `a8735d0` but not yet `Verified`; experimental vertical
slice `c0aadd2` (CTX-0095) + plugin dogfood `7e3104d` (CTX-0096) + PTY reply
fix `a8735d0` (CTX-0098) are `Experimental Implementation` (implemented,
reviewable, not `Verified`/`Compatible`); `R-004` clipboard re-audited at
`bitty` `7a4ee41` baseline `de134ec` per
[`docs/security/audits/clipboard-2026-09.md`](https://github.com/bitty-terminal/bitty/blob/7a4ee41/docs/security/audits/clipboard-2026-09.md)
(2026-08-31, CTX-0097) with `23` `suspicious_paste` + `13` `paste` unit + `4`
remediation (baseline `19`) and remains `Open` with residual platform-backend,
real-window UX, and `8192`-byte bound-scope limits; `R-005`/`R-006`/`R-007`
`Mitigated` at `bitty` `d4d75e9` baseline `de134ec` previous `7e3104d`
(`5bdcdbd`/`0afc94d`/`d4d75e9`, Issues #137/#138/#139) per RS-1..RS-7, overall not
`Verified`/`Compatible`/`Release-ready`. `be3bdb4` remains the M1 Hardening
baseline; chain `d4d75e9 -> c0aadd2 -> 7e3104d -> a8735d0` is experimental.
Canonical choices live in the [open-question register](docs/decisions/open-questions.md)
(OQ-001..032 all `Accepted` per CTX-0083); lifecycle is
`Draft -> Experimental Implementation -> Accepted -> Verified -> Compatible -> Release-ready`
(spec) and `Specified -> Accepted -> Implemented -> Verified -> Compatible -> Release-ready`
(crate maturity); experimental code is review evidence, not acceptance.
Canonical snapshot: [`docs/project/project-state.json`](docs/project/project-state.json)
(synchronized `a8735d0`, `2026-08-31`, `Pre-alpha / M1 Hardening`, `R-004`
`Open`, `R-005`/`R-006`/`R-007` `Mitigated`, experimental `c0aadd2`/`7e3104d`/`a8735d0`
`Implemented` not `Verified`) validated by `bun .github/scripts/check-state.mjs`.
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

## Candidate vertical slice acceptance — Draft spec + Experimental Implementation (CTX-0109 draft, CTX-0095/0098 Implemented)

- [x] Draft single-window vertical slice acceptance plan
      ([Single-Window Vertical Slice Acceptance Plan](docs/product/vertical-slice-acceptance.md),
      CTX-0109, draft, depends on CTX-0107 Input/Pointer and CTX-0108
      Text/Rendering): one process/window/workspace/terminal, end-to-end
      `shell -> PTY -> VT -> state -> text/atlas -> GPU/window -> input -> PTY`,
      cursor/scrollback/resize-to-PTY/selection/copy-paste/shell/nvim+tmux smoke,
      visible/headless consistency with replay/diagnostics, Tier 1/2 per ADR-0002,
      PB-1..PB-7, explicit exclusions (Panel/Browser/Agent/marketplace/daemon);
      reconciled with 32 OQs `Accepted` and P0 gates; spec remains `Draft`,
      not `Accepted`/`Verified`.
- [x] Experimental Implementation for vertical slice (CTX-0095 `c0aadd2`
      and CTX-0098 `a8735d0`, both `Implemented` not `Verified`):
      `bitty` `c0aadd2` implements real single-window slice (one process, one
      `winit` 0.30 window, one PTY `portable-pty` 0.9/ConPTY, one `vte` 0.15
      parser, one `term-state`, one view via `crossfont` 0.9/`wgpu` 25.0,
      `AnyRasterizer`, Kitty `7727` opt-in, mouse SGR `1000`/`1002`/`1003`/`1006`
      with Shift override, focus `1004`, bracketed paste `2004`, IME preedit
      overlay, wheel pixel accumulation, DPI scale, bounded `64`B/`32`B/`8`KiB;
      PR #148 `c0aadd2` `+1045 -87` 12 files, `cargo clippy -D warnings` 0,
      `cargo check --target x86_64-pc-windows-gnu` 0, `cargo test` 0, `just
check` 0). `bitty` `a8735d0` closes PTY reply loop (`Runtime::write_replies`
      bounded `4`KiB `PtyWriter::write_all` + `flush`, headless queues for
      `take_replies`, fail-closed) and Kitty progressive colon-subparams
      (`7727:1:2:5 -> 19` mask `0x1F`) per PR #151 (+408, `pty_reply` tests).
      Both are experimental review evidence; `Verified` requires independent
      architecture/security/performance review and `just check` + `actionlint` +
      `act -n` on the implementing revision; `Accepted` requires spec review
      per lifecycle `Draft -> Experimental Implementation -> Accepted -> Verified`.
- [ ] Obtain independent review and acceptance decision for the vertical slice
      plan and its experimental evidence before claiming `Accepted` or
      `Verified`; CTX-0110/0111/0116 block on this decision, not on drafting.

## Candidate registry and view lifecycle — Accepted spec + Experimental Implementation (CTX-0110 draft, CTX-0117 accepted, c0aadd2/a8735d0)

- [x] Draft TerminalRegistry and View lifecycle contract
      ([TerminalRegistry and View Lifecycle Contract](docs/specifications/terminal-registry-view-lifecycle-rfc.md),
      CTX-0110, draft, depends on CTX-0109, reconciles with ADR 0003, Terminal
      State, Workspace Compositor, Input/Pointer, Text/Rendering, and Vertical
      Slice): `TerminalId` vs `ViewId` strict separation, `RuntimeId` vs
      `PersistentId`, registry creation/disposal, generation, view attachment
      and detachment, focus, layout, visibility, persistence, reattachment vs
      recreation, bounded resources, failure semantics, and explicit exclusions
      for multi-window, daemon, remote UI, and Panel Runtime/Event Bus; spec
      was `Draft` until CTX-0117 acceptance.
- [x] Experimental Implementation for registry/view routing (part of `c0aadd2`
      and refined at `a8735d0`, `Implemented` not `Verified`): view rectangle
      plus DPI-aware cell metrics `floor(rect / cell)` -> PTY `SIGWINCH`/ConPTY
      resize, debounce `64` rects/tick, full-grid damage + generation, cursor
      integrity revalidation, `Runtime::write_replies` bounded reply path owned
      by registry; one registry per process per `c0aadd2`. Implementation is
      experimental evidence only; `Verified` requires independent
      architecture/security review per `Draft -> Experimental Implementation
-> Accepted -> Verified` lifecycle.
- [x] Independent architecture/security review and acceptance decision
      for the registry and view lifecycle draft plus its experimental evidence
      (CTX-0117, 2026-08-31, independent docs-reviewer, `just check` +
      `actionlint` + `act -n` + `bun .github/scripts/check-state.mjs` pass, no
      load-bearing defects) — spec now `Accepted` plus `Experimental
Implementation` at `c0aadd2`/`a8735d0` (not `Verified`/`Compatible`);
      lifecycle `Draft -> Experimental Implementation -> Accepted` recorded.

## Workspace Compositor — Accepted spec (CTX-0118, no experimental implementation)

- [x] Draft Workspace Compositor Specification
      ([Workspace Compositor Specification](docs/specifications/workspace-compositor.md),
      draft, Hyprland-inspired tiling H/V `LayoutTree`, View types
      `Terminal`/`Rich`/`Browser`, Core-owned `gaps_in`/`gaps_out`/`border`/`radius`,
      `LayoutProvider` `dwindle`/`master`/`grid`, drag/resize/move/scratchpad)
      reconciled with ADR 0003, Terminal State, TerminalRegistry/View,
      Input/Pointer, Text/Rendering, and security corpus; spec was `Draft` until
      CTX-0118 acceptance.
- [x] Independent architecture/security review and acceptance decision
      for the workspace compositor draft (CTX-0118, 2026-08-31, independent
      docs-reviewer, `just check` + `actionlint` + `act -n` +
      `bun .github/scripts/check-state.mjs` pass, no load-bearing defects) —
      spec now `Accepted` (no experimental implementation yet, not
      `Verified`/`Compatible`); lifecycle `Draft -> Accepted` recorded.

## Plugin dogfood — Experimental Implementation (CTX-0096 7e3104d)

- [x] Dogfood public Plugin API via accepted v1 bundled-disabled set
      (`bitty` `7e3104d`, CTX-0096, PR #149): five first-party plugins
      `shell-integration`, `tabs`, `statusline`, `palette`, `project` via
      `crates/bitty-plugin-host/src/bundled.rs` catalog, manifest/capability/
      lifecycle parity to `xuepoo.*` third-party, default-disabled
      (`EffectiveConfig` empty == core only), `bitty --safe` rejects
      `bitty-terminal.*`, bounded cold-path `DropOldest` PerSub `64` / PerPlugin
      `1024`/`256`KiB / Global `8192`/`2`MiB, `7+7` dogfood tests
      (`bundled_dogfood.rs` + `bundled_dogfood_runtime.rs`), `just check` 0,
      `cargo check --target x86_64-pc-windows-gnu` 0, headless deterministic.
      `Implemented` (experimental) not `Verified`/`Compatible`; splits/search
      and Panel Runtime/Browser/Agent/marketplace/daemon/remote UI remain
      explicitly not implemented.
- [ ] Verify dogfood does not bypass capability or budget gates; `Verified`
      requires per-risk RS-1..RS-7 and independent review.

## Documentation synchronization — CTX-0111 sync (2026-08-31)

- [x] Synchronize docs with vertical-slice decisions and evidence (CTX-0111,
      depends on CTX-0109, informational cross-repo link to `bitty` `CTX-0095`
      `Implement real single-window terminal vertical slice` `in_progress` in
      `bitty` repo as of 2026-08-31; no implementation, verification, or
      compatibility claims added; docs remain `Draft` candidate until
      independent review; `just check` + `actionlint` + `act -n` pass required;
      `docs/specifications/README.md` verified at 7 `Draft` specifications,
      `TODO.md` Pre-alpha sections for CTX-0107/0108/0109/0110 remain
      documentation-only, `docs/product/vision.md` and
      `docs/roadmap/now-next-later.md` checked for stale `6 drafts` counts
      or lifecycle wording — no stale counts found).
- [x] Independent docs review for CTX-0111 sync recorded; closed per PR #134.

## Documentation synchronization — CTX-0116 sync (2026-08-31)

- [x] Reconcile post-vertical-slice implementation state (CTX-0116, depends on
      CTX-0111, `bitty` `c0aadd2` vertical slice + `7e3104d` plugin dogfood +
      `a8735d0` PTY reply fix, all `Implemented` (experimental) not `Verified`):
      update `docs/project/project-state.json` to `a8735d0` (chain
      `d4d75e9 -> c0aadd2 -> 7e3104d -> a8735d0`, baseline `de134ec` previous
      `7e3104d`, `R-004` `Open` at `7a4ee41`, `R-005`/`R-006`/`R-007` `Mitigated`
      at `d4d75e9`, experimental `c0aadd2`/`7e3104d`/`a8735d0` not `Verified`,
      lifecycle `Draft -> Experimental Implementation -> Accepted -> Verified
-> Compatible`); update `TODO.md` to mark CTX-0095/0096/0098 completed as
      experimental, keep spec `Draft` vs code `Experimental Implementation`
      distinct; update `docs/roadmap/now-next-later.md`, `docs/README.md`,
      `README.md`, `docs/product/vertical-slice-acceptance.md`,
      `docs/specifications/input-pointer-rfc.md`,
      `docs/specifications/text-rendering-rfc.md`,
      `docs/specifications/terminal-registry-view-lifecycle-rfc.md` with
      implementation evidence links and correct `Draft`/`Experimental`
      wording; update `docs/specifications/README.md` prioritization for 7
      `Draft`s (Workspace Compositor/Status/Input/Text/Registry vs AI Arch);
      English only, flat frontmatter, `just check` + `actionlint` + `act -n` +
      `bun .github/scripts/check-state.mjs` pass, `git diff --check` 0.
- [ ] Obtain independent docs-curator + security-auditor review for CTX-0116
      sync before closing; `Verified`/`Compatible` remain gated on RS-1..RS-7.

Progress in those sections must cite the owning task and decision artifact;
design prose alone is never evidence that an implementation checkbox is done.
