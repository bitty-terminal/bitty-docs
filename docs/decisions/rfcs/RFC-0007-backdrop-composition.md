---
title: Backdrop Composition RFC
description: Candidate contract for single-window backdrop composition with background image dim blur opacity and quality-gated slices
category: decisions
audience: contributor
document_type: specification
status: draft
website_publish: false
sidebar_order: 50
---

# Backdrop Composition RFC

> Status: **candidate** (proposed; not accepted, not ratified). This document
> proposes the window-backdrop composition contract for `bitty`: one
> window-extent backdrop blit shared by tiled panels, frozen opacity and blur
> semantics, a bitty-rendered versus compositor-requested ownership split, a
> headed-only linear and dither quality path, and a sliced delivery order. It
> closes no open question, authorizes no shipped behavior, and makes no
> compatibility promise. [OQ-038](../open-questions.md) stays `Open`. It adds
> no product code beyond this proposal and does not weaken any normative
> control in the [Security Overview](../../security/overview.md) or the
> [Threat Model](../../security/threat-model.md). Acceptance requires explicit
> review plus the security sign-offs recorded under Security review.

## Motivation

[OQ-038](../open-questions.md) asks which per-surface background opacity and
blur contract applies, including platform gating, a bounded blur radius, and
the presentation performance budget. The
[Appearance Configuration RFC](RFC-0001-appearance-configuration.md) already
records the starting position: `window.opacity` is whole-window opacity from
the presentation path, never a per-surface or background-only knob, and
per-surface `opacity` and `blur` stay reserved and rejected in `views.*`
until OQ-038 accepts them. Its OQ-038 proposal section sketches the candidate
direction only (keep `window.opacity` whole-window, add
`window.background_opacity` if the renderer can composite it without changing
Terminal Truth, treat blur as platform-gated and best-effort with a bounded
radius charged against the presentation budget) and states explicitly that
both knobs need an accepted render or platform contract before any config key
ships.

This RFC is that contract, in candidate form. Without it, three failure modes
stay open: every tiled panel blitting its own backdrop copy (wasted work over
padding and gaps, plus seam risk at panel edges), opacity and blur knobs whose
meanings differ per platform (a config that blurs on one compositor and
silently no-ops on another), and banded background gradients from an
unreviewed scale path. The proposal fixes the layering order, freezes the
three knob semantics, splits ownership between bitty-rendered work and
compositor-requested effects, gates the quality path on headed opt-in, and
orders delivery so each slice is reviewable and screenshotted before the next
lands.

## Purpose and scope

In scope: the bottom-to-top layering order for one window backdrop; the
ownership split between bitty-rendered work (decode, scale, cache, dim, tint,
unfocused-dim) and compositor-requested effects (window translucency, blur);
the frozen semantics of `window.opacity`, `window.background_opacity`, and
`blur_radius`; the `background_image_roots` sandbox reuse; the headed-only
linear and dither quality path with a hash-stable headless path; the
bitty-graphics versus core split; the security review surface; the
compatibility and migration posture; the verification obligations; the sliced
delivery order; and the open questions with acceptance criteria.

Out of scope and owned elsewhere: frame decoration values and per-View
override mechanics ([Appearance Configuration RFC](RFC-0001-appearance-configuration.md));
tiling geometry and decoration ownership
([Workspace Compositor Specification](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/workspace-compositor.md));
transition durations, easings, and the present-path budget
([Panel Animations and Effects RFC](RFC-0002-panel-animations.md) and the
[Performance Budget RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/performance-budget-rfc.md));
merge, reload, and attribution mechanics
([Configuration Model RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/configuration-model-rfc.md));
the Lua runtime and plugin API surface (owned by the plugin corpus); and any
platform-surface contract owned by `bitty-platform` and `bitty-render`.

## Goals and non-goals

Goals:

- one window backdrop per window: a single window-extent blit shared by all
  tiled panels, covering padding and gaps, instead of per-panel copies;
- frozen, portable knob semantics: the same config means the same thing on
  every platform, and an unsupported platform degrades to a documented
  no-effect state rather than failing startup;
- a hard ownership line: bitty-rendered pixels versus compositor-requested
  effects, with no shader-alpha back door for dimming;
- a quality path that never destabilizes headless hashes or tiling geometry;
- a sliced delivery order where each slice carries its own headed evidence.

Non-goals:

- no product code and no rendering change in this RFC;
- no per-panel backdrop copies and no per-surface opacity or blur outside the
  frozen keys;
- no plugin-owned mutation of Core-owned chrome or backdrop state;
- no blur or translucency promise on a platform whose compositor cannot
  provide it;
- no change to `fit_plan` geometry and no change to the headless CPU scale
  path.

## Layering contract

Candidate bottom-to-top order for one window backdrop, layers L-0 through
L-8:

| Layer | Content                                                                              | Owner               |
| ----- | ------------------------------------------------------------------------------------ | ------------------- |
| L-0   | Compositor alpha and blur region                                                     | Platform compositor |
| L-1   | Single window-extent backdrop blit (shared by tiled panels; covers padding and gaps) | `bitty-render`      |
| L-2   | Per-`View` decoration blits, clipped to the leaf                                     | `bitty-render`      |
| L-3   | Kitty graphics with z-index below threshold                                          | Image pipeline      |
| L-4   | Cell backgrounds                                                                     | `bitty-render`      |
| L-5   | Kitty graphics with negative z-index                                                 | Image pipeline      |
| L-6   | Text                                                                                 | `bitty-render`      |
| L-7   | Kitty graphics with z-index zero or above                                            | Image pipeline      |
| L-8   | Chrome rings, float borders, overlays, cursor                                        | Core chrome         |

Rules:

1. L-1 is exactly one blit per window per present, sized to the window
   extent. Tiled panels share it; it covers padding and gaps. No tiled panel
   issues its own backdrop blit.
2. L-2 blits clip to the owning leaf `View`. Decoration never paints outside
   its leaf.
3. The L-1 window blit sorts below the kitty z-threshold: every kitty image
   layer (L-3, L-5, L-7) paints above the backdrop. The backdrop never covers
   terminal graphics.
4. Float and pinned surfaces carry a `1` px ring, and `RoundedClip` punches
   the rounded edge over L-1: the ring and the punched edge belong to L-8 and
   paint above the backdrop, so a float never inherits a hard rectangular
   backdrop seam.
5. Cell backgrounds (L-4) paint above below-threshold kitty images (L-3) and
   below negative-z kitty images (L-5); text (L-6) paints above both. This
   preserves the accepted image-over-background expectation while the
   backdrop stays at the bottom of the stack.

Relation to the accepted direction: the decision register records a
composition layer-order direction (background, negative kitty, cell
background, normal kitty, glyphs, positive kitty, UI overlay) in
[the decision register](../index.md) (DIR-021). This candidate refines that
direction for the window-backdrop slice by fixing L-1 to one shared
window-extent blit, placing per-`View` decoration explicitly at L-2, and
naming the kitty threshold sort. Where the two differ, this candidate
proposes and DIR-021 stays authoritative until this RFC is accepted.

## Ownership split

| Work                                         | Owner                                                 | Rationale                                                      |
| -------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------- |
| Image decode, scale, and cache               | Bitty-rendered (`bitty-rich`, `bitty-render`)         | Pixels Bitty owns stay in the Bitty pipeline and its budgets   |
| Dim and tint of the rendered image           | Bitty-rendered (`bitty-rich`, `bitty-render`)         | Same-pipeline color work, testable headless                    |
| Whole-window translucency (`window.opacity`) | Compositor-requested via the platform-service adapter | Only the compositor owns the native surface alpha              |
| Blur (`blur_radius`)                         | Compositor-requested via the platform-service adapter | Blur is a compositor effect, never a Bitty shader pass         |
| Unfocused dim                                | Bitty-rendered overlay                                | Deterministic cross-platform dim with no compositor dependency |

Rules:

1. Translucency and blur cross into the compositor only through the
   platform-service adapter: `ext-background-effect-v1` on Wayland,
   `NSVisualEffectView` on macOS, and KWin-only behavior on X11. Linux
   ignores intensity: a compositor blur-intensity value has no effect on
   Linux, and the contract never promises otherwise.
2. An unsupported platform renders the final unblurred, untranslucent state
   rather than failing startup. The configured values are still validated and
   bounded at `ConfigPlan`, matching the best-effort posture recorded in
   [RFC-0001](RFC-0001-appearance-configuration.md).
3. Unfocused dim is a bitty-rendered overlay in the ghostty-CSS manner:
   a Core-owned translucent overlay quad above the content. It is never
   shader alpha on the content itself, so dimming cannot leak into text
   rendering or Terminal Truth.
4. No plugin may drive backdrop, opacity, blur, dim, or tint state. Backdrop
   composition is Core-owned chrome under the existing decoration ownership
   rule.

## Frozen semantics

Candidate frozen meanings. `window.opacity` keeps its accepted meaning and
the other two keys are new:

| Key                         | Meaning                                                                                 | Reload class                                                                                                                                      |
| --------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `window.opacity`            | Whole-window compositor alpha; `1.0` is opaque                                          | `Live` (existing behavior, unchanged)                                                                                                             |
| `window.background_opacity` | Image-only dim of the L-1 backdrop blit; `0` skips the blit, `1` is a no-op             | `Live` (renderer-side)                                                                                                                            |
| `blur_radius`               | Optional blur radius in logical px, `Option<u32>`, `0..=128`; `0` (or absent) means off | `Live` where the platform adapter supports a live setter; otherwise `restart-required`, with the X11 restart-needed caveat matching `set_opacity` |

Validation rules:

1. `window.opacity` stays the whole-window scalar. It never becomes a
   per-surface or background-only knob.
2. `window.background_opacity` dims only the L-1 image blit. At `0` the
   renderer skips the blit entirely; at `1` the dim stage is a no-op and the
   blit proceeds unmodified. Text, cell backgrounds, kitty images, and chrome
   are unaffected at every value.
3. `blur_radius` accepts integers `0..=128`. Non-finite Lua numbers (NaN or
   infinity) sanitize to `0` at the `ConfigPlan` boundary with a
   source-attributed diagnostic, never by silent clamping of out-of-range
   integers: out-of-range integers fail validation fail-closed.
4. The window image reuses the `background_image_roots` sandbox unchanged:
   deny-by-default approved roots, regular-file checks, and the accepted
   image bounds from the per-panel background-image contract in
   [RFC-0001](RFC-0001-appearance-configuration.md). No new root, no widened
   pattern, no parallel sandbox.

Candidate Lua shape (illustrative; no key is supported until `bitty`
implements it):

```lua
return {
    window = {
        opacity = 1.0,
        background_opacity = 0.85,
        background_image = "/approved/roots/wallpaper.png",
        background_image_linear = false,
    },
    decoration = {
        blur_radius = 12,
    },
}
```

## Quality path

Banding cause, recorded so the fix is reviewable: background gradients band
because the scale path is nearest-neighbor into 8-bit straight alpha with no
dither. That cause is presentation-only; it never touches grid, text, or
geometry.

Candidate quality contract:

1. A `background_image_linear` flag (default `false`) selects the headed
   quality path: opt-in linear-light scaling plus ordered dither with a 4x4
   Bayer matrix on the L-1 blit.
2. The headless CPU path stays nearest-neighbor and hash-stable. Enabling the
   flag must not change any headless hash: headed and headless scale paths
   are separate, and headless tests pin the existing snapshots byte for byte.
3. `fit_plan` geometry is unchanged. The flag changes sample values only,
   never placement, tiling, or extent math.
4. Dim (`window.background_opacity`) and tint apply after dither in linear
   light on the headed path, so dimming a dithered gradient does not
   reintroduce banding.

## Reference designs

Three external designs informed this candidate. All are design-only,
untrusted origins: no code is copied, no wire format is adopted, and no
configuration syntax is imported. They are named so reviewers can check the
reasoning, not so the contract depends on them.

- Ghostty per-surface shader image: fit, position, and repeat controls with
  an image-opacity value expressed relative to background opacity; the
  compositor blur-intensity control is ignored on Linux. Borrowed reasoning:
  keep image opacity relative to (and separable from) whole-background
  opacity, and document the Linux intensity no-op instead of implying it
  works.
- Kitty OS-window-global image: six layout modes with tint and tint-for-gaps
  controls; window opacity never touches the image; blur is gated on
  opacity below `1`; dynamic opacity is an explicit opt-in. Borrowed
  reasoning: one window-global image rather than per-panel copies, opacity
  never implicitly dimming the image, blur gated on real translucency, and
  dynamic opacity behind opt-in.
- Awww desktop layer-shell wallpaper: a desktop-layer surface that is not a
  reusable Bitty surface. Borrowed reasoning only: its transition easing
  curves and its lz4 frame-cache strategy for animated backgrounds. Awww
  stays an external reference; no awww surface, protocol, or code enters the
  contract.

What this candidate does differently: a single shared window-extent blit
(Ghostty-comparable separability, Kitty-comparable window scope), frozen
three-knob semantics with fail-closed validation, compositor-requested
(rather than shader) blur, and a headed-only dither path that keeps headless
hashes stable.

## Extension split

| Work                                                           | Home                                                                   |
| -------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Blend math: decode, scale, dither, and eased transition blends | `bitty-graphics` extension repository (pure, independently verifiable) |
| Compositing, scheduling, wgpu work, and the protocol surface   | `bitty` core                                                           |

Rules:

1. The extension repository holds pure functions only: no wgpu device, no
   compositor handle, no platform protocol. Every blend entry point is
   callable headless with byte-comparable fixtures, so its math verifies
   independently of any window.
2. Core owns compositing order, frame scheduling, wgpu submission, and the
   platform-service protocol surface. The extension never schedules a frame
   and never touches a native surface.
3. The transition engine follows the same division: the extension computes
   eased blend values, Core schedules and drains them, mirroring the
   tick-drained, frame-on-demand scheduling established in
   [RFC-0002](RFC-0002-panel-animations.md). No transition loops; a completed
   transition schedules nothing further.
4. Awww stays an external reference. Its curves and frame-cache strategy
   inform the extension math; no dependency on awww is created.

## Security review

- The window image reuses the `background_image_roots` sandbox unchanged
  (deny-by-default roots, regular-file checks, accepted image bounds,
  off-hot-path decode, separate background cache pool, whole-reload
  fail-closed rejection, `--safe` opening no file). Sandbox sufficiency is a
  required sign-off for acceptance: a security reviewer must confirm the
  per-panel roots transfer to the window image with no widened pattern.
- Symlink and TOCTOU handling is a required sign-off: resolution-to-use must
  not permit root escape through a swapped symlink or a raced rename between
  validation and open.
- Retained-generation doubling is a required sign-off: replaced or reloaded
  backdrops must release their cache generation, with a bound against two
  live generations accumulating per reload cycle.
- Animated-format handling is a required sign-off: an explicit allow-list of
  animated formats plus a frame cap, with anything outside the list decoded
  as a single still frame or rejected fail-closed.
- Blur is not redaction: a blurred backdrop must never be presented as a
  secrecy control. Sensitive content under a blurred or dimmed backdrop is
  still present, and no claim of concealment may ship with this contract.
- Minimum contrast over imagery is a required sign-off: text over the L-1
  image must meet the accepted minimum-contrast rule (the AC-1 through AC-3
  family recorded in [RFC-0001](RFC-0001-appearance-configuration.md)),
  extended to imagery or explicitly deferred with rationale (see Open
  questions).
- The blur live-setter path is protocol surface: every platform adapter call
  that changes blur at runtime takes validated, bounded values only, rejects
  malformed input without applying a partial effect, and degrades to the
  documented no-effect state on unsupported compositors.
- `transparent_background_colors` handling is a test-matrix note, not a
  behavior claim: the verification matrix must cover transparent background
  colors over the L-1 image (including the `0` and `1` dim endpoints) and
  record the observed result per platform before any dynamic-opacity work is
  advertised.

## Compatibility and migration

No behavior changes in this RFC. Every proposed key is additive:
`window.background_opacity`, `blur_radius`, and `background_image_linear`
are new leaves; `window.opacity` keeps its accepted whole-window meaning;
`background_image_roots` is reused unchanged. Defaults preserve current
appearance: `window.opacity = 1.0`, `window.background_opacity = 1`
(dim no-op), `blur_radius` absent or `0` (off), `background_image_linear =
false` (existing nearest-neighbor path). Removed or renamed keys would
require a migration note under the
[documentation workflow](../../development/documentation-workflow.md).

Reload posture: `window.background_opacity` and `background_image_linear`
are renderer-side and `Live`; `blur_radius` is `Live` only where the
platform adapter exposes a live setter and otherwise `restart-required`,
with the X11 restart-needed caveat matching `set_opacity`. A field whose
reload class cannot be honored hot-applies nothing and reports its class,
never half-applies.

## Slice order

Delivery proceeds in order; each slice lands only with its evidence from
Verification obligations:

1. Docs and validation disambiguation: freeze the three knob meanings, the
   L-0 through L-8 order, the ownership table, and the `ConfigPlan`
   validation rules (bounds, non-finite sanitization, fail-closed
   diagnostics) with no renderer change.
2. `blur_radius` plumbing: Lua through config to `WindowConfig`, into
   `create_window` and the platform-service adapter, with resize resync.
   Live setter where the platform supports it; documented
   `restart-required` elsewhere.
3. Linear and dither quality path: headed opt-in `background_image_linear`
   with linear-light scaling and 4x4 Bayer dither; headless hashes pinned
   unchanged; `fit_plan` geometry untouched.
4. Single-window-blit hardening and regression tests: one L-1 blit per
   window per present, tiled-panel sharing, padding and gap coverage,
   kitty-threshold sort, plus a float and pinned headed snapshot proving the
   `1` px ring and `RoundedClip` edge over L-1.
5. Tint and unfocused-dim, and dynamic opacity if wanted: bitty-rendered
   overlay dim (never shader alpha), tint after dither, and dynamic opacity
   only behind explicit opt-in with the swapchain-reconfigure cost measured
   first.

## Verification obligations

Each slice must define, at minimum, before it is advertised as supported:

- headed screenshots per slice on the reference compositor session (WS5),
  captured with `hyprctl` and `grim`: the L-1 blit extent over padding and
  gaps, the dim endpoints (`0` skipping the blit, `1` as no-op), the blur
  radius applied and absent, the float and pinned ring and rounded edge, and
  the unfocused-dim overlay;
- hash-stable headless tests: the CPU nearest-neighbor path produces
  byte-identical snapshots before and after every slice, including with
  `background_image_linear` enabled (headless must ignore the headed flag);
- `fit_plan` geometry tests proving placement, tiling, and extent math
  unchanged by the quality path;
- fail-closed validation tests for every bound (out-of-range integers,
  non-finite numbers, malformed paths) with source-attributed diagnostics;
- swapchain-reconfigure cost measurement before advertising opacity slides:
  no dynamic-opacity surface ships until the reconfigure cost is measured
  and budgeted against the accepted presentation budget;
- `--safe` tests proving no image file is opened and no blur or translucency
  is requested.

Evidence belongs in `bitty` (and in `bitty-graphics` for the pure blend
math); this RFC records the contract only.

## Open questions and acceptance

- **OQ-038** — per-surface background opacity and blur compositor and render
  contract, platform gating, and performance budget. Still `Open`. This
  candidate proposes the answer (frozen Sections above) but does not close
  the question: closure requires acceptance of this RFC or a successor, with
  the security sign-offs recorded under Security review and the slice-1
  validation evidence in hand. OQ-038 gates every later slice.
- **Transparent colors follow-up** — the `transparent_background_colors`
  matrix (see Security review) may force a follow-up question if platforms
  diverge observably. No new OQ identifier is admitted here: per the
  [documentation workflow](../../development/documentation-workflow.md), a
  future idea becomes a proposed OQ only with forcing evidence, a blocking
  link, an owner, and a review point.
- **Minimum contrast: extend or defer** — the AC-1 through AC-3 rule from
  [RFC-0001](RFC-0001-appearance-configuration.md) either extends to text
  over the L-1 image in this RFC (with the per-image contrast method
  defined) or defers with recorded rationale and a named follow-up owner.
  Acceptance must state which.

Acceptance criteria for this candidate: explicit review APPROVE; security
reviewer sign-off on sandbox sufficiency, symlink and TOCTOU handling,
retained-generation bounds, the animated-format allow-list with frame cap,
the blur-is-not-redaction stance, and the contrast extend-or-defer decision;
a recorded reload-class table per key; and slice-1 validation evidence. The
lifecycle is `Draft -> accepted -> normative`; acceptance ships no product
code and no key is a supported `init.lua` key until `bitty` implements it.

## References

- [Appearance Configuration RFC](RFC-0001-appearance-configuration.md)
  (accepted OQ-039, OQ-041, OQ-042, OQ-045; OQ-036, OQ-037, OQ-038, OQ-043,
  OQ-044 remain open; `window.opacity` whole-window rule; `views.*`
  opacity and blur reservation; `background_image_roots` sandbox and
  BG-1 through BG-7 bounds; AC-1 through AC-3 contrast family).
- [Panel Animations and Effects RFC](RFC-0002-panel-animations.md)
  (accepted OQ-040; frame-on-demand scheduling; renderer-side versus
  compositor-side split; tick-drained transition draining reused by the
  extension-split transition engine).
- [Open-question register](../open-questions.md) (OQ-038 gate).
- [Decision register](../index.md) (DIR-021 composition layer-order,
  opacity, blur, and image-infrastructure direction refined by this
  candidate).
- [Workspace Compositor Specification](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/workspace-compositor.md)
  (Core-owned decoration and geometry).
- [Performance Budget RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/performance-budget-rfc.md)
  (presentation budget charged for blur and blit work).
- [Configuration Model RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/configuration-model-rfc.md)
  (`ConfigPlan` validation, attribution, and reload rules).
- [Security Overview](../../security/overview.md) and
  [Threat Model](../../security/threat-model.md).
