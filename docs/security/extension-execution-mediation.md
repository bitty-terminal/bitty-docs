---
title: Extension Execution Mediation
description: Normative threat model for the Layer-2 tool allowlist, inherited OS confinement, spawn audit, and extension supply chain
category: security
audience: security-reviewer
document_type: policy
status: normative
website_publish: true
sidebar_order: 35
---

# Extension Execution Mediation

Status: pre-alpha security contract. Controls here are requirements;
mechanism evidence is merged to the `bitty` workspace `main` branch
(`Implemented`-only, experimental) and nothing is `Verified`. No statement
here claims shipped, stable, or supported behavior. Implementation status
per control lives in the [evidence matrix](evidence-matrix.md); open risk
state lives in the [risk register](risk-register.md).

Decided direction: [bitty #1984](https://github.com/bitty-terminal/bitty/issues/1984)
(inherited OS confinement for plugin-spawned tools),
[bitty #1985](https://github.com/bitty-terminal/bitty/issues/1985) (bounded
audit ledger for tool spawns), and
[bitty #1986](https://github.com/bitty-terminal/bitty/issues/1986) (extension
source transparency: `show-source`, `update-diff` preview, no-obfuscation
gate). This document states what the decided mediation stops, what it does
not stop on each platform, and which residuals stay open.

## Scope

This document covers execution requested by Lua plugins and native binary
extensions through the Layer-2 system-CLI surface: which tool may run, with
which arguments and environment, under which inherited OS confinement, with
which audit record, and from which verified supply-chain artifact. It covers
the `git`-only tool slice (v1), the `bitty-sandbox` confinement adapter, the
tool-spawn audit ledger, and the `bitty extension` transparency verbs.

Out of scope: generic (non-tool) execution requests, which carry no
allowlist basis and stay governed by their scope and consent gates;
command-reference secret helpers (`secret_tiers::execute_command_ref`),
which are operator-configured programs with their own sequel (see
[Known residuals](#known-residuals)); and prompt injection delivered
through terminal output to AI extensions, which is owned by the
`bitty-ai` track and never by this mediation.

## Normative sources this document must not weaken

This document must be read together with, and must not weaken:

- the [security overview](overview.md), the [threat model](threat-model.md)
  (abuse cases T-06, T-11, T-12; adopted trust levels, secret tiers, and
  credential references), the [risk register](risk-register.md), and the
  [P0 acceptance criteria](p0-acceptance-criteria.md);
- security invariants 2 (third-party plugins start with no process
  authority), 8 (installation runs no package code; updates cannot silently
  add capabilities), 9 (secret-minimizing traces and diagnostics), and 10
  (a `--safe` startup path with no third-party plugins always exists).

Where this document narrows authority (deny-by-default tool identity,
argument, environment, exec-inheritance, and audit rules), the narrowing is
additive: no grant, default, or compatibility claim elsewhere widens it.

## Terminology

- **Layer-2 tool surface**: the mediated choke point through which a plugin
  may ask Core to spawn exactly one allowlisted system CLI with explicit
  arguments. Layer 2 never grants a shell, a `PATH` lookup name of the
  caller's choosing, or ambient environment.
- **Allowlist mediation**: pure, fail-closed predicates over tool identity
  (`tool+args` unit), argument shape, and explicit environment. Deny is the
  default; every predicate returns an explicit denial, never a silent pass.
- **Inherited confinement**: an OS mechanism applied to the already-admitted
  child so the restriction travels with the process: no matter which escape
  hatch the admitted binary offers from inside, the child cannot exec
  outside the allowlist.
- **GTFOBins-class escape hatch**: a legitimate binary feature that doubles
  as shell execution (for example a pager, editor, diff driver, subcommand
  runner, or proxy-command hook). The class is named after the public
  [GTFOBins](https://gtfobins.github.io/) catalog of such features; this
  document cites only the class, never a working exploit recipe.
- **TOFU pin**: trust-on-first-use record of the verified artifact digest
  from the first install. Later artifacts with a differing digest fail
  closed until the operator explicitly re-pins.
- **Attribution-only audit**: a ledger entry that names who asked (caller),
  what was decided (allow or deny), and bounded previews of the tool name
  and arguments. Audit never carries environment values or secret material.

## What the allowlist stops

The Layer-2 predicates stop four misuse classes at the gate, before any
process exists:

1. **Wrong-tool misuse.** Only the accepted tool name spawns. Today that is
   exactly `git`; any other executable (`rg`, `fd`, `bat`, an absolute
   path, a `PATH` probe such as `/usr/bin/git`) is denied. Tool names are
   bare lowercase segments (`1..=64` bytes); separators, dot segments,
   extensions, whitespace, and shell metacharacters fail the name grammar
   before the acceptance check runs.
2. **Casual shell construction.** Arguments are data, never a command line:
   NUL bytes, control characters, and shell metacharacters (semicolon,
   ampersand, pipe, backtick, dollar, parentheses, angle brackets,
   backslash, and both quote styles) are denied in every argument. There
   is no shell on either side of the spawn, so quoting bugs cannot become
   execution.
3. **Smuggled flags.** The gate denies the known `git` escalation vectors
   in exact, glued, and `=`-prefixed forms: verb smuggling via `--exec`,
   `--upload-pack`, and `--receive-pack`; config override via `-c`,
   `-c<key>=<val>`, `--config`, and `--config-env`; repository escape via
   `-C`, `-C<path>`, `--git-dir`, and `--work-tree`; pager drivers via
   `--paginate` and `--pager` (`--no-pager` stays allowed as the safe
   default); file-write and external-driver flags via `--output`,
   `--ext-diff`, and `--textconv` (`--no-ext-diff` and `--no-textconv`
   stay allowed); and `branch` ref mutation (delete, move, copy, rename,
   force, upstream, track, edit-description, bundled mutating clusters, and
   bare `branch <name>` creation). Only the seven read-only verbs `status`,
   `diff`, `log`, `branch`, `show`, `rev-parse`, and `ls-files` are
   admitted, bounded to 32 arguments of at most 256 bytes each and 8 KiB
   total.
4. **Smuggled environment.** The child starts from `env_clear()` plus the
   request's explicit variables only; ambient environment never crosses the
   boundary. Explicit variables naming pager control (`PAGER`,
   `GIT_PAGER`), env-encoded config override (`GIT_CONFIG*`, including the
   numbered `GIT_CONFIG_KEY_*` / `GIT_CONFIG_VALUE_*` pairs and
   `GIT_CONFIG_PARAMETERS`), external-program hooks (`GIT_EXTERNAL_DIFF`,
   `GIT_DIFF_OPTS`, `GIT_EDITOR`, `GIT_SEQUENCE_EDITOR`, `GIT_SSH`,
   `GIT_SSH_COMMAND`, `GIT_PROXY_COMMAND`, `GIT_ASKPASS`, `SSH_ASKPASS`,
   `GIT_EXEC_PATH`), and repo-identity escape (`GIT_DIR`, `GIT_WORK_TREE`)
   are denied fail-closed regardless of value, matched ASCII
   case-insensitively so a folded spelling cannot bypass the check on
   platforms with case-insensitive environment lookup.

## What the allowlist alone does not stop

An allowlist mediates the request; it does not confine the admitted
process. Once `git` (or any future admitted tool) runs, its own features
can exec further programs from inside, outside every predicate above. The
canonical instances of this class are:

- `git` pager, editor, diff-driver, and hook execution;
- `vim` shell escape (`:!`, `:shell`);
- `less` shell escape (`!command`);
- `find` subcommand execution (`-exec`);
- `ssh` subordinate execution (`ProxyCommand` and related hooks).

Only the first class member is admitted today, and its argv/env vectors
are closed at the gate — but the class property remains: argument
mediation cannot, by construction, govern what an admitted binary execs
after it starts. Without inherited confinement, every admitted binary with
a GTFOBins-class escape hatch is a sandbox escape. That is why the
allowlist is necessary but not sufficient, and why the next section is
normative rather than defense in depth.

## Inherited-confinement guarantee and per-OS degrade table

Every admitted Layer-2 spawn additionally runs under inherited OS exec
confinement. On Linux the `bitty-sandbox` adapter builds a Landlock ABI v1
ruleset handling exactly one access class, `EXECUTE`: one rule pins each
allowlisted executable by inode, plus one rule for its ELF interpreter
(the kernel checks `EXECUTE` on `PT_INTERP` when loading a dynamically
linked binary; shared libraries mapped later need no grant). Only the
`restrict_self` call runs in the child's `pre_exec` hook, so post-fork
work is a single syscall. Every other exec in the confined process tree
then fails with `EACCES`, while reads, writes, and memory maps are
unhandled and the tool's normal file I/O keeps working. `PATH` resolution
happens in the parent before the fork over absolute, non-empty entries
only (empty entries, the POSIX spelling of "current directory", are never
probed), and each rule pins the inode open at setup time, so a swap
between setup and exec can only deny, never widen. Statically linked tools
need no interpreter rule; script tools (shebang) refuse fail-closed
because their interpreter closure cannot be enumerated safely. Bounds: at
most 16 allowlisted executables per spawn, paths over 4096 bytes are
skipped, at most 64 `PATH` entries are searched, and diagnostics are
truncated to 128 bytes naming tool names and operation tags only.

The guarantee is: **an admitted spawn either runs with exec confinement
armed, or no process starts.** Confinement setup failure refuses the spawn
fail-closed with a diagnostic naming the confinement cause; there is no
unconfined fallback on any platform.

| OS                                     | Mechanism                                                 | Posture                                                                      |
| -------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Linux (Landlock ABI v1+, kernel 5.13+) | Landlock `EXECUTE` ruleset via `pre_exec` `restrict_self` | Enforced; setup failure refuses the spawn fail-closed                        |
| macOS                                  | `sandbox-exec` profile                                    | Refused fail-closed (sequel; no profile is cheap to verify without macOS CI) |
| Windows                                | Job Object / restricted token                             | Refused fail-closed (sequel)                                                 |
| Other (Android, BSDs, and the rest)    | None available                                            | Refused fail-closed                                                          |

Refusal is by design, not a gap in the gate: on non-Linux platforms
admitted spawns are denied with a diagnostic naming the missing mechanism
until the sequel mechanism lands and is verified. The per-OS table is the
pure, testable contract (`ConfinementPosture::for_os`): `linux` enforces,
every other label refuses. The wiring inventory (named call sites and proving
tests), the caller-visible refusal shape, and the requirements a sequel
mechanism must meet are recorded in
[Sandbox confinement posture](sandbox-posture.md); this section remains the
normative guarantee, and the stricter wording applies where the two overlap.

## Audit story

Two bounded ledgers record what happened, both drop-oldest with counted
evictions, sequence-numbered with no wall-clock:

- **Filesystem ledger (precedent).** The filesystem authorization ledger
  retains at most 1024 entries and names at most 8 items per entry. It is
  the precedent the spawn ledger mirrors; it is not restated here.
- **Tool-spawn ledger (bitty #1985).** Every attributed spawn decision
  records exactly one entry, allow or deny: caller identity (clamped to
  128 bytes), tool name (clamped to 64 bytes), outcome, and at most 8
  argument previews truncated to 64 bytes each on a char boundary, with
  further arguments counted (never silently dropped). At most 1024 entries
  are retained; older entries are evicted oldest-first and the eviction
  count is exposed for `bitty plugin doctor`. The ledger takes no
  environment parameter by construction, so environment values and secret
  material cannot enter it; `secret://` handle references are names, never
  values, and record like any other argument. Over-bound inputs still
  authorize on their full text: only the recorded copy is shortened, so
  clamping never widens or narrows the gate.

Attribution-only by construction is the documented barrier: the ledger
holds caller bytes, so new entry points must carry the same proof (tool,
arguments, caller — never environment) before they are trusted. Two
sequels stay open and are stated as such: live runtime dispatch enforces
the same predicates but does not yet flow through the ledger path, and
per-queue dropped counters are aggregated for doctor output.

## Supply-chain story

No silent push is possible through the extension surface:

- **Hash pins.** `bitty extension install` fetches exactly one prebuilt R2
  release (`https://cdn.bitty.run`) through fixed-argv system `curl`
  (pinned to `https`, no shell) plus system `tar`. Both-must-match digest
  arbitration applies: the CDN `SHA256SUMS` entry and the caller-supplied
  `--digest` (standing in for the registry value until the package index
  lands) must each match the downloaded bytes; any mismatch is an
  integrity failure (exit 4), never a silent pick. The first install
  TOFU-pins the verified digest; later installs with a differing digest
  fail closed as pin-mismatch until `--force` re-pins after verification.
  `--force` re-pins only; it never bypasses digest verification.
- **No silent capability growth.** Grants bind to the exact manifest hash;
  a later manifest that adds a capability blocks updates until re-approved
  with explicit consent. Install and update consent prompts are bounded (3
  attempts, 64 bytes per answer); decline or EOF stages and fetches
  nothing. Removal (`bitty extension remove`, `bitty plugin remove
--force`) and revocation (`bitty plugin revoke`, `bitty ctl consent
revoke`) touch only the user tier and recorded grants, never the system
  tier.
- **Source transparency (bitty #1986).** `bitty extension show-source
<name> [<version>]` prints the exact pinned executable bytes to stdout
  after re-verifying the hash against the installed descriptor; provenance
  (name, version, tier, path, sha256) goes to stderr so stdout stays
  byte-identical for piping and hashing. A missing install or a mismatch
  fails closed with nothing on stdout. `install` renders an `update-diff`
  preview (`<old> -> <new>`, TOFU pin change) before any pin change;
  the preview is advisory only and consent plus `--force` semantics apply
  exactly as before. Staged Lua and descriptors pass the no-obfuscation
  gate (a line over 1000 bytes or an average over 200 bytes per line
  refuses staging), enforced both in the staging path and in dist
  validation, so minified sources never become reviewable-looking
  artifacts.
- **No execution during management.** No `bitty extension` or `bitty
plugin` operation executes extension or plugin code; resolution
  re-verifies name, version, executable name, protocol range, and SHA-256
  on every spawn, and a tampered user install fails closed without system
  fallback.

**Identity residual.** Integrity (the bytes are the pinned bytes) is
closed by the chain above. Identity (the pinned bytes are the publisher's
bytes) is not: signature verification and a transparency log are absent,
and the registry half of the dual-digest rule is open, so installs always
require explicit confirm today. R2 integrity is yes; publisher identity
is no. This residual is stated, not downgraded: it blocks any claim that
the supply chain authenticates origin.

## Known residuals

Each residual below is accepted and stated; none is downgraded, and none
closes silently.

1. **Non-Linux platforms refuse by design.** macOS, Windows, and other
   Unix systems deny admitted spawns fail-closed until their confinement
   mechanisms land. Portability of the confinement guarantee is open work;
   the refusal behavior itself is the current guarantee. Recorded posture,
   test evidence, and the revisit trigger are in
   [Sandbox confinement posture](sandbox-posture.md).
2. **Token material in arguments records as a truncated preview.** The
   spawn ledger stores up to 64 bytes per argument preview. A secret
   passed as an argument would therefore persist in truncated form in the
   ledger. The accepted posture is that secrets travel via `secret://`
   names and never as argument values; the truncation bound limits but
   does not eliminate the exposure. Operator discipline plus the
   attribution-only construction is the current barrier, not a redaction
   proof.
3. **Secret-tier operator helpers are unwired.** `secret_tiers`
   command-reference helpers execute operator-configured programs (often
   shell scripts needing `sh`, `gpg`, and more) and are deliberately not
   under `bitty-sandbox` exec profiles today; their surface stays
   shell-free and bounded as before. Per-helper exec profiles are
   documented sequel work.
4. **Signature and transparency-log identity is absent.** See
   [Supply-chain story](#supply-chain-story): integrity without
   authenticated origin. Publisher identity, registry signatures, and a
   transparency log are open work; no origin claim may rest on the TOFU
   pin.
5. **Prompt injection against AI extensions is out of scope.** Terminal
   output is untrusted observation data and the terminal reader cannot
   combine it with filesystem and network authority (T-10), but
   instruction-following behavior of AI extensions under hostile output is
   owned by the `bitty-ai` track, never by this mediation. No statement
   here asserts robustness of an AI consumer.

## Verification plan

A boundary claim under this document requires, before any `Verified`
marking: positive, negative, malformed, oversized, and timeout cases for
every predicate; hostile probes for each smuggling form named above
(glued `-c`, long `--config`, `-C` on every verb, pager drivers, env
triples, external-process variables, case-folded variants); per-OS
posture tests (Linux enforced, every other label refused); ledger bound
tests (1024 retention, 8-arg cap, 64-byte previews, counted evictions, no
environment parameter); both-must-match and TOFU re-pin tests;
`show-source` byte-identity tests; and review by a separate
security-auditor persona. Mechanism tests merged with the implementation
are necessary evidence, never sufficiency on their own.

## Open points

- Per-OS confinement sequels (macOS profile, Windows job object) with
  platform CI capable of verifying them.
- Ledger wiring for live runtime dispatch and per-queue dropped-counter
  aggregation.
- Per-helper exec profiles for secret-tier command references.
- Publisher signatures, registry dual-digest completion, and transparency
  logging.
- `bitty-ai` ownership and acceptance evidence for prompt-injection
  robustness of AI extensions.

## References

- [Security overview](overview.md) — normative posture and invariants.
- [Sandbox confinement posture](sandbox-posture.md) — accepted per-OS
  enforcement record, wired call sites, proving tests, and future-platform
  requirements.
- [Threat model](threat-model.md) — trust boundaries and abuse cases
  T-06, T-11, T-12.
- [P0 acceptance criteria](p0-acceptance-criteria.md) — testable gates.
- [Risk register](risk-register.md) — risk state and closure criteria.
- [Evidence matrix](evidence-matrix.md) — per-control implementation
  evidence.
- [bitty #1984](https://github.com/bitty-terminal/bitty/issues/1984),
  [bitty #1985](https://github.com/bitty-terminal/bitty/issues/1985),
  [bitty #1986](https://github.com/bitty-terminal/bitty/issues/1986) —
  decided direction for confinement, audit, and transparency.
- [GTFOBins](https://gtfobins.github.io/) — public catalog defining the
  escape-hatch class cited above.
