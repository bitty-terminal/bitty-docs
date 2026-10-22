---
title: ADR 0019 - bittyd Staging Advance to the v0.2.0 Slice
description: Advances the local daemon from post-v1.0 to post-0.1.0 with a minimal v0.2.0 scope, amending only ADR 0008 staging clause while its definitions, ownership rules, bounded persistence, and both trust-boundary gates stay authoritative
category: decisions
audience: maintainer
document_type: specification
status: accepted
website_publish: true
sidebar_order: 49
---

# ADR 0019 - bittyd Staging Advance to the v0.2.0 Slice

## Document status

Accepted on 2026-10-22 by the project initiator as an owner decision recorded on
[bitty-docs#458](https://github.com/bitty-terminal/bitty-docs/issues/458). This ADR
changes the **staging position** of the local daemon and nothing else. It
authorizes no implementation, adds no crate, binary, service file, or autostart
entry, describes no implemented behavior, and weakens no normative control. The
lifecycle is `Draft -> owner review -> Accepted (2026-10-22) -> normative`.

- Deciders: project initiator (owner decision, 2026-10-22).
- Vehicle: a new ADR rather than a rewrite of
  [ADR 0008](ADR-0008-headless.md). Accepted records are extended by dated or
  superseding records, never silently rewritten; ADR 0008 stays accepted history
  and owns the daemon definitions, ownership rules, and both trust-boundary gates.
- Related: [ADR 0008 - Headless Daemon, Detach/Reattach and Remote UI Trust
  Boundary](ADR-0008-headless.md); [OQ-020](../open-questions.md);
  bitty [#2064](https://github.com/bitty-terminal/bitty/issues/2064) (daemon core
  service host), [#2065](https://github.com/bitty-terminal/bitty/issues/2065)
  (SSH service), [#2066](https://github.com/bitty-terminal/bitty/issues/2066)
  (mobile control plane), [#2218](https://github.com/bitty-terminal/bitty/issues/2218)
  (multiplexer story); direction records `DIR-026` (execution host and supervisor
  boundary) and `DIR-029` (remote infrastructure boundary).

## Purpose and scope

Three canonical records disagreed about when the local daemon may exist:

- ADR 0008 (accepted 2026-08-28) defers it to post-v1.0 and states that "no code
  in `bitty` may assume `bittyd` exists before that gate";
- `bitty-terminal-docs/product/release-ladder.md` repeats "post-v1.0 candidates";
- bitty#2064 is scheduled in milestone `v0.2.0` with the note "Post-0.1.0".

In scope:

- the staging point for the local daemon;
- the minimal v0.2.0 slice and its explicit exclusions;
- which ADR 0008 clauses stay authoritative and unmodified;
- the documentation corrections that follow from this decision.

Out of scope and not decided here:

- any implementation, crate, binary, unit file, or autostart behavior;
- the threat model, its acceptance evidence, and the P0 acceptance criteria that
  own the daemon's security acceptance;
- the remote transport, remote UI, and mobile control plane;
- persistent sessions that survive a daemon restart;
- the SSH service scope and the multiplexer design, each owned by their own issue.

## Context

ADR 0008 was written when the delivery sequence parked the daemon after v1.0, and
its restraint is still correct about **security**: the local daemon introduces the
transition from an untrusted GUI or `bitty ctl` client to an authenticated daemon
to PTY and host primitives, and the remote frontend introduces a second, strictly
stronger transition. Neither gate has been satisfied yet.

What changed is the delivery intent. The `v0.2.0` milestone already schedules the
daemon core service host and the services that need it, and bitty#2064 already
records the correct preparation step for the pre-0.1.0 window: keep services
behind interfaces and keep no daemon-shaped state in terminal globals. A milestone
is not an authorization, however. Leaving the accepted records stale means the
corpus no longer describes the plan, and ADR 0008's hard clause ("no code may
assume `bittyd` exists") becomes unenforceable because nobody can tell which
record is current.

Two further facts shape the decision. First, the architecture already carries the
prerequisites: the renderer consumes snapshots only, `terminal_id` is stable, the
per-domain single-writer rule exists, `bitty-ipc` already provides local framing,
peer credentials, and payload ceilings, and the panel lifecycle already models
"suspended but attached". Second, the capabilities that genuinely require a
long-lived process — surviving GUI close, sharing one session across clients,
central secret and connection ownership, audit aggregation, and any remote
endpoint — cannot be provided inside a per-window process at all.

## Decision

### D1 - The local daemon advances to the v0.2.0 slice

`bittyd` enters the v0.2.0 delivery slice as a local, per-user, single-instance
host process. This supersedes only the staging sentence of ADR 0008. The daemon
remains privileged infrastructure rather than an extension: it may hold connection
pools, secrets, the audit ledger, and the pairing endpoint, and it is never
loadable or replaceable through the extension system.

### D2 - The v0.2.0 slice is deliberately minimal

The slice is limited to:

- single instance per user enforced by a socket lock, with cross-user denial;
- an IPC handshake with peer-credential authentication re-checked before each
  privileged action;
- GUI and `bitty ctl` acting as thin clients, with attach and detach at session
  granularity;
- the per-domain single-writer statement, restated in code: the grid belongs to
  the render process, while connections, secrets, and audit belong to the daemon;
- service API versioning from day one, so a client and a daemon from different
  releases can negotiate or refuse rather than half-work.

Explicitly outside the slice:

- remote UI, remote attach, and the mobile control plane;
- persistent sessions that survive a daemon restart;
- any change to plugin capability grammar or to the six-layer effective-capability
  intersection;
- autostart as a requirement. The v0.2.0 slice must be usable when the daemon is
  started explicitly.

### D3 - Every ADR 0008 gate stays authoritative

The following remain normative and unmodified:

- single ownership of a PTY; two owners is a conformance violation;
- session-grained attach and detach, with `terminal_id` surviving detach;
- bounded persistence: maximum terminals per daemon, maximum scrollback cells and
  image-store bytes per terminal, and maximum aggregate memory, all bounded and
  all reusing the existing ceiling-is-upward-only attribution rules;
- containment: a fault in one terminal or one plugin generation must not take the
  daemon down, and a refused auth, scope, rate-limit, or payload failure must
  leave no partial session state;
- attributed enforcement records for every refusal;
- the local trust-transition evidence set: peer-credential authentication at least
  as strong as the IPC RFC, per-request server-side scope evaluation with the IPC
  families, rate limits and payload ceilings at least as tight as RC-9/RC-10,
  secret minimization per R-014 and P0-AC-026, and `bitty --safe` still functional
  with the daemon absent.

A daemon implementation that cannot produce this evidence does not ship, regardless
of the milestone.

### D4 - Remote stays later and separate

The remote transition keeps its own gate and its own ADR. Accepting a local daemon
never implies accepting a remote frontend, and no scope granted to a local client
covers a remote method. The remote ADR must still demonstrate network
authentication at least as strong as mutual transport with a pinned CA or
SSH-tunnel trust, encryption in transit, replay resistance, a separate consent
ledger for `(remote identity, AgentId)`, and a network-exposed fuzz and property
corpus for the framing wire.

### D5 - Daemon absence remains a supported state

Bitty must run and diagnose itself without the daemon: `bitty --safe`, headless
tests, CI, and single-window use keep working with no daemon present. The daemon
may not become a hard dependency of startup, diagnostics, or safe mode, and it must
not introduce a hidden local listener that exists to make daemon experiments work.

### D6 - The pre-0.1.0 preparation is unchanged

The requirement in bitty#2064 that services sit behind interfaces and that no
daemon-shaped state lives in terminal globals stays as the preparation for this
slice. It does not authorize daemon code before 0.1.0; it only prevents the
single-process tree from growing state that would have to be torn out later.

## Consequences

### Architecture

The Terminal/View/Layout separation and snapshot-only renderer coupling become
load-bearing rather than merely accommodating. A future `bitty-daemon` or
`bitty-headless` crate may depend on `bitty-term-state`, `bitty-pty`, and
`bitty-plugin-host`; those crates must never depend on the daemon, and the
dependency graph stays one-way. Services that will move to the daemon must be
introduced behind interfaces with a single implementation, so the process boundary
is a wiring change rather than a rewrite.

### Security

The v0.2.0 slice adds an attack surface that the current single-process tree does
not have: an authenticated local socket, a privileged process holding secrets, and
a client that is no longer the sole owner of its PTY. That surface is accepted only
together with the evidence set in D3 and with the security corpus as co-owner of
the change. Remote remains a strictly larger increase and stays deferred.

### Delivery

The v0.2.0 slice is smaller than the full daemon proposal: no persistence across
daemon restart, no remote transport, no autostart requirement. Issues #2065 (SSH
service), #2066 (mobile control plane), and #2218 (multiplexer design) keep their
own scopes; #2218 in particular must still decide whether detach and attach are a
Core mechanism, an extension, or a seam, and it may proceed with a weaker
in-process story before the daemon exists.

### Documentation

ADR 0008 gains an amendment note pointing here; its decision text stays as accepted
history. `release-ladder.md` stops calling the local daemon a post-v1.0 candidate
and separates the local staging from the remote gate. bitty#2064 is linked to this
record so the milestone and the authorization agree.

## Alternatives considered

- **Keep post-v1.0 and move bitty#2064 back.** Rejected: the milestone expresses
  current delivery intent, the interface preparation is already required, and the
  capabilities that need the daemon cannot be delivered inside a per-window
  process at any point. Leaving the issue in a future milestone would only postpone
  the reconciliation.
- **Advance everything, including remote UI.** Rejected: the remote transition is a
  strictly larger trust change with its own evidence obligations, and ADR 0008
  already separates the two gates deliberately.
- **Rewrite ADR 0008 in place.** Rejected: accepted records are extended by dated
  or superseding records so that the original reasoning and its security analysis
  remain auditable.
- **Declare the milestone authoritative without a record.** Rejected: a milestone is
  scheduling, not authorization, and it cannot enforce the daemon's evidence gates.

## References and verification gates

Before any daemon code lands in the v0.2.0 slice, the implementation must produce:

- a threat model update covering the local daemon transition, co-owned by the
  security corpus;
- peer-credential authentication evidence, re-checked per privileged action, with
  tamper detection that fails closed;
- per-request scope evaluation evidence using the IPC capability families;
- rate-limit and payload-ceiling evidence at least as tight as RC-9/RC-10, with
  shed-newest and attribution;
- secret minimization evidence: no secret in traces, diagnostics, crash reports,
  prompts, or logs, with `0600`/`0700` file modes;
- daemon-absent behavior evidence: safe mode, headless tests, CI, and a plain
  invocation all work with no daemon;
- bounded-persistence evidence with explicit caps and attributed enforcement
  records;
- a single-owner PTY conformance test, including the two-owner rejection.

Canonical sources: [ADR 0008](ADR-0008-headless.md) (definitions, ownership,
persistence, both gates), [Security Overview](../../security/overview.md),
[Threat Model](../../security/threat-model.md), [Risk Register](../../security/risk-register.md),
[P0 acceptance criteria](../../security/p0-acceptance-criteria.md), and the
[IPC and Agent RFC](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/specifications/ipc-agent-rfc.md)
for the local framing, scope, and rate-limit families.
