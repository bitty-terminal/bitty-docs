---
title: Native Component Boundary
description: Accepted direction DIR-030 for native capabilities as independently installed on-demand stdio coprocesses spawned verified and granted by Core
category: development
audience: contributor
document_type: policy
status: accepted
website_publish: true
sidebar_order: 24
---

# Native Component Boundary

> Status: **accepted direction (DIR-030)**, recorded from the owner decision
> of 2026-10-01 and refined by the accepted refinements D1 to D6 of
> 2026-10-02. This page fixes the process, install, and authority model for
> native components. It is not `Verified`, makes no shipped-behavior claim,
> and authorizes implementation only through scoped tasks in the owning
> repositories. The wire byte layout is owned by the `bitty-network-wire`
> crate in the [bitty-network](https://github.com/bitty-terminal/bitty-network)
> repository; this page summarizes it and does not redefine it.

## Purpose and scope

Bitty Core ships with zero network code and zero AI code. Some plugins still
need native capabilities that a terminal does not itself need — an HTTP
client, a model runtime. This page records how those capabilities exist
without entering the Core binary or the plugin sandbox:

- the native component model and its process lifecycle;
- the install layout, component descriptor, and resolution rules;
- the plugin dependency declaration;
- the authority split between Core and a component;
- a summary of wire protocol v1.

Out of scope: the HTTP backend behavior (owned by the bitty-network
repository), the Lua surface spelling (owned by the plugin corpus), the AI
host semantics (owned by the AI corpus), and package-manager registry
sources (follow-up).

## Normative sources

This direction must not weaken:

- the [security overview](../security/overview.md), the
  [threat model](../security/threat-model.md) trust levels (a component is the
  L3 native sidecar), and the [risk register](../security/risk-register.md);
- the rejection of native in-process plugins and of dynamic libraries for
  this boundary (no stable Rust ABI);
- the accepted capability grammar (`network.connect:HOST[:PORT]`) and the
  plugin manifest contracts in the plugin corpus;
- the external IPC socket (`bitty-ipc`, scopes `terminal.*`), which is
  unchanged: it stays the inbound path for external clients, while
  components are the outbound path.

## Decision

- A **native component** is a separate, single-purpose executable installed
  on demand and shared by every plugin that needs it: one copy on disk, one
  process per Bitty instance.
- The process model is a coprocess in the style of a Git remote helper or a
  language server: Core spawns the component on first use, talks over the
  child's stdin and stdout, and stops it when idle. It is not a socket
  daemon, not PATH discovery, and not a dynamically loaded library.
- Mechanism versus policy: Core is the policy authority (capability grants,
  consent, per-plugin attribution). The component only executes, and
  re-checks the grant it is handed as defense in depth. A component never
  widens a grant.
- The first component is `net` (executable `bitty-net`, built from the
  bitty-network repository). The AI host follows the same model later as
  component `ai` (executable `bitty-ai`).

### Accepted refinements (2026-10-02)

The owner accepted six refinements on 2026-10-02 after the review of the
Core broker slice. They are part of this direction; the sections below state
each rule where it applies, and the Core constants are named here once.

| ID  | Refinement                     | Rule                                                                                                                                                                                                                                                                                                                          | Core constants                                                                                                                                                          |
| --- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Windows environment            | On Windows only, Core also forwards `SystemRoot`, which Winsock initialization requires. `windir` is not forwarded, and `PATH` is still never forwarded.                                                                                                                                                                      | `COMPONENT_ENV_WINDOWS_ALLOWLIST` = `["SystemRoot"]`                                                                                                                    |
| D2  | Core-side request deadline     | Every request has a Core deadline of min(requested timeout, or the default when none is requested; the ceiling) plus a grace period. On expiry Core fails the request with `timeout` and sends `Cancel`. Three consecutive deadline expiries on one component count as one crash.                                             | `COMPONENT_REQUEST_DEFAULT_TIMEOUT` = 30 s, `COMPONENT_REQUEST_MAX_TIMEOUT` = 300 s, `COMPONENT_REQUEST_DEADLINE_GRACE` = 5 s, `COMPONENT_DEADLINE_CRASH_THRESHOLD` = 3 |
| D3  | Response body budget ceiling   | A requested `max_body_bytes` is clamped to the ceiling; the default stays 8 MiB.                                                                                                                                                                                                                                              | `COMPONENT_MAX_BODY_BYTES_CEILING` = 64 MiB                                                                                                                             |
| D4  | stderr logging                 | On a crash, a handshake failure, or an idle stop, Core logs the last bounded tail of the stderr ring at warn level, with control characters escaped. stderr is not logged otherwise.                                                                                                                                          | `COMPONENT_STDERR_LOG_TAIL_BYTES` = 4 KiB                                                                                                                               |
| D5  | Streamed digest                | Verification of the executable streams the SHA-256 digest through a fixed buffer and never loads the whole file into memory.                                                                                                                                                                                                  | `COMPONENT_DIGEST_BUFFER_BYTES` = 64 KiB                                                                                                                                |
| D6  | Component install sources (v1) | Local path only, through `bitty component add`, `list`, `remove`, and `clean`; `bitty plugin add` resolves the plugin's `[components]` table and fails with a diagnostic naming `bitty component add` when a component is missing or incompatible. No automatic download in v1; a registry or download source is a follow-up. | none                                                                                                                                                                    |

D2 details: Core forwards the effective timeout (the clamped value, before
grace) as the wire `timeout_ms`, so the component's own deadline expires
first in the normal case. A frame that arrives for a request after its Core
deadline has expired is discarded and is not a protocol error. The
consecutive-expiry counter is per component and resets when any request on
that component ends with a component-produced terminal frame; reaching the
threshold triggers the crash path (every in-flight request fails with
`component_lost`, then backoff) and resets the counter.

## Install layout and resolution

Core never reads `PATH` to find a component.

- Root: `$XDG_DATA_HOME/bitty/components/`, or the platform equivalent of the
  data directory, resolved by the same resolver as `plugins/`.
- Each installed version lives at `<root>/<name>/<version>/` and holds
  `bitty-component.toml` plus the executable `bitty-<name>`
  (`bitty-<name>.exe` on Windows).
- `<root>/<name>/current` is a plain text file holding the active version.
- Developer-only override: the environment variable `BITTY_COMPONENTS_DIR`
  replaces the root. It exists for tests and is not a user configuration
  surface.

The component descriptor `bitty-component.toml` (v1):

```toml
[component]
name = "net"            # [a-z][a-z0-9-]{0,31}
version = "0.0.1"       # semver
protocol = [1, 1]       # supported wire protocol min,max
executable = "bitty-net"
sha256 = "<64 lowercase hex>"   # digest of the executable
```

Before every spawn Core verifies the name, the version, the executable name
(no path separators), and the SHA-256 digest of the executable. The digest
is streamed through a fixed buffer (D5); the whole executable is never read
into memory. Any mismatch fails closed with a diagnostic.

### Component commands (v1, D6)

Installation executes no component code; every command works on files only.

| Command                                     | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bitty component add <dir-or-executable>`   | Local path source. A directory holds a source `bitty-component.toml` (name, version, protocol, executable) and the executable; a bare executable named `bitty-<name>` takes its version from a required `--version <semver>` flag and the protocol range Core supports. The command computes the digest, copies the executable into `<root>/<name>/<version>/`, writes `bitty-component.toml` with the computed `sha256` and `current` naming the added version. A source descriptor that carries a `sha256` must match the computed digest. Re-adding an installed version with a different digest fails. |
| `bitty component list`                      | Lists every installed component and version, marks the version named by `current`, and reports components no installed plugin requires as unused.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `bitty component remove <name> [<version>]` | Removes one version, or every version when none is named; removing the version named by `current` also removes `current`. Refuses while an installed plugin's requirement would become unmet, naming those plugins.                                                                                                                                                                                                                                                                                                                                                                                        |
| `bitty component clean`                     | Removes every version not referenced by `current`, and every component that no installed plugin requires.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

Registry and download sources are a follow-up; v1 never downloads a
component.

## Plugin dependency declaration

A plugin declares the components it needs in its manifest:

```toml
[components]
net = "^0.0.1"
```

Requirements use semver caret matching with Cargo semantics: `^0.0.1` admits
exactly `0.0.1`, and `^0.1` admits `>=0.1.0, <0.2.0`. A requirement is met
when the version named by `<root>/<name>/current` satisfies it.

`bitty plugin add` resolves the plugin's `[components]` table before
activation. A missing or incompatible component makes the install fail with
a diagnostic naming the component, the requirement, and the
`bitty component add` command to run (D6); there is no automatic download in
v1. At runtime, an unmet requirement makes the capability unavailable, never
ambient. Uninstall never cascades automatically: when the last dependent
plugin is removed, `bitty component list` reports the component as unused
and `bitty component clean` or `remove` deletes it on explicit request.

The plugin-facing Lua request surface over the `net` component is the
[bitty.net Lua Request Surface (Candidate)](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/net-request-surface-candidate.md)
in the plugin corpus (draft candidate, not implemented).

## Process lifecycle

| Aspect      | Rule                                                                                                                                                                                                                                                                                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spawn       | On first request; one process per Bitty instance per component.                                                                                                                                                                                                                                                                                       |
| Handshake   | The `Hello`/`HelloAck` exchange must complete within `COMPONENT_HANDSHAKE_TIMEOUT` = 5 s of spawn; a timed-out handshake is treated as a crash and follows the crash/restart rule below.                                                                                                                                                              |
| Environment | Cleared, then an allowlist only: `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY` (and lowercase variants), `SSL_CERT_FILE`, `SSL_CERT_DIR`, `LANG`, `LC_ALL`; on Windows only, also `SystemRoot` (D1, `COMPONENT_ENV_WINDOWS_ALLOWLIST`). `windir` is not forwarded, and `PATH` is never forwarded for `net`.                                                 |
| Working dir | The component's version directory.                                                                                                                                                                                                                                                                                                                    |
| stderr      | Captured into a bounded ring (`COMPONENT_STDERR_MAX_BYTES` = 64 KiB). On a crash, a handshake failure, or an idle stop, Core logs the last `COMPONENT_STDERR_LOG_TAIL_BYTES` of the ring at warn level with control characters escaped (D4); stderr is not logged otherwise.                                                                          |
| Requests    | Each request carries a Core deadline (D2): min(requested timeout or `COMPONENT_REQUEST_DEFAULT_TIMEOUT`, `COMPONENT_REQUEST_MAX_TIMEOUT`) plus `COMPONENT_REQUEST_DEADLINE_GRACE`. On expiry Core fails the request with `timeout` and sends `Cancel`; `COMPONENT_DEADLINE_CRASH_THRESHOLD` consecutive expiries on one component count as one crash. |
| Idle stop   | Core closes stdin after `COMPONENT_IDLE_TIMEOUT` = 60 s with nothing in flight; the component exits on stdin EOF. Shutdown grace is 2 s, then Core kills only the PID it recorded at spawn.                                                                                                                                                           |
| Crash       | Every in-flight request completes with error `component_lost`; restart with backoff from 1 s doubling to 30 s; after 5 crashes in 5 minutes the component is unavailable until the next Bitty start.                                                                                                                                                  |

Process sandboxing (Linux landlock and seccomp, the macOS sandbox, a Windows
restricted token) is an accepted direction but a follow-up task, not part of
the first slice.

## Wire protocol v1 summary

The codec is the `bitty-network-wire` crate: hand-written, no serde,
`#![forbid(unsafe_code)]`, no panics, every length bounded, decode fails
closed. It carries no TLS material. Core links this codec only, never a
network implementation crate.

- Framing: a u32 big-endian length prefix plus payload, bounded by
  `MAX_FRAME_BYTES` = 256 KiB (the same bound as `bitty-ipc`). The payload is
  a 1-byte message tag followed by fixed-width big-endian integers and
  length-prefixed strings (UTF-8 validated) or bytes.
- Messages: a `Hello`/`HelloAck` handshake negotiating the protocol version;
  `HttpRequest` with a request id, the attributed plugin id, the grant,
  method, URL, headers, timeout, and response body budget; streamed
  `RequestBody`/`ResponseBody` chunks; `ResponseHead`; typed `Error` (kinds
  `denied`, `offline`, `timeout`, `budget`, `tls`, `protocol`,
  `component_lost`, `internal`); `Cancel`; and `Shutdown`. A tag range is
  reserved for WebSocket messages.
- The grant on each request is a host list with optional ports and an
  optional method set, mapping onto the bitty-network API capability type.
- Limits: 64 requests in flight, 64 headers and 16 KiB of header bytes, 8 KiB
  URL, at most 192 KiB of body data per frame, and a response body bounded by
  the request budget (default 8 MiB, clamped by Core to
  `COMPONENT_MAX_BODY_BYTES_CEILING` = 64 MiB per D3).
- The handshake completes before any other message. An unknown tag or a
  version outside the negotiated range is a protocol error and closes the
  stream.

Tag values and field order are authoritative only in the bitty-network
repository specification.

## Core and consumer responsibilities

- Core (bitty repository): the component broker resolves and verifies the
  component, spawns it, completes the handshake, multiplexes requests by id,
  stops it when idle, handles crashes, computes the per-plugin grant from the
  granted `network.connect:*` capabilities intersected with the manifest
  `[[network.egress]]` declarations, and attributes every request to its
  plugin. The broker (`bitty_runtime::component`) is implemented in `bitty`
  ([bitty#1604](https://github.com/bitty-terminal/bitty/pull/1604)); it is
  `Implemented`-only and not yet `Verified`, and it predates the
  refinements: the Windows `SystemRoot` forwarding (D1), the Core request
  deadline (D2), the body budget ceiling (D3), stderr tail logging (D4), and
  the streamed digest (D5) are not implemented yet. The Lua request surface,
  the component commands (D6), sandboxing, registry install, and the
  terminal composition-root instance that wires the broker into
  `bitty-terminal` remain deferred follow-ups. The embedded network path (an
  optional Cargo feature and a Lua network binding linked into Core) is
  removed.
- The Lua surface (a request handle plus a response event, never blocking a
  callback) depends on the application event loop. Its candidate spelling is
  the
  [bitty.net Lua Request Surface (Candidate)](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/net-request-surface-candidate.md):
  `bitty.net.request(opts)` returns an integer request id, results arrive as
  `net.response`, `net.body`, `net.done`, and `net.error` events, and the
  surface is not implemented.
- AI: the AI host becomes component `ai`. It may link network crates
  in-process, but only under a Core-issued network capability grant that it
  never widens. This resolves the process and distribution half of OQ-081
  (an independently installed component plus a Lua front-end plugin); the
  neutral external-harness skeleton half stays open.

## Security review

- Trust level: a component is the L3 native sidecar of the
  [threat model](../security/threat-model.md). It is out of process, so a
  component defect cannot corrupt Core memory.
- Integrity: the digest check before every spawn binds the executable to its
  descriptor. It detects tampering after install; it is not a signature and
  does not establish publisher identity. Publisher trust for registry
  installs stays with the package integrity contracts.
- No ambient discovery: Core never consults `PATH`, and the cleared
  environment keeps unrelated secrets out of the child.
- Authority: the grant is computed by Core and attached to each request; the
  component re-checks it and never widens it. A compromised component is
  still an unsandboxed native process until the sandboxing follow-up lands;
  this residual risk is accepted for the first slice and tracked by that
  follow-up.
- Resource exhaustion: frame, header, URL, chunk, body, in-flight, and stderr
  bounds are fixed; the response budget is clamped to a ceiling (D3); every
  request has a Core deadline, so a silent component cannot pin in-flight
  slots, and repeated expiry feeds the crash path (D2); digest verification
  uses a fixed buffer (D5); crash restarts are rate-limited and end in a
  fail-closed unavailable state.
- Environment: the Windows-only `SystemRoot` addition (D1) carries the system
  directory path, not a secret; `windir` and `PATH` stay excluded.
- Diagnostics: logged stderr is bounded to a short tail and escaped (D4), so
  a component cannot inject terminal control sequences into logs; it may
  still contain whatever the component wrote, so components must not print
  secrets to stderr.
- Process safety: Core kills only the PID it recorded at spawn.

## Verification

- Documentation: `just check` passes for this repository.
- Implementation evidence: the Core broker slice
  (`bitty_runtime::component`) is `Implemented` in the bitty repository
  ([bitty#1604](https://github.com/bitty-terminal/bitty/pull/1604)); it is
  not yet `Verified`. Codec property and fuzz tests in the bitty-network
  repository, and broker tests for digest mismatch, missing component, crash
  backoff, idle stop, and grant intersection in the bitty repository, remain
  required before any status beyond `Implemented`.
- Refinement evidence still required in the bitty repository: a Windows
  spawn test that observes `SystemRoot` and no `windir` or `PATH` (D1); a
  silent test component whose requests fail with `timeout` at the Core
  deadline, plus the three-expiry crash count (D2); clamping of an oversized
  `max_body_bytes` (D3); a warn-level log of an escaped, bounded stderr tail
  on crash, handshake failure, and idle stop, and no log otherwise (D4); a
  digest test that bounds memory independently of executable size (D5); and
  `bitty component` and `bitty plugin add` resolution tests (D6).

## Open points

- Process sandboxing per platform is a follow-up task.
- Registry and download install sources for components are a follow-up;
  local-path install through the D6 component commands comes first.
- WebSocket messages occupy a reserved tag range and are not specified yet.
- Cross-instance sharing is not provided: each Bitty instance runs its own
  component process; a shared daemon is out of scope.
- The Lua request surface has a candidate specification in the plugin corpus
  but is not accepted or implemented; its acceptance depends on the plugin
  manifest contracts admitting `[components]` and `[[network.egress]]`. The
  Lua binding, the component commands, sandboxing, registry install, and the
  terminal composition-root instance that wires the broker into
  `bitty-terminal` are deferred follow-ups to the Core broker slice.

Closed on 2026-10-02: the Windows environment question (resolved by D1:
`SystemRoot` is forwarded on Windows, `windir` is not), the unspecified
handshake timeout (recorded in the lifecycle table), the missing Core
request deadline (D2), the unbounded response budget (D3), the unlogged
stderr ring (D4), and the whole-file digest read (D5).
