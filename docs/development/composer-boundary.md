---
title: Composer Boundary
description: Focused W-73 contract defining the Composer as a first-party extension with its focusable-overlay input-capture dependency and its PTY paste external-editor process temp-file API versioning and rollback contracts
category: development
audience: contributor
document_type: specification
status: accepted
website_publish: true
sidebar_order: 29
---

# Composer Boundary

## Document status

Accepted on 2026-10-03 as the owner-delegated `W-73` focused contract for the
Composer boundary that
[ADR 0015](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
accepted in direction and strictly gated on the host APIs. This document decides
ownership, the overlay and input-capture dependency, the process and temp-file
security contracts, API ownership and versioning, and compatibility and rollback.
It does not describe implemented behavior, does not authorize extraction, does
not authorize shipped, stable, normative, or compatibility-guaranteed behavior,
and does not weaken any normative security control. The Composer extraction
(`W-103`) remains gated on the overlay and input-capture host contract (`W-01`),
this contract, and the Composer architecture contract (`W-82`); until then Core
keeps the Composer behavior. Nothing here is implemented and no downstream task
may cite this document as authorization to move code. Frontmatter `status` is
`accepted` per the repository metadata schema; document status is Accepted.

- Owning task: `W-73` (bitty-docs), CarryCtx `CTX-0262`, Issue
  [bitty-docs#402](https://github.com/bitty-terminal/bitty-docs/issues/402).
- Predecessor decision:
  [ADR 0015 - Small-Core Extraction Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
  (Boundary 4, "Composer: accepted, gated on host APIs").
- Related:
  [ADR 0016 - Execution, Graphics, Accessibility, Storage, and Platform-Service Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md)
  (the `W-01` focusable-overlay and transient input-capture host API, tracked as
  Issue #396 under open question OQ-056),
  [ADR 0009 - Plugin API v1 Lua Surface Acceptance Resolution](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0009-plugin-api-v1-lua-surface.md),
  the [Execution Host and Supervisor Boundary](execution-host-boundary.md), the
  [Native Component Boundary](native-component-boundary.md), the
  [Plugin Contract and Manager Boundary](plugin-contract-and-manager-boundary.md),
  and the [small-core refactor execution handoff](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/handoff/2026-10-02-small-core-refactor.md).

## Purpose and scope

The Composer is the editable command line and its surrounding input policy: line
editing, paste handling, external-editor launch, cancel, and submit. It currently
lives inside Core, and [ADR 0015](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
accepted moving that policy to a first-party `composer` extension once the public
host APIs it needs exist.

This specification fixes one ownership and dependency model so that the Composer
extension, the Core host APIs it consumes, and the terminal documentation that
describes them can be built against one reviewed contract. In scope:

- the ownership decision: the Composer is a first-party extension, not a Core
  feature, with the rationale and the alternatives considered;
- the focusable overlay and transient input-capture host dependency, including
  what Core retains and how capture is acquired, switched, cancelled, and
  released;
- the PTY paste, external-editor process, and temp-file contracts, including
  `argv`-first validated arguments, no shell interpolation, bounded temp files
  with user-only permissions and guaranteed cleanup, cancellation, resource
  limits, and failure and crash handling;
- API ownership and versioning, and the compatibility and rollback story;
- the failure, timeout, and cancellation semantics and the resource-limit
  contract;
- the downstream owners of the parked host API, architecture, and plugin
  details.

Out of scope and not decided here:

- exact API spellings, trait and wire shapes, constant values, capability
  grammar strings, and screen geometry; those belong to `W-01` and `W-82`;
- the plugin package layout, manifest fields, and implementation; those belong
  to the `composer` plugin task (`CTX-0003`);
- repository creation and any extraction or migration code, which `W-103`
  performs only after its gates;
- the Core-side overlay, input-capture, process, and temp-file implementations,
  which stay with the Core host-API tasks and must match `W-01`.

This document does not reopen the accepted Terminal Truth, permission, paste,
process, or capability controls. It preserves them and records any residual
question under "Open points".

## Normative sources this specification must not weaken

This contract must be read together with, and must not weaken:

- The [security overview](../security/overview.md), the
  [threat model](../security/threat-model.md), the
  [risk register](../security/risk-register.md), and the
  [P0 acceptance criteria](../security/p0-acceptance-criteria.md). The controls
  that bind this boundary include suspicious paste inspection (`P0-AC-008`),
  hyperlink and process launch without shell interpolation (`P0-AC-009`),
  capability-checked host APIs and official-plugin parity (`P0-AC-012`),
  per-plugin resource budgets (`P0-AC-014`), exclusion from the input, parser,
  and render hot paths (`P0-AC-015`), Core-owned Terminal Truth (`P0-AC-016`),
  safe mode (`P0-AC-019`), trace minimization with user-only files
  (`P0-AC-026`), trust-level admission (`P0-AC-035`), and the panel lease write
  gate (`P0-AC-039`).
- [ADR 0015](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
  Boundary 4 and its binding constraints, especially Terminal Truth and
  permission retention, no private first-party bypass, and validated arguments
  rather than shell interpolation.
- [ADR 0016](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md)
  Boundary 1 (execution supervisor) and its safe defaults: `argv`-first
  execution rather than a shell string, closed stdin unless an interactive PTY
  is explicitly requested, capability-scoped process operations authorized per
  principal, generation fencing, bounded output, and no default retry.
- [ADR 0009](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0009-plugin-api-v1-lua-surface.md):
  the frozen v1 Lua surface, the contract/implementation/generation authority
  split, the non-focusable presentation-only `overlay` slot as accepted for v1,
  and the rule that unknown future fields are ignored.
- The accepted [Terminal state and action invariants](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/terminal-state-rfc.md),
  [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md),
  [Rich Presentation RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/rich-presentation-rfc.md),
  [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md),
  [Isolation and Resource RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/isolation-resource-rfc.md),
  and [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md).
- The [Execution Host and Supervisor Boundary](execution-host-boundary.md),
  which fixes the process-side direction this contract reuses: `argv` over
  `bash -c`, separated hard and idle timeouts, structured outcomes, killing the
  owned process tree, and capability-scoped operations.

## Terminology

- **Composer**: the editable input line and its input policy (line editing,
  paste, external-editor launch, cancel, and submit). It is currently a Core
  behavior and is the subject of this boundary.
- **Extension**: optional behavior delivered through a public, versioned,
  capability-gated interface, whether a Lua plugin or a Rust-level component.
  First-party and third-party extensions use the same interfaces; there is no
  private first-party bypass.
- **Core**: the always-available terminal mechanism that works with zero
  plugins and in `bitty --safe`; it owns Terminal Truth, permission and resource
  enforcement, and identity and generation fencing.
- **Terminal Truth**: parser state, grid semantics, cursor state, modes, and
  canonical scrollback; mutable only by Core. Plugins may alter presentation,
  never Terminal Truth.
- **Focusable overlay**: an overlay surface that can hold focus and receive
  transient input, distinct from the v1 presentation-only, non-focusable
  `overlay` slot accepted by [ADR 0009](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0009-plugin-api-v1-lua-surface.md).
- **Transient input capture**: a bounded, revocable modal capture in which
  keyboard, text, IME, and pointer input is routed to the focused overlay
  surface; Core owns acquisition and release, and no plugin callback runs on the
  input hot path.
- **PTY paste**: delivery of selected or pasted text into the panel's input
  stream through the Core paste pipeline, never by a plugin writing a raw PTY
  handle.
- **External-editor process**: a user-configured editor process launched by Core
  on behalf of the Composer extension to edit an edit-buffer temp file.
- **`argv`-first**: execution from a program and an argument vector with
  validated argument boundaries, never a constructed shell command string.
- **Temp file**: a bounded, user-only-permission regular file holding the edit
  buffer for an external-editor session.
- **Generation fencing**: the rule that semantic assignment generation is
  distinct from execution generation, and that the host rejects a stale handle
  itself rather than trusting the caller.
- **Parked**: explicitly deferred with a named reason and an owning task; a park
  is not acceptance and reserves no interface.
- **Candidate**: a proposal that has not been decided; candidate status is not
  acceptance and is not implementation.

## Composer ownership decision

### Composer is a first-party extension, not Core

The Composer is an extension. It is not a Core feature, and after the gated
extraction it ships as the first-party `composer` plugin over the public plugin
platform, using the same capability-gated, testable interfaces as any
third-party extension. The candidate `composer` repository under
`bitty-plugins/plugins/` is a metadata-only scaffold: its existence is not
evidence that the plugin is implemented, and this document does not authorize
building it.

The binding decision is the extension ownership, not the delivery language. The
extension boundary admits both Lua plugins and Rust-level extensions. The
working delivery is the `composer` plugin because line editing, paste, and
editor policy are optional presentation and input behavior rather than terminal
mechanisms, and because the plugin platform already supplies the lifecycle,
capability, and SDK surfaces such a policy needs. If a later, reviewed decision
changes the delivery from a Lua plugin to a Rust-level extension, this boundary's
constraints are unchanged: it is still an extension, it still uses only the
public capability-gated interfaces, and Core still retains Terminal Truth and
permission control. The delivery shape and its exact spelling are parked to
`W-82` and `CTX-0003`.

### Why an extension rather than a Core library

- DIR-001 keeps optional behavior out of the small core. Line editing, paste
  policy, external-editor launch, cancel, and submit are optional policy, not a
  terminal-emulator mechanism.
- The extraction reduces Core's policy surface without relaxing a trust
  boundary: Core already retains the mechanisms the policy must use (Terminal
  Truth, the PTY, the input pipeline, and the capability gate), so the plugin
  gains no authority by the move.
- A plugin is deliberately dogfooded: first-party and third-party extensions
  must use the same public API, which is only provable if the first-party
  Composer uses it too.
- The extension must remain optional. Core keeps its own edit and submit
  behavior until the extraction is complete, so a missing, disabled, crashed, or
  incompatible plugin never removes the ability to type a command.

### What Core retains

Core retains every mechanism and control the Composer extension depends on, and
this document does not move any of them:

- **Terminal Truth.** Parser state, grid semantics, cursor, modes, and canonical
  scrollback stay Core-owned and are never mutable by the extension
  (`P0-AC-016`).
- **Permission and consent.** The capability gate, the trust-level admission,
  and any required consent for input capture, paste, temporary files, and
  process launch are Core decisions; the extension requests, Core authorizes.
- **The terminal input path.** Core owns the input pipeline and the paste
  inspection; no extension callback executes synchronously on the input hot
  path (`P0-AC-015`).
- **Terminal write and submit.** Writing a submitted buffer to the PTY and the
  bracketed-paste and suspicious-paste handling stay in Core (`P0-AC-008`).
- **Process and resource enforcement.** Core spawns and authorizes the
  external-editor process, enforces timeouts and budgets, and kills only the
  PID it recorded.
- **Safe mode and zero-plugin startup.** `bitty --safe` and a no-plugin start
  remain fully usable with the retained Core behavior (`P0-AC-019`).

Until `W-01`, this contract, and `W-82` are complete, Core keeps the Composer
behavior in place; the extraction (`W-103`) does not start earlier.

## Overlay and transient input-capture dependency

The Composer cannot be extracted on the v1 `overlay` slot alone. That slot is
presentation-only and non-focusable, so it cannot host an editable command line.
The extension depends on a public host API that provides a focusable overlay and
transient input capture, which is the `W-01` contract. Core retains the capture
mechanism and the permission that gates it; the API is the public path, not a
private one.

| Host capability                    | What the Composer uses it for                                                                            | Core retains                                                                                                            | Contract owner         |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Focusable overlay surface          | Host the editable input line and its completion or hint presentation; hold focus while active            | The overlay mechanism, focus order, and the rule that a focused surface reports the destination that actually has focus | `W-01`                 |
| Transient input capture            | Receive keyboard, text, IME, and pointer input while the overlay is focused, ephemerally                 | The input pipeline, the capture switch, the capability and consent gate, and hot-path exclusion                         | `W-01`                 |
| Capture lifecycle                  | Acquire on activation or user gesture, switch focus, cancel, release, and survive plugin unload or crash | The lifecycle authority that guarantees release and restores terminal focus                                             | `W-01`                 |
| Controlled PTY write and paste     | Submit the accepted buffer and request paste inspection results                                          | The PTY, the paste inspector, and the submit path                                                                       | `W-01`, Core host APIs |
| Controlled process and temp access | Launch an external editor on a bounded temp file                                                         | The process permission, resource enforcement, and temp-file policy                                                      | `W-01`, Core host APIs |

### Focus and capture rules

- **Core owns the switch.** Capture is granted by Core, bounded in scope, and
  revoked by Core. The extension cannot capture input directly and cannot
  register a synchronous hot-path callback.
- **Transient, not persistent.** Capture lasts only while the focusable overlay
  is active. It ends on cancel, on submit, on a focus switch away from the
  surface, on plugin unload, disable, or crash, and on any Core-side timeout.
- **Release is guaranteed.** Capture release is idempotent and is performed by
  Core, so a faulty or crashed extension cannot leave the terminal unable to
  receive input. Core restores focus to the panel that actually holds it.
- **Focus switch is a release.** Moving focus to another panel, view, overlay,
  or the terminal releases capture without delivering the captured events to the
  terminal; a partial edit is preserved only if the extension still exists, and
  is otherwise discarded without corrupting Terminal Truth.
- **Cancel does not submit.** Cancelling discards the unsubmitted buffer and
  writes nothing to the PTY.
- **No second input channel.** The focusable overlay and input capture compose
  with the accepted input-pointer and IME direction rather than opening a second
  channel; the IME overlay contract remains owned by its own open question and
  is not redefined here.

The exact API spellings, capture event payloads, focus-order details, and
timeout values are parked to `W-01`. This document fixes the dependency and the
Core-owned guarantees, not the interface.

## PTY paste contract

Paste is security-relevant and stays under Core control; the extension requests
it and never writes the PTY directly.

- **One paste path.** Pasted or selected text enters through the Core paste
  pipeline, where suspicious paste inspection (`P0-AC-008`) and bracketed paste
  as defense in depth remain authoritative. The extension receives the inspected
  result and never bypasses the inspector.
- **No raw PTY handle.** The extension never receives a PTY file descriptor, a
  raw write surface, or a terminal state mutation path. Submit writes the
  accepted buffer to the PTY through the capability-gated terminal input API,
  attributed to the extension and gated by the panel lease write rule
  (`P0-AC-039`).
- **Bounded.** The paste payload and the resulting edit buffer are bounded by a
  finite Core-enforced limit. An over-limit paste is rejected or truncated under
  a documented rule, never buffered without bound.
- **Cancel is a no-op on the PTY.** A cancelled paste or a cancelled submit
  writes nothing.
- **Fail closed.** If inspection, capability, lease, or consent fails, the paste
  or submit is denied with a typed outcome and no partial write.

The numeric bounds and the exact request and result shapes are parked to `W-01`
and `W-82`.

## External-editor process contract

The external editor is a process launch on behalf of the extension and is bound
by the execution and process controls of the security corpus.

- **`argv`-first, no shell.** The editor is launched as a program plus a
  validated argument vector. There is no shell construction, command string, or
  interpolation anywhere in the path (`P0-AC-009` extends to process launch). A
  shell is not used to quote, join, expand, or redirect arguments.
- **Configured, not untrusted.** The editor executable and argument template come
  from reviewed user configuration, never from terminal output, a remote payload,
  or plugin content. Arguments are validated against their declared shape before
  launch, and a value that cannot be represented as a single argument is
  rejected rather than escaped into a shell string.
- **Capability-gated and attributed.** Process launch requires the process
  capability and is attributed to the extension. Core authorizes per principal
  and enforces the resource limits below; an AI-layer or plugin defect cannot
  launch an arbitrary process.
- **Owned and tracked.** Core spawns the editor, records the PID, and on cancel,
  timeout, or shutdown terminates only the process tree it recorded. The
  extension cannot send arbitrary signals.
- **Bounded environment and stdin.** The editor inherits a minimized environment
  and does not receive ambient credentials, a runtime administrator token, or a
  raw PTY. Interactive versus non-interactive behavior follows the execution
  boundary defaults.
- **Structured outcome.** The launch returns a typed outcome, not a bare exit
  code. At minimum: accepted, editor exited with the edited content, cancelled,
  denied, timeout, spawn failed, and unavailable. Exact codes are parked.
- **Failure and crash.** A spawn failure, non-zero exit, or crash returns a typed
  result, leaves Terminal Truth untouched, removes the temp file, and preserves
  the previous edit buffer or discards it under a documented rule; it never
  silently substitutes content.
- **No default retry.** A failed or unknown editor outcome is not retried
  automatically; re-execution is an explicit user or plugin action, matching the
  execution boundary.

## Temp-file contract

An external-editor session needs a file to hand to the editor. That file can
contain sensitive text and is treated as sensitive.

- **User-only permissions.** The file is created with user-only permissions
  (mode `0600` on Unix-like systems, the current-user equivalent elsewhere), in
  a Bitty-owned temp directory that is itself user-only (`0700`), never in a
  world-readable location.
- **Unpredictable and exclusive.** The name is unpredictable, and the file is
  created with exclusive creation so a pre-existing path or symlink cannot be
  followed or overwritten.
- **Regular file only.** The path resolves to a regular file under the approved
  temp root; devices, sockets, procfs, sysfs, devfs entries, and symlink escapes
  are rejected, consistent with the deny-by-default local-file policy
  (`P0-AC-005`).
- **Bounded.** The temp file has a finite maximum size enforced at write. An
  oversize buffer is refused rather than written without bound.
- **Short-lived and not a store.** The file exists only for the editor session.
  It is never a persistence path, never indexed, and never reused across
  sessions.
- **Never logged.** Temp-file contents and paths are not written to traces,
  diagnostics, or crash reports by default; trace minimization and redaction
  apply (`P0-AC-026`).
- **Always cleaned up.** The file is removed on success, on cancel, on editor
  failure, on plugin unload, and on the next Core start after a crash. Cleanup is
  performed by Core, not left to the extension. Removal failure is reported, not
  silently ignored.

The temp root, name scheme, and size constant are parked to `W-82` and
`CTX-0003`; the permission, exclusivity, boundedness, and cleanup rules above are
binding.

## API ownership and versioning

Ownership follows the authority split recorded by
[ADR 0009](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0009-plugin-api-v1-lua-surface.md):
the reviewed contract is normative in the documentation corpus; the executable
Core and SDK surfaces are parity evidence and may not add or rename identifiers
without a documentation revision. This document does not fix any spelling.

| Artifact                                               | Normative owner                                 | Versioning rule                                                                                                                                                                                            |
| ------------------------------------------------------ | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Composer boundary contract (this document)             | bitty-docs                                      | Revised only by a reviewed bitty-docs change; downstream tasks cite the accepted version.                                                                                                                  |
| Focusable-overlay and transient input-capture host API | bitty-docs (`W-01`, Issue #396, under OQ-056)   | Additive and versioned; it may not break the frozen v1 surface; new identifiers require the owning contract.                                                                                               |
| Composer architecture contract                         | bitty-terminal-docs (`W-82`)                    | Owns the delivery shape and exact surface; it may not weaken this document or a P0 control.                                                                                                                |
| Core host-API implementation and parity evidence       | bitty (Core host-API tasks; extraction `W-103`) | Must match `W-01`; executable parity evidence is required; it may refine mechanics, never identifiers.                                                                                                     |
| SDK surface for the overlay and input APIs             | bitty-plugin-sdk (`W-120`, CarryCtx `CTX-0065`) | Derived from `W-01`; may not invent identifiers, consistent with the [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md). |
| `composer` plugin package                              | `composer` plugin task (`CTX-0003`)             | Package semver; the manifest declares the required host API and compatibility; no private first-party surface.                                                                                             |

Versioning rules:

- **Additive within v1.** The overlay and input-capture APIs are introduced
  additively. Existing accepted v1 behavior is not broken; unknown future fields
  are ignored.
- **Declared compatibility.** The plugin manifest declares the host API version
  it requires. Core validates compatibility before activation and fails closed by
  disabling the plugin with a diagnostic, never by loading it blind.
- **One normative text.** There is no divergent copy: the accepted contract lives
  in the documentation corpus, and the executable types are parity evidence.
- **No invented authority.** Contract authority, implementation authority, and
  SDK generation authority stay distinct exactly as
  [ADR 0009](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0009-plugin-api-v1-lua-surface.md)
  fixed them.

## Compatibility and rollback

- **Core keeps the behavior until the gates pass.** The extension is not
  extracted before `W-01`, `W-73` (this document), and `W-82` are complete. Core
  retains a working edit and submit path throughout.
- **Optional by construction.** Because the Composer is an extension, disabling,
  uninstalling, or failing to load it falls back to the retained Core behavior
  rather than removing the command line. Safe mode and zero-plugin startup stay
  usable.
- **Additive API, fail closed on mismatch.** Host API growth is additive; a
  version or capability mismatch disables the plugin with a diagnostic and no
  partial activation, rather than silently degrading or escalating.
- **Rollback is non-destructive.** Rolling back the extension is disabling it;
  there is no destructive migration of terminal state, and the retained Core
  path is the fallback. A package rollback follows the accepted transactional
  activation and rollback controls.
- **No private fallback.** Rollback does not introduce a private first-party
  path; the fallback is Core's own retained mechanism, not a bypass of the
  public API for official extensions.

## Failure, timeout, and cancellation semantics

Every host interaction is bounded, and Core is never blocked by the extension.

- **Deadlines.** Capture sessions, paste operations, and editor processes are
  bounded by finite timeouts enforced by Core. A blocked or silent extension
  cannot pin input, the PTY, or a process slot.
- **Cancellation.** Cancel releases capture, discards the unsubmitted buffer,
  terminates only the recorded editor process tree, removes the temp file, and
  returns focus to the panel. Cancel is available from the user at all times.
- **Release guarantee.** On any terminal condition, including a plugin crash, a
  Core-side error, a focus switch, or a timeout, Core releases capture and
  restores terminal input. Release is idempotent and never leaves the terminal
  unable to receive input.
- **Typed outcomes.** Results are typed (at minimum: success, cancelled, denied,
  timeout, editor failed, unavailable), never a bare boolean or a bare exit
  code. Denials name the missing capability or the violated rule, not the
  payload.
- **Crash containment.** A plugin crash cannot corrupt Terminal Truth, leak a
  temp file, or hold input capture. Any lost in-progress buffer is acceptable
  and is not reconstructed from terminal content.
- **No default retry.** There is no automatic retry of a failed edit, paste, or
  editor launch; re-execution is explicit.
- **Structured diagnostics.** Failures produce bounded, redacted diagnostics; no
  secret or raw input is logged by default.

Exact timeout values, outcome code strings, and cancellation modes are parked to
`W-01`, `W-82`, and `CTX-0003`.

## Resource-limit contract

Every dimension the extension can grow is bounded and enforced by Core, with
attribution to the extension (`P0-AC-014`). Finite defaults and hard ceilings
must exist for each dimension before implementation; the numbers are parked to
the focused contracts.

| Dimension                 | Limit requirement                                                                          | Enforced by                    |
| ------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------ |
| Focusable overlay content | Bounded node count and serialized size per update                                          | Core surface and scene budgets |
| Input capture             | Bounded event queue depth, rate, and per-event size; no hot-path synchronous work          | Core input pipeline            |
| Edit buffer               | Bounded bytes or cells                                                                     | Core and extension             |
| Paste payload             | Bounded by a Core limit, inspected before use                                              | Core paste pipeline            |
| Temp file                 | Bounded bytes, user-only permissions, exclusive create                                     | Core temp-file policy          |
| External-editor process   | Bounded wall-clock and idle timeouts; bounded captured output; owned process-tree kill     | Core execution enforcement     |
| Per-plugin budgets        | CPU/instructions, memory, tasks, callback time, and queue depth attributable to the plugin | Core per-plugin enforcement    |

An over-limit operation is denied or truncated under a documented rule with the
previous state intact; it never silently drops correctness or escalates
authority.

## Downstream ownership

This contract fixes who owns the remaining decisions; it does not decide their
content.

- **bitty-docs** owns the focusable-overlay and transient input-capture host
  API contract entry (`W-01`, Issue #396, under OQ-056); **bitty-terminal-docs**
  owns the Composer architecture contract (`W-82`).
- **bitty Core host-API tasks** own the Core-side implementation and parity
  evidence for the overlay, input capture, paste, process, and temp-file
  surfaces, and the gated extraction (`W-103`), which must match `W-01` and this
  document.
- **The `composer` plugin task (`CTX-0003`)** owns the plugin package, its
  manifest compatibility declaration, and its use of the public API; it does not
  gain any private surface.
- The bitty-plugin-sdk derivative task (`W-120`, CarryCtx `CTX-0065`) owns the
  SDK binding for the host APIs after `W-01`; it may not invent identifiers.

None of these tasks may start while the contract it depends on is unaccepted, and
none may weaken a P0 control.

## Security review

The Composer touches input capture, paste, process launch, and temporary-file
trust boundaries governed by the [security overview](../security/overview.md).
Independent security review is required before this contract merges. The
reviewers must confirm that:

- the Composer is an extension using only the public, capability-gated API, with
  no private first-party bypass, no raw PTY, GPU, or window handle, and no input
  hot-path callback (`P0-AC-012`, `P0-AC-015`);
- Core retains Terminal Truth, the input pipeline, paste inspection, and the
  permission and resource gate (`P0-AC-008`, `P0-AC-016`);
- the external-editor launch is `argv`-first with validated arguments and no
  shell construction or interpolation, and the temp file uses user-only
  permissions, exclusive creation, bounded size, and guaranteed cleanup
  (`P0-AC-009`, `P0-AC-026`);
- capture acquisition and release are Core-owned, transient, bounded, and
  guaranteed even on plugin crash, and can never pin input;
- safe mode and zero-plugin startup retain a usable command line
  (`P0-AC-019`).

The focused contracts `W-01`, `W-82`, and the `composer` plugin implementation
each require security review again before their own merge.

## Verification plan

This is a contract specification; it has no executable verification of its own.
Any later implementation of the boundary must prove, at minimum:

1. **Ownership and no bypass.** The first-party `composer` extension uses the
   same public, capability-gated API as any third-party extension; the parity
   suite denies the same operations for both; no private first-party path
   exists.
2. **Capture is transient and guaranteed.** After cancel, submit, focus switch,
   plugin disable, plugin crash, and Core-side timeout, terminal input is
   restored, capture is released, and no captured event reaches the terminal
   unintentionally.
3. **No hot-path execution.** Input and paste tests show no synchronous plugin
   callback on the input, parser, or render hot path.
4. **Paste stays inspected.** Suspicious paste content (C0 controls, NUL, ESC,
   CR, embedded newline, suspicious Unicode controls) still triggers inspection
   and confirmation; the extension cannot bypass the inspector or write the PTY
   directly.
5. **Editor launch is `argv`-first.** Adversarial editor arguments and
   path-shaped values are passed as single validated arguments; no shell is
   invoked and no metacharacter is interpreted; a value that cannot be a single
   argument is rejected.
6. **Temp files are safe and removed.** The file is mode `0600` in a `0700` root,
   created exclusively, bounded in size, rejects symlinks and non-regular files,
   never appears in logs, and is removed on success, cancel, failure, and the
   next start after a crash.
7. **Budgets and deadlines are enforced.** Each resource dimension has a trigger
   test with observable enforcement and correct plugin attribution; an over-limit
   operation is denied with the previous state intact.
8. **Compatibility fails closed.** A version or capability mismatch disables the
   plugin with a diagnostic and no partial activation.
9. **Rollback is safe.** Disabling or uninstalling the plugin restores the
   retained Core behavior; safe mode and zero-plugin startup still accept input.
10. **Documentation gates pass.** The repository-local `just check` passes with
    zero issues.

## Alternatives considered

| Alternative                                                                           | Disposition                                                                                                                                              |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep the Composer inside Core as a Core feature or library                            | Rejected: it contradicts DIR-001 and leaves optional policy in the small core; the extension ownership is the accepted direction.                        |
| Deliver the Composer as a Core-only library while calling it an extension             | Rejected: a Core-linked policy path without the public, capability-gated interface would be a private first-party bypass.                                |
| Depend only on the existing non-focusable `overlay` slot                              | Rejected: a presentation-only, non-focusable slot cannot host an editable line or receive input; a focusable overlay and transient capture are required. |
| Let the plugin capture input directly or register an input callback                   | Rejected: it would put a plugin on the input hot path and let a faulty extension pin the terminal; Core owns capture and release.                        |
| Let the plugin write the PTY directly or receive a raw PTY handle                     | Rejected: it bypasses paste inspection, Terminal Truth ownership, and the capability and lease gates.                                                    |
| Launch the editor through a shell command string                                      | Rejected: shell interpolation is the injection class the process controls exist to prevent; launch is `argv`-first with validated arguments.             |
| Keep the editor temp file in a world-readable location or leave cleanup to the plugin | Rejected: the file can contain secrets; it needs user-only permissions, exclusive creation, bounded size, and Core-guaranteed cleanup.                   |
| Extract before `W-01`, this contract, and `W-82` exist                                | Rejected: the host API and interface would be invented by implementation instead of decided by contract; the extraction stays gated.                     |

## Affected contracts

- [ADR 0015 - Small-Core Extraction Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md):
  Boundary 4 now has its focused contract; extraction (`W-103`) remains gated on
  `W-01`, this contract, and `W-82`.
- [ADR 0016 - Execution, Graphics, Accessibility, Storage, and Platform-Service Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md):
  the focusable-overlay and transient input-capture dependency belongs to the
  `W-01` host contract; the process controls reused here remain governed by the
  execution boundary.
- [small-core refactor execution handoff](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/handoff/2026-10-02-small-core-refactor.md):
  `W-73` now has its boundary, overlay, input, PTY paste, editor-process, and
  lifecycle contract; the dependency order is unchanged.
- [Development index](README.md): routes to this document.
- [Open-question register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/open-questions.md):
  this document closes no open question. The focusable-overlay and transient
  input-capture host API is the v2 scope of the open (deferred) `OQ-056`,
  tracked as Issue #396 (`W-01`); it stays open and this document neither
  resolves nor reopens it. The remaining parked architecture and plugin details
  stay with their named tasks rather than becoming global questions.

## Open points

The following details are parked, not decided. Each park names the owning task
and the reason. The focusable-overlay and input-capture host API is the v2 scope
of the existing open `OQ-056` (Issue #396, `W-01`); the rest are task-level
parks that none of the remaining items broadens into a new global question, and
no implementation evidence forces one yet.

- **Exact host API spellings, capture payloads, focus-order rules, and timeout
  values** parked to `W-01` and `W-82`: the focusable overlay, transient input
  capture, and lifecycle interfaces are defined there, not here.
- **Delivery shape and package layout** parked to `W-82` and `CTX-0003`: whether
  the extension ships as a Lua plugin or a Rust-level extension, and its package,
  manifest, and compatibility declaration, are decided there under this
  boundary's constraints.
- **Numeric bounds and constants** parked to `W-01`, `W-82`, and `CTX-0003`: the
  edit-buffer, overlay-content, input-queue, paste, temp-file, and editor-timeout
  defaults and ceilings must be finite and enforced, but their values are not
  fixed here.
- **Buffer disposition on cancel and editor failure** parked to `W-82` and
  `CTX-0003`: whether a cancelled or failed edit preserves or discards the
  in-progress buffer is an extension-policy detail bounded by the rule that
  Terminal Truth is never reconstructed from terminal content.
- **Capture interaction with IME and copy-mode** parked to the owning
  input-pointer, IME, and search contracts: this document requires no second
  input channel and does not redefine those interfaces.
- **Plaintext sensitivity of the editor temp file** parked to the security
  review and `CTX-0003`: the buffer can contain secrets; the permissions,
  bounded size, no-logging rule, and guaranteed cleanup above are binding, and
  whether any additional minimization is required is assessed at review.

## Acceptance criteria

- The Composer is stated to be a first-party extension, not a Core feature, with
  the rationale and the retained Core mechanisms.
- The focusable-overlay and transient input-capture dependency is explicit, and
  Core's retention of the capture mechanism and permission is explicit.
- The PTY paste, external-editor process, and temp-file contracts state
  `argv`-first validated arguments, no shell interpolation, bounded temp files
  with user-only permissions and cleanup, cancellation, resource limits, and
  failure and crash handling.
- API ownership and versioning are explicit, and the compatibility and rollback
  story exists.
- Core's Terminal Truth and permission control are preserved, and no private
  first-party bypass is introduced.
- The failure, timeout, and cancellation semantics and the resource-limit
  contract are stated.
- The downstream owners (`W-01`, `W-82`, `W-103`, `CTX-0003`, and the SDK
  derivative) are named without deciding their content.
- The document is self-contained, nothing is described as implemented, and the
  extraction is not authorized.
- `just check` passes with zero issues.

## P0 Review Sign-off

| Role                 | Scope                                                                  | Requirement                                                            |
| -------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `architecture-owner` | Ownership, overlay/input dependency, and retained-Core correctness     | Approve; confirms the extension ownership and the captured mechanisms. |
| `security-reviewer`  | Input capture, paste, process launch, temp files, and capability gates | Independent security review required before merge.                     |
| `docs-curator`       | Taxonomy, metadata, links, terminology, and register synchronization   | Approve; confirms discoverability and schema.                          |

## References

- [bitty-docs#402](https://github.com/bitty-terminal/bitty-docs/issues/402)
  (CarryCtx `CTX-0262`, plan key `W-73`).
- [ADR 0015 - Small-Core Extraction Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
  (Boundary 4) and [ADR 0016 - Execution, Graphics, Accessibility, Storage, and Platform-Service Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md)
  (execution boundary and `W-01` dependency).
- [ADR 0009 - Plugin API v1 Lua Surface Acceptance Resolution](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0009-plugin-api-v1-lua-surface.md)
  (authority split, frozen v1 surface, non-focusable `overlay` slot).
- [Small-core refactor execution handoff](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/handoff/2026-10-02-small-core-refactor.md),
  plan keys `W-01`, `W-73`, `W-82`, `W-103`.
- [Execution Host and Supervisor Boundary](execution-host-boundary.md),
  [Native Component Boundary](native-component-boundary.md), and
  [Plugin Contract and Manager Boundary](plugin-contract-and-manager-boundary.md).
- [Security overview](../security/overview.md),
  [threat model](../security/threat-model.md),
  [risk register](../security/risk-register.md), and
  [P0 acceptance criteria](../security/p0-acceptance-criteria.md).
- [Documentation workflow](documentation-workflow.md) and
  [development index](README.md).
- [Terminal state and action invariants](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/terminal-state-rfc.md),
  [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md),
  [Rich Presentation RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/rich-presentation-rfc.md),
  [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md),
  [Isolation and Resource RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/isolation-resource-rfc.md),
  and [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md).
