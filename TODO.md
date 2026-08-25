# Documentation-first TODO

This list sequences project-definition work before product implementation. It
does not authorize product code. Canonical unresolved choices live in the
[open-question register](docs/decisions/open-questions.md); this file groups the
work into delivery stages.

## Documentation foundation

- [x] Establish product, architecture, repository, and technology overviews.
- [x] Establish configuration, plugin, package, CLI, and rich-content design
      documents with explicit candidate status.
- [x] Establish normative security overview and threat model plus an
      evidence-based risk register.
- [x] Map all 20 turns of the historical shared conversation to maintained
      documents without copying the raw transcript.
- [x] Add corpus navigation, decision status, and open-question registers.
- [x] Define user, contributor, reference, and website-consumption entry points
      without inventing pre-release product behavior.
- [x] Define English-only language, flat frontmatter metadata, publication, and
      documentation synchronization policies.
- [x] Add repository and CI gates for metadata and canonical-language checks.
- [x] Add empty-state-aware indexes for requirements, specifications, ADRs,
      RFCs, findings, roadmap, releases, migrations, troubleshooting, tutorials,
      how-to guides, and examples.
- [x] Require portable root README/AGENTS links and cap `TODO.md` at 300 lines.
- [x] Accept and document the zero-functionality Core and website repository
      bootstrap baseline in ADR 0001.
- [ ] Perform a final cross-repository documentation review after all initial
      repositories have their first commits and stable links.

## Required before product implementation

- [ ] Review and accept measurable product/performance budgets (OQ-001;
      draft: specifications/performance-budget-rfc.md).
- [ ] Review and accept platform support tiers and first compatibility
      milestone (OQ-003/OQ-004; drafts: ADR-0002,
      specifications/compatibility-milestone-rfc.md).
- [ ] Review and accept core topology and dependency ADRs (OQ-005/OQ-006;
      drafts: ADR-0003, ADR-0004).
- [ ] Review and accept the terminal state/action invariant RFC (OQ-007;
      draft: specifications/terminal-state-rfc.md).
- [ ] Security-auditor review of the P0 acceptance criteria conversion
      (draft: security/p0-acceptance-criteria.md, 34 criteria).
- [ ] Decide the first compatibility milestone and platform support/CI policy
      (OQ-003, OQ-004).
- [ ] Record ADRs for the core topology, Rust toolchain/MSRV, and adopted
      dependencies (OQ-005, OQ-006).
- [ ] Specify terminal state/action invariants and the Plugin API v1 boundary
      (OQ-007, OQ-011, OQ-013).
- [ ] Specify the Lua runtime, capability/manifest model, configuration model,
      and isolation/resource mechanisms (OQ-009 through OQ-014).
- [ ] Convert every normative P0 security control into testable acceptance
      criteria; retain all risks as open until cited evidence satisfies them.
- [ ] Specify package integrity, validation, transactional activation, rollback,
      and recovery before enabling third-party installation (OQ-021, OQ-022).
- [ ] Obtain security review for any IPC, MCP, DevTools, rich transport, image,
      or headless interface before implementation begins.

## Initialization allowed in the current phase

- [x] Implement the ADR 0001 Core bootstrap with Rust 2024, resolver 3, the two
      non-publishable dependency-free packages, pinned stable tooling, `just`,
      and read-only format/Clippy/test/`actionlint` CI.
- [x] Implement the ADR 0001 Astro/Bun static website shell and Workers Static
      Assets deployment configuration; keep the docs consumer, adapter, loader,
      theme, search, and routes out of that scaffold.
- [ ] Restore full Astro language-server diagnostics with TypeScript 7 after
      upstream support satisfies FIND-0001 acceptance criteria.
- [ ] Add formatting, linting, documentation-link, and security-policy checks to
      CI without introducing product behavior.
- [ ] Define release, compatibility, branch-protection, ownership, and docs-site
      publishing policies (OQ-023, OQ-024).
- [ ] Establish linked GitHub Issue and pull request conventions once the first
      commit makes branch/worktree delivery available.
- [x] Initialize per-repository CarryCtx state, rules, and personas with scopes
      matching repository ownership.
- [ ] After a repository has its first commit, use isolated worktrees for
      parallel implementation tasks unless a task explicitly documents otherwise.

## Deferred until decisions authorize implementation

- [ ] Build the terminal core and renderer.
- [ ] Build configuration and plugin runtimes.
- [ ] Build rich-content, CLI/IPC, DevTools, MCP, or headless services.
- [ ] Build package distribution and registry workflows.
- [ ] Publish first-party plugins, SDK examples, or compatibility releases.
- [ ] Add installation, getting-started, daily-use, troubleshooting, and factual
      reference pages only after verified product behavior exists.
- [ ] Decide internationalization ownership, locale structure, translation
      synchronization, and multilingual routing before adding localized files.

Progress in those sections must cite the owning task and decision artifact;
design prose alone is never evidence that an implementation checkbox is done.
