---
title: Reference Project Register
description: Records reproducible local snapshots and research questions for terminal and extensibility reference projects.
category: project
audience: contributor
document_type: research
status: draft
website_publish: false
sidebar_order: 90
---

# Reference Project Register

## Purpose and boundaries

Reference repositories live under `tmp/references/` in the local workspace.
They support architecture research, protocol comparison, learning performance
methods, and the design of future differential tests.

These clones are **reproducible research snapshots**, not:

- Bitty dependency pins;
- accepted technology choices;
- vendored source;
- commitments to begin a fork;
- Bitty compatibility guarantees for the reference projects.

Technical conclusions must enter a research note, RFC, or ADR with the observed
commit recorded. “Another project does it this way” cannot replace Bitty's own
constraints and validation.

## Current snapshots

| Project | Local directory          | Commit                                     | Primary research topics                                                                            |
| ------- | ------------------------ | ------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Ghostty | `tmp/references/ghostty` | `8867c37c55b578b9eb4cfaba41cb9023e557176d` | Core/frontend boundaries, VT, fonts, rendering, protocols, security, and Agent documentation       |
| Neovim  | `tmp/references/neovim`  | `a1de07418b89f1b30f9ca088306b2c1615f928c3` | Command/Event/API, Lua configuration and plugins, UI protocol, and ecosystem boundaries            |
| kitty   | `tmp/references/kitty`   | `087b8c35c455e1fa21a727916efdaf59ebdd0168` | GPU performance, glyph cache, Kitty Graphics/keyboard, and protocol limits                         |
| WezTerm | `tmp/references/wezterm` | `f93d90350075d3e42566e0557ca36e82ffdcbec1` | Rust/Lua, terminal/mux/GUI layers, cross-platform support, image protocols, and software rendering |

The registration date is 2026-08-25. The clones have shallow history, and each
commit provides an exact reference for current observations. Updating a clone
requires updating this table or pinning the old commit in the relevant research
document.

## Research questions

### Ghostty

- What are the actual dependency directions between its library/core and
  desktop frontends?
- How have the public boundaries of the parser, terminal state, font system, and
  renderer evolved?
- How does the project organize resource limits, fuzzing, and security fixes for
  untrusted escape sequences?
- Which practices from `AGENTS.md` and the cross-platform development workflow
  are reusable?

### Neovim

- How do Command, autocmd/Event, Lua, RPC, and external UI share stable
  contracts?
- Which parts of runtimepath and module discovery are successful, and which are
  historical burdens?
- Which aspects of configuration reload, plugin unload, and state ownership
  should not be copied directly?
- How can the multigrid/UI protocol validate the separation of Terminal, View,
  and Layout?

### kitty

- How do the child-I/O, parser, and renderer execution domains avoid blocking
  one another?
- How do the glyph atlas, damage tracking, and GPU uploads maintain low latency?
- What are the actual semantics of image and placement, z-index, scrolling, and
  animation in Kitty Graphics?
- What are the boundary conditions for the keyboard protocol and long or
  malicious control sequences?

### WezTerm

- How does `wezterm-term` remain independent of GUI and PTY code, and which
  boundaries make suitable differential oracles?
- What known constraints arise from repeated Lua configuration evaluation and
  runtime side effects?
- How are the mux, GUI, headless, and remote domains layered?
- How are OpenGL, WebGPU, and software renderers and platform fallback
  strategies tested?

## Usage rules

- Prefer `rg` and `ctxctl outline/symbol/read/deps` for narrow research.
  Never dump an entire file or repository into Agent context.
- Research notes must include the project name, commit, file or symbol, and
  observation, not merely a second-hand conclusion.
- Check the license before copying code. Research does not automatically
  authorize copying.
- A component that appears reusable upstream still requires the wrapper, fork,
  and exit-condition evaluation defined in the
  [Technology and Dependency Strategy](technology-strategy.md).
- Do not modify a reference clone. Put experimental patches in a separate
  worktree or an explicit experiment directory under the project `tmp/`.

## Future candidates

The early discussion also identified Alacritty and foot as important reference
projects. Alacritty is useful for studying a pure VT parser and minimal
boundaries, while foot is useful for studying a Wayland-native, small,
high-performance implementation and server mode. Whether to clone them, which
commit to pin, and who owns the research remain undecided.

## Non-normative ecosystem taxonomy

The following taxonomy is a comparison lens, not a product classification,
performance ranking, or Bitty roadmap. Projects can occupy more than one group:

| Lens                            | Examples                                           | Comparison question                                                                                 |
| ------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Minimal and composable terminal | Alacritty, foot                                    | How thin can VT, PTY, input, font, and rendering boundaries remain while composition is external?   |
| Native desktop terminal         | Ghostty, GNOME Terminal, Konsole, Windows Terminal | Which desktop integration, profiles, tabs, panes, and platform behaviors form the baseline?         |
| Programmable terminal           | kitty, WezTerm, iTerm2                             | Which scripting, remote-control, mux, semantic-shell, and automation objects are stable?            |
| Terminal workspace              | WaveTerm, Horizon, Tabby, Hyper                    | Is a terminal one surface among blocks, panels, previews, connections, or extensions?               |
| Agentic development environment | Warp, and selected WaveTerm or Kaku workflows      | How are agents, sessions, tasks, approvals, and observations coordinated separately from emulation? |

This synthesis is non-normative and does not override accepted decisions,
security requirements, or current implementation status.

## External leads and comparison notes

These official URL-backed leads are not local snapshots and do not establish a
pinned revision. The observations are research leads from the 2026-08-30
discussion and external product surfaces; direct source inspection is required
before they become technical conclusions.

### Workspace-oriented leads

- [WaveTerm](https://github.com/wavetermdev/waveterm) and [documentation](https://docs.waveterm.dev/)
  describe a terminal with graphical capabilities. The [wsh overview](https://docs.waveterm.dev/wsh)
  describes CLI control of graphical blocks, workspace state, web blocks, and
  local or remote activity. `Block` and the CLI-GUI bridge are useful leads for
  comparing object identity and permission boundaries.
- WaveTerm's [wsh reference](https://docs.waveterm.dev/wsh-reference) documents
  `wsh web open` opening a URL in a web block, a real web surface rather than
  terminal-text conversion. The discussion points to Electron/Chromium and an
  embedded web view as the observed implementation surface. That is evidence to
  verify, not a Bitty recommendation: Electron/Chromium is explicitly not an
  implementation recommendation.
- [Horizon](https://github.com/peters/horizon) describes an infinite canvas
  where terminal sessions are positioned, resized, grouped, and navigated as
  panels. Its panel-first UI is a lead for workspace visualization and session
  persistence. Horizon's documented panel is primarily terminal-session
  oriented; it must not be equated with Bitty's generic `Panel`, which may host
  terminal, file, browser, agent, Markdown, or provider surfaces when accepted
  and implemented.
- [Tabby](https://tabby.sh/) and its [source repository](https://github.com/eugeny/tabby)
  are leads for a configurable cross-platform terminal, SSH and serial client,
  and plugin-oriented UI. Its [documentation](https://docs.tabby.sh/) is useful
  for extension discovery and remote workflows, subject to Bitty's untrusted
  plugin and capability rules.
- [Hyper](https://hyper.is/) is a lead for a terminal UI built with web
  technologies and an extension API. Its [extension documentation](https://hyper.is/#installation)
  illustrates both the reach and compatibility/security cost of exposing
  Electron and renderer internals. It is comparison evidence, not endorsement.
- [Kaku](https://github.com/tw93/Kaku) is a lead for opinionated, out-of-the-box
  macOS defaults and AI-oriented terminal workflows while retaining WezTerm/Lua
  customization. Treat its platform scope and product direction as external
  observations requiring verification, not as Bitty requirements.

### Terminal and automation comparisons

- [Alacritty](https://alacritty.org/) is a lead for a focused, composable
  terminal that integrates with other programs rather than reimplementing them.
- [foot](https://codeberg.org/dnkl/foot) is a lead for a Wayland-native,
  lightweight terminal and [server mode](https://codeberg.org/dnkl/foot#server-daemon-mode),
  where one process hosts multiple windows.
- [Ghostty](https://ghostty.org/) is a lead for native platform integration,
  modern protocols, and [libghostty embedding](https://ghostty.org/docs). The
  existing local snapshot remains the only pinned Ghostty evidence here.
- [GNOME Terminal](https://gitlab.gnome.org/GNOME/gnome-terminal) and
  [Konsole](https://konsole.kde.org/) are leads for mature desktop baselines,
  including profiles, tabs, splits, and desktop integration.
- [Windows Terminal](https://github.com/microsoft/terminal) is a lead for a
  shell-host model spanning profiles, panes, actions, configuration, and
  Windows/WSL integration.
- [kitty](https://sw.kovidgoyal.net/kitty/) is a lead for layouts, graphics and
  keyboard protocols, kittens, and [remote control](https://sw.kovidgoyal.net/kitty/remote-control/).
  Its existing local snapshot remains the only pinned kitty evidence here.
- [WezTerm](https://wezterm.org/) is a lead for Lua configuration, mux objects,
  domains, and remote or headless operation. Its existing local snapshot remains
  the only pinned WezTerm evidence here.
- [iTerm2](https://iterm2.com/) is a lead for shell integration, semantic
  command/session context, automation, and optional [web browser sessions](https://iterm2.com/documentation-web.html)
  in the existing window/tab/split hierarchy.
- [Ratty](https://github.com/orhun/ratty) is an experimental lead for a
  Rust/Ratatui presentation that can include inline 3D graphics. It concerns
  rich rendering and non-text surfaces, not default terminal compatibility.
- [Warp](https://github.com/warpdotdev/warp) and [official documentation](https://docs.warp.dev/)
  are leads for an agentic development environment, agent sessions,
  terminal/editor workflows, and automation. No local Warp snapshot exists in
  `tmp/references/`; these are external leads only, not pinned evidence.

### Bitty comparison boundary

The useful comparison is not "add a browser to a terminal." It is whether a
generic Panel can host providers while terminal emulation, workspace composition,
and capability policy remain separate. A future browser provider could be
optional and use a native system web view, an external browser, or another
reviewed backend. The generic Panel contract must not require Electron,
Chromium, or a particular browser engine. This is a research boundary, not an
accepted implementation decision.
