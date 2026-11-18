---
title: bittyd Exit-Code Matrix 2026-11-19
description: Dated record at bitty 04253d4c and bittyd 0.0.45 that constructs the startup-fault, unverified-worker, and endpoint-tamper faults against isolated roots, observes exit codes 1, 5, and 6 from the real binary, and leaves every status column unchanged
category: security
audience: security-reviewer
document_type: register
status: draft
website_publish: false
sidebar_order: 60
---

# bittyd Exit-Code Matrix 2026-11-19

**Status: dated evidence record; independent review pending.** The
[2026-11-18 campaign](../bittyd-p0-evidence-2026-11-18.md) observed exit codes
`0`, `2`, `3`, and `4` from a served `bittyd` and recorded `1`, `5`, and `6` as
declared by the binary's usage text but **not produced**. This record is the
follow-up for exactly those three cells. It constructs one fault per code
against fully isolated roots, runs the same binary an operator would run, and
quotes the command line, the streams, and the shell status of each.

Exit codes `2` (usage), `3` (active sessions on a default stop), and `4` (a
drain deadline forced the remainder) are **not re-claimed here**. They were
produced and quoted by the 2026-11-18 campaign, which remains their record; this
document neither repeats those runs nor adds to them.

No criterion is marked Verified and no state moves. `R-011` and `R-012` stay
`Open` with their existing text, and the `P0-AC-021`/`P0-AC-022` disposition
statements are unchanged, because producing three more exit codes does not
close the cells those criteria name — the second-uid peer check, the drain
deadline under a live session, and the independent review all remain absent.

## Purpose

bitty#2921 asks for the `P0-AC-021`/`P0-AC-022` trust evidence to be proved
against the daemon rather than asserted from source. The exit-code map in
`crates/bitty-daemon/src/cli.rs:44-63` is a closed set of seven values, and the
contract (`D-05`) requires the binary to return each for its own cause. A code
that no campaign has ever produced is a claim about code paths, not an
observation. This record turns three of those claims into observations.

In scope:

- exit `1` from `bittyd start` when startup cannot complete;
- exit `5` from a force stop whose worker containment could not be verified;
- exit `6` from a served daemon whose endpoint failed re-attestation.

Out of scope:

- exit codes `0`, `2`, `3`, and `4`, carried by the 2026-11-18 record;
- every non-Linux cell, the Windows named pipe, and the second-uid peer check;
- the real-service conformance driver, which no campaign at this revision has
  run against these paths;
- any review verdict. A record is not a review.

## Source identity

- `bitty` at `origin/main` `04253d4cd5d92683ee1c612e4f6642683498b6da`
  (`[CTX-1892] feat(terminal,runtime): carry refused panel-provider
declarations out of the activation edge (bitty#3239 row 13) (#3247)`).
- The tree built for this record was extracted from that revision
  (`git archive 04253d4c`) into a scratch directory, so the build is pinned to
  the commit and not to whatever a working checkout happened to hold.
- Workspace version `0.0.45`; `bittyd --version` prints
  `bittyd 0.0.45 (service API 1.5)`.
- Built with `cargo build -p bitty-daemon --offline` into a `CARGO_TARGET_DIR`
  outside the repository. The build reported `Finished` for the `dev` profile
  (`[unoptimized + debuginfo] target(s)`). This record discloses that the
  **dev** profile was built, not `release`: the exit-code mapping and the
  containment paths under test are not profile-gated, but the elapsed times
  quoted below are not release timings.
- Binary: `37665696` bytes, SHA-256
  `896289ed642e95eed84942c1769d09d9742ca3999378df7cef5adc4af35d39c3`.
- Linux `7.3.4-1-cachyos` x86_64, uid `1000`, cargo `1.98.1`
  (`797e8a9bc 2026-08-05`), rustc `1.98.1` (`48a229cea 2026-09-01`).
- Containment probed by the served daemon as `mechanism: cgroup_v2`,
  `claim: swept`, `verify: served` (`daemon.status` on a campaign daemon).

## Isolation and safety

Every command in this record ran with `XDG_RUNTIME_DIR`, `XDG_STATE_HOME`,
`XDG_CONFIG_HOME`, `XDG_DATA_HOME`, and `HOME` pointed at a per-cell scratch
root, and the campaign ran no command that could reach another root:

- the owner's live `bittyd` was never started, signalled, connected to, or
  stopped; no campaign process opened its socket. It serves the per-user runtime
  directory that the isolation overrides replace for every campaign process, so
  no campaign command addressed it. Its presence appears in this record only
  through the host's own `ss` table, quoted below;
- each campaign daemon is named by the pid this record started, and each was
  ended by its own fault or its own endpoint: `583499`, `585197`, `585911`,
  `588074`, `588830`, `589050`, `589319`, `586768`. All were re-checked absent
  with `ps` after the campaign;
- no signal was sent by name or pattern. This record sent no signal itself; the
  only processes signalled were the session children the daemon signalled
  through its own containment;
- no `sudo`, no system-wide change, no TCP or UDP port, and no socket outside
  the scratch roots. The one filesystem outside the scratch roots that this
  record touched is the cgroup subtree the daemon itself created for its own
  session, and the record removed only the directories it created there;
- `ss -xlp` on this host lists exactly one `bittyd` endpoint and one unrelated
  `bitty` socket, both pre-existing, neither in a campaign root.

Paths in the transcripts below are written `<scratch>/<cell>/…`. The scratch
roots are campaign-internal and deliberately not published.

## The matrix

| Cell                             | Fault constructed                                                                                                                                                             | Command                                           | Observed exit code | Observed message                                                                                        | Verdict  |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------- | -------- |
| `1` startup fault, audit root    | `bittyd start` with both `HOME` and `XDG_STATE_HOME` unset, so no audit directory can be derived                                                                              | `env -i … bittyd start`                           | `1`                | `bittyd: no XDG_STATE_HOME or HOME for the audit sink`                                                  | observed |
| `1` startup fault, endpoint root | `bittyd start` with `XDG_RUNTIME_DIR=relrun`, a relative path the endpoint resolver refuses                                                                                   | `env -i … XDG_RUNTIME_DIR=relrun bittyd start`    | `1`                | `bittyd: no bittyd endpoint: XDG_RUNTIME_DIR is not an absolute path`                                   | observed |
| `5` unverified worker            | A force stop of a session whose worker created a nested cgroup inside its own session subtree, so the subtree could not be removed and the whole-tree claim could not be made | `bittyd stop --force`                             | `5`                | `bittyd: stopped (force) with 1 active session(s)` and `bittyd: 1 worker(s) could not be verified gone` | observed |
| `6` endpoint tamper              | `chmod 0666` on the bound endpoint socket while the daemon served, from the same account                                                                                      | `chmod 0666 "$XDG_RUNTIME_DIR/bitty/bittyd.sock"` | `6`                | `bittyd: endpoint tamper; no weaker transport is attempted`                                             | observed |

The daemon process itself also exits `5` and `6` in the two cells where it is
the process under test; both are quoted in the cell sections. Exit `5` is the
only code here with two observers (the stop client and the served loop), and
they agree.

## Cell 1 — startup fault

Two independent startup refusals were constructed, because exit `1` covers
"internal failure before any listener accepted a connection" and no single
fault proves the whole class.

### Fault A — no audit directory

`ServerConfig::from_process` resolves the audit directory first
(`crates/bitty-daemon/src/service/server.rs:331`), and
`default_audit_dir` needs `XDG_STATE_HOME` or `HOME`
(`crates/bitty-daemon/src/audit_sink.rs:675`). Unsetting both is a real startup
configuration fault, not an injected test seam:

```sh
$ env -i PATH=/usr/bin:/bin XDG_RUNTIME_DIR=<scratch>/cell1a/run \
    XDG_CONFIG_HOME=<scratch>/cell1a/config \
    XDG_DATA_HOME=<scratch>/cell1a/data bittyd start
  # HOME and XDG_STATE_HOME are unset in this invocation
bittyd: no XDG_STATE_HOME or HOME for the audit sink
rc=1
runtime subtree after the refusal:
```

The runtime subtree is empty: the refusal precedes any endpoint bind, so no
socket, lock, or operator file was created. The message is
`ServerError::NoAuditDirectory` rendered by `report`, which returns
`EXIT_INTERNAL` (`crates/bitty-daemon/src/cli.rs:368`).

### Fault B — unusable endpoint root

The second fault leaves the audit directory resolvable and moves the failure to
endpoint resolution:

```sh
$ cd <scratch>/cell1b
$ env -i PATH=/usr/bin:/bin HOME=<scratch>/cell1b XDG_RUNTIME_DIR=relrun \
    XDG_STATE_HOME=<scratch>/cell1b/state bittyd start
  # XDG_RUNTIME_DIR is set to the relative path "relrun"
bittyd: no bittyd endpoint: XDG_RUNTIME_DIR is not an absolute path
rc=1
runtime subtree after the refusal:
```

Both the runtime directory and the state directory are empty afterwards. The
message is `EndpointError::InvalidPath`, which `run_start` maps through the same
`report` path to `EXIT_INTERNAL`, and deliberately not to `EXIT_TAMPER`: an
unusable _configuration_ is an internal failure, while exit `6` is reserved for
an endpoint that exists and fails attestation.

## Cell 5 — unverified worker

The 2026-11-18 record observed `cleanup: swept` for every termination and exit
`0` for `--force`. Exit `5` needs a stop that reaches
`stop_reply_exit_code` with `unverified > 0`
(`crates/bitty-daemon/src/cli.rs:338`), which only a containment verification
failure produces.

On this host the daemon selects the `cgroup_v2` plan, whose whole-tree claim is
"`cgroup.procs` empty and `cgroup.events` `populated 0`, and the subtree
removed" (`term_cgroup` in `crates/bitty-daemon/src/containment/child.rs`, and
`remove` at `crates/bitty-daemon/src/containment/cgroup.rs:501`). The fault
constructed here is a worker that makes the last clause impossible: it creates a
nested cgroup inside its own session subtree. The session subtree then cannot be
removed (`EBUSY`), so the plan downgrades its claim to `unverified` rather than
report a sweep it cannot back.

The nested `mkdir` needs no privilege: the session subtree sits under the
delegated user cgroup root and is owned by the daemon's own uid, so a session
the daemon spawned can create a child cgroup in it with the rights it already
has. No second account, `sudo`, or capability is involved.

The worker is an ordinary terminal session created over the endpoint; no test
seam, feature flag, or in-crate hook is involved:

```sh
$ bittyd start &   # isolated roots under the campaign scratch dir
daemon pid=589050
session.create argv: /bin/sh -c "SELF=$(sed -n 's/^0:://p' /proc/self/cgroup); mkdir -p /sys/fs/cgroup$SELF/nested && echo nested-created; exec sleep 240"
session.create ok=True session_id=ae8faefe44cf806ad6a2d896a4bf5b42 state=running worker_handle=e456fb5bf453a3ed47e5f96d3beea16c
session cgroup: <scratch>/…/bittyd-bbe45685e4627b23f0f493ffd53923bc-ae8faefe44cf806ad6a2d896a4bf5b42
nested cgroup: <scratch>/…/bittyd-bbe45685e4627b23f0f493ffd53923bc-ae8faefe44cf806ad6a2d896a4bf5b42/nested exists=True
session cgroup members before the stop: ['589054']
session cgroup populated before the stop: populated 1
$ bittyd stop --force
bittyd: stopped (force) with 1 active session(s)
bittyd: 1 worker(s) could not be verified gone
rc=5
daemon stdout: bittyd: stopped (force)
daemon exit=5
subtree present after the stop: True
subtree members after the stop: []
nested cgroup present after the stop: True
audit terminator row: v1 ev=6 t=1052 i=bbe45685e4627b23f0f493ffd53923bc a=daemon.stop r=ok s=ae8faefe44cf806ad6a2d896a4bf5b42 g=1 rv=3 k=session d=ae8faefe44cf806ad6a2d896a4bf5b42 z=terminated zr=daemon_stop zk=unverified
```

Three things in that transcript matter for how the cell should be read:

- the subtree is **empty** after the stop (`subtree members after the stop: []`)
  and the nested directory is still present, so the `unverified` class came from
  the failed subtree removal, not from a surviving worker process;
- the daemon's own exit is `5` as well (`stopped_exit_code`,
  `crates/bitty-daemon/src/cli.rs:324`), so the code is not an artefact of the
  CLI client;
- the audit terminator row records `zk=unverified`, so the classification is on
  disk in the daemon's own audit segment, not only on the terminal.

This is a fail-closed report: the daemon declines to claim a verified sweep. It
is a real containment-verification failure reachable by a session the daemon
spawned itself, and it is not evidence that any process survived.

The `session.create` and `stop` verbs were driven with a campaign client that
writes the accepted `bitty-ipc` v1 envelope (4-byte big-endian length prefix plus
`v`, `id`, `method`, `params`) and opts into `SO_PASSCRED`, as the 2026-11-18
record discloses for its own instrument. It is not a product surface, it is not
in the repository, and it is not a second implementation of the daemon.

## Cell 6 — endpoint tamper

A served loop re-attests its endpoint every `TAMPER_INTERVAL_MS` (5 000 ms,
`crates/bitty-daemon/src/service/server.rs:72`) and returns
`ServerOutcome::Tampered` when the attestation fails
(`crates/bitty-daemon/src/service/server.rs:866`). The smallest fault that
reaches it is a mode change on the bound socket by the same account — no
privilege, no second user, no test seam:

```sh
$ bittyd start &   # isolated roots under the campaign scratch dir
daemon pid=589319
$ stat -c '%a %n' "$XDG_RUNTIME_DIR/bitty/bittyd.sock"
600 <scratch>/t6/run/bitty/bittyd.sock
$ chmod 0666 "$XDG_RUNTIME_DIR/bitty/bittyd.sock"
666 <scratch>/t6/run/bitty/bittyd.sock
daemon exited 5.28 s after the chmod
daemon stdout: bittyd: endpoint tamper; no weaker transport is attempted
daemon exit=6
socket present after exit: False
```

The daemon exits `6` at the next re-attestation, and its only output was the
single line above. It does not fall back to a weaker transport, and it removes
the socket path on the way out because the path still names the object it
bound.

The mode change is the fault, not a permission mistake by the operator: `0600`
is the contract mode for the endpoint, and any other mode is exactly what
`attest_socket_metadata` refuses. A replaced inode, a symlink at the path, and a
socket bound by another account are the same exit class by the same code path
and were **not** separately constructed here; see the residual list.

## What remains unexercised

- **Exit `5` through the `subreaper` fallback plan.** This host selects
  `cgroup_v2`, so the subreaper branch
  (`crates/bitty-daemon/src/containment/child.rs`) was never the plan under
  test. Forcing the fallback needs a cgroup root the daemon cannot use, which
  this host does not offer without a system-wide change.
- **Exit `6` for an endpoint this account may not use.** That needs a second
  local account able to bind a socket at a path this account is then denied, and
  this host has no passwordless escalation, so the cell is **NOT EXERCISED**.
  It is also the `P0-AC-021` second-uid cell that stays unrun.
- **Exit `6` for a replaced socket inode or a symlink at the socket path.** The
  same code path and the same exit class, but only the mode variant was
  constructed. Listed as residual rather than claimed.
- **Exit `5` through a worker that genuinely survives the kill window.** The
  fault constructed here leaves the tree empty and the identity unprovable. A
  surviving worker is a different cell and needs a process the kernel will not
  end, which this campaign did not construct.
- **Exit `1` from a transport failure mid-exchange**
  (`StopError::Transport` → `stop_error_exit_code`,
  `crates/bitty-daemon/src/cli.rs:354`). The two startup faults cover
  `EXIT_INTERNAL` from `start`; the `stop` arm of the same constant was not
  driven.
- The real-service conformance driver at this revision, and any independent
  review verdict.

## Effect on the evidence matrix

The campaign row for 2026-11-18 in
[the evidence matrix](../evidence-matrix.md) said that exit codes `1`, `5`, and
`6` were declared but unexercised. That row now names this record for those
three codes. Nothing else in the matrix moved:

- every status column is unchanged, including the `P0-AC-021` and `P0-AC-022`
  dispositions and the `Open` state of `R-011` and `R-012`;
- no `P0-AC` criterion is marked Verified, because producing an exit code is not
  the review those criteria ask for;
- the residual cell for `P0-AC-021` still names the second-uid peer check, the
  `V-28` real-driver artifact, and the non-Linux cells, none of which this
  record touches.
