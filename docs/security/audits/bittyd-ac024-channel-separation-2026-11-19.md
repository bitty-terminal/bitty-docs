---
title: bittyd P0-AC-024 Channel-Separation and Confused-Deputy Record 2026-11-19
description: Dated P0-AC-024 record at bitty 04253d4c and bitty-ai a4c385d, executing the daemon authority-plane confused-deputy suite (8 passed), the bitty-ai fencing and Zone 1 suites (13 and 7 passed), the MCP adapter import and lookup suites (207 passed), and the pinned bitty-ipc read-only scope test (1 passed), then reviewing instruction/data channel separation by code path, with no criterion marked Verified
category: security
audience: security-reviewer
document_type: register
status: draft
website_publish: false
sidebar_order: 59
---

# bittyd P0-AC-024 Channel-Separation and Confused-Deputy Record 2026-11-19

**Status: dated evidence record; independent review pending.** This record takes
the three cells `P0-AC-024` still names — the confused-deputy suite, the
hostile-output replay form of it, and the auditor review of instruction/data
channel separation — and supplies two of them as executed runs plus a code-path
review. Nothing here is Verified. `R-013` stays `Open` and `P0-AC-024` stays
**Partially verified**, because the reviewer verdict the criterion's pass
threshold asks for is the reviewer's to give, and no run yet drives an action
channel from bytes an untrusted source chose.

The difference from the two records this one builds on is execution. The
[2026-11-16 adapter audit](bittyd-ac024-adapter-audit-2026-11-16.md) states that
it ran nothing — "No test was executed for this record, and no gate of the
audited repository was run" — and the [2026-11-16 three-criterion
record](bittyd-ac024-026-2026-11-16.md) ran the daemon's Agent-default and label
suite but recorded the confused-deputy suite as absent. Five commands now run —
the daemon suite once more with `--nocapture` to read its refusals — and the
counts are reported below exactly as the harness printed them.

## Purpose

The obligation, quoted from [`p0-acceptance-criteria.md`](../p0-acceptance-criteria.md):

```text
P0-AC-024  Given an MCP/Agent client without elevation, when it operates, then
           only read-style operations succeed; every response containing
           terminal content labels it untrusted observation data; sending
           input, spawning processes, installing plugins, or writing
           configuration requires per-client consent and cannot be combined
           automatically with filesystem/network authority.
           Pass threshold: default-deny matrix passes; labeling asserted in API
           responses and confirmed by auditor review of the instruction/data
           channel separation.
```

The cells this record addresses, quoted from the evidence matrix and the two
prior records as they stood before this one was written:

```text
confused-deputy suite
hostile-output replay as a confused-deputy suite
auditor review of the instruction/data channel separation
```

`P0-AC-024` is a composite criterion and the composite is not this record's
business. Three of its halves are already on record and are cited, not
restated:

- the 51-method Agent-default matrix (10 allowed, 41 `Denied/ScopeDenied`), the
  live `session.read` label, and the live `ConsentRequired` /
  `ScopeViolation` / uniform-`NotFound` refusals, in the
  [three-criterion record](bittyd-ac024-026-2026-11-16.md);
- the adapter's read-only import, inspect-tier gate, bus-assigned label, and
  four fence render sites, in the [adapter
  audit](bittyd-ac024-adapter-audit-2026-11-16.md), which also named two gaps
  (`D3` unbound consent principal, `C7` marker-based Zone 1 admission);
- the daemon's per-method scope matrix and the `mcp_default` scope set, in the
  [2026-11-16 scope record](bittyd-ac022-scopes-2026-11-16.md).

What was missing is the half that can be run — a suite that spends authority
through an indirect path and asserts the daemon's typed refusal — and the half
that has to be read, the route from untrusted bytes to a model turn. This
record takes both.

## Source identity

- **`bitty`** — read-only checkout, `origin/main` at `04253d4c`
  (`[CTX-1892] feat(terminal,runtime): ... (#3247)`). The suite was
  executed from that checkout's working tree, which stood at `3c588f26`; the
  four intervening commits are unrelated and provably do not touch the target:
  `git rev-parse 3c588f26:crates/bitty-daemon` and
  `git rev-parse 04253d4c:crates/bitty-daemon` both return
  `3dc3d73013ee596209aac73b6ad906f8bf1ef327`, and
  `crates/bitty-daemon/tests/confused_deputy.rs` is blob
  `0847cee25660d16fc2c924fa3b82596a3764dd8e` at both revisions. The executed
  bytes are therefore `origin/main`'s bytes.
- **`bitty-ai`** — read-only checkout, clean, at
  `a4c385d13c7669bd74ca2764ac86c698389c5a87` (`origin/main`, the same revision
  the adapter audit read). Line numbers below were re-read at this revision;
  where the audit quoted a range, the range still resolves to the same
  construct.
- **`bitty-ipc`** — the revision `bitty` pins, `9493674`
  (`crates/bitty-ipc-api` for the scope test). Read and tested from
  the cargo checkout of that exact revision, which is also the repository's
  current `main`.
- Every `cargo test` below ran with `CARGO_TARGET_DIR` pointed outside the
  audited repository and with `--offline`. No file in `bitty`, `bitty-ai`, or
  `bitty-ipc` was created, modified, or checked out. The daemon suite spawns a
  `bittyd` binary built from that checkout and speaks to it over a real Unix
  socket; it is not an in-process unit test.

## The runnable half: the authority-plane suite

```sh
cd <bitty checkout> && cargo test -p bitty-daemon --test confused_deputy --offline
```

```text
running 8 tests
test an_operator_less_cli_cannot_stop_the_daemon ... ok
test a_baseline_consumer_cannot_mint_authority_it_does_not_hold ... ok
test a_client_supplied_consumer_identity_does_not_change_the_effective_scopes ... ok
test a_host_grant_cannot_be_forwarded_to_another_connection ... ok
test an_attach_handle_owned_by_another_connection_is_never_found ... ok
test a_controller_cannot_reach_another_consumers_content_plane ... ok
test an_observer_grant_cannot_become_control_or_be_re_aimed ... ok
test authority_accumulated_by_a_low_scope_consumer_stops_at_its_own_target ... ok

test result: ok. 8 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.19s
```

Re-run with `-- --nocapture` to read the refusal each vector actually received
(0.18 s, same 8 passed). Every line below is an excerpt of a printed `CD_*`
marker, trimmed to its `class`/`code` pair; the vectors are the test names.

| Vector (test)                                                              | Indirect path exercised                                                                                                                      | Observed refusal                                                                                                                                                                                                             |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `a_controller_cannot_reach_another_consumers_content_plane`                | `session.read`, `session.write`, `session.subscribe`, `session.resize`, `session.status` at a session the caller does not own                | `NotFound/NotFound` on all five (`CD_CROSS_CONSUMER`)                                                                                                                                                                        |
| `an_attach_handle_owned_by_another_connection_is_never_found`              | `session.detach`, `lease.heartbeat` at another connection's attach handle                                                                    | `NotFound/NotFound` on both (`CD_FOREIGN_ATTACH`)                                                                                                                                                                            |
| `a_baseline_consumer_cannot_mint_authority_it_does_not_hold`               | `daemon.host_grant`, `daemon.status`, `daemon.orphans.verify`, `session.kill`, `daemon.stop` from a `session.*`-only holder; `session.grant` | `Denied/ScopeViolation` on the five; `NotFound/NotFound` for `session.grant` (`CD_NARROW_MINT`)                                                                                                                              |
| `a_host_grant_cannot_be_forwarded_to_another_connection`                   | replay of a used grant bearer, and the bearer presented under a foreign correlation                                                          | `Denied/ConsentRequired` on both (`CD_FORWARD_HOST`)                                                                                                                                                                         |
| `an_observer_grant_cannot_become_control_or_be_re_aimed`                   | `session.control.transfer`, `session.detach`, `session.abort`, `session.read`, `session.grant` from an observer; a re-aimed grant            | `Denied/ControllerRequired` (five: transfer, detach, abort, read, grant), `NotFound/NotFound` (control claim), `Denied/ObserverGrantRequired` (re-aimed) (`CD_OBSERVER_GRANT`)                                               |
| `an_operator_less_cli_cannot_stop_the_daemon`                              | `daemon.stop` over the wire from a non-operator connection, then the CLI stop path with a foreign capability                                 | `Denied/ScopeViolation`; CLI exits `6` with `bittyd: stop: operator authentication failed`; the operator-less CLI exits `2` (`CD_OPERATORLESS`)                                                                              |
| `a_client_supplied_consumer_identity_does_not_change_the_effective_scopes` | client-supplied `role` and `scope` fields on `daemon.negotiate`, then a forged `role` at `session.attach`                                    | `Validation/InvalidRequest` on both forged-field shapes and on the attach role; the attach itself succeeds as `"role":"observer"` with the same seven `session.*`/`terminal.*`/`process.spawn` scopes (`CD_FORGED_IDENTITY`) |
| `authority_accumulated_by_a_low_scope_consumer_stops_at_its_own_target`    | nesting through a self-created session and a self-minted observer grant, then every verb above at the other target                           | `Denied/ScopeViolation` for daemon verbs and `session.kill`, `NotFound/NotFound` for every target-addressed verb, `Denied/ControllerRequired` for the observer read (`CD_LAUNDER`)                                           |

The suite's own module documentation states what it is not, at
`crates/bitty-daemon/tests/confused_deputy.rs:35-37`: it is "not the MCP/Agent
adapter audit and not the instruction/data channel-separation review". That
sentence is the reason this record has a second half, and the reason the
hostile-output replay cell below stays unrun.

### The other four runs

| Command                                                                    | Revision              | Observed                                                                                                                                                                                                       |
| -------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cargo test -p bitty-ai-runtime --test prompt_isolation --offline`         | `bitty-ai` `a4c385d`  | `13 passed; 0 failed` (0.00 s), including `untrusted_tool_execution_message_is_fenced_at_provider_boundary` and `embedded_delimiter_seed_bytes_stay_verbatim_at_provider_boundary`                             |
| `cargo test -p bitty-ai-slice --test trust_zones --offline`                | `bitty-ai` `a4c385d`  | `7 passed; 0 failed` (0.00 s), including `zone1_rejects_every_untrusted_shape_fail_closed` and `prefix_hash_stable_when_tail_varies_including_hostile`                                                         |
| `cargo test -p bitty-ai-mcp --offline`                                     | `bitty-ai` `a4c385d`  | `116 passed` (lib), `43 passed` (`mcp_client`), `48 passed` (`remote_transport`), `0 failed` in each — 207 total, including `inspect_tier_denies_mutating_tools` and `allowlist_miss_denies_with_zero_contact` |
| `cargo test -p bitty-ipc-api --offline mcp_readonly_cannot_produce_effect` | `bitty-ipc` `9493674` | `1 passed; 0 failed; 185 filtered out` (0.00 s)                                                                                                                                                                |

None of these runs is reconstructed: each line above is the harness's own
summary from this environment on 2026-11-19.

## The review half: instruction/data channel separation

### (a) How a tool result reaches the model

The route has five stations. In order:

1. **The daemon decides the label.** A handler returns; `dispatch` inspects
   `method.carries_terminal_content()` and attaches `UntrustedObservation` to
   the response object (`crates/bitty-daemon/src/service/dispatch.rs:1319-1338`).
2. **The label rides the wire as a field, not a mode.** The pushed frame path
   attaches the same struct to every `session_content` event
   (`crates/bitty-daemon/src/service/wire.rs:347-361`), so a stream frame cannot
   be delivered unlabeled.
3. **The adapter transports text and nothing else.** `parse_call_result` reads
   `isError` and the `content[].text` parts and builds
   `ToolSuccess::new(summary, data)`; no label-shaped field is read
   (`bitty-ai` `crates/bitty-ai-mcp/src/call.rs:194-239`, `389-390`).
4. **The bus assigns the label the model sees.** The execution record's
   `is_untrusted_surface` is set by the bus for every executed outcome and left
   `false` only for a pre-contact refusal (`bitty-ai`
   `crates/bitty-ai-runtime/src/tool.rs:1790-1862`, `1948-1961`).
5. **The agent renders it as a tool-role message under a host header and a
   length-prefixed fence.** `execution_message` emits
   `"{tool} -> [untrusted observation len={n}: {NOTE}]\n{body}\n[/untrusted observation]"`
   (`crates/bitty-ai-runtime/src/agent.rs:1656-1678`); the note is the host
   constant at `agent.rs:418`; `Message::tool` fixes `role: Role::Tool`
   (`crates/bitty-ai-runtime/src/provider.rs:245-250`), so the content cannot
   arrive in an assistant or user turn. The identical shape is used for
   assembled context records (`agent.rs:662-676`).

The instruction side is then closed at the context compiler: Zone 1
(`system_prompt`, `project_rules`, `tool_schemas`) refuses any text carrying a
fence marker and returns `CompilerError::UntrustedInZone1 { field }` naming only
the field, never the content — a refusal, not a relocation
(`crates/bitty-ai-slice/src/context_compiler.rs:46-70`, `660-680`). Zone 3 is
where all untrusted records and action outcomes compile.

Observed, not merely read: `prompt_isolation` 13/13 and `trust_zones` 7/7, per
the table above. The load-bearing assertion is byte-exact — the second provider
round must contain the fence string with `len=11`, and a payload embedding both
a closing and an opening fence must survive verbatim with its declared length
equal to the true 64 bytes.

The honest limit is unchanged from the adapter audit and is repeated because it
is the property's whole mechanism: the fence is a declared-length convention. A
reader that ignores `len` and splits on `[/untrusted observation]` sees only
text, and no run here can prove a model honors the length. What the runs do
prove is that the bytes a model receives carry the host's header, the host's
note, and a length equal to the payload's true length — the precondition for
honoring it.

### (b) The label is single-valued and out of the wire's reach

Three independent single-valued decisions:

- **The predicate names one method.** `ServiceMethod::carries_terminal_content`
  is `matches!(self, Self::SessionRead)` and its doc comment states that a
  method serving bytes must be added to the predicate, because the dispatch
  path attaches the label from it (`crates/bitty-daemon/src/service/scopes.rs:505-519`).
- **The type has one value.** `UntrustedObservation` is a unit struct;
  `is_untrusted_surface()` returns the literal `true`; `attach` inserts
  `Value::Bool(true)` into the response object
  (`crates/bitty-daemon/src/content.rs:76-129`). There is no constructor that
  produces `false` and no absence to represent, so a handler cannot build an
  unlabeled content response — it can only fail to build a response.
- **Attachment happens after the handler, over its output.**
  `dispatch` calls `dispatch_inner`, then inserts the label on `Ok` for a
  content-carrying method (`dispatch.rs:1321-1329`). Because `insert`
  overwrites, a `is_untrusted_surface` key echoed from a request or planted by a
  handler is replaced, not trusted. A content success that is not a JSON object
  cannot carry the label and is dropped as `Refusal::internal()` rather than
  served bare (`dispatch.rs:1330-1337`).

The transport DTO refuses the cleared direction as well: `validate()` returns
an error for an outcome whose `is_untrusted_surface` is `false`, with the reason
"execution outcomes must be labeled is_untrusted_surface" (`bitty-ipc`
`crates/bitty-ipc/src/execution.rs:883-886`), and the committed test
`untrusted_label_cannot_be_cleared` sets the field to `false` and asserts the
validation error (`execution.rs:1474-1480`). That test is read, not run here —
the `bitty-ipc` run above executed only `bitty-ipc-api`'s
`mcp_readonly_cannot_produce_effect`. In both directions, then, the wire has a
representation for "labeled" and none for "not labeled".

### (c) A read-only import cannot produce an effect; one adapter cannot dispatch another server's tool

- **Imports are read-only by construction, from three server fields.**
  `import_tool` passes the literal `true` as `ToolSpec::new`'s `read_only`
  argument and builds the scope key `mcp.{server_id}`
  (`bitty-ai` `crates/bitty-ai-mcp/src/tools.rs:237-261`). The parser reads
  exactly `name`, `description`, and `inputSchema`; `RawMcpTool` holds only
  those (`tools.rs:86-95`, `158-173`), so MCP `annotations` / `readOnlyHint` are
  not consulted in either direction.
- **The tier gate runs before the authorizer and before consent.** An
  `Inspect`-tier adapter refuses a non-read-only import at
  `crates/bitty-ai-mcp/src/bridge.rs:560-561`, ahead of the gate chain
  documented at `bridge.rs:3-9`, with zero transport contact.
  `inspect_tier_denies_mutating_tools` and
  `allowlist_miss_denies_with_zero_contact` are part of the 207 passing tests
  above.
- **The IPC layer's read-only default refuses effects independently.**
  `ScopeSet::mcp_default()` permits `terminal.text` and refuses `terminal.send`,
  `config.reload`, `plugin.install`, `process.spawn`, and `debug.break`
  (`bitty-ipc` `crates/bitty-ipc-api/src/scope.rs:882-893`), observed 1/1.
- **A tool name is server-qualified, so an adapter cannot resolve another
  server's tool.** `sanitize_mcp_name` produces `mcp_<server>_<tool>`
  (`tools.rs:56-84`) and `lookup` is a linear match over the adapter's own
  imported set (`bridge.rs:486-488`); a name outside it is the `Denied` path
  with no transport contact. The cross-server shape remains `code-only`: no
  test constructs two adapters and drives one at the other's name. What is
  observed is the property that makes it hold — a miss is a refusal with zero
  contact — and the naming scheme that makes a foreign tool unreachable.

### What the 2026-11-16 adapter audit left open, and what is still open

The audit closed 14 cells by test and 7 by code path. Re-reading it against
`a4c385d` now, three cells are unchanged and are **not** claimed here:

- `D3` — `McpToolAdapter::new` shape-validates `params.protocol_id` and never
  consults the runtime `IdentityBridge` (`bridge.rs:129-141`), while the slice's
  `IpcBridge::from_binding` derives the wire id from the bound principal
  (`bitty-ai-slice/src/bridge.rs:192-194`). The adapter's consent principal can
  therefore be a principal other than the session's. Still a defect shape, not
  an unrun cell.
- `C7` — Zone 1 admission is marker-based, not provenance-based: `compile`
  installs caller-supplied `system_instruction` as Zone 1 and the gate refuses
  seven marker strings, not unauthorized authorship
  (`context_compiler.rs:660-680`). The 7/7 `trust_zones` run confirms the gate
  works as designed; it does not make the design a provenance check.
- `D6` — no hostile-output replay drives an action channel from untrusted bytes
  end to end. The 8-test daemon suite does not do this, and neither run above
  does.

One audit label improves without any code change: `A1` (the read-only import
default), `A5` ("the adapter check can only narrow"), and `D1`'s cross-server
half stay `code-only`, but `A2`, `B1`, and `C1`–`C4` now have an executed run
behind them in this environment rather than a committed-test citation alone.

## Per-cell verdict

Verdict vocabulary, fixed here so no row is read as stronger than it is:
**observed** — a command in this record produced the result; **proven by code
path** — the property follows from the cited lines and no run exercises it;
**NOT EXERCISED** — the cell has no artifact and is not decided.

| #     | Cell                                                                                        | Verdict             | Evidence                                                                                                                           |
| ----- | ------------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| CD-1  | A controller cannot reach another consumer's content plane                                  | observed            | `confused_deputy` 8/8; `CD_CROSS_CONSUMER` five `NotFound/NotFound`                                                                |
| CD-2  | Another connection's attach handle is never found                                           | observed            | `confused_deputy` 8/8; `CD_FOREIGN_ATTACH` `session.detach`, `lease.heartbeat` → `NotFound/NotFound`                               |
| CD-3  | A narrow holder cannot mint a broader grant                                                 | observed            | `confused_deputy` 8/8; `CD_NARROW_MINT` five `Denied/ScopeViolation`, `session.grant` → `NotFound/NotFound`                        |
| CD-4  | A grant bearer cannot be forwarded, replayed, or re-correlated                              | observed            | `confused_deputy` 8/8; `CD_FORWARD_HOST` both shapes `Denied/ConsentRequired`                                                      |
| CD-5  | An observer grant cannot become control or be re-aimed                                      | observed            | `confused_deputy` 8/8; `CD_OBSERVER_GRANT` `ControllerRequired`, `ObserverGrantRequired`, `NotFound/NotFound`                      |
| CD-6  | The operator-less CLI inherits no daemon authority                                          | observed            | `confused_deputy` 8/8; `CD_OPERATORLESS` wire `Denied/ScopeViolation`, CLI exit `6` / `2`                                          |
| CD-7  | Client-supplied identity fields do not change effective scopes                              | observed            | `confused_deputy` 8/8; `CD_FORGED_IDENTITY` `Validation/InvalidRequest`, attach serves `role: observer`                            |
| CD-8  | Accumulated low-scope authority stops at its own target                                     | observed            | `confused_deputy` 8/8; `CD_LAUNDER` per-verb refusals                                                                              |
| CS-1  | The untrusted predicate is one method, decided server-side                                  | proven by code path | `service/scopes.rs:505-519`; live label on `session.read` in the 2026-11-16 record                                                 |
| CS-2  | The label is one value; no false or absent label can be built                               | proven by code path | `content.rs:76-129` (`UntrustedObservation`, `attach`)                                                                             |
| CS-3  | The label is attached after the handler and overwrites any echoed field                     | proven by code path | `dispatch.rs:1319-1338`; `wire.rs:347-361` for frames                                                                              |
| CS-4  | The transport DTO refuses a cleared label                                                   | proven by code path | `bitty-ipc` `execution.rs:883-886`; test `untrusted_label_cannot_be_cleared` at `1474-1480` (read, not run)                        |
| CS-5  | A tool result reaches the model as a tool-role message under a host header and length fence | observed            | `prompt_isolation` 13/13; `agent.rs:1656-1678`, `provider.rs:245-250`                                                              |
| CS-6  | Embedded fence bytes stay verbatim under a declared true length                             | observed            | `prompt_isolation` 13/13, `embedded_delimiter_seed_bytes_stay_verbatim_at_provider_boundary`                                       |
| CS-7  | Zone 1 refuses untrusted markers fail-closed instead of relocating them                     | observed            | `trust_zones` 7/7; `context_compiler.rs:660-680`                                                                                   |
| CS-8  | An imported MCP tool is read-only by construction from three server fields                  | proven by code path | `tools.rs:237-261`, `86-95`; the gate that consumes the flag is observed (`inspect_tier_denies_mutating_tools` in the 207/207 run) |
| CS-9  | The read-only default refuses every effect verb at the IPC layer                            | observed            | `bitty-ipc-api` 1/1; `scope.rs:882-893`                                                                                            |
| CS-10 | One adapter cannot resolve another server's tool                                            | proven by code path | `tools.rs:56-84` (`mcp_<server>_<tool>`), `bridge.rs:486-488`; no two-adapter test                                                 |
| CS-11 | A read-only import needs explicit per-request opt-in for an effect                          | proven by code path | adapter audit `A4`; `bitty-ai-slice` `fake_host.rs:463-470`, `live_host.rs:456-476` (not re-run here)                              |
| X-1   | Hostile-output replay: an instruction in terminal bytes fails to reach an action channel    | NOT EXERCISED       | no artifact; the daemon suite's module doc excludes it (`confused_deputy.rs:35-37`)                                                |
| X-2   | The auditor's channel-separation verdict the pass threshold names                           | NOT EXERCISED       | this record is evidence for that verdict, not the verdict                                                                          |
| X-3   | The adapter's consent principal is identity-bound                                           | NOT EXERCISED       | `bridge.rs:129-141` shape-validates only; the `D3` gap stands                                                                      |
| X-4   | Zone 1 admission is provenance-based                                                        | NOT EXERCISED       | `context_compiler.rs:660-680` refuses marker bytes, not authorship; the `C7` gap stands                                            |
| X-5   | The second-uid cell                                                                         | NOT EXERCISED       | one uid; a "different consumer" is always a different connection                                                                   |

Counts: **12 observed, 7 proven by code path, 5 NOT EXERCISED**.

## What this record does not claim

- **It does not mark `P0-AC-024` Verified, and it does not move `R-013`.** The
  pass threshold's second clause is an auditor review confirming channel
  separation; a record that assembles the code paths and runs the suites is
  input to that review.
- **It does not claim the daemon suite is the MCP confused-deputy suite.** The
  eight tests are the daemon's authority plane: connection scopes, grant
  bearers, leases, and the CLI operator path. `bittyd` serves no MCP surface at
  this revision; the MCP client lives in `bitty-ai` and talks to a supervised
  server process, not to `bittyd`.
- **It does not claim the fencing is enforced by a model.** The fence and its
  declared length are host output. Honor-the-length is a reader property, and
  no test here can assert a third-party model's behavior.
- **It does not claim end-to-end untrusted-to-action isolation.** `X-1` is
  NOT EXERCISED. The label, the fence, the Zone 1 gate, and the read-only import
  each hold under test; the composite replay from hostile bytes to a chosen tool
  call does not exist.
- **It does not claim the `bitty-ai` runs cover the shipped binary.** They ran
  at `a4c385d` in a read-only checkout, against a fake provider and the slice's
  test hosts. Nothing was installed or served.
- **It does not claim the counts are exhaustive of the crates.** `bitty-ai-mcp`'s
  207 tests are that crate's full suite; the `bitty-daemon` run is one
  integration target, not the crate, and the `bitty-ipc-api` run is one test.
- **It does not claim a defect against the criterion.** `D3` and `C7` are
  recorded gaps in the separation, not violations of it: both are host-side
  construction and admission questions, and both are already on the adapter
  audit's record.

## Disposition

| Obligation                                                                 | Status              | Evidence                                                       |
| -------------------------------------------------------------------------- | ------------------- | -------------------------------------------------------------- |
| A connection cannot spend authority it was not granted, by indirect means  | observed            | CD-1..CD-8: 8/8, every vector's typed refusal quoted above     |
| A response carrying terminal content is labeled untrusted observation data | proven by code path | CS-1..CS-4 plus the live label in the 2026-11-16 record        |
| A read-only import cannot produce an effect                                | observed            | CS-9 (1/1); CS-8 plus the inspect-tier gate in the 207/207 run |
| One adapter cannot dispatch another server's tool                          | proven by code path | CS-10; `mcp_<server>_<tool>` plus a deny-on-miss lookup        |
| Labeled content reaches the model as data, not as an instruction channel   | observed            | CS-5..CS-7; 13/13 and 7/7                                      |
| The reviewer verdict the pass threshold names                              | NOT EXERCISED       | X-2; this record is the material, not the verdict              |
| A hostile output cannot drive an action channel                            | NOT EXERCISED       | X-1                                                            |

## Residuals

- **Independent security review: pending.** No cell here is Verified, no risk
  changes state, no P0-AC status moves, and `R-013` stays `Open`.
- **The hostile-output replay is still the missing artifact (`X-1`).** What
  would close it is a harness that fetches or reads content containing a
  directive, carries it through one model turn, and demonstrates that the
  following tool call is either absent or policy-refused — the shape the daemon
  suite already tests for authority, applied to content. Nothing about the
  label makes that test unnecessary; it only makes it possible.
- **The suite runs as one uid.** Every "another consumer" is another
  connection. The peer-uid half of the grant binding is asserted structurally in
  `crates/bitty-daemon/tests/peer.rs`, and the second-uid cell remains unrun
  exactly as prior records say.
- **`D3` and `C7` are unchanged.** Neither was in scope to fix, and both are
  cited from the adapter audit rather than re-derived: the adapter's consent
  principal is shape-validated, and Zone 1 admission is marker-based. A follow-up
  that adds `McpToolAdapter::from_binding` and an authorship token on
  `context.compile` would close them.
- **`A5` and the cross-server shape of `D1` stay `code-only`.** No test
  constructs two adapters, and none constructs a deliberately widened adapter
  copy to show the daemon still refuses. The runs above narrow the gap without
  closing it.
- **The `bitty` suite ran from a working tree at `3c588f26`.** The crate tree
  hash is identical at `04253d4c` (quoted in Source identity), so the bytes are
  the same; the revision line above says both rather than picking the flattering
  one.
- **Non-Linux and Windows cells do not apply here.** `confused_deputy.rs` is
  `#![cfg(target_os = "linux")]`; the adapter layer has no platform-conditional
  path.

## References

- [P0 acceptance criteria](../p0-acceptance-criteria.md)
- [Evidence matrix](../evidence-matrix.md)
- [bittyd MCP/Agent, DevTools, and trace evidence 2026-11-16](bittyd-ac024-026-2026-11-16.md)
- [bittyd MCP/Agent adapter audit 2026-11-16](bittyd-ac024-adapter-audit-2026-11-16.md)
- [bittyd per-action IPC scope evidence 2026-11-16](bittyd-ac022-scopes-2026-11-16.md)
- [bittyd child process scope evidence 2026-11-16](bittyd-child-scope-2026-11-16.md)
- [bittyd P0 evidence record 2026-11-18](../bittyd-p0-evidence-2026-11-18.md)
- [Threat model](../threat-model.md)
- [Security overview](../overview.md)
- [Risk register](../risk-register.md)
