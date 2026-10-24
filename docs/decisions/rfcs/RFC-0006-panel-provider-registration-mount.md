---
title: Panel Provider Registration Mount RFC
description: Bounded candidate for the plugin-facing PanelProvider registration mount placement and panel capability mapping reusing the accepted Panel Runtime container
category: decisions
audience: contributor
document_type: specification
status: draft
website_publish: false
sidebar_order: 50
---

# Panel Provider Registration Mount RFC

> Status: **bounded candidate** (2026-10-24 review of issue #443;
> [issue #443](https://github.com/bitty-terminal/bitty-docs/issues/443)).
> This document records a bounded candidate for the plugin-facing registration/mount contract that the
> accepted [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md)
> left open as `RFC-OQ-2`, `RFC-OQ-3`, and `RFC-OQ-5`: `PanelProvider`
> registration entry point, Panel-to-View placement, and `panel.*` capability
> mapping. It is not an accepted plugin-facing contract: it mints no capability
> identifier, mints no trait spelling, mints no Lua entry point, authorizes no
> shipped behavior, and makes no compatibility promise. The generic container
> and Event Bus guarantees remain governed by the accepted Panel Runtime RFC.
> Acceptance of the plugin-facing gate is deferred until the follow-up below
> explicitly narrows the remaining boundaries. No implementation claim.

## Document status

This is a **draft bounded candidate**, reviewed on 2026-10-24 for issue #443.
It is not an accepted plugin-facing contract, does not authorize implementation,
and makes no compatibility promise. The accepted generic Panel Runtime
container and Event Bus remain authoritative; the plugin-facing registration,
placement, and capability questions remain open under `RFC-OQ-2`, `RFC-OQ-3`,
and `RFC-OQ-5`. Follow-up issue #464 owns the remaining boundaries.

## Purpose and scope

The generic Panel Runtime container and Event Bus contract is accepted, but
the plugin-facing registration/mount contract is not yet sufficiently bounded
for acceptance. The
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
records the same gate as its Panel Runtime public provider contract row. The
generic container and Event Bus are accepted, but the plugin-facing
registration/mount candidate remains deferred under OQ-058 and this issue. The
[Plugin Matrix](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/product/plugin-matrix.md)
records every `panel.*` entry below its deferred-candidate note as pending the
same candidate (`bitty-docs` issue #443, follow-up issue #464, OQ-058).

The Core-internal `PanelRegistry::mount_panel` path
(`bitty` `crates/bitty-runtime/src/registry/panel.rs`) is not an
independent-plugin presentation surface, and Plugin API v1 defines no
`register_panel` entry point. A decision that invents a new trait spelling, a
new capability identifier, or a new Lua registration call would widen the
public contract without review. The candidate therefore records a bounded
direction for the registration entry point, placement rule, and capability
mapping using only accepted identifiers, while parking exact spellings to
their owners.

## Normative sources this specification must not weaken

This candidate must be read together with, and must not weaken:

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
  direction as a candidate; the candidate document itself changes no accepted
  plugin-facing text on its own.
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
  (OQ-053 migration set, generic Panel Runtime contract, and still-deferred
  plugin-facing provider gate) and the draft [Plugin Matrix](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/product/plugin-matrix.md)
  (every `panel.*` entry as deferred candidate pending the plugin-facing gate,
  OQ-058). This candidate changes no distribution, catalog, or presentation
  parity decision.

Where a control or threshold appears to need change, it is recorded under
"Unresolved questions" instead.

## Terminology

- **Core**: the always-available terminal mechanism that works with zero
  plugins and in `bitty --safe`; it owns panel lifecycle, the capability
  gate, layout and decoration, focus routing, and resource budgets.
- **Panel**: the workspace-managed application container with a stable
  `PanelId`, per the accepted Panel Runtime RFC; the application identity used
  by this candidate. Plugin-visible identity remains an open point.
- **View**: the `LayoutTree` leaf and internal compositor attachment point
  with a stable `ViewId`; never conflated with `TerminalId` or `PanelId`,
  and hidden from end users and from plugin Lua APIs under the candidate
  placement direction.
- **PanelProvider**: a candidate term for a plugin-supplied factory that
  declares one or more `PanelType` values; the candidate requires the
  `panel.provider` capability. The exact trait spelling stays open.
- **PanelType**: a candidate closed-set member contributed by a
  `PanelProvider` (for example `terminal`, `rich`, `browser`, `helper`,
  `canvas`), validated via manifest. No member is added here.
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

## Body

### Goals

- Provide a single, reviewable home for a **bounded candidate** describing the
  possible plugin-facing registration, placement, and capability boundaries;
  this section does not decide or accept those boundaries.
- Identify the candidate shape for `RFC-OQ-2` without minting a trait spelling:
  record the manifest-declared `PanelType`, the existing `panel.provider`
  grant, and Core-owned admission as material for future acceptance, while
  leaving exact spellings, lifecycle observations, and denial wire shapes to
  their owners.
- Identify the candidate shape for `RFC-OQ-3` without prescribing migration
  churn: record the refined Option C identity direction and transitional Option
  A encoding as material for future acceptance, while leaving plugin-visible
  identity, focus/input behavior, layout ownership, and persistence to their
  owners.
- Identify the candidate shape for `RFC-OQ-5` without minting an identifier:
  describe how the existing `panel.*` family could remain distinct from
  `layout.provider`, `browser.embed`, `ui.rich`, and `ui.overlay`, subject to
  future review of topic rules and per-principal scope separation.
- Reuse accepted identifiers, bounds, and generic lifecycle controls only as
  constraints on the candidate; reuse does not turn a candidate detail into an
  accepted plugin-facing contract.
- Name the blocked consumers and the evidence chain required before any future
  acceptance could authorize host, SDK, or consumer-parity work.
- State the review, security, documentation, and open-boundary evidence that a
  **future acceptance** must provide; until that evidence exists, the candidate
  authorizes no implementation, compatibility promise, grant, or mount.

### Non-goals

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
  plus capability grant plus host-mediated creation is the candidate entry
  shape; SDK spellings belong to follow-up work and require future acceptance.
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

### Candidate summary

The candidate reuses the accepted Panel Runtime container as a constraint and
records a possible Core-owned registration admission, placement, and
capability mapping. Its candidate invariant, in one sentence: **a future
accepted contract could permit a granted plugin to declare panel types that
Core admits, mounts onto views, focuses, and suspends under generation fencing
and bounded budgets, or receive a typed denial; it could never permit the
plugin to self-mount a view, invent a capability family, hold a PTY
descriptor, place a callback on the input hot path, or turn visibility into
authority.** This sentence is a target for future acceptance, not an
authorization in this RFC.

### RFC-OQ-2 candidate: PanelProvider registration entry point

- The registration entry point is the triple of manifest declaration plus
  capability grant plus Core-owned admission. A plugin declares each
  `PanelType` it contributes in its manifest; the declaration is valid only
  with the `panel.provider` grant recorded by the Core gate; Core admits the
  declaration at the `PanelRuntime` creation path (contract name
  `PanelRuntime`; current orchestration is `PanelRegistry` in
  `crates/bitty-runtime/src/registry/panel.rs` with `create_panel`,
  `mount_panel`, `focus_panel`, `suspend_panel`, `resume_panel`, and
  `dispose_panel`) under manifest validation and bound checks. A `PanelType`
  contributed without the matching `panel.*` grant would fail at registration
  under a future accepted contract.
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
- Candidate lifecycle reuses the accepted generation rule: one logical provider
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
  validation point with the accepted generic failure shape; plugin-facing
  operation shapes remain open.
- Official and bundled panels pass through the identical registration path;
  no private channel and no first-party bypass exists.

### RFC-OQ-3 candidate: Panel-to-View placement

- Placement uses the recorded refined Option C identity semantics with the
  Option A encoding transitionally as a candidate direction. Panel is the application and session
  identity (`PanelId` survives a move across workspaces, a presentation-mode
  change, and a tab reorder); `View` remains the internal attachment point
  (`ViewId` stays the `LayoutTree` leaf with its allocation, retirement, and
  generation rules unchanged, hidden from end users and from plugin Lua
  APIs); the binding is explicit and directional (a panel mounts onto a
  view, at most one-to-one in the candidate sense of a `PanelId` binding to
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
  workspace and MRU re-homing on detach or destroy. The candidate preserves the generic focus target as a `PanelId` and the
  internal hit-testing rectangle as a `View` rectangle. Any focus change must
  still force a full present without mutating a terminal grid. The plugin-facing
  `InputTarget::Panel` and `route_input` behavior remain acceptance points, not
  a settled plugin contract. No plugin callback sits on the input hot path, and overlay
  capture stays presentation-only.
- Persistence is not decided here. The accepted Panel Runtime RFC leaves
  workspace save/restore, persistence format and versioning, and PTY
  reattachment under `RFC-OQ-9`; this candidate makes no persistence claim.
  Issue [#464](https://github.com/bitty-terminal/bitty-docs/issues/464)
  tracks the plugin-facing identity and reload implications that must be
  reconciled with that question. A future candidate may evaluate preserving
  panel identity and attachment while allocating a fresh `TerminalId`, but no
  such rehydration rule may be inferred from this document. A `View` may outlive
  the panel mounted on it and may host a different panel afterwards; whether
  an unattached panel is suspended or destroyed remains an open lifecycle point.
- Placement changes no capability, budget, or trust boundary. A panel still
  holds no PTY descriptor, GPU object, or native window handle; the binding
  map is Core-owned presentation state. Panel visibility never becomes
  authority: a visible panel gains no capability a suspended one lacks, and
  moving a panel across workspaces grants nothing.

### RFC-OQ-5 candidate: panel capability mapping

- The mapping reuses the closed `panel.*` family in the Core capability
  seed: `panel.provider`, `panel.create`, `panel.focus`, and
  `panel.overlay`. Plugins cannot invent families; a `PanelType` contributed
  without the matching `panel.*` grant would fail at registration under a
  future accepted contract. This RFC mints no member and changes no grammar.
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
  the host bridge, SDK spellings, and consumer parity land. This RFC bounds
  the candidate gate only; presentation parity stays with the owning
  repositories and is not claimed here.
- If this candidate is later accepted, the unblocking chain is: Core host bridge lands the
  enforcement (registration admission, placement binding, focus routing,
  bound enforcement, typed denials) under its own task with host parity
  tests; SDK work mints the accepted spellings with the mock host and
  conformance suite against this contract; `file-manager` and `git-panel`
  build to parity on the SDK surface. Only host parity evidence in the
  owning repositories authorizes presentation; this RFC authorizes none.
- The [Bundled-Plugin Split Decision](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/product/bundled-plugin-split-decision.md)
  Panel Runtime public provider contract row and the
  [Plugin Matrix](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/product/plugin-matrix.md)
  deferred-candidate note keep their owning-repo rows deferred. They may cite
  this bounded candidate for context only after their owners review it; they
  must not treat it as an accepted contract or distribution/catalog change.

## Security review

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

No security-auditor sign-off is claimed by this draft candidate. The named
controls and P0 gates are review requirements for any future acceptance; the
candidate neither closes a threat-model item nor authorizes a trust-boundary
change.

## Verification plan

Verification for this candidate is documentary and bounded:

- `just check` must pass in `bitty-docs`, including formatting, Markdown,
  links, metadata, language, hygiene, and workflow syntax; `act -n` must parse
  the repository workflow.
- The OQ-058 row, the `RFC-OQ-2`, `RFC-OQ-3`, and `RFC-OQ-5` rows, and the
  decision register must continue to identify this page as a draft bounded
  candidate and keep the three plugin-facing questions open.
- The owning `bitty-terminal-docs` and `bitty-plugins-docs` pages must describe
  the panel-provider material as deferred candidate context, never accepted
  contract text.
- Any future acceptance requires host-bridge parity tests, SDK conformance
  evidence, security review, and explicit dispositions for the open boundaries;
  those results do not exist in this document.

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

## Affected contracts

- The accepted generic Panel Runtime container and Event Bus remain
  authoritative and unchanged.
- `RFC-OQ-2`, `RFC-OQ-3`, and `RFC-OQ-5` remain open; this candidate records
  bounded directions only. `RFC-OQ-9` remains the owner for persistence format,
  versioning, workspace save/restore, and PTY reattachment questions.
- The plugin matrix and bundled-plugin split decision remain deferred in their
  owning repositories. They may link this page as candidate context only after
  their coordinated updates land.
- Issue [#464](https://github.com/bitty-terminal/bitty-docs/issues/464) tracks
  the remaining plugin-facing identity, lifecycle, authority, layout,
  focus/input, crash/reload, and bounded-payload boundaries.
- No capability identifier, Lua entry point, versioned API member, distribution
  row, or implementation behavior changes as a result of this page.

## Open points

The candidate deliberately does not close the plugin-facing gate. The generic
container and Event Bus guarantees are retained, but the following boundaries
remain outside this candidate and require an explicit follow-up before
acceptance:

- **Identity:** the candidate names `PanelId` and `ViewId` relationships but
  does not establish the plugin-visible identity, persistence identity, or
  cross-reload identity contract.
- **Lifecycle:** the candidate reuses generation fencing and bounded queues,
  but does not define plugin-facing registration, creation, mount, suspend,
  resume, disposal, or reload ordering and observation.
- **Authority:** the candidate states that presentation is non-authoritative,
  but does not define the complete authority boundary for provider-created
  content, bus topics, or panel actions.
- **Layout ownership:** the candidate distinguishes host-mediated placement
  from the Core-internal path, but does not define plugin-facing layout
  requests, placement arbitration, or ownership.
- **Focus/input:** the candidate preserves generic routing context, but does
  not define plugin-facing focus requests, input delivery, denial, or capture.
- **Crash/reload:** the candidate names stale-generation rejection, but does
  not define provider or panel crash containment, rehydration, or reload
  behavior as a plugin-facing contract.
- **Persistence:** `RFC-OQ-9` owns persistence format/versioning, workspace
  save/restore, and PTY reattachment. This candidate makes no persistence
  claim; issue #464 owns the plugin-facing follow-up linkage.
- **Bounded payloads:** the candidate reuses generic `PR-*` bounds, but does
  not define plugin-facing payload schemas, per-operation caps, aggregate
  accounting, or denial/error wire shape.

These omissions are boundaries, not implied permissions. No plugin may infer
identity, lifecycle control, authority, layout ownership, focus/input access,
crash/reload behavior, persistence behavior, or a payload schema from this
candidate.

The precise follow-up is [issue #464](https://github.com/bitty-terminal/bitty-docs/issues/464).

### Additional unresolved questions

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
  work; the transitional encoding remains a candidate assumption until a
  successor decision accepts or replaces it)?
- Which threat-model matrix cells (every level x `panel`-family admission
  cell) and which `P0-AC-035` update cover this family, if the matrix needs
  a panel-specific amendment beyond the reused admission rule (parked to the
  security review; disposition required before any follow-up claims a new
  matrix requirement)?
- Do `file-manager` and `git-panel` keep their current capability sets
  through parity, or does parity narrow or widen them through the
  permission-diff gate (owned by the consumer repositories; this RFC assumes
  no change and grants none)?

## Acceptance criteria

This draft candidate is not accepted. A future acceptance requires all of the following evidence to be linked here:
independent reviewer APPROVE on the registration shape, placement rule with
the Core-internal path distinction, capability mapping with the
`panel.overlay` and `ui.overlay` boundary, bound reuse, and denial taxonomy;
security-reviewer sign-off covering the threat-model touchpoints and named P0
gates; docs-curator APPROVE on taxonomy, links, and register synchronization;
and an explicit disposition for identity, lifecycle, authority, layout
ownership, focus/input, crash/reload, and bounded payloads. Acceptance still
authorizes no implementation: it records the reviewed contract, not shipped
behavior. Host parity tests belong to the Core implementation task that
follows acceptance, and must not be claimed as evidence inside this RFC.

Reviewed 2026-10-24 (issue #443): bounded candidate only. The generic
container and Event Bus remain accepted, while the plugin-facing gate stays
deferred. The owning-repo consumer rows remain deferred and must not cite this
candidate as an accepted predecessor; no submodule pointer moves in this
change.

## P0 Review Sign-off

- **Status:** Not signed off. This page is a draft bounded candidate and does
  not claim P0 approval.
- **Required before acceptance:** an independent reviewer approval,
  security-reviewer sign-off on the named threat-model touchpoints and P0
  gates, docs-curator approval of taxonomy, links, and register
  synchronization, and explicit disposition of every open boundary listed in
  Open points.
- **Implementation evidence:** host parity tests and SDK conformance evidence
  belong to their owning implementation tasks and are not evidence for this
  candidate.

## References

- [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md)
  (accepted): the generic container and Event Bus contract, the
  `RFC-OQ-2` through `RFC-OQ-9` open questions, the `panel.*` closed family,
  and the `PR-1` through `PR-12` bounds reused here.
- [Panel Placement Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-placement-decision.md)
  (draft candidate): the refined Option C direction with Option A encoding
  transitionally, recorded here as a bounded candidate placement.
- [Bundled-Plugin Split Decision](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/product/bundled-plugin-split-decision.md)
  (accepted): the generic Panel Runtime contract and the still-deferred
  plugin-facing provider gate; the `file-manager` and `git-panel` split rows
  keep panel presentation deferred.
- [File-manager README](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/docs/plugins/file-manager/README.md)
  (draft): the observation-only package with panel presentation deferred
  pending the panel-provider contract.
- [Git-panel README](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/docs/plugins/git-panel/README.md)
  (draft): the allowlisted CLI package with panel presentation deferred
  pending the panel-provider contract.
- [Plugin Matrix](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/product/plugin-matrix.md)
  (draft): every `panel.*` entry as deferred candidate pending the
  plugin-facing gate, OQ-058, and follow-up issue #464.
- [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md)
  (accepted): one VM per `(PluginId, generation)`, deny-by-default
  capabilities, and the `DropOldest` default reused here.
- [Isolation Resource RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/isolation-resource-rfc.md)
  (accepted): the three-level queue envelope and `RC-1` through `RC-10`
  bounds reused here.
- [OQ-058](../open-questions.md) (accepted for generic orchestration and
  delivery semantics; plugin-facing registration/mount remains deferred):
  the spatial multi-agent orchestration register this acceptance extends.
- [Issue #443](https://github.com/bitty-terminal/bitty-docs/issues/443)
  (this RFC task issue).
