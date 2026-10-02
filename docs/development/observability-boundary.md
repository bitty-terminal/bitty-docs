---
title: Observability Boundary
description: Draft W-71 contract for the minimal Core read-only observation mechanism, its authorization gate, redaction and bounds, the default build behavior, and the bitty-observability extraction gates
category: development
audience: contributor
document_type: specification
status: draft
website_publish: true
sidebar_order: 27
---

# Observability Boundary

## Document status

Draft. This document is the `W-71` focused contract for Boundary 1
(Observability) that [ADR 0015](../decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
accepted in direction and parked to `W-71` and `W-110`. It proposes the minimal
read-only observation mechanism Core retains, the authorization gate and
redaction rules that bound it, the default build behavior, the external
responsibilities that move to the independent `bitty-observability` repository,
the capability and security boundary, the API versioning rule, and the evidence
required before any Core debug or trace code may be retired.

This document does not accept the contract, does not authorize implementation,
and does not describe implemented behavior. It keeps the boundary as an
accepted direction with a focused contract still to be reviewed: nothing here
is authoritative until independent review accepts it. The `bitty-observability`
repository is an independent extension repository that already contains API and
partial implementation crates (`crates/bitty-observability-api` and sibling
crates, per the
[repository map](../project/repository-map.md)); its existence is not evidence
that Core has adopted the observation seam, and no part of it is described here
as integrated or accepted. Frontmatter `status` is `draft` per the repository
metadata schema.

- Owning task: `W-71` (bitty-docs), CarryCtx `CTX-0260`, Issue
  [bitty-docs#400](https://github.com/bitty-terminal/bitty-docs/issues/400).
- Predecessor decision:
  [ADR 0015 - Small-Core Extraction Boundaries](../decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
  (Boundary 1; binding constraints 1 and 2).
- Related:
  [small-core refactor execution handoff](../handoff/2026-10-02-small-core-refactor.md),
  [storage and history boundary](storage-and-history-boundary.md) (the sibling
  `W-131` reconciliation), and the accepted
  [DevTools RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/devtools-rfc.md)
  (OQ-019).
- Downstream owners named but not decided here: `W-100` (bitty, staged Core
  boundary), `W-110` (bitty-observability, alignment to this contract), and the
  `W-71` reviewer roles below.

## Purpose and scope

This specification fixes the observability ownership split before the
extraction direction can be implemented. It names what Core must keep so that
Core remains observable with zero plugins and in `bitty --safe`, and what
optional debug and trace behavior an independent repository may supply without
gaining authority.

In scope:

- the retained Core mechanism: the minimal, read-only observation seam, the
  authorization gate, the redaction rules, and the bounded buffers;
- the default build behavior: what is compiled in, what is on by default, and
  what `bitty --safe` does;
- the external responsibilities that move to `bitty-observability` (optional
  debug and trace implementations and policy) versus what stays in Core;
- the capability and security boundary: opt-in, redaction, bounded buffers, no
  secret capture, no cross-plugin leakage, no hot-path instrumentation, and no
  private first-party bypass;
- the versioning rule for the observation contract;
- the removal gates and the security and negative-path evidence required before
  any Core debug or trace code is retired;
- the downstream owners (`W-100`, `W-110`) without deciding their content.

Out of scope and not decided here:

- exact trait, type, method, and field spellings, and the concrete wire or
  serialization encoding of an observation record;
- exact capability tokens, buffer sizes, sampling ratios, and retention
  defaults, beyond the requirement that each exists and is bounded;
- the exporter, sink, collector, provider-composition, and metrics-pipeline
  choices owned by `bitty-observability`;
- the accepted DevTools protocol (`debug.inspect`, `debug.trace`,
  `debug.control`) and the MCP/Agent surface, which stay authoritative in their
  own documents and are not reopened here;
- repository creation, crate layout, and any implementation or migration.

Nothing here weakens a normative security control. Where a control or threshold
appears to need change, it is recorded under "Open points" instead.

## Normative sources this specification must not weaken

This contract must be read together with, and must not weaken:

- The [security overview](../security/overview.md), the
  [threat model](../security/threat-model.md), the
  [risk register](../security/risk-register.md), and the
  [P0 acceptance criteria](../security/p0-acceptance-criteria.md). The controls
  that bind this boundary include out-of-hot-path execution (`P0-AC-015`),
  safe mode (`P0-AC-019`), per-client elevation and untrusted-data labeling
  (`P0-AC-024`), distinct ungranted DevTools scopes (`P0-AC-025`), trace
  minimization and redaction with user-only files (`P0-AC-026`), and plugin
  resource attribution (`P0-AC-014`). The relevant threats are T-07 (hot-path
  starvation), T-10 (instruction injection through observation data), T-11
  (trace or crash-report credential leak), and T-12 (unexpected privilege).
- The [security overview](../security/overview.md) sensitive-data rule:
  recording input is a separate opt-in; clipboard and raw environment data are
  not recorded by default; trace and crash-report writers support typed
  sensitive fields and redaction, create user-only files, and show exactly what
  will be exported before any upload.
- [ADR 0015](../decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
  Boundary 1 and binding constraint 1: Core retains Terminal Truth, bounded
  protocol intake, PTY ownership, resource and permission enforcement, and
  renderer validation, and a mechanism must work with zero plugins and in
  `bitty --safe`.
- The accepted [DevTools RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/devtools-rfc.md)
  (OQ-019): the inspect, trace, and control scopes remain the DevTools contract
  and keep their minimization and redaction rules.
- The accepted
  [IPC and Agent RFC](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/specifications/ipc-agent-rfc.md):
  agent access is read-only by default, and terminal output is observation
  data, never instruction.
- The accepted
  [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md),
  [Plugin Host Runtime RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/plugin-host-runtime-rfc.md),
  and [Isolation and Resource RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/isolation-resource-rfc.md):
  per-plugin isolation, budgets, attribution, and the public capability-gated
  API as the only plugin path.

## Terminology

- **Core**: the always-available terminal mechanism that works with zero plugins
  and in `bitty --safe`; it owns Terminal Truth, permission and resource
  enforcement, and identity and generation fencing.
- **Observability**: the read-only production of structured records about
  Core-owned mechanisms (events, counters, timing, and state summaries) for
  diagnostics. It is distinct from control, which changes behavior, and from
  DevTools, which is an external debugging client surface.
- **Observation record**: one typed, bounded, structured datum about a
  Core-owned mechanism. A record carries a kind, a bounded attribute set, and
  an optional attribution to a plugin or subsystem; it never carries a raw PTY
  byte stream, a secret, or a capability handle.
- **Observation seam**: the minimal Core-owned interface through which an
  internal or external observer receives observation records. It is read-only:
  it exposes no mutation, control, or handle-passing path.
- **Observer**: any consumer of the seam, whether a Core subsystem, the
  optional `bitty-observability` implementation, or an authorized tooling
  client. An observer is a reader, never an authority.
- **Authorization gate**: the default-deny capability and consent check Core
  runs before it attaches any external observer. Connection, compilation, or
  configuration alone grants nothing.
- **Redaction rule**: the typed transformation Core applies to a record before
  it leaves Core, so a sensitive field never reaches an observer, a buffer, or
  a file in raw form.
- **Default build**: the configuration produced by the repository's normal
  build command, with no optional feature enabled.
- **`bitty --safe`**: the safe-mode startup that succeeds with minimal built-in
  configuration and zero third-party plugins (P0-AC-019).
- **Candidate**: a proposal that has not been decided; candidate status is not
  acceptance and is not implementation.
- **Parked**: explicitly deferred with a named reason and an owning task; a park
  is not acceptance and reserves no interface.

## The retained Core mechanism

Core retains a minimal, read-only observation mechanism plus the authorization
gate and redaction rules that bound it. This is a Core mechanism, not a plugin
surface: it is present with zero plugins and works in `bitty --safe`. Only the
optional debug and trace implementation and the observation policy move out.

### The observation seam

The seam is the minimal interface by which Core emits typed observation records
about its own mechanisms. Candidate names only, because the exact spelling is
parked to the accepted `W-71` contract and its review:

- an observation **record** (candidate name `Observation`) with a bounded kind,
  a bounded attribute set, and optional plugin or subsystem attribution;
- a read-only **sink** (candidate name `ObservationSink`) that an observer
  implements to receive records, with no control or mutation method;
- a bounded, versioned **subscription** handle that can be detached, with no
  ability to alter Core state.

The seam is deliberately narrow. It must not expose a PTY handle, a GPU or
window handle, a raw input callback, a Terminal Truth mutation, or any
capability handle; it exists only to carry bounded, redacted records outward.
It must not be registered on the parser, render, or input hot paths
(P0-AC-015): instrumentation records are emitted at defined boundaries, not on
every hot-path iteration.

### The authorization gate

Core owns a default-deny authorization gate:

- no observer attaches without an explicit capability and, where the observer
  reaches Core from outside the process, explicit consent;
- connecting to Core, enabling a build feature, or writing a configuration key
  grants nothing by itself;
- reading structured state (inspect) and subscribing to the record stream
  (trace) are separately granted, aligning with the accepted DevTools scope
  vocabulary rather than inventing a parallel one; the control scope is not
  part of observability at all, because the seam is read-only;
- capability, quota, attribution, and any tracing of agent or plugin activity
  compose with `P0-AC-014`, `P0-AC-024`, and `P0-AC-025`;
- Core itself may observe its own mechanisms internally without an external
  grant, but that internal observation is in-memory and bounded and is not an
  external authority.

The exact token grammar is owned by the security corpus and confirmed by the
accepted contract; the mechanism Core retains is the check itself, not a
particular spelling.

### The redaction rules

Core redacts before a record becomes observable:

- typed sensitive fields are redacted at emission, not at export
  (`P0-AC-026`); a field that can carry a secret is typed as sensitive, and a
  newly added attribute is sensitive by default until classified;
- input recording is a separate opt-in and is off by default; while a target
  PTY is in no-echo mode, input never enters a record, a buffer, or an
  observer, regardless of grant;
- clipboard content and raw environment data are not captured by default;
- a record never carries raw PTY bytes by default; terminal-derived content
  that must be observed is bounded, attributed, and labeled untrusted
  observation data (`P0-AC-024`);
- any local file a trace or crash writer creates carries user-only
  permissions, and an export preview must show exactly what would leave the
  process before any upload.

### The bounded buffers

Every buffer the mechanism keeps is fixed and attributable:

- a maximum observation record size and a maximum records-in-flight per
  observer, with drop-oldest behavior for non-critical observation and no
  unbounded queue;
- a bounded total in-memory budget for internal instrumentation, so a
  misbehaving or high-frequency producer cannot grow Core memory without
  limit (composing with the budget and attribution rules of `P0-AC-014`);
- no persistence by default: with no observer and no explicit opt-in, the
  buffers are inert and no file is written;
- a drop or a truncation is explicit, not silent, so an observer can
  distinguish "no data" from "data dropped".

## Default build behavior

Observability is not enabled in any externally observable sense by default. The
minimal seam is compiled in because Core must be able to observe Core-owned
mechanisms with zero plugins and in `bitty --safe`, but with no observer it is
inert and writes nothing.

| Observability surface                                         | Default build                                        | Default runtime                                                     | `bitty --safe`                                        |
| ------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------- |
| Core observation seam (bounded record emission)               | Compiled in (a Core mechanism)                       | Enabled for Core-internal, in-memory observation only               | Enabled for Core-internal, in-memory observation only |
| External observer subscription (tooling, DevTools trace path) | Compiled in as a gated seam                          | Disabled; requires an explicit capability and, off-process, consent | Disabled                                              |
| `bitty-observability` debug and trace implementation          | Not a Core dependency; optional feature, default off | Off                                                                 | Off                                                   |
| Trace, log, or crash-report file writing                      | No file writer enabled by default                    | Off; opt-in, user-only files                                        | No trace artifact is read or written                  |
| Input recording                                               | Off                                                  | Off; separate opt-in                                                | Off                                                   |
| Clipboard and raw environment capture                         | Not captured                                         | Not captured                                                        | Not captured                                          |
| Metrics aggregation and export pipeline (for example OTLP)    | Not in Core                                          | Off                                                                 | Off                                                   |

Two statements make the default explicit:

1. **On by default**: only the in-memory, bounded observation seam, and only for
   Core observing its own mechanisms. No record leaves the process, and no file
   is written, without an explicit capability, consent, and opt-in.
2. **Behind an opt-in**: every external observer, the optional
   `bitty-observability` implementation, trace and crash-report file writers,
   input recording, and any export or metrics pipeline. Enabling any of them is
   an explicit, reviewable action.

`bitty --safe` starts successfully with minimal built-in configuration and zero
third-party plugins (`P0-AC-019`). The seam instruments Core in memory only;
every external observer, export, persistence path, and the
`bitty-observability` implementation stay off; no capability is granted
implicitly; and safe mode neither reads nor writes a trace artifact.

## External responsibilities

The split below is the ownership contract this document proposes. Core keeps
the mechanism, the gate, the redaction rules, and the bounds; the optional
implementation and all observation policy move to `bitty-observability`.

| Concern                                                          | Core (retained)                             | `bitty-observability` (moves)                                           |
| ---------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------- |
| Observation record schema (kinds and attributes)                 | Owns the minimal, bounded, versioned schema | Consumes it; may propose additive extensions under the versioning rule  |
| Read-only observation seam (trait or API)                        | Owns the seam                               | Implements the debug and trace side that attaches to the seam           |
| Authorization gate (capability and consent)                      | Owns; default deny                          | Must pass it; may never bypass or widen it                              |
| Redaction rules and sensitive-field typing                       | Owns; redacts at emission                   | Must honor; may not receive unredacted fields                           |
| Bounded buffers, record and queue limits, drop discipline        | Owns the bound                              | Must honor the bound and surface drops explicitly                       |
| Safe-mode behavior                                               | Owns; seam in memory only, nothing external | Not loaded in safe mode                                                 |
| Debug and trace implementation                                   | Not in Core after extraction                | Owns                                                                    |
| Exporters and sinks (file, OTLP, collector)                      | Not in Core                                 | Owns                                                                    |
| Sampling, retention, and provider-composition policy             | Not in Core                                 | Owns                                                                    |
| Metrics aggregation and reporting pipeline                       | Not in Core                                 | Owns                                                                    |
| Contract version advertisement and compatibility check at attach | Owns the accepted range check               | Declares a compatible range; attach fails closed on no intersection     |
| No hot-path instrumentation and no Terminal Truth access         | Owns; permanent invariant                   | Must never introduce a hot-path or Terminal Truth path through the seam |

What does **not** move, under any extraction: the authorization gate, the
redaction rules, the bounds, safe-mode discipline, the event schema version,
Terminal Truth ownership, and the rule that the public capability-gated seam is
the only path. An implementation in `bitty-observability` gains no authority by
moving out of Core; it remains a reader bound by the Core gate.

## Capability and security boundary

- **Opt-in.** Every external observer is off until explicitly enabled. Being
  compiled, connected, or configured is not an enablement.
- **Redaction.** Sensitive fields are typed and redacted at emission, input
  recording is a separate opt-in, and no-echo input never reaches a record
  (`P0-AC-026`).
- **Bounded everywhere.** Record size, queue depth, per-observer in-flight
  count, and total in-memory budget are fixed; drops and truncations are
  explicit; nothing grows without limit.
- **No secret capture.** No observation carries a `secret://` value, a
  credential, a raw environment dump, clipboard content, or raw PTY bytes by
  default.
- **No cross-plugin leakage.** A plugin-attributed observation is scoped to the
  attributed plugin; a plugin cannot subscribe to another plugin's records, to
  Core-privileged records, or to a cross-panel or cross-workspace read it was
  not granted. Exposing one panel's content never becomes a cross-panel read
  path.
- **No hot-path instrumentation.** No observation callback is registered on the
  parser, render, or input hot paths (`P0-AC-015`).
- **No private first-party bypass.** Any official or first-party observer uses
  the same public, capability-gated seam as any other observer.
- **Untrusted labeling.** Terminal-derived observation content is labeled
  untrusted observation data and is never mixed into an instruction channel
  (`P0-AC-024`).

## Versioning

The observation contract is versioned independently of the product:

- Core advertises the contract version range it supports. An observer declares
  the range it implements. Core attaches only on a non-empty intersection and
  fails closed otherwise; an incompatible observer is refused, never attached
  on a best-effort basis.
- Adding an ignorable record kind or attribute advances the contract at a minor
  level and must not break an observer that does not know it. Renaming,
  removing, or changing the meaning of a record or attribute is a breaking
  change and advances the major level.
- The version rule composes with DIR-019: until the `0.1.0` stable release,
  `bitty` workspace crates and first-party components stay `0.0.x` and may
  change without a compatibility promise, so the contract makes no stability
  claim before `0.1.0`.
- The schema version is advertised with the same authority as the seam itself;
  an observer cannot negotiate a schema Core did not offer.

## Removal gates

No Core debug or trace code may be retired until all of the following evidence
exists. Until then, the current behavior stays in Core:

1. This `W-71` contract (or a reviewed successor) is accepted with independent
   security review recorded.
2. `W-110` / `bitty-observability` implements the seam, the gate, and the
   redaction rules for the debug and trace responsibilities, and passes a
   conformance suite against the accepted contract.
3. Default-build and safe-mode parity: the default build still behaves exactly
   as the "Default build behavior" table states, and `bitty --safe` still
   starts with zero third-party plugins and writes no trace artifact.
4. Security and negative-path evidence is present: seeded-secret redaction,
   bounded memory, disabled by default, safe-mode cleanliness, and no leak
   path (see "Verification plan").
5. A caller audit shows no Core or first-party caller depends on the retired
   code path, and the audit result is recorded.
6. Version negotiation is demonstrated fail-closed for an incompatible
   observer.
7. Affected documentation is synchronized and the repository-local `just check`
   passes with zero issues.
8. An independent reviewer different from the implementer approves, and CI is
   green.

A removal that cannot show all eight items is not authorized; the code stays
and the gap is recorded as a tracked task.

## Downstream ownership

This contract fixes who owns the remaining decisions; it does not decide their
content.

- **`W-100` (bitty)** owns the staged establishment of the Core observation
  boundary in the host, adopting this contract without weakening the retained
  mechanisms. The `bitty` owner answers it.
- **`W-110` (bitty-observability, CarryCtx `CTX-0005`)** owns aligning the
  existing observability repository to the accepted contract: the optional
  debug and trace implementation, the exporters, the metrics pipeline, and the
  observation policy. The `bitty-observability` owner answers it. The
  repository already carries API and partial implementation crates, but nothing
  there is consumed by Core yet and this document makes no Core-integration
  claim about it.
- The accepted DevTools protocol, the MCP/Agent surface, and the plugin
  platform RFCs keep their own owners; this contract composes with them and
  does not redefine them.

## Security review

Observability touches the sensitive-data, capability, and recovery trust
boundaries that the [security overview](../security/overview.md) governs.
Independent security review is required before this contract merges. The
reviewers must confirm that the retained mechanism preserves `P0-AC-015`,
`P0-AC-019`, `P0-AC-024`, `P0-AC-025`, and `P0-AC-026`; that redaction happens
at emission and input recording stays a separate opt-in; that the buffers are
bounded and drop explicitly; that the seam grants no control, mutation, or
handle; that no cross-plugin, cross-panel, or first-party bypass exists; that
the version attachment fails closed; and that no later focused contract or
implementation may weaken a P0 control. The `W-100` and `W-110` implementation
tasks each require security review again before their own merge.

## Verification plan

This is a contract specification; it has no executable verification of its own.
Any later implementation of the boundary must prove, at minimum:

1. **Seeded secrets are redacted.** A seeded-secret corpus never appears in a
   default observation record, buffer, trace file, or crash report; a
   sensitive-typed field is redacted at emission (`P0-AC-026`).
2. **Memory is bounded.** A high-frequency producer cannot grow the in-memory
   observation budget without limit; record size, queue depth, and per-observer
   in-flight counts hold, and drops are explicit.
3. **Observability is disabled by default.** The default build enables only the
   inert in-memory seam; no observer, file writer, input recording, or export
   pipeline is active, and a default run writes no trace artifact.
4. **Safe mode is clean.** `bitty --safe` starts with zero third-party plugins,
   loads no `bitty-observability` code, reads and writes no trace artifact, and
   grants no observation capability implicitly (`P0-AC-019`).
5. **There is no leak path.** A plugin cannot observe another plugin's records,
   Core-privileged records, or a cross-panel or cross-workspace read it lacks;
   no first-party observer bypasses the gate.
6. **Authorization is default-deny.** Compilation, connection, or configuration
   alone grants no observation; inspect and trace are separately granted; the
   control scope remains outside observability (`P0-AC-025`).
7. **No hot-path instrumentation.** An audit shows no observation callback on
   the parser, render, or input hot paths, and latency probes show no hot-path
   budget breach (`P0-AC-015`).
8. **Input and secrets stay out.** Recording input requires a separate opt-in;
   no-echo input never enters a record, buffer, or file; clipboard and raw
   environment data are absent by default.
9. **Version attachment fails closed.** An incompatible observer is refused and
   attaches nothing; a compatible observer attaches only within the
   intersection of advertised ranges.
10. **Documentation gates pass.** The repository-local `just check` passes with
    zero issues.

## Alternatives considered

| Alternative                                                            | Disposition                                                                                                                              |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Keep mechanism and policy together in Core                             | Rejected: it contradicts DIR-001 and leaves optional debug and trace policy in the small core, while Core only needs the read-only seam. |
| Move the authorization gate or the redaction rules out with the policy | Rejected: a plugin or extracted component must gain no authority; the gate and redaction are trust controls that stay in Core.           |
| Receive records unredacted and redact only at export                   | Rejected: it exposes raw sensitive data to every observer and buffer, contradicting `P0-AC-026` emission-time minimization.              |
| Enable a trace or metrics implementation by default                    | Rejected: observability must be opt-in; a default writer changes the default build behavior and the safe-mode guarantee.                 |
| Let one plugin subscribe to another plugin's or Core's records         | Rejected: it creates cross-plugin and cross-panel leakage and ambient authority.                                                         |
| Instrument the parser, render, or input hot paths for completeness     | Rejected: it breaks `P0-AC-015` and risks hot-path starvation; records are emitted at defined boundaries.                                |
| Make collection unbounded so no observation is ever dropped            | Rejected: unbounded buffers let a high-frequency producer exhaust memory; bounds with explicit drops are required.                       |
| Attach an observer on a best-effort basis when versions mismatch       | Rejected: negotiation must fail closed, or an observer may misread an incompatible record shape.                                         |
| Give the first-party observer a private fast path                      | Rejected: the public capability-gated seam is the only path; there is no first-party bypass.                                             |

## Affected contracts

- [ADR 0015 - Small-Core Extraction Boundaries](../decisions/adrs/ADR-0015-small-core-extraction-boundaries.md):
  Boundary 1's parked trait surface now has a focused draft contract for
  review; the dependency order (`W-71` then `W-100` and `W-110`) is unchanged.
- [Small-core refactor execution handoff](../handoff/2026-10-02-small-core-refactor.md):
  `W-71` now has its deliverable; `W-100` and `W-110` remain gated on it.
- [Storage and history boundary](storage-and-history-boundary.md): the sibling
  `W-131` reconciliation shares the same default-persistence,
  secret-minimizing posture and the same no-private-bypass rule; the two
  boundaries compose and do not conflict.
- [Execution host and supervisor boundary](execution-host-boundary.md),
  [Native component boundary](native-component-boundary.md), and
  [Plugin contract and manager boundary](plugin-contract-and-manager-boundary.md):
  the observation seam composes with their event, budget, and capability
  surfaces without redefining them.
- Accepted [DevTools RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/devtools-rfc.md)
  (OQ-019): its inspect, trace, and control scopes remain authoritative; this
  contract adds the Core gate and redaction they consume.
- [Development index](README.md): routes to this document.
- [Decision register](../decisions/index.md) and
  [open-question register](../decisions/open-questions.md): no new global open
  question is admitted. The exact trait, token, and default literal points
  remain parked with their downstream owners because none blocks the current
  milestone and no implementation evidence exists to force one; OQ-019 (DevTools
  roadmap) is already accepted and is not reopened.

## Open points

The following details are parked, not decided. Each park names the owning task
and the reason. None is a global open question: none blocks the current
milestone, and no implementation evidence forces one yet.

- **Exact observation schema, trait spelling, and capability tokens** parked to
  `W-100` and `W-110`: the record kinds, attribute typing, sink method shape,
  and the accepted capability token grammar, reconciled with the security
  corpus.
- **Concrete bounds and defaults** parked to `W-100`: record size, queue depth,
  per-observer in-flight count, total in-memory budget, and the default
  enabled-or-disabled posture of each surface beyond the explicit statements in
  this document.
- **Exporter, collector, and pipeline choices** parked to `W-110`: file and
  network exporters, OTLP or other wire choices, provider composition, and
  metrics aggregation, all behind the opt-in gate.
- **Sampling and retention policy** parked to `W-110`: which observation is
  always kept, which is sampled, and how long an opted-in artifact is retained,
  composing with the crash-report and export-preview rules.
- **Interaction with the DevTools trace path** parked to `W-110` and the
  DevTools owner: whether and how the accepted `debug.trace` scope consumes the
  seam, without changing the accepted DevTools contract.
- **Dependency placement** parked to the ADR 0004 owners: whether Core links any
  zero-dependency schema crate from `bitty-observability`, and how the optional
  feature is declared, without adding a Core runtime dependency by default.

## Acceptance criteria

- The retained Core mechanism is named: the read-only observation seam, the
  authorization gate, the redaction rules, and the bounded buffers.
- The default build behavior is explicit: what is on by default, what is behind
  an opt-in or feature, and what `bitty --safe` does.
- The external responsibilities are explicit: what moves to
  `bitty-observability` and what stays in Core.
- The capability and security boundary covers opt-in, redaction, bounded
  buffers, no secret capture, no cross-plugin leakage, no hot-path
  instrumentation, and no private first-party bypass.
- The contract is versioned, and the removal gates state the evidence required
  before any Core debug or trace code is retired.
- The verification plan requires seeded-secret redaction, bounded memory,
  disabled-by-default behavior, safe-mode cleanliness, and no leak path.
- `W-100` and `W-110` are named as downstream owners without deciding their
  content.
- The document is self-contained: it cites no research archive, no record
  number, and no coverage ledger.
- Candidate status remains candidate and no boundary, repository, or code path
  is described as accepted or implemented.
- Independent security review is required before merge, and the reviewer roles
  are named.
- The development index routes to this document, and no open question is
  fabricated.
- `just check` passes with zero issues.

## P0 Review Sign-off

| Role                 | Scope                                                                | Requirement                                             |
| -------------------- | -------------------------------------------------------------------- | ------------------------------------------------------- |
| `architecture-owner` | Ownership, retained mechanism, and extraction-gate correctness       | Approve; confirms the Core/`bitty-observability` split. |
| `security-reviewer`  | Capability gate, redaction, bounds, safe mode, and leak paths        | Independent security review required before merge.      |
| `docs-curator`       | Taxonomy, metadata, links, terminology, and register synchronization | Approve; confirms discoverability and schema.           |

## References

- [bitty-docs#400](https://github.com/bitty-terminal/bitty-docs/issues/400)
  (CarryCtx `CTX-0260`, plan key `W-71`).
- [ADR 0015 - Small-Core Extraction Boundaries](../decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
  (Boundary 1; binding constraints 1 and 2).
- [Small-core refactor execution handoff](../handoff/2026-10-02-small-core-refactor.md),
  plan keys `W-71`, `W-100`, `W-110`, and the staged observability dependency
  order.
- [Security overview](../security/overview.md),
  [threat model](../security/threat-model.md),
  [risk register](../security/risk-register.md), and
  [P0 acceptance criteria](../security/p0-acceptance-criteria.md).
- [Repository map](../project/repository-map.md): the `bitty-observability`
  repository facts (independent extension repository, not yet consumed by Core).
- [Storage and history boundary](storage-and-history-boundary.md),
  [execution host and supervisor boundary](execution-host-boundary.md),
  [native component boundary](native-component-boundary.md),
  [plugin contract and manager boundary](plugin-contract-and-manager-boundary.md),
  [documentation workflow](documentation-workflow.md), and
  [development index](README.md).
- Cross-repository sources:
  [DevTools RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/devtools-rfc.md),
  [Risk Evidence RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/risk-evidence-rfc.md),
  [IPC and Agent RFC](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/specifications/ipc-agent-rfc.md),
  [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md),
  [Plugin Host Runtime RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/plugin-host-runtime-rfc.md),
  and [Isolation and Resource RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/isolation-resource-rfc.md).
