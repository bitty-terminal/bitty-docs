---
title: ADR 0018 - Beacon Mechanism/Policy Split and Core Targeting-Mechanism Naming
description: Owner decision accepting the B-8 Beacon mechanism/policy split, naming the Core targeting mechanism TargetEngine and AnnotationEngine, and resolving the OQ-089 extraction scope
category: decisions
audience: maintainer
document_type: specification
status: accepted
website_publish: true
sidebar_order: 48
---

# ADR 0018 - Beacon Mechanism/Policy Split and Core Targeting-Mechanism Naming

## Document status

Accepted on 2026-10-03 by the project initiator as an owner decision on
[bitty-docs#398](https://github.com/bitty-terminal/bitty-docs/issues/398),
CarryCtx `CTX-0258`, plan key `W-03`. This ADR accepts and formalizes the
candidate `B-8` Beacon mechanism/policy split, names the Core targeting and
annotation mechanism, and resolves the terminal-side extraction scope recorded
as `OQ-089`. It authorizes no implementation, describes no implemented behavior,
and weakens no normative security control. Lifecycle is `Draft -> owner review
-> Accepted (2026-10-03) -> normative`.

- Deciders: project initiator (owner decision, 2026-10-03).
- Vehicle: this is a new ADR rather than a dated amendment to
  [ADR 0015](ADR-0015-small-core-extraction-boundaries.md). ADR 0015
  Boundary 3 accepted the split direction but deliberately did not name the Core
  mechanism and parked the naming and remaining Beacon open points to `W-03`
  and the host/SDK APIs to `W-29`/`W-120`. This ADR performs that parked
  `W-03` decision. Accepted records are extended by dated or superseding records,
  not silently rewritten, so ADR 0015 and ADR 0014 stand as accepted history.
- Related: [ADR 0014 - Workspace as Core Mechanism with Plugin-Only
  Presentation](ADR-0014-workspace-core-presentation-plugins.md),
  [ADR 0015 - Small-Core Extraction Boundaries](ADR-0015-small-core-extraction-boundaries.md)
  (Boundary 3), the
  [Beacon Targeting Framework (Candidate)](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/beacon-targeting-framework-candidate.md),
  the
  [small-core refactor execution handoff](../../handoff/2026-10-02-small-core-refactor.md),
  and the cross-repository paired task bitty-plugins-docs `CTX-0074` (plan
  `W-12`), which synchronizes the candidate page.

## Purpose and scope

The candidate `B-8` split proposes that Core retain the target and annotation
_mechanism_ while the `beacon` plugin carries _policy_. ADR 0015 Boundary 3
accepted the direction but left three questions to `W-03`: the Core mechanism
name, the meaning of "extraction" for Beacon, and several Beacon open points.
The candidate page marks the mechanism names "explicitly open" and `OQ-089`
still describes the extraction as owner-pending. This ADR closes the naming and
extraction-scope questions and leaves the remaining Beacon open points with
their recorded owners.

In scope:

- whether the `B-8` mechanism/policy split is accepted and formalized;
- the accepted names of the Core targeting and annotation mechanism;
- the resolution of the `OQ-089` terminal-side extraction scope: what is
  extracted, what stays in Core, and what is deferred;
- the security fences retained with the Core mechanism (target safety,
  stale-handle and generation fail-closed behavior, no Event-Bus exposure, and
  no private first-party bypass);
- the downstream work this decision unblocks, named but not decided.

Out of scope and not decided here:

- any implementation, code move, policy extraction, or API: those are bitty
  `W-29` and `W-30`, bitty-plugins-docs `W-12`, and `bar` `W-53`;
- the content, spelling, wire shape, and version of the Beacon host API
  (`W-29`) and of the plugin policy extraction (`W-30`);
- the plugin-side page set and package onboarding owned by the plugin
  ecosystem;
- the still-open candidate `B-8` points 2 and 4 through 8: the six primitives
  and `Action × Target` model, the `TargetRef` wire shape, the provider
  registration surface and its API version (`OQ-056`), the semantic UI property
  contract, scope defaults, label overflow and handedness, and session
  invalidation behavior (`OQ-088`);
- the `bar` migration and onboarding (`W-53`).

Nothing here weakens a normative security control. Where a control appears to
need change, it is recorded under "Open points" instead.

## Normative sources this specification must not weaken

This decision must be read together with, and must not weaken:

- The [security overview](../../security/overview.md), the
  [threat model](../../security/threat-model.md), the
  [risk register](../../security/risk-register.md), and the
  [P0 security acceptance criteria](../../security/p0-acceptance-criteria.md),
  which stay authoritative for Terminal Truth (`P0-AC-016`), plugin capability
  checking and hot-path exclusion (`P0-AC-012`, `P0-AC-015`), and safe mode
  (`P0-AC-019`).
- [ADR 0015 - Small-Core Extraction Boundaries](ADR-0015-small-core-extraction-boundaries.md):
  Boundary 3 and the bootstrap-fence binding constraints, including the
  prohibition on a private first-party bypass, no raw PTY, GPU, or window
  handle, and no input hot-path callback.
- [ADR 0014 - Workspace as Core Mechanism with Plugin-Only Presentation](ADR-0014-workspace-core-presentation-plugins.md):
  the mechanism-versus-policy separation this decision applies to Beacon.
- [ADR 0013 - Core Ontology and Identity Model](ADR-0013-core-ontology-identity.md):
  the identity and `GenerationId` relations the stale-handle fence relies on.
- The accepted
  [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md),
  which fixes the manifest, capability, grant, command-registry, and event
  model the `beacon` plugin must obey as an ordinary package; the
  [Plugin Host Runtime RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/plugin-host-runtime-rfc.md),
  which fixes VM lifecycle and hash-bound grants; and the
  [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md),
  which fixes the public host surfaces.
- The accepted
  [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md)
  and
  [Workspace Compositor Specification](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/workspace-compositor.md),
  which fix panel identity, focus routing, overlay bounds, and the identity
  hierarchy.
- The candidate
  [Beacon Targeting Framework](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/beacon-targeting-framework-candidate.md),
  which records the plugin-side direction and the `B-8` open points this ADR
  resolves for naming and extraction scope without promoting the page.

## Terminology

- **Mechanism**: a Core-owned, always-available primitive that works with zero
  plugins and in `bitty --safe`.
- **Policy**: optional behavior or presentation that a plugin supplies using
  only the public, capability-gated API.
- **`TargetEngine`**: the accepted Core mechanism that owns the target registry,
  semantic target snapshots, provider registration and composition, and the
  command-dispatch bridge.
- **`AnnotationEngine`**: the accepted Core mechanism that owns the annotation
  layer and the `LabelAllocator`.
- **`LabelAllocator`**: the deterministic mapping from a scoped target set to
  labels under the active strategy; owned by `AnnotationEngine`.
- **Target safety**: the Core rules that keep a registered target from becoming
  an unmediated action, including `StaleTarget` validation and generation
  fencing.
- **Transient input capture**: the capability-gated Core host mechanism that
  temporarily takes exclusive keyboard and overlay focus for a UI interaction;
  it is Core-owned and not Beacon-named.
- **Command-dispatch bridge**: the Core path that routes a dispatched target
  action into the accepted command registry; it is Core-owned and reached
  through the public host API, not a private plugin channel.
- **Private first-party bypass**: any non-public path, raw handle, or hot-path
  callback that a first-party plugin could use but a third-party plugin could
  not; forbidden.
- **Safe mode**: `bitty --safe`, which starts with zero third-party plugins and
  no optional policy; the Core mechanism is unaffected by the absence of the
  `beacon` plugin.

## Context

Core still contains candidate Beacon sources (for example
`bitty-ui/src/beacon_*.rs`), and the
[small-core refactor handoff](../../handoff/2026-10-02-small-core-refactor.md)
records that their callers and CI use must be audited before removal. ADR 0015
Boundary 3 accepted the direction that Core retains the target and annotation
mechanism and target safety while policy moves to the `beacon` plugin, but it
deliberately did not name the Core mechanism and parked the naming and the
remaining Beacon open points to `W-03`, with the host API at `W-29` and the SDK
surface at `W-120`.

Two questions were therefore unresolvable from the canonical corpus. First, the
Core mechanism had no accepted name: the candidate page records
`TargetEngine`/`AnnotationEngine` as "candidate spellings", and the open point
was "explicitly open". Second, "extraction" was ambiguous: it could mean moving
a Rust component into a separate repository, or moving only policy into the
plugin while the mechanism stays in Core. `OQ-089` describes the terminal-side
extraction as owner-pending and couples it to the elevation of Beacon from a
terminal-scope sub-feature to a workspace-wide targeting framework.

The owner decision recorded here resolves both: the split is accepted, the Core
mechanism names are accepted, and the "extraction" is the extraction of policy
to the plugin while the Core mechanism stays in Core for the 0.1.0 scope.

## Decision

### Accept and formalize the B-8 mechanism/policy split

The `B-8` mechanism/policy split is accepted and formalized. Core owns the
targeting and annotation _mechanism_: the `TargetEngine` and `AnnotationEngine`
described below, together with target safety. The official `beacon` Lua plugin
owns _policy_: key-language bindings, which-key integration, scopes and filters,
theme badges, provider composition, and target-first menus.

The `beacon` plugin is an ordinary capability-gated package. It has no private
privilege, no raw PTY, GPU, or window handle, and no input hot-path callback; it
uses only the public capability-gated API and the accepted manifest, grant, and
lifecycle rules. It is optional. The Core mechanism works with zero plugins, and
`bitty --safe` is unaffected without the plugin. No private first-party bypass
is introduced or permitted.

### Name the Core mechanism: TargetEngine and AnnotationEngine

The accepted Core mechanism names are:

- **`TargetEngine`**: the target registry, semantic target snapshots, provider
  registration and composition, and the command-dispatch bridge.
- **`AnnotationEngine`**: the annotation layer plus the `LabelAllocator`.

Transient input capture and the command-dispatch bridge are existing Core host
mechanisms, not Beacon-named components; the plugin reaches them through the
`W-01` focusable-overlay and transient-input-capture host API and the `W-29`
Beacon host API. These names are accepted as the Core mechanism names and
resolve the `W-03` naming point and `B-8` open point 3. This ADR names the
mechanism and its ownership; it fixes no Rust type, module path, trait, or wire
shape, and claims no Rust type exists.

### Resolve the OQ-089 extraction scope

`OQ-089` records that Beacon is elevated from a terminal-scope sub-feature to a
workspace-wide targeting framework. The terminal-side extraction scope is
resolved as follows:

- The "extraction" is the extraction of **policy to the plugin**, not the
  creation of a separate Rust Core repository. The Core mechanism stays in Core
  (`bitty`) for the 0.1.0 scope.
- Any future extraction of a separate Rust Core component is explicitly gated
  on `W-29` and `W-30` and is not decided here. No repository is created and no
  crate boundary is fixed by this ADR.
- The Core mechanism is usable without the plugin; there is no private
  first-party bypass, and the plugin is not required for targeting to function
  or for `bitty --safe` to run.
- The retained Core mechanism preserves the security fences: target safety;
  stale-handle and generation fail-closed behavior; no Event-Bus exposure of
  target or annotation internals; and no private bypass path.

### Downstream unblocked work

This decision unblocks, and names without deciding the content of:

- bitty `W-29` (Beacon host API): the public, capability-gated API through which
  the plugin reaches `TargetEngine`, `AnnotationEngine`, transient input
  capture, and the command-dispatch bridge.
- bitty `W-30` (Beacon policy retirement): the removal of candidate Beacon
  policy from Core while retaining the accepted mechanism.
- bitty-plugins-docs `W-12`: synchronization of the plugin-side candidate page
  with this decision.
- `bar` `W-53`: the downstream consumer that participates in the same
  workspace-wide targeting framework.

Their dependencies, ordering, spellings, and deliverables remain their own;
this ADR neither schedules nor specifies them.

### What is not decided here

This ADR does not start, schedule, or authorize implementation. It does not
create, extract, or move any repository or crate. It does not decide the host
API, the SDK surface, the plugin's page set or package, the plugin's content, or
the content of `W-29`, `W-30`, `W-12`, or `W-53`. It does not answer `OQ-056`
or `OQ-088` or the remaining candidate `B-8` open points.

## Consequences

- The `B-8` split, the Core mechanism names, and the `OQ-089` extraction scope
  are decided, closing the `W-03` park that ADR 0015 left open.
- The `beacon` plugin is an ordinary optional capability-gated package; Core
  targeting and annotation remain usable with zero plugins and in
  `bitty --safe`.
- The Core mechanism is explicitly retained in Core for 0.1.0; any separate
  Rust-component extraction is deferred behind `W-29`/`W-30` and requires a
  future decision.
- The retained security fences (target safety, generation fail-closed, no
  Event-Bus exposure, no private bypass) stay binding on every downstream
  implementation task.
- This ADR authorizes no code by itself and changes no accepted pin or ceiling.

## Alternatives considered

| Alternative                                                                          | Disposition                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Leave the Core mechanism unnamed and keep `B-8` open                                 | Rejected: ADR 0015 parked the naming to `W-03` precisely so it would be decided; leaving it open blocks the `W-29` host API and keeps the candidate page's names advisory.                                                      |
| Adopt a single Beacon-branded Core name instead of `TargetEngine`/`AnnotationEngine` | Rejected: the two mechanisms have distinct responsibilities (targeting and dispatch versus annotation and label allocation); the accepted split keeps each name tied to its mechanism and avoids implying the plugin owns Core. |
| Extract the Core mechanism into a separate Rust repository now                       | Rejected: a separate repository is not a separate process and does not itself satisfy a trust boundary; the owner scopes the Core mechanism to Core for 0.1.0 and gates any future Rust-component extraction on `W-29`/`W-30`.  |
| Move mechanism and policy together into the optional plugin                          | Rejected: it would make a fundamental capability depend on plugin availability and remove it from `bitty --safe`, contradicting ADR 0015 Boundary 3 and the small-core direction.                                               |
| Give the first-party `beacon` plugin a private or privileged path                    | Rejected: a private first-party bypass is forbidden by the bootstrap fence; the plugin uses only the public capability-gated API.                                                                                               |
| Treat the plugin as required and load it by default in safe mode                     | Rejected: the mechanism must work with zero plugins and `bitty --safe` starts with no third-party plugins; the plugin stays optional.                                                                                           |
| Decide the host API, SDK surface, or the W-29/W-30/W-12/W-53 content in this ADR     | Rejected: those are downstream tasks; this ADR decides only the split, the names, and the extraction scope.                                                                                                                     |

## Affected contracts

- [ADR 0015 - Small-Core Extraction Boundaries](ADR-0015-small-core-extraction-boundaries.md):
  Boundary 3's accepted direction is unchanged; its `W-03` naming park is now
  fulfilled by this record, and the host/SDK APIs remain `W-29`/`W-120`.
- [ADR 0014 - Workspace as Core Mechanism with Plugin-Only Presentation](ADR-0014-workspace-core-presentation-plugins.md):
  the mechanism-versus-policy separation is unchanged and is applied to Beacon.
- The
  [Beacon Targeting Framework (Candidate)](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/beacon-targeting-framework-candidate.md):
  `B-8` open points 1 and 3 are decided by this ADR and the page is updated by
  bitty-plugins-docs `W-12`; the page keeps its candidate status for the
  remaining open points and is not promoted.
- The accepted
  [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md),
  [Plugin Host Runtime RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/plugin-host-runtime-rfc.md),
  and
  [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md):
  the `beacon` plugin is bound by them with no special privilege, and they are
  not changed.
- [Open-question register](../open-questions.md): `OQ-089` records the resolved
  naming and extraction scope; `OQ-056` (capability dimensions and API version)
  and `OQ-088` (modal timeout and session behavior) remain open.
- [Decision register](../index.md) and [ADR index](README.md): route to this
  ADR.
- [Small-core refactor execution handoff](../../handoff/2026-10-02-small-core-refactor.md):
  `W-29`, `W-30`, `W-12`, and `W-53` keep their recorded dependencies; the
  handoff's note that the Core mechanism name is open is superseded by this ADR.

## Open points

The following remain open and are parked to their named owners. None is a new
global open question.

- **Beacon host API** parked to bitty `W-29`: the exact public host names,
  capability dimensions, and version that expose `TargetEngine`,
  `AnnotationEngine`, transient input capture, and the command-dispatch bridge.
  Related to `OQ-056`.
- **Beacon policy retirement** parked to bitty `W-30`: the concrete removal of
  candidate policy from Core while retaining the accepted mechanism, with the
  audit of current callers and CI use.
- **Plugin-side synchronization and page set** parked to bitty-plugins-docs
  `W-12` and the plugin ecosystem: the candidate page update, the plugin's page
  set, and package onboarding.
- **Alternative targeting consumer** parked to `bar` `W-53`: its participation
  in the workspace-wide framework. Its content is not decided here.
- **Remaining `B-8` and framework points** stay open with their recorded
  owners: primitives and `Action × Target` model, `TargetRef` wire shape,
  provider registration and API version (`OQ-056`), semantic UI property
  contract, scope defaults, label overflow and handedness, and session
  invalidation behavior (`OQ-088`).

## Security review

The decision touches the plugin trust boundary, the capability model, safe
mode, and the input path. Independent security review is required before this
ADR merges. The security reviewer confirms that:

- the Core targeting and annotation mechanism stays capability-independent and
  always available, so no security enforcement point is moved into the optional
  plugin;
- transient input capture stays capability-gated, transient, bounded,
  revocable, and Core-owned, and never places a plugin callback on the input hot
  path;
- the command-dispatch bridge routes through the accepted command registry and
  the public host API, with no private first-party bypass and no raw PTY, GPU,
  or window handle;
- stale-handle and generation checks fail closed, so a target invalidated
  between labeling and dispatch cannot become an action;
- target and annotation internals are not exposed through the Event Bus, and no
  plugin receives another's target metadata beyond the accepted scope;
- no P0 control is weakened, and the safe-mode startup path
  (`P0-AC-019`) keeps zero third-party plugins with the mechanism still
  functional.

The downstream implementation tasks (`W-29`, `W-30`) each require security
review again before their own merge where they touch the input or dispatch
boundary.

## Verification plan

This is a decision record; it has no executable verification of its own. Any
later implementation must prove, at minimum:

1. **Mechanism without the plugin.** Target discovery, labeling, and dispatch
   work with zero plugins enabled and in `bitty --safe`.
2. **No private bypass.** The `beacon` plugin uses only the public
   capability-gated API; a third-party plugin can reach the same surfaces.
3. **No input hot path.** Transient input capture is bounded, revocable, and
   never runs a plugin callback on the input hot path.
4. **Fail-closed handles.** A target invalidated after labeling fails closed
   and cannot dispatch; generation checks reject stale handles.
5. **No Event-Bus exposure.** Target and annotation internals are not published
   through the Event Bus.
6. **Policy optionality.** Removing or disabling the plugin removes policy only
   and leaves the Core mechanism intact.
7. **Documentation gates.** The repository-local `just check` passes with zero
   issues, and the affected candidate page is synchronized by `W-12`.

## Acceptance criteria

- The `B-8` mechanism/policy split is accepted and formalized, with Core owning
  the mechanism and the optional `beacon` plugin owning policy.
- The Core mechanism is named `TargetEngine` (target registry, semantic target
  snapshots, provider registration and composition, and the command-dispatch
  bridge) and `AnnotationEngine` (annotation layer plus `LabelAllocator`),
  resolving `B-8` open point 3.
- The `OQ-089` terminal-side extraction scope is resolved: policy moves to the
  plugin, the Core mechanism stays in Core for 0.1.0, and a separate Rust
  component is deferred to `W-29`/`W-30`, resolving `B-8` open point 1.
- The retained security fences are stated: target safety, stale-handle and
  generation fail-closed behavior, no Event-Bus exposure, and no private
  first-party bypass.
- Downstream work is named as unblocked: bitty `W-29` and `W-30`,
  bitty-plugins-docs `W-12`, and `bar` `W-53`; their content is not decided.
- The document is a standalone ADR with a stated vehicle rationale, valid
  numbering, and register rows, and the decision register and `OQ-089` row are
  synchronized.
- No implementation is described as done, no P0 control is weakened, and the
  document is self-contained with no research-archive reference.
- `just check` passes with zero issues.

## P0 Review Sign-off

| Role                 | Scope                                                                       | Requirement                                                                  |
| -------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `architecture-owner` | Split, Core mechanism names, extraction scope, and boundary correctness     | Approve; confirms the split, both names, and the Core-retained scope.        |
| `security-architect` | Capability boundary, input capture, dispatch, safe mode, and target safety  | Independent security sign-off is required before merge.                      |
| `docs-curator`       | Vehicle rationale, numbering, metadata, links, and register synchronization | Approve; confirms schema, discoverability, and untouched P0 control wording. |

## References

- [bitty-docs#398](https://github.com/bitty-terminal/bitty-docs/issues/398)
  (CarryCtx `CTX-0258`, plan key `W-03`).
- bitty-plugins-docs `CTX-0074` (plan `W-12`): the paired task that
  synchronizes the candidate page.
- [ADR 0015 - Small-Core Extraction Boundaries](ADR-0015-small-core-extraction-boundaries.md)
  (Boundary 3) and
  [ADR 0014 - Workspace as Core Mechanism with Plugin-Only Presentation](ADR-0014-workspace-core-presentation-plugins.md).
- [Beacon Targeting Framework (Candidate)](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/beacon-targeting-framework-candidate.md),
  `B-8` and its open points.
- [Small-core refactor execution handoff](../../handoff/2026-10-02-small-core-refactor.md).
- [Security overview](../../security/overview.md),
  [threat model](../../security/threat-model.md),
  [risk register](../../security/risk-register.md), and
  [P0 security acceptance criteria](../../security/p0-acceptance-criteria.md).
- [Decision register](../index.md), [ADR index](README.md), and
  [open-question register](../open-questions.md).
