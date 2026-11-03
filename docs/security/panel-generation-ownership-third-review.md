---
title: Panel Generation Ownership Third Review
description: Third-round independent review of the amended panel generation ownership decision, closing B-1 and B-3, leaving the workspace identity step of B-2 unresolved, and recording one new blocking defect in which the unbind release deletes the grant ceiling the bind reads
category: security
audience: security-reviewer
document_type: research
status: draft
website_publish: false
sidebar_order: 52
---

# Panel Generation Ownership Third Review

## Review status

**Verdict: `NEEDS-FIX`.** Two of the three findings the second review left open
are closed, and each is closed by a mechanism rather than by a restatement:
`B-1` now captures the predecessor's set before invalidating it and installs the
derived set before the binding becomes readable, and `B-3` now releases the
departing generation's families at the generation edge instead of waiting for a
bind that may never come. Neither closure survives the other. The edge release
`B-3` adds removes exactly the grant row that `B-1`'s phase 0 must read, and it
runs before any successor exists, so on every reload the ceiling is empty, the
formula reduces to `C`, and the successor either holds nothing or the ceiling
never constrains anything. That is `B-4`, new in this round. `B-2` remains open
on its last step: the text now names a referent that exists, but the
`WorkspaceId` it says Core passes is not produced by anything in the tree, and
the amended sentence cites an accessor that does not exist. `G-3`'s four
required changes are all present in text and cannot be counted complete while
`B-2` is open. The record stays `draft`, the promotion gate is **not** met, and
nothing here authorizes implementation of the rebind mechanism.

| Item              | Value                                                                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Reviewed contract | [Panel Generation Ownership Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-generation-ownership-decision.md), `status: draft`        |
| Reviewed revision | `bitty-terminal-docs` `3f3fb2c` (PR [#380](https://github.com/bitty-terminal/bitty-terminal-docs/pull/380)), judged as a diff against `25aa80f`, the revision the second review read |
| Round 1           | [Panel generation ownership review](panel-generation-ownership-review.md), `NEEDS-FIX` on `G-1` to `G-8`, non-blocking `N-1` to `N-5`                                                |
| Round 2           | [Panel generation ownership re-review](panel-generation-ownership-rereview.md), `NEEDS-FIX` on `B-1` to `B-3`, `G-3` partly closed, non-blocking `N-6` to `N-9`                      |
| This round        | `B-1` and `B-3` closed; `B-2` open; `G-3` complete in text but contingent on `B-2`; `B-4` added; `N-6` to `N-9` carried; `N-10` to `N-12` added                                      |
| Threat model      | [Threat model](threat-model.md) row `T-25`, authority carry-over across a panel generation boundary                                                                                  |
| Code evidence     | `bitty` `origin/main` at `7ac871d4` (the revision the record pins) and `1df03339` (current), read-only; no checkout, no build, no test run                                           |
| Review date       | 2026-11-04                                                                                                                                                                           |
| Reviewer role     | Independent security reviewer; no authorship of the decision, of either earlier review's amendments, or of the code the decision cites                                               |
| Gate              | This repository's documentation gate (format, markdownlint, links, cross-repo links, metadata, language, hygiene, agents, state, actionlint)                                         |
| Outcome           | Status stays `draft`; promotion withheld until `B-2` and `B-4` are corrected; `N-6` to `N-12` are carried, none of them gating                                                       |

The reviewer wrote none of the reviewed text, answered none of the earlier
findings, and has no stake in the outcome. The decision lives in another
repository (`bitty-terminal-docs`) and was read from `origin/main`; nothing in
this review edits it. The earlier reviews were read in full and their
code claims re-used only where the amended text did not touch them, which is
stated per claim in the evidence table.

A clean acceptance was available this round and is not given, for one reason
that is structural rather than editorial: the two closures are individually
correct and jointly contradictory, and the contradiction is visible in the
record's own sentences without any code. The amendment even states the
contradiction while writing it — the bind's phase 1 repeats the edge release
"as defense in depth", which concedes that the rows are already gone when the
bind arrives, without noticing that phase 0 reads the same rows earlier.

## Review lineage

| Round | Document                                            | Reviewed revision            | Verdict     | Findings recorded                                                                                                                     |
| ----- | --------------------------------------------------- | ---------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | [Review](panel-generation-ownership-review.md)      | decision `634d181`           | `NEEDS-FIX` | `G-1` to `G-8` blocking; `N-1` to `N-5` non-blocking                                                                                  |
| 2     | [Re-review](panel-generation-ownership-rereview.md) | decision `25aa80f` (PR #378) | `NEEDS-FIX` | `G-1`, `G-2`, `G-4` to `G-8` closed; `G-3` partly closed; `B-1` to `B-3` new; `N-1` to `N-5` closed; `N-6` to `N-9` new               |
| 3     | This document                                       | decision `3f3fb2c` (PR #380) | `NEEDS-FIX` | `B-1`, `B-3` closed; `B-2` open; `G-3` complete in text, contingent on `B-2`; `B-4` new; `N-6` to `N-9` carried; `N-10` to `N-12` new |

PR #380 claims to close `B-1`, `B-2`, `B-3` and to complete `G-3`, and its body
summarises the mechanism for each. The body was read as a claim, not as
evidence; every sentence below is judged from the merged text at `3f3fb2c`.
Two of the three claims hold.

## Scope and method

This is a third review, not a re-read. It judges the amendment as a diff against
the three findings the second review left open plus the completed `G-3`, and it
re-judges nothing that already passed twice except where this revision edited
it — which is `A.2`, `A.7`, the workspace-membership implementation row, `C.2`,
`C.3`, `D.1`, `D.2`, `D.3`, `D.4`, `PGO-7`, the new `PGO-22` and `PGO-23`, the
matrix count, the verification plan, and the security-review items.

Method:

1. Read `3f3fb2c` as a diff against `25aa80f`, so each correction is checked
   against the finding it answers rather than against a fresh reading.
2. For each closed finding, quote the sentence that is supposed to close it and
   then ask what an implementer builds from that sentence alone, and where the
   mechanism stops short of the claim above it.
3. Treat the amendment as one mechanism rather than three patches. The bind now
   has four stages (edge release, capture, invalidate, install) spread across
   two sections, and the attack that matters is the order _between_ sections:
   walk the reload sequence end to end and ask, at each stage, whether every
   input the next stage names is still readable.
4. Verify every code claim against `bitty` at `7ac871d4`, the revision the
   record pins, and again at `1df03339`, current `origin/main`, so a claim that
   only holds at one revision is caught. Line numbers are cited from
   `7ac871d4`; the load-bearing rows are identical at both revisions.
5. Re-check the non-blocking findings the amendment did not touch, and state
   each as still open rather than letting silence read as closure.

Out of scope, unchanged: whether panels should outlive generations; panel
placement and the `View` versus `PanelId` encoding; the non-terminal content
scene path; the persistence contract behind `RFC-OQ-9`; overlay geometry;
accessibility semantics of the placeholder; performance. No rebind code exists,
so nothing here is evidence of shipped behaviour — this record judges a design
gate and says so wherever a claim would otherwise read as implementation.

## Per-finding verdict

### B-1 — The derivation's input is deleted before it runs, and its output has no step that writes it: closed

The second review asked for four changes. All four are present, and the
ordering they establish is correct:

> Phase 0 — capture, at bind entry and before any invalidation, with no step
> skipped: 1. Read the predecessor's panel-scoped grant set for this `PanelId`
> into an immutable snapshot stamped with the panel id, the predecessor's
> controller generation, and this bind attempt, and hand that snapshot to the
> derivation in D.1 as `P`.

with the failure branch stated in the same step —

> If the snapshot cannot be taken, the bind is refused before anything is
> invalidated: the predecessor stays bound, no phase 1 step runs, no phase 2
> step is written, and one FS-4-style record names the capture and both
> generations.

— phase 2 gains the install as step 1, ahead of the binding and the lease:

> Install the derived set `(R ∩ P) ∪ C` for `(PanelId, controller generation)`,
> keyed by the controller generation rather than the allocation generation.

— step 2 writes the binding ("Write the binding `(owner, controller generation)`
on the panel record"), step 3 resets the lease ("Reset the panel's lease entry to
`Idle`, then and only then permit successor verbs"), and the window between them
is closed in one sentence:

> No verb is permitted between step 1 and step 3, so no caller observes the
> panel as bound with an empty or partial grant set.

— the failed-install branch given the same fail-closed shape as a failed bind
("leaves the binding unwritten, the panel unbound, the placeholder presented,
the invalidated set not re-installed") — and the discriminating row added:

> `PGO-22` | Snapshot captured before invalidation | The predecessor holds
> `{panel.create, panel.focus}` and `N+1`'s resolution is the same set. The
> committed set equals that set exactly […] Fails for remove-then-derive (empty
> set), bind-then-install, and a derivation from the live table.

`PGO-7` is extended in the same direction ("A non-empty predecessor set never
commits empty"), and `D.1` states the property the ordering is supposed to buy:
"A bind is a pure function of that captured snapshot."

The finding as written — the derivation reads a set the same section deleted
first, and nothing writes the derived set — is answered on both halves, and the
test row fails for all three wrong implementations the review named. This is a
genuine closure, and it is the strongest part of the amendment.

It is a closure _within the bind_. Phase 0 protects the snapshot from phase 1's
removal, and says so in one clause: "The live row is not touched here; phase 1
removes it after the snapshot exists." It says nothing about a removal that
happens before phase 0, and the same revision adds one at the generation edge.
That is `B-4`, and the boundary between the two findings is stated there.

### B-2 — Workspace membership resolved from a source with no referent: open, referent fixed, identity not

Four required changes were asked for. Three and a half are made, and the
remaining half is the one that decides what the owner actually is.

Made: the assignment point, the preservation rule, the fail-closed branch, the
trust property, and the exclusion of the wrong field:

> Workspace membership is assigned at creation, by Core, from the focused leaf
> of the presented workspace. […] When the presented workspace has no focused
> view, or the instance presents no workspace, no workspace resolves: the create
> fails closed, allocates no record, charges no slot, and reports
> `E_UI_UNAVAILABLE`. That branch is reachable by construction, because
> `focused_view` is an `Option` and a workspace whose leaves are all closed has
> none; an always-answerable global pointer is exactly the fallback this rule
> forbids.

with `PanelRegistry::active_workspace` named as the wrong source and its removal
made required work, and membership stated as attribution rather than authority
("a resolved workspace may be one in which the plugin holds no other grant").
The referent that was missing in round 2 now exists, and the fail-closed branch
is no longer unreachable by construction. That is real progress and it is
acknowledged as such.

Not made: the output. The same item says Core

> reads two facts it already owns — the active workspace index and that
> workspace's focused view (`Runtime::active_workspace_index`,
> `Layout::focused_view`) — and passes the resulting `WorkspaceId` to
> `create_panel` as its `workspace` argument

and none of the three operands survives inspection at `7ac871d4`:

- **`Layout::focused_view` does not exist.** There is no `Layout` type or alias
  in the tree; the layout type is `LayoutNode`, and the focused-view accessors
  are `Runtime::focused_view()` (`crates/bitty-runtime/src/runtime/layout_focus.rs:3048`,
  reading `self.focus.focused()`) and
  `TerminalRegistry::focused_view(WorkspaceId)`
  (`crates/bitty-runtime/src/registry/terminal.rs:828`). The per-workspace focus
  a create would need after a workspace switch sits on `WorkspaceSlot.focus`
  (`crates/bitty-runtime/src/runtime/workspaces.rs:72`), not on any `Layout`.
  The sentence names a type-and-method pair that will not compile.
- **The active index is an `usize` and is not a `WorkspaceId`.** `Runtime`
  carries `active_workspace: usize` (`crates/bitty-runtime/src/runtime.rs:761`)
  and `WorkspaceSlot` carries `seq`, `name`, `layout`, and `focus` — **no
  `WorkspaceId`** (`workspaces.rs:64-76`). `seq` is positional, not an identity:
  `workspace_swap_current_with` reassigns it between slots
  (`workspaces.rs:2672-2706`, `self.workspaces[current_idx].seq = target_num`
  followed by `sort_workspaces_by_seq`).
- **No production path holds a `WorkspaceId` at all.** `git grep -c WorkspaceId`
  over `crates/bitty-runtime/src/runtime` and `crates/bitty-terminal/src`
  returns nothing. `WorkspaceId` is minted only by
  `TerminalRegistry::create_workspace`
  (`crates/bitty-runtime/src/registry/terminal.rs:336-354`), whose callers are
  all tests (`crates/bitty-runtime/src/workspace.rs:259`, inside `#[cfg(test)]`
  at line 147; `crates/bitty-runtime/src/registry/tests.rs`;
  `crates/bitty-runtime/tests/panel_claims.rs`;
  `crates/bitty-runtime/tests/workspace_panel.rs`), and the two functions that
  would answer the question — `TerminalRegistry::active_workspace()`
  (`terminal.rs:393`) and `set_active_workspace` (`terminal.rs:402`) — have **no
  callers anywhere**. All three production `create_panel` call sites pass
  `None` (`crates/bitty-terminal/src/plugin_runtime.rs:471`,
  `crates/bitty-runtime/src/scene_host.rs:425` and `:634`), which is consistent
  with the implementation-status row and is why nobody has needed an id yet.

So the record says Core "already owns" two facts and then produces a third from
them that exists nowhere. This is not a plumbing detail: `WorkspaceId` is the
key of `workspace_panels`, of the PR-1 workspace cap, and of
`focus_per_workspace` inside the registry
(`crates/bitty-runtime/src/registry/panel.rs:838`, `995-1010`, `1032-1037`), and
`focus_panel` refuses a workspace argument that disagrees with the record
(`panel.rs`, the `rec.workspace != Some(workspace)` guard). An implementer who
mints an id to satisfy the sentence — `WorkspaceId::new(index + 1)` is the
obvious guess, and `seq` is the other — creates a workspace bucket that no
workspace owns: PR-1 is charged against a phantom, `C.9`'s workspace-close
disposal can never find the panel, and the first real `focus_panel` call fails
with `NotFound { kind: "workspace" }`. Two implementers guessing differently
produces two panels in "the same" workspace that the registry keeps apart. That
is the same defect round 2 recorded — an owner that has no referent — moved from
the phrase to the id.

The record's own open-points list shows it knows the mapping is unsolved: it
describes the restore key as needing "the workspace-index-to-`WorkspaceId`
resolution the key needs" (Decision B item 4, and the open points). The create
path cannot both need that resolution and already own its result.

**Why it is blocking.** `G-3` was withheld because the governed path had no
owner; the amendment answers _who_ assigns, _when_, and _that it is preserved_,
and leaves _which identity_ to a step the tree does not contain while asserting
it is already available. Under this review's closing rule — a finding closes
only when the amended text states the mechanism — the mechanism is stated for
two of its three operands.

**Required correction.**

- Name the operation that turns the presented workspace into the `WorkspaceId`
  `create_panel` takes, and say who owns the id space: the terminal registry's
  counter, a `WorkspaceId` stored on the runtime slot at workspace creation, or
  an explicit `WorkspaceId` Core threads through the create seam. Correct the
  `Layout::focused_view` citation to the accessor that exists.
- If that operation does not exist, say so in the same sentence that currently
  says the two facts are already owned, and add it to the required work beside
  the `active_workspace` removal. A rule that depends on a missing bridge must
  not read as an available one.
- State that the resolved id is the same id space the workspace registry uses,
  so "attributed to a workspace" means one bucket rather than two, and say what
  a create does when the runtime and the registry disagree about the presented
  workspace.
- Correct the `Document status` paragraph, which asserts this revision closes
  `B-1` to `B-3`; it does not close `B-2`.

### B-3 — The release list for generation disposal runs at the next bind: closed

The second review asked for the release at the terminal edge, a fail-closed
branch, and a row that reads the families back. All three are present:

> **The release runs at the generation edge itself and needs no successor.** A
> generation that is disposed, crashes, or is disabled with no `N+1` runs no
> bind […] On the terminal edge the container therefore releases, for that
> controller generation: its grant rows for `(PanelId, N)`, the panel's queued
> events, the panel commands `N` registered, and `N`'s overlay attribution — and
> it completes that release **before** presenting the placeholder, so the
> placeholder is never shown over a departed generation's rows.

with the failure branch ("leaves the panel unbound and refuses every verb, with
one FS-4-style record naming the family that failed: the same fail-closed shape
as a failed bind, and never a re-bind of `N`"), an observability mechanism
(a counter keyed `(PanelId, ended controller generation)` that "advances once per
family released, so 'nothing to release' is distinguishable from 'the release
never ran'"), `C.2` and `C.3` routed through it, the `D.4` rows updated to
"Drain at unbind (A.2), not only in phase 1" and "dismiss at unbind (A.2) and in
phase 1", and the row:

> `PGO-23` | Unbind release with no successor | A generation crashes, is
> disabled, and is separately disposed, each with no successor. Before the
> placeholder is read, its grant rows, the panel's queued events (read through
> `queued_events_for_panel`), its commands, and its overlay attribution are
> observably empty […] Fails for an implementation whose only drain is bind
> phase 1, and one that shows the placeholder before the release ends.

Each of the three required corrections is met, the row is the shape round 2
asked for (all three edges, read back before the placeholder, with the wrong
implementation named), and the cited accessor exists:
`PanelRegistry::queued_events_for_panel`
(`crates/bitty-runtime/src/registry/panel.rs:803`, backed by
`event_bus.queued_events_for_panel` at `:1435`). The finding is closed.

The closure is what makes `B-4` blocking. The release this section requires
removes `(PanelId, N)`'s grant rows before any successor exists, and `D.1`
defines the successor's ceiling as exactly those rows. Neither section mentions
the other.

### G-3 completion — all four required changes present, completion contingent on B-2

Round 1 asked for four things: the assignment point plus the record carrying it;
rebind preservation and placeholder attribution; PR-1/PR-2 accounting for a
created-but-unmounted container; and an implementation-status row for the
`workspace: None` allocation. All four are now in the text:

- **Assignment and record** — `A.7` as quoted under `B-2`, with "A container
  with `workspace: None` is not a state this record permits."
- **Preservation** — `A.4` keeps "attachment, `PresentationMode`, workspace
  membership, and title"; `A.7` adds "Rebind preserves the recorded workspace and
  never re-resolves it, and an unbound placeholder stays attributed to it."
- **Accounting** — `A.8` "A `Created` but unmounted container charges one
  workspace slot and one window slot from allocation […] a rebind charges
  nothing, including a rebind of an unbound placeholder, which already holds its
  slots."
- **Implementation status** — the row now records `create_panel(parsed, None)`,
  the `None` charge, and `active_workspace` as write-only.

That is a complete answer to the four changes requested, and it is the right
answer on the design question. It is not counted closed here, because the
assignment rule's output is `B-2` and an assignment whose owner cannot be named
is the gap `G-3` recorded. When `B-2` closes, `G-3` closes with it and needs no
further text of its own.

## New blocking findings

Numbered `B-4` onwards so they stay distinct from the closed `B-1` and `B-3`,
the open `B-2`, and the `G-` series.

### B-4 — The unbind release deletes the grant ceiling phase 0 must read, so the ceiling is empty on every reload

**Where:** decision § "Decision A" item 2 (the edge-release paragraph); §
"Decision C" rule 2; § "D.1" (the definition of `P`, precedence 2) and § "D.2"
phase 0; § "D.3" (the "Capability grants" row); `PGO-7`, `PGO-18`, `PGO-22`;
§ "Security review" item 1.

**Finding.** Three sentences, each correct on its own:

1. `A.2`: "The release runs at the generation edge itself and needs no
   successor. […] On the terminal edge the container therefore releases, for
   that controller generation: its grant rows for `(PanelId, N)` […]"
2. `C.2`: "The panel becomes unbound, releases that generation's panel-scoped
   families through the unbind release in `A.2`, and then presents the
   placeholder." `C.2` is unqualified: it applies to every controller
   `Disposed`, not only to a disposal with no successor.
3. `D.1` and phase 0: `P` is "the predecessor generation's panel-scoped grant
   set for this `PanelId`", read "at bind entry" from that set, and "If the
   snapshot cannot be taken, the bind is refused".

The record fixes the reload order itself — `C.5`: "generation `N` is disposed
before `N+1` activates" — so the reload sequence the text describes is:

1. `N`'s terminal edge runs the `A.2` release and removes `(PanelId, N)`'s grant
   rows. No `N+1` exists yet.
2. `N+1` activates.
3. `N+1` binds. Phase 0 "read[s] the predecessor's panel-scoped grant set for
   this `PanelId`" from the live table.
4. The row is gone. `P = ∅`. The formula evaluates to
   `grant(n+1) = (R ∩ ∅) ∪ C = C`, and by precedence 3, `C` is "the subset of
   (`R` minus `P`) for which a permission-diff consent was granted", i.e. a
   consented subset of all of `R`.

Two outcomes follow, and neither is acceptable:

- **Literal implementation.** A reloaded generation holds only what it obtained
  consent for during the bind, which is nothing by default. The successor binds,
  the panel reads as bound, and the successor cannot call `panel.create` or
  `panel.focus` on it — a rebind that succeeds in form and leaves the panel
  unusable. `PGO-1` and `PGO-2` assert container facts and would still pass, so
  the damage is invisible to them; `PGO-7`, `PGO-18`, and `PGO-22` are the rows
  that read the grant set back and they fail.
- **Natural repair.** An implementer reads "no predecessor row" as "no ceiling"
  and grants `R`. That is almost certainly the intent, but it makes precedence 2
  dead text on every path where the predecessor has ended: the ceiling is never
  consulted after a reload, a crash with re-enable, a disable with re-enable, or
  a reinstall. `T-25`'s defense — a successor inheriting nothing it did not
  resolve, narrowed by what its predecessor held — is then unenforced on exactly
  the paths the record exists for.

The ceiling survives in one situation only: a bind that displaces a predecessor
that is still bound when phase 0 runs (the two-generation race of `PGO-8`, or a
same-generation controller replacement). That is the inverse of the case this
record was written for. `C.1` makes the boundary visible: a _suspended_
generation "retains grants", so the ceiling exists while the driver is
suspended, and is deleted the moment the driver is disposed — which is when a
reload happens.

The record states the contradiction without noticing it. `A.2` ends: "A bind
repeats these releases in phase 1 as defense in depth; the repetition is
idempotent and is not the mechanism that satisfies this rule." A release that is
a _repeat_ by the time phase 1 runs is a release that has already removed the
row phase 0 was supposed to copy. The security-review summary then draws the
wrong conclusion from the fix: "The ceiling is read from a snapshot captured
before any invalidation (`D.2` phase 0), so no ordering in the bind can turn it
into an empty set or into a source." True, and insufficient: the ordering that
empties it is the unbind release, outside the bind.

Two further consequences of the same gap:

- **Phase 0's failure branch has no referent on this path.** It promises "the
  predecessor stays bound". After step 1 the predecessor is disposed; it cannot
  stay bound, and there is nothing to snapshot. The branch is written for a live
  predecessor, which is not the reload case.
- **The no-predecessor bind is undefined and evaluates to the empty set.** A
  first bind of a `Created` panel, or a bind of a placeholder after a crash, has
  no predecessor row and no "predecessor's controller generation" to stamp.
  Phase 0 offers two readings — "cannot be taken" (refuse the bind, which makes
  `A.5`'s placeholder and the `E` retry action unreachable) or an empty snapshot
  (proceed, and under the formula the panel's first binding needs a consent
  round-trip for `panel.create`). The record does not say which, and precedence
  3 makes every element of `R` a "widening" when `P` is empty.

**Why it is blocking.** The decision's central security property is that a
rebind concedes nothing and narrows by the predecessor's set. As amended, the
set is deleted before the only reader that could use it runs, so the property
holds only where the predecessor is still alive — and the row that is supposed
to prove it (`PGO-22`) can pass without ever crossing the edge that deletes it.
A test that grants for `N` and binds `N+1` in one setup passes; the same bind
after `N`'s disposal, which is what a reload is, cannot. `PGO-7` and `PGO-18`
are in the same position: the observed set is empty where the expected set is
the resolution filtered by the predecessor, and "the remaining intersection is
granted" has nothing left to grant. Three matrix rows — `PGO-7`, `PGO-18`,
`PGO-22` — are therefore unsatisfiable on the reload path as described, which is
the definition of a blocking defect under this gate.

**Required correction.** Decide where `P` lives across the generation edge, and
make it one answer:

- State that the edge release writes the departing generation's panel-scoped
  grant set into a per-panel record before it removes the live row — or that the
  snapshot record is written at bind time and retained on the panel, keyed
  `(PanelId, ended controller generation)` — and that phase 0 reads that record,
  never the live table. Name its owner, its key, and its lifetime (until the
  panel's next successful bind, or until the panel is disposed, or a stated
  number of generations).
- Say which of the two is authoritative when both exist: the retained record or
  a live predecessor row from a racing bind. `PGO-8` puts both in play at once.
- State whether the `A.2` release runs on a reload where a successor is certain.
  If it does — the reading `C.2` and "needs no successor" both support — the
  retained record is what preserves the ceiling, and the record must say so. If
  it does not, say how the edge knows no successor will come and what then
  triggers the release later, because a deferred release is the `B-3` finding
  unchanged.
- State the absent-predecessor case in `D.1` explicitly: no predecessor is not
  an empty ceiling. A first bind grants `R` with no permission-diff consent,
  because the create verb is the authorization, and phase 0's "cannot be taken"
  branch must not be read as refusing it.
- Extend `PGO-22` — or add `PGO-24` — so its setup crosses the edge: dispose
  `N`, then bind `N+1`, then require the committed set to equal `R ∩ P` with `P`
  non-empty. The row must fail for an implementation whose phase 0 reads a table
  the edge release has drained, and for one that treats an empty `P` as no
  ceiling.

## Non-blocking findings

`N-6` to `N-9` were not touched by this revision and stay open; three are added.
None gates the verdict.

| ID     | Status | Finding and expected disposition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `N-6`  | Open   | `C.7` maps `Closed` to "container retained, controller still bound, content retained" but never says which of the six `PanelRecord` states holds that mapping, while the same rule states `Closed` "is not representable in `PanelRecord`". State the state, or state that the mapping is refused until the RFC amendment admits `Closed`. Unchanged by this revision.                                                                                                                                                                                                                                    |
| `N-7`  | Open   | `E.1` increments a counter keyed `(PanelId, controller generation, reason)` and emits the saturation note once per `(PanelId, binding)`; `A.2` now adds a second counter keyed `(PanelId, ended controller generation)`. Three key shapes now describe one panel's lifecycle in two sections that both say "one counter". Key them consistently, or name them distinctly in the diagnostic surface so an operator can tell them apart.                                                                                                                                                                    |
| `N-8`  | Open   | The controller generation is "masked […] to 30 bits" for handle minting while `HostPanel.epoch` and the binding hold the unmasked `u32` (`crates/bitty-runtime/src/scene_host.rs:109`, `services.rs:1063`). The open point covers saturation but not the collision: two epochs 2^30 apart mint the same handle epoch. State that the binding compares the unmasked value and that no path compares a minted handle's epoch to a binding.                                                                                                                                                                  |
| `N-9`  | Open   | `C.9` requires one FS-4-style record per disposed panel "with owner, controller generation, reason `quit`", but a workspace full of unbound placeholders has no controller generation to name. Say what the record carries then (the last controller and its end, or an explicit absent value). Unchanged by this revision.                                                                                                                                                                                                                                                                               |
| `N-10` | New    | `A.2` releases "the panel commands `N` registered", but the command registry keys commands by `PanelId` only — `CommandRegistry::unregister_panel(panel_id)` removes every command for the panel (`crates/bitty-ui/src/panel.rs:622`, `per_panel: HashMap<PanelId, Vec<String>>` at `:571`) — and `D.4`'s six-family table has no commands row, so the one family the release list newly names is the one whose generation key does not exist and whose revocability is not analysed. State that the purge is panel-wide and why that is safe at the edge (the successor has not bound), and add the row. |
| `N-11` | New    | A failed edge release "leaves the panel unbound and refuses every verb", with no stated exit. Unlike the failed-bind branch there is no retry trigger at the edge, and "never a re-bind of `N`" does not say whether `N+1` may bind afterwards. State the recovery path, or that the panel is terminal until the user closes it; otherwise the placeholder's retry action has no defined behaviour over a failed release.                                                                                                                                                                                 |
| `N-12` | New    | The unbind-release counter is keyed per _ended_ controller generation with no retention rule, so a long-lived panel accumulates one entry per reload — the unbounded diagnostic growth `E.1` forbids for recovery counters — and `PGO-23` reads it without naming an accessor. State where it lives, its retention, and the accessor the row reads.                                                                                                                                                                                                                                                       |

## What this verdict does and does not authorize

**It does.**

- Record that `B-1` and `B-3` are closed on their own terms, that `G-3`'s four
  required changes are present in text, and that the record may proceed to a
  fourth revision that answers `B-2` and `B-4`.
- Record that the owning repository's own `Document status` and `P0 Review
Sign-off` paragraphs are accurate about `B-1` and `B-3` and inaccurate about
  `B-2`, which the answering revision must correct.

**It does not.**

- Accept the decision, approve it, or move it out of `status: draft`. This
  review does not edit the decision record and has no authority over its status;
  owner acceptance is a separate act by the owning repository and is not
  conferred, implied, or pre-judged here.
- Promote anything to **Verified** or **Compatible**, or treat any sentence in
  the record as a description of shipped behaviour. No rebind code exists, and
  the record says so itself.
- Authorize implementation of the rebind mechanism, the grant re-key, the
  unbind release, the workspace resolution, or the `PGO-` matrix. `B-2` and
  `B-4` are text defects in a design gate; until they are corrected the
  mechanism they describe cannot be built to a single reading, and building it
  to either reading of `B-4` produces a different access-control rule.
- Authorize the RFC-amendment wave in the verification plan, a dependent
  implementation issue, or a change to any accepted contract. No `P0`
  acceptance criterion is modified by this review.
- Certify that the matrix is sufficient. `PGO-22` and `PGO-23` are the right
  shapes, and `PGO-22` cannot currently discriminate the defect it was added to
  catch.
- Treat `N-6` to `N-12` as accepted risk. They are carried obligations; the
  first four were already carried by round 2 and remain unaddressed.

## Code claims re-verified

Read from `bitty` `origin/main` at `7ac871d4` and `1df03339`. `Confirmed` means
the amended sentence matches the code at both revisions. `Wrong` means the cited
identifier does not exist. `Not present` means the mechanism the sentence assumes
is absent from the tree.

| ID   | Amended claim                                                                                        | Evidence at `7ac871d4`                                                                                                                                                                                                                    | Result      |
| ---- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| C-1  | `create_panel` takes a workspace argument and is the only writer of `PanelRecord.workspace`          | `crates/bitty-runtime/src/registry/panel.rs:982-986` (`workspace: Option<WorkspaceId>` at `985`), struct literal `1019-1027`, no later assignment                                                                                         | Confirmed   |
| C-2  | `create_panel_by_type_str` forwards the same argument                                                | `panel.rs:1046-1054`, `self.create_panel(pt, workspace)`                                                                                                                                                                                  | Confirmed   |
| C-3  | `PanelRegistry::active_workspace` is assigned only inside `create_panel` when `None`, and never read | `panel.rs:840`, `882`, `1034-1035`; no other reference to `PanelRegistry::active_workspace` anywhere in the tree                                                                                                                          | Confirmed   |
| C-4  | `Runtime::active_workspace_index` exists                                                             | `crates/bitty-runtime/src/runtime/workspaces.rs:225` (`-> usize`)                                                                                                                                                                         | Confirmed   |
| C-5  | "`Layout::focused_view`" is the focused-view accessor                                                | No `Layout` type or alias exists; layout type is `LayoutNode`. Accessors are `Runtime::focused_view()` (`runtime/layout_focus.rs:3048`) and `TerminalRegistry::focused_view(WorkspaceId)` (`registry/terminal.rs:828`)                    | Wrong       |
| C-6  | "that workspace's focused view" is readable per workspace                                            | `WorkspaceSlot.focus: Focus` (`runtime/workspaces.rs:72`); `Runtime::focused_view()` reads the live `self.focus` (`layout_focus.rs:3048-3050`), which is the presented slot only                                                          | Confirmed   |
| C-7  | Core "passes the resulting `WorkspaceId`" from the index and the focused view                        | Zero `WorkspaceId` references under `crates/bitty-runtime/src/runtime` and `crates/bitty-terminal/src`; `WorkspaceSlot` carries `seq`, not an id (`workspaces.rs:64-76`); `seq` is swapped on reorder (`2672-2706`)                       | Not present |
| C-8  | A `WorkspaceId` can be minted and passed in production                                               | Minted only by `TerminalRegistry::create_workspace` (`registry/terminal.rs:336-354`); callers are tests only (`workspace.rs:259` under `#[cfg(test)]` at `147`; `registry/tests.rs`; `tests/panel_claims.rs`; `tests/workspace_panel.rs`) | Not present |
| C-9  | (implied) the active workspace id is available on the registry side                                  | `TerminalRegistry::active_workspace()` (`terminal.rs:393`) and `set_active_workspace` (`terminal.rs:402`) have no callers anywhere                                                                                                        | Not present |
| C-10 | `focus_panel` already refuses a workspace argument that disagrees with the record                    | `panel.rs` `focus_panel` guard: `rec.workspace != Some(workspace) && rec.workspace.is_some()` → `NotFound { kind: "workspace" }`                                                                                                          | Confirmed   |
| C-11 | The queue side is readable through `queued_events_for_panel`                                         | `panel.rs:803` (registry), `:1435` (`event_bus.queued_events_for_panel`)                                                                                                                                                                  | Confirmed   |
| C-12 | Panel commands can be attributed to a generation                                                     | `CommandRegistry::unregister_panel(panel_id)` (`crates/bitty-ui/src/panel.rs:622`), `per_panel: HashMap<PanelId, Vec<String>>` (`:571`); no generation key                                                                                | Wrong       |
| C-13 | `dispose_panel` removes commands, queues, and the grant row for its generation                       | `panel.rs:1282-1284` (`unregister_panel`, `clear_panel`, `capabilities.remove(&(panel_id, generation))`); grants keyed `(PanelId, Generation)` at `:844`                                                                                  | Confirmed   |
| C-14 | All production `create_panel` call sites pass `None`                                                 | `crates/bitty-terminal/src/plugin_runtime.rs:471`; `crates/bitty-runtime/src/scene_host.rs:425`, `:634`                                                                                                                                   | Confirmed   |
| C-15 | The controller epoch is masked to 30 bits for handles and stored unmasked on the binding             | `scene_host.rs:109-112`; `plugin_runtime/services.rs:1063-1066`; `HostPanel.epoch: u32` at `scene_host.rs:158-164`                                                                                                                        | Confirmed   |

## Residual risk carried to the implementation

The residuals the decision states remain accepted and are unchanged by this
revision: no persisted encoding for the restore key; the `terminal`-slot scene
panel stays generation-scoped and is excluded by `A.6`; cross-plugin claim of a
persisted panel is undecided; the activation counter saturates rather than
failing closed; and two behaviours still ship and both must move — the scene
path disposes its container at every generation boundary, and
`bitty.panel.create` panels carry no binding and survive a reload with whatever
grants they had.

`B-2` and `B-4` are not residuals and must not be carried as accepted risk. Each
is a defect in the described mechanism, each is correctable in text before any
rebind code exists, and `B-4` exists because two individually correct
corrections were never read together.

## Evidence register

| Item  | Verdict          | Evidence                                                                                                                                                                |
| ----- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `G-1` | Closed (round 2) | `D.1` formula and precedence, unchanged by this revision                                                                                                                |
| `G-2` | Closed (round 2) | `D.2` ordered invalidation, fail-closed branch, typed refusals; the phase structure survives this revision with phase 0 added                                           |
| `G-3` | Complete in text | `A.7`, `A.4`, `A.8`, and the workspace-membership implementation row; the assignment's identity step is `B-2`                                                           |
| `G-4` | Closed (round 2) | `A.6` scope rule and the scene-panel rows, untouched                                                                                                                    |
| `G-5` | Closed (round 2) | Plugin-scoped teardown correction, `D.4` family table, rejected `drop_plugin` reuse                                                                                     |
| `G-6` | Closed (round 2) | `B.4` to `B.6` of Decision B, `PGO-12`, open points, untouched                                                                                                          |
| `G-7` | Closed (round 2) | `C.8`, `C.9`, `PGO-21`, untouched                                                                                                                                       |
| `G-8` | Closed (round 2) | `PGO-7`, `PGO-15`, `PGO-16`; the matrix count moves to twenty-three and `PGO-7` is extended                                                                             |
| `B-1` | Closed           | `D.2` phase 0 with its failure branch, phase 2 steps 1 to 3, the failed-install branch, `PGO-22`, extended `PGO-7`                                                      |
| `B-2` | Open             | `A.7` against `C-5`, `C-7`, `C-9` above: the output id is not produced by anything in the tree, and the cited accessor does not exist                                   |
| `B-3` | Closed           | `A.2` edge release with the four families and the before-placeholder order, `C.2`/`C.3` routed through it, `D.4` rows, `PGO-23`, `C-11`                                 |
| `B-4` | Open (new)       | `A.2` edge release and `C.2` against `D.1`'s definition of `P` and `D.2` phase 0; `C.5` fixes the reload order; `PGO-17`, `PGO-18`, `PGO-22` unsatisfiable on that path |

## Verification obligations that survive this review

These are added because the findings above make them necessary, and none can be
satisfied by a row the amendment already names.

- **Reload across the edge.** Dispose `N` through the `A.2` release, then bind
  `N+1` whose resolution equals `N`'s set; require the committed set to equal
  that set and the ceiling to have been read from the retained record, not from
  the live table. This is the row `B-4` needs and `PGO-22` does not currently
  provide.
- **First bind.** Create a panel with no predecessor and bind it; require `R` to
  be installed with no permission-diff consent, and require the bind not to be
  refused by the phase 0 capture branch.
- **One workspace, one bucket.** Resolve two creates from the same presented
  workspace and assert that the recorded `WorkspaceId` is the id the workspace
  registry uses for that workspace — same bucket in `workspace_panels`, same
  PR-1 counter — and that a `focus_panel` call using the registry's id succeeds
  rather than returning `NotFound { kind: "workspace" }`.
- **Reachable fail-closed resolution.** Close every leaf of the presented
  workspace and require `E_UI_UNAVAILABLE` with no record, no PR-1 charge, and
  no fallback to a default or global workspace.
- **Release observability.** Read the unbind-release counter and the four
  families back through the accessors the verbs use, on a crash, a disable, and
  a disposal, and assert the counter distinguishes "nothing to release" from
  "the release never ran".
- **Edge-release authority.** Bind against a panel whose predecessor is still
  bound while a racing bind is in flight, and require exactly one ceiling to be
  consulted and named in the FS-4 record.

## Limitations of this review

- Read-only and static: no build, no test execution, no dynamic analysis in
  `bitty`. Every code statement is a text observation at `7ac871d4` and
  `1df03339`; line numbers drift, and the file path is the durable citation.
- The decision is judged as a diff against `25aa80f`, so an unchanged sentence
  is credited from the second review rather than re-argued here. `G-1`, `G-2`,
  and `G-4` to `G-8` are not reopened.
- `B-4` is a defect of composition, not of either correction. Both sections read
  correctly alone; the reviewer's judgement is that the join is where an
  implementer loses the ceiling, and that judgement is made from the record's own
  ordering, not from a running system.
- The reviewer cannot judge whether the focused leaf of the presented workspace
  is the right product rule for a `panel.create` with no target; that is a
  product question. `B-2` judges only that the rule's output exists.
- The persistence contract behind `RFC-OQ-9` stays out of scope, so the
  index-to-`WorkspaceId` resolution `B-2` needs is judged as a create-path
  requirement, not as a restore design.
- No threat-model row was added or amended by this review; `T-25` is used as the
  requirement it is, and this review claims no implemented defense.
- The PR body for #380 was read for what it claims, and every claim in it was
  checked against the merged text; where the body and the text agree and both
  are wrong (`B-2`'s "two facts it already owns"), the finding cites the text.

## References

- [Panel Generation Ownership Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-generation-ownership-decision.md)
  — the reviewed draft at `3f3fb2c`.
- [Panel generation ownership review](panel-generation-ownership-review.md) —
  round 1, the origin of `G-1` to `G-8` and `N-1` to `N-5`.
- [Panel generation ownership re-review](panel-generation-ownership-rereview.md)
  — round 2, the origin of `B-1` to `B-3` and `N-6` to `N-9`.
- [`bitty-terminal-docs` PR #380](https://github.com/bitty-terminal/bitty-terminal-docs/pull/380)
  — the amendment reviewed here, and the claims it makes about itself.
- [Threat model](threat-model.md) — row `T-25`, authority carry-over across a
  panel generation boundary.
- [Security overview](overview.md) — invariants 2, 3, 4, and 7.
- [P0 acceptance criteria](p0-acceptance-criteria.md) — the rebind-authority
  evidence row this decision serves, unchanged by this review.
- Issue [`bitty#2476`](https://github.com/bitty-terminal/bitty/issues/2476) —
  the design gate this review answers.
