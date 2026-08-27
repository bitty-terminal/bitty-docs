---
title: Specifications
description: Versioned technical contracts for Bitty components interfaces formats and behavior
category: specifications
audience: contributor
document_type: index
status: accepted
website_publish: true
sidebar_order: 10
---

# Specifications

The following standalone specifications are accepted. Acceptance records a
reviewed contract; it does not prove implementation, and evidence rules in each
document still apply:

| Specification                                                 | Closes | Status   |
| ------------------------------------------------------------- | ------ | -------- |
| [Performance Budget RFC](performance-budget-rfc.md)           | OQ-001 | Accepted |
| [Compatibility Milestone RFC](compatibility-milestone-rfc.md) | OQ-004 | Accepted |
| [Terminal State RFC](terminal-state-rfc.md)                   | OQ-007 | Accepted |

The following drafts are under review and do not authorize shipped, stable, normative, or compatibility-guaranteed behavior; experimental implementation may exist as review evidence:

| Draft                                                 | Targets                | Status   |
| ----------------------------------------------------- | ---------------------- | -------- |
| [Lua Runtime RFC](lua-runtime-rfc.md)                 | OQ-009                 | Proposed |
| [Configuration Model RFC](configuration-model-rfc.md) | OQ-010                 | Proposed |
| [Plugin Platform RFC](plugin-platform-rfc.md)         | OQ-011, OQ-012, OQ-013 | Proposed |
| [Isolation Resource RFC](isolation-resource-rfc.md)   | OQ-014                 | Proposed |
| [Package Lifecycle RFC](package-lifecycle-rfc.md)     | OQ-021, OQ-022         | Proposed |

Naming note: current entries use RFC-style filenames; renaming accepted
specifications to `SPEC-NNNN-short-title.md` follows the policy below and is
applied only together with an update of all inbound links.

Review note (2026-08-27): the Wave-C batch of five drafts
(Lua Runtime RFC targeting OQ-009, Configuration Model RFC targeting OQ-010,
Plugin Platform RFC targeting OQ-011/OQ-012/OQ-013, Isolation Resource RFC
targeting OQ-014, Package Lifecycle RFC targeting OQ-021/OQ-022) remains
`Proposed` with frontmatter `draft` and requires independent category-owner,
docs-curator, and security-reviewer evidence; crate presence of
`bitty-config`, `bitty-plugin-host`, `bitty-package`, `bitty-rich`,
`bitty-ipc`, and `bitty-agent` does not self-accept any draft. The foundation
six accepted artifacts (Performance Budget RFC OQ-001, ADR-0002 OQ-003,
Compatibility Milestone RFC OQ-004, ADR-0003 OQ-005, ADR-0004 OQ-006, Terminal
State RFC OQ-007) remain `Accepted` as recorded in the
[decision register](../decisions/index.md).

## Admission criteria

A specification defines boundaries, inputs, outputs, invariants, errors,
resource limits, compatibility, lifecycle, recovery, and verification. It links
the requirements and decisions it implements and includes security review where
trust boundaries are involved.

## Authority and status

A `normative` specification governs its declared version and scope. Draft text
does not authorize shipped, stable, normative, or compatibility-guaranteed
behavior and does not form public reference; experimental implementation may
exist as review evidence but carries no compatibility promise and does not
constitute acceptance. User/reference claims still require implementation and
conformance evidence. The lifecycle is Draft -> experimental review evidence ->
Accepted -> normative; only Accepted or normative documents authorize shipped
behavior.

## Naming and maintenance

Use `SPEC-NNNN-short-title.md`. Keep identifiers and version history stable,
record breaking changes explicitly, and update requirements, risks, reference,
and migration guidance in the same delivery.
