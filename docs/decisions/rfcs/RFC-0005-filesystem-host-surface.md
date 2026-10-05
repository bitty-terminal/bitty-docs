---
title: Filesystem Host Surface RFC
description: Draft contract for a capability-gated plugin filesystem surface with scoped read and write grants explicit path patterns and Core-owned enforcement
category: decisions
audience: contributor
document_type: specification
status: draft
website_publish: false
sidebar_order: 49
---

# Filesystem Host Surface RFC

> Status: **draft** (targets [OQ-056](../open-questions.md), which stays open;
> [issue #439](https://github.com/bitty-terminal/bitty-docs/issues/439)).
> This document is a proposal for the plugin filesystem host surface (the
> `bitty.fs` successor). It is not an accepted contract: it mints no
> capability identifier, authorizes no shipped behavior, and makes no
> compatibility promise. It must not merge beyond draft status until an
> independent security review plus acceptance are recorded under Acceptance
> evidence.

## Problem

Plugins have no file access to build on. The accepted contracts define ONLY
the capability identifiers `fs.read:PATTERN` and `fs.write:PATTERN` with
explicit path globs (Plugin Platform RFC identifier table; parameters
resolve against real paths with symlinks and devices rejected), and v1 has
NO Lua filesystem entry point: the accepted v1 Lua surface exposes no `fs`
namespace, the `bitty-lua` crate ships no `fs` seam module, and the draft
file-manager design states explicitly that there is no `bitty.fs`, removing
its former root-scoped `fs.read`/`fs.write` requests as phantom authority
until a surface exists.

Core owns grammar plus authorization but no bridge: `capability.rs` parses
and parameter-requires the `fs.read`/`fs.write` identifiers with no wildcard
head, `manifest.rs` bounds the grant shape (32 patterns per kind, 8 KiB
total pattern text, hostile-pattern rejection), and `fs_authz.rs` bounds the
request path (4096-byte path ceiling, sensitive-path policy, secret-shaped
content detection, typed allow/deny/consent outcomes) — yet no `bitty-lua`
filesystem bridge maps these grants to callable Lua functions.

The only function sketch in the corpus is draft illustrative direction: the
panel-history candidate names capability-sandboxed `bitty.fs.open/append/
read/list` mapped by the host under the plugin state directory, with upward
traversal denied. That sketch conflicts with the accepted capability split:
`open` names no read/write mode, `append` duplicates the write grant as a
separate verb, and `list` has no grant home at all. Three consumer kinds
wait on a reconciled contract:

- **File-manager plugins** that list, navigate, and preview files under a
  root-parameterized, fail-closed scope (draft policy-only design;
  observation-only today, direct filesystem I/O an explicit non-goal until
  the surface lands);
- **Editor preview paths** that need bounded reads of file content for
  preview selection without taking on write authority;
- **Wheel project-data consumers**, illustratively only: the `.wheel/`
  contract is declarative-data-only with no hard file-operation requirement,
  so Wheel names a future mediated-read consumer, never a direct-access one.

The chain is blocked at the first link: there is no reviewable contract for
what a plugin may read, write, or list, under which grant, with which
verbs, which bounds, and which secrecy treatment.

## Goals

- Give the filesystem host surface a documented home in shared governance
  (`bitty-docs`), naming the capability family, the grant shape, the
  reconciled verb set, the bound shape, and the secrecy treatment.
- Reuse the accepted `fs.read`/`fs.write` capability split as the single
  authority: reconcile the draft `open/append/read/list` sketch against it
  with a decided verb set and recorded rationale, instead of carrying two
  conflicting verb vocabularies.
- Keep the surface under a NEW Lua root, never under `bitty.terminal.*`,
  and keep v1 frozen: no v1 member is widened, aliased, or shadowed.
- Reuse the accepted Core bounds (4096-byte path ceiling, 32 patterns per
  kind, 8 KiB total pattern text) with no new numeric ceiling invented here;
  every value that stays parked names its owner.
- Name the blocked consumers and the unblocking chain explicitly, so the
  Core host bridge, the SDK spellings, and consumer parity each have a named
  predecessor instead of an implied one.
- Define the acceptance path: what review, evidence, and adoption must exist
  before this draft becomes an accepted contract (RFC-0004 pattern: draft,
  then security review, then acceptance).

## Non-goals

- No capability identifier is minted by this document; adding an identifier
  requires acceptance of this RFC plus the Core host integration that
  enforces it (identifiers are capability-registry stable).
- No `terminal.*` member is widened, reinterpreted, or given a filesystem
  sub-scope here; the v1 surface stays frozen.
- No exact Lua function signatures, argument orders, or return shapes are
  fixed here; spellings belong to the SDK work that follows acceptance, and
  the Core bridge owns the enforcement behind them.
- No live watch, subscription, tail-follow, retained file handle, or
  cross-call cursor semantic is granted; every operation is a bounded,
  self-contained request over current state.
- No ambient file access is granted: there is no read of the whole home
  directory, no traversal above a grant root, no symlink or device escape,
  and no private first-party bypass.
- No open question is closed; [OQ-056](../open-questions.md) stays open.
- No shipped, stable, normative, or compatibility-guaranteed behavior is
  claimed for any grant, verb, denial, or bound shape.

## Normative sources this proposal must not weaken

This proposal must be read together with, and must not weaken:

- The [security overview](../../security/overview.md),
  the [threat model](../../security/threat-model.md),
  the [risk register](../../security/risk-register.md),
  and the [P0 acceptance criteria](../../security/p0-acceptance-criteria.md).
  The controls that bind this surface include plugin capability checking with
  least privilege (`P0-AC-012`), per-plugin VM isolation and failure
  containment (`P0-AC-013`), resource budgets with attribution (`P0-AC-014`),
  hot-path exclusion (`P0-AC-015`), read-only default with untrusted labeling
  (`P0-AC-024`), trace minimization and redaction with user-only files
  (`P0-AC-026`), capability-increase update blocking (`P0-AC-030`), trust-level
  admission before grant intersection (`P0-AC-035`), the secret-storage tiers
  (`P0-AC-036`), and argv-first external invocation with no shell-string
  construction (`P0-AC-009`).
- The accepted
  [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md):
  the `fs.read:PATTERN`/`fs.write:PATTERN` identifier rows, the deny-by-default
  rule with no family-wide wildcard, the real-path/symlink/device restriction,
  and the read/write separation (reads stay out of the destructive warning
  set while `fs.write:PATTERN` is included).
- The accepted
  [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md)
  and [ADR 0009](../adrs/ADR-0009-plugin-api-v1-lua-surface.md):
  v1 is frozen; this surface is v2-only.
- The Core capability grammar and authorization in `bitty`
  (`crates/bitty-plugin-host/src/capability.rs`, `manifest.rs`,
  `fs_authz.rs`): parameter-required `fs.read`/`fs.write` identifiers, the
  32-patterns-per-kind and 8 KiB-pattern-text grant bounds, hostile-pattern
  rejection, the 4096-byte path ceiling, the sensitive-path default-deny set
  with an explicit consent path, and the typed allow/deny/consent outcomes.
  This RFC reuses these bounds and rules; it redefines none of them.
- The draft
  [file-manager design](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/docs/plugins/file-manager/design.md)
  (policy-only): observation-only listing, navigation, and preview over a
  caller-supplied root with an 8 KiB listing payload precedent, no direct
  filesystem I/O, and phantom-authority removal until the surface exists.
- The draft
  [panel-history candidate](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-history-candidate.md):
  the illustrative `bitty.fs.open/append/read/list` sketch this RFC
  reconciles, and the secret-minimizing storage direction its results must
  compose with.
- [ADR 0012](../adrs/ADR-0012-phodopus-runtime.md): the `bitty-lua` Host ABI
  (`bitty.ui`, `bitty.panel`, `bitty.fs`, `bitty.command`) sits strictly on
  top of the generic runtime as an ordinary consumer; the future `bitty.fs`
  bridge is Core-owned host work, never runtime work.
- The [Core boundaries](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/architecture/core-boundaries.md)
  capability rule: plugins never receive the filesystem directly; they
  request filesystem read and write constrained by explicit path patterns
  through host services.
- The [History Read Surface RFC](RFC-0004-history-read-surface.md)
  (accepted): the precedent for a NEW capability family with explicit
  per-plugin grants, typed oracle-tight denials, Core-attached
  untrusted-observation labels, export-preview equality, the read-into-VM-only
  grant-combination rule, and no streaming or subscription semantics. This
  RFC adopts the same shape for files.
- The accepted
  [IPC and Agent RFC](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/specifications/ipc-agent-rfc.md):
  returned content is observation data, never instructions. File bytes
  returned by any operation in this family carry the same treatment.

Where a control or threshold appears to need change, it is recorded under
"Unresolved questions" instead.

## Terminology

- **Core**: the always-available terminal mechanism that works with zero
  plugins and in `bitty --safe`; it owns the capability gate, the
  filesystem authorization layer, and resource budgets, and it will own the
  future `bitty-lua` filesystem bridge.
- **Scoped grant**: a per-plugin capability grant naming explicit path
  patterns with no wildcard default; absence of a grant, or an operation
  outside the grant scope, denies fail-closed.
- **Read/write split**: the accepted separation of `fs.read` authority from
  `fs.write` authority; a grant in one never implies the other.
- **Bounded request**: a single self-contained filesystem operation carrying
  explicit path and size caps, enforced by Core before any bytes move. It
  holds no handle or cursor across calls.
- **Typed denial**: a catchable, machine-readable denial naming its reason
  from the complete taxonomy without leaking out-of-scope identifiers,
  content bytes, or retention-existence signals.
- **Candidate**: a proposal that is not decided; candidate status is not
  acceptance and is not implementation.

## Proposed contract

The family is the accepted `fs` capability family with a Core-owned Lua
bridge beside `terminal.*`, owned by Core enforcement with SDK spellings.
Its invariant, in one sentence: **a granted plugin may perform bounded,
self-contained reads, writes, and listings strictly inside its explicit path
patterns and receive labeled results or a typed denial; it may never hold a
handle, cross a scope, stream a file, or move bytes beyond the VM without a
separately granted authority.**

### Capability family

- The family is the accepted `fs` family: `fs.read:PATTERN` and
  `fs.write:PATTERN` remain the only identifiers, with the parameter
  required and no family-wide wildcard. This RFC mints no identifier and
  changes no grammar.
- Every member is deny-by-default: without an explicit per-plugin grant
  recorded by the Core gate, every operation denies fail-closed with a typed
  denial. Grants never bundle modes: a read grant never implies a write
  grant, and a write grant never implies read-back.
- The Lua namespace lives under a NEW root, never under `bitty.terminal.*`:
  the proposed root is `bitty.fs.*`, the Host ABI slot ADR-0012 already
  names for the future bridge. No `terminal.*` spelling touches the
  filesystem, and no `bitty.fs.*` spelling touches terminal state.
- The family maps to the OQ-085 `filesystem` capability domain. A grant in
  this family never implies process, network, clipboard, IPC, or any other
  domain authority.
- A plugin update that newly requests this family is a capability increase
  and blocks pending the explicit permission-diff approval gate
  (`P0-AC-030`).

### Verb reconciliation

The draft sketch (`open/append/read/list`) is reconciled against the
accepted read/write split as follows; the decided verb set is
**read, write, list**:

- **`read`** (read-class): bounded reads of file bytes under the read grant.
  Directly authorized by `fs.read:PATTERN`.
- **`write`** (write-class): bounded writes of file bytes under the write
  grant, with the disposition (create, overwrite, append-mode) a write-flag
  candidate, not a verb. Directly authorized by `fs.write:PATTERN`.
- **`list`** (read-class): bounded directory listings (names plus file-kind
  metadata, never file bytes) authorized by the read grant scoped to the
  listed prefix. Listing reads the namespace, so it needs read authority;
  it must never become a read-grant-free enumeration oracle.

Rationale for retiring the sketch verbs:

- **`open` is rejected as a verb.** A handle-returning `open` implies a
  retained descriptor held across calls, which conflicts with the bounded,
  self-contained request invariant, with per-plugin generation fencing, and
  with the no-streaming rule (a held handle is a subscription by another
  name). Whatever the sketch meant by `open` is covered by `read` (for
  read-handles) or `write` (for write-handles) without retaining state.
- **`append` is rejected as a verb and parked as a write disposition.**
  Splitting the write grant into overwrite versus append verbs would divide
  one accepted identifier into two unenforced halves. Whether the write
  grant subdivides by disposition stays an unresolved question owned by the
  Core bridge and SDK work; the default proposed here is a single `write`
  verb with append-mode as a flag candidate.
- **`list` is kept and given a grant home.** The sketch named `list` with
  no capability backing; this RFC backs it with the read grant over the
  listed prefix and bounds it like every other operation.

Exact function signatures, argument orders, and return shapes stay parked to
the SDK work; this RFC fixes the verb set and the grant mapping only.

### Grants, scopes, and bounds

- Every grant carries explicit path patterns. There is no wildcard or `all`
  default; an unscoped grant request denies. Patterns resolve against real
  paths; symlinks and devices are rejected per the accepted restriction.
- An operation carries its own path and is authorized only when the path
  intersects the grant scope; otherwise Core denies with a typed
  scope-mismatch denial. Upward traversal above a grant root denies; the
  sensitive-path default-deny set (credential locations, `.env` variants,
  token stores) denies or routes to the explicit consent path per the
  accepted `fs_authz` policy.
- Numeric ceilings reuse the accepted Core bounds: 4096 bytes maximum path,
  32 patterns per kind, 8 KiB total pattern text. The per-line content-scan
  bound (4096 + 128 bytes) and the bounded audit and consent tables are
  reused where the bridge routes through the same authorization layer. No
  new numeric ceiling is invented here; per-call read/write payload caps
  and listing entry caps stay parked to the Core bridge and SDK work (the
  file-manager draft's 8 KiB listing payload is precedent, not norm).
- Core enforces a per-plugin operation rate and an aggregate byte budget,
  attributed per plugin (`P0-AC-014`); polling that would reconstitute a
  watch or a tail-follow denies with a typed over-rate or over-budget
  denial. Exact rates and quotas stay parked with the other ceilings (no new
  ceiling invented here).
- Operations carry no freshness or durability promise beyond what the Core
  bridge documents: every call is a point-in-time request over current
  state, and durability semantics (atomic replacement, sync) belong to the
  Core implementation task, not to this contract.

### Secrecy treatment

- Secret-minimizing from the start: reads that encounter secret-shaped
  content are treated fail-closed per the accepted content-detection
  heuristics, and sensitive paths stay default-deny with an explicit
  consent path; consent is keyed by path, never a value, and no file value
  enters audit records, traces, or denial shapes.
- Redaction composes with ADR 0006 and the security corpus from the start:
  the preview-equality analog holds (what a preview shows is what an export
  or a write carries — a redacted preview must never launder into an
  unredacted write), and the exact redaction format stays parked with the
  accepted storage and history policy owners.
- Every returned record carries a Core-attached, typed untrusted-observation
  label that survives truncation and attribution: a plugin, agent, or tool
  that consumes file bytes must treat them as content under the
  prompt-injection rule, and the host forbids executing, interpolating, or
  routing labeled content into an instruction channel without a separately
  granted authority outside this family (exercises `P0-AC-024`).
- Grant-combination rule: reading or listing under this family authorizes
  delivery of results into the plugin VM only. Copying to the clipboard,
  spawning processes over file content, publishing to IPC, or egressing
  over the network each needs its own separately granted authority; the
  family grant never implies them. Writing file content obtained under a
  read grant to a separately granted write scope is permitted only when
  both grants are present; the read grant alone never authorizes the write.

### Typed denials

Denials are typed and catchable, and they fail closed. The complete
required taxonomy is: missing grant; revoked or expired grant; scope
mismatch (including upward traversal and cross-root operations outside the
grant scope); hostile pattern; sensitive-path denial or consent-required;
secret-shaped content refusal; over-bound path, payload, or listing request;
over-rate or over-budget request; safe-mode denial; and unknown trust level
or domain. Denials are oracle-tight: their shape must not vary with
out-of-scope facts, so no denial carries content bytes, foreign
identifiers, or any signal distinguishing absent files from denied files;
where `P0-AC-035` applies, the denial names the level and the family only.
Whether listings suppress denied entries silently or mark them as denied
stays an unresolved question for the security review (suppression leaks
less; marking is more debuggable). Exact error identifiers and wire shapes
belong to the SDK work; this RFC fixes the taxonomy and the no-leak rule.

### No streaming or watch analog

- Every operation is a bounded, self-contained request: no watch, no
  subscription, no tail-follow, no retained handle, no cursor held across
  calls. A caller that wants newer state issues a new bounded request under
  its grant.
- No freshness guarantee and no change notification exist in this family;
  polling that reconstitutes a live view is bounded by the per-plugin rate
  and aggregate budget above.

## Alternatives considered

- **Adopt the sketch verbs verbatim (`open/append/read/list`).**
  Rejected: `open` implies retained cross-call handles against the bounded
  invariant and generation fencing; `append` splits the accepted write
  identifier into unenforced halves; `list` would float without a grant
  home. The reconciliation above keeps the sketch's coverage with none of
  its conflicts.
- **Widen `terminal.*` with filesystem members.**
  Rejected: terminal state and filesystem authority are distinct OQ-085
  domains, and the terminal family is accepted as a closed set. A widened
  member would inherit `terminal.*` grant expectations never reviewed for
  persistent, secret-bearing file content.
- **Grant directory-scoped ambient access (whole home or project tree by
  default).** Rejected: it replaces explicit patterns with an implicit root,
  defeats least privilege, and contradicts the deny-by-default posture the
  file-manager draft already applies to itself.
- **Route file access through per-plugin KV or the settings store as a
  general sink.** Rejected: it bypasses the path-pattern capability model,
  the scope rules, and the secrecy treatment, the same shim the storage and
  history policies forbid.
- **Leave reads and writes to direct host-filesystem access by trusted
  first-party plugins.** Rejected: there is no private first-party bypass;
  the official file manager uses the same public, capability-gated bridge
  as any third-party plugin.
- **Give Wheel direct file operations for project data.** Rejected as a
  requirement: the `.wheel/` contract is declarative-data-only with no hard
  file-operation requirement, so Wheel stays an illustrative mediated-read
  consumer. Direct Wheel file operations would need their own RFC if the
  contract ever requires them.

## Security and compatibility impact

- Threat-model touchpoints: untrusted file bytes crossing into
  plugin-readable state (prompt-injection labeling required above);
  persisted-secret exposure through reads and listings (default-deny
  sensitive paths, secret-shaped refusal, preview-equality);
  scope escape across roots, homes, symlinks, or devices (explicit patterns
  plus hostile-pattern rejection plus typed denials); handle retention used
  as subscription (no `open` verb, no cross-call state); polling
  reconstituted as watch (per-plugin rate plus aggregate budget);
  grant-confusion between read and write (no bundled grants, no implied
  read-back) and beyond the VM (separate authorities for
  copy/spawn/publish/egress); trust-level admission for the `fs` family
  (level x family cells under `P0-AC-035`); and denial oracles (oracle-tight
  no-leak rule, listing-suppression question parked to review).
- P0 gates exercised: `P0-AC-012` (every operation capability-checked),
  `P0-AC-013` (operation faults contained to the calling plugin VM),
  `P0-AC-014` (paths, payloads, listings, rates, and aggregate budgets with
  per-plugin attribution), `P0-AC-015` (no plugin callback on the input,
  parse, or render hot path; operations run against the host filesystem
  boundary, never inline), `P0-AC-024` (Core-attached untrusted labeling on
  every result; read into the VM only with no automatic combination),
  `P0-AC-026` (minimization, redaction, user-only files, preview-equality),
  `P0-AC-030` (new-family requests block updates pending diff approval),
  `P0-AC-035` (trust-level admission for the `fs` family under the
  `filesystem` domain before grant intersection), `P0-AC-036`
  (secret-storage tiers respected), and `P0-AC-009` (argv-first external
  invocation over file content, no shell-string construction).
- Compatibility: v2-only. The v1 Lua surface is frozen; no v1 member is
  altered, aliased, or shadowed by this family, and no `bitty.fs.*` spelling
  exists in v1 to collide with. Any future identifier in this family is
  capability-registry stable from its acceptance, so the acceptance review
  must treat identifier choice as a compatibility decision, not as a
  spelling detail.

## Rollout and adoption

1. Review this draft in `bitty-docs` (this task's PR; no merge claims beyond
   draft status; no `Closes` until accepted).
2. Independent security review of the draft before acceptance: the reviewer
   confirms the family shape preserves the accepted `fs` identifier split,
   the closed `terminal` family, the v1 freeze, the new-root rule, every P0
   gate above, the verb reconciliation, and the prompt-injection labeling
   rule, and dispositions the unresolved questions.
3. On acceptance, the Core host bridge lands the enforcement (grant gate,
   bound enforcement, redaction and labeling, typed denials) under its own
   task with host parity tests.
4. SDK work mints the accepted `bitty.fs.*` spellings with the mock host and
   conformance suite against the accepted contract.
5. File-manager, editor-preview, and Wheel consumers build to parity on the
   SDK surface.
6. Only after host parity evidence exists does any follow-up flip this RFC
   toward acceptance-amendment or a successor revision; acceptance itself
   still authorizes no implementation beyond the reviewed contract.

## Unresolved questions

- What are the exact Lua function signatures, argument orders, and return
  shapes for `read`, `write`, and `list` (parked to the SDK work under the
  capability model)?
- What are the exact default per-call payload caps, listing entry caps,
  operation rates, and aggregate byte budgets, and how do they compose with
  the accepted 4096/32/8KiB ceilings (parked to the Core bridge and SDK
  work; no new ceiling invented here)?
- Does the write grant subdivide by disposition (create versus overwrite
  versus append-mode flag), or stay a single disposition (parked to the Core
  bridge and SDK work; default proposed is a single verb with a flag
  candidate)?
- Do listings suppress denied entries silently or mark them as denied
  (parked to the security review; suppression leaks less, marking is more
  debuggable)?
- What is the exact redaction format and label encoding in read and listing
  results, and how are preview-equality and label preservation tested
  (parked with the accepted storage and history policy owners)?
- Which threat-model matrix cells (every level x `fs`-family admission cell)
  and which `P0-AC-035` update cover this family (owned by the security
  review and the matrix update that must precede acceptance)?
- Does the `.wheel/` contract ever require direct file operations, or does
  mediated host read stay sufficient (owned by the Wheel contract work; this
  RFC assumes the latter and grants nothing to Wheel)?

## Acceptance evidence

This RFC flips from draft to accepted when all of the following are linked
here: independent reviewer APPROVE on the family shape, the verb
reconciliation, the grant/scope/bound rules, the rate and budget rules, and
the denial taxonomy; independent security-reviewer sign-off covering the
threat-model touchpoints, the P0 gates (`P0-AC-035`, `P0-AC-030`,
`P0-AC-024`, and `P0-AC-013` named in scope), the closed-terminal-family and
new-root guarantees, the grant-combination rule, and the prompt-injection
labeling rule; threat-model matrix plus `P0-AC-035` update covering the
`fs` family under the `filesystem` domain, with every level x family
admission cell evidenced; docs-curator APPROVE on taxonomy, links, and
register synchronization; and a disposition (accepted shape or parked owner)
for each unresolved question. Acceptance still authorizes no
implementation: it records the reviewed contract, not shipped behavior.
Host parity tests belong to the Core implementation task that follows
acceptance, and must not be claimed as evidence inside this RFC.

## References

- [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md)
  (accepted): the `fs.read:PATTERN`/`fs.write:PATTERN` identifier rows, the
  deny-by-default rule, and the real-path/symlink/device restriction this
  family inherits.
- [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md)
  (accepted): the frozen v1 surface with no `fs` namespace this RFC stays
  outside of.
- [File-manager design](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/docs/plugins/file-manager/design.md)
  (draft, policy-only): the observation-only listing, navigation, and preview
  policy, the caller-supplied-root scope, and the 8 KiB listing-payload
  precedent this RFC unblocks.
- [Panel history candidate](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-history-candidate.md)
  (draft candidate): the illustrative `bitty.fs.open/append/read/list`
  sketch reconciled here.
- [Core boundaries](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/architecture/core-boundaries.md)
  (accepted): plugins never receive the filesystem directly; filesystem read
  and write constrained by explicit path patterns through host services.
- [ADR 0012](../adrs/ADR-0012-phodopus-runtime.md) (accepted): the `bitty.fs`
  Host ABI slot and the Core-owns-the-bridge boundary this RFC builds on.
- [History Read Surface RFC](RFC-0004-history-read-surface.md)
  (accepted): the draft-to-acceptance pattern (draft, security review,
  acceptance), the NEW-family shape, typed oracle-tight denials,
  untrusted-observation labels, preview-equality, and the read-into-VM-only
  rule this RFC adopts for files.
- [Threat model](../../security/threat-model.md) trust levels and
  capability-domain admission (OQ-085) and [P0 acceptance
  criteria](../../security/p0-acceptance-criteria.md) (`P0-AC-035`,
  `P0-AC-030`, `P0-AC-024`, `P0-AC-013`): the admission matrix and gates
  this family must update and exercise before acceptance.
- [OQ-056](../open-questions.md) (stays open): the v2-scope register this
  draft targets; amended (Issue #439) to name this surface.
- [Issue #439](https://github.com/bitty-terminal/bitty-docs/issues/439)
  (this RFC's task issue).
