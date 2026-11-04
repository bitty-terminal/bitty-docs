---
title: Panel Generation Ownership Fourth Review
description: Fourth-round independent review of the amended panel generation ownership decision, closing B-4 in text but finding B-2 stale against the merged workspace-identity implementation, a retained-ceiling eviction path the record does not cover, and a PGO-18 row that cannot discriminate the no-tombstone implementation
category: security
audience: security-reviewer
document_type: research
status: draft
website_publish: false
sidebar_order: 53
---

# Panel Generation Ownership Fourth Review

## Review status

**Verdict: `NEEDS-FIX`.** The revision answers `B-4` in text and that answer is
sound: the six edge cases the third review asked about each produce a safe
outcome, and the sentence that does the work is identified per case below. The
revision does not close `B-2`. At the record's pinned revision `7ac871d4` the
identity claims were true; at current `bitty` `origin/main` (`cec83552`) the
workspace identity and the retained-ceiling seam have landed in `58d524c8`, and
the record's present-tense sentences say the opposite. The merged code also
contradicts two load-bearing sentences the record states: it keeps the retained
ceiling on panel disposal and it treats a missing ceiling as an absent
predecessor, which lets the bounded table evict a live panel's ceiling and grant
its successor the whole resolution. That is `B-5`. The test wiring is not
vacuous in `PGO-22`, whose separate "neither source present is refused" clause
does discriminate, but `PGO-18` can pass with the hole open because its
successor resolution is a subset of the predecessor set; that is `B-6`. The
record stays `draft`, the promotion gate is **not** met, and nothing here
authorizes implementation of the rebind mechanism.

| Item              | Value                                                                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reviewed contract | [Panel Generation Ownership Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-generation-ownership-decision.md), `status: draft`                       |
| Reviewed revision | `bitty-terminal-docs` `d1731a00` (PR [#383](https://github.com/bitty-terminal/bitty-terminal-docs/pull/383)), judged as a diff against `3f3fb2c`, the revision the third review read                |
| Round 1           | [Panel generation ownership review](panel-generation-ownership-review.md), `NEEDS-FIX` on `G-1` to `G-8`, non-blocking `N-1` to `N-5`                                                               |
| Round 2           | [Panel generation ownership re-review](panel-generation-ownership-rereview.md), `NEEDS-FIX` on `B-1` to `B-3`, `G-3` partly closed, non-blocking `N-6` to `N-9`                                     |
| Round 3           | [Panel generation ownership third review](panel-generation-ownership-third-review.md), `NEEDS-FIX`: `B-1` and `B-3` closed, `B-2` open, `B-4` added, `N-6` to `N-9` carried, `N-10` to `N-12` added |
| This round        | `B-4` closed in text; `B-2` open against current `origin/main`; `G-3` still contingent; `B-5` and `B-6` added; `N-6` to `N-11` carried; `N-12` closed in text; `N-13` to `N-16` added               |
| Threat model      | [Threat model](threat-model.md) row `T-25`, authority carry-over across a panel generation boundary                                                                                                 |
| Code evidence     | `bitty` `origin/main` at `cec83552` (2026-11-05), including `58d524c8` (2026-11-04), and the record's pin `7ac871d4` (2026-11-03); read-only, no checkout, no build, no test run                    |
| Review date       | 2026-11-05                                                                                                                                                                                          |
| Reviewer role     | Independent security reviewer; no authorship of the decision, of any earlier review's amendments, or of the code the decision cites                                                                 |
| Gate              | This repository's documentation gate (format, markdownlint, links, cross-repo links, metadata, language, hygiene, agents, state, actionlint)                                                        |
| Outcome           | Status stays `draft`; promotion withheld until `B-2`, `B-5`, and `B-6` are corrected; `N-6` to `N-11` and `N-13` to `N-16` are carried, none of them gating                                         |

The reviewer wrote none of the reviewed text, answered none of the earlier
findings, and has no stake in the outcome. The decision lives in another
repository (`bitty-terminal-docs`) and was read from its merged `d1731a00`;
nothing in this review edits it. The earlier reviews were read in full and their
code claims re-used only where the amended text did not touch them, which is
stated per claim in the evidence table.

`B-4` is closed in text on its own terms. The reason the verdict is still
`NEEDS-FIX` is not a new argument about the tombstone: it is that the record's
`Implementation status` and `Security review` sections no longer describe the
tree, and the merged implementation of the very mechanism the record says does
not exist already fails two of its sentences. The record was merged on
2026-11-05 against evidence pinned to 2026-11-03; the code commit `58d524c8`
landed on 2026-11-04. The pin is honest, but the present-tense prose around it
is not.

## Review lineage

| Round | Document                                                   | Reviewed revision             | Verdict     | Findings recorded                                                                                                                          |
| ----- | ---------------------------------------------------------- | ----------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | [Review](panel-generation-ownership-review.md)             | decision `634d181`            | `NEEDS-FIX` | `G-1` to `G-8` blocking; `N-1` to `N-5` non-blocking                                                                                       |
| 2     | [Re-review](panel-generation-ownership-rereview.md)        | decision `25aa80f` (PR #378)  | `NEEDS-FIX` | `G-1`, `G-2`, `G-4` to `G-8` closed; `G-3` partly closed; `B-1` to `B-3` new; `N-1` to `N-5` closed; `N-6` to `N-9` new                    |
| 3     | [Third review](panel-generation-ownership-third-review.md) | decision `3f3fb2c` (PR #380)  | `NEEDS-FIX` | `B-1`, `B-3` closed; `B-2` open; `G-3` complete in text, contingent on `B-2`; `B-4` new; `N-6` to `N-9` carried; `N-10` to `N-12` new      |
| 4     | This document                                              | decision `d1731a00` (PR #383) | `NEEDS-FIX` | `B-4` closed in text; `B-2` open; `G-3` contingent; `B-5`, `B-6` new; `N-6` to `N-11` carried; `N-12` closed in text; `N-13` to `N-16` new |

PR #383 claims to close `B-2` and `B-4`. Its body says documentation only, no
promotion, no implementation claim. The body was read as a claim, not as
evidence. `B-4`'s claim holds in text. `B-2`'s claim does not hold against the
tree at the revision the record now describes.

## Scope and method

This is a fourth review, not a re-read. It judges the amendment as a diff
against `3f3fb2c` and re-judges only the findings the third review left open
(`B-2`, `B-4`, `G-3`) plus the rows and sections this revision edited.

Method:

1. Read `d1731a00` as a diff against `3f3fb2c`, so each correction is checked
   against the finding it answers rather than against a fresh reading.
2. For `B-4`, walk the reload sequence end to end and name, for each of the six
   cases the third review listed, whether the record's text produces a safe
   outcome and which sentence does the work. A text-level closure is recorded
   as such even where the merged implementation is incomplete.
3. For `B-2`, verify every cited identifier and every present-tense claim at
   `bitty` `origin/main` `cec83552` with `git show`, not the stale checkout, and
   again at the record's pin `7ac871d4` so a claim that only held at the pin is
   visible. This is where the review's main new finding comes from.
4. For the test wiring, ask of `PGO-7`, `PGO-18`, `PGO-22`, and `PGO-23`
   whether an implementation that never writes a tombstone, or that writes one
   and reads only the live table, fails the row on the row's own words.
5. Read the `Implementation status` and `Security review` sections for
   sentences that have become false, and the `Document status` and
   `P0 Review Sign-off` sections for present-tense verbs that read as
   implementation.

Out of scope, unchanged: whether panels should outlive generations; panel
placement and the `View` versus `PanelId` encoding; the non-terminal content
scene path; the persistence contract behind `RFC-OQ-9`; overlay geometry;
accessibility semantics of the placeholder; performance. The review judges a
design gate and says so wherever a claim would otherwise read as shipped
behaviour.

## Per-finding verdict

### B-4 — The bounded retired-ceiling tombstone: closed in text

The third review's finding was that the edge release removed the grant row
`D.2` phase 0 had to read, so `P` was empty on every reload and
`grant(n+1) = C`. The revision answers it with one mechanism in four places:

- `A.2` writes before it deletes:

  > Before the release deletes `(PanelId, N)`'s live grant row, it captures the
  > row's set and writes a tombstone keyed `(PanelId, N)`. […] When the row does
  > not exist — a generation that bound but held no grants — the tombstone is
  > still written, with an empty set, because "ended with nothing" is a fact the
  > successor must be able to distinguish from "the record was lost".

- `C.5` fixes the order: "The edge release and its tombstone complete before
  `N+1` activates, so the successor's phase 0 has the predecessor's ceiling to
  read rather than a row the edge already deleted."

- `D.2` phase 0 selects the source: "The source is the live row when the bind
  displaces a still-bound predecessor, and the retired-ceiling tombstone […]
  when the predecessor ended before this bind — the reload case. When both exist
  for the same generation the live row wins."

- `D.2` phase 2 step 3 ends the retention: "drop the panel's retired-ceiling
  tombstone for the predecessor generation, then and only then permit successor
  verbs."

The six cases the third review named:

| Case                                     | Safe?                         | The sentence that does the work                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reload, predecessor held grants          | Yes                           | `A.2` "Before the release deletes […] it captures the row's set and writes a tombstone"; `C.5` orders the edge before `N+1`; `D.2` phase 0 reads the tombstone "when the predecessor ended before this bind". `P` is a real non-empty set and `grant(n+1) = (R ∩ P) ∪ C`.                                                                                                                                                                                           |
| Reload, predecessor held none            | Yes                           | `A.2` "When the row does not exist […] the tombstone is still written, with an empty set"; `D.1` "An empty tombstone is a real empty ceiling, not an absent one"; `D.2` "An empty tombstone is not a missing one: it yields `P = ∅` as a real ceiling." The successor inherits nothing and needs consent for every element of `R`.                                                                                                                                  |
| Lost tombstone, previous controller      | Yes                           | `D.2` "A previous controller with neither a live row nor a tombstone means the ceiling record was lost: the bind is refused." The refusal runs no phase 1 step and writes no phase 2 step.                                                                                                                                                                                                                                                                          |
| Tombstone for an older generation        | Yes                           | `D.2` "A tombstone for any generation other than the record's last controller generation is treated as a missing record and refused the same way." A stale ceiling cannot be read as the current predecessor's.                                                                                                                                                                                                                                                     |
| Bind displaces a still-bound predecessor | Yes                           | `D.2` phase 0 "The source is the live row when the bind displaces a still-bound predecessor"; "When both exist for the same generation the live row wins"; phase 1 step 1 writes the tombstone "if its edge has not already written one"; phase 2 step 3 drops it. The racing bind of `PGO-8` therefore reads the live row, not a tombstone from an earlier edge.                                                                                                   |
| Crashed edge                             | Yes, with a durability caveat | `A.2` "The tombstone write is part of the release, not an optimisation: if it cannot be written, the release fails closed without deleting the live row." A crash after the write and before the delete leaves both sources, and phase 0's "live row wins" is safe. A crash between the delete and durable tombstone storage is not stated; if the tombstone is lost, phase 0's missing-record refusal is the safe reading, and any narrower `P` can only subtract. |

The empty-vs-missing rule does close the hole the third review described. The
third review's bad outcome was "missing row = no ceiling = grant `R`". The record
now has three distinct states: a live row (live wins), a retained tombstone
(empty or non-empty, a real ceiling), and neither with a previous controller
(refuse). The only state that grants `R` is the never-bound panel, which `D.1`
names explicitly: "A panel that has never been bound has no predecessor and
therefore no ceiling: `P` is absent rather than empty […] the first bind grants
`R` with no permission-diff consent because `panel.create` is the
authorization." That is the correct exception and it is separated from the lost
record by the panel record's last controller generation.

Two textual gaps remain, neither of which changes the verdict on `B-4`:

- **The failed-tombstone-release path is asserted in `A.2` but not modelled in
  `D.2`.** `A.2` says the release "fails closed without deleting the live row
  […] a later bind also refuses rather than proceed without a ceiling (D.2 phase
  0)". `D.2` phase 0 reads the live row only "when the bind displaces a
  still-bound predecessor"; after the failed release the panel is unbound, and
  the tombstone does not exist. The live row exists, so the "neither source"
  branch does not literally apply. An implementer can read the live row (safe,
  the ceiling is preserved) or follow `A.2` and refuse (safe). Neither reading
  widens authority, but the text should state which one `D.2` implements. This
  is `N-15`.
- **A late edge of a displaced predecessor can rewrite the tombstone.** If `N`
  is displaced while still bound and later ends, its edge can write an empty
  tombstone for `N` after `N+1` has bound. `D.2`'s generation check treats a
  tombstone for a generation other than the record's last controller as missing
  and refuses, so the outcome is fail-closed; it is not an authority path. This
  is `N-16`.

### B-2 — The workspace identity step: open against current `origin/main`

The revision withdraws the false claim and states a prerequisite. At the
record's pinned revision that is an honest correction. At current `origin/main`
the prerequisite's first half has landed, and the record's present-tense
sentences are false in the direction that matters for an implementer: they say
the tree has no id, while the tree now has one, and they name the wrong id
owner.

What the record says:

> **The identity that names that workspace is a prerequisite, not a fact the
> tree supplies today.** Core can read the focused view, and the terminal
> registry holds one record per workspace, but no `WorkspaceId` is reachable
> from `Runtime`: `WorkspaceSlot` carries `seq`, `name`, `layout`, `focus`, and
> the float store and no `WorkspaceId`; `Runtime` holds the active workspace as
> an index; and `WorkspaceId` is minted only by
> `TerminalRegistry::create_workspace`, whose callers are tests […]
>
> The prerequisite is exact: **a workspace identity is minted at workspace
> creation and stored on the same record the layout presents, and `Runtime` can
> read it for the focused view.** The id space is the terminal registry's […]
> Until the prerequisite exists, `create_panel` fails closed with
> `E_UI_UNAVAILABLE`: it does not invent a workspace, does not accept a
> plugin-supplied one, and does not allocate a record. Acceptance for the
> prerequisite is one test: **the focused view of a presented workspace resolves
> to the minted `WorkspaceId`, and no plugin input can influence the result.**

At `bitty` `origin/main` `cec83552`, commit `58d524c8` (2026-11-04) changed
exactly that surface:

- `WorkspaceSlot` carries `pub id: WorkspaceId`
  (`crates/bitty-runtime/src/runtime/workspaces.rs:75`). The record's "no
  `WorkspaceId`" is false.
- `Runtime::active_workspace_id()` (`:251`) and
  `Runtime::focused_workspace_id()` (`:268`) exist. The latter is the create
  bridge the record describes: it reads `focused_view()` and returns the
  presented slot's id, or `None`.
- `Runtime::mint_workspace_id()` (`:282`) is the production minter. Its doc
  comment says "The runtime is the only production minter of `WorkspaceId`".
  `TerminalRegistry::create_workspace` (`crates/bitty-runtime/src/registry/terminal.rs:336`)
  still mints from a separate `next_workspace_raw` counter, and its callers are
  tests (`registry/tests.rs`, `workspace.rs:259`, `tests/panel_claims.rs:497`,
  `tests/workspace_panel.rs:225`). The record's "`WorkspaceId` is minted only by
  `TerminalRegistry::create_workspace`" is false, and the record's "The id space
  is the terminal registry's" is contradicted by the code's own comment.
- `TerminalRegistry::active_workspace` (`:393`) and `set_active_workspace`
  (`:402`) still have no production callers; the only calls are
  `registry/tests.rs:608` and `:616`. This half of the record's sentence remains
  true.

The create path is not wired to the new bridge. `focused_workspace_id` has no
production caller; the only references are the tests in
`crates/bitty-runtime/tests/panel_workspace_identity.rs`. The production
`bitty.panel.create` backend still calls `create_panel(parsed, None)`
(`crates/bitty-terminal/src/plugin_runtime.rs:471`), so a plugin-created panel
still gets `PanelRecord.workspace = None`, which the record says "is not a state
this record permits". The backend's error mapping has no `E_UI_UNAVAILABLE`
branch: `PanelError` (`crates/bitty-runtime/src/registry/panel.rs:73`) has no
such variant, and the backend maps to `E_DEF_INVALID`, `E_DEF_LIMIT`, or
`E_NOT_IMPLEMENTED`. `E_UI_UNAVAILABLE` is a real constant
(`crates/bitty-lua/src/host.rs:928`) and the scene host aliases it
(`crates/bitty-runtime/src/scene_host.rs:82`), but the create path cannot return
it today. The record's sentence "reports `E_UI_UNAVAILABLE`" is a requirement
for a mapping that does not exist, and the record does not say which layer must
add it.

The acceptance test the record names is necessary but not sufficient, and the
merged code shows why: `panel_workspace_identity.rs` asserts the resolver's
properties — the focused id, the distinct ids, the `None` branch, and the panel
registry bucket — while the production backend still passes `None`. A test that
only resolves the id cannot prove that `panel.create` uses it or that it fails
closed when the resolver returns `None`. The record says "the create path is not
conformant until the test exists and passes"; the test exists, and the create
path is still not conformant.

**Why it is blocking.** The third review's required correction had four parts:
name the operation and the id-space owner, say that the operation does not exist
if it does not, state that the resolved id is the same id space the workspace
registry uses and what a create does on disagreement, and correct the status
paragraph. The revision names a mechanism but not the minter; it says the
operation does not exist while the tree has it; it asserts "one bucket" without a
mechanism joining `Runtime::mint_workspace_id` to
`TerminalRegistry::create_workspace`; and its one test does not exercise the
create path. An implementer reading the record today would either duplicate the
minter or wire the wrong one, which is the two-bucket failure the third review
recorded.

**Required correction.**

- Name the minter and the owner. If the id is minted by
  `Runtime::mint_workspace_id` and stored on `WorkspaceSlot`, say so and say
  whether `TerminalRegistry::create_workspace` is retired, bridged, or a
  separate id space. If the id space is the terminal registry's, name the call
  that gets its id onto the slot; no such call exists in `58d524c8`.
- Wire `bitty.panel.create` through `Runtime::focused_workspace_id()` and make
  the `None` branch fail closed with a named `BridgeError` mapping for
  `E_UI_UNAVAILABLE`, before allocation and before any slot charge. Name the
  layer that owns the mapping.
- Make the acceptance test assert the create path, not only the resolver: a
  create with no focused leaf allocates no record, charges no slot, and returns
  `E_UI_UNAVAILABLE`; a production create never calls `create_panel(_, None)`.
- State what a create does when the runtime's resolved id and the terminal
  registry's workspace id disagree, or state that the two counters are one
  space by construction. The record's "one bucket rather than two" is an
  assertion until that sentence exists.
- Update the `Implementation status` row and the `Security review` item that
  still say no `WorkspaceId` is reachable and no accessor exists.

### G-3 — Completion still contingent on B-2

The four required changes are present in text: assignment and record (`A.7`),
preservation (`A.4`, `A.7`), PR-1/PR-2 accounting (`A.8`), and the
implementation-status row for `workspace: None`. `G-3` is not counted closed
because the assignment's output is the identity step, and `B-2` is open. When
`B-2` closes, `G-3` closes with it and needs no further text of its own.

## New blocking findings

### B-5 — The merged retained-ceiling implementation fails two sentences the record states, and its bound can evict a live panel's ceiling

**Where:** `bitty` `58d524c8` / `origin/main` `cec83552`:
`PanelRegistry::derive_rebind_grants`
(`crates/bitty-runtime/src/registry/panel.rs:1641`),
`PanelRegistry::dispose_panel` (`:1288`),
`MAX_RETAINED_GRANT_CEILINGS` (`:836`), and
`crates/bitty-runtime/tests/panel_grant_ceiling.rs:159-206`. In the record:
`A.2` ("dropped […] on workspace close or panel disposal"; "capped at the
registry's `max_panels_per_window`"), `D.2` phase 0 ("A previous controller with
neither a live row nor a tombstone means the ceiling record was lost: the bind is
refused"), and the `Implementation status` / `Security review` claim that no
retained ceiling exists.

**Finding.** The text's B-4 mechanism is sound. The first merged implementation
of it does not implement two of its sentences, and the record's implementation
status says the mechanism is absent, so neither the record nor its matrix
records the gap.

1. **The missing-ceiling branch grants the whole resolution.** `D.2` phase 0
   distinguishes "never bound" from "previous controller, record lost" by the
   panel record's last controller generation. `PanelRecord` has no such field
   (`panel.rs:287-295`), and `derive_rebind_grants` has no generation argument:

   ```rust
   let Some(ceiling) = self.retained_ceilings.get(&panel_id) else {
       return requested.clone();
   };
   ```

   A missing ceiling is therefore the absent-predecessor branch: the successor
   gets all of `R` with no permission-diff consent. The record's "the bind is
   refused" is not implemented.

2. **The ceiling survives panel disposal, contrary to `A.2`.** `dispose_panel`
   calls `release_generation_scope` and then removes the panel record, but it
   does not remove `retained_ceilings`. The code's test
   `a_successor_panel_after_disposal_is_not_bounded_by_the_retained_ceiling`
   asserts the ceiling remains after disposal and that the successor gets all of
   `R`. The record says the entry is "dropped […] on […] panel disposal".

3. **The bound is not the configured panel cap, and eviction can hit a live
   panel.** `MAX_RETAINED_GRANT_CEILINGS` is `64`, the maximum allowed
   `max_panels_per_window`; the default is `32`
   (`panel.rs:43-45`). The code evicts the lowest `PanelId` and its comment says
   "a dropped entry can only name a panel no live record can bind". Under the
   record's design a panel whose controller ended keeps its record (until panel
   disposal), so it is live and bindable, and it is exactly the kind of
   long-lived low-`PanelId` entry the eviction removes first. Because the code
   also keeps ceilings for disposed panels, dead entries can fill the table and
   push out a live one once the controller edge stops disposing the panel.

**Exploit sequence (once the record's same-`PanelId` rebind path exists, as
`A.1` and `C.2` require).**

1. Generation `N` is bound to panel `P` and holds `X = {panel.create}`. It ends;
   the edge writes `retained_ceilings[P] = X`.
2. `P` has the lowest `PanelId` in a long-lived window. Sixty-four other panels
   reach their edges; `retain_grant_ceiling` inserts the sixty-fifth and evicts
   `P`, because the table is full and `P` is the lowest key.
3. `N+1` binds `P`. `derive_rebind_grants` finds no ceiling and returns
   `requested = R = {panel.create, panel.focus, panel.overlay}`.
4. The successor ends the bind holding `Z = R`, including `panel.focus` and
   `panel.overlay` that `N` never held, with no consent prompt and no
   permission-diff record. That is the `T-25` authority carry-over the record
   exists to prevent.

The same hole appears one step earlier in the current tree:
`dispose_panel` retires the `PanelId`, so a reload's successor is a new panel
and `derive_rebind_grants` treats it as never bound. The code's own test asserts
this and calls it "the open `PGO-22` gap"
(`panel_grant_ceiling.rs:16-23`, `:191-205`). The record's `C.2` says controller
`Disposed` never cascades to panel `Disposed`; the code still disposes the
panel. The record says "No function performs it"; `derive_rebind_grants` and
`install_rebound_grants` do.

**Why it is blocking.** The record's B-4 closure depends on the lost-record
refusal and the drop-on-disposal rule. The merged code has neither, and its
own test records the resulting successor path as unbounded. A design gate that
says the mechanism does not exist while the tree contains a partial mechanism
with this gap cannot be the single reading an implementer builds to. The gap is
correctable in code before the rebind path is wired: add the last-controller
generation to `PanelRecord`, make phase 0 refuse on a previous controller with
no ceiling, drop the retained ceiling on panel disposal, and cap the table by
live panels rather than by the absolute maximum.

**Required correction.**

- Add the retained last-controller generation to `PanelRecord`, or an equivalent
  durable discriminator, and make `derive_rebind_grants` return an error when it
  is present and no ceiling exists. A function that takes only
  `(panel_id, requested, consented)` cannot implement `D.2` phase 0.
- Drop `retained_ceilings[panel_id]` in `dispose_panel`, as `A.2` says. If a
  disposed panel's ceiling is kept for an audit reason, state that reason and
  key it outside the bind path so it cannot be evicted into a live bind.
- Bind the table by the configured `max_panels_per_window` (or a stated
  absolute cap with an eviction rule that refuses rather than silently drops a
  live panel's ceiling). State what a bind does when its ceiling was evicted.
- Update the `Implementation status` and `Security review` sections to the
  current `origin/main` and record the measured PGO-22 gap instead of saying no
  mechanism exists.

### B-6 — `PGO-18` can pass with the B-4 hole open, and no row tests the empty tombstone in the derivation

**Where:** decision `PGO-18`, `PGO-7`, `PGO-22`, `PGO-23`; `D.1` and `D.2` phase 0.

**Finding.** `PGO-18`'s setup is:

> Run the bind after the predecessor's edge release, so only the tombstone holds
> its set. The successor's resolution drops two families the predecessor held.
> The bind succeeds without any consent prompt or prompt record; the two
> families are denied without a refusal record against the successor; the
> remaining intersection is granted from the tombstone. Fails for an
> implementation that reads only a live row and treats the reload's missing row
> as no ceiling […]

Let the predecessor hold `P = {A, B, C, D}` and the successor resolve
`R = {A, B}` after dropping `C` and `D`. The correct committed set is
`R ∩ P = {A, B}`. An implementation that never writes a tombstone, reads only
the live table, and treats the missing row as no ceiling grants `R = {A, B}`.
The two dropped families are absent from `R` under either implementation, no
consent is prompted under either, and no refusal record is emitted under either.
The observable grant set is identical. The row's "Fails for […] treats the
reload's missing row as no ceiling" is false for the row's own scenario. The
row can pass with the B-4 hole open.

The same test can be made discriminating in either of two ways:

- Make `R` contain a capability outside `P` (a widening). The correct bind
  grants only `R ∩ P` and denies the widening without consent; the no-ceiling
  implementation grants the widening and fails.
- Use an empty predecessor ceiling: a predecessor that bound and held nothing,
  with a non-empty `R`. The correct bind commits `∅`; the no-ceiling
  implementation commits `R` and fails. This is the empty-tombstone case
  `D.1` and `D.2` state, and no `PGO-` row currently exercises it. The code's
  `a_bound_predecessor_that_held_nothing_is_a_ceiling_of_emptiness`
  (`panel_grant_ceiling.rs:229-252`) does, but the decision's matrix does not.

`PGO-7` has the same weakness unless its test chooses a resolution wider than
the predecessor set. It says "the panel's grant set equals `(own resolution ∩
predecessor set) ∪ consented widening`" and "the predecessor set is the live row
in the first run and the tombstone in the second", but it does not name the
no-tombstone implementation or require a widening. Its "A non-empty predecessor
set never commits empty" catches an implementation that grants `∅`, not one
that grants `R`. `PGO-22` does better: its separate clause "a bind with a
predecessor expected but neither source present is refused" catches both the
no-tombstone and the read-only-live implementation, and its fail list names
"treating an empty or missing `P` as no ceiling". But its scenario is
`R = P = {panel.create, panel.focus}`, so the set assertion cannot discriminate
the no-ceiling implementation; the refusal clause is the only part that does.
`PGO-22` should state that clause as its own sub-case and add the empty-ceiling
case, rather than relying on a clause embedded in a row whose headline set is
equal to `R`.

`PGO-23` says "The tombstone written for each edge is dropped on workspace close
or panel disposal." No accessor is named for the tombstone (the row names
`unbind_release_count(PanelId)`, which is the release counter, not the ceiling),
and an implementation that never writes a tombstone passes the row's release
assertions because the clause "the tombstone written" has no antecedent. The
row's main job is the release, so this is not the ceiling's discriminator; it
should either name `retained_grant_ceiling(PanelId)` or drop the clause and let
`PGO-22` own the ceiling.

**Why it is blocking.** The review's closing rule is that a row closes a finding
only when an implementation with the defect fails it. `PGO-18` is a row the
record uses to prove the tombstone is read and the narrowing is applied; it
passes with the tombstone absent. The matrix can therefore be green while the
B-4 hole is open, which is exactly the failure the row was added to prevent.

**Required correction.**

- Rewrite `PGO-18` so its successor resolution contains a capability outside the
  predecessor set, and require that capability to be denied without consent; or
  use the empty-predecessor case and require the committed set to be empty.
- Name the no-tombstone and read-only-live implementations in `PGO-7` and
  require a widening in its second run.
- Split `PGO-22`'s "predecessor expected but neither source present" clause into
  a named sub-case and add the empty-ceiling case.
- Give `PGO-23` the retained-ceiling accessor or remove its tombstone-drop
  clause.

## Non-blocking findings

`N-6` to `N-11` were not addressed by this revision and stay open. `N-12` is
closed in text. Four are added. None gates the verdict.

| ID     | Status | Finding and expected disposition                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `N-6`  | Open   | `C.7` maps `Closed` to "container retained, controller still bound, content retained" but never says which of the six `PanelRecord` states holds that mapping, while the same rule states `Closed` "is not representable in `PanelRecord`". State the state, or state that the mapping is refused until the RFC amendment admits `Closed`. Unchanged by this revision.                                                                   |
| `N-7`  | Open   | `E.1` increments a counter keyed `(PanelId, controller generation, reason)` and `A.2` now specifies a per-panel release counter keyed by the most recently ended generation with its own accessor. Two key shapes describe one panel's lifecycle in two sections. Key them consistently, or name them distinctly in the diagnostic surface.                                                                                              |
| `N-8`  | Open   | The controller generation is "masked […] to 30 bits" for handle minting while `HostPanel.epoch` and the binding hold the unmasked `u32` (`crates/bitty-runtime/src/scene_host.rs:109`, `services.rs:1063`). The open point covers saturation but not the collision: two epochs 2^30 apart mint the same handle epoch. State that the binding compares the unmasked value and that no path compares a minted handle's epoch to a binding. |
| `N-9`  | Open   | `C.9` requires one FS-4-style record per disposed panel "with owner, controller generation, reason `quit`", but a workspace full of unbound placeholders has no controller generation to name. Say what the record carries then. Unchanged by this revision.                                                                                                                                                                             |
| `N-10` | Open   | `A.2` releases "the panel commands `N` registered", but the command registry keys commands by `PanelId` only — `CommandRegistry::unregister_panel(panel_id)` removes every command for the panel (`crates/bitty-ui/src/panel.rs:622`, `per_panel: HashMap<PanelId, Vec<String>>` at `:571`) — and `D.4` has no commands row. State that the purge is panel-wide and why that is safe at the edge, and add the row.                       |
| `N-11` | Open   | A failed edge release "leaves the panel unbound and refuses every verb", with no stated exit. Unlike the failed-bind branch there is no retry trigger at the edge, and "never a re-bind of `N`" does not say whether `N+1` may bind afterwards. State the recovery path, or that the panel is terminal until the user closes it. Unchanged by this revision.                                                                             |
| `N-12` | Closed | `A.2` now states the release counter's key (per panel, naming the most recently ended generation), its retention (replaced at the panel's next edge, dropped on workspace close or panel disposal), and its accessor (`unbind_release_count(PanelId)`); `PGO-23` reads it. The accessor does not exist in code yet, which is required work, not a text gap.                                                                              |
| `N-13` | New    | The tombstone key is `(PanelId, ended controller generation)` while the binding is `(owner, controller generation)`. Cross-plugin adoption is undecided (Decision B item 6), and two owners with the same generation number could supply a wider ceiling than the actual predecessor held. Key the tombstone by the same pair as the binding, or state that only same-owner rebinds are in scope.                                        |
| `N-14` | New    | The record caps the tombstone table at "the registry's `max_panels_per_window`"; the merged code uses `MAX_RETAINED_GRANT_CEILINGS = 64`, which is the maximum allowed value while the default is `32`, and it keeps ceilings for disposed panels. Use the configured cap and the drop-on-disposal rule, or state the absolute cap.                                                                                                      |
| `N-15` | New    | A failed tombstone write leaves the live row in place and the panel unbound; `A.2` says a later bind refuses, but `D.2` phase 0's source rule has no case for "live row exists, predecessor ended, no tombstone". State which reading phase 0 implements. Both safe readings preserve the ceiling; the gap is that the text does not choose one.                                                                                         |
| `N-16` | New    | A displaced predecessor that ends after its successor bound can write a tombstone for an older generation, replacing the current one. The generation check in `D.2` refuses a mismatched tombstone, so the outcome is fail-closed, but the record should say that the edge of a displaced generation either writes nothing or cannot replace the current controller's tombstone.                                                         |

## What this verdict does and does not authorize

**It does.**

- Record that `B-4` is closed in text: the tombstone is written before the
  delete, `C.5` orders the edge before the successor activates, `D.2` phase 0
  reads the live row or the tombstone with the live row winning, and the
  empty-vs-missing rule separates a real empty ceiling from a lost record.
- Record that `G-3`'s four required changes are still present in text and that
  `G-3` remains contingent on `B-2`.
- Record that `N-12` is closed in text and that the new non-blocking findings are
  carried.

**It does not.**

- Accept the decision, approve it, or move it out of `status: draft`. This
  review does not edit the decision record and has no authority over its status;
  owner acceptance is a separate act by the owning repository.
- Promote anything to **Verified** or **Compatible**, or treat any sentence in
  the record as a description of shipped behaviour. The merged code is partial
  and its own test records the `PGO-22` gap.
- Authorize implementation of the rebind mechanism, the grant re-key, the
  unbind release, the workspace resolution, or the `PGO-` matrix. `B-2`, `B-5`,
  and `B-6` are defects in the design gate and its implementation status; until
  they are corrected the mechanism cannot be built to a single reading.
- Authorize the RFC-amendment wave in the verification plan, a dependent
  implementation issue, or a change to any accepted contract. No `P0`
  acceptance criterion is modified by this review.
- Certify that the matrix is sufficient. `PGO-22`'s refusal clause is the right
  shape, but `PGO-18` can pass with the hole open and the empty-ceiling case is
  not in the matrix.
- Treat `N-6` to `N-11` or `N-13` to `N-16` as accepted risk. They are carried
  obligations; the first six were already carried by earlier rounds.

**Boundaries.** The record's status boundary itself holds: the frontmatter is
`status: draft`, nothing is promoted to **Verified** or **Compatible**, no
accepted text is changed, and no shipped behaviour is claimed. The drift is
factual, not a status flip. Three present-tense negative claims are false at
`cec83552`: "No `WorkspaceId` is reachable from `Runtime`" (`Implementation
status`), "No function performs it" (`D.1`), and "no unbind release or
retired-ceiling tombstone exists" (`Security review` item 7). The `Document
status` phrase "the generation edge now writes a bounded retired-ceiling
tombstone" is a design tense about a mechanism that is not fully implemented;
it should read "this record requires the edge to write" until the mechanism is
conformant. These are `B-2` and `B-5`, not a promotion claim.

## Code claims re-verified

Read from `bitty` `origin/main` at `cec83552` and, where the record pins it,
`7ac871d4`. `Confirmed` means the amended sentence matches the code at
`cec83552`. `Wrong` means the cited identifier or fact does not exist or is
contradicted. `Not present` means the mechanism the sentence assumes is absent.

| ID   | Amended claim                                                                            | Evidence at `cec83552`                                                                                                                                                                                        | Result                                            |
| ---- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| C-1  | `Runtime::focused_view()` exists at the cited path                                       | `crates/bitty-runtime/src/runtime/layout_focus.rs:3048`, returns `Option<ViewId>`                                                                                                                             | Confirmed                                         |
| C-2  | `WorkspaceSlot` carries no `WorkspaceId`                                                 | `crates/bitty-runtime/src/runtime/workspaces.rs:75` `pub id: WorkspaceId` (true at `7ac871d4`)                                                                                                                | Wrong                                             |
| C-3  | `WorkspaceId` is minted only by `TerminalRegistry::create_workspace`                     | `Runtime::mint_workspace_id` at `workspaces.rs:282`; `TerminalRegistry::create_workspace` at `terminal.rs:336` still mints from its own counter                                                               | Wrong                                             |
| C-4  | `TerminalRegistry::active_workspace` / `set_active_workspace` have no production callers | `terminal.rs:393`, `:402`; only `registry/tests.rs:608`, `:616`                                                                                                                                               | Confirmed                                         |
| C-5  | No `WorkspaceId` is reachable from `Runtime`                                             | `Runtime::active_workspace_id` at `workspaces.rs:251`, `Runtime::focused_workspace_id` at `:268`                                                                                                              | Wrong                                             |
| C-6  | The create seam has no workspace identity                                                | `focused_workspace_id` exists but has no production caller; `startup_panel_create_backend` still calls `create_panel(parsed, None)` at `crates/bitty-terminal/src/plugin_runtime.rs:471`                      | Confirmed for the backend, wrong for the accessor |
| C-7  | `E_UI_UNAVAILABLE` is a real error the create path can return                            | Constant at `crates/bitty-lua/src/host.rs:928`; scene host alias at `scene_host.rs:82`; create backend maps to `E_DEF_INVALID`/`E_DEF_LIMIT`/`E_NOT_IMPLEMENTED`; `PanelError` has no variant (`panel.rs:73`) | Not present on the create path                    |
| C-8  | No function performs the grant derivation                                                | `PanelRegistry::derive_rebind_grants` at `panel.rs:1641`; `install_rebound_grants` at `:1671`                                                                                                                 | Wrong                                             |
| C-9  | No unbind release or retired-ceiling tombstone exists                                    | `RetainedGrantCeiling`, `retained_ceilings`, `release_generation_scope` at `panel.rs:836-890`, `:1567`                                                                                                        | Wrong                                             |
| C-10 | The tombstone is dropped on panel disposal                                               | `dispose_panel` (`panel.rs:1288`) removes the panel record but not `retained_ceilings`; `panel_grant_ceiling.rs:159-206` asserts the ceiling survives                                                         | Wrong                                             |
| C-11 | The tombstone table is capped at `max_panels_per_window`                                 | `MAX_RETAINED_GRANT_CEILINGS = 64` (`panel.rs:836`); default `max_panels_per_window` is `32` (`:43-45`)                                                                                                       | Wrong                                             |
| C-12 | A previous controller with no live row and no tombstone refuses the bind                 | `derive_rebind_grants` returns `requested.clone()` on a missing ceiling (`panel.rs:1641-1656`); `PanelRecord` has no last-controller field (`:287-295`)                                                       | Not present                                       |
| C-13 | `unbind_release_count(PanelId)` is the required accessor                                 | No such accessor in the tree                                                                                                                                                                                  | Not present                                       |
| C-14 | `PanelRecord` has no controller, binding, or last-controller field                       | `panel.rs:287-295` carries `id`, `generation`, `state`, `panel_type`, `workspace`, `view`, `title`                                                                                                            | Confirmed                                         |
| C-15 | The merged code's own test records the `PGO-22` reload gap                               | `crates/bitty-runtime/tests/panel_grant_ceiling.rs:16-23` and `:191-205`, "gap: a real successor is granted all of R because no path binds the retained identity"                                             | Confirmed                                         |

## Residual risk carried to the implementation

The residuals the decision states remain accepted and are unchanged by this
revision: no persisted encoding for the restore key; the `terminal`-slot scene
panel stays generation-scoped and is excluded by `A.6`; cross-plugin claim of a
persisted panel is undecided; the activation counter saturates rather than
failing closed; and two behaviours still ship and both must move — the scene
path disposes its container at every generation boundary, and
`bitty.panel.create` panels carry no binding and survive a reload with whatever
grants they had.

`B-2`, `B-5`, and `B-6` are not residuals and must not be carried as accepted
risk. `B-2` is a present-tense factual error in a security decision record that
now points at the wrong id owner. `B-5` is a security-sensitive gap in the only
merged implementation of the record's central mechanism. `B-6` is the test
wiring that would otherwise let the gap ship green.

## Evidence register

| Item  | Verdict                      | Evidence                                                                                                                                                                                                                   |
| ----- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `G-1` | Closed (round 2)             | `D.1` formula and precedence, unchanged by this revision                                                                                                                                                                   |
| `G-2` | Closed (round 2)             | `D.2` ordered invalidation, fail-closed branch, typed refusals; the phase structure survives this revision with phase 0 extended                                                                                           |
| `G-3` | Complete in text, contingent | `A.7`, `A.4`, `A.8`, and the workspace-membership implementation row; the assignment's identity step is `B-2`                                                                                                              |
| `G-4` | Closed (round 2)             | `A.6` scope rule and the scene-panel rows, untouched                                                                                                                                                                       |
| `G-5` | Closed (round 2)             | Plugin-scoped teardown correction, `D.4` family table, rejected `drop_plugin` reuse                                                                                                                                        |
| `G-6` | Closed (round 2)             | `B.4` to `B.6` of Decision B, `PGO-12`, open points, untouched                                                                                                                                                             |
| `G-7` | Closed (round 2)             | `C.8`, `C.9`, `PGO-21`, untouched                                                                                                                                                                                          |
| `G-8` | Closed (round 2)             | `PGO-7`, `PGO-15`, `PGO-16`; the matrix count is twenty-three                                                                                                                                                              |
| `B-1` | Closed                       | `D.2` phase 0 with its failure branch, phase 2 steps 1 to 3, the failed-install branch, `PGO-22`, extended `PGO-7`                                                                                                         |
| `B-2` | Open                         | `A.7` against C-2, C-3, C-5, C-6, C-7: the tree now has a slot id and a resolver, the record says it does not, and the create path still passes `None`                                                                     |
| `B-3` | Closed                       | `A.2` edge release with the four families and the before-placeholder order, `C.2`/`C.3` routed through it, `D.4` rows, `PGO-23`, and the third review's C-11 queue accessor                                                |
| `B-4` | Closed in text               | `A.2` tombstone before delete, `C.5` edge-before-activation, `D.2` phase 0 live-or-tombstone with live winning, `D.1` empty-vs-absent, phase 2 step 3 drop; the six cases in the table above                               |
| `B-5` | New blocking                 | `derive_rebind_grants` missing-ceiling branch, `dispose_panel` retention, `MAX_RETAINED_GRANT_CEILINGS = 64` eviction, and `panel_grant_ceiling.rs:159-206`; the record's `Implementation status` says none of this exists |
| `B-6` | New blocking                 | `PGO-18`'s `R ⊆ P` setup, `PGO-7`'s missing widening, `PGO-22`'s set assertion with `R = P`, and `PGO-23`'s accessor-less tombstone clause                                                                                 |

## Verification obligations that survive this review

- **Create-path wiring.** Make `bitty.panel.create` call
  `Runtime::focused_workspace_id()`, pass the resolved id to `create_panel`, and
  return `E_UI_UNAVAILABLE` with no record and no slot charge when it is `None`.
  Assert the production backend never calls `create_panel(_, None)`, not only
  that the resolver returns the right id.
- **One id space.** Resolve two creates from the same presented workspace and
  assert that the id recorded on the panel is the id the workspace registry uses
  for that workspace — same bucket in `workspace_panels`, same PR-1 counter —
  and that `focus_panel` with the registry's id succeeds. If the runtime and the
  terminal registry are two counters, state which one is authoritative and what
  a disagreement does.
- **Missing ceiling.** Create a panel whose record names a previous controller
  but whose retained ceiling is absent; require the bind to refuse rather than
  grant `R`. This is the test the merged code does not have and the `PGO-22`
  "neither source present" clause describes.
- **Eviction.** Fill the retained table past its cap with live, unbound panels;
  assert a live panel's ceiling is never evicted, or that a bind whose ceiling
  was evicted refuses. The code's "a dropped entry can only name a panel no
  live record can bind" will be false once the edge keeps the panel record and
  must not be the test's premise.
- **Empty ceiling.** Bind a successor with a non-empty resolution against a
  predecessor that held nothing; require the committed set to be empty. This is
  the `D.1`/`D.2` empty-tombstone rule, and no `PGO-` row currently tests it.
- **PGO-18 discrimination.** Run the row against an implementation that never
  writes a tombstone and reads only the live table; it must fail. The current
  setup cannot fail it.
- **Error mapping.** Name the `BridgeError` class for `E_UI_UNAVAILABLE` in the
  create path and assert the code, not a message string.

## Limitations of this review

- Read-only and static: no build, no test execution, no dynamic analysis in
  `bitty`. Every code statement is a text observation at `cec83552` and
  `58d524c8`; line numbers drift, and the file path is the durable citation.
- The decision is judged as a diff against `3f3fb2c`; unchanged sentences are
  credited from the earlier reviews rather than re-argued. `G-1`, `G-2`, `G-4`
  to `G-8`, `B-1`, and `B-3` are not reopened.
- `B-4` is judged as a design text. The implementation gap in `B-5` is reported
  separately and is not used to reopen the text-level closure.
- The reviewer cannot judge whether the focused leaf of the presented workspace
  is the right product rule for a `panel.create` with no target; that is a
  product question. `B-2` judges only that the rule's output exists, is owned,
  and is wired.
- The persistence contract behind `RFC-OQ-9` stays out of scope, so the
  index-to-`WorkspaceId` resolution is judged as a create-path requirement, not
  as a restore design.
- No threat-model row was added or amended by this review; `T-25` is used as the
  requirement it is, and this review claims no implemented defense.

## References

- [Panel Generation Ownership Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-generation-ownership-decision.md)
  — the reviewed draft at `d1731a00`.
- [Panel generation ownership third review](panel-generation-ownership-third-review.md)
  — round 3, the origin of `B-2` and `B-4` and the `N-10` to `N-12` findings.
- [Panel generation ownership re-review](panel-generation-ownership-rereview.md)
  — round 2, the origin of `B-1` to `B-3` and `N-6` to `N-9`.
- [Panel generation ownership review](panel-generation-ownership-review.md) —
  round 1, the origin of `G-1` to `G-8` and `N-1` to `N-5`.
- [`bitty-terminal-docs` PR #383](https://github.com/bitty-terminal/bitty-terminal-docs/pull/383)
  — the amendment reviewed here, and the claims it makes about itself.
- [`bitty` commit `58d524c8`](https://github.com/bitty-terminal/bitty/commit/58d524c8249944d445ede33d0c3312997073b9e2)
  — the merged workspace-identity and retained-ceiling implementation this
  review read at `origin/main` `cec83552`.
- [Threat model](threat-model.md) — row `T-25`, authority carry-over across a
  panel generation boundary.
- [Security overview](overview.md) — invariants 2, 3, 4, and 7.
- [P0 acceptance criteria](p0-acceptance-criteria.md) — the rebind-authority
  evidence row this decision serves, unchanged by this review.
- Issue [`bitty#2476`](https://github.com/bitty-terminal/bitty/issues/2476) —
  the design gate this review answers.
