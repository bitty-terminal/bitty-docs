---
title: bittyd P0 Evidence Record 2026-11-15
description: Delta record at bitty ce182ec1 re-running the daemon endpoint, peer, and audit suites, reproducing a foreign-uid refusal at the endpoint modes, and recording the second-uid peer check and the child-environment cell as blocked with the operator command each needs
category: security
audience: security-reviewer
document_type: register
status: draft
website_publish: false
sidebar_order: 41
---

# bittyd P0 Evidence Record 2026-11-15

**Status: dated evidence record; independent review pending.** This is the third
record in the `bittyd` P0 campaign series and it is deliberately narrower than
its predecessors. The host it was taken on has no privilege (`sudo -n` returns
`a password is required`) and no daemon was built, so the live endpoint session
the [2026-11-13 record](bittyd-p0-evidence-2026-11-13.md) captured could not be
repeated. What this record does instead is:

- re-run the three daemon suites that need no served endpoint
  (`endpoint`, `peer`, `audit`) at the current revision and quote their output;
- reproduce, with an unprivileged user namespace, that a foreign kernel uid is
  denied at the endpoint modes the daemon binds;
- carry the live cells forward **by name** rather than silently, on the strength
  of a `git diff` that shows the daemon source has not changed since the
  2026-11-13 build;
- mark the two cells that need a privileged host — the second-uid vector `V-25`
  and the `P0-AC-023` child-environment cell — **BLOCKED**, with the exact
  command an operator with privilege would run and the harness skip that
  records the gap.

No criterion is marked Verified and no state moves: the evidence-matrix rows
`R-011`..`R-014` and the daemon intake rows `DR-01`..`DR-08` stay `Open`.
Independent review owns every transition.

## Purpose

Two cells were left open by the previous record: the second-uid refusal, which
that record could not run at all, and `P0-AC-023`, which it did not re-exercise.
This record pins both, and re-establishes which of the surrounding cells still
hold at `ce182ec1` so a reviewer is not asked to trust a three-day-old capture
without a code-identity check.

In scope:

- the daemon's endpoint attestation, single-instance lock, peer capture, and
  audit-record shape, driven through the repository's own test targets;
- a foreign-uid denial at the endpoint's documented modes, produced without
  privilege;
- the reader-side constraints that make the `P0-AC-023` probe a privilege
  question on this host.

Out of scope:

- any live `bittyd` endpoint, session lifecycle, or scripted v1 client: no
  binary was built in this environment;
- the Windows named-pipe transport and every non-Linux cell;
- the real-service conformance driver and its `V-25`/`V-28` artifacts;
- the MCP/Agent adapter audit, the DevTools endpoint, and any independent
  review verdict.

## Source identity

- `bitty` at `ce182ec19ad547c7d3457c89640faaecd7749c05`, workspace version
  `0.0.42`, service API `1.5` (`crates/bitty-daemon/src/contract.rs:45`).
- `crates/bitty-daemon` is unchanged against the revision the 2026-11-13 record
  built, apart from one line:
  `git diff --stat 9d0e8a88..HEAD -- crates/bitty-daemon` reports
  `crates/bitty-daemon/Cargo.toml | 2 +-`, one insertion and one deletion —
  the workspace version line. No daemon source file differs, so the live
  captures in the 2026-11-13 record still describe this source.
- `bitty-ipc` remains the `9493674` pin the daemon resolves; this record adds no
  second wire format.
- Linux x86_64, uid `1000`. `cargo 1.98.1`. Every command ran with `--offline`
  and `CARGO_TARGET_DIR` pointed at a scratch directory, so the repository tree
  was not written to and no network was used.

### Method and disclosure

The three suite runs are component tests: they exercise the daemon's own modules
(an endpoint bound in a throwaway root, a socketpair, an in-memory audit ring).
They are not a served endpoint, they accept no protocol connection, and they
substitute for nothing.

The foreign-uid probe is a campaign instrument, not a product surface. It binds
a plain Unix socket with the modes the daemon uses and measures what the kernel
does for a uid that is not the socket owner. It is not `bittyd`, and it proves
nothing about the daemon's peer check; what it does prove is stated exactly in
its own section.

Nothing here re-observes a live session. Every live cell is named as carried
forward, with the code-identity check above as its basis.

## Disposition

| Criterion   | 2026-11-13                        | 2026-11-15 (this record)                                          | Decisive command                                                                                                                                  | Observed result                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Artifact                   |
| ----------- | --------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `P0-AC-021` | Partially verified                | Reproduced in part; second-uid peer-check cell **BLOCKED**        | `cargo test -p bitty-daemon --test endpoint --offline`; `cargo test -p bitty-daemon --test peer --offline`; unprivileged user-namespace uid probe | Endpoint suite 19 pass, 0 fail: runtime directory `0700`, socket and lock `0600`, owner = root owner, second instance `AlreadyRunning`, symlinked endpoint and lock refused. Peer suite 3 pass, 0 fail: same-uid child captured and re-checked at every boundary; a peer that matches only through a user namespace is `Unauthenticated`. Foreign kernel uid `100000` gets `EACCES` at `0700`/`0600`, same uid connects. Second uid itself: not run, no privilege | Suite output, probe output |
| `P0-AC-022` | Partially verified                | Carried forward from 2026-11-13                                   | None: no endpoint was served in this campaign                                                                                                     | No new observation. The live lifecycle cells and the 67-vector real cell stand in the 2026-11-13 record at source identical to `ce182ec1`                                                                                                                                                                                                                                                                                                                         | —                          |
| `P0-AC-023` | Not verified (no new observation) | **BLOCKED**                                                       | None here: needs a served session plus a reader that the non-dumpable daemon does not authenticate                                                | No new observation of a child environment. Source facts below describe the spawn specification; they are read, not run                                                                                                                                                                                                                                                                                                                                            | —                          |
| `P0-AC-024` | Partially verified                | Carried forward from 2026-11-13                                   | None                                                                                                                                              | No new observation. The live `is_untrusted_surface: true` capture stands at source identical to `ce182ec1`                                                                                                                                                                                                                                                                                                                                                        | —                          |
| `P0-AC-025` | Partially verified                | Carried forward from 2026-11-13                                   | None                                                                                                                                              | No new observation. The `NotFound` matrix result stands at source identical to `ce182ec1`                                                                                                                                                                                                                                                                                                                                                                         | —                          |
| `P0-AC-026` | Partially verified                | Reproduced in part (component tier); live segment carried forward | `cargo test -p bitty-daemon --test audit --offline`                                                                                               | Audit suite 6 pass, 0 fail: records are `Copy`, fixed-size within the advertised budget, and carry no content field; a supplied terminal id appears only as a digest; refusals carry a code and counts; actor facts are bounded numbers or digests                                                                                                                                                                                                                | Suite output               |

## P0-AC-021 endpoint modes and the peer check

### Endpoint attestation and single instance

```sh
cargo test -p bitty-daemon --test endpoint --offline
```

```text
running 19 tests
test binds_the_endpoint_with_owner_private_modes ... ok
test a_second_instance_is_refused_and_the_first_keeps_serving ... ok
test a_live_endpoint_is_never_unlinked ... ok
test a_stale_socket_is_reclaimed ... ok
test a_stale_socket_with_a_drifted_mode_is_still_reclaimed ... ok
test a_symlinked_endpoint_is_refused_and_the_target_survives ... ok
test a_regular_file_at_the_endpoint_is_refused_and_preserved ... ok
test a_symlinked_lock_path_is_refused_at_startup ... ok
test a_directory_at_the_lock_path_is_refused_at_startup ... ok
test a_shared_runtime_root_is_refused ... ok
test a_missing_runtime_root_is_a_typed_no_endpoint ... ok
test an_over_long_endpoint_is_refused_before_creating_anything ... ok
test an_override_endpoint_is_bound_inside_the_override_parent ... ok
test closing_does_not_unlink_a_replacement ... ok
test close_leaves_the_lock_file_in_place ... ok
test reattest_reports_directory_and_socket_drift ... ok
test reattest_reports_a_missing_socket_and_close_is_ok ... ok
test reattest_reports_a_missing_runtime_directory ... ok
test reattest_reports_a_replaced_socket ... ok

test result: ok. 19 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

The modes are the shipped constants, not the test's own numbers
(`crates/bitty-daemon/src/endpoint.rs:122`, `:125`, `:128`): `RUNTIME_DIR_MODE`
`0o700`, `SOCKET_MODE` `0o600`, `LOCK_FILE_MODE` `0o600`. The binding case
asserts the directory mode, the socket mode, and the lock mode against those
constants and asserts each path's owner equals the root owner, then connects to
prove the listener is bound and asserts a clean close removes the socket. The
second-instance case asserts the typed `AlreadyRunning` refusal, that the live
endpoint is untouched, and that a connection still succeeds — the lock is a
refusal, not an outage.

This is the component-tier half of the mode cell. The live `stat` capture, the
`ss`/`lsof` scans, and `tcp_listeners: 0` from a served daemon remain the
2026-11-13 record's evidence.

### Peer capture, re-check, and the user-namespace refusal

```sh
cargo test -p bitty-daemon --test peer --offline -- --nocapture --test-threads=1
```

```text
running 3 tests
test captures_and_rechecks_a_child_process_peer ...
test peer_helper_child ... ok
test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 2 filtered out
ok
test peer_helper_child ... ok
test refuses_a_peer_from_a_different_user_namespace ...
test peer_helper_child ... ok
test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 2 filtered out
ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

Neither skip branch printed, so both cases ran their assertions rather than
reporting themselves unexercised. (The nested `peer_helper_child` runs and their
`running 1 test` lines are elided from the block above; the summary line is
verbatim.) The first captures a real child's peer
credentials, asserts the captured pid and uid, asserts that Linux exposes the
peer start time, re-checks the same peer at every `DispatchBoundary`, and then
asserts that a peer which has exited is refused with
`RecheckFailed { cause: Exited | Changed }`. The second connects from
`unshare -Ur`, where the uid is mapped to the same value, and asserts
`CaptureFailed { cause: Unauthenticated }`.

The refusal is not a uid comparison. `SO_PEERCRED` reports `1000` for that peer
and the daemon's own uid is `1000`; the comparison that rejects it is the
user-namespace check, whose failure text is
`peer pid {pid} is in a different user namespace; a mapped uid is not same-user
success` (`crates/bitty-daemon/src/peer.rs:616`-`:623`). The ordering claim in
the vector's title also holds in source: the server enables credential receipt,
then captures the peer, and only then builds the connection and its frame
reader (`crates/bitty-daemon/src/service/server.rs:953`-`:968`), so no frame is
parsed before the peer check completes.

### Foreign kernel uid denied at the endpoint modes

A uid that is not the endpoint owner was produced without privilege: the host
carries a `/etc/subuid` range for `uid 1000`, so `newuidmap` maps inner uid `0`
to the host uid `100000` inside a new user namespace. The listener ran as
`uid 1000` and reported `SO_PEERCRED` for whatever connected.

```sh
unshare --user --map-users=100000,0,1 --map-groups=1000,0,1 --setuid 0 \
  /usr/bin/python3 /tmp/ctx0315-uidprobe-bin/probe.py <socket-path>
```

```text
dir 0o700 socket 0o600
  same uid   : connect=ok inner_uid=1000
  uid 100000 : connect=errno 13 (Permission denied) inner_uid=0
  server saw : accepted peer pid=1621071 uid=1000 gid=1000
dir 0o755 socket 0o600
  same uid   : connect=ok inner_uid=1000
  uid 100000 : connect=errno 13 (Permission denied) inner_uid=0
  server saw : accepted peer pid=1621076 uid=1000 gid=1000
mapped namespace inner uid: 0
```

With the daemon's own layout the denial happens at directory traversal: the
`0700` runtime directory refuses the foreign uid before the socket is reached.
With the directory opened to `0755` the denial moves to the `0600` socket, so
both modes carry a refusal of their own and neither is redundant. The same-uid
control connects and the listener observes `uid=1000`, so the denial is not a
dead socket.

What this proves and what it does not: it proves that the documented endpoint
modes deny a foreign kernel uid on this kernel, which is the mechanism the
criterion's "foreign-user connection denied" threshold names. It does not
exercise `bittyd`: no daemon was running, no frame exists, and the daemon's own
peer capture — which additionally rejects a mapped uid that reaches the socket
through a passed descriptor — was not involved. The `V-25` cell proper is below.

### Second uid at the peer check: BLOCKED

Reason. This host has one local account for the campaign user and no
passwordless escalation: `sudo -n true` returns `sudo: a password is required`
(`sudo_rc=1`). The vector requires a peer presenting a second uid to the
kernel, which means a second account, and creating one needs root.

Command an operator with privilege would run:

```sh
# one-time, as root: a throwaway account that owns nothing
useradd --no-create-home --shell /usr/sbin/nologin bitty-peer

# as the campaign user: a served daemon under a throwaway root
env XDG_RUNTIME_DIR="$RT/run" XDG_STATE_HOME="$RT/state" HOME="$RT" \
  "$RT/bin/bittyd" start

# as root, the second-uid refusal at the endpoint
sudo -n -u bitty-peer python3 "$RT/bin/probe_connect.py" "$RT/run/bitty/bittyd.sock"
sudo -n -u bitty-peer env XDG_RUNTIME_DIR="$RT/run" "$RT/bin/bittyd" stop --force

# and the peer-check half, with a descriptor passed across the uid boundary
sudo -n -u bitty-peer "$RT/bin/probe_passed_fd.py" "$RT/run/bitty/bittyd.sock"
```

Expected: `EACCES` at the connect from the `0700` directory (reproduced above at
the mode level), a non-zero refusal from `bittyd stop`, and, on the descriptor
path, a `SO_PEERCRED` uid mismatch recorded as `Unauthenticated`. Not run, so
not claimed.

The harness records the same gap in its corpus:
`crates/bitty-daemon/tests/harness/corpus.json:4409` defines `V-25` ("A second
uid is refused at the peer check before any frame is parsed", area
`trust-unix`, `drivers: ["real"]`), and `corpus.json:4419` carries its
`real_skip`: "requires-second-uid: the harness cannot present a second uid to
the kernel peer check; every conformance connection runs as the daemon's uid."
The in-process fake carries the matching `fake_skip`: an in-process fake has no
kernel peer credential to mismatch. Until the real driver can connect as another
uid, or the out-of-band probe above is run with privilege, `V-25` cannot pass
and must not be reported as passing.

### No-TCP wiring re-verified by reading

The prior record cited the no-TCP scan and its `no_tcp_listener` driver hook.
Both paths still exist at `ce182ec1`, and the wiring is continuous:

- `crates/bitty-daemon/tests/harness/corpus.json:4607` defines `V-28` ("The
  startup scan shows the daemon listens on no TCP endpoint"), whose two steps
  invoke the `no_tcp_listener` action (`corpus.json:4646`, `:4665`);
- `crates/bitty-daemon/tests/harness/runner.rs:665` dispatches that action name
  to `Driver::no_tcp_listener` (`runner.rs:192`);
- `crates/bitty-daemon/tests/harness/real.rs:1227` implements it by reading the
  daemon pid and calling `tcp_listeners(pid)`, which joins
  `/proc/<pid>/fd` socket inodes against `LISTEN` (`0A`) rows in `/proc/net/tcp`
  and `/proc/net/tcp6` (`real.rs:1415`);
- the daemon's own `daemon.status` reports `"tcp_listeners"` from
  `tcp_listener_count()` (`crates/bitty-daemon/src/service/dispatch.rs:1878`,
  `:4498`), which scans `/proc/self` because the daemon clears its dumpable flag
  and an external same-uid observer cannot read `/proc/<pid>/fd`
  (`dispatch.rs:4492`).

Two distinct counts exist and a reviewer should not conflate them: the driver's
scan is pid-attributed and external, the status field is self-reported from
`/proc/self`. The 2026-11-13 record's live observation covered both (zero per-PID
`ss` rows, no `lsof` internet socket, unchanged global listen set,
`tcp_listeners: 0`). What is still missing is the formal `V-28` artifact from a
real-driver run, and it cannot be produced here: the driver spawns the built
binary, which this environment did not build.

Status: **Partially verified**, unchanged in substance. Reproduced today: the
endpoint modes and their attestation, the peer capture and re-check, and the
user-namespace refusal. Foreign kernel uid denied at the modes: reproduced as a
kernel property. A real second uid at the peer check: blocked.

## P0-AC-023 child process scope: BLOCKED

No child environment was captured, and this record does not restate the
2026-11-08 cell as current. Two things stand in the way, and they are different
in kind.

First, the cell needs a served session, and this environment served none: no
`bittyd` binary was built, so there was no `session.create` child to inspect.

Second, even with a served session the read needs a reader the daemon does not
authenticate. The daemon clears its dumpable flag at startup
(`crates/bitty-daemon/src/service/server.rs:543`, pinned by
`crates/bitty-daemon/tests/service_loop.rs:700`, which asserts a same-uid
parent gets `PermissionDenied` opening `/proc/<pid>/mem`), so a same-uid
non-ancestor reader cannot enumerate the daemon's own `/proc` entries. That
mechanism is real on this host and not hypothetical: of 60 same-uid processes
probed, 3 denied a `/proc/<pid>/environ` read while a descendant of the probe
was readable, so the denial follows the process's dumpable flag rather than the
reader's uid.

What source says about the child's environment, read at `ce182ec1` and not run:

- the spawn specification is the six-field subset `argv`, `env`, `cwd`, `cols`,
  `rows`, `term`; `env` is "the child's environment, not a patch"
  (`crates/bitty-daemon/src/spawn.rs:20`), and the accessor is documented as
  "explicit child environment; never a patch over the daemon's"
  (`spawn.rs:174`), so a session child inherits nothing the request did not
  name;
- the daemon supplies `xterm-256color` when `term` is absent (`spawn.rs:23`);
- `argv`, `env`, and `cwd` are dropped after the bind, and the store keeps only
  a domain-separated digest (`spawn.rs:206`, `spawn.rs:209`), which is why the
  audit segment in the previous record carried no `PATH=`, no content marker,
  and no bearer;
- worker hosting, which would be the harder half of the criterion, is not
  served: both worker vectors carry
  `d01-amendment-required: worker hosting is not served until an accepted ADR
0019 amendment names worker supervision in the slice and an independent
spawn/credential/cleanup security review accepts it`
  (`corpus.json:7176`, `:12733`).

Command an operator with privilege would run, which is the method the 2026-11-08
record used:

```sh
# a throwaway root, and the daemon started from a root shell so the probe
# shares its ancestry
sudo -n env XDG_RUNTIME_DIR="$RT/run" XDG_STATE_HOME="$RT/state" HOME="$RT" \
  "$RT/bin/bittyd" start

# one terminal session created over the accepted v1 envelope, then:
sudo -n sh -c 'for p in $(pgrep -P <daemon-pid>); do
  echo "== $p"; tr "\0" "\n" < /proc/$p/environ | sort; ls -l /proc/$p/fd; done'
```

Expected: the child environment is exactly the spawn specification's `env`
entries plus `TERM` (and any key the runtime adds deliberately), with no
`BITTY*` bearer or operator capability, no `SSH_AUTH_SOCK`, no cloud credential
variables, and no secret-shaped name; and the descriptor table holds the PTY
slave on stdio only, with no daemon socket or store descriptor. Not run here, so
not claimed. The harness has no vector that could stand in:
`corpus.json:10014` records `requires-child-fd-seam` for the descriptor half
("no corpus action reads a child's descriptor table").

Status: **BLOCKED**. The 2026-11-08 Partially verified cell is not evidence for
this revision and is not carried forward as if it were.

## P0-AC-026 audit records stay content-free

```sh
cargo test -p bitty-daemon --test audit --offline
```

```text
running 6 tests
test record_is_copy_fixed_size_and_has_no_content_fields ... ok
test overflow_drops_the_oldest_record_and_is_visible_in_counters ... ok
test order_is_event_id_order_not_timestamp_order ... ok
test a_refusal_is_representable_with_a_code_and_counts ... ok
test terminal_transition_and_actor_facts_are_bounded_numeric_or_digest ... ok
test ring_capacity_derives_from_the_advertised_audit_budget ... ok

test result: ok. 6 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

The content-freedom case is discriminating rather than tautological: it supplies
a marker terminal id through `TerminalId::supplied`, asserts the id exists as
supplied, records an entry whose target is a terminal digest, and then asserts
the debug rendering of the newest record contains neither the marker nor the
string `terminal_id`. A `String`/`Vec`/`Box` field would also fail the `Copy`
and `needs_drop` assertions, so a content field cannot be added without failing
this test. The remaining cases pin the size budget, visible overflow, event-id
ordering, refusal representation with a code and counts, and bounded
numeric-or-digest actor facts.

This is the record-shape half of the criterion. File modes on a live audit
directory and segment, the 31-record content grep, and the operator-bearer
absence remain the 2026-11-13 record's live evidence; the seeded-secret corpus,
the export-preview equality, and a crash-report path remain absent.

Status: **Partially verified**, unchanged in substance, with the record-shape
cell now re-observed at `ce182ec1`.

## Carried forward, explicitly

These cells are not re-observed in this record. They are named here so a
reviewer can see exactly what this record does not supply:

- `P0-AC-022` live session lifecycle: carried forward from the
  [2026-11-13 record](bittyd-p0-evidence-2026-11-13.md) on 2026-11-15. Basis:
  no endpoint was served in this campaign, and `crates/bitty-daemon` source is
  identical between `9d0e8a88` and `ce182ec1` apart from the workspace version
  line. The residual cells are unchanged: the full scope-by-method matrix as one
  artifact, the terminal-instance `bitty ctl` cells, live `session.resize`,
  `session.control.transfer`, `session.grant.revoke`, and `lease.heartbeat`.
- `P0-AC-024` untrusted-observation label: carried forward on the same basis.
  The live `session.read` response carried `"is_untrusted_surface": true`; the
  MCP/Agent adapter audit and the auditor review of instruction/data channel
  separation remain absent.
- `P0-AC-025` DevTools scopes: carried forward on the same basis. Every
  `debug.*`, `plugin.manage`, and `config.modify` call is `NotFound` and the
  handshake advertises none of those scopes; a live DevTools endpoint and client
  remain absent.

## Residuals

- **Second uid: BLOCKED, partial.** The mode half is now reproduced at the
  kernel level with a foreign kernel uid (uid `100000` via `/etc/subuid` and
  `newuidmap`, `EACCES` at both `0700` traversal and `0600` socket). The
  peer-check half of `V-25` is not run: it needs a second local account and
  root, and `V-25`'s `real_skip` at `corpus.json:4419` records why the harness
  cannot supply one.
- **`P0-AC-023`: BLOCKED.** No served session and no reader the non-dumpable
  daemon authenticates. The command that would close it is in its own section;
  `corpus.json:10014` records that no corpus action reads a child descriptor
  table, and `corpus.json:7176`/`:12733` record that worker hosting is not served
  until an ADR 0019 amendment is accepted.
- **`V-28` formal artifact absent.** The no-TCP wiring is continuous in source
  and the daemon self-reports `tcp_listeners: 0`, but the real driver's scan has
  not been recorded as its own artifact, and this environment cannot produce it
  without building the binary.
- **Independent review absent.** No criterion in this record is Verified, and a
  record is not a review verdict. `R-011`..`R-014` and `DR-01`..`DR-08` stay
  `Open`.

## What would let bitty#2921 close

Every item below is missing evidence, not missing code, except where noted:

1. A `V-25` run with a second uid: either a real-driver connection path that
   can present one, or the privileged out-of-band probe in this record, with its
   output recorded.
2. The `C-12` capture at a named revision: the child environment and the
   `/proc/<pid>/fd` table of a live terminal session, read from a shell that is
   the daemon's ancestor or from root.
3. The formal `V-28` artifact from a real conformance run, plus the
   pid-attributed descriptor check if a dumpable configuration is ever offered
   (the daemon deliberately is not dumpable, so this is a second-cell
   question, not a defect).
4. The `P0-AC-024` adapter half: the MCP/Agent consumer audit, which `bittyd`
   itself cannot supply because it serves no MCP surface.
5. The `P0-AC-025` live DevTools endpoint and client, and its formal scope
   audit.
6. The `P0-AC-026` seeded-secret corpus plus export-preview equality, which the
   criterion's pass threshold names explicitly.
7. Independent security-auditor review of `P0-AC-021` through `P0-AC-026`
   against the three dated records.

Items 1 and 2 are the only ones this record's environment blocked for privilege
reasons. Items 3 through 6 are open by scope, and item 7 is the gate the
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
- [Risk register](risk-register.md)
