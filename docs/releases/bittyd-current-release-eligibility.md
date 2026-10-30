---
title: bittyd Current-Release Eligibility Gate
description: Conditional readiness gate for the terminal-only bittyd slice in the current release train, separating implementation evidence from owner-authorized publication
category: releases
audience: maintainer
document_type: policy
status: draft
website_publish: false
sidebar_order: 20
---

# bittyd Current-Release Eligibility Gate

> Status: **draft conditional gate; not release authorization.** This document
> defines when the terminal-only `bittyd` slice may be called eligible for the
> current release train. Eligibility requires every row to be satisfied; it is
> not a tag, a publication, a channel update, a catalog entry, or an owner
> approval. No row here authorizes a tag, an artifact
> upload, a CDN or R2 write, a package-index update, or a stable-pointer move,
> and nothing here claims that `bittyd` is implemented, verified, or shipped.
>
> At the 2026-10-29 snapshot no implementation-dependent row is `met`: the
> evidence matrix records no `Verified` risk, the IPC freeze is still a
> `draft` candidate with four unchecked sign-offs, and the worker-spawn,
> containment, and event slices remain open. The gate stays `draft` until the
> owner records a dated eligibility decision, and that decision records which
> rows are met rather than a blanket "eligible".
>
> 2026-10-30 revision: the bitty#2608 reverification campaign at `bitty`
> `6c229e9c` observed the containment (bitty#2791), worker-spawn (PR #2808),
> event (PR #2811), request-deadline (PR #2815), and 1.2 metadata (PR #2816)
> slices on Linux x86_64. `G-17` moves `blocked` → `open`; no other row is
> `met`, no row is `Verified`, and no publication is authorized. The merged
> Linux build advertises `worker_sessions=true` while accepted `D-01` still
> describes the slice as terminal-only, so `G-06` is contradicted rather than
> merely unproven.
>
> 2026-10-30 correction (bitty#2822): the register `G-20` names is the
> daemon-intake table `DR-01` through `DR-08` in the [risk
> register](../security/risk-register.md#bittyd-local-daemon-risk-intake-ctx-1629),
> which maps those rows to `R-009`, `R-011`, `R-012`, `R-013`, and `R-014`. All
> eight rows are `Open`, so `G-20` stays `blocked` on missing reviewed artifacts
> and on bitty#2823/bitty#2824, not on a missing reference. No state moves.

| Control               | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status                | Draft conditional gate; no implementation-dependent row met; no publication authorized                                                                                                                                                                                                                                                                                                                                                                                                                |
| Issue                 | [bitty#2666](https://github.com/bitty-terminal/bitty/issues/2666) - define the bittyd current-release eligibility gate                                                                                                                                                                                                                                                                                                                                                                                |
| Parent                | [bitty#2546](https://github.com/bitty-terminal/bitty/issues/2546) - define the bittyd session-host contract                                                                                                                                                                                                                                                                                                                                                                                           |
| Release train         | The stable train tracked by milestone `v0.2.0`; the tag and version are assigned by the release owner at tag time, not fixed here                                                                                                                                                                                                                                                                                                                                                                     |
| Upstream records      | Accepted [session-host contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-session-host-contract.md), [promotion record](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-session-host-promotion-record.md), draft [IPC freeze](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-ipc-contract.md) (1.2 revision at `edc65ae1`/`2c8f419b`), ADRs 0002/0008/0019, security corpus |
| Evidence revisions    | `bitty` `d360b442` campaign, the `adb15d15` refresh, and the `6c229e9c` reverification recorded in the [P0 evidence plan](../security/bittyd-p0-evidence-plan.md); later `main` commits are outside every row                                                                                                                                                                                                                                                                                         |
| Change authority      | Release owner owns this gate; the security corpus co-owns the P0 rows; the Core terminal platform owns the implementation rows                                                                                                                                                                                                                                                                                                                                                                        |
| Publication authority | The project initiator (owner) alone, in a separate dated record; this document never performs it                                                                                                                                                                                                                                                                                                                                                                                                      |

## Purpose and scope

Record one conditional readiness gate for admitting the terminal-only `bittyd`
slice to the current release train, so that implementation evidence, security
evidence, and the later publication decision are not confused with each other.
The gate is written for the release owner, the Core terminal platform, the
independent security reviewer, and the Wheel and `bitty-ai` consumers.

In scope:

- the row set a release decision must satisfy, and who signs each row;
- the distinction between "implementation evidence complete" and "the owner
  authorized publication";
- an honest snapshot of the rows at 2026-10-29.

Out of scope and owned elsewhere:

- the service semantics, lifecycle, bounds, and platform tiers (accepted
  session-host contract);
- the frozen method, scope, handshake, refusal, and compatibility surface (IPC
  freeze, bitty#2664);
- the per-criterion proofs, producers, and residual gaps (P0 evidence plan,
  bitty#2608);
- package contents, signing, and distribution mechanics (release distribution
  docs and the release-train tasks);
- any tag, publication, channel, catalog, or stable-pointer action.

## Normative sources this policy must not weaken

Read this page together with, and subordinate to:

- the [security overview](../security/overview.md), especially the local-only
  IPC, read-only Agent default, untrusted-observation, bounded-input,
  secret-minimizing diagnostics, and `bitty --safe` invariants;
- the [threat model](../security/threat-model.md), including the local-daemon
  trust boundary, the same-uid residuals, and the operator-capability
  intent-gate wording;
- the [risk register](../security/risk-register.md), the
  [evidence matrix](../security/evidence-matrix.md), the
  [P0 acceptance criteria](../security/p0-acceptance-criteria.md), and the
  [bittyd P0 evidence plan](../security/bittyd-p0-evidence-plan.md);
- [ADR 0019](../decisions/adrs/ADR-0019-bittyd-staging-advance.md) for the
  v0.2.0 slice and its exclusions, [ADR 0008](../decisions/adrs/ADR-0008-headless.md)
  for the daemon definitions and trust gates, and
  [ADR 0002](../decisions/adrs/ADR-0002-platform-support-tiers.md) for platform
  tiers and native-runner evidence;
- the [bittyd Session-Host Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-session-host-contract.md)
  and its [promotion record](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-session-host-promotion-record.md);
- the [bittyd IPC Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-ipc-contract.md)
  once accepted, and the [preview release contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/preview-release-contract.md)
  for the required-gates pattern this page follows;
- the [documentation workflow](../development/documentation-workflow.md), the
  [releases index](README.md), and the repository metadata and language gates.

Where this page and a normative source disagree, the source wins and this page
is defective. This page may narrow a release decision; it may never lower a
security, acceptance, or evidence threshold.

## Terminology

- **Gate row**: one release-eligibility condition with a required artifact, a
  producer, a signing authority, and a state. A row is not a task and not a
  control; it is a condition on the release decision.
- **State `met`**: the named artifact exists at a named revision or date and
  the named signing authority recorded the sign-off. The release owner confirms
  the row in the dated eligibility decision. A merged pull request, a green CI
  run, a `supported` campaign row, or a fake-server pass is not `met` by
  itself.
- **State `open`**: the artifact or the sign-off is missing, incomplete, or
  outdated. `open` includes "observed but not recorded"; an observation is not
  evidence until it is an artifact.
- **State `blocked`**: a merged dependency cannot exercise the row at all, or a
  tracked defect stops it. `blocked` is not "waived"; it blocks the release
  decision.
- **Implementation evidence complete**: every implementation, parity, cell,
  package, startup, documentation, and security row is `met` with a recorded
  artifact. It says nothing about publication.
- **Owner-authorized publication**: a separate, dated owner record naming the
  version, tag, artifact set, and target channels. It is never implied by
  evidence and never recorded by this document.
- **Advertised cell**: a platform cell whose daemon behavior is native-run and
  named in release material. A compile-only target is not an advertised cell.
- **Campaign status**: the `supported`/`partial`/`blocked` vocabulary of the
  P0 evidence plan. None of those tokens is `Verified`, and none satisfies a
  gate row by itself.

## Evidence is not publication authorization

Two states must stay separate in every record:

| State                            | What it means                                                                                                                          | Who records it                          |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Implementation evidence complete | Every gate row is `met` with an artifact, and the named reviewers signed. The slice is eligible for a release decision, nothing more.  | Release owner, after the reviewers sign |
| Owner authorized publication     | A dated owner decision names the version, tag, artifact set, checksum/provenance source, channels, and rollback point for this action. | Project initiator (owner) alone         |

Rules:

1. The eligibility decision and the publication authorization are separate
   records. Neither may cite the other as evidence, and a publication
   authorization that predates a `met` row is stale.
2. This document never creates a tag, publishes an artifact, writes to the CDN
   or R2, updates a package catalog or registry, or moves a stable pointer. It
   only states the conditions for someone who may.
3. A green CI run, a `supported` campaign row, or a merged implementation PR
   authorizes nothing. The P0 evidence plan states the same rule for controls.
4. The security reviewer's sign-off records evidence sufficiency; it does not
   authorize publication. The owner's publication record does not upgrade a
   control to `Verified`.
5. If the owner declines publication after the rows are met, the gate records
   "eligibility complete, publication not authorized" and stays `draft` until
   the owner decides otherwise.

## Gate rows

The state column is the 2026-10-30 audit. A row becomes `met` only with the
artifact and sign-off it names, and the release owner confirms the row set in
the dated eligibility decision.

| Row  | Gate                                            | Required evidence and signing authority                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | State   |
| ---- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| G-00 | Accepted upstream contract and staging decision | Session-host contract accepted with `D-01` terminal-only and `worker_sessions=false`; ADR 0019 accepted and unamended for this slice. Core platform.                                                                                                                                                                                                                                                                                                                                                                     | met     |
| G-01 | IPC contract accepted                           | The IPC freeze is `accepted`, not `draft`, with every open point closed or assigned. Owner acceptance record.                                                                                                                                                                                                                                                                                                                                                                                                            | open    |
| G-02 | Owner sign-off on the IPC contract              | Owner reviews the frozen names and ordering against the merged service. Owner.                                                                                                                                                                                                                                                                                                                                                                                                                                           | open    |
| G-03 | Security sign-off on the IPC contract           | Security review of the refusal set, no-oracle rules, control relation, token and bearer handling, deferrals, and the bitty#2608 evidence set.                                                                                                                                                                                                                                                                                                                                                                            | open    |
| G-04 | Architecture sign-off on the IPC contract       | Registry home, revision rule, version axes, method catalog, grant revision rules, deferrals. Architecture reviewer.                                                                                                                                                                                                                                                                                                                                                                                                      | open    |
| G-05 | Consumer sign-off on the IPC contract           | Wheel adapter and fake server plus `bitty-ai` confirm the frozen surface with no local alias and no reliance on `events`. Consumer reviewer.                                                                                                                                                                                                                                                                                                                                                                             | open    |
| G-06 | `worker_sessions=false` with a typed refusal    | Every advertised build reports `worker_sessions=false`; `kind: worker` is refused `UnsupportedCapability` before any process exists; worker hosting needs an ADR 0019 amendment and a security review. Core platform. **Not met at `6c229e9c`:** the Linux cell advertises `worker_sessions=true` and spawns a contained worker after consent, so the required `false` state does not hold and the `D-01` amendment is still unrecorded.                                                                                 | open    |
| G-07 | Daemon-absent Core behavior                     | `bitty --safe`, the headless suite, and a plain invocation work with no endpoint and no daemon process; the daemon is never a startup, diagnostics, or safe-mode dependency. Core platform plus Wheel consumer.                                                                                                                                                                                                                                                                                                          | open    |
| G-08 | Terminal-only slice implementation complete     | bitty#2790 (worker spawn, bind, content plane), bitty#2791 (containment, reaping, orphan verification), and bitty#2792 (event frames) closed; no catalog method left unserved without a recorded deferral. Core platform. **At `6c229e9c`:** #2791 and #2792 are closed; #2790 remains open for the terminal content plane, so the row stays open.                                                                                                                                                                       | open    |
| G-09 | Fake and real parity                            | The frozen corpus runs both drivers on a native cell, the parity report names the compared ids, and a divergence fails the gate. A fake run never closes a real row. Core platform. **At `6c229e9c`:** 34 shared vectors compared, 0 divergences, 4 typed skips in the real driver; the sign-off is still missing.                                                                                                                                                                                                       | open    |
| G-10 | Linux x86_64 native evidence                    | Recorded real-service runs at a named revision for every row the gate cites, with commands, exit codes, and artifact digests. Core platform. **At `6c229e9c`:** the 2026-10-30 campaign records 254 live assertions, 51 service-loop tests, 10 containment tests, 418 lib tests, and conformance artifact digests; formal audit reports remain absent.                                                                                                                                                                   | open    |
| G-11 | Advertised platform cells                       | Release material advertises only cells with their own native-run evidence; Linux x86_64 is the only cell with recorded real-service evidence; a compile-only target is not advertised. Release owner plus Core platform.                                                                                                                                                                                                                                                                                                 | open    |
| G-12 | Package and binary artifacts                    | `bittyd` is present in the release bundle and manifest with a version, checksum or provenance record, and an install/upgrade note; `publish = false` stays true for the crate. Release owner.                                                                                                                                                                                                                                                                                                                            | open    |
| G-13 | Startup, safe mode, and headless behavior       | Explicit start only, no autostart requirement, no service-file dependency, and a documented absent-daemon path. Core platform plus docs curator.                                                                                                                                                                                                                                                                                                                                                                         | open    |
| G-14 | Documentation synchronization                   | IPC contract accepted, session-host contract unchanged or amended, threat model, risk register, evidence matrix, P0 evidence plan, release notes, and the docs pin synchronized in the same delivery. Docs curator.                                                                                                                                                                                                                                                                                                      | open    |
| G-15 | No TCP and no hidden listener                   | After startup there is no TCP listener, no abstract-namespace socket, no `/tmp` fallback, and no discovery service; the namespace scan and the daemon self-count are recorded. Security reviewer.                                                                                                                                                                                                                                                                                                                        | open    |
| G-16 | Endpoint trust and peer credentials             | Owner-private endpoint, peer capture before parsing, per-message credentials on Linux, captured-peer re-check before privileged actions, tamper exit `6`, and the stated same-uid residuals. Security reviewer.                                                                                                                                                                                                                                                                                                          | open    |
| G-17 | Orphan recovery and containment                 | Two-phase journal, verified containment identity, no signal to an unverified record, `daemon.orphans.verify` served with its exact claim. Security reviewer plus Core platform. **At `6c229e9c`:** served verify/retire, live cgroup kill/reap, and the crash-restart scan are recorded in the P0 evidence plan; the independent sign-off is still missing.                                                                                                                                                              | open    |
| G-18 | Audit sink and secret minimization              | Content-free bounded records, owner-private modes, rotation, refusal budget, fail-closed `audit_degraded`, disabled core dumps, no service read method, and a seeded-canary scan. Security reviewer.                                                                                                                                                                                                                                                                                                                     | open    |
| G-19 | Idempotency                                     | Bounded stores, fingerprint conflict, keyless termination, restart residual stated, and the `F-9` slice gate recorded. Security reviewer.                                                                                                                                                                                                                                                                                                                                                                                | open    |
| G-20 | P0 evidence                                     | `P0-AC-019` and `P0-AC-021` through `P0-AC-026` each have a reviewed artifact; the daemon-intake rows `DR-01` through `DR-08` in the [risk register](../security/risk-register.md#bittyd-local-daemon-risk-intake-ctx-1629) are resolved or accepted rather than `Open`; no row is called `Verified` without the independent auditor sign-off. Security reviewer. At 2026-10-30 all eight `DR-` rows are `Open`, and bitty#2823 with bitty#2824 leave the `P0-AC-023` artifact unreviewable, so the row stays `blocked`. | blocked |
| G-21 | CI stability                                    | The required checks pass on the merge head; a flaky or timed-out run is recorded as a failure and is not counted as a pass (bitty#2781). CI owner plus release owner.                                                                                                                                                                                                                                                                                                                                                    | open    |
| G-22 | Owner-authorized publication                    | A separate dated owner record names the version, tag, artifact set, channels, and rollback point; no earlier row implies it. Project initiator.                                                                                                                                                                                                                                                                                                                                                                          | open    |

## Current state (2026-10-30)

This is the honest pre-decision snapshot. It is not a forecast and it is not a
waiver for any row.

| Area                 | Observed state                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Evidence matrix      | No risk is `Verified`; no P0 daemon artifact exists on `main`. The 2026-10-28 campaign and the 2026-10-30 reverification record `supported`, `partial`, and `blocked` observations only. The gate cites the eight daemon-intake rows `DR-01` through `DR-08` in the [risk register](../security/risk-register.md#bittyd-local-daemon-risk-intake-ctx-1629); all eight are `Open` and none has a reviewed artifact, so `G-20` stays `blocked` (bitty#2822). |
| Contract             | The IPC freeze is `draft` at `edc65ae1`/`2c8f419b` (1.2 revision), a candidate for sign-off with four unchecked boxes and a docs-curator gate; the security review that bitty#2664 requires is not recorded. The session-host contract is accepted with `F-9` and `F-12` as slice gates, and its architecture, Wheel, and `bitty-ai` reviews are not recorded as separate sign-offs.                                                                       |
| Slices               | bitty#2791 (containment and orphan verification) and bitty#2792 (event push) are closed. bitty#2790 remains open for the terminal content plane; worker spawn, generation 1, and `session.resize` merged in PR #2808. The Linux build now serves `daemon.orphans.verify`, the event wire, the request deadline, and the 1.2 metadata keys, and advertises `worker_sessions: true` before the accepted `D-01` amendment is recorded (G-06).                 |
| CI                   | bitty#2781 records RC-1 wall-budget parking flaking required checks on unrelated pull requests at a high rate; the same heads pass on rerun. A rerun is not a pass for G-21 until the flake is fixed or the row records a deterministic reproduction.                                                                                                                                                                                                      |
| Implementation cited | The evidence revisions are the `d360b442` campaign, the `adb15d15` refresh, and the `6c229e9c` reverification; `bitty` `main` moves past them, so a later row must cite its own recorded run.                                                                                                                                                                                                                                                              |
| Publication          | No tag, artifact, CDN/R2 object, catalog entry, or stable-pointer change has been created for `bittyd`. G-22 is `open` by construction and cannot be satisfied by this document.                                                                                                                                                                                                                                                                           |

## Exit criteria and signing authority

The gate leaves `draft` only when all of the following hold:

1. G-01 through G-05 are `met`: the IPC contract is accepted with the owner,
   security, architecture, and consumer sign-offs recorded.
2. G-06 through G-14 are `met`: the terminal-only slice is complete, parity and
   native evidence are recorded, only evidenced cells are advertised, the
   package contains `bittyd`, startup and absent-daemon behavior are documented,
   and the documentation is synchronized in the same delivery.
3. G-15 through G-20 are `met`: no TCP, endpoint trust, orphan recovery, audit,
   idempotency, and the P0 evidence set are reviewed by the independent
   security reviewer, and no control is downgraded to reach the gate.
4. G-21 is `met`: the required checks pass on the merge head, and every flaky
   or timed-out run is recorded rather than excused.
5. The release owner records a dated eligibility decision naming each `met` row
   and its artifact. A blanket "eligible" is not a decision.
6. The owner records the publication authorization separately (G-22), or
   records that publication is not authorized. This document performs neither.

| Area                | Rows       | Signs the row                                                              |
| ------------------- | ---------- | -------------------------------------------------------------------------- |
| Contract acceptance | G-01..G-05 | Owner, Security, Architecture, Consumer reviewers                          |
| Slice and evidence  | G-06..G-11 | Core terminal platform, with the release owner for the advertised-cell set |
| Release mechanics   | G-12..G-14 | Release owner, Core terminal platform, docs curator                        |
| Security evidence   | G-15..G-20 | Independent security reviewer, with bitty#2608 as the evidence record      |
| CI stability        | G-21       | CI owner and release owner                                                 |
| Publication         | G-22       | Project initiator (owner)                                                  |

## Security review

This page adds no control and verifies none. It restates the security corpus
only to name the gate rows, and it must not be cited as evidence that a control
exists.

The security reviewer must confirm before signing G-15 through G-20:

1. No row lowers a P0 threshold, waives a negative test, or converts a typed
   skip into a pass.
2. `P0-AC-019` and `P0-AC-021` through `P0-AC-026` keep their accepted proof
   obligations, and the `DR-01` through `DR-08` intake rows in the [risk
   register](../security/risk-register.md#bittyd-local-daemon-risk-intake-ctx-1629)
   stay `Open` until a recorded, reviewed artifact exists.
3. The endpoint, peer-credential, no-TCP, audit, idempotency, and orphan rows
   name artifacts, not code presence or a fake-server pass.
4. The stated residuals remain stated: same-uid endpoint impostor, a same-uid
   adapter that can read the operator capability, a same-uid debugger that can
   read the control token, live descriptor passing on connection-scoped cells,
   a spawned worker that can read the operator capability, and an audit sink
   that is not tamper-evident against the owner.
5. `worker_sessions=false` is a control, not an exemption, and enabling worker
   hosting needs an ADR 0019 amendment plus its own security review.
6. Security sign-off does not authorize publication; G-22 stays with the owner.

The security sign-off is recorded against a named revision and artifact set. A
review of a different revision does not transfer.

## Verification plan

For this delivery:

1. Run `just check` in the `bitty-docs` worktree: prettier `3.9.6`,
   markdownlint-cli2 `0.23.1`, links, offline cross-repository links, metadata,
   language, AGENTS budgets, hygiene, SVG, project state, and actionlint.
2. Run `git diff --check` and confirm the document is English-only,
   self-contained, and free of research-repository references.
3. Confirm the route rows in `docs/README.md` and `docs/releases/README.md`
   resolve, and that no gate row claims a state the cited record does not
   support.

For the gate itself, each row is verified by the artifact it names, produced by
the owner it names. This page does not duplicate the per-criterion commands;
they stay in the P0 evidence plan and the conformance harness (bitty#2605). A
row is `met` only after the artifact and the sign-off exist together.

## Alternatives considered

- **Treat a merged service loop and a green corpus as eligibility.** Rejected:
  a merged implementation and a passing corpus are input to the review, not a
  sign-off, and the evidence matrix still records no `Verified` risk.
- **Publish on the milestone date.** Rejected: a milestone is a plan, not an
  authorization, and the gate must not convert schedule pressure into a
  security decision.
- **Enable `worker_sessions` for the v0.2.0 slice to make the slice look
  complete.** Rejected: `D-01` requires an ADR 0019 amendment and a security
  review of worker spawn and credential inheritance first.
- **One combined "release ready" flag.** Rejected: it collapses implementation
  evidence and publication authorization into one state, which is exactly the
  confusion this page exists to prevent.
- **Require a second platform cell before eligibility.** Rejected as a blanket
  rule: the gate requires native evidence for every advertised cell and does
  not require advertising more than Linux x86_64 in the first decision.
- **Let the security sign-off double as publication approval.** Rejected:
  security records evidence sufficiency; only the owner authorizes publication.

## Affected contracts

| Contract or record       | Effect                                                                                                                                                                  |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Session-host contract    | No change. `D-01`, `D-05`, `D-14`, and the conformance matrix remain authoritative.                                                                                     |
| IPC contract             | No change to its text. G-01 through G-05 gate its acceptance and the four sign-offs it already names.                                                                   |
| ADR 0019 / ADR 0008      | No change. G-06 and G-08 depend on them; worker hosting would need an ADR 0019 amendment.                                                                               |
| ADR 0002                 | No change. G-11 applies its native-runner rule to the advertised-cell set.                                                                                              |
| Threat model             | No control change. One test-obligation bullet now states the child fd outcome instead of the `close_range` call (bitty#2823).                                           |
| Risk register and matrix | No state move. The `DR-01` through `DR-08` intake rows stay `Open`; the `DR-07`/`R-012` mitigation wording now names the child fd table (bitty#2823).                   |
| P0 evidence plan         | `P0-AC-023`/EV-03 now states the child fd-table obligation and stays `partial` (bitty#2823, bitty#2824); the plan remains the producer of record for G-15 through G-20. |
| Release notes            | No change. A release note is written only after a publication, per the releases index.                                                                                  |
| Wire and API surface     | No change. This page adds no method, scope, capability, field, event, or refusal code.                                                                                  |

## Open points

1. **Project-level candidate record.** The terminal-platform corpus carries a
   project-level candidate at
   [bittyd-release-eligibility.md](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-release-eligibility.md).
   Two records now describe the same gate. The owner must decide whether that
   candidate becomes the project-level pointer to this shared release record or
   keeps its own sign-off table; until then both stay `draft`, and neither
   authorizes publication.
2. **Exact version and tag.** The train is milestone `v0.2.0`; the tag and
   version are assigned at tag time by the release owner. The gate does not
   reserve either.
3. **Advertised-cell set.** Linux x86_64 is the declared first cell. Whether a
   second cell is advertised in the same release, and which one, is a release
   decision that needs its own native run.
4. **`events` capability honesty.** Resolved at `6c229e9c`: bitty#2792 / PR
   #2811 serves the opted-in per-lease event wire, and the served cell still
   advertises `events: true`. The IPC sign-off must still record the reviewed
   surface before G-01 and G-08 can be `met`.
5. **`F-9` and `F-12`.** The accepted contract makes `F-9` the idempotency
   slice gate and `F-12` the peer-recheck and plugin-adjacent gate. G-19 and
   G-16 stay `open` until both are recorded.
6. **CI flake disposition.** bitty#2781 is a `v0.0.31` fix. The release owner
   must decide whether a flaky required check blocks the eligibility decision
   until the fix lands; this page treats a rerun as recorded evidence, not a
   pass.
7. **Preview versus stable channel.** This gate targets the stable train. The
   preview release contract governs nightly or preview publication, which this
   page does not authorize.
8. **Documentation pin.** G-14 requires the project docs pin to move with the
   accepted contract and this record; the pin bump is a separate reviewed
   change, never a side effect.
9. **Worker serve-before-amendment.** The Linux build advertises
   `worker_sessions: true` and serves the contained worker path while accepted
   `D-01` still describes the v0.2.0 slice as terminal-only. G-06 requires the
   recorded ADR 0019 amendment and a security review of spawn, credential
   inheritance, and cleanup before the row can be `met`; until then the row is
   contradicted, not merely unproven.
10. **Shipped-build request deadline.** The typed `Timeout` is observable only
    through `test-seams`; the release owner and security reviewer must decide
    whether the seam run plus unit tests satisfy the deadline evidence or a
    shipped-build artifact is required (see the P0 evidence plan, open point
    14).
11. **Residual register location.** Resolved 2026-10-30 (bitty#2822): `DR-01`
    through `DR-08` are the daemon-intake rows in the [risk
    register](../security/risk-register.md#bittyd-local-daemon-risk-intake-ctx-1629),
    not a missing table. They track beside the canonical `R-` rows through the
    register's promotion rule and map to `R-009`, `R-011`, `R-012`, `R-013`, and
    `R-014`; every one is `Open`. `G-20` stays `blocked` on the unreviewed
    `P0-AC` artifacts (bitty#2823 and bitty#2824 keep `P0-AC-023`
    unreviewable), not on a missing reference. The row can only move when a
    reviewed artifact exists for each criterion and the cited `DR-` rows record
    their disposition.

## Acceptance criteria

- The page follows the repository spine and the flat eight-field frontmatter.
- The gate table covers contract acceptance and the four sign-offs,
  `worker_sessions=false` with the typed refusal and daemon-absent behavior,
  implementation, parity, Linux native evidence, advertised cells, package and
  binary, startup, safe mode, headless behavior, documentation synchronization,
  no-TCP, endpoint trust, orphan recovery, audit, idempotency, P0 evidence, CI
  stability, and owner-authorized publication.
- Every row names its required evidence, its signing authority, and a state.
- Every `DR-` reference resolves to a named row in the
  [risk register](../security/risk-register.md#bittyd-local-daemon-risk-intake-ctx-1629),
  and G-20's `blocked` state matches that register rather than a missing
  artifact.
- The evidence-versus-publication split is explicit, and the page performs no
  tag, publication, catalog, CDN/R2, or stable-pointer action.
- The current-state section records the absence of a `Verified` row, the
  `draft` IPC contract and its blocked sign-off, the closed bitty#2791/#2792
  slices, the open bitty#2790 content plane, the `worker_sessions` contradiction
  against G-06, the eight `Open` `DR-` intake rows, the open bitty#2823/#2824
  child-scope defects behind G-20, and the bitty#2781 flake risk.
- Exit criteria name every signer, and the page is English-only,
  self-contained, and free of research-repository references.
- `just check` and `git diff --check` are green.

## P0 Review Sign-off

This gate claims no approval that is not listed. The eligibility decision is a
separate dated record; it cannot cite this table as evidence, and this table
cannot cite the decision as a review.

| Reviewer                      | Required for                                                                     | Status               |
| ----------------------------- | -------------------------------------------------------------------------------- | -------------------- |
| Release owner                 | The gate text, the row set, and the eligibility/publication split                | Submitted 2026-10-29 |
| Core terminal platform        | Implementation, parity, cell, artifact, startup, and headless rows               | Pending              |
| Independent security reviewer | G-15 through G-20, the residuals, and the no-downgrade rule                      | Pending              |
| Architecture reviewer         | Contract acceptance, registry and version rules, and the slice dependencies      | Pending              |
| Wheel and `bitty-ai` consumer | Adapter, fake server, worker refusal, and daemon-absence rows                    | Pending              |
| Docs curator                  | Spine, metadata, index rows, language, self-containment, and cross-document sync | Pending              |

## References

- [bittyd Session-Host Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-session-host-contract.md)
  - `D-01` through `D-18`, the conformance matrix, platform cells, and the
    trust-boundary residuals.
- [bittyd Session-Host Contract Promotion Record](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-session-host-promotion-record.md)
  - accepted disposition, review scope, and the `F-9`/`F-12` slice gates.
- [bittyd IPC Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-ipc-contract.md)
  - the frozen service surface, its four sign-offs, and its open points.
- [bittyd Scope Charter](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-scope-charter.md)
  - the mechanism floor and exclusions that bound the slice.
- [Preview Release Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/preview-release-contract.md)
  - preview isolation and the required-gates pattern.
- [Release ladder](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/product/release-ladder.md)
  - the `v0.2.0` milestone and the daemon staging.
- [Threat model](../security/threat-model.md), [risk register](../security/risk-register.md),
  [evidence matrix](../security/evidence-matrix.md), [P0 acceptance criteria](../security/p0-acceptance-criteria.md),
  and the [bittyd P0 evidence plan](../security/bittyd-p0-evidence-plan.md).
- [ADR 0019](../decisions/adrs/ADR-0019-bittyd-staging-advance.md),
  [ADR 0008](../decisions/adrs/ADR-0008-headless.md), and
  [ADR 0002](../decisions/adrs/ADR-0002-platform-support-tiers.md).
- [bitty#2666](https://github.com/bitty-terminal/bitty/issues/2666) - this
  conditional eligibility gate.
- [bitty#2664](https://github.com/bitty-terminal/bitty/issues/2664) - the IPC
  freeze and its four sign-offs.
- [bitty#2608](https://github.com/bitty-terminal/bitty/issues/2608) - the
  security review and P0 evidence.
- [bitty#2790](https://github.com/bitty-terminal/bitty/issues/2790),
  [bitty#2791](https://github.com/bitty-terminal/bitty/issues/2791), and
  [bitty#2792](https://github.com/bitty-terminal/bitty/issues/2792) - the
  remaining daemon slices; #2791 and #2792 are closed, #2790 stays open for the
  terminal content plane.
- [bitty PR #2801](https://github.com/bitty-terminal/bitty/pull/2801),
  [PR #2808](https://github.com/bitty-terminal/bitty/pull/2808),
  [PR #2811](https://github.com/bitty-terminal/bitty/pull/2811),
  [PR #2815](https://github.com/bitty-terminal/bitty/pull/2815), and
  [PR #2816](https://github.com/bitty-terminal/bitty/pull/2816) - the
  containment, worker-spawn, event-wire, request-deadline, and 1.2 metadata
  slices observed by the 2026-10-30 reverification.
- [bitty#2822](https://github.com/bitty-terminal/bitty/issues/2822) - the
  gate's `DR-01` through `DR-08` reference, corrected in this revision to cite
  the risk-register daemon-intake table.
- [bitty#2823](https://github.com/bitty-terminal/bitty/issues/2823) and
  [bitty#2824](https://github.com/bitty-terminal/bitty/issues/2824) - the
  child-scope `close_range` proof gap and the extra child PTY descriptors.
- [bitty#2781](https://github.com/bitty-terminal/bitty/issues/2781) - the RC-1
  wall-budget CI flake.
