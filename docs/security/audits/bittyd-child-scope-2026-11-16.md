---
title: bittyd Child Process Scope Evidence 2026-11-16
description: Dated P0-AC-023 child-scope record at bitty 631f1f9c, capturing a terminal worker's own environment and descriptor table, the parent-observed read, and the pre-exec close-range proof, with no criterion marked Verified
category: security
audience: security-reviewer
document_type: register
status: draft
website_publish: false
sidebar_order: 54
---

# bittyd Child Process Scope Evidence 2026-11-16

**Status: dated evidence record; independent review pending.** This record
supplies the one cell the
[2026-11-13 record](../bittyd-p0-evidence-2026-11-13.md) and the
[2026-11-15 record](../bittyd-p0-evidence-2026-11-15.md) left blocked:
`P0-AC-023`, the child-scope observation, at a named revision with the child
environment and the child descriptor table captured from inside the child. It
covers one criterion and changes no other row.

No criterion is marked Verified and no risk state moves. The evidence-matrix
rows `R-011`..`R-014` and the daemon-intake rows `DR-01`..`DR-08` stay `Open`; a
record is not a review verdict.

## Purpose

`P0-AC-023` asks that a spawned child hold "only a short-lived current-terminal
scope, never a runtime administrator token", with a pass threshold of
"child-environment dump tests show no admin token or durable credential". The
2026-11-08 record captured that cell on the installed release; the two later
records could not repeat it, because the daemon clears its dumpable flag at
startup (`crates/bitty-daemon/src/service/server.rs:543`) and a same-uid
non-ancestor reader therefore cannot read the daemon's `/proc` entries, and
because the campaign had no served session to inspect.

This record closes that gap with a different probe channel: the child reports
its own `/proc/<pid>/environ` and `/proc/<pid>/fd` from inside itself, so the
observation does not depend on the daemon's dumpable flag, and a separate
same-uid process in the harness session - the worker's ancestor - repeats both
reads from outside and records the result whatever it is.

In scope:

- one terminal session child (`session.create` with `kind: terminal`) at
  `bitty` `631f1f9c`, driven over the real Unix endpoint;
- the child's environment, the child's descriptor table, and the
  parent-observed read of the same two objects;
- the pre-exec `close_range`/`CLOEXEC` positive and negative proof already in
  the tree (bitty#2823), and the child fd-table test (bitty#2824), both run at
  this revision.

Out of scope:

- worker-kind sessions: `worker_sessions` is `false` in the live handshake and
  worker hosting is gated on an ADR 0019 amendment, so no worker-kind child
  exists to inspect at this revision;
- child-scope expiry on a path that mints a child token: no such path is served
  here (see residuals);
- SSH agent forwarding: `SSH_AUTH_SOCK` is absent from both views, but no sshd
  or agent-forwarding run was performed;
- the Windows named-pipe and every non-Linux cell;
- independent review, which owns every status transition.

## Source identity

- `bitty` at `631f1f9c40cde5910fd7c82fe373b9ffacbc2d38` (origin/main), committed
  `2026-11-16 00:23:00 +0800`; workspace version `0.0.42`.
- Built with `cargo build -p bitty-daemon --offline --locked`, which reported
  `Finished` for the `dev` profile into a build cache outside the repository
  tree. Binary SHA-256
  `9979965bf2c9412b17ca756ce6b14942126688dcee9f4ad9b7066f0b8b94b058`,
  size `37,667,120` bytes.
- `bittyd --version` prints `bittyd 0.0.42 (service API 1.5)`.
- Toolchain: `rustc 1.98.1 (48a229cea 2026-09-01)`, `cargo 1.98.1`.
- Host class: Linux x86_64, kernel `7.3.4-1-cachyos`, 24 logical CPUs, cgroup
  v2 under a systemd user slice, one interactive uid (`1000`), no privilege and
  no passwordless escalation.
- Each run used a throwaway root beneath `/tmp/bitty/` (mode `0700`, and
  `0700` on the runtime, state, and dump directories inside it) with
  `XDG_RUNTIME_DIR` and `XDG_STATE_HOME` beneath it. `TMPDIR` pointed at the
  same root. The host's own `bittyd` instance was never started, signalled, or
  inspected; the daemon was started and force-stopped by the campaign, and
  every recorded PID was gone afterwards.
- The endpoint the campaign served reported
  `"endpoint_kind":"unix_socket","endpoint_mode":384,"endpoint_owner":1000`
  (`384` is `0600`) and a same-uid peer identity, so the child was spawned by a
  live, authenticated daemon and not by a stub.

### Client disclosure

`bittyd` still ships no headless session verb, so the session was created and
read over the accepted v1 envelope by the repository's own real-service driver
(`crates/bitty-daemon/tests/harness/real.rs`), which starts the built binary and
speaks the real endpoint; the driver is the same one the `conformance` target
uses for its 83-vector corpus. The campaign instrument that calls the driver and
runs the assertions is an uncommitted integration test outside the repository.
Two edits to the driver made that possible, and both widen visibility only:
`RealDriver::start` and a `campaign_credentials` accessor are `pub(crate)`
instead of private. No product code, no driver logic, and no assertion in the
corpus changed. The probe script the child runs is quoted verbatim below, and
the requests are quoted as JSON, so a reviewer can replay the capture without
the instrument.

## Disposition

| Obligation                                                                                                             | Status       | Evidence                                                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Child environment carries no administrator token, bearer, `BITTY*` variable, cloud credential, or secret-shaped name   | Observed     | Child's own `/proc/<pid>/environ`: three entries, none matching `BITTY`, `SSH_AUTH_SOCK`, `AWS_`, `TOKEN`, `SECRET`, `PASSWORD`, `BEARER`, `control_token`, or `operator_capability` |
| Child environment equals the explicit spawn specification plus `TERM`                                                  | Observed     | The two supplied entries plus `TERM=xterm-256color`, and nothing else; the daemon's own `HOME` and the `XDG_*` paths its launcher sets are absent                                    |
| Child descriptor table is exactly stdio on one PTY slave: no second slave or master, no pipe, no inherited socket      | Observed     | Child's own `/proc/<pid>/fd`: `0`, `1`, `2` all on the same `/dev/pts/N`; parent-observed `ls -ln` agrees; the repo test for bitty#2824 passes                                       |
| Pre-exec `close_range(CLOSE_RANGE_CLOEXEC)` sweep runs before `exec`, and a dropped `CLOEXEC` descriptor is observable | Observed     | `worker::tests::close_range_runs_before_exec_and_a_dropped_cloexec_fails_the_probe` (bitty#2823) passes, with both arms asserted                                                     |
| The child's scope is short-lived and expires as specified                                                              | Not observed | No child token is minted at this revision: the live handshake reports `"worker_sessions":false`, and the corpus records `d01-amendment-required`                                     |

## The child environment as the child itself sees it

Request, on the creator connection negotiated with a freshly minted host grant:

```json
{
  "kind": "terminal",
  "idempotency_key": "<client-chosen dedupe string, omitted here: it carries no authority>",
  "argv": ["/bin/sh", "-c", "<the probe script below>"],
  "cwd": "$CTX0317_DUMP",
  "cols": 100,
  "rows": 30,
  "env": ["CTX0317_MARKER=ctx0317-child-scope", "LANG=C"]
}
```

`env` is the child's whole environment, not a patch over the daemon's
(`crates/bitty-daemon/src/spawn.rs:174`), and `term` is absent, so the daemon
supplies `xterm-256color` (`spawn.rs:23`, `spawn.rs:50`). The probe script, as
the worker received it:

```sh
while [ ! -e ./go ]; do sleep 0.05; done
echo PROBE_BEGIN
echo "pid=$$"
echo "ppid=$PPID"
echo FD_BEGIN
/bin/ls -ln /proc/$$/fd
echo FD_END
echo ENV_BEGIN
/usr/bin/tr '\0' '\n' < /proc/$$/environ
echo ENV_END
sleep 0.2
echo ENV_LATE_BEGIN
/usr/bin/tr '\0' '\n' < /proc/$$/environ
echo ENV_LATE_END
echo PARENT_BEGIN
/bin/ls -ln /proc/$PPID/fd 2>&1
echo PARENT_END
echo PROBE_END
exec /bin/sleep 30
```

The child waits for a trigger file so the controller attach completes before it
writes anything, then reads its own `/proc/$$/environ` (`$$` rather than
`/proc/self` because the `tr` runs as a child and would otherwise resolve the
path against itself), and lists `/proc/$$/fd` the same way. The controller then
polled `{"session_id": "<session>", "generation": 1, "max_bytes": 8192}` until
the `PROBE_END` marker appeared. Raw text as returned by `session.read` (the PTY
turns the child's `\n` into `\r\n`; the block below is that text, and the CR
bytes do not render here):

```text
PROBE_BEGIN
pid=1227265
ppid=1227262
FD_BEGIN
total 0
lrwx------ 1 1000 1000 64 Nov 16 01:32 0 -> /dev/pts/6
lrwx------ 1 1000 1000 64 Nov 16 01:32 1 -> /dev/pts/6
lrwx------ 1 1000 1000 64 Nov 16 01:32 2 -> /dev/pts/6
FD_END
ENV_BEGIN
CTX0317_MARKER=ctx0317-child-scope
LANG=C
TERM=xterm-256color
ENV_END
ENV_LATE_BEGIN
CTX0317_MARKER=ctx0317-child-scope
LANG=C
TERM=xterm-256color
ENV_LATE_END
PARENT_BEGIN
ls: cannot open directory '/proc/1227262/fd': Permission denied
PARENT_END
PROBE_END
```

Two reads 200 ms apart return the same three entries. The set is exactly the
supplied `env` plus the daemon's `TERM`; the daemon's own environment - `HOME`
and the `XDG_*` paths its launcher sets - is absent, which is the
discriminating part of the assertion: the child inherits nothing the request did
not name.

Absence checks over the captured output, one pattern at a time:

```text
BITTY -> 0
SSH_AUTH_SOCK -> 0
AWS_ -> 0
TOKEN -> 0
SECRET -> 0
PASSWORD -> 0
BEARER -> 0
control_token -> 0
operator_capability -> 0
```

The same run shows the daemon's descriptor table is closed to its own child:
`ls: cannot open directory '/proc/1227262/fd': Permission denied`, where
`1227262` is the `ppid` the child reported and the `daemon_pid` the handshake
returned. That is the non-dumpable flag
(`crates/bitty-daemon/src/service/server.rs:543`) working as designed, and it is
why this record reads the child from the inside.

Status: **Observed**. Environment equality and credential absence are direct
observations of this run.

## The child descriptor table

The child's own table, from inside the child, is the three lines in `FD_BEGIN`
above: descriptors `0`, `1`, and `2`, every one of them the same PTY slave
`/dev/pts/6`, and no fourth entry. The listing is taken before any redirection
in the script, and the listing process (`ls`) inherits only stdio, so no probe
descriptor of its own appears; the one descriptor the probe opens later, the
`< /proc/$$/environ` read, exists only in the `tr` child and is closed when it
exits. There is no second PTY slave or master, no pipe, no inherited socket, and
no daemon store descriptor.

The parent-observed read agrees. From the harness session (uid `1000`, the
worker's ancestor), while the worker was still alive:

```sh
ls -ln /proc/1227265/fd
```

```text
total 0
lrwx------ 1 1000 1000 64 Nov 16 01:32 0 -> /dev/pts/6
lrwx------ 1 1000 1000 64 Nov 16 01:32 1 -> /dev/pts/6
lrwx------ 1 1000 1000 64 Nov 16 01:32 2 -> /dev/pts/6
```

exit status `0`. A direct read of the same directory, without `ls` in the path,
returned the same three rows. Unlike the daemon's own `/proc` entry, the
worker's is readable to a same-uid ancestor: the child execs a normal binary, so
the dumpable flag the daemon cleared in itself does not carry into the worker.

The two code facts this rests on, both read by symbol at `631f1f9c`:

- `crates/bitty-daemon/src/worker.rs:1910` calls `command.env_clear()` before
  adding the specification's entries, and `worker.rs:1914` adds `TERM`.
- `crates/bitty-daemon/src/worker.rs:1931` calls
  `crate::containment::close_inherited_descriptors`, which on Linux is
  `close_range(3, u32::MAX, CLOSE_RANGE_CLOEXEC)`
  (`crates/bitty-daemon/src/containment/posix_sys.rs:210`, `:256`), with a
  bounded `fcntl` fallback where the kernel lacks the flag.

bitty#2824 is the defect where a worker could inherit extra PTY slave
descriptors; the landed test that pins the fixed behaviour is
`worker::tests::the_child_fd_table_is_exactly_the_pty_stdio`
(`crates/bitty-daemon/src/worker.rs:2678`). It passes at this revision:

```sh
cargo test -p bitty-daemon --lib --offline --locked worker::tests:: -- --test-threads=1
```

```text
test worker::tests::the_child_fd_table_is_exactly_the_pty_stdio ... ok
test worker::tests::close_range_runs_before_exec_and_a_dropped_cloexec_fails_the_probe ... ok
test result: ok. 16 passed; 0 failed; 2 ignored; 0 measured; 478 filtered out; finished in 51.83s
```

The two ignored entries are the child-side probes those tests spawn themselves,
not skips of an assertion.

The test's own assertions, quoted from `worker.rs:2678`:

```text
assert_eq!(numbers, vec![0, 1, 2],
    "the worker inherited descriptors beyond stdio: {fds:?}\n{text}");
assert!(slave.starts_with("/dev/pts/"), "worker stdio must be a PTY slave: {fds:?}\n{text}");
assert_eq!(target, slave, "fd {fd} does not point at the stdio PTY slave: {fds:?}\n{text}");
```

It is not a vacuous read: the test holds a non-close-on-exec pipe across the
spawn on purpose, so a missing child-side sweep would report it in the table.

Status: **Observed**, from two independent directions plus the repository test.

## The pre-exec close and the dropped-`CLOEXEC` negative proof

bitty#2823's obligation is that the sweep runs before `exec` and that the probe
can fail. `worker::tests::close_range_runs_before_exec_and_a_dropped_cloexec_fails_the_probe`
(`crates/bitty-daemon/src/worker.rs:2787`) is the test, and it passes in the run
above. Its two arms, quoted from the source:

```text
// control arm: a test-only hook clears the flag the sweep set
assert!(control_fds.contains(&probe_fd),
    "the fd probe cannot see a dropped close-on-exec descriptor, so the \
     hardened assertion would be vacuous: {control_fds:?}");

// hardened arm: the real worker spawn path
assert!(!worker_fds.contains(&probe_fd),
    "fd {probe_fd} survived the worker's exec as a daemon descriptor: {worker_fds:?}");
assert_eq!(stdio, vec![0, 1, 2], "the sweep must not close stdio: {worker_fds:?}");
let slave = child_fd_target(worker_pid, 0);
assert!(slave.starts_with("/dev/pts/"), "worker stdio must be a PTY slave: {slave:?}");
```

The control arm proves the probe can observe an inherited descriptor, so the
hardened arm's absent descriptor is the sweep's result rather than an
insensitive reader. The `STDIO` assertion proves the sweep does not run over
`0..2`, which is the failure mode a blanket `close_range(0, ..)` would produce.

Status: **Observed**; the ordering proof is a test assertion at this revision,
not a source reading.

## Residuals

- **Child-scope expiry: Not observed.** `P0-AC-023`'s threshold also asks that
  the scope "expires as specified". No child token is minted on this path: the
  live handshake reports `"worker_sessions": false`, and both worker vectors
  carry `d01-amendment-required`, which the
  [2026-11-15 record](../bittyd-p0-evidence-2026-11-15.md) quotes from
  `crates/bitty-daemon/tests/harness/corpus.json:7176`. The expiry cell needs a
  path that mints a child token, and none is served here.
- **SSH agent forwarding: Not observed.** `SSH_AUTH_SOCK` is absent from both
  views, and the child's shell startup added only `PWD` and `SHLVL` (see the
  next item), but no sshd or agent-forwarding run was performed, so the
  forwarding channel itself is unexercised.
- **Shell-added keys.** The parent-observed `/proc/<pid>/environ`, read after
  the probe's final `exec /bin/sleep 30`, shows the same three entries plus
  `PWD` and `SHLVL`:

  ```text
  PWD=$CTX0317_DUMP
  CTX0317_MARKER=ctx0317-child-scope
  LANG=C
  TERM=xterm-256color
  SHLVL=0
  ```

  Those two keys are the shell's own bookkeeping, exported to every child it
  starts; they are the same pair the 2026-11-08 record observed, and neither
  carries a credential. The in-shell reads, taken before that `exec`, show the
  three-entry set only. The campaign root is written as `$CTX0317_DUMP` in this
  block; it is the only substitution in any pasted output.

- **Second-uid foreign-access denial: operator and privileged, not run here.**
  Denying a second uid at the endpoint and at `/proc` needs root or a second
  local account; this environment has neither, as the 2026-11-15 record
  recorded with the same `sudo -n true` refusal.
- **No `P0-AC-023` artifact for a worker-kind session.** Worker hosting is not
  served, so the harder half of the criterion has no subject at this revision.
- **Independent security review: pending.** This record marks nothing Verified.
  A record is evidence for review, not the review verdict, and the standing rule
  of the campaign holds: no criterion flips to Verified without the independent
  reviewer's sign-off. `R-011`..`R-014` and `DR-01`..`DR-08` stay `Open`, and
  `F-8` remains absent in the matrix's follow-up list.
- **The evidence plan's own row is not edited here.**
  `bittyd-p0-evidence-plan.md` `EV-03` still reads `partial` with a fresh run
  owed; this record is that run, and the plan's status is the plan owner's to
  update rather than this record's to assert.

## References

- [Security overview](../overview.md)
- [Threat model](../threat-model.md)
- [P0 acceptance criteria](../p0-acceptance-criteria.md)
- [Evidence matrix](../evidence-matrix.md)
- [bittyd P0 evidence plan](../bittyd-p0-evidence-plan.md)
- [bittyd P0 evidence record 2026-11-08](../bittyd-p0-evidence-2026-11-08.md)
- [bittyd P0 evidence record 2026-11-13](../bittyd-p0-evidence-2026-11-13.md)
- [bittyd P0 evidence record 2026-11-15](../bittyd-p0-evidence-2026-11-15.md)
- [Risk register](../risk-register.md)
