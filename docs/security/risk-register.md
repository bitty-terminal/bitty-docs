---
title: Security Risk Register
description: Tracks security risks at Pre-alpha / Engineering Milestones M1-M8 (18 crates 310bf87, 54 OQs Accepted, 46 Open), severity, likelihood, required mitigation evidence, stages, and review cadence.
category: security
audience: security-reviewer
document_type: register
status: draft
website_publish: true
sidebar_order: 32
---

# Security Risk Register

Status: **Pre-alpha / Engineering Milestones M1-M8** (2026-10-02, `bitty` `310bf87` previous `2cb49af` baseline `de134ec`, 18 crates,
54 OQs `Accepted` and 46 `Open`, compat-lab/perf hardening and UX wave through `29772a3` plus semantic-terminal P1-P5 `Implemented`-only plus scrollbar overlay `Implemented`-only plus workspace/frameHash wave `Implemented`-only plus the `v0.0.20` and `v0.0.21` plugin-runtime, Kitty-graphics, decoration, config-matrix, and release waves plus experimental slice `c0aadd2`/`7e3104d`/`a8735d0`, plus the retirement of `bitty-core` and `bitty-panels` and the native component broker (DIR-030, `bitty#1603`, `bitty#1604`) narrowing the workspace to 18 crates, with bounded VT payload types (`crates/bitty-vt/src/bounded.rs`) and post-release security, IPC-service, execution-supervisor, and release-pipeline hardening through `310bf87`. The v0.0.21 security-closure records are `Implemented`-only evidence pending independent auditor review; they do not move any risk state.
`R-002`, `R-003`, and `R-005` are `Mitigated`; `R-001`, `R-004`, and
`R-006`..`R-022` are `Open` as of `bitty` `27807ef0` (2026-10-21), recorded
per row in the [Phase E evidence ledger](evidence-matrix.md).
`R-002` moved on the merged
[`rich-image-2026-09.md`](https://github.com/bitty-terminal/bitty-terminal-docs/blob/667c296/security/audits/rich-image-2026-09.md) artifact recorded by
CTX-1050; `R-003` moved on
[`resource-loader-2026-09.md`](https://github.com/bitty-terminal/bitty-terminal-docs/blob/667c296/security/audits/resource-loader-2026-09.md);
`R-005` moved at `bitty` `d4d75e9` (`5bdcdbd`, Issue #137) per PR #144
review. `R-001` is **reopened** to `Open`: its merged
[`vt-parser-2026-09.md`](https://github.com/bitty-terminal/bitty-terminal-docs/blob/667c296/security/audits/vt-parser-2026-09.md) authorization does not
satisfy `P0-AC-002`'s pass threshold, because the recorded runs are a 300 s
bounded campaign (`c17c0cff`, PR #2073) plus 60 s smokes, not the
long-running `cargo-fuzz` campaign the criterion names (F-1). An
authorization to move is not the move, and an unmet threshold is not
mitigation.

`R-006`/`R-007` were `Mitigated` at `0afc94d`/`d4d75e9` and are **reopened**
to `Open` under RS-5: the audited `piccolo 0.3.3` VM was replaced by Phodopus
(PR #1204; `crates/bitty-lua/Cargo.toml` at `27807ef0` pins `phodopus`
`91b8a2c`), so the VM-tier evidence and the PR #145/#146
reviews no longer cover the shipped runtime. The host-side capability,
queue-budget, and lifecycle controls remain evidenced and are not weakened;
the re-review is tracked in the [evidence-matrix follow-up register](evidence-matrix.md#scoped-follow-ups)
as F-3.

`R-004` remains `Open` at `bitty` `7a4ee41` per the 2026-08-31 clipboard audit
with residual platform-backend, real-window UX, and `8192`-byte bound-scope
limits (F-2). All other rows remain `Open` because their evidence is
`Implemented`, not `Verified`, per the
[risk evidence RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/risk-evidence-rfc.md);
an authorization to move is not the move, and presence of a mechanism is not
evidence of a passing run.

FIND-0002 remediation wave (2026-09-07, `bitty` origin `main` `1fc6294`):
all 14 open ledger items merged (`ec95c5c` PR #336 through `0cb244d` PR #364
plus `0e65f85` PR #366; see the
[evidence-matrix wave table](evidence-matrix.md#find-0002-remediation-wave-2026-09-07)
for the per-risk mapping). The wave is `Implemented`-only evidence and moves
no row by itself; each affected row's current state is the one in the Phase E
ledger, and no required mitigation below is weakened.
Experimental implementations `c0aadd2` + `7e3104d` + `a8735d0` are `Implemented`
(experimental) not `Verified`/`Compatible`. Canonical snapshot:
[`project-state.json`](../project/project-state.json) (synchronized `310bf87`,
`2026-10-02`, `Pre-alpha / Engineering Milestones M1-M8`, `R-004` `Open`,
`R-002`/`R-003`/`R-005` `Mitigated`, `R-001`/`R-006`/`R-007` `Open`,
experimental `c0aadd2`/`7e3104d`/`a8735d0`
`Implemented` not `Verified`, release `v0.0.21` at `7da6d6f`) validated by
`bun .github/scripts/check-state.mjs`.

The v0.0.21 release records CTX-0680, CTX-0691, and CTX-0701 security-closure
work for R-014, R-015, and R-022. Those records explicitly remain
`Implemented`-only until independent auditor review and the Phase E matrix
transition are recorded; this register therefore keeps those risks `Open`.

The `bittyd` local-daemon transition adds the intake rows `DR-01` through
`DR-08` in [bittyd local-daemon risk intake](#bittyd-local-daemon-risk-intake-ctx-1629).
They are all `Open`, and no daemon control is `Mitigated` or `Verified`: no P0
daemon evidence artifact exists on `main`. They are deliberately not numbered
into the canonical `R-001`..`R-022` table, which is synchronized with
`docs/project/project-state.json` and the P0-AC linkage; promotion to an `R-`
row requires a linked P0-AC criterion and that snapshot update. The accepted
session-host and IPC contracts are normative for the mitigation text; the
pending proof is in the [bittyd P0 evidence plan](bittyd-p0-evidence-plan.md).

Severity combines confidentiality, integrity, availability, and recoverability.
Stage is the latest stage by which the mitigation must exist; it is not a claim
that the risk can be ignored until then.

<!-- markdownlint-disable MD013 -->

| ID    | Risk                                                                                 | Severity | Likelihood | Stage | Required mitigation / exit evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | State     |
| ----- | ------------------------------------------------------------------------------------ | -------- | ---------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| R-001 | Malformed or unterminated VT sequences crash, corrupt, or hang the terminal          | Critical | High       | P0    | Bounded incremental parser; malformed/oversized tests; VT/UTF-8/OSC/DCS/APC fuzz corpus; long-running `cargo-fuzz` campaign with zero crashes, hangs, or memory-safety findings (F-1). The merged [`vt-parser-2026-09.md`](https://github.com/bitty-terminal/bitty-terminal-docs/blob/667c296/security/audits/vt-parser-2026-09.md) artifact authorizes `Open -> Mitigated`, but its basis is retained-corpus replay, so the authorization is recorded without mitigation until the campaign exists.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Open      |
| R-002 | Compressed graphics or rich content causes memory/CPU exhaustion                     | Critical | High       | P0    | Pre-allocation dimensions, decoded-byte and pixel limits; aggregate image budget; decompression-bomb tests; auditor-authorized `Open -> Mitigated` per [`rich-image-2026-09.md`](https://github.com/bitty-terminal/bitty/blob/8e6c8a9/docs/security/audits/rich-image-2026-09.md) (`8e6c8a9`, PR #132), recorded CTX-1050                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Mitigated |
| R-003 | Graphics or structured protocols read/delete arbitrary local files or devices        | Critical | Medium     | P0    | Deny-by-default resource loader; regular-file and approved-path checks; no protocol-directed deletion. Auditor-authorized `Open -> Mitigated` per [`resource-loader-2026-09.md`](https://github.com/bitty-terminal/bitty-terminal-docs/blob/667c296/security/audits/resource-loader-2026-09.md); the loader and its named tests landed at `bitty` `2bf194de` (PR #134, CTX-0090), not at the header's `8e6c8a9` (stale header tracked as F-19 in the ledger); the move is recorded in the Phase E ledger.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Mitigated |
| R-004 | OSC 52 or paste handling leaks clipboard data or executes unintended shell input     | Critical | High       | P0    | Separate read/write policy; read consent; control-character inspection (C0 excl tab/NUL/ESC/CR/LF/C1/BiDi) with `23` `suspicious_paste` (`19` baseline at `de134ec` + `4` remediation at `7a4ee41`) + `13` `paste` unit + `CLIPBOARD_MAX_BYTES=8192` char-boundary bound and bracketed `?2004` defense-in-depth; audit at `7a4ee41` keeps **Open** due to residual platform-backend (`arboard` X11/Wayland/macOS/Windows), real-window UX, and `8192` post-acquisition bound-scope gaps (see [evidence-matrix.md](evidence-matrix.md))                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Open      |
| R-005 | OSC 8 or rich links invoke dangerous schemes or shell interpolation                  | High     | Medium     | P0    | `bitty-platform` `url.rs` allowlist `http`/`https`/`mailto`/`file` with one-layer percent-decode, `URL_MAX_LEN 4096`, `ValidatedUrl`, file authority-free `file:///` with `..` and encoded traversal deny, `bitty-rich` `hyperlink.rs` `is_safe_hyperlink_uri` + `hyperlink_at` `checked_mul` overflow safe, `bitty-runtime` `ActivationGesture` single-use + `intercept_open_url` veto-wins + re-validate at spawn (`5bdcdbd`, Issue #137); adversarial URI corpus zero shell interpolation, 4096/1024 table bounds, crate-private `ValidatedUrl` only                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Mitigated |
| R-006 | Plugin gains ambient filesystem, process, network, clipboard, or runtime authority   | Critical | High       | P0    | `bitty-plugin-host` `capability.rs` closed set `CapabilityId` 512B, controls and unicode whitespace deny, `CapabilityFamily::denied_without_grant` + `closed_identifiers`, `grant.rs` `is_granted` intersects declared+granted+hash, `manifest.rs` fs pattern control deny, `trust_levels.rs`/`effective.rs` trust-level admission before the grant intersection, `secret_tiers.rs`/`credential_ref.rs` per-tier consent and credential exclusive-or gates. Host-side capability controls remain evidenced. OS-level exec confinement for admitted tool spawns is recorded in [Sandbox confinement posture](sandbox-posture.md) (`Implemented`-only; Linux Landlock enforced, macOS/Windows refuse fail-closed). The plugin VM is Phodopus since PR #1204 (`crates/bitty-lua/Cargo.toml` at `27807ef0` pins `phodopus` `91b8a2c`), not the audited `piccolo 0.3.3`, so the restricted-stdlib (P0-AC-011) and VM-isolation tiers are reopened for re-review at the current pin (F-3 in [evidence-matrix.md](evidence-matrix.md#scoped-follow-ups)). | Open      |
| R-007 | Plugin crash, loop, callback storm, or allocation blocks the terminal                | Critical | High       | P0    | Per-plugin VM isolated `PluginId`+generation with `forbid(unsafe_code)` crate roots, instruction, wall, and memory budgets enforced per VM, `Host::publish`/`EventPipeline::publish` queue budgets PerSub `64` strict / PerPlugin `1024` events/`256 KiB` / Global `8192`/`2 MiB` DropOldest hard-gated, attribution `PluginId`+generation `VmBudgetSnapshot`, transactional `reload` with generation-overflow fail-closed. Queue and lifecycle controls remain evidenced. The VM is Phodopus since PR #1204 (`crates/bitty-lua/Cargo.toml` at `27807ef0` pins `phodopus` `91b8a2c`), so the `piccolo`-era `measurement_lua.rs` run and PR #146 review are stale for the VM budget; re-review at the current pin is F-3.                                                                                                                                                                                                                                                                                                                           | Open      |
| R-008 | Plugin or protocol handler mutates Terminal Truth and breaks TUI/input integrity     | High     | Medium     | P0    | Core-owned canonical state; presentation-only API; high-risk protocol registration capability                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Open      |
| R-009 | User cannot recover from a broken or hostile plugin/configuration                    | Critical | Medium     | P0    | `bitty --safe`, minimal built-in config, no third-party load, targeted plugin disable tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Open      |
| R-010 | Project configuration executes when entering an untrusted clone                      | Critical | High       | P1    | Declarative format by default; Once/Always/Reject approval bound to canonical path and content hash                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Open      |
| R-011 | IPC client reads terminal data, injects input, kills processes, or changes config    | Critical | High       | P0    | Current-user endpoint/ACL, peer credentials, no default TCP, per-action scopes, negative auth tests. The `bittyd` transition extends this row: owner-private endpoint, peer capture before parsing, per-message `SCM_CREDENTIALS` on Linux, captured-peer re-check before privileged actions, and no weaker transport; see `DR-01`/`DR-02` and the [bittyd P0 evidence plan](bittyd-p0-evidence-plan.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Open      |
| R-012 | Scoped child credential leaks through environment or SSH and becomes runtime admin   | Critical | Medium     | P0    | No admin token in child environment; short-lived current-terminal scope; credential-leak tests. The daemon child path adds an explicit bounded environment, close-on-exec completeness proven by a child `/proc/self/fd` scan that must show only the PTY slave on stdio, and no control token or operator capability; see `DR-07` and the [bittyd P0 evidence plan](bittyd-p0-evidence-plan.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Open      |
| R-013 | Agent treats hostile terminal output as instructions and becomes a confused deputy   | Critical | High       | P0    | Untrusted-observation labeling, read-only default, per-client consent, separation from FS/network authority. The daemon baseline excludes `session.host`, keeps `worker_sessions=false`, and gives an Agent no content authority from a session lease; see `DR-03` and the [bittyd P0 evidence plan](bittyd-p0-evidence-plan.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Open      |
| R-014 | DevTools, traces, or crash reports expose secrets, input, clipboard, or environment  | Critical | High       | P1    | Inspect/trace/control scopes; typed redaction; minimal defaults; opt-in input; mode `0600`; export preview. The daemon audit and diagnostic path is content-free and digest-only, with redacted `Debug`, disabled core dumps, and a bounded owner-private sink; see `DR-04` and the [bittyd P0 evidence plan](bittyd-p0-evidence-plan.md).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Open      |
| R-015 | Malicious/compromised plugin update or dependency enters the trusted runtime         | Critical | High       | P0    | Exact lock, checksum, manifest hash, no post-install, transactional activation, rollback                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Open      |
| R-016 | Plugin update silently requests broader capabilities                                 | Critical | Medium     | P1    | Capability diff blocks update; explicit review and approval; downgrade/rollback path                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Open      |
| R-017 | Native in-process plugin bypasses Lua capability controls                            | Critical | Medium     | P0    | Reject `.so`/`.dll`/`.dylib` plugin payloads through P1; scoped helper/WASM design for later                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Open      |
| R-018 | Unsafe/FFI bug in PTY, graphics, font, window, or Lua adapter compromises Bitty      | Critical | Medium     | P0    | Unsafe allowed only in narrow adapters, explicit `SAFETY` rationale, lint gate, focused review/fuzzing; the `bitty-sandbox` Landlock shim is one such adapter, posture in [Sandbox confinement posture](sandbox-posture.md)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Open      |
| R-019 | Rust dependency is vulnerable, unmaintained, disallowed, or from an untrusted source | High     | Medium     | P0    | Locked dependencies; advisory/license/source/banned checks; update and exception policy                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Open      |
| R-020 | Remote-origin detection is wrong and applies a permissive local policy               | High     | Medium     | P0    | `Unknown` is restrictive; origin detection is advisory; explicit user override and tests                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Open      |
| R-021 | Markdown/rich rendering introduces script execution or unrestricted local resources  | Critical | Medium     | P0    | Markdown-to-constrained-AST/scene pipeline; no WebView scripts; shared resource/URI policies                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Open      |
| R-022 | Plugin package install executes attacker-controlled setup code                       | Critical | Medium     | P0    | No `postinstall` or install-time plugin execution; verify/store only; first execution after authorization                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Open      |

<!-- markdownlint-enable MD013 -->

## bittyd local-daemon risk intake (CTX-1629)

The accepted [bittyd Session-Host Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-session-host-contract.md)
and [bittyd IPC Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/bittyd-ipc-contract.md)
introduce a same-user local daemon with an owner-private endpoint, a new scope
family, host and observer grants, a control token, an audit sink, two-phase
orphan recovery, and bounded idempotency stores. The rows below are
**daemon-intake** entries: they track the new failure modes before
implementation evidence exists and they do not enter the canonical `R-`
sequence. Every row is `Open`. Some rows, notably the same-uid operator and
debugger residuals, are accepted limitations of the trust model rather than
defects to close; they still stay `Open` until the review records the residual
and the evidence plan proves the surrounding fail-closed behavior. A row may
not become `Mitigated` until the linked P0-AC criterion has a recorded,
reviewed artifact on the real service; a fake-server result, a unit test, or a
code presence is not evidence. The producers and pending rows are in the
[bittyd P0 evidence plan](bittyd-p0-evidence-plan.md).

<!-- markdownlint-disable MD013 -->

| ID    | Risk                                                                                                                    | Severity | Likelihood | Stage | Contract controls | Existing risk | Required mitigation / exit evidence                                                                                                                                                                                                                                                                                                                                                                                                    | State |
| ----- | ----------------------------------------------------------------------------------------------------------------------- | -------- | ---------- | ----- | ----------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| DR-01 | A same-uid process or owner-run adapter crosses the operator intent gate and acts as daemon operator                    | Critical | High       | P0    | D-07, D-08        | R-011, R-013  | Owner-private `0700`/`0600` capability rotated per boot, handshake-only, attributed mint/consume/revoke, plugin `connect()` denial, and an explicit statement that this is an intent gate, never an isolation boundary; `C-15`, `C-16`; no claim that the capability is hidden from the owner                                                                                                                                          | Open  |
| DR-02 | Endpoint impostor, tampered endpoint, inherited descriptor, or second instance crosses the local transport boundary     | Critical | Medium     | P0    | D-07, D-15        | R-011         | `0700` directory and `0600` socket or current-user pipe; peer capture before parsing; Linux per-message `SCM_CREDENTIALS`; captured-peer re-check before every privileged action; tamper detection exits `6`; single-instance lock; no TCP, abstract socket, or `/tmp` fallback; `V-25`, `V-26`, `V-28`, `C-02`, `C-16`                                                                                                                | Open  |
| DR-03 | A session scope, observer grant, or control-token bypass lets a client read, control, or kill another session           | Critical | High       | P0    | D-07, D-08        | R-011, R-013  | Deny-by-default additive `session.*` and `daemon.*`; `session.host` never baseline; create intersects host consent with `process.spawn`; single-use observer grant; 256-bit token rotated on claim/transfer; controller relation necessary and never sufficient; static no-oracle refusals; `C-09`, `C-10`, `C-11`, `C-19`                                                                                                             | Open  |
| DR-04 | Daemon audit, diagnostics, crash output, or idempotency state leaks a token, bearer, argv, env, or terminal content     | Critical | High       | P0    | D-08, D-16        | R-014         | Content-free audit fields, digest-only `terminal_id` and correlation, bounded UTF-8 strings, refusal budget and aggregation, `0700`/`0600` sink, rotation with bounded tail loss, redacted `Debug`, no core dumps, create keys treated as token-equivalent secrets; `C-07`, `C-14`                                                                                                                                                     | Open  |
| DR-05 | Version or capability negotiation degrades to a weaker surface, or an unsupported cell falls back to a weaker transport | High     | Medium     | P0    | D-11, D-15        | R-011         | Two version axes with typed refusal before any operation; one major at a time; immutable capabilities; no probe downgrade or translated major; unsupported cell returns a typed result or no endpoint; no anonymous or weaker peer check; `V-01`, `V-02`, `C-09`                                                                                                                                                                       | Open  |
| DR-06 | Crash recovery reaps an unrelated process or a retry spawns a duplicate worker                                          | Critical | Medium     | P0    | D-06              | R-011, R-012  | Two-phase reserve/commit journal with fsync; cgroup v2 or pidfd-tracked subreaper containment identity; reserve before spawn; exact-match reap only; pid reuse, missing pid, and unverifiable records quarantined and never signalled; startup scan before endpoint bind; crash injection; `C-03`, `C-13`                                                                                                                              | Open  |
| DR-07 | A spawned worker inherits a daemon descriptor, environment secret, control token, or operator capability                | Critical | Medium     | P0    | D-07              | R-012         | Explicit bounded child environment, never the daemon environment; every daemon descriptor closed before `exec` or close-on-exec, with the child `/proc/self/fd` scan as the proof; only the PTY slave on stdio; no control token, operator capability, host-grant bearer, or service token in the child; `C-12`. Open on bitty#2824 (three extra stdio-dup fds) and bitty#2823 (no pre-exec close seam or dropped-flag negative test). | Open  |
| DR-08 | The daemon becomes a startup, diagnostics, or safe-mode dependency, or a hidden listener exists                         | High     | Medium     | P0    | D-01, D-05, D-15  | R-009, R-011  | `bitty --safe`, headless tests, CI, and a plain invocation work with no endpoint and no daemon process; no hidden listener; missing endpoint is a typed supported state; no TCP, abstract socket, or `/tmp` fallback; `C-08`, `V-28`, `P0-AC-019`                                                                                                                                                                                      | Open  |

<!-- markdownlint-enable MD013 -->

### Contract decision mapping

<!-- markdownlint-disable MD013 -->

| Contract decision | Subject                                                            | Intake rows         | Existing rows       | State |
| ----------------- | ------------------------------------------------------------------ | ------------------- | ------------------- | ----- |
| D-07              | Authorization, scopes, control token, host grants, observer grants | DR-01, DR-03, DR-07 | R-011, R-012, R-013 | Open  |
| D-08              | Client identity, correlation hashing, and audit attribution        | DR-01, DR-03, DR-04 | R-011, R-013, R-014 | Open  |
| D-11              | Service version, capabilities, and no downgrade                    | DR-05               | R-011               | Open  |
| D-15              | Platform cells, peer mechanism, and no weaker transport            | DR-02, DR-05, DR-08 | R-009, R-011        | Open  |
| D-16              | Audit content, target fields, attribution, and diagnostics         | DR-04               | R-014               | Open  |
| D-06 (supporting) | Crash, restart, orphan reaping, and no adoption                    | DR-06               | R-011, R-012        | Open  |

<!-- markdownlint-enable MD013 -->

No row is `Mitigated`. The `C-*` and `V-*` contract vectors are proof
obligations, not evidence, and the fake server never satisfies a real-service
row. `DR-01` and `DR-03` keep the same-uid residual explicit: a same-user
process can read the operator capability and a client debugger can read the
control token from client memory. Those residuals are tested and recorded, not
claimed closed.

### Promotion rule

An intake row becomes a canonical `R-` row only when all three conditions hold:

1. an accepted P0-AC criterion owns the failure mode and appears in the
   coverage traceability table;
2. the `docs/project/project-state.json` snapshot records the new row and the
   `check-state` validator accepts the count;
3. the evidence plan has a producer and an owner, even while the row remains
   `Open`.

Until then, `DR-*` is the tracking identity and the canonical `R-` state is
unchanged.

## FIND-0002 remediation wave residuals (2026-09-07, Implemented-only)

The wave closes the code defects; it does not close the risks. Residuals per
affected row, all `Open` pending the recorded matrix review (except `R-002`
and `R-003`, `Mitigated` on their auditor artifacts with residuals below):
R-001 stays `Open` because its merged audit `vt-parser-2026-09.md` covers the
parser family only and the `P0-AC-002` long-running `cargo-fuzz` campaign is
still outstanding (F-1); R-002
keeps decompression-bomb proof review for the headless surface cap (its merged
audit `rich-image-2026-09.md` likewise authorized, recorded via CTX-1050); R-003
keeps negative-loader review for the empty-roots rejection; R-004 keeps
consent-matrix review for the OSC 52 read reply plus write decode; R-011
keeps negative-auth review for the symlink attestation; R-015/R-022 keep
tamper-suite review for the prune ceiling plus TOFU fail-closed; R-016 keeps
capability-diff review for the manifest-time closed set; R-021 keeps
AST-pipeline review for Scene-admission SCN-1..3; R-007 keeps
fault-injection review for the fuel step slice. Tooling items
(`CR-COMPAT-01`, `CR-APP-01`, `CR-UI-01`) carry no risk residual.

## Review cadence (engineering milestones)

- Review this register when a trust boundary, protocol, capability, package
  source, IPC method, or data-recording feature changes; each `Implemented`
  crate (`ipc`, `rich`, `resolver` hardening through `1835175`) must link
  headless evidence but stays `Open` until `Verified`, except
  `R-002`/`R-003`/`R-005` `Mitigated` (R-002 recorded via CTX-1050, R-003 on
  the resource-loader audit, R-005 at `d4d75e9` per RS-1..RS-7).
  `R-004` links `7a4ee41` (`de134ec` baseline) `23`+`13`+`4` tests and the
  2026-08-31 clipboard audit, and remains `Open` due to residual platform-backend,
  real-window UX, and `8192` bound-scope limits; `R-001` links `8c41f1e`
  (audit `vt-parser-2026-09.md`, PR #130) plus `5daf686` `cargo-fuzz` targets
  (PR #1160) and `R-002` links `8e6c8a9` (audit `rich-image-2026-09.md`,
  PR #132), and is `Mitigated` with the auditor-authorized
  `Open -> Mitigated` transition recorded in the matrix (CTX-1050); `R-001`'s
  authorization is recorded but the row is reopened because `P0-AC-002`'s
  campaign threshold is unmet (F-1);
  `R-005` links `5bdcdbd` hyperlink allowlist + activation gate and is
  `Mitigated` with a residual live-UX gap. `R-006` links `0afc94d` and `R-007`
  links `d4d75e9`; both were `Mitigated` and are reopened `Open` under RS-5
  because the audited `piccolo` VM was replaced by Phodopus (PR #1204);
  host-side capability and queue controls remain evidenced (F-3).
- Link new implementation tasks to the relevant risk IDs. The daemon-intake
  rows `DR-01` through `DR-08` are reviewed when the bitty#2607 service loop or
  the session-host contract changes, and are promoted only under the
  [promotion rule](#promotion-rule).
- Keep a residual risk open when only part of its exit evidence exists
  (`Implemented` without `Verified` is still `Open` per risk evidence RFC).
- Reassess likelihood after fuzzing, incident reports, dependency advisories, or
  ecosystem growth; do not lower severity merely because code is incomplete.
- Evidence matrix: [evidence-matrix.md](evidence-matrix.md) Phase E draft covers
  R-001..R-022 vs P0-AC-001..034 with implementation, test, CI, adversarial and
  audit columns; no risk moves to `Mitigated` until the per-risk checklist in
  [risk evidence RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/risk-evidence-rfc.md)
  RS-1..RS-7 is satisfied, `just check` plus `act -n` are green, and CarryCtx
  linkage is recorded; `R-002` moved `Open -> Mitigated` on its auditor
  authorization recorded via CTX-1050, `R-003` moved on the resource-loader
  audit, `R-005` moved at PR #144 independent review,
  `R-001` is reopened `Open` because `P0-AC-002`'s campaign threshold is
  unmet, and `R-006`/`R-007` are reopened `Open` under RS-5 after the Phodopus
  swap;
  `R-004` remains `Open` per 2026-08-31 audit. The Phase E ledger now covers
  P0-AC-001..039.
