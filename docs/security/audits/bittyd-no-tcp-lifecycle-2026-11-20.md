---
title: bittyd No-TCP, Lifecycle, and Plugin-Denial Record 2026-11-20
description: Dated record at bitty e630e89a and bittyd 0.0.45 that scans the TCP table of the daemon's own network namespace from outside it with a non-vacuity control, records the PID-attributed ss channel as blind because the daemon is non-dumpable, drives create, controller and observer attach, detach, re-attach, abort, and the three stop modes live, and executes the plugin connect and filesystem-escape denials, with the second-uid containment cell unrun and no criterion marked Verified
category: security
audience: security-reviewer
document_type: register
status: draft
website_publish: false
sidebar_order: 62
---

# bittyd No-TCP, Lifecycle, and Plugin-Denial Record 2026-11-20

**Status: dated evidence record; independent review pending.** This record
attacks the three claims the earlier `bittyd` campaigns answered with the
weakest channel available, and it substitutes a stronger channel for one of
them.

The `P0-AC-021` no-TCP half has so far rested on two things: the daemon saying
`tcp_listeners: 0` about itself, and `ss -p` producing no row that names the
daemon's pid. The second is not a measurement. `bittyd` sets
`PR_SET_DUMPABLE=0` before it binds (`crates/bitty-daemon/src/service/server.rs`,
`prctl::set_dumpable(false)`), so the kernel refuses to disclose the process's
socket inodes to a same-uid reader through `ss -p`, a `/proc/<pid>/fd`
listing, or a `/proc/<pid>/ns/net` readlink. A PID-filtered scan therefore
reports zero rows whether or not the daemon listens, which is exactly why every
prior record called that cell partial and why this one keeps it partial.

This record changes the observer instead of the daemon. It starts the daemon
inside its own network namespace and reads the kernel TCP table **of that
namespace** from outside it, which is a read no `PR_SET_DUMPABLE` setting
restricts, and it proves the read is not vacuous with a control listener bound
inside a fresh namespace of the same shape. The daemon is still non-dumpable;
the claim no longer depends on it being dumpable.

Two further groups of cells come with it: a live lifecycle campaign at the same
revision that produces the observer-denial, detach, re-attach, abort, and
stop-mode arms from the shipped binary, and the execution (not the presence) of
the two plugin denials bitty#2921 names, each as a typed refusal with a positive
control.

Nothing here is Verified. `R-011` through `R-014` and `DR-01` through `DR-08`
stay `Open`, `P0-AC-021`..`P0-AC-026` stay Partially verified, and the
second-uid containment run remains **unrun**, because this host has no root and
no second usable account. A record is not the review those criteria ask for.

## Purpose

bitty#2921 asks for the daemon's isolation claims to be proved against the
daemon rather than asserted from source, and names four families: the endpoint
and peer boundary, the no-TCP property, the lifecycle and scope surface, and
plugin filesystem and network denial. Four campaigns have served the daemon
already; what was missing at the end of them was a no-TCP observation that does
not depend on the daemon's own counter or on a filter that cannot see it, and
execution evidence for the plugin denials.

In scope:

- an external scan of the daemon's own network namespace, per lifecycle phase,
  with a control that shows the read reports rows when a row exists;
- the second-uid containment cell, attempted and recorded as not run with the
  operator command it would need;
- a live lifecycle: negotiate, operator grant, create, controller attach,
  write, read, observer attach and its three denials, detach twice, re-attach
  with a rotated token, consumer abort, and the three stop modes;
- the Lua `connect()` denial and the plugin-host filesystem-escape and
  network-gain denials, executed from the repository's own suites at the pinned
  revision, plus the symbol-level presence checks they rest on.

Out of scope:

- the second-uid run itself. This host cannot perform it; see
  [Residual blockers](#residual-blockers);
- the Windows named pipe, every non-Linux cell, the panic crash slot, the live
  DevTools endpoint, and the hostile-output replay, each of which another record
  either carries or keeps open;
- the `bitty ctl` daemon surface, which does not exist at this revision; the
  finding is recorded in cell 11e and the consequence is discussed below;
- any review verdict.

## Source identity

- `bitty` at `e630e89a90766c7f8e75644e68eafae7dc9c2700` in the campaign
  worktree, `git status --porcelain` empty before and after the campaign, so
  every observation below describes that tree and not a working checkout that
  drifted during the run.
- `bittyd` built from that tree with
  `cargo build -p bitty-daemon --bin bittyd --offline` into a
  `CARGO_TARGET_DIR` outside every repository; the build reported
  `Finished … in 4.22s` for the `dev` profile
  (`[unoptimized + debuginfo] target(s)`). The **dev** profile is disclosed:
  the socket, namespace, scope, and containment paths under test are not
  profile-gated, but no elapsed time here is a release timing.
- Binary `37704888` bytes, SHA-256
  `2ad791d98a0f12781323668447b299e3ab419a9a45e2712172ecd241bdf830f2`;
  `bittyd --version` prints `bittyd 0.0.45 (service API 1.5)`, `$?=0`.
- The corpus this record was written into was read by the campaign at
  `bitty-docs` `origin/main` `9b23a575` and was not modified by it.
- Host: Linux `7.3.4-1-cachyos` x86_64, uid `1000` (`fuyu`), rustc `1.98.1`
  (`48a229cea 2026-09-01`), cargo `1.98.1` (`797e8a9bc 2026-08-05`),
  `/usr/sbin/ss` present.

## Isolation and safety

Every daemon this record started used its own `XDG_RUNTIME_DIR` and
`XDG_STATE_HOME` under a per-run scratch root (`run1`..`run4`), and the
campaign ran no command that could address another root:

- the owner's live daemon (`pid 1231`, `/run/user/1000/bitty/bittyd.sock`) was
  recorded as a baseline before the campaign and was never started, signalled,
  connected to, or inspected. After the campaign `ps -eo pid=,comm=` listed
  exactly `1231` and no other `bittyd`;
- each campaign daemon is named by the pid this record started, and each ended
  in a recorded way: `1660538` through its own endpoint (`bittyd stop --drain`
  returned `4`, then the process was gone), `1664058` by `kill -TERM` on the
  recorded pid only (`/proc/1664058` absent afterwards), `1665885` and
  `1669807` through `bittyd stop --force` (`0`, gone);
- no signal was sent by name or pattern, and no process outside the campaign
  was signalled;
- no `sudo` succeeded: the only attempt is cell 1, which returned
  `sudo: a password is required`. No system-wide change was made;
- the campaign bound no TCP or UDP port on any interface except the two
  deliberate control listeners, and both are disclosed rather than quietly
  counted as anomalies: cell 5a bound `127.0.0.1:46831` from a scratch
  `python3` process in the host namespace and closed it at the end of the
  control, and cell 6a bound `127.0.0.1:43423` inside a throwaway network
  namespace that was destroyed with it. Every other socket is a Unix endpoint
  under a scratch root;
- the campaign used no browser, no display server, and no compositor.

Paths in the transcripts are written `<scratch>/runN/…`. The scratch roots are
campaign-internal and deliberately not published.

The instrument is disclosed. The session verbs have no CLI at this revision
(cell 11e), so the lifecycle cells were driven by a Python client that writes
the accepted `bitty-ipc` v1 envelope — a 4-byte big-endian length prefix and
`{"v":1,"id","method","params"}` — and opts into `SO_PASSCRED` before its first
frame, mirroring `crates/bitty-daemon/src/client.rs`. It is not a product
surface, it is not in any repository, and it is not a second implementation of
the daemon. Bearers (`control_token`, `host_grant`, `grant`,
`operator_capability`) are printed as `***` and never recorded.

## The cells

| #   | Cell                                                                                                          | Command                                                                                                                                                                                        | Observed (trimmed)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `$?`            | Verdict                                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | A second local uid cannot connect, read the operator file, or stop the daemon (`P0-AC-021`, adversarial half) | `sudo -n true`                                                                                                                                                                                 | `sudo: a password is required`                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | `1`             | **not run** — no root, no non-interactive sudo                                                                                                                               |
| 1a  | Same cell, account inventory                                                                                  | `getent passwd \| awk -F: '$3>=1000 {print $1" "$3" "$7}'`                                                                                                                                     | `nobody 65534 /usr/bin/nologin`, `fuyu 1000 /bin/fish`                                                                                                                                                                                                                                                                                                                                                                                                                                                | `0`             | supporting fact: **no second usable account** exists on this host                                                                                                            |
| 1b  | Same cell, direct uid switch                                                                                  | `setpriv --reuid=65534 --regid=65534 --clear-groups /bin/true`                                                                                                                                 | `setpriv: setresuid failed: Operation not permitted`                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `127`           | refused; a live run needs `CAP_SETUID` (root)                                                                                                                                |
| 1c  | Same cell, login as the other account                                                                         | `su nobody -s /bin/sh -c 'id'`                                                                                                                                                                 | `Password: ***` then `Authentication token manipulation error`                                                                                                                                                                                                                                                                                                                                                                                                                                        | `1`             | refused; `nobody` is `nologin` and has no password                                                                                                                           |
| 2   | Peer-credential verifier refuses a peer from a different uid mapping (`P0-AC-021` peer check, verifier tier)  | `cargo test -p bitty-daemon --test peer --offline -- --exact refuses_a_peer_from_a_different_user_namespace --nocapture`                                                                       | `test refuses_a_peer_from_a_different_user_namespace ... ok`, `test result: ok. 1 passed; 0 failed`                                                                                                                                                                                                                                                                                                                                                                                                   | `0`             | **verified as a verifier cell only** — `PeerGuard::capture` returns `CaptureFailed{cause: Unauthenticated}` for a real socket whose peer uid is mapped through `unshare -Ur` |
| 3   | Live refusal at the real endpoint of a peer whose uid, as the daemon sees it, is not its own                  | daemon inside `unshare --user --map-root-user --net`; client outside, `daemon.negotiate`                                                                                                       | `ConnectionResetError: [Errno 104] Connection reset by peer` at the first response frame; the daemon stayed up, `/proc/<pid>/comm` = `bittyd`                                                                                                                                                                                                                                                                                                                                                         | client `1`      | **partial, and it is not the criterion's cell** — see below                                                                                                                  |
| 4   | Endpoint modes at a live daemon (design review only)                                                          | `stat -c '%A %a %U:%G %n'` on the runtime root, `bitty`, socket, operator file, lock                                                                                                           | `drwx------ 700 fuyu:fuyu` runtime root and `…/bitty`; `srw------- 600` socket; `-rw------- 600` operator file and lock                                                                                                                                                                                                                                                                                                                                                                               | `0`             | **design review only** — asserting a mode is not an observation that a foreign uid was refused                                                                               |
| 5   | External no-TCP scan, host namespace, PID-attributed channel (`P0-AC-021` no TCP listener by default)         | `/usr/sbin/ss -ltnpH` and `ss -tanpH`, filtered on `pid=<daemon>,`, at eight lifecycle phases                                                                                                  | every phase: `listen_rows_total=29, rows_for_pid=0`; `tcp_rows_total=214→367, rows_for_pid=0`                                                                                                                                                                                                                                                                                                                                                                                                         | `0`             | **partial — the channel is blind and is reported as blind, not as a pass**                                                                                                   |
| 5a  | Non-vacuity control for that filter                                                                           | `python3 ss_control.py` (own loopback listener, same filter)                                                                                                                                   | `control listener on 127.0.0.1:46831 in pid 1662624`; `rows total=30 attributed-to-control=1`; `LISTEN … users:(("python3",pid=1662624,fd=3))`; `NON-VACUOUS: yes`                                                                                                                                                                                                                                                                                                                                    | `0`             | control passed, so cell 5's zero is a statement about **non-dumpability**; `/proc/<daemon>/ns/net` readlink returned `EACCES` at the same time                               |
| 6   | External no-TCP scan of the daemon's own network namespace                                                    | daemon and client both inside `unshare --user --map-root-user --net`; read of `/proc/<pid>/net/tcp` and `tcp6` after every phase                                                               | `startup`, `created`, `attached`, `detached`, `re-attached`, `after-abort`, `second-created`: `rows=0`, `listen=0` in both tables; after `--force` the daemon was gone and the namespace with it                                                                                                                                                                                                                                                                                                      | client `0`      | **verified for this channel** — the kernel TCP table of the daemon's own namespace held zero rows in every phase while the daemon served sessions                            |
| 6a  | Non-vacuity control for that read                                                                             | control listener bound inside a fresh namespace of the same shape, `/proc/<pid>/net/tcp` read from outside it                                                                                  | `CONTROL listener up on 127.0.0.1:43423`; `0: 0100007F:A99F 00000000:0000 0A …`; LISTEN rows `1`; **host table at the same instant: 19 LISTEN rows**                                                                                                                                                                                                                                                                                                                                                  | `0`             | the read is namespace-scoped and does report rows; cell 6's zero is not an empty-filter artefact                                                                             |
| 7   | Liveness of that table during a lifecycle, ruling out a frozen table                                          | same scan, `states` histogram per phase, host namespace run                                                                                                                                    | `TIME_WAIT 136 → 155 → 169 → 186 → 204 → 223 → 243 → 263`, `SYN_SENT 5→6`, `ESTABLISHED 41→56` across the eight phases                                                                                                                                                                                                                                                                                                                                                                                | `0`             | the table tracked real traffic, including the campaign's own connect sweeps, while no row was ever attributed to the daemon                                                  |
| 8   | External connect probe against candidate ports                                                                | full `connect()` sweep of `127.0.0.1:1..65535` at each phase, plus the host listening set from `/proc/net/tcp` and `tcp6`                                                                      | pre-start `open=28` of `host_listen_ports=30`; during the lifecycle `open=22..25` of `host_listen_ports=25`; every other port `ECONNREFUSED`                                                                                                                                                                                                                                                                                                                                                          | `0`             | **partial** — no daemon-owned port is open at any phase, but the host set churns, so the sweep is not a host invariant                                                       |
| 9   | Plugin `connect()` denial present by symbol                                                                   | `git show 1105e745 --stat`; `grep -n 'fn build_plugin_vm\|fn install_host_module' crates/bitty-lua/src/gate.rs`; `git merge-base --is-ancestor 1105e745 HEAD`                                  | commit `1105e745e5a5…` with subject `test(security,lua,terminal): prove plugin network/fs denial and zero-TCP lifecycle (#3209)`; `crates/bitty-lua/tests/plugin_network_denial.rs \| 239 +++`; `crates/bitty-plugin-host/tests/denial_evidence.rs \| 334 +++`; ancestor of `e630e89a` = `yes`; `145:pub fn build_plugin_vm(`                                                                                                                                                                         | `0`             | symbol present at `e630e89a`                                                                                                                                                 |
| 9a  | Plugin `connect()` denial executed (`P0-AC-024` Lua and plugin half)                                          | `cargo test -p bitty-lua --test plugin_network_denial --offline -- --nocapture`                                                                                                                | `DENY require(socket) refused with a typed RuntimeError naming the module`; `DENY require(socket.core)`, `require(lua-socket)`, `require(bitty.net)`; `DENY plugin VM surface: no socket/connect binding in the stdlib, and no network head on the bitty host module`; `DENY rooted source-only require: a loaded module sees connect/socket as nil`; `test result: ok. 2 passed; 0 failed`                                                                                                           | `0`             | **verified** — the denial is a typed `RuntimeError`, not silence                                                                                                             |
| 10  | Capability-gain and filesystem-escape denial present by symbol                                                | `grep -n 'pub fn authorize_fs\|HostilePattern\|OutsideScope' crates/bitty-plugin-host/src/fs_authz.rs`; `grep -rn 'ExceedsPolicy' crates/bitty-plugin-host/src/*.rs`                           | `1238:pub fn authorize_fs(`; `983: HostilePattern`; `978: OutsideScope`; `effective.rs:679: ExceedsPolicy`, `effective.rs:1592: kind: DenialKind::ExceedsPolicy`                                                                                                                                                                                                                                                                                                                                      | `0`             | symbol present at `e630e89a`                                                                                                                                                 |
| 10a | Filesystem escape and network gain executed (`P0-AC-024` mediation half)                                      | `cargo test -p bitty-plugin-host --test denial_evidence --offline -- --nocapture`                                                                                                              | `DENY fs escape "../secret" denied: hostile-pattern`; `"~/projects/../../etc/shadow"`; `"/etc/shadow"`; `"~/projects/../../../root/.ssh/id_ed25519"`; `DENY fs control: in-scope allows, sibling prefix denied OutsideScope`; `DENY network gain refused: exceeds-policy` plus the six-layer chain ending `agent-request: request exceeds intersection (network.connect:example.com:443)`; `DENY control: fully granted destination authorizes 2 capabilities`; `test result: ok. 2 passed; 0 failed` | `0`             | **verified** — typed denial, not a clamp, with a positive control                                                                                                            |
| 11  | Live lifecycle: `daemon.negotiate` → `daemon.host_grant` → `session.create` → `session.attach` → write/read   | real daemon `pid 1660538` on its own `0700` root, v1 client                                                                                                                                    | `STATUS tcp_listeners=0 active_sessions=1`; create → `state: running, generation: 1, state_revision: 1`; attach → `role: controller, attach_count: 1, scopes: [session.inspect, session.host, session.attach, session.control, terminal.inspect, terminal.input, terminal.manage, process.spawn]`; write → `accepted: 6, backpressure: false`; read → `bytes: 7, data: 68656c6c6f0d0a ("hello\r\n"), is_untrusted_surface: true`                                                                      | `0`             | **verified**                                                                                                                                                                 |
| 11a | Concurrent observer attach and observer denials (`P0-AC-022` read-only default)                               | `session.grant` → `session.attach{attach_role: observer, observer_grant}` → read, write, abort                                                                                                 | `OBSERVER … token_present=False`; `session.read -> Denied/ControllerRequired`; `session.write -> Denied/ControllerRequired`; `session.abort -> Denied/ControllerRequired`                                                                                                                                                                                                                                                                                                                             | `0`             | **verified**                                                                                                                                                                 |
| 11b | Detach and re-attach                                                                                          | `session.detach{attach_id}` twice, then `session.attach` with the rotated `control_token`                                                                                                      | first `was_attached: true, state_revision: 6, attach_count: 1` with the observer still attached; second `not_attached: true, state_revision: 6` (revision unchanged, so idempotent); re-attach `role: controller`                                                                                                                                                                                                                                                                                     | `0`             | **verified**                                                                                                                                                                 |
| 11c | Abort as consumer `cancel`, and the session record                                                            | `session.abort{session_id, expected_generation: 1, reason_class: "cancel"}` then `session.list`                                                                                                | `state: terminated, terminal_reason: consumer_cancel, cleanup: swept, attach_count: 0, state_revision: 11`; the session's orphan journal entry removed (`JOURNAL after-abort: []`, was `['97fae594….orphan']`)                                                                                                                                                                                                                                                                                        | `0`             | **verified**                                                                                                                                                                 |
| 11d | Stop modes as the product's own CLI serves them                                                               | `bittyd stop`, `bittyd stop --drain` with live sessions, `bittyd stop --force`                                                                                                                 | `stop` → rc `3`, `bittyd: stop: the daemon refused the stop: Denied/ActiveSessions (actual 2, limit 16)`; `stop --drain` → rc `4`, `bittyd: stopped (drain) with 2 active session(s)`, daemon gone, journal empty; `stop --force` → rc `0`, `bittyd: stopped (force) with 1 active session(s)`                                                                                                                                                                                                        | `3` / `4` / `0` | **verified** for these three modes; exit `1`, `5`, and `6` belong to the 2026-11-19 exit-code record and are not re-claimed here                                             |
| 11e | Is there a `bitty ctl` verb for the daemon lifecycle?                                                         | `grep -n 'pub const CTL_RESOURCES' -A22 crates/bitty-terminal/src/ctl/request.rs`; `grep -rn 'attach\|detach\|\bdrain\b' crates/bitty-terminal/src/ctl*.rs crates/bitty-terminal/src/ctl/*.rs` | `CTL_RESOURCES` = `instance`, `window`, `view`, `panel`, `terminal`, `workspace`, `config`, `consent`, `tab` — **no `session`, `daemon`, `attach`, `detach`, `stop`, or `drain` resource or verb**; every `attach`/`detach` hit is a comment, a `tab` help string, or a test helper                                                                                                                                                                                                                   | `0`             | **finding: the `bitty ctl` daemon verb is absent at `e630e89a`** — see below                                                                                                 |

## Cells 1–3 — the second-uid cell did not run

The `P0-AC-021` adversarial half needs a second local account that is not the
daemon's owner. This host has none that can be used, and the campaign did not
manufacture one:

```sh
$ sudo -n true
sudo: a password is required
rc=1

$ getent passwd | awk -F: '$3>=1000 {print $1" "$3" "$7}'
nobody 65534 /usr/bin/nologin
fuyu 1000 /bin/fish
rc=0

$ setpriv --reuid=65534 --regid=65534 --clear-groups /bin/true
setpriv: setresuid failed: Operation not permitted
rc=127

$ su nobody -s /bin/sh -c 'id'
Password: ***
Authentication token manipulation error
rc=1
```

Three of those four are refusals by the host, not by the daemon, and none of
them is the cell. They are recorded because the negative result is the point:
the containment claim is unrun and the reason is on record with the commands
that demonstrate it.

Two narrower cells were produced in its place, and neither substitutes for it.

**Cell 2, verifier tier.** The repository's own peer test asserts that
`PeerGuard::capture` returns `CaptureFailed{cause: Unauthenticated}` for a real
socket whose peer uid is mapped through `unshare -Ur`:

```sh
$ cargo test -p bitty-daemon --test peer --offline \
    -- --exact refuses_a_peer_from_a_different_user_namespace --nocapture
test refuses_a_peer_from_a_different_user_namespace ... ok
test result: ok. 1 passed; 0 failed
rc=0
```

That is a verifier cell. It proves the comparison works on a real kernel
credential; it does not dispatch the check through a served daemon, and it does
not involve a second local account.

**Cell 3, live refusal — and it is not the criterion's cell.** With the daemon
started inside `unshare --user --map-root-user --net` and the client outside
that namespace, the endpoint refuses at the first response frame:

```text
daemon started in: unshare --user --map-root-user --net  (pid 1664058)
client outside, daemon.negotiate
ConnectionResetError: [Errno 104] Connection reset by peer
rc=1
daemon after the refusal: /proc/1664058/comm = bittyd  (still serving)
```

A real daemon refused a real client over the real socket, which is why the cell
is reported at all. But both sides are local account `1000`; the uid difference
the daemon sees comes from namespace mapping, and attributing the refusal to the
`peer.rs` uid and user-namespace comparison is a reading of the code, not an
instrumented observation of that comparison. It is recorded as **partial**, and
it is **not** the second-uid containment cell.

Cell 3 also has a construction consequence worth stating plainly: because a
client outside the daemon's network namespace is refused, the no-TCP scan of
cell 6 could not be driven from outside the namespace it measures. Both ends
live inside it; the _reader_ of the table is outside.

## Cell 4 — endpoint modes, design review only

```sh
$ stat -c '%A %a %U:%G %n' <scratch>/run1/runtime <scratch>/run1/runtime/bitty \
    <scratch>/run1/runtime/bitty/bittyd.sock \
    <scratch>/run1/runtime/bitty/bittyd.operator \
    <scratch>/run1/runtime/bitty/bittyd.lock
drwx------ 700 fuyu:fuyu <scratch>/run1/runtime
drwx------ 700 fuyu:fuyu <scratch>/run1/runtime/bitty
srw------- 600 fuyu:fuyu <scratch>/run1/runtime/bitty/bittyd.sock
-rw------- 600 fuyu:fuyu <scratch>/run1/runtime/bitty/bittyd.operator
-rw------- 600 fuyu:fuyu <scratch>/run1/runtime/bitty/bittyd.lock
rc=0
```

The modes are what the contract requires and the operator file is
owner-private. What this cell establishes is that the permissions are set as
designed. It does **not** observe a foreign uid being refused at those
permissions; that observation needs the account cell 1 could not create, and
the 2026-11-15 record's `100000`-uid user-namespace probe is a different
mechanism. The cell is labelled design review because that is what it is.

## Cells 5 and 6 — the no-TCP channel, and the one that carries the claim

`bittyd` calls `prctl::set_dumpable(false)` before it binds
(`crates/bitty-daemon/src/service/server.rs`). From that point the process is
not inspectable by a same-uid reader through the ptrace-gated interfaces:
`/proc/<pid>/fd` is unreadable, `/proc/<pid>/ns/net` readlink returns `EACCES`,
and `ss -p` cannot name the process's sockets because it cannot resolve their
inodes to that pid. So a PID-filtered `ss` scan reports zero rows for a
non-dumpable daemon **in either world state**, listening or not. Reporting that
zero as a pass would be reporting the absence of an observation as an
observation of absence.

Cell 5 therefore stays labelled partial and blind:

```sh
phases: startup, created, attached, detached, re-attached, after-abort,
        second-created, after-stop-refused
$ /usr/sbin/ss -ltnpH            → listen_rows_total=29   rows_for_pid=0
$ /usr/sbin/ss -tanpH            → tcp_rows_total=214..367 rows_for_pid=0
```

Cell 5a establishes that the filter itself works, so the zero in cell 5 means
"this channel cannot see this process":

```sh
$ python3 ss_control.py          # binds its own loopback listener, then scans
control listener on 127.0.0.1:46831 in pid 1662624
ss -ltnpH rows total=30 attributed-to-control=1
LISTEN 0 4 127.0.0.1:46831 0.0.0.0:* users:(("python3",pid=1662624,fd=3))
NON-VACUOUS: yes
rc=0
```

Same filter, same host, same instant: a dumpable process is named and the
daemon is not. The zero is about the daemon's non-dumpability, and cell 5a
proves it is not about the filter.

Cell 6 replaces the observer. The daemon and its client run inside
`unshare --user --map-root-user --net`, which gives them a private network
namespace and therefore a private kernel TCP table; the campaign reads
`/proc/<pid>/net/tcp` and `/proc/<pid>/net/tcp6` for that daemon after every
lifecycle phase. Reading a namespace's table is not a ptrace-gated operation,
so non-dumpability does not apply:

```text
phase            tcp rows   tcp listen   tcp6 rows   tcp6 listen
startup               0           0            0             0
created               0           0            0             0
attached              0           0            0             0
detached              0           0            0             0
re-attached           0           0            0             0
after-abort           0           0            0             0
second-created        0           0            0             0
after-force          daemon gone, namespace destroyed
```

Zero rows is only meaningful if the read can report a row, so cell 6a binds a
control listener inside a fresh namespace of the same shape and reads that
namespace's table from outside it:

```text
CONTROL listener up on 127.0.0.1:43423
0: 0100007F:A99F 00000000:0000 0A ...
LISTEN rows in that namespace: 1
host namespace LISTEN rows at the same instant: 19
rc=0
```

The read is namespace-scoped — the host's nineteen rows are not in it — and it
does report the one row that exists. Cell 6's zero is therefore a measurement,
not an artefact of an empty filter or a wrong table.

Cell 7 answers the remaining objection, a frozen or unrelated table. In the
host-namespace run the same read tracked live traffic across the same eight
phases (`TIME_WAIT 136 → 155 → 169 → 186 → 204 → 223 → 243 → 263`,
`SYN_SENT 5 → 6`, `ESTABLISHED 41 → 56`), including the campaign's own connect
sweeps, while cell 6's namespace table stayed at zero rows. The table was live
and the daemon's table was empty at the same time.

Cell 8 is a second observer and a weaker one. A full `connect()` sweep of
`127.0.0.1:1..65535` at every phase found no daemon-owned port open:

```text
pre-start:            open=28 of host_listen_ports=30
during lifecycle:     open=22..25 of host_listen_ports=25
every other port:     ECONNREFUSED
```

The sweep is recorded as partial for a reason that has nothing to do with the
daemon: the host's listening set moved between 25 and 30 ports during the
campaign, because other processes on this machine open and close listeners. A
sweep whose denominator churns cannot be a stable host invariant, and this
record does not claim it as one. It is corroboration, not the cell.

One relationship to state precisely: cell 6 is an **external reproduction** of
a property the repository already observes from inside, in
`crates/bitty-daemon/tests/no_tcp_listener_absence.rs`. It is not a re-run of
that test and it does not derive its authority from it. What it adds is an
observer the daemon does not control.

## Cells 9 and 10 — plugin denials, executed rather than present

The two plugin refusals bitty#2921 names were already present in the tree at
`e630e89a`; the symbol checks (cells 9 and 10) only establish that. Cells 9a and
10a execute them.

```sh
$ cargo test -p bitty-lua --test plugin_network_denial --offline -- --nocapture
DENY require(socket) refused with a typed RuntimeError naming the module
DENY require(socket.core) refused
DENY require(lua-socket) refused
DENY require(bitty.net) refused
DENY plugin VM surface: no socket/connect binding in the stdlib,
     and no network head on the bitty host module
DENY rooted source-only require: a loaded module sees connect/socket as nil
test result: ok. 2 passed; 0 failed
rc=0
```

```sh
$ cargo test -p bitty-plugin-host --test denial_evidence --offline -- --nocapture
DENY fs escape "../secret" denied: hostile-pattern
DENY fs escape "~/projects/../../etc/shadow" denied: hostile-pattern
DENY fs escape "/etc/shadow" denied: hostile-pattern
DENY fs escape "~/projects/../../../root/.ssh/id_ed25519" denied: hostile-pattern
DENY fs control: in-scope allows, sibling prefix denied OutsideScope
DENY network gain refused: exceeds-policy
     chain: … plugin-request … session-grant … host-grant … agent-request:
     request exceeds intersection (network.connect:example.com:443)
DENY control: fully granted destination authorizes 2 capabilities
test result: ok. 2 passed; 0 failed
rc=0
```

Three things make these cells worth more than a symbol grep:

- the refusals are **typed** — a Lua `RuntimeError` naming the module for
  `require(socket)`, and `DenialKind` variants (`HostilePattern`, `OutsideScope`,
  `ExceedsPolicy`) for the filesystem and network arms. A clamp that silently
  returned `nil`, or a path check that threw a string, would not read this way;
- each suite carries a **positive control** — an in-scope path that is allowed,
  a fully granted destination that authorizes exactly two capabilities — so the
  denials are not the behaviour of a component that refuses everything;
- the network arm ends in the six-layer intersection chain and names
  `agent-request: request exceeds intersection`, which is the layer the
  capability-gain claim is about.

They remain component-tier runs: no plugin was installed from a package, no
attempt reached a real socket, and the plugin host is not `bittyd`. They are
evidence for the mediation code, not for a served daemon's plugin sandbox,
which is why no criterion moves on them.

## Cells 11–11e — the live lifecycle campaign

One daemon (`pid 1660538`) on its own `0700` root served the whole lifecycle.

```text
STATUS tcp_listeners=0 active_sessions=1
session.create  -> state: running, generation: 1, state_revision: 1
session.attach  -> role: controller, attach_count: 1
                   scopes: [session.inspect, session.host, session.attach,
                            session.control, terminal.inspect, terminal.input,
                            terminal.manage, process.spawn]
session.write   -> accepted: 6, backpressure: false
session.read    -> bytes: 7, data: 68656c6c6f0d0a ("hello\r\n"),
                   is_untrusted_surface: true
```

A second client attached as an observer through a live `session.grant`, and the
observer's three control-shaped verbs were refused while its read of content
was also refused:

```text
OBSERVER attach result -> role: observer, token_present=False
session.read  -> Denied/ControllerRequired
session.write -> Denied/ControllerRequired
session.abort -> Denied/ControllerRequired
```

Detach ran twice, and the second call left `state_revision` unchanged, which is
the observable form of idempotence rather than a claim that the handler says it
is idempotent:

```text
detach #1 -> was_attached: true,  state_revision: 6, attach_count: 1  (observer still attached)
detach #2 -> not_attached: true,   state_revision: 6
re-attach with the rotated control_token -> role: controller
```

The consumer abort carries its reason class and its cleanup claim onto the
session record, and the daemon removes the session's journal entry:

```text
session.abort{reason_class: "cancel", expected_generation: 1}
session.list -> state: terminated, terminal_reason: consumer_cancel,
                cleanup: swept, attach_count: 0, state_revision: 11
JOURNAL after-abort: []        (was ['97fae594….orphan'])
```

The stop modes were produced with the product's own CLI, not with the campaign
client, so the exit codes are the binary's:

```sh
$ bittyd stop            # two live sessions
bittyd: stop: the daemon refused the stop: Denied/ActiveSessions (actual 2, limit 16)
rc=3
$ bittyd stop --drain
bittyd: stopped (drain) with 2 active session(s)
rc=4
# daemon gone; journal directory empty
$ bittyd stop --force    # against the namespace daemon, one live session
bittyd: stopped (force) with 1 active session(s)
rc=0
```

Exit `1`, `5`, and `6` are **not** re-claimed here. They were produced by the
2026-11-19 exit-code record by constructing one fault per code, and producing
`3`/`4`/`0` again adds nothing to that record.

Cell 11e is a finding rather than a cell, and it shapes how every lifecycle
observation above should be read:

```text
CTL_RESOURCES = instance, window, view, panel, terminal, workspace,
                config, consent, tab
```

There is no `session`, `daemon`, `attach`, `detach`, `stop`, or `drain`
resource or verb in the terminal's `ctl` surface at `e630e89a`. The daemon has
no `ctl` surface, so a campaign cannot drive the lifecycle "through
`bitty ctl`" at this revision: the served endpoint, the accepted v1 envelope,
and the `SO_PASSCRED` path `bittyd stop` itself uses are the product's IPC, and
`bittyd`'s own CLI supplies the stop modes. No private API was substituted and
no handler was called in process. Whether "a scripted v1 client over the served
endpoint" satisfies acceptance text that says `bitty ctl` is a reviewer's
decision, not this record's; adding the verb would be a product change.

## What this record does not claim

- **Cell 5 is partial and blind.** A PID-filtered `ss` cannot see a
  non-dumpable process, so its zero is a statement about the channel, not about
  the daemon. Cell 5a proves the filter works and cell 6 is the cell that
  carries the claim. Anyone citing cell 5 as a pass is citing a blind channel.
- **Cell 3 is not the second-uid cell.** Both sides are local account `1000`;
  the uid difference the daemon sees is created by a user-namespace mapping,
  and the attribution to the peer verifier is a code reading. The second-uid
  containment run is **unrun** — it is blocked on a privileged operator or a
  second local account with working non-interactive sudo, and cells 1–4 narrow
  the gap without being that run.
- **Cell 4 is design review only.** It asserts file modes. It does not observe
  a foreign uid being refused.
- **Cell 8's sweep is not a host invariant.** The host's listening set moved
  between 25 and 30 ports while the campaign ran. The sweep corroborates; it
  proves nothing on its own.
- **Cell 6 is one channel, on one host, at one revision.** It observes the
  daemon's own network namespace and nothing else: not the Windows named pipe,
  not a second network namespace, not a namespace the daemon does not own, and
  not a daemon that changes its namespace after startup.
- **No live plugin sandbox.** Cells 9a and 10a execute the repository's own
  suites. No plugin was installed from a package and no attempt reached a real
  socket.
- **No criterion is Verified and no risk moves.** `R-011`..`R-014` and
  `DR-01`..`DR-08` stay `Open`, and the independent security review that would
  authorize any transition is still owed. A record is not a review verdict.
- **This is not a review, an acceptance, or a residual-risk acceptance.** It is
  a dated run log with the commands, the observed output, and the shell status
  of each.

## Effect on the evidence matrix

The campaign list in [the evidence matrix](../evidence-matrix.md) gains this
record, and the `R-011` and `R-013` gap cells and the `DR-01`..`DR-03` gap cells
name it for the observations it supplies. Nothing else in the matrix moved:

- every `State` column is unchanged, including `Open` for `R-011`..`R-014` and
  `DR-01`..`DR-08`;
- no `P0-AC` criterion is marked Verified. `P0-AC-021` stays Partially verified
  with the second-uid cell unrun, which is the residual this record documents
  rather than removes;
- `F-7`, `F-9`, and the `V-25`/`V-28` artifacts remain absent, so the no-TCP
  namespace scan narrows the `EV-08` gap without closing it: the
  PID-attributed `/proc/<pid>/fd` listing that a privileged reader would need is
  still unobserved, and it is a different cell from this one.

The [risk register](../risk-register.md) gains one paragraph naming this record
and keeps the same conclusion: second-uid containment unrun, independent review
owed, every linked row `Open`.

## Residual blockers

1. **Second-uid containment — unrun, and not executable from this host.** The
   run needs a privileged operator or a second local account plus working
   non-interactive sudo, and it must produce three things: (a) a connect to
   `<runtime>/bitty/bittyd.sock` as that uid, expecting `EACCES` or
   `ECONNREFUSED`; (b) `cat <runtime>/bitty/bittyd.operator` as that uid,
   expecting `EACCES`; (c) `bittyd stop --force` as that uid, expecting exit
   `6`, followed by proof that the daemon is still running and still serving.
   Cells 2, 3, and 4 narrow the gap; none of them is that run.
2. **Independent security review.** No criterion moves from designed to
   verified on a record alone. `R-011`..`R-014` and `DR-01`..`DR-08` stay
   `Open` until that review exists, and this record is an input to it.
3. **The `bitty ctl` daemon surface does not exist** (cell 11e). If the
   acceptance text is read as requiring the campaign through `bitty ctl`, that
   verb is a product change rather than an evidence task, and a reviewer should
   decide whether a scripted client over the served endpoint is acceptable. The
   2026-11-18 record had to make the same choice.
4. **Gaps this record does not touch**, each carried by another record:
   `P0-AC-023` child-token expiry (`worker_sessions: false`), the live DevTools
   panic crash slot, the hostile-output confused-deputy replay, the
   Windows and second-host cells, the privileged `/proc/<pid>/fd` listing, and
   the arbitrary single-scope live grant (`C-09`).
