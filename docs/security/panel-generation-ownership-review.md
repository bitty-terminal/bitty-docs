---
title: Panel Generation Ownership Security Review
description: Independent security review of the draft panel generation ownership decision, with per-point verdicts, code-verified claims, and blocking contract corrections
category: security
audience: security-reviewer
document_type: research
status: draft
website_publish: false
sidebar_order: 47
---

# Panel Generation Ownership Security Review

## Review status

**Recommendation: not accepted yet (`NEEDS-FIX`).** Eight blocking gaps remain.
Two of them change what authority survives a plugin generation boundary, three
are factual errors about the current code, and three make a decided outcome
unimplementable or untested. The ownership direction itself is sound and
survives review; the record is not yet a contract an implementer can enforce.

| Item               | Value                                                                                                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reviewed document  | [Panel Generation Ownership Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-generation-ownership-decision.md), `draft` |
| Reviewed revision  | `bitty-terminal-docs` `861ea4d`, decision text as merged at `634d181`                                                                                                 |
| Parents reconciled | Panel Runtime RFC, Workspace Compositor Specification, Panel Placement Decision, Plugin Host Runtime RFC, Isolation Resource RFC, Chrome Surface Contract (candidate) |
| Code evidence      | `bitty` `origin/main` at `7ac871d4`, read-only; no checkout, no build, no test run                                                                                    |
| Threat model       | `docs/security/threat-model.md` in this repository at `9e214c9`                                                                                                       |
| Review date        | 2026-11-03                                                                                                                                                            |
| Reviewer role      | Independent security reviewer; no authorship of the reviewed decision or of the code it cites                                                                         |
| Gate               | This repository's documentation gate (format, links, metadata, language, hygiene, cross-repo links, state, actionlint)                                                |
| Outcome            | Reviewed status stays `draft`; the verdict withholds acceptance until `G-1` through `G-8` are corrected                                                               |

The reviewer did not write, edit, or implement any part of the reviewed document
or of `bitty`. The decision's own `P0 Review Sign-off` section requires a
security reviewer to confirm the no-inheritance rule, the placeholder path, and
the containment claim for the rebind tests before status can move from draft.
This record performs that review and does not sign off.

## Scope and method

This is a design review of the ownership split, identity survival, lifecycle
mapping, rebind authority, bounded recovery, and test matrix. It judges whether
the record is complete enough to become an enforceable contract, not whether
panels should outlive plugin generations; the latter is a product decision the
record already argues and this review accepts as given.

Method:

1. Read the decision end to end, then re-read each section against the accepted
   parent it cites, so a claim is judged against its owning contract rather than
   against a general expectation.
2. Re-derive every code claim in the `Implementation status` table from `bitty`
   at `origin/main` (`7ac871d4`), because the table pins a different revision
   (`a168b197`) and the record is otherwise its own evidence.
3. Treat each rejected alternative and each "nothing states" bullet as an attack
   surface: the risk is a decided rule that is contradicted three sections
   later, or a rule whose enforcement point does not exist.
4. Check every named enforcement point against code to establish whether it is
   missing, present under another name, or present and contradicted.
5. Record each finding with the section it lands in and the contract change it
   needs, so a revision can be re-reviewed by diff rather than re-read.

Out of scope, and deliberately not judged: panel placement and the `View` versus
`PanelId` encoding, the non-terminal content scene path, the persistence
contract behind `RFC-OQ-9` (including whether restart restore ships), the
Panel Runtime RFC's lifecycle and focus rules, overlay geometry, accessibility
semantics of the placeholder, and any performance claim. This review is not a
code audit, a fuzz, or a penetration test: there is no rebind code to audit, and
the relevant code was read as text only.

## Decided points and verdict

Each row is a point the decision states as decided. `Pass` means the rule is
complete enough to enforce and consistent with its parent. `Gap` means the rule
is contradicted, unimplementable, or rests on a code claim that does not hold.

| ID  | Decided point                                                                                         | Verdict | Basis                                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P-1 | Panel container is workspace-owned and persistent; generation disposal never disposes or re-mints it  | Gap     | The creation path this decision governs allocates with `workspace: None`; the scene path disposes the container on release                             |
| P-2 | Panel content and controller binding are generation-owned and ephemeral                               | Pass    | Coherent direction; no code contradicts it, and the content half is already assumed by the GUI content candidate                                       |
| P-3 | `PanelId` survives a plugin reload and is never re-minted                                             | Pass    | No code path re-mints a panel on reload; today it survives by omission                                                                                 |
| P-4 | Restore key is `(WorkspaceId, PersistentId)` with a fresh `PanelId`; a `PanelId` is not a restore key | Gap     | The persisted record carries `PanelId`, a workspace index, and a title only; no `PersistentId`, owner, or manifest key                                 |
| P-5 | A rebound panel inherits nothing across grants, capture, overlay, scrollback, queues, and focus       | Gap     | The grant rule simultaneously requires intersection and carry-forward, which is inheritance; three of the six families have no ownership key to revoke |
| P-6 | Grant invalidation at the binding boundary is the named missing enforcement point                     | Gap     | The point is named but not specified, and an existing owner/generation binding with different teardown is not mentioned                                |
| P-7 | Bounded recovery has exactly three outcomes, a closed reason vocabulary, and no respawn loop          | Gap     | `Drop` is unreachable for focused panels under the transition table the record cites, and the reason set is not aligned as claimed                     |
| P-8 | A 14-row headless test matrix (`PGO-1`..`PGO-14`) proves the decision                                 | Gap     | All 14 rows exist and are well formed, but none covers the two questions the security section calls reviewable                                         |

## Code claims verified at origin/main

Every row was read from `bitty` `origin/main` at `7ac871d4`. `Confirmed` means
the record's sentence matches the code. `Corrected` means the sentence is wrong
or materially incomplete. `Omitted` means a relevant mechanism exists and the
record does not mention it.

| ID   | Record's claim                                                                                              | Evidence at `7ac871d4`                                                                                                                                                                          | Result                                                     |
| ---- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| C-1  | `PanelRecord` carries no owner, plugin, provider, or binding field                                          | `crates/bitty-runtime/src/registry/panel.rs:283-292` — fields are `id`, `generation`, `state`, `panel_type`, `workspace`, `view`, `title`                                                       | Confirmed                                                  |
| C-2  | `PanelCreateHandler` receives only a type string                                                            | `crates/bitty-runtime/src/plugin_runtime/services.rs:798`; production backend `crates/bitty-terminal/src/plugin_runtime.rs:451-487`                                                             | Confirmed                                                  |
| C-3  | Every generation allocates into the same process-owned table                                                | `crates/bitty-terminal/src/plugin_runtime.rs:785` shares one `Rc<RefCell<PanelRuntime>>`; but line 471 calls `create_panel(parsed, None)`                                                       | Confirmed, with a consequence the record omits (see `G-3`) |
| C-4  | `dispose_panel` is the only path that clears panel grants                                                   | `panel.rs:1288-1290` clears commands, bus queues, and `capabilities.remove(&(panel_id, generation))`; the only other clear is whole-registry `dispose()` at `1522`                              | Confirmed                                                  |
| C-5  | `drop_plugin(plugin_id)` purges one generation's tickets and in-flight requests                             | `crates/bitty-runtime/src/plugin_runtime/component_requests.rs:372-392` — keyed on `plugin_id` only; tickets are `(plugin_id, ticket)`; no generation key exists                                | Corrected                                                  |
| C-6  | `panel_state.rs` adds a seventh `Closed` state, and `can_transition` has no `Created`/`Focused -> Disposed` | `crates/bitty-ui/src/panel_state.rs:136-137`, `145-163`; registry `PanelState` has six variants (`crates/bitty-ui/src/panel.rs:78-92`)                                                          | Confirmed                                                  |
| C-7  | `panel_persist.rs` defaults to `PersistencePolicy::Ephemeral`                                               | `crates/bitty-ui/src/panel_persist.rs:68-85` is a two-variant enum with no `Default` impl and no production selector; `164-172` records `PanelId`, workspace index, title                       | Partly confirmed                                           |
| C-8  | The controller binding is absent today                                                                      | `crates/bitty-runtime/src/scene_host.rs:158-163` records `HostPanel { handle, view, owner, epoch }`; `372-441` refuses another generation; `342-350` and `444-462` dispose the panel on release | Corrected                                                  |
| C-9  | No panel state records who may drive it                                                                     | `crates/bitty-runtime/src/registry/host.rs:127`, `272-280`; `crates/bitty-runtime/src/registry/lease.rs:250-426`; write gate `crates/bitty-runtime/src/runtime/submit_host.rs:103`              | Omitted                                                    |
| C-10 | Reload disposes generation `N` before `N+1` activates                                                       | `crates/bitty-plugin-host/src/lifecycle.rs:473`                                                                                                                                                 | Confirmed                                                  |

## Findings by decided point

### P-1 — workspace ownership is not established by the governed path: gap

The decision's central claim is that the container belongs to its workspace, and
that a rebind preserves attachment, presentation mode, workspace membership, and
title. For the path the decision is about — a plugin calling `bitty.panel.create`
— the record has no workspace to preserve: the production backend calls
`create_panel(parsed, None)` (`crates/bitty-terminal/src/plugin_runtime.rs:471`),
so `PanelRecord.workspace` is `None`, the panel is never inserted into
`workspace_panels`, the focus MRU never learns about it, and the `PR-1`
per-workspace budget is never charged. The scene path is the same:
`scene_host.rs:413` also creates with `None`.

The consequence is not cosmetic. A container with no workspace cannot satisfy
`Decision A.4` (rebind preserves workspace membership), cannot be attributed in
an FS-P3 record, and cannot be counted against the bound the record invokes to
argue that rebind is free. The record is deciding ownership of an object whose
owner is unset at creation.

### P-2 — the content half is coherent: pass

Content is the part the record gets right and the parents already assume: the
GUI content candidate treats a content handle as generation-owned and restores
the terminal surface with a closed release reason, and the Panel Runtime RFC
keeps PTY descriptors with the terminal registry. Nothing in code contradicts
the split, and no claim of shipped content handoff is made. This passes at the
design level.

### P-3 — identity survival is stated, and today is accidental: pass

`PanelId` is not re-minted by any reload path because no reload path addresses
panels at all; `panel.rs:982-1044` mints an id only on `create_panel`, and
nothing calls that on a generation change. The rule is therefore consistent with
code but is currently true by omission, not by design. That distinction matters
for the review and is exactly why `P-5` fails: the same omission is what lets a
successor inherit authority.

### P-4 — the restore key is not representable: gap

`Decision B.4` fixes the restore key as `(WorkspaceId, PersistentId)`, with the
persisted record also carrying the providing `owner.name` and the
manifest-declared panel key, and explicitly rejects persisting a `PanelId`.
The only panel persistence structure in code is
`PersistedPanel { id: PanelId, workspace: u32, title: String }`
(`crates/bitty-ui/src/panel_persist.rs:164-172`). It carries no `PersistentId`,
no owner name, and no manifest key, and its `StableIdentity` policy exists
precisely to reuse the persisted `PanelId` — the alternative the record rejects.
`plan_restore` sorts by that id (`panel_persist.rs:349-360`).

So the decided restore key has no encoding, while the code's only identity
persistence mechanism contradicts the decision. That is acceptable for a draft
only if the record says so; it currently presents the key as decided and the
`Ephemeral` default as standing, without naming the contradicting policy.

`Decision B.4` also decides that a different plugin may claim a persisted panel
"only through explicit user consent", while `Open points` lists "whether a
different plugin may ever claim a persisted panel, and under what consent
surface" as open. One of those sentences must move.

### P-5 — the no-inheritance rule contradicts itself: gap

`Decision D` opens with "a rebound panel inherits nothing", then requires that
"the intersection is recomputed rather than inherited" and that "A narrowed set
carries forward per the reload contract". An intersection needs the
predecessor's set, and carrying a narrowed set forward is inheritance by
definition. The three statements cannot all hold, and the enforcement point is
the one place where the ambiguity is security-relevant: an implementer can read
`inherits nothing`, `intersection`, or `carry forward` and produce three
different grant tables.

Three of the six families the rule names also have no ownership key to revoke
against. Bus queues are keyed `(PanelId, topic)` (`panel.rs:817-821`), commands
by panel, and overlays by window with no panel or plugin owner at all — `Overlay`
carries `id`, `kind`, `bounds`, `text`, `tooltip`, `generation`, `truncated`
(`crates/bitty-ui/src/panel.rs:240-248`), and `overlay_manager.clear()` runs only
in whole-registry disposal (`panel.rs:1519`). `dispose_panel` does not touch
overlays. "Overlay ownership is released with the generation" is therefore not
expressible until overlays gain an owner, and the record does not say so.

### P-6 — the enforcement point is named but not specified: gap

The record correctly identifies grant invalidation at the binding boundary as
missing. It does not state the order of operations, the failure mode, or the
in-flight rule. Three concrete questions are left to the implementer:

- Does invalidation complete before the successor may issue any panel verb, or
  may it act while invalidation is pending?
- What happens to a verb already past the binding check that holds a panel
  reference across a yield, a callback boundary, or a queue drain?
- If invalidation cannot be completed (registry busy, generation exhausted,
  binding absent), does the bind fail closed with the panel left unbound, or
  does it proceed?

Without those answers the rule cannot be tested, and a plausible implementation
— check at entry, act later — reintroduces the confused-deputy window the record
claims to close in its `Security review` item 2.

The record also does not mention the mechanism it will collide with. `PanelRuntime`
already holds a per-panel lease table (`host.rs:127`, inserted at `272-280`)
whose kernel gates panel writes through `check_write`
(`lease.rs:406-426`, called from `submit_host.rs:103`) and whose threat-model
entry states it "records who may drive a panel". It is explicitly a UX metaphor
with an opaque `u64` holder and no generation dimension. It is not a security
fence, but it is the same slot, and a second binding that does not say how it
relates to the lease will produce two overlapping drivers.

### P-7 — one of the three outcomes is unreachable, and the reason set is overstated: gap

`Decision E` offers `Drop` when "the user closes the panel, closes the
workspace, or accepts an explicit 'discard panels of this plugin' action", and
routes it through "the normal path". The transition table the record itself
cites has no `Focused -> Disposed` and no `Created -> Disposed`
(`panel_state.rs:145-163`), and the record defers those transitions to an open
point. A workspace close with a focused panel is the ordinary case, not an edge
case, so the decided outcome cannot execute for exactly the state most likely to
be open.

The reason vocabulary is also not "aligned with the release reasons the GUI
content path already uses" as claimed: that set is `dismissed`, `closed`,
`quit`, `suspended`, `reloaded`, `disabled`, `crashed`, `unloaded`, while this
record omits `dismissed`, `closed`, and `quit` and adds `denied` and
`incompatible`. A superset with a stated mapping would be fine; an "aligned"
claim that neither matches nor maps will split diagnostics across two
vocabularies.

### P-8 — the matrix is well formed but misses the security questions: gap

All fourteen rows exist, are uniquely identified, and each names a headless
assertion. The count is correct, and the rows are unusually specific. But the
`Security review` names two reviewable questions — grant invalidation at the
binding boundary, and that a displaced generation cannot observe a successor's
content or results — and the matrix proves neither:

- `PGO-7` asserts that `N+1` starts empty, not that `N` is denied after the
  rebind. A handle `N` still holds is the attack.
- No row asserts that capture handles, overlay attribution, or queued events are
  observably revoked rather than merely "not inherited".
- No row covers a failed invalidation, so the fail-closed branch is untested.

## Blocking gaps

### G-1 — The grant rule contains two mutually exclusive derivations

`Decision D.1` says a rebound panel inherits nothing, recomputes an
intersection, and carries a narrowed set forward. These are three different
algorithms with three different security properties. The requirement is one
derivation with a stated precedence.

Required contract change:

- Replace the paragraph with a single rule of the form: the successor's panel
  grant set is the set its own manifest resolution and consent produce, bounded
  above by the predecessor's panel-scoped set; no capability absent from the
  successor's resolution survives a rebind; a capability present in the
  successor's resolution but absent from the predecessor's requires
  permission-diff consent.
- State that the predecessor's set is a ceiling, never a source, and that a
  narrowing never needs new consent.
- Delete or restate "inherits nothing" as "inherits no authority it did not
  itself obtain", so the headline and the rule agree.
- Name the function or boundary that performs the derivation and the state it
  reads.

### G-2 — The binding fence has no ordering, atomicity, or in-flight rule

"Grant invalidation at the binding boundary" is named as the enforcement point
but not specified, so it cannot be implemented or tested, and an entry-check-only
implementation leaves the confused-deputy window open.

Required contract change:

- State that a bind is two-phase: invalidate the predecessor's grants, capture
  handles, overlay attribution, and queue occupancy; commit the new binding;
  only then permit the successor's first panel verb.
- Require every panel verb to revalidate the binding at use, not only at entry,
  and forbid holding a panel reference across a yield, callback, or queue drain
  without revalidation.
- Require in-flight verbs at unbind to be cancelled with a typed refusal, and
  require the refusal class to be named in the failure table rather than
  borrowed from `StaleHandle`.
- Require a failed invalidation to refuse the bind and leave the panel unbound,
  with one FS-4-style record naming the old generation, the new generation, and
  the invalidated set. No partial bind.

### G-3 — Workspace ownership is not established by the governed creation path

Plugin-created panels allocate with `workspace: None`
(`crates/bitty-terminal/src/plugin_runtime.rs:471`), so the container has no
workspace membership to preserve, no focus MRU attribution, and no `PR-1`
accounting. The same is true of the scene path (`scene_host.rs:413`).

Required contract change:

- State when workspace membership is assigned — at creation or at mount — and
  require the panel record to carry it from that point.
- Require rebind to preserve the recorded workspace, and require an unbound
  placeholder to remain attributed to it.
- Define `PR-1`/`PR-2` accounting for a `Created` panel that is not yet mounted,
  including whether a rebind of an unbound panel charges a slot.
- Add an implementation-status row for the `workspace: None` allocation, so the
  gap is visible rather than implied.

### G-4 — The existing scene-panel binding contradicts Decision A and is absent from the record

`HostPanel { handle, view, owner, epoch }` (`scene_host.rs:158-163`) is a
controller binding by another name: `owner` is the plugin id and `epoch` is the
plugin generation (`ui_epoch` is set from `entry.generation` at
`plugin_runtime/mod.rs:3152`). `ensure_panel` refuses a different owner or epoch
(`372-401`), which is the conflict rule `PGO-8` asks for. But `release_owner`
(`342-350`) calls `release_panel` (`444-462`), which **disposes the panel**, and
`clear_ui_blocks` calls it on suspend, dispose, and reload
(`services.rs:3155-3166`; `mod.rs:3323`, `3441`, `4430`). Detaching the last
scene also disposes it (`scene_host.rs:319-339`).

So the behaviour the record rejects as "generation-owned ephemeral panels" is
the shipped behaviour for scene panels, and the record's claim that "the
distinction exists in no code path" and that "no code path observes" a
generation change are both wrong. One decision now has two different
pre-existing behaviours to reconcile.

Required contract change:

- Add an implementation-status row for the scene-panel binding, its conflict
  refusal, and its dispose-on-release behaviour.
- Decide explicitly whether `Decision A` applies to scene panels. If it does,
  require `release_panel` and `detach` to stop disposing the container and to
  leave it unbound with the placeholder; if it does not, state the exclusion and
  say which `PGO` rows cover which path.
- State the relationship between `epoch: u32` and `Generation`, or unify them;
  two generation counters for one fence is how a stale handle becomes valid.
- Cite `ensure_panel`'s refusal as the precedent `PGO-8` should extend, rather
  than presenting the conflict rule as new.

### G-5 — `drop_plugin` is not generation-scoped, so the teardown precedent does not exist

The record says `drop_plugin(plugin_id)` "purges one generation's component
tickets and cancels its in-flight requests". It keys on `plugin_id` only:
submissions and in-flight entries carry no generation, tickets are
`(plugin_id, ticket)`, and the retain filters compare the plugin id
(`component_requests.rs:372-392`). It is plugin-scoped. The Isolation Resource
RFC's attribution rule is per `(PluginId, generation)`, so this is also a
pre-existing inconsistency the record inherits silently.

Required contract change:

- Correct the implementation-status row to say plugin-scoped.
- Require the panel teardown to be keyed by `(PanelId, controller generation)`
  and to purge queues, commands, overlay attribution, capture handles, and
  component tickets for that generation only.
- Prohibit copying the plugin-wide purge shape, which would let a predecessor's
  teardown touch a successor's state.
- State where the generation key comes from, since none of the existing teardown
  queues carry one.

### G-6 — The restore key is unrepresentable, and cross-plugin claim is decided and open at once

The persisted record carries `PanelId`, a workspace index, and a title
(`panel_persist.rs:164-172`); the decided `(WorkspaceId, PersistentId)` key, the
owner name, and the manifest key do not exist, and `StableIdentity` reuses the
`PanelId` the record rejects. `Decision B.4` also decides a consent rule for a
different plugin claiming a panel while `Open points` calls the same question
open.

Required contract change:

- Specify the persisted fields the restore key needs and the encoding version
  that carries them, or move the key to open until `RFC-OQ-9` and say the record
  fixes only the tuple, not the record.
- State that `PersistencePolicy::StableIdentity` is not selectable for panels and
  why the variant remains, so no caller can select the rejected behaviour.
- Make `PGO-12` assert that no policy selector can resurrect an identity, not
  only that the default does not.
- Resolve the cross-plugin claim one way: either decide the consent surface in
  this record, or move the `Decision B.4` sentence to `Open points`.

### G-7 — The Drop outcome is unreachable for focused panels

`Drop` names workspace close as a trigger, and workspace close routinely meets a
`Focused` panel. `can_transition` permits `Mounted -> Disposed`,
`Suspended -> Disposed`, and `Closed -> Disposed`, but not `Focused -> Disposed`
or `Created -> Disposed` (`panel_state.rs:145-163`), and the record defers those
transitions to an open point while deciding the outcome that needs them.

Required contract change:

- Decide `Focused -> Disposed` and `Created -> Disposed` in this record, with the
  resource-release obligations they carry, or restrict `Drop` to states that can
  reach `Disposed` and state what a workspace close does to a focused panel.
- State the disposal path a workspace close uses, including MRU and focus
  release, so the outcome is a path rather than a category.

### G-8 — The matrix does not prove the two questions the security section names

The fourteen rows exist and are sound, but they test the happy direction of
rebind and not the adversarial one.

Required contract change:

- Extend `PGO-7` with an assertion that capture handles, overlay attribution, and
  queued events are observably empty or revoked for `N+1` at bind time, not only
  that `N+1` did not ask for them.
- Add a row asserting that generation `N`, still holding a handle, is refused
  with the typed controller-conflict error after `N+1` binds and cannot observe
  `N+1`'s scene, bind, capture, or results.
- Add a row asserting that a failed invalidation leaves the panel unbound and
  refuses the bind, with nothing partially committed.
- Renumber the matrix and state the new total; the "14-row" count is not a
  contract, the coverage is.

## Non-blocking findings

- **N-1 — Reason vocabulary.** `Decision E.2` claims alignment with the GUI
  content release reasons but adds `denied` and `incompatible` and drops
  `dismissed`, `closed`, and `quit`. State the set as a superset with an explicit
  mapping, or stop claiming alignment.
- **N-2 — "Ephemeral default".** `panel_persist.rs` documents the default in a
  module comment; there is no `Default` impl and no production selector. Say
  "the documented default" and name the call site that must not exist yet.
- **N-3 — Two state machines.** `PanelRecord.state` is the six-variant
  `bitty_ui::panel::PanelState`; `Closed` exists only in the seven-axis
  `panel_state.rs` module. `Decision C.7` should say which type holds `Closed`
  and that the registry cannot represent it today.
- **N-4 — Unnamed error.** `PGO-8` requires a "typed controller conflict" that
  `Decision A.3` never names. Name it in the decision, or the test asserts
  against an error the contract does not define.
- **N-5 — Bounded counter, unbounded wording.** `Decision E.1` says each
  transition increments a bounded counter but names no bound. Name the cap or
  cite the PR bound it reuses.

## Threat model disposition

A new abuse case is required, and one row is added.

The existing rows do not cover it: `T-06` covers escaping the VM, `T-07` covers
resource exhaustion, `T-13` covers grid semantics, and `T-20` covers a client
forging a control transfer. None covers authority that is recorded against a
panel identity — a `PanelId` that is defined to outlive the generation that
created it — surviving a plugin generation boundary. That is exactly the abuse
the no-inheritance rule exists to prevent, and it is new because panel identity
survival is new: today the scene path disposes the container, so the carry-over
cannot occur there, while `bitty.panel.create` panels have no owner and no
binding to carry over.

The added row is `T-25` in [the threat model](threat-model.md), with the
controller-binding fence, bind-time invalidation and revocation, the fail-closed
unbound state, and the rebind-isolation tests as its required defense. The row is
a requirement like every other row in that table; it is not evidence, it does not
change any status, and it does not claim the defense exists.

## Residual risk carried to the implementation

- **The two current behaviours are both wrong in opposite directions.** Scene
  panels are destroyed on reload (the rejected alternative); `bitty.panel.create`
  panels survive with no owner (the state the record calls unsafe). Until the
  binding lands, an operator's exposure depends on which API a plugin used.
- **Grant invalidation does not exist.** Every claim in `Decision D` is a
  requirement, not a description. Any acceptance that reads as a statement of
  current safety would be false.
- **The placeholder is the only user-visible containment.** If it regresses to an
  empty surface, the silent orphan the record forbids returns without any test
  failing, because no row asserts the placeholder is non-empty and named.
- **Two generation counters invite conflation.** Panel allocation generation,
  plugin generation, and scene `epoch` are three counters over two fences. The
  record's `Decision B.2` separation is correct but must be enforced by types,
  not by prose, or a future caller will compare the wrong pair.
- **Persistence protects restart, not the process.** The `Ephemeral` default
  bounds restart reuse; nothing bounds intra-process authority carry-over, which
  is the larger surface.

## Evidence register

| ID   | Revision                           | What it establishes                                                              |
| ---- | ---------------------------------- | -------------------------------------------------------------------------------- |
| E-1  | `bitty` `7ac871d4`                 | Current panel registry, record shape, lifecycle, grants, disposal, bus, overlays |
| E-2  | `bitty` `7ac871d4`                 | Plugin create handler and production backend; workspace-`None` allocation        |
| E-3  | `bitty` `7ac871d4`                 | Scene host owner/generation binding and dispose-on-release                       |
| E-4  | `bitty` `7ac871d4`                 | Panel lease kernel and write gate                                                |
| E-5  | `bitty` `7ac871d4`                 | Component-request teardown keying                                                |
| E-6  | `bitty` `7ac871d4`                 | Persistence policy and persisted record                                          |
| E-7  | `bitty` `7ac871d4`                 | Seven-axis lifecycle and transition table                                        |
| E-8  | `bitty-terminal-docs` `861ea4d`    | Reviewed decision text and its parents                                           |
| E-9  | `bitty-plugins-docs` `origin/main` | Plugin host generation ownership, reload ordering, capability re-check           |
| E-10 | This repository `9e214c9`          | Threat model rows `T-01`..`T-24` and the panel lease write hook                  |

## Verification obligations that survive this review

1. Re-review the decision by diff once `G-1` through `G-8` are addressed; the
   ownership direction needs no re-litigation, the enforcement text does.
2. A corrected record must state, in one place, the derivation, the ordering, and
   the failure mode of grant invalidation. A reader must be able to implement it
   without choosing between sentences.
3. The acceptance wave must update the Panel Runtime RFC lifecycle section, the
   Plugin Host Runtime RFC reload section, and the scene host's dispose-on-release
   behaviour in the same change; a decision that lands alone leaves two
   contradictory behaviours shipped.
4. Rebind conformance requires `PGO-7`, `PGO-8`, and the added isolation and
   revocation rows as security evidence for the affected criterion, not only as
   lifecycle tests.
5. No status moves from `draft` on this review. This record withholds sign-off.

## Re-review scope

The verdict changes to `ACCEPTED` when the decision: states one grant derivation
and removes the inheritance wording; specifies bind ordering, in-flight refusal,
and the invalidation failure mode; assigns workspace membership and accounting;
records and reconciles the scene-panel path; corrects the `drop_plugin` row and
requires a generation-keyed panel teardown; makes the restore key representable
and resolves the claim question; makes `Drop` reachable or narrows it; and
extends the matrix with the adversarial rows. Findings `N-1` through `N-5` are
corrections of record, not conditions of acceptance.

## Limitations of this review

- Read-only and static: no build, no test execution, no dynamic analysis in
  `bitty`. Every code statement is a text observation at `7ac871d4`, and line
  numbers drift.
- The reviewed decision pins `a168b197`; this review reads `7ac871d4`. Claims
  were re-derived rather than diffed, so a change between the two revisions is
  reported as current state, not as a regression.
- The reviewer cannot judge whether the placeholder's visual design is adequate
  or whether the closed reason vocabulary is complete for operators; those are
  product and diagnostic questions.
- The persistence contract behind `RFC-OQ-9` is out of scope, so `G-6` judges
  representability only, not the encoding.
- No threat-model row was added for capture or overlay alone; they are treated as
  families inside `T-25` rather than as separate abuse cases, because their abuse
  path is the same carry-over.

## References

- [Panel Generation Ownership Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-generation-ownership-decision.md)
  — the reviewed draft.
- [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md)
  — accepted lifecycle, identity, generation addressing, and failure semantics.
- [Workspace Compositor Specification](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/workspace-compositor.md)
  — accepted hierarchy and interaction atomicity.
- [Panel Placement Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-placement-decision.md)
  — draft panel identity and attachment direction.
- [Chrome Surface Contract](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/chrome-surface-contract-candidate.md)
  — candidate surface inventory and the reload row this decision narrows.
- [Plugin Host Runtime RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/plugin-host-runtime-rfc.md)
  — accepted generation ownership, FS-6 ordering, and capability re-check.
- [Isolation Resource RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/isolation-resource-rfc.md)
  — accepted ceilings and per-generation attribution.
- [Threat model](threat-model.md) — trust boundaries, abuse cases, and the added
  `T-25` row.
- [Security overview](overview.md) — invariants 2, 3, 4, and 7.
- [Core Ontology and Identity Model](https://github.com/bitty-terminal/bitty-docs/blob/main/docs/decisions/adrs/ADR-0013-core-ontology-identity.md)
  — owns-panels relation, `GenerationId` fencing, and the Restore/Persistence
  separation.
