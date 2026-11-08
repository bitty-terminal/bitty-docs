---
title: bittyd P0 Evidence Record 2026-11-08
description: Dated Linux x86_64 campaign recording P0-AC-021 through P0-AC-026 against the installed bittyd 0.0.36 release binary
category: security
audience: security-reviewer
document_type: register
status: draft
website_publish: false
sidebar_order: 39
---

# bittyd P0 Evidence Record 2026-11-08

**Status: dated evidence record; independent review pending.** This record
captures one Linux x86_64 campaign against the installed `bitty`/`bittyd` 0.0.36
release (`fcd622e`, service API 1.4). It records `P0-AC-021` as Verified for the
Linux Unix-socket cell, `P0-AC-022`, `P0-AC-023`, `P0-AC-025`, and `P0-AC-026`
as Partially verified, and `P0-AC-024` as Not verified because the live
`session.read` response carries terminal content without a typed untrusted
label. It moves no risk state: the evidence-matrix rows `R-011`..`R-014` and the
daemon intake rows `DR-01`..`DR-08` remain `Open` where their full criteria sets
are unmet. This is an evidence record, not an independent security review and
not a risk transition.

## Purpose

The `bittyd` P0 campaign for bitty#2921 requires a second-uid run, an external
no-TCP scan, a live attach/observer/abort/force-stop sequence, and a dated
record for every criterion. This record supplies those captures for the local
daemon endpoint and states exactly which parts of each criterion were exercised
live, which are supported by named tests, and which remain unproven.

In scope:

- `P0-AC-021` through `P0-AC-026` on the Linux x86_64 Unix-socket cell;
- the endpoint, peer-credential, scope, child-environment, content-label,
  DevTools-scope, and audit-minimization evidence the criteria name;
- the installed release binary, not a source build.

Out of scope:

- the Windows named-pipe transport and every non-Linux cell;
- remote transport, remote attach, SSH, mobile control, and any network
  listener;
- the independent review verdict and any risk-state change;
- a GUI terminal instance and its `bitty ctl` scope cells;
- a live DevTools endpoint or a live MCP/Agent adapter;
- a plugin `connect()` denial and filesystem-escape refusal; those are
  plugin-host and plugin-VM controls, not the daemon endpoint surface, and need
  the plugin runtime harness.

## Source identity

- `bitty 0.0.36 (stable fcd622e)` and `bittyd 0.0.36 (service API 1.4)`, the
  installed release binaries. The source revision is the `v0.0.36` tag in
  `bitty`; citations below are against `bitty` `fcd622e`.
- `bitty-ipc` at `9493674`, the revision `bitty-daemon` pins and the evidence
  matrix cites. The IPC tests in this record ran at that revision.
- Linux x86_64, cgroup v2 containment. `daemon.status` reported
  `mechanism: cgroup_v2`, `claim: swept`, `verify: served`.
- The daemon ran in an isolated scratch root: `XDG_RUNTIME_DIR`,
  `XDG_CONFIG_HOME`, `XDG_DATA_HOME`, `XDG_STATE_HOME`, and `HOME` all under
  `$SCRATCH`; `BITTYD_ENDPOINT=$SCRATCH/runtime/bitty/bittyd.sock`;
  `BITTY_INSTANCE_ID=ac021-campaign`. It was started with
  `setsid nohup bittyd start`, stopped with an operator `daemon.stop force`,
  and the recorded PID was verified gone. No owner instance was used, started,
  or signalled.
- Raw captures are in `bitty/recording/ctx-2921/evidence/`, a repository-local
  gitignored directory. Commands in this record use `$SCRATCH` for the isolated
  root and elide host-specific paths.

## Disposition

| Criterion   | Status                  | Decisive command                                                                                                                                                                                                          | Observed result                                                                                                                                                                                                                                                                          | Artifact                                                                        |
| ----------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `P0-AC-021` | Verified (Linux x86_64) | `stat` on the runtime directory, socket, lock, and operator file; `ss -ltnp`/`ss -tanp` filtered by daemon PID; container `uid 1001` and container-root connect probes                                                    | Directory `0700`; socket, lock, and operator `0600`; no TCP line; `uid 1001` denied at directory traversal and socket mode; container root connects then gets `connection reset by peer` at peer capture; same-uid probe completes the handshake                                         | `AC-021-endpoint.txt`, `AC-021-foreign-uid.txt`, `AC-021-no-tcp.txt`            |
| `P0-AC-022` | Partially verified      | Live `daemon.negotiate`, `daemon.status`, `daemon.stop`, `session.create`, `session.attach`, `session.grant`, `session.write`, `session.read`, `session.abort`, `session.kill`; `cargo test -p bitty-ipc-api` scope tests | Baseline `daemon.status`/`daemon.stop` are `Denied/ScopeViolation`; observer `session.write`/`session.read`/`session.abort` are `Denied/ControllerRequired`; observer `session.kill` is `Denied/ScopeViolation`; observer `session.create` is `Denied/ConsentRequired`; scope tests pass | `AC-022-scope-matrix.txt`, `AC-023-child-env.txt`, `AC-022-ipc-scope-tests.txt` |
| `P0-AC-023` | Partially verified      | `session.create` with an explicit `env`; child `env` and `/proc/self/environ` dump; host `/proc/<pid>/environ`; `grep -F -f` against the operator file; secret-shaped-name grep                                           | Initial `/proc/<pid>/environ` is the supplied specification plus `TERM`; the shell's `env` output also shows `PWD`, `SHLVL`, and `_`; no `BITTY*`, `SSH_AUTH_SOCK`, `AWS_*`, token, secret, password, or operator bearer; child file `0600`; `/proc/<pid>/environ` `0400`                | `AC-023-child-env.txt`, `child-env.txt`                                         |
| `P0-AC-024` | Not verified            | Live `session.read` after controller attach; response-key inspection; `cargo test -p bitty-ipc untrusted_label_cannot_be_cleared`; `cargo test -p bitty-ipc-api mcp_readonly_cannot_produce_effect`                       | Read returns 96 bytes of terminal content with keys `buffered_bytes`, `bytes`, `data`, `generation`, `session_id`; no `untrusted`, `label`, or `observation` key; the read-only default and controller-lease denials hold                                                                | `AC-024-untrusted-label-live.txt`, `AC-024-untrusted-label-tests.txt`           |
| `P0-AC-025` | Partially verified      | Live `debug.inspect`, `debug.trace`, `debug.control` against the daemon; `cargo test -p bitty-ipc-devtools` scope-matrix tests                                                                                            | Live calls are `NotFound/NotFound`; handshake advertises no `debug.*`; the DevTools scope matrix, plugin-runtime matrix, and elevation matrix pass                                                                                                                                       | `AC-025-devtools-scopes.txt`, `AC-025-AC-026-devtools-tests.txt`                |
| `P0-AC-026` | Partially verified      | `stat` on the audit directory and segment; `head` and content greps on the audit segment; DevTools redaction tests                                                                                                        | Audit directory `0700`, segment `0600`; records are content-free (no argv, environment, session content, control token, or operator bearer); redaction and input-gating tests pass                                                                                                       | `AC-026-trace-redaction.txt`, `AC-025-AC-026-devtools-tests.txt`                |

### P0-AC-021 endpoint and peer credentials

Command:

```sh
stat -c '%a %U %G %n' "$XDG_RUNTIME_DIR" "$XDG_RUNTIME_DIR/bitty" \
  "$XDG_RUNTIME_DIR/bitty/bittyd.sock" "$XDG_RUNTIME_DIR/bitty/bittyd.lock" \
  "$XDG_RUNTIME_DIR/bitty/bittyd.operator"
ss -ltnp | grep -F "pid=$PID"
ss -tanp | grep -F "pid=$PID"
docker run --rm --user 1001:1001 -v "$ENDPOINT_DIR:/e:ro" ... /probe /e/bittyd.sock
docker run --rm --user 0:0 -v "$ENDPOINT_DIR:/e:ro" ... /probe /e/bittyd.sock
docker run --rm -v "$ENDPOINT_DIR:/e" -v /usr/bin/bittyd:/bittyd:ro \
  -e BITTYD_ENDPOINT=/e/bittyd.sock -e XDG_RUNTIME_DIR=/e \
  ubuntu:24.04 /bittyd stop --force
```

Observed:

| Attempt                                    | Result                                                                       | Denying layer                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `uid 1001`, endpoint directory mounted     | `CONNECT_ERROR: ... connect: permission denied`                              | `0700` runtime-directory traversal                              |
| `uid 1001`, socket file mounted directly   | `CONNECT_ERROR: ... connect: permission denied`                              | `0600` socket mode                                              |
| Container root, endpoint directory mounted | `CONNECT_OK`, then `READ_ERROR: ... connection reset by peer`                | peer-credential capture at accept (uid/user-namespace mismatch) |
| Same-uid host probe                        | `CONNECT_OK`, `READ_OK` handshake                                            | control; the endpoint is live                                   |
| Container root `bittyd stop --force`       | `bittyd: stop: operator authentication failed`, exit `6`; daemon still alive | peer capture before the operator capability is evaluated        |

The runtime directory is `0700`; the socket, lock file, and operator file are
`0600`; all are owned by the daemon uid. `ss -ltnp` and `ss -tanp` produced no
line for the daemon PID; `daemon.status` reported `tcp_listeners: 0`; `lsof -p
$PID -a -i` reported no internet sockets. The same-uid probe completed a
`daemon.negotiate` handshake, so the empty TCP scan is not a dead-endpoint
artefact.

A container root process can read the `0600` operator file through DAC
override (65 bytes), but the daemon closes the connection before the bearer is
evaluated. A `uid 1001` process cannot read the operator file at all
(`Permission denied`) because the `0700` directory denies traversal. Possession
of the operator file is therefore not sufficient for a foreign peer. The
same-uid residual is unchanged: any process running as the daemon user can read
the file, so the capability is an intent gate, not an isolation boundary.

Source path: `crates/bitty-daemon/src/endpoint.rs` declares `RUNTIME_DIR_MODE =
0o700`, `SOCKET_MODE = 0o600`, and `LOCK_FILE_MODE = 0o600`, and attests the
directory and socket; `crates/bitty-daemon/src/peer.rs` `PeerGuard::capture`
performs the `SO_PEERCRED` uid check and the user-namespace comparison;
`crates/bitty-daemon/src/service/server.rs` `accept_peer` returns `None` when
capture fails, dropping the connection before any frame is parsed;
`crates/bitty-daemon/src/operator.rs` creates the owner-private capability file.

Status: **Verified (Linux x86_64)** for the criterion's Unix-socket pass
threshold: foreign-user connection denied, endpoint mode and ownership
asserted, no default TCP listener. The [bittyd P0 evidence plan](bittyd-p0-evidence-plan.md)
records the earlier campaign as `supported`; this dated record is the later
evidence for the Linux cell and is subject to the independent review that
performs the final transition. Not exercised in this campaign: the Windows
named-pipe branch, second-instance refusal, tamper exit `6`, a passed-descriptor
per-frame credential re-check, and a peer-exit-before-privileged-action probe.

### P0-AC-022 per-action scopes

Command: the live client transcript in
`bitty/recording/ctx-2921/evidence/AC-022-scope-matrix.txt` (baseline,
operator, host-grant creator, and observer connections), the creator
create/attach transcript in `AC-023-child-env.txt`, and:

```sh
cargo test -p bitty-ipc-api authorize_allows_and_denies
cargo test -p bitty-ipc-api mcp_readonly_cannot_produce_effect
cargo test -p bitty-ipc-api no_bundled_admin_scope
```

The driver script is `bitty/recording/ctx-2921/final_campaign.py`; it starts the
daemon, runs the connections, and writes the per-section captures. The
container probe source is `bitty/recording/ctx-2921/probe/main.go`.

Observed live cells:

| Client             | Effective scopes                                                                                                                 | Method                                                                            | Result                                      |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------- |
| Baseline consumer  | `session.inspect`, `session.attach`, `session.control`, `terminal.inspect`, `terminal.input`, `terminal.manage`, `process.spawn` | `daemon.status`                                                                   | `Denied/ScopeViolation`                     |
| Baseline consumer  | same                                                                                                                             | `daemon.stop`                                                                     | `Denied/ScopeViolation`                     |
| Baseline consumer  | same                                                                                                                             | `session.create`                                                                  | `Denied/ConsentRequired`                    |
| Operator           | baseline plus `daemon.inspect`, `daemon.control`                                                                                 | `daemon.status`                                                                   | success                                     |
| Host-grant creator | baseline plus `session.host`                                                                                                     | `session.create`                                                                  | success; controller attach and read succeed |
| Observer           | baseline                                                                                                                         | `session.list`                                                                    | success (own lease only)                    |
| Observer           | baseline                                                                                                                         | `session.write`                                                                   | `Denied/ControllerRequired`                 |
| Observer           | baseline                                                                                                                         | `session.read`                                                                    | `Denied/ControllerRequired`                 |
| Observer           | baseline                                                                                                                         | `session.abort`                                                                   | `Denied/ControllerRequired`                 |
| Observer           | baseline                                                                                                                         | `session.kill`                                                                    | `Denied/ScopeViolation`                     |
| Observer           | baseline                                                                                                                         | `session.create`                                                                  | `Denied/ConsentRequired`                    |
| Observer           | baseline                                                                                                                         | `daemon.status`, `daemon.stop`                                                    | `Denied/ScopeViolation`                     |
| Observer           | baseline                                                                                                                         | `debug.inspect`, `debug.trace`, `debug.control`, `config.modify`, `plugin.manage` | `NotFound/NotFound`                         |

The three IPC scope tests pass at `bitty-ipc` `9493674`. The live daemon also
shows that the baseline transport grant is broader than "inspect/read": every
same-user connection receives `terminal.inspect`, `terminal.input`,
`terminal.manage`, and `process.spawn`. The service-scope boundary is what
denies administration: `session.host` is absent, and `daemon.*` is
operator-only. The controller lease, not the transport scope alone, gates
content read/write; an observer holding `terminal.input` is still refused
`Denied/ControllerRequired`. This is a scope-surface observation, not a
weakening of the pass threshold.

Status: **Partially verified**. Missing: the full 15-transport-scope by
51-method matrix as one machine-readable artifact; the terminal-instance
`bitty ctl` cells (no GUI instance was started); live `session.resize`,
`session.control.transfer`, `session.grant.revoke`, and `lease.heartbeat`; the
`(spawn=false, host=false)` create cell, which is unreachable because every
connection receives transport `process.spawn`; and independent review.

### P0-AC-023 child process scope limitation

Command: `session.create` with `kind: terminal`, an explicit four-entry `env`
(`PATH`, `HOME`, `DUMP_DIR`, `AC021_MARKER`), a child script that writes `env`
and `/proc/self/environ` to a `0600` file, then:

```sh
cat "$SCRATCH/evidence/child-env.txt"
tr '\0' '\n' < /proc/$CHILD_PID/environ | sort
grep -qF -f "$OPERATOR_FILE" "$SCRATCH/evidence/child-env.txt"
grep -qF -f "$OPERATOR_FILE" /proc/$CHILD_PID/environ
grep -E 'BITTY|TOKEN|SECRET|PASSWORD|SSH_AUTH_SOCK|AWS_|GIT_ASKPASS|OP_SERVICE|CONTROL' \
  "$SCRATCH/evidence/child-env.txt"
```

Observed: the child reported `uid 1000`, `gid 1000`, and `ppid` equal to the
daemon PID. Its initial `/proc/<pid>/environ` was exactly `PATH`, `HOME`,
`DUMP_DIR`, `AC021_MARKER`, and the daemon-added `TERM=xterm-256color`; the
shell's own `env` output also showed `PWD`, `SHLVL`, and `_`. No `BITTY*`,
`SSH_AUTH_SOCK`, `AWS_*`, token, secret, password, or operator bearer appeared
in the child dump or in `/proc/<pid>/environ`; the operator bearer grep returned
`OPERATOR_BEARER_ABSENT` for both. The child file is `0600`; the procfs
environment file is `0400`.

Source path: `crates/bitty-daemon/src/worker.rs` calls `command.env_clear()`
and then adds only the spawn specification entries plus `TERM`;
`crates/bitty-daemon/src/spawn.rs` documents `env` as the child's environment,
not a patch over the daemon's.

Status: **Partially verified**. The criterion's "no admin token or durable
credential" pass threshold is met for the environment. Missing: a
`/proc/<pid>/fd` descriptor-table dump; a shell-startup or SSH-forwarding leak
probe beyond environment absence; and the "short-lived current-terminal scope
expires" clause. The served terminal path in 0.0.36 passes no child token in
the child environment, so that clause is not applicable to this daemon path;
the `bitty-ipc-auth` child-token lifecycle is a terminal-instance mechanism and
was not exercised here.

### P0-AC-024 MCP/Agent read-only default with untrusted labeling

Command: live `session.read` after controller attach, with `max_bytes: 65536`;
response-key inspection; and:

```sh
cargo test -p bitty-ipc untrusted_label_cannot_be_cleared
cargo test -p bitty-ipc-api mcp_readonly_cannot_produce_effect
```

Observed: the read returned `bytes: 96` and decoded terminal content
(`AC024-CONTENT-MARKER-0` through `-3`) with exactly the keys
`buffered_bytes`, `bytes`, `data`, `generation`, and `session_id`. No
`untrusted`, `label`, or `observation` key was present. The read-only default
is proven: the baseline connection has no `session.host`, `session.create` is
`Denied/ConsentRequired`, and observer content writes/reads are
`Denied/ControllerRequired`. The `bitty-ipc` execution outcome has
`is_untrusted_surface: true` and `untrusted_label_cannot_be_cleared` passes,
but the daemon's live content response does not carry that typed label.

Source path: `crates/bitty-daemon/src/service/dispatch.rs` `session_read`
builds the result object without a label field;
`crates/bitty-ipc/src/execution.rs` defines `is_untrusted_surface: true` for
execution outcomes; `crates/bitty-ipc-api/src/scope.rs` `ScopeSet::mcp_default`
defines the read-only MCP default.

Status: **Not verified**. The read-only default and consent gates hold, but the
criterion's pass threshold requires every response containing terminal content
to label it as untrusted observation data. The live daemon content plane fails
that requirement. `bittyd` does not serve MCP; the MCP/Agent adapter audit is
out of this campaign. This is a finding, not a partial pass.

### P0-AC-025 DevTools scopes distinct and ungranted by connection

Command: live `debug.inspect`, `debug.trace`, and `debug.control` against the
daemon; handshake scope inspection; and:

```sh
cargo test -p bitty-ipc-devtools trace_scope_matrix_denies_inspect_and_unscoped
cargo test -p bitty-ipc-devtools plugin_runtime_scope_matrix_per_rfc
cargo test -p bitty-ipc-devtools a3_test_exit_elevation_matrix_over_wire
```

Observed: the live daemon answers `NotFound/NotFound` for all three debug
methods, and its handshake advertises no `debug.*` scope. The DevTools tests
pass: connection alone grants none of the three scopes, inspect-only cannot
start a trace, and the control scope is required for the lifecycle verbs. The
daemon does not serve a DevTools endpoint in 0.0.36, so the live result is
deny-by-default through the method catalog, not the DevTools scope matrix.

Status: **Partially verified**. The test matrix is green and the three scopes
are distinct, but a live DevTools client against a real DevTools endpoint was
not run because `bittyd` 0.0.36 serves no `debug.*` method. Independent audit
remains.

### P0-AC-026 Trace minimization and redaction

Command:

```sh
stat -c '%a %U %G %n' "$XDG_STATE_HOME/bitty" \
  "$XDG_STATE_HOME/bitty/audit" "$XDG_STATE_HOME/bitty/audit/audit.log"
head -3 "$XDG_STATE_HOME/bitty/audit/audit.log"
grep -qF 'AC021' "$AUDIT"          # and DUMP_DIR, PATH=, child_pid, sleep 60
grep -qF 'control_token' "$AUDIT"
grep -qF 'operator_capability' "$AUDIT"
grep -qF -f "$OPERATOR_FILE" "$AUDIT"
cargo test -p bitty-ipc-devtools trace_redaction_and_input_gating
cargo test -p bitty-ipc-devtools record_roundtrip_redacts_and_gates_input
cargo test -p bitty-ipc-devtools automation_capture_redacts_env_and_private_key_lines
```

Observed: the audit directory is `0700` and the segment is `0600`; the records
are line-oriented, content-free, and carry only the closed field set (action,
result, peer uid/pid, session/attach/grant references, digests, counts). No
`AC021`, `DUMP_DIR`, `PATH=`, `child_pid`, `sleep 60`, `control_token`, or
`operator_capability` string appeared, and the operator bearer was absent. The
three DevTools redaction/input-gating tests pass at `bitty-ipc` `9493674`.

Status: **Partially verified**. The audit sink meets the owner-private mode and
content-free requirements; typed trace redaction and input-recording opt-in are
covered by the named tests. Missing: a live trace/export-preview comparison
(byte-for-byte preview equals export), a crash-report path, and a seeded-secret
corpus across every default output. The formal trace-minimization audit remains
absent.

## Verification backlog

- `P0-AC-021`: Windows named-pipe ACL, second-instance refusal, tamper exit
  `6`, passed-descriptor per-frame credential re-check, and
  peer-exit-before-privileged-action.
- `P0-AC-022`: full scope-by-method matrix artifact; terminal-instance
  `bitty ctl` cells; live `session.resize`, `session.control.transfer`,
  `session.grant.revoke`, `lease.heartbeat`, `session.detach`, and a daemon
  drain; independent review.
- `P0-AC-023`: child `/proc/<pid>/fd` descriptor table; shell-startup and
  SSH-forwarding leak probe; a child-scope expiry statement for a path that
  actually mints a child token.
- `P0-AC-024`: typed untrusted-observation label on every daemon content
  response; MCP/Agent adapter audit; hostile-output confused-deputy suite.
- `P0-AC-025`: live DevTools endpoint and client; formal DevTools scope audit.
- `P0-AC-026`: live trace/export preview, crash-report scan, and seeded-secret
  corpus; formal trace-minimization audit.
- Plugin `connect()` denial and filesystem-escape refusal from the issue scope;
  those require the plugin-host/VM harness and were not part of this daemon
  endpoint campaign.
- Independent security review of this record and the evidence matrix rows
  `R-011`..`R-014` and `DR-01`..`DR-08`. No row moves on this record alone.

## References

- [Security overview](overview.md)
- [Threat model](threat-model.md)
- [P0 acceptance criteria](p0-acceptance-criteria.md)
- [Evidence matrix](evidence-matrix.md)
- [bittyd P0 evidence plan](bittyd-p0-evidence-plan.md)
- [Risk register](risk-register.md)
