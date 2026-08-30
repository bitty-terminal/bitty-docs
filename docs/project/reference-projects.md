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

### kitty prior-art lead

- How do the child-I/O, parser, and renderer execution domains avoid blocking
  one another?
- How do the glyph atlas, damage tracking, and GPU uploads maintain low latency?
- What are the actual semantics of image and placement, z-index, scrolling, and
  animation in Kitty Graphics?
- What are the boundary conditions for the keyboard protocol and long or
  malicious control sequences?

### WezTerm prior-art lead

- How does `wezterm-term` remain independent of GUI and PTY code, and which
  boundaries make suitable differential oracles?
- What known constraints arise from repeated Lua configuration evaluation and
  runtime side effects?
- How are the mux, GUI, headless, and remote domains layered?
- How are OpenGL, WebGPU, and software renderers and platform fallback
  strategies tested?

## Panel and workspace prior-art leads

This section records **non-normative research leads** from the second research
snapshot, `tmp/research/chatgpt-2026-08-30-2.md`, and the not-yet-merged Panel
Extensibility Vision draft. An observation from a pinned local snapshot must
name its project, commit, exact file or symbol, and observation. An unpinned
entry is an external URL observation and research lead; it must name the
official URL and must not be presented as snapshot-backed evidence. The
research snapshot is untrusted external input and is not normative evidence.
The primary-source URLs below are review leads, not dependency or product
commitments. They are prompts for source-level research and future RFC or ADR
work.

### Zellij

**External URL observation and research lead; no local commit pin.** The
official [Zellij plugins](https://zellij.dev/documentation/plugins.html) and
[plugin and pipe](https://zellij.dev/documentation/zellij-plugin-and-pipe.html)
documentation describe a WASM plugin pane as a first-class workspace
participant beside terminal panes. They describe rendering UI, receiving input,
observing state and events, and participating in ordinary or floating panes.
This is the sharpest external prior art lead for the proposition that
`Pane != PTY`: a plugin pane can be a workspace surface without owning a PTY.
Its character-cell TUI boundary is distinct from Bitty's candidate internal
Panel compositor and GPU UI runtime.

These are external URL observations, not claims from a pinned snapshot.

Research questions:

- Which plugin-pane lifecycle, input, state, event, pipe, and message contracts
  are stable enough to compare with a future Panel RFC?
- What are the WASM sandbox resource and failure boundaries for plugin panes?
- Which parts of the pane compositor assume character-cell rendering rather
  than an arbitrary application surface?

### kitty

The existing snapshot is pinned at `087b8c35c455e1fa21a727916efdaf59ebdd0168`.
Snapshot-backed observation: in `tmp/references/kitty/kitty/remote_control.py`,
`remote_control_allowed`, `PasswordAuthorizer.is_cmd_allowed`, and `SocketIO`
show password/pattern authorization and socket transport for remote commands;
in `tmp/references/kitty/kittens/panel/main.py`, `actual_main` calls
`boss.add_os_panel` and creates a tab containing the requested command. These
observations support research into CLI-to-instance control and a panel surface
that hosts a terminal program. The official [remote control](https://sw.kovidgoyal.net/kitty/remote-control/),
[panel](https://sw.kovidgoyal.net/kitty/kittens/panel/), and [desktop UI](https://sw.kovidgoyal.net/kitty/kittens/desktop-ui/)
documentation are separate review leads for behavior not established by these
source references. kitty's desktop panel is therefore a research comparison,
not the same abstraction as a Bitty internal Panel node.

Research questions:

- Which remote-control authentication, scope, discovery, and failure behaviors
  are relevant to a bounded local Bitty IPC design?
- How do Kittens and watchers differ in lifecycle, rendering ownership, and
  access to terminal state?
- Which kitty panel behavior depends specifically on Wayland layer-shell or
  desktop integration?

### WezTerm

The existing snapshot is pinned at
`f93d90350075d3e42566e0557ca36e82ffdcbec1`. Snapshot-backed observation: in
`tmp/references/wezterm/mux/src/pane.rs`, the `Pane` trait represents a view on
a terminal; in `tmp/references/wezterm/mux/src/domain.rs`, the `Domain` trait
spawns panes and assigns them to tabs; and in `tmp/references/wezterm/mux/src/lib.rs`,
`Mux` owns multiplexer state. In
`tmp/references/wezterm/lua-api-crates/plugin/src/lib.rs`, `RepoSpec::parse`,
`RepoSpec::check_out`, and `RepoSpec::update` show plugins represented by
repositories checked out under a plugin data directory. These observations are
research leads for programmable workspace, IPC, remote-domain, and plugin
design, not claims that a plugin application panel is the core UI model. The
official [mux API](https://wezterm.org/config/lua/wezterm.mux/index.html),
[CLI](https://wezterm.org/cli/cli/index.html), [multiplexing](https://wezterm.org/multiplexing.html),
and [plugins](https://wezterm.org/config/plugins.html) documentation are review
leads for behavior beyond the pinned source observations.

Research questions:

- How do mux, GUI, headless, local, Unix-socket, SSH, and TLS domains divide
  ownership and trust boundaries?
- Which `wezterm cli` operations and asynchronous behaviors would be useful
  comparison points for Bitty IPC?
- What constraints follow from repeated Lua configuration evaluation and
  runtime side effects?

### tmux

**External URL observation and research lead; no local commit pin.** The
official [tmux control mode](https://github.com/tmux/tmux/wiki/Control-Mode)
documentation describes tmux's server, session, window, pane, and client
hierarchy as prior art for a long-lived workspace service. Control
mode (`tmux -C` and `tmux -CC`) demonstrates RPC combined with asynchronous
events: command responses and notifications share a text protocol without
making panes generic application surfaces.

This is an external URL observation, not a claim from a pinned snapshot.

Research questions:

- Which control-mode messages, ordering guarantees, and subscription behaviors
  should inform a bounded Bitty RPC plus event-stream comparison?
- How do server lifetime, client attachment, session ownership, and errors map
  to Bitty's current local IPC and headless constraints?
- Which control-mode behaviors are terminal-management-specific and should not
  be treated as a Panel API?

### Emacs

**External URL observation and research lead; no local commit pin.** The
official [GNU Emacs Shell manual](https://www.gnu.org/software/emacs/manual/html_node/emacs/Shell.html)
supports reviewing Emacs as conceptual prior art for an
application platform built from Buffer, Window, Frame, Command, Event, and
Lisp primitives. A Window can display terminal, shell, file-manager, browser,
mail, or editor content. The analogy is useful for Panel content and extension
composition, but it is not evidence for a particular Bitty runtime or API.

This is an external URL observation, not a claim from a pinned snapshot.

Research questions:

- Which Buffer and Window identity, display, and lifecycle semantics are useful
  when separating Panel identity from terminal identity?
- How do commands, keymaps, hooks, and Elisp package boundaries compose without
  making the core own every application?
- Which server and daemon behaviors are comparable to local Bitty IPC, and
  which depend on Emacs's editor-centric assumptions?

### Warp

**External URL observation and research lead; no local commit pin.** The
official [Warp documentation](https://docs.warp.dev/) presents Warp as prior art
for a built-in IDE
direction: terminal, agent, file tree, editor, LSP, and code-review surfaces
are integrated into one product. It is not evidence of a generic plugin UI
platform. The useful comparison is therefore product positioning and built-in
application scope, not an extensibility contract.

This is an external URL observation, not a claim from a pinned snapshot.

Research questions:

- Which integrated surfaces are built into Warp rather than exposed as a
  third-party panel or application API?
- What user and workflow benefits come from the terminal-to-IDE direction, and
  what scope costs would it impose on a small core?
- How should a Bitty distribution differ from making IDE features part of the
  product core?

### iTerm2

**External URL observation and research lead; no local commit pin.** The
official [iTerm2 documentation](https://iterm2.com/documentation.html) and
[tmux integration](https://iterm2.com/3.3/documentation-tmux-integration.html)
describe iTerm2 as combining terminal features with
Web Browser, AI Chat, Toolbelt, Python automation, triggers, coprocesses, and
tmux integration. This demonstrates a terminal product accumulating built-in
application and automation surfaces, rather than a generic third-party Panel
platform. Its tmux integration is also a useful cross-product example of
control-mode RPC and event behavior.

These are external URL observations, not claims from a pinned snapshot.

Research questions:

- Which iTerm2 features are built-in product surfaces versus programmable API
  entry points?
- How does tmux integration map remote windows and panes into native UI, and
  what identity or event assumptions does that require?
- Which Python automation and coprocess capabilities would require explicit
  capability and resource boundaries in Bitty?

### Comparison

The following comparison defines five research categories: whether a surface
may exist without a PTY, how UI extensions are exposed, how instances are
controlled, whether workspace state is managed, and whether the product tends
toward an application platform. Every row is a **qualitative research
hypothesis to validate**, not an objective acceptance fact or capability
guarantee. Terms such as `partial`, `built-in`, and `close` are directional
shorthand, not API equivalence.

| Project | Non-PTY surface hypothesis          | UI-extension hypothesis  | IPC/control hypothesis                           | Workspace hypothesis  | Application-platform hypothesis |
| ------- | ----------------------------------- | ------------------------ | ------------------------------------------------ | --------------------- | ------------------------------- |
| Zellij  | WASM plugin pane                    | WASM plugin UI           | Pipe/message                                     | Workspace-managed     | Close, TUI-oriented             |
| kitty   | No generic internal pane            | Kittens/watchers         | Remote control                                   | Partial               | Partial, desktop surfaces       |
| WezTerm | No generic internal pane            | Lua extension            | CLI/socket and mux                               | Workspace-managed     | Partial, mux-oriented           |
| tmux    | No                                  | No generic UI            | Control mode, RPC plus async events              | Workspace-managed     | No                              |
| Emacs   | Buffer-backed surface               | Elisp                    | Server                                           | Workspace-managed     | Yes, conceptual                 |
| Warp    | Built-in surfaces, type unspecified | Not the core model       | Internal product behavior, not a public contract | Product-managed state | IDE-oriented, built-in          |
| iTerm2  | Built-in features, type unspecified | Python API and built-ins | tmux integration and automation                  | Product-managed state | Partial, built-in               |

The comparison supports research of the candidate distinction described in the
not-yet-merged Panel Extensibility Vision draft, especially `Panel != PTY`.
That draft is a future-document reference rather than a repository link until
it has been accepted and merged. This register does not establish dependencies,
compatibility, or product commitments; those require Bitty-specific security
review, measurements, and an accepted RFC or ADR.

## Usage rules

- Prefer `rg` and `ctxctl outline/symbol/read/deps` for narrow research.
  Never dump an entire file or repository into Agent context.
- Pinned-snapshot research notes must include the project name, commit, exact
  file or symbol, and observation, not merely a second-hand conclusion.
  Unpinned leads must instead be explicitly marked as external URL observations
  and research leads, include the official URL, and must not imply local file or
  symbol evidence; both forms must remain reproducible by recording their
  source.
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
