---
title: Repository and Local Workspace Map
description: Records the accepted polyrepo topology, current repository initialization state, planned responsibilities, and local routing rules.
category: project
audience: contributor
document_type: reference
status: draft
website_publish: false
sidebar_order: 91
---

# Repository and Local Workspace Map

## Topology principles

Bitty has accepted an organization-level polyrepo. ADR 0001 accepts a minimal
Core Cargo workspace for initialization; the expanded crate graph is now
**Pre-alpha / Engineering Milestones M1-M8** at 19 crates (`bea338d`) with lifecycle
`Specified -> Accepted -> Implemented -> Verified -> Compatible -> Release-ready`
(see Status below):

- The top-level `bitty-terminal/` directory is a local umbrella workspace, not
  a Git repository.
- Product repositories are independent. Run Git and CarryCtx commands inside
  the target child repository.
- The `bitty/` workspace is spine-complete (nineteen members in
  `bitty/Cargo.toml` as of 2026-09-14 `bea338d`): `bitty-vt`, `bitty-term-state`,
  `bitty-pty`, `bitty-platform`, `bitty-config`, `bitty-render`, `bitty-ui`,
  `bitty-plugin-host`, `bitty-runtime`, `bitty-package`, `bitty-lua`,
  `bitty-rich`, `bitty-ipc`, `bitty-agent`, plus `bitty-app`, the retained
  `bitty-core` seed, and verification/harness crates `bitty-compat-lab`,
  `bitty-perf`, and `bitty-test-support`. The accepted ten-crate topology is fixed in
  [ADR 0003](../decisions/adrs/ADR-0003-core-workspace-topology.md);
  `bitty-package` lifecycle and integrity model is accepted
  ([Package Lifecycle RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/specifications/package-lifecycle-rfc.md), OQ-021,
  2026-08-27) with real signature verification remaining draft per crate docs,
  and the tail crates (`bitty-rich` OQ-008/015/016, `bitty-ipc`/`bitty-agent`
  OQ-018, `bitty-lua` OQ-009/030-032) are `Implemented` (headless tests ~808)
  but not yet `Verified`; `Website Delivery` (OQ-023) and `Governance` (OQ-024)
  are `Accepted` 2026-08-29.
- `bitty-plugins` is the plugin-ecosystem entry repository (registry, store
  frontend, and official plugin submodules). The umbrella `bitty-plugins/`
  directory is only a local grouping directory, not a Git repository; its
  children (`activity`, `bitty-plugin-sdk`, `bitty-plugin-template`, and
  future plugins) are independent repositories.
- `bitty-ai` is an independent repository (AI-core runtime, providers, and
  context), checked out at the umbrella root `bitty-ai/`. The `bitty-ai/` path
  inside `bitty-docs` is the project-documentation submodule described below,
  not the code repository.
- `bitty-mcp` was archived on 2026-09-14 because its MCP tool-surface
  functionality is covered by `bitty-ai`; the remote is read-only for history
  and the local checkout moved to `.trash/bitty-mcp-archived-20260914`.
- Documentation is split by ownership: `bitty-docs` keeps shared
  cross-project governance and mounts the three project documentation
  repositories (`bitty-terminal-docs`, `bitty-ai-docs`, `bitty-plugins-docs`)
  as root submodules pinned to their merged `main`. Project content is mounted
  into the owning code repository at `<code-repo>/docs`. A future website
  consumer must use validated canonical Markdown rather than maintain
  duplicate specifications; no consumer exists yet.

Directory existence, completed Git initialization, and completed remote creation
are three distinct states. This document defines target boundaries and does not
describe an empty directory as an initialized repository.

## Local workspace

```text
bitty-terminal/                     # local umbrella, not a Git repo
├── .agents/                        # workspace-level agent skills/instructions
├── .trash/                         # recoverable removal target
├── recording/
│   └── references/                 # persistent local research clones
├── AGENTS.md                       # cross-repository operating contract
│
├── bitty/                          # independent repo: Rust core workspace
├── bitty-docs/                     # independent repo: shared governance + docs aggregator
│   ├── bitty-terminal/             # submodule: bitty-terminal-docs project content
│   ├── bitty-ai/                   # submodule: bitty-ai-docs project content
│   └── bitty-plugins/              # submodule: bitty-plugins-docs project content
├── bitty-ai/                       # independent repo: AI core (runtime, providers, context)
├── bitty-website/                  # independent repo: Astro public website
├── bitty-devtools/                 # independent repo: debug UI/client
│
└── bitty-plugins/                  # local grouping only, never parent Git repo
    ├── activity/                   # independent repo: first official plugin
    ├── bitty-plugin-sdk/           # independent repo
    ├── bitty-plugin-template/      # independent repo
    └── <plugin-name>/              # one independent repo per plugin
```

`recording/` is inside the workspace and holds temporary material that must survive
restarts. Do not place project research assets in the system `/tmp`. Prefer
moving deleted or retired files into `.trash/`, where a human can review them
before final cleanup.

## Current initialization state

As of 2026-09-14, the public remotes under `github.com/bitty-terminal` are
initialized and pushed. Branch protection with the required status checks
recorded below is enabled on the code and shared-governance repositories; the
three project documentation repositories are not yet protected, and the
distribution taps are recorded in the
[repository metadata baseline](../development/repository-metadata-baseline.md).
The `bitty-mcp` remote is archived and read-only.

| Local directory                        | Public remote                                             | Current state                                                                 | Required `main` status checks                                                                                                                                                                                 |
| -------------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bitty/`                               | `https://github.com/bitty-terminal/bitty`                 | Initial snapshot pushed; `main` protected (squash-only)                       | `Quality gates`, `MSRV 1.85 check`, `Windows check and test`, `macOS ARM64 check and test`, `Linux Wayland`, `Linux X11 (xvfb)`, `Analyze (rust)`, `Supply chain (deny/audit)`, `Analyze (actions)`, `CodeQL` |
| `bitty-ai/`                            | `https://github.com/bitty-terminal/bitty-ai`              | Initial snapshot pushed; `main` protected (merge, squash, and rebase enabled) | `Quality gates`, `MSRV 1.85 check`, `Linux`, `Windows`, `macOS`, `Supply chain`                                                                                                                               |
| `bitty-docs/`                          | `https://github.com/bitty-terminal/bitty-docs`            | Initial snapshot pushed; `main` protected (squash-only)                       | `Docs quality`                                                                                                                                                                                                |
| `bitty-docs/bitty-terminal/`           | `https://github.com/bitty-terminal/bitty-terminal-docs`   | Content split merged; submodule mount; not yet protected                      | (none yet)                                                                                                                                                                                                    |
| `bitty-docs/bitty-ai/`                 | `https://github.com/bitty-terminal/bitty-ai-docs`         | Content split merged; submodule mount; not yet protected                      | (none yet)                                                                                                                                                                                                    |
| `bitty-docs/bitty-plugins/`            | `https://github.com/bitty-terminal/bitty-plugins-docs`    | Content split merged; submodule mount; not yet protected                      | (none yet)                                                                                                                                                                                                    |
| `bitty-website/`                       | `https://github.com/bitty-terminal/bitty-website`         | Initial snapshot pushed; `main` protected (squash-only)                       | `Website quality`, `Analyze (actions)`, `Analyze (javascript-typescript)`, `CodeQL`                                                                                                                           |
| `bitty-devtools/`                      | `https://github.com/bitty-terminal/bitty-devtools`        | Initial snapshot pushed; `main` protected (squash-only)                       | `Lint GitHub Actions workflows`, `Quality gates`, `Analyze (javascript-typescript, actions)`, `CodeQL`                                                                                                        |
| `bitty-plugins` (registry/store)       | `https://github.com/bitty-terminal/bitty-plugins`         | Initial snapshot pushed; `main` protected; no umbrella checkout               | `Plugin integration`, `Lint GitHub Actions workflows`, `Analyze (javascript-typescript, actions)`                                                                                                             |
| `bitty-plugins/activity/`              | `https://github.com/bitty-terminal/activity`              | Initial snapshot pushed; `main` protected (merge, squash, and rebase enabled) | `Quality gates`, `Lint GitHub Actions workflows`, `Analyze (actions)`, `Analyze (javascript-typescript)`, `CodeQL`                                                                                            |
| `bitty-plugins/bitty-plugin-sdk/`      | `https://github.com/bitty-terminal/bitty-plugin-sdk`      | Initial snapshot pushed; `main` protected (squash-only)                       | `Actionlint`, `Quality gates`, `Analyze (actions)`, `Analyze (javascript-typescript)`, `CodeQL`                                                                                                               |
| `bitty-plugins/bitty-plugin-template/` | `https://github.com/bitty-terminal/bitty-plugin-template` | Initial snapshot pushed; `main` protected (squash-only)                       | `Lint GitHub Actions workflows`, `Quality gates`, `Analyze (actions)`, `Analyze (javascript-typescript)`, `CodeQL`                                                                                            |

The umbrella root and the `bitty-plugins/` grouping directory are not Git
repositories; `bitty-plugins` (registry/store) and `bitty-ai` are independent
repositories and are separate CarryCtx projects. This is an intentional routing
and grouping boundary, not an omission.

## Repository responsibilities

| Repository or directory | Planned responsibility                                                                                           | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bitty`                 | Rust runtime and application                                                                                     | Spine-complete workspace (nineteen members) accepted in ADR 0003 for ten crates plus `bitty-package` lifecycle/integrity model accepted (OQ-021, 2026-08-27) plus `bitty-lua` (OQ-009/030-032) and tail crates `bitty-rich` (OQ-008/015/016), `bitty-ipc`/`bitty-agent` (OQ-018) `Implemented` (compat-lab/perf hardening and UX wave through `29772a3` plus the `v0.0.20` plugin-runtime, Kitty-graphics, decoration, and config-matrix wave at `bea338d`) but not yet `Verified`; signatures still draft; Plugin API `Accepted` via Plugin Platform RFC; debug protocol `Accepted` via DevTools RFC |
| `bitty-docs`            | Shared governance plus aggregator: ADRs, RFCs, security, project state, roadmap, and the project docs submodules | Accepted authoritative governance repository; owns the root submodule pointers and the shared registers                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `bitty-terminal-docs`   | Terminal-platform documentation (submodule `bitty-terminal`)                                                     | Split content merged; canonical project documentation for the terminal platform                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `bitty-ai-docs`         | AI-core documentation (submodule `bitty-ai`)                                                                     | Split content merged; canonical project documentation for the independent AI core                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `bitty-plugins-docs`    | Plugin documentation (submodule `bitty-plugins`)                                                                 | Split content merged; canonical plugin platform, SDK, lifecycle, and per-plugin documentation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `bitty-ai`              | AI-core runtime, providers, context, and Tool Bus                                                                | Independent repository initialized; pre-implementation (ModelProvider, ContextProvider, Agent runtime, and Tool Bus scopes); design recorded in `bitty-ai-docs`                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `bitty-plugins`         | Plugin-ecosystem entry: registry, static store frontend, and official plugin submodules                          | Independent repository initialized; registry format, validation, and static store prototype exist; pre-implementation, no shipped install flow                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `bitty-website`         | Astro static shell and future presentation consumer of canonical `bitty-docs` Markdown                           | Astro, Bun, and Workers Static Assets bootstrap accepted; loader, synchronization, version selection, routes, and redirect manifest `Accepted` via Website Delivery RFC (OQ-023, 2026-08-29); theme/search remain open; consuming submodule-mounted project content is a follow-up                                                                                                                                                                                                                                                                                                                    |
| `bitty-devtools`        | Human debugging client                                                                                           | Repository created; debug-protocol model is a candidate                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `activity`              | First official independent plugin (privacy-first local activity timeline)                                        | Independent repository initialized; per-plugin documentation pending in `bitty-plugins-docs`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `bitty-plugin-sdk`      | Lua helpers, LuaLS types, mock host, and test tools                                                              | Independent repository accepted; exact responsibilities are candidates                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `bitty-plugin-template` | Plugin scaffold, CI, and manifest examples                                                                       | Independent repository accepted; minimal runnable template implemented ([bitty-plugin-template](https://github.com/bitty-terminal/bitty-plugin-template), R-TPL-1 [PR #28](https://github.com/bitty-terminal/bitty-plugin-template/pull/28))                                                                                                                                                                                                                                                                                                                                                          |
| Each plugin repository  | One optional user experience or integration                                                                      | Independent-repository model accepted; public API constraints are candidates                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

`bitty-mcp` is not a live repository: it was archived on 2026-09-14 (read-only
for history) and its MCP tool-surface scope is covered by `bitty-ai`.

## Accepted repository bootstrap baseline

[ADR 0001](../decisions/adrs/ADR-0001-repository-bootstrap-baseline.md)
accepts only the following initialization boundaries:

- `bitty` starts as a Rust 2024 Cargo workspace using resolver 3, stable Rust
  with `rustfmt` and `clippy`, a non-publishable `bitty-core` library, a
  non-publishable `bitty-app` binary, empty dependency tables, `just`, and
  read-only format/Clippy/test/`actionlint` CI.
- `bitty-website` starts as an Astro static shell managed by Bun. It builds to
  `dist` and uses Cloudflare Workers Static Assets with no Astro Cloudflare
  adapter and no Worker script.
- The website deployment workflow references only
  `secrets.CLOUDFLARE_API_TOKEN` and
  `secrets.CLOUDFLARE_ACCOUNT_ID`. It never stores or reads their values in this
  documentation repository.
- `CRATES_TOKEN` remains unused until a future decision explicitly authorizes
  crates.io publication.

Neither scaffold is implemented by the ADR or this map. Exact package, action,
and tool versions plus lockfiles are fixed and verified by later
repository-scoped implementation tasks. See the
[repository bootstrap guide](../development/repository-bootstrap.md).

## Workspace structure (Pre-alpha / Engineering Milestones M1-M8, 19 crates `bea338d`)

The workspace is spine-complete as of 2026-09-14 (`bea338d`). The accepted
topology is
[ADR 0003](../decisions/adrs/ADR-0003-core-workspace-topology.md); the
structure below is what `bitty/Cargo.toml` currently resolves to. Presence is
`Implemented` (compat-lab/perf hardening and UX wave) but only `Verified` after P0-AC
evidence; lifecycle is
`Specified -> Accepted -> Implemented -> Verified -> Compatible -> Release-ready`
per the
[risk evidence RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/risk-evidence-rfc.md). Presence does
not imply `Verified`: `bitty-package` lifecycle and integrity model is
`Accepted` (OQ-021, 2026-08-27) with signatures still draft, `bitty-lua`
accepted (OQ-009/030-032, 2026-08-29), and `bitty-rich`/`bitty-ipc`/`bitty-agent`
are `Implemented` (headless `Implemented`, not yet `Verified`):

```text
bitty/
├── Cargo.toml            # eighteen members, edition 2024, resolver 3, rust-version 1.85
├── Cargo.lock
├── rust-toolchain.toml   # channel 1.98.1, components rustfmt+clippy
├── justfile
├── crates/
│   ├── bitty-agent/       # Implemented: bounded Agent messages/side queue (std-only)
│   ├── bitty-app/         # binary artifact `bitty`: runtime+platform composition root
│   ├── bitty-compat-lab/  # forming: bounded harness re-exporting tests/compat/harness.rs
│   ├── bitty-config/      # typed ConfigPlan, validation, migration (std-only)
│   ├── bitty-core/        # seed to be retired
│   ├── bitty-ipc/         # Implemented: bounded framing/channels/stdio stub (std-only)
│   ├── bitty-lua/         # Implemented: piccolo 0.3.3 deterministic VM budgets RC-1/RC-2
│   ├── bitty-package/     # lifecycle/integrity accepted (OQ-021, 2026-08-27); signatures draft (std-only)
│   ├── bitty-perf/        # forming: bench harness owning benches/
│   ├── bitty-platform/    # winit 0.30, raw-window-handle =0.6.2
│   ├── bitty-plugin-host/ # registry/capability/lifecycle (+ bitty-package edge)
│   ├── bitty-pty/         # portable-pty 0.9 wrapper
│   ├── bitty-rich/        # Implemented: rich presentation helpers (vt+term-state)
│   ├── bitty-vt/          # vte 0.15 parser -> TerminalAction
│   ├── bitty-term-state/  # Terminal Truth + damage + image store
│   ├── bitty-render/      # wgpu 25.0, crossfont 0.9, snapshot-only
│   ├── bitty-runtime/     # orchestration (vt/term-state/pty/render/platform/ui/plugin-host)
│   └── bitty-ui/          # view/layout/focus/selection primitives
├── runtime/
│   ├── lua/
│   ├── terminfo/
│   └── assets/
├── tests/
├── benches/
├── fuzz/
└── tools/xtask/
```

The earlier candidate expansion list that included `bitty-terminal`,
`bitty-input`, `bitty-font`, `bitty-image`, `bitty-lua`,
`bitty-plugin-api`, `bitty-debug-protocol`, and `bitty-test-support` was the
discussion sketch before ADR 0003; those names are not crates today.
Crate boundaries still follow architecture boundaries, not source-file
boundaries. `Cell`, `Grid`, and `Cursor` remain internal modules of
`bitty-term-state` rather than many small crates.

## Plugin repository model

Every official and community plugin uses an independent Git repository as its
distribution unit. First-party plugins must also dogfood the public API.

Candidate plugin-repository structure:

```text
bitty-tabs/
├── bitty-plugin.toml
├── README.md
├── LICENSE
├── lua/
│   └── bitty-tabs/
│       └── init.lua
├── tests/
└── .github/workflows/ci.yml
```

TOML is the candidate plugin-manifest format because the host must complete
discovery, version, dependency, capability, and lazy-trigger checks before
executing Lua. The accepted use of Lua for primary configuration does not
conflict with the candidate use of TOML for plugin metadata.

## Documentation and website publishing relationship

```text
bitty-docs shared governance + submodule pointers (19 crates, 40 OQs Accepted)
      |-- bitty-terminal/ -> bitty-terminal-docs @ pinned main
      |-- bitty-ai/       -> bitty-ai-docs       @ pinned main
      `-- bitty-plugins/  -> bitty-plugins-docs  @ pinned main
                 |
                 | pinned consumption via Website Delivery RFC OQ-023
                 | (sync:docs --pin, src/content/docs-revision.json)
                 v
bitty-website presentation and publishing (loader accepted)
```

The accepted boundary makes `bitty-docs` the aggregator and shared-governance
owner, the three project documentation repositories the owners of project
content, and `bitty-website` its presentation consumer with an accepted loader
([Website Delivery RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/website-delivery-rfc.md), OQ-023,
2026-08-29, `Governance RFC` OQ-024 for branch protections and release train).
Consuming the split corpus requires the loader to resolve the aggregator's
recorded submodule pointers; that integration update is a follow-up, not yet
implemented. ADR 0001 accepts the Astro static shell, Bun, and Cloudflare
Workers Static Assets deployment. Public-route mapping and redirects are
accepted per OQ-023; theme, search, and whether to use Starlight remain open
website-repository decisions.

Cross-repository architecture changes cannot be committed atomically, so code
and documentation pull requests should link to each other. Before implementation
begins, the project should define shared fields such as `Docs-PR`, `Code-PR`,
and associated ADR or RFC numbers.

## CarryCtx routing

CarryCtx stores state per Git repository; no implicit umbrella-wide shared
database exists. Therefore:

- Before modifying `bitty-docs`, enter `bitty-docs/` and use that repository's
  `.carryctx`.
- Before modifying `bitty` or a plugin, enter the corresponding initialized
  Git repository.
- Project documentation changes run in the owning docs repository (its own
  `.carryctx` and CI); the aggregator task records only the submodule pointer
  bump and its review.
- Split cross-repository work into explicit tasks and record dependencies or
  external links between them.
- The non-Git `bitty-plugins/` grouping directory cannot be a CarryCtx project
  root; the `bitty-plugins` registry/store repository is a separate CarryCtx
  project.

## Pending decisions (engineering milestones)

- Creation order for later official plugin repositories; the public estate now
  spans twelve formal repositories and two distribution taps, and protection
  and required-check state varies by repository (the three project
  documentation repositories are not yet protected); licenses accepted as MIT
  per Governance RFC OQ-024 (2026-08-29).
- Verification of `bitty-package` (lifecycle accepted, signatures draft) and
  the implemented tail crates (`bitty-rich` OQ-008/015/016, `bitty-ipc`/
  `bitty-agent` OQ-018, `bitty-lua` OQ-009/030-032, compat-lab/perf hardening
  through `bea338d`) from `Implemented` to `Verified` per risk evidence RFC
  OQ-025 (evidence matrix pending), plus successor topology ADR when needed,
  release profiles, package publication, and release automation beyond ADR 0003.
- The concrete theme/search approach for the website (loader, sync pin,
  version selection, routes, redirects accepted per OQ-023).
- Whether `bitty-devtools` begins implementation before the Core milestone
  (debug protocol accepted per DevTools RFC OQ-019); `bitty-mcp` was archived
  on 2026-09-14 and its MCP tool-surface scope is covered by `bitty-ai`.
- The first set of official plugin repositories and their ownership.
- The cross-repository release train, compatibility matrix, and change
  announcement process (train accepted per Governance RFC OQ-024,
  `Docs-PR`/`Code-PR` ordering).
- When the `bitty-plugins` registry becomes the authoritative distribution
  path; the registry format and static store prototype exist, while Git
  repositories remain the distribution unit for the first phase.

See the [Reference Project Register](reference-projects.md) for reproducible
reference snapshots.
