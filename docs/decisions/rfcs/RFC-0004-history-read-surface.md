---
title: History Read Surface RFC
description: Accepted contract for a read-only history search and selection plugin capability family with bounded snapshot queries explicit grants and secret-minimizing redaction
category: decisions
audience: contributor
document_type: specification
status: accepted
website_publish: false
sidebar_order: 48
---

# History Read Surface RFC

> Status: **accepted** on 2026-10-04 (W-139 acceptance;
> [issue #430](https://github.com/bitty-terminal/bitty-docs/issues/430)).
> This document is the W-139 successor RFC: it gives the read-only
> history/search/selection plugin surface a documented home. It is an accepted
> contract: it closes no open question, authorizes no shipped behavior, mints no
> capability identifier, and makes no compatibility promise. [OQ-056](../open-questions.md)
> stays open. Acceptance rests on explicit review plus the independent security
> review recorded under Acceptance evidence. Revised 2026-10-04
> per the independent security review NEEDS-FIX (findings F-01..F-08); accepted
> 2026-10-04 after re-review APPROVE with the matrix plus `P0-AC-035` update
> merged (PR #433).

## Problem

The accepted `terminal` capability family is a closed set. Adding a
scrollback/history read capability to it requires a successor RFC with its own
security review plus a host integration, so the SDK minted no surface and the
block is explicit (W-139 BLOCKED, `bitty-plugin-sdk` PR #139; program status
2026-10-03 DEC-W139-1: terminal family closed, successor needs security review
plus host integration).

Concretely, three plugin kinds have no read surface to build on:

- **Search plugins** that query scrollback and command history with bounded,
  attributable results;
- **Copy-mode and selection plugins** that let a user select, copy, and export
  bounded regions of terminal content;
- **History plugins** that persist and query the opt-in transcript and command
  history above the Core event surface.

W-139 (SDK `CTX-0066`: the accepted public history, storage, search, and
selection APIs) waits on this surface, and W-144 (Core deletion of the
retained search/selection behavior) waits on search/copy-mode plugin parity,
which waits on this surface. The chain is blocked at the first link: there is
no reviewable contract for what a plugin may read, under which grant, with
which bounds, and with which secrecy treatment.

## Goals

- Give the read-only history/search/selection surface a documented home in
  shared governance (`bitty-docs`), naming the capability family, the
  queryable sources, the grant shape, the bound shape, and the secrecy
  treatment.
- Keep the closed `terminal` family closed: the surface is a NEW capability
  family, never an extension of `terminal.*`.
- Keep statuses honest: distinguish the accepted storage boundary (W-131), the
  accepted plugin-facing policy (W-137), and this accepted contract, and mark
  every spelling, identifier, and numeric ceiling that stays parked to W-139
  (SDK), W-146 (Core integration), or the security review.
- Name the blocked consumers and the unblocking chain explicitly, so W-139,
  plugin parity, and W-144 each have a named predecessor instead of an
  implied one.
- Define the acceptance path: what review, evidence, and adoption must exist
  before this draft becomes an accepted contract.

## Non-goals

- No capability identifier is minted by this document; adding an identifier
  requires acceptance of this RFC plus the Core host integration that enforces
  it (identifiers are capability-registry stable).
- No `terminal.*` member is widened, reinterpreted, or given a read
  sub-scope here; the v1 surface stays frozen.
- No live streaming, subscription, watch, or tail-follow semantic is granted;
  every read is a bounded snapshot query over already-persisted state.
- No session-snapshot access is granted to plugins; save/restore stays a
  Core-only mechanism per W-137.
- No PTY hook, shell-integration parsing, guessed command boundary, direct
  segment access, SQL, store-internal, or private-database path is granted;
  access is always mediated through the Core event and storage-capability
  surfaces.
- No open question is closed; [OQ-056](../open-questions.md) stays open.
- No shipped, stable, normative, or compatibility-guaranteed behavior is
  claimed for any query, grant, or denial shape.

## Normative sources this proposal must not weaken

This proposal must be read together with, and must not weaken:

- The [security overview](../../security/overview.md),
  the [threat model](../../security/threat-model.md),
  the [risk register](../../security/risk-register.md),
  and the [P0 acceptance criteria](../../security/p0-acceptance-criteria.md).
  The controls that bind this surface include plugin capability checking with
  least privilege (`P0-AC-012`), per-plugin VM isolation and failure
  containment (`P0-AC-013`), resource budgets with attribution (`P0-AC-014`),
  hot-path exclusion (`P0-AC-015`), Terminal Truth ownership (`P0-AC-016`),
  read-only default with untrusted labeling (`P0-AC-024`), trace
  minimization and redaction with user-only files (`P0-AC-026`),
  capability-increase update blocking (`P0-AC-030`), trust-level admission
  before grant intersection (`P0-AC-035`), the secret-storage tiers
  (`P0-AC-036`), and the panel lease write gate (`P0-AC-039`).
- The accepted
  [Storage and History Boundary](../../development/storage-and-history-boundary.md)
  (W-131): the four storage objects stay distinct, no universal database is
  authorized, raw stdout is not persisted by default, capture is opt-in and
  secret-minimizing, input recording is a separate opt-in, no-echo input never
  enters any store, and there is no private first-party bypass.
- The accepted
  [Plugin history and storage policy](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/extensibility/history-and-storage-policy.md)
  (W-137): plugin access modes per object, session snapshots as Core-only with
  no plugin read or write, external history only through a supported CLI or
  API with argv-first validated arguments (`P0-AC-009`), and the
  deny-by-default posture around history and storage capabilities.
- The accepted
  [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md)
  and the [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md):
  v1 is frozen; this surface is v2-only.
- The [threat model](../../security/threat-model.md) trust levels and
  capability-domain admission (OQ-085): levels L0-L4 admit fixed domain sets,
  enforced at the effective-authorization boundary before the grant
  intersection (`P0-AC-035`). This family maps to the `terminal output`
  domain (reads of persisted terminal-derived content) and grants no
  `terminal input`, process, or other domain authority. The matrix and
  `P0-AC-035` must be updated to cover the new family before acceptance
  (see Acceptance evidence).
- The Terminal Truth invariants in `bitty-terminal-docs`: volatile scrollback
  truth stays Core-owned; persistence must never replace, rehydrate over, or
  mutate it; a plugin may alter presentation, never Terminal Truth.
- The accepted
  [IPC and Agent RFC](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/specifications/ipc-agent-rfc.md):
  terminal output is observation data, never instructions. Scrollback content
  returned by any query in this family carries the same treatment: untrusted
  content, labeled as such, never an instruction to the plugin host, an agent,
  or a tool.

Where a control or threshold appears to need change, it is recorded under
"Unresolved questions" instead.

## Terminology

- **Core**: the always-available terminal mechanism that works with zero
  plugins and in `bitty --safe`; it owns Terminal Truth, the event source,
  the capability gate, and resource budgets.
- **Snapshot query**: a single bounded read over already-persisted history
  state that returns a redacted, truncated result and then ends. It has no
  subscription, no cursor held across calls, and no live tail.
- **Queryable source**: one of the three W-131 objects this family may read:
  the segmented transcript, command history, or per-plugin KV (own namespace
  only). Session snapshots are not a queryable source.
- **Explicit grant**: a per-plugin, per-source capability grant recorded by
  the Core gate, carrying explicit scope parameters with no wildcard
  default; absence of a grant, or a query scope outside the grant scope,
  denies fail-closed.
- **Typed denial**: a catchable, machine-readable denial naming its reason
  from the complete taxonomy (missing grant, revoked or expired grant,
  scope mismatch, over-bound or over-rate request, capture-disabled source,
  safe-mode denial, unknown trust level or domain, purged or expired
  content) without leaking out-of-scope identifiers, content bytes, or
  retention-existence signals.
- **Candidate**: a proposal that is not decided; candidate status is not
  acceptance and is not implementation.

## Proposed contract

The family is a NEW read-only capability family beside `terminal.*`, owned by
Core enforcement with SDK spellings. Its invariant, in one sentence: **a
granted plugin may ask bounded snapshot questions of the three queryable
sources and receive redacted, truncated, attributed answers, or a typed
denial; it may never open a stream, poll its way into one, widen a scope,
touch Terminal Truth, or read what was never persisted.**

### Capability family

- The family is new and read-only. It shares no identifier prefix with
  `terminal.*`, and no `terminal.*` member gains a read sub-scope, alias, or
  widened interpretation through this document.
- Every member is deny-by-default: without an explicit per-plugin grant
  recorded by the Core gate, every query denies fail-closed with a typed
  denial. Grants never bundle sources: a grant names the source it covers,
  and a history grant never implies a transcript grant.
- Exact identifiers, the manifest grammar that declares them, and grant
  storage and revocation mechanics belong to W-139 (SDK) under the
  capability model; this RFC fixes only the family shape and the
  deny-by-default rule.
- No family member is spelled under the `bitty.terminal.*` Lua root, and no
  `terminal.*` spelling reads this family's sources; SDK spellings for the
  family (W-139) live under a NEW root. The new-root requirement is family
  invariant; exact member names stay parked to W-139.
- The family maps to the OQ-085 `terminal output` capability domain: reads
  of persisted terminal-derived content. It grants no `terminal input`,
  process, filesystem, clipboard, or other domain authority, and a grant in
  one domain never implies authority in another.

### Grants, scopes, and migration

- Every grant carries explicit scope parameters (source and panel/workspace
  extent). There is no wildcard or `all` default; an unscoped grant request
  denies.
- A query carries its own scope and is authorized only when the query scope
  intersects the grant scope; otherwise Core denies with a typed
  scope-mismatch denial. The intersect rule is family invariant, not parked
  spelling.
- No grant migration in either direction: a `terminal.*` grant never implies
  a grant in this family, and a grant in this family never implies a
  `terminal.*` grant. A plugin update that newly requests this family is a
  capability increase and blocks pending the explicit permission-diff
  approval gate (`P0-AC-030`).

### Snapshot queries

- Every read carries an explicit row range and explicit count and size caps,
  enforced by Core before any content is touched. Over-bound requests are
  denied with a typed denial; Core never clamps silently into a partial
  answer that the caller could mistake for a complete one.
- Queries are snapshots, never streams: no subscription, no watch, no
  tail-follow, no cursor held across calls. A caller that wants newer state
  issues a new bounded query under its grant.
- Core enforces a per-plugin query rate and an aggregate result budget,
  attributed per plugin (`P0-AC-014`); polling that would reconstitute a
  live stream denies with a typed over-rate or over-budget denial. Exact
  rates and quotas stay parked with the other ceilings (no new ceiling
  invented here).
- Queries carry no freshness guarantee: every result is a point-in-time
  snapshot and may be stale. No live-ness, recency, or change-notification
  promise exists in this family.
- Result records carry attribution (panel, workspace, command, timing, actor
  where the source records it) and are redacted and truncated per the
  secrecy treatment below. Numeric ceilings reuse the accepted W-131 and
  W-137 bounds (per-panel and per-store byte and age caps, command-count and
  byte bounds, the published plugin-store ceilings); no new numeric ceiling
  is invented here, and exact values and defaults stay parked to W-137,
  W-139, and W-146.

### Queryable sources

| Source               | Plugin read mode                                                                                                                            | Never granted                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Segmented transcript | Scoped, bounded snapshot reads over sealed segments while opt-in capture holds; a rebuildable index is never the store of record            | PTY hook, shell-integration parsing, guessed command boundaries, direct segment or byte-handle access |
| Command history      | Scoped list, search, get, and tail reads with explicit scope and result bound; dangling external references surface as typed unavailability | SQL or store internals, cross-panel reads without matching scope, private external-database access    |
| Per-plugin KV        | Reads of the plugin's own namespace only, under the published quota ceilings                                                                | Cross-plugin reads, terminal-derived content stored or read as a KV shim around the history path      |

Session snapshots are absent from this table deliberately: save/restore is a
Core mechanism that must work with zero plugins and in safe mode, and no
plugin may gate, read, or mutate a snapshot (W-137).

### Secrecy treatment

- Secret-minimizing per W-131: sensitive terminal-derived content is
  persisted only on the opt-in history path, recording input is a separate
  opt-in, and no-echo input never enters grid, scrollback, snapshot, trace,
  or any query result.
- Redaction composes with ADR 0006 and the security corpus from the start:
  query results return redacted and truncated records, export-preview
  equality holds (what a preview shows is what an export carries), and the
  exact redaction format stays parked to W-137 as W-131 already records.
- Every record carries a Core-attached, typed untrusted-observation label
  that survives redaction, truncation, and attribution: a plugin, agent, or
  tool that consumes query results must treat them as content under the
  prompt-injection rule, and the host forbids executing, interpolating, or
  routing labeled content into an instruction channel without a separately
  granted authority outside this family (exercises `P0-AC-024`; evidence is
  labeling asserted in results plus channel-separation audit).
- Grant-combination rule: reading under this family authorizes delivery of
  results into the plugin VM only. Copying to the clipboard, exporting to
  files, spawning processes, or invoking external history systems each needs
  its own separately granted authority (`clipboard.write`-class,
  filesystem, process); the family grant never implies them. External
  history adapters stay argv-first with validated arguments and no
  shell-string construction or interpolation (`P0-AC-009`).

### Typed denials

Denials are typed and catchable, and they fail closed. The complete
required taxonomy is: missing grant; revoked or expired grant; scope
mismatch (including cross-panel or cross-workspace reads outside the grant
scope); over-bound or over-rate request; capture-disabled source (opt-in
off); safe-mode denial; unknown trust level or domain; and purged or
expired content, which surfaces as typed unavailability, never as a silent
gap and never by resurrecting bytes from a derived index. Denials are
oracle-tight: their shape must not vary with out-of-scope facts, so no
denial carries content bytes, foreign identifiers, or any signal
distinguishing absent content from denied content; where `P0-AC-035`
applies, the denial names the level and the family only. Exact error
identifiers and wire shapes belong to W-139; this RFC fixes the taxonomy
and the no-leak rule.

## Alternatives considered

- **Widen `terminal.*` with a read member (for example a scrollback or
  history read under the terminal prefix).** Rejected: the terminal family
  is accepted as a closed set, and widening it breaks the closed-set
  guarantee that manifest validation, grant intersection, and the
  capability-denial matrix enforce. A widened member would also inherit
  `terminal.*` grant expectations that were never reviewed for persisted,
  secret-bearing content.
- **Grant a full PTY mirror or live output tap to history-class plugins.**
  Rejected: a live tap leaks volatile Terminal Truth to plugin code,
  reintroduces a plugin observer onto the parse path against `P0-AC-015`,
  and bypasses the opt-in, secret-minimizing persistence boundary that
  W-131 accepts. Search, copy-mode, and history UX all function over
  bounded snapshots; nothing in their scope needs the live bytes.
- **Route history reads through per-plugin KV as a general sink.**
  Rejected: it bypasses the opt-in history path, the capability model, and
  the store ceilings, exactly the shim W-131 and W-137 forbid.
- **Leave reads to direct database or file access by trusted first-party
  plugins.** Rejected: there is no private first-party bypass; the official
  history keeper uses the same public, capability-gated API as any
  third-party plugin.

## Security and compatibility impact

- Threat-model touchpoints: untrusted PTY and scrollback content crossing
  into plugin-readable state (prompt-injection labeling required above);
  persisted-secret exposure through transcript and history reads (opt-in,
  redaction, and export-preview equality); scope escape across panels,
  workspaces, or plugin identities (per-source grants plus typed denials);
  budget exhaustion through unbounded queries (Core-enforced ranges and
  caps); polling reconstituted as streaming (per-plugin rate plus aggregate
  budget, no freshness guarantee); grant-confusion between sources (no
  bundled grants) and beyond the VM (separate authorities for
  copy/export/invocation); trust-level admission for the new family (level
  x family cells under `P0-AC-035`); and denial oracles (oracle-tight
  no-leak rule).
- P0 gates exercised: `P0-AC-012` (every query capability-checked),
  `P0-AC-013` (query faults contained to the calling plugin VM),
  `P0-AC-014` (ranges, counts, sizes, rates, and aggregate budgets with
  per-plugin attribution), `P0-AC-015` (no plugin callback on the input,
  parse, or render hot path; queries run over persisted state),
  `P0-AC-016` (Terminal Truth untouched by reads), `P0-AC-024`
  (Core-attached untrusted labeling on every record; read-only default with
  no automatic combination), `P0-AC-026` (minimization, redaction,
  user-only files, export-preview equality), `P0-AC-030` (new-family
  requests block updates pending diff approval), `P0-AC-035`
  (trust-level admission for the new family under the `terminal output`
  domain before grant intersection), `P0-AC-036` (secret-storage tiers
  respected), `P0-AC-039` (lease-gated writes stay outside this read-only
  family), and `P0-AC-009` (argv-first external history invocation, no
  shell-string construction).
- Compatibility: v2-only. The v1 Lua surface is frozen; no v1 member is
  altered, aliased, or shadowed by this family. Any future identifier in
  this family is capability-registry stable from its acceptance, so the
  acceptance review must treat identifier choice as a compatibility
  decision, not as a spelling detail.

## Rollout and adoption

1. Review this draft in `bitty-docs` (this task's PR; no merge claims beyond
   draft status; no `Closes` until accepted).
2. Independent security review of the draft before acceptance: the reviewer
   confirms the family shape preserves the W-131 and W-137 boundaries, the
   closed `terminal` family, every P0 gate above, and the
   prompt-injection labeling rule, and dispositions the unresolved questions.
3. On acceptance, Core host implementation lands the enforcement (grant
   gate, bound enforcement, redaction and truncation, typed denials) under
   its own task with host parity tests.
4. SDK work (W-139, `CTX-0066`) mints the accepted public history, storage,
   search, and selection APIs with the mock host and conformance suite
   against the accepted contract.
5. Search, copy-mode, and history plugins build to parity on the SDK
   surface; only then does W-144 delete the retained Core behavior.
6. Only after host parity evidence exists does any follow-up flip this RFC
   toward acceptance-amendment or a successor revision; acceptance itself
   still authorizes no implementation beyond the reviewed contract.

## Unresolved questions

- Which exact capability identifiers name the family members, and what
  manifest grammar declares them (parked to W-139 under the capability
  model)?
- What are the exact default count, size, rate, and aggregate caps per query
  kind, and how do they compose with the accepted per-panel, per-store, age,
  and plugin-store ceilings (parked to W-137, W-139, and W-146; no new
  ceiling invented here)?
- What is the exact redaction format and label encoding in persisted history
  and query results, and how are export-preview equality and label
  preservation tested (parked to W-137 per the W-131 open point, with
  W-139 owning the wire encoding)?
- How do cross-object correlation and dangling external references behave
  across expiry, deletion, and provider removal in query results (parked to
  W-137)?
- Does the accepted session-snapshot exit-write default need any change in
  light of this read family (owned by the security review and W-146; this
  RFC proposes no change and grants no snapshot access)?
- Which threat-model matrix cells (every level x new-family admission cell)
  and which `P0-AC-035` update cover this family? Disposition (accepted
  2026-10-04): satisfied by PR #433 (merged as commit `48b60c4`) — the
  history-read family admission subsection under the `terminal output` domain
  with every L0-L4 x family admission cell plus the `P0-AC-035` history-read
  scope; exact identifiers stay parked to W-139.

## Acceptance evidence

This RFC flips from draft to accepted when all of the following are linked
here: independent reviewer APPROVE on the family shape, source table,
grant/scope/migration rules, rate and budget rules, and denial taxonomy;
independent security-reviewer sign-off covering the threat-model
touchpoints, the P0 gates (`P0-AC-035`, `P0-AC-030`, `P0-AC-024`, and
`P0-AC-013` named in scope), the closed-family and new-root guarantees,
the grant-combination rule, and the prompt-injection labeling rule;
threat-model matrix plus `P0-AC-035` update covering the new family under
the `terminal output` domain, with every level x new-family admission cell
evidenced; docs-curator APPROVE on taxonomy, links, and register
synchronization; and a disposition (accepted shape or parked owner) for
each unresolved question. Acceptance still authorizes no
implementation: it records the reviewed contract, not shipped behavior.
Host parity tests belong to the Core implementation task that follows
acceptance, and must not be claimed as evidence inside this RFC.

Accepted 2026-10-04 (W-139 acceptance,
[issue #430](https://github.com/bitty-terminal/bitty-docs/issues/430)):
independent security review APPROVE after the NEEDS-FIX revision (findings
F-01..F-08 resolved in `fed7560`; provenance CarryCtx note PX-0916 on
CTX-0276; full text in workspace
`recording/handoff-2026-10-02/rfc0004-security-review.md`); independent
acceptance review ACCEPT; docs-curator APPROVE; threat-model matrix plus
`P0-AC-035` update covering the new family under the `terminal output`
domain with every level x new-family admission cell evidenced, merged as
[PR #433](https://github.com/bitty-terminal/bitty-docs/pull/433) (commit
`48b60c4`). UQ #6 is satisfied by the #433 merge (see disposition above).

## References

- Commander decision DEC-W139-1 and the W-139 block record in the workspace
  `recording/handoff-2026-10-02/program-status-2026-10-03.md` program status
  (2026-10-03): the `terminal` family is a closed set; the successor needs
  security review plus host integration; the chain is RFC-0004 accepted,
  then Core host implementation, then SDK `CTX-0066`, then
  search/copy-mode plugin parity, then W-144 deletion.
- [Storage and History Boundary](../../development/storage-and-history-boundary.md)
  (W-131, accepted): the four storage objects, ownership, lifecycle,
  budgets, default-persistence posture, and public contract shapes this
  family reads through but does not redefine.
- [Plugin history and storage policy](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/extensibility/history-and-storage-policy.md)
  (W-137, accepted): the plugin-facing access modes, the Core-only session
  snapshot rule, and the deny-by-default posture this family inherits.
- [OQ-056](../open-questions.md) (stays open): the v2-scope register this
  draft targets; amended 2026-10-04 (Issue #430) to name this surface.
- [Threat model](../../security/threat-model.md) trust levels and
  capability-domain admission (OQ-085) and [P0 acceptance
  criteria](../../security/p0-acceptance-criteria.md) (`P0-AC-035`,
  `P0-AC-030`, `P0-AC-024`, `P0-AC-013`): the admission matrix and gates
  this family must update and exercise before acceptance.
- [Issue #430](https://github.com/bitty-terminal/bitty-docs/issues/430)
  (this RFC's task issue).
