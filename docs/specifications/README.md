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

There are no accepted standalone implementation specifications yet. The
following drafts are under review and do not authorize implementation:

| Draft                                                         | Closes                 | Status   |
| ------------------------------------------------------------- | ---------------------- | -------- |
| [Performance Budget RFC](performance-budget-rfc.md)           | OQ-001                 | Proposed |
| [Compatibility Milestone RFC](compatibility-milestone-rfc.md) | OQ-004                 | Proposed |
| [Terminal State RFC](terminal-state-rfc.md)                   | OQ-007                 | Proposed |
| [Lua Runtime RFC](lua-runtime-rfc.md)                         | OQ-009                 | Proposed |
| [Configuration Model RFC](configuration-model-rfc.md)         | OQ-010                 | Proposed |
| [Plugin Platform RFC](plugin-platform-rfc.md)                 | OQ-011, OQ-012, OQ-013 | Proposed |

Naming note: these review drafts use RFC-style filenames; on acceptance they
will be renamed to `SPEC-NNNN-short-title.md` per the policy below.

## Admission criteria

A specification defines boundaries, inputs, outputs, invariants, errors,
resource limits, compatibility, lifecycle, recovery, and verification. It links
the requirements and decisions it implements and includes security review where
trust boundaries are involved.

## Authority and status

A `normative` specification governs its declared version and scope. Draft text
does not authorize implementation or form public reference. User/reference
claims still require implementation and conformance evidence.

## Naming and maintenance

Use `SPEC-NNNN-short-title.md`. Keep identifiers and version history stable,
record breaking changes explicitly, and update requirements, risks, reference,
and migration guidance in the same delivery.
