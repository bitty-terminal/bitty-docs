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
| DIR-003 | Use Lua for plugins and as the main configuration language.                                                                                                                  | Explicit user direction in source turns 3 and 15               | [Technology strategy](../project/technology-strategy.md); [Lua and XDG](../configuration/lua-and-xdg.md)                 | Accepted in [Configuration Model RFC](../specifications/configuration-model-rfc.md) (OQ-010) and [Lua Runtime RFC](../specifications/lua-runtime-rfc.md) (OQ-009)                |
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
| [Lua Runtime RFC](../specifications/lua-runtime-rfc.md)                         | OQ-009                 | Accepted |

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
- Rich blocks, semantic zones, structured transports, and TUI transformation. (Proposed: [Rich presentation RFC](../specifications/rich-presentation-rfc.md) — image/rich-block/scene/zone and structured transport for [OQ-008](open-questions.md)/[OQ-015](open-questions.md)/[OQ-016](open-questions.md); frontmatter `draft`, pending acceptance.)
- Unified action registry, CLI grammar, IPC contract, and MCP/DevTools protocol.
- Package manifest/lock formats, resolver, registry, and update UX.
  (Accepted: [Package lifecycle RFC](../specifications/package-lifecycle-rfc.md)
  — lifecycle and integrity model for OQ-021; resolver (OQ-026), version
  lifecycle (OQ-027), registry (OQ-028), and key directory (OQ-029) remain
  open.)
- Headless daemon, detach/reattach, and remote UI architecture.
- Isolation resource ceilings and failure semantics. ([Isolation Resource RFC](../specifications/isolation-resource-rfc.md) — `Proposed` draft, not accepted; measurement evidence 2026-08-27 via bitty CTX-0037 PR #68 (17 headless tests, queue budgets `BoundedText`/`drain_batch`) and CTX-0040 `d67a65b` (15 headless `measurement_lua.rs` RC-1 10^7/50ms/8ms + RC-2 32 MiB via `piccolo`/`Lua::total_memory()` + 21 headless `measurement.rs` Global 8192/2MiB hard-gated at Host admission, worktree `bitty/.worktrees/ctx-0040-feat-lua-vm-budgets`, gates `just check` + `cargo check --target x86_64-pc-windows-gnu` pass) as experimental review evidence, pending P0 security-auditor review before acceptance; frontmatter remains `draft`, lifecycle `Draft -> experimental review evidence -> Accepted -> normative`.)
- Local instance selection, IPC/MCP transport, framing, scopes, and Agent bounded messages. (Proposed: [IPC and Agent RFC](../specifications/ipc-agent-rfc.md) — bounded 256 KiB framing, versioned wire, peer-credential auth, scope families, rate limits RC-9/RC-10, Agent bounded messages, consent and streaming for [OQ-018](open-questions.md); pending security review.)
- Lua pins, upgrade cadence, stdlib allowlist and unsafe-surface audit.
  (Proposed: [ADR 0005](adrs/ADR-0005-lua-pins-and-stdlib.md) — exact Lua
  5.4.x, mlua, piccolo 0.3.3 pins, vendored verification, allowlist, and audit
  gates for [OQ-030](open-questions.md); pending acceptance.)
- os.getenv exposure, desensitization, and bitty module policy.
  (Proposed: [ADR 0006](adrs/ADR-0006-os-env-policy.md) — os.getenv denial,
  desensitized bitty.env.get with capability-gated allowlist, audit logging,
  and migration for [OQ-031](open-questions.md); pending acceptance.)
- Async/Send boundary, GC tuning, Config VM budget charging, and
  reload/module-cache interaction. (Proposed:
  [ADR 0007](adrs/ADR-0007-async-gc.md) — `Send`/`Sync` boundary (mlua vs
  piccolo, tasks 64/timers 32), GC tuning (incremental pause/step, budget),
  Config VM charging against PB-1 and PB-2, and per-VM module-cache reload
  interaction for [OQ-032](open-questions.md); pending acceptance.)
- DevTools instrumentation, event pipeline, and debug protocol for the plugin
  runtime. (Proposed: [DevTools RFC](../specifications/devtools-rfc.md) —
  instrumentation, observability event pipeline, and versioned debug protocol with
  `debug.inspect`/`trace`/`control` scopes for [OQ-019](open-questions.md);
  pending acceptance.)
- Default distribution, bundled-plugin set, and disable mechanism. (Proposed:
  [Default Distribution RFC](../specifications/default-distribution-rfc.md) —
  bundled-disabled-by-default distribution, empty v1 enabled set, five
  disable surfaces (config, managed manifest, CLI, profile, `--safe`) and
  promotion criteria for [OQ-002](open-questions.md); pending acceptance.)

Each candidate is represented by an item in the
[open-question register](open-questions.md). Acceptance requires an ADR, RFC,
or other reviewable artifact named there.
