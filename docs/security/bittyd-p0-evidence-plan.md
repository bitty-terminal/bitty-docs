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

**DRAFT evidence plan; the first real-service campaign is recorded, refreshed
after the merged fixes, and no P0 control is verified.** The
[bittyd Session-Host Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-session-host-contract.md)
is accepted. At `bitty` `6d0b6c65` the `bitty-daemon` crate carried library
primitives only; at `bitty` `d360b442` (2026-10-28, bitty#2607 / PR #2761) the
merged `bittyd start` service loop binds the endpoint and serves the method
catalog, while still starting no worker. At `bitty` `adb15d15` (2026-10-28) the
four P1 campaign defects (bitty#2763 through bitty#2766, PR #2770), the two
corpus known defects (bitty#2767 and bitty#2768, PR #2776), and the frozen
conformance harness (bitty#2605, PRs #2769 and #2771) are merged. The
predecessor statements are superseded by the campaign and the refresh below.

At `bitty` `6c229e9c` (2026-10-30) the containment slice (PR #2801,
bitty#2791), the worker-spawn slice (PR #2808), the event wire (PR #2811), the
request deadline (PR #2815), and the 1.2 metadata keys (PR #2816) are merged;
the [reverification campaign](#reverification-campaign-2026-10-30) records a
fresh Linux x86_64 run of that binary. That run moves `EV-03` and `ME-05` off
`blocked`, leaves every other row at or below its prior state, and verifies no
control: every row stays `supported`, `partial`, or `blocked`.

This page lists, for every daemon P0 criterion, the exact proof the criterion
needs, the command or artifact that produces it, the owner, and the observed
status. The [Campaign evidence](#campaign-evidence-2026-10-28) section records
one Linux x86_64 run of the merged binary per row and the 2026-10-28 refresh
that re-cites the merged regression tests; the
[reverification campaign](#reverification-campaign-2026-10-30) records the
worker, containment, event, deadline, and metadata slices merged after them. A
row is `supported`, `partial`, or `blocked`; no row is `Verified` or
`Mitigated`, no risk state moves, and no criterion is satisfied by this page.
No consumer, security, or documentation sign-off is recorded here.

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
| EV-02 | `P0-AC-022` per-action scopes   | Full scope-by-method matrix; inspect-only create denied; host consent and `process.spawn` both required        | `C-09` (control-token refusal), `C-10`, `C-11`, `C-19`     | Core terminal platform | `partial`   |
| EV-03 | `P0-AC-023` child scope         | Child environment and `/proc/self/fd` show only PTY slave and stdio; no token, capability, socket, or secret   | `C-12` real-service driver plus child descriptor probe     | Core terminal platform | `partial`   |
| EV-04 | `P0-AC-024` read-only default   | Baseline has no `session.host`; metadata only; content needs `terminal.inspect`; worker kind needs consent     | campaign real client plus Wheel adapter audit              | Core and `bitty-ai`    | `partial`   |
| EV-05 | `P0-AC-025` DevTools scopes     | Connection alone grants no `debug.*`; `session.*` never reaches a debug method                                 | campaign handshake probe plus `bitty-ipc` DevTools matrix  | `bitty-ipc` and Core   | `partial`   |
| EV-06 | `P0-AC-026` secret minimization | Seeded-secret corpus never appears in audit, diagnostics, panic, or crash output; owner-private modes          | `C-07`, `C-14` real-service driver plus seeded-corpus scan | Core terminal platform | `partial`   |
| EV-07 | Daemon absence                  | `bitty --safe`, headless tests, CI, and a plain invocation work with no endpoint and no daemon process         | `C-08` plus the safe-mode/headless matrix                  | Core terminal platform | `partial`   |
| EV-08 | No TCP or hidden listener       | No TCP listener, no abstract socket, no `/tmp` fallback, and only the documented local endpoint after startup  | `daemon.status.tcp_listeners` plus the namespace scan      | Core terminal platform | `partial`   |
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
`blocked` row records why the merged code cannot produce the expected result. A
cell that begins with `Refresh:` records the 2026-10-28 refresh at `adb15d15`;
every other observation is the `d360b442` campaign.

### Criterion rows

| Row   | Status      | Command and evidence reference                                                                                                                                                                                                                                                                                                                                                                                                         | Observed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Residual gap                                                                                                                                                                                                                                                                                                                                                            |
| ----- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EV-01 | `supported` | `env XDG_RUNTIME_DIR=$RT/run XDG_STATE_HOME=$RT/state $BITTYD start &`; `stat -c '%a %U %F'` on the endpoint, lock, operator, and audit paths; second `$BITTYD start`; userns, foreign-uid, and fd-pass probes; closing-refusal probes; tamper and `wait`                                                                                                                                                                              | Directory `0700`, socket `0600`, lock and operator `0600`, audit directory `0700`, segment `0600`, all uid 1000. Second start exit 0 with `already running`; first keeps serving. `unshare -Ur` peer gets EOF at accept. A passed descriptor used by another pid gives `Unauthenticated` and one `a=wire c=unauthenticated` record. A foreign kernel uid (100001 via a two-line userns map) cannot connect (`EACCES` on the `0700` directory) and its frame on a passed descriptor is `Unauthenticated`. Closing refusals (second negotiate, pre-negotiate frame, wire version, service version, wrong capability) each deliver the typed frame and then a real EOF; a non-closing `NotFound` leaves the connection usable. No TCP listener; `/proc/net/unix` shows only the endpoint. Tamper with a regular file exits 6; directory mode `0755` exits 6; a SIGKILL stale socket is reclaimed under the lock; an override in a `0700` directory binds; an override in `0755` exits 1; a relative override exits 1; a missing `XDG_RUNTIME_DIR` exits 1 with no socket. Refresh: `C-02` (a privileged action from an exited peer is refused before the effect) passes in the frozen real driver.                                                 | Native second-account uid/SID (`V-25`) is not available on this host (no root and no second account); userns plus foreign-uid-per-frame is the substitute. Formal audit artifact absent. Same-uid endpoint impostor residual stands.                                                                                                                                    |
| EV-02 | `partial`   | Real client over the socket (`session.create`, `attach`, `grant`, `grant.revoke`, `transfer`, `abort`, `kill`, `heartbeat`, `status`, `resize`, `debug.*`, `daemon.audit`) plus `cargo test -p bitty-daemon --test service_loop` (`every_control_method_maps_a_stale_token_at_a_vacant_control`) and corpus vector `C-09` in the frozen real driver                                                                                    | Baseline is exactly `session.inspect`, `session.attach`, `session.control`, `process.spawn`; no `terminal.*` and no `debug.*`. `daemon.status` and `daemon.host_grant` mint are `ScopeViolation`; create without consent is `ConsentRequired`; `kind: worker` is `UnsupportedCapability`; `session.resize` is `ScopeViolation`; `debug.inspect`, `daemon.audit`, and unknown methods are `NotFound`; a top-level `role` field is `InvalidRequest`. Create replay returns the original token before claim and `control_token: null` after claim; a different fingerprint is `IdempotencyConflict`; observer abort/transfer are `ControllerRequired`; a second controller is `ControlHeld`; transfer never returns the target token; the terminal session answers `NotRunning` to a former leaseholder. Refresh: a stale, rotated, or missing token at a live vacant control is `Denied/InvalidControlToken` for `session.attach`, `session.grant`, `session.grant.revoke`, `session.detach` on another lease, `session.control.transfer`, and `session.abort`; an occupied, terminal, or unknown target stays `NotFound`; the current token still reaches the method (PR #2770).                                                                 | The `(spawn=false, host=false)` create case is unreachable because every connection gets transport `process.spawn`; no merged executable-policy slice replaces it. An absent `observer_grant` field is `InvalidRequest`, not `ObserverGrantRequired` (freeze with bitty#2664). Full scope-by-method matrix and the `C-10`/`C-11`/`C-19` artifacts belong to bitty#2605. |
| EV-03 | `blocked`   | No worker-spawn path exists in the merged crate; `session.create` records metadata only                                                                                                                                                                                                                                                                                                                                                | `kind: worker` is refused before any process exists. There is no child pid, environment, or descriptor table to probe.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | No merged worker-spawn or containment slice (`worker_sessions=false`; `kind: worker` is refused before spawn). bitty#2604 closed with the endpoint/peer primitives (PR #2752) and no open task owns the spawn path. `C-12`; no `close_range` or child `/proc/self/fd` proof exists.                                                                                     |
| EV-04 | `partial`   | Same real client as EV-02 (the frozen corpus carries no read-only vector yet); inspect every session response field; Wheel adapter audit not in this repository                                                                                                                                                                                                                                                                        | Daemon half: baseline has no `session.host`; create needs the consumed grant; status/list carry metadata only (`session`, `attach_count`, `attached`, timestamps, `kind`, `generation`, `state`, `state_revision`, `terminal_id`) and no content field; `kind: worker` and `daemon.orphans.verify` are `UnsupportedCapability`; no session method returns terminal text, PTY bytes, scrollback, clipboard, prompt, or provider payload; Refresh: `state_revision` advances on grant mint, consume, and revoke (corpus `C-04`) and stays numeric metadata.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Wheel adapter labeling half is `bitty-ai`-owned and not run here (`P0-AC-024` split stays open).                                                                                                                                                                                                                                                                        |
| EV-05 | `partial`   | Handshake scope list from EV-02 (the frozen corpus carries no DevTools vector yet); every `session.*` scope held; `debug.inspect` and `daemon.audit` probes; `bitty-ipc` DevTools matrix not re-run in this workspace                                                                                                                                                                                                                  | A fresh connection and a connection holding all session scopes advertise no `debug.*`; `daemon.inspect`/`daemon.control` do not add one; a debug method resolves to `NotFound` through the normal catalog path; `terminal.*` stays absent.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | The pinned `bitty-ipc` DevTools scope matrix (`trace_scope_matrix_denies_inspect_and_unscoped`, `trace_redaction_and_input_gating`, `record_roundtrip_redacts_and_gates_input`) was not re-run for this campaign; the daemon handshake half is observed.                                                                                                                |
| EV-06 | `partial`   | Canary/secret scan over every audit segment plus stdout/stderr; rotation run at 90 requests/s; fail-closed run under `RLIMIT_FSIZE=4096` with `SIGXFSZ` ignored; 300-frame rate burst; core-dump and dumpable probe; `cargo test -p bitty-daemon --test service_loop` (`start_disables_core_dumps_and_is_not_dumpable`, `a_wire_refusal_burst_is_budgeted_and_aggregated`, `an_endpoint_tamper_flushes_the_pending_refusal_aggregate`) | 10-record privacy run: no operator capability, host-grant, control-token, or observer-grant value appears; no raw `terminal_id`, idempotency key, correlation value, or refusal-param canary appears; every line uses only the closed field set; `terminal_id_digest` and a 32-hex correlation digest are present; modes `0700`/`0600`. Rotation: 6908 refusals plus the negotiate record, segments `audit.1.log` 1,048,482 B plus `audit.log` 151,554 B, 2 segments, 6909 well-formed records, 0 malformed. Fail-closed: at 4096 B the sink reports `audit_degraded: true`, `session.create` is `Denied/Internal`, active sessions stay 1, `daemon.stop` is `Denied/Internal`, and `SIGTERM` still exits 0. The tail ends in one partial record (bounded loss). At the refresh, `bittyd start` lowers `RLIMIT_CORE` to 0 (soft and hard) and clears `PR_SET_DUMPABLE` before the endpoint binds, so a same-uid `/proc/<pid>/mem` open is `EACCES`; the 60-frame burst test asserts 20 individual `a=wire` records, 40 suppressed, and one aggregate with `h=not_found:40`, and the tamper variant flushes `sup=80` before exit 6. Refresh: corpus `C-07` passes on the real driver (content-free records, modes, and the bounded wire budget). | Crash or panic output was not injected, so no crash artifact was scanned even though one can no longer be produced. The `C-07`/`C-14` formal artifact is absent.                                                                                                                                                                                                        |
| EV-07 | `partial`   | `$BITTYD` with no arguments under a throwaway root; `BITTYD_ENDPOINT=$RT/missing.sock $BITTYD`; corpus vector `C-08` in the frozen real driver; `bitty --safe` and headless suite not run here                                                                                                                                                                                                                                         | Plain invocation exits 0, creates no socket, capability file, or audit directory; a missing endpoint is a supported status-only path; `--version` and `--help` exit 0; an unknown argument exits 2; Refresh: `C-08` passes in the frozen real driver (plain invocation, no daemon, no endpoint).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | `bitty --safe`, the headless suite, and the CI absence proof are terminal-side and belong to bitty#2605; not run in this campaign.                                                                                                                                                                                                                                      |
| EV-08 | `partial`   | `daemon.status.tcp_listeners` (self-count from `/proc/self`) against `/proc/net/tcp`, `/proc/net/tcp6`, and `/proc/net/unix`; positive control with a Python TCP listener at `d360b442`; override run                                                                                                                                                                                                                                  | Refresh: the daemon reports `tcp_listeners: 0` from its own fd table and holds no `LISTEN` row in either TCP table and no abstract socket; `/proc/net/unix` shows only the documented endpoint. The same namespace scan detected a seeded Python TCP listener at `d360b442`, so it is not vacuous. The override run binds the documented override path and adds no second listener at the derived path.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | The pid-attributed `/proc/<pid>/fd` scan used at `d360b442` is unavailable: `PR_SET_DUMPABLE=0` (bitty#2764) denies a same-uid reader, so the refreshed proof is the daemon's self-attested count plus the namespace tables. `V-28` formal artifact and a second cell remain with bitty#2605; abstract-socket check is Linux-only.                                      |
| EV-09 | `blocked`   | `bitty --safe` hostile fixture matrix not run                                                                                                                                                                                                                                                                                                                                                                                          | The daemon-absence half is EV-07; the terminal safe-mode matrix is outside this workspace.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Blocked on the terminal `P0-AC-019` fixture run and bitty#2605.                                                                                                                                                                                                                                                                                                         |

### Mechanism rows

| Row   | Status      | Command and evidence reference                                                                                                                                                                                                                     | Observed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Residual gap                                                                                                                                                                                                      |
| ----- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ME-01 | `partial`   | Create and claim/transfer over the wire; token length and rotation; audit scan; `cargo test -p bitty-daemon --test service_loop` (`every_control_method_maps_a_stale_token_at_a_vacant_control`); `--test leases`; `src/lease/token.rs` unit tests | Create returns a 64-hex token; claim rotates it; transfer rotates the target token and the requester never receives it; the target receives it on its next heartbeat; Refresh: a missing, stale, or rotated token at a vacant control is `Denied/InvalidControlToken` for every control method (PR #2770); no token value appears in any audit record; 2026-10-30: a spawned worker's `environ` and `/proc/<pid>/fd` carry no control token.                                                      | Digest-only storage, constant-time compare, and zeroization are source-inspection items (unit tests pin the 256-bit mint and the redacted `Debug`), not wire observations; `C-11`/`C-18` artifacts remain.        |
| ME-02 | `partial`   | Stat the runtime directory and capability file; read the bearer; restart; present the old bearer                                                                                                                                                   | Directory `0700`, file `0600`, uid 1000; the bearer is 64 hex; every start rotates it; the previous bearer is `Unauthenticated` on the new instance; the capability never appears in audit; the handshake is the only path that consumes it.                                                                                                                                                                                                                                                      | Constant-time comparison and the same-uid read residual are not measured; C-15/C-16 artifacts remain.                                                                                                             |
| ME-03 | `supported` | `daemon.host_grant` mint 8, ninth mint, revoke pending, consume, revoke consumed, create after revoke; `cargo test -p bitty-daemon --test service_loop` (`a_consumed_host_grant_revoke_withdraws_create_before_the_ttl`)                           | Eight pending grants are distinct; the ninth is `LimitExceeded`; a pending revoke is `revoked: true`; the grant is single-use at negotiate; TTL 300 s is advertised. Refresh: a consumed grant is now revocable before the TTL: revoke returns `revoked: true, not_active: false`, and both a fresh create key and a keyed replay on the consuming connection are `Denied/ConsentRequired` (PR #2770).                                                                                            | The `C-19` artifact is absent; peer binding is same-uid only on this host, and the grant remains an intent gate a same-uid adapter can mint after reading the operator capability.                                |
| ME-04 | `partial`   | `session.grant` mint; attach wrong session, consume, replay, wait past the 60 s TTL, attach again; corpus `C-04`, `V-07`, and `V-35`; `--test leases`                                                                                              | Grant is 64 hex with a 32-hex id and 60 s TTL; wrong-session, replay, and expired attaches are all `ObserverGrantRequired`; a valid attach is `observer`; grant revoke is idempotent; Refresh: mint, consume, and revoke each bump `state_revision` (bitty#2767, PR #2776), and a repeat detach answers `not_attached` without a bump (bitty#2768).                                                                                                                                               | Wrong-peer is not reachable on a same-uid single-account host; `C-10` artifact remains.                                                                                                                           |
| ME-05 | `partial`   | `C-03`, `C-11`, `--test containment`; 2026-10-30 crash-recovery probe (`SIGKILL` daemon, restart, journal counts)                                                                                                                                  | `daemon.orphans.verify` is served on the Linux cell (`mechanism: cgroup_v2`, `claim: swept`); a live worker's kill removes the pid and the session subtree; a `SIGKILL`ed daemon leaves a committed record and a HUP/TERM-ignoring worker, and the restart scan reaps the record through the subtree (`reaped: 1`, `committed: 0`) and removes it; retire removes only a quarantined record and refuses a live committed id with `InvalidRequest`.                                                | The daemon-live subreaper fallback and a live reused-pid race were not produced on this host; the `C-03` formal artifact is absent; panic/crash injection beyond the daemon `SIGKILL` was not run. `C-03`/`C-11`. |
| ME-06 | `supported` | Same run as EV-06 plus `a_wire_refusal_burst_is_budgeted_and_aggregated`, `an_endpoint_tamper_flushes_the_pending_refusal_aggregate`, and corpus `C-07`                                                                                            | Content-free records, closed field set, owner-private modes, 1 MiB rotation with two segments and zero malformed lines, fail-closed `Denied/Internal` with `audit_degraded: true`. Refresh: a bounded wire refusal budget whose suppressed tail is one aggregate record (`sup=<count>`, `bl=<budget>`, bounded `h=code:count` histogram) flushed on close and on endpoint tamper. A refused method still writes one individual record and is never counted in the aggregate histogram (PR #2770). | Per-method refusal aggregation remains a documented follow-up outside the D-16 wire budget; crash injection belongs to EV-06; the `C-07`/`C-14` formal artifact is absent.                                        |
| ME-07 | `supported` | Create replay before and after claim; fingerprint conflict; 128 create keys with 8 rounds of 16 creates and keyless kills; restart with the same key                                                                                               | Replay returns the original session and no token after claim; a different fingerprint is `IdempotencyConflict`; the 129th distinct key is `IdempotencyCapacity`; `session.kill` still succeeds at the full store; a repeat kill is `not_running`; `daemon.stop` still succeeds; after restart the same key creates a new session and the instance id changes.                                                                                                                                     | Restart crash injection and the F-9 gate remain; `C-18` artifact pending.                                                                                                                                         |

### Findings that gated this campaign

| Finding    | Severity | Reproduction summary                                                                                                                                                                                            | Disposition                                                                         |
| ---------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| bitty#2763 | P1       | Mint and consume a host grant; `daemon.host_grant revoke` returns `revoked: false, not_active: true`; the consuming connection still creates a session.                                                         | Closed by PR #2770; ME-03 `supported`.                                              |
| bitty#2764 | P1       | Running `bittyd` has `Max core file size unlimited` and a same-uid process can open `/proc/<pid>/mem`; a `PR_SET_DUMPABLE=0` control is denied. D-16 requires `RLIMIT_CORE=0` and a non-dumpable Linux process. | Closed by PR #2770; EV-06/ME-06 residual narrowed, EV-08 evidence producer changed. |
| bitty#2765 | P1       | Claim, detach, then present the old token at vacant control: `NotFound`, while the contract and README claim `InvalidControlToken`; no wire input reaches the token comparison.                                 | Closed by PR #2770; EV-02/ME-01 blocker removed.                                    |
| bitty#2766 | P1       | 300-frame refusal burst: 199 `NotFound`, 101 `RateLimited`, only 20 `a=wire` records; 81 refusals leave no trace and no aggregate record carries the suppressed count or histogram.                             | Closed by PR #2770; EV-06 `partial`, ME-06 `supported`.                             |
| bitty#2767 | P1       | Grant mint, consume, and revoke never advanced `state_revision`, while D-03 requires every snapshot-visible mutation to bump it; the frozen corpus `C-04` failed on its first run.                              | Closed by PR #2776; `C-04` passes and the known-defect marker is removed.           |
| bitty#2768 | P1       | A repeat `session.detach` of a lease this connection already detached returned `NotFound` instead of the idempotent `not_attached` acknowledgement; the frozen corpus `V-07` failed on its first run.           | Closed by PR #2776; `V-07` and `V-35` pass and the marker is removed.               |

### Residual observations from the bitty#2607 review

- **Wire-refusal suppression histogram.** Resolved 2026-10-28 (bitty#2766, PR
  #2770): a window that suppresses refusals ends with one `wire` aggregate
  carrying `sup=<suppressed>`, `bl=<budget>`, and a bounded code histogram, and
  a closing connection or endpoint-tamper exit flushes the pending window. A
  refused method still writes one individual record, so per-method aggregation
  remains a documented follow-up outside the D-16 wire budget.
- **`attach_role` spelling.** `session.attach` takes `attach_role`
  (`controller` or `observer`) in the request and returns `role` in the
  response. The ambient-authority validator reserves `role`, `auth`, and
  `scope`, so a top-level `role` request field is `InvalidRequest`. The frozen
  corpus pins both spellings in its `frozen` map; bitty#2664 still owns the
  wider JSON freeze, and the daemon must not silently accept both spellings.
- **Absent observer grant field.** A `session.attach` with
  `attach_role: "observer"` and no `observer_grant` returns
  `Validation/InvalidRequest`, while a syntactically valid but unknown or
  consumed bearer returns `Denied/ObserverGrantRequired`. The corpus does not
  carry the absent-field case yet; freeze it in bitty#2664. It reveals no
  existence fact, but the served code set differs from the refusal table's
  "lacks a valid grant" row.
- **Transport `process.spawn`.** Every connection receives transport
  `process.spawn`, so the both-missing create combination is reachable only in
  unit tests. No merged executable-policy slice replaces the transport default.
- **Consumed host-grant revoke.** Resolved (bitty#2763, PR #2770): a consumed,
  unexpired, unrevoked host grant is revocable, the record is retained until
  the TTL so the bound connection is refused, and a keyed replay cannot
  resurrect the session.
- **Core dumps.** Resolved (bitty#2764, PR #2770): `bittyd start` sets
  `RLIMIT_CORE` to zero for both limits and clears the Linux dumpable flag
  before the endpoint binds; a start that cannot harden refuses to serve.
- **`InvalidControlToken`.** Resolved (bitty#2765, PR #2770): one
  `control_target` helper maps a missing, stale, or rotated token at a live
  vacant control to the closed code for every control method, while an
  occupied, terminal, or unknown target stays `NotFound`.
- **No-TCP evidence producer.** New consequence of bitty#2764: the non-dumpable
  daemon no longer exposes `/proc/<pid>/fd` to a same-uid test, so the live
  proof is the daemon's self-attested `tcp_listeners` count plus the namespace
  tables. The mechanism did not change; the evidence producer did.

### Evidence refresh (2026-10-28)

**Refresh identity.** `bitty` `14f26fbe` (`origin/main`, 2026-10-28); the
`crates/bitty-daemon` tree is identical to `a1c5639a`, Linux x86_64. This
refresh re-read the merged service loop, its regression tests, and the frozen
corpus; it ran no new throwaway-root campaign. The cited tests are real-process
tests (`cargo test -p bitty-daemon --test service_loop`) and the conformance
suite that `bitty` CI runs on the Linux Tier-1 leg. The
`bittyd-conformance-linux-x86_64` artifact from that run records the real
service at 35 vectors (32 pass, 3 typed skip, 0 fail, 0 known defect) and the
parity document at 26 compared vectors with 0 divergences; shard 1 carries
`bittyd-conformance-fake`
([CI run 40716334699](https://github.com/bitty-terminal/bitty/actions/runs/40716334699),
`Linux X11 (xvfb)` job). No row is `Verified`, and no consumer or security
sign-off is implied.

| Change                                                                                                                                                                                                                                             | PR / issue                          | Rows affected                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------ |
| Consumed host-grant revoke withdraws create authority before the TTL; `a_consumed_host_grant_revoke_withdraws_create_before_the_ttl`                                                                                                               | bitty#2763, PR #2770                | ME-03 `blocked` → `supported`                          |
| `RLIMIT_CORE=0` plus `PR_SET_DUMPABLE=0` before the endpoint binds; `start_disables_core_dumps_and_is_not_dumpable`                                                                                                                                | bitty#2764, PR #2770                | EV-06/ME-06 residual narrowed; EV-08 producer changed  |
| `Denied/InvalidControlToken` at a vacant control for every control method through `control_target`; `every_control_method_maps_a_stale_token_at_a_vacant_control` and corpus `C-09`                                                                | bitty#2765, PR #2770                | EV-02/ME-01 blocker removed                            |
| Wire-refusal budget aggregates the suppressed tail (`sup=`, `bl=`, bounded `h=` histogram) and flushes on close and endpoint tamper; `a_wire_refusal_burst_is_budgeted_and_aggregated`, `an_endpoint_tamper_flushes_the_pending_refusal_aggregate` | bitty#2766, PR #2770                | EV-06 residual narrowed; ME-06 `partial` → `supported` |
| Grant mint, consume, and revoke each bump `state_revision`; `grant_mint_consume_and_revoke_each_bump_the_state_revision` and corpus `C-04`                                                                                                         | bitty#2767, PR #2776                | EV-02, EV-04, ME-04                                    |
| Repeat `session.detach` answers `not_attached` without a revision bump; `a_repeat_own_detach_is_the_idempotent_not_attached_acknowledgement` and corpus `V-07`/`V-35`                                                                              | bitty#2768, PR #2776                | EV-02, ME-04, ME-07                                    |
| Frozen corpus and fake/real parity: 35 vectors, 26 shared, 6 real-only, 3 fake-only; artifacts `bittyd-conformance-fake` and `bittyd-conformance-linux-x86_64`                                                                                     | bitty#2605, PRs #2769, #2771, #2779 | EV-01, EV-02, EV-06, EV-07, ME-04, ME-07 citations     |
| Service loop: scope registry, handshake, grants, audit sink, per-frame credentials, Linux-only served cell                                                                                                                                         | bitty#2607, PR #2761                | baseline for every row                                 |

**Status delta.** ME-03 and ME-06 move to `supported`; EV-08 moves to
`partial` because its pid-attributed evidence producer is gone, not because the
mechanism changed. EV-02 and ME-01 keep `partial` with their named blocker
removed. EV-03, EV-09, and ME-05 stay `blocked`; EV-04, EV-05, and EV-07 stay
`partial`; EV-01 and ME-07 stay `supported`. This delta describes the
2026-10-28 refresh only; the 2026-10-30 reverification below moves EV-03 and
ME-05 to `partial`.

### Reverification campaign (2026-10-30)

**Run identity.** `bitty` `6c229e9c` (`origin/main`, 2026-10-30), crate
`0.0.31`, service API `1.2`, Linux x86_64 (`7.3.0-4-cachyos`, glibc `2.44`),
cgroup v2 delegated. `cargo build -p bitty-daemon --locked` exited 0. The
shipped binary is `sha256:1865c5fe…`; the `--features test-seams` binary is
`sha256:ccf62447…`. Every daemon run used a fresh throwaway root:
`XDG_RUNTIME_DIR=$RT/run`, `XDG_STATE_HOME=$RT/state`, `HOME=$RT`, with `$RT`
under `/tmp/bitty/ctx-1526/runs/<item>`; the real runtime and state directories
were never used. Raw transcripts are ephemeral and summarized here; formal
auditor artifacts under `docs/security/audits/` remain outstanding.

**Commands and counts.** Seven probe scripts made 254 live assertions against
the real service (254 observed, 0 failed). `cargo test -p bitty-daemon --test
containment --locked` passed 10; `--test service_loop --locked` passed 51;
`--lib --locked` passed 418. `cargo test -p bitty-daemon --test conformance
--features test-seams --locked` passed 12 with 1 ignored helper; the real
driver recorded 51 vectors, 47 pass, 4 typed skip (`V-06`, `V-33`, `C-10`,
`F-01`), 0 fail, 0 known defect, and the parity report compared 34 shared
vectors with 0 divergences (`linux-x86_64.real.json`
`sha256:e2dd9ad2…`, `linux-x86_64.parity.json` `sha256:ee41d89f…`).

**Scope of this campaign.** This is a producer run, not an audit. It covers the
five slices merged after the 2026-10-28 refresh: containment (PR #2801,
bitty#2791), worker spawn (PR #2808), the event wire (PR #2811), the request
deadline (PR #2815), and the 1.2 metadata keys (PR #2816). No row is
`Verified`, no risk state moves, and the security sign-off on bitty#2664 still
does not cover these surfaces.

### S-01 bitty#2791 containment, reaping, and orphan verification

| Check               | Observed                                                                                                                                                                                                                 | State      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| Served plan         | `daemon.status.orphans` = `verify: served`, `mechanism: cgroup_v2`, `claim: swept`, `fallback: null`                                                                                                                     | `observed` |
| cgroup join         | Worker pid appears in its own `cgroup.procs` and `/proc/<pid>/cgroup` names `bittyd-<instance>-<session>`                                                                                                                | `observed` |
| Kill and reap       | Operator `session.kill` makes the pid disappear, removes the session subtree, settles the snapshot `terminated`/`swept`, and leaves journal `reserved: 0`, `committed: 0`                                                | `observed` |
| Crash recovery      | A `SIGKILL`ed daemon leaves a HUP/TERM-ignoring worker and its committed record; restart reaps the record through the subtree (`reaped: 1`, `committed: 0`), removes the record and the subtree, and leaves the pid gone | `observed` |
| Verify              | Counts-only response, idempotent; a live worker's committed record is skipped (`committed: 1`)                                                                                                                           | `observed` |
| Retire              | One quarantined record (`retired: 1`); a repeat is `NotFound`; a malformed id is `InvalidRequest`; a live worker's committed id is `InvalidRequest`                                                                      | `observed` |
| Bounded record id   | `record_id` is the 32-hex session id; nothing longer or non-hex reaches the journal                                                                                                                                      | `observed` |
| No pid or path leak | Orphan responses carry only counts and the static mechanism fields; the audit text carries neither the seeded record ids nor a pid/path                                                                                  | `observed` |
| Subreaper fallback  | Forced-fallback process tests pass (`the_subreaper_fallback_*`, decoy, double fork); a daemon-live fallback cannot be selected on this host because cgroup delegation is present                                         | `partial`  |
| pidfd TOCTOU        | The recorded decoy is never signalled and a reserved crash record is reaped through its subtree; a live reused-pid race was not produced                                                                                 | `partial`  |

### S-02 bitty#2808 worker spawn and child scope

| Check                            | Observed                                                                                                                                                                                                                                     | State      |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Consent                          | A connection with transport `process.spawn` and no `session.host` gets `Denied/ConsentRequired` before any process exists                                                                                                                    | `observed` |
| Bounded specification            | Missing/empty `argv`, relative `cwd`, `cols: 0`, `cols: 1001`, and an `env` entry without `=` are `InvalidRequest`; 65 argv entries, a 4,097-byte field, 129 env entries, and a 68,024-byte whole spec are `LimitExceeded` with their counts | `observed` |
| Generation 1 bind                | A valid worker create answers `running`, `generation: 1`, `state_revision: 1`, a 64-hex token, and `replayed: false`; a same-key replay and a spec conflict behave as frozen                                                                 | `observed` |
| Failed-spawn shape               | A missing executable answers `failed`/`spawn_failed`/`not_started` at generation 0 with `control_token: null` and no reserved or committed journal record                                                                                    | `observed` |
| Exit cleanup                     | A worker that exits on its own becomes `exited`/`worker_exit`/`swept`; its record is removed and the live worker's record remains committed                                                                                                  | `observed` |
| cgroup join and kill             | The worker joins the per-session cgroup; kill removes the pid and the subtree                                                                                                                                                                | `observed` |
| `worker_sessions` plan awareness | The Linux handshake advertises `true`; a `ContainmentKind::Refused` plan is unit-tested to refuse and not advertise; a live refused-plan daemon was not produced                                                                             | `partial`  |
| Child environment                | The child `environ` is exactly the provided `env` plus `TERM`; no operator capability, control token, host grant, `XDG_RUNTIME_DIR`, or `HOME` appears                                                                                       | `observed` |
| Child descriptors                | No endpoint socket, operator file, journal, audit file, or token descriptor appears; stdin/stdout/stderr point at the PTY slave                                                                                                              | `observed` |
| Child fd shape                   | Three extra PTY slave fds (11/12/13) survive `exec` from the stdio dups; see bitty#2824. The `close_range` ordering proof named by EV-03 is absent; see bitty#2823                                                                           | `defect`   |

### S-03 bitty#2811 event wire

| Check                    | Observed                                                                                                                                                                                                     | State          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- |
| Capability truth         | The Linux handshake advertises `events: true`; a connection that does not opt in receives no event frame and no attach replay keys                                                                           | `observed`     |
| Response-first ordering  | An event frame is a `v: 1` envelope with a server `evt-` id and no `ok`; it follows the response that caused the revision                                                                                    | `observed`     |
| Ordering and no gaps     | Revisions arrive strictly increasing; the collected tail `6, 7, 8` is contiguous                                                                                                                             | `observed`     |
| Per-lease routing        | The controller receives copies addressed to its own `attach_id`; the observer receives its own; no cross-copy appears                                                                                        | `observed`     |
| Attach replay            | An opted-in attach returns `backlog`, `backlog_truncated`, and `earliest_revision`; an observer's own attach revision is in its replay, not pushed                                                           | `observed`     |
| Truncation               | After 280 revisions the reattach reports `backlog_truncated: true`, `earliest_revision: 32`, 256 bounded entries, and a last revision at the current record                                                  | `observed`     |
| Terminal guarantee       | `session.kill` pushes `session_terminal` last with `terminal: true`, the terminal marker, and the lease's own attach id                                                                                      | `observed`     |
| Disconnect token reclaim | Closing the controller connection returns `attach_count` to 0; the rotated token reattaches as controller; the stale create token is `NotFound` while occupied and `InvalidControlToken` at a vacant control | `observed`     |
| Non-serving cells        | The `EVENTS_SERVED=false` branch is compiled for non-Linux cells; no such daemon was run                                                                                                                     | `not produced` |

### S-04 bitty#2815 request deadline

| Check                | Observed                                                                                                                                                                                           | State      |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Typed timeout        | With the seam bound at 100 ms, `daemon.status` answers `class: Timeout`, `code: Timeout`, `message: request deadline exceeded`, `request_id` equal to the envelope id, and `timeout_ms: 100`       | `observed` |
| Connection continues | The next `session.list` on the same connection succeeds; a second timed-out request also gets `Timeout`                                                                                            | `observed` |
| Exemptions           | `daemon.orphans.verify` and `daemon.stop` are not converted; the stop returns its result and exits 0                                                                                               | `observed` |
| One audit record     | Two timed-out requests produce two `a=daemon.status r=refused c=timeout` records; a late failure is answered `Timeout` and keeps the handler's single `c=not_found` record                         | `observed` |
| No secret leak       | The error carries exactly `class`, `code`, `message`, `request_id`, `timeout_ms`; the audit carries no request id or capability                                                                    | `observed` |
| Shipped binary       | The seam is compiled out; the shipped build advertises `request_timeout_ms: 10000` and ignores the seam variables. A shipped-build `Timeout` needs a >10 s non-exempt handler and was not produced | `partial`  |

### S-05 bitty#2816 session and daemon metadata

| Check                        | Observed                                                                                                                                                                                      | State      |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Additive negotiation         | Clients at `1.0`, `1.1`, and `1.2` are accepted; `1.3` and `2.0` are `VersionMismatch`; `min_client_minor` is 0                                                                               | `observed` |
| Controller presence          | `controller_present` is a boolean, never the controller `attach_id`; the token and attach id never appear in `session.status` or `session.list`                                               | `observed` |
| Pending observer grants      | `pending_observer_grants` is numeric, bounded by the compiled cap, and clamps to 0 on a terminal snapshot                                                                                     | `observed` |
| Owner peer                   | Only the operator all-session `session.list` carries `owner: {uid, pid}`; an ordinary list omits the key and hides a session the connection does not lease; `session.status` never carries it | `observed` |
| Attach and heartbeat clocks  | `session.attach` returns `scopes` and `server_monotonic_ms`; `lease.heartbeat` returns `server_monotonic_ms` beside `lease_expires_at_ms`                                                     | `observed` |
| Observational pid and uptime | `daemon.status.daemon_pid` equals the process pid; `uptime_ms` is non-negative and strictly increases across calls                                                                            | `observed` |
| Lifetime orphan counters     | `orphans.records` carries `reserved`, `committed`, `unverified`, `reaped`, `stale`; a seeded foreign-boot record reports `stale: 1`, and a verification pass leaves it at 1                   | `observed` |

**Status delta.** EV-03 moves `blocked` → `partial`: the worker now exists and
the child environment/fd probe ran; the `close_range` proof and the exact fd
shape are tracked as bitty#2823 and bitty#2824. ME-05 moves `blocked` →
`partial`: the cgroup-v2 plan is reaped end-to-end and the crash scan is
observed, while the daemon-live subreaper sub-case and a live reused-pid race
remain unproduced. EV-04 stays `partial` with its worker-refusal clause replaced
by the consent-gated served path. EV-02, EV-05, EV-06, EV-07, EV-08, EV-09,
ME-01, ME-02, ME-04, and ME-06 do not move. EV-01, ME-03, and ME-07 stay
`supported`.

**Findings and residuals.**

- **bitty#2824 (P2).** The worker child carries three extra PTY slave fds
  (11/12/13) from the non-CLOEXEC stdio dups; the child-scope probe observed no
  daemon secret but the fd table is not exactly stdio. EV-03 stays `partial`.
- **bitty#2823 (P2).** EV-03 names a `close_range(..., CLOEXEC)` pre-exec proof
  that the merged path does not produce; the current probe cannot prove the
  `CLOEXEC` completeness that substitutes for it.
- **Worker serve-before-amendment.** The Linux build advertises
  `worker_sessions: true` and spawns workers while accepted `D-01` still
  describes the v0.2.0 slice as terminal-only; the frozen IPC contract records
  this as a served-versus-accepted tension owned by bitty#2790 and bitty#2608.
  The release gate G-06 cannot be `met` in this state.
- **Subreaper daemon-live path.** cgroup delegation is present on this host, so
  the daemon always selects `cgroup_v2`; the fallback is exercised only by the
  forced process tests. A second host without delegation is required.
- **Shipped-build deadline.** `Timeout` is observable only through the
  `test-seams` build; no non-exempt shipped handler exceeds the 10 s bound.
- **Non-Linux cells and Windows.** No native cell was available; both the
  worker capability and the event wire remain Linux-only and unproduced on
  macOS/Windows.
- **Formal artifacts.** `docs/security/audits/` still holds no per-control
  report; this campaign is a producer run, not an auditor sign-off.

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

**Producer.** The `bitty#2605` real-service driver, vectors `C-09` (the frozen
corpus assigns it to the vacant-control control-token refusal), `C-10`, `C-11`,
and `C-19`, plus the full scope-by-method matrix the driver emits. The matrix is
the proof: every method row, every effective scope column, and the expected
allow or deny code. The driver also records the grant mint, consume, expiry,
revoke, and the token rotation sequence.

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

**Status.** `partial` (the transport `process.spawn` default, the absent observer-grant field freeze, and the full matrix artifact; the vacant-control `InvalidControlToken` blocker is closed by PR #2770).

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

**Status.** `partial`: the worker-spawn and containment slices are merged
(bitty#2791, PR #2801; PR #2808). The 2026-10-30 live probe read the child's
`environ` and `/proc/<pid>/fd`: the environment was exactly the supplied `env`
plus `TERM`, with no operator capability, control token, host grant,
`XDG_RUNTIME_DIR`, or `HOME`, and no endpoint socket, operator file, journal,
or audit descriptor appeared in the fd table. Two gaps remain: the child holds
three extra PTY slave fds (11/12/13) from the non-CLOEXEC stdio dups
(bitty#2824), and the `close_range(..., CLOEXEC)` ordering proof named above is
not produced by the merged path (bitty#2823). The formal
`docs/security/audits/bittyd-child-scope-2026-xx.md` artifact is absent.

## P0-AC-024 Agent read-only default

**Proof obligation.** An Agent consumer that merely connects receives only the
baseline scopes and no content authority. `session.host` is absent from the
baseline; `session.create` is refused without an explicit host grant and
`process.spawn`. `worker_sessions` is true only on a plan-gated Linux cell
(bitty#2790 / PR #2808); on a cell that does not serve workers, `kind: worker`
is `Denied/UnsupportedCapability` before any process exists, and on a serving
cell it needs the consumed host grant and a bounded spawn specification.
`session.status`, attach responses, and events carry metadata only. Terminal
content requires a live lease and `terminal.inspect`; input requires the
controller lease and `terminal.input`; resize requires the controller lease and
`terminal.manage`. An observer grant never carries content authority by itself.
The baseline `session.control` scope is necessary but never sufficient: without
the controller lease or the current control token it cannot abort, transfer, or
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

**Status.** `partial` (daemon half supported: baseline has no `session.host`, create needs the consumed grant, and the worker kind is served only with that consent on a plan-gated Linux cell; the Wheel adapter half is `bitty-ai`-owned and not run). The 2026-10-30 campaign confirms the worker metadata surface carries no pid, argv, environment value, content, or token, and that the accepted `D-01` tension is still open.

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

**Status.** `partial` (crash and panic output were not injected, so no crash artifact scan exists; the core-dump and refusal-aggregation blockers are closed by PR #2770).

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

**Producer.** The startup socket and fd scan from `V-28`, recorded with the
daemon pid. On Linux, `lsof -nP -p "$BITTYD_PID" -iTCP -sTCP:LISTEN` must be
empty, `ss -ltnp | grep "pid=$BITTYD_PID"` must be empty, the Unix-socket view
must show only the documented endpoint, and the process must report
`tcp_listeners: 0` from its own `/proc/self` fd table. At `d360b442` the scan
also inspected `/proc/<pid>/fd` for any socket that is not the endpoint or a
client connection; since PR #2770 the non-dumpable process denies that read to
a same-uid test, so the pid-attributed fd inspection moves to the audit run
(see open point 11).

**Negative tests that must exist.**

- a startup scan shows no TCP listener;
- no abstract-namespace socket exists;
- no `/tmp` or other fallback endpoint exists;
- the only listening Unix socket is the documented endpoint under the
  owner-private runtime directory;
- an endpoint override does not create a second listener;
- the check fails when a test fixture adds a TCP listener.

**Artifact.** `docs/security/audits/bittyd-no-tcp-2026-xx.md` plus the `lsof`,
`ss`, and fd capture under `recording/evidence/R-011/EV-08/`; after PR #2770
the `/proc/<pid>/fd` snapshot needs a privileged reader, and the
`daemon.status.tcp_listeners` value and the namespace tables are the same-uid
evidence.

**Owner.** Core terminal platform.

**Status.** `partial`: the daemon self-reports `tcp_listeners: 0` and the namespace tables show no listener, but the pid-attributed `/proc/<pid>/fd` scan is unavailable under the non-dumpable process (bitty#2764); a second cell and the formal `V-28` artifact remain.

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

| Row   | Mechanism           | Required evidence                                                                                                                                | Producer                                              | Owner                  | Status      |
| ----- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- | ---------------------- | ----------- |
| ME-01 | Control token       | 256-bit CSPRNG, returned once, digest-only storage, constant-time verify, rotation on claim and transfer, old token refused, no child/audit leak | `C-11`, `C-18`, `--test leases`, `--test audit`       | Core terminal platform | `partial`   |
| ME-02 | Operator capability | Per-boot `0700`/`0600`, rotated, handshake-only, not inherited, not a consumer wire field, same-uid residual stated and tested                   | `C-15`, `C-16`, `--test peer`                         | Core terminal platform | `partial`   |
| ME-03 | Host grant          | Operator-only mint, single-use, TTL, peer-bound, revocable, audited, consumed at negotiate, one static code per missing authority                | `C-19`, `--test service_loop`, `--test idempotency`   | Core terminal platform | `supported` |
| ME-04 | Observer grant      | Single-use, TTL, attributed, revocable, no self-grant, wrong-peer/session/consumed/expired all one code                                          | `C-10`, `--test leases`                               | Core terminal platform | `partial`   |
| ME-05 | Orphan reaping      | Two-phase reserve/commit fsync, containment identity, reserved-record reap, pid-reuse never signalled, quarantine, crash injection               | `C-03`, `C-11`, `--test containment`                  | Core terminal platform | `partial`   |
| ME-06 | Audit sink          | Content-free records, bounded strings, `0700`/`0600`, rotation, refusal budget, `audit_degraded` fail-closed, no read method                     | `C-07`, `C-14`, `--test audit`, `--test service_loop` | Core terminal platform | `supported` |
| ME-07 | Idempotency stores  | Bounded descriptor stores, `(uid or SID, key)` create index, fingerprint conflict, keyless termination, restart residual, F-9 gate               | `C-18`, `--test idempotency`, `--test events`         | Core terminal platform | `supported` |

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
  leaves the consuming connection authorized (bitty#2763, closed by PR #2770);
- a daemon that runs dumpable or with a nonzero core limit on Linux
  (bitty#2764, closed by PR #2770);
- a closed refusal code that no request can produce, or a served code that
  differs from the frozen contract (bitty#2765, closed by PR #2770);
- a refusal budget that drops records without the aggregate suppressed-count
  and histogram record (bitty#2766, closed by PR #2770);
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

The 2026-10-28 campaign and its later refresh are review input, not a
verdict. The four campaign defects (bitty#2763 through bitty#2766) are fixed
and regression-tested by PR #2770, and the two corpus known defects
(bitty#2767 and bitty#2768) are cleared by PR #2776, so the campaign blockers
no longer stand. That does not close any of the ten review items above: a
`supported` row means the real service produced the expected observable for
that row's declared scope at the cited revision; it is not an audit, and no
row is `Verified`.

The 2026-10-30 reverification is review input for the containment, worker,
event, deadline, and metadata surfaces, and it also produced no verdict. It
observed a constructed child environment with no daemon secret, a startup scan
that reaped a crashed daemon's cgroup record, and the served verify/retire
counts; it filed bitty#2823 for the missing `close_range` proof and bitty#2824
for three extra PTY slave fds in the child. The `D-01` worker
serve-before-amendment tension (open point 13) still needs the amendment, so
release gate G-06 cannot be `met` from this campaign.

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
3. Run the frozen conformance driver from bitty#2605 on Linux x86_64:
   `cargo test -p bitty-daemon --test conformance`. The corpus is
   `tests/harness/corpus.json` (schema `bittyd-conformance-corpus/1`): 35
   vectors run, 26 are shared and compared by the parity gate, 6 are real-only,
   and 3 are fake-only. CI uploads `bittyd-conformance-fake` from shard 1 and
   `bittyd-conformance-linux-x86_64` (real and parity) from the Linux Tier-1
   leg. Vectors this page names that the corpus does not yet carry (`C-10`
   through `C-16`, `C-18`, `C-19`, `V-25`, `V-26`, `V-28`) still need the
   driver; the campaign's ad-hoc runs are not a substitute.
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
   between the corpus and the contract is a defect. The corpus now freezes
   `session.attach` taking `attach_role` and returning `role`; an absent
   `observer_grant` field is still unfrozen and remains
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
11. **No-TCP evidence producer.** `PR_SET_DUMPABLE=0` (bitty#2764) makes the
    pid-attributed `/proc/<pid>/fd` scan impossible for a same-uid auditor. The
    reviewer must accept the daemon's self-attested `tcp_listeners` count plus
    the namespace tables, or require a privileged scan in the audit run.
12. **Both-missing create and the transport default.** Every connection
    receives transport `process.spawn`, so the contract's
    `(spawn=false, host=false)` case is reachable only in unit tests. No merged
    slice replaces the transport default; the reviewer must decide whether that
    is acceptable before `session.host` can be called per-client consent.
13. **Worker serve-before-amendment.** The Linux cell advertises
    `worker_sessions: true` and spawns workers, while accepted `D-01` still
    describes the v0.2.0 slice as terminal-only and asks for an ADR 0019
    amendment plus a spawn/credential/cleanup review first. The frozen IPC
    contract records the tension and leaves it with bitty#2790 and bitty#2608.
    The reviewer must record the amendment (or close the surface) before
    release gate G-06 can be `met`.
14. **Shipped-build request deadline.** The typed `Timeout` is observable only
    in the `test-seams` build because no shipped non-exempt handler exceeds the
    10 s bound. The reviewer must decide whether the seam run plus the unit
    tests suffice for EV-02/EV-04/ME-06, or require a shipped-build artifact
    produced by a documented long handler.
15. **Child fd shape and `close_range`.** The merged worker path relies on
    `CLOEXEC` completeness but does not run the `close_range(..., CLOEXEC)`
    call EV-03 names, and the child keeps three extra PTY slave fds
    (bitty#2823, bitty#2824). The reviewer must accept the enforced mechanism
    or require both the call and a probe that fails on an extra descriptor.
16. **Native cells.** macOS and Windows were not run; the worker capability and
    event wire remain Linux-only, and a compile-only target is not evidence for
    another cell.

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
  campaign and its refresh record `supported`, `partial`, and `blocked`
  observations only.
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
  consumed host grant cannot be revoked before its TTL (closed by PR #2770).
- [bitty #2764](https://github.com/bitty-terminal/bitty/issues/2764) - the
  daemon does not disable core dumps or clear the Linux dumpable flag (closed
  by PR #2770).
- [bitty #2765](https://github.com/bitty-terminal/bitty/issues/2765) - the
  vacant-control stale-token refusal is `NotFound`, not `InvalidControlToken`
  (closed by PR #2770).
- [bitty #2766](https://github.com/bitty-terminal/bitty/issues/2766) - the
  wire-refusal budget drops records without the D-16 aggregate and histogram
  (closed by PR #2770).
- [bitty #2767](https://github.com/bitty-terminal/bitty/issues/2767) - grant
  mint, consume, and revoke do not bump `state_revision` (closed by PR #2776).
- [bitty #2768](https://github.com/bitty-terminal/bitty/issues/2768) - a repeat
  `session.detach` returns `NotFound` instead of `not_attached` (closed by PR
  #2776).
- [bitty PR #2770](https://github.com/bitty-terminal/bitty/pull/2770) - the
  merged fix for bitty#2763 through bitty#2766, with the real-process
  regression tests.
- [bitty PR #2776](https://github.com/bitty-terminal/bitty/pull/2776) - the
  merged grant-revision and repeat-detach fix for bitty#2767 and bitty#2768.
- [bitty PR #2769](https://github.com/bitty-terminal/bitty/pull/2769) and
  [PR #2771](https://github.com/bitty-terminal/bitty/pull/2771) - the frozen
  conformance corpus, the fake reference server, the real-service driver, and
  the parity gate.
- [bitty PR #2779](https://github.com/bitty-terminal/bitty/pull/2779) - the CI
  guard that keeps a skipped conformance step from failing the evidence
  upload.
- [bitty #2791](https://github.com/bitty-terminal/bitty/issues/2791) and
  [PR #2801](https://github.com/bitty-terminal/bitty/pull/2801) - the merged
  containment, signal, reaping, and served `daemon.orphans.verify` slice.
- [bitty PR #2808](https://github.com/bitty-terminal/bitty/pull/2808) - the
  merged worker spawn/bind, generation 1, and `session.resize` content plane.
- [bitty PR #2811](https://github.com/bitty-terminal/bitty/pull/2811) - the
  merged per-lease event wire, bounded backlog, and terminal guarantee.
- [bitty PR #2815](https://github.com/bitty-terminal/bitty/pull/2815) - the
  merged request deadline and the typed `Timeout`.
- [bitty PR #2816](https://github.com/bitty-terminal/bitty/pull/2816) - the
  merged 1.2 session and daemon metadata keys.
- [bitty #2822](https://github.com/bitty-terminal/bitty/issues/2822) - the
  release gate cites a nonexistent `DR-01` through `DR-08` register.
- [bitty #2823](https://github.com/bitty-terminal/bitty/issues/2823) - the
  P0-AC-023 `close_range` ordering proof is absent from the worker path.
- [bitty #2824](https://github.com/bitty-terminal/bitty/issues/2824) - the
  worker child inherits three extra PTY slave descriptors from the stdio dups.
- [bitty #2664](https://github.com/bitty-terminal/bitty/issues/2664) - the
  conformance corpus that freezes the JSON and frame spelling.
- [`bitty-daemon` README at `adb15d15`](https://github.com/bitty-terminal/bitty/blob/adb15d15/crates/bitty-daemon/README.md)
  - the service-loop scope statement, the resolved P1 notes, and the remaining
    deferred slices.
