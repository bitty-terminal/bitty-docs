---
title: Architecture Diagrams
description: Text-source-first diagram pipeline for Bitty — glossary, D2 graphs, Mermaid flows, SVG finals, visual rules, and levels
category: architecture
audience: contributor
document_type: overview
status: draft
website_publish: true
sidebar_order: 10
---

# Architecture Diagrams

This directory is the text-source-first diagram pipeline for Bitty
at **Pre-alpha / M1 Hardening** (2026-08-29, `bitty` `7a4ee41` baseline
`de134ec`, 16 crates, 32 OQs Accepted). It replaces any Fabric.js or
hand-drawn editor as the source of truth with version-controlled text
sources and deterministic SVG finals.

## Single source

- Canonical inventory: [glossary.yaml](glossary.yaml) — every node and
  edge that diagrams may use, with `shape`, `kind`, `level`, and
  provenance (`7a4ee41`). No diagram may invent a node that glossary
  does not define.
- Rendering does not change semantics: D2 and Mermaid are views of the
  same glossary.

## Tool choice

| Artifact            | Source                | Purpose                                                                                |
| ------------------- | --------------------- | -------------------------------------------------------------------------------------- |
| Architecture graphs | `d2/*.d2`             | Crate DAG, trust boundaries, panel compositor, config, package, isolation — D2 primary |
| Flows               | `mermaid/*.mmd`       | Startup, plugin load, config resolution, panel creation — Mermaid only                 |
| Refinement          | draw.io or Excalidraw | Refinement only, never source — export back to D2 or Mermaid when needed               |
| Final               | `final/*.svg`         | SVG only — exported from D2 or Mermaid, never hand-edited                              |

No Fabric.js custom editor is used in this task; D2 and Mermaid are the
only diagram sources.

## Visual rules

| Shape or line     | Meaning                   | D2 style                              |
| ----------------- | ------------------------- | ------------------------------------- |
| `rect`            | module or crate           | `shape: rectangle`                    |
| `rounded`         | panel or capability       | `rectangle` with `border-radius: 8`   |
| `dashed` boundary | trust boundary or sandbox | container with `style.stroke-dash: 4` |
| `solid` edge      | call or depends           | default solid arrow                   |
| `dashed` edge     | event or async            | `style.stroke-dash: 3`                |

Examples live in the d2 sources; see comments at the top of each file.

## Level hierarchy

| Level | Name      | Use                                 | Files                                                                                                                                              |
| ----- | --------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| L0    | overview  | system context and trust boundaries | `d2/00-overview.d2`                                                                                                                                |
| L1    | subsystem | crate and service breakdown         | `d2/01-core.d2`, `02-plugin-platform.d2`, `03-panel-system.d2`, `04-config-model.d2`, `05-package-lifecycle.d2`, `06-isolation-resource.d2`        |
| L2    | flow      | sequence and state transitions      | `mermaid/startup-flow.mmd`, `plugin-load-flow.mmd`, `config-resolution-flow.mmd`, `panel-create-flow.mmd`, plus L2 fragments inside d2 when needed |
| L3    | relation  | dependency and compatibility matrix | edges inside `d2/01-core.d2` and `d2/06-isolation-resource.d2` marked `level: L3` in `glossary.yaml`                                               |

## Inventory

```text
docs/architecture/
├── README.md                 # this file — pipeline contract
├── glossary.yaml             # single node/edge source
├── overview.md               # system context, invariants, data flows
├── core-boundaries.md        # core vs plugin ownership and P0 gates
├── d2/
│   ├── 00-overview.d2        # L0 system overview
│   ├── 01-core.d2            # L1 core crate DAG per ADR 0003
│   ├── 02-plugin-platform.d2 # L1 plugin platform, registry, generation
│   ├── 03-panel-system.d2    # L1 workspace compositor and Panel candidate
│   ├── 04-config-model.d2    # L2 config pipeline and XDG layers per OQ-010
│   ├── 05-package-lifecycle.d2 # L2 package lifecycle and integrity chain per OQ-021
│   └── 06-isolation-resource.d2 # L1 domains and L3 ceilings per OQ-014
├── mermaid/
│   ├── startup-flow.mmd      # L2 startup from CLI to renderer
│   ├── plugin-load-flow.mmd  # L2 manifest, resolver, grant, VM
│   ├── config-resolution-flow.mmd # L2 Lua to RuntimeConfig
│   └── panel-create-flow.mmd # L2 Window to View to LayoutProvider
└── final/
    ├── README.md             # SVG generation and provenance
    └── *.svg                 # exported finals or placeholder via d2
```

## Accuracy

Nodes and edges follow:

- Crate graph and dependency DAG from
  [ADR 0003](../decisions/adrs/ADR-0003-core-workspace-topology.md) and
  `bitty/Cargo.toml` (16 crates `be3bdb4`, 18 members with harness at
  `7a4ee41`) — see `d2/01-core.d2`.
- Overall model, invariants, and data flows from [Architecture
  Overview](overview.md) — see `d2/00-overview.d2`.
- Ownership and P0 gates from [Core and Plugin Boundaries](core-boundaries.md) —
  shared across all diagrams.
- Plugin API, manifest, and DropOldest queue budgets from
  [Plugin Platform RFC](../specifications/plugin-platform-rfc.md) —
  `d2/02-plugin-platform.d2` and `mermaid/plugin-load-flow.mmd`.
- Panel hierarchy and decoration ownership from
  [Workspace Compositor](../specifications/workspace-compositor.md) —
  `d2/03-panel-system.d2` and `mermaid/panel-create-flow.mmd`.
- Configuration pipeline Candidate A from
  [Configuration Model RFC](../specifications/configuration-model-rfc.md) —
  `d2/04-config-model.d2` and `mermaid/config-resolution-flow.mmd`.
- Lifecycle and integrity chain from
  [Package Lifecycle RFC](../specifications/package-lifecycle-rfc.md) —
  `d2/05-package-lifecycle.d2`.
- Domains and ceilings RC-1..RC-10 from
  [Isolation and Resource RFC](../specifications/isolation-resource-rfc.md) —
  `d2/06-isolation-resource.d2`.

If a future crate or RFC changes the topology, update `glossary.yaml`
first and then the affected `d2/*.d2` or `mermaid/*.mmd` files.

## Generating SVG finals

Text is the source; SVG is the artifact. See [final/README.md](final/README.md)
for deterministic generation commands, placeholder behavior when `d2`
is not installed, and verification.

## Embedding in docs

- Mermaid flows are embedded directly with a fenced ` ```mermaid ` block
  that includes the `.mmd` file content.
- D2 graphs are referenced as SVG images from `final/` after export; do not
  paste Fabric.js or draw.io XML into Markdown.
