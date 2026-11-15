---
title: bittyd Per-Action IPC Scope Evidence 2026-11-16
description: Dated P0-AC-022 record at bitty a8abf31c closing the live session.resize, session.control.transfer, session.grant.revoke, lease.heartbeat, terminal-instance bitty ctl, and scope-by-method matrix cells, with the independent review still absent
category: security
audience: security-reviewer
document_type: register
status: draft
website_publish: false
sidebar_order: 56
---

# bittyd Per-Action IPC Scope Evidence 2026-11-16

**Status: dated evidence record; independent review pending.** This record
supplies the residual cells the
[2026-11-13 record](../bittyd-p0-evidence-2026-11-13.md) and the
[2026-11-15 record](../bittyd-p0-evidence-2026-11-15.md) named for
`P0-AC-022`: the full scope-by-method matrix as one artifact, the
terminal-instance `bitty ctl` cells, and the four live cells
`session.resize`, `session.control.transfer`, `session.grant.revoke`, and
`lease.heartbeat`. It covers one criterion and changes no other row.

No criterion is marked Verified and no risk state moves. The criterion stays
**Partially verified** because the independent security review that
`P0-AC-022`'s verification method names is still absent. The evidence-matrix
rows `R-011`..`R-014` and the daemon-intake rows `DR-01`..`DR-08` stay `Open`.

## Purpose

`P0-AC-022` asks that a client "granted only inspect/read scope" be denied input
injection, process termination, configuration change, plugin management, and
debug operations, with a pass threshold of "full scope × action matrix shows
denial outside grants; elevation requires separate consent".

The 2026-11-13 record left this residual cell, quoted from
[`evidence-matrix.md`](../evidence-matrix.md):

```text
Full scope-by-method matrix as one artifact; terminal-instance `bitty ctl`
cells; live `session.resize`, `session.control.transfer`,
`session.grant.revoke`, and `lease.heartbeat`; independent review
```

Decomposed before anything was run, that is six checkable cells plus the
review. The list below is the pre-run enumeration, not a reconstruction:

| #   | Cell                                                                                                                 | Symbol or surface                                                                        | Tier                                  |
| --- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------- |
| C1  | 15-scope × 51-method matrix as one artifact, per cell allowed/denied plus the typed code                             | `bitty_ipc_api::scope::{Scope::all, all_known_methods, authorize_method}`                | component, artifact                   |
| C2  | Terminal-instance `bitty ctl`: elevated verbs denied without elevation, allowed with a one-scope `BITTY_CTL_ELEVATE` | `crates/bitty-terminal/src/ctl.rs`, `ipc_serve.rs` scope gate                            | live, headless `--test-mode` instance |
| C3  | Live `session.resize`                                                                                                | `ServiceMethod::SessionResize`, `DispatchBoundary::Resize`, `Transport(terminal.manage)` | live `bittyd`                         |
| C4  | Live `session.control.transfer`                                                                                      | `ServiceMethod::SessionControlTransfer`, `DispatchBoundary::ControlTransfer`             | live `bittyd`                         |
| C5  | Live `session.grant.revoke`                                                                                          | `ServiceMethod::SessionGrantRevoke`, `DispatchBoundary::ObserverGrantRevoke`             | live `bittyd`                         |
| C6  | Live `lease.heartbeat`                                                                                               | `ServiceMethod::LeaseHeartbeat`, `ScopeRequirement::None`                                | live `bittyd`                         |
| C7  | Independent review                                                                                                   | —                                                                                        | cannot be produced by this campaign   |

Already-covered cells were not re-claimed: `daemon.status`/`daemon.stop`
`Denied/ScopeViolation`, observer `session.read|write|abort`
`Denied/ControllerRequired`, observer `session.kill` `Denied/ScopeViolation`,
observer `session.create` `Denied/ConsentRequired`, idempotent detach, and the
conformance corpus's earlier 67 pass / 0 fail / 16 skip run.

## Source identity

- `bitty` at `a8abf31c85cb3beac521ed20f560c29af490235b` (origin/main),
  workspace version `0.0.42`, service API `1.5`.
- Built with `cargo build -p bitty-daemon --offline --locked` into a target
  directory outside the repository. `bittyd --version` prints
  `bittyd 0.0.42 (service API 1.5)`; binary SHA-256
  `33a8392baf731e0290709cf668927824ea8c97a4458d1d8b879e09fb95196175`, size
  `37,690,280` bytes.
- The terminal-instance half used `bitty --version` → `bitty 0.0.42 (dev
a8abf31c)`, SHA-256
  `bfa77557485ee9264cb4db17c805ad0503f04de61d69dfdbc2e8f4b8a1079c3b`.
- Toolchain `rustc 1.98.1 (48a229cea 2026-09-01)`, `cargo 1.98.1`; the
  `1.85` MSRV check is part of the change's gates.
- Host: Linux x86_64, kernel `7.3.4-1-cachyos`, 24 logical CPUs, uid `1000`,
  no privilege and no passwordless escalation.
- Every run used a throwaway root beneath `/tmp`. The daemon harness creates
  `bittyd-conformance-<label>-<pid>-…` with mode `0700` and puts
  `XDG_RUNTIME_DIR` and `XDG_STATE_HOME` inside it; the terminal instances used
  `bitty-ctl-elev-<label>-<pid>-…`, also `0700`, with their socket inside. The
  host's own `bittyd` and any interactive `bitty` instance were never started,
  signalled, or inspected. Every recorded PID was started and stopped by this
  campaign.
- The corpus's real row reports the daemon's own facts; the served endpoint in
  that row is the owner-private Unix socket the harness binds, and the
  conformance evidence file records `"cell": "linux-x86_64"` beside the commit
  id, so a row cannot be mistaken for a fake run.

### Client disclosure

Two additions to the repository's own harness carry the live cells, and both
are committed by the same change that this record cites:

- `crates/bitty-daemon/tests/harness/corpus.json`: three new real+fake vectors
  (`C-26`, `C-27`, `C-28`) that drive the deny arms the existing rows did not
  cover. They run on the harness's real-service driver, which starts the built
  `bittyd` binary and speaks the real endpoint. No product code changed.
- `crates/bitty-daemon/tests/scope_matrix.rs`: walks all 765 authorization
  cells and prints the artifact grid.
- `crates/bitty-terminal/tests/ctl.rs`: `ctl_elevation_is_per_scope_on_a_live_instance`
  spawns three headless `--test-mode` instances (default, `config.modify` only,
  `terminal.manage` only) and drives the built `bitty ctl` client at each.

No instrument outside the repository was needed this time, so every cell below
is replayable from the tree with the commands quoted.

## C1: the scope-by-method matrix

The artifact is [P0-AC-022 scope by method matrix 2026-11-16](ac022-scope-matrix-2026-11-16.md).
It is generated by the target above and holds **765 cells: 51 allowed, 714
`Denied/ScopeDenied`** — exactly one allowed cell per method, under that
method's own required scope, and no cell allowed by an unrelated scope.

```sh
CARGO_TARGET_DIR=<outside the repository> cargo test -p bitty-daemon \
  --test scope_matrix --offline
```

```text
running 7 tests
test every_method_declares_a_scope_and_the_registry_is_fifty_one_rows ... ok
test the_empty_grant_set_denies_every_method_with_its_own_scope ... ok
test a_single_scope_allows_only_the_methods_that_require_it ... ok
test no_scope_is_a_substitute_for_another ... ok
test holding_every_scope_allows_every_method ... ok
test unknown_and_malformed_names_are_refused_with_every_scope_held ... ok
test the_scope_by_method_grid_is_printed_as_the_artifact ... ok

test result: ok. 7 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

Status: **Observed**, at the component tier. The matrix is the authorization
decision point, not a served exchange for each of the 51 names; the honest
boundary is written into the artifact's "what this does not prove" section, and
the live served cells for the daemon's own catalog are C3–C6 below.

## C2: the terminal-instance `bitty ctl` cells

Three headless instances, each with its own `0700` root and socket, driven by
the built client. The committed test asserts every line quoted here; the
transcript below is from the same binary run by hand first, so the test's
expectations were written from observation rather than from the source.

```sh
cargo test -p bitty-terminal --test ctl --offline
```

```text
test ctl_elevation_is_per_scope_on_a_live_instance ... ok
test result: ok. 21 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

Arm 1 — the shipped CLI default (`terminal.inspect`, `terminal.input`,
`view.inspect`, `view.manage`, `config.inspect`, `plugin.inspect`), no elevation
allowlist in the environment:

```text
[ctl terminal list] exit=0
  {"v":1,"command":"core.terminal.list","ok":true,"result":{"terminals":[{"id":"t:1",…}],"total_lower_bound":1,…}}
[ctl view list] exit=0
  {"v":1,"command":"core.view.list","ok":true,"result":{"views":[{"id":"v:1","focused":true}]}}
[ctl panel list] exit=0
  {"v":1,"command":"core.panel.list","ok":true,"result":{"panels":[{"id":"p:1",…}]}}
[ctl terminal spawn] exit=7
  {"v":1,"command":"core.terminal.spawn","ok":false,"error":{"class":"Denied","code":"ScopeDenied","message":"permission denied: scope 'terminal.manage' for bitty.debug/spawnTerminal (needs elevation via BITTY_CTL_ELEVATE)"}}
[ctl terminal close t:1] exit=7
  {"v":1,"command":"core.terminal.close","ok":false,"error":{"class":"Denied","code":"ScopeDenied","message":"permission denied: scope 'terminal.manage' for bitty.debug/closeTerminal (needs elevation via BITTY_CTL_ELEVATE)"}}
[ctl workspace close ws:1] exit=7
  {"v":1,"command":"core.workspace.close","ok":false,"error":{"class":"Denied","code":"ScopeDenied","message":"permission denied: scope 'terminal.manage' for bitty.debug/closeWorkspace (needs elevation via BITTY_CTL_ELEVATE)"}}
[ctl config reload] exit=7
  {"v":1,"command":"core.config.reload","ok":false,"error":{"class":"Denied","code":"ScopeDenied","message":"permission denied: scope 'config.modify' for bitty.debug/reloadConfig (needs elevation via BITTY_CTL_ELEVATE)"}}
[ctl view split --right] exit=0
  {"v":1,"command":"core.view.split","ok":true,"result":{"split":"right","new_view":"v:2"}}
[ctl terminal list] exit=0 (after the four denials)
  …"total_lower_bound":1…
```

The instance's own stderr corroborates the refusals at the connection level:
each denied request is logged `bitty: ipc connection closed (requests=1
denied=1 framing_errors=0)`, and the terminal count after the refused spawn is
still `1`, so a denial left no partial state.

Arm 2 — `BITTY_CTL_ELEVATE=config.modify` only:

```text
[ctl config reload] exit=0
  {"v":1,"command":"core.config.reload","ok":true,"result":{"reloaded":true,"applied":true,…,"kind":"unchanged",…}}
[ctl terminal spawn] exit=7
  …"scope 'terminal.manage' for bitty.debug/spawnTerminal (needs elevation via BITTY_CTL_ELEVATE)"
```

Arm 3 — `BITTY_CTL_ELEVATE=terminal.manage` only:

```text
[ctl terminal spawn] exit=0
  {"v":1,"command":"core.terminal.spawn","ok":true,"result":{"spawned":true,"terminal_id":"t:2","view_id":"v:2"}}
[ctl config reload] exit=7
  …"scope 'config.modify' for bitty.debug/reloadConfig (needs elevation via BITTY_CTL_ELEVATE)"
[ctl terminal list] exit=0
  …"terminals":[{"id":"t:1",…},{"id":"t:2",…}],"total_lower_bound":2…
```

So each allowlist moves exactly its own scope: `config.modify` never moves
`terminal.manage`, and `terminal.manage` never moves `config.modify`. Elevation
is per scope and requires a separate decision, which is the criterion's second
half.

One verb is not servable on this surface: `ctl window new` returned exit `6`
with `{"class":"Unavailable","code":"Unavailable","message":"the running
instance did not service the new-window request before the deadline; nothing
was created"}`. That is the headless `--test-mode` loop having no app thread to
answer the new-window lane, not a scope decision — the `view.manage` gate was
passed and the request was offered. It is recorded as **not observed**, not as
a pass.

## C3–C6: the live daemon cells

One command produces all four cells; the harness starts a real `bittyd` per
vector on a fresh `0700` root, negotiates a consumer connection, a host-granted
creator, an observer, and an operator as the vector requires, and writes a
per-step signature.

```sh
CARGO_TARGET_DIR=<outside the repository> cargo test -p bitty-daemon \
  --test conformance --offline
```

```text
running 28 tests
test result: ok. 27 passed; 0 failed; 1 ignored; 0 measured; 0 filtered out
```

The real-driver evidence file for that run reports `{"fail": 0,
"known_defect": 0, "pass": 68, "skip": 18, "total": 86}` at commit
`a8abf31c85cb3beac521ed20f560c29af490235b`, an increase of three passes and the
same 18 typed skips over the 67/16/83 run the 2026-11-13 record quotes. Each
skip names the capability this host cannot reach and none of them is one of the
cells below.

Per cell, the observed step signature (`N:ok` or
`N:error:<class>:<code>` for step `N` of the named vector). `consumer` is a
connection with no host consent; `creator` holds the consumed host grant and the
controller lease; `observer` holds an observer lease from a consumed grant.

| Cell                                   | Vector, step                                 | Actor                       | Observed                                | What it proves                                                  |
| -------------------------------------- | -------------------------------------------- | --------------------------- | --------------------------------------- | --------------------------------------------------------------- |
| `session.resize` allow                 | `C-17` step 8                                | controller (`creator`)      | `8:ok`                                  | The controller lease resizes a bound terminal                   |
| `session.resize` deny                  | `C-17` step 7                                | observer                    | `7:error:Denied:ControllerRequired`     | An observer lease never resizes                                 |
| `session.resize` no oracle             | `V-13` step 3                                | consumer, unknown id        | `3:error:NotFound:NotFound`             | Scope/visibility is decided before any target lookup            |
| `session.resize` after transfer        | `C-27` step 9                                | new controller              | `9:ok`                                  | Authority follows the lease, not the connection                 |
| `session.resize` after transfer        | `C-27` step 10                               | previous controller         | `10:error:Denied:ControllerRequired`    | The old controller loses resize authority                       |
| `session.control.transfer` allow       | `C-06` step 6, `C-11` step 11, `C-27` step 8 | controller                  | `6:ok`, `11:ok`, `8:ok`                 | The controller transfers control to a named observer lease      |
| `session.control.transfer` deny        | `C-27` step 7                                | observer                    | `7:error:Denied:ControllerRequired`     | An observer cannot transfer control away from the controller    |
| `session.control.transfer` stale token | `C-11` step 10                               | claimant with a stale token | `10:error:Denied:InvalidControlToken`   | A rotated token is refused at a vacant control                  |
| `session.control.transfer` shape       | `V-41` step 9                                | controller                  | `9:error:Validation:InvalidRequest`     | An ambiguous target is refused before any effect                |
| `session.grant.revoke` allow           | `C-04` step 11, `C-20` step 5, `C-28` step 9 | controller                  | `11:ok`, `5:ok`, `9:ok`                 | The controller revokes an observer grant                        |
| `session.grant.revoke` deny            | `C-28` step 8                                | observer                    | `8:error:Denied:ControllerRequired`     | An observer lease cannot revoke a grant it does not control     |
| `session.grant.revoke` no oracle       | `V-38` step 14                               | uncorrelated connection     | `14:ok` (`not_active`)                  | A mismatched correlation gets the uniform not-active descriptor |
| revoked grant cannot attach            | `C-28` step 11                               | latecomer                   | `11:error:Denied:ObserverGrantRequired` | A revoked grant no longer authorizes an attach                  |
| second revoke                          | `C-28` step 12                               | controller                  | `12:ok` (`not_active`)                  | Revoke is idempotent and never reports a fresh revocation       |
| `lease.heartbeat` allow                | `C-04` step 3, `C-25` step 9, `C-26` step 9  | lease owner                 | `3:ok`, `9:ok`, `9:ok`                  | The owning connection refreshes its own lease                   |
| `lease.heartbeat` deny                 | `C-26` step 7                                | observer, foreign attach id | `7:error:NotFound:NotFound`             | A foreign attach id is never refreshed                          |
| `lease.heartbeat` deny                 | `C-26` step 8                                | observer, unknown attach id | `8:error:NotFound:NotFound`             | A foreign and an unknown id are one answer, so no oracle        |
| `lease.heartbeat` allow                | `C-26` step 10                               | observer, own attach id     | `10:ok`                                 | The observer refreshes the lease it owns                        |

`C-26`, `C-27`, and `C-28` are the three vectors this change adds; the rest were
already in the corpus and are re-observed in this run. Their `forbidden` lists
state the negative property each row would catch, for example "an observer
transfers control away from the controller" and "a revoked grant still attaches
a new observer".

Status: **Observed**, every row above from a served `bittyd` over its real Unix
endpoint at this revision, with the typed class and code quoted as the harness
recorded them.

## Disposition

| Obligation                                                                                | Status       | Evidence                                                                                                                                   |
| ----------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| A granted scope is never implied by another, for all 15 scopes and 51 methods             | Observed     | 765 cells, 51 allowed, 714 `Denied/ScopeDenied`, one allowed cell per method ([artifact](ac022-scope-matrix-2026-11-16.md))                |
| An under-scoped terminal-instance client is denied elevation-only verbs with a typed code | Observed     | `terminal spawn`/`terminal close`/`workspace close` → `terminal.manage`; `config reload` → `config.modify`; exit `7`, `Denied/ScopeDenied` |
| Elevation requires separate consent, per scope                                            | Observed     | `config.modify`-only allowlist moves reload and not spawn; `terminal.manage`-only moves spawn and not reload                               |
| A denied elevation attempt leaves no partial state                                        | Observed     | Terminal count still `1` after the refused spawn; server log `denied=1` per connection                                                     |
| `session.resize` is controller-only and tracks the lease                                  | Observed     | `C-17` steps 7/8, `C-27` steps 9/10                                                                                                        |
| `session.control.transfer` needs the current controller                                   | Observed     | `C-06` step 6, `C-11` steps 10/11, `C-27` steps 7/8, `V-41` step 9                                                                         |
| `session.grant.revoke` needs control authority and is idempotent                          | Observed     | `C-28` steps 8/9/11/12, `V-38` step 14                                                                                                     |
| `lease.heartbeat` answers its owner only                                                  | Observed     | `C-26` steps 7/8/9/10, `C-04` step 3, `C-25` step 9                                                                                        |
| `ctl window new` under the default grant                                                  | Not observed | `exit 6`, `Unavailable`: the headless loop serves no new-window lane                                                                       |

## Residuals

- **Independent security review: pending.** This record marks nothing Verified.
  A record is evidence for review, not the review verdict; no criterion flips
  without the reviewer's sign-off. `R-011`..`R-014` and `DR-01`..`DR-08` stay
  `Open`.
- **The arbitrary single-scope grant is still unreachable live.** Every
  same-uid `bittyd` connection negotiates one fixed grant set, so the daemon
  cannot be driven into "granted only `terminal.inspect`". `C-09` carries that
  arm as an explicit `deferred` (`bitty#2917`, "the both-authorities-missing arm
  needs an inspect-only scope seam") and the 15 × 51 matrix is the property such
  a seam would have to preserve. The MCP/Agent read-only default, which is the
  other "inspect only" shape, belongs to the adapter audit that `P0-AC-024` also
  owes.
- **`ctl window new` is unproven on a served surface.** The headless
  `--test-mode` loop has no app thread to answer the new-window lane, and this
  campaign did not start a graphical instance (the host compositor is out of
  scope for this work). The handler-side scope test and the CLI exit mapping are
  in the tree; the live cell is not.
- **Two live terminal-instance verbs are unexercised.** `terminal send`
  (`terminal.input`) and `terminal text` (`terminal.inspect`) were not driven
  over the socket in this campaign; only `terminal list`, `view list`,
  `panel list`, and `view split` were.
- **Second-uid and non-Linux cells remain unrun**, as every prior record says:
  no second local account and no passwordless escalation on this host, no
  Windows named-pipe cell. `DR-02` keeps that gap.
- **Worker-kind sessions still have no subject**: the handshake reports
  `"worker_sessions": false` and worker hosting carries
  `d01-amendment-required`.
- **The evidence plan's own row is not edited here.** `bittyd-p0-evidence-plan.md`
  and the plan's `C-*`/`V-*` producer list are the plan owner's to update;
  `V-13`, `C-04`, `C-06`, `C-11`, `C-17`, `C-25`, `C-26`, `C-27`, `V-38`, and
  `V-41` are observed here but the crosswalk is not this record's to assert.

## References

- [P0-AC-022 scope by method matrix 2026-11-16](ac022-scope-matrix-2026-11-16.md)
- [P0 acceptance criteria](../p0-acceptance-criteria.md)
- [Evidence matrix](../evidence-matrix.md)
- [bittyd P0 evidence record 2026-11-08](../bittyd-p0-evidence-2026-11-08.md)
- [bittyd P0 evidence record 2026-11-13](../bittyd-p0-evidence-2026-11-13.md)
- [bittyd P0 evidence record 2026-11-15](../bittyd-p0-evidence-2026-11-15.md)
- [bittyd child scope evidence 2026-11-16](bittyd-child-scope-2026-11-16.md)
- [Threat model](../threat-model.md)
- [Security overview](../overview.md)
- [Risk register](../risk-register.md)
