---
title: ADR 0004 - Upstream Dependency Set
description: Records adopt, wrap, or fork decisions for candidate upstream libraries with maintenance policy and supply-chain constraints
category: decisions
audience: contributor
document_type: specification
status: accepted
website_publish: true
sidebar_order: 34
---

# ADR 0004 - Upstream Dependency Set

## Status

Accepted on 2026-08-26 by the project initiator, closing open question
[OQ-006](../open-questions.md). Version numbers cited are
observation evidence at authoring time; the implementing task pins exact
versions in a lockfile. No dependency is added to any repository by this ADR.

Amended on 2026-09-16 (CTX-0214, bitty#835 review follow-up): the rule-5
license policy is restated by the dated amendment in the Decision section
below. The accepted text is preserved and the deviation is recorded
explicitly rather than rewritten.

Amended on 2026-10-26 (CTX-0295; bitty CTX-1605, merged as `aa18c61a` in
bitty#2726): the rule-3 fork criteria are applied to a path-vendored
`winit 0.30.13` patch by the dated amendment below, which records the missing
capability, upstream links, patch surface, synchronization strategy, exit
conditions, named maintenance owner, and the accepted risk of carrying an
unmerged upstream patch.

Amended on 2026-10-26 (CTX-0296; bitty CTX-1607): rule 1's audit and lock
requirements and rule 4's maintenance clock are applied to the direct
font-parsing edges (`ttf-parser` and `fontconfig-parser`) that the persistent
font index adds to `bitty-render`'s startup hot path. The dated amendment below
records the adopted edges, why the parsers are called directly, the advisory
bound, the superseded text, the maintenance owner, the exit conditions, and the
license check.

## Context

[ADR 0001](ADR-0001-repository-bootstrap-baseline.md) left every dependency
table empty. The [Technology and Dependency Strategy](../../project/technology-strategy.md)
fixes the preference order — use upstream, then wrap, then decompose or
narrowly fork — and requires that no third-party type becomes part of Bitty's
stable public or internal architecture without an abstraction boundary. The
[Security Overview](../../security/overview.md) treats package sources as
untrusted supply chains requiring manifest validation, lock, checksum, and
provenance policy, and requires bounded parsing for every untrusted input.
This ADR applies that governance to the first candidate library set.

## Decision

### Maintenance policy (applies to all rows)

1. Every dependency enters through `cargo add` with an explicit semver range,
   is locked by committed `Cargo.lock`, and is audited by `cargo vet` (or
   `cargo audit` until vet review capacity exists) in CI.
2. Domain components are consumed only via Bitty-owned wrapper crates; core
   semantics crates depend on no third-party public type.
3. A strategic fork requires, before creation: the missing capability, the
   upstream issue or PR link, patch surface, synchronization strategy, exit
   conditions, and a named maintenance owner. Forks live as vendored paths in
   the workspace (`vendor/`), never as silent patches.
4. Any dependency that becomes unmaintained for over twelve months while on a
   hot path must be replaced or forked under rule 3.
5. Licenses must be MIT, Apache-2.0, BSD, ISC, Zlib, or dual Apache-2.0/MIT;
   copyleft (GPL/AGPL/MPL/EUPL) dependencies are prohibited anywhere in the
   dependency graph of shipped binaries. Each row below records its check. As
   amended on 2026-09-16, the canonical allowlist and the single per-crate
   `MPL-2.0` exception are recorded in [License policy amendment
   (2026-09-16)](#license-policy-amendment-2026-09-16); the copyleft
   prohibition stands everywhere outside that named exception.

### License policy amendment (2026-09-16)

Rule 5's original text stands as accepted history; this dated amendment is the
explicit deviation record. The source of truth is the merged `bitty` gate
(`deny.toml` plus the `Supply chain (deny/audit)` job in
`.github/workflows/ci.yml`; bitty#835 / CTX-0505, merge commit `d4b091e`),
which runs `cargo deny check` 0.20.2 and `cargo audit` 0.22.2.

Canonical license allowlist, exactly as implemented in `deny.toml`
(`[licenses].allow`, confidence threshold `0.8`; workspace-private crates are
skipped by `[licenses.private].ignore`):

- Rule-5 core set: MIT, Apache-2.0, Apache-2.0 WITH LLVM-exception,
  BSD-3-Clause, BSD-2-Clause, ISC, Zlib.
- Additional permissive licenses required by unavoidable transitive
  dependencies: Unicode-3.0 (`unicode-ident`), CC0-1.0 (`hexf-parse` via
  `naga`), BSL-1.0 (`clipboard-win` and `error-code` via `arboard` on
  Windows).
- `Apache-2.0 WITH LLVM-exception` is the LLVM exception variant offered
  alongside plain Apache-2.0/MIT by `linux-raw-sys`, `rustix`, `wasi`,
  `wasip2`, and `wit-bindgen`; only permissive alternatives are relied on.
- The list is kept to licenses actually encountered; allowed-but-unused
  entries are pruned (bitty#835 removed `CDLA-Permissive-2.0` and
  `Unicode-DFS-2016` for this reason).

MPL-2.0 exception (the rule-5 deviation):

- The only copyleft node in the shipped dependency graph is `dwrote` 0.11.5,
  used by `crossfont` for the Windows-only DirectWrite backend; it has no
  permissive alternative today. `deny.toml` scopes `MPL-2.0` per crate
  (`exceptions = [{ allow = ["MPL-2.0"], crate = "dwrote" }]`) instead of a
  blanket allowance, so the prohibition stays enforced everywhere else.
- Revisit trigger: remove the exception when `crossfont` drops `dwrote` or a
  permissive replacement exists. Any other copyleft node requires a new dated
  revision of this ADR, never an extension of this exception.

Advisory-ignore policy (mirrors the same CI job):

- `RUSTSEC-2026-0192` (`ttf-parser`, unmaintained, winit/Metal paths) and
  `RUSTSEC-2024-0436` (`paste`, unmaintained) are enumerated as ignores in
  both `deny.toml` (`[advisories].ignore`) and the `cargo audit --ignore`
  step until upstream replacements land, composing with rule 4. Note that
  `fontdb 0.24` (Issue [#1692](https://github.com/bitty-terminal/bitty/issues/1692), CTX-0993) vendors its query parser and drops the fontdb edge
  to `ttf-parser`; the ignore remains scoped to winit/sctk/ab_glyph paths.
  Scoping superseded on 2026-10-26: the [Direct font-parsing
  amendment](#direct-font-parsing-amendment-2026-10-26) records direct
  `bitty-render` edges, so the ignore is no longer limited to those paths.
- Ignore entries are visible enumerations, not standing waivers: they are
  re-checked as part of rule-4 maintenance and removed when a replacement
  lands.

Gate status: `cargo audit` remains the active advisory gate under rule 1
until `cargo vet` review capacity exists; `cargo deny` plus `cargo audit` is
the implemented supply-chain gate today.

### Vendored winit amendment (2026-10-26)

Rule 3's fork criteria stand as accepted; this dated amendment records their
application to a dependency source category the rule did not name — a crate
consumed from a path-vendored upstream tree in `vendor/` instead of a registry
or Git source. The vendoring landed as bitty#2726 (CTX-1605), squash-merged on
2026-10-26 as `aa18c61a` and closing bitty#2715, and the accepted text above is
preserved rather than rewritten.

1. **Missing capability.** `winit` 0.30.13 and 0.31.0-beta.4 never construct
   `WindowEvent::Occluded` on the Wayland backend: the Wayland configure path
   only compares `ACTIVATED | SUSPENDED` in its configure-state difference
   check (`src/platform_impl/linux/wayland/window/state.rs` in 0.30.13,
   `winit-wayland/src/window/state/configure.rs` in 0.31.0-beta.4), and the
   `suspended` bit is stored without being surfaced as an event. An application
   therefore cannot observe the xdg-shell v6 `suspended` state. The "frame
   callbacks stop while suspended" fallback is also false on Hyprland 0.56.2,
   where frame callbacks continue while the surface is suspended, so a pending
   redraw is not a dependable occlusion signal on that compositor.
2. **Upstream links.** Tracker
   [rust-windowing/winit#3442](https://github.com/rust-windowing/winit/issues/3442);
   implementation
   [#4709](https://github.com/rust-windowing/winit/pull/4709) (open;
   `CHANGES_REQUESTED` since 2026-09-23 on two grounds, "may not work on some
   compositors" and the objection that winit must never commit on behalf of the
   user; that review predates the current cut-down shape, which answers the
   second ground by requesting a redraw instead of committing); 0.30 backport
   [#4710](https://github.com/rust-windowing/winit/pull/4710) (open, unmerged,
   base `e9809ef5`, head `e2cb6c08`).
3. **Patch surface.** Carried by bitty#2726, squash-merged on 2026-10-26 as
   `aa18c61a`, and pinned to `winit 0.30.13`: 5 files changed, +65/−10 —
   `src/changelog/unreleased.md`, `src/event.rs`,
   `src/platform_impl/linux/wayland/event_loop/mod.rs`,
   `src/platform_impl/linux/wayland/state.rs`, and
   `src/platform_impl/linux/wayland/window/state.rs`. The vendored tree is the
   registry release with only those five files changed, and it enters the
   workspace through `[patch.crates-io]` as
   `winit = { path = "vendor/winit" }` with `exclude = ["vendor/winit"]` in the
   repository root `Cargo.toml`.
4. **Synchronization strategy.** Any `0.30.x` bump re-applies the recorded
   patch: a reverse-apply check against the previous tree plus a file-by-file
   tree diff against the registry source. `vendor/winit/PATCHES.md` stays the
   source of record with the fetch date (2026-10-26) and two pinned hashes —
   the patch SHA-256
   `467156b345e49449422a7ba968ff5a259c085e8f953b75b5daec7a7b4c6c220c` and the
   tree digest
   `c0c4343e576b91e6c1e88f7f1f2ba3c1d0cd9519533d0b554492385ee0510a47`.
   `just vendored-winit` enforces both together with the path resolution and
   the lock source/checksum, and Dependabot ignores `winit`, so no dependency
   bump can silently re-resolve the crate to the registry.
5. **Exit conditions.** Remove the vendor tree, the `[patch.crates-io]` entry,
   the `exclude` entry, the `just vendored-winit` gate, and the vendored-tree
   Markdown lint ignores once a released `winit` carrying #4709/#4710 is
   adopted; re-run the #2570 Hyprland capture and confirm the surface gate
   engages; retire the synthetic redraw starvation probe if it is then
   redundant.
6. **Named maintenance owner.** The Core platform owner (`bitty-core` commander
   jurisdiction) until a platform maintainer is assigned.
7. **Accepted risk and trade-off.** The upstream patch is unmerged: #4709 still
   carries `CHANGES_REQUESTED`, which predates the current cut-down shape, and
   the patch may not work on some compositors. A compositor advertising
   `xdg_wm_base` below version 6 never sends `suspended` and keeps the pre-patch
   behaviour, and the gate is fail-open, so a missed unsuspend only delays
   resuming presents. `exclude` keeps `cargo fmt` and clippy off upstream code,
   so the vendored crate is gated by compilation, by
   `cargo deny check licenses sources`, and by the recorded patch-fidelity
   check, not by workspace lints.

### Direct font-parsing amendment (2026-10-26)

Rule 1's audit and lock requirements and rule 4's maintenance clock stand as
accepted; this dated amendment records a direct font-parsing edge set that the
2026-09-16 advisory note and the rendering row anticipated as transitively
sourced only. The edges are carried by bitty CTX-1607 (persistent font index,
`crates/bitty-render/src/font_index.rs` and `crates/bitty-render/Cargo.toml`),
and the accepted text above is preserved rather than rewritten.

1. **Adopted edges.** `bitty-render` now depends directly on `ttf-parser`
   0.25.1 (`MIT OR Apache-2.0`) and `fontconfig-parser` 0.5.8 (`MIT`), pinned
   with exact requirements (`=0.25.1`, `=0.5.8`). Both versions were already
   resolved in the committed `Cargo.lock` as transitive dependencies —
   `ttf-parser` through `owned_ttf_parser`/`ab_glyph` on the
   winit/sctk-adwaita decoration path, `fontconfig-parser` through `fontdb`'s
   `fontconfig` feature — so each direct edge adds one node and resolves to the
   already-locked version; no new crate enters the graph.
2. **Why.** The persistent font index cold build runs on the startup hot path:
   it reads only the SFNT directory plus the `name`, `OS/2`, and `post` tables
   with bounded seeks, and it parses fontconfig directories and generic aliases
   to see the same directory list as `fontdb::Database::load_system_fonts`.
   Calling the parsers directly avoids loading whole fonts for metadata and
   avoids adding a metadata crate of Bitty's own; `fontdb` remains the
   authority for the full-scan fallback and the final face query.
3. **Advisory status.** `RUSTSEC-2026-0192` (`ttf-parser`, unmaintained, dated
   2026-06-28) now applies to a direct hot-path edge, not only a decoration
   path. It stays enumerated as an ignore in `deny.toml`
   (`[advisories].ignore`) and the `cargo audit --ignore` step under the
   existing 2027-03-31 bound, and rule 4's twelve-month clock runs against this
   edge from the advisory date. The review bound is therefore 2027-03-31, and
   replacement options must be evaluated before any renewal; an extension
   requires a new dated revision of this ADR.
4. **Superseded text.** Three accepted statements are historical: the rendering
   row's claim that `fontdb 0.24` "vendors its query-time parser and drops
   external `ttf-parser`", the advisory note's "vendors its query parser and
   drops the fontdb edge to `ttf-parser`" followed by "the ignore remains scoped
   to winit/sctk/ab_glyph paths", and the mirroring upstream comments
   (`deny.toml`'s "remaining node" note and `Cargo.toml`'s "ttf-parser remains
   only via the winit/sctk-adwaita/ab_glyph decoration path"). The
   fontdb-internal edge is still gone; the current edge set is the one recorded
   in this amendment, which includes the direct `bitty-render` edges.
5. **Maintenance owner.** The Core render owner (`bitty-core` role) until a
   render maintainer is assigned.
6. **Exit and review conditions.** Re-evaluate at 2027-03-31, or earlier when
   `fontdb` exposes metadata parsing and discovery without a full scan (which
   would let the direct edges go) or when `ttf-parser` is archived. If
   `ttf-parser` is archived, adopt `skrifa`/`read-fonts` — already in the graph
   through `swash`/`harfrust` — under a new dated revision of this ADR.
7. **Licenses.** `ttf-parser` is `MIT OR Apache-2.0` and `fontconfig-parser`
   is `MIT`; both are inside the canonical allowlist recorded in the
   [license policy amendment](#license-policy-amendment-2026-09-16), so no
   per-crate exception is needed.

### Decisions per candidate

| Candidate                                                           | Decision                                                                                                                                                                                                                        | License check                                                                                                                                                                                    | Rationale                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| VT parsing: `vte` vs `alacritty_terminal` vs `wezterm-term`         | **Adopt `vte`** (alacritty/vte, ~0.15.x) inside `bitty-vt` behind the crate's own API; reject `alacritty_terminal` and `wezterm-term` wholesale                                                                                 | Apache-2.0 — compatible                                                                                                                                                                          | Terminal state machines are Core semantics (strategy table: own directly). `vte` provides only a state-machine table + `Perform` trait, which maps exactly onto the parser→`TerminalAction` split in the Architecture Overview. `alacritty_terminal` and `wezterm-term` bundle grid/state/replay opinions that would contaminate Terminal Truth ownership and are hard to partially adopt. If `vte` proves insufficient, escalate to a narrow synchronizable fork of its tables only.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| PTY: `portable-pty`                                                 | **Wrap** (wezterm/wezterm `portable-pty`, ~0.9.x) behind `bitty-pty`; do not expose its types                                                                                                                                   | MIT — compatible                                                                                                                                                                                 | Cross-platform Unix/ConPTY handling is domain infrastructure where upstream reuse beats reimplementation, but process lifecycle, backpressure, and security limits are Bitty-owned invariants, hence wrapper not raw adoption. Fallback if unmaintained: extract to owned fork under rule 3.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Windowing/input: `winit`, `crossterm`                               | **Adopt `winit`** (~0.30.x) inside `bitty-platform`; **do not adopt `crossterm`** as a runtime input path                                                                                                                       | Apache-2.0 — both compatible                                                                                                                                                                     | `winit` is the maintained cross-platform window/event-loop baseline matching GPU rendering. `crossterm`'s alternate-screen model conflicts with owning a full renderer and terminal emulation; it may be used in dev tooling/tests only, never in shipped binaries.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Rendering/fonts: `wgpu` vs `skia-safe` vs `crossfont` vs `harfrust` | **Adopt `wgpu`** (~26.x line) in `bitty-render`; **wrap `crossfont`** for default rasterization behind the glyph cache; **wrap `harfrust` + `swash` + `fontdb`** for complex text shaping and ligatures; **reject `skia-safe`** | wgpu Apache-2.0/MIT dual; skia-safe MIT but binds Skia; crossfont Apache-2.0/MIT; harfrust Apache-2.0/MIT; swash Apache-2.0/MIT; fontdb MIT — all license-compatible; rejection is architectural | `wgpu` gives Vulkan/Metal/DX12/GL abstraction without a C++ monolith; Skia adds a large C++ supply chain and text-stack opinions Bitty does not need. `crossfont` stays wrapped as the production default rasterizer. Pure-Rust HarfBuzz text shaping stack (`harfrust` 0.14 + `swash` 0.2 + `fontdb` 0.24) is adopted behind `bitty-render::shaped` under Issue [#1666](https://github.com/bitty-terminal/bitty/issues/1666) / CTX-0952, closing OQ-073 per the accepted [Ligature Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/ligature-decision.md); `fontdb 0.24` (#1692, CTX-0993) vendors its query-time parser and drops external `ttf-parser`. Superseded on 2026-10-26 by the [Direct font-parsing amendment](#direct-font-parsing-amendment-2026-10-26): the fontdb-internal edge is still gone, but `bitty-render` now also holds direct `ttf-parser` and `fontconfig-parser` edges. |
| Lua: `mlua` vs `piccolo`                                            | **Wrap `mlua`** (LuaJIT disabled; stock Lua 5.4 backend initially) inside `bitty-plugin-host`; **track `piccolo`** (~0.3.x) as a watch-list candidate                                                                           | mlua MIT — compatible; piccolo MIT — compatible                                                                                                                                                  | Config and plugin VMs need mature bindings plus sandboxing primitives now; `piccolo`'s pure-Rust stackless VM is attractive for memory accounting/gc-arena isolation but still experimental, so it cannot be the P0 runtime. Re-evaluate piccolo at the plugin-isolation RFC (OQ-014); migration cost is contained because Lua enters only behind the host wrapper. Refined 2026-09-20: the plugin-VM successor path is now Phodopus, a sandbox-first fork of `piccolo`, per [ADR 0012](ADR-0012-phodopus-runtime.md); the accepted `mlua` wrap decision above is unchanged.                                                                                                                                                                                                                                                                                                                                                                |

All versions above were verified against crates.io/GitHub at authoring time;
the implementing task re-verifies and pins exact versions.

## Consequences

- Hot-path semantics stay Bitty-owned; third-party code concentrates in
  `bitty-vt` internals, `bitty-platform`, `bitty-render`, and wrapper layers,
  keeping the replaceability goal of the technology strategy.
- Supply-chain surface is bounded to a short allowlist; anything outside these
  rows needs its own ADR revision.
- The 2026-09-16 amendment binds the ADR to the shipped gate: `deny.toml` is
  the implementation source of truth, the amendment enumerates the canonical
  allowlist, the single per-crate `MPL-2.0` exception, and the ignored
  informational advisories. Any new license or ignore requires a dated
  revision of this ADR rather than a silent allowlist edit.
- `skia-safe` and `crossterm` rejections can be revisited cheaply since neither
  enters any crate today.
- The `mlua` choice creates a future migration consideration toward `piccolo`
  or WASM-based isolation; this risk is recorded rather than resolved here. As
  refined on 2026-09-20, the `piccolo` successor direction is
  [ADR 0012](ADR-0012-phodopus-runtime.md) (Phodopus); WASM-based isolation
  remains an alternative.

## Open questions

- Shaping/font fallback stack details follow the text RFC (see OQ-007 scope).
- `piccolo` adoption timing is decided with OQ-014 isolation mechanisms.
  Refined on 2026-09-20: the successor runtime direction is
  [ADR 0012](ADR-0012-phodopus-runtime.md), with `bitty-lua` migration deferred
  until Phodopus is usable.
