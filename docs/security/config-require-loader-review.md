---
title: Restricted Config Require Loader Security Review
description: Independent defense-by-defense security review of the restricted configuration Lua module loader contract, with pass or gap per required defense, blocking corrections, and residuals
category: security
audience: security-reviewer
document_type: research
status: draft
website_publish: false
sidebar_order: 46
---

# Restricted Config Require Loader Security Review

## Review status

**Recommendation: not accepted yet (`NEEDS-FIX`).** Three blocking gaps remain,
all textual and all inside two sections of the reviewed contract. Every other
required defense passes. No implementation exists, so nothing here is evidence
of shipped behavior; this record judges a design gate.

| Item                   | Value                                                                                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reviewed contract      | [Config Lua require contract (candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/config-lua-require-contract-candidate.md) at `297df827` |
| Security record        | [Threat model](threat-model.md), restricted config module loader section, at `b38bd6cc`                                                                                          |
| Shipped-behavior check | `bitty` `a168b197`, read-only                                                                                                                                                    |
| Review date            | 2026-11-03                                                                                                                                                                       |
| Reviewer role          | Independent security reviewer, no authorship of the reviewed contract                                                                                                            |
| Gate                   | This repository's documentation gate (format, links, metadata, language, hygiene)                                                                                                |
| Outcome                | Status stays `draft`; the promotion is withheld until `G-1` through `G-3` are corrected                                                                                          |

The reviewer has no stake in the candidate's acceptance and did not write,
edit, or implement any part of it. The contract's own acceptance criteria
require that independent security review approve its containment, budget,
safe-mode, and isolation sections; two of those four (containment and
diagnostics) cannot be approved as written.

## Scope and method

The review walks the eight review items the design gate names, in the order a
reader needs them: name grammar and root model, resolution order, cache and
cycle semantics, the four failure paths, path containment, budgets, safe mode
and cross-VM isolation, and diagnostics. Each item is judged against the
required-defense set that the [threat model](threat-model.md) records for this
loader, not against a general expectation of what a Lua loader should do.

Method:

1. Read the contract end to end, then re-read each section against the
   required-defense bullet that governs it.
2. Attack the two rows the contract itself flags as "none identified" (the
   grammar and the deny list), because that is where a claim is cheapest to
   make and most expensive to be wrong about.
3. Check every "shipped" or "reuses an existing number" claim against `bitty`
   at a pinned revision, so the contract is not trusted as its own evidence.
4. Check every cross-reference target exists in the corpus, so a reader can
   reach the owning document.
5. Record each finding with the section it lands in and the correction it
   needs, so a revision can be reviewed by diff rather than re-read.

Out of scope, and deliberately not judged: whether the feature should exist,
the Lua standard library beyond the loader (`string`, `table`, and `math` stay
as shipped), plugin-host loader internals, project-scope configuration trust,
system or distribution Lua execution, and any performance measurement. This
review is also not a fuzz, penetration, or code audit: there is no loader code
to audit.

## Required-defense set used as the checklist

The [threat model](threat-model.md) fixes six required defenses for a
config-only loader. The design gate's eight review items map onto them as
follows, and the two fixed items the contract adds (resolution order and
diagnostics redaction) are reviewed under the same standard.

| Defense | Threat-model requirement                                                                                     | Review items |
| ------- | ------------------------------------------------------------------------------------------------------------ | ------------ |
| `D-1`   | One name grammar against exactly one host-derived module root                                                | `R-1`        |
| `D-2`   | Threefold containment: lexical, canonical, handle-bound identity                                             | `R-5`        |
| `D-3`   | Special-file rejection: regular files only, reparse/ADS/8.3/reserved-name refusal                            | `R-5`        |
| `D-4`   | Bounded graph: cycle-as-failure, depth, count, per-file and aggregate caps, one RC-1/RC-2 account            | `R-3`, `R-6` |
| `D-5`   | Startup fail-soft whole-layer, strict check and doctor, refused reload, `--safe`, plugin and settings denial | `R-4`, `R-7` |
| `D-6`   | Redaction: spec and line only, never resolved paths, metadata, or bulk contents                              | `R-8`        |
| —       | Deterministic resolution with no preference policy                                                           | `R-2`        |

## Defense-by-defense findings

### R-1 — Module naming and root model: pass

The grammar is total and closed: 1..16 dot-separated segments, each
`[A-Za-z0-9][A-Za-z0-9_-]*` in 1..64 bytes, whole spec at most 256 bytes, no
leading, trailing, or doubled dot, no `..` segment, no backslash, slash, colon,
drive letter, NUL, or non-ASCII byte, and a reserved `bitty` first segment
(contract § "Module naming and root model", "Name grammar"). Because no
separator and no `..` component is admissible, a spec cannot name an absolute
path, a parent directory, a volume, or an NTFS stream. The reserved `bitty`
prefix closes the one aliasing idea worth closing: a host bridge reachable as a
module, which would let `require` return a table the host did not hand out
deliberately.

Root derivation is one rule in all eight rows of the table in § "Root
derivation": the module root is `lua/` under the directory that owns the entry
file, `dirname(path)/lua` for an explicit path, and the profile row is owned by
the directory above `profiles/`. The contract states that the rule never
consults the working directory, drive substitution, `PATH`, `LUA_PATH`, or any
Lua-set variable, and that an `extends` chain shares one root and one cache
because it is one generation. That satisfies `D-1` including its negative half:
nothing Lua-reachable selects a root.

Two supporting decisions are also correct and worth recording as such: system
and distribution roots are excluded rather than left implicit, and `--safe` has
no root at all. Excluding a distribution tree is what prevents a
distribution-controlled `config.options` from resolving ahead of the user's
file, which is the concrete failure a "first found wins" policy would have
introduced.

### R-2 — Resolution order: pass

For `a.b.c` the loader tries `<root>/a/b/c.lua` then `<root>/a/b/c/init.lua`,
and both existing is `E_CONFIG_MODULE_AMBIGUOUS` rather than a preference
(contract § "Resolution order"). This is the right call for a security
contract: a first-found rule is a policy an attacker can satisfy more cheaply
than the legitimate file, and the ambiguity code makes the choice a refusal
instead of a race. `E_CONFIG_MODULE_NOT_FOUND` covers the empty case, a `.lua`
suffix inside a spec is unrepresentable because the dot splits a segment, and
therefore no spec can address a non-`.lua` object by name. No extension
probing exists, so there is no ambiguity surface beyond the one code named.

### R-3 — Cache, duplicates, and cycle semantics: pass

The cache is host-side, per-generation, not Lua-visible, identity-keyed, and
cleared on reload (§ "Loader semantics: cache, duplicates, and cycles" and
"Graph identity"). Four consequences are stated and all four are the ones a
reviewer would ask for: a second `require` of a completed identity returns the
cached value without re-evaluating; an in-flight identity is a cycle and fails
closed with `E_CONFIG_MODULE_CYCLE` rather than returning a half-built table;
the count budget counts identities so aliasing cannot buy a second slot; and
attribution names the first loader so a later alias cannot invent a new source.

Keying the cache on opened-file identity rather than the spec string is the
part that makes the rest coherent: a hardlink alias, a case variant on a
case-insensitive volume, and two spellings of one file all collapse to one
evaluation, which is what prevents both double-evaluation and a count-budget
escape. The absence of a `package.loaded` equivalent is also a real defense,
not decoration: configuration code cannot enumerate the graph, substitute
another module's value through the cache, or fabricate a cache hit.

### R-4 — Startup salvage, check, doctor, reload: pass

The four-path table in § "Failure behaviour: startup, check, doctor, reload"
gives one answer per path and keeps the existing fatal cases fatal: startup
drops the whole external layer that started the failing evaluation and keeps
every other layer and the defaults; an explicit missing or invalid entry or
profile stays exit 2 before evaluation; `config check` and `doctor` are strict
and non-zero; `ctl config reload` refuses and keeps the previous plan and
graph. All four share one loader and one validation sequence, so there is no
second parser to drift.

This matches `D-5` and it matches the shipped salvage contract the contract
points at rather than redefines. The module loader introduces no new fatal tier,
which is the property that matters: a content failure in one external layer
must not become a startup failure that locks a user out of their terminal.

One wording defect, non-blocking, is recorded as `N-1`.

### R-5 — Path containment and platform handling: gap

The structure is right and the intent meets `D-2` and `D-3`: three independent
checks (lexical, canonical, handle-bound identity), all fail closed, with the
containment decision bound to an open handle rather than a path string;
`openat2` with `RESOLVE_BENEATH`, `RESOLVE_NO_SYMLINKS`, and
`RESOLVE_NO_MAGICLINKS` where available and a component-wise `O_NOFOLLOW`
fallback with a post-open identity comparison; unconditional reparse refusal on
Windows with `FILE_ID_INFO` compared against a pre-open lookup; regular-file
only, with FIFOs, devices, sockets, directories reached by a non-`init`
resolution, ADS, 8.3 aliases, and reserved device names refused; and the
"what the loader may not do" list (no write path, no bytecode, no ambient
`os`/`io`) is complete for this surface.

Two defects prevent approval of this section as written. Both are recorded in
full under "Blocking gaps":

- `G-1`: the special-file rule checks the object **after** opening it, and no
  non-blocking open is required, so a FIFO converts a refusal into an unbounded
  wait — and the section claims the opposite.
- `G-3`: the handle-bound step does not say whether it opens the spec-joined
  path or the canonical path, so the in-root symlink allowance the same section
  grants cannot be both honored and TOCTOU-checked by the mechanism described.

Everything else in the section passes, including the Windows-specific rules
(grammar-identical across platforms, reparse refusal at every component,
case-insensitive comparison where the volume is, long-path canonical form
only) and the Unix and macOS notes, which state the mount-point and non-
`openat2` residuals instead of claiming them closed.

### R-6 — Budgets and accounting: pass

§ "Budgets and accounting" caps per-file source at the shipped 64 KiB / 2048
lines / 4096 bytes per line, aggregate source at 256 KiB per generation,
distinct module identities at 64, require-chain nesting at 16, and leaves
RC-1 at 10,000,000 instructions and 50 ms wall clock and RC-2 at 32 MiB
accounted heap, with PB-1 unchanged. The accounting rules are the strong part:
one evaluation account per generation with no refresh on module entry, so a
graph cannot multiply the instruction budget by module count; parse cost
bounded by bytes rather than a counter; budget failure as a fail-closed
suspension rather than a salvage tier; no per-module tier, no waiver, and no
configuration knob. That closes the classical evasion (many small modules each
getting a fresh budget) and the second one (one large module truncated instead
of refused).

The borrowed numbers were checked against `bitty` `a168b197` rather than taken
on faith: `MAX_CONFIG_FILE_BYTES = 64 * 1024`, `MAX_CONFIG_LINES = 2048`, and
`MAX_LINE_BYTES = 4096` in `crates/bitty-config/src/file.rs`;
`RC1_INSTRUCTION_BUDGET = 10_000_000` and `RC1_WALL_CLOCK_BUDGET_MS = 50` in
`crates/bitty-lua/src/lib.rs`; and the configuration VM's module comment in
`crates/bitty-lua/src/config.rs` states it runs with the same RC-1/RC-2
instruction, wall-clock, and memory budgets as a plugin, which is the basis for
the 32 MiB RC-2 figure. The three proposed numbers (256 KiB, 64, 16) are
correctly labeled proposals and are listed as open points; `N-3` records the
measurement still owed for the aggregate cap.

### R-7 — Safe mode and cross-VM isolation: pass

§ "Safe mode and plugin isolation" states that `--safe` selects the built-in
safe effective configuration before any external read, ignores
`--config`/`BITTY_CONFIG`, profiles, system and distribution probing, and CLI
appearance overrides, has no safe-mode loader state, no safe-mode `require`
global, and no safe-mode module path, and that `--safe --config PATH` keeps
`--safe` winning. Plugin runtime, plugin settings, and any future plugin surface
keep the default-deny list; the plugin-host rooted loader is explicitly not
reused in either direction; settings stays a bounded plain-data evaluator with
no file I/O; and the loader grants no capability, manifest grant, plugin enable,
theme write, or registry participation.

The shipped half of this was checked: `crates/bitty-lua/src/config.rs` denies
`package`/`require`, `load`/`loadfile`/`dofile`, `io`, `os`, `debug`, `print`,
`tonumber`, and `_G`, and its `denied_globals_fail_closed` test evaluates
`return require("x")` and requires a Lua error; `crates/bitty-config/src/merge.rs`
exposes `safe_merged`, and `crates/bitty-config/src/reload.rs` exposes
`fallback_builtin` as the `--safe` minimal configuration. The claim that the
loader never widens plugin authority is therefore a statement about a boundary
that exists today, not about one that would be created.

### R-8 — Diagnostics and redaction: gap

The taxonomy is the most complete part of the contract: thirteen typed codes
covering name, resolution, containment, object type, syntax, evaluation, and
budget, each with its fail response, plus a record shape (`code`, `module_spec`,
`phase`, `source`, `aggregate`) rendered as additive fields on existing records,
and per-path surfacing that matches § "Failure behaviour". The redaction rule is
also correct in direction: diagnostics name the spec, the line, and the code,
never the resolved absolute path, the canonical root, the identity tuple, or
other filesystem metadata, and never another module's contents.

Approval is withheld for one reason: the rules bound the **quantity** of echoed
text but not its **encoding**. The `module_spec` field is the raw `require`
argument byte string or its corrupted form, and the error-text rule echoes the
offending source line. Both are precisely the strings most likely to contain
control bytes. This is `G-2`.

## Blocking gaps

Each gap is a required correction to the contract text, not a redesign. Two of
them are cases where the document asserts a property its own mechanism does not
deliver, which is the failure mode that must not survive into an accepted
contract: an implementer following the text writes the vulnerable version and
believes the property is already satisfied.

### G-1 — Special-file rejection can block instead of refusing

**Where:** contract § "Path containment and platform handling", item 4.

**Finding.** The section orders the checks as open, then regular-file check,
then size cap from the handle, and concludes that "the read cannot be extended
by a concurrent writer and cannot block on an object that has no end". The
order it states cannot support that conclusion. A blocking `open` of a FIFO
read-only waits for a writer before any of the checks run, so a FIFO placed at
`<root>/config/options.lua` turns a required fail-closed refusal into an
unbounded wait on startup, `bitty config check`, and `bitty doctor`. The
contract's own threat framing admits this attacker position: it names "a
shared or synced configuration tree" as a source that can place objects the
owner did not place.

**Why it is blocking.** `D-3` requires that FIFOs fail closed. As written, the
required defense's outcome is not achieved for the FIFO case, and the contract
states the opposite of the truth in the same paragraph. An accepted text would
carry that false claim into the implementation contract.

**Required correction.** Name the open flags and the order: open with
`O_RDONLY | O_NONBLOCK | O_CLOEXEC` (and `O_NOFOLLOW` or the `openat2` resolve
flags), `fstat` the handle, reject any non-regular object, then clear
`O_NONBLOCK` before the single bounded read. State the residual that an open on
an unusual filesystem can still defer, bounded by the size cap and the single
read. `O_CLOEXEC` is not optional detail: the corpus already requires close-on-
exec on every descriptor a process can inherit, and a module read handle that
leaks across a spawn is the same defect in a smaller package.

### G-2 — Diagnostic echo of specs and source lines has no encoding rule

**Where:** contract § "Diagnostics and error taxonomy", record shape and
"Source attribution and redaction".

**Finding.** `module_spec` is defined as "the raw require argument byte string,
or the corrupted form", and the redaction rules allow echoing "at most the
offending source line". Both are echoed into stderr, into `bitty doctor`
diagnosis output, into reload results, and into CI logs. The grammar guarantees
that **accepted** specs are ASCII-safe, but `E_CONFIG_MODULE_NAME` exists
precisely for the specs the grammar rejected, so the one field designed to
report hostile input is the one field with no sanitization requirement. A spec
containing ESC-initiated sequences, C0 controls, or bidirectional formatting
characters would be written raw into a terminal and into log streams; the same
applies to an echoed source line from a hostile file. The corpus already treats
this class as a control-character problem for pasted input and prescribes C0
except tab/NUL/ESC/CR/LF, C1, and BiDi inspection; diagnostics need the
stricter form, because diagnostic text is echoed where no inspection happens.

**Why it is blocking.** `D-6` is a required defense, and its stated rule is
satisfied only for well-formed input. Bounding length without bounding encoding
leaves an output channel that hostile input controls, in the exact section that
promises redaction.

**Required correction.** Bound the echoed spec to 256 bytes and the echoed line
to the source-line cap already in force, and escape or drop C0 except tab, C1,
DEL, and bidirectional formatting characters before rendering; ESC must be
escaped in diagnostics even though paste inspection treats it specially. State
that the escaping applies to every path that renders the record, so a new
renderer cannot skip it.

### G-3 — The handle-bound open target is unspecified against the symlink allowance

**Where:** contract § "Path containment and platform handling", items 2 and 3,
and § "Verification plan".

**Finding.** Item 2 admits path components that are symlinks inside the root
when the canonical target stays under the canonical root, and § "Verification
plan" requires proving a "symlinked dotfiles layout that stays under the
canonical root". Item 3 then specifies the open as `openat2` with
`RESOLVE_BENEATH`, `RESOLVE_NO_SYMLINKS`, and `RESOLVE_NO_MAGICLINKS`, or a
component-wise `O_NOFOLLOW` walk. Both mechanisms refuse every symlink below
the root, so a reader cannot tell whether the allowance is honored (open the
canonical path, which is symlink-free by construction, and use the resolve
flags to detect a newly introduced link) or silently dropped (open the
spec-joined path, in which case the allowed layout can never load and a
verification-plan item is unprovable).

**Why it is blocking.** It is not a hole — either reading fails closed — but it
is an unresolvable contract. Two of the reviewed document's normative clauses
and one of its acceptance tests cannot hold together, and the threat model's
`D-2` bullet makes the in-root allowance a requirement rather than an
implementation choice. An implementer must not have to guess which clause to
drop.

**Required correction.** State that the open target is the canonicalized path
(no symlink component remains), that the resolve flags exist to detect a link
introduced after canonicalization, and that a mismatch between the pre-open
canonical identity and the post-open `fstat`/`FILE_ID_INFO` identity rejects the
file. Then one sentence covers both the allowance and its race window, and the
verification-plan item becomes provable.

## Non-blocking findings

These do not withhold acceptance. They are recorded so the implementation issue
and any revision can carry them instead of rediscovering them.

| ID    | Finding                                                                                                                                                                                                                                                        | Disposition expected                                                                                             |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `N-1` | The taxonomy row for `E_CONFIG_MODULE_BUDGET` says "fail-closed as today" while the other twelve rows say "layer fail-soft / strict failure", and the budgets section says a budget trip "suspends the generation fail-closed". Three phrasings, one behavior. | State one behavior per path: startup drops the whole layer, check and doctor are strict, reload refuses.         |
| `N-2` | The root medium is unstated. An explicit `--config` naming a path on a network share, a mapped drive, or removable media makes the module root remote or removable; identity and reparse semantics there are unproven and `FILE_ID_INFO` support varies.       | The implementation states local-volume-only, or records the remote-root residual before enabling it.             |
| `N-3` | The 256 KiB aggregate and the PB-1 claim are asserted, not measured. The contract's own open points admit the aggregate cap needs a PB-1 measurement of a maximal graph.                                                                                       | Measure a maximal graph (64 identities, 256 KiB) against PB-1 p50/p99 before the numbers become contract.        |
| `N-4` | Windows refuses reparse points at root ancestors unconditionally. A redirected or junctioned `%APPDATA%` is a common enterprise layout, so a user with a redirected profile gets a refused loader with no stated explanation.                                  | Name it as a known limitation with a diagnostic that says the layout is refused, not that the module is missing. |
| `N-5` | No risk-register or evidence-matrix row exists for this loader; the open question has no register row. The threat-model entry is a required-defense record, not a tracked risk.                                                                                | Add a risk row before any loader-shipped release, so the residual set is tracked and not only described.         |
| `N-6` | `bitty config check --json` graph emission is left open. If the graph is emitted, it must not carry absolute paths, resolved roots, or identity tuples.                                                                                                        | Bind the decision: graph emission, if any, uses specs and lines only.                                            |

## Residual risk carried to the implementation

These are the residuals the contract states, plus the ones this review adds.
None is claimed closed, and each belongs in the implementation issue as accepted
risk rather than as an open defect.

- **Unix mount point inside the root.** A mount can present a foreign tree; the
  contract accepts it when its canonical path is under the root and records it.
- **Non-`openat2` fallback.** Component-wise `O_NOFOLLOW` plus a post-open
  identity comparison narrows the check-to-read window without eliminating it.
- **Exotic and FUSE-backed filesystems** may report regular-file semantics for
  unusual objects. The size cap and single read bound the damage; they do not
  make the object regular.
- **Concurrent replacement between two `require` calls in one generation.** The
  first identity is already cached, so the graph does not re-read; a replaced
  file appears as a new identity only for a later, uncached spec.
- **A module can mutate its own returned table** before returning, which is the
  same power the single entry chunk has today, and it can mutate a table it
  received from another module, which is a real increase in intra-generation
  coupling even though it grants no new authority.
- **Spec names disclose the local module layout** to anyone who reads a
  diagnostic. The owner already knows the layout, and plan source records name
  the same modules.
- **Owner-edited configuration as the attack path** is out of scope by trust
  model: the loader narrows what configuration code can read; it does not
  defend the owner from their own file.
- **Added by this review (`N-2`, `N-3`):** a network or removable module root,
  and an aggregate cap that has not been measured against PB-1.

## Evidence register

| Item  | Verdict | Evidence                                                                                                                                                                                            |
| ----- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `R-1` | Pass    | Contract § "Module naming and root model" (name grammar, root derivation table); [threat model](threat-model.md) `D-1` bullet                                                                       |
| `R-2` | Pass    | Contract § "Resolution order"                                                                                                                                                                       |
| `R-3` | Pass    | Contract § "Loader semantics: cache, duplicates, and cycles", § "Graph identity"                                                                                                                    |
| `R-4` | Pass    | Contract § "Failure behaviour: startup, check, doctor, reload"; [threat model](threat-model.md) `D-5` bullet                                                                                        |
| `R-5` | Gap     | Contract § "Path containment and platform handling", items 2–4; `G-1`, `G-3`                                                                                                                        |
| `R-6` | Pass    | Contract § "Budgets and accounting"; `crates/bitty-config/src/file.rs`, `crates/bitty-lua/src/lib.rs`, `crates/bitty-lua/src/config.rs` at `a168b197`                                               |
| `R-7` | Pass    | Contract § "Safe mode and plugin isolation"; `crates/bitty-lua/src/config.rs` (`denied_globals_fail_closed`), `crates/bitty-config/src/merge.rs`, `crates/bitty-config/src/reload.rs` at `a168b197` |
| `R-8` | Gap     | Contract § "Diagnostics and error taxonomy"; `G-2`                                                                                                                                                  |

## Verification obligations that survive this review

The contract's verification plan is adequate and is not restated here. Three
obligations are added because the gaps above create them:

- An adversarial object test that places a FIFO, a Unix socket, and a device
  node at a module path and asserts a typed refusal **within a bounded time**,
  not merely a refusal. A test that hangs proves the defect.
- A diagnostic-injection test that seeds a spec and a source line containing
  C0, C1, DEL, ESC-initiated sequences, and bidirectional formatting characters,
  and asserts that no raw control byte reaches the rendered record on any of the
  four paths.
- A layout test that proves one symlinked in-root module loads, and that the
  same module refused after the canonical step's identity is swapped, so the
  allowance and the race window are both exercised rather than asserted.

## Re-review scope

A revision that applies `G-1`, `G-2`, and `G-3` and records `N-1` through
`N-6` needs re-review of exactly three sections — "Path containment and
platform handling", "Diagnostics and error taxonomy", and the taxonomy table —
plus the status line. The other sections pass as written; re-litigating them
would be a new review, not a continuation of this one. Promotion to accepted is
appropriate once those three corrections land and the reviewer sign-off names
this record.

## Limitations of this review

- No loader exists, so every judgment here is about a described mechanism. A
  described mechanism can be unimplementable; `G-1` and `G-3` are exactly that
  class of defect, found by reading rather than by running.
- The shipped-behavior claims were checked by reading `bitty` at one revision,
  not by executing the configuration VM. A test run would strengthen the
  `R-6` and `R-7` evidence but would not change either verdict, because the
  claims asserted there are structural rather than numeric.
- Performance numbers were not measured. `N-3` records the obligation.
- Windows behavior was reviewed as text only. No Windows host was used, so the
  reparse, `FILE_ID_INFO`, 8.3, and case-folding rules are judged for internal
  consistency, not for platform accuracy.

## References

- [Config Lua require contract (candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/config-lua-require-contract-candidate.md) — the reviewed document.
- [Threat model](threat-model.md) — configuration and workspace trust, restricted config module loader.
- [Security overview](overview.md) — least privilege per input class, bounded size/time/nesting/memory, `--safe` baseline.
- [P0 acceptance criteria](p0-acceptance-criteria.md) — `P0-AC-005` deny-by-default local file loading, `P0-AC-008` control-character inspection, `P0-AC-019` safe mode always available, `P0-AC-026` trace minimization and redaction.
- [Risk register](risk-register.md) and [evidence matrix](evidence-matrix.md) — where the loader's residual set should be tracked (`N-5`).
- Issue [`bitty#2670`](https://github.com/bitty-terminal/bitty/issues/2670) — the design gate this review answers.
