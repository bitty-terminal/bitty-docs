---
title: Plugin Drawing Capability Security Review
description: Independent security review of the plugin drawing capability RFC candidate, with per-dimension verdicts, the closed-set capability gap that blocks the grant, and seven blocking corrections
category: security
audience: security-reviewer
document_type: research
status: draft
website_publish: false
sidebar_order: 50
---

# Plugin Drawing Capability Security Review

## Review status

**Verdict: `NEEDS-FIX`.** Seven blocking findings remain. One is a capability
whose enforcement path does not exist in any of the three places the closed set
is written; one targets a panel the accepted v1 plugin surface does not let a
plugin own; one depends on a scheduling primitive the accepted v1 surface
refuses; one folds damage into an architecture that is a draft and paints
nothing today; one asserts an accessibility tree that the shipped scene path
deliberately does not publish; one claims host ownership of every byte without
any ceiling on the bytes retained; and one promises visibility at a present tick
that has no identity.

The sandbox decision itself survives review intact: a bounded, declarative,
host-validated data plane with no frame, renderer, GPU, or window object
crossing into Lua is the right answer to [bitty#2477](https://github.com/bitty-terminal/bitty/issues/2477),
and it is consistent with invariants 3 and 4. The defects are in the
enforcement and composition around that decision, not in its direction.

| Item               | Value                                                                                                                                                                                                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Reviewed document  | [Plugin Drawing Capability RFC (Candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/plugin-drawing-rfc.md), `draft`; landed at this path by docs PR #373                                                                                                              |
| Reviewed revision  | `bitty-terminal-docs` `25aa80f`; RFC text as merged at `f8bc04f`                                                                                                                                                                                                                                             |
| Parents reconciled | Panel Runtime RFC, Rich Presentation RFC, Panel Content Scene Path Decision, Render Damage and Invalidation (candidate), Chrome Surface Contract (candidate), Theme Token Contract (candidate), UI Motion and Budget (candidate), Plugin Platform RFC, Plugin API v1 Lua Surface RFC, Isolation Resource RFC |
| Code evidence      | `bitty` `origin/main` at `7ac871d4`; `bitty-plugins` `origin/main` at `55e4a1f` and the SDK pinned there; read-only, no checkout, no build, no test run                                                                                                                                                      |
| Corpus evidence    | `bitty-plugins-docs` `origin/main` at `1b04a63`                                                                                                                                                                                                                                                              |
| Threat model       | [Threat model](threat-model.md) in this repository at the review revision                                                                                                                                                                                                                                    |
| Review date        | 2026-11-03                                                                                                                                                                                                                                                                                                   |
| Reviewer role      | Independent security reviewer; no authorship of the reviewed contract or of the code it cites                                                                                                                                                                                                                |
| Gate               | This repository's documentation gate (format, links, metadata, language, hygiene, cross-repo links, state, actionlint)                                                                                                                                                                                       |
| Outcome            | Reviewed status stays `draft`; the acceptance gate the RFC names in its criterion 1 is **not** satisfied by this record                                                                                                                                                                                      |

The reviewer wrote none of the reviewed text and did not implement any part of a
drawing surface. The candidate's own acceptance criterion 1 requires independent
review, "including the required P0/security review", before acceptance. This
record performs that review and does not sign off: the criterion is not met, and
nothing here promotes the document, authorizes an implementation issue, or
changes an accepted contract.

One path correction for future readers: the artifact exists as
`specifications/plugin-drawing-rfc.md`, not as a `*-candidate.md` sibling of the
other candidates. The name does not matter to the verdict, but a reviewer
following the candidate-naming convention would not find the file.

## Scope and method

This is a design review of five dimensions the issue names: the instruction set
and coordinate model, animation and per-frame deltas, readback, resource bounds
and backpressure, and the sandbox boundary. Each decision is judged against the
accepted parent that owns it, against the shipped capability grammar in code,
and against the code path the RFC says its claims rest on. The review asks one
question per claim: **what mechanism delivers this property, and does that
mechanism exist?**

Method:

1. Read the RFC end to end, then re-read each decision against the accepted
   source that owns the area, so a claim is judged by its own parent rather than
   by a general expectation.
2. Re-derive every code and corpus claim at the pinned revisions. The candidate
   pins `bitty` `a168b197` and `8852836`; this review reads `7ac871d4`, so
   claims were re-derived rather than diffed and a change between the two is
   reported as current state, not as a regression.
3. Follow the grant end to end — manifest text, SDK linter, package parser, host
   closed set, bridge call, host object — instead of accepting "declared under
   the accepted `[capabilities]` grammar" as an enforcement argument.
4. Attack each stated property as a mechanism: ask which step can fail open,
   which step has no ceiling, and which step names a mechanism that is a draft,
   a candidate, or absent.
5. Record each finding with the section it lands in and the correction it needs,
   so a revision can be re-reviewed by diff.

Out of scope and deliberately not judged: whether plugins should draw at all
(the issue's product decision, accepted here as given), vector geometry and
offscreen surfaces (both deferred to v2 by the candidate and not scored), the
damage algorithm itself, panel placement and identity, the accessibility tree
design, theme token naming, and any performance measurement. No drawing code
exists, so every judgment is about a described mechanism; this is not a code
audit, a fuzz, or a penetration test.

## Dimension findings

### D-1 Instruction set and coordinate model — passes as a decision, three rules unresolved

This is the strongest part of the record. The cell-primary model is the right
choice for the stated reason (reflow, resize routing, shaping, and ligature
contracts already speak cells), the viewport-relative origin keeps global
coordinates out of the plugin surface, vector machinery is refused as a class
rather than half-supported, the command set is closed with typed rejections, and
the fixed two-layer model keeps z-order authority Core-side. Nothing here widens
the compositor, and nothing hands a plugin a window or screen coordinate.

Three rules are not resolved enough to implement:

- **Clip scope and paint order disagree.** `Clip` is defined positionally, "clip
  rect for subsequent commands", while paint order is by layer: every `Image`
  paints above every `Cells`/`Rect`/`Line` regardless of list position. A
  command sequence can therefore satisfy one reading and violate the other: a
  `Cells` after an `Image` paints below it, and a `Clip` opened before an
  `Image` means something different from a `Clip` opened after it only because
  of where the image sits in the list, not because of where it paints. An
  implementer must choose, and the two choices produce different pixels from the
  same accepted `DrawList`.
- **The colour fields have no domain.** `Cells` carries a "color pair", `Rect`
  and `Line` carry a "color", and nothing says whether that is the accepted
  `#RRGGBB[AA]` literal from RFC-0001, a theme token, or an indexed palette
  entry. The theme contract keeps Core-owned `content.*` tokens out of plugin
  hands and gives plugins only `plugin.<name>.*`, so a literal is the likely
  answer, but the contrast obligations (`AC-1`..`AC-3`) and the `bitty --safe`
  forced pair are never mentioned.
- **`Semantic` is required and optional at once.** The command table says it "is
  not optional for visible content"; the accessibility section paints
  un-annotated content anyway and reports `role: image, label: ""`. Two rules
  for one property means the refusal never happens in one implementation and
  always happens in another.

**Required correction.** Define paint order as `(layer, command order)` and make
the clip part of each command's validated envelope — either a clip rect on every
command or an explicit "this command inherits the clip stack at validation
time" rule with a stated interaction with layer 1. State the colour domain
(literal per RFC-0001, with contrast and `--safe` treatment) or name the token
namespace a draw colour may resolve through. Resolve `Semantic` one way; if it
stays mandatory, make a missing annotation a `validation` refusal rather than a
silent `role: image` fallback and delete the fallback paragraph.

### D-2 Animation, per-frame deltas, and offscreen surfaces — fails

What passes is the shape: no `on_frame`, no vsync callback, no render-loop hook,
no per-frame Lua entry point; a tick is explicitly not a present; submissions are
full replacement lists with no delta codec in v1; offscreen surfaces are refused
rather than deferred silently; each refusal is typed. That is the correct
composition with invariant 4, and it avoids the immediate-mode failure mode the
issue names.

What fails is the primitive itself. `bitty.draw.tick(rate)` is a repeating,
host-quantized timer per target, and the accepted v1 Lua surface RFC states that
"timers are one-shot in v1; repeating timers are a `1.x` minor addition". The
candidate never mentions the timer surface, the RC-4 ceiling (64 tasks, 32
timers), or the `E_BUDGET_TIMER` refusal, and it never says how four targets at
30 submissions per second compose into a per-plugin aggregate. RC-1 is a
per-callback ceiling, so four targets multiplied by the sustained rate is up to
120 callbacks per wall second, each of which may legitimately spend 50 ms of CPU
— the bounded per-callback budget says nothing about the aggregate.

The reduced-motion and safe-mode obligations are also unstated. RFC-0002
(accepted) fixes the `0..=500` ms duration envelope, reduced-motion collapse,
and `--safe` final-state collapse for panel transitions, and forbids
interpolating terminal content. A plugin content animation is not a panel
transition, so RFC-0002 does not cover it, and no other accepted contract does;
the drawing contract, which defines the primitive, is the owner and says
nothing.

**Required correction.** Express animation on the accepted
`bitty.timers.create(delay_ms, callback)` spelling with a re-arm per tick, charge
every target tick to RC-4 with the ceiling restated (and reconcile the accepted
32-timer value with the 64 that `bitty-lua` currently enforces), add a
per-plugin aggregate callback-rate ceiling with its enforcement point and typed
drop behavior, and state the RFC-0002 composition: duration envelope, reduced
motion, `--safe` collapse, and the prohibition on interpolating terminal
content.

### D-3 Readback — the denial direction passes, the reserved capability does not

The direction is right and is what the issue asked for: default deny, permanent
denial for cross-panel capture, no unlock path, text re-derived from the plugin's
own state rather than the post-composited surface, write-only image leases, and
a typed denial rather than an empty result. "Only the post-compositing surface
is invisible" is a precise and defensible line.

Two things do not hold.

- **`ui.draw.readback` is declared-but-inert.** An identifier that exists in the
  closed set, can be granted, and unlocks nothing is exactly the phantom
  authority the plugin ecosystem already treats as a defect — the file-manager
  manifest removes `panel.provider`/`panel.create` for that reason, in those
  words. It is also not expressible today: the manifest parser refuses any head
  outside the closed set, so "declared but inert" is a state the grammar cannot
  represent.
- **The pixel claim is unscoped.** "Pixel sampling out of any target — refused"
  is asserted while `bitty.debug/captureFrame` exists, accepts `format:
"pixels"` with a per-call opt-in, is gated by `debug.trace` plus a per-session
  automation bearer, and is described as Implemented-only with acceptance still
  open. Whether that path can capture compositor-side drawing painted over a
  terminal-backed panel's content is not stated anywhere, and the denial table
  reads as if no such path existed.

**Required correction.** Delete the inert identifier and keep the future
readback id in an open point with its intended scope; scope the denial sentence
to the `bitty.draw.*` surface and state explicitly that the devtools-domain
capture is out of this contract and remains bounded by its own gate
(`debug.trace` + automation bearer + per-call opt-in + audit), including whether
a pixel capture can include composited drawing.

### D-4 Resource bounds and backpressure — passes in shape, fails in accounting

DC-1..DC-9 are the right shape: every bound is a named constant, tests are
required to parameterize on them, over-limit behavior is typed and preserves the
last good list, and the numbers-are-contracts convention is stated. The typed
failure taxonomy is unusually complete for a candidate, and the "no eviction"
choices on image budgets are the conservative direction.

The accounting is where it breaks. "The host owns every byte" is asserted, then
only the plugin-side staging list is charged to RC-2. RC-2 is the per-VM Lua
heap measured through `RuntimeBuilder::memory_limit` and `Lua::total_memory()`;
it cannot debit a host-side `Vec<DrawCommand>` or a retained swap buffer. The
host therefore retains, per plugin generation, up to four targets times two
buffers times 256 KiB of serialized list plus whatever the decoded form costs —
with no ceiling, no attribution, and no refusal. DC-5/DC-6 bound image leases,
which shows the missing shape exists elsewhere in the same document.

Two smaller derivations are also missing: DC-7's window is only "window-judged"
and its math is deferred to an open point that says it blocks **v2** acceptance,
although DC-7 is a v1 bound with a v1 verification row; and DC-1 with DC-2
implies an average of 64 bytes per command, which no per-command field budget
states.

**Required correction.** Add a retained-drawing-bytes ceiling covering
serialized plus decoded storage multiplied by targets and swap buffers, with
per-generation attribution and a typed refusal, and state whether it replaces or
composes with RC-2/RC-3. Move DC-7's token-bucket parameters to v1 acceptance,
since the bound is v1, and state the per-command/per-field budget that makes
DC-1 and DC-2 jointly satisfiable.

### D-5 Sandbox boundary — the boundary passes, the grant's target and lifetime do not

The boundary is the part that answers the issue, and it answers it correctly.
Every host object a plugin receives is an opaque index with a generation stamp;
the flow is one-way; commands are plain typed data with no callable, no opcode
dispatch, and no native surface; the paint conversion runs Core-side; a plugin
cannot learn that a present happened; `Panel::render(&mut Frame)` is rejected by
construction for the right reason. Invariants 3 and 4 hold at the design level,
and the record is explicit that it grants no release blocker.

What does not hold is where a `DrawTarget` comes from and when it dies. The
contract addresses targets as `(PanelId, Generation)` plus a target ordinal and
puts panel creation out of scope, but the accepted v1 plugin surface offers
seven mount slots (`terminal | top | bottom | left | right | tabline | overlay`)
and explicitly rejects `register_panel`, `PanelId`, `PanelProvider`, and panel
lifecycle as post-v1.0. So either the target set is empty in v1, or "the
plugin's own panel" quietly means a panel created through an API the accepted
surface refuses — and the second reading, if a target could name any panel,
permits painting over another panel's content, which for a terminal-backed panel
is presentation spoofing of Terminal Truth. The contract has no ownership rule
that distinguishes the two readings; `E_DRAW_NOT_OWNER` is defined against a
target ordinal, not against a panel.

Three further claims in this dimension rest on absent mechanisms: the
accessibility tree publication (the shipped scene path pushes scene text into a
scratch host and drops it with the frame), the present-tick visibility, and the
closed-set install path. They are carried as separate blocking findings.

**Required correction.** Define the binding rule — which panel a
`bitty.draw.open` may name, who authorizes it, and what happens when the panel
is not owned by the same `(PluginId, Generation)` — and state the acceptance
dependency on panel ownership explicitly, including that `ui.draw` stays
dormant until the panel provider/lifecycle contract is accepted. Add a rule that
no draw target may cover a terminal-backed panel's content region unless the
plugin owns both the panel and the terminal behind it.

## Blocking findings

Numbered `B-1` to `B-7`. Each is a property the text asserts that its described
mechanism cannot deliver, or a capability whose enforcement path does not exist.
Blocking is not a severity judgment about the product direction.

### B-1 — The grant does not exist in the closed set, so the degradation path it describes is unreachable

**Where:** § "Decoupling from the declarative v1 surface" rule 4,
§ "Sandbox boundary, grants, and budgets" grant table, § "Typed failure
taxonomy" row `E_DRAW_UNAVAILABLE`, § "Affected contracts".

**Finding.** The contract treats `ui.draw` and `ui.draw.image` as additions
"under the accepted `ui` family" and promises that a host without the feature
"rejects `bitty.draw.*` calls with the typed `E_DRAW_UNAVAILABLE`" while
"feature detection precedes grant inference, so plugins degrade to v1
primitives instead of failing to start".

The capability set is closed in three places, and none of them contains either
identifier:

- `bitty-package` `CLOSED_CAPABILITY_HEADS` (`crates/bitty-package/src/manifest.rs:345-360`)
  lists `ui.rich`, `ui.overlay`, `ui.overlay.focus`, `ui.present`,
  `ui.protocol-register` — and no `ui.draw`;
- `bitty-plugin-host` `CapabilityFamily::Ui::closed_identifiers`
  (`crates/bitty-plugin-host/src/capability.rs:151-163`) lists the same five;
- the SDK linter's `CLOSED_CAPABILITY_HEADS`
  (`sdk/bitty-plugin-sdk/src/capabilities.ts:46-61`) lists four of the five
  (`ui.present` is already missing there).

The parser refuses an unknown head at manifest parse with "unknown capability
'{head}' (closed set; forward compat requires explicit RFC)"
(`crates/bitty-package/src/manifest.rs:522`, `crates/bitty-plugin-host/src/capability.rs:560`).
A plugin that declares `ui.draw` therefore fails **install**, before a VM exists,
before `bitty.draw.*` is callable, and before any feature detection can run.
The promised graceful degradation cannot occur; the plugin does not start. The
same refusal makes `ui.draw.readback` "declared but inert" unrepresentable.

There is also a naming collision the record does not mention: `ui.present` is
already shipped as the draw head. `bitty.ui.present.show(handle)` /
`hide(handle)` are gated on `ui.present` and described in the runtime as "the
draw head", deliberately separate from `ui.overlay` and `ui.overlay.focus` so a
manifest cannot gain input authority by asking to draw
(`crates/bitty-lua/src/host.rs:6436-6482`, `crates/bitty-lua/README.md:47-65`).
The candidate proposes a second draw capability without reconciling the first.

**Why it is blocking.** This is a capability whose enforcement path does not
exist, presented as one that degrades safely. An implementer reading the
contract would build `bitty.draw.*`, ship a manifest with `ui.draw`, and find
every install refused — with the failure surfacing as an unrelated manifest
error rather than `E_DRAW_UNAVAILABLE`.

**Required correction.** Enumerate the closed-set surfaces an acceptance must
change and state that acceptance includes them: the Plugin Platform RFC's
accepted identifier table, `bitty-package` `CLOSED_CAPABILITY_HEADS`,
`bitty-plugin-host` `CapabilityFamily`, the SDK linter table, the SDK
`host-surface` mapping, and the surface manifest. Reconcile `ui.draw` with
`ui.present` in one sentence — either `ui.draw` extends the draw head or it is
renamed to avoid two draw authorities. Delete the inert `ui.draw.readback` from
the acceptance set (see D-3). Add negative-validator fixtures: `ui.draw.image`
without `ui.draw`, an unknown `ui.draw.*` head, and the readback id if it
survives. State the real v1 behavior for an older host: the manifest is refused,
so the plugin must not declare the capability until the host advertises it —
which requires an advertised feature/version surface the contract does not name.

### B-2 — No panel exists for a v1 plugin to draw into, and the ownership rule does not distinguish the two readings

**Where:** § "Terminology" (`DrawTarget`), § "Relationship to accepted sources"
(Panel model row), § "Purpose and scope" (panel creation declared out of scope),
§ "Typed failure taxonomy" (`E_DRAW_NOT_OWNER`).

**Finding.** A `DrawTarget` is "one plugin-authorized drawing surface slot with a
content-rectangle cell viewport", addressed by `(PanelId, Generation)` plus a
target ordinal. The record explicitly excludes panel creation: "how that panel
was created is out of scope here".

The accepted v1 plugin surface does not give a plugin a panel. Its slot set is
seven names, `terminal | top | bottom | left | right | tabline | overlay`, and
`statusline` was removed from the vocabulary; its refusal list says "no
`register_panel`, `PanelId`, `PanelProvider`, or panel lifecycle; panel
providers wait for the Panel RFC", and the option table rejects a panel provider
for v1. A `bitty.panel.create` implementation and `panel.provider` /
`panel.create` manifest identifiers do exist in code — git-panel declares both —
which is precisely the drift where a manifest declaration is not evidence the
accepted API supports it.

So the grant has no target under the accepted surface, and the record does not
say so. Worse, the only alternative reading is unspecified: if a target may name
a panel the plugin did not create, the plugin can paint over another panel's
content region. For a terminal-backed panel that is presentation spoofing —
a plugin drawing fake prompt or output text over a user's terminal — which is the
presentation-versus-truth boundary this corpus exists to hold. No rule in the
contract forbids it, and `E_DRAW_NOT_OWNER` is defined against the target
ordinal only.

**Why it is blocking.** Two independent defects in one rule: the grant's target
set is empty under the accepted surface (a capability that cannot be exercised),
and the only way to make it non-empty admits a spoofing path the threat model
would rank above drawing itself.

**Required correction.** State the binding: a `DrawTarget` is created only by
the generation that owns the panel, `bitty.draw.open` names a panel and is
refused with `E_DRAW_NOT_OWNER` when the requesting `(PluginId, Generation)` did
not create it, and a target over a terminal-backed panel is refused unless the
plugin also owns that terminal. State that acceptance of `ui.draw` is gated on
the panel provider/lifecycle contract, and that until then `ui.draw` stays
dormant rather than binding to a slot. Add the corresponding negative tests to
the verification plan.

### B-3 — The pacing primitive contradicts the accepted timer surface, and no aggregate rate ceiling exists

**Where:** § "Animation and per-frame deltas", § "Sandbox boundary, grants, and
budgets" (budget composition), § "Bounds" (DC-7, DC-8).

**Finding.** The animation model is "a host-quantized timer per target —
candidate spelling `bitty.draw.tick(rate)` — with the effective rate
`min(requested, DC-7 sustained)`. Each tick invokes the plugin's registered
callback once".

The accepted v1 Lua surface defines the timer surface and its direction:
`bitty.timers.create(delay_ms, callback)` / `bitty.timers.cancel(timer_id)` with
RC-4 caps, and states that "timers are one-shot in v1; repeating timers are a
`1.x` minor addition". A per-target repeating tick is the repeating timer the
accepted surface defers, introduced by a drawing contract that never mentions
the timer surface or RC-4 at all.

The aggregate consequence is not bounded by anything the contract states. RC-1
is a per-callback ceiling (10^7 instructions or 50 ms wall, whichever first), so
DC-7 (30/s per target) times DC-8 (4 targets) permits up to 120 callbacks per
wall second, each of which may spend the full 50 ms of plugin CPU. Six seconds
of CPU work per wall second is inside every stated bound and would starve the
coalesced present path the same document says the plugin must not disturb.

Two further omissions sit in the same paragraph: the reduced-motion and
`--safe` collapse obligations RFC-0002 fixes for panel transitions are never
applied to content animation, and the duration envelope (`0..=500` ms) is never
stated, so an indefinite 30 Hz animation is the default reading.

**Why it is blocking.** The pacing mechanism does not exist in the accepted
surface, and the rate ceiling that would make it safe is per-target while the
resource it protects is per-plugin. An implementer following the text would
build a new repeating timer outside RC-4 and ship a CPU amplification path with
a bounded per-call profile.

**Required correction.** Re-express animation as re-armed one-shot
`bitty.timers.create` calls, charge each target's tick to RC-4, restate the
32-timer ceiling and reconcile it with the 64 `bitty-lua` currently enforces,
and add a per-plugin aggregate callback-rate and CPU ceiling with a typed drop
behavior. State the RFC-0002 composition (duration envelope, reduced motion,
`--safe` final state) for content animation. If an explicitly repeating drawing
timer is wanted instead, it becomes a named amendment to the accepted v1
surface, not a spelling inside a drawing candidate.

### B-4 — Damage declaration folds into a draft architecture that paints nothing, and its fallback bound cannot fire

**Where:** § "Damage model (allocation of responsibility)", § "Built versus not
built" bullet 3, DG-OQ-1.

**Finding.** The damage decision is "validated and intersected by the host …
the host folds declared damage into its accepted three-level damage model
(panel-level damage under the Render Damage and Invalidation Architecture
(Candidate))", with under-declaration bounded by "a scheduled `full damage`
resubmission (host-driven, one per `128` present ticks)".

Four things are wrong at once.

1. **The model is not accepted.** The owning record is a draft, and its own
   built-versus-not-built section states that "there is no damage or
   invalidation system in `bitty` today": cell/row dirty flags, `DamageSpan`,
   persistent panel textures, tile damage, ring-buffer scroll, and browser-style
   invalidation are all NOT built, and the frame scheduler is "partial (gate
   only)". The candidate calls it "accepted" in this sentence and describes it
   as a candidate in its own later section.
2. **Declared damage adds no paint work in the shipped present.** The combined
   present sets `FrameMode::Full` with a full-surface dirty rect; the comment at
   `crates/bitty-runtime/src/runtime/present.rs:7178-7199` says so and says the
   scene regions "add no paint work here" because the full-surface rectangle
   subsumes them. A declaration that reaches only a partial plan that is not on
   the current path is not an interface; it is a placeholder.
3. **The 128-present-tick bound has no counter to count against.** Presents are
   frame-on-demand with an 8 ms PTY settle gate (`PRESENT_SETTLE_MAX`,
   `crates/bitty-runtime/src/runtime.rs:414`); there is no present tick identity
   a plugin or host can index. On an idle host no present occurs, so the
   self-healing resubmission never runs and staleness is unbounded — the exact
   failure the sentence claims to bound.
4. **The plugin cannot compute the damage it is asked for.** DC-7 throttle-drops
   submissions, and a plugin cannot observe presents or learn which of its lists
   was painted. "Changed since its previous list" therefore has two readings —
   previous submitted or previous accepted — and the wrong one under-declares on
   every drop. Under-declaration is exactly the fail-open the model admits it
   cannot repair.

The host already holds both the previous and the next validated list, so it can
compute the diff itself, correctly and for free, at every swap.

**Why it is blocking.** The section asserts a correctness property (declared
damage is validated, and under-declaration is bounded) that neither the current
pipeline nor the described scheduler can deliver, and it moves a trust-relevant
input — what changed — onto the untrusted side when the host already has the
data to derive it.

**Required correction.** Make damage host-derived for v1: diff the previous and
next validated lists at swap, clip to the viewport, and drop the plugin-declared
`damage` field entirely. Keep a declared-damage optimization as a v2 open point
gated on the damage pipeline landing, with the drop/under-declaration case
worked through. Correct the "accepted three-level damage model" sentence.
Remove DG-OQ-1 from the damage discussion or restate it as a v1 scheduler
question, since the present-tick quantization is what makes both the visibility
rule and any tick-based bound untestable.

### B-5 — The accessibility claim rests on a tree the shipped scene path does not publish

**Where:** § "Accessibility and semantics fallback", § "Drawing instruction set"
(`Semantic` row), § "Built versus not built".

**Finding.** `Semantic` regions "compose into the accessibility node tree of the
owning panel in tree-stable order", and "every `DrawTarget` owns one
host-derived coarse summary entry (`panel-name` label + bounded first-line text
or empty), so a screen reader can summarize a drawing panel".

The shipped scene path does not publish scene content into the window's
accessibility tree. `crates/bitty-runtime/src/runtime/scene_present.rs` documents
that the projection is per-frame **parity evidence**, built through a scratch
`UiSnapshotHost` created per frame and dropped with it, and that "the scene text
is not published to the window's accessibility tree". The candidate's a11y
model therefore requires a publication path that does not exist, is not named as
a prerequisite, and is not owned by any accepted contract — the accessibility
baseline that would own it is a candidate.

The same section also contradicts D-1: it says un-annotated content is painted
and reported as `role: image, label: ""`, while the command table says `Semantic`
"is not optional for visible content".

**Why it is blocking.** The contract's accessibility section is the only
mitigation for a pixel surface that assistive technology cannot read. As
written it asserts a live tree, while the only implemented projection is
frame-scoped evidence that is discarded. An acceptance that reads as a
commitment to announce drawn content would be false against the shipped path.

**Required correction.** State the live-tree publication as an explicit
prerequisite owned by an accepted accessibility contract, with the node identity
and bounds the drawing command maps into, or narrow the claim to the parity
projection and say plainly that drawn content is not announced until that
contract lands. Resolve the mandatory-versus-optional `Semantic` rule in one
place (D-1) and make the failure typed if mandatory.

### B-6 — "The host owns every byte" has no ceiling, and RC-2 cannot debit host storage

**Where:** § "Buffer ownership and lifetime", § "Sandbox boundary" (RC-2 row),
§ "Bounds" (DC-1, DC-5, DC-6).

**Finding.** The ownership decision is "the host owns every byte", with the
`DrawList` buffer, decoded command storage, and the swap pair host-owned. RC-2
is then said to tax "decoded `DrawList` internals against the plugin's accounted
allocations", and "host storage is released back to the host allocator at
validation time".

RC-2 is the per-VM Lua heap: `RuntimeBuilder::memory_limit` plus
`Lua::total_memory()` polling before and after each slice
(`crates/bitty-lua/src/lib.rs:45`, `crates/bitty-lua/src/gate.rs:24`). It is a
quota on allocations made **inside** the VM. A host-side `Vec<DrawCommand>`,
a decoded text run, or a retained swap buffer is not in that heap and cannot be
debited to it; there is no host-to-VM debit path in the runtime. So the sentence
describes an accounting that the mechanism cannot perform, and the retained
buffers are unaccounted by any ceiling in the document: per generation, up to
four targets times two buffers times 256 KiB serialized, plus a decoded form
whose size the contract never states.

At the same time, "released back to the host allocator at validation time"
cannot be true of the buffer that stays on screen. The object that paints the
current picture is retained until the next swap by definition.

**Why it is blocking.** A memory ceiling is a P0-shaped property (invariant 7).
The contract states it is charged and it is not; four plugins drawn at the
stated maxima retain megabytes with no attribution and no refusal. The image
budgets (DC-5/DC-6) show the correct shape exists and was simply not applied to
lists.

**Required correction.** Add a retained-drawing-bytes ceiling: serialized plus
decoded, multiplied by targets and swap buffers, charged per
`(PluginId, Generation)` with an aggregate across plugins, a typed refusal, and
a stated owner (RC-3's aggregate envelope or a new DC row). State that the
retained buffer is not returned to the allocator while it is the painted list.
Stop describing RC-2 as taxing host-decoded storage; if plugin staging is a Lua
string, say that it is the only RC-2-charged part.

### B-7 — A swap becomes visible at a present that nothing schedules, and that has no identity

**Where:** § "Swap model" items 2 and 3, § "Sandbox boundary" item 4,
§ "Bounds" DC-7.

**Finding.** A validated list "replaces the target's previous list under a
host-held double buffer, and is visible at the next host present tick … the
plugin-visible contract is only 'next host present, monotonic, never skipped
ahead of validation'", and "Submission cannot bypass the quantizer: drawing is
decoupled from render frames and the plugin cannot force, block, or observe a
present".

`bitty` renders frame-on-demand: no frame is produced without a revision or an
active animation (accepted Performance Budget RFC, PB-7 `zero periodic
wakeups`). Nothing in the contract requires the host to schedule a present when
a swap is committed. So on an idle window a plugin can submit a valid list and
it never becomes visible — the contract's central promise ("who presents, when
a submission becomes visible") has no mechanism behind it. The same absence
removes the present-tick identity that DG-OQ-1 defers and that B-4's
self-healing resubmission needs.

**Why it is blocking.** Visibility is the one observable property a drawing
capability must guarantee, and the described model has no step that produces it.
The distinction the contract needs — a host-side request for one present is
required and allowed; forcing, blocking on, or observing a present is refused —
is collapsed into a single refusal.

**Required correction.** State that a validated swap marks the target's panel
dirty and requests exactly one present through the existing runtime wake path,
that the request is coalesced with other sources and bounded by DC-7, and that
"cannot force, block, or observe" means the plugin has no handle on the
scheduler, not that no present is requested on its behalf. State the present
ordering guarantee in terms of that wake path rather than an unnamed tick.

## Non-blocking findings

| ID  | Status | Finding and expected disposition                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| N-1 | New    | Status inflation in three places: "accepted three-level damage model" (draft, and B-4), "the accepted ownership tiers stay exactly as they are" for chrome-above-panel-above-overlay when the chrome contract says the ordering "is a direction, not an accepted layer order", and "accepted DevTools frame capture" when `captureFrame` is Amendment A1 Implemented-only with acceptance open and a per-session bearer requirement. Correct all three; the damage one is blocking. |
| N-2 | New    | DC-7's window is undefined ("window-judged") and its math is deferred to DG-OQ-1, which is scoped to block **v2** acceptance while DC-7 is a v1 bound with a v1 verification row. Move the window to v1 acceptance and state the token-bucket parameters, or drop DC-7 to a v2 bound and say what bounds submissions in v1.                                                                                                                                                         |
| N-3 | New    | DC-1 (256 KiB) with DC-2 (4096 commands) implies 64 bytes per command average, and no per-command field budget is stated: `Cells` text length, `Semantic` label length, and rect extents have no individual cap. DG-OQ-5 leaves the label bound open for **v1** while DC-9 counts labels only by count. State the per-command budget so both bounds are jointly satisfiable.                                                                                                        |
| N-4 | New    | Colour semantics. `color pair` / `color` never say literal `#RRGGBB[AA]` (RFC-0001) or theme token; the theme contract gives plugins only `plugin.<name>.*` and keeps `content.*` Core-owned. State the domain, the contrast obligation (`AC-1`..`AC-3`), and the `--safe` treatment for plugin-drawn colour.                                                                                                                                                                       |
| N-5 | New    | `Fence` is two designs at once: an in-list command with "no visual effect" and a `u64` tag described as part of the list ("pure data plus a u64 `Fence` tag"). A plugin-chosen value makes the replay digest non-canonical, and a list-level tag cannot be an end-of-list command. Define one: a host-assigned sequence, or a canonical terminator with no plugin payload.                                                                                                          |
| N-6 | New    | `bitty.draw.stats` has no stated grant. It returns drop counts (no payload growth), which is the right shape, but observability in this corpus is gated by a debug identifier, and the contract never says whether `ui.draw` includes its own counters or a separate head gates them. One sentence is enough, and it should forbid content-bearing stats.                                                                                                                           |
| N-7 | New    | The record's own DG-OQ-7 correctly notes the `DrawList` spelling collision with the renderer-internal type (`crates/bitty-render/src/grid.rs:1898`). Keep it open, but note that a second `DrawList` in the plugin-facing surface will be the name users, SDK docs, and error messages carry; the collision is worth more than a naming preference.                                                                                                                                 |

## Evidence register

| ID   | Claim judged                                                                     | Evidence at the review revision                                                                                                       | Result                                                            |
| ---- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| E-1  | `ui.draw` / `ui.draw.image` do not exist in the closed capability set            | `crates/bitty-package/src/manifest.rs:345-360`; `crates/bitty-plugin-host/src/capability.rs:151-163`; SDK `src/capabilities.ts:46-61` | Confirmed absent, in three tables                                 |
| E-2  | An unknown head is refused at manifest parse, not at call time                   | `crates/bitty-package/src/manifest.rs:522` and `validate_closed_capability`; `crates/bitty-plugin-host/src/capability.rs:560`         | Confirmed; contradicts the `E_DRAW_UNAVAILABLE` degradation story |
| E-3  | `ui.present` is already the shipped draw head                                    | `crates/bitty-plugin-host/src/capability.rs:155-163`; `crates/bitty-lua/src/host.rs:6436-6482`; `crates/bitty-lua/README.md:47-65`    | Omitted by the record                                             |
| E-4  | The accepted v1 plugin surface has seven slots and no panel ownership            | `bitty-plugins-docs` `sdk/plugin-api-v1-lua-surface-rfc.md:31-32`, `171`, `403-404`, `613`                                            | Contradicts the target model                                      |
| E-5  | Timers are one-shot in v1; repeating timers are deferred                         | `bitty-plugins-docs` `sdk/plugin-api-v1-lua-surface-rfc.md:538-556`; RC-4 at `runtime/isolation-resource-rfc.md:261`                  | Contradicts `bitty.draw.tick`                                     |
| E-6  | RC-2 is the per-VM Lua heap and cannot debit host allocations                    | `crates/bitty-lua/src/lib.rs:45`; `crates/bitty-lua/src/gate.rs:24`                                                                   | Contradicts the RC-2 composition sentence                         |
| E-7  | No damage or invalidation system exists; the owning record is draft              | `bitty-terminal-docs` `specifications/render-damage-invalidation-candidate.md:7`, `343-362`                                           | Corrected: the record calls it accepted                           |
| E-8  | The combined present always paints a full frame; scene damage adds no paint work | `crates/bitty-runtime/src/runtime/present.rs:7170-7205`                                                                               | Corrected: declared damage has no present effect                  |
| E-9  | Present is frame-on-demand with an 8 ms settle gate, not a tick counter          | `crates/bitty-runtime/src/runtime.rs:414`; `crates/bitty-runtime/src/runtime/present.rs:2205-2297`                                    | Contradicts "next host present tick" and the 128-tick bound       |
| E-10 | Scene text is per-frame parity evidence, not published to the accessibility tree | `crates/bitty-runtime/src/runtime/scene_present.rs:1-58`, `87`, `335-352`                                                             | Contradicts the `Semantic` composition claim                      |
| E-11 | The scene paint mechanism, `scene_paint_for`, and `with_extra_regions` exist     | `crates/bitty-render/src/scene.rs`; `crates/bitty-runtime/src/registry/host.rs:1093`; `crates/bitty-render/src/grid.rs:1469`          | Confirmed; the paint path is real, the damage path is not         |
| E-12 | `captureFrame` is Implemented-only and needs more than `debug.trace`             | `bitty-terminal-docs` `specifications/devtools-rfc.md:470-506`                                                                        | Corrected: record calls it accepted and reads it as a bare grant  |
| E-13 | The chrome tier order is a direction, not an accepted layer order                | `bitty-terminal-docs` `specifications/chrome-surface-contract-candidate.md:198-202`                                                   | Corrected: record calls it accepted                               |
| E-14 | `DrawList` already names the renderer-internal list                              | `crates/bitty-render/src/grid.rs:1898`                                                                                                | Confirmed; the record's DG-OQ-7 is accurate                       |

## What stays open

- **The open points this review moves.** DG-OQ-1 is not a v2 question: the
  present-tick quantization decides DC-7's window and the visibility rule, both
  v1. DG-OQ-5 (label length) merges into N-3's per-command budget. DG-OQ-7 keeps
  the `DrawList` collision but gains the SDK-docs consequence. DG-OQ-2, DG-OQ-4,
  and DG-OQ-6 stay as written; DG-OQ-3 stays v2.
- **Whether a v1 `DrawTarget` should exist at all before panel ownership is
  accepted.** B-2 is not a wording gap; the alternative is to keep `ui.draw`
  dormant and let the panel contract land first, which is the cheaper order.
- **Whether declared damage should ever return.** Once the host diffs two
  validated lists, a declared field buys nothing but a fail-open; a v2
  justification would have to show a measured resubmission cost that the host
  cannot avoid computing.
- **Whether `ui.draw.readback` should exist as a reserved identifier.** The
  future amendment can introduce its own id; reserving inert authority in the
  closed set teaches manifests to declare authority no code enforces.
- **How `ui.present` and `ui.draw` divide authority.** A second draw head is
  defensible only with a stated division: one shows a mounted block as a
  presentation surface, the other submits cell and raster data into a panel.
- **Verification obligations that survive this review.** Each is a headless test
  the corrected contract must name: install refusal for a manifest declaring
  `ui.draw` on a host without it; `E_DRAW_NOT_OWNER` for a panel the generation
  did not create; a spawn of four targets at DC-7 saturation against the
  per-plugin aggregate ceiling; a retained-byte ceiling at its bound and past
  it; a dropped submission followed by a correct repaint (the B-4 case); an
  annotated and an un-annotated target read back through whatever a11y channel
  the corrected contract names; and a swap on an idle window observed to become
  visible without a plugin-visible present.

## Limitations of this review

- Read-only and static: no build, no test execution, no dynamic analysis. Every
  code statement is a text observation at `7ac871d4`, `55e4a1f`, and `1b04a63`,
  and line numbers drift.
- The reviewed RFC pins `bitty` `a168b197` and `8852836`; this review reads
  `7ac871d4`. Claims were re-derived rather than diffed, so a change between the
  two revisions is reported as current state, not as a regression.
- No drawing surface exists, so every finding is a finding about a described
  mechanism. B-1 in particular is a defect of the capability path, not of the
  design: the mechanism could be implemented correctly and the text would still
  not require the closed-set changes.
- The review judges the composition with the damage pipeline, the motion
  contract, and the accessibility projection as those sources stand today; it
  does not predict what a successor acceptance of each will decide.
- Visual quality, raster fidelity, DPI behavior under `Image`, and the
  performance of a cell-primary painter were not measured and are not judged.
- The reviewer did not read the issue thread beyond the task's framing of
  bitty#2477 and the RFC's quotation of it, so a requirement stated only in the
  thread would not be scored here.

## References

- [Plugin Drawing Capability RFC (Candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/plugin-drawing-rfc.md)
  — the reviewed document, at `25aa80f` / merged as `f8bc04f`.
- [Panel Runtime RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-runtime-rfc.md)
  — accepted panel identity, generation addressing, `StaleHandle`.
- [Panel Content Scene Path Decision](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/panel-content-scene-path-decision.md)
  — the shipped scene paint and present-loop record this review checks E-8 and
  E-10 against.
- [Render Damage and Invalidation Architecture (Candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/render-damage-invalidation-candidate.md)
  — the draft damage architecture and its built-versus-not-built record.
- [Chrome Surface Contract (Candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/chrome-surface-contract-candidate.md)
  — surface inventory and the direction-not-order statement.
- [Theme Token Contract (Candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/theme-token-contract-candidate.md)
  — token ownership and the plugin boundary behind N-4.
- [UI Motion and Budget (Candidate)](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/ui-motion-and-budget-candidate.md)
  — motion tree and budget categories, and its statement of RFC-0002.
- [Plugin Platform RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/plugin-platform-rfc.md)
  — accepted capability grammar, closed identifier table, consent model.
- [Plugin API v1 Lua Surface RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/sdk/plugin-api-v1-lua-surface-rfc.md)
  — accepted slot set, timer surface, and the panel-provider refusal behind B-2
  and B-3.
- [Isolation Resource RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/runtime/isolation-resource-rfc.md)
  — RC-1, RC-2, RC-4, and the queue budgets composed here.
- [DevTools RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/devtools-rfc.md)
  — `captureFrame` and its Implemented-only status behind D-3.
- [Threat model](threat-model.md) — trust boundaries and the abuse cases drawing
  composes with.
- [Security overview](overview.md) — invariants 3, 4, 7, and 10, and the
  release-blocking set.
- Issue [`bitty#2477`](https://github.com/bitty-terminal/bitty/issues/2477) — the
  design gate this review answers.
