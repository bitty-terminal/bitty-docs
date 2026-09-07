---
title: Semantic Terminal RFC
description: Draft proposal for semantic command blocks, folding, Hint Mode, command composer, and cross-panel hint API
category: specifications
audience: contributor
document_type: specification
status: draft
website_publish: false
sidebar_order: 29
---

# Semantic Terminal RFC

> Status: **Draft proposal** as of 2026-09-07 (CTX-0130). This document
> proposes a direction only. It authorizes no implementation, closes no open
> question, weakens no normative control, and moves no risk. Any slice below
> needs its own accepted RFC or ADR plus independent review before code is
> authorized.

## Problem

A traditional terminal shows an undifferentiated character stream. Bitty
already records OSC 133 shell-integration zones as ordinal-grouped
`CommandRegion` values, but a user still cannot address a past command as an
object: fold its output, jump to it from the keyboard, copy one result, or
compose a long command without fighting single-line shell input. The same gap
repeats for panels and workspaces once several are visible: everything is
reachable by mouse, little is addressable from the keyboard.

This RFC proposes raising the character stream into addressable semantic
objects while keeping Terminal Truth byte-identical underneath.

## Baseline reality (not claims)

The proposal builds on mechanisms that already exist in `bitty` origin `main`
at `1835175`; none of them is changed by this draft:

- `CommandRegion` groups prompt, input, output, and exit code by OSC 133
  ordinal sequence only (`crates/bitty-rich/src/shell.rs`); row anchoring is
  explicitly marked as future work there.
- Overlay capacity is bounded at `MAX_OVERLAYS_PER_WINDOW = 4` plus one modal
  (`crates/bitty-ui/src/panel.rs`).
- Focus routing is deterministic over `ViewId` (`crates/bitty-ui/src/focus.rs`).
- Panels mount as `ViewContent::Panel(PanelId)` through `PanelRuntime::mount`
  with `PanelId`/`ViewId`/`TerminalId` kept pairwise incompatible.
- The workspace compositor contract is accepted
  ([Workspace Compositor](workspace-compositor.md)); the Panel Runtime contract
  is still a draft pre-study ([Panel Runtime Pre-Study](panel-runtime-pre-study.md)).

## Design principle

Folding, hints, and composition are **presentation projections**, never edits
to Terminal Truth:

```text
PTY
  |
  v
VT parser
  |
  v
Terminal State / Scrollback        <- always complete and authoritative
  |
  v
Semantic ranges (CommandBlock, targets)
  |
  v
Presentation projection (fold, hints, composer)
```

Consequences that stay invariant under every proposal below: expanding a fold
loses no data, copy-all still yields complete output, search still covers
folded content, agent history reads are unaffected, and deterministic replay is
untouched.

## Proposal route

The recommended order is P1 through P6. Each step is useful alone; no step
requires the later ones.

### P1: CommandBlock semantic anchoring

Propose a `CommandBlock` identity that survives resize, reflow, and scroll.
The open design question is the anchor type: a stable scrollback line identity
(`start_line_id` plus `end_line_id`) is preferred over raw row numbers, which
shift under reflow. Proposed shape (candidate, not accepted):

```text
CommandBlock { id, cwd, input range, output range, exit code, state }
```

with states `Running`, `Completed`, `Failed`, and `Interrupted`. Until this is
accepted, folding (P2) has nothing stable to point at, so P1 gates P2.

### P2: Folding MVP

Propose collapsing a completed `CommandBlock` output region into a one-line
summary (line count plus exit status) while the underlying rows stay intact.
Fold state is per-view presentation state, never persisted into scrollback.
Copy, search, and agent reads operate on the unfolded truth. The MVP covers
toggle one block, expand all, and collapse all; per-block pinning and duration
or AI-summary annotations are explicitly deferred.

### P3: Hint Mode

Propose a keyboard addressing layer in the spirit of flash-style navigation,
named Hint Mode rather than jump mode because jumping is only one action.
Pressing a leader sequence would overlay short labels on the currently
addressable targets; typing a label selects the target, and a preceding action
key chooses what happens to it. Candidate target set: `CommandBlock`, panel,
workspace, view, link, search result, rich block, and tab. Candidate actions:
focus, jump, expand, collapse, open, close, copy, pin, and inspect, composed
as `Action(Target)` in the style of operator plus motion.

Hint labels must not consume the bounded overlay budget: the proposal asks for
one ephemeral annotation layer carrying a bounded batch (candidate bounds: at
most 256 targets and 8 KiB of label text per frame), rendered by the
compositor as a single presentation layer rather than hundreds of overlays.
Final dispatch reuses the existing deterministic focus routing by resolving a
target to a `ViewId`, `PanelId`, or `CommandId`.

### P4: Command Composer

Propose an opt-in multiline command buffer opened by an explicit key (never by
hijacking Enter globally). Inside the composer, Enter inserts a newline and a
configurable submit key (for example Ctrl+Enter) sends the buffer; outside the
composer, bytes flow to the PTY exactly as today, so fullscreen programs,
REPLs, and TUIs are unaffected. A prompt-aware variant could offer the
composer only while shell semantic state reports an input phase and fail open
to raw terminal behavior when OSC 133 is absent. On submit, the buffer would
travel to the shell line editor as one bracketed paste followed by a final
Enter, which keeps Unicode, multiline content, and paste safety intact without
simulating individual keystrokes.

### P5: External editor

Propose opening the composer buffer in `$VISUAL` or `$EDITOR` through a secure
temporary file that is removed after the editor exits, returning its content
to the composer. A later Panel-native variant could host the editor in a
transient floating panel instead of covering the terminal; that variant is
deferred until the Panel Runtime contract is accepted.

### P6: Cross-panel Hint API

Propose generalizing P3 so any provider (command blocks, panels, workspaces,
rich content, future first-party plugins) registers hint targets of a declared
kind with an anchor, a scope, and a supported action set, while one hint
engine owns label allocation, overlay rendering, and action dispatch. A sketch
of the Lua surface (candidate, not accepted):

```lua
bitty.hints.register({
  kind = "my-object",
  targets = function() end,
  actions = { open = function() end, close = function() end },
})
```

P6 is deliberately last: it is only meaningful once P1 anchors and the P3
engine exist.

## Proposed packaging

To avoid one oversized plugin, the draft suggests three narrow first-party
units for a future RFC to accept or reject: a shell-blocks unit (OSC 133,
`CommandBlock`, fold, navigation), a hints unit (targets, labels, selection,
dispatch), and a composer unit (buffer, submit keys, history, external
editor). Packaging is advisory; it creates no repositories and assigns no
owners.

## Security considerations

- Folding changes no trust boundary: hidden output is still terminal content
  and stays untrusted observation data for agents.
- The composer must never intercept input outside its explicit mode, must fail
  open to raw PTY behavior, and must not weaken paste inspection or clipboard
  policy ([Terminal State RFC](terminal-state-rfc.md),
  [Isolation Resource RFC](isolation-resource-rfc.md)).
- The hint annotation layer is ephemeral presentation with fixed bounds; it
  grants no capability and bypasses no allowlist ([Plugin Platform RFC](plugin-platform-rfc.md)).
- Composer submission via bracketed paste preserves existing paste-safety
  handling rather than inventing a new input path
  ([Input and Pointer Contract](input-pointer-rfc.md)).
- IPC or agent exposure of folding, hints, or composition needs its own scoped
  review under the [IPC and Agent RFC](ipc-agent-rfc.md) and the
  [Risk Evidence RFC](risk-evidence-rfc.md); this draft grants nothing.

## Open questions

- OQ-S1: What is the stable scrollback line identity for `CommandBlock`
  anchors, and who owns its allocation across resize and reflow?
- OQ-S2: Where does per-view fold state live, and does any of it persist
  across restarts?
- OQ-S3: What are the exact bounds for one hint batch, and how are overflow
  targets (beyond 256) presented or truncated?
- OQ-S4: Which leader sequences and action keys avoid collisions with shell,
  multiplexer, and editor bindings on all Tier 1 platforms?
- OQ-S5: Under what precise shell-semantic condition may the composer offer
  itself automatically, and what is the exact fail-open behavior without
  OSC 133?
- OQ-S6: What temporary-file, permission, and cleanup contract governs the
  external-editor round trip?
- OQ-S7: What capability, if any, does a third-party hint provider need, and
  how is a malicious or noisy provider contained?

## Relation to other documents

- [Terminal State RFC](terminal-state-rfc.md): owns OSC 133 semantics and
  scrollback truth; P1 needs its anchor decision.
- [Workspace Compositor](workspace-compositor.md): accepted tiling and view
  model that hints address.
- [Panel Runtime Pre-Study](panel-runtime-pre-study.md): draft lifecycle P6
  would build on; P6 waits for its acceptance.
- [Input and Pointer Contract](input-pointer-rfc.md): owns key handling that
  P3/P4 must not break.
- [IPC and Agent RFC](ipc-agent-rfc.md): owns any future remote exposure.
- Roadmap placement is proposed in
  [Now / Next / Later](../roadmap/now-next-later.md) only after acceptance;
  this draft changes no horizon by existing.
