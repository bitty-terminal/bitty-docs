---
title: Small-core refactor execution handoff
description: Cross-repository execution map for the remaining Bitty mechanism and policy extractions
category: project
audience: mixed
document_type: guide
status: draft
website_publish: false
sidebar_order: 13
---

# Small-core refactor execution handoff

## Document status

This is a draft cross-session handoff for planned work. It records task routing,
dependencies, and evidence boundaries. It does not claim that any extraction,
repository creation, API, or architectural decision is implemented or accepted.

## Purpose and scope

This handoff prepares later agents to execute the remaining small-core work:
observability, package management, Beacon, Composer, legacy chrome, and the
validation suites. It also preserves the earlier plugin, network, component,
and workspace-presentation follow-ups in the same dependency map.

## Current evidence

- `bitty-network`, `bitty-ipc`, and `bitty-agent` are independent repositories;
  this handoff treats that as precedent, not as permission to remove another
  boundary without an owner decision.
- `bitty-observability` already exists as an independent repository with API,
  core, and facade crates. Its existence is not evidence that Core has adopted
  the corresponding trait boundary.
- Core still contains `bitty-ui/src/beacon_*.rs`, `bitty-package`, the Composer
  implementation in `bitty-rich`, and validation members/scripts. Their current
  callers and CI use must be audited before removal.
- Workspace presentation is documented as plugin-only, but legacy source files
  and compatibility paths still require an implementation task and regression
  evidence.
- Beacon B-8's mechanism/policy split direction is accepted (see `W-70` and
  [ADR 0015](../decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)).
  The Core mechanism name, provider surface, input capture, overlay ownership,
  session rules, and cross-plugin metadata visibility remain open and are owned
  by `W-03`, `W-29`, and `W-120`.

## Workstreams

### Governance and contracts

- `W-70` decided the proposed extraction boundaries and recorded the owner
  decision in
  [ADR 0015](../decisions/adrs/ADR-0015-small-core-extraction-boundaries.md).
  The focused contracts `W-71` through `W-75` are still to be written. No
  implementation task may treat a proposal as implemented merely because a
  candidate document exists.
- `W-71` defines the minimal Core observability contract and the extraction gate.
- `W-72` defines the package-manager/runtime-loader boundary and the network
  enforcement evidence required by DIR-016 and DIR-017.
- `W-73` defines the Composer boundary, overlay slot, input capture, PTY paste,
  editor-process, and lifecycle contracts.
- `W-74` decides the remaining tab-strip and scratchpad ownership under ADR-0014.
- `W-75` decides whether `bitty-compat-lab` and `bitty-perf` remain workspace
  members, become separate validation repositories, or stay as explicitly
  excluded tooling.

### Documentation and SDK

- `W-80` through `W-84` synchronize the terminal documentation after the
  governance decisions.
- `W-90` and `W-91` define the Beacon plugin page set and reconcile it with the
  actual SDK overlay/input-capture surface.
- `W-120` adds SDK surface only after the relevant contracts are accepted.

### Core and extracted repositories

- `W-100` establishes the Core observability boundary in staged form.
- `W-101` audits and narrows package-manager use in the host; it must not remove
  install or verification behavior before a replacement boundary exists.
- `W-102` extracts Beacon policy while retaining only the accepted mechanism.
- `W-103` extracts Composer only after the host contract is accepted.
- `W-104` removes legacy chrome policy only after the presentation owner and
  parity evidence are recorded.
- `W-105` relocates or excludes validation suites without weakening CI coverage.
- `W-110` aligns the existing observability repository to the accepted contract.

### Plugin ecosystem

- `W-121` creates and registers `bitty-terminal/beacon` only after its page set,
  SDK surface, and onboarding evidence are ready.
- `W-122` tracks the independent review and registry migration needed to onboard
  `bar`; it is unrelated to Beacon repository creation.

### Mechanism and policy extraction (execution, graphics, accessibility, storage, platform)

- `W-130` decided the execution, graphics, accessibility, storage, and
  platform-service boundaries and recorded the owner decision in
  [ADR 0016](../decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md).
  The focused contracts `W-131` through `W-138` are still to be written.
- `W-131` reconciles history and storage scope: transcript, command history,
  session snapshots, and plugin key-value storage.
- `W-132` defines the execution extraction contract (principals, generations,
  lifetime, PTY/process ownership, cancellation, OOM evidence, recovery).
- `W-133` defines the graphics extraction contract (bounded APC intake, decode
  worker, placement, quotas, texture upload, failure handling).
- `W-134` defines the accessibility adapter contract (semantic snapshots,
  focus/actions, privacy, platform backends, baseline coverage).
- `W-135` defines the search and selection mechanisms (stable snapshot/line
  identities, viewport navigation, input capture, clipboard gates). It is not a
  `W-130` boundary contract; it is owned with the search and copy-mode plugins.
- `W-136` defines the platform-service contract (notification, URL
  permission/launch, compositor blur).
- `W-137` defines the history/storage policy contract and plugin page sets.
- `W-138` defines the search/copy-mode policy contracts and plugin page sets.
- `W-140` through `W-146` extract or integrate each accepted boundary in Core
  after the matching producer implementation and parity evidence exist.
- `W-147` verifies the small-core dependency graph, safe startup, regression,
  platform behavior, and the evidence matrix.

## Dependency rules

CarryCtx dependencies are repository-local. Cross-repository dependencies are
therefore recorded by `W-*` keys in this document and in each Issue body. The
required order is:

1. Decide the boundaries (`W-70`, `W-130`), then finalize the focused contracts
   (`W-71` through `W-75`, `W-131` through `W-138`).
2. Synchronize terminal and plugin documentation (`W-80` through `W-91`).
3. Implement host and SDK surfaces (`W-100` through `W-105`, `W-110`, `W-120`,
   `W-139`).
4. Create, register, and implement the Beacon plugin (`W-121`), followed by
   integration and evidence tasks.

For the mechanism and policy extraction the required order is: boundary decision
(`W-130`), focused contracts (`W-131` through `W-138`), host and SDK readiness
(`W-139`), producer and plugin implementation (`W-140` through `W-146` carry the
Core integration and retirement work after each producer exists), then
independent integrated verification (`W-147`). A producer or implementation task
must not be treated as ready while its contract is unaccepted.

The existing overlay/input-capture work (`W-01`, `W-28`, `W-43`) remains a hard
prerequisite for Beacon and Composer. Existing package/component work (`W-10`,
`W-20`, `W-22`, `W-23`) remains independent but must be reconciled with `W-72`.
The existing bar review and registry migration (`W-40`, `W-51`) remain
prerequisites for `W-122`.

## Handoff instructions

A later agent should begin by reading this document, the matching CarryCtx task,
the repository-local `AGENTS.md`, and the current code evidence. Before changing
code, record a progress note and confirm that the required owner decision and
contract tasks are complete. Keep candidate, planned, experimental, accepted,
and implemented claims distinct. Do not initialize documentation submodule
mounts, do not touch unrelated dirty worktrees, and do not commit or push
without explicit authorization.

## Verification expectations

Every implementation task must include focused unit or integration evidence,
negative-path coverage for invalid handles/capabilities/budgets, and the
repository's normal local gates. Cross-platform behavior must be supported by
CI or explicit platform evidence. Documentation changes must update affected
architecture, security, roadmap, and API pages before the implementation task
can complete.

## Related plan

The stable `W-*` keys and repository routing are listed inline in the
"Workstreams" and "Dependency rules" sections above. They are planning keys for
this handoff, not a canonical product contract.
