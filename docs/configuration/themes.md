---
title: Theme presets
description: Candidate built-in theme preset catalog with dark and light categories, selection keys, aliases, provenance, and open questions
category: configuration
audience: user
document_type: reference
status: draft
website_publish: true
sidebar_order: 11
---

# Theme presets

> Status: **candidate catalog, not yet shipped.** Only the designed default
> preset (`bitty-dark`, alias `dark`) resolves in `bitty` today. The wider
> dark/light catalog below is being implemented under the `bitty` CarryCtx task
> `CTX-0350`; the preset names, aliases, palette values, and category metadata
> are **provisional targets**, not supported behavior. Nothing on this page is
> selectable until that implementation merges, and this page makes no
> implementation claim. The owning configuration contract remains the
> [Configuration Model RFC](../specifications/configuration-model-rfc.md) and
> the accepted [Appearance Configuration RFC](../decisions/rfcs/RFC-0001-appearance-configuration.md)
> (OQ-039); the catalog is documented data, not new configuration semantics.

Bitty resolves terminal colors from a **built-in preset registry**. A preset is
a fixed set of window background, foreground, cursor, selection, focused/idle
outline tokens, and the 16 ANSI colors. The registry is compiled into the
binary (`bitty` `crates/bitty-config/src/theme.rs`); there is no theme file
loading today.

## Selecting a theme

A theme is selected by **name**, not by category or file path. The canonical
key is the `appearance.theme` scalar in `init.lua`:

```lua
-- Canonical key.
return {
    appearance = {
        theme = "tokyo-night",
    },
}
```

A top-level `theme` alias is also accepted. `appearance.theme` wins when both
are present:

```lua
-- Alias form; appearance.theme takes precedence over this key.
return {
    theme = "dark",
}
```

Accepted identifiers:

- **`appearance.theme = "<name>"`** — canonical selection key. Matching is
  case-insensitive and surrounding whitespace is trimmed.
- **`theme = "<name>"`** — top-level alias for `appearance.theme`. It loses to
  `appearance.theme` when both are set.
- **`dark`** — convenience alias for the default preset `bitty-dark`.

Resolution rules (reference to current shipped behavior):

| Input                            | Result                                                |
| -------------------------------- | ----------------------------------------------------- |
| `appearance.theme` unset / empty | designed default preset `bitty-dark`                  |
| known name or alias              | that preset's exact values                            |
| unknown name                     | fall back to `bitty-dark` and log a warning to stderr |

`appearance.theme` is a **restart-required** key: changing it does not live
reload. Unknown names never fail the process; they fall back to the default
with a visible warning, so a typo is not silent.

## Built-in preset catalog (planned)

Status: **provisional**. These are the preset families and canonical names the
`bitty` `CTX-0350` implementation targets; the authoritative, machine-checked
list ships in that change. Names follow lowercase kebab-case and separate a
family from a tone or variant (for example `gruvbox-dark`). Aliases for
families other than the default are assigned by the registry and are not yet
frozen.

### Dark presets

| Preset                 | Aliases (provisional) | Note                                               |
| ---------------------- | --------------------- | -------------------------------------------------- |
| `bitty-dark`           | `dark`                | Designed in-house default; dark-first indigo-gray. |
| `tokyo-night`          | —                     | Tokyo Night classic; blue/violet night palette.    |
| `tokyo-night-storm`    | —                     | Darker, higher-contrast Tokyo Night variant.       |
| `tokyo-night-moon`     | —                     | Softer Tokyo Night variant.                        |
| `github-dark`          | —                     | GitHub's default dark UI palette.                  |
| `catppuccin-mocha`     | —                     | Darkest Catppuccin flavor.                         |
| `catppuccin-macchiato` | —                     | Mid-dark Catppuccin flavor.                        |
| `catppuccin-frappe`    | —                     | Softest dark Catppuccin flavor.                    |
| `dracula`              | —                     | High-contrast purple/pink dark scheme.             |
| `nord`                 | —                     | Cool arctic blue-gray dark scheme.                 |
| `gruvbox-dark`         | —                     | Retro warm earth tones on dark.                    |
| `solarized-dark`       | —                     | Precision low-contrast dark palette.               |
| `one-dark`             | —                     | Atom One dark scheme.                              |
| `rose-pine`            | —                     | Muted rose/pine dark scheme.                       |
| `rose-pine-moon`       | —                     | Cooler, dimmer Rosé Pine variant.                  |
| `everforest-dark`      | —                     | Comfortable green-gray dark scheme.                |
| `kanagawa`             | —                     | Ink-and-sumi Japanese-influenced dark scheme.      |
| `ayu-dark`             | —                     | Warm amber-on-dark scheme.                         |
| `ayu-mirage`           | —                     | Muted blue-gray Ayu variant.                       |
| `night-owl`            | —                     | Deep navy dark scheme for low-light use.           |

### Light presets

| Preset              | Aliases (provisional) | Note                                  |
| ------------------- | --------------------- | ------------------------------------- |
| `tokyo-night-light` | —                     | Light counterpart of Tokyo Night.     |
| `github-light`      | —                     | GitHub's default light UI palette.    |
| `catppuccin-latte`  | —                     | Light Catppuccin flavor.              |
| `gruvbox-light`     | —                     | Warm earth tones on light.            |
| `solarized-light`   | —                     | Precision low-contrast light palette. |
| `one-light`         | —                     | Atom One light scheme.                |
| `rose-pine-dawn`    | —                     | Light Rosé Pine variant.              |
| `everforest-light`  | —                     | Green-gray light scheme.              |
| `ayu-light`         | —                     | Light Ayu variant.                    |
| `night-owl-light`   | —                     | Light counterpart of Night Owl.       |

The **Dark** and **Light** headings above are documentation categories. Whether
a category is itself selectable is an open question; see
[open questions](#status-and-open-questions).

## Provenance

Every preset family is derived from an upstream project and is attributed in
the registry. Bitty writes its color values explicitly and owns them; upstream
palettes are used as a taste and value reference, not copied as code. Verify
the upstream license before adding or changing a family.

| Family      | Upstream project                                        | License    | Presets                                           |
| ----------- | ------------------------------------------------------- | ---------- | ------------------------------------------------- |
| Bitty       | In-tree (`bitty-terminal/bitty`, `crates/bitty-config`) | MIT        | `bitty-dark`                                      |
| Tokyo Night | <https://github.com/enkia/tokyo-night-vscode-theme>     | MIT        | `tokyo-night`, `-storm`, `-moon`, `-light`        |
| GitHub      | <https://github.com/primer/github-vscode-theme>         | MIT        | `github-dark`, `github-light`                     |
| Catppuccin  | <https://github.com/catppuccin/catppuccin>              | MIT        | `-mocha`, `-macchiato`, `-frappe`, `-latte`       |
| Dracula     | <https://github.com/dracula/dracula-theme>              | MIT        | `dracula`                                         |
| Nord        | <https://github.com/nordtheme/nord>                     | MIT        | `nord`                                            |
| Gruvbox     | <https://github.com/morhetz/gruvbox>                    | MIT        | `gruvbox-dark`, `gruvbox-light`                   |
| Solarized   | <https://github.com/altercation/solarized>              | MIT        | `solarized-dark`, `solarized-light`               |
| One         | <https://github.com/atom/one-dark-syntax>               | MIT        | `one-dark`, `one-light` (`atom/one-light-syntax`) |
| Rosé Pine   | <https://github.com/rose-pine/rose-pine-theme>          | MIT        | `rose-pine`, `-moon`, `-dawn`                     |
| Everforest  | <https://github.com/sainnhe/everforest>                 | MIT        | `everforest-dark`, `everforest-light`             |
| Kanagawa    | <https://github.com/rebelot/kanagawa.nvim>              | MIT        | `kanagawa`                                        |
| Ayu         | <https://github.com/ayu-theme/ayu-vim>                  | Apache-2.0 | `ayu-dark`, `ayu-mirage`, `ayu-light`             |
| Night Owl   | <https://github.com/sdras/night-owl-vscode-theme>       | MIT        | `night-owl`, `night-owl-light`                    |

`MIT` and `Apache-2.0` are the SPDX identifiers reported by each upstream
repository at the time of writing. License text is not bundled; only names and
attribution are recorded. The catalog is additive: adding a family requires its
source URL and license here and in the registry.

## Custom and third-party themes

Custom and user-supplied themes are **not supported**. There is no theme file
format, no `$XDG_DATA_HOME/bitty/themes/` or `$XDG_CONFIG_HOME/bitty/themes/`
loading path, and no plugin theme contribution contract today. The `themes/`
directory is reserved in the [XDG data layout](lua-and-xdg.md#data-state-cache-and-runtime-layouts)
but is inert. Selecting an unknown name falls back to `bitty-dark`; it does not
load a file.

Whether user themes, a file schema, or plugin-supplied themes enter scope is an
open question; see below. Do not document or rely on a custom-theme path until
a reviewed contract defines its schema, load path, and trust model.

## Status and open questions

This catalog records planned data and documentation only. It ratifies no new
configuration semantics beyond the accepted
[Appearance Configuration RFC](../decisions/rfcs/RFC-0001-appearance-configuration.md)
and its `appearance.theme` / `theme` alias contract. The following are genuine
open questions and are registered rather than decided in this page:

- **OQ-046 — category selection.** Is a preset's `Dark`/`Light` category
  exposed as a selectable or queryable config surface, or is it non-selectable
  documentation metadata only?
- **OQ-047 — custom themes.** Are user-authored or third-party theme files
  supported, and if so what is the schema, load path, and trust model?
- **OQ-048 — automatic light/dark switching.** Is following the OS appearance
  or a schedule in scope, and which key or mechanism owns it?

See the [open-question register](../decisions/open-questions.md) for the
authoritative state. The catalog stays `draft` until `bitty` `CTX-0350` merges
and an independent review accepts the shipped preset set.
