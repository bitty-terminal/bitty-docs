---
title: Panel Provider Contract Boundaries
description: Candidate record of the seven remaining plugin-facing PanelProvider boundaries with decided and open status for each
category: specifications
audience: plugin-author
document_type: specification
status: draft
website_publish: false
sidebar_order: 20
---

# Panel Provider Contract Boundaries

> Status: **draft boundary record** (`CTX-1786`, `bitty-docs` issue #464).
> This page defines the seven plugin-facing `PanelProvider` boundaries that the
> bounded candidate in
> [RFC-0006](../docs/decisions/rfcs/RFC-0006-panel-provider-registration-mount.md)
> left outside its contract. It records, per boundary, what the accepted sources
> already decide and what stays open. It is **not** an accepted contract, it
> authorizes no implementation, and it mints no identifier: every decided row
> cites the document that owns it, and every open row names its owner instead of
> being resolved here.

## Document status

Draft. The generic Panel Runtime container and Event Bus are accepted and remain
authoritative. The plugin-facing registration, placement, and capability gate is
not accepted: `RFC-OQ-2`, `RFC-OQ-3`, and `RFC-OQ-5` stay open, and `OQ-058`
keeps its deferred plugin-facing material. This record narrows the boundary
description so a later acceptance review has one place to check; it does not
close an open question, does not revise
[RFC-0006](../docs/decisions/rfcs/RFC-0006-panel-provider-registration-mount.md),
and does not reassess the blocked workstreams.

Acceptance is the owner's act. The issue this record serves requires an
owner-approved contract before
[RFC-0006](../docs/decisions/rfcs/RFC-0006-panel-provider-registration-mount.md)
and the register rows are revised; that approval does not exist yet, and nothing
below may be read as one.

## Purpose and scope

The accepted
[Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md)
defines the container: panel identity as a fourth incompatible newtype, the
`Declared -> Created -> Mounted -> Focused -> Suspended -> Disposed` lifecycle,
`(PanelId, Generation)` addressing with `StaleHandle` rejection, focus routing,
the `4+1` overlay envelope, `PR-1` through `PR-12` bounds, the closed `panel.*`
capability family, and the typed failure taxonomy. What it does not define is
what a **plugin** may observe or request through that container.

Two first-party consumers wait headlessly on that gate: the independent
`file-manager` package and the independent `git-panel` package each implement
their non-panel surface and record panel presentation as deferred. The
[Bundled-Plugin Split Decision](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/product/bundled-plugin-split-decision.md)
and the
[Plugin Matrix](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/product/plugin-matrix.md)
keep their `panel.*` rows deferred for the same reason.

In scope: the seven boundaries named by issue #464, each stated as decided
(with its accepted owner) or open (with the owner of the answer).

Out of scope and not decided here:

- any trait spelling, method signature, argument order, or error enum for
  `PanelProvider` (`RFC-OQ-2`);
- any Lua registration or observation spelling; Plugin API v1 is frozen and
  defines no `register_panel` entry point;
- any new capability identifier, topic family, or numeric ceiling;
- any persistence format, versioning, or workspace save/restore rule
  (`RFC-OQ-9`);
- any distribution, catalog, or consumer-parity change.

## Normative sources this specification must not weaken

This record must be read together with, and must not weaken:

- The [security overview](../docs/security/overview.md), the
  [threat model](../docs/security/threat-model.md), the
  [risk register](../docs/security/risk-register.md), and the
  [P0 acceptance criteria](../docs/security/p0-acceptance-criteria.md). The
  controls that bind this surface are capability checking with least privilege
  (`P0-AC-012`), per-plugin VM isolation and failure containment (`P0-AC-013`),
  resource budgets with attribution (`P0-AC-014`), hot-path exclusion
  (`P0-AC-015`), Terminal Truth ownership (`P0-AC-016`), read-only default with
  untrusted labeling (`P0-AC-024`), capability-increase update blocking
  (`P0-AC-030`), and trust-level admission before grant intersection
  (`P0-AC-035`).
- The accepted
  [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md):
  lifecycle state names, identity rules, focus routing, overlay envelope,
  `PR-1` through `PR-12`, the closed `panel.*` family, the failure table, and
  `FS-P1` through `FS-P5`. Its state names and bound values are reused
  verbatim; no bound is retuned here.
- The accepted
  [Workspace Compositor Specification](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/workspace-compositor.md):
  `Instance -> Window -> Workspace -> LayoutTree -> View`, `H`/`V` primitives
  with `ratio` in `[0.1, 0.9]`, Core-owned decoration, and the pure
  deterministic `LayoutProvider::propose` contract.
- The accepted
  [TerminalRegistry and View Lifecycle Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/terminal-registry-view-lifecycle-rfc.md):
  `TerminalId != ViewId`, attachment and detachment semantics, and the
  `RuntimeId`/`PersistentId` rehydration rule.
- The accepted
  [Overlay and Input-Capture Host Contract](../docs/development/overlay-input-capture-contract.md)
  (`W-01` v2): one transient input-capture session, one grant, one owner,
  Core-side timeout, revoke on suspend and dispose, and the no-hot-path rule.
- The accepted
  [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md):
  one VM per `(PluginId, generation)`, deny-by-default capabilities,
  observation versus interception, and the `DropOldest` default.
- The accepted
  [Isolation and Resource RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/isolation-resource-rfc.md):
  `RC-1` through `RC-11`, failure semantics, and the three-level queue envelope
  (`PerSub 64`, `PerPlugin 1024` events and `256 KiB`, Global `8192` events and
  `2 MiB`).
- The accepted
  [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md)
  and [ADR 0009](../docs/decisions/adrs/ADR-0009-plugin-api-v1-lua-surface.md):
  v1 is frozen, excludes `register_panel`, `PanelId`, `PanelProvider`, and panel
  lifecycle, and this record adds no v1 member and widens none.
- The draft
  [Panel Placement Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-placement-decision.md)
  and the draft
  [Panel Content Scene Path Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-content-scene-path-decision.md).
  Both are **candidate** records. Where this page cites them it says so, and a
  candidate citation never becomes an accepted row by being repeated here.

## Terminology

- **Core**: the always-available mechanism that works with zero plugins and in
  `bitty --safe`; it owns panel lifecycle, the capability gate, layout and
  decoration, focus routing, and resource budgets.
- **Panel**: the workspace-managed application container with a stable
  `PanelId`, per the accepted Panel Runtime RFC.
- **View**: the `LayoutTree` leaf and compositor attachment point with a stable
  `ViewId`; never conflated with `TerminalId` or `PanelId`.
- **PanelProvider**: the candidate term for a plugin-supplied declaration of one
  or more `PanelType` values requiring `panel.provider`. The term is descriptive;
  no trait spelling is fixed by this page.
- **Decided**: a rule the cited accepted document owns, quoted or paraphrased
  without change.
- **Open**: a question this page names and does not answer. An open row is a
  boundary, not an implied permission.
- **Candidate**: a recorded direction that is not accepted; candidate status is
  neither acceptance nor implementation.

## Body

### Goals

- Give issue #464's seven boundaries one reviewable home that separates accepted
  constraint from undecided question, so a future acceptance review can check
  each boundary instead of re-deriving it.
- Cite only accepted owners for decided rows, and name an owner for every open
  row, so no reader mistakes a gap for a permission.
- Keep the record honest about the boundary it does not cross: this page neither
  accepts the plugin-facing gate nor authorizes host, SDK, or consumer work.

### Non-goals

- No `PanelProvider` trait spelling, signature, or error enum is fixed
  (`RFC-OQ-2` stays open with the Core implementation owner).
- No Lua entry point is minted; v1 stays frozen and `register_panel` stays
  excluded.
- No capability identifier is minted; the closed `panel.*` family
  (`panel.provider`, `panel.create`, `panel.focus`, `panel.overlay`) is reused
  unchanged.
- No numeric ceiling is invented. Every number below is quoted from the owning
  accepted document; where a needed number has no owner, the row is open.
- No open question is closed, and no `RFC-OQ-*` row, `OQ-058` row, or
  [RFC-0006](../docs/decisions/rfcs/RFC-0006-panel-provider-registration-mount.md)
  statement is edited by this page.
- No shipped, stable, normative, or compatibility-guaranteed behavior is claimed
  for any registration, mount, focus, denial, or reload shape.

### Boundary summary

| Boundary                                    | Accepted anchor                                                                    | Remaining status                                                   |
| ------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| B1 identity and cross-reload identity       | Identity newtypes, generation fencing, v1 exclusion                                | Open: plugin-visible projection and reload identity                |
| B2 lifecycle and observation ordering       | State machine, mount rule, generation teardown, Core-only lifecycle topics         | Open: plugin-facing observation points and ordering                |
| B3 provider/content and bus/panel authority | Terminal Truth, no ambient authority in payloads, closed `panel.*`, hot-path rule  | Open: panel principal and action authority                         |
| B4 placement arbitration and layout         | Compositor hierarchy, `LayoutProvider::propose`, Core-owned decoration and binding | Open: plugin-facing placement request and arbitration              |
| B5 focus and input                          | Focus routing, MRU re-homing, `W-01` capture session                               | Open: panel focus request, delivery, denial, panel-surface capture |
| B6 crash, rehydration, reload               | `FS-P2` containment, `RC-*` suspend, generation teardown, reclaim                  | Open: provider/panel restart and rehydration contract              |
| B7 payloads, caps, accounting, denial shape | `PR-1`..`PR-12`, `RC-4`/`RC-10`, failure table, transactional denial               | Open: per-operation caps and the denial wire shape                 |

### B1 Plugin-visible identity and cross-reload identity

**Decided.** The container's identity rules are accepted, and the plugin-facing
projection is accepted only as an exclusion.

| Decided rule                                                                                                                                                                                                                                                        | Owner                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `PanelId`, `ViewId`, `TerminalId`, `RuntimeId`, `PersistentId`, and `Generation` are distinct types with no `From` bridge; no function accepts one where another is expected                                                                                        | Panel Runtime RFC (identity rules); Workspace Compositor (hierarchy invariants) |
| A `PanelId` is created with a fresh `(PanelId, Generation)`; numeric reuse after disposal requires a generation bump                                                                                                                                                | Panel Runtime RFC                                                               |
| Handles travel as `(id, generation)` pairs on every cross-component call; a stale generation is rejected with `StaleHandle` before any state access                                                                                                                 | Panel Runtime RFC                                                               |
| `PersistentId` semantics for panels, **if ever adopted**, must follow the terminal rule: scrollback persistence may rehydrate content, a new `RuntimeId` is required for a new backing process, and a remote shell must never set `PersistentId` through PTY output | Panel Runtime RFC; TerminalRegistry and View Lifecycle Contract                 |
| Plugin API v1 defines no `register_panel`, no `PanelId`, no `PanelProvider`, and no panel lifecycle surface                                                                                                                                                         | Plugin API v1 Lua Surface RFC (out-of-scope item 6); ADR 0009                   |

The container-side identity is therefore decided and the plugin-visible identity
is decided to be **absent** in v1. That absence is the whole of the accepted
answer: it is not a promise that a future surface exposes `PanelId`, and it is
not a promise that it does not.

Candidate context, not accepted: the
[Panel Placement Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-placement-decision.md)
records Panel as the user- and plugin-visible application identity and `View` as
hidden from plugin Lua APIs. That direction is draft; this page does not adopt
it, and no decided row above depends on it.

**Open.**

- Whether any panel identity is visible to plugin Lua at all, and if so whether
  it is `PanelId` or an opaque plugin-scoped handle.
- Whether a panel keeps its identity across a plugin reload, a provider VM
  restart, or a host restart — and whether a reloaded plugin may address a panel
  its previous generation created.
- Whether `PersistentId` is adopted for panels at all. The accepted rule is
  conditional ("if ever adopted"); the adoption decision has no owner yet.
- Whether the accepted terminal rehydration shape (fresh `TerminalId`/`RuntimeId`
  under the same `PersistentId`) is binding for terminal-backed panels, or
  whether panels need a different rule.
- Whether `ViewId` is ever exposed to a plugin. The accepted compositor defines
  `ViewId` as the leaf identity; the accepted RFC does not say whether a
  plugin-facing surface may name it, and the candidate direction says it may not.
- Persistence format, versioning, workspace save/restore, and PTY reattachment
  stay with `RFC-OQ-9`; this page adds no rule to them.

### B2 Registration, creation, mount, suspend, resume, disposal, reload, and observation ordering

**Decided.** The container's lifecycle is accepted; the plugin-facing
observation points are not.

| Decided rule                                                                                                                                                                                                                                            | Owner                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Accepted state machine: `Declared -> Created -> Mounted -> Focused -> Suspended -> Disposed`, with `resume` returning from `Suspended`; suspend is becoming invisible without destroying attachment                                                     | Panel Runtime RFC                      |
| Creation validates `PanelType` against the provider manifest and `max_panels_per_workspace`, allocates a fresh `(PanelId, Generation)`, and returns without mounting; failure is `TooManyPanels` or `UnknownPanelType` before any allocation is charged | Panel Runtime RFC (`PR-1`, `PR-2`)     |
| Mount binds a `PanelId` to an **empty** `ViewId` and is the only way a view hosts a panel; the mapping is at most one-to-one; violations are `AlreadyMounted` or `PanelAlreadyMounted`                                                                  | Panel Runtime RFC                      |
| Disposal releases panel-owned queues, tasks, timers, and handles and is verified against the pre-creation baseline within the `PB-3` reclaim tolerance; retained-by-design state is declared in the manifest                                            | Panel Runtime RFC (`FS-P4`)            |
| Teardown of generation `N` precedes activation of generation `N + 1`; queued generation-`N` events at disposal follow `DropOldest` with per-queue counting and attribution                                                                              | Plugin Platform RFC; Panel Runtime RFC |
| `PanelRuntime` is the only producer of Core-owned lifecycle topics such as `bitty.panel:mounted` or `bitty.panel:focused`; a non-Core topic impersonating `bitty.*` fails validation                                                                    | Panel Runtime RFC (Event Bus)          |
| `panel.created` and `panel.closed` are non-coalescable and delivered one-by-one FIFO up to the bound; focus topics are coalescable; FIFO holds within one queue and there is no ordering across panels or topics                                        | Panel Runtime RFC (Event Bus)          |
| A panel never renders from inside the VT damage path, and a focus change forces a full present without mutating a terminal grid                                                                                                                         | Panel Runtime RFC                      |

**Open.**

- Whether a plugin observes its own panel's transitions at all, and at which
  point relative to the commit: before the new state is addressable, or after.
  The accepted text fixes the queue and topic rules, not the observation point.
- Whether lifecycle observation is a bus topic, a callback, or both, and whether
  it is ordered against the operation's return value.
- Whether `Declared` is observable. It precedes any `(PanelId, Generation)`, so
  an observer would need an identity the accepted contract does not define.
- Whether disposal is synchronous and awaitable from plugin code or
  fire-and-forget, and what a plugin may do between a dispose request and the
  release.
- Whether an unattached panel is suspended or destroyed. This is recorded as
  open in
  [RFC-0006](../docs/decisions/rfcs/RFC-0006-panel-provider-registration-mount.md)
  and is not answered here.
- Whether a plugin may dispose a panel it did not create, and whether ownership
  of a panel is separable from the `panel.create` grant.
- What a plugin observes across a reload of its own generation: nothing, a
  teardown event, or a fresh activation event with no continuity.
- Whether creation accepts an options payload at all, and if so which fields are
  plugin-settable. Presentation mode and initial geometry have no plugin-facing
  contract today.

### B3 Provider/content and bus/panel authority boundaries

**Decided.** Authority separation is accepted and is the strongest part of the
existing contract.

| Decided rule                                                                                                                                                                                           | Owner                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Presentation is never Terminal Truth: no panel or provider mutates grid, cursor, modes, scrollback, or reply bytes                                                                                     | Panel Runtime RFC; `P0-AC-016`                                  |
| `PanelRuntime` holds no PTY file descriptor, GPU object, or OS window handle; those stay with `bitty-pty`, `bitty-render`, and `bitty-platform`                                                        | Panel Runtime RFC (architectural placement and security review) |
| A bus payload carries no ambient authority: a `file.open` signal carries a validated path, not a pre-authorized descriptor; receipt grants nothing                                                     | Panel Runtime RFC (Event Bus)                                   |
| No plugin, provider, or bus subscriber is consulted per keystroke, per parse, or per frame; hot-path events are not expressible as bus topics                                                          | Panel Runtime RFC; `P0-AC-015`                                  |
| `panel.*` is a closed family and does not subsume `layout.provider`, `browser.embed`, `ui.rich`, or `ui.overlay`; a `PanelType` without the matching `panel.*` grant fails at registration             | Panel Runtime RFC (capability isolation)                        |
| Emitting requires a declared produced topic and subscribing requires a declared consumed topic; undeclared traffic is `UndisclosedTopic`                                                               | Panel Runtime RFC; Plugin Platform RFC                          |
| Bus access is scope-separated per client principal (`(PluginId, generation)` or `(PanelId, generation)`); a scope granted to one principal never augments another; v1 is single-process, single-window | Panel Runtime RFC                                               |
| Capability checks are synchronous and transactional; a denial leaves no allocation, no queue entry, and no registration (`FS-P1`)                                                                      | Panel Runtime RFC; Plugin Platform RFC                          |
| A plugin update that newly requests any `panel.*` member is a capability increase and blocks pending the permission-diff gate                                                                          | `P0-AC-030`; Panel Runtime RFC                                  |
| Decoration (`gaps_in`, `gaps_out`, `border`, `radius`) is validated in `ConfigPlan` and Core-owned; no provider or panel sets it at runtime, and a bus payload carrying it is rejected                 | Panel Runtime RFC; Workspace Compositor                         |

Candidate context, not accepted: the
[Panel Content Scene Path Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-content-scene-path-decision.md)
records that a plugin produces a bounded declarative scene and never receives a
renderer handle, display list, or submission queue. The accepted RFC already
withholds GPU objects and window handles; the finer scene-path ownership is a
draft direction and is cited here as candidate only.

**Open.**

- Whether a panel is its own capability principal or inherits its provider's
  ledger. Per-panel resource dimensions are accepted as `(PanelId, generation)`
  and per-plugin dimensions as `(PluginId, generation)`, but which principal
  holds panel-scoped **capability** grants is not stated.
- Whether a panel may emit on a topic its provider declared, and whether a
  provider may consume on behalf of a panel it created.
- Whether observing another plugin's panel lifecycle needs a topic grant, a
  `panel.*` grant, or is simply forbidden.
- Whether `panel.provider` or `panel.create` authorizes _acting_ on the content a
  panel shows — opening the previewed file, running the git command behind a
  listing. The accepted rule is that a topic never grants the action; whether a
  `panel.*` member ever does is open.
- Whether a panel-owned overlay requires `panel.overlay` alone or also the
  `ui.overlay` and `ui.overlay.focus` gates, given that the accepted `W-01`
  contract puts transient capture behind `ui.overlay.focus`.
- Whether provider-created content is admitted at a different trust level than
  plugin-authored content under the read-only default and untrusted-labeling
  controls (`P0-AC-024`), or is uniformly untrusted.

### B4 Host-mediated placement arbitration and layout ownership

**Decided.** Layout and decoration ownership is accepted; plugin-facing
placement is not.

| Decided rule                                                                                                                                                                                                                                                          | Owner                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Hierarchy `Instance -> Window -> Workspace -> LayoutTree -> View`; `LayoutTree` uses only `H` and `V` with `ratio` in `[0.1, 0.9]`; Core owns the tree and the decoration                                                                                             | Workspace Compositor                                                                                |
| `LayoutProvider::propose` is a pure function of the workspace snapshot, the view set, and the available area; it is deterministic, bounded, holds no mutable `Workspace` handle, and Core validates the returned tree before committing an invalid-proposal rejection | Workspace Compositor                                                                                |
| `LayoutProvider` registration requires `layout.provider`; the active provider is per-workspace `ConfigPlan` state, and changing it recomposes the workspace without recreating a `View` or `Terminal`                                                                 | Workspace Compositor                                                                                |
| `PanelRuntime` never mutates `gaps_in`/`gaps_out`/`border`/`radius` and never holds a mutable `Workspace` handle inside `PanelProvider::propose`; a proposal carrying decoration or mutating layout outside the tree is rejected                                      | Panel Runtime RFC (architectural placement)                                                         |
| A view must be empty before it hosts a panel, and a `ViewId` that hosted a terminal must be detached first; `ViewId` allocation, retirement, and generation rules are unchanged by panel placement                                                                    | Panel Runtime RFC; Workspace Compositor                                                             |
| The Core-internal `PanelRegistry::mount_panel` path in `crates/bitty-runtime/src/registry/panel.rs` is not an independent-plugin presentation surface; a plugin never calls it and visibility through it grants nothing                                               | Panel Runtime RFC; [RFC-0006](../docs/decisions/rfcs/RFC-0006-panel-provider-registration-mount.md) |

Candidate context, not accepted: the
[Panel Placement Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-placement-decision.md)
records the refined Option C direction (Panel is the visible identity, `View` is
the internal attachment point, the binding is explicit and directional, and
`ViewContent::Panel(PanelId)` is retained as the transitional encoding). Its
persistence consequences are candidate text.

**Open.**

- Whether a plugin may name a placement target at all — a workspace, a window, a
  split direction, or a sibling — or may only declare a preferred presentation
  mode and let Core arbitrate. The accepted RFC records presentation modes as a
  Core concept with no plugin-facing request shape.
- Who wins when two providers request the same empty view or workspace, whether
  the loser receives a typed denial or is queued, and whether arbitration is
  first-come, MRU, or policy-configured.
- Whether a plugin may request allocation of a new `View` or `Workspace`, or only
  fill one Core has already created.
- Whether a provider owns the layout _inside_ its panel rectangle, and whether
  that is a `LayoutProvider` sub-case or a separate nesting rule. The accepted
  scene-path candidate defers a mixed leaf to the rich-presentation schema.
- The ordering between `LayoutProvider::propose` and a panel mount: whether a
  proposal may assume a pending mount, or only observes committed state.
- Whether non-tiled presentation modes (floating, quadrant, scratchpad) are ever
  plugin-requestable. The corpus records them as a gated host surface with no
  plugin-facing contract.
- Whether placement survives a restart. Persistence of the attachment is
  `RFC-OQ-9` territory and this page claims nothing about it.

### B5 Plugin-facing focus, input request, delivery, denial, and capture

**Decided.** Focus routing and overlay capture are accepted; panel-surface input
is not.

| Decided rule                                                                                                                                                                                                                                                                                          | Owner                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Focus is per `Window` and per active `Workspace`, with exactly zero or one focused `View` or `Panel`; zero occurs only when the window is unfocused, the workspace is empty, or the focused target was just hidden or detached                                                                        | Panel Runtime RFC                                |
| Routing shape `Platform -> Router -> focused View/Panel -> keymap/overlay -> encoder -> PTY (if terminal-backed)`; keyboard and IME use focus regardless of pointer position; mouse hit testing uses `View` rectangles                                                                                | Panel Runtime RFC                                |
| Detaching, hiding, or destroying the focused target moves focus to the next MRU entry in the same workspace before the change commits; an empty workspace leaves focus `None` and increments `no_focus` rather than routing to a stale target                                                         | Panel Runtime RFC                                |
| A non-focused panel never receives keyboard, IME, or wheel events; side-channel observation of its content runs only through the bounded bus or the snapshot path                                                                                                                                     | Panel Runtime RFC                                |
| No plugin, provider, or bus subscriber is consulted per keystroke; plugins observe focus changes only through the cold-path `focus.changed` observation event with its existing queue budgets                                                                                                         | Panel Runtime RFC; `P0-AC-015`                   |
| An active overlay holds focus while the underlying view or panel keeps its identity; dismissal restores focus to the MRU target; at most one modal per window, a second request fails `OverlayBusy`                                                                                                   | Panel Runtime RFC (`PR-10`, `PR-11`)             |
| Transient input capture is one Core-owned session behind the single `ui.overlay.focus` grant: one owner, one session per plugin, bounded queue and payloads, Core-side 30-second idle timeout, idempotent release, revoke on suspend, dispose, or crash, and no plugin callback on the input hot path | Overlay and Input-Capture Host Contract (`W-01`) |
| Denial for capture is typed (`E_CAPABILITY_DENIED` naming the capability, `E_UI_UNAVAILABLE` in safe mode or with no focusable surface) and leaves nothing presented                                                                                                                                  | Overlay and Input-Capture Host Contract (`W-01`) |

**Open.**

- Whether a plugin may **request** focus for its own panel (raise, activate, or
  re-home it), and whether `panel.focus` is the grant for that request or only
  for focusing another panel. The accepted family names the member; the
  operation shape has no owner.
- The denial shape for a focus request: a silent no-op, a typed error, or a
  queued request, and whether a denial may reveal that another panel exists. The
  no-leak constraint is fixed; the field set is not.
- Whether a focused panel receives raw key, pointer, or IME events at all, or
  only keymap-dispatched commands. The accepted pipeline puts keymap before the
  encoder and a panel is not a terminal, so a panel that needs typing needs a
  contract that does not exist yet.
- Whether capture extends to a panel surface. `W-01` bounds capture to the
  focusable overlay; whether a panel may hold a capture session, and under which
  grant, is open.
- Pointer capture and pointer hit-testing authority for panel content, including
  drag and resize inside a panel rectangle versus compositor-owned drag.
- Paste, selection, and clipboard-read authority for panel content, and how the
  read-only default applies to a panel that wants to write.
- Whether `InputTarget::Panel` and the panel-over-view routing precedence become
  a plugin-facing statement or stay a Core-internal routing detail.

### B6 Provider and panel crash containment, rehydration, and reload

**Decided.** Containment and reclaim are accepted; restart behavior is not.

| Decided rule                                                                                                                                                                                                         | Owner                                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| A fault affects only the owning `PanelId` or `PluginId` generation; the host process survives and sibling panels and terminals stay responsive (`FS-P2`)                                                             | Panel Runtime RFC; `P0-AC-013`                   |
| A backing helper or surface allocation failure returns `ResourceExhausted` with no leaked file descriptor and leaves the runtime valid                                                                               | Panel Runtime RFC                                |
| Budget machinery that cannot start or is detected disabled makes dependent panels refuse to load rather than run unbounded (`FS-P5`)                                                                                 | Panel Runtime RFC                                |
| `RC-1` overrun suspends the callback fail-closed (10^7 VM instructions or 50 ms wall, 8 ms warning); `RC-2` bounds per-VM memory at `32 MiB`; `RC-4` bounds 64 tasks and 32 timers per plugin with refusal above cap | Isolation and Resource RFC                       |
| Teardown of generation `N` precedes activation of `N + 1`; queued generation-`N` events are dropped per `DropOldest`, counted, and attributed                                                                        | Plugin Platform RFC; Panel Runtime RFC           |
| A stale-generation call is rejected with `StaleHandle` before any state access, including after a restart of the owning generation                                                                                   | Panel Runtime RFC                                |
| Diagnostics are bounded: `panel.errors.<variant>` and `bus.errors.<variant>` counters never echo unbounded payloads                                                                                                  | Panel Runtime RFC (failure semantics)            |
| A crash during a capture session releases the session and restores focus to the panel                                                                                                                                | Overlay and Input-Capture Host Contract (`W-01`) |
| WASM or helper-process strong isolation for panels is excluded; in-process Lua VM isolation is the only in-process boundary for v1                                                                                   | Panel Runtime RFC (explicit exclusions)          |

**Open.**

- What happens to a provider's panels when the provider VM crashes: are they
  disposed, suspended in place, or re-created when the generation restarts.
- Whether panel content is rehydrated from a snapshot after a content-side crash
  (helper or surface), or whether the panel presents a terminal error state.
- Whether a rehydration contract exists at all, and what it would cover:
  identity, attachment, scene, or scrollback. Persistence format and versioning
  are `RFC-OQ-9`; this page claims none of it.
- Whether a plugin observes its own crash after restart, and with which identity
  — a fresh `(PanelId, Generation)` or a continuity marker.
- Whether a provider restart preserves panel identity (the cross-reload question
  in B1), and whether a restarted provider may re-attach to a surviving panel.
- Whether a host restart restores panels, which depends on workspace save and
  restore under `RFC-OQ-9`.
- Whether the `256 KiB` snapshot ceiling that the isolation contract applies to
  MCP and Agent responses (`RC-10`, stream chunks) is the applicable bound for
  panel-content snapshots. No document assigns it to panels, so this page does
  not either.
- Whether the reclaim tolerance `PB-3` is sufficient for panel-owned surface
  memory, or whether panel content needs its own reclaim evidence.

### B7 Payload schemas, operation-specific caps, aggregate accounting, and denial wire shape

**Decided.** Every number below is quoted from an accepted owner; this page adds
none.

| Decided bound                                   | Value                                                     | Owner                   |
| ----------------------------------------------- | --------------------------------------------------------- | ----------------------- |
| Event payload                                   | `<= 8 KiB` per event (`BoundedText` strict)               | `PR-5`                  |
| Batch per wakeup                                | `<= 32` events or `<= 8 KiB` aggregate, smaller wins      | `PR-6`                  |
| Per-subscription queue                          | `64` events, strict FIFO at enqueue                       | `PR-7`                  |
| Per-panel or per-plugin queue                   | `1024` events / `256 KiB` at publish                      | `PR-8`                  |
| Global bus queue                                | `8192` events / `2 MiB`, hard-gated at host admission     | `PR-9`                  |
| Distinct topics per process                     | `<= 256`                                                  | `PR-3`                  |
| Subscriptions per panel or plugin               | `<= 32` topics                                            | `PR-4`                  |
| Overlay count per window                        | `<= 4` active plus `1` modal                              | `PR-10`                 |
| Overlay text and tooltip                        | `<= 128` chars text, `<= 256` tooltip                     | `PR-11`                 |
| Command contributions per panel type            | `<= 32` commands                                          | `PR-12`                 |
| Panels per workspace / per window               | `[1, 32]` default `16` / `[1, 64]` default `32` aggregate | `PR-1`, `PR-2`          |
| Live tasks and timers per plugin                | `64` tasks, `32` timers, refusal above cap                | `RC-4`                  |
| Stream chunk bound for snapshot-style responses | `256 KiB`                                                 | `RC-10`                 |
| Per-VM memory / aggregate / persistent store    | `32 MiB` / `512 MiB` / `256 KiB`                          | `RC-2`, `RC-3`, `RC-11` |

Other decided rules:

- Topics are qualified `owner.name:topic` strings matching the accepted grammar
  and bounded to `<= 64` bytes, validated at declaration and at publish.
- Payloads are immutable JSON-compatible values plus binary-safe bytes; an
  oversize payload is rejected with `PayloadTooLarge` before any queue entry is
  made.
- Aggregate plugin plus panel bus traffic shares the same global envelope; a
  panel burst that would exceed it is the same global-limit event as a plugin
  burst, not a second independent ceiling.
- Per-panel resource dimensions are owned by `(PanelId, generation)` and
  per-plugin dimensions by `(PluginId, generation)`, both with attribution and
  observable accounting.
- Every operation returns a typed error and leaves the previous valid state
  intact; no operation panics and none partially commits. The accepted failure
  names are `TooManyPanels`, `TooManyTopics`, `TooManySubscriptions`,
  `PayloadTooLarge`, `UnknownPanelType`, `UnknownTopic`, `UndisclosedTopic`,
  `AlreadyMounted`, `PanelAlreadyMounted`, `StaleHandle`, `OverlayBusy`,
  `TooManyOverlays`, `GenerationExhausted`, `ResourceExhausted`, and
  `CapabilityDenied`.
- Every error increments a bounded diagnostic counter and reports owner,
  generation, dimension, observed value, limit, and action (`FS-P3`).

**Open.**

- Whether registration, creation, mount, focus, suspend, resume, dispose, and
  reload requests carry a payload at all, and what caps each would need. The
  accepted `PR-*` table bounds bus traffic, panels, overlays, and commands; it
  does not bound a lifecycle request.
- Whether the provider declaration itself is bounded — the number of
  `PanelType` values one provider may contribute has no stated cap. `PR-12`
  bounds commands per panel type, which is a different dimension.
- Per-operation caps for panel content: whether a panel's declarative content
  reuses the rich-presentation node, depth, and byte ceilings unchanged, or
  whether panel content needs its own budget row.
- The denial wire shape: envelope, field names, whether denials are typed values
  or string codes, how the accepted failure names map onto the SDK error
  classes, and whether a denial is catchable from plugin code.
- Whether panel operations need a rate or queue dimension of their own, or
  whether they are accounted only as calls inside the plugin callback budget
  (`RC-1`).
- Whether listing-adjacent panel content (a file listing, a git status list) has
  a content-specific cap. `RFC-0006` parks this question; this page does not
  answer it.
- Whether denial diagnostics for panel operations share the `panel.errors.*`
  counter namespace or need a separate one, and how attribution stays stable
  across a reload.

## Security review

This page changes no boundary it cites; it is a boundary inventory, so the
review is a disposition rather than a new analysis.

- Threat-model touchpoints named by the boundary rows: plugin escape through
  self-mounted views (host-mediated placement, Core-owned binding map);
  capability escape through invented families or implied grants (closed
  `panel.*`, no implicit grant from `layout.provider`, `browser.embed`,
  `ui.rich`, or `ui.overlay`); stale-generation use across reload
  (`StaleHandle` before state access); queue and topic exhaustion (reused
  `PR-1` through `PR-12` with per-principal attribution); input-hot-path capture
  (no plugin callback on the hot path, `W-01` capture is Core-owned and
  revocable); PTY, GPU, or window-handle reachability (a panel holds none); and
  visibility-as-authority confusion (visibility grants nothing).
- P0 gates referenced and not weakened: `P0-AC-012`, `P0-AC-013`, `P0-AC-014`,
  `P0-AC-015`, `P0-AC-016`, `P0-AC-024`, `P0-AC-030`, `P0-AC-035`.
- Residual risk this page does **not** retire: every open row in B1 through B7
  is an unreviewed boundary. An implementation that guessed at one would be
  building on text that no reviewer signed. That is the reason the rows are
  stated as open rather than as recommended defaults.
- No security-auditor sign-off is claimed. The named controls are requirements
  for any future acceptance, not evidence that this record passed one.

## Verification plan

Verification for this record is documentary:

- `just check` passes in `bitty-docs`, including formatting, Markdown, links,
  metadata, language, hygiene, and workflow syntax.
- Every decided row resolves to an accepted document in this corpus or in a
  sibling corpus at its current `main`, and the link gate agrees.
- Every open row names a question, not a default, and no open row reads as a
  permission.
- [RFC-0006](../docs/decisions/rfcs/RFC-0006-panel-provider-registration-mount.md),
  the `RFC-OQ-2`/`RFC-OQ-3`/`RFC-OQ-5` rows, and `OQ-058` continue to describe
  the plugin-facing gate as deferred. This page does not edit them.
- No identifier, capability, ceiling, or wire spelling appears here that does not
  already exist in a cited accepted document.

Host parity tests, SDK conformance evidence, and consumer parity belong to the
implementation tasks that follow an acceptance; they are not evidence for this
record.

## Alternatives considered

- **Resolve the seven boundaries here and propose acceptance in the same
  change.** Rejected: acceptance is the owner's act, and a record that answers
  its own open questions would need the review evidence it is still waiting for.
  Recording the split is the reviewable step.
- **Leave the boundaries to RFC-0006 and edit it in place.** Rejected: RFC-0006
  is a bounded candidate with its own review history, and rewriting it before an
  owner-approved boundary record exists would erase the record of what was
  deliberately left out.
- **Merge the seven boundaries into one undifferentiated "provider contract"
  section.** Rejected: they have different owners (Core implementation, SDK,
  compositor, security, persistence) and different blocking questions; a single
  section would hide which owner has to answer what.
- **State a recommended default for each open row so implementers are not
  blocked.** Rejected: an unreviewed default in governance text is exactly the
  failure mode the gate exists to prevent, and RFC-0006 already records
  candidate directions for the three questions it bounds.
- **Publish this as an RFC.** Rejected for now: the record decides nothing and
  proposes no contract text, so it is a specification-typed boundary inventory
  rather than a reviewable proposal. If a future acceptance wave needs a formal
  proposal, it can cite this record as its boundary appendix.
- **Wait for the SDK and consumer work to force the answers.** Rejected: the two
  waiting consumers are already blocked on the boundary set, so the boundaries
  are the current gate, not a downstream artifact.

## Affected contracts

- The accepted Panel Runtime RFC remains authoritative and unedited. Its
  `RFC-OQ-2`, `RFC-OQ-3`, `RFC-OQ-5`, and `RFC-OQ-9` rows stay open.
- [RFC-0006](../docs/decisions/rfcs/RFC-0006-panel-provider-registration-mount.md)
  stays a bounded candidate. Its "Open points" list is the predecessor of this
  page; this page expands those points into per-boundary decided/open rows and
  changes none of its statements.
- `OQ-058` keeps its deferred plugin-facing material and its acceptance text.
- The
  [Bundled-Plugin Split Decision](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/product/bundled-plugin-split-decision.md)
  and the
  [Plugin Matrix](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/product/plugin-matrix.md)
  keep their `panel.*` rows deferred in their owning repositories.
- The Plugin API v1 surface, the isolation ceilings, the compositor layout
  contract, and the `W-01` capture contract are cited and not modified.
- No capability identifier, Lua entry point, versioned API member, distribution
  row, or implementation behavior changes as a result of this page.

## Open points

The open rows in B1 through B7 are the open points of this record. Grouped by the
owner that has to answer them:

| Owner                                    | Open boundaries it owns                                                                                                                                                                              |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core implementation (`RFC-OQ-2`)         | Lifecycle observation points and ordering; whether creation accepts options; whether the provider declaration is bounded; per-operation caps and the denial wire shape                               |
| Core placement / compositor (`RFC-OQ-3`) | Whether a plugin may name a placement target; arbitration between conflicting requests; nested layout ownership; ordering against `LayoutProvider::propose`; whether `ViewId` is ever plugin-visible |
| Core capability seed (`RFC-OQ-5`)        | Whether a panel is its own capability principal; whether `panel.provider` authorizes acting on content; whether a panel-owned overlay also needs the `ui.*` gates                                    |
| Persistence (`RFC-OQ-9`)                 | Whether `PersistentId` is adopted for panels; what survives reload, restart, and workspace restore; rehydration after a crash                                                                        |
| Security review                          | Trust level of provider-created content; whether a denial may reveal another panel's existence; whether panel operations need a separate rate dimension                                              |
| SDK (`W-139`/`W-120`/`W-43` owners)      | The Lua spelling for any observation or request, once the host shape exists; the error-class mapping for panel denials                                                                               |

These omissions are boundaries, not implied permissions. No plugin may infer
plugin-visible identity, lifecycle control, authority, layout ownership,
focus or input access, crash or reload behavior, persistence behavior, or a
payload schema from this record.

## Acceptance criteria

This record is not accepted. It is complete as a draft when:

1. Each of the seven boundaries states its decided rows with an accepted owner
   and its open rows as named questions.
2. No decided row contradicts an accepted document, and no open row is written
   as a recommendation.
3. Every cited sibling-corpus path resolves at that corpus's current `main`, and
   `just check` passes.
4. The register rows it touches (`OQ-058`, `RFC-OQ-2`, `RFC-OQ-3`, `RFC-OQ-5`)
   still describe the gate as deferred.

A future acceptance of the plugin-facing gate is a separate act and needs
independent reviewer approval on the registration, placement, authority, and
focus shapes; security-reviewer sign-off on the named threat-model touchpoints
and P0 gates; docs-curator approval of taxonomy, links, and register
synchronization; and an explicit disposition for every open row above. That
acceptance would still authorize no implementation.

## P0 Review Sign-off

- **Status:** Not signed off. This page is a draft boundary record and claims no
  P0 approval.
- **Required before acceptance:** the review evidence listed in "Acceptance
  criteria", plus a security-reviewer disposition on the open rows in B3, B5,
  and B7.
- **Implementation evidence:** none is offered or implied. Host parity tests,
  SDK conformance, and consumer parity belong to the tasks that follow an
  acceptance.

## References

- [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md)
  (accepted): lifecycle, identity, focus routing, overlay envelope, `PR-1`
  through `PR-12`, closed `panel.*` family, failure taxonomy, `FS-P1`..`FS-P5`.
- [Workspace Compositor Specification](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/workspace-compositor.md)
  (accepted): hierarchy, `H`/`V` layout primitives, Core-owned decoration,
  `LayoutProvider::propose`.
- [TerminalRegistry and View Lifecycle Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/terminal-registry-view-lifecycle-rfc.md)
  (accepted): `TerminalId != ViewId`, attachment semantics,
  `RuntimeId`/`PersistentId` rehydration.
- [Panel Placement Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-placement-decision.md)
  (draft candidate): refined Option C direction, identity and persistence
  consequences, cited here as candidate only.
- [Panel Content Scene Path Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-content-scene-path-decision.md)
  (draft candidate): Core-owned scene path, no renderer handle, cited here as
  candidate only.
- [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md)
  (accepted): frozen v1 surface and the `register_panel`/`PanelId`/
  `PanelProvider` exclusion.
- [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md)
  (accepted): one VM per `(PluginId, generation)`, deny-by-default capabilities,
  `DropOldest`.
- [Isolation and Resource RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/isolation-resource-rfc.md)
  (accepted): `RC-1`..`RC-11`, failure semantics, three-level queue envelope.
- [Bundled-Plugin Split Decision](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/product/bundled-plugin-split-decision.md)
  (accepted): the still-deferred plugin-facing provider gate.
- [Plugin Matrix](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/product/plugin-matrix.md)
  (draft): `panel.*` rows as deferred candidates.
- [Panel Provider Registration Mount RFC](../docs/decisions/rfcs/RFC-0006-panel-provider-registration-mount.md)
  (draft bounded candidate): the registration triple, placement direction, and
  closed `panel.*` boundary this record expands on.
- [Overlay and Input-Capture Host Contract](../docs/development/overlay-input-capture-contract.md)
  (accepted, `W-01` v2): the single transient capture session, its grant,
  timeout, revoke paths, and typed denials.
- [Open-question register](../docs/decisions/open-questions.md): `OQ-058` and the
  deferred plugin-facing material.
- [P0 acceptance criteria](../docs/security/p0-acceptance-criteria.md),
  [threat model](../docs/security/threat-model.md), and
  [risk register](../docs/security/risk-register.md): the controls this record
  must not weaken.
