# Pre-alpha / Engineering Milestones M1-M8 TODO

Project state at a glance (snapshot `2026-09-19`): stage **Pre-alpha / Engineering Milestones M1-M8** (`bitty` `23c3eb6`, baseline `de134ec`, previous `bea338d`, 21 crates); latest release `v0.0.20` (`d9f5b49`, 2026-09-11) — pre-alpha releases exist, but no stable or supported public contract has been declared; risks `R-004` remains `Open` (not `Mitigated`/`Verified`), while `R-005`/`R-006`/`R-007` are `Mitigated`; [`docs/project/project-state.json`](docs/project/project-state.json) is the single machine fact source, derived by this summary and checked by `just state` (`bun .github/scripts/check-state.mjs`).

This file groups the work into delivery stages and records reconciliation at
Phase A (CTX-0116), the post-0223 reconciliation (CTX-0130), the
semantic-terminal plus scrollbar sync (CTX-0131), the scrollbar shipped
flip (CTX-0132), the workspace/frameHash sync bundle (CTX-0133), the
project-state refresh plus refresh automation (CTX-0180), and the
project-state refresh to `23c3eb6` (CTX-0233). OQ counts live in
the [open-question register](docs/decisions/open-questions.md) and milestone
detail lives in the [roadmap](docs/roadmap/now-next-later.md), not in this
summary.

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
      [draft proposals](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/product/proposed-delivery-sequence.md)).
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
      accepted: ADR-0003, 2026-08-27, ADR-0004, 2026-08-27; 18 crates
      `1835175`, verification crates `compat-lab`/`perf` added after
      `be3bdb4`).
- [x] Review and accept the terminal state/action invariant RFC (OQ-007;
      accepted: specifications/terminal-state-rfc.md, 2026-08-28).
- [x] Security-auditor review of the P0 acceptance criteria conversion (accepted: security/p0-acceptance-criteria.md, 34 criteria, normative 2026-08-26).
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
- [x] Implement accepted 18-crate workspace (ADR 0003 topology as extended,
      `bitty` `1835175`): `vt`, `pty`, `platform`, `config`, `package`, `lua` (`piccolo` 0.3.3),
      `term-state`, `ui`, `render`, `plugin-host`, `rich`, `ipc`, `agent`,
      `runtime`, `app`, `core`, plus `compat-lab` and `perf`; `publish = true` for 9 leaves
      (`Implemented`, not yet `Verified`).
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
      `plugin-host` capability/event queue; pending `Verified` and P0-AC;
      successor direction Phodopus, [ADR 0012](docs/decisions/adrs/ADR-0012-phodopus-runtime.md)).
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
- [ ] Add compatibility guarantees and factual reference pages that promise
      stable behavior only after verified product behavior exists (`Verified`
      gate per risk-evidence RFC). Shipped-factual user docs are different:
      per DIR-015, installation, getting-started, daily-use, and
      troubleshooting pages that describe shipped behavior with an explicit
      version qualifier ("Available in `v0.0.20`, pre-alpha, API and behavior
      may change") do not wait for `Verified`; they must never claim
      compatibility or verified security.
- [ ] Decide internationalization ownership, locale structure, translation
      synchronization, and multilingual routing before adding localized files
      (English-only remains normative).

## Candidate vertical slice acceptance — Draft spec + Experimental Implementation (CTX-0109 draft, CTX-0095/0098 Implemented)

- [x] Draft single-window vertical slice acceptance plan
      ([Single-Window Vertical Slice Acceptance Plan](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/product/vertical-slice-acceptance.md),
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
      ([TerminalRegistry and View Lifecycle Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/terminal-registry-view-lifecycle-rfc.md),
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
      ([Workspace Compositor Specification](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/workspace-compositor.md),
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

## Panel Runtime and Event Bus — Draft research pre-study (CTX-0119, P2)

- [x] Survey Panel Runtime/Event Bus ([Pre-Study](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-pre-study.md), `Draft` no impl, CTX-0119 depends CTX-0118): lifecycle `PanelId` vs `ViewId`/`TerminalId` with generation, command `owner.name:command`, overlay `4+1`, focus MRU no Lua hot path, bus `owner.name:topic` `8 KiB`/`32`/`64`/`1024`/`8192` `DropOldest`, isolation `panel.*`; reconciled with `6f30c2f`/`c3a2928`; bounded PR-1..PR-12, typed errors, exclusions deferred; `sidebar_order 27`, indexes updated.
- [ ] Independent docs-reviewer review; research until future Panel RFC.

## Browser and Agent Panel Integration — Draft research pre-study (CTX-0120, P2)

- [x] Survey Browser and Agent via Panel Runtime ([Pre-Study](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/interfaces/browser-agent-pre-study.md), `Draft` no impl, CTX-0120 depends CTX-0119): WebView via `View Browser` plus `Panel` host, MCP via Tool Bus `256 KiB` `8 KiB` `32` `64`/`1024`/`8192` `DropOldest`, Agent memory `32 KiB` `64`/`2 MiB` `32`/`64 KiB`, isolation `browser.*` `agent.*` `mcp.*` plus first-party matrix `5` bundled-disabled plus `browser` `agent` candidate-not-bundled; reconciled with Panel Runtime `9032d1e` / requested `05e8803` PR-1..PR-12 and Project plugin `bitty-terminal.project`; bounded BA-1..BA-12, typed failure, exclusions deferred; `sidebar_order 28`, indexes updated.
- [ ] Independent docs-reviewer review; research until future Browser and Agent RFC.

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

- [x] Synchronize docs with vertical-slice decisions and evidence (CTX-0111, depends CTX-0109; docs stay `Draft` until independent review; gates pass; no stale counts). Independent review recorded; closed per PR #134.

## Documentation synchronization — CTX-0116 sync (2026-08-31)

- [x] Reconcile post-vertical-slice state (CTX-0116, depends CTX-0111; snapshot to `a8735d0` with chain `d4d75e9 -> c0aadd2 -> 7e3104d -> a8735d0`, baseline `de134ec`, risks unchanged, specs stay `Draft` vs code `Experimental Implementation`; summaries and gates in lockstep).
- [ ] Obtain independent docs-curator + security-auditor review for CTX-0116
      sync before closing; `Verified`/`Compatible` remain gated on RS-1..RS-7.

## Documentation synchronization — prior syncs (2026-09-07/08, CTX-0130..CTX-0133)

- [x] CTX-0130 post-0223 reconciliation (`1835175` previous `e8a7b76`): verified-only subsystem rows, M1-M8 frame, Draft semantic-terminal RFC; no risk-state or normative changes.
- [x] CTX-0131 scrollbar Draft plus semantic-terminal P1-P5 (`7048139` previous `1835175`): scrollbar Draft pending #405 (`f1caedf`); P1-P2 `4ccb771`, P3 `064486b`, P4-P5 `ab1f7ab` Implemented-only; wave refresh; no risk-state or normative changes.
- [x] CTX-0132 scrollbar flip to shipped (`c49ead1` previous `7048139`): scrollbar shipped defaults (#405 merged); snapshot touch-up; no risk-state or normative changes.
- [x] CTX-0133 sync bundle to `29772a3` previous `c49ead1` (release `v0.0.19`): workspace rename plus gaps, radius S0, frameHash plus V1-V3, mod_key, font defaults; snapshot, validator, fixture, and summaries in lockstep; no risk-state or normative changes (PR #164).
- [x] CTX-0180 refresh to `bea338d` previous `29772a3` (release `v0.0.20`, 19 crates, 40 OQs Accepted): add `refresh-state.mjs` with `just state-refresh`/`just state-refresh-check` and the scheduled State freshness workflow; the validator now derives revision/date/count consistency instead of freezing literals; no risk-state or normative changes.
- [x] CTX-0233 refresh to `23c3eb6` previous `bea338d` (21 crates, 41 OQs Accepted): snapshot, provenance, milestone/subsystem prose, derived summaries, and release vocabulary in lockstep; no risk-state or normative changes (Issue #355).

## Follow-ups recorded by CTX-0199 (DIR-015)

- [ ] Write the shipped-factual installation and getting-started guides for `v0.0.20` (AUR `bitty-bin`/`bitty`, GitHub Releases, `bitty init`, `bitty doctor`) with the DIR-015 version qualifier, in the owning project docs repository. This task only opens the policy gate; it does not write the guides.
- [x] Add `just docs-status` (per-sibling pin, docs-main, behind-count, and
      code-repo `docs/` mount) plus `just docs-check-cross-repo` (absolute
      cross-repo link validation; offline mode gated in `just check`);
      CTX-0234 (Issue #354). The pin semantics in the
      [repository map](docs/project/repository-map.md#submodule-pin-semantics)
      remain normative.

## Freshness detection — recommendation recorded by CTX-0233 (Issue #355)

- [ ] Decide and implement the `just state-refresh-check` staleness trigger: keep the date-only `snapshot_date` comparison for release metadata, and add a commit-distance (or "implementation main changed") trigger so the scheduled State freshness workflow fails as soon as `bitty` `main` moves past the snapshot revision. Recommendation: prefer the main-changed trigger (snapshot revision vs implementation head) with a small, documented commit-distance tolerance; it catches every drift the date-only path misses, costs one `git rev-list` call per run, and moves no `Verified`/`Accepted` state. No workflow change in CTX-0233; land it as a separate scoped task.

## Lua runtime successor — Phodopus (ADR 0012, CTX-0236)

- [x] Record the owner decision (2026-09-20) moving Bitty's Lua path from the Piccolo watch-list candidate to Phodopus, a sandbox-first successor runtime forked from `kyren/piccolo`: [ADR 0012](docs/decisions/adrs/ADR-0012-phodopus-runtime.md), with refinement pointers in ADR 0004/ADR 0005 and the OQ-030 row. Direction only; accepted `mlua`/Lua 5.4 and `piccolo 0.3.3` pins unchanged.
- [ ] Implement the six-phase Phodopus roadmap (fork/attribution, upstream PR absorption, `package`/`require` plus stdlib gaps, hard quotas/Fuel sandboxing, generic async bridge, `bitty-lua` integration) in the owning `phodopus` repository; `bitty-lua` migration is deferred until usable.

## Follow-up recorded by CTX-0232 (self-containment)

- [ ] Export the removed record-to-document mappings into the `research` repository ([rule](docs/development/documentation-workflow.md#docs-self-containment)).

## Follow-up recorded by CTX-0231 (governance corpus)

- [x] Bump the three root submodule pointers to the sibling mains:
      `bitty-terminal` `0b2fcfb` -> `937cfcf`, `bitty-ai` `39b4c75` ->
      `a1112fb`, `bitty-plugins` `ee19a0d` -> `4d5aed2`, and fix the dead
      `specifications/*` cross-repo links (141 occurrences, 23 files);
      CTX-0234 (Issue #354) per the
      [documentation workflow](docs/development/documentation-workflow.md#submodule-pointer-updates);
      the `check-state.mjs` ladder-lag note persists until the sibling refreshes.

Progress in those sections must cite the owning task and decision artifact;
design prose alone is never evidence that an implementation checkbox is done.
