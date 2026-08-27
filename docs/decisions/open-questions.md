---
title: Open-question register
description: Canonical register of unresolved product, architecture, security, interface, and governance contracts
category: decisions
audience: maintainer
document_type: register
status: accepted
website_publish: true
sidebar_order: 20
---

# Open-question register

## Use

This register is the canonical index of unresolved cross-document questions.
The linked topic document remains authoritative for detail. “Open” means no
decision or closure evidence exists; it does not mean a normative security
control is optional.

Close an item only by linking its reviewed ADR, RFC, specification, test, or
other evidence. Update the topic document and the
[decision register](index.md) in the same change.

## Product and platform

| ID     | Question                                                                                                        | Canonical document                                                                         | Next artifact            | State                                                                                     |
| ------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------ | ----------------------------------------------------------------------------------------- |
| OQ-001 | Which startup, memory, input-latency, package-size, and idle-resource budgets define “lightweight”?             | [Product vision](../product/vision.md)                                                     | Performance budget RFC   | Accepted: [performance-budget-rfc](../specifications/performance-budget-rfc.md)           |
| OQ-002 | Which plugins, if any, ship enabled by default, and how can users disable them?                                 | [Product vision](../product/vision.md); [plugin system](../extensibility/plugin-system.md) | Default distribution RFC | Open                                                                                      |
| OQ-003 | What are the initial Linux/macOS/Windows/BSD support tiers and CI guarantees?                                   | [Technology strategy](../project/technology-strategy.md)                                   | Platform policy ADR      | Accepted: [ADR 0002](adrs/ADR-0002-platform-support-tiers.md)                             |
| OQ-004 | Which VT, keyboard, image, clipboard, and shell-integration protocols define the first compatibility milestone? | [Product vision](../product/vision.md)                                                     | Compatibility matrix RFC | Accepted: [compatibility-milestone-rfc](../specifications/compatibility-milestone-rfc.md) |

## Core and technology

| ID     | Question                                                                                                        | Canonical document                                                                                             | Next artifact                           | State                                                                   |
| ------ | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------- |
| OQ-005 | What Cargo workspace and crate dependency graph preserves the intended core boundaries?                         | [Architecture overview](../architecture/overview.md); [technology strategy](../project/technology-strategy.md) | Core topology ADR                       | Accepted: [ADR 0003](adrs/ADR-0003-core-workspace-topology.md)          |
| OQ-006 | Which upstream libraries are adopted, wrapped, replaced, or narrowly forked, and under what maintenance policy? | [Technology strategy](../project/technology-strategy.md)                                                       | Dependency ADR set                      | Accepted: [ADR 0004](adrs/ADR-0004-upstream-dependencies.md)            |
| OQ-007 | What exact parser-to-action-to-state interfaces preserve Terminal Truth and deterministic replay?               | [Core boundaries](../architecture/core-boundaries.md)                                                          | Terminal state RFC                      | Accepted: [terminal-state-rfc](../specifications/terminal-state-rfc.md) |
| OQ-008 | What image decoding, storage, placement, animation, limit, and renderer contract is used?                       | [Rich content](../interfaces/rich-content.md); [threat model](../security/threat-model.md)                     | Image protocol RFC with security review | Open                                                                    |

## Configuration and plugins

| ID     | Question                                                                                                                                                                     | Canonical document                                                                                        | Next artifact                                                                     | State |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ----- |
| OQ-009 | Which Lua runtime/binding, standard-library subset, module search rules, schema, and diagnostics contract are used?                                                          | [Lua and XDG](../configuration/lua-and-xdg.md)                                                            | Proposed: [Lua runtime RFC](../specifications/lua-runtime-rfc.md)                 | Open  |
| OQ-010 | Are declarative `ConfigPlan` generation and Rust reconciliation adopted, and how do XDG layers, profiles, merge rules, reload, and project trust work?                       | [Lua and XDG](../configuration/lua-and-xdg.md)                                                            | Proposed: [Configuration model RFC](../specifications/configuration-model-rfc.md) | Open  |
| OQ-011 | What is Plugin API v1 across commands, events, UI, services, lifecycle, and compatibility?                                                                                   | [Plugin system](../extensibility/plugin-system.md); [core boundaries](../architecture/core-boundaries.md) | Proposed: [Plugin platform RFC](../specifications/plugin-platform-rfc.md)         | Open  |
| OQ-012 | What manifest, capability identifiers, grant storage, prompts, and revocation workflow implement the normative capability model?                                             | [Plugin system](../extensibility/plugin-system.md); [security overview](../security/overview.md)          | Proposed: [Plugin platform RFC](../specifications/plugin-platform-rfc.md)         | Open  |
| OQ-013 | Which event phases may observe or intercept, and what batching, timeout, drop, and backpressure rules apply?                                                                 | [Core boundaries](../architecture/core-boundaries.md)                                                     | Proposed: [Plugin platform RFC](../specifications/plugin-platform-rfc.md)         | Open  |
| OQ-014 | Which per-plugin VM, restricted-library, lazy-load, reload, callback, queue, instruction, CPU, memory, and task mechanisms satisfy the normative isolation and budget gates? | [Plugin system](../extensibility/plugin-system.md); [security overview](../security/overview.md)          | Proposed: [Isolation resource RFC](../specifications/isolation-resource-rfc.md)   | Open  |

## Presentation and automation

| ID     | Question                                                                                                                                  | Canonical document                                                                          | Next artifact                             | State                                                                                                                                                                                            |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| OQ-015 | What are the versioned `RichBlock`, scene, semantic-zone, selection, accessibility, search, export, and anchor contracts?                 | [Rich content](../interfaces/rich-content.md)                                               | Rich presentation RFC                     | Open                                                                                                                                                                                             |
| OQ-016 | Which authenticated structured transports may drive rich output, and what transformations are permitted in alternate-screen applications? | [Rich content](../interfaces/rich-content.md); [security overview](../security/overview.md) | Structured transport RFC                  | Open                                                                                                                                                                                             |
| OQ-017 | Which top-level CLI commands, dynamic command namespace, action schema, output schema, aliases, and stable exit codes form v1?            | [CLI](../interfaces/cli.md)                                                                 | CLI contract RFC                          | Open                                                                                                                                                                                             |
| OQ-018 | How are local instances selected, authenticated, authorized, rate-limited, and exposed to IPC/MCP clients?                                | [CLI](../interfaces/cli.md); [threat model](../security/threat-model.md)                    | IPC/MCP protocol RFC with security review | Open                                                                                                                                                                                             |
| OQ-019 | When do DevTools, record/replay, debug protocol, and MCP adapter enter the roadmap?                                                       | [Architecture overview](../architecture/overview.md); [CLI](../interfaces/cli.md)           | Tooling milestone ADR                     | Open                                                                                                                                                                                             |
| OQ-020 | Is a headless daemon with detach/reattach or remote UI in scope, and what is its trust boundary?                                          | [Product vision](../product/vision.md); [threat model](../security/threat-model.md)         | Headless architecture ADR                 | Open; candidate staging considerations from the second historical conversation are recorded in [Proposed Delivery Sequence](../product/proposed-delivery-sequence.md) without choosing an answer |

## Packages and project governance

| ID     | Question                                                                                                                                                            | Canonical document                                                                                                 | Next artifact                                                                                           | State |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ----- |
| OQ-021 | What are the package manifest, lockfile, version, resolver, validation, transactional activation, rollback, and retained-environment contracts?                     | [Package management](../extensibility/package-management.md)                                                       | Proposed: [Package lifecycle RFC](../specifications/package-lifecycle-rfc.md) (package format/resolver) | Open  |
| OQ-022 | Which source types precede a registry, and how are integrity, signatures, provenance, local paths, and publisher trust enforced?                                    | [Package management](../extensibility/package-management.md); [threat model](../security/threat-model.md)          | Proposed: [Package lifecycle RFC](../specifications/package-lifecycle-rfc.md) (supply-chain)            | Open  |
| OQ-023 | Which loader or synchronization mechanism, release selector, multi-version URL scheme, route mapping, and redirect manifest implement the website content contract? | [Website content contract](../project/website-content-contract.md); [repository map](../project/repository-map.md) | Website delivery ADR                                                                                    | Open  |
| OQ-024 | What licenses, branch protections, ownership rules, compatibility policy, and cross-repository release flow apply?                                                  | [Repository map](../project/repository-map.md)                                                                     | Repository governance ADR                                                                               | Open  |
| OQ-025 | What implementation and test evidence closes each security risk without weakening the normative controls?                                                           | [Risk register](../security/risk-register.md)                                                                      | Evidence linked per risk entry                                                                          | Open  |
| OQ-026 | What are the package dependency resolver semantics, constraint grammar, and side-by-side version selection rules?                                                   | [Package management](../extensibility/package-management.md)                                                       | Package resolver RFC                                                                                    | Open  |
| OQ-027 | What are the yank, prerelease, and version lifecycle policies for packages?                                                                                         | [Package management](../extensibility/package-management.md)                                                       | Version lifecycle RFC                                                                                   | Open  |
| OQ-028 | What are the registry service boundaries, attestation model, and bundled-package generation decisions?                                                              | [Package management](../extensibility/package-management.md); [threat model](../security/threat-model.md)          | Registry service RFC                                                                                    | Open  |
| OQ-029 | What are the key directory, enrollment, rotation, revocation, and freshness (snapshot timestamp) contracts for signed releases?                                     | [Package management](../extensibility/package-management.md); [threat model](../security/threat-model.md)          | Key management and freshness RFC                                                                        | Open  |

## Non-question constraints

The following are already normative and must not be reopened as optional
features: explicit trust boundaries, least-privilege capability families,
per-plugin isolation, restricted Lua libraries, bounded protocol/image inputs,
resource and queue budgets, authenticated privileged interfaces, transactional
package activation, and safe recovery. Only their concrete mechanisms,
thresholds, and verification plans remain open.
