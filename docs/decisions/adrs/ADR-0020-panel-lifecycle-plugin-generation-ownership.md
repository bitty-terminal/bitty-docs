---
title: ADR 0020 - Panel Lifecycle and Plugin-Generation Ownership Across Reload
description: Decides that panel containers are workspace-owned and survive a plugin reload while panel content and the controller binding are generation-owned, with identity survival, the panel-to-generation state mapping, rebind authority, bounded recovery, and six testable acceptance criteria
category: decisions
audience: maintainer
document_type: specification
status: draft
website_publish: true
sidebar_order: 50
---

# ADR 0020 - Panel Lifecycle and Plugin-Generation Ownership Across Reload

## Document status

**Accepted for review** on 2026-11-15 by the documentation lane for the residual
scope of [bitty#2476](https://github.com/bitty-terminal/bitty/issues/2476);
project-initiator acceptance is outstanding. Frontmatter `status` is `draft`
because owner acceptance has not occurred, matching
[ADR 0011](ADR-0011-repository-metadata-baseline.md). This ADR decides the
ownership question; it authorizes no implementation, describes no implemented
behavior as shipped, and weakens no normative security control. Lifecycle is
`Draft -> review -> owner acceptance -> normative`.

- Deciders: project initiator (acceptance outstanding); this record is the
  review vehicle.
- Vehicle: a new ADR rather than an amendment to
  [ADR 0013](ADR-0013-core-ontology-identity.md). ADR 0013 fixes the ontology —
  `WorkspaceId` owns panels, `PanelId` is scoped under a workspace,
  `GenerationId` fences reloads, leases, and handoffs — and leaves the
  `GenerationId` fencing contract as an explicit open point. Accepted records
  are extended by dated or superseding records, never silently rewritten, so
  ADR 0013 stands as accepted history and this ADR answers its open point.
- Related: the detail record is
  [Panel Generation Ownership Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-generation-ownership-decision.md)
  (draft), which owns the normative rule text, the residual ledger, and the
  twenty-three-row conformance matrix; this ADR adopts its direction, restates
  the owner-level decision, and does not duplicate its rules or renumber its
  rows. Also related: the accepted
  [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md)
  (panel lifecycle, `(PanelId, Generation)` addressing, the closed `panel.*`
  family), the accepted
  [Plugin Host Runtime RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/plugin-host-runtime-rfc.md)
  (one VM per `(PluginId, generation)`, A.5 generation ownership, FS-6), the
  [Threat model](../../security/threat-model.md) row `T-25`, and the dependent
  open questions OQ-058 (spatial orchestration), OQ-061 (agent identity
  projection), OQ-083 (panel lease and handoff), and the `OQ-084` residual this
  ADR answers.

## Context

Two accepted contracts each own one half of a panel's life and neither owns the
join:

- The [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md)
  owns the panel — `Declared -> Created -> Mounted -> Focused -> Suspended ->
Disposed`, `(PanelId, Generation)` addressing with `StaleHandle` rejection,
  and the closed `panel.*` capability family. It says nothing about what
  happens when the plugin generation that created, drives, or presents into a
  panel ends.
- The [Plugin Host Runtime RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/plugin-host-runtime-rfc.md)
  owns the plugin generation — one VM per `(PluginId, generation)`, grants
  retained across `Suspended`, and FS-6's ordering rule that generation `N` is
  disposed before `N+1` activates. It never mentions panels.

The seam therefore has no owner for six questions: whether a panel survives the
disposal of the generation that created it; what identity a successor may use
to find the panel it used to drive; which panel state holds while its driver is
suspended, disposed, crashed, disabled, or mid-reload; what authority a rebound
panel carries; what the user sees when the driver is gone; and which tests prove
any of it. [ADR 0013](ADR-0013-core-ontology-identity.md) names the vocabulary
that makes the questions askable and explicitly parks the `GenerationId`
fencing mechanics as needing a contract before use. This ADR is that contract
at the decision level.

The decision is load-bearing beyond reload. Panel grants are keyed by a
generation, so "which generation may touch this panel" is a capability question,
not a rendering question; the
[Threat model](../../security/threat-model.md) row `T-25` already names authority
carry-over across a panel generation boundary as the abuse case to prevent.
Because two behaviors with opposite shapes ship today — the Core-owned scene
panel is destroyed at the generation edge, while a `bitty.panel.create`
container is preserved and rebound — the corpus cannot be read as already
deciding this. "The code does X" is not a decision, and both paths contradict
each other on the same event.

Scope: ownership, identity survival, the restore key, the state mapping
including crash/disable/reload-mid-mount, rebind authority, bounded recovery,
and the acceptance criteria.

Out of scope and owned elsewhere: panel placement and `View` versus `PanelId`
encoding
([Panel Placement Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-placement-decision.md),
draft); the non-terminal content path
([Panel Content Scene Path Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-content-scene-path-decision.md),
draft); the `Workspace -> LayoutTree -> View` hierarchy
([Workspace Compositor Specification](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/workspace-compositor.md),
accepted); per-plugin VM lifecycle and ceilings (Plugin Host Runtime RFC and
Isolation Resource RFC, accepted); and restart persistence, whose contract
stays open.

## Decision

### 1. Ownership: the container is workspace-owned, the content is generation-owned

1. A **panel container** — the slot with its identity, placement, attachment,
   title, presentation mode, and focus history — belongs to its `WorkspaceId`
   and outlives any one plugin generation. Disposing a generation never
   disposes a container and never re-mints its `PanelId`.
2. **Panel content and the controller binding** are generation-owned and
   ephemeral. Disposing generation `N` releases `N`'s content, `N`'s grants for
   that panel, `N`'s queued panel events, the panel commands `N` registered, and
   `N`'s overlay attribution — and completes that release **before** the
   unbound presentation is shown, so a placeholder is never painted over a
   departed generation's residue.
3. **The release runs at the generation edge and needs no successor.** A
   generation that is disposed, crashes, or is disabled with no `N+1` runs no
   bind; a release reachable only from a bind would never run for it. This is
   the property that makes "generation-owned" safe to say without a successor
   in hand.
4. **Core-created scene panels are not containers.** The `terminal`-slot scene
   panel Core creates on first `ui.mount("terminal", …)` is generation-scoped
   and is disposed at the edge; it has no title, no persisted identity, no
   user-facing close, and no `bitty.panel.*` verb. The container rules, the
   placeholder, and the rebind rules apply only to panels addressed by a
   `bitty.panel.*` verb. The scene path contributes the fence as precedent, not
   as a behavior to delete.
5. **Reload ordering is FS-6's and stays the plugin host's.** Generation `N` is
   disposed before `N+1` activates. This ADR adds no second ordering rule; it
   states what the panel side must do inside that order: release `N`'s content,
   retain the container, and present the unbound state between the two steps
   rather than after both.

### 2. Identity: `PanelId` survives a reload, and it is not a restore key

1. **`PanelId` survives a plugin reload.** It is not re-minted by the successor,
   not invalidated by generation disposal, and not renumbered by a rebind. It
   changes only on container disposal.
2. **The panel allocation generation and the controller generation are two
   different values and are never compared.** The allocation generation stamps
   the container at creation ("an allocation epoch"); the controller generation
   names the generation currently permitted to drive the content and is replaced
   by every rebind. Conflating them is the defect this rule forbids: a reload
   would otherwise mint a new panel `StaleHandle` class, and a stale controller
   would look like a stale container.
3. **A `PanelId` is not addressable authority.** Holding or guessing one grants
   nothing; a plugin reaches a panel only through a granted verb checked against
   the controller binding before the panel is touched and again at use. This
   restates ADR 0013's "presentation never confers authority" at the identity
   level.
4. **`PanelId` is not the restore key.** Restart re-mints a fresh `PanelId`; the
   stable key for layout and session restore is `(WorkspaceId, PersistentId)`,
   where `PersistentId` is the owner-scoped panel key from the manifest and
   `WorkspaceId` is resolved at restore. ADR 0013's Restore/Persistence
   separation governs: restore re-derives volatile structure from explicit,
   consented persistence, and persistence never happens as a side effect of
   restore.
5. **No policy may resurrect a persisted `PanelId`.** A restore entry point must
   refuse a stable-identity policy for panels explicitly rather than inherit a
   default a caller can change. Reusing the persisted id is the alternative this
   ADR rejects.
6. **The decision is bounded by the persistence contract.** This ADR fixes the
   key and the refusal, not the record fields, the encoding, the manifest
   version policy, or whether restart restore ships at all. Until that contract
   is decided, nothing is restored: within one `Instance` a panel is durable
   across plugin generations, and across a process boundary it is not durable at
   all.

### 3. Lifecycle mapping: panel states against generation states

The mapping is a legality table, not a merge of two enums. Panel states are the
accepted six. "Unbound" is **not** a seventh panel state: it is a fact about the
binding and the content, and a panel with no bound controller is a valid,
representable state that has no command, content, or capture verb.

| Panel state | Legal controller generation states                        | Meaning                                                                                     |
| ----------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `Declared`  | `Registered` (the panel type is declared in the manifest) | The provider declared the type. No `PanelId` exists and no slot is charged.                 |
| `Created`   | `Activated`                                               | `PanelId` allocated, nothing attached. Requires a live controller holding `panel.create`.   |
| `Mounted`   | `Activated`, or none (unbound)                            | Bound to a view; or a retained container presenting the unbound state.                      |
| `Focused`   | `Activated`                                               | Mounted and owning input routing. Never reachable without an attachment.                    |
| `Suspended` | `Activated`, `Suspended`, or none                         | Invisible without destroying the attachment, or unmounted with the attachment released.     |
| `Disposed`  | any terminal generation state                             | Container retired: attachment, MRU, lease, commands, queues, grants, and overlays released. |

Rules that follow:

1. **Controller `Suspended` does not suspend the panel.** A suspended generation
   detaches handlers and retains grants, so it can receive nothing; the panel
   keeps its container and its state, loses its controller verbs, and shows the
   unbound presentation. `Suspended` as a _panel_ state means "invisible without
   destroying the attachment", which is a workspace fact, not a plugin fact.
2. **Controller `Disposed` never cascades to panel `Disposed`.** Only an explicit
   user close, a workspace close, or an explicit recovery decision retires a
   container.
3. **Crash** enters the FS-2 ladder, ends the generation `Disabled`, unbinds the
   panel, releases that generation's panel-scoped families, and presents the
   unbound state with reason `crashed`, keeping attachment and focus history. No
   automatic respawn and no retry loop.
4. **Disable** behaves as crash with the disable named rather than a fault. The
   plugin's panels stay visible until the user closes them; hiding them silently
   is the orphan this ADR forbids, and re-enabling permits a rebind rather than
   resuming the old binding.
5. **Reload mid-mount fails closed and commits nothing.** A mount against
   disposal either commits against a controller that is still `Activated` or
   leaves the panel in its pre-mount state; no panel is left half-mounted and no
   view is left bound to a disposed generation. A refused mount is retried only
   by `N+1` re-issuing it, never by Core replaying the old request.
6. **Reload mid-content releases before the drop.** Content committed by `N` is
   released during `N`'s teardown before `N`'s resources are dropped, so `N+1`
   never observes `N`'s scene, binding, or content handle, and queued events are
   never replayed into a successor.
7. **`Focused -> Disposed` and `Created -> Disposed` are legal.** A workspace
   close routinely meets a focused panel and a reload discard meets an unmounted
   one. Disposal must never be refused by a transition table; the table
   describes legality, it does not gate the user.

### 4. Authority: a rebound panel inherits nothing it did not itself obtain

1. **The predecessor's grant set is a ceiling, never a source.** The successor's
   panel-scoped set is its own resolution intersected with the predecessor's
   set, widened only by a consent granted for that binding.
2. **Narrowing is silent; widening requires a permission-diff consent.** A
   capability the predecessor held and the successor does not resolve is dropped
   without a prompt. A capability the successor resolves and the predecessor
   never held is denied unless the user consents in that bind, and consent is
   per-binding — the next rebind asks again.
3. **Capture, overlay, and scrollback access never cross the boundary.** A
   rebound panel starts with empty capture sessions, empty overlay attribution,
   empty queued events, and no scrollback access inherited from the predecessor.
   The successor obtains each by its own grant and its own request; "the old
   generation had it" is not an input to any of them.
4. **The ceiling survives the edge in a bounded tombstone, and an empty ceiling
   is not a missing one.** A predecessor that ended holding nothing must be
   distinguishable from a ceiling record that was lost; the second case refuses
   the bind instead of granting the whole resolution. A reload may never fall
   back to "there is no predecessor row, so there is no ceiling".
5. **One bind is transactional over one immutable snapshot.** A failed step
   leaves the panel unbound with no partial grant and no partial binding, and a
   displaced generation that keeps a handle across the edge is refused before
   any state access.
6. **The lease and the binding are distinct.** The controller binding fixes who
   may drive the content; the panel write lease fixes who may write now. A
   rebind resets the lease rather than transferring the predecessor's holder,
   and the composition of panel-level lease and handoff semantics with the
   binding stays under OQ-083.

### 5. Recovery: three outcomes, all explicit, all bounded

Recovery has exactly three legal outcomes. A silent orphan is not one of them,
and automatic deletion of the user's structure is not another.

| Outcome       | When triggered                                                                                                                   | User-visible result                                                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `Placeholder` | The controller is missing, suspended, disabled, crashed, mid-reload, or a different version than the persisted content requires. | The container stays with its title and geometry, presents a non-interactive surface naming the reason, and offers close and retry. |
| `Unavailable` | The provider is installed but the panel's required capability is denied, or safe mode excludes the plugin.                       | The container stays, presents "unavailable" with the denial named, and accepts no content verb.                                    |
| `Drop`        | The user closes the panel, closes the workspace, or accepts an explicit discard of that plugin's panels.                         | The container is disposed through the ordinary disposal path; `PanelId` retires and the loss is attributed and reported.           |

Rules:

1. **The reason vocabulary is closed and Core-owned.** A user-supplied or
   unrecognized reason is refused rather than passed through; the close-side
   reasons map to `Drop` instead of being dropped, so one diagnostic is not
   split across two spellings.
2. **Recovery is bounded by construction.** One placeholder per unbound panel,
   no per-tick respawn, no unbounded retry, and no diagnostic that grows with the
   attempt count. The counter is capped; at the cap the state stops changing and
   a single saturated note is emitted per binding.
3. **A missing plugin is `unloaded`, not deleted.** An uninstalled provider
   leaves placeholders that keep the container's identity facts so a reinstall
   can rebind.
4. **Version skew is explicit.** Content produced under a newer schema than the
   restored provider supports presents the unbound state as incompatible and
   applies nothing; content is never downgraded, reinterpreted, or partially
   applied.
5. **The placeholder is Core-owned and holds no plugin text.** It cannot be
   styled or replaced by a plugin, and no recovery path reaches a terminal, a
   PTY, a renderer handle, or a plugin callback.

### 6. Acceptance criteria

The six scenarios carried on
[bitty#2476](https://github.com/bitty-terminal/bitty/issues/2476) are the
acceptance bar for this decision. Each is stated here as a decision-level
criterion with the conformance row that owns its assertion text; the row text is
authoritative and is not copied here.

| #    | Scenario                              | Decision-level criterion                                                                                                                                                                                                                                   | Owning row                                                                                                      |
| ---- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| AC-1 | Reload with a mounted panel           | `PanelId`, attachment, presentation mode, and title are unchanged across `N -> N+1`; content is replaced; no panel `StaleHandle` is produced; the successor starts with empty capture, overlay, and queue state.                                           | `PGO-1`, with `PGO-15`/`PGO-22` for the displaced and ordering cases                                            |
| AC-2 | Reload with a suspended panel         | The panel stays `Suspended` with its attachment intact; the successor binds without a mount; no focus change occurs.                                                                                                                                       | `PGO-2`                                                                                                         |
| AC-3 | Reload with overlay or capture active | Overlay attribution and capture state belonging to `N` are observably released before the successor binds, the successor inherits neither without its own grant, and the release is observable rather than inferred.                                       | `PGO-23` (edge release), `PGO-7` (overlay and queue do not survive a rebind), `PGO-17` (widening needs consent) |
| AC-4 | Plugin removed                        | The container survives, presents the unbound state with the removal reason, accepts no verb, emits exactly one record, and stays unchanged over many ticks; a reinstall can rebind.                                                                        | `PGO-3`, `PGO-20` (unloaded arm)                                                                                |
| AC-5 | Plugin denied                         | The panel presents "unavailable" with the denial named, no content verb is reachable, safe mode reaches the same outcome without loading a third-party VM, and widening never becomes a grant without consent.                                             | `PGO-10`, `PGO-19`, `PGO-18`                                                                                    |
| AC-6 | Restore after restart                 | No reachable policy restores a persisted `PanelId`; the stable key is `(WorkspaceId, PersistentId)`; a restored panel is a first bind that grants its whole resolution rather than inheriting a predecessor ceiling; incompatible content applies nothing. | `PGO-12`, `PGO-11`                                                                                              |

A product change that touches panel lifecycle, rebind, or generation teardown
adds or updates its row before merge. Coverage, not the row count, is the
contract.

## Consequences

- The `OQ-084` residual is answered at the decision level: the `GenerationId`
  fencing contract ADR 0013 parked now exists for panels specifically, and
  OQ-058, OQ-061, OQ-083 can name one panel identity across a generation change.
- The two shipped behaviors become one: the scene-panel path is scoped out as a
  non-container, and the `bitty.panel.create` path is the shape the rules
  generalize. Nothing in this ADR requires the scene path to change.
- Reload is no longer a panel-destroying event for containers, so plugin
  iteration cost drops from "your panels vanish" to "your panels go unavailable
  and come back". The cost is that the unbound state becomes a first-class
  presentation every surface must render.
- Grants, capture, overlay attribution, and queues acquire an enforced edge
  release, which is more code than "clear on disposal" and is the only shape
  that closes the `T-25` abuse case.
- The persistence contract now has a fixed key to receive, and a restore path
  that must reject stable identity. It stays unimplemented until that contract
  lands, so no user-visible session restore is authorized here.
- Restore stays weaker than reload on purpose: durable within an instance,
  not durable across a process boundary until persistence is decided.

## Rejected alternatives

| Alternative                                                               | Disposition                                                                                                                                                                                          |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generation-owned ephemeral panels; dispose the container with its driver  | Rejected — destroys user structure on every reload, and reload is a routine operation. It also makes the restore key meaningless because no container outlives the generation that would persist it. |
| Keep the container but let the successor inherit the predecessor's grants | Rejected — this is exactly the `T-25` authority carry-over: a reload would silently re-grant capture, overlay, and scrollback access the user never consented to for the new generation.             |
| A seventh "unbound" panel state                                           | Rejected — unboundness is a fact about the binding and the content, not a lifecycle position. A new state would have to be legal from four existing states and would duplicate the disposal edges.   |
| Re-mint `PanelId` on reload                                               | Rejected — breaks layout and focus continuity, invalidates every outstanding reference for no security gain, and creates a `StaleHandle` class that has no meaning to a user.                        |
| Use `PanelId` as the restore key                                          | Rejected — restart re-mints ids; a persisted `PanelId` is a stale integer that another panel can later occupy.                                                                                       |
| Delete the panel when its plugin is missing or denied                     | Rejected — silent destruction of the user's structure on an event the user did not request. Bounded unavailability is explicit and reversible; deletion is neither.                                  |
| Suspend the panel when the controller suspends                            | Rejected — conflates a workspace visibility fact with a plugin lifecycle fact, and would make panel state change on events the user never sees.                                                      |
| Let Core replay a refused mount                                           | Rejected — replaying a disposed generation's request resurrects a controller the plugin host already ended, and would let `N`'s work appear under `N+1`'s authority.                                 |
| Decide this inside the Panel Runtime RFC                                  | Rejected — the join spans the panel and plugin-host contracts, and a unilateral amendment in either corpus would bind the other without its owner.                                                   |

## Current implementation status

Point-in-time evidence read at `bitty` `origin/main` `2c229819` (2026-11-15).
Line numbers drift; the symbol and file path are the durable citation. No row is
a conformance claim, and none promotes anything to Verified or Compatible.

| Mechanism                                   | Symbol and location                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | State                        |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Panel lifecycle (six states)                | `PanelState` in `crates/bitty-ui/src/panel.rs:78`; `PanelState::can_transition` at `:111` permits `Created`, `Mounted`, `Focused`, and `Suspended` to `Disposed`. A second seven-state `PanelLifecycle` lives in `crates/bitty-ui/src/panel_state.rs` (`can_transition` at `:145`).                                                                                                                                                                                                                                                                                                                                                                                                                                    | Landed                       |
| Container record and controller binding     | `PanelRecord` in `crates/bitty-runtime/src/registry/panel.rs:599` holds an allocation `generation` (`:603`), `workspace: Option<WorkspaceId>` (`:606`), `binding: Option<PanelBinding>` (`:620`), `last_controller_generation` (`:633`), `last_controller_owner` (`:652`), and `placeholder` (`:660`). `PanelBinding` (`:429`) is one `(plugin_id, controller_generation)` pair. The allocation epoch and the controller generation are separate values; `grant_key_generation` (`:694`) is the only chooser.                                                                                                                                                                                                          | Landed                       |
| Two-phase rebind                            | `PanelRegistry::rebind_panel` (`registry/panel.rs:3848`), facade `PanelRuntime::rebind_panel` (`registry/host.rs:452`), over `capture_rebind_source` (`:3535`), `derive_rebind_grants` (`:3660`), and `install_rebound_grants` (`:3690`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Landed                       |
| Generation edge release                     | `release_generation_scope` (`registry/panel.rs:3043`), reached from `dispose_panel` (`:2137`) and `present_placeholder` (`:2306`); writes the retired ceiling through `retain_grant_ceiling` (`:3463`) and is read back by `unbind_release_count` (`:3431`).                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Landed                       |
| Retired-ceiling tombstone                   | `retained_ceilings` (`registry/panel.rs:1550`), `RetainedGrantCeiling` (`:1288`), `retire_rebound_ceiling` (`:3275`), `retained_grant_ceiling` (`:3234`), `retained_grant_ceiling_count` (`:3412`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Landed                       |
| Typed refusals                              | `PanelError::StaleHandle` (`:112`), `GenerationExhausted` (`:120`), `CeilingLost` (`:170`), `ControllerConflict` (`:194`), `ControllerReleased` (`:211`), `RecoveryReasonRejected` (`:223`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Landed                       |
| Grant keying and checks                     | `capabilities: HashMap<(PanelId, Generation), BTreeSet<String>>` (`registry/panel.rs:1535`), `resolved_grant_generation` (`:1666`), `is_panel_capability_granted` (`:4015`), `require_panel_capability` (`:4030`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Landed                       |
| Unbound presentation and vocabulary         | `placeholder: Option<PanelPlaceholder>` (`registry/panel.rs:660`) beside `binding: None`; `PlaceholderReason` (`crates/bitty-ui/src/panel_recovery.rs:234`), `RecoveryReason` (`:319`), `RecoveryBudget` (`:640`) under `RECOVERY_ATTEMPT_CAP = 8` (`:66`).                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Landed                       |
| Restore key and the stable-identity refusal | `PersistedPanel` (`crates/bitty-ui/src/panel_persist.rs:267`) carrying `PanelRestoreKey` (`:239`); `PERSIST_MANIFEST_VERSION = 2` (`:55`); `plan_restore` (`:472`) refuses `ManifestError::StableIdentityUnsupported` (`:151`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Landed, no production caller |
| Bulk dispose by workspace                   | `dispose_workspace_panels` (`registry/panel.rs:2631`, facade `registry/host.rs:409`), reachable from the workspace close path.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Landed                       |
| Overlay attribution                         | `create_panel_overlay` (`registry/panel.rs:2768`) with the app-owned `SceneHost` writer; release through the edge release. The plugin-facing `panel.overlay` verb does **not** exist — the string is only a grant (`crates/bitty-plugin-host/src/capability.rs:217`).                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Landed in part; verb absent  |
| Generation state machine                    | `PluginState` with `Declared/Resolved/Registered/Activated/Suspended/Disposed` in `crates/bitty-plugin-host/src/registry.rs:87`, with `resolve` (`:226`), `register` (`:513`), `activate` (`:555`), `suspend` (`:578`), `dispose` (`:619`), `reload` (`:669`). The enforcer's separate `PluginLifecycleStatus` (`Active/Suspended/Disabled`) is at `crates/bitty-plugin-host/src/lifecycle.rs:141`.                                                                                                                                                                                                                                                                                                                    | Landed                       |
| FS-6 reload ordering                        | `reload_generation` in `crates/bitty-plugin-host/src/lifecycle.rs:473` disposes `old` before activating `new` and restores `old` when activation fails.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Landed                       |
| Panel-generation port                       | `PanelGenerationPort` (`crates/bitty-runtime/src/plugin_runtime/panel_generation.rs:211`) with `release_generation` (`:221`) and `bind_successor` (`:231`); `CONTROLLER_GENERATION_BASE` (`:106`) and the total `controller_generation` mapping (`:117`) keep the plugin `u32` counter out of the allocation-epoch domain; one `PanelEdgeReport` (`:171`) per edge.                                                                                                                                                                                                                                                                                                                                                    | Landed                       |
| Runtime wiring                              | `PluginRuntime.panel_generation_port` (`crates/bitty-runtime/src/plugin_runtime/mod.rs:870`), `set_panel_generation_port` (`:1822`), `release_panel_generation` (`:1846`, called at `:3863` inside `dispose_inner` (`:3818`) — the single teardown that `dispose`, unload, disable, and `reload_inner`'s teardown (`:4034`) all reach — and again from the crash rollback at `:5155`), `bind_panel_generation` (`:1872`, called at `:4070` only after the teardown returned and the successor activated). `suspend_inner` (`:3690`) asks the port for nothing, which is Decision 3.1: a suspended controller detaches but keeps its container. The port is asked for `release_generation` from the teardown path only. | Landed                       |
| App-installed port                          | `AppPanelGenerationPort` (`crates/bitty-terminal/src/plugin_runtime.rs:809`, `impl` at `:829`, `release_generation` at `:830`, `bind_successor` at `:862`), installed at `:1226` beside the scene host; it delegates to the registry's bound/rebound containers and never receives a panel host, a renderer, or a panel id a plugin can choose.                                                                                                                                                                                                                                                                                                                                                                        | Landed                       |
| Scene-panel path (out of container scope)   | `HostPanel { owner, epoch }` (`crates/bitty-runtime/src/scene_host.rs:159`), `ensure_panel` refuses a foreign owner or stale epoch (`:458`), `release_owner` (`:365`) → `release_panel` (`:530`) disposes that panel; reached from `PluginServices::clear_ui_blocks` (`crates/bitty-runtime/src/plugin_runtime/services.rs:3286`, call at `:3292`).                                                                                                                                                                                                                                                                                                                                                                    | Landed                       |
| `bitty.panel.create` first binding          | `PanelCreateOrigin` (`crates/bitty-runtime/src/plugin_runtime/services.rs:850`), handler type (`:879`), backend (`crates/bitty-terminal/src/plugin_runtime.rs:701`) writing the first binding through `rebind_panel` (`:746`) and failing closed with `E_UI_UNAVAILABLE` (`:723`) when no workspace resolves.                                                                                                                                                                                                                                                                                                                                                                                                          | Landed                       |
| Consent set on the reload bind              | `bind_panel_generation` passes an empty consent set, so every widening is denied rather than granted.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Empty by construction        |
| `bitty.panel.close` / `bitty.panel.destroy` | Both answer `not_implemented` (`crates/bitty-runtime/src/plugin_runtime/services.rs:7872`, `:7880`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Absent                       |
| Production restore caller                   | `plan_restore` has no production caller; its only non-test references are the re-export at `crates/bitty-ui/src/lib.rs:278` and tests.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Absent                       |
| Conformance matrix                          | `crates/bitty-runtime/tests/panel_generation_ownership.rs` carries the coverage map naming a home per row; the rows still without a home are named by the file rather than implied covered.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Landed in part               |

What this status section does not say: it does not say the decision is
implemented. Every mechanism above predates this ADR and was built against the
direction the sibling decision record carries; this ADR records the owner-level
decision, not a conformance audit.

## Relationship to the sibling decision record

The
[Panel Generation Ownership Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-generation-ownership-decision.md)
(`status: draft`) is the detail record and remains authoritative for:

- the normative rule text of Decisions A through E, including the tool or
  placeholder-type guarantees, the tombstone key and capacity rules, the phase
  order of the bind, the permission-diff consent mechanics, and the full reason
  vocabulary;
- the residual ledger for `bitty#2476`, with per-residual status, symbol, and
  landing commit;
- the twenty-three-row conformance matrix (`PGO-1` to `PGO-23`) and each row's
  "fails for the wrong implementation that…" discriminator;
- the review history, the open follow-ups, and the owner-acceptance checklist.

This ADR adds the owner-level decision that record is waiting on, and it is the
document the open-question register can cite. Three limits keep the two from
diverging:

1. **No restatement of rule text.** Where this ADR states a rule and the detail
   record states the same rule, the record's text is authoritative; a conflict is
   a defect in this ADR.
2. **No row renumbering.** The `PGO` identifiers are the record's and this ADR
   only cites them.
3. **Acceptance is separate.** Accepting this ADR accepts the direction; the
   detail record stays `draft` until its own acceptance checklist clears, so
   neither document claims the other's status.

## Affected contracts

- `OQ-084` residual: this ADR is the evidence that the `GenerationId` fencing
  contract ADR 0013 parked now exists for panels. The register row stays owned
  by the closing ADR 0013 and is amended, not reopened, by a reference here.
- The [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md):
  unchanged in its lifecycle, addressing, and capability family; the unbound
  state composes with it as a fact about the binding.
- The [Plugin Host Runtime RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/plugin-host-runtime-rfc.md):
  FS-6 and A.5 stay authoritative and are not extended; this ADR states only
  what the panel side does inside that ordering.
- [ADR 0013](ADR-0013-core-ontology-identity.md): extended by this ADR at its
  open point on `GenerationId` mechanics. Its ontology and ID relations are not
  restated or altered.
- [Threat model](../../security/threat-model.md) row `T-25` and the
  [Security overview](../../security/overview.md) invariants: the authority rules in
  Decision 4 are the panel-side enforcement shape; no invariant is weakened.
- [ADR 0014](ADR-0014-workspace-core-presentation-plugins.md): unaffected. The
  workspace remains the owner of panels, which this ADR relies on rather than
  decides.
- [Decision register](../index.md) and [ADR index](README.md): route to
  this ADR.

## Open points

- The persistence contract: record fields, manifest version policy, the
  index-to-`WorkspaceId` resolution at restore, and whether restart restore
  ships. This ADR fixes a key it cannot yet encode.
- The plugin-facing verb set a rebound generation regains. `bitty.panel.close`
  and `bitty.panel.destroy` are unimplemented host seams, and `panel.overlay`
  has no backend, so the recovery surface is narrower than the decision allows.
- Whether a _different_ plugin may ever claim a persisted panel, and under what
  consent surface. This ADR states no rule for cross-owner adoption.
- How panel-level lease and handoff semantics (OQ-083) compose with the
  controller binding now that acceptance fixes them as distinct.
- The operator surface and exact diagnostic spelling for the reason vocabulary
  beyond the close-side mapping.
- Implementation remains a follow-up across `bitty`; no code is authorized,
  changed, or claimed by this ADR.

## References

- [bitty#2476](https://github.com/bitty-terminal/bitty/issues/2476) — the issue
  whose six bullets and six acceptance scenarios this ADR answers.
- [Panel Generation Ownership Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-generation-ownership-decision.md)
  (draft) — the detail record this ADR formalizes at the decision level.
- [ADR 0013 - Core Ontology and Identity Model](ADR-0013-core-ontology-identity.md)
- [ADR 0014 - Workspace as Core Mechanism with Plugin-Only Presentation](ADR-0014-workspace-core-presentation-plugins.md)
- [Open-question register](../open-questions.md) — `OQ-084` and the dependent
  `OQ-058`, `OQ-061`, and `OQ-083` rows.
- [Security overview](../../security/overview.md), [Threat model](../../security/threat-model.md)
  (`T-25`), and [Risk register](../../security/risk-register.md).
