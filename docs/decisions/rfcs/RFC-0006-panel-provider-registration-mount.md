---
title: Panel Provider Registration Mount RFC
description: Accepted docs-only contract for the plugin-facing PanelProvider registration mount placement and panel capability mapping reusing the accepted Panel Runtime container
category: decisions
audience: contributor
document_type: specification
status: accepted
website_publish: false
sidebar_order: 50
---

# Panel Provider Registration Mount RFC

> Status: **accepted** on 2026-10-07 (panel-provider acceptance;
> [issue #443](https://github.com/bitty-terminal/bitty-docs/issues/443)).
> This document decides the plugin-facing registration/mount contract that the
> accepted [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md)
> left open as `RFC-OQ-2`, `RFC-OQ-3`, and `RFC-OQ-5`: `PanelProvider`
> registration entry point, Panel-to-View placement, and `panel.*` capability
> mapping. It is an accepted contract: it mints no capability identifier,
> mints no trait spelling, mints no Lua entry point, authorizes no shipped
> behavior, and makes no compatibility promise. [OQ-058](../open-questions.md)
> gains the plugin-facing citation below and stays otherwise unchanged.
> Acceptance rests on review recorded under Acceptance evidence. No
> implementation claim.

## Problem

The generic Panel Runtime container and Event Bus contract is accepted, but
the plugin-facing registration/mount contract has no decided text. The
accepted Panel Runtime RFC keeps three items open: the exact `PanelProvider`
trait spelling and error taxonomy beyond the illustrative sketch (`RFC-OQ-2`),
whether Panel becomes typed `View` content or composes beside `View` with the
`ViewId` versus `PanelId` migration this implies (`RFC-OQ-3`), and the
capability mapping for each panel type, especially `panel.overlay` and any new
`panel.*` family versus reuse of `ui.*` (`RFC-OQ-5`).

Two first-party consumers wait headlessly on this gate. The independent
`file-manager` package implements listing, navigation, and preview with no
panel surface, and the independent `git-panel` package implements the
listing and allowlist policy with no panel surface, each recording panel
presentation as deferred pending the panel-provider contract. The
[Bundled-Plugin Split Decision](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/product/bundled-plugin-split-decision.md)
records the same gate as its Panel Runtime public provider contract row: the
remaining gate is the plugin-facing registration/mount contract only, tracked
by `bitty-docs` `CTX-0181` (ready) and OQ-058. The
[Plugin Matrix](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/product/plugin-matrix.md)
records every `panel.*` entry below its deferred-candidate note as pending the
same contract (`bitty-docs` `CTX-0181`, OQ-058).

The Core-internal `PanelRegistry::mount_panel` path
(`bitty` `crates/bitty-runtime/src/registry/panel.rs`) is not an
independent-plugin presentation surface, and Plugin API v1 defines no
`register_panel` entry point. A decision that invents a new trait spelling, a
new capability identifier, or a new Lua registration call would widen the
public contract without review. The decision must therefore fix the
registration entry point, the placement rule, and the capability mapping using
only accepted identifiers, and park exact spellings to their owners.

## Goals

- Give the plugin-facing registration/mount contract a documented home in
  shared governance (`bitty-docs`), naming the registration entry point, the
  placement rule, and the capability mapping.
- Decide `RFC-OQ-2` without minting a trait spelling: fix the
  manifest-declared `PanelType` plus `panel.provider` grant plus Core-owned
  admission shape, the generation lifecycle, and the bound enforcement, and
  park the exact `PanelProvider` trait spelling and error taxonomy to the
  Core implementation owner.
- Decide `RFC-OQ-3` without migration churn: adopt the refined Option C
  identity semantics with the Option A encoding transitionally, fix the
  plugin-facing mount path as distinct from the Core-internal
  `PanelRegistry::mount_panel` code path, and fix focus and input routing as
  unchanged.
- Decide `RFC-OQ-5` without minting an identifier: fix the closed `panel.*`
  family mapping (`panel.provider`, `panel.create`, `panel.focus`,
  `panel.overlay`) and its boundary against `layout.provider`,
  `browser.embed`, `ui.rich`, and `ui.overlay`, reusing the accepted
  topic-declared bus rule and per-principal scope separation.
- Reuse only accepted identifiers, bounds, and lifecycles; every value that
  stays parked names its owner.
- Name the blocked consumers and the unblocking chain explicitly, so the Core
  host bridge, the SDK spellings, and consumer parity each have a named
  predecessor instead of an implied one.
- Define the acceptance path: what review and register synchronization must
  exist before this draft becomes an accepted contract.

## Non-goals

- No capability identifier is minted by this document; the closed `panel.*`
  family (`panel.provider`, `panel.create`, `panel.focus`, `panel.overlay`)
  is reused unchanged, and adding a member requires its own acceptance plus
  the Core host integration that enforces it.
- No `PanelProvider` trait spelling, method signature, argument order, or
  error enum is fixed here; illustrative shapes in the accepted Panel Runtime
  RFC remain illustrative-only, and spellings belong to the Core
  implementation work that follows acceptance.
- No Lua registration entry point is minted here; Plugin API v1 defines no
  `register_panel` entry point, and this RFC adds none. Manifest declaration
  plus capability grant plus host-mediated creation is the entry point fixed
  here; SDK spellings belong to follow-up work.
- No `ViewId` migration is performed here; adopting the placement rule
  changes no existing `ViewId` allocation, retirement, or generation rule.
- No new numeric ceiling is invented here; the accepted `PR-1` through
  `PR-12` bounds and the accepted three-level queue envelope (`PerSub 64`,
  `PerPlugin 1024` events and `256 KiB`, Global `8192` events and `2 MiB`,
  `BoundedText 8 KiB`, `drain_batch 32` events and `8 KiB`) are reused
  unchanged.
- No open question besides `RFC-OQ-2`, `RFC-OQ-3`, and `RFC-OQ-5` is closed;
  `RFC-OQ-1`, `RFC-OQ-4`, `RFC-OQ-6`, `RFC-OQ-7`, `RFC-OQ-8`, and `RFC-OQ-9`
  stay open with their owners.
- No shipped, stable, normative, or compatibility-guaranteed behavior is
  claimed for any registration, placement, focus, grant, or denial shape.

## Normative sources this proposal must not weaken

This proposal must be read together with, and must not weaken:

- The [security overview](../../security/overview.md),
  the [threat model](../../security/threat-model.md),
  the [risk register](../../security/risk-register.md),
  and the [P0 acceptance criteria](../../security/p0-acceptance-criteria.md).
  The controls that bind this surface include plugin capability checking with
  least privilege (`P0-AC-012`), per-plugin VM isolation and failure
  containment (`P0-AC-013`), resource budgets with attribution (`P0-AC-014`),
  hot-path exclusion (`P0-AC-015`), Terminal Truth ownership (`P0-AC-016`),
  read-only default with untrusted labeling (`P0-AC-024`), trace
  minimization and redaction with user-only files (`P0-AC-026`),
  capability-increase update blocking (`P0-AC-030`), and trust-level admission
  before grant intersection (`P0-AC-035`).
- The accepted [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md)
  (generic container and Event Bus, `PanelId` as fourth incompatible newtype,
  `Declared -> Created -> Mounted -> Focused -> Suspended -> Disposed`
  lifecycle, `(PanelId, Generation)` addressing with `StaleHandle` rejection,
  focus routing, `4+1` overlay envelope, `PR-1` through `PR-12` bounds,
  `DropOldest` default with `DropNewest` alternative, closed `panel.*`
  family in the Core capability seed). The lifecycle state names and bound
  values are reused verbatim; no bound is retuned here.
- The draft [Panel Placement Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-placement-decision.md)
  (candidate refined Option C direction with Option A encoding
  transitionally, identity and naming consequences, focus routing
  consequences, persistence consequences). This RFC adopts its recorded
  direction as the decided placement; the candidate document itself stays
  draft and changes no accepted text on its own.
- The accepted [Workspace Compositor Specification](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/workspace-compositor.md)
  (`Instance -> Window -> Workspace -> LayoutTree -> View` hierarchy, `H` and
  `V` primitives with `ratio [0.1, 0.9]`, Core-owned decoration, pure
  deterministic `LayoutProvider::propose`).
- The accepted [TerminalRegistry and View Lifecycle Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/terminal-registry-view-lifecycle-rfc.md)
  (`TerminalId != ViewId`, attachment and detachment semantics, `move_terminal`
  atomicity).
- The accepted [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md)
  (one VM per `(PluginId, generation)`, deny-by-default capabilities,
  observation versus interception, `DropOldest` default) and the accepted
  [Isolation Resource RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/isolation-resource-rfc.md)
  (isolation domains, `RC-1` through `RC-10`, failure semantics, three-level
  queue `PerSub 64` and `PerPlugin 1024` events with `256 KiB` and Global
  `8192` events with `2 MiB` hard-gated at Host admission).
- The accepted [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md):
  v1 is frozen; this surface adds no v1 member and widens none.
- The accepted [Bundled-Plugin Split Decision](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/product/bundled-plugin-split-decision.md)
  (OQ-053 migration set, Panel Runtime public provider contract row as the
  remaining gate, `file-manager` and `git-panel` split rows with panel
  presentation deferred) and the draft [Plugin Matrix](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/product/plugin-matrix.md)
  (every `panel.*` entry as deferred candidate pending `CTX-0181`, OQ-058).
  This RFC decides the contract gate; distribution, catalog, and presentation
  parity stay with their owners.

Where a control or threshold appears to need change, it is recorded under
"Unresolved questions" instead.

## Terminology

- **Core**: the always-available terminal mechanism that works with zero
  plugins and in `bitty --safe`; it owns panel lifecycle, the capability
  gate, layout and decoration, focus routing, and resource budgets.
- **Panel**: the workspace-managed application container with a stable
  `PanelId`, per the accepted Panel Runtime RFC; the user- and
  plugin-visible application identity.
- **View**: the `LayoutTree` leaf and internal compositor attachment point
  with a stable `ViewId`; never conflated with `TerminalId` or `PanelId`,
  and hidden from end users and from plugin Lua APIs under the decided
  placement.
- **PanelProvider**: the plugin-supplied factory that declares one or more
  `PanelType` values; requires the `panel.provider` capability. The name is
  the accepted contract term; the exact trait spelling stays parked.
- **PanelType**: a closed `v1` set member contributed by a `PanelProvider`
  (for example `terminal`, `rich`, `browser`, `helper`, `canvas`), validated
  via manifest. No member is added here.
- **Attachment**: the compositor-internal binding between a panel identity
  and a concrete layout slot; moving an identity re-parents the attachment,
  never the identity.
- **Explicit grant**: a per-plugin capability grant recorded by the Core
  gate, carrying explicit scope with no wildcard default; absence of a grant,
  or an operation outside the grant scope, denies fail-closed.
- **Typed denial**: a catchable, machine-readable denial naming its reason
  from the complete taxonomy without leaking out-of-scope identifiers,
  content bytes, or retention-existence signals.
- **Candidate**: a proposal that is not decided; candidate status is not
  acceptance and is not implementation.

## Proposed contract

The plugin-facing contract is the accepted Panel Runtime container with a
Core-owned registration admission, a decided placement, and a fixed
capability mapping. Its invariant, in one sentence: **a granted plugin may
declare panel types that Core admits, mounts onto views, focuses, and
suspends under generation fencing and bounded budgets, or receive a typed
denial; it may never self-mount a view, invent a capability family, hold a
PTY descriptor, place a callback on the input hot path, or turn visibility
into authority.**

### RFC-OQ-2 decided: PanelProvider registration entry point

- The registration entry point is the triple of manifest declaration plus
  capability grant plus Core-owned admission. A plugin declares each
  `PanelType` it contributes in its manifest; the declaration is valid only
  with the `panel.provider` grant recorded by the Core gate; Core admits the
  declaration at the `PanelRuntime` creation path (contract name
  `PanelRuntime`; current orchestration is `PanelRegistry` in
  `crates/bitty-runtime/src/registry/panel.rs` with `create_panel`,
  `mount_panel`, `focus_panel`, `suspend_panel`, `resume_panel`, and
  `dispose_panel`) under manifest validation and bound checks. A `PanelType`
  contributed without the matching `panel.*` grant fails at registration.
- No new Lua registration call is minted here. Plugin API v1 defines no
  `register_panel` entry point, and this RFC adds none; SDK spellings for
  any future Lua surface belong to follow-up work owned by the Core bridge
  and SDK, and must compose with the frozen v1 surface without widening it.
- No `PanelProvider` trait spelling is fixed here. The exact trait shape and
  the error taxonomy beyond the illustrative sketch stay parked to the Core
  implementation owner; illustrative shapes in the accepted Panel Runtime RFC
  (including `PanelId`, `ViewId`, `TerminalId`, `Generation`, and
  `EventTopic` sketches) remain illustrative-only and authorize no code
  shape.
- Lifecycle follows the accepted generation rule: one logical provider
  binding per `(PluginId, generation)`; handles travel as `(id, generation)`
  pairs on every cross-component call; a call with a stale generation is
  rejected with `StaleHandle` before any state access; teardown of generation
  `N` precedes activation of generation `N + 1` per the accepted reload
  mechanics. Queued generation-`N` events at disposal follow the accepted
  `DropOldest` default with per-queue counting and attribution.
- Bound enforcement reuses the accepted ceilings with no new value: panels
  per workspace (`PR-1`), panels per window (`PR-2`), distinct topics per
  process (`PR-3`), subscriptions per panel or plugin (`PR-4`), event payload
  (`PR-5`), batch per wakeup (`PR-6`), per-subscription queue (`PR-7`),
  per-panel or per-plugin queue (`PR-8`), global bus queue (`PR-9`), overlay
  count per window (`PR-10`), overlay text and tooltip (`PR-11`), and command
  contributions per panel type (`PR-12`), each validated at its accepted
  validation point with its accepted failure shape.
- Official and bundled panels pass through the identical registration path;
  no private channel and no first-party bypass exists.

### RFC-OQ-3 decided: Panel-to-View placement

- Placement adopts the recorded refined Option C identity semantics with the
  Option A encoding transitionally. Panel is the application and session
  identity (`PanelId` survives a move across workspaces, a presentation-mode
  change, and a tab reorder); `View` remains the internal attachment point
  (`ViewId` stays the `LayoutTree` leaf with its allocation, retirement, and
  generation rules unchanged, hidden from end users and from plugin Lua
  APIs); the binding is explicit and directional (a panel mounts onto a
  view, at most one-to-one in the accepted sense of a `PanelId` binding to
  an empty `ViewId`, with moves re-parenting the binding while preserving
  both identities); `ViewContent::Panel(PanelId)` is retained as the
  transitional encoding of the same binding; no `ViewId` migration churn is
  performed and no function accepts a `PanelId` where a `ViewId` is expected
  or the reverse.
- The plugin-facing mount path is host-mediated placement distinct from the
  Core-internal `PanelRegistry::mount_panel` code path. The Core-internal
  path is not an independent-plugin presentation surface; a plugin never
  calls it directly, and visibility through it grants nothing.
- Focus and input routing are unchanged in shape: `Platform -> Router ->
focused View or Panel -> keymap and overlay -> encoder -> PTY` for
  terminal-backed panels, with exactly zero or one focused target per active
  workspace and MRU re-homing on detach or destroy. The visible focus target
  is a `PanelId`; the internal hit-testing rectangle remains a `View`
  rectangle. A focus change still forces a full present and never mutates a
  terminal grid. `InputTarget::Panel` remains the routed target when a panel
  is focused, with the accepted `route_input` precedence (panel wins over
  view) retained. No plugin callback sits on the input hot path, and overlay
  capture stays presentation-only.
- Persistence follows the accepted rehydration rule: workspace save and
  restore persists the visible identity (panel) and its attachment; a
  restored panel receives a fresh attachment and, for a terminal-backed
  panel, a fresh `TerminalId` under the same persistence identity, without
  depending on `ViewId` numeric reuse. A `View` may outlive the panel
  mounted on it and may host a different panel afterwards; a panel without
  an attachment is suspended, not destroyed.
- Placement changes no capability, budget, or trust boundary. A panel still
  holds no PTY descriptor, GPU object, or native window handle; the binding
  map is Core-owned presentation state. Panel visibility never becomes
  authority: a visible panel gains no capability a suspended one lacks, and
  moving a panel across workspaces grants nothing.

### RFC-OQ-5 decided: panel capability mapping

- The mapping reuses the closed `panel.*` family in the Core capability
  seed: `panel.provider`, `panel.create`, `panel.focus`, and
  `panel.overlay`. Plugins cannot invent families; a `PanelType` contributed
  without the matching `panel.*` grant fails at registration. This RFC mints
  no member and changes no grammar.
- `panel.*` does not subsume adjacent gates and grants none implicitly:
  `LayoutProvider` retains `layout.provider`, `Browser` retains
  `browser.embed`, `Rich` retains `ui.rich`, and `ui.overlay` gates
  palette and modal surfaces. In particular, `panel.overlay` is the
  panel-family member for panel-owned overlay use, while `ui.overlay`
  remains the distinct gate for palette and modal surfaces; neither implies
  the other.
- Bus topics reuse the accepted topic-declared capability rule: emitting on
  a topic requires the emitter manifest to declare that topic as produced
  and the subscriber manifest to declare it as consumed, with undeclared
  produce or consume denied as `UndisclosedTopic`. High-value topics (for
  example terminal raw-read, clipboard read, or process-spawn-adjacent
  signals) inherit the same high-risk consent surface as their capability
  family; a bus topic that carries raw PTY bytes or clipboard content is
  flagged high-risk and is never granted implicitly. Capability checks are
  synchronous and transactional with no partial state on denial.
- Bus access is scope-separated per client principal: the pair
  `(PluginId, generation)` or `(PanelId, generation)` has its own ledger,
  and a scope granted to one principal never augments another. The `v1`
  scope is single-process and single-window only; a bus topic never escapes
  a `Window` without an explicit cross-window or cross-process transport
  decision.
- Per-panel resource dimensions are owned by `(PanelId, generation)` with
  attribution and observable accounting; per-plugin dimensions remain
  `(PluginId, generation)` per the accepted isolation contract. A plugin
  update that newly requests any `panel.*` member is a capability increase
  and blocks pending the explicit permission-diff approval gate
  (`P0-AC-030`).

### Blocked consumers and unblocking chain

- `file-manager` (independent package `bitty-terminal.file-manager`,
  observation-only `terminal.semantic-read` today) and `git-panel`
  (independent package `bitty-terminal.git-panel`, carrying `panel.provider`,
  `panel.create`, `process.spawn:git`, `terminal.semantic-read`, and
  `fs.read` scope today) implement headlessly with no panel surface until
  the host bridge, SDK spellings, and consumer parity land. This RFC decides
  the contract gate only; presentation parity stays with the owning
  repositories and is not claimed here.
- The unblocking chain after this acceptance is: Core host bridge lands the
  enforcement (registration admission, placement binding, focus routing,
  bound enforcement, typed denials) under its own task with host parity
  tests; SDK work mints the accepted spellings with the mock host and
  conformance suite against this contract; `file-manager` and `git-panel`
  build to parity on the SDK surface. Only host parity evidence in the
  owning repositories authorizes presentation; this RFC authorizes none.
- The [Bundled-Plugin Split Decision](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/product/bundled-plugin-split-decision.md)
  Panel Runtime public provider contract row and the
  [Plugin Matrix](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/product/plugin-matrix.md)
  deferred-candidate note keep their owning-repo rows deferred until that
  parity exists; this RFC gives those rows the accepted contract to cite,
  and mints no distribution or catalog change.

## Alternatives considered

- **Mint the exact `PanelProvider` trait spelling and error taxonomy here.**
  Rejected: fixing Rust signatures and error enums in shared governance
  without the Core implementation owner invents an API the host has not
  reviewed for generation fencing, bound enforcement, and hot-path
  exclusion. The registration triple plus parked spellings keeps the
  contract reviewable without widening the public surface.
- **Mint a new Lua `register_panel` entry point here.**
  Rejected: Plugin API v1 defines no `register_panel` entry point, and v1
  is frozen. A new Lua call would widen v1 without SDK, host, and security
  review; manifest declaration plus grant plus host-mediated creation is the
  entry point that needs no new spelling.
- **Record Option A alone and leave identity semantics alone.**
  Rejected as insufficient: it keeps Panel subordinate to `View` in the type
  system and leaves the visible-identity question open, which is the gap the
  waiting workstreams are blocked on.
- **Record full Option C including the encoding change.**
  Deferred to a successor RFC: the cleanest end state re-expresses the
  binding as a side-car map, but the encoding change touches every current
  `ViewContent::Panel(PanelId)` call site and is not required to unblock
  the contract gate.
- **Record Option B (Panel replaces `View` as the leaf).**
  Rejected, consistent with the accepted Panel Runtime RFC alternative
  table: it breaks `ViewId` generation history and forces `View` churn
  without buying typing the side-car binding does not already give.
- **Mint a new `panel.*` member or widen `ui.*` to cover panels.**
  Rejected: the closed family plus the adjacent gates already cover
  registration, creation, focus, overlay, layout, browser, and rich use;
  a new member or a widened `ui.*` member would inherit grant expectations
  never reviewed for panel lifecycle authority.
- **Leave placement undecided and unblock via content-path work only.**
  Rejected: the content path is about non-terminal rendering, not identity;
  it leaves tab identity, persistence, and focus targeting ambiguous.

## Security and compatibility impact

- Threat-model touchpoints: plugin escape through self-mounted views (denied
  by the host-mediated placement rule and the Core-owned binding map);
  capability escape through invented families or implied grants (denied by
  the closed-family rule and the no-implicit-grant boundary against
  `layout.provider`, `browser.embed`, `ui.rich`, and `ui.overlay`); stale
  generation use across reload (rejected with `StaleHandle` before state
  access); queue and topic exhaustion (reused `PR-1` through `PR-12` bounds
  with per-principal attribution and `DropOldest` counting); input-hot-path
  capture (no plugin callback on the hot path; overlay capture stays
  presentation-only); PTY, GPU, or window-handle reachability (a panel holds
  none); and visibility-as-authority confusion (visibility grants nothing).
- P0 gates exercised: `P0-AC-012` (every registration, mount, focus, and bus
  operation capability-checked), `P0-AC-013` (faults contained to the
  calling plugin VM), `P0-AC-014` (panels, topics, payloads, batches, queues,
  overlays, and command contributions bounded with per-principal
  attribution), `P0-AC-015` (no plugin callback on the input, parse, or
  render hot path), `P0-AC-016` (presentation never Terminal Truth),
  `P0-AC-024` (bus and panel content treated as untrusted observation),
  `P0-AC-030` (new `panel.*` requests block updates pending diff approval),
  and `P0-AC-035` (trust-level admission before grant intersection).
- Compatibility: docs-only acceptance with no versioned surface change. No
  identifier is minted, no v1 member is altered, aliased, or shadowed, and
  no `ViewId` allocation or generation rule changes, so no compatibility
  promise is made and none is needed. Any future trait spelling, Lua
  spelling, or new `panel.*` member is capability-registry stable from its
  own acceptance, and that acceptance review must treat the choice as a
  compatibility decision, not as a spelling detail.

## Rollout and adoption

1. Review this acceptance in `bitty-docs` (this task PR; Refs issue #443, no
   `Closes` until independent review accepts the contract gate).
2. Synchronize the registers in the same change: the OQ-058 row cites this
   acceptance with the `RFC-OQ-2`, `RFC-OQ-3`, and `RFC-OQ-5` decisions and
   the headless-consumer follow-ups; the new `RFC-OQ-2` and `RFC-OQ-5` rows
   record their decisions; the `RFC-OQ-3` row records the refined placement;
   the decision register cites this RFC beside the split-decision reference.
3. Keep owning-repo rows deferred with named owners: the split-decision gap
   table, the `file-manager` and `git-panel` deferred-presentation rows, and
   the plugin-matrix deferred-candidate note stay deferred in
   `bitty-plugins-docs` and `bitty-terminal-docs` until the host bridge, SDK
   spellings, and consumer parity land there; those repositories cite this
   acceptance as their contract predecessor in their own scoped changes, and
   no submodule pointer moves as a side effect of this change.
4. On Core host-bridge follow-through, the implementation lands the
   enforcement (registration admission, placement binding, focus routing,
   bound enforcement, typed denials) under its own task with host parity
   tests.
5. SDK work mints the accepted spellings with the mock host and conformance
   suite against this contract.
6. `file-manager` and `git-panel` build to parity on the SDK surface.
7. Only after host parity evidence exists does any follow-up flip consumer
   rows from deferred to parity; acceptance itself still authorizes no
   implementation beyond the reviewed contract.

## Unresolved questions

- What are the exact `PanelProvider` trait method signatures, argument
  orders, and return shapes beyond the illustrative sketch (parked to the
  Core implementation owner; illustrative shapes stay illustrative-only)?
- What is the exact error taxonomy and wire shape for registration, mount,
  focus, suspend, resume, and dispose denials beyond the accepted
  `StaleHandle`, `UndisclosedTopic`, `TooManyPanels`, `TooManyTopics`,
  `TooManySubscriptions`, `PayloadTooLarge`, `OverlayBusy`, and
  `TooManyOverlays` failure names reused here (parked to the Core bridge and
  SDK work; the taxonomy rule and the no-leak constraint are fixed here)?
- What are the exact Lua spellings, if any, for provider declaration and
  panel lifecycle observation (parked to the SDK work under the capability
  model; no `register_panel` spelling is minted here and v1 stays frozen)?
- What are the exact per-call payload caps, listing-adjacent panel content
  caps, operation rates, and aggregate byte budgets for panel event traffic,
  and how do they compose with the reused `PR-1` through `PR-12` and
  three-level queue ceilings (parked to the Core bridge and SDK work; no new
  ceiling invented here)?
- Does the side-car binding map ever replace the transitional
  `ViewContent::Panel(PanelId)` encoding, and which successor RFC owns that
  migration (parked to the Workspace Scene and Panel and Activity successor
  work; the transitional encoding is the decided contract until then)?
- Which threat-model matrix cells (every level x `panel`-family admission
  cell) and which `P0-AC-035` update cover this family, if the matrix needs
  a panel-specific amendment beyond the reused admission rule (parked to the
  security review; disposition required before any follow-up claims a new
  matrix requirement)?
- Do `file-manager` and `git-panel` keep their current capability sets
  through parity, or does parity narrow or widen them through the
  permission-diff gate (owned by the consumer repositories; this RFC assumes
  no change and grants none)?

## Acceptance evidence

This RFC is accepted when all of the following are linked here: independent
reviewer APPROVE on the registration triple, the placement rule with the
Core-internal path distinction, the capability mapping with the
`panel.overlay` and `ui.overlay` boundary, the bound reuse, and the denial
taxonomy; security-reviewer sign-off covering the threat-model touchpoints,
the P0 gates (`P0-AC-012`, `P0-AC-013`, `P0-AC-014`, `P0-AC-015`,
`P0-AC-016`, `P0-AC-024`, `P0-AC-030`, and `P0-AC-035` named in scope), the
closed-family and no-new-spelling guarantees, and the visibility-never-authority
rule; docs-curator APPROVE on taxonomy, links, and register synchronization;
and a disposition (accepted shape or parked owner) for each unresolved
question. Acceptance still authorizes no implementation: it records the
reviewed contract, not shipped behavior. Host parity tests belong to the Core
implementation task that follows acceptance, and must not be claimed as
evidence inside this RFC.

Accepted 2026-10-07 (panel-provider acceptance,
[issue #443](https://github.com/bitty-terminal/bitty-docs/issues/443)):
register synchronization in the same change (OQ-058 plus `RFC-OQ-2`,
`RFC-OQ-3`, and `RFC-OQ-5` rows plus decision-register citation); owning-repo
consumer rows stay deferred with named owners (`bitty-plugins-docs`
split-decision gap table and `file-manager` and `git-panel`
deferred-presentation rows, `bitty-terminal-docs` plugin-matrix
deferred-candidate note) citing this acceptance as their contract
predecessor; no submodule pointer moves in this change.

## References

- [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md)
  (accepted): the generic container and Event Bus contract, the
  `RFC-OQ-2` through `RFC-OQ-9` open questions, the `panel.*` closed family,
  and the `PR-1` through `PR-12` bounds reused here.
- [Panel Placement Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-placement-decision.md)
  (draft candidate): the refined Option C direction with Option A encoding
  transitionally, adopted here as the decided placement.
- [Bundled-Plugin Split Decision](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/product/bundled-plugin-split-decision.md)
  (accepted): the Panel Runtime public provider contract row as the
  remaining gate, and the `file-manager` and `git-panel` split rows with
  panel presentation deferred.
- [File-manager README](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/docs/plugins/file-manager/README.md)
  (draft): the observation-only package with panel presentation deferred
  pending the panel-provider contract.
- [Git-panel README](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/docs/plugins/git-panel/README.md)
  (draft): the allowlisted CLI package with panel presentation deferred
  pending the panel-provider contract.
- [Plugin Matrix](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/product/plugin-matrix.md)
  (draft): every `panel.*` entry as deferred candidate pending `CTX-0181`,
  OQ-058.
- [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md)
  (accepted): one VM per `(PluginId, generation)`, deny-by-default
  capabilities, and the `DropOldest` default reused here.
- [Isolation Resource RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/isolation-resource-rfc.md)
  (accepted): the three-level queue envelope and `RC-1` through `RC-10`
  bounds reused here.
- [OQ-058](../open-questions.md) (accepted with plugin-facing citation):
  the spatial multi-agent orchestration register this acceptance extends.
- [Issue #443](https://github.com/bitty-terminal/bitty-docs/issues/443)
  (this RFC task issue).
