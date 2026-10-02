---
title: ADR 0016 - Execution, Graphics, Accessibility, Storage, and Platform-Service Boundaries
description: Owner-delegated decision accepting the execution, graphics, accessibility, storage, and platform-service extraction boundaries and parking their focused contracts
category: decisions
audience: maintainer
document_type: specification
status: accepted
website_publish: true
sidebar_order: 46
---

# ADR 0016 - Execution, Graphics, Accessibility, Storage, and Platform-Service Boundaries

## Document status

Accepted on 2026-10-02 as the owner-delegated `W-130` boundary decision on
[bitty-docs#406](https://github.com/bitty-terminal/bitty-docs/issues/406)
(CarryCtx `CTX-0266`). The project initiator delegated the small-core boundary
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
- Related: [ADR 0015](ADR-0015-small-core-extraction-boundaries.md) (the
  immediately-preceding `W-70` boundary decision, which this ADR extends and
  does not repeat); [ADR 0013](ADR-0013-core-ontology-identity.md) (the
  ontology and identity separation including `ExecutionContext` and
  `GenerationId`); DIR-001 (small Core); DIR-017 (Core network no-initiate
  invariant); DIR-021 (graphics as image producers over a shared composition
  pipeline); DIR-023 (Core emits events, a plugin persists history); DIR-026
  (execution host and supervisor direction); DIR-030 (native components); the
  draft
  [Execution Host and Supervisor Boundary](../../development/execution-host-boundary.md),
  [Plugin Contract and Manager Boundary](../../development/plugin-contract-and-manager-boundary.md),
  and [Native Component Boundary](../../development/native-component-boundary.md);
  and the cross-session execution map in the
  [small-core refactor handoff](../../handoff/2026-10-02-small-core-refactor.md).

## Purpose and scope

This ADR decides, for each of the five runtime and platform-service
boundaries, whether the direction and ownership are accepted, parked, or
rejected, and what Core retains when an extraction is accepted. The five
boundaries are the execution supervisor, graphics decode and processing,
platform accessibility, restricted storage, and platform services
(notification, URL open, and compositor blur). It also records the binding
constraints that every focused contract and implementation task must preserve,
and the downstream task disposition.

The decision covers the ownership split and the retained Core mechanism for
each boundary. It does not decide API spellings, wire or trait surfaces,
manifest schemas, worker placement, or implementation strategy; those are
parked to the focused contracts named in "Open points". In particular, whether
a boundary becomes a crate, an out-of-process worker, or another shape is
decided by its focused contract (`W-132` for execution, `W-133` for graphics,
`W-134` for accessibility), not by this ADR.

Every binding constraint that a focused contract or implementation task must
preserve is stated normatively in "Binding constraints inherited from the
bootstrap fence" below. This ADR neither adds to nor weakens them; the trust
boundaries they protect remain governed by the canonical security corpus
([security overview](../../security/overview.md), the
[P0 acceptance criteria](../../security/p0-acceptance-criteria.md), and the
[risk register](../../security/risk-register.md)).

In scope: the boundary decisions, the retained Core mechanisms, the reviewer
roles, the parked details, and the downstream task disposition. Out of scope:
API spellings, wire protocols, manifest and trait schemas, repository creation,
and implementation.

## Normative sources this specification must not weaken

The decision must be read together with, and must not weaken:

- The [security overview](../../security/overview.md), the threat model, the
  [risk register](../../security/risk-register.md), and the
  [P0 acceptance criteria](../../security/p0-acceptance-criteria.md), which stay
  authoritative on every trust boundary named here. The named controls include
  graphics decompression limits (`P0-AC-003`) and the aggregate image-store
  budget (`P0-AC-004`), deny-by-default local file loading (`P0-AC-005`),
  hyperlink scheme policy and direct launch (`P0-AC-009`), plugin capability
  checking and hot-path exclusion (`P0-AC-012`, `P0-AC-015`), Terminal Truth
  ownership (`P0-AC-016`), safe mode (`P0-AC-019`), trace minimization and
  redaction (`P0-AC-026`), and package install and activation integrity
  (`P0-AC-027` through `P0-AC-030`).
- [ADR 0015 - Small-Core Extraction Boundaries](ADR-0015-small-core-extraction-boundaries.md),
  which accepted the preceding boundaries and inherits the same bootstrap
  fence. This ADR does not reopen or restate ADR 0015.
- [ADR 0013 - Core Ontology and Identity Model](ADR-0013-core-ontology-identity.md):
  the `ExecutionContext`, `Terminal`, `Panel`, `GenerationId`, and
  identity-separation relations that the execution and accessibility
  boundaries reuse.
- [ADR 0008 - Headless Daemon, Detach/Reattach and Remote UI Trust Boundary](ADR-0008-headless.md):
  the deferred headless/daemon direction that execution Phase 3 must compose
  with rather than bypass.
- DIR-017 (Core network no-initiate invariant), DIR-021 (graphics and
  appearance), DIR-023 (Panel History direction), DIR-026 (execution host and
  supervisor direction), and DIR-030 (native components: no socket daemon, no
  `PATH` discovery, no dynamically loaded library for native capability).
- The accepted terminal, plugin, and AI contracts that build on these
  boundaries: the
  [Terminal State RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/terminal-state-rfc.md),
  [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md),
  [Rich Presentation RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/rich-presentation-rfc.md),
  [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md),
  [Isolation Resource RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/isolation-resource-rfc.md),
  and
  [IPC and Agent RFC](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/specifications/ipc-agent-rfc.md).
- The [open-question register](../open-questions.md): OQ-061 (identity
  domains), OQ-008 (rich/content image contract, already accepted),
  OQ-078 (accessibility contract), OQ-076 (notification policy), and OQ-038
  (per-surface opacity and blur). This ADR assigns ownership of the remaining
  contract questions; it does not answer them.

## Terminology

- **Boundary decision**: acceptance of a direction and an ownership split,
  before any focused contract or implementation exists.
- **Focused contract**: the succeeding document that fixes the exact
  interface, schema, quota, or enforcement evidence for one boundary.
- **Mechanism**: a Core-owned, always-available primitive that works with zero
  plugins and in `bitty --safe`.
- **Policy**: optional behavior or presentation that a plugin may supply, and
  that uses only the public, capability-gated API.
- **Parked**: explicitly deferred with a named reason and an owning focused
  task; a park is not acceptance and reserves no interface.
- **Terminal Truth**: parser state, grid semantics, cursor state, modes, and
  canonical scrollback, as defined by the security corpus and the Terminal
  State RFC; plugins may alter presentation, never Terminal Truth.
- **Generation fencing**: the rule that an assignment generation (semantic
  ownership) is distinct from an execution generation (host handle), and that
  the host itself rejects a stale handle rather than trusting the caller.
- **Storage objects**: the four distinct objects named by the bootstrap fence -
  segmented transcript, command history, session snapshots, and per-plugin
  key-value (KV) state.

## Context

Core still carries, or is the proposed home for, several runtime and
platform-service behaviors that DIR-001 keeps out of the small core. The
current evidence includes the execution-host and supervisor direction recorded
in the [Execution Host and Supervisor Boundary](../../development/execution-host-boundary.md)
and the T-1 execution host candidate in
[Terminal Platform Boundaries](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/terminal-platform-boundaries-candidate.md);
the graphics decode, placement, and quota direction in
[Graphics and Appearance](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/architecture/graphics-appearance.md)
and the accepted image contract in the
[Rich Presentation RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/rich-presentation-rfc.md);
the absence of any accessibility tree or platform adapter, with a draft
baseline in
[Accessibility Baseline (Candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/accessibility-baseline-candidate.md)
and open question OQ-078; the history and storage direction in DIR-023 and
[Panel History (Candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-history-candidate.md);
and the notification, URL-launch, and blur platform services named in the
[Terminal Feature Gap Analysis](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/terminal-feature-gap-analysis.md),
the [security overview](../../security/overview.md) capability families, and
DIR-021.

A plan key `W-130` was reserved to accept or reject those proposals. Candidate
repositories (`bitty-execution`, `bitty-graphics`, `bitty-a11y`,
`bitty-storage`) and candidate platform-service adapters are planning targets,
not accepted contracts: a candidate document or an existing scaffold is not
evidence that the corresponding boundary is accepted. The
[small-core refactor handoff](../../handoff/2026-10-02-small-core-refactor.md)
records the dependency order: decide the boundary (`W-130`), then reconcile
history and storage scope (`W-131`), then finalize the focused contracts
(`W-132` through `W-138`), then the SDK surface (`W-139`) and the extraction and
verification tasks (`W-140` through `W-147`). This ADR performs the first step
only.

## Decision

### Boundary 1 - Execution supervisor: accepted

**Status: accepted boundary.** The AI-agnostic execution supervisor - task
lifecycle and spawn-time lifetime, cancellation execution, PTY and process
resource management, structured outcome, bounded output, and recovery - moves
to an independent execution repository (reserved candidate name
`bitty-execution`) under focused contract `W-132`, aligned with OQ-061. Core
retains PTY and process permission enforcement, identity and generation
fencing at the host boundary, and the lifecycle coordination that keeps host
mechanisms distinct from semantic `bitty-ai` ownership.

Retained Core mechanism: Terminal Truth and PTY ownership; the permission and
resource enforcement that authorizes every `observe`, `read_output`,
`write_input`, `signal`, `cancel`, `attach`, and `transfer` operation per
principal; the execution-generation handle that the host itself invalidates
when stale (a stale handle must not end an arbitrary process because of a
caller defect); the AI-agnostic typed execution bridge that never learns agent
or task ontology; and the safe defaults (closed stdin unless an interactive
PTY is explicitly requested, `argv`-first execution rather than a shell
string). The exact trait, wire, and outcome shapes are parked to `W-132`;
nothing about the interface is decided here.

Independent ownership: process supervision mechanics such as the job registry,
deadline and timeout clocks, owned-process-tree kill, per-platform backend
split (per-job cgroups v2 plus process groups plus pidfd on Linux,
kqueue/process wait on macOS, Job Objects plus ConPTY on Windows), OOM
determination evidence, output retention and artifact reference mechanics, and
Phase 2 restart reconciliation and Phase 3 detached supervision. Semantic work
(task model, binding, claims, mailbox, retry and timeout policy selection)
stays with the `bitty-ai` owner and is not captured here.

### Boundary 2 - Graphics decode and processing: accepted

**Status: accepted boundary.** Image decode and processing - including the
optional worker path - moves to an independent graphics repository (reserved
candidate name `bitty-graphics`) under focused contract `W-133`, aligned with
the accepted OQ-008 rich/image contract. Core retains bounded protocol intake,
image placement and resource policy, the aggregate image-store budget, and
pre-upload validation.

Retained Core mechanism: the bounded APC/Kitty/Sixel intake and parser limits;
the placement namespace and lifecycle policy; the aggregate image-store budget
with eviction or refusal (`P0-AC-004`); and the pre-allocation and pre-upload
validation that rejects a payload whose decoded size, pixel dimensions, stride,
or buffer length would exceed the declared budget before any large allocation
occurs (`P0-AC-003`). A decoder that moves to its own repository does not move
the trust decision: Core still validates the returned dimensions, stride, and
buffer length before upload.

Independent ownership: decoder and codec processing, texture-preparation
mechanics, and - when the focused contract chooses a worker - the worker
lifecycle: framing bounds, deadlines, crash recovery, and output validation.
If the boundary is a worker, the worker's own memory is not trusted and its
output is revalidated by Core before upload.

### Boundary 3 - Platform accessibility: accepted

**Status: accepted boundary.** The platform accessibility adapter - semantic
snapshots, focus synchronization, and a controlled action interface - moves to
an independent accessibility repository (reserved candidate name `bitty-a11y`)
under focused contract `W-134`, aligned with OQ-078. Core retains the
accessibility baseline and the correctness of focus and terminal-state
association.

Retained Core mechanism: the accessibility baseline as a normative obligation,
not a disposable optional feature. Semantics is a projection derived from
Terminal Truth, the accepted scene model, and chrome state; it is never a
second state, never persisted, never routing authority, and never consulted for
dispatch. Core retains the required mapping of scene and terminal content, the
focus-order rule that excludes chrome from the tab order, bounded focus-change
announcements, reduced-motion and contrast respect, and the privacy rule that
the projection is host-side and is not published on the Event Bus (exposing one
panel's content must not become a cross-panel read path for plugins). It also
retains the rule that assistive focus and terminal state stay correctly
associated: a focus move between panels, views, or overlays must report the
destination that actually holds focus.

Independent ownership: platform adapter backends (assistive-technology
integration per Tier 1 platform), the tree/stream/adapter exposure mechanics,
snapshot serialization, and the controlled action-dispatch adapter. Whether the
projection is a tree, a stream, or a platform adapter is decided by `W-134`,
not by this ADR. The accessible baseline must be preserved during extraction
(`W-142`); extraction may not drop focus synchronization or downgrade the
baseline.

### Boundary 4 - Restricted storage: accepted after boundary acceptance

**Status: accepted boundary, gated on `W-131`.** Persistent storage mechanics
may move to an independent storage repository (reserved candidate name
`bitty-storage`) only after the `W-131` history and storage scope
reconciliation accepts the scope. Core retains Terminal Truth, permission and
resource budgets, and the rule that sensitive output is not persisted by
default.

Retained Core mechanism: volatile Terminal Truth - the current screen and the
in-memory scrollback behind `PageUp`, wheel, and search that dies with the
panel; persistence must never replace or mutate that Core structure.
Persistence is opt-in, secret-minimizing, and bounded; recording input is a
separate opt-in, and raw stdout is not persisted by default. Core also retains
the permission and resource budgets that bound any store, the rule that OSC 133
is not proof of a command or a cwd, and the rule that any Atuin integration uses
the supported CLI or API rather than private database access.

Independent ownership: persistent store mechanics after `W-131` accepts the
scope - the append-only segmented log, the rebuildable index, retention and
compaction, compression, schema migration, and crash recovery - together with
the plugin-facing history and storage policy fixed by `W-137`. The four storage
objects (segmented transcript, command history, session snapshots, and
per-plugin KV) stay distinct objects; no candidate text authorizes a universal
database or a single store for all four. `W-146` integrates the boundary into
Core while preserving volatile Terminal Truth.

### Boundary 5 - Platform services (notification, URL open, compositor blur): accepted

**Status: accepted boundary.** The platform-service adapters - notification
delivery, URL opening, and compositor blur - move behind a platform-service
adapter boundary under focused contract `W-136` (bitty-terminal-docs), aligned
with DIR-017 and OQ-076/OQ-038. Core retains permission control for each
service.

Retained Core mechanism: the capability gate and consent for the platform
capability family (notifications, hyperlinks, and image-file access); validated
arguments for URL launching with no shell construction or interpolation
anywhere in the path (`P0-AC-009`); redaction and rate bounds on notification
payloads; and the rule that blur stays a window or compositor adapter whose
availability is platform-gated and meaningful only with opacity below one,
never a generic background service and never a protocol-module concern.

Independent ownership: the platform API plumbing for notification delivery,
URL launch, and compositor blur behind the adapter, plus the presentation
policy for which events notify, message text, and silence rules. DIR-030 stays
authoritative: a native capability is a verified on-demand stdio coprocess, not
a socket daemon, not `PATH` discovery, and not a dynamically loaded library.
`W-145` reduces the platform auxiliaries without removing permission
enforcement. Whether the adapter is a crate, a module, or a repository is
decided by `W-136`, not by this ADR.

### A separate repository is not a separate process

For the execution, graphics, and storage boundaries, creating or naming a
separate repository (or crate) does not create process isolation and does not
change the trust decision. An out-of-process decoder or store must still
enforce framing bounds, deadlines, crash recovery, and validation of returned
data before the host consumes it; an execution supervisor is not trusted merely
because its code lives elsewhere. Whether each boundary becomes a crate, an
out-of-process worker, or another shape is decided by the focused contracts
(`W-132` for execution, `W-133` for graphics, `W-134` for accessibility, and
the `W-131`/`W-137` scope and policy for storage), not by this ADR. Repository
creation remains a separate scoped task and does not imply acceptance of an
interface.

### Decision summary

| Boundary                       | Status                     | Retained Core mechanism                                                                                    | Focused contract                 |
| ------------------------------ | -------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Execution supervisor           | Accepted                   | Terminal Truth, PTY/permission/resource enforcement, generation fencing, AI-agnostic bridge, safe defaults | `W-132`; identity via OQ-061     |
| Graphics decode and processing | Accepted                   | Bounded protocol intake, placement/resource policy, aggregate image budget, pre-upload validation          | `W-133`; image contract OQ-008   |
| Platform accessibility         | Accepted                   | Accessibility baseline, projection-not-authority rule, focus/terminal-state association, privacy           | `W-134`; contract OQ-078         |
| Restricted storage             | Accepted, gated on `W-131` | Terminal Truth, permission/resource budgets, opt-in secret-minimizing bounded persistence                  | `W-131`, `W-137`; policy `W-137` |
| Platform services              | Accepted                   | Permission gate, validated URL arguments, notification redaction/rate bounds, blur as platform adapter     | `W-136`; OQ-076, OQ-038, DIR-017 |

No proposed boundary is rejected at the direction level. The rejected
alternatives are the placements that would keep mechanism plus policy together
inside one component or inside Core, and the placements that would treat a
standalone crate as process isolation; those are recorded under "Alternatives
considered".

## Binding constraints inherited from the bootstrap fence

The following constraints are normative for every focused contract and
implementation task that this decision unblocks. They are the boundary-specific
inheritance of the same bootstrap fence restated in
[ADR 0015](ADR-0015-small-core-extraction-boundaries.md); they are constraints
on how a boundary may be extracted, not new policy, and this ADR may not weaken
them.

1. **Terminal Truth and Core mechanisms are retained.** Core retains Terminal
   Truth, bounded protocol intake, PTY ownership, resource and permission
   enforcement, and renderer validation even when implementations move to
   independent repositories.
2. **A standalone crate is not process isolation.** An out-of-process decoder
   or store still requires framing bounds, deadlines, crash recovery, and
   validation of returned data; an extracted execution supervisor is not
   trusted by location.
3. **Execution identity and authority are fenced by the host.** Execution
   generation is distinct from assignment generation; the host rejects a stale
   handle itself; capability-scoped execution operations are authorized per
   principal; and an AI-layer defect cannot end an arbitrary process.
4. **The execution output contract is bounded.** Raw output never floods model
   context; a bounded ring plus optional persisted logs and artifact references
   carry only tails and references; no default retry; a structured outcome is
   never a bare exit code.
5. **Graphics enforce pre-allocation and aggregate budgets.** Compressed and
   decoded size, pixel dimensions, and the total image-store budget are
   enforced before allocation; returned worker output is revalidated before
   upload (`P0-AC-003`, `P0-AC-004`).
6. **The accessibility baseline is preserved.** Accessibility is not a
   disposable optional feature: the projection is never authority, focus and
   actions and platform integration must be audited, and the accessible
   baseline must survive extraction.
7. **No private first-party bypass.** Plugin policy uses the public,
   capability-gated API; there is no private first-party bypass, no raw PTY,
   GPU, or window handle, and no input hot-path callback.
8. **History is opt-in, secret-minimizing, and bounded.** Retention and
   deletion, compression, schema migration, and crash recovery require review.
   OSC 133 is not proof of a command or cwd. Atuin integration uses the
   supported CLI or API, never private database access.
9. **Storage objects are distinct.** Segmented transcript, command history,
   session snapshots, and per-plugin KV are different objects. Candidate text
   does not authorize a universal database or raw stdout persistence by
   default.
10. **Platform services use validated arguments and stay bounded.** URL
    launching uses validated arguments, not shell string interpolation
    (`P0-AC-009`); notification payloads need redaction and rate bounds; blur
    stays a window or compositor adapter rather than a generic background
    service.
11. **Runtime package integrity and install-time controls are preserved.**
    Runtime loading still validates installed package integrity, compatibility,
    and grants; external package management does not make startup trust blind.
    The package controls `P0-AC-027` through `P0-AC-030` continue to bind any
    extracted component that ships as a package.
12. **Repository and toolchain baselines hold.** Rust repositories start at
    `0.0.1`, edition 2024, with the Core MSRV. Toolchain drift is reported, not
    silently fixed, and no Lua engine upgrade is invented. Compatibility and
    performance gates keep pinning the actual production revision.

## Consequences

- Each accepted boundary authorizes its focused contract task (`W-131`,
  `W-132`, `W-133`, `W-134`, `W-136`, and downstream `W-137`) and documentation
  synchronization, not implementation. An implementation task may start only
  after its focused contract exists.
- Storage is deliberately gated: `W-131` must reconcile the history and storage
  scope before any persistent store is authoritative, so the boundary does not
  turn four distinct objects into one unreviewed database.
- Because Core retains the mechanisms named above, extraction reduces the
  runtime and platform policy surface in Core without creating a new trust
  relaxation. A plugin or an extracted component gains no authority by moving
  code out of Core.
- A parked detail keeps its current behavior in Core. Parking the exact
  execution, graphics, accessibility, storage, and platform-service interfaces
  means Core keeps the existing shape until the named task lands; no candidate
  repository is created by this ADR.
- This ADR authorizes no code, changes no accepted pin or ceiling, and weakens
  no security control.

## Alternatives considered

| Alternative                                                                                     | Disposition                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Keep every runtime and platform behavior inside Core, treating a candidate repository as enough | Rejected: contradicts DIR-001, leaves optional behavior in the small core, and would let repository existence substitute for a decision.                                             |
| Move mechanism and policy together into the extracted component or plugin                       | Rejected: it would make a fundamental capability (execution, graphics, accessibility, storage, platform services) depend on optional availability and remove it from `bitty --safe`. |
| Treat a standalone crate or repository as process isolation                                     | Rejected: a decoder, store, or supervisor in another repository is still untrusted input at the Core boundary; framing, deadlines, recovery, and output validation remain required.  |
| Let the extracted graphics worker own placement and budget decisions                            | Rejected: Core retains placement/resource policy, the aggregate image budget, and pre-upload validation; the worker is revalidated.                                                  |
| Make accessibility an optional plugin feature or a post-1.0 concern                             | Rejected: the accessibility baseline is a preserved obligation, the projection may never become authority, and focus/terminal-state association must stay correct.                   |
| Decide the storage scope inside this ADR rather than reconciling it first                       | Rejected: the four storage objects have different lifecycles and budgets; `W-131` must reconcile the scope before the boundary is authoritative.                                     |
| Let the platform-service adapter also decide permission or consent                              | Rejected: Core retains the permission gate, validated URL arguments, and notification redaction and rate bounds; the adapter only executes what Core authorizes.                     |

## Affected contracts

- [Small-core refactor execution handoff](../../handoff/2026-10-02-small-core-refactor.md):
  `W-130` is now decided; the handoff's dependency order is unchanged.
- [Decision register](../index.md) and [ADR index](README.md): route to this
  ADR.
- [Open-question register](../open-questions.md): OQ-078 (accessibility),
  OQ-076 (notification), and OQ-061 (identity domains) record the assignment of
  their remaining contract questions to `W-134`, `W-136`, and `W-132`
  respectively; OQ-038 (blur) and OQ-008 (image contract) are referenced
  without being reopened.
- [ADR 0015](ADR-0015-small-core-extraction-boundaries.md): this ADR extends
  its boundary program; it does not reopen its acceptances.
- [Execution Host and Supervisor Boundary](../../development/execution-host-boundary.md),
  [Plugin Contract and Manager Boundary](../../development/plugin-contract-and-manager-boundary.md),
  and [Native Component Boundary](../../development/native-component-boundary.md):
  focused contracts build on these draft captures without accepting them
  wholesale.
- Cross-repository documents owned by `bitty-terminal-docs` and
  `bitty-plugins-docs` (`W-132` through `W-138`): synchronized after the
  focused contracts. The SDK surface work (`W-139`) and the extraction and
  verification tasks (`W-140` through `W-147`) follow their contracts, not
  document synchronization.

## Open points

The following details are parked, not decided. Each park names the task that
owns it and the reason.

- **Execution contract** parked to `W-132` (bitty-terminal-docs): the
  principals, generation and fencing rules, spawn-time lifetime, PTY/process
  ownership, cancellation protocol and outcomes, OOM evidence, output and
  artifact retention, and recovery/reconciliation shapes. Identity domain
  separation stays with OQ-061.
- **Graphics contract** parked to `W-133` (bitty-terminal-docs): bounded APC
  intake, the decode worker or crate shape, placement, quotas, texture upload,
  and failure handling. The accepted OQ-008 rich/image contract and
  `P0-AC-003`/`P0-AC-004` are not reopened.
- **Accessibility contract** parked to `W-134` (bitty-terminal-docs): the
  semantic snapshot shape, focus and action interface, privacy rules, platform
  backends, and baseline coverage. OQ-078 remains the open question owner.
- **Platform-service contract** parked to `W-136` (bitty-terminal-docs):
  notification, URL permission and launch, and compositor blur. OQ-076 and
  OQ-038 remain the open question owners; DIR-017 stays authoritative.
- **Storage scope reconciliation** parked to `W-131` (bitty-docs): which of the
  four storage objects is persisted, with what retention, budgets, and
  boundaries. The plugin-facing history and storage policy is `W-137`
  (bitty-plugins-docs), and integration into Core is `W-146`.
- **SDK surface** parked to `W-139` (bitty-plugin-sdk): the accepted public
  history, storage, search, and selection APIs, mock host, and conformance
  suite, after `W-135`, `W-137`, and `W-138`.
- **Search and selection** is not a `W-130` boundary: `W-135`
  (bitty-terminal-docs) and `W-138` (bitty-plugins-docs) own the search and
  copy-mode mechanisms and policy, with prerequisites `W-01` and OQ-074/OQ-075.
  This ADR neither parks nor unblocks them.

## Downstream task disposition

`W-130` satisfied the decision prerequisite for the following tasks, which were
otherwise blocked only on this boundary decision:

- Boundary contracts: `W-132`, `W-133`, `W-134`, `W-136`.
- Storage path: `W-131` (reconciliation), then `W-137` (policy) and `W-146`
  (integration); SDK `W-139` follows `W-135`/`W-137`/`W-138`.
- Extraction and verification: `W-140` (execution), `W-141` (graphics),
  `W-142` (accessibility), `W-145` (platform services), and `W-147` (integrated
  verification).

These tasks are unblocked only with respect to `W-130`. Each still depends on
its own focused contract or prerequisite and must not start earlier:

- `W-132` waits on this decision, OQ-061, and the accepted security corpus;
  `W-133` waits on this decision and the accepted OQ-008 image contract;
  `W-134` waits on this decision; `W-136` waits on this decision and DIR-017.
- `W-131` waits on `W-130`; `W-137` waits on `W-131`; `W-139` waits on `W-135`,
  `W-137`, and `W-138`.
- `W-140` waits on `W-132` and execution implementation evidence; `W-141` waits
  on `W-133`; `W-142` waits on `W-134`; `W-145` waits on `W-136`; `W-146` waits
  on `W-131`, `W-137`, and storage implementation; `W-147` waits on `W-140`
  through `W-146` and `W-100` through `W-105`.
- Out of scope and not unblocked by this decision: `W-135` and `W-138` (search
  and copy mode) stay gated on `W-01` and OQ-074/OQ-075; `W-143` waits on
  `W-135` and `W-139`, and `W-144` waits on `W-143`.

## Security review

Execution, graphics, accessibility, storage, and platform services all touch
trust boundaries that the [security overview](../../security/overview.md)
governs. Independent security review is required before this ADR merges: the
reviewers must confirm that every retained mechanism and every park preserves
the binding constraints in this document, that no accepted boundary introduces
a private first-party bypass or ambient authority, that a standalone repository
is not treated as process isolation, and that no focused contract may weaken a
P0 control. The focused contracts `W-131` through `W-138` each require security
review again before their own merge.

## Verification plan

This is a decision record; it has no executable verification. Its acceptance
gate is:

1. The record states a decision for every boundary and names the retained Core
   mechanism and the independent ownership for each accepted boundary.
2. The binding constraints are reproduced from the bootstrap fence without
   weakening them.
3. The record states that "a separate repository is not a separate process" and
   that the crate-versus-worker-versus-other choice belongs to the focused
   contracts, not this ADR.
4. The reviewer roles are named and independent security review is required
   before merge.
5. Repository-local `just check` passes with zero issues.
6. No downstream task is described as implemented, and no boundary is described
   as implemented.

## Acceptance criteria

- Every one of the five boundaries has an explicit status, the retained Core
  mechanism, and the independent ownership.
- Candidate, open, accepted, and implemented claims are distinguishable and no
  boundary is described as implemented.
- The storage boundary is explicitly gated on `W-131`, and the four storage
  objects stay distinct.
- The reviewers are named and the independent security review requirement is
  stated.
- The decision register and affected open questions route to this ADR.
- `just check` passes with zero issues.

## P0 Review Sign-off

| Role                 | Scope                                                                | Requirement                                          |
| -------------------- | -------------------------------------------------------------------- | ---------------------------------------------------- |
| `architecture-owner` | Ownership and boundary correctness                                   | Approve; confirms retained mechanisms and ownership. |
| `security-reviewer`  | Trust boundaries, capabilities, execution, graphics, and storage     | Independent security review required before merge.   |
| `docs-curator`       | Taxonomy, metadata, links, terminology, and register synchronization | Approve; confirms discoverability and schema.        |

## References

- [Small-core refactor execution handoff](../../handoff/2026-10-02-small-core-refactor.md),
  plan key `W-130`.
- Binding constraints: restated normatively above; authoritative trust
  boundaries in the [security overview](../../security/overview.md), the
  [P0 acceptance criteria](../../security/p0-acceptance-criteria.md), and the
  [risk register](../../security/risk-register.md).
- [bitty-docs#406](https://github.com/bitty-terminal/bitty-docs/issues/406)
  (CarryCtx `CTX-0266`).
- [ADR 0015 - Small-Core Extraction Boundaries](ADR-0015-small-core-extraction-boundaries.md)
  and [ADR 0013 - Core Ontology and Identity Model](ADR-0013-core-ontology-identity.md).
- [Decision register](../index.md), [ADR index](README.md), and
  [open-question register](../open-questions.md).
- [Execution Host and Supervisor Boundary](../../development/execution-host-boundary.md),
  [Plugin Contract and Manager Boundary](../../development/plugin-contract-and-manager-boundary.md),
  and [Native Component Boundary](../../development/native-component-boundary.md).
- Cross-repository sources:
  [Terminal Platform Boundaries](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/terminal-platform-boundaries-candidate.md),
  [Core Boundaries](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/architecture/core-boundaries.md),
  [Graphics and Appearance](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/architecture/graphics-appearance.md),
  [Accessibility Baseline (Candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/accessibility-baseline-candidate.md),
  [Panel History (Candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-history-candidate.md),
  [Terminal Feature Gap Analysis](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/terminal-feature-gap-analysis.md),
  [UI and Compositor Gap Analysis](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/ui-compositor-gap-analysis.md),
  [Rich Content](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/interfaces/rich-content.md),
  [Rich Presentation RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/rich-presentation-rfc.md),
  [Terminal State RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/terminal-state-rfc.md),
  [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md),
  [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md),
  [Isolation Resource RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/isolation-resource-rfc.md),
  [AI Architecture](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/architecture/ai-architecture.md),
  and
  [IPC and Agent RFC](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/specifications/ipc-agent-rfc.md).
