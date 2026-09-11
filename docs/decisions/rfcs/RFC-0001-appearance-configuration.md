---
title: Appearance Configuration RFC
description: Candidate proposal to expose all visual appearance knobs through init.lua including gap sizes label position border color opacity and blur
category: decisions
audience: contributor
document_type: specification
status: draft
website_publish: true
sidebar_order: 45
---

# Appearance Configuration RFC

> Status: **draft proposal** (RFC-0001). Not **Accepted**, not **Verified**, not
> **normative**. It proposes a candidate contract for review and registers open
> questions; it authorizes no shipped, stable, or compatibility-guaranteed
> behavior, adds no product code, and does not weaken any normative control in
> the [Security Overview](../../security/overview.md),
> [Threat Model](../../security/threat-model.md), or the
> [Configuration Model RFC](../../specifications/configuration-model-rfc.md).
> The supported-knob entries below are implementation-derived reference read
> read-only from `bitty` `origin/main` `d9f5b49`; everything else is candidate.

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

| Requested knob                         | Current support                           | Disposition                             |
| -------------------------------------- | ----------------------------------------- | --------------------------------------- |
| Gap sizes                              | `layout.*` (cells) + `decoration.*` (px)  | Supported; document precedence (below)  |
| Workspace/tab label position (T/B/L/R) | None                                      | Proposal + OQ-036                       |
| Border / margin-line color             | None; colors live in theme presets only   | Proposal + OQ-037                       |
| Background opacity                     | Whole-window `window.opacity` only        | Proposal + OQ-038 (render/compositor)   |
| Blur amount                            | None                                      | Proposal + OQ-038 (render/compositor)   |
| Per-surface content inset              | `decoration.content_inset` (all surfaces) | Follow-up from CTX-0333 (linked, below) |

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
`appearance.*` palette, or is resolved only through theme presets; and how
per-focus / per-urgent border colors interact. Tracked as OQ-037.

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
- Core owns the frame chrome; no plugin may set decoration colors, opacity, or
  blur at runtime, matching the existing decoration ownership rule.

## Open questions

- **OQ-036** — workspace/tab label bar placement, visibility, ownership, and
  bounds.
- **OQ-037** — frame/margin-line color contract, namespace, theming, and
  accessibility contrast.
- **OQ-038** — per-surface background opacity and blur compositor/render
  contract, platform gating, and performance budget.

All three are `Open` in the
[open-question register](../open-questions.md) and have no acceptance evidence.

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
gracefully. Evidence belongs in `bitty`; this RFC records the contract only.

## References

- [Configuration Model RFC](../../specifications/configuration-model-rfc.md)
- [Lua and XDG](../../configuration/lua-and-xdg.md)
- [Workspace Compositor Specification](../../specifications/workspace-compositor.md)
- [Security Overview](../../security/overview.md)
- [Interfaces: Rich content](../../interfaces/rich-content.md)
- `bitty` `CTX-0333` / PR #562: unified panel gaps and `content_inset`.
- `bitty` `CTX-0335`: appearance-knobs request this RFC scopes.
