---
title: bittyd V-26 Tamper Variants 2026-11-22
description: Dated record at bitty 48f297d9 and bittyd 0.0.47 that constructs the two same-uid V-26 endpoint-tamper variants the prior records left unrun — the replaced-inode variant (the live socket renamed away and a plain file created at the socket path) and the symlink variant (the path replaced by a symlink to the renamed socket) — each against a live daemon observed serving over the real endpoint first, recording the fail-closed exit 6, the single tamper line, and the exact after-exit state including that the socket path is not removed because it no longer names the object the daemon bound, with the owner-change variant kept a typed skip and no criterion marked Verified
category: security
audience: security-reviewer
document_type: register
status: draft
website_publish: false
sidebar_order: 65
---

# bittyd V-26 Tamper Variants 2026-11-22

**Status: dated evidence record; independent review pending.** This record
constructs the two same-uid variants of the `V-26` endpoint-tamper exit that
the [2026-11-21 frozen-vector record](bittyd-frozen-vector-runs-2026-11-21.md)
left residual and that the [2026-11-19 exit-code
record](bittyd-exit-code-matrix-2026-11-19.md) names as the same exit class by
the same code path: the **replaced-inode** variant (the live socket renamed
away and a plain file created at the socket path) and the **symlink** variant
(the path replaced by a symlink). Each was constructed against a live
`bittyd` at the current `origin/main`, with the endpoint observed serving over
the real transport before the tamper, exactly as the 2026-11-21 record's mode
variant was.

Three things this record does not do. It does not lift the harness's typed
skip: `V-26`'s row keeps `requires-tamper-seam`, and the constructions here
are out-of-harness observations of the same exit class, not served corpus
rows. It does not construct the **owner-change** variant: changing the socket
owner behind a running daemon needs privilege, this host has no passwordless
`sudo`, and the variant is the same second-uid cell every prior record
declares blocked, so it stays a typed skip and no escalation is attempted. And
it does not flip any status: `P0-AC-021` stays Partially verified, `DR-02`
stays `Open`, `R-011` stays `Open`, and nothing here is Verified.

One behavior differs from the mode variant the 2026-11-21 record observed, and
it is recorded exactly as observed: for both variants constructed here, **the
socket path is not removed on the way out**. The mode variant's path still
named the socket the daemon bound, so the shutdown unlink succeeded; in these
two variants the path names a foreign object (a plain file, a symlink), and
the daemon's shutdown-side identity check refuses to unlink an object it did
not bind, so the tamper artifact a same-uid attacker planted survives the
exit. The exit is fail-closed either way: exit `6`, the single tamper line, no
weaker transport attempted.

## Purpose

The [bitty#2921](https://github.com/bitty-terminal/bitty/issues/2921) scoping
note's residual list for `P0-AC-021` names three `V-26` tamper variants as not
constructed: owner change, replaced inode, and symlink at the path. The
2026-11-21 record constructed only the mode variant; this lane closes the two
same-uid variants a campaign on this host can construct.

In scope:

- the **replaced-inode** variant: the bound socket renamed to
  `bittyd.sock.moved`, a plain file created at the socket path;
- the **symlink** variant: the bound socket renamed away, the path replaced by
  a symlink pointing at the renamed socket (a live, connectable target at
  construction time);
- for each variant: a fresh isolated daemon, the served state observed over
  the real endpoint first, the tamper, the daemon's exact exit code, output,
  timing, and the after-exit state of the socket path, the renamed socket,
  the lock, the operator file, and the orphan journal directory;
- the frozen `bitty#2605` conformance driver at the same revision, both
  recipe forms, as the freshness anchor and the build path for the binary the
  cells ran.

Out of scope:

- the **owner-change** variant — needs privilege (typed skip, never
  attempted: no `sudo`, no second account, exactly as every prior record
  declares);
- the mode variant — already constructed by the 2026-11-19 and 2026-11-21
  records; not repeated;
- `V-25` (second uid) and `V-27` (Windows named pipe) — the typed skips stand;
- any review verdict, and any state move.

## Source identity

- `bitty` at `origin/main` `48f297d99aba65a96530f4ce028567e082a402d3`
  (`[CTX-1932] fix(config): list toggle_panel_mode in KNOWN_ACTIONS_HINT
(bitty#3303) (#3304)`), a detached clone under the campaign's scratch area,
  `git status --porcelain` empty before and after every run, so every
  observation below describes that tree. The shared workspace checkout stayed
  read-only throughout; no commit, checkout, or worktree touched it.
- Workspace version `0.0.47`. The corpus under test is
  `crates/bitty-daemon/tests/harness/corpus.json` at that revision: 86
  vectors, unmodified.
- `bittyd` built by the driver's own command into a `CARGO_TARGET_DIR`
  outside every repository; `cargo test -p bitty-daemon --test conformance
--offline` builds the binary the real driver exercises
  (`CARGO_BIN_EXE_bittyd`). The build reported `Finished test profile
[unoptimized + debuginfo]`; the **dev/test** profile is disclosed, and no
  elapsed time here is a release timing.
- Driver binary: `37734752` bytes, SHA-256
  `3ce1b84dadc5bd0f6951368e3f21ef3d00936b9a3875e48a9c11d994afc2ca6a`;
  `bittyd --version` prints `bittyd 0.0.47 (service API 1.5)`, `$?=0`. The
  hash was verified before and after the campaign below, and every
  out-of-harness cell ran against it.
- The `just daemon-conformance` recipe form rebuilds with
  `--features test-seams`: `37780960` bytes, SHA-256
  `802b9dbd0224fa5839ffe992f6cd9028da643b4059e43cf00ba514d65f0fbfd3`. The
  feature is test-only by the recipe's own contract ("never enable this
  feature in a shipped binary"); that binary is disclosed as the recipe's
  build and is not the binary the cells below ran.
- Both recipe forms are green at this head: the plain form reports `27
passed; 0 failed; 1 ignored` and real evidence `68 pass / 18 skip / 0 fail`
  of `86`; the recipe form reports the same suite with real evidence `70
pass / 16 skip / 0 fail`, `V-44` passing through the request-deadline seam,
  and parity `compared 48`, `divergences 0`, `status pass`. `V-26`'s harness
  row is a typed skip in both (`requires-tamper-seam: the corpus cannot change
the endpoint mode behind a running daemon or observe its exit code`), and it
  keeps that skip.
- The terminal binary for the companion AC-022 record, built
  `cargo build -p bitty-terminal --bin bitty --offline --locked`:
  `612811784` bytes, SHA-256
  `61572b6aa0942d41b9f4e4c62c56251d2938a58fde490b8b9bca2bf714b05c50`;
  `bitty --version` prints `bitty 0.0.47 (dev 48f297d9)`, `$?=0`.
- Host: Linux `7.3.4-1-cachyos` x86_64, uid `1000`, rustc `1.98.1`
  (`48a229cea 2026-09-01`), cargo `1.98.1` (`797e8a9bc 2026-08-05`).

## Isolation and safety

Every daemon this record started used its own `XDG_RUNTIME_DIR`,
`XDG_STATE_HOME`, `XDG_CONFIG_HOME`, `XDG_DATA_HOME`, and `HOME` under a
per-run scratch root (`<scratch>/run-…`, mode `0700`), and the campaign ran
no command that could address another root:

- the owner's live daemon (the single `bittyd` row `ps -eo pid=,comm=` lists
  on this host) was recorded as a baseline before the campaign and listed
  again after it — the same one row, never started, signalled, connected to,
  or otherwise inspected;
- each campaign daemon is named by the pid this record started, and each
  ended in a recorded way: both tamper daemons by their own fail-closed exit
  (`6`, `/proc/<pid>` absent afterwards); no signal was ever sent;
- no signal was sent by name or pattern, and no process outside the campaign
  was signalled;
- no `sudo`, no system-wide change, and no TCP or UDP port: the campaign
  bound no socket outside the scratch roots;
- the campaign used no browser, no display server, and no compositor.

Paths in the transcripts are written `<scratch>/run-…/…`. The scratch roots
are campaign-internal and deliberately not published.

The instrument is the same vehicle class the 2026-11-21 record discloses and
its independent review accepted: a scripted Python client that writes the
accepted `bitty-ipc` v1 envelope — a 4-byte big-endian length prefix and
`{"v":1,"id","method","params"}` — and opts into `SO_PASSCRED` before its
first frame, mirroring `crates/bitty-daemon/src/client.rs` and the conformance
harness's own client. The operator capability is read once from the operator
file and sent; it is not a product surface, it is not in any repository, and
it is not a second implementation of the daemon. No bearer appears in any
transcript.

## The cells

| #   | Cell                                               | Command                                                      | Observed (trimmed)                                                                                                                                                                                                                                                                                                                                                                                                                                      | `$?`         | Verdict                                                                              |
| --- | -------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------ |
| 1   | Frozen driver, plain form (freshness anchor)       | `cargo test -p bitty-daemon --test conformance --offline`    | `test real_conformance_corpus ... ok`, `test result: ok. 27 passed; 0 failed; 1 ignored`; real evidence `68 pass / 18 skip / 0 fail` of `86`; `V-26` a typed `requires-tamper-seam` skip                                                                                                                                                                                                                                                                | `0`          | **recorded** — the frozen driver is green at the head in its plain form              |
| 1a  | Frozen driver, justfile recipe form                | `just daemon-conformance`                                    | same `27 passed; 0 failed`; real evidence `70 pass / 16 skip / 0 fail`; `V-44` passes through the test seam; parity `compared 48`, `divergences 0`, `status pass`                                                                                                                                                                                                                                                                                       | `0`          | **recorded** — both recipe forms agree on every shared row                           |
| 2   | `V-26` replaced-inode variant (`P0-AC-021`, DR-02) | rename the live socket away; create a plain file at the path | endpoint `srw------- (600)` served first (`daemon.negotiate` ok, `endpoint_kind=unix_socket`; `daemon.status` `running`, `tcp_listeners=0`, `active_sessions=0`); after the tamper: daemon exit `6` at `5.26 s`, stderr exactly `bittyd: endpoint tamper; no weaker transport is attempted`, stdout empty, socket path **not removed** (the planted plain file remains), the renamed socket file remains at `bittyd.sock.moved` and refuses connections | `6` (daemon) | **observed** — fail-closed re-attestation exit; the harness row keeps its typed skip |
| 3   | `V-26` symlink variant (`P0-AC-021`, DR-02)        | rename the live socket away; replace the path with a symlink | endpoint `srw------- (600)` served first (a second isolated daemon, its own 32-hex `daemon_instance_id`); symlink `bittyd.sock -> bittyd.sock.moved` placed with the renamed socket live; daemon exit `6` at `5.26 s`, the same single stderr line, stdout empty, socket path **not removed** (the symlink remains, target present), the renamed socket file remains and refuses connections                                                            | `6` (daemon) | **observed** — the same fail-closed exit class; the harness row keeps its typed skip |

The typed skips stay skips and are not passes: `V-25`
`requires-second-uid`, `V-26` `requires-tamper-seam`, `V-27`
`requires-windows-cell`, and the frozen corpus's own amendment-gated and
seam-gated rows, each carrying its own typed reason in the evidence file.

## Cell 2 — the replaced-inode variant

```sh
$ bittyd start &            # isolated roots under <scratch>/run-replaced-inode
daemon pid 568920
$ stat -c '%A (%a) %n' …/runtime/bitty/bittyd.sock
srw------- (600) <scratch>/run-replaced-inode/runtime/bitty/bittyd.sock
# scripted v1 client over the endpoint, SO_PASSCRED before the first frame;
# operator capability read from bittyd.operator and never printed
daemon.negotiate -> ok=True   endpoint_kind=unix_socket
                              daemon_instance_id=7e9cf8211976238bf5c6a3204338fad6
daemon.status     -> ok=True  daemon_state=running  tcp_listeners=0  active_sessions=0
$ mv …/runtime/bitty/bittyd.sock …/runtime/bitty/bittyd.sock.moved
$ touch …/runtime/bitty/bittyd.sock && chmod 0600 …/runtime/bitty/bittyd.sock
-rw------- (600) <scratch>/run-replaced-inode/runtime/bitty/bittyd.sock
daemon exited 5.26 s after the tamper, exit=6
daemon stdout: ''
daemon stderr: 'bittyd: endpoint tamper; no weaker transport is attempted\n'
/proc/568920 present after exit: False
socket path after exit: -rw------- (600) … (the plain file, still there)
moved socket after exit: srw------- (600) …/bittyd.sock.moved
moved socket still accepts connections: False (ConnectionRefusedError)
runtime bitty dir after exit: [bittyd.lock, bittyd.operator, bittyd.sock,
                              bittyd.sock.moved, orphans]
rc=6
```

The re-attestation path is the one the 2026-11-19 record walked:
`BoundEndpoint::reattest` re-stats the socket path, and a plain file fails the
socket-type check before any mode or owner comparison
(`crates/bitty-daemon/src/endpoint.rs`, `attest_socket_metadata`). The exit
matches the mode variant exactly — `6`, one line, `5.26 s`, inside the
`TAMPER_INTERVAL_MS` (`5 000 ms`) re-attestation cadence plus one poll tick.

What differs from the mode variant is the shutdown half, and it is recorded
as observed: the daemon's `remove_owned_socket` compares the observed identity
against the identity it bound, and a plain file is not that object, so the
daemon refuses the unlink and leaves the planted file in place. The renamed
socket file also survives at `bittyd.sock.moved`, but it no longer accepts
connections — the bound listener descriptor died with the process, so the
file is a path, not a service. The lock, the operator file, and the orphan
journal directory remain, as they did for the mode variant.

## Cell 3 — the symlink variant

```sh
$ bittyd start &            # fresh isolated roots under <scratch>/run-symlink
daemon pid 570553
daemon.negotiate -> ok=True   endpoint_kind=unix_socket
                              daemon_instance_id=b52707b13b14981ad8266e26a83af4e2
daemon.status     -> ok=True  daemon_state=running  tcp_listeners=0  active_sessions=0
$ mv …/runtime/bitty/bittyd.sock …/runtime/bitty/bittyd.sock.moved
$ ln -s bittyd.sock.moved …/runtime/bitty/bittyd.sock
lrwxrwxrwx (777) <scratch>/run-symlink/runtime/bitty/bittyd.sock
daemon exited 5.26 s after the tamper, exit=6
daemon stdout: ''
daemon stderr: 'bittyd: endpoint tamper; no weaker transport is attempted\n'
/proc/570553 present after exit: False
socket path after exit: symlink -> bittyd.sock.moved (target: present)
moved socket after exit: srw------- (600) …/bittyd.sock.moved
moved socket still accepts connections: False (ConnectionRefusedError)
runtime bitty dir after exit: [bittyd.lock, bittyd.operator, bittyd.sock,
                              bittyd.sock.moved, orphans]
rc=6
```

The symlink was pointed at the renamed live socket, so at construction time
the path still resolved to the daemon's own bound inode — the strongest
same-uid shape an impostor path can take. The re-attestation still refuses
it: `reattest` reads the path with `symlink_metadata` and a symlink fails
before the target is ever consulted, exactly the fail-closed symlink rule the
risk register's `DR-02` row and the 2026-11-13 `c5ec211` change recorded
("socket directory and bound-socket attestation use `symlink_metadata` and
reject symlinks fail-closed"). The shutdown identity check refuses the unlink
for the same reason as cell 2 — the path names a symlink, not the bound
object — so the symlink and its target both survive the exit.

## What this record does not claim

- **The typed skips are not lifted.** `V-26`'s harness row keeps
  `requires-tamper-seam`; these cells are out-of-harness constructions of the
  exit class, not served corpus rows. `V-25` and `V-27` stay skips.
- **The owner-change variant stays unrun.** Changing the socket's owner behind
  a running daemon needs privilege, this host has no passwordless `sudo`, no
  second account, and no non-interactive escalation path — the same
  declaration every prior record makes, and no escalation was attempted.
- **The socket path is not claimed removed.** For these two variants it is
  not: the shutdown identity check refuses to unlink an object the daemon did
  not bind, and the planted artifact survives. The fail-closed property
  observed here is the refusal to serve through a replaced or symlinked path
  and the refusal to delete a foreign object on the way out — both recorded
  as above.
- **No criterion is Verified and no risk moves.** `R-011` stays `Open`,
  `DR-02` stays `Open`, and `P0-AC-021` stays Partially verified with the
  second-uid cell unrun. These runs are agent-tier evidence toward the
  sign-off the evidence plan names, not the sign-off.
- **This is not a review, an acceptance, or a residual-risk acceptance.** It
  is a dated run log with the commands, the observed output, and the shell
  status of each.

## Effect on the evidence matrix

The [evidence matrix](../evidence-matrix.md) gains this record in the campaign
list, and the `DR-02` gap cell now names it for the replaced-inode and symlink
variants while the owner-change variant, the second-uid cell, and the
independent review remain the row's blockers. The `P0-AC-021` residual cell in
the 2026-11-21 campaign table that names "the owner-change, replaced-inode,
and symlink tamper variants of `V-26`" now names this record for the two
constructed variants and keeps the owner-change half. The
[P0 acceptance criteria](../p0-acceptance-criteria.md) campaign-status cell
for `P0-AC-021` records the two variants, and its residual cell keeps the
owner-change variant, the second-uid cell, `V-27`, and independent review. The
[risk register](../risk-register.md) `DR-02` row keeps `Open` and gains the
recorded-run note, mirroring the paragraph the 2026-11-21 record added to
`DR-08`. Nothing else moved: every `State` column is unchanged, no `P0-AC`
criterion is marked `Verified`, and the companion
[AC-022 live ctl record](bittyd-ac022-live-ctl-2026-11-22.md) moves its own
cells separately.

## Residual blockers

1. **`V-26` owner-change variant, unrun.** Needs privilege; the same
   second-uid cell that blocks `V-25` blocks it, and it stays a declared
   typed skip.
2. **`V-25` — second uid, unrun.** The frozen driver's typed skip stands; the
   commands are the 2026-11-20 record's residual blocker 1.
3. **`V-27` — Windows named pipe, unrun.** Requires the Windows cell; a typed
   skip is not a pass.
4. **Independent review and owner sign-off.** No criterion moves from
   designed to verified on a record alone; the auditor sign-off each
   verification method names is still owed, and the 2026-11-21 agent review's
   residuals are untouched here.

## References

- [bittyd Frozen Vector Runs 2026-11-21](bittyd-frozen-vector-runs-2026-11-21.md)
- [bittyd Exit-Code Matrix 2026-11-19](bittyd-exit-code-matrix-2026-11-19.md)
- [bittyd No-TCP, Lifecycle, and Plugin-Denial Record 2026-11-20](bittyd-no-tcp-lifecycle-2026-11-20.md)
- [bittyd AC-022 Live Ctl Cells 2026-11-22](bittyd-ac022-live-ctl-2026-11-22.md)
- [P0 acceptance criteria](../p0-acceptance-criteria.md)
- [Evidence matrix](../evidence-matrix.md)
- [Risk register](../risk-register.md)
- [bittyd P0 evidence plan](../bittyd-p0-evidence-plan.md)
- [Threat model](../threat-model.md)
- [Security overview](../overview.md)
