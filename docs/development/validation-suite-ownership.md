---
title: Validation Suite Ownership
description: Accepted W-75 decision fixing bitty-compat-lab and bitty-perf membership, build policy, CI and evidence ownership, and the pinned-revision discipline that keeps compatibility and performance gates intact
category: development
audience: contributor
document_type: specification
status: accepted
website_publish: true
sidebar_order: 32
---

# Validation Suite Ownership

## Document status

Accepted focused contract. This document is the `W-75` deliverable for the
validation-suite boundary that
[ADR 0015](../decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
accepted in direction under Boundary 6 and parked to `W-75`, with execution in
`W-105`. It decides the membership and build policy for `bitty-compat-lab` and
`bitty-perf`, maps where their CI and local gates run and who owns the job
definitions, fixes where their compatibility and performance evidence is
produced and cited, requires that every required gate survives the move, and
names the pin and update discipline for the production revision under test.

This document authorizes no implementation and describes no implemented
behavior. The independent `bitty-compat-lab` and `bitty-perf` repositories
exist today only as metadata-only scaffolds with governance, toolchain, and CI
metadata and no product code. The in-workspace `bitty/crates/bitty-compat-lab`
and `bitty/crates/bitty-perf` members carry the current harnesses; that is
current-location evidence, not a claim that this boundary is implemented and
not acceptance of the suites as product code. Every ownership statement here is
a contract direction for a later implementation; nothing is `Verified`.
Frontmatter `status` is `accepted` per the repository metadata schema.

- Owning task: `W-75` (bitty-docs), CarryCtx `CTX-0265`, Issue
  [bitty-docs#404](https://github.com/bitty-terminal/bitty-docs/issues/404).
- Predecessor decision:
  [ADR 0015 - Small-Core Extraction Boundaries](../decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
  (Boundary 6; binding constraint 9).
- Related:
  [Testing infrastructure](testing-infrastructure.md),
  [Platform compatibility and dependency governance](platform-compatibility.md),
  and the
  [small-core refactor execution handoff](../handoff/2026-10-02-small-core-refactor.md).
- Downstream owners named but not decided here: `W-105` (bitty, CarryCtx
  `CTX-0931`) and the `bitty-compat-lab` and `bitty-perf` implementation tasks
  (CarryCtx `CTX-0003` in each repository).

## Purpose and scope

This specification finalizes the membership of the compatibility and
performance validation suites before any relocation is implemented. It exists
because the suites are required CI and evidence gates, not product mechanisms:
moving them out of the product workspace must reduce the production build and
dependency graph without losing a single required gate, and without turning the
suites into unowned tooling whose coverage can silently drift.

In scope:

- the membership and build policy for `bitty-compat-lab` and `bitty-perf`:
  product-workspace member, independent validation repository, or explicitly
  excluded tooling;
- the rule that an independent repository is not an independent gate or
  process, and what that means for required checks and trust;
- the CI and local ownership map: which workflows and gates run where, who owns
  the job definitions and the suite roster, and how the tested production
  revision is fixed;
- the evidence ownership: where compatibility and performance evidence is
  produced, retained, and cited, and how it ties to the evidence matrix;
- the required gates that must remain intact, with no coverage loss;
- the pin and update discipline for the tested production revision;
- the follow-up implementation tasks, named without deciding their content.

Out of scope and not decided here:

- the concrete external coupling mechanism (a `git` dependency, a pinned
  checkout, a published artifact, or another shape), which `W-105` and the two
  implementation tasks decide;
- the concrete thin-gating mechanism that keeps a required check on the product
  change path while the suite logic lives in another repository;
- new suites, new fixtures, new benchmark metrics, new floors, or any change to
  the existing suite rosters and minimum test counts;
- `bitty-test-support` and `bitty-test-vm`, which stay in the product workspace
  under their own owners and are not decided here;
- any implementation, extraction, or migration action.

Nothing here weakens a normative security control. Where a control or threshold
appears to need change, it is recorded under "Open points" instead.

## Normative sources this specification must not weaken

This boundary must be read together with, and must not weaken:

- The [security overview](../security/overview.md), the
  [threat model](../security/threat-model.md), the
  [risk register](../security/risk-register.md), and the
  [P0 acceptance criteria](../security/p0-acceptance-criteria.md). Validation
  tooling is not part of the trusted computing base and gains no product
  authority by moving out of the workspace. The relevant P0 controls that must
  survive relocation include the malformed-input fuzz and recovery requirement
  (`P0-AC-002`) and the dependency, advisory, source, license, and
  banned-dependency checks (`P0-AC-034`); the suite relocation may not remove,
  downgrade, or make advisory any of them.
- The [evidence matrix](../security/evidence-matrix.md), which is the canonical
  register of implementation, test, CI, adversarial, and audit evidence per
  risk. Compatibility and performance gate evidence that the matrix cites must
  remain resolvable to a suite, a run, and a tested revision after the move.
- [ADR 0015 - Small-Core Extraction Boundaries](../decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
  Boundary 6 and binding constraint 9: `bitty-compat-lab` and `bitty-perf`
  relocate out of the product workspace into independent repositories or
  tooling that pin and exercise the actual production revision, without
  weakening CI coverage; compatibility and performance gates keep binding the
  production revision, and the relocation must preserve or improve coverage.
- [ADR 0016 - Execution, Graphics, Accessibility, Storage, and
  Platform-Service Boundaries](../decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md)
  binding constraint 12: compatibility and performance gates keep pinning the
  actual production revision, and repository and toolchain baselines hold.
- [ADR 0002 - Platform Support Tiers](../decisions/adrs/ADR-0002-platform-support-tiers.md):
  the Tier 1 platform set and the required-check expectations that the M1 and
  compatibility matrix legs exercise.
- The accepted
  [Compatibility Milestone RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/compatibility-milestone-rfc.md)
  (OQ-004) and
  [Performance Budget RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/performance-budget-rfc.md)
  (OQ-001): the compatibility milestone and performance budgets remain the
  authoritative contracts the suites measure against; this document does not
  redefine them.

## Terminology

- **Product workspace**: the `bitty` Cargo workspace and its `[workspace]
members`, whose crates ship or configure the terminal and are part of the
  product dependency graph.
- **Validation suite**: a headless, bounded test and measurement harness that
  exercises the production revision for compatibility or performance. It is
  tooling, not a product mechanism: it has no shipped runtime authority and is
  `publish = false`.
- **Independent validation repository**: a separate Git repository that owns a
  validation suite, its CI, and its evidence, and consumes a pinned production
  revision. The reserved homes are `bitty-compat-lab` and `bitty-perf`.
- **Required gate**: a check whose failure blocks merge on the product change
  path, enforced by branch protection on the product repository. A required
  gate is required regardless of which repository hosts its definition.
- **Suite roster and floor**: the named suites a matrix driver must run and the
  minimum tests each must execute. The floor is the anti-silent-omission guard:
  `cargo test --test <name>` exits zero when a target exists but holds zero
  tests, so an emptied or renamed suite must fail rather than vanish.
- **Tested production revision**: the exact, immutable `bitty` revision a
  validation suite is pinned to and exercises.
- **Evidence artifact**: a machine-readable or reviewer-signed output a suite
  produces, such as a benchmark baseline, a compatibility report, a matrix
  JSON, or a gate summary, together with its environment and revision
  provenance.
- **Pin**: the immutable production revision recorded by a validation
  repository, and the matching suite revision recorded by the product
  repository.
- **`dev-perf`**: the non-default `bitty-terminal` Cargo feature that links
  `bitty-perf` for the developer-only `bitty dev trace` command.
- **Candidate**: a proposal that has not been decided; candidate status is not
  acceptance and is not implementation.
- **Parked**: explicitly deferred with a named reason and an owning task; a park
  is not acceptance and reserves no interface.

## Context and current membership

The two suites are product-workspace members today and carry required gates:

- `bitty/Cargo.toml` lists `crates/bitty-compat-lab` and `crates/bitty-perf` in
  `[workspace] members`.
- `bitty/crates/bitty-compat-lab` is the integration point for the headless
  compatibility lab: it re-exports the canonical harness, owns the release
  compatibility matrix plus compare and report helpers, the M1 differential
  oracle, and the collect/report binaries. Its tests include `compat_matrix`,
  `compare`, `oracle`, `report`, `harness`, `dogfooding_corpus`,
  `vertical_slice_gates`, `live_compat`, `m1_mode_golden`, and
  `m1_color_golden`.
- `bitty/crates/bitty-perf` owns the performance baseline harness: it hosts the
  workspace-root `benches/*.rs` targets, the committed
  `crates/bitty-perf/baselines/` evidence, and the parser-throughput regression
  gate (`parser_throughput_regression`).
- The product `bitty-terminal` binary links `bitty-perf` only through the
  non-default `dev-perf` feature for the developer-only `bitty dev trace`
  command; the default and release build do not link it.

The gates that currently run these suites are:

- the `quality` job in `bitty/.github/workflows/ci.yml` runs
  `cargo test -p bitty-perf --benches` and
  `cargo test -p bitty-perf --test parser_throughput_regression`;
- the four Tier 1 platform jobs (`linux-x11`, `linux-wayland`, `macos`,
  `windows`) run the M1 matrix (`scripts/m1-matrix.sh`) and the compatibility
  release matrix (`scripts/compat-matrix.sh`);
- the `quality`, `linux-x11`, `linux-wayland`, and `macos` jobs additionally run
  `cargo test -p bitty-perf --benches`;
- the `m1-matrix` and `compat-matrix` aggregate jobs stitch the per-platform
  artifacts into one pass/fail view.

The M1 matrix roster is mixed: `m1_mode_golden` and `m1_color_golden` are
`bitty-compat-lab` suites, while `m1_mode_input`, `m1_color_title`, and
`m1_shell_coverage` are `bitty-runtime` suites. The compatibility release
matrix roster is owned by `bitty-compat-lab`. This specification moves only the
`bitty-compat-lab` and `bitty-perf` ownership; the runtime-owned M1 suites stay
with their current owner, and `W-105` must preserve the full roster.

The independent `bitty-compat-lab` and `bitty-perf` repositories are
metadata-only scaffolds. Their `repo.toml` records `kind = "tooling"` and
`owner = "bitty-core"`, their contract status is "pending W-75; no migrated
suite", and their own TODOs state that metadata checks are not product or
compatibility evidence. That scaffold status is the starting point for this
decision, not evidence that any suite has moved.

## Decision

### Membership: independent validation repositories

`bitty-compat-lab` and `bitty-perf` relocate out of the product workspace into
the independent validation repositories that already exist as metadata-only
scaffolds. They are not product-workspace members after relocation and are not
reduced to ad-hoc, unversioned local tooling.

Rationale:

- The suites are validation tooling, not terminal mechanisms. DIR-001 and the
  small-core direction keep the product workspace to mechanisms and security
  boundaries; a compatibility lab and a performance harness are extension and
  verification surfaces. Keeping them as members preserves production graph
  confusion (a dev/perf edge, workspace-wide lint and test traversal, and
  workspace-version inheritance) without a product reason.
- The suites must remain owned, versioned, reviewed, and gated. The
  explicitly-excluded-tooling option is rejected because these suites carry
  required CI and evidence obligations (the compatibility release matrix, the
  performance regression floor, and the benchmark baselines). Excluding them as
  loose tooling would leave that coverage unowned and free to drift.
- Independent repositories give each suite its own history, CI, evidence, and
  CarryCtx graph, matching how the workspace already externalizes verification
  and extension responsibilities, while the pin keeps them bound to the actual
  product.

### Build policy

1. **Product workspace membership is removed.** `bitty`'s `[workspace] members`
   no longer lists `bitty-compat-lab` or `bitty-perf`. The product dependency
   graph does not contain either suite after relocation.
2. **No production edge.** The relocation removes the `bitty-terminal`
   `dev-perf` -> `bitty-perf` optional edge. The developer-only `bitty dev
trace` capability must keep its coverage through a path that does not make
   the product graph depend on the verification harness; `W-105` decides that
   path and may not delete the capability's coverage. The default and release
   builds already exclude the feature, and this policy makes that exclusion
   structural.
3. **Validation repositories consume a pinned production revision.** Each
   validation repository declares the tested `bitty` revision as an external,
   immutable input (a `git` dependency or an equivalent pinned checkout). It
   never uses a path dependency into a mutable product checkout, never becomes
   a `bitty` workspace member, and is never linked into a product artifact.
4. **Tooling baseline.** Both repositories are `publish = false` tooling that
   start at `0.0.1`, edition 2024, with the Core MSRV and the shared toolchain
   discipline; they hold no shipped runtime authority and add no native
   in-process plugin, ambient authority, or bypass.
5. **Out of scope stays put.** `bitty-test-support` and `bitty-test-vm` remain
   product-workspace members; this policy does not move them.

### An independent repository is not an independent gate

Creating or naming a separate repository does not create process isolation,
does not move a trust decision, and does not discharge a gate. The validation
suites stay on the product change path as required gates: a failing compatibility
or performance suite blocks a product merge exactly as it does today, and the
suite must run against the actual production revision rather than a diverging
copy. Moving the suite out of the workspace is a build-graph and code-ownership
change only; it does not make the gate advisory, does not move it to a different
product surface, and does not grant the suite or its repository any authority
over the product. Conversely, the product repository keeps a single visible
result for each relocated gate; a gate that no longer has a required check on
the product change path is a regression, not a simplification.

### Decision summary

| Repository         | Membership after                                | Build coupling after                                                                        | Required gates retained                                                |
| ------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `bitty-compat-lab` | Independent validation repository               | External pinned production revision; no product-workspace member and no product dependency  | Compatibility release matrix and the compat-lab M1 suites, with floors |
| `bitty-perf`       | Independent validation repository               | External pinned production revision; no product-workspace member and no product dependency  | Benchmark compile/run gate and parser-throughput regression floor      |
| `bitty` (product)  | Keeps only product and retained harness members | Removes the `bitty-compat-lab`/`bitty-perf` members and the `dev-perf` -> `bitty-perf` edge | The same required checks on the product change path, no coverage loss  |

## CI and local ownership

The relocation moves suite content, floors, and job definitions to the owning
validation repository while the product repository keeps the required checks on
the change path. The exact wiring is `W-105`; the ownership split is fixed here.

| Gate (today)                                                                                     | Today: definition owner and location                                                  | After: definition owner and location                                                                                                                                              | Required on the product change path |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| Benchmark compile/run (`cargo test -p bitty-perf --benches`)                                     | `bitty`; `quality`, `linux-x11`, `linux-wayland`, `macos` jobs in `ci.yml`            | `bitty-perf` repository CI; the product repository keeps a thin required invocation/tracking check pinned to the suite revision                                                   | Yes                                 |
| Parser-throughput regression floor                                                               | `bitty`; `quality` job                                                                | `bitty-perf` repository CI, exercised on the product change path by the thin required check                                                                                       | Yes                                 |
| Compatibility release matrix (14 surfaces x 4 terminals)                                         | `bitty`; the four Tier 1 platform jobs plus the `compat-matrix` aggregate             | `bitty-compat-lab` repository CI owns the roster, floors, and artifacts; the product repository keeps the required aggregate check or an equivalent pinned cross-repository check | Yes                                 |
| M1 compatibility matrix, compat-lab suites (`m1_mode_golden`, `m1_color_golden`)                 | `bitty`; `scripts/m1-matrix.sh` on the four Tier 1 legs and the `m1-matrix` aggregate | The two compat-lab suites move with `bitty-compat-lab`; the runtime-owned M1 suites stay in `bitty`; `W-105` preserves the full roster and floors in one aggregate                | Yes                                 |
| M1 compatibility matrix, runtime suites (`m1_mode_input`, `m1_color_title`, `m1_shell_coverage`) | `bitty`; `scripts/m1-matrix.sh`                                                       | Unchanged: these stay `bitty-runtime` suites owned by the product repository                                                                                                      | Yes                                 |

Ownership rules:

- The validation repository owns its suite source, roster, minimum-test floors,
  fixtures, benchmark baselines, and CI job definitions.
- The product repository owns branch protection and the set of required checks
  on its own change path. `W-105` must keep every compatibility and performance
  gate required and visible; removing a gate from branch protection is a
  coverage loss and is not permitted.
- The product repository retains the aggregate view (`m1-matrix`,
  `compat-matrix`, or their successor) or an equivalent single pass/fail
  result, so a regression on one Tier 1 platform remains one visible check
  instead of scattered job logs.
- Local contributors keep a documented, pinned way to run the same suites
  against a chosen production revision. The local path uses the same suite
  roster and floors as CI; a local run is never weaker than the required check.
- `bitty-test-support` and `bitty-test-vm` keep their current owners and gates.

### How the tested production revision is fixed

- Each validation repository records one immutable tested production revision
  (the pin). Both the product repository and the validation repository record
  the matching suite revision, so any gate result can be resolved to exactly
  two revisions: the production revision under test and the suite revision that
  produced the result.
- The pin is an immutable commit, not a moving branch or an untagged ref, per
  the repository and versioning standards for git dependency pins.
- A pin bump is an owned, reviewed change in the validation repository (matching
  the "owned, versioned, reviewed, and gated" rule above); it never moves
  implicitly, and every result records which pin produced it.
- The required check on the product change path exercises the suite at the
  pinned suite revision against the product revision being proposed; a check
  that ran against a different revision is not evidence for the change.

## Evidence ownership

- **Produced** by the validation suites, in the owning validation repository,
  against the pinned production revision. Compatibility evidence is the
  release-matrix report and matrix JSON plus the M1 evidence rows;
  performance evidence is the benchmark baselines, the parser-throughput
  regression result, and the environment/revision provenance beside them.
- **Retained** as versioned artifacts in the owning validation repository
  (machine-readable JSON where possible, with baseline provenance), not as
  untracked local output. Metadata-only scaffold checks are explicitly not
  product, compatibility, or performance evidence.
- **Cited** by reference, not copied. The product repository, the
  [evidence matrix](../security/evidence-matrix.md), and any release or roadmap
  document cite the validation repository, the exact evidence artifact, and the
  two revisions. A number restated without its artifact, environment, and
  revision loses its provenance and must not be cited as evidence.
- **Matrix tie-in.** The evidence matrix remains the canonical register mapping
  risks to `P0-AC` with implementation, test, CI, adversarial, and audit
  evidence. Its compatibility/performance CI citations must resolve to the
  relocated gate and artifact after the move; a matrix row whose cited suite no
  longer exists at the cited location is a defect. Test counts and measurement
  numbers stay in the evidence artifacts and audits rather than being duplicated
  into the project-state snapshot.
- **Revision binding.** Every evidence artifact records both the production
  revision under test and the suite revision. A benchmark result additionally
  records its environment (host, runner class, and any opt-in measurement
  gate), so a result is never compared across incomparable environments.

## Required gates remain intact

Relocation may not lose coverage. The following are preserved:

1. **Suite roster.** Every named suite in the compatibility release matrix and
   the compat-lab M1 roster continues to run.
2. **Anti-silent-omission floors.** Every suite keeps its minimum-test floor
   (compat-lab M1 floors: `m1_mode_golden` ten, `m1_color_golden` seven;
   compatibility-matrix suites and the perf regression gate keep their existing
   floors). Floors grow, never shrink, as coverage is added.
3. **Tier 1 platform coverage.** The four Tier 1 platform legs (Linux X11,
   Linux Wayland, macOS ARM64, Windows x86_64) continue to run the
   compatibility and performance gates, and both Tier 1 aggregate results
   remain required.
4. **Performance floors.** The benchmark compile/run gate and the
   parser-throughput regression ratio gate remain required; a performance gate
   may not become advisory or opt-in on the merge path.
5. **Runtime-owned suites.** The `bitty-runtime` M1 suites stay owned by the
   product repository unless a later scoped task moves them.
6. **Security and safe-mode neutrality.** Validation tooling stays outside the
   trusted computing base, adds no product authority or bypass, and leaves safe
   mode unaffected. It does not remove or downgrade any `P0-AC` control.
7. **Documentation gate.** This repository's `just check` continues to pass with
   zero issues.

## Security review

The relocation touches the supply-chain and evidence trust boundaries that the
[security overview](../security/overview.md) governs. Independent security review
is required before this specification merges. The reviewer confirms that:

- validation tooling gains no product authority by moving out of the workspace,
  introduces no native in-process plugin, ambient authority, or bypass, and
  does not weaken any `P0-AC` control;
- no required gate is dropped, downgraded to advisory, or made unverifiable on
  the product change path;
- every relocated compatibility and performance gate still executes against the
  actual production revision and the anti-silent-omission floors are preserved;
- the pin is immutable and a result is bound to both revisions;
- the dependency and adversarial checks (`P0-AC-002`, `P0-AC-034`) remain
  present and gating after the move.

The downstream `W-105` and the two implementation tasks each require security
review again before their own merge.

## Verification plan

This is a contract specification; it has no executable verification of its own.
Any later implementation of the boundary must prove, at minimum:

1. **Product membership removed.** `bitty`'s `[workspace] members` no longer
   lists `bitty-compat-lab` or `bitty-perf`, and no product crate links either
   suite (the `dev-perf` edge is resolved without losing `bitty dev trace`
   coverage).
2. **No coverage loss.** Every compatibility and performance suite that ran
   before relocation runs after relocation, with its minimum-test floor intact
   and failing on a deliberately emptied suite.
3. **Required checks remain required.** Each relocated gate still blocks a
   product merge through a required check on the product change path or an
   equivalent pinned cross-repository check; no gate became advisory.
4. **Pinned and resolvable.** Every gate result resolves to an immutable
   production revision and a suite revision; a pin is not a branch or an
   untagged ref.
5. **Evidence is citable.** The evidence matrix and product references resolve
   each compatibility and performance claim to a validation-repository artifact
   with environment and revision provenance.
6. **Tier 1 integrity.** The four Tier 1 legs and the aggregate views still run
   and still fail closed when a suite is missing, fails, or reports a failed
   job result.
7. **Safe-mode and security neutrality.** Safe mode is unaffected, the suites
   hold no runtime authority, and no `P0-AC` control is removed or weakened.
8. **Documentation gates pass.** The repository-local `just check` passes with
   zero issues.

## Alternatives considered

| Alternative                                                               | Disposition                                                                                                                                                        |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Keep both suites as product-workspace members                             | Rejected: it keeps validation tooling in the product graph, preserves the `dev-perf` coupling, and leaves optional behavior in the small core contrary to DIR-001. |
| Exclude the suites as unversioned local tooling                           | Rejected: the suites carry required CI and evidence obligations; unowned tooling would let coverage drift or disappear without a gate.                             |
| Move the suites out and drop or soften their required checks              | Rejected: relocation must not weaken CI coverage; an independent repository is not an independent gate and the required checks stay on the product change path.    |
| Treat the independent repository as process isolation or a trust boundary | Rejected: a validation suite is tooling that exercises the production revision; the repository move grants no authority and changes no trust decision.             |
| Pin a branch, tag, or moving ref instead of an immutable revision         | Rejected: a gate result must resolve to an exact production revision; a moving ref makes the evidence irreproducible.                                              |
| Duplicate compatibility and performance numbers into the product docs     | Rejected: evidence is cited by reference to its artifact, environment, and revisions; restated numbers without provenance are not evidence.                        |
| Move the `bitty-runtime` M1 suites as well                                | Rejected here: they are runtime facts owned by the product repository; moving them is a separate decision not made by `W-75`.                                      |

## Affected contracts

- [ADR 0015 - Small-Core Extraction Boundaries](../decisions/adrs/ADR-0015-small-core-extraction-boundaries.md):
  Boundary 6's parked membership now has its focused contract; binding
  constraint 9 is preserved and the dependency order (`W-75` then `W-105`) is
  unchanged.
- [Small-core refactor execution handoff](../handoff/2026-10-02-small-core-refactor.md):
  `W-75` now has its deliverable; `W-105` remains gated on it.
- [Testing infrastructure](testing-infrastructure.md): the suite ownership and
  evidence rules compose with the three-tier test architecture without
  redefining it; the benchmark-plan open item (whether benchmarks live in-repo
  or as a separate project) is narrowed by this decision for the compatibility
  and performance suites.
- [Platform compatibility and dependency governance](platform-compatibility.md):
  the historical `bitty-app` (now `bitty-terminal`) -> `bitty-perf` edge check
  recorded there is resolved by this decision's build policy and executed by
  `W-105`.
- [Evidence matrix](../security/evidence-matrix.md): the compatibility and
  performance CI citations must resolve to the relocated gates and artifacts
  after `W-105`.
- [Development index](README.md): routes to this document.
- [Open-question register](../decisions/open-questions.md): no new global open
  question is admitted, and none is resolved by this document. The membership
  park in ADR 0015 is a plan-key park, not an OQ, so the register is unchanged.

### Follow-up implementation tasks

Named without deciding their content:

- **`W-105` (bitty, CarryCtx `CTX-0931`)** owns the relocation and exclusion of
  the validation suites without weakening CI coverage: removing the workspace
  members and the `dev-perf` edge, preserving every required check on the
  product change path, preserving the mixed M1 roster and the Tier 1 aggregates,
  and keeping the evidence citations resolvable.
- **`bitty-compat-lab` implementation task (CarryCtx `CTX-0003`)** owns the
  approved fixture and harness migration in the independent repository and the
  pinned production revisions, consuming this contract.
- **`bitty-perf` implementation task (CarryCtx `CTX-0003`)** owns the approved
  benchmark migration, methodology, and source pinning in the independent
  repository, consuming this contract.
- Each repository's `CTX-0002` ("W-75 ownership and W-84 relocation guide
  accepted") stays gated on this contract and on `W-84`; these tasks are not
  decided or authorized by this document.

## Open points

The following details are parked, not decided. Each park names the owning task
and the reason. None is a global open question: none blocks the current
milestone, and no implementation evidence forces one yet.

- **External coupling mechanism** parked to `W-105` and the two implementation
  tasks: whether a validation repository consumes `bitty` as a `git`
  dependency, a pinned checkout, a published artifact, or another shape, and how
  that is declared without a product edge.
- **Thin required-check mechanism** parked to `W-105`: how the product change
  path keeps a required check for a suite that lives in another repository
  (a pinned invocation in `bitty` CI, a cross-repository check, or an
  equivalent), without reintroducing a product dependency.
- **`dev-perf` resolution** parked to `W-105`: how `bitty dev trace` keeps its
  coverage after the `bitty-perf` edge is removed, without adding a verification
  dependency back to the product graph.
- **Benchmark baseline placement** parked to the `bitty-perf` task: whether the
  existing `crates/bitty-perf/baselines/` artifacts move wholesale or are
  regenerated with fresh provenance in the independent repository.
- **Mixed M1 roster split** parked to `W-105`: the exact way the compat-lab M1
  suites leave the product repository while the runtime M1 suites and a single
  aggregate result remain.
- **Local developer entry point** parked to `W-105`: the documented pinned
  command a contributor runs locally, kept equivalent to the required check.
- **Other harness crates** parked to their owners: whether `bitty-test-support`
  and `bitty-test-vm` later follow the same model is not decided here.

## Acceptance criteria

- The membership and build policy for `bitty-compat-lab` and `bitty-perf` is
  explicit, and the document states that an independent repository does not
  imply an independent process or an independent gate.
- The CI and local ownership map names which workflows and gates run where, who
  owns the job definitions and the suite roster, and how the pinned production
  revision is fixed.
- Evidence ownership is explicit: where compatibility and performance evidence
  is produced, retained, and cited, and how it ties to the evidence matrix.
- The required gates that must remain intact are listed with no coverage loss.
- The pin and update discipline for the tested production revision is defined.
- The follow-up tasks (`W-105` bitty `CTX-0931`; the `bitty-compat-lab` and
  `bitty-perf` `CTX-0003` implementations) are named without deciding their
  content.
- The document is self-contained: it cites no research archive, no record
  number, and no coverage ledger.
- The candidate repositories are not described as implemented; the independent
  suites remain metadata-only scaffolds.
- No open question is fabricated; the register is not changed.
- Independent security review is required before merge, and the reviewer roles
  are named.
- The development index routes to this document, and `just check` passes with
  zero issues.

## P0 Review Sign-off

| Role                 | Scope                                                                | Requirement                                                         |
| -------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `architecture-owner` | Membership, build policy, and required-gate ownership                | Approve; confirms no coverage loss and no product edge.             |
| `security-reviewer`  | Supply-chain, evidence trust, and safe-mode neutrality               | Independent security review required before merge.                  |
| `docs-curator`       | Taxonomy, metadata, links, terminology, and register synchronization | Approve; confirms discoverability, schema, and unchanged registers. |

## References

- [bitty-docs#404](https://github.com/bitty-terminal/bitty-docs/issues/404)
  (CarryCtx `CTX-0265`, plan key `W-75`).
- [ADR 0015 - Small-Core Extraction Boundaries](../decisions/adrs/ADR-0015-small-core-extraction-boundaries.md)
  (Boundary 6; binding constraint 9) and
  [ADR 0016](../decisions/adrs/ADR-0016-execution-graphics-accessibility-storage-platform-boundaries.md)
  (binding constraint 12).
- [Small-core refactor execution handoff](../handoff/2026-10-02-small-core-refactor.md),
  plan keys `W-75`, `W-84`, and `W-105`.
- [Security overview](../security/overview.md),
  [threat model](../security/threat-model.md),
  [risk register](../security/risk-register.md),
  [P0 acceptance criteria](../security/p0-acceptance-criteria.md), and the
  [evidence matrix](../security/evidence-matrix.md).
- [Testing infrastructure](testing-infrastructure.md),
  [Platform compatibility and dependency governance](platform-compatibility.md),
  and the [documentation workflow](documentation-workflow.md).
- Cross-repository sources:
  [Compatibility Milestone RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/compatibility-milestone-rfc.md)
  (OQ-004) and
  [Performance Budget RFC](https://github.com/bitty-terminal/bitty-terminal-docs/blob/main/specifications/performance-budget-rfc.md)
  (OQ-001).
