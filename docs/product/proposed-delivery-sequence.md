---
title: Proposed Delivery Sequence
description: Candidate build order early deferral list and version ladder recorded from historical advisor input awaiting review
category: product
audience: maintainer
document_type: research
status: draft
website_publish: false
sidebar_order: 20
---

# Proposed Delivery Sequence

## Status and provenance

- Status: draft research record. Every sequence, list, and criterion below is a
  **proposal** retained for evaluation. Nothing here is accepted direction, a
  roadmap commitment, or authorization to implement.
- Source: the second historical ChatGPT conversation with the architecture
  advisor, share
  [6a8dae4b-2aec-83ea-9174-03abc1f81531](https://chatgpt.com/share/6a8dae4b-2aec-83ea-9174-03abc1f81531),
  a Chinese-language phased delivery discussion. The original wording is not
  reproduced because this corpus is English-only; all content below is an
  English working rendering of that source. Provenance mapping lives in the
  [shared-conversation coverage](../sources/chatgpt-share-coverage.md).
- Roadmap relation: the [Roadmap index](../roadmap/README.md) admits roadmap
  items only when they link accepted requirements, dependencies, owners, and
  success evidence. This record does not satisfy that admission bar and must
  not be cited as a release plan or date promise.
- Authority rule: if a future ADR or RFC accepts (or rejects) part of this
  material, update that artifact and this record together.

## Candidate build-order spine

The source proposes building capability in this order:

```text
PTY -> VT -> Grid -> Font -> GPU -> Correct Terminal -> Config
     -> Command/Event -> Plugin Runtime -> Plugin Manager
     -> DevTools -> Rich Presentation -> IPC -> Agent
```

Source guidance adds that this order should generally not be reversed: each
stage is described as the foundation the next stage needs. The stages map onto
existing candidate architecture vocabulary in the
[Architecture Overview](../architecture/overview.md) and
[Core and Plugin Boundaries](../architecture/core-boundaries.md); the ordered
sequence itself is the new proposal recorded here.

## Candidate early-deferral list

The source proposes deferring the following until the spine above exists,
because each tempts an early build that would destabilize the foundations:

- AI features.
- A plugin store or marketplace distribution surface.
- Fancy tabs and window chrome.
- Markdown rendering.
- The `bittyd` daemon.
- An SSH manager.
- A theme marketplace.

This list overlaps the accepted [Product vision](vision.md) non-goals, which
already refuse current-phase commitment to `bittyd` and to an AI-first product
experience. The broader list itself remains a proposal; it neither strengthens
nor replaces those non-goals.

## Candidate version-maturity ladder

The source proposes interpreting version numbers as architecture-maturity
labels that need not track calendar time:

| Version | Candidate scope                                                    |
| ------- | ------------------------------------------------------------------ |
| v0.0.x  | Architecture and protocol prototypes.                              |
| v0.1    | A shell runs correctly in a minimal terminal slice.                |
| v0.2    | VT and TUI compatibility work.                                     |
| v0.3    | GPU rendering, fonts, performance, and graphics protocols.         |
| v0.4    | Lua configuration system.                                          |
| v0.5    | Plugin API.                                                        |
| v0.6    | Plugin manager and lazy loading.                                   |
| v0.7    | DevTools and the debug protocol.                                   |
| v0.8    | Rich presentation, Markdown stress testing, and shell integration. |
| v0.9    | IPC, `bitty ctl`, MCP adapter, and stabilization.                  |
| v1.0    | Stabilized plugin, configuration, command, and debug contracts.    |

Notably, the source ladder places `bittyd` nowhere before v1.0, consistent
with its explicit Phase 10 positioning below.

### Candidate v1.0 criteria

The source proposes a strict bar for calling any release v1.0:

- Platforms: Tier 1 Linux, Windows, and macOS plus Tier 2 BSD, consistent with
  the platform tiers accepted in [ADR 0002](../decisions/adrs/ADR-0002-platform-support-tiers.md).
- Shell coverage: compatibility across five shells; which shells belong to the
  first milestone remains governed by
  [OQ-004](../decisions/open-questions.md) and the
  [Compatibility Milestone RFC](../specifications/compatibility-milestone-rfc.md).
- Application compatibility targets including Neovim, tmux, Starship, htop,
  fzf, and lazygit.
- Stable versioned surfaces: Plugin API v1, Config schema v1, Command API v1,
  Debug Protocol v1, and Plugin Manifest v1.
- Security gates already normative in the
  [security overview](../security/overview.md) and
  [threat model](../security/threat-model.md), such as parser limits,
  least-privilege capabilities, VM isolation, safe mode, scoped IPC permissions,
  checksum-and-lock package validation, paste protection, OSC policies, and
  fuzz coverage. Listing them here as proposed release criteria does not weaken
  or replace those normative controls, which hold regardless of any version
  label.
- Support tooling: doctor, dev, devtools commands, SDK, template, and docs.

## Candidate daemon staging

For the headless `bittyd` daemon question, the source records a definite
position that this corpus has **not** adopted:

- Positioning: place the daemon after v1.0, or at earliest near v1.0. The
  architecture should accommodate it early, but implementation should not
  start early.
- Candidate feature scope if ever adopted: detach/attach of running terminals,
  persistent sessions, a remote frontend, and multiplexer-style ownership of
  multiple terminals.
- Recorded rationale: building the daemon first would greatly increase
  terminal-lifecycle complexity compared with the single-process design.

This staging is offered to [OQ-020](../decisions/open-questions.md) as a
candidate consideration only. OQ-020 stays open, including its trust-boundary
half, which requires analysis against the
[threat model](../security/threat-model.md). The existing candidate bullet in
the [Architecture Overview](../architecture/overview.md) long-term evolution
section remains the boundary-level description.

## Relationship to registers

- No open question is closed or answered by this record, and no entry in the
  [decision register](../decisions/index.md) changes status.
- Acceptance of any item requires the reviewable artifact named in the
  [open-question register](../decisions/open-questions.md) or a new scoped
  ADR/RFC.
