---
title: bittyd P0 Evidence Record 2026-11-13
description: Second dated Linux x86_64 campaign against a source build at bitty 9d0e8a88 re-checking P0-AC-021 through P0-AC-026, the live untrusted-content label, an external no-TCP scan, plugin connect and filesystem-escape refusals, and a full session lifecycle
category: security
audience: security-reviewer
document_type: register
status: draft
website_publish: false
sidebar_order: 40
---

# bittyd P0 Evidence Record 2026-11-13

**Status: dated evidence record; independent review pending.** This record
captures a second Linux x86_64 campaign, this time against a binary built from
`bitty` source at `9d0e8a88` (workspace version `0.0.40`, service API 1.5)
rather than an installed release. It re-checks `P0-AC-021` through `P0-AC-026`,
records the live attach/observer/detach/abort/force-stop/drain sequence the
[2026-11-08 record](bittyd-p0-evidence-2026-11-08.md) listed as backlog, adds
the external no-TCP scan, and adds the plugin `connect()` and
filesystem-escape refusals that the earlier record placed out of scope.

Two results differ from 2026-11-08. `P0-AC-024` moves from Not verified to
Partially verified: the live `session.read` response now carries
`"is_untrusted_surface": true`, so the earlier finding no longer holds.
Second-uid isolation was not exercised at all — this host cannot escalate, so
that cell is Not verified with the exact command it would need.

This record marks **no** criterion Verified and moves no risk state: the
evidence-matrix rows `R-011`..`R-014` and the daemon intake rows `DR-01`..`DR-08`
remain `Open`, and that matrix is deliberately not edited here. Independent
review owns every transition.

## Purpose

The `bittyd` P0 campaign for bitty#2921 named four captures that the 2026-11-08
record either could not produce or explicitly excluded: a post-fix re-check of
the untrusted content label, an external no-TCP scan of a live daemon, the
plugin `connect()` and filesystem-escape refusals, and a live
attach/detach/abort/force-stop/drain campaign with recorded exit codes. This
record supplies them at the current revision so a reviewer can replay each line
of command text.

In scope:

- `P0-AC-021` through `P0-AC-026` on the Linux x86_64 Unix-socket cell;
- a source build of `bittyd` at `9d0e8a88`, driven through its own CLI and
  through the accepted v1 envelope on the real endpoint;
- the plugin-runtime refusals for network egress and filesystem escape, which
  are plugin-host and plugin-VM controls rather than daemon-endpoint controls.

Out of scope:

- the Windows named-pipe transport and every non-Linux cell;
- remote transport, SSH, mobile control, and any network listener;
- a GUI terminal instance and its `bitty ctl` scope cells;
- the MCP/Agent adapter audit and any independent review verdict;
- second-uid isolation, which could not be run (see residuals).

## Source identity

- `bitty` at `9d0e8a88ca2edf2c1ce89f3195d208175182e290`, committed
  `2026-11-13 05:35:54 +0800`; workspace version `0.0.40`.
- Built with `cargo build --release -p bitty-daemon --bin bittyd`, which
  reported the `Finished` `release` profile in a scratch target directory and
  never in the repository tree. Binary size `1,699,112` bytes, SHA-256
  `c2ba5d2257bf80146eb1ff9f11e10f4bd85f47fe6a5624cfdde96ccff3d4b933`.
- `bittyd --version` prints `bittyd 0.0.40 (service API 1.5)`.
- `bitty-ipc` remains the `9493674` pin the daemon already resolves; this
  campaign adds no second wire format.
- Linux x86_64, cgroup v2 containment. `daemon.status` reported
  `mechanism: cgroup_v2`, `claim: swept`, `verify: served`, and
  `tcp_listeners: 0`.
- Each run used a throwaway root under `/tmp/bitty/ctx-0313/` with
  `XDG_RUNTIME_DIR`, `XDG_CONFIG_HOME`, `XDG_DATA_HOME`, `XDG_STATE_HOME`, and
  `HOME` beneath it, `BITTYD_ENDPOINT=$XDG_RUNTIME_DIR/bitty/bittyd.sock`, and a
  per-run `BITTY_INSTANCE_ID`. The host's own `bitty`/`bittyd` instance was
  never started, signalled, or inspected.
- The daemon was started with the built binary's own `bittyd start` and stopped
  with `bittyd stop`, `bittyd stop --drain`, or `bittyd stop --force`; every
  recorded PID was re-checked gone with `ps`.

### Client disclosure

`bittyd` exposes only `start`, `stop [--force | --drain]`, `status`, and
`--version`; `bitty ctl` targets a running GUI instance, not the daemon's
session registry. No headless session verb ships at this revision, so the
session verbs in this record were driven over the real endpoint by a scripted
client that writes the accepted v1 envelope (4-byte big-endian length prefix
plus JSON) and opts into `SO_PASSCRED`, which the served loop requires on Linux.
That client is a campaign instrument, not a product surface, and it is not part
of the repository. The repository's own real-service driver
(`crates/bitty-daemon/tests/harness/real.rs`, run through the `conformance`
test) was executed as the independent second implementation of the same verbs,
and its machine-readable result is quoted below. Where the two disagree, this
record says so.

## Disposition

| Criterion   | 2026-11-08         | 2026-11-13 (this record) | Decisive command                                                                                                                                                                                                                                                       | Observed result                                                                                                                                                                                                                                                                                                                                                             | Artifact                                      |
| ----------- | ------------------ | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `P0-AC-021` | Verified (Linux)   | Partially verified       | `stat` on the runtime directory, socket, lock, and operator file; `ss -ltnp`/`ss -tnp` filtered by daemon PID; `lsof -nP -p $PID -a -i`; global `ss -ltn` diff before/during/after; `daemon.status`                                                                    | Directory `0700`; socket, lock, and operator file `0600`; zero `ss` lines naming the daemon PID in every snapshot; `lsof` reports no internet socket; the global listen set gained no entry and lost only one unrelated pre-existing `[::ffff:127.0.0.1]:17205` listener; `tcp_listeners: 0`; a live same-uid handshake succeeded, so the empty scan is not a dead endpoint | Session transcripts, `ss`/`lsof` output       |
| `P0-AC-022` | Partially verified | Partially verified       | Live `daemon.negotiate`, `daemon.status`, `daemon.host_grant`, `session.create`, `session.attach`, `session.grant`, `session.write`, `session.read`, `session.detach`, `session.abort`; `cargo test -p bitty-daemon --test conformance --features test-seams --locked` | Observer `session.read`, `session.write`, and `session.abort` are all `Denied/ControllerRequired`; the observer attach carries no `control_token`; detach is idempotent (`was_attached: true` then `was_attached: false`, `state_revision` unchanged); the real-service conformance cell is 67 pass, 0 fail, 16 skip, 83 total                                              | Session transcripts, `linux-x86_64.real.json` |
| `P0-AC-023` | Partially verified | Not verified             | None: the child-environment capture was not re-run in this campaign                                                                                                                                                                                                    | No new observation. The 2026-11-08 child-environment cell (supplied `env` plus `TERM`, no `BITTY*`, no bearer, no secret-shaped name) stands unchanged and is not re-asserted here                                                                                                                                                                                          | —                                             |
| `P0-AC-024` | Not verified       | Partially verified       | Live `session.read` after controller attach with `max_bytes: 65536`; response-key inspection; observer `session.read` denial                                                                                                                                           | The response now carries `"is_untrusted_surface": true` alongside `buffered_bytes`, `bytes`, `data`, `generation`, and `session_id`; the decoded payload is the marker text the child wrote; the observer read is still `Denied/ControllerRequired`                                                                                                                         | `session.read` transcript                     |
| `P0-AC-025` | Partially verified | Partially verified       | Live `debug.inspect`, `debug.trace`, `debug.control`, `plugin.manage`, and `config.modify` against the daemon                                                                                                                                                          | Every call is `NotFound/NotFound` with `message: "target not found"`; the negotiated scope list advertises no `debug.*`, `plugin.*`, or `config.*` service scope                                                                                                                                                                                                            | Debug probe transcript                        |
| `P0-AC-026` | Partially verified | Partially verified       | `stat` on the audit directory and segment; record inspection; content greps on the audit segment                                                                                                                                                                       | Audit directory `0700`, segment `0600`, 31 line-oriented records; zero occurrences of `CTX0313`, `CONTENT-MARKER`, `DUMP_DIR`, `PATH=`, `sleep 300`, `control_token`, or `operator_capability`; the operator bearer is absent                                                                                                                                               | Audit segment, mode/grep output               |

### P0-AC-021 endpoint modes and the external no-TCP scan

Mode capture while the daemon served one live session:

```sh
stat -c '%a %U %G %F %n' "$XDG_RUNTIME_DIR/bitty" \
  "$XDG_RUNTIME_DIR/bitty/bittyd.sock" "$XDG_RUNTIME_DIR/bitty/bittyd.lock" \
  "$XDG_RUNTIME_DIR/bitty/bittyd.operator"
```

Observed:

```text
700 fuyu fuyu directory /tmp/bitty/ctx-0313/runE/run/bitty
600 fuyu fuyu socket /tmp/bitty/ctx-0313/runE/run/bitty/bittyd.sock
600 fuyu fuyu regular empty file /tmp/bitty/ctx-0313/runE/run/bitty/bittyd.lock
600 fuyu fuyu regular file /tmp/bitty/ctx-0313/runE/run/bitty/bittyd.operator
```

The no-TCP scan is external to the daemon: a separate shell, no daemon code
path, and the daemon PID read from `ps`. Snapshots were taken at three points
of a full lifecycle — before `bittyd start`, with a session attached and
streaming, and after `bittyd stop --force`:

```sh
ss -ltnp | grep -F "pid=$PID"
ss -tnp  | grep -F "pid=$PID"
ss -lxnp | grep -F "pid=$PID"
lsof -nP -p "$PID" -a -i
ss -ltn | awk 'NR>1{print $4}' | sort > /tmp/bitty/ctx-0313/artifacts/listen-$PHASE.txt
diff /tmp/bitty/ctx-0313/artifacts/listen-before-runC.txt \
     /tmp/bitty/ctx-0313/artifacts/listen-during-runC.txt
```

Observed, with a session attached and a `sleep 300` worker running:

```text
$ ss -ltnp   # 36 line(s) total, 0 line(s) naming pid 1495415
$ ss -tnp    # 38 line(s) total, 0 line(s) naming pid 1495415
$ ss -lxnp   # 129 line(s) total, 0 line(s) naming pid 1495415
$ lsof -nP -p 1495415 -a -i
lsof: WARNING: can't stat() overlay file system .../overlayfs/...
lsof: WARNING: can't stat() nsfs file system /run/docker/netns/...
lsof_rc=1
```

`lsof -a -i` prints no row and exits 1, which is lsof's "no matching open
file" result; the warnings name unrelated overlay and netns mounts, not the
daemon. The `ss` line totals move between snapshots because the host carries
dozens of unrelated listeners and this campaign's own tooling opens sockets, so
the totals are not the evidence — the per-PID filter and the global set diff
are.

Global listening-TCP set, before versus during the run:

```text
37d36
< [::ffff:127.0.0.1]:17205
```

No listener was added. One pre-existing IPv4-mapped listener disappeared
between the two snapshots; it is not the daemon (the daemon had already been
running and serving for the whole interval) and it did not return after the
stop. The before-versus-after diff is identical. The daemon's own
`daemon.status` simultaneously reported `tcp_listeners: 0`, and the Unix socket
appears in `ss -lxnp` as `u_str LISTEN ... /tmp/bitty/ctx-0313/runC/run/bitty/bittyd.sock`,
so the scan is against a live, bound endpoint.

Disclosed limitation: `/proc/<pid>/fd` is not readable from this campaign shell
— the directory is `dr-x------ root root` because the daemon runs non-dumpable
under this harness even though it runs as `uid 1000` — so the descriptor table
could not be enumerated and `ss -p` could not attribute the Unix socket. The
no-TCP conclusion therefore rests on the per-PID `ss` filters, `lsof`, the
global set diff, and the self-reported counter, not on a descriptor dump.

Status: **Partially verified**. The mode assertions and the no-TCP cell are
directly observed; the foreign-uid cell is not, because this host cannot
escalate.

### P0-AC-022 live session lifecycle and exit codes

Handshake and status, from one operator connection:

```text
"capabilities": {"control_transfer": true, "events": true, "idempotent_mutations": true,
                 "observer_grants": true, "terminal_sessions": true, "worker_sessions": false}
"service_api_version": {"major": 1, "min_client_minor": 0, "minor": 5}
"server_identity": {"endpoint_kind": "unix_socket", "endpoint_mode": 384, "endpoint_owner": 1000, "uid": 1000}
"scopes": ["session.inspect","session.attach","session.control","daemon.inspect","daemon.control",
           "terminal.inspect","terminal.input","terminal.manage","process.spawn"]
```

`384` is `0600`, matching the `stat` cell. The creator connection, negotiated
with a freshly minted host grant, additionally carries `session.host`.

Controller create and attach:

```text
[creator] session.create -> {"ok": true, "result": {"control_token": "***", "replayed": false,
  "session": {"attach_count": 0, "controller_present": false, "generation": 1, "kind": "terminal",
              "session_id": "245168d63cf74fb28b4cd78c6748e7f1", "state": "running",
              "state_revision": 1, "terminal_id": "ae706222fde8576eada575b850d9282b", ...}}}
[creator] session.attach -> {"ok": true, "result": {"attach_id": "61874ffafb220a867a51d014e2923173",
  "control_token": "***", "role": "controller", "session": {"attach_count": 1, "attached": true,
  "controller_present": true, "state": "running", "state_revision": 2, ...}}}
[observer] session.attach -> {"ok": true, "result": {"attach_id": "d567436457b3f92ba1ec40d797e9401c",
  "lease_expires_at_ms": 40140, "role": "observer", "session": {"attach_count": 2, ...}}}
```

The observer attach result carries no `control_token`. Observer content access
is refused by the lease, not by the transport scope (the observer connection
still holds `terminal.input` and `process.spawn`):

```text
[observer] session.read  -> {"ok": false, "error": {"class": "Denied", "code": "ControllerRequired", "message": "request denied"}}
[observer] session.write -> {"ok": false, "error": {"class": "Denied", "code": "ControllerRequired", "message": "request denied"}}
[observer] session.abort -> {"ok": false, "error": {"class": "Denied", "code": "ControllerRequired", "message": "request denied"}}
```

Detach is idempotent and does not resurrect the lease:

```text
[creator] session.detach -> {"ok": true, "result": {"attach_id": "61874ffa...", "was_attached": true,
  "not_attached": false, "revoked": false, "session": {"attach_count": 1, "controller_present": false,
  "state_revision": 6, ...}}}
[creator] session.detach -> {"ok": true, "result": {"attach_id": "61874ffa...", "was_attached": false,
  "not_attached": true, "revoked": false, "session": {"attach_count": 1, "controller_present": false,
  "state_revision": 6, ...}}}
```

A re-attach without the controller capability was refused rather than silently
granted:

```text
[creator] session.attach -> {"ok": false, "error": {"class": "Validation", "code": "InvalidRequest",
  "message": "request payload is malformed"}}
```

Abort, on a separate controller-attached session, moves `stopping` to
`terminated` with a swept worker:

```text
[creator] session.abort -> {"ok": true, "result": {"accepted": true, "deadline_ms": 42551,
  "reason": "consumer_cancel", "stage": "graceful", "session": {"state": "stopping", "state_revision": 3, ...}}}
[creator] session.status -> {"ok": true, "result": {"session": {"cleanup": "swept", "state": "terminated",
  "state_revision": 5, "terminal_reason": "consumer_cancel", ...}}}
```

Stop modes, from the CLI, with the sessions still live:

```text
$ bittyd stop
bittyd: stop: the daemon refused the stop: Denied/ActiveSessions (actual 2, limit 16)
exit=3

$ bittyd stop --drain
bittyd: stopped (drain) with 2 active session(s)
real    0m0.022s
exit=4

$ bittyd stop --force     # fresh daemon, one attached session
bittyd: stopped (force) with 1 active session(s)
real    0m0.012s
exit=0

$ bittyd stop             # after the daemon exited
bittyd: no running daemon
exit=0
```

After each stop the socket path was gone, `ps` showed the daemon PID absent, and
`pgrep -f "sleep 300"` returned no worker. Exit `4` on `--drain` is the
documented drain outcome for a build that has to terminate a live session; the
CLI's own help text states that is the only drain outcome this build serves.

Independent second implementation: the repository's real-service driver, which
starts the built binary and speaks the real endpoint:

```sh
cargo test -p bitty-daemon --test conformance --features test-seams --locked
```

```text
"cell": "linux-x86_64", "commit": "9d0e8a88ca2edf2c1ce89f3195d208175182e290",
"counts": {"fail": 0, "known_defect": 0, "pass": 67, "skip": 16, "skipped_assertions": 0, "total": 83},
"features": {"terminal_spawn": true, "verified_cleanup_sweep": true},
"diagnostics": {"containment.claim": "swept", "containment.mechanism": "cgroup_v2"}
```

The 16 skips are typed, not silent passes: `cell-not-servable: worker_sessions`,
`d01-amendment-required` (worker hosting awaits an accepted ADR amendment),
`requires-injected-clock`, `requires-injected-outbound-cap`,
`requires-child-fd-seam`, `requires-full-store-seam`, `requires-plugin-host`,
and `adapter-owned` rows. The corpus runs the fake driver and the real driver
separately and writes a parity report; a fake run never marks a real row.

Status: **Partially verified**. The live cells and the 67-vector real cell are
observed. Still missing: the full scope-by-method matrix as one artifact, the
terminal-instance `bitty ctl` cells, live `session.resize`,
`session.control.transfer`, `session.grant.revoke`, and `lease.heartbeat`, and
independent review.

### P0-AC-023 child process scope

Not re-exercised in this campaign. No `session.create` child was spawned with an
instrumented environment probe, and the non-dumpable daemon under this harness
made `/proc/<pid>/environ` reads of its workers unavailable, so re-running the
2026-11-08 method here would have produced a weaker capture, not a stronger one.
The earlier cell is unaffected and is not restated as current evidence.

Status: **Not verified in this record**; the 2026-11-08 Partially verified cell
stands on its own evidence.

### P0-AC-024 untrusted-observation label, re-checked

Controller `session.read` after the child wrote its markers:

```text
[creator] session.read -> {"ok": true, "result": {
  "buffered_bytes": 0,
  "bytes": 52,
  "data": "435458303331332d434f4e54454e542d4d41524b45522d300d0a435458303331332d434f4e54454e542d4d41524b45522d310d0a",
  "generation": 1,
  "is_untrusted_surface": true,
  "session_id": "245168d63cf74fb28b4cd78c6748e7f1"}}
# AC-024 read response keys: ["buffered_bytes", "bytes", "data", "generation", "is_untrusted_surface", "session_id"]
# AC-024 decoded content: 'CTX0313-CONTENT-MARKER-0\r\nCTX0313-CONTENT-MARKER-1\r\n'
```

The earlier finding — "the daemon's live content response does not carry that
typed label" — no longer reproduces. The label is a server-attached boolean on
the content response itself, present next to the payload, and the read-only
default still holds: the baseline connection has no `session.host`,
`session.create` without a host grant is refused, and the observer's content
read is `Denied/ControllerRequired`.

Status: **Partially verified**. The labeling half of the criterion now passes
live. Still missing: the MCP/Agent adapter audit (`bittyd` serves no MCP
surface), and the auditor review of instruction/data channel separation, which
the criterion names explicitly and which no test can supply.

### P0-AC-025 DevTools scopes distinct and ungranted by connection

```text
[operator] debug.inspect  -> {"ok": false, "error": {"class": "NotFound", "code": "NotFound", "message": "target not found"}}
[operator] debug.trace    -> {"ok": false, "error": {"class": "NotFound", "code": "NotFound", "message": "target not found"}}
[operator] debug.control  -> {"ok": false, "error": {"class": "NotFound", "code": "NotFound", "message": "target not found"}}
[operator] plugin.manage  -> {"ok": false, "error": {"class": "NotFound", "code": "NotFound", "message": "target not found"}}
[operator] config.modify  -> {"ok": false, "error": {"class": "NotFound", "code": "NotFound", "message": "target not found"}}
```

The handshake scope list for the same connection contains no `debug.*`,
`plugin.*`, or `config.*` entry, so the refusal is deny-by-default through the
method catalog rather than through the DevTools scope matrix. `bittyd` serves no
`debug.*` method at this revision.

Status: **Partially verified**. The three scopes are distinct and connection
alone grants none of them in the accepted matrix; a live DevTools endpoint and
client remain unexercised.

### P0-AC-026 Trace minimization and redaction

```sh
stat -c '%a %U %G %n' "$XDG_STATE_HOME/bitty" "$XDG_STATE_HOME/bitty/audit" \
  "$XDG_STATE_HOME/bitty/audit/audit.log"
head -3 "$XDG_STATE_HOME/bitty/audit/audit.log"
for pat in CTX0313 CONTENT-MARKER DUMP_DIR PATH= "sleep 300" control_token operator_capability; do
  grep -c -F "$pat" "$XDG_STATE_HOME/bitty/audit/audit.log"
done
grep -qF -f "$XDG_RUNTIME_DIR/bitty/bittyd.operator" "$XDG_STATE_HOME/bitty/audit/audit.log"
```

```text
700 fuyu fuyu /tmp/bitty/ctx-0313/runA/state/bitty
700 fuyu fuyu /tmp/bitty/ctx-0313/runA/state/bitty/audit
600 fuyu fuyu /tmp/bitty/ctx-0313/runA/state/bitty/audit/audit.log

v1 ev=1 t=10537 i=e31e89b2601268890fa8fb5a311d39dd a=daemon.negotiate r=ok u=1000 p=1466533 cid=6924058795799000352 k=none d=00000000000000000000000000000000
v1 ev=2 t=10540 i=e31e89b2601268890fa8fb5a311d39dd a=daemon.host_grant r=ok u=1000 p=1466533 cid=6924058795799000352 k=grant d=d9c485d499aaffa142790fdfbd748386
v1 ev=3 t=25125 i=e31e89b2601268890fa8fb5a311d39dd a=daemon.negotiate r=ok u=1000 p=1466963 cid=8020085992798456200 k=none d=00000000000000000000000000000000

CTX0313 -> 0
CONTENT-MARKER -> 0
DUMP_DIR -> 0
PATH= -> 0
sleep 300 -> 0
control_token -> 0
operator_capability -> 0
bearer_present_rc=1
```

31 records from a lifecycle that created six sessions, attached controllers and
observers, read content, detached, aborted, and force-stopped. The records carry
the closed field set (event id, monotonic stamp, daemon instance, action,
result, peer uid and pid, correlation, key kind, digest) and no argv, session
content, environment, control token, or operator bearer.

Status: **Partially verified**. File modes and content-freedom are observed.
Live trace/export preview equality, a crash-report path, and a seeded-secret
corpus remain absent.

## Plugin connect() and filesystem-escape refusals

These are issue-scope controls that the 2026-11-08 record excluded as
plugin-host and plugin-VM work. They are captured here from the repository's own
harnesses, at `9d0e8a88`.

### Network egress denied before any connection

A plugin reaches the network only through `bitty.component.request`, which the
plugin runtime gates on a granted `network.connect:*` capability of the
generation's own manifest. The production path — Lua call, per-tick pump,
canonical registry/grant/lifecycle check, component spawn — is exercised by the
real end-to-end surface test:

```sh
cargo test -p bitty-runtime --test component_request_surface -- --nocapture
```

```text
served: ok:200:https://api.example.com/v1/ping|grant:api.example.com:443 (component pid Some(1494013), spawns 1)
denied: err:E_COMPONENT_CAPABILITY_DENIED
out-of-grant: err:E_COMPONENT_REQUEST_FAILED:grant denied: api.example.com:80
oversize: err:E_COMPONENT_PAYLOAD_TOO_LARGE
crashed: err:E_COMPONENT_REQUEST_FAILED:component lost: component closed its output
deadline: err:E_COMPONENT_TIMEOUT

test result: ok. 7 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 2.99s
```

Two distinct refusals are recorded. A generation whose grant record is revoked
gets the typed `E_COMPONENT_CAPABILITY_DENIED` before any submit. A generation
that is granted `api.example.com:443` but asks for the `http://` scheme — port
80 — is refused by the component's own grant comparison,
`grant denied: api.example.com:80`, before it opens a connection. The served
control case shows the same fixture reaching its destination when the grant
matches, so the denial is not a dead component.

The same typed class is asserted at the VM boundary, where the Lua callback
turns the bridge error into a Lua error the plugin can catch:

```sh
cargo test -p bitty-lua --test component_bridge poll_raises_the_typed_failure_classes
# test result: ok. 1 passed; 0 failed; ... finished in 0.00s
# asserts stored "denied" == "E_COMPONENT_CAPABILITY_DENIED"
```

### Filesystem escape denied

The Lua filesystem bridge refuses out-of-grant requests with a typed code and no
content bytes in the denial. The VM harness test
`fs_denials_are_typed_and_oracle_tight` (`crates/bitty-lua/tests/fs_bridge.rs`)
asserts `err.code == "E_FS_SCOPE_MISMATCH"` for a path outside the granted
prefix, `E_FS_SENSITIVE_PATH` for a credential-shaped name, and
`E_FS_SECRET_CONTENT` for a secret-shaped write; the harness does not print the
codes, so they are quoted from the assertion text at this revision:

```text
assert(ok == false, "out-of-scope must deny")
assert(err.code == "E_FS_SCOPE_MISMATCH", "typed denial, got " .. tostring(err.code))
assert(not string.find(err.message, "hello"), "no content bytes in denial")
```

```sh
cargo test -p bitty-lua --test fs_bridge fs_denials_are_typed_and_oracle_tight
# test result: ok. 1 passed; 0 failed; ... finished in 0.00s
```

The real filesystem backend, not the fake, denies a symlinked escape and does
not list the escaping entry:

```sh
cargo test -p bitty-runtime --lib plugin_runtime::fs_list::tests::symlink_escape -- --nocapture
# test plugin_runtime::fs_list::tests::symlink_escape_is_denied_and_not_listed ... ok
# test result: ok. 1 passed; 0 failed; ... finished in 0.00s

cargo test -p bitty-runtime --lib plugin_runtime::fs::tests::bounded_reader_rejects_symlinked_directory_ancestors
# test ... ok
# test result: ok. 1 passed; 0 failed; ... finished in 0.00s
```

Both assert `error.code == "E_FS_SCOPE_MISMATCH"` for the symlinked-directory
escape; the second asserts that the bounded reader refuses any path whose
ancestor is a symlink, which is the escape the plugin VM cannot represent
lexically.

Status: **Partially verified** for both families. The denials are typed, they
happen before any connection or read, and the control cases pass. Missing: a
live plugin installed from a package (these harnesses build the plugin
generation in-process), an outbound connection attempt observed at the socket
layer, and independent review of the plugin-host policy.

## Residuals

- **Second-uid isolation: Not verified.** The probe was attempted once and
  refused:

  ```text
  $ sudo -n true
  sudo: a password is required
  sudo_rc=1
  ```

  This environment cannot escalate and the campaign does not ask for a password.
  The run that would close the cell, from a second local account, is:

  ```sh
  sudo -n -u nobody env XDG_RUNTIME_DIR=/run/user/1000 bittyd stop --force
  # plus a bare connect probe as that uid:
  sudo -n -u nobody python3 /tmp/bitty/ctx-0313/bin/probe_connect.py \
    "$XDG_RUNTIME_DIR/bitty/bittyd.sock"
  ```

  Expected from the `0700` directory and `0600` socket: `EACCES` on the connect,
  and exit `6` from `bittyd stop` if the path is reachable at all. Not run, so
  not claimed.

- **No-TCP scan: descriptor table absent.** `/proc/<pid>/fd` is unreadable from
  this shell because the daemon runs non-dumpable here; the conclusion rests on
  `ss`/`lsof`/global diff instead. A reviewer with the same uid and a dumpable
  process can add `ls -l /proc/<pid>/fd` and a `/proc/net/tcp` inode join.
- **`P0-AC-023` not re-exercised** in this campaign; the child-environment cell
  needs a dumpable worker or a different probe channel.
- **MCP/Agent adapter audit absent.** `P0-AC-024`'s labeling half now passes
  live, but the adapter that consumes labeled content is a different component
  and is not audited here.
- **DevTools endpoint absent.** `P0-AC-025` remains a matrix-and-catalog result
  until a real endpoint exists.
- **Trace export preview and crash reports** are still unexercised for
  `P0-AC-026`.
- **Independent review.** No criterion in this record is marked Verified. The
  evidence-matrix rows `R-011`..`R-014`, the daemon intake rows `DR-01`..`DR-08`,
  and the risk-register states stay as they are; a reviewer, not this record,
  decides whether the new captures change them. In particular, the
  `P0-AC-024` sentence in the evidence matrix describing the 2026-11-08 finding
  is superseded by the live capture above and should be re-read against it.

## References

- [Security overview](overview.md)
- [Threat model](threat-model.md)
- [P0 acceptance criteria](p0-acceptance-criteria.md)
- [Evidence matrix](evidence-matrix.md)
- [bittyd P0 evidence plan](bittyd-p0-evidence-plan.md)
- [bittyd P0 evidence record 2026-11-08](bittyd-p0-evidence-2026-11-08.md)
- [Extension execution mediation](extension-execution-mediation.md)
- [Sandbox confinement posture](sandbox-posture.md)
- [Risk register](risk-register.md)
