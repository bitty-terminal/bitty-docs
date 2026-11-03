---
title: Restricted Config Require Contract Re-Review
description: Re-review of the amended restricted configuration module loader contract, with a closed-or-open verdict per prior blocking gap, four blocking gaps introduced by the new wording, and the non-blocking findings still open
category: security
audience: security-reviewer
document_type: research
status: draft
website_publish: false
sidebar_order: 48
---

# Restricted Config Require Contract Re-Review

## Review status

**Verdict: `NEEDS-FIX`.** The amendment closes all three blocking gaps the
earlier review recorded: special-file rejection now has a non-blocking open
order, diagnostics now have an encoding rule bound at the render point, and the
handle-bound open now names its target. It is not accepted, because closing
them changed the description of the mechanism, and the new description makes
four claims its own steps do not deliver — one in containment, one in the read,
two in the escaping rule. The candidate stays `draft`, is **not** eligible for
promotion, and no dependent implementation issue is authorized by this record.

| Item              | Value                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Reviewed contract | [Config Lua require contract (candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/config-lua-require-contract-candidate.md) |
| Reviewed revision | `bitty-terminal-docs` `955ef0b` (amend, squash); identical to `origin/main` `25aa80f`, the later commit touching only a sibling specification                      |
| Earlier review    | [Restricted config require loader review](config-require-loader-review.md), `NEEDS-FIX` on `G-1` to `G-3`                                                          |
| Threat model      | [Threat model](threat-model.md), restricted config module loader, required defenses `D-1` to `D-6`                                                                 |
| Code evidence     | `bitty` `origin/main` at `7ac871d4`, read-only; no checkout, no build, no test run                                                                                 |
| Review date       | 2026-11-03                                                                                                                                                         |
| Reviewer role     | Independent security reviewer; no authorship of the reviewed contract or of the code it cites                                                                      |
| Gate              | This repository's documentation gate (format, links, metadata, language, hygiene, cross-repo links, state, actionlint)                                             |
| Outcome           | Status stays `draft`; promotion withheld until `B-1` through `B-4` are corrected; `N-3`, `N-5`, `N-6` remain open                                                  |

The reviewer wrote none of the amended text and did not implement any part of
the loader. The contract's own acceptance criteria require independent security
review to approve its containment, budget, safe-mode, and isolation sections and
to confirm that the taxonomy is exhaustive over the refusal surface. Containment
and diagnostics are again the two that cannot be approved as written; budgets,
safe mode, and isolation pass unchanged.

A clean acceptance would have been defensible only if the new wording were
airtight in the places it was rewritten. It is not: each of the four findings
below lands on a sentence the amendment added, and each is the same class of
defect as the gaps it closed — a stated property that the described mechanism
does not achieve, which an implementer would read as already satisfied.

## Scope and method

This is a re-review, not a second review. It re-judges exactly what the earlier
review marked for re-review — the containment section, the diagnostics section,
the taxonomy table, and the status line — and leaves the sections that passed
there alone: name grammar, root derivation, resolution order, cache and cycle
semantics, the four failure paths, budgets, safe mode, and cross-VM isolation.
Where the amendment touched a passing section to fold in a non-blocking finding
(budget-failure wording, root medium, Windows root ancestors), the change is
checked for internal consistency and for the taxonomy holes it creates, and is
otherwise accepted.

Method:

1. Read the amendment as a diff against the text the earlier review judged, so
   a correction is checked against the finding it answers rather than against a
   fresh reading of the whole document.
2. For each closed gap, quote the sentence that is supposed to close it, then
   ask what an implementer would build from that sentence alone.
3. Attack the new sentences as a fresh mechanism: walk the open sequence step by
   step and ask which step can still block, race, or carry a flag into the read;
   enumerate every renderer and every string it renders; locate the exact point
   at which a file identity is recorded and ask what that point proves.
4. Check every claim about shipped or house behavior against `bitty`
   `origin/main` at `7ac871d4` rather than accepting the contract as its own
   evidence.
5. Record each new finding with the section it lands in and the correction it
   needs, so the next revision can be reviewed by diff.

Out of scope, unchanged from the earlier review: whether the feature should
exist, the Lua standard library beyond the loader, plugin-host loader internals,
project-scope configuration trust, system or distribution Lua execution, and any
performance measurement. No loader exists, so nothing here is evidence of
shipped behavior; this record judges a design gate.

## Per-gap verdict on the three blocking gaps

### G-1 — Special-file rejection can block instead of refusing: closed

The amendment replaces the open-then-check order with an explicit sequence and
states that the sequence, not the flags alone, is the guarantee:

> The open is `O_RDONLY | O_NONBLOCK | O_CLOEXEC` together with the resolve or
> no-follow flags from step 3; the host then `fstat`s the handle and rejects any
> object whose type is not a regular file — FIFO, character or block device,
> socket, directory reached by a non-`init` resolution, named pipe — with
> `E_CONFIG_MODULE_NOT_REGULAR`. Only after that rejection does the host clear
> `O_NONBLOCK`, and only then does it perform the single read, whose length is
> capped from the handle's metadata at 64 KiB before the read starts. The order
> is the guarantee, not an implementation detail.
>
> — contract § "Path containment and platform handling", item 4

This closes the finding. A read-only open of a FIFO with `O_NONBLOCK` returns a
descriptor immediately instead of waiting for a writer, so the object test runs
at all; the test is `fstat` on the same handle, so it describes the object that
would be read; a non-regular object is refused before any read exists; and
`O_NONBLOCK` is cleared only after the object is proven regular, where the flag
is inert for reads. Nothing is left that can block on a FIFO, and the flag
cannot reach a read of a non-regular object because a non-regular object never
reaches a read.

Two observations narrow the credit rather than withhold it. First, clearing
`O_NONBLOCK` is unnecessary for a regular file: it is a no-op on the read path,
and it is only harmless because the contract fixes the order, which is exactly
why the text is right to say so. An implementation that clears the flag before
the `fstat` — the natural way to read "open, clear, read" — reintroduces the
defect, so the order needs a test, not just a sentence, and the verification
plan's "a test that hangs is a defect, not a pass" is the right form. Second,
this sequence matches practice the repository already ships: `O_RDONLY |
O_NOFOLLOW | O_NONBLOCK | O_CLOEXEC`, then `file.metadata()` on the handle, then
a `!is_file()` refusal, in `crates/bitty-runtime/src/plugin_runtime/plugin_settings.rs`
and `crates/bitty-runtime/src/component/activation.rs` at `7ac871d4`. The
amended requirement describes a shape that exists and is exercised, not a novel
one.

The half of the old sentence that survives unaddressed is "in full": a single
read is not a completeness check. That is `B-2`.

### G-2 — Diagnostic echo has no encoding rule: closed

The amendment adds the rule the earlier review asked for, in the shape it asked
for, and binds it at the render point rather than at record construction:

> **Bounding is not encoding, so both are required.** Every rendered field — the
> spec, the entry name, the in-flight module chain, and any echoed source line —
> is escaped before it reaches a renderer.
>
> [...]
>
> The escaping rule binds at the point of rendering, not at the point of
> construction, and applies to every path that renders the record: the startup
> stderr line, `bitty config check` findings, `bitty doctor` diagnosis, the
> reload result, and any structured export. A new renderer inherits the rule and
> cannot opt out, and no diagnostic record carries a second, unescaped copy of
> the same field for internal display.
>
> — contract § "Diagnostics and error taxonomy", source attribution and
> redaction

That answers the finding: the record no longer defines `module_spec` as a raw
byte string, the escaped fields are named, the cap and the escape are separated
so one cannot substitute for the other, the render-point binding stops a new
path from skipping the rule, and the no-second-copy clause closes the internal
display loophole. The direction is right and the placement is right.

What the rule does not do is make the property total. It enumerates the classes
the earlier review happened to name, and the verification obligation seeds
exactly that enumeration, so the test cannot fail. That is `B-3`. It also leaves
the one string a module fully controls — its own error message — outside both
the record shape and the field list. That is `B-4`.

### G-3 — The handle-bound open target is unspecified: closed

The amendment states which path is opened and why the resolve flags do not
contradict the in-root symlink allowance:

> The canonical target is the path the loader opens: the allowed layout is
> honored by opening a path that contains no symlink component, not by refusing
> the layout at the open.
>
> [...]
>
> The pre/post-open identity comparison is what closes the race: a canonical
> path that now names a different file has a different identity and is refused,
> while the allowed in-root layout, whose canonical target is symlink-free, is
> never refused by the flags.
>
> — contract § "Path containment and platform handling", items 2 and 3

This closes the finding as stated. The allowance and the detection no longer
compete: canonicalization removes symlink components, so `RESOLVE_NO_SYMLINKS`
and `O_NOFOLLOW` are not a second refusal of an admitted layout, they are how a
link planted afterwards is detected, and the verification-plan item that proves
the layout is now provable. The Windows branch is consistent with the same
reading, refusing reparse points at every component below the canonical root.

The second quoted sentence is where the re-review turns. It is a claim about
what the identity comparison proves, and it proves less than that. That is
`B-1`.

## New blocking findings

Numbered `B-1` to `B-4` so they stay distinct from the closed `G-1` to `G-3`;
the earlier review's non-blocking series keeps its `N-` numbering.

### B-1 — The identity comparison cannot see an intermediate-component swap, and the open is anchored to nothing

**Where:** contract § "Path containment and platform handling", item 3 (Unix
bullet and the identity sentence), threat model row "TOCTOU swap between the
containment check and the read".

**Finding.** The Unix bullet specifies the open as:

> open the canonical path with `O_RDONLY | O_NONBLOCK | O_CLOEXEC` plus
> `openat2` `RESOLVE_BENEATH`, `RESOLVE_NO_SYMLINKS`, and
> `RESOLVE_NO_MAGICLINKS` where available, otherwise `O_NOFOLLOW` per component;
> then compare the `dev`/`inode` identity recorded at the canonical step against
> the post-open `fstat` identity.

Two defects sit in that sentence, and both matter on Linux, where `openat2` is
the branch that will actually be taken.

First, `RESOLVE_BENEATH` is defined relative to a directory descriptor and
rejects an absolute path with `EXDEV`; `RESOLVE_NO_SYMLINKS` likewise applies to
every component of the resolution from that anchor. The text says "open the
canonical path" — an absolute path — and never names the anchor descriptor or
the root-relative remainder. Read literally, the primary mechanism refuses every
load. Read charitably against `AT_FDCWD`, it anchors containment to the process
working directory rather than the module root, which is the one input the
contract's own root-derivation section says the rule never consults. Either way
the sentence cannot be implemented as written, and the contract's own threat
model already states the correct form — "per-component no-follow with `openat2`
`RESOLVE_BENEATH`" — so the two documents now disagree about the mechanism the
required defense names.

Second, the identity comparison proves that two resolutions of the same path
string agree; it does not prove the file is under the root. An identity
"recorded at the canonical step" has to be recorded by a path-following call:
`stat` follows every component, and `lstat` follows every component except the
last. So an attacker who replaces an intermediate directory component with a
symlink to a tree outside the root, in the window between canonicalization and
that recording call, makes the **recorded** identity the outside file's
identity. The subsequent open of the canonical path does not fire `O_NOFOLLOW`,
because the final component is a regular file; it follows the same swapped
intermediate component; the `fstat` identity matches the recorded one; and the
comparison passes. The check that "closes the race" is satisfied precisely in
the case the race is used. Canonical containment is never re-validated because
nothing after canonicalization resolves the path again against the root.

The same section's fallback branch — `O_NOFOLLOW` per component from an opened
directory — does not have this property, because a swapped intermediate
component is refused before it is traversed. So the weaker description is the
one that applies to the better platform.

**Why it is blocking.** `D-2` requires handle-bound containment such that "a
path swapped between check and read never becomes the read target". As written,
the stated mitigation does not deliver that for an intermediate component, and
the threat-model row asserts it does. This is the `G-1` and `G-3` class again:
a property the mechanism cannot support, written so that an implementer believes
it already holds.

**Required correction.** Make the anchored walk the rule and the path open the
fallback, not the reverse: open the canonical root once as `O_DIRECTORY |
O_NOFOLLOW | O_CLOEXEC`, resolve the spec remainder from that descriptor with
`openat2(root_fd, remainder, RESOLVE_BENEATH | RESOLVE_NO_SYMLINKS |
RESOLVE_NO_MAGICLINKS)` on Linux and with per-component `openat` plus
`O_NOFOLLOW | O_DIRECTORY` on macOS and the BSDs, and record the identity from
the final handle only. Then state what the identity comparison is for — alias
collapse and a redundant confirmation — and drop the claim that it closes the
window. Add the negative test: swap an intermediate component between
canonicalization and the open, and require `E_CONFIG_MODULE_ESCAPE`.

### B-2 — "A single read, in full" is not a completeness check, and the taxonomy has no code for the refusals the amendment adds

**Where:** contract § "Path containment and platform handling", item 4; §
"Diagnostics and error taxonomy", record shape and taxonomy table; § "Windows
path rules", root ancestors.

**Finding.** Two separate obligations fail in the same paragraph.

The read is specified as one call with a length taken from metadata:

> the read happens once, in full, into the generation's accounted bytes, so it
> cannot be extended by a concurrent writer and cannot run past the cap.

"Once" is a mechanism. "In full" is not, under a single `read(2)`: a read on a
regular file may return fewer bytes than requested — the file shrank between the
`fstat` and the read, a signal interrupted it after a partial transfer, the
object sits on a filesystem that returns short reads. The cap comes from
metadata, so the requested length is the cap, not necessarily the file's extent.
A short read therefore yields a **prefix** of the module. A prefix cut at a
statement boundary can still compile, so the loader would accept a silently
truncated module and produce a partial plan — a fail-open on content, in
contradiction with the same section's "Nothing is silently defaulted". The
repository's own pattern for an equivalent read does the check this contract
omits: `read_bounded_regular_file` in
`crates/bitty-runtime/src/plugin_runtime/plugin_settings.rs` reads
`take(cap + 1).read_to_end()` and rejects when `bytes.len() != metadata.len()`,
as does `read_record_bytes` in `crates/bitty-runtime/src/component/activation.rs`
at `7ac871d4`. An implementer following the amended sentence literally would be
less careful than the shipped code for the same job.

The taxonomy then has nowhere to put the failure. The record shape offers
`phase ... open | read | parse | ...` and the table offers thirteen codes, of
which none is a read failure, a truncated read, or a length mismatch. The
amendment also creates a second untyped refusal: the Windows root-ancestor
paragraph now requires a diagnostic when the root cannot be canonicalized —

> If that canonicalization fails, the loader is not built and `require` reports
> a diagnostic that names the layout as refused; it never reports
> `E_CONFIG_MODULE_NOT_FOUND`, because a module-shaped error would send the user
> looking for a missing file instead of a redirected profile.

— and no `E_CONFIG_MODULE_*` code exists for it. Both refusals are therefore
untyped, one of them by explicit instruction.

**Why it is blocking.** The contract's own acceptance criterion is that "the
error taxonomy is exhaustive over the refusal surface and every code names the
path where it surfaces". Two refusals the amendment mandates are outside the
table, so an implementer must either invent codes — taxonomy drift across four
paths, the failure `D-5` exists to prevent — or reuse a wrong one, which for the
root case reproduces exactly the `NOT_FOUND` misdirection the fix was written to
remove. The read case is worse in kind: it is the only step where an object that
passed every containment and type check can still fail, and the contract asks
for a silent partial module instead of a refusal.

**Required correction.** Replace the single read with a bounded loop
(`take(cap + 1).read_to_end()`), require the byte count to equal the handle's
size, and state that a mismatch or a read error is a refusal rather than a
parsed prefix. Add `E_CONFIG_MODULE_READ` for a failed or short read and
`E_CONFIG_MODULE_ROOT` for the unbuildable-root refusal, each with its four-path
surfacing, and add both to the "how a refused module surfaces" mapping.

### B-3 — The escaping rule is an enumerated blocklist, and the test that proves it is generated from the same list

**Where:** contract § "Diagnostics and error taxonomy", source attribution and
redaction; § "Verification plan", diagnostic-injection item.

**Finding.** The rule names five classes:

> C0 controls except tab, every C1 control, DEL, ESC-initiated sequences, and
> bidirectional formatting characters (U+202A..U+202E, U+2066..U+2069) are
> replaced with a visible escape form.

The property the same paragraph argues for is broader than the list: hostile
input must not be able to move the cursor, rewrite the title, reverse text
direction, or "plant a second record inside a log stream". Several classes
outside the enumeration achieve those harms with no C0 or C1 byte and no
bidirectional character:

- `U+2028` LINE SEPARATOR and `U+2029` PARAGRAPH SEPARATOR. Line-based consumers
  and rendered log views break a record there; this is the record-splitting harm
  by another route. (`U+0085` NEXT LINE is a C1 control and is covered.)
- `U+200B`..`U+200F`, `U+2060`, `U+FEFF`: invisible format characters, so a spec
  renders as something other than its bytes.
- `U+E0000`..`U+E007F` tag characters: invisible ASCII, so a diagnostic can
  carry a hidden second string past a human reader.
- Bytes at or above `0x80` that are not valid UTF-8. The field is defined as
  "the require argument byte string", so a character-shaped rule does not
  classify them at all; an implementation that copies bytes through emits
  invalid UTF-8 into the structured export, and in a terminal that honors 8-bit
  C1 the byte `0x9B` is `CSI`.

The verification obligation then seeds "C0 controls, C1 controls, DEL,
ESC-initiated sequences, and bidirectional formatting characters" — the same
list, class for class. It passes by construction, because it tests the
enumeration rather than the property, and it will keep passing while the classes
above reach the renderer unescaped.

**Why it is blocking.** `D-6` requires that diagnostics not be a channel hostile
input controls. The amended rule delivers that for the classes it names and
asserts it for the property, and the only test in the plan cannot tell the
difference. This is a narrower version of `G-2`, but it is the same defect: the
sentence is stronger than the mechanism beneath it.

**Required correction.** State the rule as an allowlist over bytes, so it is
total by construction and needs no enumeration: every byte outside `0x20`..`0x7E`
except tab is replaced with a visible escape (`\xNN`, or `\u{...}` for a decoded
code point), with the five classes kept only as a non-exhaustive illustration.
Generate the verification input from the complement of the allowed set instead
of from the list.

### B-4 — The record shape and the escaping rule omit the one string a module fully controls

**Where:** contract § "Diagnostics and error taxonomy", record shape and
taxonomy table.

**Finding.** The record is defined with five fields:

```text
code         E_CONFIG_MODULE_* code from the taxonomy below
module_spec  the require argument byte string, bounded and escaped for display
phase        name | resolve | open | read | parse | evaluate | extract | budget
source       entry, or the module spec with its source line and column, escaped
aggregate    the counter that tripped (count | depth | bytes | budget), when applicable
```

and the escaping rule binds "every rendered field — the spec, the entry name,
the in-flight module chain, and any echoed source line". Neither includes the
compile or evaluation message, yet the taxonomy requires it to exist:
`E_CONFIG_MODULE_EVAL` is defined as "A module chunk raised a Lua error or
violated the shape contract", and `E_CONFIG_MODULE_SYNTAX` is only useful because
the parser names the offending token. The shipped path renders that string
today — `crates/bitty-config/src/file.rs` at `7ac871d4` maps
`ConfigOutcome::LuaError { message }` to `ConfigError::validation("config", message)`
and routes `ShapeError { message }` through a validation error — so it is
module-authored text already on the diagnostic surface, and a module can write
`error("\27]0;title\7")` or embed a bidi override in it.

Because the message is not a field, the field-by-field rule does not reach it,
and the "no second, unescaped copy" clause does not either. Both readings of the
amended text are wrong: rendering it reopens `G-2` on the highest-risk string in
the record, and dropping it is a diagnosability regression against shipped
behavior, since "one bounded diagnostic names the code, the spec, and the entry"
does not locate a syntax fault that the parser reports by token.

**Why it is blocking.** The earlier review's finding was that bounding is not
encoding; the amendment fixes that for the fields it lists and leaves the field
that carries arbitrary module text outside the record entirely. An escaped
record that has no place for the message is not an escaped diagnostic, it is an
escaped subset of one, and the acceptance criterion asks for the taxonomy to be
exhaustive over the refusal surface — a message field is part of that surface.

**Required correction.** Add `detail` to the record: the bounded, escaped
compile or evaluation message, subject to the same rule as every other field,
capped at a stated size, and named in the escaping enumeration. If the message
is deliberately not rendered, say so and say what locates the fault instead, so
the decision is visible rather than an omission.

## Non-blocking findings

The three non-blocking findings the amendment folded in are closed by it and are
recorded as such; the three the amendment left for a follow-up are still open,
and two new ones are added.

| ID    | Status     | Finding and expected disposition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `N-1` | Closed     | Budget failure had three phrasings. The amendment states one behavior per path — "`E_CONFIG_MODULE_BUDGET` is the same fail-soft-at-startup, strict-at-verification behavior as every other code in the taxonomy" — and the taxonomy row now reads "layer fail-soft / strict failure" like its neighbours.                                                                                                                                                                                                                                                                 |
| `N-2` | Closed     | The root medium is now stated in its own subsection: containment, object typing, caps, and budgets hold on every medium; alias collapse and duplicate suppression are exact only on a local fixed volume; remote and removable roots are an accepted residual, and whether to restrict to local volumes is an open point.                                                                                                                                                                                                                                                  |
| `N-3` | Still open | The aggregate cap and the PB-1 claim remain asserted rather than measured. The threat-table row now says the cost "must be measured against PB-1 before the aggregate cap becomes contract", which states the debt correctly, but nothing measures it. Measure a maximal graph (64 identities, 256 KiB) before the numbers become contract.                                                                                                                                                                                                                                |
| `N-4` | Closed     | A redirected or junctioned `%APPDATA%` is no longer refused: root ancestors are canonicalized once and not refused, and a canonicalization failure must report the layout as refused rather than as a missing module. The refusal has no code, which is `B-2`.                                                                                                                                                                                                                                                                                                             |
| `N-5` | Still open | No risk-register or evidence-matrix row exists for this loader. The threat-model entry is a required-defense record, not a tracked risk. Add a risk row before any loader-shipped release.                                                                                                                                                                                                                                                                                                                                                                                 |
| `N-6` | Still open | `bitty config check --json` graph emission remains an open point and is still unbound. If the graph is emitted it must carry specs and lines only, never absolute paths, resolved roots, or identity tuples; bind the decision rather than deferring it to an implementation that will then choose.                                                                                                                                                                                                                                                                        |
| `N-7` | New        | Resolution order and canonicalization order are not related to each other. For spec `a.b.c` the loader must probe `<root>/a/b/c.lua` and `<root>/a/b/c/init.lua` before either can be canonicalized — a canonical call on a path that does not exist fails with `ENOENT` — but § "Resolution order" and item 2 do not say that the two existence probes precede canonicalization, or what an `ENOENT` from canonicalization means when the other form exists. State the order: probe both forms, decide `NOT_FOUND` or `AMBIGUOUS`, then canonicalize the one that exists. |
| `N-8` | New        | `E_CONFIG_MODULE_NOT_REGULAR` lists "directory reached by a non-`init` resolution", which implies a directory at the `init` position is acceptable. It is not: the rule is regular files only, at either resolution. Say "a directory at either resolution", so the parenthetical does not read as an exception.                                                                                                                                                                                                                                                           |

## Residual risk carried to the implementation

The residuals the contract states are unchanged and remain accepted:

- **Unix mount point inside the root.** A mount can present a foreign tree; the
  contract accepts it while its canonical path is under the root and records it.
- **Non-`openat2` fallback.** A component-wise no-follow walk plus a post-open
  identity comparison; the walk is stronger than the identity match, which is
  the point of `B-1`.
- **Remote, mapped, or removable module root.** Identity and alias-collapse
  exactness are unproven there; the medium is permitted as a stated residual.
- **Exotic, FUSE-backed, or network-backed filesystems** can defer inside `open`
  or `fstat` in ways no flag controls; the size cap and the single read bound the
  rest, and the refusal is typed when the call returns.
- **Concurrent replacement between two `require` calls in one generation.** The
  first identity is cached, so the graph does not re-read.
- **A module can mutate its own returned table**, and a table it received from
  another module, before returning — the same power the entry chunk has today,
  with more intra-generation coupling and no new authority.
- **Spec names disclose the local module layout** to a reader of a diagnostic.
- **Owner-edited configuration as the attack path** is out of scope by trust
  model.

`B-1` through `B-4` are not residuals and must not be carried as accepted risk.
Each is a defect in the described mechanism, and each is cheap to correct in
text before any loader exists.

## Evidence register

| Item  | Verdict | Evidence                                                                                                                                                                                                                                               |
| ----- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `G-1` | Closed  | Contract § "Path containment and platform handling", item 4 (open → `fstat` → non-regular refusal → clear → read); shipped house pattern in `plugin_settings.rs` `read_bounded_regular_file` and `activation.rs` `open_record_no_follow` at `7ac871d4` |
| `G-2` | Closed  | Contract § "Diagnostics and error taxonomy", "Bounding is not encoding" and the render-point rule; [threat model](threat-model.md) `D-6`                                                                                                               |
| `G-3` | Closed  | Contract § "Path containment and platform handling", item 2 last sentence and item 3 identity sentence; verification-plan layout item                                                                                                                  |
| `B-1` | Open    | Contract item 3 Unix bullet and identity sentence; [threat model](threat-model.md) `D-2` "per-component no-follow with `openat2` `RESOLVE_BENEATH`"                                                                                                    |
| `B-2` | Open    | Contract item 4 "once, in full"; taxonomy table (no read or root code); `phase ... read ...`; `crates/bitty-config/src/file.rs` `read_config_file`, `plugin_settings.rs` `read_bounded_regular_file` at `7ac871d4`                                     |
| `B-3` | Open    | Contract escaping bullet; verification plan diagnostic-injection item, which seeds the same list                                                                                                                                                       |
| `B-4` | Open    | Contract record shape; `E_CONFIG_MODULE_EVAL` row; `LuaError`/`ShapeError` message mapping in `crates/bitty-config/src/file.rs` at `7ac871d4`                                                                                                          |

## Verification obligations that survive this review

The contract's verification plan is adequate for what it covers; these
obligations are added because the findings above make them necessary, and none
of them can be satisfied by the tests the plan already names.

- **Intermediate-component swap.** Replace a directory component under the root
  with a symlink to an outside tree between canonicalization and the open;
  require `E_CONFIG_MODULE_ESCAPE`. A test that only swaps the final component
  passes today and proves nothing about `B-1`.
- **Short and failing reads.** Present a regular file whose read returns fewer
  bytes than its metadata size, and one whose read fails, and require a typed
  refusal with no parsed prefix; assert that no truncated module produces a plan.
- **Unbuildable root.** Make root canonicalization fail (unreadable ancestor,
  resolution loop) and require the root refusal code, not `NOT_FOUND`.
- **Escaping property, generated from the complement.** Seed every byte outside
  printable ASCII plus tab, and every non-ASCII code point class, rather than
  the five enumerated classes; assert that the rendered record contains only
  printable ASCII plus tab.
- **Module-authored message text.** Raise `error` with control bytes and a bidi
  override from inside a module, and take a syntax error whose offending token
  contains them; assert the message reaches the record bounded and escaped, on
  all four paths.
- **FIFO refusal within a bounded time**, on all four paths, and a refusal that
  clears `O_NONBLOCK` only after the object test — the ordering test, not merely
  the outcome test.

## Limitations of this review

- No loader exists, so every judgment is about a described mechanism. `B-1` in
  particular is a defect of description: the mechanism it names could be
  implemented correctly, and the text would still not require it.
- The shipped-behavior claims were checked by reading `bitty` at one revision,
  not by executing the configuration VM or the daemon's file paths. The
  `O_NOFOLLOW | O_NONBLOCK | O_CLOEXEC` pattern and the length-mismatch check are
  cited as precedent for shape, not as proof that the config loader behaves that
  way.
- Windows behavior was reviewed as text only. No Windows host was used, so the
  reparse, `FILE_ID_INFO`, 8.3, and case-folding rules are judged for internal
  consistency, not platform accuracy. The Windows branch of item 3 does state a
  per-component refusal, which is why `B-1` lands on the Unix bullet.
- `openat2` semantics were reasoned from its documented contract, not exercised
  on this host.
- Performance numbers were not measured; `N-3` records the obligation.

## References

- [Config Lua require contract (candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/config-lua-require-contract-candidate.md) — the reviewed document, at `955ef0b`.
- [Restricted config require loader review](config-require-loader-review.md) — the review this one continues, and the source of `G-1` to `G-3` and `N-1` to `N-6`.
- [Threat model](threat-model.md) — restricted config module loader, required defenses `D-1` to `D-6`.
- [Security overview](overview.md) — least privilege per input class, bounded size, time, nesting and memory, `--safe` baseline.
- [P0 acceptance criteria](p0-acceptance-criteria.md) — `P0-AC-005` deny-by-default local file loading, `P0-AC-008` control-character inspection, `P0-AC-019` safe mode always available, `P0-AC-026` trace minimization and redaction.
- [Risk register](risk-register.md) and [evidence matrix](evidence-matrix.md) — where the loader's residual set should be tracked (`N-5`).
- Issue [`bitty#2670`](https://github.com/bitty-terminal/bitty/issues/2670) — the design gate this review answers.
