---
title: Appearance Configuration RFC
description: Accepted focus and idle outline color contract plus proposed per-View appearance override and outline-width candidate layers and the remaining appearance knob proposals exposed through init.lua
category: decisions
audience: contributor
document_type: specification
status: accepted
website_publish: true
sidebar_order: 45
---

# Appearance Configuration RFC

> Status: **accepted** on 2026-09-12 by the project initiator (ratification of
> the PR #212 recommended defaults; independent design review APPROVE).
> Acceptance covers the focused/idle outline color contract
> ([OQ-039](../open-questions.md)): the
> `decoration.border_color_focused` / `decoration.border_color_idle` pair, the
> `#RRGGBB` / `#RRGGBBAA` grammar, the resolution order, `live` reload, and the
> `--safe` pair. A 2026-09-12 amendment adds the **per-View/per-panel appearance
> override layer** as a reviewed candidate surface
> ([OQ-041](../open-questions.md)): `views.<selector>.*` overrides, precedence,
> inheritance, live reload, fail-closed validation, and safe mode. A second
> 2026-09-12 amendment adds the **focus/idle outline width contract** as a
> reviewed candidate ([OQ-045](../open-questions.md)): the
> `decoration.border_width` / `_focused` / `_idle` triple, logical-px bounds,
> live reload, DPI scaling, and the non-color cue it gives the accepted AC-2
> rule. The amendments are reviewed contracts, not accepted or implemented
> features; they leave the global OQ-039 pair accepted and unchanged, and the
> width keys remain candidate and unshipped. They do not accept the label
> position ([OQ-036](../open-questions.md)), base frame/margin-line color
> ([OQ-037](../open-questions.md)), background opacity/blur
> ([OQ-038](../open-questions.md)), background images
> ([OQ-042](../open-questions.md)), or per-panel animation overrides
> ([OQ-043](../open-questions.md)), which remain `Open`. Acceptance is a
> reviewed contract, not implementation evidence: no product code ships and no
> key is supported until `bitty` implements it. It does not weaken any normative
> control in the [Security Overview](../../security/overview.md),
> [Threat Model](../../security/threat-model.md), or the
> [Configuration Model RFC](../../specifications/configuration-model-rfc.md).
> The supported-knob entries below are implementation-derived reference read
> read-only from `bitty` `origin/main` `d9f5b49`; everything else is candidate.
> The accepted animation contract is
> [RFC-0002](RFC-0002-panel-animations.md). The cross-cutting extension
> architecture is reviewed in the
> [UI Extensibility Architecture](../../specifications/ui-extensibility-architecture.md)
> (candidate).

## Motivation

User direction (bitty `CTX-0335`, 2026-09-11): everything visual should be
configurable from `init.lua` — gap sizes, workspace/tab label position
(top/bottom/left/right), border or margin-line color, background opacity, and
blur amount. Some of these already ship and only need to be documented; others
need a renderer or compositor design and must not be claimed before that design
is reviewed.

This RFC separates the two: it records the already-supported surface as
reference and proposes candidate contracts plus open questions for the rest.

## Purpose and scope

In scope: the appearance portion of the `init.lua` surface, the precedence
between the two gap layers, and candidate contracts for label placement,
frame/color, per-surface opacity, and blur under the existing `ConfigPlan`
validation, layering, attribution, and reload rules.

Out of scope and owned elsewhere: the compositor geometry contract
([Workspace Compositor Specification](../../specifications/workspace-compositor.md)),
the merge/reload mechanics ([Configuration Model RFC](../../specifications/configuration-model-rfc.md)),
theme preset values and their security posture
([Security Overview](../../security/overview.md)), and any shared-memory or
platform-surface contract owned by `bitty-platform` and `bitty-render`.

## Goals and non-goals

Goals:

- one coherent, documented appearance surface with the same fail-closed,
  bounded, source-attributed behavior as the rest of `ConfigPlan`;
- explicit precedence between the cell-unit `layout.*` gaps and the pixel-unit
  `decoration.*` gaps;
- a documented reload class for every knob;
- reviewed decisions, not assumptions, for label placement, color, opacity, and
  blur before any of them ships.

Non-goals:

- no product code and no rendering change in this RFC;
- no plugin- or theme-owned mutation of Core-owned chrome;
- no free-form CSS-like styling or per-pixel control;
- no blur or transparency promise on a platform whose compositor cannot provide
  it.

## Already-supported appearance knobs (implementation reference)

Status: read-only reference from `bitty` `origin/main` `d9f5b49`. The owning
configuration contract is the
[Configuration Model RFC](../../specifications/configuration-model-rfc.md); the
shipped reference prose is [Lua and XDG](../../configuration/lua-and-xdg.md).
`decoration.content_inset` and the unified `decoration.gaps_in` default are the
`CTX-0333` amendment (`bitty` PR #562); they are not yet merged into `bitty`
`origin/main`.

| `init.lua` key                     | Default                   | Range or values              | Reload           |
| ---------------------------------- | ------------------------- | ---------------------------- | ---------------- |
| `appearance.theme` (alias `theme`) | `bitty-dark` (alias dark) | preset name or unknown       | restart-required |
| `font.family`                      | `JetBrainsMono Nerd Font` | non-empty, `<= 128` bytes    | live             |
| `font.size`                        | `12.0`                    | `(0, 128]`                   | live             |
| `font.line_height`                 | `1.375`                   | `[1.0, 2.0]`                 | live             |
| `font.letter_spacing`              | `2.0`                     | `[0.0, 8.0]`                 | live             |
| `window.opacity`                   | `1.0`                     | `[0.0, 1.0]`                 | live             |
| `window.padding`                   | `8`                       | `0..=64` logical px          | live             |
| `window.radius_px`                 | `0`                       | `0..=24` physical px         | live (no-op S0)  |
| `layout.gaps_in`                   | `0`                       | `0..=16` cells               | live             |
| `layout.gaps_out`                  | `0`                       | `0..=16` cells               | live             |
| `decoration.gaps_in`               | `4` (CTX-0333: `6`)       | `0..=32` logical px          | live             |
| `decoration.gaps_out`              | `6`                       | `0..=32` logical px          | live             |
| `decoration.border`                | `2`                       | `0..=8` logical px           | live             |
| `decoration.radius`                | `6`                       | `0..=16` logical px          | live             |
| `decoration.content_inset`         | `6` (CTX-0333)            | `0..=32` logical px          | live             |
| `scrollbar.mode`                   | `hidden`                  | `hidden` / `always` / `auto` | live             |
| `scrollbar.width`                  | `8`                       | `1..=32` logical px          | live             |

Notes:

- `appearance.theme` wins over the top-level `theme` alias; an unknown preset
  falls back to the built-in default with a logged fallback (CTX-0169/CTX-0180).
- `window.opacity` is **whole-window** opacity from the presentation path; it is
  not a per-surface or background-only knob (see OQ-038).
- `window.radius_px` is currently a parsed no-op (CTX-0241 S0); document it as
  a knob but do not describe a visible rounding effect.
- `decoration.*` values are validated, stored, and attributed, but live
  painting of px decoration is deferred (`bitty` CTX-0294), so they are not a
  visible change yet.

## Requested knobs and disposition

| Requested knob                                    | Current support                           | Disposition                             |
| ------------------------------------------------- | ----------------------------------------- | --------------------------------------- |
| Gap sizes                                         | `layout.*` (cells) + `decoration.*` (px)  | Supported; document precedence (below)  |
| Workspace/tab label position (T/B/L/R)            | None                                      | Proposal + OQ-036                       |
| Border / margin-line and focus/idle outline color | None; colors live in theme presets only   | OQ-037 proposal; OQ-039 accepted        |
| Background opacity                                | Whole-window `window.opacity` only        | Proposal + OQ-038 (render/compositor)   |
| Blur amount                                       | None                                      | Proposal + OQ-038 (render/compositor)   |
| Per-surface content inset                         | `decoration.content_inset` (all surfaces) | Follow-up from CTX-0333 (linked, below) |

## Gap sizes: supported, precedence documented

The two gap layers are distinct and must not be conflated:

- `layout.gaps_in` / `layout.gaps_out` are integer **cells** and paint as
  background-colored cell bands (CTX-0177/CTX-0240);
- `decoration.gaps_in` / `decoration.gaps_out` are logical **pixels** and are
  Core-owned frame decoration (CTX-0292/CTX-0333).

Candidate clarification (no new key): the effective gap is
`decoration.gap * DPI_scale + layout.gap_cells * cell_axis`, so the two layers
compose. With the default `layout` gaps of `0`, the effective gap is the
`decoration` value. This matches the `CTX-0333` model documented in the
[Workspace Compositor Specification](../../specifications/workspace-compositor.md).

## Label position: proposal (OQ-036)

Candidate: a bounded enum `label.position = "top" | "bottom" | "left" | "right"`,
default `"top"`, with the label bar reserved outside the content rectangle so
grid geometry and hit testing stay unchanged.

Candidate constraints for review:

- placement is per `View` type (terminal, panel, rich) and may be overridden per
  workspace; unknown values fail closed;
- `left`/`right` labels must reserve a bounded horizontal strip; text truncates
  with an ellipsis and never wraps into the terminal grid;
- label content is presentation-only and never Terminal Truth;
- label rendering must not run on the VT hot path and must respect the same
  resource ceilings as other chrome.

Open: whether labels are always-on, opt-in, or driven by the focus/zoom mode;
whether the label bar is Core-owned or theme-provided. Tracked as OQ-036.

## Border and margin-line color: proposal (OQ-037)

Candidate: extend the Core-owned decoration surface with a color knob, for
example `decoration.border_color = "#RRGGBB[AA]"`, defaulting to a theme token
so existing behavior is unchanged. The margin line uses the same color with a
theme-provided alpha.

Candidate constraints for review:

- color parsing is bounded and fail-closed; no CSS selectors, gradients, or
  images;
- the value is Core-owned chrome, not a plugin hook; a project or user layer may
  set it, matching the existing decoration merge class;
- accessibility: the renderer must keep a documented minimum contrast between
  the frame and its content, or the theme must supply a compliant default;
- unknown color spellings fail validation naming `decoration.border_color`.

Open: whether color belongs under `decoration.*`, under a broader
`appearance.*` palette, or is resolved only through theme presets. Tracked as
OQ-037. The focused/idle pair that refines this base color is OQ-039 below.

### Focus and idle outline colors: accepted (OQ-039)

Ratified 2026-09-12 (PR #212 recommended defaults; independent design review
APPROVE). User direction (bitty `CTX-0340`, m0298) asks for distinct focused and
idle panel outlines. Accepted: extend the Core-owned `decoration.*` surface with
a focus/idle color pair so each `View` frame renders a focused outline (accent)
and an idle outline (subtle) without a plugin hook. This refines the base
`decoration.border_color` proposal above instead of replacing it.

Accepted keys:

| `init.lua` key                    | Default     | Values                  | Reload |
| --------------------------------- | ----------- | ----------------------- | ------ |
| `decoration.border_color`         | unset       | `#RRGGBB` / `#RRGGBBAA` | live   |
| `decoration.border_color_focused` | `#33CCFF`   | `#RRGGBB` / `#RRGGBBAA` | live   |
| `decoration.border_color_idle`    | `#595959AA` | `#RRGGBB` / `#RRGGBBAA` | live   |

Accepted resolution order (later wins): theme token (`border.focused`,
`border.idle`) then `decoration.border_color` then the explicit
`decoration.border_color_focused` / `decoration.border_color_idle` pair. The
pair is evaluated per `View` at paint time from Core focus state; a plugin
never sets it.

Reviewer clarification (non-blocking note a): only an explicit user value for a
pair member overrides the resolved `decoration.border_color`; an unset pair
member inherits the base and never silently shadows it. A user who sets only
`decoration.border_color` keeps that color for both focus states.

Value format: canonical `#RRGGBB` or `#RRGGBBAA` (the 8-digit form is RGBA byte
order). Alpha defaults to `FF` when omitted; `#RGB` shorthand is a candidate
for review. Named colors, `rgb()`/`rgba()` function syntax, gradients, images,
and CSS selectors are rejected fail-closed with a diagnostic naming the
offending key. This is stricter than Hyprland, which also accepts `rgba()` and
legacy ARGB integers; Bitty accepts one canonical grammar so merged layers stay
byte-comparable.

Accepted constraints:

- namespacing: the pair lives under the Core-owned `decoration.*` surface with
  the existing scalar-replace, per-field attribution, and `Live` reload class;
- scope: global for all `View` borders by default; a per-View-type override
  table is deferred to a future revision, not part of this key set;
- theme interaction: a theme preset supplies the token defaults; explicit user
  keys override the preset, and `appearance.theme` reload stays
  `restart-required`;
- safe mode: `bitty --safe` ignores user and preset color values and forces an
  opaque built-in pair (`#FFFFFF` focused, `#808080` idle, alpha `FF`) that
  passes the contrast rules below;
- the base `decoration.border_color` and the pair are presentation-only chrome;
  no plugin or `LayoutProvider` may set them at runtime.

Accepted minimum-contrast rule (resolving the contrast half of OQ-039):

| Rule | Requirement                                                                                                                          | Enforcement                                                               |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| AC-1 | focused outline >= 3:1 contrast against the adjacent `Workspace` background (WCAG 2.1 SC 1.4.11 non-text contrast)                   | `ConfigPlan` rejects a violating resolved pair fail-closed                |
| AC-2 | focused outline >= 3:1 against the idle outline, or an enabled non-color focus cue (focused border thickness >= idle + 1 logical px) | `ConfigPlan` rejects a violating pair unless the non-color cue is enabled |
| AC-3 | idle outline >= 1.5:1 contrast against the background                                                                                | `bitty config check` advisory only; subtlety remains allowed              |

Reviewer note (non-blocking note c, amended 2026-09-12): AC-2 depends on a
non-color focus cue (focused border thickness >= idle + 1 logical px). That
cue is now **specified** as the candidate outline-width contract below
([OQ-045](../open-questions.md)); it is still not a shipped contract, so until
`bitty` implements it the pair must satisfy focused >= 3:1 against idle. The
cue is no longer an unrecorded gap: AC-2 may be satisfied either by the color
delta or by a documented non-color cue (the width delta being the natural
one), and enforcement follows the same fail-closed rule. The width keys remain
candidate and unshipped; this note records the design, not an implementation.

Contrast is computed on the resolved sRGB bytes with the WCAG
relative-luminance formula against the theme surface color at the configured
opacity. The `3:1` value is the WCAG AA non-text threshold; `1.5:1` is a
design-advisory floor accepted here, not a normative accessibility claim.

Resolved for OQ-039: the pair is `decoration.*`; `#RGB` shorthand is not
accepted in v1; a failing idle contrast stays advisory; and safe mode keeps a
distinct idle color (`#808080`). The OQ-039 scope note said per-View-type
overrides were "deferred to a future revision". That sub-question is now
reconciled by the per-View override layer below: the _global_ pair stays as
accepted, and a new, separately reviewed override contract
([OQ-041](../open-questions.md)) is registered rather than retroactively
widening OQ-039. `#RGB` shorthand remains deferred follow-up work.

## Focus and idle outline width: reviewed candidate (OQ-045)

Direction (user requirement, docs `CTX-0157` follow-up m0313/m0315, 2026-09-12):
the **focused outline width must be configurable**, and every appearance
property must be discussed in this corpus rather than left implicit. The
accepted OQ-039 pair already colors the focused and idle outlines; this
candidate adds the matching **width** triple so a focused `View` can read
thicker than an idle one.

This section is a **reviewed candidate** for a future revision. It is recorded
here, not marked accepted, because it adds new keys, changes the frame
geometry contract, and depends on the same deferred px-decoration painting as
`decoration.border`. No key below is accepted or shipped.

### Candidate keys

Candidate `init.lua` surface (all logical px, matching `decoration.border`):

| Candidate key                     | Default                                                     | Values              | Reload |
| --------------------------------- | ----------------------------------------------------------- | ------------------- | ------ |
| `decoration.border_width`         | inherits `decoration.border` (current accepted default `2`) | `0..=16` logical px | live   |
| `decoration.border_width_focused` | inherits `decoration.border_width`                          | `0..=16` logical px | live   |
| `decoration.border_width_idle`    | inherits `decoration.border_width`                          | `0..=16` logical px | live   |

Candidate resolution order (later wins): the accepted `decoration.border`
value, then `decoration.border_width` (base), then the explicit
`decoration.border_width_focused` / `decoration.border_width_idle` pair. An
unset base or pair member inherits the next-less-specific value and never
silently shadows it, mirroring the accepted OQ-039 color rule. A user who sets
only `decoration.border_width` keeps that width for both focus states.

Candidate constraints:

- **Bounds are fail-closed.** Integer logical px in `0..=16`, a
  deliberately wider ceiling than the accepted `decoration.border` `0..=8`
  range because a focused outline may need to stand out from a thick idle one.
  A value outside `0..=16`, a non-integer, or an unknown key is rejected by
  `ConfigPlan` with a source-attributed diagnostic naming the offending key;
  Core never clamps silently.
- **Live reload, whole-reload fail-closed.** A valid width change is `live`
  and repaints at the next present tick with no grid damage. If any value in
  the reload fails validation, the **entire** reload is rejected: the previous
  resolved geometry stays in effect and no partial or clamped width is
  applied.
- **Safe mode.** `bitty --safe` ignores user and preset width values and forces
  a built-in pair — focused `1`, idle `1` (equal, no width cue) with the
  accepted safe colors `#FFFFFF` / `#808080` — so safe mode never relies on a
  width cue for focus. Safe mode never leaves an override in effect.
- **DPI scaling.** Values are integers in logical px and are scaled by the
  `Window` DPI factor only at render time, exactly like `decoration.border`;
  layout math stays in logical pixels, and the focused/idle delta is therefore
  `>= 1` logical px at any DPI. The candidate preserves the accepted rule that
  the content rectangle is the frame inset by `border + content_inset`; a
  focused width change must not move the content grid, so the frame is drawn
  inside the `View` rectangle and the focused delta is absorbed by the frame,
  not by content reflow.
- **Per-View override interaction.** `decoration.border_width`,
  `_focused`, and `_idle` are ordinary fields in the `views.<selector>.*`
  override model below: each resolves **per field per `View`** under the same
  selector tiers and order-independent precedence, with unknown fields failing
  closed. Setting only `border_width_focused` in a `views` entry does not reset
  an inherited `border_width_idle`. AC-1..AC-3 contrast is evaluated on the
  resolved per-`View` color pair independently of width.
- **Non-color cue for AC-2.** `border_width_focused > border_width_idle` is the
  natural non-color focus affordance the accepted AC-2 rule referenced. When
  the resolved pair has a focused width at least `idle + 1` logical px, a
  focused/idle color pair that fails the `3:1` threshold may still satisfy AC-2
  through the width cue; otherwise the color pair must meet `3:1`. This
  resolves the design half of the AC-2 gap recorded above, but it is not
  implementation evidence: the keys stay candidate until `bitty` ships them.
- **Reference semantics.** This mirrors Hyprland's `border_size` (base),
  `active_border` and `inactive_border` (focused/idle) distinction, adapted to
  Bitty's `View` vocabulary: Bitty keeps one Core-owned `decoration.*`
  namespace, one canonical unit (logical px), and per-field fail-closed
  resolution rather than Hyprland's per-window rule syntax.

### Interaction with OQ-039 and OQ-041

- **OQ-039 (accepted):** the accepted color pair and its AC-1..AC-3 rule are
  unchanged. The width triple only supplies the non-color cue AC-2 already
  allowed.
- **OQ-041 (candidate):** the width fields join the override field set below;
  they do not alter the selector grammar, precedence tiers, or reload rules.
- **OQ-042/OQ-043/OQ-044 (open):** unaffected; background images, per-panel
  animations, and plugin-supplied appearance remain separate.

## Per-View and per-panel appearance overrides: reviewed candidate (OQ-041)

Direction (user directive, bitty `CTX-0357` / docs `CTX-0157`, 2026-09-12):
every `View` (leaf) and panel surface must support **independent** appearance
properties — per-panel opacity, blur, background image, border/outline color,
and animation options — instead of one global look, so the UI is freer and
plugins can extend it. This is the appearance half of that directive; the
extension-architecture half is the
[UI Extensibility Architecture](../../specifications/ui-extensibility-architecture.md).

This section is a **reviewed candidate** for a future revision. It is recorded
here, not marked accepted, because it changes the OQ-039 contract from a single
global pair to a resolved per-`View` value and needs its own acceptance
(ADR/RFC update) plus renderer evidence before any key ships.

### Key grammar

Candidate: a `views` table keyed by a bounded selector, where each entry is an
override of already-defined appearance fields. The selector is one of:

```lua
-- Candidate schema only; not a shipped key.
return {
    views = {
        ["*"] = { opacity = 0.95 },                    -- all views (global-ish)
        terminal = { border_color_focused = "#33CCFF" },-- per View/content type
        rich = { opacity = 1.0 },
        browser = { blur = 8 },
        ["ws:2"] = { opacity = 0.8 },                  -- per Workspace label
        ["view:7"] = { border_color_idle = "#444444AA" }, -- exact ViewId
    },
}
```

Candidate selector grammar, most specific wins:

| Selector form     | Matches                                       | Example    |
| ----------------- | --------------------------------------------- | ---------- |
| `"*"`             | every `View` in every `Workspace`             | `["*"]`    |
| view/content type | `terminal`, `rich`, `browser` (`ViewContent`) | `terminal` |
| `"ws:<label>"`    | every `View` in the named `Workspace`         | `"ws:2"`   |
| `"view:<ViewId>"` | exactly one `View` by stable `ViewId`         | `"view:7"` |

Candidate override fields, all optional and each defaulting to the resolved
global value:

| Field                  | Source of the global default           |
| ---------------------- | -------------------------------------- |
| `opacity`              | `window.opacity` until OQ-038 resolves |
| `blur`                 | unset until OQ-038 resolves            |
| `background_image`     | unset until OQ-042 resolves            |
| `border_color`         | `decoration.border_color` (OQ-037)     |
| `border_color_focused` | `decoration.border_color_focused`      |
| `border_color_idle`    | `decoration.border_color_idle`         |
| `border_width`         | `decoration.border_width` (OQ-045)     |
| `border_width_focused` | `decoration.border_width_focused`      |
| `border_width_idle`    | `decoration.border_width_idle`         |

Animation options are part of the user directive but are **not** in this
candidate's key set; they are deferred to [OQ-043](../open-questions.md) and
the global `appearance.animations.*` contract is unchanged until then. Unknown
selector forms, unknown fields, and unknown `views.*` keys fail closed with a
source-attributed diagnostic naming the offending key; they are never silently
ignored.

### Precedence and inheritance

Candidate resolution order, later wins, evaluated per field per `View`:

```text
built-in safe defaults
  -> appearance.theme preset tokens
  -> global decoration.* / window.* (and appearance.animations.* if OQ-043 admits it)
  -> views["*"]
  -> views["<content-type>"]
  -> views["ws:<label>"]
  -> views["view:<ViewId>"]
```

Rules:

1. Resolution is per field, not per table: a later selector that sets only
   `opacity` does not reset an inherited `border_color_focused`.
2. Selector tiers are ordered `* < content-type < ws: < view:` regardless of
   declaration order in `init.lua`; a `view:` entry always beats a `ws:` entry
   for the same field, so two `init.lua` files that declare the same selectors
   in different order resolve identically. This keeps merged layers
   byte-comparable, matching the configuration model.
3. A `ViewId` selector follows the `View` across workspace moves because
   `ViewId` is stable for the `View` lifetime; a `Terminal` rebind does not
   change the `View` selector match. `ws:` selectors follow the `Workspace`.
4. The resolved value is presentation-only state on the `Workspace`/`View`
   presentation record; it never enters `bitty-term-state`.

### Live reload and fail-closed validation

Candidate: the override table follows the existing `ConfigPlan` rules —
typed, bounded, scalar-replace per field with source attribution, and a
documented reload class.

- A change to a value that the renderer can hot-apply is `live`; the affected
  `View`s repaint at the next present tick with no grid damage.
- A selector that adds or removes a `view:`/`ws:` match is also `live`; it
  re-resolves the affected `View` set without recreating a `View` or
  `Terminal`.
- If a new value fails validation, the entire reload is rejected fail-closed:
  the previous resolved appearance stays in effect and a source-attributed
  diagnostic names the key. The renderer never applies a partial or clamped
  override.
- Unknown fields and malformed selectors are rejected at `ConfigPlan`
  validation, not at paint time.

### Safe-mode behavior

Candidate: `bitty --safe` ignores every `views.*` override, including `"*"`,
and forces the safe global values already defined for OQ-039
(`#FFFFFF` focused, `#808080` idle, opaque), opacity `1.0`, no blur, and no
background image. Safe mode never leaves an override in effect, even one that
would otherwise pass validation.

### Composition with OQ-039 and OQ-040

- **OQ-039 (accepted):** the accepted global pair remains the base value. The
  override layer only refines it per `View`; acceptance does not reopen the
  global OQ-039 defaults, grammar, or contrast rule.
- **Contrast:** AC-1..AC-3 must be evaluated on each resolved per-`View` pair,
  not only the global pair. A per-`View` override that violates AC-1/AC-2 fails
  validation; the idle-only advisory AC-3 stays advisory.
- **Width cue (OQ-045):** the candidate outline-width triple is part of this
  override model; `border_width` / `_focused` / `_idle` resolve per field per
  `View`, and a focused width at least `idle + 1` logical px satisfies the AC-2
  non-color cue independently of the color pair. The keys stay candidate.
- **OQ-040 (accepted):** per-panel animation _options_ are part of the user
  directive but not part of this candidate; they are registered as
  [OQ-043](../open-questions.md). Until OQ-043 resolves, `views.<selector>`
  does not accept an `animations` table, and the global
  `appearance.animations.*` contract is unchanged.
- **Plugin interaction:** the override layer is Core-owned configuration. A
  plugin may not set `views.*`, `decoration.*`, or `window.*` at runtime; the
  authority question for plugin-supplied appearance is
  [OQ-044](../open-questions.md) and is not granted here.

### Background images: separate open contract (OQ-042)

Per-panel background images are part of the user directive but are deliberately
**not** specified in this candidate. An image path or image payload crosses the
same trust boundary as image-file access in the
[Security Overview](../../security/overview.md): deny by default, regular-file
and safe-path checks, decoded-size/dimension/aggregate limits, and no ambient
filesystem authority. The format, size limits, decoding path, cache budget,
tiling/scaling/fit semantics, alpha/DPI interaction, and whether a plugin may
supply an image are unresolved and tracked as
[OQ-042](../open-questions.md).

## Background opacity and blur: proposal (OQ-038)

`window.opacity` already exposes whole-window opacity. Two harder requests
remain:

- **background opacity**: a per-surface or background-only opacity that keeps
  text opaque while the terminal/panel background is translucent. This needs a
  renderer decision on premultiplied compositing and a platform surface with a
  real alpha channel.
- **blur amount**: a bounded blur radius applied behind translucent chrome.
  This needs a compositor integration (for example a Wayland blur protocol on
  Linux, a platform-specific equivalent elsewhere) or a shader pass, plus a
  performance budget.

Candidate direction (design only, not committed):

- keep `window.opacity` as the whole-window scalar;
- add `window.background_opacity` (or a per-surface equivalent) only if the
  renderer can composite it without changing Terminal Truth;
- treat blur as platform-gated and best-effort: an unsupported platform renders
  no blur rather than failing startup; the value is still validated and bounded;
- bound blur radius (for example `0..=32` logical px) and charge it against the
  presentation performance budget (PB-1/PB-2 family).

Because both knobs cross the renderer/compositor boundary, they need an accepted
render or platform contract before any config key ships. Tracked as OQ-038.

## Follow-up from CTX-0333

The `CTX-0333` amendment applies `decoration.content_inset` uniformly to every
surface. A per-surface inset (for example a smaller inset for terminal content
than for panels) is a design decision raised by `bitty` PR #562 and recorded as
an open item in the
[Workspace Compositor Specification](../../specifications/workspace-compositor.md).
It is not part of this RFC's proposed key set until that decision is reviewed.

## Naming, layering, and reload

Candidate conventions for review:

- reuse existing namespaces: `window.*` for window/compositor properties,
  `font.*` for text, `decoration.*` for Core-owned frame chrome, `layout.*` for
  cell layout. Do not introduce a parallel `appearance.*` block for values that
  already have an owner (`appearance.theme` stays the exception).
- every new value follows the `ConfigPlan` rules: typed, bounded, fail-closed,
  scalar-replace with per-field attribution, and a documented reload class;
- values that need a platform surface or renderer pipeline change are
  `restart-required` unless the renderer can hot-apply them;
- no knob grants process authority; appearance stays presentation-only and must
  not become an ambient capability.

## Security review

- Color, opacity, and blur are presentation data, not Terminal Truth, and must
  not mutate grid, cursor, modes, or scrollback.
- Blur and translucency touch the platform compositor surface; they must use an
  existing bounded surface rather than introduce an in-process native plugin or
  an install script.
- Bounded parsing and fail-closed validation apply to every new key; a malformed
  value stops at `ConfigPlan` with a source-attributed diagnostic and never
  degrades silently to an unsafe default.
- Core owns the frame chrome; no plugin may set decoration colors, opacity,
  blur, or a background image at runtime, matching the existing decoration
  ownership rule. A per-View override is Core-owned configuration, not a plugin
  hook; the plugin-supplied appearance question is OQ-044.

## Open questions

- **OQ-036** — workspace/tab label bar placement, visibility, ownership, and
  bounds. Still `Open`.
- **OQ-037** — frame/margin-line color contract, namespace, theming, and
  accessibility contrast. Still `Open`; the focused/idle pair below is its
  accepted specialization.
- **OQ-038** — per-surface background opacity and blur compositor/render
  contract, platform gating, and performance budget. Still `Open`.
- **OQ-039** — focused/idle outline color contract: namespace, value format,
  theme interaction, per-surface scope, safe mode, and the AC-1..AC-3
  minimum-contrast rule. **Accepted** 2026-09-12 (see the section above).
- **OQ-041** — per-View/per-panel appearance override contract: selector
  grammar, precedence, inheritance, live reload, fail-closed validation,
  safe-mode behavior, and per-`View` contrast enforcement. **Open**; the
  amendment above is its reviewed candidate.
- **OQ-042** — per-panel background-image contract: format, size/dimension
  limits, decode path, cache budget, tiling/scaling, path trust, and whether a
  plugin may supply an image. **Open**.
- **OQ-043** — per-panel animation override contract: which transition leaves
  may be overridden per selector, precedence, reduced-motion interaction, and
  budget attribution. **Open**.
- **OQ-044** — plugin-supplied appearance contract: whether and how a plugin
  may contribute appearance for its own `View`s or content under a capability,
  and the ownership boundary against Core-owned chrome. **Open**.
- **OQ-045** — focus/idle outline-width contract: defaults, `0..=16` bounds,
  per-`View` override resolution, DPI scaling, safe-mode values, and the
  non-color cue it supplies to AC-2. **Open**; the amendment above is its
  reviewed candidate.

OQ-036, OQ-037, OQ-038, and OQ-041 through OQ-045 remain `Open` in the
[open-question register](../open-questions.md) and have no acceptance evidence.
[OQ-039](../open-questions.md) is accepted by this RFC. Panel open/close,
focus-change, and workspace-switch animations are a separate accepted contract
in [RFC-0002](RFC-0002-panel-animations.md) (OQ-040); they are not part of this
RFC's key set. The per-View override layer and the outline-width triple are
reviewed candidate amendments to this RFC and are not accepted; they are
therefore not part of the accepted key set.

## Ratification note (2026-09-12)

The project initiator ratified the PR #212 recommended defaults; the independent
design review returned APPROVE. The accepted focus/idle defaults are focused
`#33CCFF` (opaque) and idle `#595959AA` (`#RRGGBB` / `#RRGGBBAA`, live reload,
safe-mode `#FFFFFF` / `#808080`); the accepted animation defaults are recorded
in [RFC-0002](RFC-0002-panel-animations.md). This RFC is `accepted`
frontmatter; [OQ-039](../open-questions.md) is closed and
[OQ-036](../open-questions.md), [OQ-037](../open-questions.md), and
[OQ-038](../open-questions.md) remain `Open`. No product code ships with this
acceptance, and no accepted key is a supported `init.lua` key until `bitty`
implements it. Acceptance was independent of implementation; the lifecycle is
`Draft -> accepted -> normative`.

### Amendment note (2026-09-12, per-View overrides)

A later 2026-09-12 amendment records the per-View/per-panel override layer as a
reviewed candidate (the section above) and registers
[OQ-041](../open-questions.md), [OQ-042](../open-questions.md),
[OQ-043](../open-questions.md), and [OQ-044](../open-questions.md). It does not
change the accepted OQ-039 defaults, does not make `views.*` a supported key,
and is not itself accepted; acceptance requires a future revision with renderer
and validation evidence.

### Amendment note (2026-09-12, outline width)

A second 2026-09-12 amendment records the focus/idle outline-width triple
(`decoration.border_width` / `_focused` / `_idle`) as a reviewed candidate,
specifies the AC-2 non-color cue, and registers
[OQ-045](../open-questions.md). It does not change the accepted OQ-039 color
defaults or contrast rule, does not make any width key supported, and is not
itself accepted.

## Compatibility and migration

No behavior changes in this RFC. When a knob is accepted, existing configs
remain valid because every proposed key is additive and defaults preserve the
current appearance; removed or renamed keys would require a migration note under
the [documentation workflow](../../development/documentation-workflow.md).

## Verification obligations (future)

An accepted appearance RFC must define, at minimum: headless tests for
fail-closed validation and bounds of every new key; geometry tests proving label
placement reserves space without changing content grids; renderer tests for
color parsing and contrast; and platform-gated blur tests that degrade
gracefully. For the per-View override layer specifically: tests that resolution
is order-independent across selector tiers, that an invalid override rejects the
whole reload fail-closed, that `--safe` ignores every `views.*` entry, and that
AC-1/AC-2 are enforced on each resolved per-`View` pair. For the outline-width
triple: tests for the `0..=16` bound and whole-reload rejection, that a focused
width `>= idle + 1` satisfies AC-2 without the color delta, that the content
grid is unchanged by a focused width change, and that `--safe` forces the
`1`/`1` pair. Evidence belongs in `bitty`; this RFC records the contract only.

## References

- [Configuration Model RFC](../../specifications/configuration-model-rfc.md)
- [Lua and XDG](../../configuration/lua-and-xdg.md)
- [Panel Animations and Effects RFC](RFC-0002-panel-animations.md) (OQ-040)
- [Workspace Compositor Specification](../../specifications/workspace-compositor.md)
- [Security Overview](../../security/overview.md)
- [Interfaces: Rich content](../../interfaces/rich-content.md)
- `bitty` `CTX-0333` / PR #562: unified panel gaps and `content_inset`.
- `bitty` `CTX-0335`: appearance-knobs request this RFC scopes.
- `bitty` `CTX-0344`: outline-width implementation, blocked on this design.
- Hyprland `border_size` / `active_border` / `inactive_border`: read-only
  semantics reference for the base/focused/idle width distinction.
