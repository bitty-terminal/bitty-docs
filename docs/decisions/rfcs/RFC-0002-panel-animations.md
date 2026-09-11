---
title: Panel Animations and Effects RFC
description: Candidate proposal for bounded panel open close focus and workspace transitions with reduced-motion and safe-mode behavior under the present-path budgets
category: decisions
audience: contributor
document_type: specification
status: draft
website_publish: true
sidebar_order: 46
---

# Panel Animations and Effects RFC

> Status: **draft proposal** (RFC-0002). Not **Accepted**, not **Verified**, not
> **normative**. It proposes a candidate contract for review and registers
> [OQ-040](../open-questions.md); it authorizes no shipped, stable, or
> compatibility-guaranteed behavior, adds no product code, and does not weaken
> any normative control in the [Security Overview](../../security/overview.md),
> [Threat Model](../../security/threat-model.md), or the
> [Performance Budget RFC](../../specifications/performance-budget-rfc.md).
> The decoration contract stays with the
> [Workspace Compositor Specification](../../specifications/workspace-compositor.md);
> the focused/idle outline color that a focus transition interpolates is
> [RFC-0001](RFC-0001-appearance-configuration.md) (OQ-039).

## Motivation

User direction (bitty `CTX-0340`, m0299) asks for configurable panel animations
and effects while keeping Bitty lightweight. Hyprland is the explicit
read-only philosophy reference already adopted by the
[Workspace Compositor Specification](../../specifications/workspace-compositor.md):
its `windows`/`workspaces` animation leaves and named Bézier curves show that
tiling transitions are desirable, and its own documentation warns that looping
styles force constant frame production and stress battery life. Bitty imports
the philosophy — smooth, bounded transitions — without copying Hyprland
configuration syntax, curve names, or wire format.

This RFC defines which transitions may animate, their bounded durations and
easings, the present-path budget they must respect, reduced-motion and safe-mode
behavior, the renderer/compositor split, and the `init.lua` exposure. It is a
design proposal only and claims no implementation.

## Purpose and scope

In scope: a closed transition set (panel open/close, focus change, optional
workspace switch), a bounded duration and easing grammar, a present-path
performance budget that must not regress the soak and latency budgets, a
reduced-motion and safe-mode contract, a renderer-side versus compositor-side
split, and the candidate Lua surface.

Out of scope and owned elsewhere: frame decoration values and colors
([Workspace Compositor Specification](../../specifications/workspace-compositor.md)
and [RFC-0001](RFC-0001-appearance-configuration.md)); grid, cursor, scrollback,
and damage invariants ([Terminal State RFC](../../specifications/terminal-state-rfc.md));
rich scene animation inside a `Rich` or `Browser` `View`
([Rich Presentation RFC](../../specifications/rich-presentation-rfc.md));
language-level animation APIs for plugins (candidate, not scoped here); and the
platform surface contract owned by `bitty-platform` and `bitty-render`.

## Goals and non-goals

Goals:

- a small, bounded transition set that stays predictable and fails closed;
- animation work that never enters the VT hot path and never regresses PB-1
  through PB-7;
- a real reduced-motion path, including `bitty --safe`, that yields instant
  final geometry rather than a degraded intermediate state;
- an extensible-but-bounded surface: named easings and theme presets, not
  free-form scripting.

Non-goals:

- no continuous, looping, or always-on animation;
- no per-frame animation of terminal grid contents, cursor blink, or scroll;
- no plugin-defined shaders, native in-process effects, or install scripts;
- no promise of compositor-side effects on a platform that cannot provide them.

## Transition set

Candidate transitions, all presentation-only:

| Transition       | Trigger                                              | Default effect                    | Notes                                                              |
| ---------------- | ---------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------ |
| Panel open       | `View` becomes occupied or a Panel is shown          | short fade plus inset settle      | never waits on PTY readiness; the terminal grid is not animated    |
| Panel close      | `View` becomes empty or hidden, or a Panel is hidden | short fade plus inset collapse    | the final removed state is committed at animation end or on cancel |
| Focus change     | focused `View` changes                               | outline color cross-fade (OQ-039) | geometry does not move; only the border color interpolates         |
| Workspace switch | active `Workspace` changes                           | bounded cross-fade                | optional; `--safe` and reduced motion render it instantly          |

Rules:

1. Terminal content, cursor, selection, and scrollback are never interpolated;
   only Core-owned chrome (`border`, `radius`, `content_inset`, and the
   workspace background layer) may animate.
2. Each transition animates from a committed start snapshot to a committed end
   snapshot. If the end snapshot is invalidated mid-transition, the animation
   is cancelled and the latest committed state is applied immediately.
3. A transition never blocks input routing, PTY reads, or the damage-to-present
   path; it is a presentation-only overlay on already-computed geometry.
4. No transition loops. Repeating a trigger restarts a bounded transition and
   never accumulates unbounded work.

## Duration and easing: defaults and bounds

Candidate defaults for ratification:

| Transition       | `duration_ms` default | Easing default | Runtime bound |
| ---------------- | --------------------- | -------------- | ------------- |
| Panel open       | `150`                 | `ease_out`     | `0..=500` ms  |
| Panel close      | `120`                 | `ease_in`      | `0..=500` ms  |
| Focus change     | `100`                 | `ease_in_out`  | `0..=500` ms  |
| Workspace switch | `200`                 | `ease_in_out`  | `0..=500` ms  |

Candidate contract:

- every duration is an integer in milliseconds in `0..=500`; `0` means instant
  and is never an error;
- the easing set is a closed enum: `linear`, `ease_in`, `ease_out`,
  `ease_in_out`, `spring`; a custom cubic-Bézier quadruple is a candidate
  extension left to OQ-040, not part of the v1 grammar;
- unknown easings and out-of-range durations fail `ConfigPlan` validation with
  a source-attributed diagnostic and never clamp silently;
- the `500` ms ceiling is a hard bound, not a default: it keeps every transition
  inside a bounded number of frames and prevents a continuously-animating
  surface from defeating the frame-on-demand rule;
- Hyprland expresses duration in deciseconds (`1ds = 100 ms`) and defines
  named Bézier curves; Bitty uses explicit milliseconds and a closed easing
  enum, and does not accept Hyprland `animation`/`bezier` syntax.

## Present-path performance budget

Animations must not regress the accepted budgets in the
[Performance Budget RFC](../../specifications/performance-budget-rfc.md):
PB-4 (input latency), PB-7 (idle resource usage), and the frame-on-demand rule.
Candidate budget rules:

1. **Frame-on-demand only.** A frame is scheduled while at least one animation
   is active; when the last animation ends, present returns to idle with zero
   periodic wakeups attributable to Bitty (PB-7). No animation schedules a
   timer after completion.
2. **Chrome-only cost.** An active animation interpolates already-computed
   chrome values; it must not trigger a VT parse, grid damage, or terminal
   snapshot rebuild, so PB-4 key-to-screen latency is unchanged.
3. **Per-frame ceiling.** Animation frame work must stay within the existing
   presentation frame budget and must not increase p99 present time beyond the
   existing missed-present threshold. The exact microsecond ceiling is an
   implementation measurement belonging to the owning repository.
4. **Bounded concurrency.** At most one active animation per surface and a
   bounded number of concurrently animating surfaces (candidate `8`) are
   allowed; excess triggers commit their end state immediately.
5. **Soak neutrality.** Repeated open/close/focus cycles must be
   allocation-stable and must not grow resident memory beyond the PB-3 growth
   bound.
6. Because the budgets in the Performance Budget RFC are not yet measured, this
   RFC sets design constraints only; a future accepted revision must cite
   measured evidence before any of these become hard gates.

## Reduced motion and safe mode

Candidate contract for ratification:

- `appearance.animations.reduced_motion` is a bounded enum `auto` (default),
  `always`, or `never`;
- `auto` follows the platform reduced-motion signal where one exists, and
  otherwise animates; `always` forces `0` ms durations; `never` ignores the
  platform signal but still respects the duration bounds;
- `bitty --safe` forces `0` ms durations regardless of configuration and the
  platform signal, and no transition waits on a frame;
- reduced motion and safe mode still apply the final committed geometry and
  color; they only remove interpolation, never the state change itself.

## Renderer-side versus compositor-side

| Effect                                   | Owner                         | Rationale                                                                       |
| ---------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------- |
| In-`Window` chrome transitions           | renderer (`bitty-render`)     | geometry and decoration are Core-owned and already computed in `Workspace`      |
| Focus outline cross-fade (OQ-039)        | renderer                      | it interpolates one Core-owned border color per `View`                          |
| Workspace cross-fade inside the `Window` | renderer by default           | no native surface swap is required                                              |
| Whole-native-surface or OS-level effects | platform compositor, optional | platform-gated and best-effort; an unsupported platform renders the final state |

Rules:

1. The default contract is renderer-side: no animation requires a platform
   compositor protocol, a native plugin, or a shader pass.
2. A compositor-side whole-surface effect may be used only where
   `bitty-platform` already exposes a bounded surface, and it must degrade to
   the renderer-side (or instant) path when unavailable rather than failing
   startup.
3. No plugin may animate Core-owned chrome; plugins may animate only their own
   declarative scene nodes under the [Rich Presentation RFC](../../specifications/rich-presentation-rfc.md)
   budget, which is a separate contract.

## Lua exposure and reload

Candidate schema for ratification:

```lua
-- Candidate API only; not a shipped key.
return {
    appearance = {
        animations = {
            enabled = true,
            duration_ms = {
                open = 150,
                close = 120,
                focus = 100,
                workspace = 200,
            },
            easing = {
                open = "ease_out",
                close = "ease_in",
                focus = "ease_in_out",
                workspace = "ease_in_out",
            },
            reduced_motion = "auto",
        },
    },
}
```

Rules:

- `appearance.animations` deep-merges as a table while each field is
  scalar-replace with per-field source attribution, matching the existing
  configuration model;
- `enabled = false` and `reduced_motion = "always"` are equivalent to `0` ms
  durations and keep the final-state contract;
- the table reloads `Live` when the renderer can hot-apply it; otherwise the
  affected field is `restart-required`, and that classification must be
  documented before shipment;
- `appearance.theme` remains the one existing `appearance.*` exception in
  [RFC-0001](RFC-0001-appearance-configuration.md); `appearance.animations` is
  a new, animation-owned table and does not migrate existing keys.

## Extensibility

The user goal is a customizable, extensible appearance. Candidate direction:

- a closed set of transition leaves, duration fields, and easings is the v1
  surface; arbitrary user functions, loops, and scripts are not admitted;
- themes may ship an `animations` preset that supplies defaults, and a user
  layer overrides them field by field;
- new named easings or transition leaves are added by reviewed extension of
  this RFC, not by runtime registration from a plugin;
- a future bounded custom-Bézier surface (four control points in `[0, 1]`) is
  the natural next extension and is tracked under OQ-040 rather than promised
  here.

## Security review

- Animations are presentation data, not Terminal Truth, and must not mutate
  grid, cursor, modes, or scrollback.
- The contract introduces no ambient file, network, or process capability and
  no native in-process plugin, install script, or shader.
- Durations, easings, and counts are typed, bounded, and fail-closed at
  `ConfigPlan`; a malformed value never degrades silently to an unbounded or
  continuous animation.
- Because a looping animation defeats frame-on-demand, the bounded-duration and
  no-loop rules are security-relevant resource controls, not only aesthetics.
- Core owns the transition surface; no plugin may animate Core-owned chrome.

## Compatibility and migration

No behavior changes in this RFC. Every proposed key is additive, and defaults
preserve the current instant (non-animated) appearance when `enabled = false`;
removed or renamed keys would require a migration note under the
[documentation workflow](../../development/documentation-workflow.md).

## Verification obligations (future)

An accepted animation RFC must define, at minimum: headless tests for
fail-closed duration/easing validation and bounds; present-path tests proving a
completed animation returns to zero periodic wakeups (PB-7); latency tests
proving PB-4 is unchanged; reduced-motion and `--safe` tests proving instant
final-state application; and soak tests for allocation stability. Evidence
belongs in `bitty`; this RFC records the contract only.

## Open questions

- **OQ-040** — which transitions animate, the bounded duration/easing grammar,
  the reduced-motion and safe-mode behavior, the renderer/compositor split, the
  present-path budget, and the customization surface.

OQ-040 is `Open` in the [open-question register](../open-questions.md) and has
no acceptance evidence. The focused/idle outline color that a focus transition
interpolates is [OQ-039](RFC-0001-appearance-configuration.md), tracked with
[RFC-0001](RFC-0001-appearance-configuration.md).

## Recommended defaults for ratification

The commander should request user ratification of these before any animation
key is accepted:

- transition durations: open `150` ms, close `120` ms, focus `100` ms,
  workspace switch `200` ms; hard bound `0..=500` ms;
- easings: `ease_out` open, `ease_in` close, `ease_in_out` focus and
  workspace; closed enum `linear | ease_in | ease_out | ease_in_out | spring`;
- `appearance.animations.enabled = true`;
- `appearance.animations.reduced_motion = "auto"`;
- renderer-side transitions by default, compositor-side effects best-effort and
  platform-gated;
- `bitty --safe` and `always` reduced motion force `0` ms durations.

## References

- [Appearance Configuration RFC](RFC-0001-appearance-configuration.md)
  (OQ-036 through OQ-039).
- [Workspace Compositor Specification](../../specifications/workspace-compositor.md)
  (accepted Core-owned decoration and Hyprland import rules).
- [Performance Budget RFC](../../specifications/performance-budget-rfc.md)
  (PB-1 through PB-7).
- [Configuration Model RFC](../../specifications/configuration-model-rfc.md).
- [Rich Presentation RFC](../../specifications/rich-presentation-rfc.md).
- [Core and Plugin Boundaries](../../architecture/core-boundaries.md).
- [Security Overview](../../security/overview.md) and
  [Threat Model](../../security/threat-model.md).
- Hyprland: read-only philosophy reference for tiling transitions and named
  Bézier curves; Bitty does not embed Hyprland code or accept its
  configuration syntax.
