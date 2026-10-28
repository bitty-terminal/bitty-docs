---
title: bittyd P0 Evidence Plan
description: Executed P0-AC-019 and P0-AC-021 through P0-AC-026 evidence campaign for the bittyd local daemon, with per-item real-service status, commands, residual gaps, and no-claim status
category: security
audience: security-reviewer
document_type: register
status: draft
website_publish: false
sidebar_order: 38
---

# bittyd P0 Evidence Plan

## Document status

**DRAFT evidence plan; the first real-service campaign is recorded, and no P0
control is verified.** The
[bittyd Session-Host Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-session-host-contract.md)
is accepted. At `bitty` `6d0b6c65` the `bitty-daemon` crate carried library
primitives only; at `bitty` `d360b442` (2026-10-28, bitty#2607 / PR #2761) the
merged `bittyd start` service loop binds the endpoint and serves the method
catalog, while still starting no worker. The predecessor statement is
superseded by the campaign below.

This page lists, for every daemon P0 criterion, the exact proof the criterion
needs, the command or artifact that produces it, the owner, and the observed
status. The [Campaign evidence](#campaign-evidence-2026-10-28) section records
one Linux x86_64 run of the merged binary per row. A row is `supported`,
`partial`, or `blocked`; no row is `Verified` or `Mitigated`, no risk state
moves, and no criterion is satisfied by this page. Four campaign findings are
tracked as bitty#2763, bitty#2764, bitty#2765, and bitty#2766.

## Purpose and scope

Make the bitty#2608 evidence obligation executable before the first
implementation merge. The plan turns the accepted session-host and IPC
contracts into a checklist a security reviewer can audit without reconstructing
the proof from prose.

In scope:

- `P0-AC-021` through `P0-AC-026` adapted to the `bittyd` session host, plus
  the `P0-AC-019` safe-mode re-proof;
- the no-TCP, no-hidden-listener, daemon-absence, and safe-mode proofs;
- the mechanism evidence the review must inspect: control token, operator
  capability, host grant, observer grant, orphan reaping, audit sink, and
  idempotency stores;
- the review checklist for the bitty#2607 service-loop pull request.

Out of scope:

- the independent review verdict, the D-01 worker-enablement recommendation,
  and the ADR 0019 amendment;
- any daemon, transport, registry, audit-sink, or conformance-harness
  implementation;
- remote UI, remote attach, SSH, mobile control, and any network listener;
- risk-state changes and `Verified` claims.

## Normative sources this document must not weaken

Read this page together with, and subordinate to:

- the [security overview](overview.md), especially invariants 5, 6, 7, 9, and
  10;
- the [threat model](threat-model.md), including the local-daemon boundary and
  the same-uid residual;
- the [P0 acceptance criteria](p0-acceptance-criteria.md), criteria
  `P0-AC-019` and `P0-AC-021` through `P0-AC-026`;
- the [risk register](risk-register.md) and the
  [evidence matrix](evidence-matrix.md);
- the [risk evidence RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/risk-evidence-rfc.md),
  including RS-1 through RS-7 and the artifact-storage rules;
- [ADR 0008](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0008-headless.md)
  and [ADR 0019](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0019-bittyd-staging-advance.md);
- the [bittyd IPC Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-ipc-contract.md)
  for the frozen method, scope, refusal, and handshake surface;
- the [IPC and Agent RFC](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/specifications/ipc-agent-rfc.md)
  for the accepted local transport and scope posture.

Where this plan and a normative source disagree, the source wins and this page
is defective. The plan may narrow a proof obligation; it may never weaken a
pass threshold.

## Terminology

- **Evidence row**: one criterion, mechanism, or absence proof with a named
  producer and a state. A row is `pending` until a recorded run exists.
- **Precursor**: a merged unit or source-level test that exercises a component
  but not the real service. A precursor is `presence` evidence only; it never
  satisfies a P0 criterion.
- **Real-service driver**: the `bitty#2605` conformance driver that starts the
  real daemon on a native cell and exercises `C-*` and `V-*` vectors.
- **Fake server**: the consumer-side candidate peer. It is labeled
  `candidate-not-bittyd` and is never evidence for the real service.
- **Producer**: the command, test target, crash-injection run, or manual audit
  that creates the artifact.
- **Privileged setup**: a second uid or SID, a pid namespace, delegated cgroup
  v2, a seccomp-capable plugin host, or per-message credential capture. Missing
  setup produces a typed skip, never a pass.
- **Static refusal**: a closed, typed result code with no caller bytes, foreign
  identifiers, or free-form text.
- **Non-oracular refusal**: indistinguishable conditions produce the same
  observable result; a refusal never reveals whether a session, grant, token,
  or capability exists.
- **Recorded run**: a command, revision, cell, UTC date, exit code, and
  artifact hash or CI run URL, retained per the risk evidence RFC.
- **Campaign status vocabulary**: `supported` means a real-service run at the
  evidence revision produced the expected observable for the row's declared
  scope; `partial` means some sub-cases were observed and at least one named
  sub-case is blocked or pending; `blocked` means the merged code cannot
  exercise the row, or a recorded defect stops that item; `pending` means no
  run exists. None of these tokens is `Verified`; that word stays reserved for
  the independent auditor sign-off in the P0 Review Sign-off section.

## Evidence rules

1. No row leaves `pending` on code presence, a fake-server pass, a
   cross-compiled build, a unit test that does not exercise the real service,
   or a documentation statement.
2. The real-service rows run on Linux x86_64 natively. A second cell needs its
   own native-runner run; a passing build or emulation is not platform
   evidence.
3. A privileged row with missing setup records a typed skip and stays
   `pending`. A skip is not a pass and cannot be aggregated into one.
4. Every artifact names the `bitty` revision, the `bitty-ipc` revision when the
   service uses it, the cell, the UTC date, the exact command, the exit code,
   and the artifact digest or CI run URL.
5. Manual-audit reports live under `docs/security/audits/`. Local logs live
   under `recording/evidence/<risk>/<criterion>/`. CI-only evidence is cited by
   workflow run URL. This page names the intended artifact; it does not create
   one.
6. A `Verified` claim needs the independent security-auditor sign-off after
   the recorded run. This page records the campaign status
   (`supported`/`partial`/`blocked`) and never `Verified`; a campaign run is
   not an auditor artifact.
7. Artifacts never contain a real secret, token, bearer, argv, environment
   value, PTY byte, prompt, or provider payload. Seeded canaries are synthetic
   and unique per run.
8. A failed, flaky, or timed-out run is a failure. A rerun is recorded with
   both outcomes; the failed run is not deleted.
9. A command that cannot find its target is a setup failure, not a pass. The
   conformance crate and test-target names are frozen by bitty#2605; the vector
   ID is the stable key until then.
10. No row is downgraded because a mechanism is new, additive, or currently
    disabled. The worker-disabled state is a control, not an exemption.

## Evidence summary

| Row   | Criterion                       | Proof in one line                                                                                              | Producer                                                   | Owner                  | Status      |
| ----- | ------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------- | ----------- |
| EV-01 | `P0-AC-021` endpoint and peer   | Foreign uid/SID denied before parsing; owner-private endpoint; tamper exits 6; per-message credentials; no TCP | `C-02`, `C-16`, `V-25`, `V-26`, `V-28` real-service driver | Core terminal platform | `supported` |
| EV-02 | `P0-AC-022` per-action scopes   | Full scope-by-method matrix; inspect-only create denied; host consent and `process.spawn` both required        | `C-09`, `C-10`, `C-11`, `C-19` real-service driver         | Core terminal platform | `partial`   |
| EV-03 | `P0-AC-023` child scope         | Child environment and `/proc/self/fd` show only PTY slave and stdio; no token, capability, socket, or secret   | `C-12` real-service driver plus child descriptor probe     | Core terminal platform | `blocked`   |
| EV-04 | `P0-AC-024` read-only default   | Baseline has no `session.host`; metadata only; content needs `terminal.inspect`; worker kind refused           | `C-09` real-service driver plus Wheel adapter audit        | Core and `bitty-ai`    | `partial`   |
| EV-05 | `P0-AC-025` DevTools scopes     | Connection alone grants no `debug.*`; `session.*` never reaches a debug method                                 | `C-09` plus the existing `bitty-ipc` DevTools scope matrix | `bitty-ipc` and Core   | `partial`   |
| EV-06 | `P0-AC-026` secret minimization | Seeded-secret corpus never appears in audit, diagnostics, panic, or crash output; owner-private modes          | `C-07`, `C-14` real-service driver plus seeded-corpus scan | Core terminal platform | `partial`   |
| EV-07 | Daemon absence                  | `bitty --safe`, headless tests, CI, and a plain invocation work with no endpoint and no daemon process         | `C-08` plus the safe-mode/headless matrix                  | Core terminal platform | `partial`   |
| EV-08 | No TCP or hidden listener       | No TCP listener, no abstract socket, no `/tmp` fallback, and only the documented local endpoint after startup  | `V-28` plus the startup socket/fd scan                     | Core terminal platform | `supported` |
| EV-09 | Safe mode under hostile state   | `bitty --safe` starts with minimal built-in config and zero third-party plugins while the daemon is absent     | `P0-AC-019` hostile-fixture matrix re-run                  | Core terminal platform | `blocked`   |

The remainder of this page defines each row's proof, producer, negative tests,
artifact, owner, and status. `EV-07` through `EV-09` are the absence proofs the
session-host contract requires in addition to the six numbered criteria.

## Campaign evidence (2026-10-28)

**Run identity.** `bitty` `d360b442` (`origin/main`, bitty#2607 / PR #2761),
Linux x86_64, 2026-10-28. `cargo build -p bitty-daemon --locked` exited 0;
`bittyd --version` reported crate `0.0.30`, service API `1.0`. The precursor
suite `cargo test -p bitty-daemon --locked` reported 456 passed, 0 failed across
15 targets. Every daemon run used a fresh throwaway root:
`XDG_RUNTIME_DIR=$RT/run`, `XDG_STATE_HOME=$RT/state`, `HOME=$RT`, with `$RT`
under `/tmp/bitty/ctx-2608/<item>`; the real runtime and state directories were
never used. `$BITTYD` is the built binary. Raw transcripts are ephemeral and
are summarized here; formal auditor artifacts under `docs/security/audits/`
remain outstanding.

**Scope of this campaign.** This is a producer run, not an audit. It records
what the merged service loop actually does on one cell, names the defects it
exposed, and leaves every control `supported`, `partial`, or `blocked`. No row
is `Verified` or `Mitigated`, and no risk state moves.

For every row, the expected result is the proof obligation in its `EV-*`
section or the required evidence in its `ME-*` row above. The campaign tables
record the exact command, the observed result, and the residual gap; a
`blocked` row records why the merged code cannot produce the expected result.

### Criterion rows

| Row   | Status      | Command and evidence reference                                                                                                                                                                                                                            | Observed at `d360b442`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Residual gap                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EV-01 | `supported` | `env XDG_RUNTIME_DIR=$RT/run XDG_STATE_HOME=$RT/state $BITTYD start &`; `stat -c '%a %U %F'` on the endpoint, lock, operator, and audit paths; second `$BITTYD start`; userns, foreign-uid, and fd-pass probes; closing-refusal probes; tamper and `wait` | Directory `0700`, socket `0600`, lock and operator `0600`, audit directory `0700`, segment `0600`, all uid 1000. Second start exit 0 with `already running`; first keeps serving. `unshare -Ur` peer gets EOF at accept. A passed descriptor used by another pid gives `Unauthenticated` and one `a=wire c=unauthenticated` record. A foreign kernel uid (100001 via a two-line userns map) cannot connect (`EACCES` on the `0700` directory) and its frame on a passed descriptor is `Unauthenticated`. Closing refusals (second negotiate, pre-negotiate frame, wire version, service version, wrong capability) each deliver the typed frame and then a real EOF; a non-closing `NotFound` leaves the connection usable. No TCP listener; `/proc/net/unix` shows only the endpoint. Tamper with a regular file exits 6; directory mode `0755` exits 6; a SIGKILL stale socket is reclaimed under the lock; an override in a `0700` directory binds; an override in `0755` exits 1; a relative override exits 1; a missing `XDG_RUNTIME_DIR` exits 1 with no socket. | Native second-account uid/SID (`V-25`) is not available on this host (no root and no second account); userns plus foreign-uid-per-frame is the substitute. Formal audit artifact absent. Same-uid endpoint impostor residual stands.                                                                                                                                                                                                    |
| EV-02 | `partial`   | Real client over the socket (`session.create`, `attach`, `grant`, `grant.revoke`, `transfer`, `abort`, `kill`, `heartbeat`, `status`, `resize`, `debug.*`, `daemon.audit`) plus `cargo test -p bitty-daemon --test service_loop`                          | Baseline is exactly `session.inspect`, `session.attach`, `session.control`, `process.spawn`; no `terminal.*` and no `debug.*`. `daemon.status` and `daemon.host_grant` mint are `ScopeViolation`; create without consent is `ConsentRequired`; `kind: worker` is `UnsupportedCapability`; `session.resize` is `ScopeViolation`; `debug.inspect`, `daemon.audit`, and unknown methods are `NotFound`; a top-level `role` field is `InvalidRequest`. Create replay returns the original token before claim and `control_token: null` after claim; a different fingerprint is `IdempotencyConflict`; observer abort/transfer are `ControllerRequired`; a second controller is `ControlHeld`; transfer never returns the target token; the terminal session answers `NotRunning` to a former leaseholder.                                                                                                                                                                                                                                                                  | The `(spawn=false, host=false)` create case is unreachable because every connection gets transport `process.spawn` (bitty#2604 owns the executable policy). An absent `observer_grant` field is `InvalidRequest`, not `ObserverGrantRequired` (conformance item). Stale token at vacant control is `NotFound`, not `InvalidControlToken` (bitty#2765). Full scope-by-method matrix and the `C-09`/`C-19` artifact belong to bitty#2605. |
| EV-03 | `blocked`   | No worker-spawn path exists in the merged crate; `session.create` records metadata only                                                                                                                                                                   | `kind: worker` is refused before any process exists. There is no child pid, environment, or descriptor table to probe.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Blocked on the spawn path (bitty#2604) and `C-12`; no `close_range` or child `/proc/self/fd` proof exists.                                                                                                                                                                                                                                                                                                                              |
| EV-04 | `partial`   | Same real client as EV-02; inspect every session response field; Wheel adapter audit not in this repository                                                                                                                                               | Daemon half: baseline has no `session.host`; create needs the consumed grant; status/list carry metadata only (`session`, `attach_count`, `attached`, timestamps, `kind`, `generation`, `state`, `state_revision`, `terminal_id`) and no content field; `kind: worker` and `daemon.orphans.verify` are `UnsupportedCapability`; no session method returns terminal text, PTY bytes, scrollback, clipboard, prompt, or provider payload.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Wheel adapter labeling half is `bitty-ai`-owned and not run here (`P0-AC-024` split stays open).                                                                                                                                                                                                                                                                                                                                        |
| EV-05 | `partial`   | Handshake scope list from EV-02; every `session.*` scope held; `debug.inspect` and `daemon.audit` probes; `bitty-ipc` DevTools matrix not re-run in this workspace                                                                                        | A fresh connection and a connection holding all session scopes advertise no `debug.*`; `daemon.inspect`/`daemon.control` do not add one; a debug method resolves to `NotFound` through the normal catalog path; `terminal.*` stays absent.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | The pinned `bitty-ipc` DevTools scope matrix (`trace_scope_matrix_denies_inspect_and_unscoped`, `trace_redaction_and_input_gating`, `record_roundtrip_redacts_and_gates_input`) was not re-run for this campaign; the daemon handshake half is observed.                                                                                                                                                                                |
| EV-06 | `partial`   | Canary/secret scan over every audit segment plus stdout/stderr; rotation run at 90 requests/s; fail-closed run under `RLIMIT_FSIZE=4096` with `SIGXFSZ` ignored; 300-frame rate burst                                                                     | 10-record privacy run: no operator capability, host-grant, control-token, or observer-grant value appears; no raw `terminal_id`, idempotency key, correlation value, or refusal-param canary appears; every line uses only the closed field set; `terminal_id_digest` and a 32-hex correlation digest are present; modes `0700`/`0600`. Rotation: 6908 refusals plus the negotiate record, segments `audit.1.log` 1,048,482 B plus `audit.log` 151,554 B, 2 segments, 6909 well-formed records, 0 malformed. Fail-closed: at 4096 B the sink reports `audit_degraded: true`, `session.create` is `Denied/Internal`, active sessions stay 1, `daemon.stop` is `Denied/Internal`, and `SIGTERM` still exits 0. The tail ends in one partial record (bounded loss).                                                                                                                                                                                                                                                                                                       | Refusal aggregation is missing: 300 frames (199 `NotFound`, 101 `RateLimited`) produce only 20 `a=wire` records and no aggregate/suppressed-count record (bitty#2766). Crash or panic output was not injected; the core-dump control is absent (bitty#2764), so a crash artifact could carry tokens.                                                                                                                                    |
| EV-07 | `partial`   | `$BITTYD` with no arguments under a throwaway root; `BITTYD_ENDPOINT=$RT/missing.sock $BITTYD`; `bitty --safe` and headless suite not run here                                                                                                            | Plain invocation exits 0, creates no socket, capability file, or audit directory; a missing endpoint is a supported status-only path; `--version` and `--help` exit 0; an unknown argument exits 2.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `bitty --safe`, the headless suite, and the CI absence proof are terminal-side and belong to bitty#2605; not run in this campaign.                                                                                                                                                                                                                                                                                                      |
| EV-08 | `supported` | `/proc/<pid>/fd` socket inodes against `/proc/net/tcp`, `/proc/net/tcp6`, and `/proc/net/unix`; positive control with a Python TCP listener; override run                                                                                                 | The daemon holds no `LISTEN` row in either TCP table and no abstract socket; `/proc/net/unix` shows only the documented endpoint. The same scan detects a seeded Python TCP listener, so it is not vacuous. The override run binds the documented override path and adds no second listener at the derived path.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `V-28` formal artifact and a second cell remain with bitty#2605; abstract-socket check is Linux-only.                                                                                                                                                                                                                                                                                                                                   |
| EV-09 | `blocked`   | `bitty --safe` hostile fixture matrix not run                                                                                                                                                                                                             | The daemon-absence half is EV-07; the terminal safe-mode matrix is outside this workspace.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Blocked on the terminal `P0-AC-019` fixture run and bitty#2605.                                                                                                                                                                                                                                                                                                                                                                         |

### Mechanism rows

| Row   | Status      | Command and evidence reference                                                                                                                       | Observed at `d360b442`                                                                                                                                                                                                                                                                                                                                        | Residual gap                                                                                                                                                                                                       |
| ----- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ME-01 | `partial`   | Create and claim/transfer over the wire; token length and rotation; audit scan; `cargo test -p bitty-daemon --test leases`                           | Create returns a 64-hex token; claim rotates it; transfer rotates the target token and the requester never receives it; the target receives it on its next heartbeat; no token value appears in any audit record.                                                                                                                                             | Digest-only storage, constant-time compare, and zeroization are not observable over the wire; a stale token at a vacant control is `NotFound` (bitty#2765), so the claimed `InvalidControlToken` path is unproven. |
| ME-02 | `partial`   | Stat the runtime directory and capability file; read the bearer; restart; present the old bearer                                                     | Directory `0700`, file `0600`, uid 1000; the bearer is 64 hex; every start rotates it; the previous bearer is `Unauthenticated` on the new instance; the capability never appears in audit; the handshake is the only path that consumes it.                                                                                                                  | Constant-time comparison and the same-uid read residual are not measured; C-15/C-16 artifacts remain.                                                                                                              |
| ME-03 | `blocked`   | `daemon.host_grant` mint 8, ninth mint, revoke pending, consume, revoke consumed, create after revoke; observer grant mint/consume/revoke            | Eight pending grants are distinct; the ninth is `LimitExceeded`; a pending revoke is `revoked: true`; the grant is single-use at negotiate; TTL 300 s is advertised. **Consumed revoke returns `revoked: false, not_active: true`, and the consuming connection still creates a session.** The item stops here.                                               | bitty#2763: a consumed host grant cannot be revoked before its TTL; ME-03 stays blocked until it is fixed and re-run.                                                                                              |
| ME-04 | `partial`   | `session.grant` mint; attach wrong session, consume, replay, wait past the 60 s TTL, attach again                                                    | Grant is 64 hex with a 32-hex id and 60 s TTL; wrong-session, replay, and expired attaches are all `ObserverGrantRequired`; a valid attach is `observer`; grant revoke is idempotent.                                                                                                                                                                         | Wrong-peer is not reachable on a same-uid single-account host; `C-10` artifact remains.                                                                                                                            |
| ME-05 | `blocked`   | No worker is spawned by the merged crate; journal unit suite only                                                                                    | `daemon.orphans.verify` is `UnsupportedCapability`; there is no live worker to reserve, commit, or reap.                                                                                                                                                                                                                                                      | Blocked on the spawn/containment path (bitty#2604) and `C-03`/`C-13`; no crash injection or reused-pid real run.                                                                                                   |
| ME-06 | `partial`   | Same run as EV-06                                                                                                                                    | Content-free records, closed field set, owner-private modes, 1 MiB rotation with two segments and zero malformed lines, and fail-closed `Denied/Internal` with `audit_degraded: true` are observed.                                                                                                                                                           | bitty#2766 (no aggregate/suppressed-count record). `daemon.stop` is refused while degraded, which is consistent with fail-closed but means the signal path is the only shutdown.                                   |
| ME-07 | `supported` | Create replay before and after claim; fingerprint conflict; 128 create keys with 8 rounds of 16 creates and keyless kills; restart with the same key | Replay returns the original session and no token after claim; a different fingerprint is `IdempotencyConflict`; the 129th distinct key is `IdempotencyCapacity`; `session.kill` still succeeds at the full store; a repeat kill is `not_running`; `daemon.stop` still succeeds; after restart the same key creates a new session and the instance id changes. | Restart crash injection and the F-9 gate remain; `C-18` artifact pending.                                                                                                                                          |

### Findings filed by this campaign

| Finding    | Severity | Reproduction summary                                                                                                                                                                                            | Disposition                   |
| ---------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| bitty#2763 | P1       | Mint and consume a host grant; `daemon.host_grant revoke` returns `revoked: false, not_active: true`; the consuming connection still creates a session.                                                         | Tracked; ME-03 stopped.       |
| bitty#2764 | P1       | Running `bittyd` has `Max core file size unlimited` and a same-uid process can open `/proc/<pid>/mem`; a `PR_SET_DUMPABLE=0` control is denied. D-16 requires `RLIMIT_CORE=0` and a non-dumpable Linux process. | Tracked; EV-06/ME-06 partial. |
| bitty#2765 | P1       | Claim, detach, then present the old token at vacant control: `NotFound`, while the contract and README claim `InvalidControlToken`; no wire input reaches the token comparison.                                 | Tracked; EV-02/ME-01 partial. |
| bitty#2766 | P1       | 300-frame refusal burst: 199 `NotFound`, 101 `RateLimited`, only 20 `a=wire` records; 81 refusals leave no trace and no aggregate record carries the suppressed count or histogram.                             | Tracked; EV-06/ME-06 partial. |

### Residual observations from the bitty#2607 review

- **Wire-refusal suppression histogram.** The per-connection budget drops
  records past `refusal_audit_budget_per_sec` with no aggregate record. The
  README calls this a tracked follow-up; bitty#2766 now owns it.
- **`attach_role` spelling.** `session.attach` takes `attach_role`
  (`controller` or `observer`) in the request and returns `role` in the
  response. The ambient-authority validator reserves `role`, `auth`, and
  `scope`, so a top-level `role` request field is `InvalidRequest`. The
  conformance corpus (bitty#2664) must freeze this asymmetry; the daemon must
  not silently accept both spellings.
- **Absent observer grant field.** A `session.attach` with
  `attach_role: "observer"` and no `observer_grant` returns
  `Validation/InvalidRequest`, while a syntactically valid but unknown or
  consumed bearer returns `Denied/ObserverGrantRequired`. Freeze the
  absent-field class in bitty#2664; it reveals no existence fact, but the
  served code set differs from the refusal table's "lacks a valid grant" row.
- **Transport `process.spawn`.** Every connection receives transport
  `process.spawn`, so the both-missing create combination is reachable only in
  unit tests. The spawn path (bitty#2604) must take the grant from executable
  policy instead of the transport default.
- **Consumed host-grant revoke.** The #2761 merge risk named this blocker; the
  merged code still has it (bitty#2763).
- **Core dumps.** The daemon was dumpable with an unlimited core size on a host
  whose `core_pattern` pipes to `systemd-coredump` (bitty#2764).
- **`InvalidControlToken`.** The closed code is unreachable over the wire
  because visibility rejects a stale token first (bitty#2765).

## P0-AC-021 endpoint and peer credentials

**Proof obligation.** The real service accepts only a same-user peer on the
documented local endpoint. Peer identity is captured before any frame is
parsed. On Linux the accepted socket enables `SO_PASSCRED` and every request
frame carries `SCM_CREDENTIALS` matching the handshake peer uid and pid; a
missing credential, a different uid or pid, an inherited descriptor used by
another process, or a peer that exited before a privileged action produces
`Unauthenticated` and closes the connection without applying anything. The
runtime directory is `0700`, the socket is `0600`, both are owned by the
daemon uid, and a mode, owner, replacement, or symlink mismatch stops
acceptance and exits with code `6`. A second daemon start is refused while the
first holds the lock. The client's own owner/mode check is tamper detection,
not server authentication.

**Producer.** The `bitty#2605` real-service driver, vectors `C-02`, `C-16`,
`V-25`, `V-26`, and `V-28`, on Linux x86_64. The driver records the command,
the daemon pid, the endpoint metadata, the peer metadata, and the exact refusal
for each negative case. A helper process is required for the foreign-uid,
descriptor-passing, and peer-exit cases.

**Negative tests that must exist.**

- a foreign uid connection is refused before any request is parsed;
- a socket mode, owner, symlink, regular-file, or replacement mismatch is
  refused, and the daemon exits `6` for an accepted-socket tamper;
- a second daemon start is refused and the first keeps serving;
- an inherited descriptor presented by another process fails the per-message
  credential check on Linux and is recorded as a tested residual on cells
  without per-message credentials;
- a privileged action after the peer exits is refused with `Unauthenticated`
  and applies nothing;
- no TCP listener and no abstract-namespace socket exist after startup;
- the endpoint override is a path, not a credential, and still fails owner and
  mode checks.

**Artifact.** `docs/security/audits/bittyd-peer-credential-2026-xx.md` with the
recorded run and the `EV-08` socket scan. Until that report exists, the row is
not `Verified`.

**Owner.** Core terminal platform, with the `bitty-ipc` maintainers for the
per-message credential primitive.

**Status.** `supported` on Linux x86_64; the native second-account uid/SID vector remains blocked.

## P0-AC-022 per-action scopes

**Proof obligation.** Every request is authorized server-side against the
authenticated peer, the connection's effective scopes, and the session's
control relation. The `session.*` and `daemon.*` families are additive and
deny-by-default; no scope implies another, and `terminal.*` keeps its accepted
meaning. `session.host` is never baseline: `session.create` requires an
explicit per-client host grant and `process.spawn`, each decided before any
spawn. An inspect-only client cannot create a session; a `process.spawn` holder
without host consent cannot make the daemon host one; a client missing both
gets `ScopeViolation`, not `ConsentRequired`. An observer attach needs a
single-use observer grant. Control methods require the current controller lease
or the current control token at a vacant control relation; `session.control`
is necessary and never sufficient.

**Producer.** The `bitty#2605` real-service driver, vectors `C-09`, `C-10`,
`C-11`, and `C-19`, plus the full scope-by-method matrix the driver emits. The
matrix is the proof: every method row, every effective scope column, and the
expected allow or deny code. The driver also records the grant mint, consume,
expiry, revoke, and the token rotation sequence.

**Negative tests that must exist.**

- inspect-only `session.create` is `Denied/ScopeViolation`;
- `process.spawn` without host consent is `Denied/ConsentRequired`; host grant
  without `process.spawn` is `Denied/ScopeViolation`; both missing is
  `Denied/ScopeViolation`;
- an observer attach without a grant is `Denied/ObserverGrantRequired`; a
  consumed, expired, wrong-peer, or wrong-session grant is the same code;
- an observer cannot abort, transfer, mint, revoke, resize, or claim control;
  the result is `Denied/ControllerRequired`;
- a stale or rotated token at a vacant control is
  `Denied/InvalidControlToken`; a live controller elsewhere is
  `Denied/ControlHeld`;
- an unknown, collected, foreign, or invisible session is the same `NotFound`
  for a caller that holds the scope;
- `terminal.*` never grants a session administration method, and `session.*`
  never grants terminal content.

**Artifact.** `docs/security/audits/bittyd-scope-matrix-2026-xx.md` plus the
machine-readable matrix under
`recording/evidence/R-011/P0-AC-022/scope-matrix.json`.

**Owner.** Core terminal platform.

**Status.** `partial` (bitty#2765, the transport `process.spawn` default, and the observer-grant spelling observation).

## P0-AC-023 child process scope limitation

**Proof obligation.** A spawned worker receives an explicit bounded
environment, not the daemon's environment. It inherits only the PTY slave on
stdin, stdout, and stderr. Every daemon descriptor is `CLOEXEC`, and
`close_range(..., CLOEXEC)` runs before `exec`, so the daemon's endpoint
socket, lock descriptor, audit descriptors, idempotency state, control token,
operator capability, and service token cannot enter the child. The child
environment contains no control token, operator capability, host-grant bearer,
or daemon service credential.

**Producer.** The `bitty#2605` real-service driver, vector `C-12`, plus a child
probe that dumps `environ` and enumerates `/proc/self/fd`. The run records the
child pid, the exec path, the environment names (not values), the descriptor
targets, and the `close_range` call ordering. A `strace -f -e trace=close_range,execve`
trace may supplement the probe; it never substitutes for the child's own fd
enumeration.

**Negative tests that must exist.**

- the child environment has no daemon service token, control token, operator
  capability, host-grant bearer, or audit credential;
- the child fd table has no daemon endpoint socket, lock file, audit file, or
  idempotency-store descriptor;
- a child that calls `setsid` or `setpgid` remains inside the containment
  identity;
- the child cannot use an inherited listener or descriptor to act as the
  daemon;
- `close_range` runs before `exec` and a dropped `CLOEXEC` fails the probe.

**Artifact.** `docs/security/audits/bittyd-child-scope-2026-xx.md` plus the
child `environ`/`fd` dump under `recording/evidence/R-012/P0-AC-023/`.

**Owner.** Core terminal platform, with the `bitty-pty` maintainers for the
spawn path.

**Status.** `blocked` on the worker-spawn path (bitty#2604).

## P0-AC-024 Agent read-only default

**Proof obligation.** An Agent consumer that merely connects receives only the
baseline scopes and no content authority. `session.host` is absent from the
baseline; `session.create` is refused without an explicit host grant and
`process.spawn`; `worker_sessions` is `false` and `kind: worker` is
`Denied/UnsupportedCapability` before any process exists. `session.status`,
attach responses, and events carry metadata only. Terminal content requires a
live lease and `terminal.inspect`; input requires the controller lease and
`terminal.input`; resize requires the controller lease and `terminal.manage`.
An observer grant never carries content authority by itself. The baseline
`session.control` scope is necessary but never sufficient: without the
controller lease or the current control token it cannot abort, transfer, or
revoke another lease, and it never grants content. The daemon never places
terminal content in the session stream.

**Producer.** The `bitty#2605` real-service driver, vector `C-09`, for the
daemon half: baseline scopes, create refusals, metadata-only snapshots, worker
refusal, and the absence of a content field in every session response. The
consumer half is a Wheel adapter audit under `bitty-ai`: the adapter labels
every terminal-content response as untrusted observation data and does not
route it into an instruction channel. The daemon cannot prove the adapter's
labeling by itself.

**Negative tests that must exist.**

- an Agent connection without a host grant cannot create a session;
- an Agent with a host grant but no `process.spawn` cannot create a session;
- an Agent with no lease cannot read status or list another session;
- an observer lease receives metadata only and is denied content without
  `terminal.inspect`;
- an observer is denied input and resize;
- `kind: worker` is refused before spawn;
- no session response, event, or status field carries terminal text, PTY
  bytes, scrollback, clipboard, prompt, or provider payload.

**Artifact.** `docs/security/audits/bittyd-agent-readonly-2026-xx.md` plus the
Wheel adapter labeling audit recorded by `bitty-ai`.

**Owner.** Core terminal platform and `bitty-ai` (Wheel consumer).

**Status.** `partial` (daemon half supported; the Wheel adapter half is `bitty-ai`-owned and not run).

## P0-AC-025 DevTools scopes

**Proof obligation.** The session family does not grant, imply, or reach a
DevTools scope. `debug.inspect`, `debug.trace`, and `debug.control` remain
separate; a connection alone grants none of them; `session.*` never folds into
`daemon.*` or `debug.*`. The daemon handshake advertises no debug scope and
rejects a debug method through the normal unknown-method or scope path, not
through a session method.

**Producer.** The existing `bitty-ipc` DevTools scope matrix at its pinned
revision, re-run for this evidence, plus the `bitty#2605` handshake assertion
that the daemon's effective scopes contain no `debug.*`. The precursor tests
are `trace_scope_matrix_denies_inspect_and_unscoped`,
`trace_redaction_and_input_gating`, and
`record_roundtrip_redacts_and_gates_input`; they prove the existing DevTools
surface, not the daemon handshake. The daemon half is a negative matrix: every
`session.*` scope against every `debug.*` method, and a fresh connection
against each debug scope.

**Negative tests that must exist.**

- a fresh connection has no `debug.inspect`, `debug.trace`, or
  `debug.control`;
- a connection holding every `session.*` scope still has no debug scope;
- `daemon.inspect` and `daemon.control` do not imply a debug scope;
- a debug method is not dispatched through a session method or a session
  event;
- the `terminal.*` family remains unchanged.

**Artifact.** `docs/security/audits/bittyd-devtools-scope-2026-xx.md`, which
cites the `bitty-ipc` matrix and the daemon handshake run.

**Owner.** `bitty-ipc` maintainers, with Core terminal platform for the daemon
handshake.

**Status.** `partial` (daemon handshake half supported; the `bitty-ipc` DevTools matrix was not re-run for this campaign).

## P0-AC-026 secret minimization

**Proof obligation.** A seeded-secret corpus never appears in the daemon audit
sink, diagnostics, panic output, crash output, or an idempotency record. The
corpus seeds a control token, an operator capability, a host-grant bearer, an
observer-grant bearer, an idempotency key, argv values, environment values, a
cwd, terminal bytes, clipboard content, a prompt, a provider payload, a raw
`terminal_id`, and a raw correlation value. Audit records carry peer identity,
server-assigned client id, instance, session, generation, revision, action,
static result code, counts, limits, and the allowed target fields only. A raw
`terminal_id` is stored as `terminal_id_digest`; a raw correlation value is
hashed on receipt and only the digest is stored. Every audited string is valid
UTF-8, control-character free, and bounded. The sink is `0700`/`0600`, bounded,
and rotates with loss limited to the unflushed tail. Refusals are budgeted and
aggregated. Token-bearing structures use a redacted `Debug`; core dumps are
disabled and the process is non-dumpable on Linux. The daemon offers no audit
read method.

**Producer.** The `bitty#2605` real-service driver, vectors `C-07` and `C-14`,
plus a seeded-corpus scan: inject each canary through create, attach, grant,
abort, stop, refusal, and crash paths; then scan the audit segments,
diagnostics, panic output, and any crash artifact for every canary. The
precursor tests are `record_is_copy_fixed_size_and_has_no_content_fields`,
`terminal_transition_and_actor_facts_are_bounded_numeric_or_digest`,
`a_conflict_never_prints_the_raw_key`, and
`automation_capture_redacts_env_and_private_key_lines`; they prove component
redaction, not the daemon sink. The run records the canary set digest and the
scan result. It also asserts the file and directory modes, the rotation bound,
the refusal-budget aggregate, and the `audit_degraded` fail-closed mutation
behavior.

**Negative tests that must exist.**

- no seeded canary appears in the audit sink, diagnostics, panic text, or
  crash output;
- argv, environment, cwd, PTY bytes, clipboard, prompts, and provider payloads
  never appear in a record;
- raw `terminal_id` and raw correlation values never appear; only their
  digests do;
- the control token, operator capability, host-grant bearer, observer-grant
  bearer, and idempotency key never appear in a record or a `Debug` rendering;
- the sink directory is `0700`, each segment is `0600`, and rotation keeps at
  most the advertised segment count;
- a refusal flood produces the aggregated record with the suppressed count and
  code histogram, not one record per refusal;
- an unavailable sink refuses the privileged mutation with `Internal`, changes
  no state, and reports `audit_degraded=true`;
- no service method reads the audit sink.

**Artifact.** `docs/security/audits/bittyd-secret-minimization-2026-xx.md` plus
the canary manifest and scan log under
`recording/evidence/R-014/P0-AC-026/`.

**Owner.** Core terminal platform, with the `bitty-ipc` maintainers for the
shared redaction primitives.

**Status.** `partial` (bitty#2766 and bitty#2764; crash and panic output were not injected).

## Daemon absence, no-TCP, and safe-mode proofs

### EV-07 daemon absence

**Proof obligation.** With no daemon endpoint and no daemon process,
`bitty --safe`, the headless test suite, CI, and a plain invocation still work.
A missing endpoint is a normal supported state; the client returns a typed
no-endpoint result and never changes transport, starts a hidden listener, or
spawns a daemon.

**Producer.** `C-08` plus the existing `bitty` safe-mode and headless matrix at
the evidence revision. The run sets `BITTYD_ENDPOINT` to a missing path,
asserts no daemon process exists before and after each invocation, and records
the exit code and the typed no-endpoint result. It also runs the repository
headless suite with the endpoint absent.

**Negative tests that must exist.**

- `bitty --safe` starts and exits cleanly with no endpoint;
- a plain invocation does not spawn a daemon or create an endpoint;
- the headless suite passes with no endpoint;
- diagnostics do not require the daemon;
- a missing endpoint never selects TCP, an abstract socket, or a `/tmp`
  fallback.

**Artifact.** `docs/security/audits/bittyd-daemon-absence-2026-xx.md` plus the
invocation log under `recording/evidence/R-009/EV-07/`.

**Owner.** Core terminal platform.

**Status.** `partial` (`bittyd` absence supported; `bitty --safe` and the headless suite remain blocked).

### EV-08 no TCP or hidden listener

**Proof obligation.** After startup, the daemon process owns exactly the
documented local endpoint and no TCP listener, abstract-namespace socket, or
hidden fallback. The check inspects the live process, not only the source.

**Producer.** The startup socket/fd scan from `V-28`, recorded with the daemon
pid. On Linux, `lsof -nP -p "$BITTYD_PID" -iTCP -sTCP:LISTEN` must be empty,
`ss -ltnp | grep "pid=$BITTYD_PID"` must be empty, and the Unix-socket view
must show only the documented endpoint. The scan also inspects
`/proc/<pid>/fd` for any socket that is not the endpoint or a client
connection.

**Negative tests that must exist.**

- a startup scan shows no TCP listener;
- no abstract-namespace socket exists;
- no `/tmp` or other fallback endpoint exists;
- the only listening Unix socket is the documented endpoint under the
  owner-private runtime directory;
- an endpoint override does not create a second listener;
- the check fails when a test fixture adds a TCP listener.

**Artifact.** `docs/security/audits/bittyd-no-tcp-2026-xx.md` plus the `lsof`,
`ss`, and `/proc/<pid>/fd` capture under
`recording/evidence/R-011/EV-08/`.

**Owner.** Core terminal platform.

**Status.** `supported` on Linux x86_64; a second cell and the formal `V-28` artifact remain.

### EV-09 safe mode under hostile state

**Proof obligation.** `bitty --safe` starts with minimal built-in
configuration and zero third-party plugins against the full hostile-fixture
set, with the daemon absent. The daemon is not a startup, diagnostics, or
safe-mode dependency.

**Producer.** The `P0-AC-019` hostile-config and hostile-plugin matrix,
re-run at the evidence revision with `BITTYD_ENDPOINT` absent. The run records
the fixture set digest, the startup result, the loaded-plugin set (empty), and
the absence of a daemon process.

**Negative tests that must exist.**

- safe mode succeeds against the full hostile-fixture set;
- no third-party plugin loads;
- no daemon process or endpoint is created;
- a hostile configuration that references the daemon still starts safely;
- the safe-mode result is re-proved after any security-sensitive daemon
  change.

**Artifact.** `docs/security/audits/bittyd-safe-mode-2026-xx.md` plus the
startup log under `recording/evidence/R-009/EV-09/`.

**Owner.** Core terminal platform.

**Status.** `blocked` on the terminal `P0-AC-019` safe-mode fixture run.

## Mechanism review evidence

The review named by bitty#2608 also inspects the mechanisms the contract
introduces. These rows are not separate P0-AC criteria; they are the evidence
that the criterion rows above depend on.

| Row   | Mechanism           | Required evidence                                                                                                                                | Producer                                        | Owner                  | Status      |
| ----- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- | ---------------------- | ----------- |
| ME-01 | Control token       | 256-bit CSPRNG, returned once, digest-only storage, constant-time verify, rotation on claim and transfer, old token refused, no child/audit leak | `C-11`, `C-18`, `--test leases`, `--test audit` | Core terminal platform | `partial`   |
| ME-02 | Operator capability | Per-boot `0700`/`0600`, rotated, handshake-only, not inherited, not a consumer wire field, same-uid residual stated and tested                   | `C-15`, `C-16`, `--test peer`                   | Core terminal platform | `partial`   |
| ME-03 | Host grant          | Operator-only mint, single-use, TTL, peer-bound, revocable, audited, consumed at negotiate, one static code per missing authority                | `C-19`, `--test idempotency`                    | Core terminal platform | `blocked`   |
| ME-04 | Observer grant      | Single-use, TTL, attributed, revocable, no self-grant, wrong-peer/session/consumed/expired all one code                                          | `C-10`, `--test leases`                         | Core terminal platform | `partial`   |
| ME-05 | Orphan reaping      | Two-phase reserve/commit fsync, containment identity, reserved-record reap, pid-reuse never signalled, quarantine, crash injection               | `C-03`, `C-13`, `--test orphan_journal`         | Core terminal platform | `blocked`   |
| ME-06 | Audit sink          | Content-free records, bounded strings, `0700`/`0600`, rotation, refusal budget, `audit_degraded` fail-closed, no read method                     | `C-07`, `C-14`, `--test audit`                  | Core terminal platform | `partial`   |
| ME-07 | Idempotency stores  | Bounded descriptor stores, `(uid or SID, key)` create index, fingerprint conflict, keyless termination, restart residual, F-9 gate               | `C-18`, `--test idempotency`, `--test events`   | Core terminal platform | `supported` |

Mechanism rules:

- The control token is session-scoped. It is not a daemon-wide credential, and
  a same-uid process with `ptrace`, `/proc/<pid>/mem`, or a client debugger can
  read it from client memory. The review records that residual; it does not
  claim isolation.
- The operator capability is an intent gate. A same-uid adapter can read the
  file and become an operator. The review must confirm the contract says so
  and that no surface claims otherwise.
- The observer grant is the only path to observation. A connection with
  `session.attach` and no grant is denied.
- The orphan journal never signals a record it cannot verify. A crash between
  spawn and adoption on the subreaper fallback is the stated double-run
  residual; the adapter must not retry an unfenced create.
- The create-key store holds token-equivalent secrets. It is in memory, does
  not survive restart, and a lost create response is recovered only while the
  initial token is current.
- A full idempotency store can refuse only a keyed method. Termination and
  revocation are keyless and must still succeed.

## Review checklist for the bitty#2607 service-loop PR

Use this list for the independent review of the service-loop implementation.
The reviewer inspects the diff and the real-service run; a green CI job is a
gate, not a substitute for the inspection.

### What to inspect

- Endpoint derivation: `$XDG_RUNTIME_DIR/bitty/bittyd.sock` on Unix, a
  current-user named pipe on Windows, `BITTYD_ENDPOINT` as a path override, no
  `/tmp` fallback, no abstract socket, no TCP, no discovery service.
- Single-instance lock: held for the daemon lifetime, second start refused,
  stale socket removed only under the lock, lock and runtime-directory modes
  checked at startup and on a bounded interval.
- Accept path: peer credentials captured before any frame parse; Linux
  `SO_PASSCRED` plus per-message `SCM_CREDENTIALS`; other cells capture at
  accept and re-check the captured process identity before every privileged
  action.
- Pre-auth state machine: one `daemon.negotiate`, no pipelining, no frame
  before the negotiate response, bounded `negotiate_timeout_ms` and
  `pre_auth_max_bytes`, service-version range, immutable capabilities and
  limits.
- Scope registry: the `session.*` and `daemon.*` families are additive;
  `terminal.*` is unchanged; every method has exactly one required scope;
  scope is evaluated before target lookup; no scope implies another. The
  registry is the `bittyd`-owned table decided on 2026-10-28 (bitty#2607,
  bitty-terminal-docs#344); the `bitty-ipc` v1 families are consumed unchanged.
- Host consent: `session.host` is never baseline; `daemon.host_grant` is
  operator-only, single-use, TTL-bound, peer-bound, revocable, and audited;
  `session.create` intersects it with `process.spawn`; the both-missing result
  is `ScopeViolation`.
- Control relation: one controller lease, observers never self-grant, the
  token rotates on claim and transfer, an old token is refused, a terminal
  session answers `NotRunning`, and no method reveals or resets a token.
- Refusal path: closed static codes, no caller bytes, no foreign identifiers,
  no free-form audit label, no unknown code parsed as text.
- Audit path: content-free fields, digest-only targets, bounded UTF-8 strings,
  refusal budget, rotation, `audit_degraded` fail-closed mutations, no audit
  read method.
- Single writer: `bittyd` alone writes registry, lifecycle, counters, leases,
  attach count, and last-seen; no client path edits registry truth or signals a
  worker out of band.
- No content plane: session status, attach responses, and events carry no
  terminal text, PTY bytes, scrollback, or clipboard.
- Daemon absence: no startup, diagnostics, or safe-mode dependency; no hidden
  listener; a missing endpoint is a typed supported state.
- Worker state: `worker_sessions=false`; `kind: worker` is refused before any
  spawn; no in-process fallback is authorized.

### Negative tests that must exist in the PR

- foreign uid/SID denied before parsing; socket mode, owner, symlink, and
  replacement tamper; second instance refused; no TCP, abstract socket, or
  `/tmp` fallback;
- connected descriptor passed to another process fails `SCM_CREDENTIALS`; peer
  exit before a privileged action fails `Unauthenticated`; pid reuse is not
  signalled;
- inspect-only create denied; host consent and `process.spawn` matrix; observer
  self-attach denied; observer abort/transfer/resize denied; old token refused;
  second controller race refused; terminal `NotRunning`;
- unknown, collected, foreign, and invisible sessions produce the same
  `NotFound`; missing scope is decided before lookup; both-missing create is
  `ScopeViolation`; consent state is not revealed without `process.spawn`;
- major mismatch, client minor above server, duplicate negotiate, pre-auth
  frame, unknown method, and a method whose capability is absent each get the
  typed result and no half-honored surface;
- child environment and `/proc/self/fd` prove no daemon descriptor, token,
  capability, or secret; `close_range` runs before `exec`;
- seeded-secret corpus never appears in audit, diagnostics, panic, or crash
  output; modes, rotation, refusal budget, and `audit_degraded` fail-closed
  behavior are asserted;
- full idempotency store still allows `session.abort`, `session.kill`, and
  `daemon.stop`; duplicate create returns the original session; post-claim
  duplicate returns no token; fingerprint conflict applies nothing;
- crash injection between reserve and spawn, spawn and commit, and during reap
  leaves a defined record class; a reused pid is never signalled; a
  quarantined record is never signalled; no duplicate spawn on restart;
- plugin host `connect()` to the daemon endpoint fails (C-15); a typed skip is
  recorded when the seccomp setup is absent, not a pass;
- `bitty --safe`, headless tests, CI, and a plain invocation work with no
  endpoint; no daemon process is spawned.

### Refusals that must be static and non-oracular

| Condition pair or class                                                 | Required observable result                                                                                                             |
| ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Unknown, collected, foreign, or invisible session                       | One `NotFound`; no existence, ownership, or "never existed" distinction                                                                |
| Missing scope on a target method                                        | `Denied/ScopeViolation` before target lookup                                                                                           |
| Missing `process.spawn` and missing host consent at create              | `Denied/ScopeViolation`, never `ConsentRequired`                                                                                       |
| Missing, expired, revoked, consumed, or wrong-peer host grant           | `Denied/ConsentRequired` at create                                                                                                     |
| Missing, expired, consumed, wrong-session, or wrong-peer observer grant | `Denied/ObserverGrantRequired`                                                                                                         |
| Missing, stale, or rotated control token at a vacant control            | `Denied/InvalidControlToken`                                                                                                           |
| Visible observer or non-controller on a control method                  | `Denied/ControllerRequired`                                                                                                            |
| Live controller elsewhere, caller has no lease                          | `Denied/ControlHeld`                                                                                                                   |
| Unknown `Denied` code received from a peer                              | Static `Internal`, never parsed as text or treated as success                                                                          |
| Missing operator capability versus failed peer check at negotiate       | One static `Unauthenticated` refusal and close (decided 2026-10-28, bitty#2607); it must not reveal whether the capability file exists |
| Endpoint tamper, foreign peer, or descriptor mismatch                   | `Unauthenticated`; connection closes; nothing applies                                                                                  |
| Unsupported platform or disabled worker kind                            | `Denied/UnsupportedPlatform` or `Denied/UnsupportedCapability`; no weaker fallback                                                     |
| Audit sink unavailable for a privileged mutation                        | `Denied/Internal`, no state change, `audit_degraded=true`                                                                              |

Static means the code set is closed and the daemon never echoes caller text,
a path, a token, a bearer, or another session's fields. Non-oracular means the
observable result, shape, and timing class are identical for the conditions in
one row. A refusal that distinguishes "absent" from "denied" is a defect,
even when the audit record keeps the distinction internally.

### Merge blockers

- any control downgraded to a warning, a best-effort mode, or a silent
  fallback;
- a baseline `session.host`, a self-granted observer lease, or a static
  control token;
- a raw token, bearer, argv, env, PTY byte, correlation value, or terminal id
  in a refusal, audit record, event, or diagnostic;
- a second listener, a TCP socket, an abstract socket, or a `/tmp` fallback;
- a privileged action that runs before the peer re-check;
- a termination method that consults the idempotency store or returns
  `IdempotencyCapacity`;
- a fake-server result presented as real-service evidence;
- an operator revoke that returns `not_active` for a consumed host grant and
  leaves the consuming connection authorized (bitty#2763);
- a daemon that runs dumpable or with a nonzero core limit on Linux
  (bitty#2764);
- a closed refusal code that no request can produce, or a served code that
  differs from the frozen contract (bitty#2765);
- a refusal budget that drops records without the aggregate suppressed-count
  and histogram record (bitty#2766);
- a `Verified` or `Mitigated` claim without the audit artifact and independent
  sign-off.

## Security review

The reviewer must confirm all of the following before the P0 rows can move:

1. The endpoint and peer checks are enforced before parsing, and the
   per-message check is present on Linux. The connection-scoped cells state and
   test their residual instead of inheriting a Linux-only claim.
2. The scope matrix is complete, deny-by-default, and evaluated before target
   lookup. `session.host` and observer grants are never ambient.
3. The operator capability is described as an intent gate, not an isolation
   boundary, everywhere it appears.
4. The control token rotates, is bound to the controller lease, is stored as a
   digest, and never enters a child, audit record, or diagnostic.
5. The child environment and descriptor set are constructed, not inherited.
6. The orphan journal is two-phase, the containment identity is verified, and
   no unverified record is ever signalled.
7. The audit sink is content-free, bounded, owner-private, and fail-closed for
   privileged mutations.
8. Idempotency is bounded, termination is keyless, and the restart residual is
   stated.
9. Daemon absence is a supported state, and no hidden listener exists.
10. No accepted P0 criterion is downgraded. A mechanism that cannot be
    evidenced stays `pending` or `blocked` and the affected slice stays
    blocked.

The review also records the residuals the contract states instead of claiming
they are closed: same-uid endpoint impostor, live descriptor passing on
connection-scoped cells, plugin/native `connect()` until the seccomp negative
test lands, a spawned worker that reads the operator capability, and a
same-uid debugger or memory reader that obtains the control token. Audit is
not tamper-evident against the owner.

The 2026-10-28 campaign is review input, not a verdict. It leaves four
controls short of their own claims: consumed host-grant revocation
(bitty#2763), core-dump suppression (bitty#2764), the vacant-control
`InvalidControlToken` refusal (bitty#2765), and refusal aggregation
(bitty#2766). A `supported` row means the real service produced the expected
observable for that row's declared scope; it does not mean the control is
audited, and it does not close any of the ten review items above.

## Verification plan

1. Run the repository gates in the docs worktree: `just check`. This page adds
   no code and changes no schema.
2. Re-run the precursor suites at the evidence revision to confirm the
   primitives still exist:
   `cargo test -p bitty-daemon --lib`,
   `cargo test -p bitty-daemon --test endpoint`,
   `cargo test -p bitty-daemon --test peer`,
   `cargo test -p bitty-daemon --test audit`,
   `cargo test -p bitty-daemon --test idempotency`,
   `cargo test -p bitty-daemon --test orphan_journal`,
   `cargo test -p bitty-daemon --test leases`,
   `cargo test -p bitty-daemon --test limits`,
   `cargo test -p bitty-daemon --test events`, and
   `cargo test -p bitty-daemon --test binary`.
   These are precursor runs only; they do not satisfy any row above. The
   2026-10-28 campaign ran the whole crate suite at `d360b442`: 456 passed,
   0 failed across 15 targets.
3. Run the real-service driver from bitty#2605 for `C-02`, `C-07`, `C-08`,
   `C-09`, `C-10`, `C-11`, `C-12`, `C-13`, `C-14`, `C-16`, `C-18`, `C-19`,
   `V-25`, `V-26`, and `V-28` on Linux x86_64. The driver target and crate
   names are frozen by that issue; the vector IDs are the stable keys. The
   2026-10-28 campaign exercised the same behaviors with ad-hoc clients, not
   with the frozen driver; the campaign does not substitute for this step.
4. Produce the manual-audit report and the local artifact set for each row.
   Link the report from the evidence matrix and record the PR, revision, cell,
   and run URL in CarryCtx. The campaign transcripts are ephemeral; the
   formal artifacts are still absent.
5. Obtain independent security-auditor sign-off. Until then every row is
   `supported`, `partial`, or `blocked`, never `Verified`, and every linked
   risk stays `Open`.

## Open points

1. **Operator-capability refusal code.** The IPC contract leaves the exact
   static code for a missing capability versus a failed peer check open. The
   reviewer must choose one code that does not reveal whether the capability
   file exists, and the conformance corpus must pin it. The 2026-10-28 campaign
   observed one static `Unauthenticated` refusal plus close for a wrong bearer,
   and the previous bearer is refused the same way after a restart.
2. **Session-scope registry home.** The `session.*` and `daemon.*` families
   may be registered in `bitty-ipc` or in a bittyd-owned additive registry.
   The reviewer must confirm one additive registry and no change to any
   existing `bitty-ipc` scope. The campaign observed the bittyd-owned catalog:
   no v1 method was redefined, and the handshake advertised no `debug.*` or
   `terminal.*` scope.
3. **Unkeyed duplicates.** `session.resize` and `daemon.host_grant` mint are
   unkeyed and not deduped by generation. The reviewer must accept the
   duplicate-effect semantics or require a key or fingerprint.
4. **Observer-attach replay.** The grant is consumed before the idempotency
   store, so a replayed observer attach is `ObserverGrantRequired` rather than
   a duplicate descriptor. The campaign observed exactly that code for a
   consumed grant. The reviewer must accept that ordering or require a
   compatible replay rule.
5. **Exact JSON and frame layout.** Key spellings and frame layout are frozen
   by bitty#2664 and the conformance corpus, not by this plan. A divergence
   between the corpus and the contract is a defect. The campaign observed two
   spellings that need freezing: `session.attach` takes `attach_role` and
   returns `role`, and an absent `observer_grant` field is
   `Validation/InvalidRequest` while an unusable bearer is
   `Denied/ObserverGrantRequired`. A top-level `role` request field is
   `InvalidRequest` because the ambient-authority validator reserves it.
6. **P0-AC-024 split.** The daemon has no content plane, so it cannot prove
   the untrusted-labeling half of P0-AC-024 by itself. The Wheel adapter audit
   owns that half. The reviewer must confirm both halves are required and
   neither is waived.
7. **P0-AC-024 consent strength.** The host grant is an intent gate that a
   same-uid adapter can mint after reading the operator capability. The
   reviewer must decide whether that satisfies "per-client consent" for the
   Agent path or whether a stronger human-approval step is required before
   worker hosting.
8. **Subreaper double-run residual.** A crash between spawn and adoption on
   the subreaper fallback cannot be fenced by pid. The reviewer must accept
   the quarantine rule and the adapter's no-unfenced-retry rule or require a
   stronger containment identity.
9. **Audit tamper evidence.** The sink is owner-private but not tamper-evident
   against the owner. The reviewer must accept that limit or require a
   tamper-evident sink in a later contract.
10. **Platform cells.** Windows integrity-level and AppContainer details, the
    macOS/BSD per-message credential equivalent, and cgroup v2 delegation
    fallbacks remain review input beyond the Linux x86_64 rule. The campaign
    compile-checked the typed `UnsupportedPlatform` path for
    `x86_64-apple-darwin`, `aarch64-apple-darwin`, and
    `x86_64-pc-windows-msvc`; no native refusal was run on those cells.

## Acceptance criteria

- Every `P0-AC-021` through `P0-AC-026` row states the proof, the producer, the
  negative tests, the artifact, the owner, and a status (`supported`, `partial`,
  `blocked`, or `pending`).
- The daemon-absence, no-TCP, and safe-mode proofs are separate rows with
  commands and artifacts.
- The mechanism review covers the control token, operator capability, host
  grant, observer grant, orphan reaping, audit sink, and idempotency stores.
- Every refusal class in the checklist is static and non-oracular, and the
  no-existence-oracle pairs are named.
- No row is `Verified` or `Mitigated`; no risk state moves. The 2026-10-28
  campaign records `supported`, `partial`, and `blocked` observations only.
- The page is English-only, self-contained, and free of research-repository
  references.
- `just check` passes in the `bitty-docs` worktree.

## P0 Review Sign-off

This is a plan, not a P0 gate. It records no approval of any control.

| Reviewer                          | Required for                                                            | Status  |
| --------------------------------- | ----------------------------------------------------------------------- | ------- |
| Core terminal platform            | Producer ownership, command truth, and artifact paths                   | Pending |
| Independent security reviewer     | Proof sufficiency, no-oracle rules, residuals, and no control downgrade | Pending |
| Independent documentation curator | Status, spine, terminology, links, and English-only content             | Pending |

## References

- [bittyd Session-Host Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-session-host-contract.md)
  - accepted decisions D-01 through D-18, the conformance matrix, and the
    trust-boundary residual section.
- [bittyd IPC Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-ipc-contract.md)
  - frozen method catalog, scope families, handshake, authorization order, and
    refusal taxonomy.
- [bittyd Session-Host Contract Promotion Record](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-session-host-promotion-record.md)
  - owner sign-off, review scope, and the F-9/F-12 slice gates.
- [Security overview](overview.md), [threat model](threat-model.md),
  [P0 acceptance criteria](p0-acceptance-criteria.md),
  [risk register](risk-register.md), and [evidence matrix](evidence-matrix.md).
- [Risk evidence RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/risk-evidence-rfc.md)
  - RS-1 through RS-7, evidence taxonomy, and artifact storage.
- [ADR 0008](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0008-headless.md)
  and [ADR 0019](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0019-bittyd-staging-advance.md).
- [bitty #2608](https://github.com/bitty-terminal/bitty/issues/2608) - the
  security review and P0 evidence issue.
- [bitty #2607](https://github.com/bitty-terminal/bitty/issues/2607) - the IPC
  service-loop slice this checklist reviews.
- [bitty #2605](https://github.com/bitty-terminal/bitty/issues/2605) - the
  conformance harness that owns the real-service driver and vector IDs.
- [bitty PR #2761](https://github.com/bitty-terminal/bitty/pull/2761) - the
  merged service loop reviewed at `d360b442`.
- [bitty #2763](https://github.com/bitty-terminal/bitty/issues/2763) - a
  consumed host grant cannot be revoked before its TTL.
- [bitty #2764](https://github.com/bitty-terminal/bitty/issues/2764) - the
  daemon does not disable core dumps or clear the Linux dumpable flag.
- [bitty #2765](https://github.com/bitty-terminal/bitty/issues/2765) - the
  vacant-control stale-token refusal is `NotFound`, not `InvalidControlToken`.
- [bitty #2766](https://github.com/bitty-terminal/bitty/issues/2766) - the
  wire-refusal budget drops records without the D-16 aggregate and histogram.
- [bitty #2664](https://github.com/bitty-terminal/bitty/issues/2664) - the
  conformance corpus that freezes the JSON and frame spelling.
- [`bitty-daemon` README at `d360b442`](https://github.com/bitty-terminal/bitty/blob/d360b442/crates/bitty-daemon/README.md)
  - the service-loop scope statement and the remaining deferred slices.
