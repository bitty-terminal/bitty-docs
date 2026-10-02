---
title: ADR 0015 - Small-Core Extraction Boundaries
description: Owner-delegated decision accepting the observability, package-manager, Beacon, Composer, legacy-chrome, and validation-suite extraction boundaries and parking their focused contracts
category: decisions
audience: maintainer
document_type: specification
status: accepted
website_publish: true
sidebar_order: 45
---

# ADR 0015 - Small-Core Extraction Boundaries

## Document status

Accepted on 2026-10-02 as the owner-delegated `W-70` boundary decision on
[bitty-docs#399](https://github.com/bitty-terminal/bitty-docs/issues/399)
(CarryCtx `CTX-0259`). The project initiator delegated the small-core boundary
decision to the commander, who owns acceptance and performs it through
independent review. This ADR decides direction and ownership only: it does not
describe implemented behavior, does not authorize shipped, stable, normative,
or compatibility-guaranteed behavior, and does not weaken any normative
security control. Every boundary below is either an accepted direction with a
focused contract still to be written, or an explicit park; none is implemented.
Frontmatter `status` is `accepted` per the repository metadata schema; document
status is Accepted.

- Deciders: small-core commander, under an owner delegation recorded on
  2026-10-02.
- Related: [ADR 0014](ADR-0014-workspace-core-presentation-plugins.md)
  (plugin-only workspace presentation); DIR-001 (small Core, optional behavior
  behind governed extension surfaces); DIR-016/DIR-017 (Core network
  boundary); DIR-028 (plugin contract and manager boundary); DIR-030 (native
  components); the draft
  [Execution Host and Supervisor Boundary](../../development/execution-host-boundary.md),
  [Plugin Contract and Manager Boundary](../../development/plugin-contract-and-manager-boundary.md),
  and [Native Component Boundary](../../development/native-component-boundary.md);
  and the cross-session execution map in the
  [small-core refactor handoff](../../handoff/2026-10-02-small-core-refactor.md).

## Purpose and scope

This ADR decides, for each proposed small-core extraction, whether the
direction and ownership are accepted, parked, or rejected, and what Core
retains when an extraction is accepted. The six boundaries are observability,
the package manager and runtime loader, Beacon, the Composer, legacy chrome,
and the validation suites. It also records the binding constraints that every
focused contract and implementation task must preserve.

Every binding constraint that a focused contract or implementation task must
preserve is stated normatively in "Binding constraints inherited from the
bootstrap fence" below. This ADR neither adds to nor weakens them; the trust
boundaries they protect remain governed by the canonical security corpus
([security overview](../../security/overview.md) and the P0 acceptance
criteria).

In scope: the boundary decisions, the retained Core mechanisms, the reviewer
roles, the parked details, and the downstream task disposition. Out of scope:
API spellings, manifest schemas, trait surfaces, and implementation. Those are
named as focused follow-up contracts and remain open.

## Normative sources this specification must not weaken

The decision must be read together with, and must not weaken:

- The [security overview](../../security/overview.md), threat model, risk
  register, and P0 acceptance criteria, which stay authoritative on every
  trust boundary named here.
- [ADR 0014 - Workspace as Core Mechanism with Plugin-Only Presentation](ADR-0014-workspace-core-presentation-plugins.md).
- The accepted
  [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md),
  [Plugin Host Runtime RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/plugin-host-runtime-rfc.md),
  [Package Lifecycle RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/packaging/package-lifecycle-rfc.md),
  [Package Follow-up RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/packaging/package-followup-rfc.md),
  and
  [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md).
- DIR-016, DIR-017, DIR-028, and DIR-030. This ADR does not reopen their
  mechanisms; it decides where the corresponding mechanisms live and which
  residual Core responsibility survives extraction.

## Terminology

- **Boundary decision**: acceptance of a direction and an ownership split,
  before any focused contract or implementation exists.
- **Focused contract**: the succeeding document that fixes the exact
  interface, schema, or enforcement evidence for one boundary.
- **Mechanism**: a Core-owned, always-available primitive that works with zero
  plugins and in `bitty --safe`.
- **Policy**: optional behavior or presentation that a plugin may supply, and
  that uses only the public, capability-gated API.
- **Parked**: explicitly deferred with a named reason and an owning focused
  task; a park is not acceptance and reserves no interface.
- **Candidate**: a proposal that has not been decided. Candidate `B-8` is the
  Beacon mechanism/policy split proposal; this ADR accepts its direction but
  not its names.

## Context

Core still contains optional behavior that DIR-001 keeps out of the small
core. The current evidence includes `bitty-ui/src/beacon_*.rs`, the
package-management code in `bitty-package`, the Composer implementation in
`bitty-rich`, legacy workspace and tab presentation sources, and validation
members and scripts. `bitty-observability` already exists as an independent
repository with API, core, and facade crates, but its existence is not
evidence that Core has adopted the corresponding trait boundary. The prior
workstream proposed extracting each item; a plan key `W-70` was reserved to
accept or reject those proposals, and no implementation task may treat a
proposal as accepted because a candidate document exists.

The [small-core refactor handoff](../../handoff/2026-10-02-small-core-refactor.md)
records the dependency order: decide the boundaries (`W-70`), then finalize
the focused contracts (`W-71` through `W-75`), then synchronize documentation,
then implement host and SDK surfaces, then create and implement the Beacon
plugin. This ADR performs the first step only.

## Decision

### Boundary 1 - Observability: accepted

**Status: accepted boundary.** Core retains a minimal observation mechanism
plus the authorization and redaction constraints that bound it. The optional
debug and trace implementation and the observation policy move to the
independent `bitty-observability` repository under contract `W-71` and
alignment `W-110`.

Retained Core mechanism: a minimal, bounded observation surface that Core
itself owns, together with the authorization check that gates who may observe
and the redaction rules that keep sensitive data out of observations. The
exact trait surface is parked to `W-71`; nothing about the trait shape is
decided here.

### Boundary 2 - Package manager and runtime loader: accepted

**Status: accepted boundary.** Install, source handling, dependency
resolution, transactional activation, and rollback are an external tool
(working name `bitty-plugin-manager`; the exact name is confirmed by `W-72`).
Core retains startup validation of installed-plugin integrity, compatibility,
and capability grants.

Retained Core mechanism: before Core loads an installed plugin it validates
the installed package integrity, the host and harness compatibility, and the
capability grants, and it fails closed on any mismatch. External package
management does not make startup trust blind. The focused package-manager and
runtime-loader boundary, together with the DIR-016 and DIR-017 enforcement
evidence, is `W-72`. The `[components]` and `[[network.egress]]` manifest
schema is parked to `W-10`.

### Boundary 3 - Beacon: accepted mechanism/policy split

**Status: accepted boundary** for the direction of candidate `B-8`: Core
retains the target and annotation mechanism and target safety, while policy
(trigger keys, scopes and filters, label theme, provider composition, and
menus) moves to the `beacon` plugin.

Retained Core mechanism: the target and annotation engine, including the
spatial targeting registry and the safety rules that keep a target from
becoming an unmediated action. This ADR accepts the split direction but
deliberately does not name the Core mechanism. The focused owner decision on
naming and the remaining Beacon open points is `W-03`; the Core host API is
`W-29` and the SDK surface is `W-120`. This ADR must not pre-empt the `W-03`
naming choice.

### Boundary 4 - Composer: accepted, gated on host APIs

**Status: accepted boundary**, strictly gated. Editing of the command line,
paste, external-editor launch, cancel, and submit policy move to the
`composer` plugin, and only after the public host APIs they require exist:
focusable overlay, transient input capture, and controlled PTY, temp-file,
and process access.

Retained Core mechanism: Terminal Truth and permission control. Core continues
to own the terminal state, the PTY, and the capability and consent checks that
authorize any plugin-side edit or process action. The gate is `W-73` and the
focusable overlay and input-capture contract is `W-01`; extraction is `W-103`
and its architecture contract is `W-82`. Until those land, Core keeps the
Composer behavior.

### Boundary 5 - Legacy chrome: accepted, consistent with ADR 0014

**Status: accepted boundary.** Workspace and tab presentation is plugin-only,
consistent with
[ADR 0014](ADR-0014-workspace-core-presentation-plugins.md). The bundled
`bitty-terminal.workspace` and `bitty-terminal.tabs` manifests and the
`workspace.rs` and `tabs.rs` policy are retired, but only after bar parity is
demonstrated per `W-26`, `W-27`, and `W-104` and the independent bar review in
`W-40`.

Retained Core mechanism: the workspace lifecycle and state, the panel
primitives the bars present, and the generic chrome mechanism that mounted
plugin UI uses. Core draws no workspace presentation. The remaining
tab-strip and scratchpad ownership decision is `W-74`; until it and the
retirement tasks complete, the legacy manifests and policy stay in place.

### Boundary 6 - Validation suites: accepted relocation

**Status: accepted boundary.** `bitty-compat-lab` and `bitty-perf` relocate
out of the product workspace into independent repositories or tooling that pin
and exercise the actual production revision, without weakening CI coverage.

Retained Core mechanism: none; this is a test and tooling ownership move, not
a Core mechanism change. Compatibility and performance gates must keep binding
the production revision, and the relocation must preserve or improve the
existing coverage. Membership is decided by `W-75`; execution is `W-105`.

### Decision summary

| Boundary                           | Status                 | Retained Core mechanism                                                                | Focused contract                |
| ---------------------------------- | ---------------------- | -------------------------------------------------------------------------------------- | ------------------------------- |
| Observability                      | Accepted               | Minimal observation mechanism plus authorization and redaction constraints             | `W-71`, aligned by `W-110`      |
| Package manager and runtime loader | Accepted               | Startup validation of installed-plugin integrity, compatibility, and capability grants | `W-72`; schema parked to `W-10` |
| Beacon                             | Accepted (split `B-8`) | Target and annotation mechanism and target safety; naming parked to `W-03`             | `W-03`, `W-29`, `W-120`         |
| Composer                           | Accepted (gated)       | Terminal Truth and permission control                                                  | `W-73`, `W-01`, `W-82`, `W-103` |
| Legacy chrome                      | Accepted (gated)       | Workspace lifecycle and state, panel primitives, and the generic chrome mechanism      | `W-74`, `W-26`, `W-27`, `W-104` |
| Validation suites                  | Accepted (relocation)  | None; compatibility and performance gates keep pinning the production revision         | `W-75`, `W-105`                 |

No proposed boundary is rejected at the direction level. The rejected
alternatives are the placements that would keep mechanism plus policy together
inside one component or inside Core; those are recorded under "Alternatives
considered".

## Binding constraints inherited from the bootstrap fence

The following constraints are normative for every focused contract and
implementation task that this decision unblocks. They are constraints on how a
boundary may be extracted, not new policy, and this ADR may not weaken them.

1. **Terminal Truth and Core mechanisms are retained.** Core retains Terminal
   Truth, bounded protocol intake, PTY ownership, resource and permission
   enforcement, and renderer validation even when implementations move to
   independent repositories.
2. **A standalone crate is not process isolation.** An out-of-process decoder
   still requires framing bounds, deadlines, crash recovery, and validation of
   returned dimensions, stride, and buffer length before upload.
3. **The accessibility baseline is preserved.** Accessibility is not a
   disposable optional feature: focus and actions and platform integration must
   be audited, and the accessible baseline preserved.
4. **No private first-party bypass.** Plugin policy uses the public,
   capability-gated API; there is no private first-party bypass, no raw PTY,
   GPU, or window handle, and no input hot-path callback.
5. **Runtime package integrity is validated and install-time controls are
   preserved.** Runtime loading still validates installed package integrity,
   compatibility, and grants; external package management does not make startup
   trust blind. The external package manager stays bound by the P0 package
   controls: no package code is executed during resolution or install
   (P0-AC-027), lock and checksum integrity are verified (P0-AC-028), activation
   and rollback are transactional (P0-AC-029), and a capability increase blocks
   an update (P0-AC-030). `W-72` must carry the accepted activation and rollback
   evidence (OQ-021).
6. **History is opt-in, secret-minimizing, and bounded.** Retention and
   deletion, compression, schema migration, and crash recovery require review.
   OSC 133 is not proof of a command or cwd. Atuin integration uses the
   supported CLI or API, never private database access.
7. **Storage objects are distinct.** Segmented transcript, command history,
   session snapshots, and per-plugin KV are different objects. Candidate text
   does not authorize a universal database or raw stdout persistence by
   default.
8. **Platform services use validated arguments and stay bounded.** URL
   launching uses validated arguments, not shell string interpolation;
   notification payloads need redaction and rate bounds; blur stays a
   window or compositor adapter rather than a generic background service.
9. **Compatibility and performance gates pin the production revision.**
   Preserve compatibility and performance gates and benchmark evidence when
   moving test suites; an external suite must pin and exercise the actual
   production revision.
10. **Repository and toolchain baselines hold.** Rust repositories start at
    `0.0.1`, edition 2024, with the Core MSRV. Toolchain drift is reported, not
    silently fixed, and no Lua engine upgrade is invented.

## Consequences

- Each accepted boundary authorizes a focused contract task (`W-71` through
  `W-75`) and documentation synchronization, not implementation. An
  implementation task may start only after its focused contract exists.
- The proposed extraction endpoint is a direction, not a quota: the record
  does not guarantee a crate count, a performance claim, or a security claim.
- Because Core retains the mechanisms named above, extraction reduces the
  policy surface in Core without creating a new trust relaxation. A plugin
  gains no authority by moving policy out of Core.
- A parked decision keeps its current behavior in Core. Parking the
  observability trait surface, the package manifest schema, and the Beacon
  naming means Core keeps the existing shape until the named task lands.
- This ADR authorizes no code, changes no accepted pin or ceiling, and weakens
  no security control.

## Alternatives considered

| Alternative                                                                           | Disposition                                                                                                                                                     |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep every boundary inside Core and treat a candidate repository as sufficient        | Rejected: contradicts DIR-001, leaves optional policy in the small core, and would let repository existence substitute for a decision.                          |
| Move mechanism and policy together into the optional component or plugin              | Rejected for Beacon, Composer, and legacy chrome: it would make a fundamental capability depend on plugin availability and would remove it from `bitty --safe`. |
| Extract before the focused contract exists                                            | Rejected: API spellings, manifest schema, capability grants, and host APIs would be invented by implementation instead of decided by contract.                  |
| Let the external package manager also decide startup trust                            | Rejected: runtime loading must still validate installed integrity, compatibility, and grants; external management does not make startup trust blind.            |
| Park the whole small-core decision and decide each boundary separately with no record | Rejected: the owner delegated a single boundary decision, and downstream tasks need one reviewable record that names ownership and retained mechanisms.         |
| Remove validation suites to reduce workspace size without preserving their gates      | Rejected: compatibility and performance gates must pin and exercise the production revision; relocation must not weaken CI coverage.                            |

## Affected contracts

- [Small-core refactor execution handoff](../../handoff/2026-10-02-small-core-refactor.md):
  `W-70` is now decided; the handoff's dependency order is unchanged.
- [Decision register](../index.md) and
  [ADR index](README.md): route to this ADR.
- [Open-question register](../open-questions.md): OQ-089 (Beacon) records the
  acceptance of the mechanism/policy split direction and its parked naming.
- [Execution Host and Supervisor Boundary](../../development/execution-host-boundary.md),
  [Plugin Contract and Manager Boundary](../../development/plugin-contract-and-manager-boundary.md),
  and [Native Component Boundary](../../development/native-component-boundary.md):
  focused contracts build on these draft captures without accepting them
  wholesale.
- [ADR 0014](ADR-0014-workspace-core-presentation-plugins.md): the legacy
  chrome boundary applies its retirement sequence.
- Downstream documents owned by `bitty-terminal-docs` and `bitty-plugins-docs`
  (`W-80` through `W-84`, `W-90`, `W-91`): synchronized after the focused
  contracts. The SDK surface work (`W-120`) and the new SDK APIs (`W-139`) are
  implementation tasks that follow their contracts, not document
  synchronization.

## Open points

The following details are parked, not decided. Each park names the task that
owns it and the reason.

- **Observability trait surface** parked to `W-71`: the minimal Core
  observation contract and the extraction acceptance gate must define the
  trait, the authorization check, and the redaction constraints before `W-100`
  or `W-110` proceeds.
- **Package manifest schema** parked to `W-10`: `[components]` and
  `[[network.egress]]` are not admitted to the manifest contracts yet, and
  `W-72` must reconcile the package-manager boundary with DIR-016, DIR-017,
  and DIR-030.
- **Beacon naming and open points** parked to `W-03`: the Core mechanism name,
  trigger keys, scopes and filters, label theme, provider composition, menus,
  label allocation, and script-dispatch authority remain undecided. `W-29`
  defines the host API and `W-120` the SDK surface after `W-03`.
- **Composer host APIs** parked to `W-73` and `W-01`: focusable overlay,
  transient input capture, PTY paste, external-editor process, and lifecycle
  contracts must exist before `W-103` extracts the Composer.
- **Legacy tab-strip and scratchpad ownership** parked to `W-74`: the
  remaining chrome ownership decision follows bar parity (`W-40`) and
  ADR 0014; retirement (`W-26`, `W-27`, `W-104`) waits on it.
- **Validation-suite membership** parked to `W-75`: whether the suites become
  independent repositories or explicitly excluded tooling is undecided;
  `W-105` executes the decision without weakening CI coverage.
- **Execution, graphics, accessibility, storage, and platform-service
  boundaries** remain the separate `W-130` decision, followed by the `W-131`
  history and storage scope reconciliation; they are not decided here.

## Downstream task disposition

`W-70` satisfied the decision prerequisite for the following tasks, which were
otherwise blocked only on this boundary decision:

- Governance and contracts: `W-71`, `W-72`, `W-73`, `W-74`, `W-75`.
- Documentation synchronization: `W-80`, `W-81`, `W-82`, `W-83`, `W-84`,
  `W-90`, `W-91`.
- Core and extracted repositories: `W-100`, `W-101`, `W-102`, `W-103`,
  `W-104`, `W-105`, `W-110`.
- SDK and plugin ecosystem: `W-120`, `W-121`.
- Later decisions: `W-130` and `W-131`.

These tasks are unblocked only with respect to `W-70`. Each still depends on
its own focused contract or prerequisite and must not start earlier:

- `W-80` waits on `W-71` through `W-75`; `W-90` waits on `W-01` and `W-81`;
  `W-91` waits on `W-01` and `W-90`.
- `W-100` and `W-110` wait on the `W-71` contract; `W-101` waits on `W-72`;
  `W-102` waits on `W-01`, `W-81`, and `W-90`; `W-103` waits on `W-01`,
  `W-73`, and `W-82`; `W-104` waits on `W-40`, `W-74`, and `W-83`; `W-105`
  waits on `W-75`.
- `W-120` waits on `W-01`, `W-90`, and `W-91`; `W-139` waits on `W-135`,
  `W-137`, and `W-138`; `W-121` waits on `W-90` and `W-120`.
- `W-130` waits on this decision and the accepted security corpus; `W-131`
  waits on `W-130`.
- Out-of-scope work that this decision does not unblock: `W-122` (bar
  onboarding) stays gated on `W-40` and `W-51`, and the `W-132` through `W-147`
  execution, graphics, accessibility, and storage tasks stay gated on `W-130`
  and `W-131`.

## Security review

Observability, the package manager and runtime loader, Beacon, the Composer,
legacy chrome, and the validation suites all touch trust boundaries that the
[security overview](../../security/overview.md) governs. Independent security
review is required before this ADR merges: the reviewers must confirm that
every retained mechanism and every park preserves the binding constraints in
this document, that no accepted boundary introduces a private first-party
bypass or ambient authority, and that no focused contract may weaken a P0
control. The focused contracts `W-71` through `W-75` each require security
review again before their own merge.

## Verification plan

This is a decision record; it has no executable verification. Its acceptance
gate is:

1. The record states a decision for every boundary and names the retained Core
   mechanism for each accepted boundary.
2. The binding constraints are reproduced from the bootstrap fence without
   weakening them.
3. The reviewer roles are named and independent security review is required
   before merge.
4. Repository-local `just check` passes with zero issues.
5. No downstream task is described as implemented, and no boundary is
   described as implemented.

## Acceptance criteria

- Every one of the six boundaries has an explicit status: accepted, parked, or
  rejected, plus the retained Core mechanism when accepted.
- Candidate, open, accepted, and implemented claims are distinguishable and
  no boundary is described as implemented.
- The reviewers are named and the independent security review requirement is
  stated.
- The decision registers and affected open questions route to this ADR.
- `just check` passes with zero issues.

## P0 Review Sign-off

| Role                 | Scope                                                                | Requirement                                          |
| -------------------- | -------------------------------------------------------------------- | ---------------------------------------------------- |
| `architecture-owner` | Ownership and boundary correctness                                   | Approve; confirms retained mechanisms and ownership. |
| `security-reviewer`  | Trust boundaries, capabilities, packages, and redaction              | Independent security review required before merge.   |
| `docs-curator`       | Taxonomy, metadata, links, terminology, and register synchronization | Approve; confirms discoverability and schema.        |

## References

- [Small-core refactor execution handoff](../../handoff/2026-10-02-small-core-refactor.md),
  plan key `W-70`.
- Binding constraints: restated normatively above; authoritative trust
  boundaries in the [security overview](../../security/overview.md) and the
  P0 acceptance criteria.
- [bitty-docs#399](https://github.com/bitty-terminal/bitty-docs/issues/399)
  (CarryCtx `CTX-0259`).
- [ADR 0014 - Workspace as Core Mechanism with Plugin-Only Presentation](ADR-0014-workspace-core-presentation-plugins.md).
- [Decision register](../index.md), [ADR index](README.md), and
  [open-question register](../open-questions.md).
- [Execution Host and Supervisor Boundary](../../development/execution-host-boundary.md),
  [Plugin Contract and Manager Boundary](../../development/plugin-contract-and-manager-boundary.md),
  and [Native Component Boundary](../../development/native-component-boundary.md).
