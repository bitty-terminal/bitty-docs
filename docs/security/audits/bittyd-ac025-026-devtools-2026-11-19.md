---
title: bittyd P0-AC-025 and P0-AC-026 Live DevTools Record 2026-11-19
description: Dated record at bitty 04253d4c and bitty-ipc 9493674 that serves a live DevTools endpoint from the product binary and from a campaign servo, walks a three-verb scope matrix over both under four grants, exports a 313132-byte trace whose preview equals the served bytes on both pages with a 0600 spool and no seeded secret, and produces the exit diagnostics slot; the panic crash slot is recorded as not run with its reason
category: security
audience: security-reviewer
document_type: register
status: draft
website_publish: false
sidebar_order: 61
---

# bittyd P0-AC-025 and P0-AC-026 Live DevTools Record 2026-11-19

**Status: dated evidence record; independent review pending.** This record takes
the three cells the [2026-11-16 MCP/Agent
record](bittyd-ac024-026-2026-11-16.md) left unexercised for `R-014` — a
live DevTools endpoint, a trace export preview, and crash reports — and supplies
the first two as executed runs against the real binary and the third partly: the
exit diagnostics slot was produced by the shipped binary, and the panic crash
slot is recorded as **not run** with the reason, not inferred from source.

Nothing here is Verified. `R-014` stays `Open`, `P0-AC-025` and `P0-AC-026` stay
**Partially verified**, and the two auditor artifacts `F-10` names
(`devtools-redaction-2026-xx`, `trace-minimization-2026-xx`) remain absent,
because a record is not the review. The one substantive observation this record
adds beyond coverage is a scope-hierarchy finding in the inspect gate, written
down in [What the record does not show](#what-the-record-does-not-show).

## Purpose

`P0-AC-025`'s pass threshold is "three-scope matrix shows connection alone
grants none", and `P0-AC-026`'s is "seeded-secret corpus never appears in
default outputs; file mode `0600` asserted; export preview equals actual export
byte-for-byte". Every campaign before this one answered those thresholds with
in-process handler calls or with unit tests at a pinned revision, because no
campaign had served a DevTools endpoint. This record answers them over the wire,
against a socket, with the shipped `bitty` binary on one side and the campaign's
own servo on the other.

In scope:

- a live `bitty.debug/*` endpoint, served by `bitty --test-mode` (the product)
  and by a campaign servo built from the pinned `bitty-ipc` tree;
- the `debug.inspect` / `debug.trace` / `debug.control` matrix over that
  endpoint under four grants;
- a 313 132-byte trace exported, paged, previewed, and stopped to a spool file,
  with a seeded secret and an input marker in the corpus;
- the exit diagnostics slot written by the shipped binary.

Out of scope, and why:

- **the panic crash slot** — see the Cell C section below;
  it is `not run`, not merely omitted;
- input recording in its opt-in form (`includeInput: true`), the clipboard, and
  any uploader — no upload surface exists in this code at this revision, and the
  clipboard has no headless surface to drive;
- the Windows named pipe, every non-Linux cell, and the second-uid peer check;
- the `P0-AC-022` terminal-instance `bitty ctl` cells (resize, transfer,
  grant-revoke, heartbeat, detach, drain). They are already carried as observed
  by the [2026-11-16 `P0-AC-022` record](bittyd-ac022-scopes-2026-11-16.md),
  and the residual AC-022 gap is the arbitrary single-scope live grant (`C-09`)
  plus the independent review, neither of which a re-run here would move;
- any review verdict.

## Source identity

- `bitty` at `origin/main` `04253d4cd5d92683ee1c612e4f6642683498b6da`
  (`[CTX-1892] feat(terminal,runtime): carry refused panel-provider
declarations out of the activation edge (bitty#3239 row 13) (#3247)`), built
  in the read-only campaign worktree at that revision.
- `bitty-ipc` at `949367413b0640fbea4b99c6dda9acff48c623d1` (`[CTX-0016]
feat(ipc): Windows named-pipe transport with current-user SID checks (#37)`),
  the revision the evidence matrix pins for `bitty-ipc`. The tree was extracted
  with `git archive 9493674` into a scratch directory so the build is pinned to
  the commit rather than to whatever a checkout held.
- Workspace version `0.0.45`; `bitty --version` prints
  `bitty 0.0.45 (dev 04253d4c)`.
- Binaries, `dev` profile (`[unoptimized + debuginfo] target(s)`), built with
  `cargo 1.98.1 (797e8a9bc 2026-08-05)` / `rustc 1.98.1 (48a229cea 2026-09-01)`
  into a `CARGO_TARGET_DIR` outside every repository:
  - `bitty`: 606 479 456 bytes, SHA-256
    `86507f8bfedf5b966184a28b16482a1922e0a5c026edd5ddabf2a253e9dba409`;
  - the campaign client `devtools-live`: 20 761 264 bytes, SHA-256
    `be8a76353e79a8ce1af7b4101a04ae60876b085bacb3b6268a7ef98e404b9d06`.
- Linux `7.3.4-1-cachyos` x86_64, uid `1000`, no display server present
  (`xvfb-run` and `Xvfb` are absent from this host; `Xwayland` and
  `xwayland-satellite` are installed but require a Wayland compositor, and the
  owner's live compositor is out of bounds for this campaign).
- The dev profile matters for elapsed times only; no scope, redaction, spool, or
  signature path under test is profile-gated.

## Isolation and safety

Every command ran with `XDG_RUNTIME_DIR`, `XDG_STATE_HOME`, `XDG_CONFIG_HOME`,
`XDG_DATA_HOME`, and `HOME` pointed at a per-cell scratch root under the
campaign directory, through `env -i`, so no campaign process inherited the
owner's environment or addressed the owner's endpoint:

- the owner's live `bitty` instance (`pid 7829` on this host) was never started,
  connected to, signalled, or reconfigured. No campaign socket path collided
  with its socket: the campaign set `BITTY_SOCKET` into its own scratch
  directory for every instance it started, and the harness bound only paths it
  created;
- each campaign instance is named by a recorded pid, and every stop was
  `kill -TERM` on that pid: `709695`, `709737`, and `709773` for the three
  served cases in this record, and `692010`, `692979`, `693458`, `701266`,
  `701307`, `701341`, `702345` for calibration runs that an earlier draft of
  the same cells produced. Every one was re-checked absent with `kill -0` and
  with `ps` after the campaign;
- no signal was sent by name or pattern, no `pkill`/`killall` ran, and no
  process outside the campaign was signalled;
- no `sudo`, no system-wide change, no TCP or UDP port, and no socket outside
  the scratch roots; `ss -tlpn` shows no TCP listener for any campaign pid;
- no `rm -rf` ran. The only deletions are `rm -f` of the campaign's own stale
  socket file inside its own scratch directory, and `git archive` extraction
  into a fresh directory;
- the campaign used no browser, no GUI session, and no compositor. The
  `bitty --test-mode` path creates no window, which is why it is the instrument
  for the product endpoint.

Transcript paths are written `<scratch>/<cell>/…`. Scratch roots are
campaign-internal and deliberately not published.

## The cells

| Cell                       | Construction                                                                                                  | Command                               | Observation                                                                                      | Verdict  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ | -------- |
| `A1` connect-only          | Product endpoint, no `BITTY_CTL_ELEVATE`; three scope-class verbs over the wire                               | campaign client `probe`               | `testInfo` OK; inspect, trace, and control each `scope`/`ScopeDenied`; server counted `denied=3` | observed |
| `A2` + `debug.trace`       | Product endpoint, `BITTY_CTL_ELEVATE=debug.trace`                                                             | campaign client `probe`               | `startTrace` OK; `suspendHandler` `scope`/`ScopeDenied`; inspect gate passed (`capability`)      | observed |
| `A3` + `debug.control`     | Product endpoint, `BITTY_CTL_ELEVATE=debug.control`                                                           | campaign client `probe`               | `startTrace` OK; `suspendHandler` past the gate, `usage`/`InvalidParams`: `requires pluginId`    | observed |
| `A4` campaign-served       | Campaign servo on a `0600` socket: four grants by three verbs                                                 | `devtools-live matrix`                | same matrix, 12 requests, `denied` `3/3/2/2`, `framing_errors=0`                                 | observed |
| `B1` preview equals export | Two-page trace; page 0 and page 1 previews re-derived client-side from the served page bytes                  | `devtools-live trace`                 | `preview == redact(served page prefix)` true for both pages                                      | observed |
| `B2` seeded secret         | `GITHUB_TOKEN` and `password` seeds in one event payload                                                      | same run                              | export line carries `[redacted]`; neither seed appears in preview or spool                       | observed |
| `B3` spool mode            | `stopTrace` writes the export                                                                                 | same run                              | file `0600`, directory `0700`, 313 132 bytes, byte-identical to the paged export                 | observed |
| `B4` input off by default  | One `kind: "input"` marker appended with `includeInput: false`                                                | same run                              | not retained, `dropCount: 1`, no input line in the export                                        | observed |
| `C1` exit diagnostics      | Shipped binary, no display server, two seeded secrets in the environment                                      | `env -i … bitty`                      | `exit-report.log` `0600` in `0700`; `reason=display-fallback`; no seeded value                   | observed |
| `C2` panic crash slot      | Needs the panic hook armed plus a panic after `crash_report::install()`                                       | —                                     | **not run**: no display server, no fault-injection seam, signals cannot produce the slot         | not run  |
| `C3` crash-slot unit tests | The crate's own `crash_report` tests at `04253d4c`, which exercise the same `write_slot` the panic hook calls | `cargo test --bin bitty crash_report` | `10 passed; 0 failed` (mode, bounds, symlink, home-prefix, atomic replace)                       | observed |

## Cell A — the live endpoint and the scope matrix

### A1–A3 — the product's own endpoint

`bitty --test-mode` starts the real `Runtime` and the real `BITTY_SOCKET` servo
without a window, and serves the accepted `bitty.debug/*` surface with
`ScopeSet::cli_default()` plus the explicit `BITTY_CTL_ELEVATE` allowlist
(`crates/bitty-terminal/src/test_mode.rs`). The endpoint is therefore the
product's, not the campaign's: the campaign only connects to it.

```sh
$ env -i PATH=/usr/bin:/bin HOME=<scratch>/g2-none/home \
    XDG_RUNTIME_DIR=<scratch>/g2-none/run XDG_STATE_HOME=<scratch>/g2-none/state \
    XDG_CONFIG_HOME=<scratch>/g2-none/config XDG_DATA_HOME=<scratch>/g2-none/data \
    SHELL=/bin/sh TERM=xterm-256color BITTY_SOCKET=<scratch>/g2-none/dev.sock \
    bitty --test-mode &
bitty_pid=709695
$ ss -xlp | grep dev.sock
u_str LISTEN 0 4096  <scratch>/g2-none/dev.sock 4109673 * 0 users:(("bitty",pid=709695,fd=7))
$ ss -tlpn | grep "pid=709695,"
(no TCP listener for bitty_pid=709695)
socket <scratch>/g2-none/dev.sock mode=600 uid=1000
socket dir <scratch>/g2-none mode=700

# client, no BITTY_CTL_ELEVATE: merely connected
probe[g2-none] verb=bitty.debug/testInfo      -> OK {"test_mode":true,"surface":"e2e","protocol":"1.0","instance":"default"}
probe[g2-none] verb=bitty.debug/listPlugins   -> ERROR category=scope code=ScopeDenied
      message=permission denied: scope 'debug.inspect' denied for bitty.debug/listPlugins (needs elevation)
probe[g2-none] verb=bitty.debug/startTrace    -> ERROR category=scope code=ScopeDenied
      message=permission denied: scope 'debug.trace' denied for bitty.debug/startTrace (needs elevation)
probe[g2-none] verb=bitty.debug/suspendHandler-> ERROR category=scope code=ScopeDenied
      message=permission denied: scope 'debug.control' denied for bitty.debug/suspendHandler (needs elevation)
probe rc=0
# instance-side accounting, from its own stderr:
bitty: test-mode ready socket=<scratch>/g2-none/dev.sock
bitty: ipc connection closed (requests=4 denied=3 framing_errors=0)
```

The same four requests against the same binary with one scope elevated:

```sh
$ … BITTY_CTL_ELEVATE=debug.trace bitty --test-mode &
bitty_pid=709737
probe[g2-trace] verb=bitty.debug/testInfo       -> OK {"test_mode":true,…}
probe[g2-trace] verb=bitty.debug/listPlugins    -> ERROR category=capability
      code=PluginRuntimeUnavailable message=bitty.debug/listPlugins: plugin runtime not attached to this IPC server slice
probe[g2-trace] verb=bitty.debug/startTrace     -> OK {"traceId":"trace-1","chunkBytes":262144,"startMs":282,…}
probe[g2-trace] verb=bitty.debug/suspendHandler -> ERROR category=scope code=ScopeDenied
      message=permission denied: scope 'debug.control' denied for bitty.debug/suspendHandler
bitty: ipc connection closed (requests=4 denied=2 framing_errors=0)

$ … BITTY_CTL_ELEVATE=debug.control bitty --test-mode &
bitty_pid=709773
probe[g2-control] verb=bitty.debug/listPlugins    -> ERROR category=capability code=PluginRuntimeUnavailable
probe[g2-control] verb=bitty.debug/startTrace     -> OK {"traceId":"trace-1",…}
probe[g2-control] verb=bitty.debug/suspendHandler -> ERROR category=usage code=InvalidParams
      message=suspendHandler requires pluginId
bitty: ipc connection closed (requests=4 denied=2 framing_errors=0)
stopped pid=709773 alive_now=no
```

Three readings of that transcript:

- **connection alone grants nothing.** All three scope classes answer
  `scope`/`ScopeDenied` for a client that has only connected, and the served
  process's own counter agrees (`denied=3`). This is `P0-AC-025`'s pass
  threshold, observed on the product endpoint.
- **`debug.control` is separately required.** A connection holding
  `debug.trace` still gets `scope`/`ScopeDenied` for `suspendHandler`, and only
  `debug.control` moves it past the gate — where it fails parameter validation
  (`suspendHandler requires pluginId`) because no plugin host is attached to
  this slice. The gate, not the payload, is what this cell measures.
- **`debug.inspect` is not separately required**, and that is a finding; see
  [What the record does not show](#what-the-record-does-not-show).

`bitty.debug/listPlugins` answering `capability`/`PluginRuntimeUnavailable`
under any debug scope is the expected reply of a slice with no plugin runtime
attached (`crates/bitty-ipc-devtools/src/devtools/plugin_runtime.rs`), and it is
distinguishable from `scope`/`ScopeDenied` by code, which is what makes it
usable as the "gate passed" signal here.

### A4 — a campaign-served endpoint, as a cross-check

A servo built from the pinned `bitty-ipc` tree binds its own `0600` socket,
attests it, binds the accepted-stream peer proof, and serves the same dispatcher
through `serve_bound_connection`; the client performs the pre-connect and
post-connect endpoint attestation the shipped client performs. This is the
instrument the 2026-11-16 record lacked, and it is disclosed as a campaign
instrument: it is not a product surface, not in any repository, and not a second
implementation of the daemon.

```sh
$ env -i … devtools-live matrix <scratch>/f1
conn[connect-only]   grant=[no debug scope]  verb=…/listPlugins    -> ERROR category=scope code=ScopeDenied
conn[connect-only]   grant=[no debug scope]  verb=…/startTrace     -> ERROR category=scope code=ScopeDenied
conn[connect-only]   grant=[no debug scope]  verb=…/suspendHandler -> ERROR category=scope code=ScopeDenied
conn[connect-only]   server stats: requests=3 responses=3 denied=3 framing_errors=0
conn[+debug.inspect] grant=[DebugInspect]    verb=…/listPlugins    -> ERROR category=capability code=PluginRuntimeUnavailable
conn[+debug.inspect] grant=[DebugInspect]    verb=…/startTrace     -> ERROR category=scope code=ScopeDenied
conn[+debug.inspect] grant=[DebugInspect]    verb=…/suspendHandler -> ERROR category=scope code=ScopeDenied
conn[+debug.inspect] server stats: requests=3 responses=3 denied=3 framing_errors=0
conn[+debug.trace]   grant=[DebugTrace]      verb=…/listPlugins    -> ERROR category=capability code=PluginRuntimeUnavailable
conn[+debug.trace]   grant=[DebugTrace]      verb=…/startTrace     -> OK {"traceId":"trace-1","chunkBytes":262144,…}
conn[+debug.trace]   grant=[DebugTrace]      verb=…/suspendHandler -> ERROR category=scope code=ScopeDenied
conn[+debug.trace]   server stats: requests=3 responses=3 denied=2 framing_errors=0
conn[+debug.control] grant=[DebugControl]    verb=…/listPlugins    -> ERROR category=capability code=PluginRuntimeUnavailable
conn[+debug.control] grant=[DebugControl]    verb=…/startTrace     -> OK {"traceId":"trace-2",…}
conn[+debug.control] grant=[DebugControl]    verb=…/suspendHandler -> ERROR category=usage code=InvalidParams
conn[+debug.control] server stats: requests=3 responses=3 denied=2 framing_errors=0
```

Twelve wire cells, ten denials, zero framing errors, and the same shape as the
product endpoint. Two independent servos agreeing is what makes the matrix
attributable to the protocol rather than to one harness's authority
construction: in A1–A3 the grant set comes from the product's own
`BITTY_CTL_ELEVATE` parsing, and in A4 from the campaign's explicit
`ControlAuthority::open_connection` calls.

## Cell B — trace export, preview, seed, and mode

One trace with a secret-shaped event first (so the bounded preview window
covers it), forty bounded instrumentation events, and one input marker, driven
over the same live socket and through the same handlers a served client reaches.

```sh
$ … devtools-live trace <scratch>/f1
spool dir (campaign-set through the servo seam): <scratch>/f1/sp
startTrace -> OK {"traceId":"trace-1","spoolPath":"<scratch>/f1/sp/trace-1.jsonl","chunkBytes":262144,…}
append secret-shaped event retained=true
append input marker without includeInput retained=None
fetchTraceChunk offset=0 -> page_bytes=258350 continuation=true preview_bytes=512
preview == redact(served page prefix): true
preview carries no seeded token/password: token=true password=true redacted_marker=true
fetchTraceChunk offset=258350 -> page_bytes=54782 continuation=false preview_bytes=512
preview page 1 == redact(served page prefix): true carries redaction marker: false
      carries seeded token/password: token=true password=true
stopTrace -> OK {"traceId":"trace-1","byteCount":313132,"dropCount":1,"previews":["{\"seq\":0,…\"payload\":\"[redacted]\"…]",…
server stats: requests=4 responses=4 denied=0 framing_errors=0
paged export bytes (client view) = 313132
stopTrace byteCount = Some(313132), dropCount = Some(1), spoolMode = Some("0600")
stopTrace preview array length = 2
spool file <scratch>/f1/sp/trace-1.jsonl mode=600 bytes=313132
spool bytes == paged export bytes: true
spool carries seeded token/password: token=false password=false
spool carries redaction marker: true occurrences=1
spool carries any input marker line: false
spool line count = 41
spool redacted line = {"seq":0,"owner":"campaign","kind":"bitty.panel:env","payload":"[redacted]","generation":7,"wallClockMs":2000}
spool dir mode=700
```

What each line answers for `P0-AC-026`:

- **preview equals export, byte for byte.** The client re-derived both page
  previews from the served page bytes with `redact_trace_preview` and compared
  them to the `preview` field: both true. The served page bytes themselves are
  byte-identical to the spool export
  (`spool bytes == paged export bytes: true`, 313 132 bytes either way), so
  "export previews show exactly what will be uploaded" holds against the bytes
  that exist. There is no uploader in this code at this revision, so the
  upload half of that clause has nothing to observe.
- **the preview window is bounded.** 512 bytes per page
  (`TRACE_PREVIEW_BYTES`), which is why page 1 reports no redaction marker: its
  prefix is ordinary instrumentation. The secret sits on page 0, whose preview
  does carry `[redacted]`.
- **a seeded secret never reaches an output.** The event payload carried
  `GITHUB_TOKEN` and `password` seeds; the retained line is `[redacted]` and
  neither seed appears in the preview fields or in the 313 132-byte export.
- **files are user-only.** The spool file is `0600` and the directory `0700`,
  both asserted from `stat` after the run, matching the `spoolMode: "0600"` the
  handler reports.
- **input recording is off by default.** A `kind: "input"` event appended with
  `includeInput: false` was not retained (`retained=None`), the run records one
  counted drop, and the export holds no input line. The 41 lines are the secret
  event plus forty instrumentation events.

The producer hook (`append_trace_event`) is called by the campaign rather than
by a panel, because a test-mode instance with no panels emits no instrumentation
of its own; it is the documented cold-path entry the runtime uses, and the
bounded admission, redaction, chunking, paging, and spool paths it feeds are all
exercised over the wire.

## Cell C — crash and exit diagnostics

`crates/bitty-terminal/src/crash_report.rs` installs a panic hook and writes two
bounded `0600` slots under the XDG state directory. The shipped binary writes
the exit slot on every explicit exit path, and the panic hook overwrites the
crash slot on a panic. Both paths were attempted; one produced an artifact.

### C1 — the exit slot, produced

```sh
$ env -i PATH=/usr/bin:/bin HOME=<scratch>/crash-final/home \
    XDG_RUNTIME_DIR=<scratch>/crash-final/run XDG_STATE_HOME=<scratch>/crash-final/state \
    XDG_CONFIG_HOME=<scratch>/crash-final/config XDG_DATA_HOME=<scratch>/crash-final/data \
    GITHUB_TOKEN=ghp_seedDEADBEEF0123456789abcdef \
    AWS_SECRET_ACCESS_KEY=seedAWSsecretvalue TERM=xterm-256color \
    bitty
bitty: ipc disabled (fail-soft): socket path unavailable: invalid request: socket base dir too long
  for AF_UNIX (114 > 100 payload bytes even with hashed instance …) (set XDG_RUNTIME_DIR or BITTY_SOCKET)
bitty: no usable display server (os error at vendor/winit/src/platform_impl/linux/mod.rs:765:
  neither WAYLAND_DISPLAY nor WAYLAND_SOCKET nor DISPLAY is set.) — falling back to headless smoke (CI path)
bitty headless smoke: ok — tick presented (frame=1, fills=23, glyphs=21, headless=true, generation=31)
bitty rc=0
$ stat -c '%a %s %n' <scratch>/crash-final/state/bitty/exit-report.log
600 551 <scratch>/crash-final/state/bitty/exit-report.log
$ stat -c '%a %n' <scratch>/crash-final/state/bitty
700 <scratch>/crash-final/state/bitty
$ cat <scratch>/crash-final/state/bitty/exit-report.log
bitty: exit reason=display-fallback phase=startup lifecycle=startup surface=last=none
  configure_ok=0 configure_err=0 acquire_ok=0 … present_unconfirmed=0
$ grep -c 'ghp_seedDEADBEEF\|seedAWSsecretvalue' <scratch>/crash-final/state/bitty/exit-report.log
0
```

The slot is `0600` in a `0700` directory, 551 bytes, names its exit reason and
phase, and carries no environment value at all — including the two seeded
secrets. That is the "files carry user-only permissions" and "raw environment
data absent by default" half of `P0-AC-026` for the diagnostics slot, from the
real producer.

The `ipc disabled (fail-soft)` line is a second real observation from the same
run: `BITTY_SOCKET` resolution enforces a 100-byte payload bound
(`MAX_SOCKET_PATH_BYTES`), a too-long runtime directory disables the servo with
one stderr line instead of failing the process, and the run continues. The bound
is why the campaign's scratch paths are kept short.

### C2 — the panic crash slot, not run

**Not run.** The reasons are specific and none of them is "the campaign ran out
of time":

- the hook is installed at `crates/bitty-terminal/src/main.rs:1596`, on the
  interactive path only. `--headless` returns before it, and `--test-mode`
  exits earlier still, so neither of the two display-free entry points arms the
  hook;
- reaching that line needs `App::run`, which needs a window backend. This host
  has no X server (`xvfb-run` and `Xvfb` are absent), and the only compositor is
  the owner's live session, which the campaign's host rules place out of bounds.
  Even with a display, no campaign can inject a panic into the shipped binary:
  the code offers no fault-injection switch, flag, or environment variable, and
  the `debug_assert!` at `main.rs:470` is compiled out of the release posture;
- a signal cannot produce the slot, by design: the crate is
  `#![forbid(unsafe_code)]` and installs no async-signal-safe handler, so a
  `SIGSEGV` or `SIGTERM` leaves only the last exit line. Running the binary under
  a tiny stack to force an abort produces a stack-overflow abort, which is
  likewise not a panic and does not reach the hook.

So the crash _report_ is `NOT EXERCISED` in this record. What the record does
show is that the write path the hook uses is intact at this revision (C3).

### C3 — the write path, executed

The module's own tests at `04253d4c` drive the same `write_slot` the panic hook
calls, including the mode, bound, symlink, and atomic-replace assertions:

```sh
$ cargo test -p bitty-terminal --bin bitty crash_report
running 10 tests
test crash_report::tests::backtrace_source_paths_keep_only_the_file_name ... ok
test crash_report::tests::lifecycle_round_trips_and_names_are_stable ... ok
test crash_report::tests::exit_reasons_are_stable_and_bounded ... ok
test crash_report::tests::phase_and_lifecycle_marks_are_visible ... ok
test crash_report::tests::opt_out_switch_defaults_to_enabled ... ok
test crash_report::tests::write_slot_does_not_follow_a_stale_temp_symlink ... ok
test crash_report::tests::write_slot_replaces_atomically_and_is_user_only ... ok
test crash_report::tests::crash_report_redacts_the_home_prefix ... ok
test crash_report::tests::crash_report_is_bounded_and_names_phase_and_surface ... ok
test crash_report::tests::write_slot_stays_bounded_after_redaction ... ok
test result: ok. 10 passed; 0 failed; 0 ignored; 0 measured; 1659 filtered out
```

This is a test run, not a producer run, and the record labels it as such: it
supports the claim that `write_slot` enforces `0600`/`0700` and bounded redaction
at this revision, and it does not turn C2 into an observation.

## What the record does not show

**Finding — the inspect gate is a hierarchy, not three independent gates.**
`P0-AC-025` reads "each is denied until separately granted". Observed against
the product endpoint, `debug.trace` alone is enough to pass the `debug.inspect`
gate: with `BITTY_CTL_ELEVATE=debug.trace`, `bitty.debug/listPlugins` answers
`capability`/`PluginRuntimeUnavailable` — the gate admitted the request and the
handler then reported its own missing runtime — where an unelevated connection
gets `scope`/`ScopeDenied`. `debug.control` passes both the inspect and the
trace gates for the same reason. The code says so deliberately:
`require_inspect_scope` accepts `DebugInspect`, `DebugTrace`, or `DebugControl`
("the accepted read surface: `debug.inspect` or the wider `debug.trace` /
`debug.control`", `crates/bitty-ipc-devtools/src/devtools/plugin_runtime.rs`).

Two things follow, and they are for the auditor, not for this record:

- the _denial_ half of AC-025 holds: a connection that has only connected is
  denied all three scope classes, and `debug.control` cannot be reached from
  `debug.trace`;
- the _distinctness_ half holds only one way. An inspect-only client cannot
  trace or control, but a trace client can inspect. If AC-025 means three
  independent grants, the gate and the criterion disagree, and one of them
  should be amended. This record does not choose; it records which direction is
  observed.

Other things this record does not establish:

- **the panic crash slot** (C2) and therefore the AC-026 phrase "crash reports"
  in its literal sense. The exit slot is a sibling artifact through the same
  writer, not the same producer;
- **the clipboard and opt-in input recording.** `includeInput: true` was not
  driven, and no headless clipboard surface exists to read;
- **any upload path.** "export previews show exactly what will be uploaded" is
  observed as preview-equals-export-bytes; no code at this revision uploads a
  trace, so nothing measured the upload itself;
- **the default spool root of a served instance.** The campaign pointed the
  spool at isolated storage through the servo seam
  (`set_trace_spool_dir_for_tests`, the documented startup hook). Without that
  call, `startTrace` reports `spoolPath` under the process temp root
  (`/tmp/bitty-traces/trace-1.jsonl`), which both served endpoints printed
  before the seam was set in the trace cell. The file mode stays `0600` and the
  leaf directory is created `0700`, so a co-tenant cannot read the export; but a
  co-tenant that pre-creates the parent could deny or displace it. Recorded as
  residual, not as a claim either way;
- **cleanup on `SIGTERM`.** Every stopped instance left its socket file behind
  (`socket_file=left`) after `kill -TERM`. That is consistent with the absent
  signal handling above and is noted without a severity claim;
- **the Windows named pipe, every non-Linux cell, and the second-uid peer
  check**;
- **any review verdict.** `F-10` names two auditor artifacts; this record is
  neither of them.

## Effect on the evidence matrix

The `R-014` row in [the evidence matrix](../evidence-matrix.md) said that after
the 2026-11-16 record "a live DevTools endpoint, trace export preview, and
crash reports remain unexercised". That sentence now names this record for the
first two and for the exit slot, and keeps the panic crash slot open.

Nothing else in the matrix moved:

- every status column is unchanged, including `Open` for `R-014` and
  `P0-AC-025`/`P0-AC-026` at Partially verified;
- no `P0-AC` criterion is marked Verified, because producing cells is not the
  review those criteria ask for;
- `F-10` still stands: `devtools-redaction-2026-xx` and
  `trace-minimization-2026-xx` remain absent, and this record is a dated run
  log, not either artifact.
