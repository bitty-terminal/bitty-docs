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
document still apply. Draft work is listed separately; Draft does not authorize
shipped, stable, or compatibility-guaranteed behavior:

| Specification                                                                           | Closes                                      | Status   |
| --------------------------------------------------------------------------------------- | ------------------------------------------- | -------- |
| [Performance Budget RFC](performance-budget-rfc.md)                                     | OQ-001                                      | Accepted |
| [Compatibility Milestone RFC](compatibility-milestone-rfc.md)                           | OQ-004                                      | Accepted |
| [Terminal State RFC](terminal-state-rfc.md)                                             | OQ-007                                      | Accepted |
| [Configuration Model RFC](configuration-model-rfc.md)                                   | OQ-010                                      | Accepted |
| [Plugin Platform RFC](plugin-platform-rfc.md)                                           | OQ-011, OQ-012, OQ-013                      | Accepted |
| [Package Lifecycle RFC](package-lifecycle-rfc.md)                                       | OQ-021                                      | Accepted |
| [Lua Runtime RFC](lua-runtime-rfc.md)                                                   | OQ-009                                      | Accepted |
| [Rich Presentation RFC](rich-presentation-rfc.md)                                       | OQ-008, OQ-015, OQ-016                      | Accepted |
| [Isolation Resource RFC](isolation-resource-rfc.md)                                     | OQ-014                                      | Accepted |
| [CLI Contract RFC](cli-contract-rfc.md)                                                 | OQ-017                                      | Accepted |
| [Package Follow-up RFC](package-followup-rfc.md)                                        | OQ-022, OQ-026, OQ-027, OQ-028, OQ-029      | Accepted |
| [DevTools RFC](devtools-rfc.md)                                                         | OQ-019                                      | Accepted |
| [Default Distribution RFC](default-distribution-rfc.md)                                 | OQ-002                                      | Accepted |
| [IPC and Agent RFC](ipc-agent-rfc.md)                                                   | OQ-018                                      | Accepted |
| [Governance RFC](governance-rfc.md)                                                     | OQ-024                                      | Accepted |
| [Website Delivery RFC](website-delivery-rfc.md)                                         | OQ-023                                      | Accepted |
| [Risk Evidence RFC](risk-evidence-rfc.md)                                               | OQ-025                                      | Accepted |
| [Plugin Reuse and Provider Ecology RFC](plugin-reuse-and-providers.md)                  | OQ-011, OQ-012, OQ-013 (provider follow-up) | Draft    |
| [Workspace Compositor Specification](workspace-compositor.md)                           | —                                           | Draft    |
| [Status System Specification](status-system.md)                                         | —                                           | Draft    |
| [Input and Pointer Contract](input-pointer-rfc.md)                                      | —                                           | Draft    |
| [Text and Rendering RFC](text-rendering-rfc.md)                                         | —                                           | Draft    |
| [TerminalRegistry and View Lifecycle Contract](terminal-registry-view-lifecycle-rfc.md) | OQ-005, OQ-007 (lifecycle refinement)       | Accepted |

The following drafts are under review and do not authorize shipped, stable, normative, or compatibility-guaranteed behavior; experimental implementation may exist as review evidence (`Draft -> Experimental Implementation -> Accepted -> Verified -> Compatible`):

| Draft                                                                  | Targets                                          | Status | Experimental Implementation                                                                 | Priority                                |
| ---------------------------------------------------------------------- | ------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| [Workspace Compositor Specification](workspace-compositor.md)          | layout, H/V, View/Terminal                       | Draft  | none yet                                                                                    | P0 — needed for slice layout            |
| [Status System Specification](status-system.md)                        | status, diagnostics                              | Draft  | none yet                                                                                    | P0 — needed for slice diagnostics       |
| [Input and Pointer Contract](input-pointer-rfc.md)                     | keyboard/mouse/IME/selection, bounded 64/32/1024 | Draft  | `c0aadd2` + `a8735d0` at `a8735d0` (Kitty, mouse, IME overlay) `Implemented` not `Verified` | P0 — slice input                        |
| [Text and Rendering RFC](text-rendering-rfc.md)                        | text/bidi/shaping/atlas/DPI                      | Draft  | `c0aadd2` at `a8735d0` (`HeadlessRasterizer` + `char_cell_width`, not user-ready)           | P0 — slice rendering                    |
| [Plugin Reuse and Provider Ecology RFC](plugin-reuse-and-providers.md) | provider ecology post-1.0                        | Draft  | none (dogfood `7e3104d` is bundled-disabled, not provider)                                  | P1 — post-slice                         |
| [AI Architecture](ai-architecture.md)                                  | post-1.0, OQ-018 contracts                       | Draft  | none                                                                                        | P2 — deferred post-1.0, lowest priority |

Naming note: current entries use RFC-style filenames; renaming accepted
specifications to `SPEC-NNNN-short-title.md` follows the policy below and is
applied only together with an update of all inbound links.

Review note (2026-08-31, reconciled per CTX-0117, `bitty` `a8735d0` chain `d4d75e9 -> c0aadd2 -> 7e3104d -> a8735d0`, `R-004` `Open`, `R-005`/`R-006`/`R-007` `Mitigated`, experimental `c0aadd2`/`7e3104d`/`a8735d0` `Implemented` not `Verified`): the Configuration Model RFC targeting OQ-010,
the Plugin Platform RFC targeting OQ-011/OQ-012/OQ-013, the Package Lifecycle RFC
targeting OQ-021, the Lua Runtime RFC targeting OQ-009, the Rich Presentation RFC targeting OQ-008/OQ-015/OQ-016, the Isolation Resource RFC targeting OQ-014, the CLI Contract RFC targeting OQ-017, the Package Follow-up RFC targeting OQ-022, OQ-026, OQ-027, OQ-028, OQ-029, the DevTools RFC targeting OQ-019, the Default Distribution RFC targeting OQ-002, the IPC and Agent RFC targeting OQ-018, the Governance RFC targeting OQ-024, the Website Delivery RFC targeting OQ-023, the Risk Evidence RFC targeting OQ-025, and the TerminalRegistry and View Lifecycle Contract targeting OQ-005, OQ-007 (lifecycle refinement) are `Accepted` with
frontmatter `accepted` since 2026-08-31 (CTX-0117); six `Draft` specifications remain as of 2026-08-31: [Status System Specification](status-system.md) (`Draft`, no experimental code, P0 next), [AI Architecture](ai-architecture.md) (`Draft`, P2 deferred post-1.0), [Plugin Reuse and Provider Ecology RFC](plugin-reuse-and-providers.md) (`Draft`, P1 post-slice), [Workspace Compositor Specification](workspace-compositor.md) (`Draft`, P0, no experimental code yet), [Input and Pointer Contract](input-pointer-rfc.md) (`Draft`, candidate + `Experimental Implementation` at `c0aadd2`/`a8735d0`: reconciles keyboard/mouse/IME/selection with Terminal State, Platform, Plugin Platform, Clipboard, and Performance; bounded 64/32/1024/8192, Kitty `7727` colon params, `write_replies` relay; still `Draft` not `Accepted`), and [Text and Rendering RFC](text-rendering-rfc.md) (`Draft`, candidate + experimental at `c0aadd2`: reconciles text/bidi/shaping/atlas/DPI/IME with Terminal State, Rich Presentation, Platform, Performance, and security; `HeadlessRasterizer` and approximate `char_cell_width` remain non-user-ready evidence, not `Verified`). Prioritization: P0 = Workspace Compositor + Status + Input + Text required for vertical slice `Accepted`/`Verified`; P1 = Plugin Reuse post-slice; P2 = AI Arch explicitly deferred. Further `Proposed` material is limited to ADR 0005 (OQ-030), ADR 0006 (OQ-031), and ADR 0007 (OQ-032) as tracked in the [ADR index](../decisions/adrs/README.md) and requires independent category-owner, docs-curator, and security-reviewer evidence before acceptance; crate presence of
`bitty-config`, `bitty-plugin-host`, `bitty-rich`, `bitty-ipc`, and
`bitty-agent` does not self-accept any draft beyond the accepted IPC and Agent RFC, and `bitty-package` lifecycle and
integrity model is accepted while real signature verification remains draft per
crate docs; experimental implementations `c0aadd2`/`7e3104d`/`a8735d0` do not imply `Accepted`/`Verified`. The twenty-one accepted artifacts (Performance Budget RFC OQ-001, ADR-0002
OQ-003, Compatibility Milestone RFC OQ-004, ADR-0003 OQ-005, ADR-0004 OQ-006,
Terminal State RFC OQ-007, Configuration Model RFC OQ-010, Plugin Platform RFC
OQ-011/OQ-012/OQ-013, Package Lifecycle RFC OQ-021, Lua Runtime RFC OQ-009, Rich Presentation RFC OQ-008/OQ-015/OQ-016, Isolation Resource RFC OQ-014, CLI Contract RFC OQ-017, Package Follow-up RFC OQ-022, OQ-026, OQ-027, OQ-028, OQ-029, DevTools RFC OQ-019, Default Distribution RFC OQ-002, IPC and Agent RFC OQ-018, Governance RFC OQ-024, Website Delivery RFC OQ-023, Risk Evidence RFC OQ-025, TerminalRegistry and View Lifecycle Contract OQ-005/OQ-007)
remain `Accepted` as recorded in the [decision register](../decisions/index.md); six drafts remain `Draft` (not `Accepted`/`Verified`) with experimental code only for Input/Text.

## Admission criteria

A specification defines boundaries, inputs, outputs, invariants, errors,
resource limits, compatibility, lifecycle, recovery, and verification. It links
the requirements and decisions it implements and includes security review where
trust boundaries are involved.

## Authority and status

A `normative` specification governs its declared version and scope. Draft text
does not authorize shipped, stable, normative, or compatibility-guaranteed
behavior and does not form public reference; experimental implementation
(`c0aadd2`/`7e3104d`/`a8735d0` at `a8735d0`) may exist as review evidence but
carries no compatibility promise and does not constitute acceptance; it is
distinct from `Draft` (no code) and `Verified` (auditor + P0-AC). User/reference
claims still require implementation and conformance evidence. The lifecycle is
`Draft -> Experimental Implementation -> Accepted -> Verified -> Compatible`
(spec) and `Draft -> experimental review evidence -> Accepted -> normative`
(document); only `Accepted` or `normative` documents authorize shipped behavior.

## Naming and maintenance

Use `SPEC-NNNN-short-title.md`. Keep identifiers and version history stable,
record breaking changes explicitly, and update requirements, risks, reference,
and migration guidance in the same delivery.
