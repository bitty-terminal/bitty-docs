---
title: Repository and Local Workspace Map
description: Local/remote topology, repository ownership, and current initialization state
category: project
audience: contributor
document_type: reference
status: accepted
website_publish: true
sidebar_order: 10
---

# Repository and Local Workspace Map

## Topology principles

Bitty has accepted an organization-level polyrepo. ADR 0001 accepts a minimal
Core Cargo workspace for initialization; the expanded crate graph is now
**Pre-alpha / Engineering Milestones M1-M8** at 18 crates (`799f7433`) with
lifecycle `Specified -> Accepted -> Implemented -> Verified -> Compatible ->
Release-ready` (see Status below):

- The top-level `bitty-terminal/` directory is a local umbrella workspace, not
  a Git repository.
- Product repositories are independent. Run Git and CarryCtx commands inside
  the target child repository.
- The `bitty/` workspace is the minimal Core terminal platform following the
  Unix philosophy (eighteen members in `bitty/Cargo.toml`): `bitty-vt`,
  `bitty-term-state`, `bitty-pty`, `bitty-platform`, `bitty-config`,
  `bitty-render`, `bitty-ui`, `bitty-plugin-host`, `bitty-runtime`,
  `bitty-package`, `bitty-lua`, `bitty-rich`, `bitty-winjob`, plus binary
  artifact `bitty-terminal`, and verification/harness crates
  `bitty-compat-lab`, `bitty-perf` (linked only via the non-default
  `dev-perf` feature of `bitty-terminal`), `bitty-test-support`, and
  `bitty-test-vm`. `bitty-core` and `bitty-panels` were retired from the
  workspace (`bitty#1603`, `bitty#1604`); the ten-crate topology recorded in
  [ADR 0003](../decisions/adrs/ADR-0003-core-workspace-topology.md) predates
  this retirement (see the status note there). `bitty-package` lifecycle
  and integrity model is accepted
  ([Package Lifecycle RFC](https://github.com/bitty-terminal/bitty-plugins-docs/blob/main/packaging/package-lifecycle-rfc.md), OQ-021,
  2026-08-27) with real signature verification remaining draft per crate docs.
- To preserve Bitty's core focus, low footprint, and robust extensibility,
  out-of-process IPC and native sidecar components are externalized into
  dedicated L1 Rust Core Extension repositories rather than embedded into the
  terminal core:
  - `bitty-ipc`: Out-of-process IPC bridge layer (`bitty-ipc-api`, `ipc-auth`,
    `ipc-core`, `ipc-devtools`, `ipc-mcp`, umbrella `bitty-ipc`), default-off,
    pinned by `bitty` at `e9714e7` as the inbound socket for external
    clients.
  - `bitty-network`: Network runtime shipped as the independently installed
    native component `net` (DIR-030); `bitty` links only the dependency-free
    `bitty-network-wire` codec crate, never a network implementation. The
    embedded `network` Cargo feature and the `bitty.network` Lua module were
    removed from Core (`bitty#1604`).
  - `bitty-observability`: Observability and tracing infrastructure
    (`bitty-observability-api`).

  `bitty-agent` is no longer linked by Core; see Status below.

- `bitty-plugins` is the plugin-ecosystem entry repository (registry, store
  frontend, and official plugin submodules). In accordance with
  [ADR 0014](../decisions/adrs/ADR-0014-workspace-core-presentation-plugins.md),
  visual chrome (workspace bars, tab strips, statuslines) is not hardcoded in
  Core; presentation is entirely driven by Lua plugins over generic Core
  mechanisms.
- `bitty-ai` is an independent repository (AI-core runtime, providers, and
  context), checked out at the umbrella root `bitty-ai/`. The `bitty-ai/` path
  inside `bitty-docs` is the project-documentation submodule described below,
  not the code repository.
- `bitty-mcp` was archived on 2026-09-14 because its MCP tool-surface
  functionality is covered by `bitty-ai`; the remote is read-only for history
  and the local checkout moved to `.trash/bitty-mcp-archived-20260914`.
  `bitty-devtools` was archived on 2026-09-30 (superseded by the `devtools`
  Lua plugin under `bitty-plugins/plugins/devtools` and `bitty-ipc-devtools`).
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
bitty-terminal/                     # local umbrella workspace, not a Git repo
├── AGENTS.md                       # cross-repository operating contract
├── workspace.toml                  # machine-readable directory tags (kind/lang/role)
├── recording/                      # durable local scratch, not a Bitty repository
├── script/                         # workspace-wide helper scripts
├── .agents/                        # agent session state
├── .targets/                       # shared build-cache targets
├── .trash/                         # recoverable removal target
│
│   # every repository is a direct child (org-flat mirror); no grouping directories
├── activity/                       # independent repo: first official plugin
├── bitty/                          # independent repo: Rust core workspace (18 crates)
├── bitty-ai/                       # independent repo: AI core (runtime, providers, context)
├── bitty-ai-docs/                  # independent repo: AI-core documentation
├── bitty-devtools/                 # independent repo: debug UI/client
├── bitty-docs/                     # independent repo: shared governance + docs aggregator
│   ├── bitty-terminal/             # submodule: bitty-terminal-docs project content
│   ├── bitty-ai/                   # submodule: bitty-ai-docs project content
│   └── bitty-plugins/              # submodule: bitty-plugins-docs project content
├── bitty-plugin-sdk/               # independent repo: plugin SDK
├── bitty-plugin-template/          # independent repo: plugin scaffold
├── bitty-plugins/                  # independent repo: plugin registry, store, official plugins
├── bitty-plugins-docs/             # independent repo: plugin-ecosystem documentation
├── bitty-terminal-docs/            # independent repo: terminal-platform documentation
├── bitty-website/                  # independent repo: Astro public website
├── file-manager/                   # independent repo: file-manager plugin
├── git-panel/                      # independent repo: git-panel plugin
├── palette/                        # independent repo: command-palette plugin
└── statusline/                     # independent repo: statusline plugin
```

Every repository is a direct child of the workspace root. The only nesting in
this map is documentation mounted as Git submodules inside `bitty-docs/` and
inside the code repositories at `<code-repo>/docs`.

`recording/` is inside the workspace and holds temporary material that must survive
restarts. Do not place project material in the system `/tmp`. Prefer moving
deleted or retired files into `.trash/`, where a human can review them before
final cleanup.

## Current initialization state

As of 2026-09-14, the public remotes under `github.com/bitty-terminal` are
initialized and pushed. Branch protection with the required status checks
recorded below is enabled on the code and shared-governance repositories; the
three project documentation repositories are not yet protected, and the
distribution taps are recorded in the
[repository metadata baseline](../development/repository-metadata-baseline.md).
The `bitty-mcp` remote is archived and read-only.

| Local directory                  | Public remote                                             | Current state                                                                 | Required `main` status checks                                                                                                                                                                                 |
| -------------------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bitty/`                         | `https://github.com/bitty-terminal/bitty`                 | Initial snapshot pushed; `main` protected (squash-only)                       | `Quality gates`, `MSRV 1.85 check`, `Windows check and test`, `macOS ARM64 check and test`, `Linux Wayland`, `Linux X11 (xvfb)`, `Analyze (rust)`, `Supply chain (deny/audit)`, `Analyze (actions)`, `CodeQL` |
| `bitty-ai/`                      | `https://github.com/bitty-terminal/bitty-ai`              | Initial snapshot pushed; `main` protected (merge, squash, and rebase enabled) | `Quality gates`, `MSRV 1.85 check`, `Linux`, `Windows`, `macOS`, `Supply chain`                                                                                                                               |
| `bitty-docs/`                    | `https://github.com/bitty-terminal/bitty-docs`            | Initial snapshot pushed; `main` protected (squash-only)                       | `Docs quality`                                                                                                                                                                                                |
| `bitty-docs/bitty-terminal/`     | `https://github.com/bitty-terminal/bitty-terminal-docs`   | Content split merged; submodule mount; not yet protected                      | (none yet)                                                                                                                                                                                                    |
| `bitty-docs/bitty-ai/`           | `https://github.com/bitty-terminal/bitty-ai-docs`         | Content split merged; submodule mount; not yet protected                      | (none yet)                                                                                                                                                                                                    |
| `bitty-docs/bitty-plugins/`      | `https://github.com/bitty-terminal/bitty-plugins-docs`    | Content split merged; submodule mount; not yet protected                      | (none yet)                                                                                                                                                                                                    |
| `bitty-website/`                 | `https://github.com/bitty-terminal/bitty-website`         | Initial snapshot pushed; `main` protected (squash-only)                       | `Website quality`, `Analyze (actions)`, `Analyze (javascript-typescript)`, `CodeQL`                                                                                                                           |
| `bitty-devtools/`                | `https://github.com/bitty-terminal/bitty-devtools`        | Initial snapshot pushed; `main` protected (squash-only)                       | `Lint GitHub Actions workflows`, `Quality gates`, `Analyze (javascript-typescript, actions)`, `CodeQL`                                                                                                        |
| `bitty-plugins` (registry/store) | `https://github.com/bitty-terminal/bitty-plugins`         | Initial snapshot pushed; `main` protected; no umbrella checkout               | `Plugin integration`, `Lint GitHub Actions workflows`, `Analyze (javascript-typescript, actions)`                                                                                                             |
| `activity/`                      | `https://github.com/bitty-terminal/activity`              | Initial snapshot pushed; `main` protected (merge, squash, and rebase enabled) | `Quality gates`, `Lint GitHub Actions workflows`, `Analyze (actions)`, `Analyze (javascript-typescript)`, `CodeQL`                                                                                            |
| `bitty-plugin-sdk/`              | `https://github.com/bitty-terminal/bitty-plugin-sdk`      | Initial snapshot pushed; `main` protected (squash-only)                       | `Actionlint`, `Quality gates`, `Analyze (actions)`, `Analyze (javascript-typescript)`, `CodeQL`                                                                                                               |
| `bitty-plugin-template/`         | `https://github.com/bitty-terminal/bitty-plugin-template` | Initial snapshot pushed; `main` protected (squash-only)                       | `Lint GitHub Actions workflows`, `Quality gates`, `Analyze (actions)`, `Analyze (javascript-typescript)`, `CodeQL`                                                                                            |

The umbrella root is not a Git repository;
`bitty-plugins` (registry/store), `bitty-ai`, `bitty-docs`, and every
code or plugin repository are independent repositories and separate CarryCtx
projects. This is an intentional routing boundary, not an omission.

## Submodule pin semantics

Three different revisions can each be the newest documentation for their own
purpose. Pins are reproducibility anchors, not required-equal values: they are
expected to differ, and no gate forces them to match.

| Position                | Meaning                                                                                            |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| Docs-repo `main`        | Latest canonical docs: the owning documentation repository's merged `main` HEAD.                   |
| Code-repo `docs/` mount | Docs matching that implementation: the code repository's `docs` submodule pin at its own HEAD.     |
| Aggregator mount        | Governance-reviewed snapshot: the `bitty-docs` root submodule pin, bumped only in a scoped review. |

Verified example for `bitty-terminal-docs` (2026-09-14):

| Position                | Pin       | Full revision                              | Subject                                                    |
| ----------------------- | --------- | ------------------------------------------ | ---------------------------------------------------------- |
| Docs-repo `main`        | `77b538d` | `77b538d23aa9f5b3a84975e11671cec5e95da8b5` | [CTX-0006] XDG/Windows mapping plus credential tiers (#22) |
| Code-repo `docs/` mount | `56f70bc` | `56f70bc9b98bf7585d97ccafde33c81c5d69ac9d` | [CTX-0189] `bitty-mcp` archival note (#4)                  |
| Aggregator mount        | `bcb65a4` | `bcb65a4b1e5279e37b0aad0452582bde555a4052` | [CTX-0181] Panel Runtime pre-study promotion (#15)         |

Both mounts are ancestors of docs-repo `main` here (`bcb65a4` is 4 commits
behind, `56f70bc` is 11 commits behind), and that lag is normal. A pin moves
only when its owner acts: the docs repository lands new content, the code
repository cuts a matching implementation, or a scoped `bitty-docs` review
accepts a new snapshot. The bump procedure lives in the
[documentation workflow](../development/documentation-workflow.md#submodule-pointer-updates);
`just docs-status` prints the live positions and behind-counts, and
`just docs-check-cross-repo` validates absolute cross-repository links against
the same upstream revisions.

## Repository responsibilities

| Repository or directory | Planned responsibility                                                                                           | Status                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bitty`                 | Minimal Rust terminal platform core: PTY, VT, render, runtime, configuration, and workspace mechanism            | Minimal Core terminal platform (eighteen members in `bitty/Cargo.toml`, `bitty-core`/`bitty-panels` retired per `bitty#1603`/`bitty#1604`); `bitty-package` lifecycle/integrity model accepted (OQ-021, 2026-08-27) plus `bitty-lua` (OQ-009/030-032); the ADR 0003 ten-crate topology predates this retirement (see its status note); visual chrome presentation is plugin-only (ADR 0014) |
| `bitty-ipc`             | L1 Rust Core Extension: out-of-process IPC bridge (6 crates), DevTools/MCP protocols                             | Independent extension repository initialized (`crates/bitty-ipc-api`, `ipc-auth`, `ipc-core`, `ipc-devtools`, `ipc-mcp`, umbrella `bitty-ipc`); bounded framing, peer-credential auth, default-off; pinned by `bitty` at `e9714e7` as Core's inbound socket                                                                                                                                 |
| `bitty-network`         | L1 Rust Core Extension: network runtime shipped as the independently installed native component `net` (DIR-030)  | Independent extension repository initialized (`crates/bitty-network-api`, `bitty-network`, `bitty-network-wire`); crates reset to version `0.0.1`; `bitty` links only the dependency-free `bitty-network-wire` codec, never a network implementation; the embedded `network` feature and `bitty.network` Lua module were removed from Core (`bitty#1604`)                                   |
| `bitty-observability`   | L1 Rust Core Extension: observability and tracing infrastructure (API + Core + integration)                      | Independent extension repository initialized (`crates/bitty-observability-api`); zero-dependency tracing and metrics definitions                                                                                                                                                                                                                                                            |
| `phodopus`              | Pure-Rust stackless Lua runtime: sandbox, fuel, and modular stdlib (Piccolo successor)                           | Independent core runtime repository under `bitty-plugins` ownership; provides stackless coroutines, deterministic fuel quotas, and pure-Rust Lua 5.4 subset per ADR 0012                                                                                                                                                                                                                    |
| `bitty-docs`            | Shared governance plus aggregator: ADRs, RFCs, security, project state, roadmap, and the project docs submodules | Accepted authoritative governance repository; owns the root submodule pointers and the shared registers                                                                                                                                                                                                                                                                                     |
| `bitty-terminal-docs`   | Terminal-platform documentation (submodule `bitty-terminal`)                                                     | Split content merged; canonical project documentation for the terminal platform                                                                                                                                                                                                                                                                                                             |
| `bitty-ai-docs`         | AI-core documentation (submodule `bitty-ai`)                                                                     | Split content merged; canonical project documentation for the independent AI core                                                                                                                                                                                                                                                                                                           |
| `bitty-plugins-docs`    | Plugin documentation (submodule `bitty-plugins`)                                                                 | Split content merged; canonical plugin platform, SDK, lifecycle, and per-plugin documentation                                                                                                                                                                                                                                                                                               |
| `bitty-ai`              | AI-core runtime, providers, context, and Tool Bus                                                                | Independent repository initialized; experimental deterministic runtime skeleton and vertical slice exist (`bitty-ai-runtime`, `bitty-ai-slice`); no production runtime, ModelProvider/ContextProvider/Tool Bus implementation and design recorded in `bitty-ai-docs`                                                                                                                        |
| `bitty-plugins`         | Plugin-ecosystem entry: registry, static store frontend, and official plugin submodules                          | Independent repository initialized; registry format, validation, generation, and static store frontend exist; pre-alpha, no shipped plugin install flow (the `bitty plugin add` flow is a design proposal)                                                                                                                                                                                  |
| `bitty-website`         | Astro static shell and future presentation consumer of canonical `bitty-docs` Markdown                           | Astro, Bun, and Workers Static Assets bootstrap accepted; loader, synchronization, version selection, routes, and redirect manifest `Accepted` via Website Delivery RFC (OQ-023, 2026-08-29); theme/search remain open; consuming submodule-mounted project content is a follow-up                                                                                                          |
| `bitty-devtools`        | Standalone human debugging client (archived)                                                                     | Archived on 2026-09-30 (superseded by the `devtools` Lua plugin checked out at `bitty-plugins/plugins/devtools` and `bitty-ipc-devtools`)                                                                                                                                                                                                                                                   |
| `activity`              | First official independent plugin (privacy-first local activity timeline)                                        | Independent repository initialized; per-plugin documentation pending in `bitty-plugins-docs`                                                                                                                                                                                                                                                                                                |
| `bitty-plugin-sdk`      | Lua helpers, LuaLS types, mock host, and test tools                                                              | Independent repository accepted; exact responsibilities are candidates                                                                                                                                                                                                                                                                                                                      |
| `bitty-plugin-template` | Plugin scaffold, CI, and manifest examples                                                                       | Independent repository accepted; minimal runnable template implemented ([bitty-plugin-template](https://github.com/bitty-terminal/bitty-plugin-template), R-TPL-1 [PR #28](https://github.com/bitty-terminal/bitty-plugin-template/pull/28))                                                                                                                                                |
| Each plugin repository  | One optional user experience or integration                                                                      | Independent-repository model accepted; public API constraints are candidates                                                                                                                                                                                                                                                                                                                |

`bitty-mcp` is not a live repository: it was archived on 2026-09-14 (read-only
for history) and its MCP tool-surface scope is covered by `bitty-ai`.
`bitty-devtools` was archived on 2026-09-30 (superseded by the `devtools`
Lua plugin and `bitty-ipc-devtools`).

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

## Workspace structure (Small Core and L1 Rust Core Extensions)

The Core terminal platform workspace has eighteen members in `bitty/Cargo.toml`
following the extraction of out-of-process IPC and the native network
component into dedicated L1 Rust Core Extension repositories; `bitty-core` and
`bitty-panels` were retired from the workspace (`bitty#1603`, `bitty#1604`):

```text
bitty/
├── Cargo.toml            # eighteen members, edition 2024, resolver 3, rust-version 1.85
├── Cargo.lock
├── rust-toolchain.toml   # channel 1.98.1, components rustfmt+clippy
├── justfile
├── crates/
│   ├── bitty-compat-lab/   # forming: bounded harness re-exporting tests/compat/harness.rs
│   ├── bitty-config/       # typed ConfigPlan, validation, migration (std-only)
│   ├── bitty-lua/          # Implemented: piccolo 0.3.3 deterministic VM budgets RC-1/RC-2
│   ├── bitty-package/      # lifecycle/integrity accepted (OQ-021, 2026-08-27); signatures draft (std-only)
│   ├── bitty-perf/         # forming: bench harness owning benches/; linked only via the
│   │                       # non-default `dev-perf` feature of `bitty-terminal`
│   ├── bitty-platform/     # winit 0.30, raw-window-handle =0.6.2
│   ├── bitty-plugin-host/  # registry/capability/lifecycle (+ bitty-package edge)
│   ├── bitty-pty/          # portable-pty 0.9 wrapper
│   ├── bitty-render/       # wgpu 25.0, crossfont 0.9, snapshot-only
│   ├── bitty-rich/         # Implemented: rich presentation helpers (vt+term-state)
│   ├── bitty-runtime/      # orchestration (vt/term-state/pty/render/platform/ui/plugin-host);
│   │                       # owns the `component` broker (DIR-030, bitty#1604)
│   ├── bitty-terminal/     # binary artifact `bitty`: runtime+platform composition root
│   ├── bitty-term-state/   # Terminal Truth + damage + image store
│   ├── bitty-test-support/ # shared test-harness helpers (live-PTY gating)
│   ├── bitty-test-vm/      # VM test tier first slice (CTX-0507)
│   ├── bitty-ui/           # view/layout/focus/selection primitives
│   ├── bitty-vt/           # vte 0.15 parser -> TerminalAction
│   └── bitty-winjob/       # Win32 Job Object adapter
├── runtime/
│   ├── lua/
│   ├── terminfo/
│   └── assets/
├── tests/
├── benches/
├── fuzz/
└── tools/xtask/
```

### L1 Rust Core Extensions (Modular Repositories)

To maintain a minimal, resilient terminal core and maximize scriptability,
host-side out-of-process IPC and the network stack are partitioned into
independent L1 repositories. The network stack ships to users as the
independently installed native component `net` (DIR-030); `bitty-agent` is an
independent repository that is not currently linked by Core (see Status
above):

```text
bitty-ipc/                 # Out-of-process IPC bridge layer
├── crates/
│   ├── bitty-ipc-api/     # Contract definitions (zero impl dependencies)
│   ├── bitty-ipc-auth/    # Authentication and scope authorization
│   ├── bitty-ipc-core/    # Message framing and channel routing
│   ├── bitty-ipc-devtools/# DevTools JSON-RPC bridge
│   ├── bitty-ipc-mcp/     # MCP protocol bridge
│   └── bitty-ipc/         # Umbrella re-export crate

bitty-network/              # Network stack (crates reset to version 0.0.1)
├── crates/
│   ├── bitty-network-api/  # Contract definitions and traits
│   ├── bitty-network-wire/ # Dependency-free wire codec; the only crate `bitty` links
│   └── bitty-network/      # Runtime, connection pool, DNS, TLS policy; built as `bitty-net`

bitty-observability/       # Metrics and tracing definitions
└── crates/
    └── bitty-observability-api/
```

`bitty-terminal` is the binary composition root (`crates/bitty-terminal`),
replacing the early `bitty-app` working name. Crate boundaries follow
architectural domains rather than source modules; `Cell`, `Grid`, and `Cursor`
remain internal modules of `bitty-term-state` rather than granular micro-crates.

### Candidate extraction repositories (metadata-only scaffolds)

Twelve repositories were initialized on 2026-10-02 as metadata-only scaffolds
for the small-core extraction work. They hold governance, toolchain, and CI
metadata but no product code: repository creation does not accept a contract,
enable a runtime path, or satisfy security review. Each carries a four-phase
CarryCtx graph (bootstrap -> contract readiness -> implementation -> independent
verification) with a matching `v0.1.0` Issue set; `main` is protected and a
redacted CarryCtx snapshot is published. The extraction boundaries, public
contracts, and layout ownership remain owner-pending.

- L1 Rust extension candidates: `bitty-execution`, `bitty-graphics`,
  `bitty-a11y`, `bitty-storage`.
- Peripheral tooling: `bitty-plugin-manager`, `bitty-compat-lab`, `bitty-perf`.
- Official non-AI plugin candidates, nested under the plugins registry owner at
  `bitty-plugins/plugins/`: `beacon`, `composer`, `history`, `search`,
  `copy-mode`.

`workspace.toml` remains the machine-readable roster; the seven top-level
candidates are tagged there and the nested plugin checkouts are not umbrella
entries.

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
bitty-docs shared governance + submodule pointers (18 crates; OQ counts live in the open-question register)
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
- The non-Git umbrella root cannot be a CarryCtx project root; every
  repository, including the `bitty-plugins` registry/store, is a separate
  CarryCtx project.

## Pending decisions (engineering milestones)

- Creation order for later official plugin repositories; the public estate
  spans the flat repository set recorded in `workspace.toml` plus two
  distribution taps, and protection
  and required-check state varies by repository (the three project
  documentation repositories are not yet protected); licenses accepted as MIT
  per Governance RFC OQ-024 (2026-08-29).
- Verification of `bitty-package` (lifecycle accepted, signatures draft) and
  the implemented tail crates (`bitty-rich` OQ-008/015/016, `bitty-lua`
  OQ-009/030-032, compat-lab/perf hardening through `799f7433`) alongside the
  independent L1 extensions (`bitty-ipc`, `bitty-network`) from
  `Implemented` to `Verified` per risk evidence RFC OQ-025 (evidence matrix
  pending), plus successor topology ADR when needed, release profiles, package
  publication, and release automation beyond ADR 0003.
- The concrete theme/search approach for the website (loader, sync pin,
  version selection, routes, redirects accepted per OQ-023).
- Evolution of the DevTools protocol bridge in `bitty-ipc-devtools` and the
  `devtools` Lua plugin (the early standalone `bitty-devtools` CLI repository
  was archived on 2026-09-30; `bitty-mcp` was archived on 2026-09-14 and its
  tool-surface scope is covered by `bitty-ai`).
- The first set of official plugin repositories and their ownership.
- The cross-repository release train, compatibility matrix, and change
  announcement process (train accepted per Governance RFC OQ-024,
  `Docs-PR`/`Code-PR` ordering).
- When the `bitty-plugins` registry becomes the authoritative distribution
  path; the registry format and static store prototype exist, while Git
  repositories remain the distribution unit for the first phase.

See the [Reference Project Register](reference-projects.md) for self-contained,
non-normative upstream reference revisions and study questions.
