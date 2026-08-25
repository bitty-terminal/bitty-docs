---
title: Documentation map
description: Canonical navigation and authority rules for the Bitty documentation corpus
category: project
audience: mixed
document_type: index
status: accepted
website_publish: true
sidebar_order: 1
---

# Documentation map

This index is the entry point for Bitty's canonical design corpus. The corpus
is pre-implementation: it records what the project intends, what it requires,
what it is considering, and what remains unresolved. It does not establish
implementation status.

## Product

| Document                                                            | Purpose                                                                                                                                |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| [Product vision](product/vision.md)                                 | Product intent, principles, scope, and success criteria.                                                                               |
| [Proposed Delivery Sequence](product/proposed-delivery-sequence.md) | Draft record of candidate build order, deferral list, version ladder, and daemon staging from historical advisor input; not a roadmap. |

## User and contributor documentation

| Document                                                        | Purpose                                                                                                     |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [User guide](user-guide/README.md)                              | Honest pre-implementation index for future installation, onboarding, daily-use, and troubleshooting guides. |
| [Tutorials](tutorials/README.md)                                | Future verified end-to-end learning paths; currently an explicit empty state.                               |
| [How-to guides](how-to/README.md)                               | Future focused procedures for one supported task.                                                           |
| [Troubleshooting](troubleshooting/README.md)                    | Future verified diagnosis, recovery, and escalation guidance.                                               |
| [Migrations](migrations/README.md)                              | Future tested version transitions, rollback, and compatibility guidance.                                    |
| [Examples](examples/README.md)                                  | Future minimal, versioned, mechanically verified illustrations.                                             |
| [Development](development/README.md)                            | Contributor entry point and current delivery expectations.                                                  |
| [Documentation workflow](development/documentation-workflow.md) | Normative taxonomy, metadata, ownership, review, synchronization, deprecation, and versioning policy.       |
| [Repository bootstrap](development/repository-bootstrap.md)     | Accepted zero-functionality Core and website scaffold contract plus implementation validation gates.        |
| [Toolchain and tooling policy](development/toolchain-policy.md) | Pinned per-repository toolchains and canonical gate commands all agents must use.                           |

## Architecture and interfaces

| Document                                                  | Purpose                                                                       |
| --------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [Architecture overview](architecture/overview.md)         | System context, layers, data flow, and architectural status.                  |
| [Core boundaries](architecture/core-boundaries.md)        | Terminal Truth, hot-path ownership, extension boundaries, and P0 gates.       |
| [Lua and XDG](configuration/lua-and-xdg.md)               | Accepted Lua direction and candidate configuration model.                     |
| [Plugin system](extensibility/plugin-system.md)           | Extension surfaces, lifecycle, isolation, capabilities, and conflicts.        |
| [Package management](extensibility/package-management.md) | Candidate package workflow and normative supply-chain constraints.            |
| [CLI](interfaces/cli.md)                                  | Candidate command/action registry, CLI grammar, IPC, and automation contract. |
| [Rich content](interfaces/rich-content.md)                | Candidate structured presentation model without surrendering terminal truth.  |

## Requirements, specifications, and reference

| Document                                   | Purpose                                                                      |
| ------------------------------------------ | ---------------------------------------------------------------------------- |
| [Requirements](requirements/README.md)     | Future testable outcomes and constraints independent of mechanism.           |
| [Specifications](specifications/README.md) | Future precise, versioned technical contracts with verification obligations. |
| [Reference](reference/README.md)           | Future factual lookup material derived from implementation evidence.         |

## Security

| Document                                   | Authority                                                               |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| [Security overview](security/overview.md)  | Normative pre-implementation security contract and capability taxonomy. |
| [Threat model](security/threat-model.md)   | Normative trust boundaries, threats, and required controls.             |
| [Risk register](security/risk-register.md) | Open security risks and evidence-based closure criteria.                |

Security controls are not optional candidates merely because their exact
mechanisms or thresholds still need an RFC. The security corpus takes
precedence over source summaries and non-security design suggestions.

## Project and technology

| Document                                                        | Purpose                                                                               |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [Repository map](project/repository-map.md)                     | Local/remote topology, repository ownership, and current initialization state.        |
| [Technology strategy](project/technology-strategy.md)           | Accepted language/platform direction and candidate implementation choices.            |
| [Reference projects](project/reference-projects.md)             | Untrusted, read-only research snapshots and study questions.                          |
| [Website content contract](project/website-content-contract.md) | Normative ownership and validation boundary between `bitty-docs` and `bitty-website`. |
| [Roadmap](roadmap/README.md)                                    | Evidence-based sequencing without unsupported date or release promises.               |
| [Releases](releases/README.md)                                  | Future immutable release notes backed by published artifacts.                         |

## Decisions, work, and provenance

| Document                                                                                             | Purpose                                                                                |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [Decision register](decisions/index.md)                                                              | Accepted directions, normative contracts, verified facts, and ADR/RFC queue.           |
| [Open-question register](decisions/open-questions.md)                                                | Unresolved choices with a canonical owner document and next artifact.                  |
| [Architecture decision records](decisions/adrs/README.md)                                            | Catalog and maintenance rules for durable accepted architecture decisions.             |
| [ADR 0001 - Repository Bootstrap Baseline](decisions/adrs/ADR-0001-repository-bootstrap-baseline.md) | Accepted minimal Core and website initialization boundary without product behavior.    |
| [Requests for comments](decisions/rfcs/README.md)                                                    | Reviewable proposals and final dispositions; currently an explicit empty state.        |
| [Findings](findings/README.md)                                                                       | Durable reviewed evidence; internal and excluded from website publication.             |
| [Shared-conversation coverage](sources/chatgpt-share-coverage.md)                                    | Traceability from both historical ChatGPT design conversations to canonical documents. |
| [Docs-first TODO](../TODO.md)                                                                        | Sequenced documentation and initialization work.                                       |

## Interpretation rules

Use the following labels consistently:

| Label                      | Meaning                                                                      |
| -------------------------- | ---------------------------------------------------------------------------- |
| Normative requirement      | A future implementation gate. Mechanism details may remain open.             |
| Accepted working direction | Current project intent; record an ADR/RFC before freezing a public contract. |
| Candidate                  | A proposal to investigate, compare, or prototype.                            |
| Open                       | No decision has been made, or closure evidence is missing.                   |
| Implemented                | Demonstrated by code, tests, or release evidence in the owning repository.   |

At present, none of these design documents should label product behavior as
implemented. Repository existence, remote visibility, and initialization state
are project facts, not product implementation evidence.

## Language, metadata, and publication

English is the only canonical documentation language. CJK content, translation
trees, locale directories, and multilingual routing are not currently allowed;
internationalization is deferred until a reviewed cross-repository decision.

Every file under `docs/` carries the exact flat metadata schema defined in the
[documentation workflow](development/documentation-workflow.md). A document is
eligible for future website publication only when `website_publish` is `true`.
No website content consumer exists yet. A future independent website
integration must consume a pinned docs revision under the
[website content contract](project/website-content-contract.md) and must not own
or duplicate normative prose.

Internal workspace inventories, research snapshots, the website integration
contract, and findings use `website_publish: false`. Public-facing category
indexes remain eligible even while empty because they explicitly state the
admission gate and do not invent product behavior.

## Maintaining the corpus

1. Update the canonical topic document first.
2. Record accepted direction or decision status in the
   [decision register](decisions/index.md).
3. Add or close an entry in the
   [open-question register](decisions/open-questions.md), citing its ADR, RFC,
   test, or other evidence.
4. Preserve historical provenance in `docs/sources/` without copying a source
   wholesale or turning suggestions into facts.
5. Update this index and the root [README](../README.md) when navigation changes.
6. Treat synchronized documentation as part of delivery completion, not a
   follow-up that may be silently omitted.
