---
title: Toolchain and Tooling Policy
description: Pins the canonical local toolchain, package manager, and quality-gate commands for every Bitty repository so that all agents use identical tools.
category: development
audience: contributor
document_type: specification
status: draft
website_publish: true
sidebar_order: 15
---

# Toolchain and Tooling Policy

## Document status

- Status: **proposed** (frontmatter uses `draft`; not yet accepted).
- Purpose: agents and human contributors must run the same tools at the same
  pinned versions. Free-version drift between agents is a defect, not a
  convenience. Every command below is the single canonical way to perform its
  task in this workspace.

## Normative rules

1. **Never use `npm`, `npx`, or `yarn` in any Bitty repository.** JavaScript
   execution and package management use `bun` / `bunx --bun` exclusively, at
   the version pinned per repository.
2. **Never invoke formatters or linters directly by name** (no bare
   `prettier`, `markdownlint`, `cargo fmt`, …). Always go through the
   repository `justfile`: `just check` (or the specific recipe). The justfile
   owns the pinned versions.
3. **Version pinning lives in exactly one place per repository**: the
   `justfile` for docs/tool versions, `rust-toolchain.toml` for the Rust
   channel, lockfiles for dependencies (`bun.lock`, `Cargo.lock`). Agents must
   not upgrade pins as a side effect of an unrelated task.
4. If a required tool is missing locally, install it at the pinned version;
   do not substitute a different version or a different tool.
5. Any tool addition follows the candidate-adoption process in
   [Technology strategy](../project/technology-strategy.md) and lands in this
   document plus the owning justfiles in the same change.

## Pinned toolchain matrix

| Repository                                  | Language runtime                                             | Package manager | Entry point  | Notes                                                                |
| ------------------------------------------- | ------------------------------------------------------------ | --------------- | ------------ | -------------------------------------------------------------------- |
| `bitty-docs`                                | Bun 1.4.0                                                    | bun             | `just check` | prettier 3.9.6, markdownlint-cli2 0.23.1, actionlint 1.7.12 via bunx |
| `bitty-website`                             | Bun 1.4.0                                                    | bun             | `just check` | frozen lockfile install; Astro static build                          |
| `bitty`                                     | Rust stable (rust-toolchain.toml) + Bun 1.4.0 (tooling only) | cargo / bun     | `just check` | rustfmt, Clippy, tests, actionlint                                   |
| `bitty-devtools`, `bitty-mcp`, plugin repos | follow their bootstrap tasks when created                    | —               | —            | adopt this policy at first commit                                    |

## Canonical commands

| Task                        | Command (from repo root) |
| --------------------------- | ------------------------ |
| Full read-only quality gate | `just check`             |
| Format files                | `just fmt`               |
| Markdown lint               | `just markdownlint`      |
| Docs link check (offline)   | `just links`             |
| Frontmatter metadata check  | `just metadata`          |
| English-only check          | `just language`          |

Rust-side gates (in `bitty/`) remain: `cargo check`,
`cargo fmt --check`, `RUSTFLAGS="-D warnings" cargo clippy --workspace`,
`cargo test`, always invoked through the justfile.

## Agent requirements

Every agent working in a Bitty repository must:

1. Read the repository `AGENTS.md` and this document before running any tool.
2. Run gates from the repository root, never from the umbrella workspace.
3. Record gate output as verification evidence in its CarryCtx task; a task is
   not reviewable without reproducible evidence from these exact commands.
4. Report — not silently fix — any pin drift it discovers (a pinned version
   missing, a lockfile out of date relative to a manifest).

## Open items

- Confirm exact action/tool versions recorded in each repository's CI on its
  first implementation pull request, per the
  [repository bootstrap guide](repository-bootstrap.md).
- Candidate additional tools (`typos`, `taplo`, `cargo-deny`, `cargo-nextest`,
  `cargo-fuzz`, …) stay candidates until validated by an owning task.
