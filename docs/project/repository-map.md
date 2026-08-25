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
Core Cargo workspace for initialization; the expanded crate graph remains a
candidate:

- The top-level `bitty-terminal/` directory is a local umbrella workspace, not
  a Git repository.
- Product repositories are independent. Run Git and CarryCtx commands inside
  the target child repository.
- The `bitty/` bootstrap uses a Cargo workspace with only `bitty-core` and
  `bitty-app`. The final crate graph and dependency edges remain undecided.
- `bitty-plugins/` is only a local grouping directory, not a Git repository.
  Each child directory will be an independent plugin repository.
- Documentation belongs to `bitty-docs`. A future website consumer must use
  validated canonical Markdown rather than maintain duplicate specifications;
  no consumer exists yet.

Directory existence, completed Git initialization, and completed remote creation
are three distinct states. This document defines target boundaries and does not
describe an empty directory as an initialized repository.

## Local workspace

```text
bitty-terminal/                     # local umbrella, not a Git repo
├── .agents/                        # workspace-level agent skills/instructions
├── .trash/                         # recoverable removal target
├── tmp/
│   └── references/                 # persistent local research clones
├── AGENTS.md                       # cross-repository operating contract
│
├── bitty/                          # independent repo: Rust core workspace
├── bitty-docs/                     # independent repo: canonical knowledge
├── bitty-website/                  # independent repo: Astro public website
├── bitty-devtools/                 # independent repo: debug UI/client
├── bitty-mcp/                      # independent repo: MCP adapter
│
└── bitty-plugins/                  # local grouping only, never parent Git repo
    ├── bitty-plugin-sdk/           # independent repo
    ├── bitty-plugin-template/      # independent repo
    └── <plugin-name>/              # one independent repo per plugin
```

`tmp/` is inside the workspace and holds temporary material that must survive
restarts. Do not place project research assets in the system `/tmp`. Prefer
moving deleted or retired files into `.trash/`, where a human can review them
before final cleanup.

## Current initialization state

As of 2026-08-26, all seven public remotes under `github.com/bitty-terminal`
have been pushed with an initial snapshot commit, and each repository's
`main` branch is protected on GitHub: squash-only merging with required status
checks matching that repository's CI job names.

| Local directory                        | Public remote                                             | Current state                                           | Required `main` status checks |
| -------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------- | ----------------------------- |
| `bitty/`                               | `https://github.com/bitty-terminal/bitty`                 | Initial snapshot pushed; `main` protected (squash-only) | `quality`                     |
| `bitty-docs/`                          | `https://github.com/bitty-terminal/bitty-docs`            | Initial snapshot pushed; `main` protected (squash-only) | `docs-quality`                |
| `bitty-website/`                       | `https://github.com/bitty-terminal/bitty-website`         | Initial snapshot pushed; `main` protected (squash-only) | `quality`                     |
| `bitty-devtools/`                      | `https://github.com/bitty-terminal/bitty-devtools`        | Initial snapshot pushed; `main` protected (squash-only) | `check`, `actionlint`         |
| `bitty-mcp/`                           | `https://github.com/bitty-terminal/bitty-mcp`             | Initial snapshot pushed; `main` protected (squash-only) | `gates`, `actionlint`         |
| `bitty-plugins/bitty-plugin-sdk/`      | `https://github.com/bitty-terminal/bitty-plugin-sdk`      | Initial snapshot pushed; `main` protected (squash-only) | `check`, `actionlint`         |
| `bitty-plugins/bitty-plugin-template/` | `https://github.com/bitty-terminal/bitty-plugin-template` | Initial snapshot pushed; `main` protected (squash-only) | `check`, `actionlint`         |

Neither the umbrella root nor `bitty-plugins/` is initialized as a Git
repository. This is an intentional routing and grouping boundary, not an
omission.

## Repository responsibilities

| Repository or directory | Planned responsibility                                                                 | Status                                                                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `bitty`                 | Rust runtime and application                                                           | Minimal two-package Rust 2024 bootstrap accepted; final crate graph, dependencies, Plugin API, and debug protocol remain undecided                           |
| `bitty-docs`            | Vision, requirements, architecture, ADRs, RFCs, roadmap, and research                  | Accepted authoritative documentation repository                                                                                                              |
| `bitty-website`         | Astro static shell and future presentation consumer of canonical `bitty-docs` Markdown | Astro, Bun, and Workers Static Assets bootstrap accepted; no docs consumer exists; loader, synchronization, version selection, routes, and theme remain open |
| `bitty-devtools`        | Human debugging client                                                                 | Repository created; debug-protocol model is a candidate                                                                                                      |
| `bitty-mcp`             | Agent and MCP adapter                                                                  | Repository created; internal-protocol boundary is a candidate                                                                                                |
| `bitty-plugin-sdk`      | Lua helpers, LuaLS types, mock host, and test tools                                    | Independent repository accepted; exact responsibilities are candidates                                                                                       |
| `bitty-plugin-template` | Plugin scaffold, CI, and manifest examples                                             | Independent repository accepted; format is a candidate                                                                                                       |
| Each plugin repository  | One optional user experience or integration                                            | Independent-repository model accepted; public API constraints are candidates                                                                                 |

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

## Candidate expanded core-repository structure

The following structure came from the discussion. It is not a list of existing
files and is not accepted by the minimal bootstrap ADR:

```text
bitty/
├── Cargo.toml
├── Cargo.lock
├── rust-toolchain.toml
├── justfile
├── crates/
│   ├── bitty-app/
│   ├── bitty-core/
│   ├── bitty-vt/
│   ├── bitty-terminal/
│   ├── bitty-pty/
│   ├── bitty-platform/
│   ├── bitty-input/
│   ├── bitty-font/
│   ├── bitty-image/
│   ├── bitty-render/
│   ├── bitty-ui/
│   ├── bitty-config/
│   ├── bitty-lua/
│   ├── bitty-plugin-api/
│   ├── bitty-plugin-host/
│   ├── bitty-debug-protocol/
│   └── bitty-test-support/
├── runtime/
│   ├── lua/
│   ├── terminfo/
│   └── assets/
├── tests/
├── benches/
├── fuzz/
└── tools/xtask/
```

Crate boundaries should correspond to architecture boundaries, not source-file
boundaries. `Cell`, `Grid`, and `Cursor`, for example, should initially be
internal modules of `bitty-terminal` rather than many small crates at project
start.

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
bitty-docs validated canonical Markdown
                 |
                 | future pinned consumption
                 | mechanism remains open
                 v
bitty-website presentation and publishing
```

The accepted boundary makes `bitty-docs` the canonical content owner and
`bitty-website` its future presentation consumer. No website content consumer
exists yet. ADR 0001 accepts only an Astro static shell, Bun, and Cloudflare
Workers Static Assets deployment. The loader, synchronization, version
selection, public-route mapping, redirects, theme, search, and whether to use
Starlight remain open website-repository decisions.

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
- Split cross-repository work into explicit tasks and record dependencies or
  external links between them.
- The non-Git `bitty-plugins/` grouping directory cannot be a CarryCtx project
  root.

## Pending decisions

- Creation order for later official plugin repositories; seven repositories are
  already public with protected `main` branches, while licenses remain
  undecided.
- The final Core crate graph, dependency edges, MSRV, release profiles, license,
  package publication, and release automation beyond the minimal bootstrap.
- The concrete synchronization and versioning approach from docs to the website.
- Whether `bitty-devtools` and `bitty-mcp` begin implementation before the
  Core milestone.
- The first set of official plugin repositories and their ownership.
- The cross-repository release train, compatibility matrix, and change
  announcement process.
- When a plugin registry becomes necessary; Git repositories are sufficient by
  default for the first phase.

See the [Reference Project Register](reference-projects.md) for reproducible
reference snapshots.
