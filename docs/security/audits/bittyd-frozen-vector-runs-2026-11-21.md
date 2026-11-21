---
title: bittyd Frozen Vector Runs 2026-11-21
description: Dated record at bitty 0bdb6d1c and bittyd 0.0.47 that runs the frozen bitty#2605 conformance driver in both recipe forms, records V-28's no-TCP row pass and C-08's plain invocation with the harness's fd-scan half reported as blind for the non-dumpable daemon, drives V-26's fail-closed exit 6 through a live endpoint mode change behind a running daemon, and runs the DR-08 safe-mode/headless daemon-absence matrix, with V-25 and V-27 recorded as typed skips and no criterion marked Verified
category: security
audience: security-reviewer
document_type: register
status: draft
website_publish: false
sidebar_order: 64
---

# bittyd Frozen Vector Runs 2026-11-21

**Status: dated evidence record; independent review pending.** This record is
the bitty#2921 scoping note's frozen real-driver lane: it runs the frozen
`bitty#2605` conformance driver at the current head in both of its recipe
forms, records the rows that were real-driver-runnable and simply unrecorded,
and constructs the one vector the harness must skip — `V-26`'s endpoint-tamper
fail-closed exit — live, behind a running daemon, modeled on the
[2026-11-19 exit-code constructions](bittyd-exit-code-matrix-2026-11-19.md).
It also runs the non-daemon half of the `DR-08` daemon-absence matrix, which
no daemon campaign can prove: `bitty --safe` and the headless smoke with no
daemon, no endpoint, and a descriptor-table read of the running terminal
process itself.

Three things this record does not do. It does not lift a typed skip: `V-25`
(`requires-second-uid`) and `V-27` (`requires-windows-cell`) are recorded as
skips exactly as the corpus writes them, and `V-26`'s harness row keeps its
`requires-tamper-seam` skip — the live construction in cell 3 is an
out-of-harness observation of the same exit class, not a corpus row served. It
does not upgrade the no-TCP observation: `V-28`'s row passed, and its
`no_tcp_listener` action reads `/proc/<pid>/fd` of a daemon that sets
`PR_SET_DUMPABLE=0`, a read the kernel refuses, so that half of the row is the
same blind PID-attributed channel the
[2026-11-20 record](bittyd-no-tcp-lifecycle-2026-11-20.md) documented; the
namespace-table channel of that record remains the observation that carries the
no-TCP property. And it does not satisfy `P0-AC-019`'s hostile-fixture
threshold: the safe-mode and headless cells here prove daemon absence, not
recovery from the hostile corpus that criterion names (F-5).

Nothing here is Verified. `R-011` through `R-014` and `DR-01` through `DR-08`
stay `Open`, `P0-AC-021`..`P0-AC-026` stay Partially verified, and the
second-uid containment run remains unrun. A record is not the review those
criteria ask for.

## Purpose

bitty#2921's scoping note enumerates, for `P0-AC-021`, the "`V-26`/`V-28`
recorded runs" as cells that keep the criterion short, and names
`DR-08`'s daemon-absence matrix (`C-08`, `V-28`, safe-mode/headless re-run) as
unrun in every campaign, because a daemon campaign cannot prove daemon
absence. This lane closes exactly those recorded-run cells a campaign can
close at the current head, and no others.

In scope:

- the frozen `bitty#2605` conformance driver at `bitty` `origin/main`
  `0bdb6d1c`, in both recipe forms — the scoping note's
  `cargo test -p bitty-daemon --test conformance --offline` and the justfile's
  `just daemon-conformance`
  (`cargo test -p bitty-daemon --test conformance --features test-seams
--locked`), with the real-driver evidence file it writes;
- `V-28`'s row pass recorded, with an explicit probe of what its
  `no_tcp_listener` action channel can and cannot see for a non-dumpable
  daemon;
- `V-26`'s fail-closed exit constructed live: the bound endpoint's mode
  changed behind a running daemon, the served state observed over the real
  endpoint first, the exit code and the exit's single output line quoted;
- `C-08`'s plain invocation, in-harness and standalone;
- the `DR-08` non-daemon matrix: `bitty --safe --headless` and
  `bitty --headless` against isolated roots, each asserting no daemon endpoint,
  no capability file, no runtime subtree, no surviving child, and zero
  TCP-socket descriptors in the live process's own descriptor table joined
  against the kernel TCP tables;
- every typed skip the frozen driver records, recorded as skips.

Out of scope:

- the `V-25` second-uid run and the `V-27` named-pipe run — the skips stand,
  and the second-uid containment cell it would need is blocked on this host
  exactly as the 2026-11-20 record describes;
- `V-26`'s other tamper variants (owner change, replaced inode, symlink at
  the path) — same exit class by the same code path, not constructed here,
  and already residual in the 2026-11-19 record;
- `P0-AC-019`'s hostile-fixture campaign and its auditor review (F-5);
- the windowed plain invocation (the campaign used no display) and the
  `bitty --test-mode` servo (it serves the terminal's own ctl surface, a
  different cell); the CI invocation mode of `DR-08` is a hosted-runner cell;
- any review verdict, and any state move.

## Source identity

- `bitty` at `origin/main` `0bdb6d1c268a9648caa418683c9558b6bbc8ff50`
  (`[CTX-1928] fix(test): deterministic wall verdict for the wall_recovery
fixture (#3298)`), a detached checkout, `git status --porcelain` empty
  before and after every run, so every observation below describes that tree.
- Workspace version `0.0.47`. The corpus under test is
  `crates/bitty-daemon/tests/harness/corpus.json` at that revision: 86
  vectors, unmodified; the driver's coverage gate asserts the frozen size,
  the contract vector list, and a typed skip reason for every row that does
  not run.
- `bittyd` built by the driver's own command into a `CARGO_TARGET_DIR`
  outside every repository; `cargo test -p bitty-daemon --test conformance
--offline` builds the binary the real driver exercises
  (`CARGO_BIN_EXE_bittyd`). The build reported `Finished test profile
[unoptimized + debuginfo]`; the **dev/test** profile is disclosed, and no
  elapsed time here is a release timing.
- Driver binary: `37734768` bytes, SHA-256
  `0537314735b02cc6459b1733cdea362846371e7a216593eb4f1ca694d871413e`;
  `bittyd --version` prints `bittyd 0.0.47 (service API 1.5)`, `$?=0`. The
  package graph was cleaned and rebuilt once to confirm the hash reproduces
  byte-identically from the single-package test invocation, and every
  out-of-harness cell below ran against that same hash, verified before and
  after the campaign.
- The `just daemon-conformance` recipe form rebuilds with
  `--features test-seams`: `37780976` bytes, SHA-256
  `73bb2ac168a72b273d44c2efffb58bc63fb414902076d65ef53b4d4af275d56b`. The
  feature is test-only by the recipe's own contract ("never enable this
  feature in a shipped binary"); it exists so the real `V-44` row can cross
  the request-deadline bound deterministically. That binary is disclosed as
  the recipe's build and is not the binary the other cells ran.
- The terminal binary for the matrix cells, built
  `cargo build -p bitty-terminal --bin bitty --offline --locked`:
  `611421440` bytes, SHA-256
  `283f1e7eec571162e88d3553d510ac66f99b1ccebbba62259cf3e028493dd487`;
  `bitty --version` prints `bitty 0.0.47 (dev 0bdb6d1c)`, `$?=0`.
- Evidence lands under the target dir at `conformance/linux-x86_64.*.json`
  (`bittyd-conformance-evidence/1`); the files carry cell, version, commit,
  instance, capabilities, and per-vector status, and no host path, username,
  socket path, port, or bearer.
- Host: Linux `7.3.4-1-cachyos` x86_64, uid `1000`, rustc `1.98.1`
  (`48a229cea 2026-09-01`), cargo `1.98.1` (`797e8a9bc 2026-08-05`).

## Isolation and safety

Every daemon and terminal this record started used its own `XDG_RUNTIME_DIR`,
`XDG_STATE_HOME`, `XDG_CONFIG_HOME`, `XDG_DATA_HOME`, and `HOME` under a
per-run scratch root (`<scratch>/runN-…`, mode `0700`), and the campaign ran
no command that could address another root:

- the owner's live daemon (the single `bittyd` row `ps -eo pid=,comm=` lists
  on this host) was recorded as a baseline before the campaign and listed
  again after it — the same one row, never started, signalled, connected to,
  or otherwise inspected;
- each campaign process is named by the pid this record started, and each
  ended in a recorded way: the tamper daemon by its own fail-closed exit
  (`6`, `/proc/<pid>` absent afterwards), the two terminal invocations by
  their own exit `0` with no surviving child, the readability-probe daemon by
  `SIGTERM` on its recorded pid only (`/proc/<pid>` absent afterwards), and
  the plain invocations by their own return;
- no signal was sent by name or pattern, and no process outside the campaign
  was signalled;
- no `sudo`, no system-wide change, and no TCP or UDP port: the campaign
  bound no socket outside the scratch roots, and the descriptor-table join
  below observed zero TCP-socket descriptors in each live campaign process;
- the campaign used no browser, no display server, and no compositor.

Paths in the transcripts are written `<scratch>/runN/…`. The scratch roots are
campaign-internal and deliberately not published.

The instrument is disclosed. The served-state observation in the `V-26` cell
was driven by a Python client that writes the accepted `bitty-ipc` v1
envelope — a 4-byte big-endian length prefix and
`{"v":1,"id","method","params"}` — and opts into `SO_PASSCRED` before its
first frame, mirroring `crates/bitty-daemon/src/client.rs` and the conformance
harness's own client. It is the same vehicle class the 2026-11-20 record
discloses and its independent review accepted, bounded the same way: it is
not a product surface, it is not in any repository, and it is not a second
implementation of the daemon. The operator capability is read once from the
operator file and printed as `***`; no bearer appears in any transcript.

## The cells

| #   | Cell                                                                       | Command                                                                                  | Observed (trimmed)                                                                                                                                                                                                                                                                                                                         | `$?`         | Verdict                                                                                                                      |
| --- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | Frozen driver, scoping-note form                                           | `cargo test -p bitty-daemon --test conformance --offline`                                | `test real_conformance_corpus ... ok`, `test result: ok. 27 passed; 0 failed; 1 ignored` in `7.03s`; real evidence `68 pass / 18 skip / 0 fail` of `86`; `V-28` pass, `C-08` pass, `V-25`/`V-26`/`V-27` typed skips; `V-44` `cell-not-servable: request_deadline_seam`                                                                     | `0`          | **recorded** — the frozen driver is green at the head in its plain form                                                      |
| 1a  | Frozen driver, justfile recipe form                                        | `just daemon-conformance`                                                                | same `27 passed; 0 failed`, `6.50s`; real evidence `70 pass / 16 skip / 0 fail`; `V-44` passes through the test seam; parity `compared 48`, `divergences 0`, `status pass`                                                                                                                                                                 | `0`          | **recorded** — both recipe forms of the driver agree on every shared row                                                     |
| 2   | `V-28` startup no-TCP row (`P0-AC-021`, DR-02/DR-08 producer)              | real-driver evidence row                                                                 | status `pass`, steps `4`, signature `0:ok`, `1:action:no_tcp_listener`, `2:ok`, `3:action:no_tcp_listener`; the negotiate step asserts `server_identity.endpoint_kind: unix_socket` and a 32-hex `daemon_instance_id`; the state step asserts `daemon_state: running` with the action repeated                                             | n/a          | **row pass recorded** — the served halves are real observations; the fd-scan half is blind (cell 2a)                         |
| 2a  | What the row's `no_tcp_listener` action can see for this daemon            | `/proc/<pid>/fd` read of the live daemon, from parent and sibling; dumpable control read | parent `read_dir(/proc/<pid>/fd)`: `EACCES (Errno 13)`; sibling `ls`: `Permission denied`; control `/proc/self/fd` (dumpable): reads `4` entries; `/proc/<pid>/net/tcp{,6}`: readable (`160`/`12` rows)                                                                                                                                    | `0`          | the action's zero is the kernel's refusal, not a measurement — the row is recorded, the channel is reported as blind         |
| 3   | `V-26` via a live mode change behind a running daemon (`P0-AC-021`, DR-02) | `chmod 0666` on the bound socket of a served daemon, after a served-state observation    | endpoint `srw------- (600)`; `daemon.negotiate` ok, `endpoint_kind=unix_socket`; `daemon.status` `running`, `tcp_listeners=0`, `active_sessions=0`; after the chmod: daemon exit `6` at `5.28 s`, stdout exactly `bittyd: endpoint tamper; no weaker transport is attempted`, socket path removed                                          | `6` (daemon) | **observed** — fail-closed re-attestation exit, modeled on the 2026-11-19 construction; the harness row keeps its typed skip |
| 4   | `C-08` plain invocation (`DR-08`, `P0-AC-019` adjacent)                    | `bittyd` with no arguments, isolated roots, no daemon                                    | `ipc service: wired (bitty-ipc v1; bittyd start)`, `endpoint: none bound (no socket file created)`, `worker sessions: reserved (D-01: …)`, `containment: none (refused; not probed by this invocation)`; no runtime `bitty` subtree created                                                                                                | `0`          | **observed** — the corpus row's own expectations, re-produced standalone for the transcript                                  |
| 5   | `DR-08` matrix: safe mode with no daemon                                   | `bitty --safe --headless`, isolated roots                                                | exit `0`; `bitty headless smoke: ok — tick presented (frame=1, fills=24, glyphs=21, headless=true, generation=31)`; while alive, peak `11` descriptors across `19` samples, TCP-socket descriptors joined against `/proc/net/tcp{,6}`: `0`; no daemon endpoint, operator file, orphans dir, or `bitty` runtime subtree; no surviving child | `0`          | **observed** — safe mode is not a daemon dependency; the missing endpoint is a supported state                               |
| 6   | `DR-08` matrix: headless smoke with no daemon                              | `bitty --headless`, isolated roots                                                       | exit `0`; the same smoke line (`fills=23`); peak `7` descriptors across `10` samples, TCP-socket descriptors joined: `0`; the same absence assertions                                                                                                                                                                                      | `0`          | **observed** — the headless path binds no daemon endpoint and no TCP listener                                                |

The typed skips the driver recorded, recorded here as skips and not as
passes: `V-25` `requires-second-uid`, `V-26` `requires-tamper-seam`, `V-27`
`requires-windows-cell`, and `V-44` `cell-not-servable: request_deadline_seam`
in the plain form (served in the recipe form by the test seam), plus the
frozen corpus's own `V-06`, `V-20`, `V-29`, `V-30`, `V-33`, `V-42`, `V-43`,
`C-10`, `C-12`, `C-15`, `C-16`, `C-18`, `F-01`, and `V-50` — injected-clock,
adapter-owned, cell-specific, and amendment-gated rows, each carrying its own
typed reason in the evidence file.

## Cells 1 and 1a — the frozen driver at the head

The driver runs one corpus against two drivers: the in-process reference fake
(`candidate-not-bittyd`) and the built binary over its real Unix endpoint.
Both recipe forms were run, and both are green:

```sh
$ cargo test -p bitty-daemon --test conformance --offline
   Compiling bitty-daemon v0.0.47 (…/crates/bitty-daemon)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 3.57s
test real_conformance_corpus ... ok
test result: ok. 27 passed; 0 failed; 1 ignored; 0 measured; 0 filtered out
finished in 7.03s
rc=0

$ just daemon-conformance
   # cargo test -p bitty-daemon --test conformance --features test-seams --locked
    Finished `test` profile [unoptimized + debuginfo] target(s) in 3.59s
test real_conformance_corpus ... ok
test result: ok. 27 passed; 0 failed; 1 ignored; 0 measured; 0 filtered out
finished in 6.50s
rc=0
```

The real evidence file records, for the plain form, `68 pass / 18 skip /
0 fail` of `86`, and for the recipe form `70 pass / 16 skip / 0 fail` — the
difference is exactly `V-44`, which the `test-seams` feature serves through
the test-only request-deadline injection. The parity report compares `48`
shared rows with `0` divergences. The cell reports
`capabilities: {worker_sessions: false, terminal_sessions: true,
observer_grants: true, control_transfer: true, events: true,
idempotent_mutations: true}` and
`diagnostics: {containment.mechanism: cgroup_v2, containment.claim: swept}`,
so the D-01 worker reservation and the containment plan the 2026-11-19
record described hold at the head.

## Cells 2 and 2a — `V-28` recorded, and the honesty its channel needs

`V-28`'s real-driver row passed in both forms. What the row actually asserts:

- the negotiate step returns `server_identity.endpoint_kind: unix_socket` and
  a 32-hex `daemon_instance_id` from the served daemon — a real observation
  over the real endpoint;
- the state step returns `daemon_state: running` — also real;
- the `no_tcp_listener` action, twice, and it is here that the row's channel
  must be read carefully.

The harness's action reads `/proc/<pid>/fd` of the daemon process, collects
its socket inodes, and joins them against the LISTEN rows of
`/proc/net/tcp{,6}`. The daemon this record started — like every `bittyd`,
because `harden_core_dumps` runs `PR_SET_DUMPABLE=0` before the endpoint
binds — refuses that read:

```text
/proc/<daemon>/status:   Name: bittyd   Uid: 1000
parent  read_dir(/proc/<pid>/fd):  EACCES (Errno 13: Permission denied)
sibling ls /proc/<pid>/fd:         rc=2  "Permission denied"
control /proc/self/fd (dumpable):  OK, 4 entries
/proc/<pid>/net/tcp:     READ OK (160 rows);  tcp6:  READ OK (12 rows)
```

The action treats a refused read as no listeners, so its `ok` is a statement
about the channel, not a measurement of the daemon. This is the same class
of blind PID-attributed channel the 2026-11-20 record documented for `ss -p`
and refused to claim; the repo's own
`crates/bitty-daemon/tests/no_tcp_listener_absence.rs` states it in its module
doc. The row is recorded as the frozen corpus defines it — the driver is the
frozen contract's own instrument, and `V-28` is its row — but this record
does not cite the fd-scan half as evidence that the daemon holds no TCP
socket. The observations that do speak for the daemon are the served
negotiate and status halves above, the daemon's own `tcp_listeners: 0`
self-count (quoted in cell 3, and a self-claim, recorded as one), and the
namespace-table channel of the 2026-11-20 record, which reads
`/proc/<pid>/net/tcp{,6}` — readable, as the probe above shows — and remains
the external no-TCP observation this record does not repeat.

## Cell 3 — `V-26` through a live tamper seam

The corpus cannot serve `V-26`: its typed skip reads "the corpus cannot
change the endpoint mode behind a running daemon or observe its exit code".
The exit class was produced by the 2026-11-19 record's cell 6 through a mode
change on the bound socket; this cell re-constructs it at the head, and adds
the served-state observation the corpus's own steps name, driven over the
real endpoint:

```sh
$ bittyd start &            # isolated roots under <scratch>/run1-t26
daemon pid 406523
$ stat -c '%A (%a) %n' …/runtime/bitty/bittyd.sock
srw------- (600) <scratch>/run1-t26/runtime/bitty/bittyd.sock
# scripted v1 client over the endpoint, SO_PASSCRED before the first frame;
# operator capability read from bittyd.operator and sent as ***
daemon.negotiate -> ok=True   endpoint_kind=unix_socket
daemon.status     -> ok=True  daemon_state=running  tcp_listeners=0  active_sessions=0
$ chmod 0666 …/runtime/bitty/bittyd.sock
srw-rw-rw- (666)
daemon exited 5.28 s after the chmod, exit=6
daemon stdout: 'bittyd: endpoint tamper; no weaker transport is attempted'
socket present after exit: False
runtime bitty dir after exit: [bittyd.lock, bittyd.operator, orphans]
rc=6
```

The daemon re-attests its endpoint every `TAMPER_INTERVAL_MS`
(`5 000 ms`, `crates/bitty-daemon/src/service/server.rs:72`); the `5.28 s`
elapsed matches the 2026-11-19 record's `5.28 s` for the same construction.
The exit is fail-closed and content-minimal: one line, no weaker transport
attempted, no terminal transition promised, and the socket path removed on
the way out because the path still names the object it bound. The lock,
operator file, and orphan journal directory remain — the corpus forbids a
tamper exit that drops a live worker's journal record, and no session was
hosting here, so that clause is not claimed either way.

What this cell is and is not: it is a live observation of the `V-26` exit
class against the shipped code path, at the head, with the served state
observed first. It is not a corpus row served — the harness skip stands — and
it is only the mode variant. The owner-change, replaced-inode, and
symlink-at-path variants are the same exit class by the same code path and
stay residual, as the 2026-11-19 record lists them.

## Cells 4–6 — the `DR-08` daemon-absence matrix, non-daemon side

`DR-08`'s named producers are `C-08`, `V-28`, and the safe-mode/headless
re-run. `C-08`'s row passed in-harness; the standalone transcript:

```sh
$ bittyd                # no daemon, isolated roots
worker sessions: reserved (D-01: never served before the ADR 0019 amendment)
ipc service: wired (bitty-ipc v1; bittyd start)
endpoint: none bound (no socket file created)
containment: none (refused; not probed by this invocation)
rc=0
# runtime subtree after the invocation: no bitty/ directory, no socket,
# no operator file, no lock
```

The missing endpoint is a typed, supported state, exactly as the register's
`DR-08` row requires. The safe-mode and headless halves ran against the
terminal binary with the product's own isolation pattern
(`XDG_CONFIG_HOME`/`XDG_DATA_HOME`/`XDG_RUNTIME_DIR`/`HOME` under a scratch
root, `NO_COLOR=1`, no `BITTY_*` variables), which is the env the repo's own
`cli_safe_parity` suite uses:

```sh
$ bitty --safe --headless
bitty headless: theme 'bitty-dark' source=default file=(none) profile=(none) profile_file=(none)
bitty headless smoke: ok — tick presented (frame=1, fills=24, glyphs=21, headless=true, generation=31)
rc=0
$ bitty --headless
bitty headless smoke: ok — tick presented (frame=1, fills=23, glyphs=21, headless=true, generation=31)
rc=0
```

For each run the campaign sampled the live process's own descriptor table —
readable here because the terminal process, unlike the daemon, is dumpable —
and joined every socket inode against the kernel TCP tables: `0` TCP-socket
descriptors at every sample (peak `11` and `7` descriptors). After each run:
no `bitty` runtime subtree, no daemon socket, no operator file, no orphan
journal directory, and no surviving child process (the headless shell the
run spawns exits with it). No daemon was running under any of these roots at
any point, and none was started by the campaign.

Two limits of the matrix, stated rather than papered over: it proves the
terminal is not a daemon dependency on these two paths, not that no
configuration of it ever binds one; and it is not the `P0-AC-019` threshold —
safe-mode startup against the full hostile-fixture set (F-5) is a separate
campaign this record does not run.

## What this record does not claim

- **`V-28`'s fd-scan half is blind.** The harness action's zero for the
  non-dumpable daemon is the kernel's refusal to disclose the descriptor
  table, not an observation of absence; cell 2a demonstrates the refusal
  with a dumpable control. The row pass is recorded because the row is the
  frozen corpus's own instrument, and its served halves are real. The
  namespace-table channel of the 2026-11-20 record remains the external
  no-TCP observation.
- **The typed skips are not lifted.** `V-25` and `V-27` stay skips; `V-26`'s
  harness row stays a skip while cell 3 carries the live construction of its
  exit class. A typed skip is not a pass, and a live side-construction is not
  a served corpus row.
- **No second-uid, no Windows.** The second-uid containment run is still
  unrun on this host for the reasons the 2026-11-20 record records; the
  named pipe exists only on the Windows cell.
- **The `DR-08` row does not move.** A daemon campaign cannot prove daemon
  absence; this record supplies the non-daemon side only. The row's formal
  producers and independent review remain, and the CI invocation mode is a
  hosted-runner cell.
- **`P0-AC-019` is not satisfied.** The safe-mode/headless matrix proves
  absence, not recovery against the hostile-fixture set its pass threshold
  names; that campaign and its auditor review (F-5) stay owed.
- **No criterion is Verified and no risk moves.** `R-011`..`R-014` and
  `DR-01`..`DR-08` stay `Open`; `P0-AC-021`..`P0-AC-026` stay Partially
  verified. These runs are agent-tier evidence toward the sign-off the
  evidence plan names, not the sign-off.
- **This is not a review, an acceptance, or a residual-risk acceptance.** It
  is a dated run log with the commands, the observed output, and the shell
  status of each.

## Effect on the evidence matrix

The [evidence matrix](../evidence-matrix.md) gains this record in the campaign
list, and the `DR-02` gap cell now names it for the `V-26`/`V-28` recorded
runs (the harness skip and the blind-half caveat carried with them) while the
second-uid cell and the independent review remain the row's blockers. The
`DR-08` gap cell now names it for the non-daemon half of its matrix. The
`P0-AC-021` residual cells in the 2026-11-16, 2026-11-18, and 2026-11-20
campaign tables that name "the `V-28` real-driver artifact" now name this
record's row pass. Nothing else in the matrix moved:

- every `State` column is unchanged, including `Open` for `R-011`..`R-014`
  and `DR-01`..`DR-08`;
- no `P0-AC` criterion is marked `Verified`; `P0-AC-021` stays Partially
  verified with the second-uid cell unrun;
- the [risk register](../risk-register.md) `DR-08` row keeps `Open` and gains
  the recorded-run note, with one new paragraph naming this record;
- the [P0 acceptance criteria](../p0-acceptance-criteria.md) campaign-status
  cells for `P0-AC-021` record the `V-26`/`V-28` runs, and the
  `P0-AC-019`-outside-every-campaign sentence now carries this record's
  absence matrix as its exception while the criterion keeps no campaign row.

## Residual blockers

1. **`V-25` — second uid, unrun.** The frozen driver's typed skip stands; the
   run needs a privileged operator or a second local account, neither of
   which this host offers, and the commands are the 2026-11-20 record's
   residual blocker 1.
2. **`V-27` — Windows named pipe, unrun.** Requires the Windows cell; a
   typed skip is not a pass.
3. **`V-26`'s other variants.** Owner change behind a running daemon, a
   replaced socket inode, and a symlink at the socket path are the same exit
   class by the same code path; only the mode variant was constructed (here
   and in the 2026-11-19 record). The owner-change variant is also the
   second-uid cell.
4. **The privileged `/proc/<pid>/fd` listing of the daemon.** Still
   unobserved from this host; the fd-scan channel stays blind, and the
   namespace-table read is the channel that speaks for the daemon.
5. **`P0-AC-019`'s hostile-fixture campaign and F-5.** The absence matrix is
   not the recovery threshold; `DR-08`'s CI invocation mode is a
   hosted-runner cell.
6. **Independent review and owner sign-off.** No criterion moves from
   designed to verified on a record alone; this record is an input to the
   review the evidence plan names, and the 2026-11-21 agent review's
   residuals — `C-09`, the child-token expiry, the hostile-output replay,
   the live DevTools endpoint, the F-9/F-10 artifacts — are untouched here.

## References

- [bittyd Exit-Code Matrix 2026-11-19](bittyd-exit-code-matrix-2026-11-19.md)
- [bittyd No-TCP, Lifecycle, and Plugin-Denial Record 2026-11-20](bittyd-no-tcp-lifecycle-2026-11-20.md)
- [bittyd P0 Independent Agent Review 2026-11-21](bittyd-p0-independent-review-2026-11-21.md)
- [P0 acceptance criteria](../p0-acceptance-criteria.md)
- [Evidence matrix](../evidence-matrix.md)
- [Risk register](../risk-register.md)
- [bittyd P0 evidence plan](../bittyd-p0-evidence-plan.md)
- [Threat model](../threat-model.md)
- [Security overview](../overview.md)
