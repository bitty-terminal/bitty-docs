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

| ADR                                                                                   | Status   | Scope                                                                         |
| ------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| [ADR 0001 - Repository Bootstrap Baseline](ADR-0001-repository-bootstrap-baseline.md) | Accepted | Minimal implementation-neutral Core and website scaffolding                   |
| [ADR 0002 - Platform Support Tiers](ADR-0002-platform-support-tiers.md)               | Proposed | Initial Linux/macOS/Windows/BSD support tiers and CI guarantees               |
| [ADR 0003 - Core Workspace Topology](ADR-0003-core-workspace-topology.md)             | Proposed | Single Cargo workspace crate graph, dependency rules, MSRV                    |
| [ADR 0004 - Upstream Dependency Set](ADR-0004-upstream-dependencies.md)               | Proposed | Adopt/wrap/reject choices and maintenance policy for first upstream libraries |

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
