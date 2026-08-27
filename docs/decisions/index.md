---
title: Decision register
description: Canonical register of accepted directions, normative contracts, verified facts, and candidate decisions
category: decisions
audience: maintainer
document_type: register
status: accepted
website_publish: true
sidebar_order: 10
---

# Decision register

## Purpose

This register separates accepted direction from candidate design and verified
project facts. It is a navigation layer, not a substitute for future ADRs or
RFCs. No row claims product implementation.

Status vocabulary follows the [documentation map](../README.md). Historical
provenance is recorded in the
[shared-conversation coverage](../sources/chatgpt-share-coverage.md), while
unresolved choices are tracked in the
[open-question register](open-questions.md).

## Accepted working directions

| ID      | Direction                                                                                                                                                                    | Basis                                                          | Canonical document                                                                                                       | Contract still needed                                                                                                                                                            |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DIR-001 | Keep a small terminal core and move optional behavior behind governed extension surfaces.                                                                                    | Product intent and maintained architecture                     | [Product vision](../product/vision.md); [core boundaries](../architecture/core-boundaries.md)                            | Accepted in [Plugin Platform RFC](../specifications/plugin-platform-rfc.md) (OQ-011/OQ-012/OQ-013)                                                                               |
| DIR-002 | Use Rust 2024 for the core implementation.                                                                                                                                   | Explicit project direction                                     | [Technology strategy](../project/technology-strategy.md)                                                                 | Toolchain maintenance policy; MSRV is accepted in [ADR 0003](adrs/ADR-0003-core-workspace-topology.md)                                                                           |
| DIR-003 | Use Lua for plugins and as the main configuration language.                                                                                                                  | Explicit user direction in source turns 3 and 15               | [Technology strategy](../project/technology-strategy.md); [Lua and XDG](../configuration/lua-and-xdg.md)                 | Runtime/binding RFCs (configuration model accepted in [Configuration Model RFC](../specifications/configuration-model-rfc.md))                                                   |
| DIR-004 | Target Linux, macOS, Windows, and BSD without assuming identical support on day one.                                                                                         | Explicit product direction                                     | [Product vision](../product/vision.md); [technology strategy](../project/technology-strategy.md)                         | None; tiers and CI policy accepted in [ADR 0002](adrs/ADR-0002-platform-support-tiers.md)                                                                                        |
| DIR-005 | Keep AI/Agent functionality outside the terminal core as optional plugin or adapter integrations.                                                                            | Explicit boundary requested by the user                        | [Core boundaries](../architecture/core-boundaries.md)                                                                    | Integration/capability RFC                                                                                                                                                       |
| DIR-006 | Organize formal components as independent Git repositories under `github.com/bitty-terminal`; keep umbrella/grouping directories non-Git.                                    | Explicit organization direction and current workspace evidence | [Repository map](../project/repository-map.md)                                                                           | Cross-repository release policy                                                                                                                                                  |
| DIR-007 | Keep `bitty-docs` canonical and use an Astro-based `bitty-website` as the future presentation site.                                                                          | Explicit repository direction                                  | [Repository map](../project/repository-map.md)                                                                           | Docs-to-site sync/versioning ADR                                                                                                                                                 |
| DIR-008 | Give SDK, template, and future first-party plugins independent repository/lifecycle boundaries.                                                                              | Explicit plugin repository direction                           | [Repository map](../project/repository-map.md)                                                                           | Ownership and compatibility policy                                                                                                                                               |
| DIR-009 | Use CarryCtx and subagent-oriented delivery, with scoped work and durable progress/checkpoints.                                                                              | Explicit project workflow direction                            | [Repository map](../project/repository-map.md)                                                                           | Per-repository initialization after first commit                                                                                                                                 |
| DIR-010 | Use English as the only canonical documentation language for the current corpus; defer i18n, translation, and locale routing.                                                | Explicit documentation-foundation direction                    | [Decision register](index.md)                                                                                            | Future localization ADR if this is reopened                                                                                                                                      |
| DIR-011 | Treat validated `bitty-docs` Markdown and its metadata as the canonical content source for the future website; no sync exists yet.                                           | Explicit documentation-foundation direction                    | [Website content contract](../project/website-content-contract.md); [open questions](open-questions.md)                  | Publishing mechanism and routing ADR                                                                                                                                             |
| DIR-012 | Bootstrap Core as a dependency-free two-package Rust 2024 workspace and the website as an Astro/Bun Workers Static Assets shell without product behavior or a docs consumer. | [ADR 0001](adrs/ADR-0001-repository-bootstrap-baseline.md)     | [Technology strategy](../project/technology-strategy.md); [repository bootstrap](../development/repository-bootstrap.md) | Website content mechanisms; crate graph and dependencies accepted in [ADR 0003](adrs/ADR-0003-core-workspace-topology.md) and [ADR 0004](adrs/ADR-0004-upstream-dependencies.md) |

“Accepted working direction” means the project may plan against the direction;
it does not freeze public API details or prove implementation.

## Accepted foundation artifacts

The following reviewed artifacts were accepted on 2026-08-26 and 2026-08-27 by the
project initiator. Each closes the open-question entry it names; acceptance
records a reviewed contract, not implementation evidence:

| Artifact                                                                        | Closes                 | Status   |
| ------------------------------------------------------------------------------- | ---------------------- | -------- |
| [Performance Budget RFC](../specifications/performance-budget-rfc.md)           | OQ-001                 | Accepted |
| [ADR 0002 - Platform Support Tiers](adrs/ADR-0002-platform-support-tiers.md)    | OQ-003                 | Accepted |
| [Compatibility Milestone RFC](../specifications/compatibility-milestone-rfc.md) | OQ-004                 | Accepted |
| [ADR 0003 - Core Workspace Topology](adrs/ADR-0003-core-workspace-topology.md)  | OQ-005                 | Accepted |
| [ADR 0004 - Upstream Dependency Set](adrs/ADR-0004-upstream-dependencies.md)    | OQ-006                 | Accepted |
| [Terminal State RFC](../specifications/terminal-state-rfc.md)                   | OQ-007                 | Accepted |
| [Configuration Model RFC](../specifications/configuration-model-rfc.md)         | OQ-010                 | Accepted |
| [Plugin Platform RFC](../specifications/plugin-platform-rfc.md)                 | OQ-011, OQ-012, OQ-013 | Accepted |
| [Package Lifecycle RFC](../specifications/package-lifecycle-rfc.md)             | OQ-021                 | Accepted |

## Normative pre-implementation contracts

| Contract                                                                                                    | Authority                                                                          | Status                                                                               |
| ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Trust boundaries, capability families, fail-closed behavior, isolation, budgets, and safe-mode expectations | [Security overview](../security/overview.md)                                       | Normative P0 gates; not implemented                                                  |
| Threats and required controls for PTY, plugins, configuration, IPC/MCP, DevTools, packages, and resources   | [Threat model](../security/threat-model.md)                                        | Normative P0 gates; not implemented                                                  |
| Terminal Truth and restrictions on extension ownership of raw terminal state                                | [Core boundaries](../architecture/core-boundaries.md), under the security contract | Normative boundary; API mechanism open                                               |
| Security risk closure                                                                                       | [Risk register](../security/risk-register.md)                                      | Open until cited evidence satisfies each exit condition                              |
| Testable given/when/then criteria for every normative P0 control, with verification methods and thresholds  | [P0 Security Acceptance Criteria](../security/p0-acceptance-criteria.md)           | Normative test contract; criteria unsatisfied until evidence records passing results |

An RFC may select a mechanism or threshold for a normative control; it may not
silently downgrade the control to an optional candidate.

## Verified project facts

These facts are observations of repository state, not architecture decisions or
product implementation evidence:

- Seven public remote repositories currently exist under
  [`bitty-terminal`](https://github.com/bitty-terminal): `bitty`, `bitty-docs`,
  `bitty-website`, `bitty-devtools`, `bitty-mcp`, `bitty-plugin-sdk`, and
  `bitty-plugin-template`.
- At the time of the repository inventory, those remotes had no commits.
- The local umbrella root and `bitty-plugins/` are routing/grouping directories,
  not Git repositories. SDK and template children are independent repositories.

Current topology and observation dates belong in the
[repository map](../project/repository-map.md); re-verify drift-prone remote
facts before relying on them operationally.

## Candidate decision queue

The following proposals have not been accepted merely because they appeared in
the historical conversation:

- Plugin API v1, capability/manifest model, and event phases. (Accepted:
  [Plugin Platform RFC](../specifications/plugin-platform-rfc.md) — Plugin API
  v1, capability/manifest model, and event pipeline for OQ-011/OQ-012/OQ-013;
  UI/scene primitives and hot-reload mechanics remain follow-up work.)
- Rich blocks, semantic zones, structured transports, and TUI transformation.
- Unified action registry, CLI grammar, IPC contract, and MCP/DevTools protocol.
- Package manifest/lock formats, resolver, registry, and update UX.
  (Accepted: [Package lifecycle RFC](../specifications/package-lifecycle-rfc.md)
  — lifecycle and integrity model for OQ-021; resolver (OQ-026), version
  lifecycle (OQ-027), registry (OQ-028), and key directory (OQ-029) remain
  open.)
- Headless daemon, detach/reattach, and remote UI architecture.

Each candidate is represented by an item in the
[open-question register](open-questions.md). Acceptance requires an ADR, RFC,
or other reviewable artifact named there.
