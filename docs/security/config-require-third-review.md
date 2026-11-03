---
title: Restricted Config Require Contract Third Review
description: Third-round independent review of the amended restricted configuration module loader contract, closing B-1 to B-4 with the mechanism each correction now names, confirming the admitted residuals stay residual, and recording the non-blocking findings that survive
category: security
audience: security-reviewer
document_type: research
status: draft
website_publish: false
sidebar_order: 51
---

# Restricted Config Require Contract Third Review

## Review status

**Verdict: `ACCEPTED`.** Every blocking finding from the two earlier rounds is
closed — `G-1` to `G-3` by the previous amendment, `B-1` to `B-4` by this one —
and no new blocking defect is introduced. The containment rule is now a
descriptor-anchored walk on every platform rather than a description of one; the
read has a completeness check that can fail; the escaping rule is total over
bytes instead of enumerated over classes; and the one string a module controls end
to end is inside the record and inside the rule. The contract may leave
`status: draft`, and the dependent implementation issue is authorized. Five
non-blocking findings stay open, four narrower ones are added, and none of them
withholds acceptance.

| Item              | Value                                                                                                                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reviewed contract | [Config Lua require contract (candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/config-lua-require-contract-candidate.md)                                        |
| Reviewed revision | `bitty-terminal-docs` `d327a1a` (PR [#379](https://github.com/bitty-terminal/bitty-terminal-docs/pull/379)), file blob `59cd71e`; judged as a diff against `955ef0b`, the revision the second review read |
| Round 1           | [Restricted config require loader review](config-require-loader-review.md), `NEEDS-FIX` on `G-1` to `G-3`, non-blocking `N-1` to `N-6`                                                                    |
| Round 2           | [Restricted config require contract re-review](config-require-rereview.md), `G-1` to `G-3` closed, `NEEDS-FIX` on `B-1` to `B-4`, non-blocking `N-1` to `N-8`                                             |
| This round        | `ACCEPTED`; `B-1` to `B-4` closed; `N-3`, `N-5`, `N-6`, `N-7`, `N-8` carried to the implementation issue; `N-9` to `N-12` added                                                                           |
| Threat model      | [Threat model](threat-model.md), restricted config module loader, required defenses `D-1` to `D-6`, at `44e0394`                                                                                          |
| Code evidence     | `bitty` `origin/main` at `7ac871d4`, read-only; no checkout, no build, no test run                                                                                                                        |
| Review date       | 2026-11-04                                                                                                                                                                                                |
| Reviewer role     | Independent security reviewer; no authorship of the reviewed contract, of the two earlier records, or of the code the contract cites                                                                      |
| Gate              | This repository's documentation gate (format, links, metadata, language, hygiene, cross-repo links, state, actionlint)                                                                                    |
| Outcome           | Design gate met; promotion out of `draft` is the owning repository's edit; implementation authorized with the residual and measurement obligations below carried explicitly                               |

The reviewer wrote none of the amended text, closed no finding of the earlier
rounds, and has no stake in the outcome. This record is the third independent
read, and it is deliberately the least generous one available: each of the four
closing sentences is quoted and then attacked, the two residuals the amendment
itself admits are re-checked rather than accepted as labels, and the five
non-blocking findings the amendment did not touch are re-stated so that
acceptance cannot be mistaken for a clean sheet.

Acceptance is narrow in three specific ways, and they are stated here rather than
buried: the aggregate cap is still an unmeasured proposal (`N-3`), the risk
register still has no row for this loader (`N-5`), and one sentence in the
containment section still names a fallback that three other clauses forbid
(`N-9`). None of the three is a property the described mechanism fails to
deliver, which is the threshold this gate applies; each is a debt that becomes
due before the numbers are contract or a release ships.

## Scope and method

This is a third review, not a re-read. It judges the amendment as a diff against
the four findings the second review left open, and it re-judges nothing that
already passed twice except where the amendment edited it.

Method:

1. Read `d327a1a` as a diff against `955ef0b`, so each correction is checked
   against the finding it answers rather than against a fresh reading of the
   whole document. Sections the amendment did not touch are not re-litigated.
2. For each of `B-1` to `B-4`, quote the sentence that is supposed to close it,
   then ask what an implementer builds from that sentence alone, and where the
   resulting mechanism stops short of the claim above it.
3. Treat each newly added mechanism as a fresh design rather than as a patch:
   walk the open sequence component by component and ask which step can still
   dissemble; enumerate the fields and the renderers and ask which string reaches
   which surface; enumerate every refusal the new text mandates and ask which
   code names it on all four paths.
4. Verify every claim about house behavior by reading `bitty` `origin/main` at
   one revision, rather than accepting the contract as its own evidence.
5. Re-check the residuals the amendment admits — the mount-point and root-anchor
   residual, and the remote root — against the rule that a residual may be
   carried but may not be re-described as closed.
6. Check the required-defense rows the contract cites in this repository's
   [threat model](threat-model.md) still describe the mechanism the contract now
   requires.

Out of scope, unchanged from the two earlier reviews: whether the feature should
exist, the Lua standard library beyond the loader, plugin-host loader internals,
project-scope configuration trust, system or distribution Lua execution, and any
performance measurement. No loader exists, so nothing here is evidence of
shipped behavior; this record judges a design gate.

## Per-finding verdict on `B-1` to `B-4`

### `B-1` — Identity comparison could not see an intermediate-component swap, and the open was anchored to nothing: closed

The finding had two halves: an open described as "the canonical path" with
`RESOLVE_BENEATH`, which is an absolute path against no anchor, and an identity
comparison asserted to close a window it cannot see. The amendment restates the
mechanism and, more importantly, states what the mechanism is not:

> Containment therefore rests on the walk — every component of the read target
> resolved from an already-open descriptor under a no-follow rule — and never on
> the comparison.
>
> The identity recorded on the open handle has exactly two uses: it keys the
> per-generation cache so aliases collapse to one evaluation, and it is a
> redundant confirmation that the object the walk opened is the object
> canonicalization described. It does not close the TOCTOU window, and this
> contract does not claim it does.
>
> — contract § "Path containment and platform handling", item 3, "What the
> identity is for"

Both halves are answered. The anchor is named and opened once
(`O_RDONLY | O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC` on the canonical root), the
root-relative remainder is derived from the canonical target by prefix stripping
with an explicit "already an escape" rule for a target outside that prefix, and
the remainder is resolved from the descriptor: `openat2` with
`RESOLVE_BENEATH | RESOLVE_NO_SYMLINKS | RESOLVE_NO_MAGICLINKS` on Linux,
per-component `openat` with `O_NOFOLLOW | O_DIRECTORY` on macOS and the BSDs, and
a per-component walk with `FILE_FLAG_OPEN_REPARSE_POINT` from the root handle on
Windows. The identity is demoted in the same breath, and the demotion is argued
rather than asserted: "an identity recorded by a path-following call after
canonicalization already carries the attacker's identity for an intermediate
component swapped in that window, so a matching comparison would pass precisely
when the race is used." That sentence is the exact defect the second review
described, written into the contract as a reason not to rely on the mechanism.

Three details raise the credit above a wording fix. First, the Windows branch no
longer pretends the identity match is containment: item 3 refuses reparse and
wrong-type components on the walk, and § "Unix and macOS notes" states that "no
platform's containment rests on it". Second, the previous generation's
non-`openat2` residual — "narrows the swap window without eliminating it" — is
deleted and replaced with the stronger rule that a target which cannot open a
directory relative to a descriptor and refuse a link per component does not build
the loader and reports `E_CONFIG_MODULE_ROOT`; that is a fail-closed answer where
an accepted narrowing used to be. Third, the verification plan now contains a
control that can fail: an intermediate directory component swapped between
canonicalization and the open must refuse with `E_CONFIG_MODULE_ESCAPE`, "a
loader that opens the canonical path by name and compares identities passes the
final-component test and fails this one". The obligation the second review added
is therefore inside the contract and is stated in a form that cannot be satisfied
by restating the mechanism.

What is left is one sentence of the same item that still names a by-path open as
a fallback; it is recorded as `N-9` with the reason it does not withhold
acceptance.

### `B-2` — "A single read, in full" was not a completeness check, and two mandated refusals were untyped: closed

The read is now a bounded loop with an equality check, and the refusal is named:

> A read error, a byte count that differs from the handle's size, or a
> `take(cap + 1)` that returns more than the cap is therefore a refusal with
> `E_CONFIG_MODULE_READ`, never a parsed prefix: nothing partial reaches the
> parser, the extraction step, or the plan.
>
> — contract § "Path containment and platform handling", item 5

The mechanism is sound as described. `take(cap + 1).read_to_end()` bounds the
transfer at 65537 bytes whatever the object does, so a regular file that never
reports end of file still cannot run past the cap; the equality against the
handle's metadata size catches a shrink, a growth, a signal-truncated read, and a
short read on a filesystem that returns partial transfers; and the equality is
what turns "read once" into "read completely", which a single `read(2)` never
supported. Charging the accepted byte count to the aggregate account is the right
order: the cap is charged for what was read, not for what metadata promised.

The taxonomy half is closed too. `E_CONFIG_MODULE_READ` and `E_CONFIG_MODULE_ROOT`
exist as rows with the same fail response as their neighbours, `phase` gains
`root`, the Windows redirected-`%APPDATA%` paragraph now names
`E_CONFIG_MODULE_ROOT` with its `phase`, `source`, and the absence of a
`module_spec`, and the "how a refused module surfaces" section binds both codes to
the same four paths rather than a fifth. A root refusal is additionally specified
as one record per generation, which is the only defensible count when no spec
resolved.

The precedent claim was checked rather than credited. At `bitty` `7ac871d4`,
`read_bounded_regular_file` in
`crates/bitty-runtime/src/plugin_runtime/plugin_settings.rs` opens with
`RDONLY | NOFOLLOW | NONBLOCK | CLOEXEC` (rustix on Linux and Android, nix
elsewhere, `FILE_FLAG_OPEN_REPARSE_POINT` on Windows), takes metadata from the
handle, refuses a non-file and an over-ceiling length, then
`file.take(MAX + 1).read_to_end(&mut bytes)` and refuses when
`bytes.len() != metadata.len()` or the result exceeds the ceiling.
`read_record_bytes` in `crates/bitty-runtime/src/component/activation.rs` has the
same shape against `COMPONENT_ACTIVATION_MAX_BYTES`. Both refuse the same
mismatch, and in both the expected length comes from `File::metadata`, which is
`fstat` on the open handle. The contract's sentence about following that shape
rather than describing a weaker check is accurate, including the part that
matters: the ceiling is taken from the object that was opened, not from the
path.

Two differences between the contract and the precedent are worth naming, because
neither is a defect but one of them opens `N-10`. The house functions check the
metadata size against the ceiling _before_ the read and then require equality;
the contract states the cap and the equality but not the pre-read size refusal,
so an oversized file has two plausible codes — `E_CONFIG_MODULE_SIZE` on the
metadata test, `E_CONFIG_MODULE_READ` on "read past the 64 KiB cap". The house
functions also never clear `O_NONBLOCK`, while the contract requires clearing it
after the object test; that is inert for a regular file and is harmless because
the order is fixed, exactly as the text says.

### `B-3` — The escaping rule was an enumerated blocklist with a test generated from the same list: closed

> The rule is an allowlist over bytes, and it is total by construction. A
> rendered field may contain only bytes in `0x20`..`0x7E` plus tab; every other
> byte is replaced with a visible escape form — `\xNN` for the byte, or `\u{...}`
> for a decoded code point — and the escape form itself is printable ASCII.
>
> — contract § "Diagnostics and error taxonomy", source attribution and redaction

This is the correction the second review asked for, and it is stronger than the
minimum it asked for. The property is now defined by the set of bytes that may
appear, so it holds for input nobody has thought of; the five classes survive only
as a "non-exhaustive illustration of what the allowlist rejects", which is the
right demotion because an illustration cannot be mistaken for the definition. The
classes the second review raised as counterexamples are each addressed by the
rule rather than by an addition: U+2028 and U+2029, zero-width characters, tag
characters, and invalid UTF-8 are all outside the allowed byte set, and the last
one is closed explicitly — "a byte at or above `0x80` is escaped as a byte, never
passed through" — which is the sentence that keeps a byte string from becoming
invalid UTF-8 inside a structured export.

The tab exception is argued instead of assumed: it is the only non-printing byte
an indented source line needs, and it cannot start an escape sequence, move the
cursor to a new line, or introduce a control byte. The cap interaction is also
right and was not asked for: truncation happens on the input at a UTF-8 scalar
boundary, is marked with the ASCII suffix `...`, and escaping runs afterwards, so
no field can end in half an escape sequence and the marker is itself inside the
allowed set.

The test is no longer generated from the answer key. The verification plan seeds
"every byte `0x00`..`0x1F` and `0x7F`..`0xFF`" — the complement of the allowlist,
which is the total form — into a spec, an echoed source line, and a module
message, and asserts on the emitted bytes; it then adds an independent hostile
corpus (ANSI and CSI sequences, OSC 8, DCS, UTF-8-encoded C1, zero-width and
combining marks, bidi isolates, U+2028/U+2029, NEL, tabs against spaces, and a
line long enough to truncate) that is explicitly "not derived from the
allowlist". A test in that shape can fail, which is the property the enumerated
version lacked.

### `B-4` — The record shape and the escaping rule omitted the one string a module fully controls: closed

> `detail` is the one field a module controls end to end: `E_CONFIG_MODULE_SYNTAX`
> is only useful because the parser names the offending token, and
> `E_CONFIG_MODULE_EVAL` is only useful because the raised message is carried. It
> is therefore in the record, inside the escaping rule, and bounded like every
> other field, rather than dropped to avoid the risk.
>
> — contract § "Diagnostics and error taxonomy", record shape

The field exists, it is sixth in the record, it is capped at 512 bytes, it is
named in the escaping enumeration and in the field list, and the `SYNTAX` and
`EVAL` rows now say the message is carried there. The truncation rule reaches it
by name, and the cap is small enough that the escape expansion cannot make a
single message dominate a log line. The choice to carry the message instead of
dropping it is justified against shipped behavior — `crates/bitty-config/src/file.rs`
at `7ac871d4` maps a Lua error message onto the validation diagnostic — and that
justification is the correct one: dropping it would have been a diagnosability
regression dressed as a hardening.

The verification item is written in the form that makes it a test rather than a
restatement: a module that raises `error` with control bytes and a bidi override,
and a syntax error whose offending token contains them, must reach `detail`
bounded and escaped on all four paths; a message past the cap must truncate and
still satisfy the allowlist; and "a build that drops the message instead of
carrying it must fail the test, so diagnosability is asserted rather than
assumed". That last clause is the one that would have caught the defect, and it
is now a requirement rather than a preference.

One wording consequence is recorded as `N-11`: `detail` is described as
"module-authored", but the `E_CONFIG_MODULE_ROOT` record puts host-authored layout
text in the same field, and "naming the layout" sits next to a redaction rule that
forbids printing the canonical root.

## The two admitted residuals

The amendment admits two residuals and this review re-checked both, because the
failure mode that matters here is a residual that is described once and then
quietly becomes a closed property in the next revision.

**Mount point and root anchor — correctly residual.** The threat-model TOCTOU row
now ends: "The anchor is a directory, not a path: a mount point, or a root
ancestor swapped before the root is opened, can still present a foreign tree, and
the walk then confines reads to that tree." That is the honest statement of what
a descriptor-anchored walk cannot do: it confines reads to whatever tree the
anchor names, and it cannot tell whether that tree is the one the user meant. The
row is also explicit that the identity comparison is "a redundant confirmation and
cache key, not the containment mechanism", so the residual is attached to the
mechanism that actually carries the guarantee. The § "Unix and macOS notes"
mount-point bullet and the reviewer note that names "mount-point, root-anchor, and
remote-or-removable-medium" as residuals for the implementation issue are
consistent with the row. Nothing here is claimed closed.

The diff makes this stronger, not weaker. The previous revision's TOCTOU residual
read "a swap that preserves identity is the same file and harmless" — the exact
sentence that made the defect invisible, because the swap the second review
described preserves identity precisely by recording the attacker's tree as the
reference. That sentence is gone, and its removal is the substantive fix in the
threat-model table.

**Remote, mapped, or removable root — correctly residual.** § "Module-root medium
assumptions" states the local-fixed-volume assumption, separates what survives
without identity uniqueness (containment, object typing, caps, budgets) from what
does not (alias collapse and duplicate-load suppression), and records the medium
as "permitted in this revision as an accepted residual ... not as a closed
property", with the local-only restriction left as an open point. The threat-model
row matches, and the open-points section repeats it. That is a correct demotion:
the residual is stated where a reader of the mechanism will meet it, in the table
that carries residuals, and in the list of undecided questions.

Neither residual is silently dropped, and neither is re-described as closed
anywhere in the amended text. The reviewer note that "no row may be re-described
as closed in a later revision without evidence" is the rule that keeps it that
way, and this review relies on it.

## Verdict on the still-open non-blocking series

`N-1`, `N-2`, and `N-4` were closed by the previous amendment and stay closed.
The amendment under review completes `N-4` by naming the code the root refusal
was missing and does not otherwise disturb them. Five remain open, and four new
ones are added below. None withholds acceptance.

| ID    | Status     | Finding and expected disposition                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `N-3` | Still open | The 256 KiB aggregate cap and the PB-1 claim remain asserted rather than measured. The threat row states the debt correctly ("must be measured against PB-1 before the aggregate cap becomes contract") and the open points repeat it, but nothing measures it. Measure a maximal graph (64 identities, 256 KiB) against PB-1 p50/p99 before the number becomes contract; acceptance here does not make it contract-grade.                                                                                 |
| `N-5` | Still open | No [risk register](risk-register.md) or [evidence matrix](evidence-matrix.md) row exists for this loader; the threat-model entry is a required-defense record, not a tracked risk. Add a risk row before any loader-shipped release, so the residual set is tracked and not only described.                                                                                                                                                                                                                |
| `N-6` | Still open | `bitty config check --json` graph emission is still an open point and still unbound: "whether the graph is emitted, or only per-finding records, is left to the implementation issue once the diagnostic schema is fixed". The escaping rule now covers any structured export, so the encoding half is closed; the disclosure half is not. Bind it: graph emission, if any, carries specs, lines, and codes only, never absolute paths, resolved roots, or identity tuples.                                |
| `N-7` | Still open | Resolution order and canonicalization order are still not related. For `a.b.c` the loader must probe `<root>/a/b/c.lua` and `<root>/a/b/c/init.lua` before either can be canonicalized, and a canonical call on the missing form fails with `ENOENT`, which item 2 does not classify (`E_CONFIG_MODULE_ESCAPE` covers loops and permission denial; `NOT_FOUND` covers neither form existing). State the order: probe both forms, decide `NOT_FOUND` or `AMBIGUOUS`, then canonicalize the one that exists. |
| `N-8` | Still open | `E_CONFIG_MODULE_NOT_REGULAR` still lists "directory reached by a non-`init` resolution", which reads as an exception for the `init` position. Both resolutions end in a file name, so both can be a directory carrying that name, and neither is admissible. Say "a directory at either resolution" and drop the qualifier in both item 4 and the taxonomy row.                                                                                                                                           |

`N-3` and `N-5` are the two that must not be read as satisfied by this record. The
first is a measurement obligation on a number this contract proposes; the second
is a tracking obligation on the residual set. Acceptance of a design does not
discharge either, and the implementation issue is where both belong.

`N-6` and `N-7` are decision gaps rather than description gaps. `N-6` is a
disclosure question the diagnostic schema now makes answerable — with the
escaping rule total, the only remaining risk in a graph record is the fields it
chooses to carry — and `N-7` is the one place where two sections still have to be
put in order by the implementer rather than read off the contract.

## New non-blocking findings

None of these is a property the described mechanism fails to deliver, which is
why none of them blocks. Each is a place where an implementer must choose, or
where two clauses of the same document describe different rules, and each has a
one-line correction.

### `N-9` — Item 3 still names a by-path open as "the fallback", and three other clauses forbid it

**Where:** contract § "Path containment and platform handling", item 3 first
sentence; § "Unix and macOS notes"; § "Security review checklist"; §
"Verification plan".

**Finding.** Item 3 opens:

> The anchored walk is the rule and a by-path open is the fallback, because only
> the anchored walk refuses an intermediate component that is swapped after
> canonicalization.

No clause defines when that fallback is taken, what flags it uses, or what
containment it provides. Three other clauses forbid it: § "Unix and macOS notes"
says "the fallback there is not a by-path open plus an identity comparison: it is
the per-component `openat` walk from the root descriptor in step 3", and that a
target which cannot do a descriptor-relative per-component walk "does not build
the loader and reports `E_CONFIG_MODULE_ROOT`"; the checklist requires the read
target to be "reached by a walk from an open root descriptor on every platform";
and the verification plan requires "a negative control that a by-path open cannot
pass". The topic sentence is the only place a by-path open is permitted, and it is
the place a reader arrives first.

**Why it does not block.** No platform and no condition is assigned to the
fallback, so there is no concrete case in which two clauses demand different
behavior: the one condition that needs a fallback — a Linux kernel without
`openat2` — is bound to the per-component walk by name, and the checklist and the
verification plan are the instruments acceptance is read against. The residual
risk is that an implementer, looking for the fallback the contract promises,
writes the canonical-path-plus-identity version the same item spends a paragraph
disqualifying. That is a real way to lose the guarantee, but it is a drafting
defect with a fail-closed detailed rule behind it, not a claim that the mechanism
delivers something it cannot.

**Required correction.** Delete the fallback clause and say what is true: the
anchored walk is the mechanism on every platform, and there is no by-path open in
this revision. If a fallback is intended, it must be named with its flags, its
platforms, and its containment, and the checklist and verification clauses must be
brought into line.

### `N-10` — The read boundary has two plausible codes and one unnamed one

**Where:** contract § "Path containment and platform handling", item 5; §
"Diagnostics and error taxonomy", `E_CONFIG_MODULE_SIZE` and
`E_CONFIG_MODULE_READ` rows.

**Finding.** Three assignments are unstated. First, an oversized file reaches two
rows: `E_CONFIG_MODULE_SIZE` ("A file exceeded 64 KiB") if the metadata test runs
first, and `E_CONFIG_MODULE_READ` ("or read past the 64 KiB cap") if the
`take(cap + 1)` result is what trips. The house precedent in
`plugin_settings.rs` refuses the metadata size _before_ reading, which implies
`SIZE`, but the contract does not say so. Second, a failed `fstat` on the handle —
the step that decides the object type — has no code at all: it is not a read, and
`NOT_REGULAR` asserts a type decision that was never made. Third, `E_CONFIG_MODULE_ROOT`
carries `detail`, which the record shape describes as "the module-authored parse,
compile, or evaluation message", so a host-authored layout string lands in a field
whose definition says it is module text.

**Why it does not block.** Each of the three is a label question on a refusal that
happens either way; none of them can turn a refusal into an accept, and none of
them is a refusal the contract mandates reporting without any code, which was the
substance of `B-2`. The taxonomy is exhaustive over refusal _paths_; what is
imprecise is which row receives which path.

**Required correction.** State that the handle's metadata size is checked against
the 64 KiB ceiling before the read and is `E_CONFIG_MODULE_SIZE`, that a
`take(cap + 1)` result at or beyond the ceiling is `E_CONFIG_MODULE_READ`, and that
a failed `fstat` is `E_CONFIG_MODULE_READ`. Broaden the `detail` definition to
"the message or layout text a refusal carries, module-authored or host-authored".

### `N-11` — The root record's `detail` "names the layout", and redaction forbids the canonical root

**Where:** contract § "Windows path rules", root ancestors; § "Diagnostics and
error taxonomy", `E_CONFIG_MODULE_ROOT` and source attribution and redaction.

**Finding.** The root refusal is specified as "`phase` `root`, `source` naming the
entry, `detail` naming the layout as refused, and no `module_spec`". The
redaction rule two sections later says diagnostics "never print the resolved
absolute path, the canonical root, the identity tuple, or other filesystem
metadata". "The layout" is not defined as a category or as a path, so a reader can
satisfy the first sentence by printing the configuration directory — which is the
canonical root — and a reader who takes the redaction rule literally cannot print
anything that identifies the layout. The root record is exactly where this
matters, because it is the one record with no spec to attribute the failure to and
therefore the one most likely to be made helpful by pasting a path.

**Why it does not block.** The redaction rule is unconditional and binds the
renderer, so an implementer who follows it does not leak; the ambiguity is about
whether "layout" denotes a path or a kind. No guarantee is asserted that the
mechanism cannot deliver, and no refusal is untyped.

**Required correction.** Say that `detail` names the layout _kind_ — redirected
profile, unreadable ancestor, resolution loop, not a directory — and never its
path, so the two rules cannot be read against each other.

### `N-12` — The threat-model `D-2` row still describes containment's third leg as identity

**Where:** [threat model](threat-model.md), restricted config module loader,
required-defense bullet `D-2`; contract § "Normative sources this specification
must not weaken".

**Finding.** The `D-2` bullet still reads: "threefold containment — lexical ...,
canonical ..., and handle-bound identity (per-component no-follow with `openat2`
`RESOLVE_BENEATH`/`RESOLVE_NO_MAGICLINKS` where available on Unix; unconditional
reparse-point refusal with junction/stream/device-name rejection plus post-open
identity match on Windows) — so a path swapped between check and read never
becomes the read target". The contract now requires the third leg to be the
descriptor-anchored walk and states that the identity comparison is not part of
containment on any platform. The two documents therefore give the same required
defense two different names, which is the condition the second review cited as
evidence for `B-1` — resolved now in the contract's favor, but not in the record
that governs it.

**Why it does not block.** The contract is stricter than the record: it satisfies
the `D-2` requirement (per-component no-follow with `openat2` `RESOLVE_BENEATH`)
and adds a rule the record does not state. Nothing the record requires is dropped,
so no required defense is weakened, and the divergence cannot turn into a fail-open
while the contract is the operative text.

**Required correction.** When the contract is promoted, update the `D-2` bullet to
name the descriptor-anchored walk as the third leg and to describe the post-open
identity match as a cache key and redundant confirmation rather than a containment
step. Until then, the contract's § "What the identity is for" is the operative
sentence.

## What this verdict does and does not authorize

It authorizes:

- the contract to leave `status: draft`; the promotion itself is an edit to the
  owning repository, which this review does not make;
- creation of the dependent implementation issue under the sequencing in
  `bitty#2670`, with the loader design as written;
- the containment, budget, safe-mode, and isolation sections as approved design, on
  the reasoning in the per-finding verdicts above;
- the error taxonomy as exhaustive over the refusal surface, subject to the code
  assignments in `N-10`;
- the residual set as carried accepted risk: mount point and root anchor, remote or
  removable root, FUSE and exotic filesystems, concurrent replacement between two
  `require` calls, module-mutated returned tables, spec-name layout disclosure, and
  owner-edited configuration.

It does not authorize:

- any statement that the loader exists, works, or is shipped; nothing here is
  evidence of behavior, and the contract's own "no statement here claims shipped,
  stable, or supported behavior" framing stands;
- treating any residual as closed, or removing one from the implementation issue;
- the 256 KiB aggregate, 64-module, and 16-deep numbers as contract constants
  before the PB-1 measurement in `N-3`;
- a loader-shipped release before the risk-register row in `N-5`;
- `bitty config check --json` graph emission without the binding in `N-6`;
- closure of `bitty#2670` beyond this design gate, or of any P0 control; the
  evidence obligations in the verification plan are post-acceptance work, not
  satisfied by acceptance.

## Residual risk carried to the implementation

Unchanged from the second review except where noted, and each belongs in the
implementation issue as accepted risk rather than an open defect.

- **Unix mount point inside the root.** A mount can present a foreign tree; accepted
  while its canonical path is under the root, recorded, not closed.
- **Root anchor replaced before the root is opened.** The anchor is a directory, not
  a path; a root ancestor swapped before the open makes the walk confine reads to
  the attacker's tree. Newly stated in this revision, and stated correctly.
- **Remote, mapped, or removable module root.** Identity and alias-collapse exactness
  are unproven there; the medium is permitted as a stated residual.
- **Exotic, FUSE-backed, or network-backed filesystems** can defer inside `open`,
  `fstat`, or the read in ways no flag controls; the bounded read and the typed
  refusal bound the rest, and the delay is outside the guarantee.
- **Concurrent replacement between two `require` calls in one generation.** The first
  identity is cached, so the graph does not re-read.
- **A module can mutate its own returned table**, and a table it received from
  another module, before returning — the same power the entry chunk has today, with
  more intra-generation coupling and no new authority.
- **Spec names disclose the local module layout** to a reader of a diagnostic.
- **Owner-edited configuration as the attack path** is out of scope by trust model.

`N-9` through `N-12` are not residuals; they are text corrections, and they may not
be carried as accepted risk in place of being fixed.

## Evidence register

| Item                  | Verdict            | Evidence                                                                                                                                                                                                 |
| --------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `G-1`                 | Closed             | Contract item 4, open → `fstat` → non-regular refusal → clear → read; unchanged by this amendment and re-checked for consistency with the anchored walk                                                  |
| `G-2`                 | Closed             | Contract "Bounding is not encoding" and the render-point rule; now carried by the allowlist                                                                                                              |
| `G-3`                 | Closed             | Contract item 2 remainder rule and item 3 root open; the allowance and the detection no longer compete                                                                                                   |
| `B-1`                 | Closed             | Contract item 3 (root open, Linux/macOS/Windows branches, "What the identity is for"); threat-model TOCTOU row; verification-plan intermediate-component control                                         |
| `B-2`                 | Closed             | Contract item 5; `E_CONFIG_MODULE_READ` and `E_CONFIG_MODULE_ROOT` rows; four-path paragraph; `plugin_settings.rs` `read_bounded_regular_file` and `activation.rs` `read_record_bytes` at `7ac871d4`     |
| `B-3`                 | Closed             | Contract allowlist bullet, tab exception, caps and truncation, "What the property is asserted over"; verification plan complement sweep plus independent corpus                                          |
| `B-4`                 | Closed             | Contract record shape (`detail`, 512 bytes), field list, `SYNTAX`/`EVAL` rows; `crates/bitty-config/src/file.rs` message mapping at `7ac871d4`; verification item including the drop-the-message failure |
| Mount/anchor residual | Correctly residual | Threat-model TOCTOU and symlink rows; § "Unix and macOS notes"; reviewer note naming the residual set                                                                                                    |
| Remote root           | Correctly residual | Contract § "Module-root medium assumptions"; threat-model medium row; open points                                                                                                                        |
| `N-3`                 | Open               | Contra: threat-model resource row and open points both defer the measurement                                                                                                                             |
| `N-5`                 | Open               | Contra: no loader row in [risk register](risk-register.md) or [evidence matrix](evidence-matrix.md)                                                                                                      |
| `N-6`                 | Open               | Contra: open points, `--json` graph bullet                                                                                                                                                               |
| `N-7`                 | Open               | Contra: § "Resolution order" and item 1/2 still unsequenced                                                                                                                                              |
| `N-8`                 | Open               | Contra: item 4 and `NOT_REGULAR` row keep "directory reached by a non-`init` resolution"                                                                                                                 |

## Verification obligations that survive this review

The contract's verification plan is adequate and is not restated here. Three
obligations are added, one per new textual ambiguity that a test can pin.

- **Refuse to build rather than fall back.** On a platform or kernel where a
  descriptor-relative per-component walk is unavailable, assert
  `E_CONFIG_MODULE_ROOT` and assert that no module loads by path — that pins
  `N-9` in behavior instead of in prose.
- **No path in the root record.** With an unbuildable root, assert that the
  rendered record on all four paths names the layout kind and contains no
  separator-delimited host path, absolute root, or identity tuple — that pins
  `N-11` against the redaction rule.
- **One code per read-boundary refusal.** Table-drive the three cases — metadata
  size over the ceiling, a `take(cap + 1)` result at or beyond it, and a failed
  `fstat` — and assert the code and path for each, so `N-10` cannot be resolved
  differently in `config check` and `doctor`.

## Limitations of this review

- No loader exists, so every judgment is about a described mechanism. This round
  had the easier task the earlier rounds could not have: the mechanism is now
  stated precisely enough to be judged, including its negative claims.
- The house-behavior claims were checked by reading `bitty` at `7ac871d4`, not by
  executing it. The two bounded-read functions were read in full; the config
  loader's own error mapping in `crates/bitty-config/src/file.rs` was not re-read
  this round and is cited from the second review, whose verdict on it this review
  does not reopen.
- Windows behavior was reviewed as text only. No Windows host was used, so the
  reparse, `FILE_ID_INFO`, 8.3, and case-folding rules are judged for internal
  consistency, not platform accuracy.
- `openat2` semantics — `RESOLVE_BENEATH` returning `EXDEV` for an absolute or
  escaping remainder, `RESOLVE_NO_SYMLINKS` applying per component from the anchor
  — were reasoned from the documented interface, not exercised on this host.
- Performance numbers were not measured; `N-3` records the obligation.
- I did not edit the reviewed contract, and I opened no issue and left no comment
  on one. The verdict is returned to the design gate, which acts on it.

## References

- [Config Lua require contract (candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/config-lua-require-contract-candidate.md) — the reviewed document, at `d327a1a`.
- [Restricted config require loader review](config-require-loader-review.md) — round 1, the origin of `G-1` to `G-3` and `N-1` to `N-6`.
- [Restricted config require contract re-review](config-require-rereview.md) — round 2, the origin of `B-1` to `B-4` and `N-7` to `N-8`.
- [Threat model](threat-model.md) — restricted config module loader, required defenses `D-1` to `D-6`; `N-12` lands on its `D-2` bullet.
- [Security overview](overview.md) — least privilege per input class, bounded size, time, nesting and memory, `--safe` baseline.
- [P0 acceptance criteria](p0-acceptance-criteria.md) — `P0-AC-005` deny-by-default local file loading, `P0-AC-008` control-character inspection, `P0-AC-019` safe mode always available, `P0-AC-026` trace minimization and redaction.
- [Risk register](risk-register.md) and [evidence matrix](evidence-matrix.md) — where the loader's residual set is still not tracked (`N-5`).
- Issue [`bitty#2670`](https://github.com/bitty-terminal/bitty/issues/2670) — the design gate this review answers.
