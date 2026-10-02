---
title: Legacy Chrome Retirement
description: Accepted W-74 contract that assigns an owner and disposition to every legacy tab-strip, scratchpad, and workspaceline path, and defines behavior parity, the no-plugin baseline, and the removal gates
category: development
audience: contributor
document_type: specification
status: accepted
website_publish: true
sidebar_order: 31
---

# Legacy Chrome Retirement

## Document status

Accepted focused contract. This document is the `W-74` deliverable that
[ADR 0015 - Small-Core Extraction Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
parked in its Boundary 5 and Open points, under the plugin-only presentation
decision of
[ADR 0014 - Workspace as Core Mechanism with Plugin-Only Presentation](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0014-workspace-core-presentation-plugins.md).
It audits every legacy tab-strip, scratchpad, and workspaceline path, assigns
each an owner and a disposition, defines behavior parity and the no-plugin
baseline, and states the deprecation and removal criteria that gate the
retirement tasks.

This document authorizes no implementation and describes no implemented
behavior. Where it names current source files, it records their location as
evidence of where the code lives today, not as acceptance that any boundary is
already implemented and not as compatibility evidence. The `bitty` workspace
carries working implementations of several paths named here; that is
current-location evidence only. Every disposition below is a contract direction
for a later, separately tracked task, and nothing is `Verified`. Frontmatter
`status` is `accepted` per the repository metadata schema; document status is
Accepted.

- Owning task: `W-74` (bitty-docs), CarryCtx `CTX-0263`, Issue
  [bitty-docs#403](https://github.com/bitty-terminal/bitty-docs/issues/403).
- Predecessor decisions:
  [ADR 0014](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0014-workspace-core-presentation-plugins.md)
  (plugin-only workspace presentation) and
  [ADR 0015](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
  (Boundary 5, legacy chrome; the `W-74` park).
- Related: the
  [small-core refactor execution handoff](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/handoff/2026-10-02-small-core-refactor.md).
- Downstream owners named but not decided here: `W-26` and `W-27` (legacy
  chrome migration), `W-40` (independent bar review), `W-51` (registry
  migration), `W-104` (bitty Core legacy-chrome retirement), `W-83` (terminal
  documentation synchronization), and the `bar` and `statusline` first-party
  presentation plugins.

## Purpose and scope

This specification decides the remaining ownership of legacy workspace
presentation after ADR 0014 made workspace presentation plugin-only and ADR
0015 accepted the legacy-chrome boundary in direction. It exists because the
Core tree still contains source files and compatibility paths that predate the
plugin-only split, and a retirement cannot proceed until each path has an owner
and a disposition, and until parity and the zero-plugin behavior are defined.

In scope:

- a disposition for every legacy path: the `tab_strip`, `scratchpad`, `tabs`,
  and `workspace` modules, the bundled workspace and tabs manifests and their
  aliases, the transitional workspaceline and status-bar presentation, the
  generic chrome band and presentation-state mechanisms, the legacy
  `workspace.show_bar` and `workspace.bar.edge` settings, and the compatibility
  alias paths;
- the retained Core mechanism, stated as what Core keeps when the legacy
  presentation is removed;
- the definition of behavior parity and of the no-plugin baseline;
- the deprecation and removal criteria, tied to `W-26`, `W-27`, `W-40`, and
  `W-104`;
- the reference to the `W-40` bar review and to the `bitty-plugins` registry
  state, without deciding either;
- the downstream owners and the security, verification, and acceptance gates.

Out of scope and not decided here:

- the content, scope, or interface of the `bar` and `statusline` plugins, and
  which of them enters the enabled-by-default set;
- the `W-40` bar review outcome and the `W-51` registry migration; this document
  references them and does not pre-empt them;
- the exact spellings of the workspace read API, lifecycle events, capability
  names, and command namespace, which stay open under `OQ-056`;
- the per-window versus per-workspace tab order and the surrounding
  native-window-form questions, which stay open under `OQ-052`;
- the candidate scene, identity, and never-empty modules whose owning RFCs are
  not this decision;
- any implementation, migration, manifest removal, or code deletion.

Nothing here weakens a normative security control. Where a control or threshold
appears to need change, it is recorded under "Open points" instead.

## Normative sources this specification must not weaken

This boundary must be read together with, and must not weaken:

- The [security overview](../security/overview.md), the
  [threat model](../security/threat-model.md), the risk register, and the
  [P0 security acceptance criteria](../security/p0-acceptance-criteria.md),
  which stay authoritative for every trust boundary named here.
- [ADR 0014 - Workspace as Core Mechanism with Plugin-Only Presentation](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0014-workspace-core-presentation-plugins.md):
  workspace is a Core mechanism, presentation is plugin-only, and `bitty --safe`
  has no built-in minimal bar.
- [ADR 0015 - Small-Core Extraction Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md):
  Boundary 5 and its binding constraints, including retained Core mechanisms
  and the prohibition on a private first-party bypass.
- [ADR 0016 - Execution, Graphics, Accessibility, Storage, and Platform-Service
  Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md):
  the adjacent `W-130` boundary set; it contributes no legacy-chrome constraint.
- The accepted
  [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md)
  and
  [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md),
  which fix the public extension surfaces a presentation plugin may use.
- The candidate
  [Chrome Surface API](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/chrome-surface-api-candidate.md)
  and
  [Sparse Workspaces and Unified Chrome Bar Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/sparse-workspace-unified-bar-candidate.md),
  whose ownership direction ADR 0014 accepts while their spellings stay
  candidate.

## Terminology

- **Legacy chrome**: the Core-resident workspace and tab presentation that
  predates ADR 0014, together with its compatibility aliases and settings.
- **Retained Core mechanism**: a Core-owned, always-available primitive that
  works with zero plugins and in `bitty --safe`.
- **Plugin policy**: optional presentation a plugin supplies using only the
  public, capability-gated API; a first-party plugin uses the same surfaces and
  receives no private bypass.
- **Behavior parity**: the replacement reproduces the user-visible behavior of
  the legacy surface, or provides an accepted alternative, for every operation
  and interaction named under "Behavior parity" below.
- **No-plugin baseline**: what Bitty does with zero bar, status, or other
  presentation plugins enabled, stated under "The no-plugin baseline" below.
- **Transitional**: present today but intended for removal once parity exists;
  transitional does not mean accepted permanent behavior.
- **Compatibility alias**: a deprecated identifier, claim, command spelling, or
  constant kept only so stored grants, scripts, and third-party claimants keep
  working during a documented window (for example the `bitty-terminal.tabs`
  id, the `tabline` claim, and the `TABS_*` aliases).
- **Exclusive claim**: a UI claim that only one plugin may hold at a time; ADR
  0014 removes Core's need to reserve the `workspaceline`/`tabline` claim for a
  single owner.

## Retained Core mechanism

Core retains the following when the legacy presentation is removed. Nothing
described here is deleted by this decision.

1. **Workspace lifecycle and state.** `WorkspaceId` identity, create, close
   (including the kill-confirm and PTY teardown path), rename, focus and
   switch, order and reorder, moving panels between workspaces, the active
   workspace per window, capacity bounds, and the never-empty invariant stay in
   Core. Workspace operations are Core commands in the executable registry, and
   key bindings, the CLI (`bitty ctl workspace ...`), IPC, Lua, and plugin
   clicks all invoke the same Core commands.
2. **Panel and layout primitives.** `LayoutNode` composition, `View`, `ViewId`,
   `PanelId`, the panel and terminal registries, and the panel lifecycle are
   retained; they are the mechanism every bar, tab strip, sidebar, or status
   plugin presents over.
3. **Generic chrome mechanism.** Edge-band reservation, rendering and
   hit-testing of mounted declarative UI trees, and click-to-command routing
   stay in Core as generic, non-workspace-specific mechanism. Core draws no
   workspace presentation of its own.
4. **Workspace observation and control surfaces.** Core publishes a bounded,
   read-only workspace snapshot and lifecycle events, and exposes workspace
   commands, gated by separate read and control capabilities; read never
   implies control.
5. **Hidden scratchpad slot.** The per-window scratchpad slot that stores a
   detached leaf out of the layout tree is retained as workspace and panel
   state, not as chrome; its Core command remains available.
6. **Presentation-state mechanism.** Presentation mode (tiled, floating,
   fullscreen, scratchpad), the never-empty guard, and stable panel identity
   remain Core mechanisms subject to their own owning RFCs.

## Legacy path audit and disposition

Each row names a path by its current location in the `bitty` tree, the role the
source plays today, the owner of the retirement, and the disposition. A
disposition of "retain" means Core keeps it; "move to plugin" means the
behavior is plugin presentation policy over retained Core primitives; "retire"
or "deprecate" means removal under the gates in "Deprecation and removal
criteria". The current locations are evidence of where the code lives today,
not a claim that any disposition has been executed.

| Legacy path                                                                                                                 | Current role (source evidence)                                                                                                         | Owner                                                                           | Disposition                                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `crates/bitty-runtime/src/workspace.rs`                                                                                     | First-party `bitty-terminal.workspace` policy and observation helpers over the generic Panel Runtime                                   | bitty Core (`W-104`)                                                            | Retire the first-party manifest policy path after parity; the lifecycle and state it summarizes are retained separately (see `runtime/workspaces.rs`), and its pure observation helpers are retired or re-homed only when no consumer remains. |
| `crates/bitty-runtime/src/tabs.rs`                                                                                          | Deprecated `tabs` alias shim delegating to the canonical `workspace` module                                                            | bitty Core (`W-104`)                                                            | Deprecate and remove at the documented `>= v0.2.0` alias boundary, after the `bitty-terminal.tabs` compatibility window closes; do not delete ahead of the window.                                                                             |
| `crates/bitty-ui/src/tab_strip.rs`                                                                                          | Candidate headless tab-order projection (strip, scope, cells, snapshot and restore); per-workspace versus per-window order open        | bar presentation plugin; bitty Core (`W-104`) for the Core-side removal         | Move to plugin policy: panel tabs inside one workspace are plugin presentation over Core panel and workspace primitives. Retire the Core module once parity exists.                                                                            |
| `crates/bitty-ui/src/scratchpad.rs`                                                                                         | Hidden per-window scratchpad slot that stores a detached leaf, stamps its mode, and restores it; never paints                          | bitty Core (workspace and panel state)                                          | Retain as a Core slot and state mechanism. Any visible indicator, toggle UX, or status presentation moves to the bar or statusline plugin; the toggle stays a Core workspace command.                                                          |
| `crates/bitty-plugin-host/src/bundled.rs`                                                                                   | Bundled manifest-only `bitty-terminal.workspace` and `bitty-terminal.tabs` entries, `workspaceline` and `tabline` claims, and commands | bitty Core (`W-104`); replacement registration is a separate first-party plugin | Retire after parity: remove the deprecated manifest and alias, drop the exclusive `workspaceline` and `tabline` claim, and keep the workspace commands in the Core command namespace.                                                          |
| `crates/bitty-runtime/src/runtime/workspaces.rs`                                                                            | Core workspace lifecycle and state plus the transitional text workspaceline, status-bar text, hit-test, click, and band reservation    | bitty Core (`W-104`) for the presentation; lifecycle and state retained         | Split: retain lifecycle, state, and command handling; retire the transitional workspaceline and status-bar presentation once a first-party presentation plugin covers it (ADR 0014).                                                           |
| `crates/bitty-runtime/src/runtime/band_slots.rs`                                                                            | Generic chrome band mechanism: edge reservation, mount routing, stacked band rows, per-edge geometry                                   | bitty Core                                                                      | Retain: this is the generic chrome mechanism presentation plugins use and is not workspace-specific.                                                                                                                                           |
| `crates/bitty-ui/src/presentation.rs`                                                                                       | Panel and leaf presentation-state mechanism, including presentation and floating commands                                              | bitty Core                                                                      | Retain: presentation state is mechanism, not chrome; the scratchpad mode is slot state.                                                                                                                                                        |
| `crates/bitty-ui/src/workspace_guard.rs`, `crates/bitty-ui/src/panel_identity.rs`, `crates/bitty-ui/src/workspace_scene.rs` | Candidate never-empty guard, stable panel identity, and candidate scene model                                                          | owning RFCs (not `W-74`)                                                        | Out of scope: these candidates are accepted or rejected by their owning RFCs; this decision neither retains nor retires them. The scratchpad stays a special hidden slot and adds no scene layer.                                              |
| `crates/bitty-term-state/src/tabs.rs`                                                                                       | Terminal tab-stop state (VT tab columns)                                                                                               | bitty Core                                                                      | Retain: a terminal mechanism unrelated to workspace tabs; listed only to disambiguate the name.                                                                                                                                                |
| Config `workspace.show_bar` and `workspace.bar.edge`                                                                        | Legacy Core visibility and edge settings for the transitional bar                                                                      | bitty Core (`W-104`); replacement mapping owned by the first-party bar plugin   | Deprecate with the transition: map to the first-party plugin settings with a deprecation window or remove alongside the workspaceline; introduce no new Core bar-appearance keys (ADR 0014).                                                   |

### Compatibility and alias paths

The bundled workspace entry carries a deprecated `bitty-terminal.tabs` plugin
id and `bitty-terminal.tabs:*` command aliases, a deprecated `tabline` claim
alias, and deprecated `TABS_*` constants and `TabsIntegration` functions in
`crates/bitty-runtime/src/tabs.rs`. All of these are compatibility aliases, not
mechanisms. They are deprecated under the same `>= v0.2.0` window as the
`tabs` module and are removed with the bundled manifest after parity; until
then they resolve to the canonical workspace names and grant no extra
authority. Test-only aliases carry no compatibility promise and are not part of
this window.

The accessibility chrome node kind that names a tab strip is a generic
accessibility classification, not workspace presentation; it is retained with
the generic chrome mechanism. The `bitty.ui` mount path continues to reject
unhosted band slots rather than silently dropping them.

## Behavior parity

Parity is the first removal gate. For every legacy surface being retired, the
replacement must reproduce the user-visible behavior below, or provide an
accepted alternative, before the corresponding path is removed. Parity is
demonstrated by the owning implementation task and confirmed by the independent
review (see "Bar review and registry state" and "Deprecation and removal
criteria"); no path is removed on the strength of a candidate document alone.

1. **Workspace navigation.** Create, close (with the existing kill-confirm and
   PTY teardown), rename, next, previous, last, focus by index, and reorder are
   reachable from key bindings, the CLI, IPC, Lua, and plugin clicks through the
   same Core commands, with the same capacity bounds and the same never-empty
   invariant.
2. **Workspace presentation.** The replacement represents the same workspace
   information the transitional line carries: the ordered workspace sequence,
   the active-workspace marker, and the workspace count, within the same title
   and name bounds. A workspace bar, tab strip, sidebar, or status segment are
   alternative presentations of that state; none is built into Core.
3. **Pointer interaction.** A click on a workspace target focuses it, and any
   close affordance arms the existing kill-confirm path, with the same
   fail-closed rules: separators, the trailing count, an out-of-range column,
   and the already-active workspace change no state, and a lone workspace can
   never switch away from itself.
4. **Persistence.** Workspace names, order, and the active workspace are
   restored by Core (workspace persistence is a Core concern under ADR 0013),
   independently of whether any presentation plugin is enabled.
5. **Bounds and capabilities.** The replacement preserves the existing
   capacities and bounds and adds no authority: presentation uses the public,
   capability-gated surfaces, read never implies control, and there is no
   private first-party bypass for an official plugin.
6. **Safe and headless behavior.** `bitty --safe` and headless runs keep every
   workspace operation and draw no built-in bar; parity for presentation is
   required only where a presentation plugin is enabled.

## The no-plugin baseline

The no-plugin baseline is Bitty with zero bar, status, or other presentation
plugins enabled, including `bitty --safe`. It must satisfy the following.

1. **Workspaces are fully usable.** Every workspace operation works through
   commands and key bindings, and `bitty --safe` keeps every workspace
   operation. No workspace behavior depends on the plugin system.
2. **Core draws no workspace presentation.** No workspace bar, no tab strip, no
   vertical sidebar, and no workspace pills. Every edge band reserves zero
   space, and the terminal grid receives the full window. Safe mode has no
   built-in minimal bar.
3. **The scratchpad slot remains available.** The hidden slot and its Core
   toggle command remain as workspace state; with no presentation plugin there
   is no visible indicator for it.
4. **No plugin dependency.** The baseline does not depend on the plugin
   runtime, event delivery, or plugin request queue: with the plugin system
   disabled or absent, the same workspace lifecycle, state, commands, and
   scratchpad behavior hold.
5. **The transitional line is the only exception.** While the transitional
   workspaceline is still present, it may draw; it is explicitly transitional
   and is removed once a first-party presentation plugin reaches parity. After
   removal, the baseline is a plain terminal window with workspaces reachable
   from the keyboard and CLI, comparable to a tiling window manager with no bar.

## Deprecation and removal criteria

No legacy path is removed until every gate below that applies to it is
satisfied and recorded. This decision (`W-74`) satisfies the ownership gate
only; it does not satisfy the parity, review, migration, or regression gates.

1. **Ownership and disposition (`W-74`, this document).** Every path has an
   owner and a disposition, as tabulated above.
2. **Behavior parity.** The replacement reproduces the behavior in "Behavior
   parity", or an accepted alternative is recorded, before the path is removed.
3. **Independent bar review (`W-40`).** The `W-40` bar review confirms that the
   first-party presentation plugin reaches parity, that the no-plugin baseline
   holds, and that no presentation behavior regressed. `W-104` does not start
   before `W-40`, `W-74`, and `W-83` are complete.
4. **Migration (`W-26`, `W-27`).** The legacy-chrome migration steps remove or
   map the compatibility aliases and the `workspace.show_bar` and
   `workspace.bar.edge` settings under a documented deprecation window. Their
   exact scope is owned by those tasks and is not fixed here.
5. **No regression.** The regression suite covers the no-plugin baseline, the
   safe-mode path, workspace navigation and persistence, scratchpad
   hide/show/toggle, and the capacity bounds; repository-local gates and CI are
   green on the removal revision.
6. **Deprecation window.** Compatibility aliases are removed only at the
   documented boundary (the `>= v0.2.0` window for the `tabs` module, the
   `bitty-terminal.tabs` id, and the `tabline` claim); settings keys are mapped
   or removed with a documented transition. A flag-day removal is not allowed.
7. **Documentation synchronization (`W-83`, `W-80` through `W-84`).**
   Affected architecture, specification, product, and reference pages are
   synchronized before the retirement task completes.
8. **Independent review and CI.** `W-104` requires independent review and
   passing CI; a green build is an acceptance gate, not a substitute for
   review.

Removal order: the first-party presentation plugin reaches parity (`W-40`);
the aliases and settings are migrated or mapped (`W-26`, `W-27`); the
transitional workspaceline, the bundled manifests, and the Core-side candidate
tab-strip module are removed (`W-104`); Core keeps the retained mechanism
listed above. No step removes a retained mechanism.

## Bar review and registry state

This document references the bar review and the plugin registry state without
deciding either.

- **`W-40` bar review.** `W-40` is the independent review that gates the legacy
  chrome boundary; with the registry migration `W-51`, it is a prerequisite for
  `W-122` (bar onboarding). Its outcome is not decided here, and `W-104` waits
  on it.
- **Registry state (`bitty-plugins`).** The plugin registry and store are owned
  by the `bitty-plugins` repository and its documentation. In the current
  ecosystem state, `statusline` is an official registered first-party package
  with a registry entry, while `bar` is documented and scaffolded but is not an
  official registry entry; `W-122` owns its onboarding. This specification does
  not register, pin, or decide any plugin. Which first-party package covers the
  transitional line first, and whether any presentation plugin enters the
  enabled-by-default set, stay with the `W-40` review and the accepted Default
  Distribution RFC.
- **Claims.** Core reserves no exclusive `workspaceline` or `tabline` claim
  after retirement; the registry decides which first-party package or packages
  register and how alternatives coexist.

## Downstream ownership

This specification fixes who owns the remaining work; it does not decide their
content.

- **`W-104` (bitty Core legacy-chrome retirement)** owns the actual Core
  removals: the transitional workspaceline and status-bar presentation, the
  bundled workspace and tabs manifests and aliases, and the Core-side candidate
  tab-strip module, after `W-40`, `W-74`, and `W-83`. It must not remove the
  retained Core mechanism.
- **`W-26` and `W-27` (legacy-chrome migration)** own the alias and settings
  migration under the deprecation windows.
- **`bar` first-party plugin** owns the unified bar presentation content, if
  adopted; its content is not decided here.
- **`statusline` first-party plugin** owns the statusline and workspaceline
  status presentation content; its content is not decided here.
- **`W-122` (bar onboarding)** owns the independent review and registry
  migration (`W-51`) for `bar`; it stays gated on `W-40` and `W-51`.
- **`W-83` and `W-80` through `W-84`** own the downstream documentation
  synchronization once this contract is accepted.

## Security review

The legacy-chrome boundary touches the plugin trust boundary, safe-mode
behavior, and the capability model that the security overview governs.
Independent security review is required before this specification merges. The
security reviewer confirms that:

- no P0 control is weakened, and the safe-mode startup path
  ([P0-AC-019](../security/p0-acceptance-criteria.md)) keeps zero third-party
  plugins and every workspace operation;
- presentation uses only the public, capability-gated API, read never implies
  control, and no private first-party bypass is introduced for an official
  plugin;
- retaining the scratchpad slot as Core state grants no new capability and does
  not bypass the panel, workspace, or input rules;
- removing the transitional presentation cannot remove a security enforcement
  point, because the retained mechanism and the permission checks stay in Core;
- no later focused contract or retirement task may weaken a P0 control.

The downstream implementation and retirement tasks (`W-26`, `W-27`, `W-104`,
and the presentation plugins) each require security review again before their
own merge where they touch a trust boundary.

## Verification plan

This is a contract specification; it has no executable verification of its own.
Any later implementation or retirement of this boundary must prove, at minimum:

1. **No-plugin baseline.** With zero presentation plugins, every workspace
   operation works from key bindings and the CLI, every edge band reserves zero
   rows, and `bitty --safe` behaves identically.
2. **Parity.** The replacement presentation reproduces the workspace sequence,
   active marker, count, click-to-focus, and close-confirm behavior within the
   retained bounds, demonstrated headlessly.
3. **Fail-closed interaction.** Separators, the count suffix, out-of-range
   columns, and the active workspace change no state, including the
   single-workspace case.
4. **Deprecation windows.** Compatibility aliases still resolve during the
   window and are removed only at the documented boundary; settings are mapped
   or removed with the documented transition.
5. **No regression.** The regression suite covers workspace navigation,
   persistence, and the scratchpad hide/show/toggle round trip, and stays green
   on the removal revision.
6. **Bounds preserved.** Workspace, view, panel, name, and title bounds are
   unchanged, and no new authority is granted.
7. **Retained mechanism.** Removing the presentation leaves the workspace
   lifecycle, state, commands, panel primitives, and generic chrome mechanism
   intact.
8. **Cross-platform evidence.** Baseline and parity behavior are supported by
   CI or explicit platform evidence.
9. **Documentation gates.** The repository-local `just check` passes with zero
   issues, and affected cross-repository pages are synchronized.

## Alternatives considered

| Alternative                                                          | Disposition                                                                                                                                                                              |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Retire the whole workspace subsystem, including state and scratchpad | Rejected: contradicts ADR 0014, which keeps workspace lifecycle and state plus panel primitives in Core and requires a working no-plugin baseline.                                       |
| Keep a Core-drawn tab strip or workspace bar                         | Rejected by ADR 0014: it hard-codes one presentation into Core, blocks alternative bars and no-bar setups, and breaks the zero-plugin baseline.                                          |
| Move the scratchpad slot to a plugin                                 | Rejected: the slot stores a detached leaf and owns layout state, so a plugin would need a private layout bypass; it is Core state, and only its presentation is plugin policy.           |
| Delete the candidate tab-strip module before parity                  | Rejected: removal requires the parity and review gates; a candidate with no replacement evidence is retired only after `W-40` and `W-104`.                                               |
| Remove the compatibility aliases in a flag-day change                | Rejected: stored grants, scripts, and third-party claimants need the documented `>= v0.2.0` window; a flag-day removal breaks them without a migration.                                  |
| Let a plugin own the workspace commands                              | Rejected: workspace operations are Core commands; moving them behind the plugin system would make keyboard and CLI control depend on plugin availability and remove them from safe mode. |
| Decide the bar and statusline content inside this document           | Rejected: their content belongs to their owning plugins and repositories; this document only assigns Core-side ownership and disposition.                                                |

## Affected contracts

- [ADR 0015 - Small-Core Extraction Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md):
  Boundary 5 and its `W-74` park now have their deliverable; the dependency
  order (`W-74` then `W-104`, after `W-40` and `W-83`) is unchanged.
- [ADR 0014 - Workspace as Core Mechanism with Plugin-Only Presentation](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0014-workspace-core-presentation-plugins.md):
  the retirement sequence this document audits.
- [ADR 0016 - Execution, Graphics, Accessibility, Storage, and Platform-Service
  Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md):
  the adjacent `W-130` boundary set; it does not constrain legacy chrome.
- [Small-core refactor execution handoff](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/handoff/2026-10-02-small-core-refactor.md):
  `W-74` now has its deliverable; `W-26`, `W-27`, `W-40`, `W-51`, `W-104`,
  `W-122`, and `W-83` keep their recorded dependencies.
- Candidate terminal-platform specifications
  [Chrome Surface API](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/chrome-surface-api-candidate.md),
  [Chrome Band Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/chrome-band-contract-candidate.md),
  [Panel and Workspace Interaction](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-workspace-interaction-candidate.md),
  [Status System](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/status-system.md),
  [Tabs Scope Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/tabs-scope-decision.md),
  and
  [Sparse Workspaces and Unified Chrome Bar Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/sparse-workspace-unified-bar-candidate.md):
  this document does not change their candidate state or spellings.
- Plugin-ecosystem pages
  [Plugin Roadmap](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/product/plugin-roadmap.md),
  [Bundled-Plugin Split Decision](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/product/bundled-plugin-split-decision.md),
  [Bar plugin documentation](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/docs/plugins/bar/README.md),
  and
  [Statusline plugin documentation](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/docs/plugins/statusline/README.md):
  the plugin-side content stays owned by those repositories.
- [Development index](README.md), [documentation workflow](documentation-workflow.md),
  the [decision register](../decisions/index.md), and the
  [open-question register](../decisions/open-questions.md).

## Open points

The following details are parked, not decided. Each park names the owning task
and the reason. None is a new global open question: none blocks the current
milestone, and no implementation evidence forces one yet.

- **First covering plugin and settings mapping** parked to `W-104` and the
  first-party presentation plugin: which plugin covers the transitional line
  first, and how `workspace.show_bar` and `workspace.bar.edge` map to its
  settings. This is an ADR 0014 open point, not resolved here.
- **Deprecation-window mechanics** parked to `W-26` and `W-27`: the exact
  window length and the migration path for settings and aliases.
- **Fate of the candidate tab-strip module** parked to the `bar` plugin's
  owning RFC and `W-104`: whether its projection moves into a plugin or is
  dropped, once parity exists.
- **Tab order scope** stays open under `OQ-052`: per-window versus
  per-workspace order and the surrounding native-window-form questions are not
  decided here.
- **API and event spellings** stay open under `OQ-056`: the workspace read API,
  lifecycle events, capability names, and command namespace are not fixed here.
- **Scratchpad scene layer** parked to the owning scene RFC: whether the
  scratchpad becomes a scene layer stays open; this decision keeps the special
  hidden slot.

## Acceptance criteria

- Every legacy path in "Legacy path audit and disposition" has an owner and a
  disposition, including the compatibility and alias paths and the legacy
  settings.
- Behavior parity is defined for every retired surface, and the no-plugin
  baseline is defined, including safe mode and the plugin-absent case.
- The deprecation and removal criteria are documented and tied to `W-26`,
  `W-27`, `W-40`, and `W-104`, with the `>= v0.2.0` alias window stated.
- The `W-40` bar review and the `bitty-plugins` registry state are referenced
  without being decided.
- Core is stated to retain the workspace lifecycle and state, the panel and
  layout primitives, the generic chrome mechanism, and the hidden scratchpad
  slot, and nothing is deleted by this decision.
- The `bar` and `statusline` plugins and the `W-104`, `W-26`, `W-27`, `W-83`,
  and `W-122` tasks are named as downstream owners without their content being
  decided.
- No path is described as implemented; current file locations are recorded as
  evidence only.
- The `security-architect` sign-off is named and required before merge, and no
  P0 control is weakened.
- The document is self-contained and contains no research-archive reference.
- `just check` passes with zero issues.

## P0 Review Sign-off

| Role                 | Scope                                                                             | Requirement                                                                  |
| -------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `architecture-owner` | Ownership, retained Core mechanism, and boundary correctness                      | Approve; confirms the disposition table and retained mechanism.              |
| `security-architect` | Plugin trust boundary, capability model, safe mode, and no private bypass         | Independent security sign-off is required before merge.                      |
| `docs-curator`       | Taxonomy, metadata, links, terminology, deprecation, and register synchronization | Approve; confirms schema, discoverability, and untouched P0 control wording. |

## References

- [bitty-docs#403](https://github.com/bitty-terminal/bitty-docs/issues/403)
  (CarryCtx `CTX-0263`, plan key `W-74`).
- [ADR 0014 - Workspace as Core Mechanism with Plugin-Only Presentation](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0014-workspace-core-presentation-plugins.md)
  and
  [ADR 0015 - Small-Core Extraction Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
  (Boundary 5; binding constraints).
- [ADR 0016 - Execution, Graphics, Accessibility, Storage, and Platform-Service
  Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md)
  (adjacent `W-130` boundary set).
- [Small-core refactor execution handoff](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/handoff/2026-10-02-small-core-refactor.md).
- [Security overview](../security/overview.md),
  [threat model](../security/threat-model.md), and
  [P0 security acceptance criteria](../security/p0-acceptance-criteria.md)
  (`P0-AC-019`).
- [Development index](README.md), [documentation workflow](documentation-workflow.md),
  [decision register](../decisions/index.md), and
  [open-question register](../decisions/open-questions.md).
