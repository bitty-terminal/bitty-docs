---
title: Threat Model
description: Defines Bitty assets, threat actors, trust boundaries, principal data flows, abuse cases, and required verification gates.
category: security
audience: security-reviewer
document_type: policy
status: normative
website_publish: true
sidebar_order: 31
---

# Threat Model

Status: pre-alpha security contract. Controls are requirements; mechanism
evidence exists in the `bitty` workspace but nothing is `Verified`, and no
statement here claims shipped, stable, or supported behavior.

## Scope

This model covers the future Bitty core, VT and graphics protocols, renderer
interfaces, PTY integration, Lua configuration and plugins, package management,
local IPC and remote control, MCP/Agent access, DevTools, traces, and platform
adapters. It covers local, SSH, container, and unknown terminal origins.

Registry operations, network-exposed daemons, WASM plugins, and enterprise
policy distribution remain future design areas, but their trust transitions
must not be precluded by P0 APIs.

## Assets

- integrity of Terminal Truth, input routing, and displayed presentation;
- confidentiality of terminal content, clipboard, filesystem, credentials,
  command history, environment data, and traces;
- availability of the UI, parser, renderer, PTY, and plugin runtime;
- integrity of configuration, plugin manifests, lockfiles, installed packages,
  and updates;
- authority exposed by process creation, network access, IPC, DevTools, and
  Agent operations;
- recoverability through safe mode, rollback, and deterministic state.

## Threat actors and failure sources

- a remote SSH host or container emitting crafted terminal sequences;
- a local process with access to the PTY or a same-user IPC endpoint;
- a malicious, compromised, abandoned, or typo-squatted plugin;
- a repository containing hostile project configuration or prompt injection;
- an over-privileged or compromised MCP/Agent/DevTools client;
- a compromised registry, publisher account, dependency, or build artifact;
- a buggy plugin or parser causing resource exhaustion without malicious intent;
- unsafe/FFI defects in platform, font, graphics, PTY, or Lua boundaries.

## Boundary map

```text
                          untrusted world
                                 |
          +----------------------+----------------------+
          |                      |                      |
       PTY bytes             Lua plugin           IPC / MCP
          |                      |                      |
    protocol limits        restricted VM          authentication
          |                 capabilities              scopes
          |                      |                      |
          +----------------------+----------------------+
                                 |
                             Bitty core
                                 |
                      reviewed host primitives
                                 |
              PTY / FS / GPU / clipboard / process
```

The origin `Unknown` uses the restrictive policy. Detection that a shell is
remote is advisory only and must never be the sole security boundary.

The trust levels, secret tiers, credential references, agent roles, and
panel lease below are accepted requirements, defined in full under
[Adopted trust and authorization models](#adopted-trust-and-authorization-models).
They narrow authority only and change no current boundary, policy, or P0
gate except by narrowing it.

## Adopted trust and authorization models

Status: accepted by owner ruling 2026-09-23; see [OQ-085, OQ-055, OQ-054,
OQ-057, and OQ-083](../decisions/open-questions.md). These models are
normative requirements on future enforcement points. Mechanisms exist in
the `bitty` workspace but nothing here is `Verified`, and no statement
claims shipped, stable, or supported behavior. Every model below narrows
authority only: none grants it, each check fails closed, and diagnostics
name levels, families, roles, or holders only — never values, prompts, or
payloads.

### Trust levels and capability-domain admission (OQ-085, SEC-21)

Plugin, helper, and tool boundaries sit at one of five trust levels —
0 Core, 1 bundled Lua, 2 third-party Lua, 3 native sidecar, 4 external
tools/MCP/network — where a lower number is more trusted. Ordering is
structural only and never grants authority. Each level admits a fixed set
of capability domains:

| Level | Boundary          | Admitted domains                                                                                             |
| ----- | ----------------- | ------------------------------------------------------------------------------------------------------------ |
| L0    | Core              | filesystem, network, process, clipboard, environment, credentials, terminal input, terminal output, IPC, GPU |
| L1    | Bundled Lua       | filesystem, network, process, clipboard, environment, terminal input, terminal output, IPC                   |
| L2    | Third-party Lua   | filesystem, clipboard, environment, terminal output, IPC                                                     |
| L3    | Native sidecar    | filesystem, terminal output, IPC                                                                             |
| L4    | External tool/MCP | none by default — acts only through an explicit per-invocation grant                                         |

Admission is enforced at the effective-authorization boundary before the
grant intersection: a capability family mapped to a domain the level does
not admit is denied fail-closed. Families the matrix does not cover pass
through to their grants, so the matrix never invents authority the
accepted capability grammar does not already name. Unknown levels or
domains deny rather than default. Native sidecars here are out-of-process
helpers; native in-process plugins stay rejected through P0 and P1.
Per [DIR-030](../decisions/index.md), native sidecars are realized as
native component coprocesses
([Native Component Boundary](../development/native-component-boundary.md)):
Core spawns the component, verifies its descriptor and executable digest
before every spawn, and issues the per-request grant; Core never resolves a
component through `PATH`, and a component never widens its grant.

#### History-read family admission (RFC-0004 draft, OQ-085)

The candidate history-read family maps to the `terminal output` domain:
reads of persisted terminal-derived content. It grants no `terminal input`,
process, filesystem, clipboard, or other domain authority, and a grant in
one domain never implies authority in another. Exact capability identifiers
stay parked to W-139 (SDK); this admission covers the family shape only and
authorizes no implementation. Acceptance requires independent security
review plus docs-curator approval per RFC-0004 acceptance evidence.

| Level | History-read family admission                                                                                                                                                                         | Rationale                                                                                                                                                                                                            |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L0    | Allowed — Core owns enforcement (grant gate, bound enforcement, redaction and truncation, typed denials).                                                                                             | L0 admits `terminal output`; Core is the enforcement point and no plugin grant confers Core authority.                                                                                                               |
| L1    | Allowed only with an explicit per-plugin, per-source grant recorded by Core; the query scope must intersect the grant scope; reads are bounded snapshots, redacted, truncated, and labeled untrusted. | L1 admits `terminal output`; deny-by-default is preserved and safe-mode, capture-disabled, scope-mismatch, and over-bound or over-rate requests deny fail-closed with a typed denial.                                |
| L2    | Allowed only with an explicit per-plugin, per-source grant recorded by Core; the query scope must intersect the grant scope; reads are bounded snapshots, redacted, truncated, and labeled untrusted. | L2 admits `terminal output` and is the primary consumer (search, copy-mode, and history plugins); no grant migrates from `terminal.*` in either direction and a newly requested family blocks updates per P0-AC-030. |
| L3    | Allowed only through an explicit per-request grant issued by Core to a verified native component coprocess; no standing grant exists.                                                                 | L3 admits `terminal output` at the domain level; the sidecar stays out-of-process with descriptor and digest verified before every spawn, never resolved through `PATH`, and never widening its grant.               |
| L4    | Denied by default — no standing admission; acts only through an explicit per-invocation grant.                                                                                                        | L4 admits none by default per OQ-085 and the family grants no L4 authority; unknown levels or domains also deny rather than default.                                                                                 |

Denials name the level and the family only and carry no content bytes,
foreign identifiers, or absent-versus-denied signals.

#### Filesystem family admission (RFC-0005 draft, OQ-085)

The candidate filesystem (`fs`) family maps to the `filesystem` domain:
bounded, self-contained reads, writes, and listings strictly inside explicit
path patterns. It grants no process, network, clipboard, IPC, `terminal
input`, `terminal output`, or other domain authority, and a grant in one
domain never implies authority in another; a `terminal.*` grant never implies
a grant in this family and vice versa. The decided verb set is read, write,
and list: `list` is read-class and rides the read grant over the listed
prefix, while `open` and `append` are rejected as verbs. This admission mints
no capability identifier and changes no grammar: the accepted
`fs.read:PATTERN` and `fs.write:PATTERN` split stays the single authority
with the parameter required and no family-wide wildcard. Exact Lua
spellings, per-call payload and listing caps, operation rates and quotas,
redaction format, and label encoding stay parked to the Core bridge and SDK
implementation; this admission covers the family shape only and authorizes no
implementation. Acceptance requires independent security review plus
docs-curator approval per RFC-0005 acceptance evidence.

| Level | Filesystem family admission                                                                                                                                                                                                                                      | Rationale                                                                                                                                                                                                                                                                             |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L0    | Allowed — Core owns enforcement (grant gate, bound enforcement, redaction and truncation, typed denials).                                                                                                                                                        | L0 admits `filesystem`; Core is the enforcement point and no plugin grant confers Core authority.                                                                                                                                                                                     |
| L1    | Allowed only with an explicit per-plugin grant carrying explicit path patterns recorded by Core; the operation path must intersect the grant scope; reads, writes, and listings are bounded self-contained requests, redacted, truncated, and labeled untrusted. | L1 admits `filesystem`; deny-by-default is preserved and safe-mode, scope-mismatch, sensitive-path, secret-shaped, hostile-pattern, and over-bound or over-rate requests deny fail-closed with a typed denial.                                                                        |
| L2    | Allowed only with an explicit per-plugin grant carrying explicit path patterns recorded by Core; the operation path must intersect the grant scope; reads, writes, and listings are bounded self-contained requests, redacted, truncated, and labeled untrusted. | L2 admits `filesystem` and is the primary consumer (file-manager, editor preview, and mediated Wheel reads); no grant migrates from `terminal.*` in either direction and a newly requested family blocks updates per P0-AC-030; `list` never becomes a grant-free enumeration oracle. |
| L3    | Allowed only through an explicit per-request grant issued by Core to a verified native component coprocess; no standing grant exists.                                                                                                                            | L3 admits `filesystem` at the domain level; the sidecar stays out-of-process with descriptor and digest verified before every spawn, never resolved through `PATH`, and never widening its grant.                                                                                     |
| L4    | Denied by default — no standing admission; acts only through an explicit per-invocation grant.                                                                                                                                                                   | L4 admits none by default per OQ-085 and the family grants no L4 authority; unknown levels or domains also deny rather than default.                                                                                                                                                  |

Denials name the level and the family only and carry no content bytes,
foreign identifiers, or absent-versus-denied signals. Listings suppress
denied entries silently (silent skip) as the default; any alternative shape
must preserve the no absent-versus-denied signal rule above. Reads never
imply writes and writes never imply read-back; reading or listing under this
family authorizes delivery of results into the plugin VM only, and no watch,
subscription, tail-follow, retained handle, or cross-call cursor exists in
this family.

The family admission cells apply uniformly to the generic operation classes
below. These cells describe authorization shape, not API identifiers or
implementation:

| Operation class | Required family grant and scope                                          | Result and denial behavior                                                                                                                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `read`          | `fs.read` with an explicit path pattern intersecting the requested path  | Bounded file content is delivered only into the calling plugin VM with a Core-attached untrusted-observation label; missing, revoked, expired, mismatched, sensitive-path, secret-shaped, over-bound, over-rate, safe-mode, or trust-admission failures are typed and fail closed. |
| `write`         | `fs.write` with an explicit path pattern intersecting the requested path | Bounded writes require write authority; read authority is not implied and no read-back is returned by the grant; the same typed, oracle-tight denial treatment applies to invalid, unscoped, sensitive, over-bound, over-rate, safe-mode, or inadmissible requests.                |
| `list`          | `fs.read` with an explicit path pattern intersecting the listed prefix   | Bounded names and file-kind metadata are read-class results; denied entries are suppressed by default, and the listing never becomes an existence oracle or grant-free enumeration path.                                                                                           |

Every operation class is subject to the level cell first and the explicit
grant intersection second. Denials name only the trust level and family when
the admission gate applies; other typed denials name only the generic reason.
Neither shape includes content bytes, foreign identifiers, path values, or an
absent-versus-denied signal. Exact method names, parameter spellings, payload
and listing caps, rates, quotas, and label encoding remain parked to the Core
bridge and SDK implementation; this additive matrix mints no identifiers and
authorizes no implementation.

### Secret-storage tiers (OQ-055, SEC-22)

Secrets live in exactly one of four tiers, with policy that only tightens
as sensitivity rises. Every tier requires consent, an audit entry, and
redaction everywhere:

| Tier          | Store                                                               | Consent          | Audit | Redact | Extra                       |
| ------------- | ------------------------------------------------------------------- | ---------------- | ----- | ------ | --------------------------- |
| `host-env`    | Host-consumed environment                                           | Allowlisted read | Yes   | Yes    | Baseline per ADR-0006       |
| `config-file` | `$XDG_CONFIG_HOME/bitty/secrets.env`, mode `0600`                   | Explicit grant   | Yes   | Yes    | —                           |
| `os-keyring`  | OS keyring                                                          | Explicit grant   | Yes   | Yes    | Backend undecided           |
| `command-ref` | External command reference, naming only, never executed by the gate | Explicit grant   | Yes   | Yes    | Subprocess-output isolation |

The tier gate is enforced at secret resolution with names-only audit on
denial. Keyring backend choice, command execution and output handling,
and rotation stay open.

### Credential references (OQ-054, SEC-23)

Provider credentials are named by at most one of `api_key_env` (one
environment variable) or `api_key_cmd` (one program plus arguments,
naming only — the gate never reads the environment and never executes).
Both set is a conflict that denies fail-closed; neither set resolves to
no credential. References carry names, never values, so there is nothing
to redact. A project layer may only narrow credentials — keep the
identical reference or remove it — never widen them by changing the
source, renaming the variable or program, or adding a reference where the
base has none. The provider schema and config surface stay open.

### Role contract for multi-agent work (OQ-057, SEC-25)

Agents act under one of four roles — Commander, Implementer, Tester,
Reviewer — checked at four enforcement points: context read, tool call,
delegation, and sandboxed execution. Authority narrows down the table:

| Role        | May act at                                               | Sandbox restrictions                                               |
| ----------- | -------------------------------------------------------- | ------------------------------------------------------------------ |
| Commander   | Context read, tool call, delegation, sandboxed execution | None beyond grants                                                 |
| Implementer | Context read, tool call, sandboxed execution             | No network; sealed environment                                     |
| Tester      | Context read, sandboxed execution                        | No filesystem write, network, or child process; sealed environment |
| Reviewer    | Context read only                                        | No filesystem write, network, or child process; sealed environment |

The role gate runs before the grant intersection: a role acting outside
its mapped points denies fail-closed. Roles never grant authority,
prompts never confer capability, and delegation only narrows through the
accepted intersection. Shell-write closure through the execution sandbox
stays open.

### Panel lease write hook (OQ-083, SEC-26)

A panel is a workstation with a stable id, a human-readable
title/description, a lease state of `Idle` or `Occupied(holder)`, and
acquire/release/handoff events. Panel write surfaces gate on the lease:
only the current occupant may write; acquiring an occupied panel fails,
and releasing or handing off requires the current holder. The lease is a
UX metaphor, never the agent ontology, and presentation stays
non-authoritative: the lease records who may drive a panel, never what is
true. The bounded lease term, clock, and bus routing stay open.

## Principal data flows and controls

### PTY to terminal state

Arbitrary bytes pass through an incremental VT parser into typed semantic
actions. CSI numeric ranges and parameter counts, OSC/DCS/APC lengths, string
lengths, nesting, notification rate, synchronized-update buffering, scrollback,
and total cell memory all require hard limits. Invalid UTF-8 and unterminated
sequences must be recoverable parser states, not panics.

Graphics adds decoded pixel, dimension, compressed payload, and aggregate store
limits to prevent decompression bombs. File and shared-memory transports are
capability requests: the default is deny; allowed paths must resolve to regular
files under approved locations. Devices, sockets, `/proc`, `/sys`, and `/dev`
are rejected. A protocol-supplied path never authorizes deletion.

### Terminal protocols to desktop capabilities

OSC 52 clipboard read and write are separate decisions; reads require explicit
consent under the normal policy. Paste inspection detects C0 controls, NUL,
escape, carriage return, embedded newline, and suspicious Unicode controls.
Bracketed paste is defense in depth, not a complete boundary.

> Platform residual (CTX-0184, `bitty` #283, closed): while Bitty is alive
> and focused on Hyprland 0.56.2, primary-selection reads fail — including
> healthy pure-CLI `wl-copy --primary` staging that succeeds with Bitty
> closed. Root cause is focus-gated primary delivery, compositor-side; no
> Bitty mechanism was found (same-PID A/B reversal), so no Bitty fix is
> indicated and the upstream report draft stays unfiled by owner decision.
> This residual does not weaken T-04: consent, paste inspection, and the
> restrictive remote/unknown policy are unchanged.

OSC 8 links pass through URI parsing, scheme policy, and a user gesture. The
platform opens an approved URI without shell construction or interpolation.
Titles, notifications, cwd, hostnames, and command metadata are bounded,
untrusted strings and are never expanded or executed.

Rich Markdown becomes a constrained AST and scene representation, not HTML in a
WebView. Script execution is forbidden. Local resources requested by rich or
custom protocols use the same policy-controlled loader as graphics.

### Plugin to host

Each plugin has its own Lua VM, namespace, lifecycle owner, and resource budget.
The standard library excludes `io`, `os`, `debug`, native loading, and ambient
package paths. Filesystem, process, network, terminal, clipboard, UI, protocol,
runtime, and debug operations use a capability-checking host API.

Protocol registration is high risk because any PTY peer could invoke the
handler. It requires an explicit capability and exclusive registration.
Plugins receive presentation primitives, not raw GPU objects, terminal state
mutation, or synchronous hot-path callbacks. CPU/instruction, memory, task,
callback-time, and queue budgets are attributable and observable.

### Configuration and workspace trust

User `init.lua` is trusted user code. That trust does not extend to plugins,
distributions, system search paths, or project files. System policy has a known
source and cannot be weakened by user configuration.

Project configuration is declarative by default. If project Lua is ever
supported, first use asks for Once, Always, or Reject while showing canonical
path and content hash. A content change invalidates approval. Project config
does not receive process, network, filesystem-write, or runtime-admin authority.

#### Restricted config module loader (candidate, OQ-CONFIG-REQUIRE)

Status: **candidate requirement**, drafted with the design contract
`specifications/config-lua-require-contract-candidate.md` under the
`bitty-terminal-docs` corpus (issue `bitty#2670`; the contract is a
not-yet-merged candidate, so it is referenced by repository path rather
than by a URL). Nothing is implemented and this record adds no P0
gate replacement — it extends the required-defense set that a future
configuration module loader must satisfy before any loader-shipped
release.

The boundary this record fixes: user configuration is trusted code, but a
module loader that turns `require("config.options")` into file reads is
still a host-controlled filesystem surface. Its containment must never
become a general filesystem read authority, never widen with configuration
content, and never reuse the plugin-host package loader's trust.

Required defenses for the config-only loader (Unix and Windows):

- one name grammar against exactly one host-derived module root (the
  `lua/` directory sibling of the configuration root); the root is fixed
  per generation from the explicit-or-probed configuration source, never
  from Lua state, the working directory, `$LUA_PATH`, or any
  Lua-reachable variable;
- threefold containment — lexical (grammar-joined path), canonical
  (symlink-aware prefix check under the canonical root, with in-root
  symlink layouts admitted on Unix only when the canonical target stays
  inside the root), and handle-bound identity (per-component no-follow
  with `openat2` `RESOLVE_BENEATH`/`RESOLVE_NO_MAGICLINKS` where
  available on Unix; unconditional reparse-point refusal with
  junction/stream/device-name rejection plus post-open identity match on
  Windows) — so a path swapped between check and read never becomes the
  read target;
- special-file rejection: only regular files are read; FIFOs, devices,
  sockets, reparse points, NTFS alternate data streams, 8.3 aliases,
  reserved Windows device names, and non-`\.lua`/`init` shapes fail
  closed;
- bounded graph: cycle-as-failure (no partially-initialized module
  tables), depth, distinct-module-count, per-file (the shipped
  configuration file bounds) and aggregate source caps, and the same
  RC-1/RC-2 evaluation budget as the configuration VM, charged to the
  same PB-1 startup accounting — no per-module budget tier and no count
  evasion of the aggregate cap;
- startup fail-soft is whole-layer (as for any configuration-layer
  failure), while `bitty config check`/`doctor` stay strict and reload
  refuses and keeps the previous plan; `--safe` never constructs the
  loader and reads no external configuration; plugin and settings VMs
  keep denying `require` unchanged; and
- redaction: diagnostics name the module spec and line info only — never
  resolved host paths, filesystem metadata, or file contents beyond the
  offending line.

### IPC, CLI, and child processes

On Unix-like systems, IPC uses a current-user endpoint under
`$XDG_RUNTIME_DIR/bitty`, mode `0600`, with peer credential validation. Windows
uses a named pipe with a current-user ACL. No TCP listener is enabled by
default.

Inspect, input, manage, configure, plugin-manage, process-spawn, and debug are
different scopes. Reading terminal text never implies permission to inject
input or terminate a process. A child process may receive a short-lived,
current-terminal scope, never a runtime administrator token. Credentials must
not be placed where shell startup or SSH environment forwarding leaks them.

### MCP, Agents, and DevTools

MCP defaults to operations such as listing terminals, reading snapshots,
examining render statistics, and inspecting effective configuration. Sending
input, spawning a process, installing a plugin, or writing configuration needs
separate, per-client elevation and consent.

Terminal output can contain prompt injection. Every API response labels it as
untrusted observation data. It must not be mixed into instruction or policy
channels, and the terminal reader cannot automatically combine its data with
filesystem and network authority.

DevTools distinguishes `debug.inspect`, `debug.trace`, and `debug.control`.
Connection alone grants none of them. Trace collection minimizes data by
default, redacts typed sensitive fields, keeps input recording opt-in, and
creates user-only files.

### Agent automation and credential prompts (candidate)

A candidate defense model for agent-driven interactive input is registered as
[OQ-086](../decisions/open-questions.md) and specified in the
[IPC and Agent RFC](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/specifications/ipc-agent-rfc.md#candidate-sensitive-input-interlock-and-interaction-policy-oq-086)
candidate sensitive-input interlock; the command-side audit is specified by the
[AI Architecture](https://github.com/bitty-terminal/bitty-ai-docs/blob/main/architecture/ai-architecture.md) candidate command risk
classification ([OQ-087](../decisions/open-questions.md)). It composes with
the normative rules above and does not replace them:

- sensitive-input detection uses kernel PTY state (no-echo) rather than output
  text patterns, because prompts are locale-dependent, false-positive prone,
  and spoofable by hostile output;
- an interaction class decides whether automation is allowed at all: secret
  input stays human-only, destructive confirmations require an explicit human
  decision, and only safe interactive prompts may be auto-answered under the
  agent's own granted input scope;
- while the target PTY is in no-echo mode, agent input dispatch fails closed
  regardless of grant, and no-echo input never enters grid, scrollback,
  snapshots, traces, or agent observations;
- candidate acceptance evidence must prove both directions (no-echo programs
  enter the interlock; echo-on and spoofed prompts do not) before the model
  moves beyond candidate.

This candidate adds no capability and weakens no P0 gate: T-10, T-11, R-013,
and R-014 keep their current required defenses until a reviewed acceptance
decision replaces or extends them.

### Plugin and dependency supply chain

Installation performs download, manifest validation, checksum/provenance
verification, and content-addressed storage without running plugin code or
post-install scripts. Exact source, revision, dependencies, API compatibility,
manifest hash, and checksum are recorded in the lockfile.

Activation is transactional. Failure retains the old environment; rollback is
available. New capabilities block automatic update and require a permission
diff plus approval. Official packages receive no sandbox bypass. Native
in-process plugin artifacts are rejected through P0 and P1.

## Abuse cases and required defenses

<!-- markdownlint-disable MD013 -->

| ID   | Abuse case                                                                                                              | Required defense                                                                                                                                             |
| ---- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| T-01 | Crafted OSC/APC/DCS crashes or wedges Bitty                                                                             | Bounded parser, timeout/budget, fuzzing, panic-free recovery                                                                                                 |
| T-02 | Tiny compressed image expands to huge allocation                                                                        | Decoded-size and pixel limits before allocation                                                                                                              |
| T-03 | Graphics/rich protocol reads a local secret path                                                                        | Deny-by-default resource loader, regular-file and safe-path policy                                                                                           |
| T-04 | Remote output reads clipboard or injects dangerous paste                                                                | Separate consent, paste inspector, restrictive remote/unknown policy                                                                                         |
| T-05 | Malicious link reaches a shell or dangerous scheme                                                                      | URI parser, scheme allowlist, user gesture, no shell interpolation                                                                                           |
| T-06 | Plugin executes commands or escapes its VM                                                                              | Restricted libraries, capability host, no native in-process plugin                                                                                           |
| T-07 | Plugin starves the hot path or memory                                                                                   | No hot-path callbacks, budgets, attribution, disable/recovery                                                                                                |
| T-08 | Entering a cloned repository executes project Lua                                                                       | Declarative config or path-and-hash workspace consent                                                                                                        |
| T-09 | Same-user/remote process takes over runtime IPC                                                                         | Local ACL, peer credentials, least-privilege action scopes                                                                                                   |
| T-10 | Agent follows instructions printed by hostile terminal output                                                           | Untrusted-data labeling, read-only default, separated authorities                                                                                            |
| T-11 | Trace or crash report leaks credentials                                                                                 | Default minimization, redaction, opt-in input, user-only files                                                                                               |
| T-12 | Update introduces malicious code or new privileges                                                                      | Locks, checksums, no install scripts, permission diff, transaction/rollback                                                                                  |
| T-13 | Plugin changes canonical grid semantics                                                                                 | Terminal Truth is core-owned; presentation-only plugin contract                                                                                              |
| T-14 | Unsafe/FFI defect compromises the process                                                                               | Narrow unsafe budget, safety comments, review, fuzzing, process isolation path                                                                               |
| T-15 | Config module loading escapes the configuration root (traversal, symlink/junction escape, stream/device file)           | Single-root grammar plus lexical/canonical/handle-bound containment, reparse and special-file refusal, regular-file-only reads                               |
| T-16 | Configuration module graph wedges startup or exhausts budgets (cycles, fan-out, oversized aggregate, many tiny modules) | Cycle-as-failure, depth/count/per-file/aggregate caps, RC-1/RC-2 accounting on the startup path, whole-layer fail-soft salvage and strict check/reload paths |

<!-- markdownlint-enable MD013 -->

## Verification gates

Before a security boundary can be marked implemented, evidence must cover:

- positive, negative, malformed, oversized, and timeout cases;
- platform-specific transport permissions and peer identity;
- property/fuzz tests for attacker-controlled parsers and manifests;
- capability denial and permission-elevation behavior;
- secret-redaction tests and explicit export review;
- plugin failure, transactional rollback, and safe-mode startup;
- dependency advisory/source policy checks;
- review by a separate security-auditor persona.

Residual risks and stage ownership are tracked in
[risk-register.md](risk-register.md).
