---
title: Sandbox Confinement Posture
description: Accepted inherited-exec confinement posture for admitted plugin tool spawns with Linux Landlock enforcement and fail-closed refusal on other platforms
category: security
audience: security-reviewer
document_type: policy
status: accepted
website_publish: true
sidebar_order: 37
---

# Sandbox Confinement Posture

## Document status

**ACCEPTED posture record.** The owner accepted the current posture in
[bitty #2067](https://github.com/bitty-terminal/bitty/issues/2067); CTX-0297
records it here. This page states what the merged implementation does at
`bitty` `10804c5`, what it deliberately refuses to do, and which requirements
any future platform implementation must meet. It narrows nothing in the
[extension execution mediation](extension-execution-mediation.md) contract and
moves no risk state.

The evidence is `Implemented`-only. No control named here is `Verified`: the
per-OS inventory, call sites, and tests below are merged and present at the
cited revision, but no independent security audit or recorded platform run log
is attached to this page.

## Purpose and scope

Record the accepted OS-level confinement posture for Layer-2 plugin tool
spawns, so the corpus states the confinement guarantee and its limits honestly
rather than implying that argument mediation alone sandboxes an admitted tool:

1. Linux enforcement, including the wired call sites and the tests that prove
   each property.
2. The macOS and Windows refusal, the user-visible error shape, and the test
   that pins it.
3. The requirements a future platform implementation must satisfy and the
   trigger that reopens this record.
4. What the posture does **not** cover.

In scope: every admitted Layer-2 tool spawn that reaches the Core execution
choke point, which today means the `git`-only tool slice. Out of scope: PTY
shells (deliberately excluded from the preparer), generic non-tool execution
requests, secret-tier command-reference helpers, the plugin VM boundary, the
spawn audit ledger, and the extension supply chain; each keeps its own
contract.

## Normative sources this document must not weaken

This page is read together with, and must not weaken:

- the [security overview](overview.md) (security invariants 2, 8, 9, and 10),
  the [threat model](threat-model.md) (abuse cases T-06, T-11, and T-12), the
  [risk register](risk-register.md), the
  [P0 acceptance criteria](p0-acceptance-criteria.md), and the
  [evidence matrix](evidence-matrix.md);
- the [extension execution mediation](extension-execution-mediation.md)
  guarantee: an admitted spawn either runs with exec confinement armed, or no
  process starts, on every platform;
- the decided direction in
  [bitty #1984](https://github.com/bitty-terminal/bitty/issues/1984)
  (inherited OS confinement for plugin-spawned tools).

Where this page describes a refusal, the refusal is part of the guarantee, not
a gap in the gate. No grant, default, or compatibility claim elsewhere widens
it.

## Terminology

- **Admitted spawn**: one tool request that passed the Layer-2 allowlist
  predicates and the calling scope, consent, and effect gates.
- **Inherited confinement**: an OS restriction applied to the admitted child
  that survives fork and exec, so the child cannot escape through a binary
  feature that execs another program.
- **Posture**: the declared per-OS enforcement state, either `Enforced` or
  `Refused` (`ConfinementPosture::for_os`).
- **Fail-closed refusal**: the spawn is denied before any process exists, with
  a bounded diagnostic; there is no unconfined attempt.
- **Setup failure**: any parent-side or child-side step that could not arm the
  confinement, including a kernel without the facility.

## Accepted posture

| Platform                                          | Mechanism in this slice                                                 | Posture                            | Spawn outcome                                                    |
| ------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------- |
| Linux with Landlock ABI v1+ (kernel 5.13+)        | Landlock `EXECUTE` ruleset, `pre_exec` `no_new_privs` + `restrict_self` | Enforced                           | Runs confined; any setup failure refuses before a process starts |
| Linux without Landlock (old kernel, disabled LSM) | None available at runtime                                               | Enforced (label), refused at setup | `Unavailable` (`unsupported-kernel`), no process starts          |
| macOS                                             | None; a `sandbox-exec` profile is sequel work                           | Refused                            | `Unavailable`, no process starts                                 |
| Windows                                           | None; a Job Object / restricted token is sequel work                    | Refused                            | `Unavailable`, no process starts                                 |
| Other (Android, BSDs, and the rest)               | None                                                                    | Refused                            | `Unavailable`, no process starts                                 |

`ConfinementPosture::for_os` is the pure form of the table: `linux` is
`Enforced`, every other OS label is `Refused`. Kernel capability is not trusted
from the label; the Linux path probes the facility by creating the ruleset and
refuses on failure, so a 5.12 kernel, a kernel built without the Landlock LSM,
or a seccomp filter that denies the Landlock syscalls ends in
`unsupported-kernel` rather than in an unconfined run.

The implementation is an exec-only ruleset. It constrains **which binaries may
exec**; reads, writes, memory maps, and network are unhandled and therefore
allowed. That is the intended scope of this control, not a complete sandbox;
see [What this posture does not cover](#what-this-posture-does-not-cover).

## Linux enforcement and wired call sites

At `bitty` `10804c5`, every admitted Layer-2 tool spawn passes through the
following surfaces. A change that bypasses any of them is a defect, not an
optimization.

| Surface                   | Symbol                                                                                                      | Role                                                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layer-2 IPC provider      | `host_bridge::authorized_execution_provider`                                                                | Authorizes tool plus argv, then calls `spawn_process`; a refusal is `Unavailable`.                                                                        |
| Layer-2 spawn entry       | `plugin_runtime::spawn::spawn_process`                                                                      | Delegates to `spawn_process_with_policy` and then `spawn_supervised`; no direct `Command` spawn exists on this path.                                      |
| Supervisor pre-validation | `execution_jobs::validate_tool_confinement`                                                                 | For an admitted tool, resolves the exec closure and builds the same ruleset before the job registry is asked to track anything; refuses as `Unavailable`. |
| Registry preparer         | `execution_jobs::SandboxPreparer::prepare`                                                                  | Applies the ruleset to the supervisor-built command and hands the `ExecConfinement` guard back to the caller for the duration of the spawn.               |
| Linked-registry path      | `execution_jobs::ToolJobSupervisor::spawn_linked`                                                           | Pre-validates, then creates the job through `JobRegistry::spawn_as`; a repeated preparer failure still fails closed as `SpawnFailed`.                     |
| Component path            | `execution_jobs::component_spec`                                                                            | Refuses to send an admitted tool over the confinement-free component boundary: `Preferred` falls back to the linked path, `Required` fails closed.        |
| Sandbox adapter           | `bitty_sandbox::resolve_tool_execs`, `confine_command_to_execs`                                             | Resolves absolute executables in the parent, validates bounds, dispatches to the platform mechanism, and owns the guard.                                  |
| Linux shim                | `bitty_sandbox::linux::{apply, create_ruleset, add_exec_rule, elf_interp, set_no_new_privs, restrict_self}` | Creates and populates the ABI v1 ruleset in the parent, then arms `no_new_privs` and `restrict_self` in the child's `pre_exec` hook.                      |

The sequencing is part of the control: `PATH` resolution, ruleset creation,
`O_PATH` rule opens, and `add_rule` calls happen in the parent before the fork;
the child hook performs `prctl(PR_SET_NO_NEW_PRIVS)` followed by
`landlock_restrict_self` and nothing else. A rule pins the inode opened at
setup time, so replacing the file between setup and exec can only deny. Each
allowlisted executable contributes at most one rule plus one rule for its ELF
interpreter; script tools contribute no interpreter closure and therefore
refuse at exec instead of gaining a rule that cannot be enforced.

## Tests that prove the Linux posture

All names are present at `bitty` `10804c5`. The first eleven live in
`crates/bitty-sandbox/src/lib.rs`; the last three are the runtime wiring
tests.

| Test                                                        | What it pins                                                                                                                                             |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `posture_enforces_linux_only`                               | `linux` is enforced; `macos`, `windows`, `android`, `freebsd`, `plan9`, and the empty label are refused; the refusal text names the fail-closed degrade. |
| `landlock_probe_succeeds_on_supported_kernel`               | A hard requirement, not a skip: Linux CI must present Landlock ABI v1+, because without it every admitted spawn refuses fail-closed.                     |
| `admitted_exec_runs_under_confinement`                      | The allowlisted binary still execs under the ruleset (reads and maps are unhandled); this is the CTX-1376 regression that removed the old `EPERM` skip.  |
| `confined_child_sets_no_new_privs`                          | The child reports `NoNewPrivs: 1` from `/proc/self/status`, so a reordering or a dropped prerequisite syscall fails the suite.                           |
| `shell_escape_denied_at_os_level`                           | An admitted `sh` tries to exec a non-allowlisted binary and fails (126/127), while the unconfined control runs the same target.                          |
| `non_allowlisted_initial_exec_denied`                       | Even the first exec is checked: a binary outside the allowlist never starts (`EACCES` or a non-zero spawn result, both treated as denial).               |
| `elf_interp_finds_loader_for_dynamic_tools`                 | The ELF interpreter rule is discovered from the binary; a script yields no interpreter rule, so the exec path refuses rather than widening the rule set. |
| `setup_failure_refuses_before_any_spawn`                    | An unopenable rule target returns `SetupFailed` in the parent; `Command::spawn` is never reached, so no child can exist.                                 |
| `confine_rejects_bad_exec_lists_everywhere`                 | Empty, overlong, and oversize exec lists deny on every platform before any platform-specific work.                                                       |
| `resolve_rejects_non_bare_names`                            | Absolute paths, dot segments, separators, NUL, empty, and oversize tool names deny as `invalid-input`.                                                   |
| `resolve_missing_tool_is_unresolvable`                      | A tool that resolves to nothing refuses as `unresolvable-tool`; there is no unconfined fallback to the caller's name.                                    |
| `admitted_git_spawn_runs_under_inherited_confinement`       | End-to-end: an admitted `git status` flows through `spawn_process` and the preparer and must actually start and exit `0` on Linux.                       |
| `admitted_tool_spawns_never_enter_the_component_unconfined` | An admitted tool never reaches the component path, which has no wire field for a ruleset; non-tool requests remain eligible.                             |
| `production_spawn_path_has_no_direct_command_or_pid_kill`   | Source-level guard: `execution_jobs.rs` must still contain `confine_command_to_execs`, and the provider must not spawn or kill directly.                 |

## No silent downgrade

The guarantee is enforced by construction rather than by a warning:

- `linux::apply` maps a failed `landlock_create_ruleset` to
  `SandboxErrorKind::UnsupportedKernel` before the `pre_exec` hook is
  registered. A kernel without Landlock therefore refuses the spawn; it never
  runs the tool unconfined.
- Rule-open and `add_rule` failures map to `SetupFailed` in the parent, still
  before any fork.
- The child's `pre_exec` hook returns an error on a failed `no_new_privs` or
  `restrict_self`, which makes `Command::spawn` fail in the parent. A
  confinement that could not be armed cannot silently become an unconfined
  exec.
- The `ExecConfinement` guard owns the ruleset fd and must outlive
  `Command::spawn`; dropping it only closes the fd after the spawn has
  returned.
- CTX-1376 removed the previous test skip on `EPERM`. A host where the child
  hook fails now fails the suite and the spawn instead of being reported as a
  policy skip.

Honest limit: the `unsupported-kernel` arm cannot be executed on CI kernels
that carry Landlock. It is pinned by the error mapping in `apply` and
`create_ruleset` and by `landlock_probe_succeeds_on_supported_kernel` as a hard
requirement, not by a run on a deliberately crippled kernel. That gap is
recorded in [Open points](#open-points), not hidden.

## macOS and Windows refusal

No confinement mechanism ships for macOS or Windows. The adapter therefore
returns `SandboxErrorKind::UnsupportedPlatform`, and the runtime pre-validation
turns that into `IpcError::Unavailable` **before** a job is registered. No
process starts, no output is produced, and there is no retry, fallback, or
"run once unconfined" mode.

The runtime composes the diagnostic as
`tool spawn confinement refused '<tool>': <sandbox error>`, where the sandbox
error text is bounded to 96 bytes. For the only admitted tool today the
delivered reason is:

```text
tool spawn confinement refused 'git': tool spawn confinement unsupported-platform: inherited exec confinement is Linux-only in this sl
```

The cut is the 96-byte bound, not a typo: the class
(`unsupported-platform`), the tool name, and "Linux-only" survive; the sequel
parenthetical is truncated. Over `bitty-ipc` this surfaces as the
`unavailable` error class with the reason above. A plugin tool call therefore
fails rather than running unconfined, and the failure is attributable to
confinement instead of looking like a generic spawn error.

The test that pins the runtime behaviour is
`admitted_tool_spawn_refused_fail_closed_off_linux` in
`crates/bitty-runtime/src/plugin_runtime/spawn.rs`:

- it is compiled under `#[cfg(not(target_os = "linux"))]`;
- it asserts `IpcError::Unavailable` and that the diagnostic contains
  `confinement`;
- the `macos-15` and `windows-latest` CI jobs run the whole workspace suite
  (`cargo nextest run --workspace`), so the test is executed on both platforms
  rather than only type-checked.

`posture_enforces_linux_only` pins the OS-label mapping on every host,
including Linux. No run log at the cited revision is recorded in this corpus,
so the platform rows stay `Implemented`, not `Verified`.

## Requirements for a future platform implementation

A macOS `sandbox-exec` profile, a Windows Job Object or restricted token, or any
other OS mechanism may replace a `Refused` row only by meeting all of the
following. Partial satisfaction keeps the row `Refused`.

1. **Deny by default.** With no applicable rule the operation is denied. An
   empty, missing, or unparseable policy is an error, never "unconfined".
2. **Explicit allowlist.** Grant exactly the admitted executable by file
   identity, plus the minimum loader or interpreter closure the OS needs. No
   directory-wide, `PATH`-wide, or ambient inheritance grant, and no grant
   derived from the caller's environment.
3. **No network by default.** A platform claim that covers network must start
   from deny and add explicit destinations. The shipped Linux slice handles
   exec only, so no platform may describe the current posture as
   network-confining; adding a network class is a new control with its own
   threat-model entry, tests, and risk mapping.
4. **Bounded resources.** Keep explicit bounds for rule count, path length,
   `PATH` search depth, diagnostic size, and any timeout or output budget, and
   refuse on overflow instead of truncating into a wider policy. CPU, memory,
   disk, and process-count limits are explicit additions, never implied by
   "confinement".
5. **No unconfined fallback.** Probe the facility, refuse before the fork when
   it is absent, and abort the spawn when a child-side step fails. Tests must
   fail, not skip, when the mechanism is missing. A platform or kernel version
   without the facility is unsupported, not degraded.
6. **Verifiable on that platform.** Platform CI must observe a denied escape, a
   successful admitted exec, the refusal path, and the posture table for every
   OS label. A compile-only job is not verification; an independent reviewer
   must accept the run log before any `Verified` claim.
7. **Same wiring discipline.** Set up in the parent before the fork, keep the
   child hook minimal and async-signal-safe, keep the guard alive until spawn
   returns, and route every admitted-tool path through the same choke point. A
   component or out-of-process path without a confinement field must refuse
   admitted tools rather than carry them unconfined.

## Revisit trigger

Reopen this record, and re-review the affected row, when any of the following
happens:

- a macOS, Windows, or other platform confinement implementation is proposed,
  which may move its row from `Refused` to `Enforced` only with the platform CI
  evidence required above;
- the `v0.2.0` milestone exit review recorded in
  [bitty #2067](https://github.com/bitty-terminal/bitty/issues/2067), or any
  release claim that implies cross-platform plugin tool execution;
- a newly admitted tool is a script, needs a shebang interpreter closure, or is
  statically linked in a way the current discovery does not cover;
- the supported Landlock ABI, the minimum kernel, or the LSM policy changes;
- `confine_command_to_execs`, `SandboxPreparer`, `validate_tool_confinement`,
  `component_spec`, or `spawn_process` changes shape;
- a reviewed escape or incident shows that one of the uncovered classes below
  (ptrace, seccomp, cgroups, network, or filesystem) matters to the accepted
  threat model for admitted tools.

## What this posture does not cover

The control is `EXECUTE`-only. The following remain outside it, and are stated
so no reader mistake this record for a complete process sandbox:

- **ptrace and process inspection.** A confined child can still attach to,
  read, or inject into same-UID processes where the OS allows it; no `PTRACE`
  restriction is installed.
- **seccomp.** No syscall filter is installed. The child may call any syscall
  its credentials allow, including `fork`, `clone`, and `ptrace`; children
  inherit the Landlock restriction but are not syscall-restricted.
- **cgroups and rlimits.** No CPU, memory, PID, or disk quota is applied by
  confinement. The execution supervisor's timeouts and output budgets bound
  one request; they are not OS resource confinement.
- **Filesystem read and write.** Reads, writes, and memory maps are unhandled,
  so the tool can read and write wherever the user's credentials allow. Only
  exec is constrained.
- **Network.** Egress is unhandled and therefore allowed.
- **Signals.** A confined child can signal other same-UID processes; the
  posture does not add a signal boundary.
- **Script and shebang tools.** They refuse fail-closed because their
  interpreter closure cannot be enumerated safely; they are unsupported, not
  partially confined.
- **PTY shells and generic execution.** PTY ownership stays with the terminal
  primitive and non-tool execution requests carry no allowlist basis; neither
  passes through this preparer.
- **Secret-tier command-reference helpers.** Deliberately unwired; they are
  operator-configured programs that frequently need `sh` and other tools.
- **The plugin VM.** The Lua VM is a namespace and failure boundary, not an OS
  sandbox; its restricted standard library is a separate control.
- **The spawn ledger and the supply chain.** Audit attribution, hash pins, and
  signatures are separate contracts; this page does not weaken or replace them.
- **The Bitty host process.** Confinement applies to admitted children, not to
  Core, and never substitutes for the capability and consent gates.

## Security review

The threat this control addresses is the GTFOBins-class escape described in
[What the allowlist alone does not stop](extension-execution-mediation.md#what-the-allowlist-alone-does-not-stop):
an admitted `git` can exec a pager, editor, diff driver, or hook that the
argument gate never sees. With Landlock armed, that inner exec fails at the OS
level, so the escape hatch stops being a sandbox escape.

Review state:

- owner acceptance is recorded in
  [bitty #2067](https://github.com/bitty-terminal/bitty/issues/2067);
- the Linux mechanism and its tests are merged and present at `bitty`
  `10804c5`;
- independent security review and a recorded platform run log are **pending**,
  so no row moves to `Verified` and no risk moves out of `Open`;
- the `bitty-sandbox` Landlock shim is one of the reviewed `unsafe` boundaries
  listed under risk `R-018`; its unsafe-block audit is the open follow-up
  `F-14`, not something this page claims as complete.

## Verification plan

- Positive path: `admitted_exec_runs_under_confinement`,
  `admitted_git_spawn_runs_under_inherited_confinement`.
- Negative path: `shell_escape_denied_at_os_level`,
  `non_allowlisted_initial_exec_denied`.
- Prerequisite and ordering: `confined_child_sets_no_new_privs`,
  `landlock_probe_succeeds_on_supported_kernel`.
- Setup and input bounds: `setup_failure_refuses_before_any_spawn`,
  `confine_rejects_bad_exec_lists_everywhere`,
  `resolve_rejects_non_bare_names`, `resolve_missing_tool_is_unresolvable`.
- Non-Linux refusal: `posture_enforces_linux_only` on every host and
  `admitted_tool_spawn_refused_fail_closed_off_linux` on the macOS and Windows
  CI jobs.
- Bypass guard: `admitted_tool_spawns_never_enter_the_component_unconfined`,
  `production_spawn_path_has_no_direct_command_or_pid_kill`.
- A `Verified` claim additionally needs an independent auditor-signed artifact
  and a recorded green platform run at the claimed revision. The tests above
  are necessary evidence, never sufficiency on their own.

## Alternatives considered

- **Gate-only allowlist, run unconfined.** Rejected: the argument allowlist is a
  speed bump against a binary that can exec from inside; this is the defect
  [bitty #2067](https://github.com/bitty-terminal/bitty/issues/2067) names.
- **Run unconfined with a warning.** Rejected: a warning is a silent downgrade
  in practice, and the accepted guarantee is "confined or no process".
- **Ship a macOS `sandbox-exec` profile now.** Deferred: no profile has been
  written, and verification needs a platform run that observes denial; the row
  stays `Refused`.
- **Ship a Windows Job Object or restricted token now.** Deferred for the same
  reason; the mechanism and its token design are sequel work.
- **Add seccomp, cgroups, and a filesystem policy to this slice.** Rejected as
  scope: it would widen the reviewed mechanism and its threat model far beyond
  exec confinement, and the uncovered classes are stated instead.
- **Skip on `EPERM` like the earlier test helper did.** Rejected and removed by
  CTX-1376: the skip hid a real defect that refused every admitted spawn and
  silenced every confinement assertion.

## Affected contracts

- [Extension execution mediation](extension-execution-mediation.md): normative
  allowlist and inherited-confinement guarantee; this page supplies the
  per-OS evidence inventory and must not weaken it.
- [Risk register](risk-register.md): `R-006` (ambient process authority) is the
  primary row; `R-018` covers the Landlock shim's `unsafe` boundary.
- [Evidence matrix](evidence-matrix.md): the `R-006` row cites this record as
  `presence`-tier posture evidence; the matrix remains authoritative for risk
  state.
- [Security overview](overview.md) and [threat model](threat-model.md):
  invariants 2, 8, 9, and 10; abuse cases T-06, T-11, and T-12.
- `bitty` `crates/bitty-sandbox/README.md`: crate-local map that defers the
  canonical contract to this corpus.
- The `bitty-ipc` execution error class `Unavailable` and the Layer-2 tool
  surface: the refusal is part of the caller-visible contract.

## Open points

1. **macOS and Windows mechanisms.** No implementation and no observed platform
   denial; both rows stay `Refused` until a mechanism and its platform evidence
   land.
2. **Confinement classes beyond exec.** Filesystem writes, network egress,
   ptrace, seccomp, cgroups, and signals are uncovered by this control. Any one
   of them becoming required is a new control with a new threat-model entry,
   tests, and risk mapping, not an extension of this page by implication.
3. **Landlock ABI scope.** The shim pins ABI v1 and does not negotiate newer
   ABIs or use newer access classes; a newer kernel adds no enforcement here.
4. **Script tools.** Shebang tools refuse. Supporting them needs an explicit,
   bounded interpreter closure and a test that the closure cannot widen.
5. **Kernel floor.** Linux without Landlock (pre-5.13, LSM disabled, or syscalls
   denied by seccomp) is unsupported for admitted tools. There is no fallback,
   and the refusal reason is the only in-product signal this record relies on.
6. **Run-log and audit evidence.** The Linux suite is a hard CI requirement and
   the non-Linux refusal test runs in the platform jobs, but no run log or
   independent audit is recorded at `10804c5`; closure still needs both.
7. **Component boundary.** The component path has no wire field for a
   confinement ruleset, so `Preferred` falls back to the linked path and
   `Required` refuses admitted tools. A future component protocol that carries
   confinement must prove equivalence before it may accept admitted tools.
8. **Unsafe shim audit.** `crates/bitty-sandbox/src/linux.rs` stays under the
   `R-018` / `F-14` unsafe-FFI audit; this page does not pre-empt it.

## Acceptance criteria

- The Linux row names the wired call sites and the tests that prove
  enforcement, the prerequisite ordering, and setup refusal, at a named
  revision.
- The macOS and Windows rows state that no mechanism is implemented, that the
  spawn refuses fail-closed, the caller-visible error shape, and the test that
  pins it.
- The page states requirements for a future platform implementation, including
  deny-by-default, explicit allowlisting, no network by default, bounded
  resources, and no unconfined fallback.
- The revisit trigger and the uncovered classes (ptrace, seccomp, cgroups,
  filesystem, network) are explicit.
- Risk register and evidence matrix cross-links resolve and no risk state moves
  by implication.
- The page is English-only, carries no research-repository references, and
  passes the repository documentation gates.

## P0 Review Sign-off

This page records an accepted posture; it is not a P0 gate and it does not
authorize a `Verified` or risk-state change.

| Lens                              | Status   | Required focus                                                                                    |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| Owner                             | Accepted | Current posture accepted in [bitty #2067](https://github.com/bitty-terminal/bitty/issues/2067).   |
| Independent security reviewer     | Pending  | Confinement mechanism, fail-closed ordering, per-OS refusal, and uncovered-class statement.       |
| Independent documentation curator | Pending  | Status, spine, terminology, links, routes, English-only content, and no implementation overclaim. |

## References

- [bitty #1984](https://github.com/bitty-terminal/bitty/issues/1984) — decided
  direction for inherited OS confinement of plugin-spawned tools.
- [bitty #2067](https://github.com/bitty-terminal/bitty/issues/2067) — accepted
  posture, milestone `v0.2.0`, and the cross-platform sequel.
- `bitty` `crates/bitty-sandbox/README.md` at
  [`10804c5`](https://github.com/bitty-terminal/bitty/blob/10804c5/crates/bitty-sandbox/README.md)
  — crate-local map and boundary statement.
- `bitty` `crates/bitty-sandbox/src/lib.rs` and `src/linux.rs` at
  [`10804c5`](https://github.com/bitty-terminal/bitty/blob/10804c5/crates/bitty-sandbox/src/lib.rs)
  — posture selector, safe adapter, and Landlock shim.
- `bitty` `crates/bitty-runtime/src/execution_jobs.rs` and
  `src/plugin_runtime/spawn.rs` at
  [`10804c5`](https://github.com/bitty-terminal/bitty/blob/10804c5/crates/bitty-runtime/src/execution_jobs.rs)
  — pre-validation, preparer, linked and component paths, and the runtime tests.
- [Extension execution mediation](extension-execution-mediation.md),
  [risk register](risk-register.md), [evidence matrix](evidence-matrix.md),
  [security overview](overview.md), [threat model](threat-model.md), and
  [P0 acceptance criteria](p0-acceptance-criteria.md).
