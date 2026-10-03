---
title: Overlay and Input-Capture Host Contract
description: Accepted W-01 v2 contract deciding the focusable overlay and transient input-capture capability Lua surface lifecycle bounds failure modes and versioning
category: development
audience: contributor
document_type: specification
status: accepted
website_publish: true
sidebar_order: 33
---

# Overlay and Input-Capture Host Contract

## Document status

Accepted as the owner-delegated `W-01` v2 host-API contract for the focusable
overlay and transient input-capture surface that
[ADR 0016](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md)
gated and that the [Composer Boundary](composer-boundary.md) (`W-73`) depends
on. This document decides the capability identifiers, the Lua surface spellings,
the capture lifecycle, the finite bounds, the typed failure modes, the
no-hot-path rule, focus arbitration, safe-mode behavior, and versioning within
v2. It does not authorize implementation, does not authorize shipped, stable,
normative, or compatibility-guaranteed behavior, and does not weaken any
normative security control. Frontmatter `status` is `accepted` per the
repository metadata schema; document status is Accepted.

- Owning task: `W-01` (bitty-docs), CarryCtx `CTX-0273`, Issue
  [bitty-docs#423](https://github.com/bitty-terminal/bitty-docs/issues/423).
- Predecessor decisions:
  [ADR 0016 - Execution, Graphics, Accessibility, Storage, and Platform-Service Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md)
  (the `W-01` focusable-overlay and transient input-capture host API, tracked
  under open question OQ-056),
  [ADR 0015 - Small-Core Extraction Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
  (Boundary 4, Composer extraction gated on this contract), and
  [ADR 0009 - Plugin API v1 Lua Surface Acceptance Resolution](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0009-plugin-api-v1-lua-surface.md)
  (authority split, frozen v1 surface, non-focusable `overlay` slot).
- Related:
  [Composer Boundary](composer-boundary.md) (`W-73`),
  [Composer Architecture and Host API](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/composer-architecture.md)
  (`W-82`, terminal-side consumer), and
  [Beacon SDK Reconciliation](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/beacon-sdk-reconciliation.md)
  (blocked consumer rows).
- Mechanism evidence: the merged `W-28` Core host mechanism for the focusable
  overlay and input capture (single owner, bounded event queue, bounded payloads,
  Core-side timeout, idempotent release, revoke on suspend and dispose) is
  reviewed implementation evidence for the mechanics below. It is not acceptance:
  this contract decides the identifiers and spellings, and the mechanism must
  match them.

## Purpose and scope

The v1 `overlay` slot accepted by
[ADR 0009](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0009-plugin-api-v1-lua-surface.md)
is presentation-only and non-focusable, so no plugin can host an editable
command line, a modal search surface, or a key-capturing session on it. The
blocked consumers are the palette overlay (which reads `E_UI_UNAVAILABLE` on the
v1 slot), Beacon key capture, and the help, search, and copy-mode extractions.
This specification fixes the single v2 host surface they all share: one
capability-gated, Core-owned mechanism by which a plugin claims exclusive
keyboard and overlay focus for the duration of one bounded user interaction.

In scope:

- the exact v2 capability identifiers for the focusable overlay and transient
  input capture;
- the exact Lua surface spellings for acquire, update, poll, release, and the
  lifecycle event;
- the capture lifecycle: states, transitions, and the cancel, submit,
  focus-switch, unload, crash, and timeout paths;
- the finite bounds: queue depth, per-event and per-call payload ceilings,
  overlay-content budgets, and the idle timeout;
- the typed failure modes for every denied or terminal operation;
- the no-hot-path rule (`P0-AC-015`), focus arbitration, safe-mode behavior,
  and versioning within v2;
- the downstream owners of the consumer, SDK, and mechanism work.

Out of scope and not decided here:

- what the plugin does with captured input after release, including buffer
  submission to the PTY and external-editor launch; the submission and editor
  spellings stay with `W-82` and the execution boundary;
- key, pointer, and IME composition field encodings; those stay with the
  input-pointer and IME contracts;
- overlay scene node types beyond the accepted v1 set; those stay with `W-82`;
- the SDK binding shapes; those stay with `W-139`, `W-120`, and `W-43`;
- the Core mechanism implementation; that stays with `W-28` and must match
  this contract.

This document does not reopen the frozen v1 surface, the Terminal Truth,
permission, paste, process, or capability controls. It preserves them and
records every residual detail under "Open points".

## Normative sources this specification must not weaken

This contract must be read together with, and must not weaken:

- The [security overview](../security/overview.md), the
  [threat model](../security/threat-model.md), the
  [risk register](../security/risk-register.md), and the
  [P0 acceptance criteria](../security/p0-acceptance-criteria.md). The controls
  that bind this surface include capability-checked host APIs and
  official-plugin parity (`P0-AC-012`), per-plugin resource budgets
  (`P0-AC-014`), exclusion from the input, parser, and render hot paths
  (`P0-AC-015`), Core-owned Terminal Truth (`P0-AC-016`), safe mode
  (`P0-AC-019`), trace minimization with user-only files (`P0-AC-026`),
  trust-level admission (`P0-AC-035`), and the panel lease write gate
  (`P0-AC-039`).
- [ADR 0016](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md)
  (the `W-01` host API and its safety constraints: capability-gated, transient,
  bounded, revocable, Core-owned, never weakenable) and
  [ADR 0015](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
  (Boundary 4, gated on this contract).
- [ADR 0009](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0009-plugin-api-v1-lua-surface.md):
  the frozen v1 Lua surface, the contract, implementation, and generation
  authority split, the non-focusable presentation-only `overlay` slot, and the
  rule that unknown future fields are ignored.
- The accepted [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md)
  (namespaces, `bitty.ui.mount` and `bitty.ui.update`, the closed capability
  families, and the typed error classes), the
  [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md),
  and the [Isolation and Resource RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/isolation-resource-rfc.md).
- The accepted [Terminal state and action invariants](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/terminal-state-rfc.md),
  [Input and Pointer Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/input-pointer-rfc.md),
  and [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md).
- The [Composer Boundary](composer-boundary.md) (`W-73`), which fixes the
  dependency on this contract and the Core-owned guarantees this contract now
  interfaces.

## Terminology

- **Core**: the always-available terminal mechanism that works with zero
  plugins and in `bitty --safe`; it owns Terminal Truth, the input pipeline,
  permission and resource enforcement, and identity and generation fencing.
- **Focusable overlay**: an overlay surface that can hold focus and receive
  transient input, distinct from the v1 presentation-only, non-focusable
  `overlay` slot.
- **Transient input capture**: a bounded, revocable modal capture in which
  keyboard, text, IME-committed, paste-derived, and pointer input is routed to
  the focused overlay surface for one session; Core owns acquisition and
  release, and no plugin callback runs on the input hot path.
- **Session**: one capture holding from a successful acquire to its release,
  identified by a handle bound to one plugin identity and generation.
- **Owner**: the plugin holding the single active session; there is at most one
  owner at a time.
- **Terminal Truth**: parser state, grid semantics, cursor state, modes, and
  canonical scrollback; mutable only by Core.
- **Generation fencing**: the rule that semantic assignment generation is
  distinct from execution generation, and that the host rejects a stale handle
  itself rather than trusting the caller.
- **Parked**: explicitly deferred with a named reason and an owning task; a park
  is not acceptance and reserves no interface.
- **Candidate**: a proposal that has not been decided; candidate status is not
  acceptance and is not implementation.

## Capability decision

One v2 capability grants the whole surface. There is no separate input-capture
capability, no wildcard, and no family-wide grant.

| Capability         | Grants                                                                                                | Distinct from                                      |
| ------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `ui.overlay.focus` | Acquire one focusable overlay and hold the single transient input-capture session for one interaction | v1 `ui.overlay` (presentation-only, non-focusable) |

Rules:

- **Deny by default.** Without the granted `ui.overlay.focus` capability, every
  call below fails with `E_CAPABILITY_DENIED` naming `ui.overlay.focus`; an
  unknown identifier fails manifest validation, consistent with the closed v1
  families.
- **Coupled grant.** The focusable surface and the capture session are one
  grant because capture without a visible focused surface would be invisible
  input interception, and a focusable surface without gated capture would be an
  unfocusable presentation slot under another name. A plugin that only needs
  the v1 presentation slot keeps using `ui.overlay` and is unaffected.
- **One session per plugin.** A plugin holds at most one active session; a
  second acquire by the same owner fails exactly like a second owner.
- **No ambient authority.** The capability grants no filesystem, process,
  network, clipboard, or Terminal Truth authority, and no raw PTY handle.

The proposed `terminal.input.submit` and `process.editor` identifiers from the
`W-82` consumer contract are not decided here; they stay with `W-82` and the
execution boundary (see "Downstream ownership" and "Open points").

## Lua surface decision

The surface lives under the existing `bitty.ui` namespace, beside the accepted
`bitty.ui.mount` and `bitty.ui.update`. This renames the provisional
`bitty.overlay.acquire`, `bitty.overlay.update`, `bitty.overlay.poll`, and
`bitty.overlay.release` spellings named by the `W-82` and Beacon consumer
contracts. The rename rationale is namespace and capability alignment: the
operations compose with the `bitty.ui` family and the `ui.*` capability family,
they parallel the accepted `mount` and `update` verb pair, and they avoid
consuming a new top-level `bitty.overlay` namespace for what is a UI-surface
operation. The consumer contracts are revised by their owners to this spelling;
no implementation may cite the provisional spelling.

```lua
handle, err = bitty.ui.overlay.acquire(spec)
ok, err = bitty.ui.overlay.update(handle, scene)
result, err = bitty.ui.overlay.poll(handle)
ok, err = bitty.ui.overlay.release(handle, reason)
```

### Acquire

`bitty.ui.overlay.acquire(spec)` requests the focusable surface and the capture
session in one Core-owned switch. `spec` carries presentation hints only; every
field is optional and unknown fields are ignored per the v1 rule. The decided
fields are `title` and `placeholder`, both bounded text. A successful call
returns an opaque handle bound to the calling plugin identity and generation
and moves the lifecycle to active. A failed call returns `nil` plus a typed
error and changes nothing: no surface appears and no input is captured.

### Update

`bitty.ui.overlay.update(handle, scene)` replaces the overlay content for a
session the caller owns. The scene uses the accepted v1 node set (`Text`,
`Row`, `Column`, `List`) under the v1 scene budgets; richer node types stay
parked to `W-82`. An update on a handle the caller does not own, or on a
released handle, fails with `E_UI_NOT_OWNER` and keeps the previous content.

### Poll

`bitty.ui.overlay.poll(handle)` drains the session queue. It is an
owner-initiated synchronous read of already-queued events, not a Core-driven
callback, so it never places plugin code on the input hot path. The result is a
table with exactly these fields:

| Field        | Value                                                                                 |
| ------------ | ------------------------------------------------------------------------------------- |
| `status`     | `"active"` while the session holds capture; `"released"` after any terminal cause     |
| `seq`        | Monotonic sequence of the last event delivered to this owner in this session          |
| `events`     | Array of input events in order; empty when there is nothing new                       |
| `overflowed` | Boolean sticky flag; true once queue overflow has dropped an older event (see Bounds) |
| `reason`     | Present only with `"released"`; one of the release reasons below                      |

Each input event is an envelope with a `seq` and a decided `type` tag. The
decided tags are `key`, `text`, `pointer`, and `paste`. The envelope shape and
the tag set are decided here; the field-level key, pointer-coordinate, and IME
composition encodings stay with the input-pointer and IME contracts (see "Open
points"). A `paste` event carries Core-inspected text already chunked within
the per-event ceiling; inspection is never bypassed and the extension never
learns an uninspected path.

### Release

`bitty.ui.overlay.release(handle, reason)` ends a session the caller owns.
Release is idempotent: releasing an already-released handle succeeds and
changes nothing. The optional `reason` is an owner-supplied disposition of
`"submitted"` or `"cancelled"`; it defaults to `"released"`. An invalid reason
is a validation error and the session is unchanged. Involuntary terminal causes
overwrite the reason with the actual cause; the owner observes it on the next
poll and non-owners observe the bus event below.

The full reason vocabulary is `released`, `submitted`, `cancelled`,
`focus_switched`, `unloaded`, `crashed`, and `timeout`. Only `submitted` and
`cancelled` are owner-suppliable; the rest are Core-reported.

### Lifecycle bus event

Session end is observable without polling through one observation-only bus
event:

| Event              | Payload                         | Phase                               |
| ------------------ | ------------------------------- | ----------------------------------- |
| `overlay.released` | `{ owner, reason }` (both text) | Observation only, never intercepted |

Any plugin with an event subscription may observe it; no phase may intercept or
veto it. Acquisition needs no bus event because the acquirer learns the outcome
from the return value.

## Capture lifecycle

The lifecycle has three states per handle. Core performs every transition;
the plugin requests, Core decides.

| State      | Meaning                                                                  |
| ---------- | ------------------------------------------------------------------------ |
| `idle`     | No session exists; input flows to the terminal as before                 |
| `active`   | One owner holds the surface and capture; input is routed to its queue    |
| `released` | Terminal per handle; the handle is unusable and a new acquire is allowed |

| From     | Cause                                                         | To         | Effect                                                                                                      |
| -------- | ------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------- |
| `idle`   | Acquire with the capability and no current owner              | `active`   | Surface appears with focus; capture starts; handle bound to owner identity and generation                   |
| `idle`   | Acquire without the capability                                | `idle`     | Denied with `E_CAPABILITY_DENIED`; nothing appears                                                          |
| `idle`   | Acquire in safe mode or with no focusable surface             | `idle`     | Denied with `E_UI_UNAVAILABLE`; nothing appears                                                             |
| `active` | Second acquire by any plugin, including the owner             | `active`   | Denied with `E_UI_ALREADY_CAPTURED`; the existing session is unchanged                                      |
| `active` | Owner poll or update                                          | `active`   | Events drained or content replaced; inactivity clock resets                                                 |
| `active` | Owner release, optionally with `"submitted"` or `"cancelled"` | `released` | Capture ends; surface removed; focus restored to the holding panel; no queued event reaches the terminal    |
| `active` | Focus switch to another panel, view, overlay, or terminal     | `released` | Reason `focus_switched`; partial input stays with the owner only while it exists and is otherwise discarded |
| `active` | Plugin unload, disable, or generation disposal                | `released` | Reason `unloaded`; Core revokes even if the plugin never calls release                                      |
| `active` | Plugin crash                                                  | `released` | Reason `crashed`; Terminal Truth untouched; no temp or capture state leaks                                  |
| `active` | Thirty seconds without input or owner calls                   | `released` | Reason `timeout`; the inactivity clock resets on any input event, poll, or update                           |
| `active` | Stale-generation call (handle from a disposed generation)     | `active`   | Rejected with `E_UI_NOT_OWNER`; the session is unchanged                                                    |
| any      | Release of an already-released or never-held handle           | unchanged  | Succeeds idempotently when the caller owns the generation; otherwise `E_UI_NOT_OWNER`                       |

Rules:

- **Cancel never submits.** A `cancelled` release discards the unsubmitted
  buffer and writes nothing anywhere.
- **Submit is a disposition, not a write.** A `submitted` reason records that
  the owner accepted its buffer; the actual PTY write, if any, travels through
  the terminal-input API owned by `W-82`, never through this surface.
- **Focus switch is a release.** Moving focus ends capture without delivering
  captured events to the terminal; a partial edit is never reconstructed from
  terminal content and never corrupts Terminal Truth.
- **Release is guaranteed.** On every terminal condition Core releases capture
  and restores terminal input, so a faulty, silent, or crashed extension can
  never leave the terminal unable to receive input.

## Bounds

Every dimension the surface can grow is finite and Core-enforced, with
attribution to the owning plugin (`P0-AC-014`). The values below are decided;
the mechanism may enforce tighter internal ceilings but never looser ones.

| Dimension                  | Decided bound                                                                                           | Over-limit behavior                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Event queue depth          | 256 events per session                                                                                  | Oldest event dropped; `overflowed` sticky flag set; session stays active |
| Per-event payload          | 4096 bytes serialized; paste text chunked into sequential events within the ceiling                     | Oversize single event rejected before enqueue; paste continues in chunks |
| Acquire and update calls   | 4096 bytes serialized per call                                                                          | Rejected with the existing value-shape errors; previous state kept       |
| Overlay content per update | Accepted v1 scene budgets: v1 node count and serialized-size ceilings per `update`, same as `ui.update` | Update rejected; previous content kept                                   |
| Capture idle timeout       | 30 seconds without input events or owner calls                                                          | Core releases with reason `timeout`; observed on next poll and bus event |
| Session count              | One active session globally; at most one per plugin                                                     | Second acquire denied with `E_UI_ALREADY_CAPTURED`                       |
| Owner call budgets         | Per-plugin CPU, memory, task, callback-time, and queue-depth budgets per the Isolation and Resource RFC | Core per-plugin enforcement with owner attribution                       |

Rationale for the overflow policy: dropping the oldest event with a sticky flag
keeps the producer (the Core input path) non-blocking, preserves event order
for what is delivered, and tells the owner its view is stale so it can
re-render from authoritative state instead of acting on a silently gapped
stream. Overflow never auto-releases (fast typing must not kill a session) and
never fails open to the terminal (captured keys must not leak to the shell).

## Typed failure modes

Every failure is a typed bridge error with the accepted diagnostic classes
(`runtime`, `validation`, `resolution`, `budget`). Denials name the missing
capability or the violated rule, never the payload.

| Condition                                                                                     | Class        | Code                       | Session effect                |
| --------------------------------------------------------------------------------------------- | ------------ | -------------------------- | ----------------------------- |
| Missing `ui.overlay.focus` grant                                                              | `runtime`    | `E_CAPABILITY_DENIED`      | Unchanged                     |
| Second acquire while a session is active                                                      | `runtime`    | `E_UI_ALREADY_CAPTURED`    | Existing session unchanged    |
| Update, poll, or release by a non-owner, or any call on a released or stale-generation handle | `runtime`    | `E_UI_NOT_OWNER`           | Session unchanged             |
| Acquire in safe mode or with no focusable surface                                             | `runtime`    | `E_UI_UNAVAILABLE`         | Nothing appears               |
| Host call exceeds its deadline                                                                | `budget`     | `E_TIMEOUT`                | Call fails; session unchanged |
| Oversize or misshaped spec, scene, or reason                                                  | `validation` | Existing `E_VALUE_*` codes | Rejected; previous state kept |

`E_UI_ALREADY_CAPTURED` and `E_UI_NOT_OWNER` are decided here as stable codes
in the `runtime` class. `E_UI_UNAVAILABLE`, `E_CAPABILITY_DENIED`, `E_TIMEOUT`,
and the `E_VALUE_*` family are reused from the accepted v1 error contract, not
redefined. Messages stay host-authored and bounded and never echo untrusted
content beyond the accepted redaction rule.

## No-hot-path rule

`P0-AC-015` holds without exception on this surface:

- No plugin callback executes synchronously on the input, parser, or render
  path. Core routes input events into the session queue without invoking Lua.
- `poll` is an owner-initiated read of already-queued events through the
  ordinary budgeted host-call path; it is not a Core-driven callback and it
  creates no hot-path registration.
- Queue overflow is handled by the drop-oldest rule above, which needs no
  plugin cooperation and cannot block the producer.
- Architecture audit must confirm that no hot-path callback registration exists
  for this surface, and latency tests must show that plugin load does not breach
  hot-path budgets.

## Focus arbitration

- **Core owns the switch.** Capture is granted, tracked, and revoked by Core.
  The extension cannot capture input directly and cannot register a synchronous
  hot-path callback.
- **Single owner.** At most one session is active globally. A second acquire
  fails closed with `E_UI_ALREADY_CAPTURED`; the first owner keeps its session
  and there is no last-loaded-wins path.
- **Guaranteed release.** Release is idempotent and Core-performed on every
  terminal condition (explicit release, cancel, submit disposition, focus
  switch, unload, disable, crash, timeout). Core restores focus to the panel
  that actually holds it, and no captured event reaches the terminal after
  release.
- **Generation-fenced handles.** A handle is bound to one plugin identity and
  generation; the host rejects a stale handle itself with `E_UI_NOT_OWNER`.
- **Observable arbitration.** The `overlay.released` bus event lets any
  subscriber observe that arbitration happened; observation grants no veto and
  no capture authority.

## Safe-mode behavior

- `bitty --safe` starts with zero third-party plugins loaded (`P0-AC-019`); any
  acquire attempt in safe mode fails with `E_UI_UNAVAILABLE`.
- Safe mode never presents a focusable overlay, never starts a capture session,
  and never emits `overlay.released`.
- Core retains its own edit and submit path in safe mode and in zero-plugin
  startup, so disabling, uninstalling, or failing to load every plugin never
  removes the ability to type a command.
- Capture state is never read from, written to, or restored across safe-mode
  runs.

## Versioning within v2

- **Additive within v1.** This surface is additive: the frozen v1 surface is
  unchanged, existing accepted v1 behavior is not broken, and unknown future
  fields are ignored.
- **Additive within v2.** Later v2 growth adds capabilities, fields, event tags,
  or reasons; it never renames or redefines the identifiers, spellings, codes,
  or reasons decided here. A change to a decided spelling requires a reviewed
  revision of this contract.
- **Declared compatibility.** The plugin manifest declares the host API version
  it requires (field spelling owned by the package contract, not decided here).
  Core validates compatibility before activation and fails closed by disabling
  the plugin with a diagnostic, never by loading it blind.
- **One normative text.** The accepted contract lives in the documentation
  corpus; the Core mechanism and the SDK binding are parity evidence and may
  refine mechanics, never identifiers, per the
  [ADR 0009](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0009-plugin-api-v1-lua-surface.md)
  authority split.

## Downstream ownership

This contract fixes who owns the remaining work; it does not decide its
content.

| Consumer                                   | Owner                                                             | What it owns (not decided here)                                                   |
| ------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Composer extension package and its UX      | `W-82` architecture, `composer` plugin task, extraction `W-103`   | Delivery shape, submit and editor use, manifest declaration, package semver       |
| Search, copy-mode, and help surfaces       | Their owning extraction tasks under `W-82` and `W-73`             | Which surface each extraction hosts on this contract                              |
| Beacon key-capture sessions                | `W-29` host API, `W-30` policy retirement, `W-120` and `W-43` SDK | Target mechanism, dispatch bridge, session policy above this contract             |
| Plugin-facing SDK binding for this surface | `W-139` SDK, with `W-120` and `W-43` for overlay and Beacon       | Binding shapes, mock host, conformance suite, after this contract                 |
| Core host-mechanism implementation         | `W-28` (bitty)                                                    | Mechanism matching this contract exactly; may refine mechanics, never identifiers |

None of these tasks may start on this surface while this contract is
unaccepted, and none may weaken a P0 control.

## Security review

This surface touches input capture and focus trust boundaries governed by the
[security overview](../security/overview.md). Independent security review is
required before this contract merges. The reviewers must confirm that:

- the surface is capability-gated by `ui.overlay.focus` with deny-by-default
  and no wildcard, first-party and third-party extensions use the same public
  API with no private bypass, and no raw PTY, GPU, window, or Terminal Truth
  mutation path is exposed (`P0-AC-012`, `P0-AC-016`);
- no plugin callback runs on the input, parser, or render hot path, and the
  queue producer never blocks on plugin cooperation (`P0-AC-015`);
- capture is transient, single-owner, bounded, and Core-released on cancel,
  submit disposition, focus switch, unload, crash, and timeout, and can never
  pin input or leak captured keys to the terminal;
- paste-derived capture content passes the Core paste inspection before enqueue
  and failures are typed and redacted (`P0-AC-008` composes through the paste
  path; trace minimization applies per `P0-AC-026`);
- safe mode and zero-plugin startup retain a usable command line with no
  capture surface (`P0-AC-019`).

The consumer, SDK, and mechanism tasks each require security review again
before their own merge.

## Verification plan

This is a contract specification; it has no executable verification of its own.
Any later implementation of the surface must prove, at minimum:

1. **Single owner, fail closed.** A second acquire during an active session
   returns `E_UI_ALREADY_CAPTURED` and the first session is byte-identical
   before and after.
2. **Guaranteed release.** After explicit release, cancel, submit disposition,
   focus switch, plugin disable, plugin crash, and forced idle timeout,
   terminal input is restored, a further poll reports `"released"` with the
   exact reason, and no captured event reaches the terminal.
3. **Idempotent release.** Releasing twice, and releasing a never-held handle
   within the owning generation, succeeds without state change; a stale
   generation receives `E_UI_NOT_OWNER`.
4. **Bounds hold.** A 257-event burst keeps the newest 256 with `overflowed`
   true; a 4097-byte single event is rejected; a 31-second idle session is
   released with reason `timeout` while an actively polled session survives.
5. **No hot-path execution.** Input-path tests show no synchronous plugin
   callback during capture; latency probes show plugin load does not breach
   hot-path budgets.
6. **Capability denial.** Without `ui.overlay.focus`, every call fails with
   `E_CAPABILITY_DENIED` naming the capability; the same denial suite passes
   against an official plugin unchanged (parity).
7. **Paste stays inspected.** Suspicious paste content delivered into capture
   still triggers inspection; the extension cannot bypass the inspector or
   reach an uninspected path.
8. **Safe mode stays clean.** `bitty --safe` presents no focusable surface,
   acquire returns `E_UI_UNAVAILABLE`, and the retained Core edit path accepts
   input.
9. **Compatibility fails closed.** A version mismatch disables the plugin with
   a diagnostic and no partial activation.
10. **Documentation gates pass.** The repository-local `just check` passes with
    zero issues.

## Alternatives considered

| Alternative                                                  | Disposition                                                                                                                                                    |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Separate `input.capture` capability beside the overlay grant | Rejected: capture without a visible focused surface would be invisible input interception; the coupled grant keeps capture visibly bound to its surface.       |
| Top-level `bitty.overlay.*` namespace as provisionally named | Rejected: it consumes a new top-level namespace and breaks namespace and capability alignment with `bitty.ui` and `ui.*`; decided as `bitty.ui.overlay.*`.     |
| Event-push model with Core-invoked input callbacks           | Rejected: it would put plugin code on the input hot path and let a faulty extension pin the terminal; Core enqueues and the owner polls.                       |
| Overflow auto-releases the session                           | Rejected: fast typing would kill the session it feeds; drop-oldest with a sticky flag keeps the producer non-blocking and the owner informed.                  |
| Overflow fails open to the terminal                          | Rejected: captured keys would leak to the shell; the queue keeps them and reports staleness instead.                                                           |
| Absolute wall-clock session cap instead of an idle timeout   | Rejected: it would kill slow, legitimate interactions; the 30-second idle timeout bounds abandonment while active use survives.                                |
| Second acquire preempts the first owner                      | Rejected: last-loaded-wins arbitration lets any plugin steal focus; the single owner keeps its session and the newcomer fails closed.                          |
| Reuse the v1 non-focusable `overlay` slot with a focus flag  | Rejected: it redefines an accepted v1 semantic; the v1 slot stays presentation-only and the focusable surface is a distinct v2 grant.                          |
| Decide submit-to-PTY and editor-launch spellings here        | Rejected: those are terminal-input and execution operations with their own owners; this contract records only the `submitted` disposition, not the write path. |

## Affected contracts

- [ADR 0016 - Execution, Graphics, Accessibility, Storage, and Platform-Service Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md):
  the `W-01` host API now has its accepted contract; the safety constraints are
  preserved unchanged.
- [ADR 0015 - Small-Core Extraction Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md):
  Boundary 4 extraction (`W-103`) remains gated on this contract, `W-73`, and
  `W-82`.
- [Composer Boundary](composer-boundary.md) (`W-73`): its parked spellings,
  payloads, and timeout values are now decided here; the dependency table and
  Core-owned guarantees are unchanged.
- [Composer Architecture and Host API](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/composer-architecture.md)
  (`W-82`): its provisional `bitty.overlay.*` spellings are superseded by the
  decided `bitty.ui.overlay.*` spellings; its owner revises that page in a
  scoped change.
- [Beacon SDK Reconciliation](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/beacon-sdk-reconciliation.md):
  its blocked overlay and capture rows are unblocked at the contract layer by
  this document and stay blocked on the `W-28` mechanism and the SDK bindings.
- [Development index](README.md): routes to this document.
- [Open-question register](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/open-questions.md):
  this document closes no open question. The focusable-overlay and transient
  input-capture host API is the v2 scope of the open (deferred) `OQ-056`,
  tracked as Issue #396 (`W-01`); it stays open until the separate closeout
  task lands, and this document neither resolves nor reopens it.

## Open points

The following details are parked, not decided. Each park names the owning task
and the reason. None is a new global open question: none blocks the current
milestone beyond the already-open `OQ-056`, and no implementation evidence
forces one yet.

- **Key, pointer-coordinate, and IME composition field encodings** parked to
  the input-pointer and IME contract owners: this contract decides the event
  envelope and the `key`, `text`, `pointer`, and `paste` tags, not the
  per-type field shapes, and it opens no second input channel.
- **Overlay node types beyond the v1 set** parked to `W-82`: richer scene
  content is a terminal-architecture decision bounded by the per-update budgets
  above.
- **Submit-to-PTY and external-editor spellings** parked to `W-82` with the
  execution boundary: the proposed `terminal.input.submit` and
  `process.editor` identifiers and their request and outcome shapes are
  decided there under this contract's constraints.
- **SDK binding shapes, mock host, and conformance suite** parked to `W-139`
  with `W-120` and `W-43` for the overlay and Beacon portions: the binding
  derives from this contract and may not invent identifiers.
- **Mechanism internals** parked to `W-28`: data structures, scheduling, and
  tighter internal ceilings, which must match the identifiers, spellings,
  bounds, codes, and reasons decided here.
- **Search, copy-mode, and help adoption details** parked to their owning
  extraction tasks: which surface each hosts on this contract is decided there.

## Acceptance criteria

- The exact capability identifier `ui.overlay.focus` is decided, with the
  coupling rationale and the deny-by-default rule.
- The exact Lua spellings `bitty.ui.overlay.acquire`, `update`, `poll`, and
  `release` plus the `overlay.released` bus event are decided, with the rename
  rationale against the provisional spellings.
- The capture lifecycle states and every transition for cancel, submit
  disposition, focus switch, unload, crash, and timeout are decided, with
  guaranteed Core-performed release.
- The finite bounds (256-event queue, 4096-byte payloads and calls, v1 scene
  budgets per update, 30-second idle timeout, single global owner) are decided
  as values or value-policy.
- The typed failure modes, including the decided `E_UI_ALREADY_CAPTURED` and
  `E_UI_NOT_OWNER` codes and the reused v1 codes, are decided.
- The no-hot-path rule (`P0-AC-015`), Core-owned single-owner focus
  arbitration, safe-mode behavior, and versioning within v2 are stated without
  weakening any P0 control.
- The downstream consumers (Composer, search, copy-mode, help, Beacon
  sessions, `W-139` and `W-120` and `W-43` SDK work, `W-28` mechanism
  alignment) are named without deciding their content.
- What stays provisional names an owner for each item; no new global open
  question is fabricated and `OQ-056` is untouched.
- Nothing is described as implemented beyond citing the `W-28` mechanism as
  evidence; the document is self-contained and English-only with no
  placeholders.
- The development index routes to this document.
- `just check` passes with zero issues.

## P0 Review Sign-off

| Role                 | Scope                                                                         | Requirement                                                           |
| -------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `architecture-owner` | Capability, surface, lifecycle, arbitration, bounds, and versioning decisions | Approve; confirms the decided identifiers, spellings, and guarantees. |
| `security-reviewer`  | Input capture, focus arbitration, paste inspection, capability gates, bounds  | Independent security review required before merge.                    |
| `docs-curator`       | Taxonomy, metadata, links, terminology, and register synchronization          | Approve; confirms discoverability and schema.                         |

## References

- [bitty-docs#423](https://github.com/bitty-terminal/bitty-docs/issues/423)
  (CarryCtx `CTX-0273`, plan key `W-01` v2 host contract).
- [ADR 0016 - Execution, Graphics, Accessibility, Storage, and Platform-Service Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md)
  (the `W-01` host API under `OQ-056`) and
  [ADR 0015 - Small-Core Extraction Boundaries](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
  (Boundary 4).
- [ADR 0009 - Plugin API v1 Lua Surface Acceptance Resolution](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0009-plugin-api-v1-lua-surface.md)
  (authority split, frozen v1 surface, non-focusable `overlay` slot).
- [Composer Boundary](composer-boundary.md) (`W-73`),
  [Composer Architecture and Host API](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/composer-architecture.md)
  (`W-82`), and
  [Beacon SDK Reconciliation](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/beacon-sdk-reconciliation.md)
  (sibling consumer contracts with provisional spellings).
- [Security overview](../security/overview.md),
  [threat model](../security/threat-model.md),
  [risk register](../security/risk-register.md), and
  [P0 acceptance criteria](../security/p0-acceptance-criteria.md).
- [Documentation workflow](documentation-workflow.md) and
  [development index](README.md).
- [Terminal state and action invariants](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/terminal-state-rfc.md),
  [Input and Pointer Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/input-pointer-rfc.md),
  [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md),
  [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md),
  [Isolation and Resource RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/isolation-resource-rfc.md),
  and [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md).
