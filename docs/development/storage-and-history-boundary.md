---
title: Storage and History Boundary
description: Draft reconciliation of the segmented transcript command history session snapshots and per-plugin KV ownership lifecycles retention budgets and public contract shapes
category: development
audience: contributor
document_type: specification
status: draft
website_publish: true
sidebar_order: 26
---

# Storage and History Boundary

## Document status

Draft. This document is the `W-131` reconciliation deliverable for the
restricted-storage boundary that [ADR 0016](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md)
accepted in direction and gated on `W-131`. It reconciles the four storage
objects named by the bootstrap fence - segmented transcript, command history,
session snapshots, and per-plugin key-value (KV) state - and proposes their
ownership, lifecycle, retention and deletion rules, budgets, default-persistence
posture, and high-level public contract shapes.

This document does not accept the storage boundary, does not accept any
candidate contract, does not authorize implementation, and does not describe
implemented behavior. The `bitty-storage` repository and the Panel History
candidate remain candidate or planned artifacts; candidate status stays
candidate until an owning task accepts it through independent review. Every
ownership statement here is a proposed direction until the `W-131` reconciliation
is reviewed and accepted; no storage object is authoritative yet. Frontmatter
`status` is `draft` per the repository metadata schema.

- Owning task: `W-131` (bitty-docs), CarryCtx `CTX-0267`, Issue
  [bitty-docs#405](https://github.com/bitty-terminal/bitty-docs/issues/405).
- Predecessor decision:
  [ADR 0016 - Execution, Graphics, Accessibility, Storage, and Platform-Service Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md)
  (Boundary 4, binding constraints 8 and 9).
- Related:
  [ADR 0015 - Small-Core Extraction Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md),
  [ADR 0013 - Core Ontology and Identity Model](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0013-core-ontology-identity.md),
  [ADR 0008 - Headless Daemon, Detach/Reattach and Remote UI Trust Boundary](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0008-headless.md),
  and the [small-core refactor handoff](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/handoff/2026-10-02-small-core-refactor.md).
- Downstream owners named but not decided here: `W-137`
  (bitty-plugins-docs), `W-139` (bitty-plugin-sdk), and `W-146`
  (bitty / `CTX-0939`).

## Purpose and scope

This specification reconciles the history and storage scope before the
restricted-storage boundary can be authoritative. It fixes one ownership and
lifecycle model for four already-named objects that have different lifecycles,
different sensitivity, and different budgets, so no single unreviewed database
is allowed to absorb them.

In scope:

- the ownership split for each of the four storage objects: Core, the proposed
  extracted storage component (candidate name `bitty-storage`, currently only a
  metadata-only scaffold repository with no implemented API), and the
  plugin history/keeper role;
- the lifecycle, retention and deletion rule, budget or bound, default
  persistence posture, and high-level public contract shape of each object;
- what Core retains when persistent-store mechanics move out, and what may move;
- the downstream owners of the plugin-facing policy (`W-137`), the SDK surface
  (`W-139`), and the Core integration (`W-146`);
- the negative-path, privacy, and generation evidence that any later
  implementation must produce.

Out of scope and not decided here:

- exact API spellings, trait and wire shapes, manifest fields, schema and
  storage formats, segment seal bounds, retention defaults, quota constants
  beyond the already-published plugin-store ceilings, and migration mechanics;
- the choice of crate, out-of-process worker, or repository shape for the
  storage boundary, which belongs to the `W-131`/`W-137` scope and the focused
  contracts;
- repository creation for `bitty-storage` or the `history` plugin, and any
  implementation or migration;
- the AI session, context, and memory export model, which is owned on the
  `bitty-ai-docs` side and composes with, but is not redefined by, this document.

Nothing here weakens a normative security control. Where a control or threshold
appears to need change, it is recorded under "Open points" instead.

## Normative sources this specification must not weaken

This reconciliation must be read together with, and must not weaken:

- The [security overview](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/security/overview.md),
  the [threat model](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/security/threat-model.md),
  the [risk register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/security/risk-register.md),
  and the [P0 acceptance criteria](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/security/p0-acceptance-criteria.md).
  The controls that bind this boundary include Terminal Truth ownership
  (`P0-AC-016`), plugin capability checking and hot-path exclusion
  (`P0-AC-012`, `P0-AC-015`), resource budgets (`P0-AC-014`), safe mode
  (`P0-AC-019`), trace minimization and redaction with user-only files
  (`P0-AC-026`), the secret-storage tiers (`P0-AC-036`), and the panel
  lease write gate (`P0-AC-039`).
- The [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md),
  the [Plugin Host Runtime RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/plugin-host-runtime-rfc.md),
  the [Isolation and Resource RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/isolation-resource-rfc.md),
  and the accepted [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md).
  The published `bitty.store` ceilings and the atomic-commit rule stay
  authoritative.
- The [Terminal state and action invariants](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/terminal-state-rfc.md)
  and the [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md):
  volatile scrollback truth, monotonicity, save/restore semantics, and the
  Event Bus contract are not reopened.
- The accepted [IPC and Agent RFC](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/specifications/ipc-agent-rfc.md):
  agent read-only default and the rule that terminal output is observation data,
  never instructions.
- ADR 0016 binding constraints 8 and 9: history is opt-in, secret-minimizing,
  and bounded; OSC 133 is not proof of a command or a cwd; Atuin integration
  uses the supported CLI or API, never private database access; and the four
  storage objects stay distinct, so no candidate text authorizes a universal
  database or raw stdout persistence by default.

## Terminology

- **Core**: the always-available terminal mechanism that works with zero
  plugins and in `bitty --safe`; it owns Terminal Truth, permission and resource
  enforcement, and identity/generation fencing.
- **Extracted storage component**: the proposed persistent-store mechanics
  behind the restricted-storage boundary (candidate name `bitty-storage`), which
  exists today only as a metadata-only scaffold and may move out of Core only
  after this reconciliation accepts the scope.
- **Terminal Truth**: parser state, grid semantics, cursor state, modes, and
  canonical scrollback; volatile and Core-owned. Plugins may alter presentation,
  never Terminal Truth.
- **Segmented transcript**: the append-only, segment-sealed record of ordered
  panel and terminal events and output for a panel, from which command history
  and exports are derived; the canonical byte log, distinct from any searchable
  index.
- **Command history**: the structured record of commands - command text,
  working directory, timestamps, duration, exit code, actor, and an optional
  external reference - as a small, indexable, independently retained object
  distinct from raw output.
- **Session snapshot**: the versioned, bounded save/restore capture of workspace
  slots, layout, focus, most-recently-used order, and bounded per-pane
  scrollback plus a captured `OSC 7` working directory. It is not the AI
  session/context store, and it is not the live `bitty.terminal.snapshot`
  bridge read.
- **Per-plugin KV**: the plugin-scoped, quota-bounded persistent key-value state
  exposed as `bitty.store`, distinct from `bitty.settings` and granting no
  filesystem authority.
- **Default persistence**: whether a storage object's content is written to disk
  as a side effect of normal use, without an explicit user or plugin opt-in.
  Under this specification, sensitive terminal-derived content is not written by
  default, except the accepted bounded session snapshot written on normal
  interactive exit (see the open point below).
- **Generation fencing**: the rule that semantic assignment generation is
  distinct from execution generation, and that the host rejects a stale handle
  itself rather than trusting the caller.
- **Parked**: explicitly deferred with a named reason and an owning task; a park
  is not acceptance and reserves no interface.
- **Candidate**: a proposal that has not been decided; candidate status is not
  acceptance and is not implementation.

## The four storage objects

The four objects are different objects with different owners, lifecycles,
sensitivities, and budgets. They must not be merged into one universal database
or one shared store, and none may become the default sink for raw terminal
output.

| Storage object       | Owner (contract and policy)                                                                                   | Store mechanics                                                                                      | Lifecycle                                                                                                                                                                                                                               | Retention and deletion                                                                                                                           | Persists by default                                                                                                 | Budget or bound                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Segmented transcript | History plugin (`history`, candidate) under plugin-facing policy fixed by `W-137`; Core owns the event source | Proposed extracted `bitty-storage` mechanics after `W-131` acceptance                                | Created only while opt-in capture is enabled for a panel; segments seal and roll; active capture ends at purging or uninstalling the plugin or at panel close per policy, and retained history is not deleted merely by closing a panel | Retention by age and size with sealed-segment deletion; explicit purge is authoritative and must remove bytes; no resurrect from a derived index | No; raw stdout and PTY bytes are not persisted without explicit opt-in                                              | Per-panel and per-store byte and age caps; bounded sealed-segment size; compression; no unbounded growth                             |
| Command history      | History plugin under policy fixed by `W-137`; Core owns the event source, and `OSC 133` is advisory only      | Proposed extracted `bitty-storage` mechanics for the bytes and rebuildable index                     | Appended per command boundary while capture is enabled; small and long-lived; external links may dangle after provider removal                                                                                                          | Explicit purge or uninstall; age and count bounds; dangling external references surface as typed unavailability, never as silent gaps            | No; capture is opt-in, and recording input is a separate opt-in                                                     | Command-count, age, and byte bounds; commands-only is the least sensitive tier; optional output tier stays bounded and separate      |
| Session snapshots    | Core, under the Restore/Persistence separation in ADR 0013 and the Panel Runtime save/restore rules           | Core save/restore path; storage mechanics may move only if restore re-derivation stays Core          | Written by Core on normal interactive exit; read on restore; volatile structure is re-derived on load and fails closed to a clean start                                                                                                 | Replaced by the next exit save; deletion removes the session file; safe mode never reads it; restore never writes                                | Yes for bounded scrollback and cwd on normal interactive exit (open point below); never under safe or headless mode | Versioned whole-file bound; bounded per-pane scrollback and captured metadata; atomic temp-plus-rename                               |
| Per-plugin KV        | `bitty-plugin-host` Lua host service (Core); SDK surface fixed by `W-139`, plugin-facing policy by `W-137`    | Core host service today; mechanics may move to `bitty-storage` while the contract stays with the SDK | Plugin-scoped and generation-independent: values committed before a generation is disposed remain readable by the next generation                                                                                                       | Deleted only by uninstall, an explicit `nil` write, or an explicit user purge; no expiry and no eviction by construction                         | Only plugin-authored writes; not a default sink for terminal output or secrets                                      | Published plugin-store ceilings: 256 KiB total per plugin, 8 KiB per value, depth 8, 1024 nodes; atomic commit with no partial write |

### Segmented transcript

The segmented transcript is the append-only canonical log of what happened in a
panel. Core already observes PTY output, input, working directory, process
lifecycle, exit codes, and panel and workspace identity, so it can emit events
cheaply; a plugin must never hook the PTY itself, parse shell integration, or
guess command boundaries. The history plugin owns persistence policy above the
Core event and storage-capability surfaces. The transcript is the object most
likely to grow and the most sensitive when it carries raw output, so it is
opt-in, bounded, and compressible, and it never persists raw output by default.

### Command history

Command history is the small, structured, indexable object. It is derived from
the same event stream but retained separately, so a user can keep commands for
years without keeping raw output. Core's `OSC 133` semantic markers are an
advisory command-boundary signal, not proof of a command or of the working
directory; a structured record is asserted only from Core-observed facts plus
the declared shell-integration evidence. Where a structured query index exists,
it is a rebuildable index over the canonical transcript or command log, never
the store of record, and it never grants direct database access to plugins or
agents.

### Session snapshots

Session snapshots are the bounded save/restore capture owned by Core under the
Restore/Persistence separation. On a normal interactive exit, Core writes a
session file under the XDG state root; it captures a bounded per-pane scrollback
and the captured working directory, is versioned, and is written atomically with
user-only file permissions. Safe mode never reads or writes a session snapshot,
and headless exits skip it. Restoring re-derives volatile structure from the
snapshot; persistence never happens as a side effect of restore, and no secret,
history, or environment payload is captured implicitly. A snapshot must never
replace or mutate the volatile Terminal Truth structure; it is a serialized,
versioned artifact that is validated before any mutation and fails closed to a
clean start on mismatch.

The accepted exit-write behavior persists bounded scrollback text and the working
directory in plaintext, which can include sensitive material typed into or
printed by a command. This is an open point for the security review: whether the
exit-write default should remain as accepted, or whether sensitive scrollback
should move behind an explicit opt-in (with an owner, migration path, and
security impact) is not decided here. The AI session, context, and memory stores
are separate and compose with this object by reference rather than by
duplication.

### Per-plugin KV

Per-plugin KV is plugin-authored persistent state, scoped by plugin identity and
not by generation. It is a bounded sandbox surface, not generic filesystem
authority: the plugin never learns which backend serves the data, and neither
`bitty.store` nor `bitty.settings` grants a path or a handle. Because a plugin
chooses its own keys and values, the plugin is responsible for not storing
unredacted secrets; terminal output and other terminal-derived sensitive content
must travel through the opt-in history path, never through KV as a shim. A
plugin's KV data survives a generation disposal and is removed only by uninstall,
an explicit `nil` write, or an explicit user purge.

## Public contract shapes

The shapes below are high-level directions, not interfaces. Exact spellings,
schemas, and bounds belong to `W-137`, `W-139`, and `W-146`.

- **Segmented transcript**: append-only event records plus scoped, bounded read
  and export operations; a rebuildable index is optional and never authoritative;
  all access is mediated, and no plugin or agent opens a store file, a database,
  or a native library directly.
- **Command history**: bounded, scoped reads - list, search, get, output, and
  tail - that each carry an explicit scope and result bound, return redacted and
  truncated records with attribution, and never expose SQL or store internals. A
  record identifies the panel, workspace, command, working directory, timing,
  exit code, actor, and an optional opaque external reference to another
  history system. External systems such as Atuin are reached through their
  supported CLI or API, never by reading a private database, and any such
  invocation is argv-first with validated arguments and no shell-string
  construction or interpolation (`P0-AC-009`).
- **Session snapshots**: a versioned snapshot artifact with an explicit format
  version, written atomically by Core on normal interactive exit to one bounded
  location under the XDG state root, validated as a whole before restore mutates
  anything, and failed closed to a clean start when validation fails. Safe mode
  neither reads nor writes the artifact.
- **Per-plugin KV**: a synchronous, quota-bounded `get`/`set` surface over
  JSON-compatible plain data, with a bounded key grammar, typed and catchable
  denials (invalid key, invalid value, quota, timeout), an explicit `nil`
  deletion, and atomic commits that leave the previous state intact when denied.
  The surface grants no filesystem authority, and terminal-derived content is
  out of scope for it.

## What Core retains

Whatever moves, Core retains the following mechanisms and rules:

- **Volatile Terminal Truth.** The current screen and the in-memory scrollback
  behind `PageUp`, wheel, and search die with the panel. Persistence must never
  replace, rehydrate over, or mutate that Core structure, and a restore path
  must re-derive volatile structure instead of writing through it.
- **Permission and resource budgets.** Core owns the capability gate and the
  resource budgets that bound any store or transcript, so an extracted component
  or a plugin gains no authority by moving code out of Core.
- **Identity and generation fencing.** The host rejects a stale handle itself;
  execution generation stays distinct from assignment generation; and
  plugin-scoped state never confers execution authority.
- **Opt-in, secret-minimizing persistence.** Sensitive output is not persisted by
  default; recording input is a separate opt-in; clipboard and raw environment
  data are absent by default; files carry user-only permissions; and input while
  a target PTY is in no-echo mode never enters grid, scrollback, a snapshot, a
  trace, or an agent observation. The session snapshot's bounded scrollback and
  captured cwd are the one accepted exception: Core writes them on normal
  interactive exit (see the open point below), and safe and headless runs write
  nothing.
- **No projection on the Event Bus.** Derived or persisted projections are not
  published cross-panel on the Event Bus; exposing one panel's content must not
  become a cross-panel read path for plugins.
- **Event and capability surfaces, not a database.** Core keeps the event
  generation and the storage-capability API; the history and transcript policy
  live above it. Core takes no `rusqlite`/`libsqlite3` dependency as a
  consequence of this boundary; a dependency change stays with the ADR 0004
  owners.
- **Distinct objects and no private bypass.** The four objects stay distinct, the
  public capability-gated API is the only path, and there is no private
  first-party bypass for the official history plugin or any other first-party
  component.

## What may move to the extracted storage component

Only after this reconciliation is accepted may the following persistent-store
mechanics move to the proposed `bitty-storage` component:

- the append-only segmented log, segment sealing and compression, and a
  rebuildable index over it;
- retention, compaction, deletion, and purge execution, including the evidence
  that deletion removes bytes;
- schema versioning and migration, and crash-recovery mechanics;
- the mediated plugin-facing store and sandboxed filesystem surface
  implementation.

The extracted component does not acquire authority by its location. Core still
owns the capability gate, the budgets, generation fencing, session restore
re-derivation, and the rule that the four objects stay distinct. Whether the
component is a crate, an out-of-process worker, or another shape is decided by
the focused contract, not by this document.

## Downstream ownership

This reconciliation fixes who owns the remaining decisions; it does not decide
their content.

- **`W-137` (bitty-plugins-docs)** owns the plugin-facing history and storage
  policy and the plugin page sets: capability grammar for history and storage,
  retention and deletion policy presented to users, storage-surface policy, and
  the per-plugin pages for the history keeper. The `bitty-plugins-docs` owner
  answers it.
- **`W-139` (bitty-plugin-sdk)** owns the accepted public history, storage,
  search, and selection APIs, the mock host, and the conformance suite, after
  `W-135`, `W-137`, and `W-138`. The `bitty-plugin-sdk` owner answers it.
- **`W-146` (bitty, CarryCtx `CTX-0939`)** owns the Core integration that
  preserves volatile Terminal Truth while adopting the accepted storage
  boundary. The `bitty` owner answers it.
- The extraction and verification tasks (`W-140` through `W-145`, `W-147`) and
  the `bitty-storage` repository tasks follow their own contracts; none may start
  while this reconciliation is unaccepted.

## Security review

Persistent transcript, command history, session snapshots, and plugin KV all
touch trust boundaries that the security overview governs. Independent security
review is required before this reconciliation merges. The reviewers must confirm
that every retained mechanism and every proposed ownership preserves ADR 0016
binding constraints 8 and 9, that no object is persisted by default when it
carries sensitive terminal-derived content except the accepted bounded session
snapshot on normal exit (which the reviewer must assess against the open point
above), that no new private first-party bypass or ambient filesystem authority
is introduced, that the four objects stay distinct, and that no later focused
contract may weaken a P0 control. The
focused contracts `W-137`, `W-139`, and `W-146` each require security review
again before their own merge.

## Verification plan

This is a reconciliation specification; it has no executable verification of its
own. Any later implementation of the boundary must prove, at minimum:

1. **Deletion removes data.** Purging or expiring a transcript, command-history
   entry, session snapshot, or KV entry removes the original bytes and any
   derived index entry; a post-purge export or query returns nothing, and a
   rebuildable index cannot resurrect deleted content.
2. **Sensitive output is not persisted by default.** A seeded-secret corpus never
   appears in default persisted output except within the accepted bounded session
   snapshot on normal exit (whose sensitivity the security review assesses);
   raw stdout requires the separate opt-in; recording input is off by default;
   and no-echo input never reaches any store, snapshot, or trace. A session
   snapshot written on exit carries only bounded scrollback and captured cwd,
   never recorded input, clipboard, or raw environment data.
3. **Scope escape is denied.** A plugin cannot read another plugin's KV; a
   storage or sandboxed-filesystem path that escapes its scope, including upward
   traversal and absolute paths, is denied; and a cross-panel or cross-workspace
   read without the matching scope is denied fail-closed.
4. **Generation fencing holds.** A stale execution or assignment handle is
   rejected by the host itself, and plugin KV remains plugin-scoped across
   generation disposal without granting cross-identity reads.
5. **Budgets and denials are atomic.** An over-budget or over-depth value is
   denied with the previous state intact and no eviction; the published store
   ceilings hold exactly.
6. **Recovery is deterministic.** An interrupted segment write or commit never
   corrupts the store, and a restore validates the whole snapshot before any
   mutation and fails closed to a clean start on mismatch.
7. **Safe mode stays clean.** `bitty --safe` starts with zero third-party
   plugins and reads no transcript, command history, session snapshot, or plugin
   KV.
8. **Objects stay distinct.** No single universal database or shared store
   conflates the four objects, and each keeps its own namespace, retention, and
   lifecycle.
9. **No private first-party bypass.** The official history keeper uses the same
   public, capability-gated API as any third-party plugin.
10. **External history adapters use validated arguments.** Any supported-CLI or
    API path to an external history system (for example Atuin) is argv-first with
    validated arguments and no shell-string construction or interpolation
    (`P0-AC-009`).
11. **Documentation gates pass.** The repository-local `just check` passes with
    zero issues.

## Alternatives considered

| Alternative                                                           | Disposition                                                                                                                                                                                                                      |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One universal database or single store for all four objects           | Rejected: ADR 0016 binding constraint 9 keeps the objects distinct; their lifecycles, sensitivity, and budgets differ, and a single store invites raw stdout persistence by default.                                             |
| Keep all persistence mechanics inside Core                            | Rejected: it contradicts DIR-001 and leaves optional behavior in the small core. Core retains Terminal Truth, budgets, fencing, and the capability gate instead.                                                                 |
| Let the history plugin hook the PTY or persist raw stdout by default  | Rejected: it breaks the no-hot-path invariant and the default-secret-minimizing rule; Core emits events and the plugin persists opt-in above the public surface.                                                                 |
| Make SQLite the store of record in Core                               | Rejected as a direction: the dependency decision stays with the ADR 0004 owners, and a relational store is not the canonical log. A rebuildable index served from an extracted component remains an open option, not a decision. |
| Persist as a side effect of restore                                   | Rejected: ADR 0013 keeps Restore and Persistence separate; restore re-derives volatile structure from the persisted snapshot (whose exit-write default is the separate open point above).                                        |
| Own session snapshots from the history plugin                         | Rejected: save/restore is a Core mechanism that must work with zero plugins and in safe mode; an optional plugin must not gate it.                                                                                               |
| Read Atuin's private database directly                                | Rejected: ADR 0016 binding constraint 8 requires the supported CLI or API; the internal schema is not a public contract.                                                                                                         |
| Treat per-plugin KV as a general sink for terminal output             | Rejected: it would bypass the opt-in, secret-minimizing history path and the capability model.                                                                                                                                   |
| Decide the storage scope inside ADR 0016 instead of reconciling first | Rejected by ADR 0016; this document performs the reconciliation so the four objects are reconciled before the boundary is authoritative.                                                                                         |

## Affected contracts

- [ADR 0016 - Execution, Graphics, Accessibility, Storage, and Platform-Service Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md):
  Boundary 4 remains gated on this reconciliation; the four objects stay
  distinct.
- [ADR 0015 - Small-Core Extraction Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
  and [ADR 0013 - Core Ontology and Identity Model](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0013-core-ontology-identity.md):
  the Restore/Persistence separation and the history/persistence vocabulary.
- [Small-core refactor execution handoff](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/handoff/2026-10-02-small-core-refactor.md):
  `W-131` now has its reconciliation deliverable; the dependency order
  (`W-131` then `W-137` and `W-146`) is unchanged.
- [Plugin Contract and Manager Boundary](plugin-contract-and-manager-boundary.md):
  the native-needs route through host Rust services (storage is the example)
  stays the direction.
- [Development index](README.md): routes to this document.
- [Open-question register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/open-questions.md):
  no new global open question is admitted. The storage scope points remain
  parked with downstream owners, because none of them blocks the current
  milestone and no implementation evidence exists to force one.
- Cross-repository (`W-137` in bitty-plugins-docs, `W-139` in
  bitty-plugin-sdk, `W-146` in bitty) and the candidate
  [Panel History record](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-history-candidate.md):
  summarized for direction here, owned and accepted there.

## Open points

The following details are parked, not decided. Each park names the owning task
and the reason. None is a global open question: none blocks the current
milestone, and no implementation evidence forces one yet.

- **Object contract schemas, spellings, and defaults** parked to `W-137` and
  `W-146`: segment format and seal bound, index shape, retention and deletion
  defaults, capability grammar, and storage-surface policy.
- **SDK surface and conformance** parked to `W-139`: the accepted public history,
  storage, search, and selection APIs, the mock host, and the conformance suite,
  after `W-135`, `W-137`, and `W-138`.
- **SQLite-as-rebuildable-index** parked to `W-146` with the ADR 0004 owners: the
  Panel History direction freezes no Core SQLite dependency for history, while a
  wider index role has been proposed for a structured storage layer; the
  reconciliation of those two candidate vocabularies is undecided.
- **Placement of session-snapshot and per-plugin KV mechanics** parked to
  `W-146` and `W-139`: whether either mechanism moves to the extracted component
  while Core retains restore re-derivation and the SDK retains the KV contract.
- **Session snapshot exit-write default** parked to the security review and
  `W-146`: the accepted behavior writes bounded per-pane scrollback and captured
  cwd to the session file on normal interactive exit in plaintext with user-only
  permissions, and that text can include sensitive material. Whether to keep the
  exit-write default as accepted or move sensitive scrollback behind an explicit
  opt-in (with an owner, migration path, and security impact) is undecided; the
  security reviewer owns the decision and this reconciliation does not decide it.
- **Cross-object correlation and dangling references** parked to `W-137`: the
  lifecycle of external history references after expiry, deletion, or provider
  removal, and any federated-query merge semantics.
- **Secret redaction format in persisted history** parked to `W-137`: typed
  redaction and export-preview equality must compose with ADR 0006 and the
  security corpus from the start.

## Acceptance criteria

- The four storage objects each have an explicit owner, lifecycle, retention and
  deletion rule, budget, default-persistence posture, and high-level public
  contract shape.
- The four objects stay distinct and no universal database is authorized.
- What Core retains and what may move to the extracted storage component are
  both stated explicitly.
- `W-137`, `W-139`, and `W-146` are named as downstream owners without deciding
  their content.
- Candidate status remains candidate and no storage object or boundary is
  described as accepted or implemented.
- The verification plan requires deletion, default-persistence privacy, scope
  escape, generation fencing, and no-private-bypass evidence.
- Independent security review is required before merge, and the reviewer roles
  are named.
- The development index routes to this document, and no new open question is
  fabricated.
- `just check` passes with zero issues.

## P0 Review Sign-off

| Role                 | Scope                                                                                | Requirement                                                          |
| -------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `architecture-owner` | Ownership, lifecycle, and retained-Core correctness                                  | Approve; confirms the four-object split and the retained mechanisms. |
| `security-reviewer`  | Trust boundaries, persistence default, redaction, capability, and generation fencing | Independent security review required before merge.                   |
| `docs-curator`       | Taxonomy, metadata, links, terminology, and register synchronization                 | Approve; confirms discoverability and schema.                        |

## References

- [bitty-docs#405](https://github.com/bitty-terminal/bitty-docs/issues/405)
  (CarryCtx `CTX-0267`, plan key `W-131`).
- [ADR 0016 - Execution, Graphics, Accessibility, Storage, and Platform-Service Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md)
  (Boundary 4; binding constraints 8 and 9) and [ADR 0015 - Small-Core Extraction Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md).
- [Small-core refactor execution handoff](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/handoff/2026-10-02-small-core-refactor.md),
  plan keys `W-131`, `W-137`, `W-139`, `W-146`.
- [Security overview](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/security/overview.md),
  [threat model](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/security/threat-model.md),
  and [P0 acceptance criteria](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/security/p0-acceptance-criteria.md).
- [Plugin Contract and Manager Boundary](plugin-contract-and-manager-boundary.md),
  [documentation workflow](documentation-workflow.md), and
  [development index](README.md).
- Cross-repository sources:
  [Panel History (Candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-history-candidate.md),
  [Terminal state and action invariants](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/terminal-state-rfc.md),
  [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md),
  [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md),
  [Plugin Host Runtime RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/plugin-host-runtime-rfc.md),
  [Isolation and Resource RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/isolation-resource-rfc.md),
  [bitty.store Reference](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/reference/store.md),
  [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md),
  and [History consumption boundary](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/persistence/history-consumption-boundary.md).
