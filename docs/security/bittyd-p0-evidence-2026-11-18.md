---
title: bittyd P0 Evidence Record 2026-11-18
description: Live campaign at bitty 3c588f26 (workspace 0.0.45) driving a served bittyd through create, controller and observer attach, detach, consumer and operator abort, force stop, drain, and a clean shutdown, with the per-session journal record on disk and every observed exit code quoted
category: security
audience: security-reviewer
document_type: register
status: draft
website_publish: false
sidebar_order: 42
---

# bittyd P0 Evidence Record 2026-11-18

**Status: dated evidence record; independent review pending.** This is the
fourth dated record in the `bittyd` P0 campaign series, and the first since
[2026-11-13](bittyd-p0-evidence-2026-11-13.md) to serve a live `bittyd` endpoint
and drive it through the session lifecycle. It was taken at a later revision
than that capture — `bitty` `3c588f26`, workspace and binary version `0.0.45`,
against `0.0.40` — so it re-observes the lifecycle cells at current source
rather than carrying the `0.0.40` capture forward, and it adds four cells no
earlier record supplies:

- the **per-session record on disk**: the orphan-journal entry the daemon writes
  for a spawned session, its modes, its fields, and its removal on termination;
- a **second concurrent attach authorised by a live `session.grant`**, with the
  observer's own refusals and the observer attach result carrying no
  `control_token`;
- the **operator abort reason class** (`reason_class: operator`) beside the
  consumer `cancel` arm, both reaching `terminated` with `cleanup: swept`;
- the **stop-mode matrix on four separate daemons** — default `refuse` with
  sessions (`3`), `--drain` with sessions (`4`), `--force` (`0`), and both stop
  modes with no sessions (`0`), with the no-daemon path re-observed from the
  2026-11-13 record rather than claimed as new.

No criterion is marked Verified and no state moves: the evidence-matrix rows
`R-011`..`R-014` and the daemon intake rows `DR-01`..`DR-08` stay `Open`. A
record is not a review verdict, and the second-uid cell this host cannot run is
recorded as **NOT EXERCISED**, not as a pass.

## Purpose

bitty#2921 asks for the P0 acceptance criteria and the trust evidence to be
proved against the daemon. The plugin-denial and no-TCP cells are landed. The
live campaign — attach, detach, abort, force stop, and drain against a real
daemon, with the session record and the exit codes asserted — was last recorded
at `9d0e8a88` (`0.0.40`). This record pins it at `3c588f26` (`0.0.45`).

In scope:

- the whole binary surface this revision ships, taken from its own `--help`,
  including every subcommand's rejection behaviour;
- one served daemon under a throwaway runtime root, driven through handshake,
  `daemon.host_grant`, `session.create`, `session.list`, `session.attach`
  (controller and observer), `session.read`, `session.write`, `session.detach`,
  `session.abort`, `session.grant`, and `daemon.status`;
- the daemon's three stop modes and their exit codes, and the state of the
  process, socket, and journal after each;
- the session record on disk at three points: created, concurrently attached,
  and terminated.

Out of scope:

- the second-uid peer cell: this host has no passwordless escalation, so the
  cell is not exercised;
- the Windows named pipe and every non-Linux cell;
- the real-service conformance driver, the 15 × 51 scope matrix, and the
  `bitty ctl` terminal-instance cells, which the
  [2026-11-16 record](audits/bittyd-ac022-scopes-2026-11-16.md) already
  supplies at a different revision;
- the MCP/Agent adapter audit, the DevTools endpoint, and any independent
  review verdict.

## Source identity

- `bitty` at `3c588f26a347b2ca06452c9c431d00ba1d046615`
  (`[CTX-1887] fix(panel): produce the incompatible placeholder for a newer
provider contract (bitty#3239 row 13) (#3242)`), branch `main`, clean tree.
- Workspace version `0.0.45`; `bittyd --version` prints
  `bittyd 0.0.45 (service API 1.5)`.
- Built from the source tree with
  `cargo build -p bitty-daemon --bin bittyd --offline` into
  `CARGO_TARGET_DIR=/mnt/data/Workspace/Projects/bitty-terminal/.targets/ctx-0322-daemon`,
  never into the repository tree. The build reported `Finished` for the `dev`
  profile (`[unoptimized + debuginfo] target(s) in 4.71s`). This record
  discloses that the **dev** profile was built, not `release`: the lifecycle,
  journal, and exit-code behaviour under test is not profile-gated, but the
  recorded elapsed times are not release timings.
- Binary: `37665672` bytes, SHA-256
  `3f273364ea18bb5613ff72255cb32ca4eea5176067e8beccff5fe5edf4c04aea`.
- Linux `7.3.4-1-cachyos` x86_64, uid `1000`, cargo `1.98.1`
  (`797e8a9bc 2026-08-05`), rustc `1.98.1` (`48a229cea 2026-09-01`), boot id
  `f5d8fc05-afa8-4ff3-a100-8b347a96b3a5`. Containment probed as
  `mechanism: cgroup_v2`, `claim: swept`, `verify: served`.
- Every command ran with `XDG_RUNTIME_DIR`, `XDG_CONFIG_HOME`, `XDG_DATA_HOME`,
  `XDG_STATE_HOME`, and `HOME` pointed at
  `/home/fuyu/.hermes/cache/scratch/ctx0322/root/*`, so the owner's live
  `bittyd` (pid `1236`, socket `/run/user/1000/bitty/bittyd.sock`) was never
  started, signalled, connected to, or inspected by this campaign. Each daemon
  this record started is named by its own pid, and each was stopped through its
  own endpoint: `72677`, `77016`, `77243`, `77328`, `77949`, `81319`. All six
  were re-checked absent with `ps` after the campaign.

### Method and disclosure

The binary has no session verb: `bittyd` ships `start`, `stop [--force |
--drain]`, the no-argument status, `--version`, and `--help`, and nothing else.
The session verbs in this record were therefore driven over the real endpoint by
a scripted client that writes the accepted `bitty-ipc` v1 envelope — a 4-byte
big-endian length prefix plus the JSON object with `v`, `id`, `method`, and
`params` — and opts into `SO_PASSCRED`, which the served loop requires on Linux
(`crates/bitty-daemon/src/service/frame.rs:247`, and the CLI's own client at
`crates/bitty-daemon/src/client.rs`, which sets it before its first frame).

That client is a campaign instrument, not a product surface, and it is not part
of the repository. It was **not** cross-checked against the repository's
real-service conformance driver in this campaign, so there is no second
implementation behind these responses beyond the daemon itself; a reviewer who
wants that parity check should read the
[2026-11-16 record](audits/bittyd-ac022-scopes-2026-11-16.md), which ran it.

Every request and response below is quoted from the campaign transcript. Long
responses are abbreviated with `…` at the point of omission, and every ellipsis
is marked; no field value in this record is reconstructed. Bearers
(`control_token`, `host_grant`, `grant`, `operator_capability`) are replaced by
`***` before printing.

## Disposition

| Criterion   | 2026-11-15 (previous record)                    | 2026-11-18 (this record)                                | Decisive command                                                                                                                                                                                                                                                                       | Observed result                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Artifact                      |
| ----------- | ----------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `P0-AC-021` | Reproduced in part; second-uid cell **BLOCKED** | Corroborated in part; second-uid cell **NOT EXERCISED** | `stat` on the runtime directory, socket, lock, and operator file; `ss -ltnp`/`-tnp`/`-lxnp` filtered by daemon pid; `daemon.status`; a same-uid handshake                                                                                                                              | Directory `0700`; socket, lock, and operator file `0600`; audit directory `0700` with a `0600` segment; zero `ss` rows naming the daemon pid in all three scans while the Unix socket is `LISTEN`; `tcp_listeners: 0`; the handshake that produced the scan succeeded, so the empty scan is not a dead endpoint. A second uid was not presented                                                                                                                                                                                                                                                                                                                                             | `stat`/`ss` output, handshake |
| `P0-AC-022` | Carried forward from 2026-11-13                 | Reproduced at a new revision, with four new cells       | Live `daemon.negotiate`, `daemon.host_grant`, `session.create`, `session.list`, `session.attach` (controller and observer), `session.read`, `session.write`, `session.detach`, `session.abort` (consumer and operator), `session.grant`; `bittyd stop`, `stop --drain`, `stop --force` | Controller attach `state_revision` 2 with `attach_count` 1; concurrent observer attach under a live `session.grant` reaches `attach_count` 2 with roles `[observer, controller]` and carries no `control_token`; observer `session.read`/`session.write`/`session.abort` are all `Denied/ControllerRequired`; detach is idempotent (`was_attached: true`, then `not_attached: true`) with `state_revision` unchanged at 3; consumer abort reaches `terminated`/`consumer_cancel`/`cleanup: swept` and operator abort `terminated`/`operator_abort`/`cleanup: swept`; `stop` with live sessions exits `3`, `--drain` exits `4`, `--force` exits `0`, and both modes with no session exit `0` | Transcript, exit-code table   |
| `P0-AC-023` | **BLOCKED**                                     | No new observation                                      | None: no child environment or descriptor table was read in this campaign                                                                                                                                                                                                               | The [2026-11-16 child-scope record](audits/bittyd-child-scope-2026-11-16.md) remains the cell. This record spawned children but did not inspect their `environ` or `fd` table, so it contributes nothing to the criterion and claims nothing                                                                                                                                                                                                                                                                                                                                                                                                                                                | —                             |
| `P0-AC-024` | Carried forward from 2026-11-13                 | Corroborated in part                                    | Live controller `session.read` and `session.write`                                                                                                                                                                                                                                     | Every content response in this campaign carried `is_untrusted_surface: true` beside `buffered_bytes`, `bytes`, `data`, `generation`, and `session_id`, including a read of echoed input; the observer read was refused before any content was served. The adapter and channel-separation cells are untouched                                                                                                                                                                                                                                                                                                                                                                                | `session.read` transcripts    |
| `P0-AC-025` | Carried forward from 2026-11-13                 | No new observation                                      | None                                                                                                                                                                                                                                                                                   | No DevTools, `plugin.manage`, or `config.modify` call was made in this campaign, and the registered scope list is quoted only as handshake context                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | —                             |
| `P0-AC-026` | Reproduced in part                              | Corroborated at this revision                           | `stat` on the audit directory and segment; full-segment read; marker grep                                                                                                                                                                                                              | Audit directory `0700`, segment `0600`, 72 line-oriented records across the campaign's six audit-writing daemons; refusals carry a class and counts (`c=active_sessions ca=2 cl=16`); termination rows carry `z=terminated zr=daemon_stop zk=swept`; zero occurrences of `CTX0322`, `live-campaign`, `control_token`, or `operator_capability` in the segment                                                                                                                                                                                                                                                                                                                               | Audit segment, `stat`, grep   |

## The CLI surface at this revision

The surface was discovered by running the binary, not by reading intent:

```sh
$ bittyd --version
bittyd 0.0.45 (service API 1.5)
rc=0

$ bittyd --help
usage: bittyd [start | stop [--force | --drain] | --version | --help]

With no arguments, bittyd prints the session-host status and exits
0 without binding an endpoint. `bittyd start` binds the per-user
endpoint and serves the bitty-ipc v1 service until daemon.stop or a
SIGTERM/SIGINT drain. `bittyd stop` asks the running daemon to
stop when no session is active; `--drain` requests the contract drain
mode, and `--force` terminates every session immediately. The stop path
uses the authenticated per-user endpoint; there is no TCP fallback.

exit codes: 0 ok, already running, or no daemon; 1 startup or transport
failure; 2 usage error; 3 active sessions on a default stop; 4 drain
deadline forced the remainder; 5 a worker could not be verified gone;
6 endpoint tamper, a failed authentication invariant, or an endpoint
this account may not use. `--drain` exits 4 when it has to terminate a
live session; it is the only drain outcome this build serves.
rc=0
```

There is no `start --help` and no `stop --help`; both are usage errors:

```sh
$ bittyd start --help
bittyd: unexpected extra argument '--help'
<usage block>
rc=2

$ bittyd stop --help
bittyd: unknown stop flag '--help'
<usage block>
rc=2

$ bittyd bogus
bittyd: unknown argument 'bogus'
<usage block>
rc=2
```

The no-argument status is the pre-start form, and it binds nothing:

```sh
$ bittyd                       # with an isolated XDG_RUNTIME_DIR and no daemon
bittyd 0.0.45: session-host seam
service API: 1.5 (accepted client range 1.0..=1.5)
capabilities: terminal_sessions, events, observer_grants, control_transfer, idempotent_mutations
worker sessions: reserved (D-01: never served before the ADR 0019 amendment)
ipc service: wired (bitty-ipc v1; bittyd start)
endpoint: none bound (no socket file created)
containment: none (refused; not probed by this invocation)
rc=0
```

A second `bittyd start` while one is bound is a refusal, not an outage, and the
exit code is `0`:

```sh
$ bittyd start            # 72677 already serving
bittyd: already running (socket /home/fuyu/.hermes/cache/scratch/ctx0322/root/run/bitty/bittyd.sock)
rc=0
```

## Session lifecycle: create, attach, read, write

The operator handshake, then a host-grant mint. The operator connection carries
the nine `daemon`/`session`/`terminal`/`process` scopes and no `session.host`:

```text
[operator] daemon.negotiate -> ok:true
  scopes: [session.inspect, session.attach, session.control, daemon.inspect,
           daemon.control, terminal.inspect, terminal.input, terminal.manage, process.spawn]
  server_identity: {endpoint_kind: unix_socket, endpoint_mode: 384,
                    endpoint_owner: 1000, uid: 1000}

[operator] daemon.host_grant {action: mint} -> ok:true
  {grant_id: 3976cb8a442da7502abd88338686a593, expires_at_ms: 340749, grant: ***}
```

`384` is `0600`, matching the `stat` cell below. The creator connection presents
that grant and gains `session.host` — the one scope the operator set lacks:

```text
[creator] daemon.negotiate (host_grant) -> ok:true
  scopes: [session.inspect, session.host, session.attach, session.control,
           daemon.inspect, daemon.control, terminal.inspect, terminal.input,
           terminal.manage, process.spawn]
```

`session.create` spawns a real child that prints two markers and then sleeps:

```text
[creator] session.create
  params: {kind: terminal,
           argv: ["/bin/sh", "-c", "printf 'CTX0322-MARKER-0\\r\\nCTX0322-MARKER-1\\r\\n'; exec sleep 300"],
           cwd: "/", cols: 80, rows: 24, term: xterm-256color,
           env: ["CTX0322_MARKER=live-campaign"], idempotency_key: ctx0322-create-1}
  -> ok:true
  result: {control_token: ***, replayed: false,
           session: {session_id: 618165651d3e24dae960708782e7c4cb, kind: terminal,
                     state: running, state_revision: 1, generation: 1,
                     attach_count: 0, attached: false, controller_present: false,
                     terminal_id: c9a7b818b578ebc453d71bb2b184eb28,
                     worker_handle: fc4fd5e511e5d282e57830846bee4ccf,
                     created_by_kind: operator, …}}
```

The controller attach claims the lease and bumps the revision exactly once:

```text
[creator] session.attach {attach_role: controller, session_id: 61816565…,
                          expected_generation: 1, control_token: ***,
                          idempotency_key: ctx0322-attach-1}
  -> ok:true
  result: {attach_id: 31e37013b9f831943a14dd1ebf34d020, role: controller,
           control_token: ***, lease_expires_at_ms: 55814, replayed: false,
           session: {attach_count: 1, attached: true, controller_present: true,
                     state: running, state_revision: 2,
                     attached_leases: [{attach_id: 31e37013…, role: controller,
                                        lease_expires_at_ms: 55814, …}], …}}
```

The child's output is served with the label attached, and the payload is the
markers the child wrote:

```text
[creator] session.read {session_id: 61816565…, generation: 1, max_bytes: 65536}
  -> ok:true
  result: {buffered_bytes: 0, bytes: 38, generation: 1,
           data: "435458303332322d4d41524b45522d300d0d0a435458303332322d4d41524b45522d310d0d0a",
           is_untrusted_surface: true, session_id: 618165651d3e24dae960708782e7c4cb}
```

The bytes decode to `CTX0322-MARKER-0\r\r\nCTX0322-MARKER-1\r\r\n`. The doubled
`\r` is the child's own `printf` `\r\n` plus the PTY's `ONLCR` translation, not
daemon corruption; the marker text is intact.

A separate daemon run exercised the input direction: a child that reads one line
and echoes it, written by the controller and read back.

```text
[writer] session.write {session_id: 83e08de8…, generation: 1,
                        data: "435458303332322d57524954450d"}
  -> ok:true
  result: {accepted: 14, backpressure: false, generation: 1, remaining: 0, …}

[writer] session.read {session_id: 83e08de8…, generation: 1, max_bytes: 65536}
  -> ok:true
  result: {bytes: 36, is_untrusted_surface: true,
           data: "435458303332322d57524954450d0a4543484f3a435458303332322d57524954450d0d0a"}
  decoded: "CTX0322-WRITE\r\nECHO:CTX0322-WRITE\r\r\n"
```

## The session record on disk

Each spawned session has a record in the runtime root's `orphans` directory,
named by session id, `0600`, inside a `0700` directory. This is what the daemon
would use to reclaim the worker if the daemon died; it is also the only durable
statement of the worker's identity, and it is content-free.

Modes and sizes below are read from the campaign's own `stat`/directory sample
(the literal `stat -c` block for the same runtime root is in
`Endpoint modes and the no-TCP scan`), not transcribed from a shell prompt:

| Entry                                | Mode   | Size      |
| ------------------------------------ | ------ | --------- |
| `bitty/` (runtime directory)         | `0700` | —         |
| `bitty/bittyd.sock`                  | `0600` | socket    |
| `bitty/bittyd.lock`                  | `0600` | 0 bytes   |
| `bitty/bittyd.operator`              | `0600` | 65 bytes  |
| `bitty/orphans/`                     | `0700` | —         |
| `bitty/orphans/61816565…c7cb.orphan` | `0600` | 415 bytes |

```text
$ cat "$XDG_RUNTIME_DIR/bitty/orphans/618165651d3e24dae960708782e7c4cb.orphan"
bittyd-orphan 2
session_id 618165651d3e24dae960708782e7c4cb
generation 0
class committed
boot_id f5d8fc05-afa8-4ff3-a100-8b347a96b3a5
reserved_at_ms 40759
validated_at_ms -
containment cgroup /sys/fs/cgroup/user.slice/user-1000.slice/user@1000.service/app.slice/hermes-gateway.service/bittyd-3c0374a1c0b3132c6839667438f4e2b5-618165651d3e24dae960708782e7c4cb
pid 74116
start_time 119685
process_group 74116
uid 1000
```

The pid is the worker, not the daemon (`72677`), the `start_time` is a kernel
start-time field that re-identifies the process, and the containment path names
the per-session cgroup. No argv, environment, working directory, terminal id, or
bearer appears.

The record's lifecycle is observable, and it is asserted here rather than
inferred. At the point where two sessions were live and one had been terminated,
the directory held exactly the two live ids:

```text
$ ls "$XDG_RUNTIME_DIR/bitty/orphans"
618165651d3e24dae960708782e7c4cb.orphan      # session 1, running
c4fe682d6255748ff04eb9a95725bb5c.orphan      # session 3, running
```

`daa241a6f3c3c102b863f2105342940b` — the session aborted a few seconds earlier —
is absent. After a `stop --force` that terminated the only session, the directory
was empty, and the same check re-run at the end of the campaign, after the last
force stop, reads (C locale, so the timestamps are ASCII):

```text
$ LC_ALL=C ls -la "$XDG_RUNTIME_DIR/bitty/orphans"
total 0
drwx------ 1 fuyu fuyu  0 Nov 18 23:08 .
drwx------ 1 fuyu fuyu 66 Nov 18 23:08 ..
```

So a terminated session leaves no reclaimable record, and a live one leaves
exactly one.

## A second concurrent attach under a `session.grant`

A fresh daemon run took a session to `attach_count: 1` as controller, minted an
observer grant from that controller, and attached a second connection with it:

```text
[creator2] session.grant {session_id: 858755ebe0f0cd1c2966ff887960ede7,
                          idempotency_key: ctx0322-grant-1, control_token: ***}
  -> ok:true
  result: {grant_id: 347d616c2af90daae0482df211108b59, expires_at_ms: 143061,
           grant: ***, replayed: false, session_id: 858755eb…}

[observer2] daemon.negotiate -> ok:true
  scopes: [session.inspect, session.attach, session.control, terminal.inspect,
           terminal.input, terminal.manage, process.spawn]

[observer2] session.attach {attach_role: observer, session_id: 858755eb…,
                            observer_grant: <consumed>}
  -> ok:true
  result: {attach_id: 5501211ff51d3b9450bf65c7329f28e7, role: observer,
           lease_expires_at_ms: 98065, replayed: false,
           session: {attach_count: 2, attached: true, controller_present: true,
                     state: running, state_revision: 5, …}}
```

Two things are asserted rather than assumed. The observer result carries **no**
`control_token` key at all — the controller result did — and the controller's own
view names both leases with their roles:

```text
[creator2] session.status -> ok:true
  session.attach_count: 2, session.controller_present: true
  roles: [observer, controller]
```

An attach with no grant never reaches the authority check: `observer_grant` is a
required field, so the request fails at parse time, before any lease exists.

```text
[observer] session.attach {attach_role: observer, session_id: 61816565…}
  -> {ok: false, error: {class: Validation, code: InvalidRequest,
                         message: "request payload is malformed"}}
```

The authority refusal proper is the observer's attempt to _use_ the lease, below.

## Detach is idempotent

The controller detached twice on the same handle. The first call releases the
lease and bumps the revision; the second changes nothing and says so:

```text
[creator] session.detach {attach_id: 31e37013b9f831943a14dd1ebf34d020}
  -> ok:true
  result: {was_attached: true, not_attached: false, revoked: false,
           attach_id: 31e37013…,
           session: {attach_count: 0, attached: false, controller_present: false,
                     state: running, state_revision: 3, …}}

[creator] session.detach {attach_id: 31e37013b9f831943a14dd1ebf34d020}
  -> ok:true
  result: {was_attached: false, not_attached: true, revoked: false,
           attach_id: 31e37013…,
           session: {attach_count: 0, attached: false, controller_present: false,
                     state: running, state_revision: 3, …}}
```

`state_revision` is `3` in both responses, so the repeat is not a silent second
mutation, and the session stays `running` — detaching is not stopping.

## An observer holds a lease, not authority

With a real observer lease on a running session, all three content and control
verbs are refused, and the class names the lease relation rather than the
transport scope. The observer connection holds `terminal.input` and
`session.control` in its negotiated set, so the refusal cannot be a scope
artifact:

```text
[observer2] session.read  -> {class: Denied, code: ControllerRequired, message: "request denied"}
[observer2] session.write -> {class: Denied, code: ControllerRequired, message: "request denied"}
[observer2] session.abort -> {class: Denied, code: ControllerRequired, message: "request denied"}
```

Its `session.list` is the lease-scoped view, not the operator's: it returns the
one session it holds a lease on, with no `owner` key, where the operator view of
the same session carries `owner: {uid, pid}`.

## Abort: consumer cancel and operator stop

Two abort arms were run, and both end in `terminated` with a swept worker.

Consumer `cancel` on a controller-attached session, from `running` to
`terminated`:

```text
[creator] session.abort {session_id: daa241a6…, generation: 1,
                         reason_class: cancel, control_token: ***}
  -> ok:true
  result: {accepted: true, stage: graceful, reason: consumer_cancel,
           deadline_ms: 46349,
           session: {state: stopping, state_revision: 3, …}}

[creator] session.status {session_id: daa241a6…, control_token: ***}   # 0.5 s later
  -> ok:true
  result: {session: {state: terminated, state_revision: 5,
                     terminal_reason: consumer_cancel, cleanup: swept,
                     attach_count: 0, controller_present: false,
                     requested_by: {kind: consumer, client_id: 2c46c570…}, …}}
```

Operator `stop` on a session with two live leases — the arm that also proves the
observer lease does not survive the stop:

```text
[creator2] session.abort {session_id: 858755eb…, generation: 1,
                          reason_class: operator, control_token: ***}
  -> ok:true
  result: {accepted: true, stage: graceful, reason: operator_abort,
           deadline_ms: 88069,
           session: {state: stopping, state_revision: 6, attach_count: 2, …}}

[creator2] session.status   # 0.5 s later
  -> ok:true
  result: {session: {state: terminated, state_revision: 9,
                     terminal_reason: operator_abort, cleanup: swept,
                     attach_count: 0, controller_present: false,
                     requested_by: {kind: operator, client_id: 302307c2…}, …}}
```

The `stopping → terminated` transition, the revision movement, the terminal
reason, and `cleanup: swept` are all server-reported; none of them is inferred
from the client's own timeout. The aborted session's journal record is gone
(the section above), so the sweep is visible on disk as well as in the snapshot.

## Stop modes and the exit-code map

Four daemons carried the stop-mode matrix, because each mode that ends the
process cannot be observed twice on the same instance. Two more daemons served
the endpoint-mode and input cells and were each closed with `stop --force`,
which returned `0` with `1 active session(s)` both times.

Default `refuse` with two live sessions, then `--drain` on the same instance:

```text
$ bittyd stop
bittyd: stop: the daemon refused the stop: Denied/ActiveSessions (actual 2, limit 16)
exit=3   (0.002 s)

$ bittyd stop --drain
bittyd: stopped (drain) with 2 active session(s)
exit=4   (0.032 s)
```

After that drain: daemon pid `72677` absent from `ps`, the socket gone, the
`orphans` directory empty, and the daemon's own log line
`bittyd: stopped (drain)`.

`--force` on a second daemon (`77016`) holding one attached session, whose
worker the journal named as pid `77041`:

```text
$ bittyd stop
bittyd: stop: the daemon refused the stop: Denied/ActiveSessions (actual 1, limit 16)
exit=3

$ bittyd stop --force
bittyd: stopped (force) with 1 active session(s)
exit=0   (0.019 s)
```

When that force stop returned, `ps` reported no row for `77016` or `77041`, the
socket path was gone, and `orphans` was empty. A `stop` against the endpoint that
no longer exists is the supported absence path:

```text
$ bittyd stop
bittyd: no running daemon
exit=0
```

Both modes with no live session, on two further daemons (`77243`, `77328`):

```text
$ bittyd stop
bittyd: stopped (refuse) with 0 active session(s)
exit=0

$ bittyd stop --drain
bittyd: stopped (drain) with 0 active session(s)
exit=0
```

Observed exit code map at `3c588f26`:

| Code | Help text meaning                                              | Observed in this campaign                                                                                                                                  |
| ---- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0`  | ok, already running, or no daemon                              | `start` on a bound endpoint; `stop` with 0 sessions; `stop --drain` with 0 sessions; `stop --force` with 1 session; `stop` with no daemon                  |
| `1`  | startup or transport failure                                   | **NOT EXERCISED** — needs a startup fault or a transport fault; none was produced                                                                          |
| `2`  | usage error                                                    | `bittyd bogus`; `bittyd start --help`; `bittyd stop --help`                                                                                                |
| `3`  | active sessions on a default stop                              | `stop` with 2 sessions (`actual 2, limit 16`); `stop` with 1 session (`actual 1, limit 16`)                                                                |
| `4`  | drain deadline forced the remainder                            | `stop --drain` with 2 sessions, both terminated in the same pass                                                                                           |
| `5`  | a worker could not be verified gone                            | **NOT EXERCISED** — no state was produced in which a bound worker could not be verified gone                                                               |
| `6`  | endpoint tamper, authentication invariant, or foreign endpoint | **NOT EXERCISED** — the tamper path needs a mutated endpoint under a running daemon, and the foreign-endpoint path needs a second account; neither was run |

The campaign therefore observes four of the seven codes the help text declares —
`0`, `2`, `3`, and `4`. Codes `1`, `5`, and `6` stay unclaimed, and no reading of
this table should imply the binary was proved to be incapable of returning
another value.

## Endpoint modes and the no-TCP scan (corroboration)

Taken with daemon `77949` serving one session:

```sh
stat -c '%a %U %G %F %n' "$XDG_RUNTIME_DIR/bitty" \
  "$XDG_RUNTIME_DIR/bitty/bittyd.sock" "$XDG_RUNTIME_DIR/bitty/bittyd.lock" \
  "$XDG_RUNTIME_DIR/bitty/bittyd.operator" \
  "$XDG_STATE_HOME/bitty/audit" "$XDG_STATE_HOME/bitty/audit/audit.log"
```

```text
700 fuyu fuyu directory /home/fuyu/.hermes/cache/scratch/ctx0322/root/run/bitty
600 fuyu fuyu socket /home/fuyu/.hermes/cache/scratch/ctx0322/root/run/bitty/bittyd.sock
600 fuyu fuyu regular empty file /home/fuyu/.hermes/cache/scratch/ctx0322/root/run/bitty/bittyd.lock
600 fuyu fuyu regular file /home/fuyu/.hermes/cache/scratch/ctx0322/root/run/bitty/bittyd.operator
700 fuyu fuyu directory /home/fuyu/.hermes/cache/scratch/ctx0322/root/state/bitty/audit
600 fuyu fuyu regular file /home/fuyu/.hermes/cache/scratch/ctx0322/root/state/bitty/audit/audit.log
```

Per-pid scan, while that daemon served a session, with the socket bound:

```sh
ss -ltnp  | grep -c "pid=$PID,"     # 0
ss -tnp   | grep -c "pid=$PID,"     # 0
ss -lxnp  | grep -c "pid=$PID,"     # 0
ss -lxnp  | grep -F bittyd.sock     # the campaign socket, LISTEN, plus the owner's own socket
```

`daemon.status` on the same instance:

```text
daemon_pid: 77949, daemon_state: running, active_sessions: 1,
sessions: {created: 0, running: 1, stopping: 0, terminal: 0},
containment: {mechanism: cgroup_v2, claim: swept, verify: served,
              records: {committed: 1, reaped: 0, reserved: 0, stale: 0, unverified: 0}},
audit_degraded: false, tcp_listeners: 0, uptime_ms: 12900
```

What this is and is not: it re-observes, at `0.0.45`, that the documented modes
are what the process actually creates and that the daemon holds no TCP listener
while it serves a session. It is **not** the formal `V-28` real-driver artifact —
that needs the conformance driver, which this campaign did not run. The
limitation is the one the earlier records name: `ss -p` can only attribute a
socket through a readable descriptor table, and this daemon clears its dumpable
flag, so the per-pid filter and the self-reported `tcp_listeners: 0` are two
views of the same claim rather than two independent measurements. What makes the
scan non-vacuous is that the same snapshots list the Unix socket as `LISTEN`
while the pid filters are empty, and the handshake that produced that socket
succeeded.

The second-uid cell is **NOT EXERCISED**: `sudo -n true` returns
`sudo: a password is required` (`sudo_rc=1`), the campaign does not ask for a
password, and creating a second local account needs root. The
[2026-11-15 record](bittyd-p0-evidence-2026-11-15.md) reproduces the mode-level
half with a foreign kernel uid and records the privileged command an operator
would run; this record adds nothing there and claims nothing.

## Audit records (corroboration)

The audit segment is `0700`/`0600` and line-oriented. Across the campaign's six
audit-writing daemons it held 72 records; the lifecycle rows name the action, the
session, the revision, and the outcome, and the refusal rows carry a class and
counts instead of content:

```text
v1 ev=10 … a=session.abort r=refused c=not_found … k=none d=000…
v1 ev=29 … a=session.abort r=refused c=controller_required … k=none d=000…
v1 ev=30 … a=session.abort r=ok s=858755ebe0f0cd1c2966ff887960ede7 g=1 rv=6 … k=session d=858755eb…
v1 ev=32 … a=daemon.stop r=refused c=active_sessions … k=none d=000… ca=2 cl=16
v1 ev=34 … a=daemon.stop r=ok s=618165651d3e24dae960708782e7c4cb g=1 rv=5 … k=session d=61816565… z=terminated zr=daemon_stop zk=swept
v1 ev=36 … a=daemon.stop r=ok … k=none d=000… ca=2 cl=0
```

The two refusals are the two arms seen over the wire: the unattached observer's
`session.abort` is recorded as `not_found`, and the leased observer's is
`controller_required`, which is a code with no content and no caller bytes
beside it.

A full-segment grep for this campaign's own sensitive strings returns nothing:

```sh
$ grep -c "CTX0322\|live-campaign\|control_token\|operator_capability" "$XDG_STATE_HOME/bitty/audit/audit.log"
0
```

The spawn specification's `argv` carried `CTX0322-MARKER-0` and the `env` carried
`CTX0322_MARKER=live-campaign`, so the zero is discriminating for both fields:
neither reached the segment. The per-daemon instance id changes between daemons
(`3c0374a1…` 36 records, `8b99ab9b…` 11, `211ea63c…` 2, `e0a9b701…` 2,
`25271567…` 12, `1ca11202…` 9), which is what makes the segment's records
attributable to six separate processes rather than one.

This is the record-shape half of `P0-AC-026`, re-observed. It does not supply the
seeded-secret corpus, the export-preview equality, or the crash-report path, and
it does not replace the [2026-11-16 record](audits/bittyd-ac024-026-2026-11-16.md)
that drove the seeded corpus through the write point.

## Carried forward, explicitly

These cells are not re-observed in this record, and are named so a reviewer can
see exactly what it does not supply:

- `P0-AC-023` child environment and descriptor table: carried from the
  [2026-11-16 child-scope record](audits/bittyd-child-scope-2026-11-16.md). This
  campaign spawned seven children and read none of their `/proc` entries.
- `P0-AC-021` second-uid denial: **NOT EXERCISED**, for the privilege reason
  above. The `V-25` peer-check cell and the `V-28` driver artifact both remain
  absent.
- `P0-AC-022` scope matrix, terminal-instance `bitty ctl` cells, live
  `session.resize`, `session.control.transfer`, `session.grant.revoke`, and
  `lease.heartbeat`: carried from the
  [2026-11-16 record](audits/bittyd-ac022-scopes-2026-11-16.md). This campaign
  minted one observer grant and did not revoke it; it did not resize or transfer
  control.
- `P0-AC-025` DevTools: no new observation; carried from the
  [2026-11-16 record](audits/bittyd-ac024-026-2026-11-16.md).
- The MCP/Agent adapter audit and the instruction/data channel-separation
  review: absent, and `bittyd` serves no MCP surface for this campaign to drive.

## Residuals

- **Second uid: NOT EXERCISED.** `sudo -n true` →
  `sudo: a password is required` (`sudo_rc=1`). The mode-level half stands on the
  2026-11-15 record's foreign-uid probe; the peer-check half stays unrun.
- **Exit codes `1`, `5`, `6`: NOT EXERCISED.** No startup fault, unverifiable
  worker, endpoint tamper, or foreign endpoint was produced. The four codes this
  campaign did observe are `0`, `2`, `3`, and `4`.
- **Single implementation.** The session verbs were driven by a campaign
  instrument, not by the repository's real-service driver, and the two were not
  compared in this campaign. Responses are the daemon's, but there is no second
  client's reading of them.
- **Dev profile.** The binary was built `dev`; the behaviour under test is not
  profile-gated, but no release-profile run was made and the recorded elapsed
  times are dev-profile timings.
- **Independent review absent.** No criterion in this record is Verified, and a
  record is not a review verdict. `R-011`..`R-014` and `DR-01`..`DR-08` stay
  `Open`.

## What would let bitty#2921 close

Every item below is missing evidence, not missing code:

1. A second-uid run: the privileged probe the 2026-11-15 record lists, or a real
   driver that can present another uid, with its output recorded.
2. Exit codes `1`, `5`, and `6`: a startup fault, a worker that cannot be
   verified gone, and an endpoint-tamper or foreign-endpoint run.
3. The real-service conformance driver at `3c588f26`, so the lifecycle cells have
   a second, repository-owned implementation behind them.
4. A `release`-profile build of the same cells, if a reviewer considers the
   profile a material variable.
5. Independent security-auditor review of `P0-AC-021` through `P0-AC-026`
   against this record, the three dated records before it, and the four
   single-criterion records of 2026-11-16.

Items 1 and 2 are the gaps this host's environment blocked or this campaign did
not provoke. Items 3 through 5 are open by scope, and item 5 is the gate the
criteria reserve for a reviewer: landing this record does not close the issue,
and no partial evidence closes a risk.

## References

- [Security overview](overview.md)
- [Threat model](threat-model.md)
- [P0 acceptance criteria](p0-acceptance-criteria.md)
- [Evidence matrix](evidence-matrix.md)
- [bittyd P0 evidence plan](bittyd-p0-evidence-plan.md)
- [bittyd P0 evidence record 2026-11-08](bittyd-p0-evidence-2026-11-08.md)
- [bittyd P0 evidence record 2026-11-13](bittyd-p0-evidence-2026-11-13.md)
- [bittyd P0 evidence record 2026-11-15](bittyd-p0-evidence-2026-11-15.md)
- [bittyd child-scope record 2026-11-16](audits/bittyd-child-scope-2026-11-16.md)
- [bittyd P0-AC-022 scope record 2026-11-16](audits/bittyd-ac022-scopes-2026-11-16.md)
- [bittyd MCP/Agent, DevTools, and trace record 2026-11-16](audits/bittyd-ac024-026-2026-11-16.md)
- [Risk register](risk-register.md)
