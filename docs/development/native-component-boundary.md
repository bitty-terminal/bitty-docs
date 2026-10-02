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
> of 2026-10-01. This page fixes the process, install, and authority model for
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
(no path separators), and the SHA-256 digest of the executable. Any mismatch
fails closed with a diagnostic.

## Plugin dependency declaration

A plugin declares the components it needs in its manifest:

```toml
[components]
net = "^0.0.1"
```

A missing or incompatible component makes the package manager refuse the
install with a diagnostic, or makes the capability unavailable at runtime.
Local-path installation is the first component source; registry
installation is a follow-up. Uninstall never cascades automatically: when the
last dependent plugin is removed, the manager reports the component as
unused.

## Process lifecycle

| Aspect      | Rule                                                                                                                                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Spawn       | On first request; one process per Bitty instance per component.                                                                                                                                      |
| Handshake   | The `Hello`/`HelloAck` exchange must complete within `COMPONENT_HANDSHAKE_TIMEOUT` = 5 s of spawn; a timed-out handshake is treated as a crash and follows the crash/restart rule below.             |
| Environment | Cleared, then an allowlist only: `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY` (and lowercase variants), `SSL_CERT_FILE`, `SSL_CERT_DIR`, `LANG`, `LC_ALL`. `PATH` is not forwarded for `net`.             |
| Working dir | The component's version directory.                                                                                                                                                                   |
| stderr      | Captured into a bounded ring (`COMPONENT_STDERR_MAX_BYTES` = 64 KiB) and logged.                                                                                                                     |
| Idle stop   | Core closes stdin after `COMPONENT_IDLE_TIMEOUT` = 60 s with nothing in flight; the component exits on stdin EOF. Shutdown grace is 2 s, then Core kills only the PID it recorded at spawn.          |
| Crash       | Every in-flight request completes with error `component_lost`; restart with backoff from 1 s doubling to 30 s; after 5 crashes in 5 minutes the component is unavailable until the next Bitty start. |

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
  the request budget (default 8 MiB).
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
  `Implemented`-only and not yet `Verified`. The Lua request surface,
  sandboxing, registry install, and the terminal composition-root instance
  that wires the broker into `bitty-terminal` remain deferred follow-ups. The
  embedded network path (an optional Cargo feature and a Lua network binding
  linked into Core) is removed.
- The Lua surface (a request handle plus a response event, never blocking a
  callback) depends on the application event loop and may land as a
  follow-up.
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
  bounds are fixed; crash restarts are rate-limited and end in a fail-closed
  unavailable state.
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

## Open points

- Process sandboxing per platform is a follow-up task.
- Registry install source for components is a follow-up; local-path install
  comes first.
- WebSocket messages occupy a reserved tag range and are not specified yet.
- Cross-instance sharing is not provided: each Bitty instance runs its own
  component process; a shared daemon is out of scope.
- The Lua request surface, sandboxing, registry install, and the terminal
  composition-root instance that wires the broker into `bitty-terminal` are
  deferred follow-ups to the Core broker slice.
- Windows: the environment allowlist in the Process lifecycle table may be
  insufficient for Winsock initialization. A proposed Windows-only addition
  would forward `SystemRoot` (and possibly `windir`) to the component
  process; this is pending a decision and not yet accepted.
