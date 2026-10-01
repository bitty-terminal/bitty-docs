---
title: ADR 0014 - Workspace as Core Mechanism with Plugin-Only Presentation
description: Records the owner decision that Workspace is a Core mechanism while every workspace bar, tab strip, and sidebar is an optional plugin, following the compositor-and-bar split
category: decisions
audience: contributor
document_type: specification
status: accepted
website_publish: true
sidebar_order: 44
---

# ADR 0014 - Workspace as Core Mechanism with Plugin-Only Presentation

## Status

Accepted on 2026-10-01 by the project initiator as an owner decision on
[bitty#1558](https://github.com/bitty-terminal/bitty/issues/1558). This ADR
records where workspace mechanism and workspace presentation live; it does not
describe implemented behavior, does not authorize shipped, stable, normative,
or compatibility-guaranteed behavior, and does not weaken any normative
security control. It resolves the tabs slice (M1-31) of
[OQ-052](../open-questions.md) and leaves the rest of OQ-052 and all API
spellings under [OQ-056](../open-questions.md) open. Frontmatter `status` is
`accepted` per the repository metadata schema; document status is Accepted.
Lifecycle is `Draft -> owner review -> Accepted (2026-10-01) -> normative`.

- Deciders: project initiator (owner decision, 2026-10-01).
- Related: [ADR 0013](ADR-0013-core-ontology-identity.md) (Workspace is a
  first-class concept with `WorkspaceId`); DIR-001 (small Core, optional
  behavior behind governed extension surfaces); the accepted
  [Workspace Compositor Specification](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/workspace-compositor.md);
  the draft
  [Chrome Surface API (Candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/chrome-surface-api-candidate.md)
  and [Tabs Scope Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/tabs-scope-decision.md).

## Context

Bitty ships workspaces: Core creates, closes, renames, switches, and reorders
them, moves panels between them, and reaches them through key bindings and
`bitty ctl workspace`. Alongside that mechanism the corpus carried two
conflicting placements for the visible part:

- The bundled-plugin catalog described `bitty-terminal.workspace` as owning
  "workspace commands, workspaceline presentation, ordering, closing policy",
  that is, mechanism and presentation in one plugin, with the exclusive
  `workspaceline` claim (`tabline` deprecated alias) staying bundled.
- The core-boundary documents and the Chrome Surface API candidate stated that
  Core draws no chrome and that any workspace bar is a plugin composition,
  while Core still paints a transitional text workspaceline.

In code, the bundled `bitty-terminal.workspace` entry is a manifest only: its
commands are not dispatched to plugin code, and every workspace operation
already runs in Core. bitty#1558 asked whether workspace should be a Core
mechanism, a bundled plugin, or an optional plugin.

Tiling window managers answer the same question by splitting compositor and
bar: Hyprland owns workspaces as a mechanism and publishes their state, while
Waybar or any other third-party program decides whether and how workspaces are
shown. Without a bar, workspaces still exist and still switch from the
keyboard.

## Decision

### Workspace is a Core mechanism

1. Core owns the workspace lifecycle and state: `WorkspaceId` identity,
   create, close (including the kill-confirm and PTY teardown path), rename,
   focus and switch, order and reorder, moving panels between workspaces, the
   active workspace per `Window`, capacity bounds, and the never-empty
   invariant.
2. Workspace operations are Core commands in the executable registry. Key
   bindings, the CLI (`bitty ctl workspace ...`), IPC, Lua, and plugin clicks
   all invoke the same Core commands; none of them reimplements the operation.
3. With zero plugins enabled, workspaces are fully usable through commands and
   key bindings. No workspace behavior depends on the plugin system, and
   `bitty --safe` keeps every workspace operation.

### Core publishes workspace state; it does not present it

1. Core exposes a bounded, read-only workspace snapshot, workspace lifecycle
   events, and the workspace commands to plugins, gated by separate read and
   control capabilities. Read never implies control.
2. Core provides the generic chrome mechanism that presentation plugins use:
   edge-band reservation, rendering and hit-testing of mounted declarative UI
   trees, and click-to-command routing. These are generic and not specific to
   workspaces.
3. The exact API, capability, event, and command spellings follow the Chrome
   Surface API candidate and stay open under OQ-056 until that contract is
   accepted.

### Workspace presentation is plugin-only

1. Core draws no workspace presentation: no workspace bar, no tab strip, no
   vertical sidebar, and no workspace pills. With no presentation plugin, every
   edge band reserves zero space. This includes `bitty --safe`: safe mode has
   no built-in minimal bar.
2. Every visible workspace surface (a horizontal bar, browser-style tabs, a
   vertical or tree sidebar, a workspace segment inside a status line, or none
   at all) is an optional plugin. Several alternatives may coexist in the
   ecosystem; the user chooses one or none.
3. A first-party presentation plugin uses only the public surfaces above and
   receives no private API or extra authority. It may be shipped as a
   first-party package, but it is not enabled by default unless a later
   distribution decision says so under the accepted Default Distribution
   RFC.
4. Panel tabs inside one workspace (the `tabline` surface, `PW-10`) are the
   same kind of presentation: plugin policy over Core panel and workspace
   primitives, never Core chrome.

### Retire the conflated bundled workspace plugin

1. The bundled `bitty-terminal.workspace` manifest and its deprecated
   `bitty-terminal.tabs` alias are retired. Their commands become the Core
   workspace commands, and the `workspaceline` claim is removed because Core
   no longer has a presentation slot for one plugin to own exclusively.
2. The Core text workspaceline is transitional. It stays only until a
   first-party presentation plugin covers it, then it is removed.
3. Core-side bar appearance settings are not introduced: no
   `workspace.bar.colors` and no `workspace.bar.pill_align`. Appearance belongs
   to the plugin that mounts the surface.

## Consequences

- The zero-plugin baseline is a plain terminal window with workspaces reachable
  from the keyboard and CLI, comparable to a tiling window manager with no bar.
- Implementation order in `bitty`: the workspace read API and events, then
  rendering of mounted UI trees into bands, then a first-party presentation
  plugin, then removal of the Core workspaceline and the bundled workspace
  manifest. Each step is a tracked task.
- Work that adds a Core-drawn tab strip, pills, or sidebar contradicts this
  ADR and must be rescoped as plugin work over the public surfaces.
- Workspace persistence and restore remain Core concerns under the
  Restore/Persistence separation in ADR 0013; they are not presentation.
- This ADR authorizes no code by itself, changes no accepted pin or ceiling,
  and weakens no security control.

## Alternatives considered

| Alternative                                        | Disposition                                                                                                                                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Core mechanism and Core-drawn bar or tabs          | Rejected: hard-codes one presentation into Core, conflicts with the zero-plugin baseline and DIR-001, and blocks alternative bars, sidebars, and no-bar setups                 |
| Bundled plugin owning mechanism and presentation   | Rejected: puts a fundamental mechanism behind the plugin system, so keyboard and CLI workspace control would depend on plugin availability and safe mode would lose workspaces |
| Optional plugin owning mechanism and presentation  | Rejected: same dependency problem, plus several workspace managers could disagree about Core state                                                                             |
| Keep the status quo (manifest plus Core text line) | Rejected: the manifest describes ownership the code does not have, and the Core text line contradicts the no-chrome baseline                                                   |

## Affected contracts

- [Core and Plugin Boundaries](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/architecture/core-boundaries.md)
  and [Architecture Overview](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/architecture/overview.md):
  the zero-plugin baseline is now an accepted rule.
- [Chrome Surface API (Candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/chrome-surface-api-candidate.md):
  its ownership direction is accepted; its spellings stay candidate.
- [Tabs Scope Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/tabs-scope-decision.md):
  its recommended option (plugin tab policy over Core workspace primitives) is
  adopted.
- [Workspace Compositor Specification](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/workspace-compositor.md):
  workspace mechanism stays Core; the workspaceline overlay is transitional.
- [Default Distribution RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/default-distribution-rfc.md),
  [Plugin Matrix](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/product/plugin-matrix.md),
  and [Plugin Dogfood](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/product/plugin-dogfood.md):
  `bitty-terminal.workspace` is retiring and no longer owns presentation.
- [Bundled-Plugin Split Decision](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/product/bundled-plugin-split-decision.md)
  and [Plugin Roadmap](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/product/plugin-roadmap.md):
  the workspace core is Core, not a bundled plugin, and the `workspaceline`
  claim does not stay bundled.
- [Status System Specification](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/status-system.md),
  [Chrome Band Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/chrome-band-contract-candidate.md),
  and [Panel and Workspace Interaction](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-workspace-interaction-candidate.md):
  the `workspace` module is plugin content, Core keeps band geometry only,
  and `bitty --safe` has no built-in minimal bar.
- [Open-question register](../open-questions.md): OQ-052 records the tabs
  slice as resolved here; OQ-056 stays open.
- [Decision register](../index.md) and [ADR index](README.md): route to this
  ADR.

## Open points

- Final spellings for the workspace read API, events, capabilities, and the
  Core workspace command namespace (OQ-056).
- Fate of `workspace.show_bar` and `workspace.bar.edge`: mapping to settings
  of the first-party presentation plugin with a deprecation window, or removal
  with the Core workspaceline.
- Which first-party presentation plugin covers the Core workspaceline first,
  and whether any presentation plugin enters the enabled-by-default set.
- Attention flags (bell, activity, exit) in the workspace snapshot and their
  bounds.

## References

- [bitty#1558](https://github.com/bitty-terminal/bitty/issues/1558): the
  question and the owner clarification adopting the compositor-and-bar split.
- [ADR 0013 - Core Ontology and Identity Model](ADR-0013-core-ontology-identity.md)
- [Open-question register](../open-questions.md) (OQ-052, OQ-056)
- [Workspace Compositor Specification](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/workspace-compositor.md)
- [Chrome Surface API (Candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/chrome-surface-api-candidate.md)
- [Tabs Scope Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/tabs-scope-decision.md)
