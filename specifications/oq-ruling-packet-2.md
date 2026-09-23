---
title: OQ ruling packet 2
description: Decision packet for the six 0.0.21-blocking OQs, the #1088 auditor checklist, and EPIC close criteria
category: specifications
audience: maintainer
document_type: specification
status: draft
website_publish: false
sidebar_order: 10
---

<!-- markdownlint-disable MD025 -->

# OQ ruling packet 2

> Status: **draft decision packet** (CTX-0243). It decides nothing: each
> `RECOMMENDED` row below needs the owner's adopt/refuse/defer ruling first.
>
> Task: `CTX-0243` | Register: `OQ` in
> [bitty-docs](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/open-questions.md)
> (`docs/decisions/open-questions.md`)
> Source: owner decree that `0.0.21` ships only at zero-open, covering the six
> remaining `bitty` blockers (`bitty` #1092, #1091, #1094, #1095, #985, #990,
> #981), auditor requirements (`bitty` #1088), and EPIC close criteria
> (`bitty` #969-979).
> Five of the six OQs below are already `Accepted` by the owner ruling of
> 2026-09-23 (packet-1 follow-through, `bitty-docs` CTX-0242, threat-model
> revision plus P0-AC-035..039); this packet records those rulings with a
> confirm recommendation, and carries the one live ruling path (OQ-051) plus
> the #1088 checklist and the EPIC criteria as decision-pending content.

## Document status

Draft. No row in this packet is a decision, an implementation claim, or a
weakening of any normative control. An owner ruling per row (adopt, refuse,
or defer) is recorded in the
[open-question register](../docs/decisions/open-questions.md) and the
[decision register](../docs/decisions/index.md) before any implementation
issue unblocks.

## Purpose and scope

In scope: OQ-054 (`bitty` #1092), OQ-055 (`bitty` #1091), OQ-057
(`bitty` #1094), OQ-083 (`bitty` #1095), OQ-051 (`bitty` #985, #990),
OQ-089 (`bitty` #981); the exact auditor checklist behind `bitty` #1088;
and a per-EPIC close criterion for `bitty` #969 through #979.

Out of scope: OQ-088 (Leader default, also blocking `bitty` #981) and
`bitty` #982 (CW-03 composer) and #1096 (SEC-27 wheel, already CLOSED);
they are noted where they affect close criteria but get no recommendation
here.

## Normative sources this packet must not weaken

- [Security overview](../docs/security/overview.md) and
  [threat model](../docs/security/threat-model.md), including the adopted
  trust/tier/role/lease revision (CTX-0242).
- [P0 acceptance criteria](../docs/security/p0-acceptance-criteria.md)
  P0-AC-001..039 and the
  [risk register](../docs/security/risk-register.md) RS-1..RS-7 lifecycle.
- [Evidence matrix](../docs/security/evidence-matrix.md) Phase E: presence
  of a mechanism is `Implemented`-only evidence, never `Verified` closure.
- ADR 0006 (`os.getenv` denial, `bitty.env.get` allowlisting) and MP-10
  (provider-credential handling).
- The
  [open-question register](../docs/decisions/open-questions.md) owns OQ
  identifiers and states; this packet cites them and changes none.

## Terminology

- **Shipped** — implemented and tested in the `bitty` repository.
- **Accepted** — decided in an accepted contract or owner ruling.
- **Candidate** — recorded direction with no contract force.
- **Open** — follow-up work with no contract.
- **Zero-open gate** — the owner decree: `0.0.21` ships only when zero
  blocking issues remain open across EPICs #969-979.

## Ruling table

| OQ     | Question (one line)                                                                                          | Affected `bitty` issues | Register state (2026-09-23)               | Recommendation                                                                 | What merges unlock                               |
| ------ | ------------------------------------------------------------------------------------------------------------ | ----------------------- | ----------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| OQ-054 | `api_key_env` vs `api_key_cmd` semantics, resolution order, project-override boundary.                       | #1092                   | Accepted (MPC-1..MPC-4)                   | Confirm exclusive-or plus narrow-only project override.                        | #1092 moves to provider-schema implementation.   |
| OQ-055 | Secret-storage tiers in scope; consent, audit, redaction per tier.                                           | #1091                   | Accepted (four tiers)                     | Confirm four tiers with per-tier consent and names-only audit.                 | #1091 moves to tier implementation on ADR 0006.  |
| OQ-057 | Capability-enforced role contract (role-authority map, prompt binding, dispatch limits, sandbox).            | #1094                   | Accepted (role table plus CRE-5)          | Confirm table plus execution-sandbox layer at four enforcement points.         | #1094 moves to enforcement-point implementation. |
| OQ-083 | Panel lease, description, handoff contract; composition with Stable Ids and the event bus.                   | #1095 (plus #1052 done) | Accepted (lease kernel)                   | Confirm `Idle`/`Occupied` kernel with acquire/release/handoff events.          | #1095 moves to lease-gate implementation.        |
| OQ-051 | Non-terminal panel path: compositor sub-surface vs Scene path; ownership vs Rich Presentation/Panel Runtime. | #985, #990              | Open (deferred per 2026-09-23 ruling)     | Accept the Scene-consumption contract owned by the Panel Runtime (path below). | #985, #990 implement against a placed contract.  |
| OQ-089 | Bitty Beacon spatial action engine (targets, actions, labels, handedness, script authority, config).         | #981 (also OQ-088)      | Accepted (P7 direction, details deferred) | Confirm P7 direction; labels/authority/config follow OQ-050 anchors.           | #981 moves to engine contract once anchors land. |

## Per-OQ briefs

### OQ-054 — credential reference semantics (Accepted: confirm)

- What it decides: the config semantics of `api_key_env` versus
  `api_key_cmd`, their resolution order, and the project-level override
  boundary that cannot widen credentials.
- Options on the table: (A) exclusive-or with an explicit resolution order
  plus a narrow-only project override (adopted as MPC-1..MPC-4); (B)
  precedence order that permits both sources set with first-wins; (C)
  project layers allowed to introduce credential references.
- RECOMMENDED (A): dual-source resolution is ambiguous and unauditable, so
  the exclusive-or makes exactly one credential source attributable per
  provider — both-set denies as conflict, neither-set resolves to no
  credential — while the narrow-only project rule keeps untrusted project
  layers from escalating privilege, which is the security load-bearing
  property and composes with ADR 0006 and MP-10; options (B) and (C) each
  admit a state where two sources resolve into one credential or a project
  silently widens access.
- What merges unlock: `bitty` #1092 converts to provider-schema plus
  resolution implementation, gated by P0-AC-037 (conflict, widen, narrow,
  and unset cases each tested).

### OQ-055 — secret-storage tiers (Accepted: confirm)

- What it decides: which secret-storage tiers are in scope and how consent,
  audit, and redaction apply per tier.
- Options on the table: (A) four tiers — host-consumed environment,
  `0600` secrets file, OS keyring, command references — each with required
  consent plus names-only audit (adopted, P0-AC-036); (B) environment-only;
  (C) tiers without per-tier consent.
- RECOMMENDED (A): ADR 0006 already fixes the `os.getenv` denial and the
  allowlisted `bitty.env.get`, so the tiers extend a settled base instead
  of reopening it, and per-tier consent with names-only audit gives the
  auditor one uniform redaction rule — the seeded-secret corpus never
  appears in outputs — across all four tiers rather than four bespoke
  policies; (B) strands keyring and password-manager users, and (C) leaves
  the highest-risk tier (command references executing arbitrary argv) with
  the weakest gate.
- What merges unlock: `bitty` #1091 moves to tier implementation on top of
  ADR 0006, gated by P0-AC-036 (denial plus names-only audit proven per
  tier).

### OQ-057 — role contract for multi-agent work (Accepted: confirm)

- What it decides: the capability-enforced role-to-authority map, per-role
  prompt binding, subagent dispatch limits, and the enforcement points at
  which the contract is checked.
- Options on the table: (A) Commander/Implementer/Tester/Reviewer
  authority map with prompt-as-data (CRE-2), downward-only dispatch
  (CRE-3), and the CRE-5 execution-sandbox layer, checked at context read,
  tool call, delegation, and sandboxed execution before the grant
  intersection (adopted, P0-AC-038); (B) prompt-bound roles with no
  capability map; (C) tool-capability sets with no sandbox layer.
- RECOMMENDED (A): prompt text never grants authority, and tool capability
  alone leaves shell writes open — a role without `fs.write` can still
  rewrite files through an allowed `process.spawn` — so only the two-layer
  contract (tool set plus sandbox profile: filesystem, network, process
  family, environment) with fail-closed, delegation-only-narrows checks at
  all four points closes CRE-5; (B) is advisory only and (C) is bypassable
  by construction.
- What merges unlock: `bitty` #1094 moves to enforcement-point
  implementation, gated by P0-AC-038 (every role-by-point cell tested; no
  prompt, plan, or payload content in denials).

### OQ-083 — panel lease, description, handoff (Accepted: confirm)

- What it decides: the panel lease, description, and handoff contract for
  the embodied multi-agent workspace and its composition with the Stable
  Id hierarchy and the inter-panel event bus.
- Options on the table: (A) bounded lease kernel — `Idle` versus
  `Occupied(holder)` with acquire/release/handoff bus events, presentation
  staying non-authoritative (adopted per RUN-21 evidence, P0-AC-039); (B)
  ownership without a bounded lease; (C) panel as execution identity.
- RECOMMENDED (A): the bounded lease makes every panel write attributable
  to exactly one holder — write-by-non-occupant denied, acquiring an
  occupied panel fails, release and handoff require the current holder —
  while keeping presentation non-authoritative per SMO-2; (B) cannot
  arbitrate two agents claiming one panel, and (C) contradicts the
  accepted Agent/ExecutionContext/Panel separation (OQ-084, ADR-0013).
- What merges unlock: `bitty` #1095 moves to lease-gate implementation
  (#1052 RUN-21 already closed as the evidence kernel), gated by P0-AC-039
  (denials tested; every transition emits its event only when it actually
  happened).

### OQ-051 — non-terminal panel content path (Open: ruling requested)

- What it decides: whether non-terminal panels get a compositor
  sub-surface or a Scene path instead of the per-leaf character-grid
  snapshot, and who owns it relative to Rich Presentation and the Panel
  Runtime.
- Options on the table: (A) Scene path consumed by the render pipeline
  with split ownership — Rich Presentation owns the `SceneNode` model, the
  Panel Runtime owns paint-path integration; (B) one compositor
  sub-surface per non-terminal panel; (C) keep the per-leaf grid snapshot
  and extend cell metadata.
- RECOMMENDED (A): the bounded `SceneNode` model already exists with
  admission bounds (`64` blocks, `2048` nodes per block, depth `32`,
  `2 MiB` per terminal), so the data contract needs a consumer, not a new
  design; (B) duplicates compositor state the Panel Runtime does not yet
  own and repeats the authority ambiguity the 2026-09-23 deferral was
  meant to avoid; (C) is lossy by construction and can never carry spans,
  tables, or borders. The split keeps the model where it is accepted and
  puts the paint path where panels live, and it gives the Panel Runtime
  acceptance the ownership premise it is waiting for.
- What merges unlock: `bitty` #985 and #990 implement against a placed
  contract (Scene consumer in the render path; content beyond the
  character grid) once the Panel Runtime acceptance fixes ownership. This
  recommendation is path-to-acceptance and still needs the owner ruling;
  until then both issues stay blocked.

### OQ-089 — Bitty Beacon spatial action engine (Accepted: confirm)

- What it decides: the Beacon contract — target kinds, action taxonomy,
  label allocation and handedness pools, script-dispatch authority, and
  config surface — and how it generalizes Hint Mode.
- Options on the table: (A) P7 engine direction (spatial focus,
  output-fold toggle, focus routing, script dispatch) with label
  allocation, script authority, and config surface as follow-ups ordered
  after OQ-050 anchors (adopted); (B) full contract now including label
  pools and script authority; (C) Hint Mode only, no workspace engine.
- RECOMMENDED (A): labels without stable anchors have nothing to point
  at — OQ-050 stays open — so accepting the engine direction while
  ordering labels, authority, and config after anchors avoids freezing
  details the anchor decision will reshape; (B) front-runs OQ-050, and (C)
  strands the U-8 Beacon groundwork already closed under EPIC #972
  (UX-28..UX-33).
- What merges unlock: `bitty` #981 moves to the engine contract once
  anchors land. Note: #981 is additionally blocked on OQ-088 (Leader
  default), which is outside this packet and stays open.

## #1088 auditor checklist (exact)

`bitty` #1088 (SEC-19, Evidence matrix Phase E completion) closes only
when every R-001..R-022 row of the
[evidence matrix](../docs/security/evidence-matrix.md) carries all five
columns complete and linked, plus the lifecycle gates below. Column
meanings follow the matrix `Evidence columns` table:

- Test: headless unit or integration harness asserting the pass threshold;
  names the crate test file or suite.
- CI: gating hygiene green on every run (`just check`, `cargo check` /
  `cargo clippy -D warnings` / `cargo test --locked`, CodeQL,
  `actionlint` / `act -n`).
- Adversarial: malformed, oversized, fuzz, timeout, scope-escalation,
  tamper, or boundary suite that fails closed with zero panics or hangs
  and no partial state.
- Audit: reviewer-signed artifact under `docs/security/audits/` (or
  CarryCtx note) confirming prose was checked against the surface;
  required for at least R-003, R-005, R-008, R-010, R-011, R-013, R-014,
  R-018, R-019, R-021.
- State: `Open` until all linked P0-AC pass per their verification method
  and the auditor records `Mitigated`; `Accepted` additionally requires a
  time-bounded CarryCtx decision.

Lifecycle gates (risk evidence RFC RS-1..RS-7): `Open -> Mitigated`
requires, for the risk's linked P0-AC set, unit/integration green,
adversarial corpus zero crashes/hangs, exhaustive negative and limit
coverage, observable budget/attribution enforcement, `just check` and
`ci-gate` green, secret/scope assertions where cited, manual-audit report
where cited, and safe-mode re-verification where intersecting R-009,
R-007, R-015, or R-022. `Mitigated -> Accepted` adds a time-bounded
CarryCtx decision with owner, rationale, expiry, and residual-risk
follow-up, and never weakens a normative control. Any regression in a
linked suite, new fuzz finding, advisory, or mechanism change
invalidating a cited hash or run reopens the row without a new decision.

Concrete remaining items (no row moves on mechanism presence alone):

1. Record the R-001 and R-002 `Open -> Mitigated` moves: merged auditor
   artifacts already authorize them (`vt-parser-2026-09.md` at `8c41f1e`
   PR #130; `rich-image-2026-09.md` at `8e6c8a9` PR #132) but the matrix
   rows do not record the move.
2. Complete the R-001 P0-AC-002 long-running `cargo-fuzz` campaign
   (`5daf686`, PR #1160, Issue #1132 added targets with short bounded
   smokes only).
3. File the pending manual-audit artifacts: resource-loader (R-003),
   unsafe/FFI inventory (R-018), dependency-policy (R-019),
   origin-policy (R-020), rich constrained-AST (R-021), install-no-exec
   (R-022), native-plugin-reject (R-017), capability-diff-block (R-016).
4. Add evidence for the new P0-AC-035..039 rows: trust level-by-family
   admission matrix (R-006, R-017), per-tier secret denial plus
   names-only audit (R-006, R-014), credential conflict/widen/narrow/unset
   cases (R-006, R-012), role-by-point matrix (R-013), lease-gate denials
   plus transition-event fidelity (R-013).
5. Disposition R-004 explicitly: it remains `Open` at `7a4ee41` (audit
   2026-08-31, which does not authorize `Open -> Mitigated`) with
   residual platform-backend, real-window UX, and `8192`-byte
   bound-scope gaps — close the gaps or record the non-closure with a
   follow-up.

## EPIC close criteria (#969-979)

Verified 2026-09-23 against live `bitty` sub-issue states. Each EPIC
closes only when all its sub-issues are CLOSED **and** its criterion
below holds; the `0.0.21` zero-open gate additionally requires zero OPEN
across all nine EPICs (today: 5 open, all under #971 and #975).

| EPIC | Title (short)              | Open sub-issues                   | Close criterion                                                                                                                                                                                                                                 |
| ---- | -------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #969 | M1/v0.1 correctness gates  | none (33/33 closed)               | Closeable now: M1-33 sign-off recorded; contribution to the gate is the Tier 1 M1 matrix green.                                                                                                                                                 |
| #971 | Core mechanisms unwired    | #981, #982, #985, #990            | Close when all four are CLOSED with live-path verification: #981 needs the OQ-051 ruling path plus OQ-088; #985/#990 need the placed Scene contract; #982 needs the composer overlay wired. Until then this EPIC carries the `0.0.21` blockers. |
| #972 | UI/UX candidate program    | none (46/46 closed)               | Closeable now: PW-1..PW-10 plus U-1..U-9 all landed.                                                                                                                                                                                            |
| #973 | Runtime/execution frontier | none (8/8 closed)                 | Closeable now: RUN-16..RUN-23 landed including the #1052 lease kernel; lease implementation continues under #975 SEC-26.                                                                                                                        |
| #974 | Performance and evidence   | none (15/15 closed)               | Closeable now: PB harness, evidence, soak, and compat-matrix automation landed.                                                                                                                                                                 |
| #975 | Security and risk closure  | #1088, #1091, #1092, #1094, #1095 | Close when all five are CLOSED **and** every R-001..R-022 row is `Mitigated`/`Accepted` per RS-1..RS-7 with auditor sign-off; R-004 explicitly dispositioned. This EPIC is the `0.0.21` security gate.                                          |
| #976 | DevTools track             | none (13/13 closed)               | Closeable now: protocol verification plus A1-A3 gates landed.                                                                                                                                                                                   |
| #977 | Release and packaging      | none (5/5 closed)                 | Closeable now; the `0.0.21` gate itself stays with the zero-open rule, not this EPIC.                                                                                                                                                           |
| #978 | Documentation sync         | none (11/11 closed)               | Closeable now: stale rows refreshed, R-001/R-002 reconciled, candidates promoted.                                                                                                                                                               |
| #979 | Housekeeping and infra     | none (2/2 closed)                 | Closeable now: hygiene gates green.                                                                                                                                                                                                             |

## Security review

This packet proposes no mechanism, threshold, or default change: it
records adopted rulings, recommends one contract shape (OQ-051), and
restates auditor requirements. It must not be read as weakening any
normative control; the threat model, P0-AC, and RS-1..RS-7 stay
authoritative, and every `RECOMMENDED` row composes with them as noted
per OQ. A security reviewer is required on the ruling PR only for the
OQ-051 acceptance shape, since the other five rows confirm already-ruled
controls.

## Verification plan

- Local: `just check` (fmt-check, markdownlint, links, cross-repo
  offline, metadata, language, agents, hygiene, svg, state, actionlint)
  passes with zero issues; `act -n` dry-run passes.
- Remote: PR checks are informational for this docs-only change; merge
  readiness is local-green plus `mergeable == MERGEABLE`. This task stops
  at PR open and does not merge.
- No implementation claim is made or verified by this packet; bitty-side
  verification belongs to the unblocked issues' own gates (P0-AC-036..039
  pass thresholds cited per OQ).

## Alternatives considered

- Recommending adoption language for the five already-accepted OQs as if
  undecided: rejected, because the 2026-09-23 owner ruling plus CTX-0242
  already accepted them; this packet confirms instead of re-deciding.
- Deferring OQ-051 again without a recommended shape: rejected, because
  #985 and #990 cannot be scoped against an open-ended deferral and the
  Scene model already constrains the answer.
- Closing #1088 on column completeness alone without the RS-1..RS-7
  lifecycle gates: rejected, because the matrix and the risk evidence RFC
  both require auditor-recorded moves, and mechanism presence alone moves
  nothing.

## Affected contracts

On owner ruling: the open-question register (OQ-051 state flip only; the
other five already record acceptance), the decision register (OQ-051
acceptance entry when ruled), and — for implementation, in the owning
repositories, not here — the AI architecture candidate sections
(MPC-1..MPC-4, tiers, CRE roles, lease model), the Semantic Terminal RFC
P7 follow-ups, the Panel Runtime acceptance (OQ-051 ownership premise),
and the evidence-matrix rows named in the #1088 checklist. This packet
itself changes none of those files.

## Open points

- OQ-051 still needs the owner ruling; the recommendation is
  path-to-acceptance only.
- `bitty` #981 is additionally blocked on OQ-088 (Leader default), which
  is outside this packet and stays open.
- `bitty` #982 (CW-03 composer overlay) blocks EPIC #971 independently
  of any OQ in this packet.
- P0-AC-035..039 have no implementation evidence yet; the criteria exist,
  the tests do not.
- R-004 disposition (close the residuals or record non-closure) is owned
  by the auditor track under #1088, not by this packet.

## Acceptance criteria

- This packet PR is accepted when: `just check` is green locally, the
  six OQ rows plus the #1088 checklist plus the ten EPIC criteria are
  present and accurate against the cited sources, and an independent
  reviewer approves. No `Closes` trailer: the PR is decision-pending.
- Each OQ row is closed only by the owner ruling recorded in the
  registers, never by merging this packet.
- `bitty` HOLD issues (#1092, #1091, #1094, #1095, #985, #990, #981) and
  #1088 unblock only on their respective rulings plus their own
  implementation and auditor gates.

## P0 Review Sign-off

Pending: owner ruling per OQ row; independent docs-reviewer approval of
this packet; auditor ownership of the #1088 checklist items. No sign-off
is claimed by this draft.

## References

- [Open-question register](../docs/decisions/open-questions.md) —
  OQ-051, OQ-054, OQ-055, OQ-057, OQ-083, OQ-089 states and canonical
  documents.
- [Decision register](../docs/decisions/index.md) — accepted directions
  queue.
- [Threat model](../docs/security/threat-model.md) — adopted
  trust/tier/role/lease revision (CTX-0242).
- [P0 acceptance criteria](../docs/security/p0-acceptance-criteria.md) —
  P0-AC-001..039 including the 035..039 gate set.
- [Evidence matrix](../docs/security/evidence-matrix.md) — Phase E
  columns, traceability rows, and review gates.
- [Risk register](../docs/security/risk-register.md) — RS-1..RS-7
  lifecycle.
- AI Architecture MPC-1..MPC-5, CRE-1..CRE-5, SMO-1..SMO-6, and the
  leased-workstation candidate (bitty-ai-docs specifications).
- Semantic Terminal RFC P1-P7 including the P7 Beacon candidate, and the
  UI and Compositor Gap Analysis OQ-051 gap (bitty-terminal-docs
  specifications).
