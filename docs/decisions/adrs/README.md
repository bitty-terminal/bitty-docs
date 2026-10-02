---
title: Architecture decision records
description: Durable records of accepted architectural choices alternatives and consequences
category: decisions
audience: maintainer
document_type: index
status: accepted
website_publish: true
sidebar_order: 30
---

# Architecture decision records

This directory contains accepted, proposed, superseded, and historical
architecture decisions. The [decision register](../index.md) records broader
working directions and the remaining ADR queue.

| ADR                                                                                                                                                                     | Status   | Scope                                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ADR 0001 - Repository Bootstrap Baseline](ADR-0001-repository-bootstrap-baseline.md)                                                                                   | Accepted | Minimal implementation-neutral Core and website scaffolding                                                                                                                                                                                                            |
| [ADR 0002 - Platform Support Tiers](ADR-0002-platform-support-tiers.md)                                                                                                 | Accepted | Initial Linux/macOS/Windows/BSD support tiers and CI guarantees                                                                                                                                                                                                        |
| [ADR 0003 - Core Workspace Topology](ADR-0003-core-workspace-topology.md)                                                                                               | Accepted | Single Cargo workspace crate graph, dependency rules, MSRV                                                                                                                                                                                                             |
| [ADR 0004 - Upstream Dependency Set](ADR-0004-upstream-dependencies.md)                                                                                                 | Accepted | Adopt/wrap/reject choices and maintenance policy for first upstream libraries                                                                                                                                                                                          |
| [ADR 0005 - Lua Pins, Upgrade Cadence, Stdlib Allowlist and Unsafe-Surface Audit](ADR-0005-lua-pins-and-stdlib.md)                                                      | Accepted | Exact Lua 5.4.x, mlua, piccolo 0.3.3 pins, upgrade cadence, vendored verification, allowlist, and unsafe-surface audit                                                                                                                                                 |
| [ADR 0006 - os.getenv Exposure and Bitty Module Policy](ADR-0006-os-env-policy.md)                                                                                      | Accepted | os.getenv denial, desensitized bitty.env.get with capability-gated allowlist, audit logging, and migration                                                                                                                                                             |
| [ADR 0007 - Async/Send Boundary and GC Tuning for Lua VMs](ADR-0007-async-gc.md)                                                                                        | Accepted | Async/Send boundary (mlua vs piccolo, Send/Sync, tasks 64/timers 32), GC tuning (incremental pause/step), Config VM budget charging (PB-1/PB-2), and reload/module-cache interaction                                                                                   |
| [ADR 0008 - Headless Daemon, Detach/Reattach and Remote UI Trust Boundary](ADR-0008-headless.md)                                                                        | Accepted | Headless daemon detach/reattach and remote UI deferred to post-v1.0 with trust-boundary analysis gate                                                                                                                                                                  |
| [ADR 0009 - Plugin API v1 Lua Surface Acceptance Resolution](ADR-0009-plugin-api-v1-lua-surface.md)                                                                     | Accepted | Resolves LUA-OQ-1..12 and flips the Plugin API v1 Lua Surface RFC to accepted; contract authority in `bitty-docs`, implementation/parity in `bitty`, SDK generated                                                                                                     |
| [ADR 0010 - Plugin Host Runtime Acceptance Resolution](ADR-0010-plugin-host-runtime-acceptance.md)                                                                      | Accepted | Ratifies OQ-033/OQ-034/OQ-035 and flips the Plugin Host Runtime RFC to accepted; host bridge, VM lifecycle, source staging, host-service wiring, and four numeric defaults                                                                                             |
| [ADR 0011 - Repository Metadata and GitHub Baseline](ADR-0011-repository-metadata-baseline.md)                                                                          | Proposed | Byte-identical, parameterized, and per-repository metadata/.github tiers; required-check naming; action pinning and rust channel rules                                                                                                                                 |
| [ADR 0012 - Phodopus Runtime as the Lua Successor Path](ADR-0012-phodopus-runtime.md)                                                                                   | Accepted | Moves the Lua path from the Piccolo watch-list candidate to Phodopus, a sandbox-first successor runtime forked from `kyren/piccolo`; fork, host-ABI boundary, async, and roadmap                                                                                       |
| [ADR 0013 - Core Ontology and Identity Model](ADR-0013-core-ontology-identity.md)                                                                                       | Accepted | Ten-concept core ontology (Instance, Workspace, Panel, Surface, ExecutionContext, Terminal, Session, Resource, Service, Agent) with ID relations and the Panel/Execution and Restore/Persistence separations; closes OQ-084                                            |
| [ADR 0014 - Workspace as Core Mechanism with Plugin-Only Presentation](ADR-0014-workspace-core-presentation-plugins.md)                                                 | Accepted | Workspace lifecycle and state are Core mechanism; every workspace bar, tab strip, and sidebar is an optional plugin over published workspace state; retires the bundled `bitty-terminal.workspace` manifest and the Core workspaceline; resolves the OQ-052 tabs slice |
| [ADR 0015 - Small-Core Extraction Boundaries](ADR-0015-small-core-extraction-boundaries.md)                                                                             | Accepted | Owner-delegated decision on the observability, package-manager/runtime-loader, Beacon, Composer, legacy-chrome, and validation-suite boundaries; names each retained Core mechanism and the parked focused contracts (`W-71` through `W-75`)                           |
| [ADR 0016 - Execution, Graphics, Accessibility, Storage, and Platform-Service Boundaries](ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md)     | Accepted | Owner-delegated decision on the execution-supervisor, graphics, accessibility, storage, and platform-service boundaries; names each retained Core mechanism and the parked focused contracts (`W-131` through `W-147`)                                                 |
| [ADR 0017 - Retirement of the bitty-terminal.tabs Alias and the Bundled bitty-terminal.shell-integration Manifest](ADR-0017-tabs-alias-shell-integration-retirement.md) | Accepted | Retires the `bitty-terminal.tabs` compatibility alias and the bundled `bitty-terminal.shell-integration` manifest at a `v0.2.0` floor; defines the stored-grant remap, carry-forward, denial-preservation, and notification path; resolves the `DEC-0032` citation     |

## Admission criteria

An ADR states context, considered alternatives, the accepted decision,
rationale, consequences, affected contracts, and evidence of review. It records
a material choice rather than routine implementation detail.

## Authority and status

An accepted ADR governs the decision it names but does not prove implementation.
Later ADRs supersede earlier records; accepted records are not silently edited
to make history appear linear.

## Naming and maintenance

Use `ADR-NNNN-short-title.md` with monotonic identifiers. Link the Issue,
CarryCtx decision/task, specifications, and superseding ADR. Update navigation
and affected contracts when status changes.
