---
title: bittyd P0 Independent Agent Review 2026-11-21
description: Independent agent review of the 2026-11-20 bittyd no-TCP, lifecycle, and plugin-denial record, cross-checking its verifying cells read-only against bitty origin/main 74c92dbd0 with file:line citations, accepting the scripted v1 client over the served endpoint as the campaign vehicle, and flipping no control row
category: security
audience: security-reviewer
document_type: register
status: draft
website_publish: false
sidebar_order: 63
---

# bittyd P0 Independent Agent Review 2026-11-21

**Status: independent agent review; no control row flips.** This record is the
review bitty#2921's acceptance line asks for, delivered at the only tier this
environment can honestly provide. It cross-checks the verifying cells of the
[2026-11-20 no-TCP, lifecycle, and plugin-denial
record](bittyd-no-tcp-lifecycle-2026-11-20.md) against the `bitty` code
read-only, rules on the campaign vehicle that record discloses, and decides per
criterion whether any control moves toward `Verified`. The decision at every
criterion is **no**: the executed evidence is confirmed where the record claims
it, and the residuals that keep each criterion short are unchanged.

## Reviewer identity and mandate

**This is an independent agent review, and it is not an owner or human
sign-off.** It was produced by a fresh reviewer session, distinct from the
author of the record under review and from the sessions that produced the
campaign corpus behind it. The reviewer is an AI agent operating the same
tooling class as the recorder; it holds no product ownership, no maintainer
authority, and no human security-auditor credential. What follows is therefore
evidence toward the sign-off bitty#2921 names, not the sign-off itself, and no
sentence in this record should be cited as an owner or auditor approval.

The mandate, from bitty#2921's blockers and the record's own residual list:

1. cross-check the record's verifying cells against the `bittyd` code,
   read-only, with a `file:line` citation for every code claim;
2. rule on the campaign-vehicle question — the lifecycle cells were driven by a
   scripted v1 client over the served endpoint because no `bitty ctl` daemon
   verb exists, and a reviewer must accept or reject that vehicle;
3. decide per criterion whether executed evidence warrants moving the control
   from designed toward verified, flipping only cells the record marks
   verifying and this review confirms, and never flipping a second-uid-dependent
   or otherwise-unrun row.

## Source identity

- **`bitty`** — read-only against `origin/main` at
  `74c092d0d6e1afceb32b0cf46798021bacba2f1b`
  (`[CTX-1913] feat(ctl,runtime): wire the panel-content debug pair and surface
its counters (#3287)`). No file in the repository was created, modified,
  checked out, or built; no `bittyd` was started; every citation below was read
  with `git grep`, `git show origin/main:<path>`, or a plain read at that
  revision.
- **The record under review** is pinned at `bitty` `e630e89a` (bittyd `0.0.45`,
  service API 1.5, binary SHA-256 `2ad791d9…`). `e630e89a` is an ancestor of
  `origin/main`, and the drift between the two over the audited surface is
  recorded below; it does not change any claim this review checked.
- The corpus this record was written into was read at `bitty-docs`
  `origin/main` `6da10d4` in a clean worktree on branch
  `ctx-0328/bittyd-p0-review`.

### Revision drift over the audited surface

`git diff --stat e630e89a origin/main` over `crates/bitty-daemon`,
`crates/bitty-lua`, `crates/bitty-plugin-host`, and
`crates/bitty-terminal/src/ctl` reports:

- `crates/bitty-daemon`: the `Cargo.toml` version line only. Every daemon path
  this review cites — `src/service/server.rs`, `src/service/dispatch.rs`,
  `src/service/scopes.rs`, `src/service/frame.rs`, `src/client.rs`,
  `src/cli.rs`, `src/codes.rs`, `src/limits.rs`, `src/peer.rs`,
  `src/lease/host.rs`, `tests/peer.rs`, and
  `tests/no_tcp_listener_absence.rs` — is byte-identical at the two revisions,
  so a confirmation at `origin/main` is a confirmation of the record's tree.
- `crates/bitty-terminal/src/ctl/request.rs` grew by 201 lines for the
  panel-content debug pair (`CTX-1913`), and `CTL_RESOURCES` at
  `crates/bitty-terminal/src/ctl/request.rs:685-706` still enumerates exactly
  `instance`, `window`, `view`, `panel`, `terminal`, `workspace`, `config`,
  `consent`, and `tab`: the change added panel verbs, not a daemon verb, so the
  record's cell 11e finding holds at the current head.
- `crates/bitty-lua` (`src/host.rs`, `src/lib.rs`, `src/ui_panel.rs`) and
  `crates/bitty-plugin-host` (`src/capability.rs`, `src/event.rs`) changed for
  the same panel-content work; the denial surfaces this review cites —
  `src/gate.rs`, `src/fs_authz.rs`, `src/effective.rs`,
  `tests/plugin_network_denial.rs`, and `tests/denial_evidence.rs` — are
  unchanged.

## The campaign-vehicle ruling

**Ruling: ACCEPTED, with bounds.** A scripted v1 client over the served
endpoint is a valid campaign vehicle for the live lifecycle cells (record cells
11, 11a, 11b, 11c). The acceptance is bounded: it does not extend to any cell
the served endpoint cannot observe, and it does not substitute for a
product-surface driver where one exists.

The justification, from the ctl surface and the served API contract:

1. **The acceptance text never names a client surface.** `P0-AC-021`'s
   verification method is "integration + adversarial (negative auth tests)" and
   `P0-AC-022`'s is "adversarial (scope-matrix tests)"
   ([P0 acceptance criteria](../p0-acceptance-criteria.md)); neither the
   criteria nor their pass thresholds mention `bitty ctl`. A reading that
   demands a ctl-driven daemon campaign adds a requirement the criteria do not
   carry.
2. **The `bitty ctl` daemon verb does not exist, at the record's revision or at
   the current head.** `CTL_RESOURCES` at
   `crates/bitty-terminal/src/ctl/request.rs:685-706` carries no `session`,
   `daemon`, `attach`, `detach`, `stop`, or `drain` resource or verb. Driving
   the lifecycle "through `bitty ctl`" would require adding one — a product
   change, which an evidence campaign must not make. The record's cell 11e
   finding is confirmed at both revisions.
3. **The served endpoint is the product's IPC, not a private API.** The v1
   envelope is the accepted contract: a 4-byte big-endian length prefix and a
   `{"v":1,…}` object, written by the product's own client path at
   `crates/bitty-daemon/src/client.rs:196`, `:213`, and `:239`
   (`u32::from_be_bytes`), with `SO_PASSCRED` credentials enabled at
   `crates/bitty-daemon/src/service/frame.rs:263` and `:310`
   (`setsockopt(…, sockopt::PassCred, &true)`). The product's own CLI is itself
   only a client of that endpoint: `crates/bitty-daemon/src/cli.rs:8-9` states
   that `bittyd stop [--force | --drain]` "speaks the authenticated endpoint as
   the operator and issues `daemon.stop`". At this revision there is no second,
   more-product surface for the session verbs to be driven through.
4. **The strongest lifecycle cells do not use the scripted client at all.** The
   stop modes (cell 11d) were produced by the product's own CLI — `bittyd stop`,
   `stop --drain`, `stop --force` — so exit codes `3`, `4`, and `0` are the
   binary's, and the refusal text is the binary's.
5. **A repository-owned instrument exists and stays preferred where it
   applies.** The frozen real-service conformance driver
   (`crates/bitty-daemon/tests/conformance.rs` with
   `crates/bitty-daemon/tests/harness/real.rs` and `corpus.json`, bitty#2605)
   drove the 2026-11-16 matrix and real-service rows, and a frozen lifecycle
   vector through that driver would supersede the scripted client. Adding one
   is a product/test change this review recommends and does not perform.

Bounds of the acceptance: the vehicle speaks one uid's endpoint over one Linux
socket. It cannot observe the second-uid denial, the Windows named pipe, or any
non-Linux cell, and nothing in this review's acceptance covers them.

## Cross-check of the verifying cells against the code

Every row below states what the record claims, what the code says at `origin/main`
`74c92dbd0`, and the confirmation.

| Cell          | Record claim                                                                                                                                                                                                                                            | Code at `74c92dbd0`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Confirmed |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 6/6a          | `bittyd` is non-dumpable, so the PID-attributed `ss` channel is blind; the daemon's own-namespace kernel TCP table, read from outside the namespace, held zero rows in every phase, and a control listener in a same-shape namespace appears as one row | `crates/bitty-daemon/src/service/server.rs:538-543` — `harden_core_dumps` sets `RLIMIT_CORE` to `0`/`0` and calls `prctl::set_dumpable(false)`; called at `server.rs:558` at the top of `run()`, before the endpoint binds (module doc `server.rs:6-8`). The repository's own no-TCP cell states the same channel analysis: `crates/bitty-daemon/tests/no_tcp_listener_absence.rs` documents that a PID-filtered `ss` scan "reports zero rows whether or not a socket exists" for this process and that the private namespace read of `/proc/<pid>/net/tcp{,6}` "is the one that can speak for the daemon process itself"                                                                                                                    | yes       |
| 6 (transport) | No TCP listener exists by default                                                                                                                                                                                                                       | `git grep TcpListener\|TcpStream` over `crates/bitty-daemon` hits only the test harness (`tests/no_tcp_listener_absence.rs`, `tests/harness/tcp_absence.rs`), whose listeners are the disclosed controls; no production path opens a TCP socket                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | yes       |
| 2             | The repository's peer test refuses a real socket whose peer uid is mapped through `unshare -Ur`, as `CaptureFailed{cause: Unauthenticated}`                                                                                                             | `crates/bitty-daemon/tests/peer.rs:163` — `refuses_a_peer_from_a_different_user_namespace`; `:211-212` asserts `PeerError::CaptureFailed { cause: PeerCause::Unauthenticated }`; `crates/bitty-daemon/src/peer.rs:323` — `pub fn capture`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | yes       |
| 11            | The served catalog carries the lifecycle: `daemon.negotiate` → `daemon.host_grant` → `session.create` → `session.attach` → `session.write`/`session.read`                                                                                               | `crates/bitty-daemon/src/service/scopes.rs:282-322` — `pub enum ServiceMethod` with `DaemonNegotiate`, `DaemonStatus`, `DaemonStop`, `SessionCreate`, `SessionList`, `SessionAttach`, `SessionGrant`, `SessionGrantRevoke`, `SessionDetach`, `SessionControlTransfer`, `SessionResize`, `SessionRead`, `SessionWrite`, `SessionAbort`, `LeaseHeartbeat`; the create-denial ladder (`ScopeViolation` when `process.spawn` is missing, `ConsentRequired` when host consent is missing) is documented at `crates/bitty-daemon/src/service/dispatch.rs:33-34`, and `session.host` is documented as never baseline at `scopes.rs` (`ServiceScope::baseline()` is `session.inspect` + `session.attach` + `session.control`, "deliberately absent") | yes       |
| 11 (label)    | A live `session.read` carries `is_untrusted_surface: true`                                                                                                                                                                                              | `crates/bitty-daemon/src/service/scopes.rs:517` — `carries_terminal_content()` is `matches!(self, Self::SessionRead)`, with a doc note that a method serving bytes must be added to the predicate; `crates/bitty-daemon/src/content.rs:76-129` — `UntrustedObservation` is a unit struct whose `FIELD` is `is_untrusted_surface` and whose `is_untrusted_surface()` returns the literal `true`                                                                                                                                                                                                                                                                                                                                               | yes       |
| 11a           | An observer's `session.read`, `session.write`, and `session.abort` are `Denied/ControllerRequired`                                                                                                                                                      | `crates/bitty-daemon/src/codes.rs:67` — `RefusalCode::ControllerRequired`; `crates/bitty-daemon/src/lease/host.rs:1342` returns `Err(LeaseRefusal::ControllerRequired)`; the dispatch doc states the content plane "even with `terminal.inspect`, is refused `Denied/ControllerRequired`" (`crates/bitty-daemon/src/service/dispatch.rs:3591`)                                                                                                                                                                                                                                                                                                                                                                                               | yes       |
| 11b           | Detach is idempotent: the second call answers `not_attached` with `state_revision` unchanged                                                                                                                                                            | `crates/bitty-daemon/src/lease/host.rs:270` — `pub was_attached: bool`; `:1164-1167` documents the idempotent `Detached { was_attached: false }` / `not_attached` acknowledgement                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | yes       |
| 11c           | Consumer `cancel` abort terminates the session with `terminal_reason: consumer_cancel`, `cleanup: swept`, and removes the orphan journal entry                                                                                                          | `crates/bitty-daemon/src/lease/host.rs:401` — `pub cleanup: CleanupClass`; `:1905` names `consumer_cancel` among the effective reasons; the served orphan/journal record is settled on termination (`crates/bitty-daemon/src/service/dispatch.rs:1763`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | yes       |
| 11d           | `bittyd stop` refuses with `ActiveSessions` (limit 16) and exits `3`; `stop --drain` exits `4`; `stop --force` exits `0`                                                                                                                                | `crates/bitty-daemon/src/service/dispatch.rs:1896-1902` — `daemon_stop` returns `Refusal::denied(RefusalCode::ActiveSessions).with_counts(active, limits.effective(LimitId::MaxSessions))` when `StopMode::Refuse` and sessions are active; `crates/bitty-daemon/src/limits.rs:252` — `MaxSessions => ("max_sessions", 16, 64, …)`; `crates/bitty-daemon/src/cli.rs:53` — `EXIT_ACTIVE_SESSIONS: u8 = 3`, mapped at `cli.rs:358`; the exit-code set (`3` active sessions, `4` drain forced the remainder, `5` unverifiable worker, `6` tamper/operator) is the binary's documented closed set at `cli.rs:193-196` and `:334-335`                                                                                                             | yes       |
| 11e           | `bitty ctl` has no daemon/session verb                                                                                                                                                                                                                  | `crates/bitty-terminal/src/ctl/request.rs:685-706` — `CTL_RESOURCES` = `instance`, `window`, `view`, `panel`, `terminal`, `workspace`, `config`, `consent`, `tab`; no `session`, `daemon`, `attach`, `detach`, `stop`, or `drain` resource or verb, at `e630e89a` and at the current head                                                                                                                                                                                                                                                                                                                                                                                                                                                    | yes       |
| 9             | The plugin denial suites are present by symbol at the pinned revision, from commit `1105e745`                                                                                                                                                           | `1105e745e5a5b1c45e9a999c474faca16e3073c3` — `[CTX-1865] test(security,lua,terminal): prove plugin network/fs denial and zero-TCP lifecycle (#3209)`, an ancestor of `origin/main`; `crates/bitty-lua/src/gate.rs:145` — `pub fn build_plugin_vm(`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | yes       |
| 9a            | `require(socket)` and its spellings are refused with a typed Lua `RuntimeError`; the plugin VM exposes no socket or connect binding                                                                                                                     | `crates/bitty-lua/tests/plugin_network_denial.rs:128` — `plugin_vm_exposes_no_socket_or_connect_binding`, probing the `socket`, `sockets`, `net`, `connect`, `tcp`, `udp`, `io`, `loadfile`, `dofile` names (`:138`) through a probe that returns the typed `BoundedExecution::RuntimeError` (`:117-118`)                                                                                                                                                                                                                                                                                                                                                                                                                                    | yes       |
| 10            | The filesystem and network denial symbols are present                                                                                                                                                                                                   | `crates/bitty-plugin-host/src/fs_authz.rs:1238` — `pub fn authorize_fs(`; `:978` — `OutsideScope`; `:983` — `HostilePattern`; `crates/bitty-plugin-host/src/effective.rs:679` — `ExceedsPolicy`; `:1592` — `kind: DenialKind::ExceedsPolicy`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | yes       |
| 10a           | Filesystem escapes are denied `HostilePattern`, a sibling prefix `OutsideScope` with an in-scope allow control, and a network gain `ExceedsPolicy` through the effective-set intersection                                                               | `crates/bitty-plugin-host/tests/denial_evidence.rs:269` — `plugin_fs_request_cannot_escape_its_granted_roots`, asserting `FsDenialKind::HostilePattern \| FsDenialKind::InvalidRequest` for the escape shapes (`:285`) and `FsDenialKind::OutsideScope` for the sibling prefix with the in-scope allow control (`:326`); `:60`—`plugin_cannot_gain_network_capability_through_the_effective_set`, asserting `DenialKind::ExceedsPolicy` (`:81`)                                                                                                                                                                                                                                                                                              | yes       |

The instrument description is also confirmed: the campaign client "mirrors
`crates/bitty-daemon/src/client.rs`", and that file is the product's own
operator-stop path — the envelope (`client.rs:196`, `:213`, `:239`) and the
credential opt-in (`crates/bitty-daemon/src/service/frame.rs:263`, `:310`) are
exactly the bytes a compliant v1 client writes.

## The non-verifying cells, confirmed as such

The record's discipline on these cells is correct, and this review confirms
each classification rather than repairing it:

- **Cells 1, 1a-1c (second-uid): not run, and not runnable from this host.** The
  criterion's adversarial half needs a second usable local account or a
  privileged operator; the three recorded refusals are the host's, not the
  daemon's. No cross-check can change an unrun cell into a run, and this review
  does not.
- **Cell 3: a real refusal, and not the second-uid cell.** Both sides are local
  account `1000`; the uid difference is a namespace mapping. The attribution to
  the peer verifier is a reading of `crates/bitty-daemon/src/peer.rs:323`, which
  this review confirms is a plausible reading of the code — and that is exactly
  why it is a verifier-tier claim, not a live foreign-uid observation.
- **Cell 4: design review only.** The `0700`/`0600` modes are the design
  (`server.rs:6-8` documents the attested `0700` directory and `0600` socket),
  and asserting a mode is not observing a foreign uid refused at it.
- **Cell 5/5a: blind channel, correctly reported as blind.** The confirmation of
  `PR_SET_DUMPABLE=0` at `server.rs:538-543` is the mechanism that makes the
  PID-attributed channel structurally unable to name the daemon; the record's
  refusal to claim that zero as a pass is correct and is what distinguishes it
  from a vacuous one.
- **Cell 8: corroboration, not an invariant.** The host's listening set churns
  with other processes; the sweep cannot be a stable denominator and the record
  does not use it as one.
- **Cells 9a/10a: component tier.** The plugin host is not `bittyd`, no plugin
  is installed from a package, and no attempt reaches a real socket. The
  executions are evidence for the mediation code; the record's refusal to move
  a criterion on them is correct.

## Per-criterion verdict

bitty#2921's acceptance line asks the security review to flip each control from
"designed" to "verified". The verdict at every criterion is that the flip is
**not yet warranted**; the movements this review does authorize are recorded
under [What moves](#what-moves).

| Criterion   | Cells the record marks verifying                                                                            | Verdict                                                                | Why the criterion does not flip                                                                                                                                                                                                                                                                                                                                                                    |
| ----------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `P0-AC-021` | the namespace-scoped no-TCP read with its non-vacuity and liveness controls (cells 6/6a/7), confirmed above | stays **Partially verified**                                           | The pass threshold's foreign-user denial cell is unrun — the second-uid rule forbids the flip. The no-TCP half is now the strongest no-TCP observation in the corpus and is independently confirmed at the code level; that strengthens the criterion without closing it.                                                                                                                          |
| `P0-AC-022` | the live lifecycle cells 11, 11a, 11b, 11c, 11d, confirmed above; campaign vehicle accepted                 | stays **Partially verified** (ambiguous row, held open with this note) | The lifecycle arms and the 2026-11-16 matrix are confirmed, and the vehicle ruling removes the reading objection — but `C-09` (the arbitrary single-scope live grant) is deferred to bitty#2917, and the live `ctl window new`, `terminal send`/`terminal text`, second-uid, and Windows cells are unrun. A criterion with open cells is not `Verified`, and this review will not flip it partway. |
| `P0-AC-023` | none in this record                                                                                         | stays **Partially verified**                                           | The child-token expiry half is unrun: no path mints a child token at this revision (`worker_sessions: false`, gated on the ADR 0019 amendment). The 2026-11-16 child-environment cells stand on their own record.                                                                                                                                                                                  |
| `P0-AC-024` | the plugin `connect()` and filesystem/network denial executions (cells 9a/10a), confirmed above             | stays **Partially verified**                                           | The executions are component-tier; the hostile-output replay is unrun; and the channel-separation verdict the pass threshold names remains the auditor's to give — the 2026-11-19 record supplies the material and this review confirms the label path it rests on (`scopes.rs:517`, `content.rs:76-129`), which is input to that verdict, not the verdict.                                        |
| `P0-AC-025` | none in this record                                                                                         | stays **Partially verified**                                           | A product-served DevTools endpoint and the formal DevTools scope audit (F-10) remain absent; the 2026-11-19 record's `--test-mode` and campaign-servo endpoints are recorded there and are not re-claimed here.                                                                                                                                                                                    |
| `P0-AC-026` | none in this record                                                                                         | stays **Partially verified**                                           | The panic crash slot is not run and the two F-10 auditor artifacts remain absent; the export-preview and exit-diagnostics observations belong to the 2026-11-19 record.                                                                                                                                                                                                                            |

No `R-*` row and no `DR-*` row moves either: `R-011`..`R-014` stay `Open`
because the second-uid run, `C-09`, the child-token expiry, the
hostile-output replay, and the F-10 artifacts each block their checklist, and
`DR-01`..`DR-08` stay `Open` because the evidence plan's `C-*`/`V-*` producers
(`C-09`, `C-10`, `V-25`, `V-26`, `V-28`, and the rest) remain unrecorded or
deferred. This matches the [evidence matrix](../evidence-matrix.md)'s own
reasoning in its "Why no `R-011`..`R-014` row flips" section, which this review
confirms rather than revises.

## What moves

Three things change on this review's authority, and they are not state flips:

1. **The campaign-vehicle question is resolved (bitty#2921 blocker 3).** The
   scripted v1 client over the served endpoint is ACCEPTED as the vehicle for
   the live lifecycle cells, with the bounds stated above. The 2026-11-20
   lifecycle observations therefore stand as observations of the product's IPC,
   not as artifacts of a private instrument.
2. **The independent-review clause for the covered cells is discharged at agent
   tier (blocker 2, partially).** The covered cells — the namespace no-TCP
   channel, the live lifecycle arms, and the executed plugin denials — now have
   an independent review on record that confirms them at the code level. The
   clause is not discharged at owner or human-auditor tier, and the criteria
   that name an auditor's verdict keep it open.
3. **The `bitty ctl` finding is confirmed at the current head.** The absence of
   a daemon verb is not a defect of the campaign; it is the state of the product
   surface at `74c92dbd0`, and any acceptance text read as requiring a
   ctl-driven daemon campaign is asking for a product change.

## What this review does not claim

- **It does not mark any criterion `Verified`, and it moves no risk.** Every
  status in the [evidence matrix](../evidence-matrix.md), the
  [risk register](../risk-register.md), and the
  [P0 acceptance criteria](../p0-acceptance-criteria.md) stands as it was.
  bitty#2921's acceptance line is unmet at every criterion, for the reasons in
  the per-criterion table.
- **It is not an owner or human sign-off.** It is an independent agent review
  from a fresh session; the sign-off tier the corpus reserves `Verified` for is
  above it, and nothing here should be cited as that approval.
- **It does not re-run the record's commands.** No `bittyd` was built or
  started, no suite was executed, and the recorded binary SHA-256 is attested
  by the recorder, not re-derived. The confirmations are code-level: every
  mechanism the record's observing cells depend on was read at `origin/main`
  and cited with `file:line`.
- **It does not confirm observations, only mechanisms and instruments.** That
  the code has the refusal paths the record quotes raises the record's
  credibility; it does not substitute for the runs. A future campaign at a new
  revision must still run its own cells.
- **It does not extend the campaign-vehicle acceptance** to the second-uid
  cell, the Windows named pipe, any non-Linux cell, or any other observation
  the served endpoint cannot carry.
- **It does not close `C-09`.** The arbitrary single-scope live grant stays
  deferred to bitty#2917, and it keeps `P0-AC-022` short of `Verified` exactly
  as the matrix records.

## Effect on the registers

- The [evidence matrix](../evidence-matrix.md) adds this review to the campaign
  list and to the residual-cells prose: the independent-review bullet now
  records an agent-tier review for the covered cells instead of a bare absence,
  with the owner sign-off still owed.
- The [risk register](../risk-register.md) gains one paragraph after the
  2026-11-20 record's: this review confirms that record's verifying cells,
  accepts the campaign vehicle, and moves no row.
- The [P0 acceptance criteria](../p0-acceptance-criteria.md) campaign-status
  section names this review and restates the per-criterion no-flip verdict.
- No `State`, `Status`, or tier token changes anywhere.

## Residuals

1. **Second-uid containment — still unrun, still the `P0-AC-021` blocker.**
   The run needs a privileged operator or a second local account; the commands
   are recorded in the 2026-11-20 record's residual blocker 1.
2. **Owner/human sign-off — still owed.** This review is agent-tier evidence.
   The corpus's `Verified` stays reserved for the independent security-auditor
   sign-off per the evidence plan's rule 6.
3. **`P0-AC-023` child-token expiry, the live DevTools endpoint, the
   hostile-output replay, the Windows and second-host cells, and `C-09`** —
   unchanged, each carried by the record or issue that owns it.
4. **A frozen lifecycle vector.** The campaign-vehicle acceptance would be
   superseded — improved, not revoked — by a frozen `bitty#2605` harness vector
   that drives the negotiate/create/attach/detach/abort sequence, so future
   campaigns need no private client. That is a product/test change, recommended
   here, out of scope for a read-only review.

## References

- [bittyd No-TCP, Lifecycle, and Plugin-Denial Record 2026-11-20](bittyd-no-tcp-lifecycle-2026-11-20.md)
- [P0 acceptance criteria](../p0-acceptance-criteria.md)
- [Evidence matrix](../evidence-matrix.md)
- [Risk register](../risk-register.md)
- [bittyd P0 evidence plan](../bittyd-p0-evidence-plan.md)
- [bittyd P0-AC-024 Channel-Separation and Confused-Deputy Record 2026-11-19](bittyd-ac024-channel-separation-2026-11-19.md)
- [bittyd P0-AC-025/026 DevTools and Trace Record 2026-11-19](bittyd-ac025-026-devtools-2026-11-19.md)
- [bittyd Exit-Code Matrix Record 2026-11-19](bittyd-exit-code-matrix-2026-11-19.md)
- [Threat model](../threat-model.md)
- [Security overview](../overview.md)
