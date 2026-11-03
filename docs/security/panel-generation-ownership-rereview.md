---
title: Panel Generation Ownership Re-Review
description: Re-review of the amended panel generation ownership decision, with a closed-or-open verdict per prior blocking gap, the one gap the amendment only partly closes, and three blocking findings in the new bind and derivation text
category: security
audience: security-reviewer
document_type: research
status: draft
website_publish: false
sidebar_order: 49
---

# Panel Generation Ownership Re-Review

## Review status

**Verdict: `NEEDS-FIX`.** The amendment closes seven of the eight blocking gaps
the earlier review recorded, and it closes them by correcting the record rather
than by restating the earlier claim. It is not accepted, because the text that
closes two of them does not deliver what it says: the grant derivation reads a
predecessor set that the same section deletes before the derivation can run and
whose result the commit step never writes (`B-1`), workspace ownership resolves
from a source that has no referent in the record or in code (`B-2`), and the
release list for generation disposal is carried out only at the next bind
(`B-3`). One prior gap, workspace ownership, is only partly closed for the same
reason as `B-2`. The record stays `draft`, the promotion gate is **not** met, and
no dependent implementation issue is authorized by this review.

| Item              | Value                                                                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reviewed contract | [Panel Generation Ownership Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-generation-ownership-decision.md), `draft` |
| Reviewed revision | `bitty-terminal-docs` `25aa80f` (PR #378), the amendment that closed `G-1` to `G-8`                                                                                   |
| Earlier review    | [Panel generation ownership review](panel-generation-ownership-review.md), `NEEDS-FIX` on `G-1` to `G-8`, at `0ad9ef6`                                                |
| Threat model      | [Threat model](threat-model.md) at `0ad9ef6`, row `T-25`, authority carry-over across a panel generation boundary                                                     |
| Code evidence     | `bitty` `origin/main` at `7ac871d4`, read-only; no checkout, no build, no test run                                                                                    |
| Review date       | 2026-11-03                                                                                                                                                            |
| Reviewer role     | Independent security reviewer; no authorship of the reviewed decision, of the amendment, or of the code it cites                                                      |
| Gate              | This repository's documentation gate (format, links, metadata, language, hygiene, cross-repo links, state, actionlint)                                                |
| Outcome           | Status stays `draft`; promotion withheld until `B-1` to `B-3` are corrected and `G-3` is completed; `N-6` to `N-9` are added and carried                              |

The reviewer wrote none of the amended text and did not implement any part of
the decision or of `bitty`. The reviewed document lives in another repository
(`bitty-terminal-docs`) and was read from `origin/main`; nothing in this review
edits it.

A clean acceptance would have been defensible if the two rewritten mechanisms —
the grant derivation and the two-phase bind — were internally ordered. They are
not: `B-1` is a defect in the sequence of the amendment's own steps, not in a
sentence it inherited, and it is the same class of defect as the gaps it closes,
a stated property that the described mechanism cannot produce. `B-2` and `B-3`
land on sentences the amendment added to close `G-3` and `G-5`.

## Scope and method

This is a re-review, not a second review. It re-judges exactly the eight gaps
the earlier review marked for re-review, and it leaves the sections that passed
there alone: the ownership direction itself, content ownership, `PanelId`
survival, the identity-versus-authority separation, and the content and capture
release path. Where the amendment rewrote a passing section to fold in a
non-blocking finding or to answer a code correction, the change is checked for
internal consistency and for what it now makes the rest of the record claim.

Method:

1. Read the amendment as a diff against `634d181`, the text the earlier review
   judged, so each correction is checked against the finding it answers rather
   than against a fresh reading of the whole document.
2. For each closed gap, quote the sentence that is supposed to close it, then
   ask what an implementer would build from that sentence alone and whether the
   steps around it can produce that result.
3. Attack the new text as a fresh mechanism: walk the two bind phases in order
   and check that every input the derivation names is still readable when it
   runs, that every output it names has a step that writes it, and that every
   release the decision attributes to a generation boundary is triggered by
   that boundary rather than by the next one.
4. Check every claim about house code against `bitty` `origin/main` at
   `7ac871d4` — the revision the amendment itself pins — rather than accepting
   the record as its own evidence.
5. Record each new finding with the section it lands in and the correction it
   needs, so the next revision can be reviewed by diff again.

Out of scope, unchanged from the earlier review: whether panels should outlive
plugin generations, panel placement and the `View` versus `PanelId` encoding,
the non-terminal content scene path, the persistence contract behind
`RFC-OQ-9` (including whether restart restore ships), the Panel Runtime RFC's
lifecycle and focus rules, overlay geometry, accessibility semantics of the
placeholder, and any performance claim. No rebind code exists, so nothing here
is evidence of shipped behavior; this record judges a design gate.

## Per-gap verdict on the eight blocking gaps

Seven are closed. `G-3` is closed on three of its four required changes and open
on the fourth, because the sentence that assigns workspace membership resolves
from a source nothing defines; that residue is `B-2`.

### G-1 — The grant rule contained two mutually exclusive derivations: closed

The amendment replaces the three competing statements with one rule and states
the precedence that makes it decidable:

> The successor's own resolution comes first. No element of `grant(n+1)` lies
> outside `R`. This is the sense in which nothing is inherited: every capability
> the successor holds is one it obtained for itself.

and, for the direction that only narrows:

> **The predecessor's set is a ceiling, never a source.** `P` can only subtract.

It also removes the competing sentences by name rather than reinterpreting
them:

> Three sentences are removed rather than reworded, because each was a competing
> algorithm

— decision § "D.1 One derivation"

This closes the finding as the earlier review stated it. The formula
`grant(n+1) = (R ∩ P) ∪ C` admits exactly one reading: a filter that can only
shrink, plus an explicitly consented addition, with the successor's own
resolution above both. "Inherits nothing" as a headline is gone, and the
narrowing rule no longer needs consent, which the earlier review asked for
explicitly. The required change to name the boundary and the state it reads is
also present — "The derivation must run inside the bind commit — the
`rebind_panel` boundary in D.2 — and it reads three things: the successor's
resolution, the predecessor's set for the same `PanelId`, and the consent record
for this bind."

The gap is closed on its own terms. The placement it names is where `B-1` lands:
the boundary it points at deletes the second of those three inputs before the
commit.

### G-2 — The binding fence had no ordering, atomicity, or in-flight rule: closed

The amendment specifies the sequence, the atomicity, the in-flight class, and
the failed-invalidation branch:

> A bind is two phases. Phase 1 invalidates in five ordered steps, phase 2
> commits in one, and the successor may not issue its first panel verb until
> phase 2 has returned.

The failure branch and the revalidation rule sit beside the phases:

> If any step of phase 1 cannot complete, the bind is refused, nothing of phase
> 2 is written, the panel is left unbound, and the placeholder is presented.
> There is no partial bind and no "invalidated most of it" state.

and, for the timing of the check that makes the phases hold:

> Every panel verb checks the binding against the caller's controller generation
> immediately before it touches panel state, and a verb may not hold a panel
> reference across a yield, a callback boundary, or a queue drain without
> revalidating.

— decision § "D.2 Two-phase bind"

Each question the earlier review left to the implementer now has an answer: the
successor may not act while invalidation is pending; a reference held across a
yield must be revalidated; a failed invalidation refuses the bind and leaves the
panel unbound, with one FS-4-style record naming both generations, the failed
step, and the set invalidated so far. The two refusal classes are named and
kept distinct from `StaleHandle` — "`ControllerConflict` refuses a verb that
names a generation which is not the bound one" and `ControllerReleased` refuses
an in-flight verb — which is what the earlier review required instead of a
borrowed class. The lease collision is resolved in the same section: the binding
is the fence, the lease stays a UX metaphor, and a successful commit resets the
lease to `Idle` so a predecessor's holder cannot keep writing through it.

The gap is closed. The five steps are ordered among themselves; what the section
does not order is the relationship between step 1 and the derivation that is
supposed to consume its input. That is `B-1`.

### G-3 — Workspace ownership is not established by the governed creation path: partly closed

Three of the four required changes are made. Membership is assigned at creation
rather than at mount, the record carries it from that point, rebind preserves it
and never re-resolves it, and the accounting is stated:

> **Workspace membership is assigned at creation, by Core.** The creating
> generation never names a workspace; Core resolves it from the generation's
> active workspace at the create boundary and passes it to `create_panel`. A
> create for which no workspace can be resolved fails closed, allocates no
> record, and reports `E_UI_UNAVAILABLE`; a container with `workspace: None` is
> not a state this record permits.

and, for the slot accounting that follows from it:

> **PR-1 and PR-2 accounting.** A `Created` but unmounted container charges one
> workspace slot and one window slot from allocation [...] a rebind charges
> nothing, including a rebind of an unbound
> placeholder, which already holds its slots.

— decision § "Decision A", items 7 and 8

and the implementation-status table now has the row the earlier review asked
for, recording that the production backend calls `create_panel(parsed, None)`
and that this is not a state the record permits.

What is not closed is the resolution the first sentence depends on. "The
generation's active workspace" has no referent: a plugin generation is not
scoped to a workspace anywhere in the corpus or in the code, the create channel
carries only a type string, and the one field that resembles the source is
process-global and never read (`B-2`). The rule establishes _that_ Core assigns
an owner and that the owner is preserved, and it does not establish _which_
owner, so the accounting above is exact about slots for a container whose
workspace the record cannot yet name.

### G-4 — The existing scene-panel binding contradicted Decision A and was absent: closed

The amendment states the exclusion as a scope rule rather than leaving two
behaviours unreconciled:

> The `terminal`-slot scene panel that `SceneHost` creates is **not** a
> container under this record.

and, for the part of that path the record keeps:

> What the scene path does contribute is the fence: `ensure_panel`'s owner/epoch
> refusal is the precedent this record generalizes, not a behaviour to delete.

— decision § "Decision A", item 6

and it adds the rows the earlier review asked for: the scene-panel binding with
its `owner`/`epoch` refusal and dispose-on-release, the generation-boundary
trigger, and a "Controller generation value" row that states the relationship
between the two counters — "This is a different counter and a different type
from the registry's `Generation(u64)`, and nothing in code compares the two",
reinforced in the terminology table ("Never the panel allocation generation, and
never compared with it"). `PGO-8` now cites the conflict rule the fence already
implements, and the rejected-alternatives table adds the scene exclusion as a
decision rather than an omission.

Every claim in those rows was re-derived and holds at `7ac871d4` (see the table
below). The exclusion is a defensible answer to the choice the earlier review
posed, and it is stated in one place that the rest of the record refers to.

### G-5 — `drop_plugin` is not generation-scoped, so the teardown precedent does not exist: closed

The row is corrected in place, with the earlier claim named as wrong:

> It is **plugin-scoped**: none of those structures carries a generation, so
> "one generation's tickets" was wrong.

— decision § "Implementation status", component-request teardown

and the three requirements that followed are met: the panel teardown is keyed
`(PanelId, controller generation)` with the re-key named as required work, the
family table states which of the six families can be revoked today and by which
mechanism, and copying the plugin-wide shape is rejected in the alternatives
table because "a plugin-scoped purge is safe only under FS-6's
dispose-before-activate ordering, which a rebind does not provide". The source
of the generation key is named in the terminology table as the counter the
runtime already sets as `ui_epoch`.

The gap is closed on all four required changes. What the amendment does not
decide is when that teardown runs when there is no successor: `B-3` records the
residue.

### G-6 — The restore key is unrepresentable, and cross-plugin claim is decided and open at once: closed

Both halves are resolved, and the record now states the representability gap
instead of presenting the tuple as if it travelled:

> Decision B fixes the tuple and nothing about the record that would carry it

and it closes the identity-resurrection path for panels:

> **no caller may select `PersistencePolicy::StableIdentity` for panels**

and it removes the rule the earlier review found decided and open at once:

> Cross-plugin adoption is not decided here.

— decision § "Decision B", items 4, 5, and 6

`PGO-12` is rewritten from "the default does not resurrect an identity" to "No
`PersistencePolicy` value reachable by a production caller restores a persisted
`PanelId`", which is the assertion the earlier review asked for, and the open
points list the record fields, the manifest version, and the index-to-
`WorkspaceId` resolution as open work rather than leaving them implied. The
sentences about `PersistedPanel`, `PersistentId`, and the `v=1` encoding were
each re-derived and are accurate at `7ac871d4`.

### G-7 — The Drop outcome is unreachable for focused panels: closed

The amendment decides both edges in the record rather than deferring them:

> **`Focused -> Disposed` and `Created -> Disposed` are legal in this record.**

with a release obligation per edge, and it turns workspace close into a path:

> **A workspace close is a disposal path, not a category.** Closing a workspace
> disposes every panel attributed to it, ordered by MRU with the focused panel
> first, through the release obligations of rule 8, and emits one FS-4-style
> record per panel with owner, controller generation, reason `quit`, and action
> `disposed`.

— decision § "Decision C", rules 8 and 9

It also states which table must move and which must not — the seven-axis table
gains both edges, and "disposal [keeps] consulting the six-state model — a table
that describes a legal transition must not be the reason a user cannot close a
panel" — and `PGO-21` tests the focused-close path end to end. The two tables
and the consultation claim were re-derived and are accurate (see the table
below).

### G-8 — The matrix does not prove the two questions the security section names: closed

The matrix grows from fourteen rows to twenty-one, and the three assertions the
earlier review specified are present in the form it specified:

> At the instant the bind returns, and before `N+1` issues any verb, the panel's
> grant set equals `(own resolution ∩ predecessor set) ∪ consented widening`;
> capture handles, overlay attribution, and queued events are observably empty
> for `N+1`, read back through the accessors the verbs use rather than inferred
> from `N+1` not having asked.

The displaced-handle row and the failed-invalidation row follow:

> Generation `N` keeps a panel handle across the rebind. After `N+1` binds, every
> verb `N` issues is refused with `ControllerConflict` before any state access;
> `N` cannot read `N+1`'s scene, bind, capture session, queued events, or
> component results; no refusal mutates panel state.

and, for the invalidation failure branch:

> Invalidation step 3 (capture release) is made to fail. The bind is refused, the
> panel is unbound, no grant and no binding is written [...]

— decision § "Decision F", `PGO-7`, `PGO-15`, `PGO-16`

`PGO-16` also names the wrong implementation it must fail — one that binds after
a partially completed invalidation — which is the property the earlier review
wanted the row to discriminate, and each added row states its own negative.
The count is restated as twenty-one with the reason the seven rows were added,
so the count is no longer presented as the contract.

The gap is closed. Two of these rows would also detect `B-1` (`PGO-7` in
particular), which is why `B-1` is a defect of ordering rather than of coverage:
the contract tells an implementer to build a sequence that can only fail the
test that is supposed to prove it.

## New blocking findings

Numbered `B-1` to `B-3` so they stay distinct from the closed `G-1` to `G-8`;
the earlier review's non-blocking series keeps its `N-` numbering.

### B-1 — The derivation's input is deleted before it runs, and its output has no step that writes it

**Where:** decision § "D.1 One derivation" (the paragraph beginning "The
derivation must run inside the bind commit") and § "D.2 Two-phase bind" (phase 1
step 1 and phase 2 step 1); also § "D.4" (capability grants, required action)
and `PGO-7`.

**Finding.** `D.1` fixes the derivation, names the boundary it must run at, and
names the three inputs it reads:

> The derivation must run inside the bind commit — the `rebind_panel` boundary in
> D.2 — and it reads three things: the successor's resolution, the predecessor's
> set for the same `PanelId`, and the consent record for this bind.

`D.2` then defines that boundary as two phases, and puts the removal of exactly
that second input first:

> Phase 1 — invalidate the predecessor, in this order, with no step skipped:
>
> 1. Remove every panel-scoped grant held by the predecessor for this `PanelId`.

and the commit that follows it:

> Phase 2 — commit, one step:
>
> 1. Write the binding `(owner, controller generation)` on the panel record and
>    reset the panel's lease entry to `Idle`, then and only then permit
>    successor verbs.

Two consequences follow from the text as written, and both are load-bearing.

First, at the moment the commit runs, `P` is gone. The predecessor's set lives
in `capabilities[(PanelId, Generation)]` and nowhere else; `D.4` says the only
per-panel remover is `dispose_panel`, which is why the row must be removed in
phase 1, and phase 1 step 1 removes it before phase 2 begins. An implementer who
does what `D.1` and `D.2` say evaluates `(R ∩ P) ∪ C` against an empty `P`, and
every rebind becomes `grant(n+1) = C`: the predecessor's set stops being a
ceiling and becomes nothing, which is the "own resolution with no ceiling"
alternative the record rejects three pages later. Second, nothing in phase 2
writes the derived set. The commit's single step writes the binding and resets
the lease; `D.1`'s formula has no installation step anywhere in the two phases,
so a bind that follows `D.2` literally leaves the panel with the grants phase 1
removed and no others — a successor that holds nothing, including the
`panel.create` and `panel.focus` grants the panel exists to serve.

Neither consequence is visible in prose taken one section at a time, which is
why this survived the amendment: `D.1` reads as a complete derivation, `D.2`
reads as a complete commit, and the defect exists only in the join. It is
exactly the class the earlier review's threshold names — a property an
implementer would read as already holding (the predecessor's set is a ceiling)
that the described mechanism does not deliver.

**Why it is blocking.** `T-25`'s required defense is "grants, capture, overlay
attribution, and queues invalidated before bind commit", and `PGO-7`, `PGO-17`,
and `PGO-18` all assert the formula at the instant the bind returns. As
described, the mechanism cannot satisfy any of them, and the failure is not
conservative in one direction: the missing write step grants nothing, while the
missing snapshot silently converts a ceiling into a source of `C` only, so one
implementation under-grants and the natural repair — keep `P` readable — lets a
predecessor's set constrain a successor that never asked for it.

**Required correction.** Make the snapshot and the installation explicit, and
put both in the phases:

- Name a captured predecessor set taken at bind entry, before phase 1 step 1,
  and state that the derivation reads the snapshot, never the live table. Say
  what happens if the snapshot cannot be taken (the bind is refused, as for
  every other phase 1 failure).
- Add the grant write to phase 2 as a numbered step before the binding is
  written — install `(R ∩ P) ∪ C` for `(PanelId, controller generation)`, then
  the binding, then the lease reset — so the panel is never bound with an empty
  or partial set.
- State that a failed grant write leaves the panel unbound, with the same FS-4
  record shape phase 1 failures use, and that no verb is permitted in between.
- Add a row or extend `PGO-7` so a successor whose own resolution equals the
  predecessor's set ends with that set and not with the empty set — the
  assertion that fails for a remove-then-derive implementation.

### B-2 — Workspace membership resolves from a source that has no referent, and the one field that resembles it is process-global and never read

**Where:** decision § "Decision A", item 7; § "Implementation status", workspace
membership row; threat model `T-25` (the owner a rebound panel is attributed
to).

**Finding.** The sentence that establishes the owner the whole record depends on
is:

> The creating generation never names a workspace; Core resolves it from the
> generation's active workspace at the create boundary and passes it to
> `create_panel`.

There is no "generation's active workspace". A plugin generation is not scoped
to a workspace in any accepted contract, and at `7ac871d4` the create path has
no workspace input at all:

- `PanelCreateHandler = Rc<dyn Fn(&str) -> Result<(u64, u64), BridgeError>>`
  (`crates/bitty-runtime/src/plugin_runtime/services.rs:798`) is handed a type
  string and returns a raw id and generation. There is no workspace parameter
  and no context object on the seam.
- The production backend captures only the panel runtime:
  `startup_panel_create_backend(panels: Rc<RefCell<PanelRuntime>>)` calls
  `create_panel(parsed, None)` (`crates/bitty-terminal/src/plugin_runtime.rs`).
  Nothing in the closure can observe a workspace, a focused pane, or a window.
- `PanelRegistry` does carry `active_workspace: Option<WorkspaceId>`
  (`crates/bitty-runtime/src/registry/panel.rs:840`), and it is the only field
  in the tree whose name matches the sentence. It is assigned in exactly one
  place — `create_panel`, when it is `None`
  (`panel.rs:1034-1035`) — and it is **never read**, anywhere. It is a
  write-only, registry-global field, not a per-generation fact, and the first
  workspace-parameterized create seeds it. Reading it as "the generation's
  active workspace" would make the workspace of every later plugin-created
  panel depend on whichever create happened first, including a create Core did
  not perform.

The record's own reasoning elsewhere shows what the honest alternatives are:
the scene path resolves a workspace from the _published target_
(`services.rs:3040` builds `WorkspaceId` from a target's workspace), and
`panel.create` has no target. So the resolution must be either the focused
leaf's workspace, the focused workspace of the instance, or a workspace the
plugin names — three different owners for one call, with different trust
properties, and the record decides none of them.

**Why it is blocking.** `G-3` was withheld precisely because the governed path
had no owner; the amendment answers "when is it assigned" and "is it
preserved", and leaves "which one" to the implementer through a phrase that
reads like a defined operation. An implementer will read "the generation's
active workspace" as holding and implement the only thing available, and the
result is that a background plugin's panel is attributed to, and charged
against PR-1 in, whichever workspace the user is looking at — with the failure
mode of `A.7`'s fail-closed branch never firing, because a global pointer is
always resolvable. The PR-1 accounting `A.8` fixes is then exact about a
workspace that Core chose implicitly, and `C.9`'s workspace-close disposal path
inherits that choice.

**Required correction.** Name the resolution input and its trust properties:

- State which workspace a `panel.create` from generation `G` resolves to, in
  terms of something that exists: the workspace of the focused leaf, the
  focused workspace of the window, or an explicit Core-supplied context. If the
  answer is "the workspace of the leaf the panel will mount into", say so, and
  say what a create with no target does.
- Forbid the plugin from naming the workspace, and state what a generation that
  has no scene, no mount, or no focused leaf resolves to — `A.7`'s
  `E_UI_UNAVAILABLE` branch needs a reachable condition, and "no workspace can
  be resolved" must not be unreachable by construction.
- State that the resolved workspace is recorded on the container at create and
  that no later event (focus change, mount, rebind) may re-resolve it, which
  `A.7` already requires, and say whether a resolved workspace can be one the
  plugin holds no grant in.
- Either delete `active_workspace` from the record's account of the path or
  define its role and its lifecycle; as written it is a field an implementer
  will reach for and a value the record never mentions.

### B-3 — The release list for generation disposal runs at the next bind, not at disposal

**Where:** decision § "Decision A", item 2; § "Decision C", rules 2 and 3; §
"D.2", phase 1 step 2; § "D.4", bus queues row and capability grants row; §
`PGO-3` and `PGO-4`.

**Finding.** `A.2` states the content half of the split as a release obligation
at disposal:

> Panel content is generation-owned. Disposal of generation `N` releases its
> scene, its bind, its GUI content handle, its subscriptions, its tasks, its
> timers, and its queued events

`C.2` and `C.3` then make the panel survive that disposal — unbound, holding its
container, presenting a placeholder — and `C.3`'s crash path ends with the
generation `Disabled`. The only mechanism in the amended record that releases a
panel's queued events is phase 1 step 2 of a bind:

> Drop the panel's queued events (they are panel-scoped, and the successor has
> not bound, so a panel-wide drain cannot touch it).

A generation that is disposed, crashes, or is disabled **with no successor**
runs no phase 1. `D.4` states the same thing from the code side — bus queues are
"`(PanelId, topic)`, cleared only by `event_bus.clear_panel` at disposal", and
"No — panel-scoped, but no generation boundary triggers the clear" — and the
required action it gives is "Drain the panel's queues in phase 1". So the record
both asserts that disposal releases a generation's queued events and records
that nothing at disposal does; the drain exists only when a later generation
binds. Panel commands registered by the departed generation and, once
`D.4` adds it, overlay attribution, are in the same position: only a bind or a
container disposal removes them, and `C.3` orders neither.

`PGO-3` and `PGO-4` test the placeholder, the reason, the attachment, and the
input refusal. Neither reads back the released families, so no row would fail.

**Why it is blocking.** `A.2` is a normative release list, and an implementer
who reads it as holding will not build a disposal-side purge; the families then
survive until the next bind, and the panel sits unbound with a departed
generation's queues, commands, and grant rows still addressed to it. The
binding check makes those families inert for the unbound panel — which is why
this is a defense-in-depth gap and not an open door — but the record's claim,
`T-25`'s required defense ("queues invalidated before bind commit" presumes a
set that is still there to invalidate), and `D.5.5`'s "Nothing is drained from
`N` into `N+1`" all rest on state the contract never orders released.

**Required correction.** Decide the unbind release as an explicit step at the
generation boundary, not only at bind:

- State that when a controller generation ends without a successor, the
  container releases that generation's grant rows for the `PanelId`, the
  panel's queued events, the commands it registered, and its overlay
  attribution — and whether that runs before or after the placeholder is
  presented.
- State that a failed release at unbind still leaves the panel unbound and
  refuses every verb, so the failure mode is the same as a failed bind.
- Add a matrix row asserting the families are observably empty after a crash, a
  disable, and a disposal with no successor, read back through the accessors
  the verbs use, in the shape `PGO-7` already uses for the bind case.

## Non-blocking findings

The five non-blocking findings the earlier review left open are closed by the
amendment and are recorded as such; four new ones are added.

| ID    | Status | Finding and expected disposition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `N-1` | Closed | Reason vocabulary is now a stated superset with a mapping: five shared reasons, `denied` and `incompatible` added, and `closed`, `dismissed`, `quit` mapped to the `Drop` outcome. Re-derived: the GUI content candidate's closed set is `dismissed`, `closed`, `quit`, `suspended`, `reloaded`, `disabled`, `crashed`, `unloaded`, so the union claim is accurate.                                                                                                                                                             |
| `N-2` | Closed | The "`Ephemeral` default" is no longer presented as standing behavior: the row says the default is "a module-comment statement", records that `PersistencePolicy` has no `Default` impl and no production selector, and `B.5` names the entry point that must refuse `StableIdentity`. Verified: two variants, no `Default` impl, `plan_restore` called only from tests.                                                                                                                                                        |
| `N-3` | Closed | `Decision C` now opens by naming which type holds the state and which does not — "the seven-state `PanelLifecycle` type is _not_ the registry's state and the registry cannot represent `Closed`" — and `C.7` repeats it. Verified against both tables.                                                                                                                                                                                                                                                                         |
| `N-4` | Closed | The refusal classes are named in `D.2` (`ControllerConflict`, `ControllerReleased`) and asserted by class in `PGO-8` and `PGO-15`, so no test matches a message string. Verified: neither variant exists in `PanelError` today, and the record says so.                                                                                                                                                                                                                                                                         |
| `N-5` | Closed | The counter is bounded by name — "**The counter is capped at eight.**" — with a stated saturation behavior, and `PGO-14` asserts it. The key used for the cap is inconsistent with the key used for the diagnostic; that is `N-7`.                                                                                                                                                                                                                                                                                              |
| `N-6` | New    | `C.7` maps `Closed` to "container retained, controller still bound, content retained" but never says which of the six `PanelRecord` states holds that mapping, so the record's own claim that `Closed` "is not representable in `PanelRecord`" leaves the implementer choosing between `Mounted` and `Suspended` — and `Suspended` is defined in the same decision as a _workspace_ fact, which a plugin-driven `Closed` is not. State the state, or state that the mapping is refused until the RFC amendment admits `Closed`. |
| `N-7` | New    | `E.1` increments a counter "keyed `(PanelId, controller generation, reason)`" and then emits the saturation diagnostic "once per `(PanelId, binding)`". Two keys for one bound: with several reasons in play a panel can emit one `saturated` note per reason, and the promise of a single note is unmet. Key the cap and the diagnostic identically, or say the note is per reason.                                                                                                                                            |
| `N-8` | New    | The controller generation is cited as "masks it to 30 bits" for handle minting while `HostPanel.epoch` and the new binding hold the unmasked `u32`. The open point covers saturation but not the collision: two epochs 2^30 apart mint the same handle epoch. State that the binding compares the unmasked value, and that no path compares a minted handle's epoch to a binding. Non-blocking only because the alias needs 2^30 activations.                                                                                   |
| `N-9` | New    | `C.9` requires one FS-4-style record per disposed panel "with owner, controller generation, reason `quit`", but a workspace full of unbound placeholders has no controller generation to name. Say what the record carries then (the last controller and its end, or an explicit absent value), so the disposal path does not fail or fabricate one.                                                                                                                                                                            |

## Code claims re-verified at `7ac871d4`

Every row was read from `bitty` `origin/main` at
`7ac871d43f1e2995459e93d425ea385a44612e75`. `Confirmed` means the amended
sentence matches the code. `Omitted` means a relevant mechanism exists and the
record does not mention it.

| ID   | Amended claim                                                                                                   | Evidence at `7ac871d4`                                                                                                                                                                                              | Result              |
| ---- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| C-1  | `PanelRecord` fields, and `workspace` written only by `create_panel`                                            | `crates/bitty-runtime/src/registry/panel.rs:283-292`; the only assignment is the struct literal in `create_panel` (`panel.rs:1019-1027`), and `title` is `Option<String>`                                           | Confirmed           |
| C-2  | Workspace membership: `Some` charges the workspace cap and seeds the MRU; `None` counts only against the window | `panel.rs:995-1010` (window cap is `self.panels.len()`, workspace cap is the list length), `1032-1037` (insert, seed focus, seed `active_workspace`)                                                                | Confirmed           |
| C-3  | Production backend calls `create_panel(parsed, None)`                                                           | `crates/bitty-terminal/src/plugin_runtime.rs:471`, inside `startup_panel_create_backend(panels)` which captures only the panel runtime                                                                              | Confirmed           |
| C-4  | `PanelCreateHandler` is handed only a type string                                                               | `crates/bitty-runtime/src/plugin_runtime/services.rs:798` — `Rc<dyn Fn(&str) -> Result<(u64, u64), BridgeError>>`                                                                                                   | Confirmed           |
| C-5  | `drop_plugin` is plugin-scoped                                                                                  | `crates/bitty-runtime/src/plugin_runtime/component_requests.rs:372-388` — retains and filters on `plugin_id`; no structure carries a generation                                                                     | Confirmed           |
| C-6  | `HostPanel { handle, view, owner, epoch }`, `ensure_panel` refuses a different owner/epoch, release disposes    | `crates/bitty-runtime/src/scene_host.rs:158-163`; refusal `372-386` with "the terminal slot scene is held by another plugin generation"; `release_owner` `342-351`; `create_panel(PanelType::Rich, None)` `423-426` | Confirmed           |
| C-7  | `clear_ui_blocks` calls `release_owner(&plugin_id, ui_epoch)` at suspend, dispose, and rollback                 | `crates/bitty-runtime/src/plugin_runtime/services.rs:3155-3165`; call sites `crates/bitty-runtime/src/plugin_runtime/mod.rs:3323`, `3441`, `4430`                                                                   | Confirmed           |
| C-8  | `ui_epoch` is the activation counter, advanced with `saturating_add(1)`, masked to 30 bits for handles          | `mod.rs:3148` (`saturating_add(1)`), `3152` (`set_ui_epoch(entry.generation)`); `services.rs:1896`, `2569-2570`, `1063` (`UI_HANDLE_EPOCH_BITS = 30`)                                                               | Confirmed           |
| C-9  | Six-state table permits both disposal edges; seven-state table permits neither; disposal consults neither       | `crates/bitty-ui/src/panel.rs:111-127`; `crates/bitty-ui/src/panel_state.rs:145-163`; `dispose_panel` (`panel.rs:1253-1296`) reads no transition table                                                              | Confirmed           |
| C-10 | `dispose_panel` is called only from the scene host outside the registry                                         | Only `crates/bitty-runtime/src/scene_host.rs:407`, `431`, `459` in production code                                                                                                                                  | Confirmed           |
| C-11 | The lease table is inserted `idle()` at create and removed at disposal; `check_write` gates the write path      | `crates/bitty-runtime/src/registry/host.rs:127`, `278`, `391`; `PanelRuntime::dispose_panel` also unbinds placement, scenes, and scene paints (`host.rs:383-398`)                                                   | Confirmed           |
| C-12 | `Overlay` has no owner; the registry stamps its own generation; `clear()` runs only at registry disposal        | `crates/bitty-ui/src/panel.rs:240-248`; `panel.rs:1351-1360`; `panel.rs:1519`; `dispose_panel` does not touch the overlay manager                                                                                   | Confirmed           |
| C-13 | `PersistedPanel`, the `v=1` line encoding, no `Default` impl, `plan_restore` exercised only by tests            | `crates/bitty-ui/src/panel_persist.rs:49`, `60`, `68-75`, `164-172`, `353`; callers are `panel_persist.rs:384-386` and `crates/bitty-ui/tests/pw_series.rs:92-95`                                                   | Confirmed           |
| C-14 | `PersistentId` is a validated `String` of at most 64 bytes over `[a-z0-9_-]`, outside panel persistence         | `crates/bitty-runtime/src/registry.rs:145-181`; no reference from `panel_persist.rs`                                                                                                                                | Confirmed           |
| C-15 | `PanelError` has no `ControllerConflict` or `ControllerReleased` variant                                        | `crates/bitty-runtime/src/registry/panel.rs:71-162`; neither name appears in the tree                                                                                                                               | Confirmed           |
| C-16 | `workspace_panels` has no accessor and no bulk dispose-by-workspace path exists                                 | `panel.rs:838`, read only inside the registry (`1002`, `1032`, `1280`, `1516`); no `pub fn` exposes it                                                                                                              | Confirmed           |
| C-17 | _(no claim)_ "the generation's active workspace"                                                                | `panel.rs:840` declares `active_workspace`, assigned only at `1034-1035` and never read; no plugin-host type carries a workspace                                                                                    | Omitted — see `B-2` |

## Residual risk carried to the implementation

The residuals the decision states remain accepted, and the amendment makes them
explicit rather than implied:

- **No persisted encoding for the restore key.** Within one `Instance` a panel is
  durable across generations; across a process boundary nothing is restored
  until `RFC-OQ-9`, and the key has no record to travel in.
- **The `terminal`-slot scene panel stays generation-scoped** and is disposed on
  release. It is excluded by scope rule `A.6`, so a future conversion of that
  surface into a container would delete the fence the record generalizes.
- **Cross-plugin claim of a persisted panel is undecided**, and the record now
  says so in one place instead of two.
- **The activation counter saturates rather than failing closed**, and the
  record requires the binding to reject a saturated counter while leaving the
  counter's own behaviour to the owning lifecycle contract.
- **Two behaviours still ship and both must move.** The scene path disposes its
  container at every generation boundary; `bitty.panel.create` panels carry no
  binding and survive a reload with whatever grants they had. Until the binding
  lands, exposure depends on which API a plugin used.

`B-1` to `B-3` are not residuals and must not be carried as accepted risk. Each
is a defect in the described mechanism, and each is correctable in text before
any rebind code exists.

## Evidence register

| Item  | Verdict       | Evidence                                                                                                                                                                        |
| ----- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `G-1` | Closed        | Decision § "D.1 One derivation", formula and precedence 1 to 3, and the removal of the three competing sentences                                                                |
| `G-2` | Closed        | Decision § "D.2 Two-phase bind", five ordered phase 1 steps, one phase 2 step, revalidate-at-use, fail-closed branch, the two typed refusals, and the binding-versus-lease rule |
| `G-3` | Partly closed | Decision § "Decision A" items 7 and 8, and the workspace-membership implementation-status row; the resolution source is undefined — `B-2`                                       |
| `G-4` | Closed        | Decision § "Decision A" item 6, the reconciliation paragraph, and the scene-panel, generation-boundary, and controller-generation rows; `C-6`, `C-7`, `C-8` above               |
| `G-5` | Closed        | Corrected plugin-scoped row; `D.2` phase 1; `D.4` family table; rejected "reuse the `drop_plugin` shape" alternative; `C-5` above. Residue at unbind is `B-3`                   |
| `G-6` | Closed        | Decision § "Decision B" items 4 to 6; `PGO-12`; open points; `C-13`, `C-14` above                                                                                               |
| `G-7` | Closed        | Decision § "Decision C" rules 8 and 9; `PGO-21`; `C-9`, `C-10` above                                                                                                            |
| `G-8` | Closed        | Decision § "Decision F" `PGO-7`, `PGO-15`, `PGO-16` and the twenty-one-row count with its rationale                                                                             |
| `B-1` | Open          | Decision § "D.1" ("must run inside the bind commit", three inputs) against § "D.2" phase 1 step 1 (removal) and phase 2 step 1 (binding and lease only)                         |
| `B-2` | Open          | Decision § "Decision A" item 7; `services.rs:798`; `bitty-terminal/src/plugin_runtime.rs:471`; `panel.rs:840`, `1034-1035`                                                      |
| `B-3` | Open          | Decision § "Decision A" item 2 and § "D.4" bus-queue row ("no generation boundary triggers the clear") against § "D.2" phase 1 step 2; `PGO-3`, `PGO-4`                         |

## Verification obligations that survive this review

The matrix is adequate for what it covers; these obligations are added because
the findings above make them necessary, and none can be satisfied by a row the
amendment already names.

- **Snapshot before invalidation.** Bind against a panel whose predecessor holds
  a non-empty set and a successor whose resolution is identical; require the
  committed set to equal the predecessor's set. `PGO-7` covers the formula only
  if the implementation keeps `P` readable, and this row fails for a
  remove-then-derive implementation.
- **Installation is atomic with the binding.** After a successful bind, read the
  grant set back through the verb accessors and require it to be non-empty
  whenever the resolution is non-empty; require that no verb is permitted
  between the grant write and the binding write.
- **Workspace resolution.** Create from a generation with no scene and no
  focused leaf, from a generation with a focused leaf in another workspace, and
  from two generations in the same tick; require the resolved workspace to be
  the one the contract states, to be recorded once, and to survive a rebind
  unchanged. A failing resolution must take `A.7`'s `E_UI_UNAVAILABLE` branch
  rather than falling back to a global.
- **Unbind release.** Crash, disable, and dispose a generation with no
  successor; require its grant rows, the panel's queued events, its commands,
  and its overlay attribution to be observably empty before the placeholder is
  read, not at the next bind.
- **Key identity.** Assert that the saturation note is emitted once per panel
  binding across several reasons, and that the binding compares the unmasked
  controller generation.

## Limitations of this review

- Read-only and static: no build, no test execution, no dynamic analysis in
  `bitty`. Every code statement is a text observation at `7ac871d4`, and line
  numbers drift; the file path is the durable citation.
- The reviewed decision is judged by diff against `634d181`, the text the
  earlier review judged, so an unchanged sentence is credited from that review
  rather than re-argued here.
- `B-1` is a defect of description. The mechanism it names could be implemented
  correctly and the contract would still not require it, so the correction is
  text, not design.
- The reviewer cannot judge whether the placeholder's visual design is adequate,
  whether the close-side reason mapping is complete for operators, or whether a
  focused-workspace resolution is the right product rule; those are product and
  diagnostic questions. `B-2` judges only that the record must name its input.
- The persistence contract behind `RFC-OQ-9` stays out of scope, so `G-6` judges
  representability and the no-resurrection rule, not the encoding.
- No threat-model row was added or amended by this review; `T-25` is used as the
  requirement it is, and this record claims no implemented defense.

## References

- [Panel Generation Ownership Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-generation-ownership-decision.md)
  — the reviewed draft at `25aa80f`.
- [Panel generation ownership review](panel-generation-ownership-review.md) —
  the review this one continues, and the source of `G-1` to `G-8` and `N-1` to
  `N-5`.
- [Threat model](threat-model.md) — row `T-25`, authority carry-over across a
  panel generation boundary.
- [Security overview](overview.md) — invariants 2, 3, 4, and 7.
- [P0 acceptance criteria](p0-acceptance-criteria.md) — the rebind-authority
  evidence row this decision comes to serve, unchanged by this review.
- Issue [`bitty#2476`](https://github.com/bitty-terminal/bitty/issues/2476) —
  the design gate this review answers.
